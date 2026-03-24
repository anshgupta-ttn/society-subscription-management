# SocietyManagement

A full-stack society management web application with a separate **Admin Panel** and **Resident Portal**. Admins manage flats, subscriptions, payments, and notifications. Residents can log in, view their dues, and pay online.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Admin Panel](#admin-panel)
- [Resident Portal](#resident-portal)
- [API Overview](#api-overview)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS, Recharts, jsPDF |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth (Admin) | NextAuth.js + Google OAuth |
| Auth (Resident) | JWT + bcrypt |


## Database Schema

### `flats`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| flat_number | TEXT | |
| owner_name | TEXT | |
| owner_email | TEXT | Unique |
| owner_phone | TEXT | |
| flat_type | TEXT | e.g. `1BHK`, `2BHK` |
| is_active | BOOLEAN | |
| password | TEXT | bcrypt hashed |
| created_at | TIMESTAMP | |

### `subscription_plans`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | |
| flat_type | TEXT | |
| monthly_amount | NUMERIC | |
| effective_from | DATE | |

### `monthly_subscriptions`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | |
| flat_id | UUID | FK → flats |
| plan_id | INT | FK → subscription_plans |
| month | DATE | First day of the month |
| amount_due | NUMERIC | |
| status | TEXT | `pending` / `paid` |
| due_date | DATE | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | |
| flat_id | UUID | FK → flats |
| subscription_id | INT | FK → monthly_subscriptions |
| amount_paid | NUMERIC | |
| payment_mode | TEXT | `cash` / `upi` / `online` |
| paid_at | DATE | |
| transaction_ref | TEXT | |
| created_at | TIMESTAMP | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | |
| title | TEXT | |
| message | TEXT | |
| target_type | TEXT | `all` / `flat` |
| target_id | UUID | FK → flats (nullable) |
| sent_at | TIMESTAMP | |

---

## Environment Variables

### `backend/.env`
```env
JWT_SECRET=your_jwt_secret_key
```

### `frontend/.env.local`
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
```

> `ADMIN_EMAIL` is the Google account allowed to sign in as admin.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Database

```sql
CREATE DATABASE testdb;
```

Then run your schema SQL to create the tables above.

### 2. Backend

```bash
cd backend
npm install
node server.js
```

Runs on **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000**

### 4. Hash existing passwords (one-time)

If you have existing flat records with plain-text passwords:

```bash
cd backend
node scripts/hashPasswords.js
```

---

## Admin Panel

**Login:** `/admin/login` — Google Sign-In (only the configured `ADMIN_EMAIL` is allowed)

| Page | Path | Description |
|---|---|---|
| Dashboard | `/admin/dashboard` | Stats cards, pie chart (collected vs pending), monthly bar chart, recent transactions |
| Flats | `/admin/flats` | Add / edit / delete flats. Add supports "Existing Owner" search or "New Owner" form. Password is set on creation |
| Plans | `/admin/plans` | View and update monthly subscription amounts per flat type |
| Monthly | `/admin/monthly` | Auto-generates subscription records on load. Shows paid/pending status per flat for selected month/year |
| Payments | `/admin/payments` | Record a payment for any flat's pending month. Shows recent payments list |
| Notifications | `/admin/notifications` | Send a notification to all flats or a specific flat. View notification history |
| Reports | `/admin/reports` | Monthly report (summary + payment mode breakdown) and yearly revenue report. Export as PDF or CSV |
| Profile | `/admin/profile` | Admin Google account info + sign out |

---

## Resident Portal

**Login:** `/login` — Email + password (credentials stored in the `flats` table, password bcrypt-hashed)

JWT token stored in `localStorage` as `resident_token`. All API calls include it via `Authorization: Bearer <token>`.

| Page | Path | Description |
|---|---|---|
| Dashboard | `/dashboard` | Pending count, total due, recent payments, quick action links |
| Subscriptions | `/subscriptions` | Full subscription history with paid/pending badges |
| Month Detail | `/subscriptions/[month]` | Charges breakdown, payment details if paid, Pay Now CTA if pending |
| Pay Now | `/pay-now` | Select a pending month, choose payment method, confirm payment |
| Profile | `/profile` | View flat info, update phone number, change password |
| Notifications | `/notifications` | View notifications sent by admin |

---

## API Overview

All routes are prefixed with `/api`.

| Method | Route | Description |
|---|---|---|
| GET | `/flats` | List all flats |
| POST | `/flats` | Add a flat |
| PUT | `/flats/:id` | Update a flat |
| DELETE | `/flats/:id` | Delete a flat (cascades payments + subscriptions) |
| GET | `/plans` | List subscription plans |
| PUT | `/plans/:id` | Update plan amount |
| GET | `/monthly` | Get monthly subscription records |
| POST | `/monthly/generate` | Generate subscription records for a month |
| GET | `/payments/flats` | Flat list for payment form |
| GET | `/payments/pending/:flat_id` | Pending months for a flat |
| GET | `/payments/recent` | Last 10 payments |
| POST | `/payments` | Record a payment |
| GET | `/dashboard/total-paid` | Total collected amount |
| GET | `/dashboard/pending` | Total pending amount |
| GET | `/dashboard/collection-rate` | Collection rate % |
| GET | `/dashboard/transactions` | Last 5 transactions |
| GET | `/dashboard/monthly-collection` | Monthly bar chart data |
| GET | `/reports/monthly` | Monthly report summary |
| GET | `/reports/yearly` | Yearly revenue breakdown |
| POST | `/notifications/send` | Send a notification |
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread count for a flat |
| POST | `/resident/login` | Resident login → returns JWT |
| POST | `/resident/dashboard` | Resident dashboard data |
| POST | `/resident/subscriptions` | Resident subscription list |
| POST | `/resident/subscriptions/:month` | Single month detail |
| POST | `/resident/payment` | Resident payment submission |
| PUT | `/resident/profile` | Update phone number |
| PUT | `/resident/change-password` | Change resident password |

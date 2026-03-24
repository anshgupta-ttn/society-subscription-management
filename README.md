# SocietyManagement

A full-stack society management web application with a separate Admin Panel and Resident Portal. Admins manage flats, subscriptions, payments, and notifications. Residents can log in, view their dues, and pay online.

---

## Tech Stack

- Frontend: Next.js 16, Tailwind CSS, Recharts, jsPDF
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth (Admin): NextAuth.js + Google OAuth
- Auth (Resident): bcrypt password check, session cookie

---

## Project Structure

```
society-subscription-management/
├── backend/
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Resident auth middleware
│   ├── routes/            # Express route definitions
│   ├── scripts/           # One-time utility scripts
│   ├── services/          # Firebase admin setup
│   ├── db.js              # PostgreSQL pool
│   └── server.js          # Express entry point
└── frontend/
    ├── app/
    │   ├── admin/         # Admin panel pages
    │   ├── api/auth/      # NextAuth route
    │   ├── components/    # Shared components
    │   └── (resident pages: dashboard, subscriptions, pay-now, profile, notifications)
    ├── lib/               # API base URL, Firebase client
    ├── middleware.js       # Route protection
    └── public/
```

---

## Database Schema

### flats
- id (UUID, primary key)
- flat_number (TEXT)
- owner_name (TEXT)
- owner_email (TEXT, unique)
- owner_phone (TEXT)
- flat_type (TEXT) — e.g. 1BHK, 2BHK
- is_active (BOOLEAN)
- password (TEXT, bcrypt hashed)
- created_at (TIMESTAMP)

### subscription_plans
- id (SERIAL)
- flat_type (TEXT)
- monthly_amount (NUMERIC)
- effective_from (DATE)

### monthly_subscriptions
- id (SERIAL)
- flat_id (UUID → flats)
- plan_id (INT → subscription_plans)
- month (DATE, first day of month)
- amount_due (NUMERIC)
- status (TEXT) — pending / paid
- due_date (DATE)

### payments
- id (SERIAL)
- flat_id (UUID → flats)
- subscription_id (INT → monthly_subscriptions)
- amount_paid (NUMERIC)
- payment_mode (TEXT) — cash / upi / online
- paid_at (DATE)
- transaction_ref (TEXT)
- created_at (TIMESTAMP)

### notifications
- id (SERIAL)
- title (TEXT)
- message (TEXT)
- target_type (TEXT) — all / flat
- target_id (UUID → flats, nullable)
- sent_at (TIMESTAMP)

---

## Environment Variables

### backend/.env
```
JWT_SECRET=your_jwt_secret_key
```

### frontend/.env.local
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
```

ADMIN_EMAIL is the Google account allowed to sign in as admin.

---

## Getting Started

Prerequisites: Node.js 18+, PostgreSQL running locally

### 1. Database
```sql
CREATE DATABASE testdb;
```
Then run your schema SQL to create the tables.

### 2. Backend
```bash
cd backend
npm install
node server.js
```
Runs on http://localhost:5000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3000

### 4. Hash existing passwords (one-time)
If you have existing flat records with plain-text passwords:
```bash
cd backend
node scripts/hashPasswords.js
```

---

## Admin Panel

Login at /admin/login via Google Sign-In. Only the configured ADMIN_EMAIL is allowed.

- Dashboard (/admin/dashboard) — stats cards, pie chart of collected vs pending, monthly bar chart, recent transactions
- Flats (/admin/flats) — add, edit, delete flats. Supports existing owner search or new owner form. Password set on creation
- Plans (/admin/plans) — view and update monthly subscription amounts per flat type
- Monthly (/admin/monthly) — auto-generates subscription records on load. Shows paid/pending per flat for selected month/year
- Payments (/admin/payments) — record a payment for any flat's pending month. Shows recent payments list
- Notifications (/admin/notifications) — send a notification to all flats or a specific flat. View notification history
- Reports (/admin/reports) — monthly summary and yearly revenue report. Export as PDF or CSV
- Profile (/admin/profile) — admin Google account info and sign out

---

## Resident Portal

Login at /login with email and password. Credentials are stored in the flats table with bcrypt-hashed passwords.

- Dashboard (/dashboard) — pending count, total due, recent payments, quick action links
- Subscriptions (/subscriptions) — full subscription history with paid/pending status
- Month Detail (/subscriptions/[month]) — charges breakdown, payment details if paid, Pay Now button if pending
- Pay Now (/pay-now) — select a pending month, choose payment method, confirm payment
- Profile (/profile) — view flat info, update phone number, change password
- Notifications (/notifications) — view notifications sent by admin

---

## API Overview

All routes are prefixed with /api.

Flats
- GET /flats — list all flats
- POST /flats — add a flat
- PUT /flats/:id — update a flat
- DELETE /flats/:id — delete a flat (cascades payments and subscriptions)

Plans
- GET /plans — list subscription plans
- PUT /plans/:id — update plan amount

Monthly
- GET /monthly — get monthly subscription records
- POST /monthly/generate — generate subscription records for a month

Payments
- GET /payments/flats — flat list for payment form
- GET /payments/pending/:flat_id — pending months for a flat
- GET /payments/recent — last 10 payments
- POST /payments — record a payment

Dashboard
- GET /dashboard/total-paid — total collected amount
- GET /dashboard/pending — total pending amount
- GET /dashboard/collection-rate — collection rate percentage
- GET /dashboard/transactions — last 5 transactions
- GET /dashboard/monthly-collection — monthly bar chart data

Reports
- GET /reports/monthly — monthly report summary
- GET /reports/yearly — yearly revenue breakdown

Notifications
- POST /notifications/send — send a notification
- GET /notifications — list notifications
- GET /notifications/unread-count — unread count for a flat

Resident
- POST /resident/login — resident login
- POST /resident/dashboard — resident dashboard data
- POST /resident/subscriptions — resident subscription list
- POST /resident/subscriptions/:month — single month detail
- POST /resident/payment — resident payment submission
- PUT /resident/profile — update phone number
- PUT /resident/change-password — change resident password

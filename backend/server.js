require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const flatsRoutes = require("./routes/flats.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const plansRoutes = require("./routes/plans.routes");
const monthlyRoutes = require("./routes/monthly.routes");
const paymentsRoutes = require("./routes/payments.routes");
const authRoutes = require("./routes/auth.routes");
const reportsRoutes = require("./routes/reports.routes");
const profileRoutes = require("./routes/profile.routes");
const residentRoutes = require("./routes/resident.routes");
const notificationsRoutes = require("./routes/notifications.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/monthly", monthlyRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/flats", flatsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/notifications", notificationsRoutes);

// Cleanup endpoint to remove duplicate subscriptions
app.post("/api/cleanup", async (req, res) => {
  try {
    await pool.query('BEGIN');
    
    // Delete all subscriptions except the first one per flat/month
    await pool.query(`
      DELETE FROM monthly_subscriptions
      WHERE id NOT IN (
        SELECT DISTINCT ON (flat_id, month) id
        FROM monthly_subscriptions
        ORDER BY flat_id, month, id ASC
      );
    `);
    
    await pool.query('COMMIT');
    
    const result = await pool.query(`
      SELECT COUNT(*) as total FROM monthly_subscriptions;
    `);
    
    res.json({
      success: true,
      message: "Duplicates removed",
      totalSubscriptions: result.rows[0].total,
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});
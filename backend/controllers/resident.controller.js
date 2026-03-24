const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "society_sync_jwt_secret_key_2026";

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const result = await pool.query(
      `SELECT id, flat_number, owner_name, owner_email, owner_phone, password
       FROM flats WHERE LOWER(owner_email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "This email is not registered as a resident." });
    }

    const flat = result.rows[0];
    const match = await bcrypt.compare(password, flat.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const { password: _, ...resident } = flat;
    const token = jwt.sign({ flatId: flat.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, resident, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { flatId } = req.body;

    const currentMonth = await pool.query(
      `SELECT * FROM monthly_subscriptions WHERE flat_id = $1 ORDER BY month DESC LIMIT 1`,
      [flatId]
    );

    const allSubscriptions = await pool.query(
      `SELECT * FROM monthly_subscriptions
       WHERE flat_id = $1 AND status != 'paid'
       AND month <= DATE_TRUNC('month', CURRENT_DATE)`,
      [flatId]
    );

    const totalDue = allSubscriptions.rows.reduce((sum, sub) => sum + Number(sub.amount_due || 0), 0);

    const payments = await pool.query(
      `SELECT p.*, ms.month, ms.amount_due
       FROM payments p
       LEFT JOIN monthly_subscriptions ms ON p.subscription_id = ms.id
       WHERE p.flat_id = $1
       ORDER BY p.paid_at DESC LIMIT 5`,
      [flatId]
    );

    res.json({
      success: true,
      currentSubscription: currentMonth.rows[0],
      totalDue,
      pendingCount: allSubscriptions.rows.length,
      recentPayments: payments.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const { flatId } = req.body;

    const result = await pool.query(
      `SELECT ms.*, sp.monthly_amount
       FROM monthly_subscriptions ms
       LEFT JOIN subscription_plans sp ON ms.plan_id = sp.id
       WHERE ms.flat_id = $1
       AND ms.month <= DATE_TRUNC('month', CURRENT_DATE)
       ORDER BY ms.month DESC`,
      [flatId]
    );

    res.json({ success: true, subscriptions: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSubscriptionByMonth = async (req, res) => {
  try {
    const { flatId } = req.body;
    const monthNum = parseInt(req.params.month, 10);
    const year = new Date().getFullYear();

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ success: false, message: "Invalid month." });
    }

    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && monthNum > now.getMonth() + 1)) {
      return res.status(404).json({ success: false, message: "No records for future months." });
    }

    const result = await pool.query(
      `SELECT ms.id, ms.month, ms.amount_due, ms.status, ms.due_date,
              sp.monthly_amount, f.flat_number, f.flat_type, f.owner_name,
              p.amount_paid, p.payment_mode, p.paid_at, p.transaction_ref
       FROM monthly_subscriptions ms
       LEFT JOIN subscription_plans sp ON ms.plan_id = sp.id
       LEFT JOIN flats f ON f.id = ms.flat_id
       LEFT JOIN payments p ON p.subscription_id = ms.id
       WHERE ms.flat_id = $1
         AND EXTRACT(MONTH FROM ms.month) = $2
         AND EXTRACT(YEAR FROM ms.month) = $3
       LIMIT 1`,
      [flatId, monthNum, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Subscription not found for this month." });
    }

    res.json({ success: true, subscription: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { flatId, phone } = req.body;
    const result = await pool.query(
      `UPDATE flats SET owner_phone = $1 WHERE id = $2 RETURNING *`,
      [phone, flatId]
    );
    res.json({ success: true, message: "Profile updated successfully", resident: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { flatId, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const result = await pool.query(`SELECT password FROM flats WHERE id = $1`, [flatId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Flat not found" });
    }

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE flats SET password = $1 WHERE id = $2`, [hashed, flatId]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { flatId, subscriptionId, amount, paymentMode, transactionRef } = req.body;

    const subCheck = await client.query(
      `SELECT id, flat_id, month, amount_due, status FROM monthly_subscriptions WHERE id = $1`,
      [subscriptionId]
    );

    if (subCheck.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Subscription not found with ID: " + subscriptionId });
    }

    await client.query('BEGIN');

    const paymentResult = await client.query(
      `INSERT INTO payments (flat_id, subscription_id, amount_paid, payment_mode, transaction_ref, paid_at, receipt_url)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *`,
      [flatId, subscriptionId, amount, paymentMode, transactionRef, `receipt_${transactionRef}.pdf`]
    );

    const updateResult = await client.query(
      `UPDATE monthly_subscriptions SET status = 'paid' WHERE id = $1 RETURNING id, status, month, amount_due`,
      [subscriptionId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "Payment recorded successfully",
      payment: paymentResult.rows[0],
      updatedSubscription: updateResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

const pool = require("../db");

exports.getFlats = async (req, res) => {
  try {
    const result = await pool.query("select id, flat_number, flat_type from flats order by flat_number");
    res.json({ flats: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getAmount = async (req, res) => {
  try {
    const { flat_id } = req.params;
    const result = await pool.query(
      `select sp.monthly_amount
       from flats f
       join subscription_plans sp on sp.flat_type = f.flat_type
       where f.id=$1
       order by sp.effective_from desc
       limit 1`,
      [flat_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getPendingMonths = async (req, res) => {
  try {
    const { flat_id } = req.params;
    const result = await pool.query(
      `SELECT id, month, amount_due
       FROM monthly_subscriptions
       WHERE flat_id = $1
         AND status != 'paid'
         AND month <= DATE_TRUNC('month', CURRENT_DATE)
       ORDER BY month ASC`,
      [flat_id]
    );
    res.json({ pendingMonths: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getRecent = async (req, res) => {
  try {
    const result = await pool.query(
      `select f.flat_number, p.amount_paid, p.payment_mode, p.paid_at as payment_date
       from payments p
       join flats f on f.id = p.flat_id
       order by p.created_at desc
       limit 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.addPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { flat_id, subscription_id, amount, mode, date, note } = req.body;

    if (!flat_id || !subscription_id || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subCheck = await client.query(
      `SELECT id, month, amount_due, status FROM monthly_subscriptions WHERE id = $1 AND flat_id = $2`,
      [subscription_id, flat_id]
    );

    if (subCheck.rows.length === 0) {
      return res.status(400).json({ error: "Subscription not found for this flat" });
    }

    const alreadyPaid = await client.query(
      `SELECT 1 FROM payments WHERE subscription_id = $1 LIMIT 1`,
      [subscription_id]
    );
    if (alreadyPaid.rows.length > 0) {
      return res.status(400).json({ error: "This month is already paid" });
    }

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO payments (flat_id, subscription_id, amount_paid, payment_mode, paid_at, transaction_ref)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [flat_id, subscription_id, amount, mode.toLowerCase(), date, note || null]
    );

    await client.query(`UPDATE monthly_subscriptions SET status = 'paid' WHERE id = $1`, [subscription_id]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.log(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

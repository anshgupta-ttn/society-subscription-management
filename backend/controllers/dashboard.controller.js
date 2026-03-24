const pool = require("../db");

exports.getTotalPaid = async (req, res) => {
  try {
    const result = await pool.query(`SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM payments`);
    res.json({ total_paid: result.rows[0].total_paid });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getPendingAmount = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(ms.amount_due), 0) AS pending_amount
      FROM monthly_subscriptions ms
      WHERE ms.status != 'paid'
        AND ms.month <= DATE_TRUNC('month', CURRENT_DATE)
        AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.subscription_id = ms.id)
    `);
    res.json({ pending_amount: result.rows[0].pending_amount });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getCollectionRate = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' OR EXISTS (
          SELECT 1 FROM payments p WHERE p.subscription_id = ms.id
        ) THEN amount_due ELSE 0 END), 0) AS collected,
        COALESCE(SUM(amount_due), 0) AS total
      FROM monthly_subscriptions ms
      WHERE ms.month <= DATE_TRUNC('month', CURRENT_DATE)
    `);
    const { collected, total } = result.rows[0];
    const rate = total > 0 ? ((collected / total) * 100).toFixed(2) : '0.00';
    res.json({ collection_rate: rate });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getMonthlyCollection = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM ms.month)::int AS month,
        COALESCE(SUM(p.amount_paid), 0) AS collected
      FROM payments p
      JOIN monthly_subscriptions ms ON ms.id = p.subscription_id
      WHERE EXTRACT(YEAR FROM ms.month) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND ms.month <= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY month
      ORDER BY month
    `);

    const currentMonth = new Date().getMonth() + 1;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const map = {};
    result.rows.forEach(r => { map[r.month] = Number(r.collected); });

    const data = [];
    for (let m = 1; m <= currentMonth; m++) {
      data.push({ month: months[m - 1], collected: map[m] || 0 });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.flat_number AS flat,
        f.owner_name AS resident,
        f.flat_type AS type,
        p.amount_paid AS amount,
        p.payment_mode AS mode,
        p.paid_at::date AS date,
        'paid' AS status
      FROM payments p
      JOIN flats f ON p.flat_id = f.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    res.json({ transactions: result.rows });
  } catch (err) {
    res.status(500).json(err);
  }
};

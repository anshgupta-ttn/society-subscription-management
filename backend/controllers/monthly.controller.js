const pool = require("../db");

exports.getMonthly = async (req, res) => {
  try {
    const { month, year } = req.query;
    const result = await pool.query(
      `SELECT
        ms.id,
        ms.flat_id,
        ms.amount_due,
        f.flat_number,
        f.owner_name,
        f.flat_type,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM payments p
            WHERE p.flat_id = ms.flat_id
            AND EXTRACT(MONTH FROM p.paid_at) = EXTRACT(MONTH FROM ms.month)
            AND EXTRACT(YEAR FROM p.paid_at) = EXTRACT(YEAR FROM ms.month)
          ) THEN 'paid'
          ELSE ms.status
        END AS status
      FROM monthly_subscriptions ms
      JOIN flats f ON f.id = ms.flat_id
      WHERE EXTRACT(MONTH FROM ms.month) = $1
        AND EXTRACT(YEAR FROM ms.month) = $2
        AND ms.month <= DATE_TRUNC('month', CURRENT_DATE)
        AND ms.month >= DATE_TRUNC('month', f.created_at)
      ORDER BY f.flat_number`,
      [month, year]
    );
    res.json({ records: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.generateMonthly = async (req, res) => {
  try {
    const { month, year } = req.body;

    const targetDate = new Date(year, month - 1, 1);
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    if (targetDate > currentMonth) {
      return res.status(400).json({ error: "Cannot generate records for future months." });
    }

    const flats = await pool.query(
      `SELECT id, flat_type FROM flats
       WHERE is_active = true
       AND DATE_TRUNC('month', created_at) <= make_date($1, $2, 1)`,
      [year, month]
    );

    for (let f of flats.rows) {
      const plan = await pool.query(
        `SELECT id, monthly_amount FROM subscription_plans WHERE flat_type = $1 ORDER BY effective_from DESC LIMIT 1`,
        [f.flat_type]
      );
      if (plan.rows.length === 0) continue;

      const p = plan.rows[0];
      const exist = await pool.query(
        `SELECT id FROM monthly_subscriptions
         WHERE flat_id=$1 AND EXTRACT(MONTH FROM month) = $2 AND EXTRACT(YEAR FROM month) = $3`,
        [f.id, month, year]
      );
      if (exist.rows.length > 0) continue;

      await pool.query(
        `INSERT INTO monthly_subscriptions (flat_id, plan_id, month, amount_due, status, due_date)
         VALUES ($1, $2, make_date($3,$4,1), $5, 'pending', CURRENT_DATE)`,
        [f.id, p.id, year, month, p.monthly_amount]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.markPaid = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE monthly_subscriptions SET status='paid' WHERE id=$1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

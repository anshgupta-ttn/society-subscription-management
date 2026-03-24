const pool = require("../db");


/* =========================
   MONTHLY REPORT
========================= */

exports.getMonthlyReport = async (req, res) => {

  try {

    const { month, year } = req.query;


    /* total flats */

    const flats = await pool.query(
      `SELECT COUNT(*) FROM flats WHERE is_active = true`
    );


    /* billable */

    const billableRes = await pool.query(
      `
      SELECT COALESCE(SUM(amount_due),0) AS billable
      FROM monthly_subscriptions
      WHERE EXTRACT(MONTH FROM month) = $1
      AND EXTRACT(YEAR FROM month) = $2
      `,
      [month, year]
    );


    /* collected */

    const collectedRes = await pool.query(
      `
      SELECT COALESCE(SUM(p.amount_paid),0) AS collected
      FROM payments p
      JOIN monthly_subscriptions ms ON ms.id = p.subscription_id
      WHERE EXTRACT(MONTH FROM ms.month) = $1
      AND EXTRACT(YEAR FROM ms.month) = $2
      `,
      [month, year]
    );


    /* modes */

    const modes = await pool.query(
      `
      SELECT p.payment_mode,
      SUM(p.amount_paid) AS total
      FROM payments p
      JOIN monthly_subscriptions ms ON ms.id = p.subscription_id
      WHERE EXTRACT(MONTH FROM ms.month) = $1
      AND EXTRACT(YEAR FROM ms.month) = $2
      GROUP BY p.payment_mode
      `,
      [month, year]
    );


    const total_flats = flats.rows[0].count;
    const billable = billableRes.rows[0].billable;
    const collected = collectedRes.rows[0].collected;

    const pending =
      Number(billable) - Number(collected);


    res.json({
      summary: {
        total_flats,
        billable,
        collected,
        pending,
      },
      modes: modes.rows,
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

};




/* =========================
   YEARLY REPORT
========================= */

exports.getYearlyReport = async (req, res) => {

  try {

    const { year } = req.query;


    const monthly = await pool.query(
      `
      SELECT
        EXTRACT(MONTH FROM ms.month)::int AS month,
        SUM(p.amount_paid) AS total
      FROM payments p
      JOIN monthly_subscriptions ms ON ms.id = p.subscription_id
      WHERE EXTRACT(YEAR FROM ms.month) = $1
      GROUP BY month
      ORDER BY month
      `,
      [year]
    );


    const total = await pool.query(
      `
      SELECT COALESCE(SUM(p.amount_paid),0) AS collected
      FROM payments p
      JOIN monthly_subscriptions ms ON ms.id = p.subscription_id
      WHERE EXTRACT(YEAR FROM ms.month) = $1
      `,
      [year]
    );


    res.json({
      monthly: monthly.rows,
      total: total.rows[0],
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

};
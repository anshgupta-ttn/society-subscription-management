const pool = require("../db");


/* ======================
   GET PLANS
====================== */

exports.getPlans = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT DISTINCT ON (flat_type)
        id,
        flat_type,
        monthly_amount,
        effective_from
      FROM subscription_plans
      ORDER BY flat_type, effective_from DESC
    `);

    res.json({
      plans: result.rows,
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

};



/* ======================
   UPDATE PLAN
====================== */

exports.updatePlan = async (req, res) => {

  try {

    const { id } = req.params;
    const { monthly_amount } = req.body;


    await pool.query(
      `
      UPDATE subscription_plans
      SET monthly_amount=$1
      WHERE id=$2
      `,
      [monthly_amount, id]
    );


    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

};
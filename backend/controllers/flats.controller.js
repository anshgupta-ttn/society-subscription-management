const pool = require("../db");
const bcrypt = require("bcrypt");

exports.getTotalFlats = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM flats");
    res.json({ total_flats: result.rows[0].count });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getFlats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, flat_number, owner_name, flat_type, owner_email, owner_phone, is_active
      FROM flats
      ORDER BY id
    `);
    res.json({ flats: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.addFlat = async (req, res) => {
  const client = await pool.connect();
  try {
    const { flat_number, owner_name, flat_type, owner_email, owner_phone, is_active, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    const flatResult = await client.query(
      `INSERT INTO flats (flat_number, owner_name, flat_type, owner_email, owner_phone, is_active, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [flat_number, owner_name, flat_type, owner_email, owner_phone, is_active ?? true, hashedPassword]
    );

    const flatId = flatResult.rows[0].id;

    const plan = await client.query(
      `SELECT id, monthly_amount FROM subscription_plans WHERE flat_type = $1 ORDER BY effective_from DESC LIMIT 1`,
      [flat_type]
    );

    if (plan.rows.length > 0) {
      const p = plan.rows[0];
      const now = new Date();
      await client.query(
        `INSERT INTO monthly_subscriptions (flat_id, plan_id, month, amount_due, status, due_date)
         VALUES ($1, $2, make_date($3,$4,1), $5, 'pending', CURRENT_DATE)`,
        [flatId, p.id, now.getFullYear(), now.getMonth() + 1, p.monthly_amount]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.log(err);
    res.status(500).json(err);
  } finally {
    client.release();
  }
};

exports.updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const { flat_number, owner_name, flat_type, owner_email, owner_phone, is_active, password } = req.body;

    const fields = [flat_number, owner_name, flat_type, owner_email, owner_phone, is_active];
    let query = `UPDATE flats SET flat_number=$1, owner_name=$2, flat_type=$3, owner_email=$4, owner_phone=$5, is_active=$6`;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(hashedPassword);
      query += `, password=$${fields.length}`;
    }

    fields.push(id);
    query += ` WHERE id=$${fields.length}`;

    await pool.query(query, fields);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.deleteFlat = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM payments WHERE flat_id=$1", [id]);
    await pool.query("DELETE FROM monthly_subscriptions WHERE flat_id=$1", [id]);
    await pool.query("DELETE FROM flats WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

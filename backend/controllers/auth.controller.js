const pool = require("../db");


exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT id, email, name
      FROM admins
      WHERE email=$1
      AND password=$2
      `,
      [email, password]
    );

    if (result.rows.length === 0) {

      return res.status(401).json({
        success: false,
        error: "Invalid login",
      });

    }

    res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

};
const pool = require("../db");

exports.getProfile = async (req, res) => {
  try {
    const { adminId } = req.body;

    const result = await pool.query(
      `SELECT id, email, name FROM admins WHERE id = $1`,
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { adminId, name, email } = req.body;

    const result = await pool.query(
      `UPDATE admins SET name = $1, email = $2 WHERE id = $3 RETURNING id, email, name`,
      [name, email, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    const admin = await pool.query(
      `SELECT password FROM admins WHERE id = $1`,
      [adminId]
    );

    if (admin.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    if (admin.rows[0].password !== currentPassword) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    await pool.query(
      `UPDATE admins SET password = $1 WHERE id = $2`,
      [newPassword, adminId]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

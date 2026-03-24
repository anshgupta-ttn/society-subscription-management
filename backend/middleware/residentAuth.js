const jwt = require("jsonwebtoken");

const SECRETS = [
  process.env.JWT_SECRET,
  "society_sync_jwt_secret_key_2026",
  "society_sync_secret",
].filter(Boolean);

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  for (const secret of SECRETS) {
    try {
      const decoded = jwt.verify(token, secret);
      req.flatId = decoded.flatId;
      return next();
    } catch {
      continue;
    }
  }
  return res.status(401).json({ success: false, message: "Invalid or expired token" });
};

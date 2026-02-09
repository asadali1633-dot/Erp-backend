require('dotenv').config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ failed: true, message: "Token required" });
  }

  const accessToken = token.split(" ")[1];

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.user = decoded;
    if (decoded.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({ message: "Tenant mismatch" });
    }
    next();
  } catch (err) {
    return res.status(403).json({ failed: true, message: "Invalid or expired token" });
  }
};

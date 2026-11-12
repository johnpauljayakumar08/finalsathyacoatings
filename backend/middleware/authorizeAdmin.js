const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication is required" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    const role = String(user.role || "").replace(/[\s_-]/g, "").toLowerCase();
    if (role !== "admin" && role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only administrators can manage labour teams" });
    }
    req.adminUser = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
  }
};

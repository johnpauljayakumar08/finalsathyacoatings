const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await authModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare plain-text password
    if (password !== user.user_password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT for session management (expires in 24 hours)
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role_name, user_name: user.user_name, user_email: user.user_email },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "24h" }
    );

    // Encode user_id using btoa for URL
    const encodedUserId = Buffer.from(user.user_id.toString()).toString("base64");

    // Map role to dashboard path
    const rolePaths = {
      superadmin: `/superadmin/${encodedUserId}`,
      admin: `/admin/dashboard/${encodedUserId}`,
      managing_director: `/md/dashboard/${encodedUserId}`,
      managingdirector: `/md/dashboard/${encodedUserId}`,
      md: `/md/dashboard/${encodedUserId}`,
      siteincharge: `/site-incharge/${encodedUserId}`,
      "site incharge": `/site-incharge/${encodedUserId}`,
      accounts_team: `/accounts-team/${encodedUserId}`,
    };

    // Normalize role name for matching (remove spaces and make lowercase)
    const normalizedRole = user.role_name.replace(/\s+/g, "").toLowerCase();
    const redirectPath = rolePaths[normalizedRole] || "/dashboard";

    res.status(200).json({
      message: "Login successful",
      token,
      encodedUserId,
      redirect: redirectPath,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, logout is handled client-side by clearing the token
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.verifyToken = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    res.status(200).json({
      user_id: decoded.user_id,
      role: decoded.role,
      user_name: decoded.user_name,
      user_email: decoded.user_email,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
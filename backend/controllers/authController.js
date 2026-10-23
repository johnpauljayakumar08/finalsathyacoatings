const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../config/db");
const authModel = require("../models/authModel");

const normalizeRole = role => String(role || '').replace(/[\s_-]/g, '').toLowerCase();
const requiresLoginOtp = role => ['admin', 'md', 'managingdirector'].includes(normalizeRole(role));

const createLoginSession = user => {
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role_name, user_name: user.user_name, user_email: user.user_email },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '24h' }
  );
  const encodedUserId = Buffer.from(user.user_id.toString()).toString('base64');
  const rolePaths = {
    superadmin: `/superadmin/${encodedUserId}`,
    admin: `/admin/dashboard/${encodedUserId}`,
    managing_director: `/md/dashboard/${encodedUserId}`,
    managingdirector: `/md/dashboard/${encodedUserId}`,
    md: `/md/dashboard/${encodedUserId}`,
    siteincharge: `/site-incharge/${encodedUserId}`,
    'site incharge': `/site-incharge/${encodedUserId}`,
    accounts_team: `/accounts-team/${encodedUserId}`
  };
  const roleKey = String(user.role_name || '').replace(/\s+/g, '').toLowerCase();
  return { message: 'Login successful', token, encodedUserId, redirect: rolePaths[roleKey] || '/dashboard' };
};

const createOtpDigest = (challengeId, otp) => crypto
  .createHmac('sha256', process.env.OTP_SECRET || process.env.JWT_SECRET || process.env.SMTP_PASS || 'replace-this-otp-secret')
  .update(`${challengeId}:${otp}`)
  .digest('hex');

const sendManagingDirectorOtp = async user => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  const recipient = normalizeRole(user.role_name) === 'admin' ? process.env.ADMIN_OTP_EMAIL : process.env.MD_OTP_EMAIL;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !recipient) {
    const error = new Error('Admin/MD OTP email is not configured');
    error.statusCode = 503;
    throw error;
  }

  const [recentRequests] = await db.query(
    `SELECT COUNT(*) AS count FROM md_login_otp_challenges
     WHERE user_id = ? AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE)`,
    [user.user_id]
  );
  if (Number(recentRequests[0]?.count || 0) >= 5) {
    const error = new Error('Too many OTP requests. Please wait before trying again.');
    error.statusCode = 429;
    throw error;
  }

  await db.query('UPDATE md_login_otp_challenges SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL', [user.user_id]);
  const challengeId = crypto.randomBytes(32).toString('hex');
  const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  const challengeHash = crypto.createHash('sha256').update(challengeId).digest('hex');
  const otpHash = createOtpDigest(challengeId, otp);
  const [result] = await db.query(
    `INSERT INTO md_login_otp_challenges (user_id, challenge_hash, otp_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 MINUTE))`,
    [user.user_id, challengeHash, otpHash]
  );

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM || SMTP_USER,
      to: recipient,
      subject: 'Sathya Coatings login code',
      text: `Your login code is ${otp}. It expires in 5 minutes. If you did not try to sign in, ignore this email.`,
      html: `<p>Your Sathya Coatings login code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>This code expires in 5 minutes. If you did not try to sign in, ignore this email.</p>`
    });
  } catch (error) {
    await db.query('UPDATE md_login_otp_challenges SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [result.insertId]);
    throw error;
  }

  return challengeId;
};

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

    const isHashedPassword = /^\$2[aby]\$/.test(user.user_password);
    const passwordMatches = isHashedPassword
      ? await bcrypt.compare(password, user.user_password)
      : password === user.user_password;
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (requiresLoginOtp(user.role_name)) {
      const challengeId = await sendManagingDirectorOtp(user);
      return res.status(200).json({ requiresOtp: true, challengeId, message: 'A login code has been sent to your configured login email.' });
    }

    res.status(200).json(createLoginSession(user));
  } catch (error) {
    console.error("Error during login:", error);
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : "Internal Server Error" });
  }
};

exports.verifyManagingDirectorOtp = async (req, res) => {
  const { challengeId, otp } = req.body;
  if (typeof challengeId !== 'string' || !/^[a-f0-9]{64}$/i.test(challengeId) || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'Enter the six-digit login code from your email.' });
  }

  const challengeHash = crypto.createHash('sha256').update(challengeId).digest('hex');
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [challenges] = await connection.query(
      `SELECT id, user_id, otp_hash, attempts FROM md_login_otp_challenges
       WHERE challenge_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       LIMIT 1 FOR UPDATE`,
      [challengeHash]
    );
    if (!challenges.length || Number(challenges[0].attempts) >= 5) {
      await connection.rollback();
      return res.status(400).json({ error: 'This login code is invalid or expired. Sign in again to request a new code.' });
    }

    const challenge = challenges[0];
    const expected = Buffer.from(challenge.otp_hash, 'hex');
    const provided = Buffer.from(createOtpDigest(challengeId, otp), 'hex');
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      const attempts = Number(challenge.attempts) + 1;
      await connection.query(
        'UPDATE md_login_otp_challenges SET attempts = ?, used_at = IF(? >= 5, CURRENT_TIMESTAMP, used_at) WHERE id = ?',
        [attempts, attempts, challenge.id]
      );
      await connection.commit();
      return res.status(400).json({ error: attempts >= 5 ? 'Too many incorrect codes. Sign in again to request a new code.' : 'Incorrect login code.' });
    }

    const [users] = await connection.query(
      `SELECT u.user_id, u.user_name, u.user_email, r.role_name
       FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?`,
      [challenge.user_id]
    );
    if (!users.length || !requiresLoginOtp(users[0].role_name)) {
      await connection.query('UPDATE md_login_otp_challenges SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [challenge.id]);
      await connection.commit();
      return res.status(400).json({ error: 'Unable to verify this login. Sign in again.' });
    }

    await connection.query('UPDATE md_login_otp_challenges SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [challenge.id]);
    await connection.commit();
    res.status(200).json(createLoginSession(users[0]));
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Managing Director OTP verification failed:', error.message);
    res.status(500).json({ error: 'Unable to verify the login code right now' });
  } finally {
    if (connection) connection.release();
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

exports.requestPasswordReset = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(503).json({ error: 'Password reset email is not configured. Contact your system administrator.' });
  }

  try {
    const user = await authModel.findUserByEmail(email);
    if (!user) return res.status(200).json({ message: 'If the email is registered, a password reset link will be sent.' });

    const [recentRequests] = await db.query(
      `SELECT COUNT(*) AS count FROM password_reset_tokens
       WHERE user_id = ? AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE)`,
      [user.user_id]
    );
    if (Number(recentRequests[0]?.count || 0) >= 3) {
      return res.status(200).json({ message: 'If the email is registered, a password reset link will be sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await db.query(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL',
      [user.user_id]
    );
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))`,
      [user.user_id, tokenHash]
    );

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM || SMTP_USER,
      to: user.user_email,
      subject: 'Sathya Coatings password reset',
      text: `Use this link to reset your password. It expires in 30 minutes and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
      html: `<p>A password reset was requested for your Sathya Coatings account.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 30 minutes and can only be used once. If you did not request this, ignore this email.</p>`
    });
    res.status(200).json({ message: 'If the email is registered, a password reset link will be sent.' });
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    res.status(500).json({ error: 'Unable to send password reset email right now' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (typeof token !== 'string' || !token || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ error: 'A valid reset token and password of 8 to 128 characters are required' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [tokens] = await connection.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       LIMIT 1 FOR UPDATE`,
      [tokenHash]
    );
    if (!tokens.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'This password reset link is invalid or expired. Request a new link.' });
    }

    const reset = tokens[0];
    await connection.query('UPDATE users SET user_password = ? WHERE user_id = ?', [hashedPassword, reset.user_id]);
    await connection.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL', [reset.user_id]);
    await connection.commit();
    res.status(200).json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Password reset failed:', error.message);
    res.status(500).json({ error: 'Unable to reset password right now' });
  } finally {
    if (connection) connection.release();
  }
};
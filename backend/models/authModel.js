const db = require("../config/db");

exports.findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `
      SELECT u.user_id, u.user_name, u.user_email, u.user_password, r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_email = ?
    `,
    [email]
  );
  return rows.length ? rows[0] : null;
};

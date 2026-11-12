ALTER TABLE md_login_otp_challenges
  ADD COLUMN email_sent_at DATETIME DEFAULT NULL AFTER created_at;

CREATE TABLE IF NOT EXISTS md_login_otp_challenges (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  challenge_hash CHAR(64) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_md_login_challenge_hash (challenge_hash),
  KEY idx_md_login_user_created (user_id, created_at),
  KEY idx_md_login_expiry (expires_at),
  CONSTRAINT fk_md_login_otp_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
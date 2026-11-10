CREATE TABLE IF NOT EXISTS completion_entry_change_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  entry_id BIGINT NOT NULL,
  rec_id INT NOT NULL,
  action ENUM('UPDATE', 'DELETE') NOT NULL,
  old_area_added DECIMAL(10,2) NOT NULL,
  new_area_added DECIMAL(10,2) DEFAULT NULL,
  old_remarks VARCHAR(255) DEFAULT NULL,
  new_remarks VARCHAR(255) DEFAULT NULL,
  changed_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_completion_entry_change_rec (rec_id, created_at),
  KEY idx_completion_entry_change_entry (entry_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

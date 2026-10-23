CREATE TABLE IF NOT EXISTS finance_dem_entry_edit_history (
  id INT NOT NULL AUTO_INCREMENT,
  finance_dem_entry_id INT NOT NULL,
  previous_values JSON NOT NULL,
  changed_by INT DEFAULT NULL,
  changed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_finance_dem_history_entry (finance_dem_entry_id),
  KEY idx_finance_dem_history_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
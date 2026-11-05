CREATE TABLE IF NOT EXISTS projection_allocation_edit_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  site_id VARCHAR(30) NOT NULL,
  desc_id INT NOT NULL,
  projection_id INT NOT NULL,
  overhead_type_id INT NOT NULL,
  previous_total_cost DECIMAL(12,2) NOT NULL,
  new_total_cost DECIMAL(12,2) NOT NULL,
  previous_budget_percentage DECIMAL(5,2) NOT NULL,
  new_budget_percentage DECIMAL(5,2) NOT NULL,
  changed_by VARCHAR(30) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_projection_allocation_history (site_id, desc_id, projection_id, overhead_type_id),
  KEY idx_projection_allocation_history_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS projection_operational_cost_change_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id VARCHAR(30) NOT NULL,
  desc_id INT NOT NULL,
  projection_id INT NOT NULL,
  po_budget_id BIGINT UNSIGNED NOT NULL,
  previous_operational_cost DECIMAL(12,2) NOT NULL,
  requested_operational_cost DECIMAL(12,2) NOT NULL,
  remark VARCHAR(2000) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  requested_by INT NOT NULL,
  reviewed_by INT DEFAULT NULL,
  review_remark VARCHAR(1000) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_operational_cost_request_scope (site_id, desc_id, projection_id, created_at),
  KEY idx_operational_cost_request_pending (po_budget_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

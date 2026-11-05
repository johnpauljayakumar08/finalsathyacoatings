CREATE TABLE IF NOT EXISTS actual_budget_adjustment_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  po_budget_id INT NOT NULL,
  source_actual_budget_id INT NOT NULL,
  target_actual_budget_id INT NOT NULL,
  source_overhead_id INT NOT NULL,
  target_overhead_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  entry_date DATE NOT NULL,
  expense_history_id BIGINT DEFAULT NULL,
  adjusted_by VARCHAR(30) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_budget_adjustment_po_budget (po_budget_id),
  KEY idx_budget_adjustment_source (source_actual_budget_id),
  KEY idx_budget_adjustment_target (target_actual_budget_id),
  KEY idx_budget_adjustment_expense (expense_history_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS finance_dem_master (
  id INT NOT NULL AUTO_INCREMENT,
  master_type ENUM('expense_classification', 'expense_grouping') NOT NULL,
  master_value VARCHAR(255) NOT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_finance_dem_master_value (master_type, master_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS finance_dem_entry (
  id INT NOT NULL AUTO_INCREMENT,
  entry_date DATE NOT NULL,
  description TEXT DEFAULT NULL,
  contra_entry ENUM('yes', 'no') NOT NULL DEFAULT 'no',
  receipt_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  receipt_bank_id INT DEFAULT NULL,
  debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  paid_from_bank_id INT DEFAULT NULL,
  paid_to_bank_id INT DEFAULT NULL,
  expense_month CHAR(7) DEFAULT NULL,
  cost_center_id INT DEFAULT NULL,
  cost_category_id INT DEFAULT NULL,
  expense_classification_id INT DEFAULT NULL,
  expense_grouping_id INT DEFAULT NULL,
  available_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_finance_dem_entry_date (entry_date),
  KEY idx_finance_dem_receipt_bank (receipt_bank_id),
  KEY idx_finance_dem_paid_from_bank (paid_from_bank_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
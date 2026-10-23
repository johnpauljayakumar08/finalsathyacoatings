CREATE TABLE IF NOT EXISTS finance_sales_register (
  id INT NOT NULL AUTO_INCREMENT,
  transaction_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  invoice_no VARCHAR(100) NOT NULL,
  invoice_description TEXT DEFAULT NULL,
  rate DECIMAL(15,2) DEFAULT 0.00,
  sale_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  gst DECIMAL(15,2) DEFAULT 0.00,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
  supply TINYINT(1) NOT NULL DEFAULT 0,
  service TINYINT(1) NOT NULL DEFAULT 0,
  date_of_payment DATE DEFAULT NULL,
  utr_details TEXT DEFAULT NULL,
  po_work_order_no VARCHAR(100) DEFAULT NULL,
  finance_year_id INT NOT NULL,
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sales_register_year (finance_year_id),
  KEY idx_sales_register_transaction_date (transaction_date),
  KEY idx_sales_register_invoice (invoice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS finance_sales_register_edit_history (
  id INT NOT NULL AUTO_INCREMENT,
  finance_sales_register_id INT NOT NULL,
  transaction_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  invoice_no VARCHAR(100) NOT NULL,
  invoice_description TEXT DEFAULT NULL,
  rate DECIMAL(15,2) DEFAULT 0.00,
  sale_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  gst DECIMAL(15,2) DEFAULT 0.00,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
  supply TINYINT(1) NOT NULL DEFAULT 0,
  service TINYINT(1) NOT NULL DEFAULT 0,
  date_of_payment DATE DEFAULT NULL,
  utr_details TEXT DEFAULT NULL,
  po_work_order_no VARCHAR(100) DEFAULT NULL,
  finance_year_id INT NOT NULL,
  created_by INT DEFAULT NULL,
  changed_by INT DEFAULT NULL,
  changed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sales_register_history_parent (finance_sales_register_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register' AND COLUMN_NAME = 'gst_percentage') = 0,
  'ALTER TABLE finance_sales_register ADD COLUMN gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER gst',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register_edit_history' AND COLUMN_NAME = 'gst_percentage') = 0,
  'ALTER TABLE finance_sales_register_edit_history ADD COLUMN gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER gst',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register' AND COLUMN_NAME = 'sale_amount') = 0,
  'ALTER TABLE finance_sales_register ADD COLUMN sale_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER rate',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register' AND COLUMN_NAME = 'supply') = 0,
  'ALTER TABLE finance_sales_register ADD COLUMN supply TINYINT(1) NOT NULL DEFAULT 0 AFTER total_value',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register' AND COLUMN_NAME = 'service') = 0,
  'ALTER TABLE finance_sales_register ADD COLUMN service TINYINT(1) NOT NULL DEFAULT 0 AFTER supply',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register_edit_history' AND COLUMN_NAME = 'sale_amount') = 0,
  'ALTER TABLE finance_sales_register_edit_history ADD COLUMN sale_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER rate',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register_edit_history' AND COLUMN_NAME = 'supply') = 0,
  'ALTER TABLE finance_sales_register_edit_history ADD COLUMN supply TINYINT(1) NOT NULL DEFAULT 0 AFTER total_value',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;

SET @sales_line_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_sales_register_edit_history' AND COLUMN_NAME = 'service') = 0,
  'ALTER TABLE finance_sales_register_edit_history ADD COLUMN service TINYINT(1) NOT NULL DEFAULT 0 AFTER supply',
  'SELECT 1'
);
PREPARE sales_line_stmt FROM @sales_line_sql;
EXECUTE sales_line_stmt;
DEALLOCATE PREPARE sales_line_stmt;
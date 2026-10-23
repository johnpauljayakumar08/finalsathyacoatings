CREATE TABLE IF NOT EXISTS finance_compound_purchase_register (
  id INT NOT NULL AUTO_INCREMENT,
  transaction_date DATE NOT NULL,
  received_date DATE DEFAULT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  bill_no VARCHAR(100) NOT NULL,
  purchase_type ENUM('project', 'supply') NOT NULL,
  description TEXT NOT NULL,
  purchased_for VARCHAR(255) DEFAULT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  uom VARCHAR(50) NOT NULL,
  rate DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  sale_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  gst_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_compound_purchase_date (transaction_date),
  KEY idx_compound_purchase_supplier (supplier_name),
  KEY idx_compound_purchase_bill (bill_no),
  KEY idx_compound_purchase_for (purchased_for)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @compound_purchase_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_compound_purchase_register' AND COLUMN_NAME = 'bill_no') = 0,
  'ALTER TABLE finance_compound_purchase_register ADD COLUMN bill_no VARCHAR(100) NOT NULL DEFAULT '''' AFTER supplier_name',
  'SELECT 1'
);
PREPARE compound_purchase_stmt FROM @compound_purchase_sql;
EXECUTE compound_purchase_stmt;
DEALLOCATE PREPARE compound_purchase_stmt;

SET @compound_purchase_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_compound_purchase_register' AND COLUMN_NAME = 'purchase_type') = 0,
  'ALTER TABLE finance_compound_purchase_register ADD COLUMN purchase_type ENUM(''project'', ''supply'') NOT NULL DEFAULT ''project'' AFTER bill_no',
  'SELECT 1'
);
PREPARE compound_purchase_stmt FROM @compound_purchase_sql;
EXECUTE compound_purchase_stmt;
DEALLOCATE PREPARE compound_purchase_stmt;

ALTER TABLE finance_compound_purchase_register
  MODIFY COLUMN purchased_for VARCHAR(255) DEFAULT NULL;
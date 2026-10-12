-- Bank Statement Consolidation spreadsheet fields linked to the existing finance bank master.
-- Apply this migration once to the existing application database.

SET @bank_statement_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_bank_statement_consolidation'
     AND COLUMN_NAME = 'po_number') = 0,
  'ALTER TABLE finance_bank_statement_consolidation ADD COLUMN po_number VARCHAR(100) DEFAULT NULL AFTER po_status',
  'SELECT 1'
);
PREPARE bank_statement_stmt FROM @bank_statement_sql;
EXECUTE bank_statement_stmt;
DEALLOCATE PREPARE bank_statement_stmt;

SET @bank_statement_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_bank_statement_consolidation'
     AND COLUMN_NAME = 'bank_id') = 0,
  'ALTER TABLE finance_bank_statement_consolidation ADD COLUMN bank_id INT DEFAULT NULL AFTER transaction_type',
  'SELECT 1'
);
PREPARE bank_statement_stmt FROM @bank_statement_sql;
EXECUTE bank_statement_stmt;
DEALLOCATE PREPARE bank_statement_stmt;

SET @bank_statement_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_bank_statement_consolidation'
     AND COLUMN_NAME = 'classification') = 0,
  'ALTER TABLE finance_bank_statement_consolidation ADD COLUMN classification ENUM(''PR-G'', ''PR-WG'', ''SR'', ''N/A'') NOT NULL DEFAULT ''N/A'' AFTER payment_category',
  'SELECT 1'
);
PREPARE bank_statement_stmt FROM @bank_statement_sql;
EXECUTE bank_statement_stmt;
DEALLOCATE PREPARE bank_statement_stmt;

INSERT IGNORE INTO finance_bank_master (bank_name, available_balance, created_by)
SELECT DISTINCT TRIM(fbs.bank_name), 0, '1'
FROM finance_bank_statement_consolidation fbs
LEFT JOIN finance_bank_master fbm
  ON LOWER(TRIM(fbs.bank_name)) COLLATE utf8mb4_general_ci =
     LOWER(TRIM(fbm.bank_name)) COLLATE utf8mb4_general_ci
WHERE fbs.bank_name IS NOT NULL
  AND TRIM(fbs.bank_name) <> ''
  AND CHAR_LENGTH(TRIM(fbs.bank_name)) <= 200
  AND fbm.id IS NULL;

UPDATE finance_bank_statement_consolidation fbs
JOIN finance_bank_master fsbm
  ON LOWER(TRIM(fbs.bank_name)) COLLATE utf8mb4_general_ci =
     LOWER(TRIM(fsbm.bank_name)) COLLATE utf8mb4_general_ci
SET fbs.bank_id = fsbm.id
WHERE fbs.bank_id IS NULL
  AND fbs.bank_name IS NOT NULL
  AND TRIM(fbs.bank_name) <> '';

CREATE TABLE IF NOT EXISTS finance_bank_statement_consolidation_edit_history (
  id INT NOT NULL AUTO_INCREMENT,
  finance_bank_statement_consolidation_id INT NOT NULL,
  finance_year_id INT NOT NULL,
  transaction_date DATE NOT NULL,
  expense_description TEXT DEFAULT NULL,
  cost_center_id INT DEFAULT NULL,
  po_status ENUM('available', 'not_available') DEFAULT 'not_available',
  po_number VARCHAR(100) DEFAULT NULL,
  cost_element VARCHAR(255) DEFAULT NULL,
  amount DECIMAL(15,2) DEFAULT 0.00,
  transaction_type ENUM('credit', 'debit') NOT NULL,
  bank_id INT DEFAULT NULL,
  bank_name VARCHAR(255) DEFAULT NULL,
  payment_category ENUM('purchase', 'sales', 'purchase_advance', 'sales_advance', 'na') DEFAULT 'na',
  classification ENUM('PR-G', 'PR-WG', 'SR', 'N/A') NOT NULL DEFAULT 'N/A',
  invoice_date DATE DEFAULT NULL,
  invoice_no VARCHAR(100) DEFAULT NULL,
  supplier_customer_name VARCHAR(255) DEFAULT NULL,
  utr_details VARCHAR(255) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  changed_by INT DEFAULT NULL,
  changed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bank_statement_history_id (finance_bank_statement_consolidation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @bank_statement_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_bank_statement_consolidation_edit_history'
     AND COLUMN_NAME = 'po_number') = 0,
  'ALTER TABLE finance_bank_statement_consolidation_edit_history ADD COLUMN po_number VARCHAR(100) DEFAULT NULL AFTER po_status',
  'SELECT 1'
);
PREPARE bank_statement_stmt FROM @bank_statement_sql;
EXECUTE bank_statement_stmt;
DEALLOCATE PREPARE bank_statement_stmt;

SET @bank_statement_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_bank_statement_consolidation_edit_history'
     AND COLUMN_NAME = 'bank_id') = 0,
  'ALTER TABLE finance_bank_statement_consolidation_edit_history ADD COLUMN bank_id INT DEFAULT NULL AFTER transaction_type',
  'SELECT 1'
);
PREPARE bank_statement_stmt FROM @bank_statement_sql;
EXECUTE bank_statement_stmt;
DEALLOCATE PREPARE bank_statement_stmt;

SET @bank_statement_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_bank_statement_consolidation_edit_history'
     AND COLUMN_NAME = 'classification') = 0,
  'ALTER TABLE finance_bank_statement_consolidation_edit_history ADD COLUMN classification ENUM(''PR-G'', ''PR-WG'', ''SR'', ''N/A'') NOT NULL DEFAULT ''N/A'' AFTER payment_category',
  'SELECT 1'
);
PREPARE bank_statement_stmt FROM @bank_statement_sql;
EXECUTE bank_statement_stmt;
DEALLOCATE PREPARE bank_statement_stmt;

INSERT IGNORE INTO finance_bank_master (bank_name, available_balance, created_by)
SELECT DISTINCT TRIM(history.bank_name), 0, '1'
FROM finance_bank_statement_consolidation_edit_history history
LEFT JOIN finance_bank_master fbm
  ON LOWER(TRIM(history.bank_name)) COLLATE utf8mb4_general_ci =
     LOWER(TRIM(fbm.bank_name)) COLLATE utf8mb4_general_ci
WHERE history.bank_name IS NOT NULL
  AND TRIM(history.bank_name) <> ''
  AND CHAR_LENGTH(TRIM(history.bank_name)) <= 200
  AND fbm.id IS NULL;

UPDATE finance_bank_statement_consolidation_edit_history history
JOIN finance_bank_master fsbm
  ON LOWER(TRIM(history.bank_name)) COLLATE utf8mb4_general_ci =
     LOWER(TRIM(fsbm.bank_name)) COLLATE utf8mb4_general_ci
SET history.bank_id = fsbm.id
WHERE history.bank_id IS NULL
  AND history.bank_name IS NOT NULL
  AND TRIM(history.bank_name) <> '';

SET @finance_bank_statement_fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'finance_bank_statement_consolidation'
    AND CONSTRAINT_NAME = 'fk_finance_bank_statement_bank'
);
SET @finance_bank_statement_fk_sql = IF(
  @finance_bank_statement_fk_exists = 0,
  'ALTER TABLE finance_bank_statement_consolidation ADD CONSTRAINT fk_finance_bank_statement_bank FOREIGN KEY (bank_id) REFERENCES finance_bank_master (id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE finance_bank_statement_fk_stmt FROM @finance_bank_statement_fk_sql;
EXECUTE finance_bank_statement_fk_stmt;
DEALLOCATE PREPARE finance_bank_statement_fk_stmt;

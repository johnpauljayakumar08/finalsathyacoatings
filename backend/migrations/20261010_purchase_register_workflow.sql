-- Purchase Register workflow: PO entry, approval, material receipt, invoice and payment tracking.

INSERT INTO roles (role_name)
SELECT 'managing_director'
WHERE NOT EXISTS (
  SELECT 1
  FROM roles
  WHERE LOWER(REPLACE(REPLACE(role_name, ' ', ''), '_', '')) = 'managingdirector'
);

CREATE TABLE IF NOT EXISTS finance_purchase_register (
  id INT NOT NULL AUTO_INCREMENT,
  finance_year_id INT NOT NULL,
  purchase_type ENUM('G', 'WG') NOT NULL DEFAULT 'G',
  transaction_date DATE NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  po_number VARCHAR(100) DEFAULT NULL,
  invoice_no VARCHAR(100) DEFAULT NULL,
  invoice_date DATE DEFAULT NULL,
  invoice_description TEXT DEFAULT NULL,
  rate DECIMAL(15,2) DEFAULT 0.00,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  gst DECIMAL(15,2) DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
  grand_total DECIMAL(15,2) DEFAULT 0.00,
  master_approval ENUM('pending', 'yes', 'no') NOT NULL DEFAULT 'pending',
  master_approval_at DATETIME DEFAULT NULL,
  material_status ENUM('not_received', 'received') NOT NULL DEFAULT 'not_received',
  material_receipt_at DATETIME DEFAULT NULL,
  credit_period_days INT DEFAULT NULL,
  payment_due_date DATE DEFAULT NULL,
  date_of_payment DATE DEFAULT NULL,
  payment_status ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  utr_details TEXT DEFAULT NULL,
  po_work_order_no VARCHAR(100) DEFAULT NULL,
  po_pdf_path VARCHAR(500) DEFAULT NULL,
  po_pdf_name VARCHAR(255) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_purchase_register_year (finance_year_id),
  KEY idx_purchase_register_supplier (supplier_name),
  KEY idx_purchase_register_po (po_number),
  KEY idx_purchase_register_invoice (invoice_no),
  KEY idx_purchase_register_type (purchase_type),
  KEY idx_purchase_register_approval (master_approval),
  KEY idx_purchase_register_material (material_status),
  KEY idx_purchase_register_due_date (payment_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add workflow fields to installations where the legacy flat register already exists.
SET @purchase_type_was_missing = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'finance_purchase_register'
    AND COLUMN_NAME = 'purchase_type'
) = 0;

SET @purchase_register_columns_sql = IF(
  (SELECT COUNT(*)
   FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'finance_purchase_register'
     AND COLUMN_NAME IN (
       'purchase_type', 'po_number', 'invoice_date', 'grand_total',
       'master_approval', 'master_approval_at', 'material_status',
       'material_receipt_at', 'credit_period_days', 'payment_due_date',
       'payment_status', 'po_pdf_path', 'po_pdf_name'
     )) < 13,
  CONCAT(
    'ALTER TABLE finance_purchase_register ',
    CONCAT_WS(', ',
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'purchase_type') = 0, 'ADD COLUMN purchase_type ENUM(''G'', ''WG'') NOT NULL DEFAULT ''G''', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'po_number') = 0, 'ADD COLUMN po_number VARCHAR(100) DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'invoice_date') = 0, 'ADD COLUMN invoice_date DATE DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'grand_total') = 0, 'ADD COLUMN grand_total DECIMAL(15,2) DEFAULT 0.00', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'master_approval') = 0, 'ADD COLUMN master_approval ENUM(''pending'', ''yes'', ''no'') NOT NULL DEFAULT ''pending''', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'master_approval_at') = 0, 'ADD COLUMN master_approval_at DATETIME DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'material_status') = 0, 'ADD COLUMN material_status ENUM(''not_received'', ''received'') NOT NULL DEFAULT ''not_received''', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'material_receipt_at') = 0, 'ADD COLUMN material_receipt_at DATETIME DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'credit_period_days') = 0, 'ADD COLUMN credit_period_days INT DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'payment_due_date') = 0, 'ADD COLUMN payment_due_date DATE DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'payment_status') = 0, 'ADD COLUMN payment_status ENUM(''pending'', ''partial'', ''paid'') NOT NULL DEFAULT ''pending''', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'po_pdf_path') = 0, 'ADD COLUMN po_pdf_path VARCHAR(500) DEFAULT NULL', NULL),
      IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'finance_purchase_register' AND COLUMN_NAME = 'po_pdf_name') = 0, 'ADD COLUMN po_pdf_name VARCHAR(255) DEFAULT NULL', NULL)
    )
  ),
  'SELECT 1'
);
PREPARE purchase_register_columns_stmt FROM @purchase_register_columns_sql;
EXECUTE purchase_register_columns_stmt;
DEALLOCATE PREPARE purchase_register_columns_stmt;

ALTER TABLE finance_purchase_register
  MODIFY COLUMN invoice_no VARCHAR(100) DEFAULT NULL;

SET @purchase_type_backfill_sql = IF(
  @purchase_type_was_missing,
  'UPDATE finance_purchase_register SET purchase_type = ''G''',
  'SELECT 1'
);
PREPARE purchase_type_backfill_stmt FROM @purchase_type_backfill_sql;
EXECUTE purchase_type_backfill_stmt;
DEALLOCATE PREPARE purchase_type_backfill_stmt;

UPDATE finance_purchase_register
SET po_number = COALESCE(NULLIF(po_number, ''), NULLIF(po_work_order_no, '')),
    grand_total = COALESCE(NULLIF(grand_total, 0), total_value, 0),
    material_status = CASE
      WHEN invoice_no IS NOT NULL AND TRIM(invoice_no) <> '' THEN 'received'
      ELSE material_status
    END,
    payment_status = CASE
      WHEN date_of_payment IS NOT NULL THEN 'paid'
      ELSE payment_status
    END;

CREATE TABLE IF NOT EXISTS finance_purchase_register_items (
  id INT NOT NULL AUTO_INCREMENT,
  purchase_register_id INT NOT NULL,
  description TEXT NOT NULL,
  rate DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) NOT NULL DEFAULT 0.000,
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_purchase_register_items_parent (purchase_register_id),
  CONSTRAINT fk_purchase_register_items_parent
    FOREIGN KEY (purchase_register_id) REFERENCES finance_purchase_register (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Preserve item details from the old single-line register when migrating existing rows.
INSERT INTO finance_purchase_register_items
  (purchase_register_id, description, rate, uom, quantity, line_total)
SELECT legacy.id,
       COALESCE(NULLIF(legacy.invoice_description, ''), 'Legacy purchase item'),
       COALESCE(legacy.rate, 0),
       legacy.uom,
       COALESCE(legacy.quantity, 0),
       COALESCE(legacy.rate, 0) * COALESCE(legacy.quantity, 0)
FROM finance_purchase_register legacy
LEFT JOIN finance_purchase_register_items item
  ON item.purchase_register_id = legacy.id
WHERE item.id IS NULL
  AND (legacy.invoice_description IS NOT NULL OR legacy.quantity IS NOT NULL OR legacy.rate IS NOT NULL);

CREATE TABLE IF NOT EXISTS finance_purchase_register_workflow_history (
  id INT NOT NULL AUTO_INCREMENT,
  purchase_register_id INT NOT NULL,
  action VARCHAR(40) NOT NULL,
  snapshot_json JSON NOT NULL,
  changed_by INT DEFAULT NULL,
  changed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_purchase_workflow_history_parent (purchase_register_id),
  CONSTRAINT fk_purchase_workflow_history_parent
    FOREIGN KEY (purchase_register_id) REFERENCES finance_purchase_register (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

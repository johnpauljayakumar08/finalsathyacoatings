-- Create the finance sales and material registers and their edit histories.

CREATE TABLE IF NOT EXISTS finance_sales_register (
  id INT NOT NULL AUTO_INCREMENT,
  transaction_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  invoice_no VARCHAR(100) NOT NULL,
  invoice_description TEXT DEFAULT NULL,
  rate DECIMAL(15,2) DEFAULT 0.00,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  gst DECIMAL(15,2) DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
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
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  gst DECIMAL(15,2) DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
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

CREATE TABLE IF NOT EXISTS finance_material_register (
  id INT NOT NULL AUTO_INCREMENT,
  transaction_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  dc_or_invoice ENUM('DC', 'Invoice') NOT NULL,
  dc_number VARCHAR(100) DEFAULT NULL,
  invoice_number VARCHAR(100) DEFAULT NULL,
  po_number VARCHAR(100) DEFAULT NULL,
  work_order_number VARCHAR(100) DEFAULT NULL,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  rate DECIMAL(15,2) DEFAULT 0.00,
  gst DECIMAL(15,2) DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
  finance_year_id INT NOT NULL,
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_material_register_year (finance_year_id),
  KEY idx_material_register_transaction_date (transaction_date),
  KEY idx_material_register_dc_number (dc_number),
  KEY idx_material_register_invoice_number (invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS finance_material_register_edit_history (
  id INT NOT NULL AUTO_INCREMENT,
  finance_material_register_id INT NOT NULL,
  transaction_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  dc_or_invoice ENUM('DC', 'Invoice') NOT NULL,
  dc_number VARCHAR(100) DEFAULT NULL,
  invoice_number VARCHAR(100) DEFAULT NULL,
  po_number VARCHAR(100) DEFAULT NULL,
  work_order_number VARCHAR(100) DEFAULT NULL,
  uom VARCHAR(50) DEFAULT NULL,
  quantity DECIMAL(15,3) DEFAULT 0.000,
  rate DECIMAL(15,2) DEFAULT 0.00,
  gst DECIMAL(15,2) DEFAULT 0.00,
  total_value DECIMAL(15,2) DEFAULT 0.00,
  finance_year_id INT NOT NULL,
  created_by INT DEFAULT NULL,
  changed_by INT DEFAULT NULL,
  changed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_material_register_history_parent (finance_material_register_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT IGNORE INTO sathya_dbd.finance_bank_master
  (bank_name, opening_balance, available_balance, created_by)
VALUES
  ('SCPL ICICI',    0.00, 0.00, '1'),
  ('SCPL HDFC OD',  0.00, 0.00, '1'),
  ('SCPL CUB',      0.00, 0.00, '1'),
  ('SCPL CANARA',   0.00, 0.00, '1'),
  ('SCPL SBI',      0.00, 0.00, '1'),
  ('SCPL KVB',      0.00, 0.00, '1'),
  ('SCPL KOTAK',    0.00, 0.00, '1'),
  ('SCPL HDFC CC',  0.00, 0.00, '1'),
  ('LLP CANARA',    0.00, 0.00, '1'),
  ('LLP KOTAK',     0.00, 0.00, '1'),
  ('LLP CUB',       0.00, 0.00, '1'),
  ('LLP BOB',       0.00, 0.00, '1'),
  ('SSS KOTAK',     0.00, 0.00, '1');
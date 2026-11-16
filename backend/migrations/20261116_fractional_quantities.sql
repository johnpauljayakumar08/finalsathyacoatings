-- Preserve fractional quantities throughout the active material and site workflows.
ALTER TABLE po_reckoner
  MODIFY COLUMN po_quantity DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE completion_entries_history
  MODIFY COLUMN area_added DECIMAL(15,3) NOT NULL;

ALTER TABLE completion_status
  MODIFY COLUMN area_completed DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN billed_area DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN balance_area DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE material_assign
  MODIFY COLUMN quantity DECIMAL(15,3) NOT NULL;

ALTER TABLE material_dispatch
  MODIFY COLUMN dispatch_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_a_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_b_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_c_qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE material_acknowledgement
  MODIFY COLUMN comp_a_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_b_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_c_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN overall_quantity DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE material_acknowledgement_history
  MODIFY COLUMN comp_a_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_b_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_c_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN overall_quantity DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE material_usage
  MODIFY COLUMN comp_a_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_b_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_c_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN overall_qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE material_usage_history
  MODIFY COLUMN comp_a_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_b_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_c_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN overall_qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE material_usage_edit_history
  MODIFY COLUMN comp_a_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_b_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN comp_c_qty DECIMAL(15,3) DEFAULT NULL,
  MODIFY COLUMN overall_qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE supply_material_assign
  MODIFY COLUMN quantity DECIMAL(15,3) NOT NULL;

ALTER TABLE supply_material_dispatch
  MODIFY COLUMN dispatch_qty DECIMAL(15,3) NOT NULL;

ALTER TABLE labour_overhead
  MODIFY COLUMN total_shifts DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE finance_siteincharge_attendance
  MODIFY COLUMN shift DECIMAL(4,1) NOT NULL;

ALTER TABLE finance_siteincharge_attendance_history
  MODIFY COLUMN shift DECIMAL(4,1) NOT NULL;

ALTER TABLE finance_creditors
  MODIFY COLUMN qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE finance_creditors_edit_history
  MODIFY COLUMN qty DECIMAL(15,3) DEFAULT NULL;


ALTER TABLE finance_billed_debtors_receivables_edit_history
  MODIFY COLUMN quantity DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE finance_scaffolding_payable
  MODIFY COLUMN qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE finance_scaffolding_payable_edit_history
  MODIFY COLUMN qty DECIMAL(15,3) DEFAULT NULL;

ALTER TABLE finance_billed_debtors_receivables
  MODIFY COLUMN quantity DECIMAL(15,3) DEFAULT NULL;

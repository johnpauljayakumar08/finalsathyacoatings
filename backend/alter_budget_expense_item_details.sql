ALTER TABLE actual_budget_history
  ADD COLUMN item_description VARCHAR(255) NULL AFTER remarks,
  ADD COLUMN uom VARCHAR(50) NULL AFTER item_description,
  ADD COLUMN quantity DECIMAL(15,3) NULL AFTER uom,
  ADD COLUMN rate DECIMAL(15,2) NULL AFTER quantity;

ALTER TABLE actual_budget_edit_history
  ADD COLUMN item_description VARCHAR(255) NULL AFTER remarks,
  ADD COLUMN uom VARCHAR(50) NULL AFTER item_description,
  ADD COLUMN quantity DECIMAL(15,3) NULL AFTER uom,
  ADD COLUMN rate DECIMAL(15,2) NULL AFTER quantity;

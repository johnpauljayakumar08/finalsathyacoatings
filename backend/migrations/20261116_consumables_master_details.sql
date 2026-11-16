ALTER TABLE resource_consumables
  ADD COLUMN part_no VARCHAR(100) NULL AFTER consumable_name,
  ADD COLUMN unit VARCHAR(50) NULL AFTER part_no,
  ADD COLUMN quantity DECIMAL(15,3) NULL AFTER unit,
  ADD COLUMN rate DECIMAL(15,2) NULL AFTER quantity,
  ADD COLUMN `value` DECIMAL(15,2) NULL AFTER rate,
  ADD COLUMN site VARCHAR(255) NULL AFTER `value`;

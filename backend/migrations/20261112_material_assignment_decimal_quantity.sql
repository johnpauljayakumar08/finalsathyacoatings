USE sathya_dbd;

ALTER TABLE material_assign
  MODIFY COLUMN quantity DECIMAL(10,2) NOT NULL;

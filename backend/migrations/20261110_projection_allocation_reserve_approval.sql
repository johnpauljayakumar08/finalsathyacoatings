-- Apply 20261105_projection_allocation_edit_history.sql first.
-- Run this once against an existing projection_allocation_edit_history table.
ALTER TABLE projection_allocation_edit_history
  ADD COLUMN approved_by VARCHAR(30) DEFAULT NULL AFTER changed_by,
  ADD COLUMN reserved_fund_change DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER approved_by;

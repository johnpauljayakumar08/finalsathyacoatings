SET @assignment_mode_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'siteincharge_assign'
    AND column_name = 'assignment_mode'
);
SET @add_assignment_mode = IF(
  @assignment_mode_exists = 0,
  'ALTER TABLE siteincharge_assign
   ADD COLUMN assignment_mode VARCHAR(20) NOT NULL DEFAULT ''in_person''',
  'SELECT 1'
);
PREPARE add_assignment_mode_stmt FROM @add_assignment_mode;
EXECUTE add_assignment_mode_stmt;
DEALLOCATE PREPARE add_assignment_mode_stmt;

SET @branch_nullable = (
  SELECT IS_NULLABLE = 'YES'
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'labour'
    AND column_name = 'branch'
);
SET @modify_labour_branch = IF(
  COALESCE(@branch_nullable, 0) = 0,
  'ALTER TABLE labour MODIFY COLUMN branch VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE modify_labour_branch_stmt FROM @modify_labour_branch;
EXECUTE modify_labour_branch_stmt;
DEALLOCATE PREPARE modify_labour_branch_stmt;

SET @department_nullable = (
  SELECT IS_NULLABLE = 'YES'
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'labour'
    AND column_name = 'dept_id'
);
SET @modify_labour_department = IF(
  COALESCE(@department_nullable, 0) = 0,
  'ALTER TABLE labour MODIFY COLUMN dept_id INT NULL',
  'SELECT 1'
);
PREPARE modify_labour_department_stmt FROM @modify_labour_department;
EXECUTE modify_labour_department_stmt;
DEALLOCATE PREPARE modify_labour_department_stmt;

SET @aadhaar_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'labour'
    AND column_name = 'aadhaar_number'
);
SET @add_aadhaar_column = IF(
  @aadhaar_column_exists = 0,
  'ALTER TABLE labour ADD COLUMN aadhaar_number CHAR(12) NULL',
  'SELECT 1'
);
PREPARE add_aadhaar_column_stmt FROM @add_aadhaar_column;
EXECUTE add_aadhaar_column_stmt;
DEALLOCATE PREPARE add_aadhaar_column_stmt;

SET @site_engineer_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'labour'
    AND column_name = 'site_engineer_emp_id'
);
SET @add_site_engineer_column = IF(
  @site_engineer_column_exists = 0,
  'ALTER TABLE labour ADD COLUMN site_engineer_emp_id VARCHAR(30) NULL',
  'SELECT 1'
);
PREPARE add_site_engineer_column_stmt FROM @add_site_engineer_column;
EXECUTE add_site_engineer_column_stmt;
DEALLOCATE PREPARE add_site_engineer_column_stmt;

SET @site_engineer_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'labour'
    AND index_name = 'idx_labour_site_engineer_emp_id'
);
SET @add_site_engineer_index = IF(
  @site_engineer_index_exists = 0,
  'CREATE INDEX idx_labour_site_engineer_emp_id ON labour (site_engineer_emp_id)',
  'SELECT 1'
);
PREPARE add_site_engineer_index_stmt FROM @add_site_engineer_index;
EXECUTE add_site_engineer_index_stmt;
DEALLOCATE PREPARE add_site_engineer_index_stmt;

SET @site_engineer_fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'labour'
    AND constraint_name = 'fk_labour_site_engineer'
    AND constraint_type = 'FOREIGN KEY'
);
SET @add_site_engineer_fk = IF(
  @site_engineer_fk_exists = 0,
  'ALTER TABLE labour
   ADD CONSTRAINT fk_labour_site_engineer
   FOREIGN KEY (site_engineer_emp_id) REFERENCES employee_master (emp_id)
   ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE add_site_engineer_fk_stmt FROM @add_site_engineer_fk;
EXECUTE add_site_engineer_fk_stmt;
DEALLOCATE PREPARE add_site_engineer_fk_stmt;


ALTER TABLE labour
  MODIFY COLUMN branch VARCHAR(255) NULL,
  MODIFY COLUMN dept_id INT NULL,
  ADD COLUMN aadhaar_number CHAR(12) NULL,
  ADD COLUMN site_engineer_emp_id VARCHAR(30) NULL;

CREATE INDEX idx_labour_site_engineer_emp_id
  ON labour (site_engineer_emp_id);

ALTER TABLE labour
  ADD CONSTRAINT fk_labour_site_engineer
  FOREIGN KEY (site_engineer_emp_id)
  REFERENCES employee_master (emp_id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
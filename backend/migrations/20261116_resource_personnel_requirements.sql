SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master' AND COLUMN_NAME = 'aadhaar_number') = 0,
  'ALTER TABLE employee_master ADD COLUMN aadhaar_number CHAR(12) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master' AND COLUMN_NAME = 'bank_account_number') = 0,
  'ALTER TABLE employee_master ADD COLUMN bank_account_number VARCHAR(34) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master' AND COLUMN_NAME = 'bank_account_holder_name') = 0,
  'ALTER TABLE employee_master ADD COLUMN bank_account_holder_name VARCHAR(150) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master' AND COLUMN_NAME = 'bank_name') = 0,
  'ALTER TABLE employee_master ADD COLUMN bank_name VARCHAR(150) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master' AND COLUMN_NAME = 'bank_ifsc_code') = 0,
  'ALTER TABLE employee_master ADD COLUMN bank_ifsc_code VARCHAR(11) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master' AND COLUMN_NAME = 'bank_branch') = 0,
  'ALTER TABLE employee_master ADD COLUMN bank_branch VARCHAR(150) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee_master'
     AND COLUMN_NAME = 'dept_id' AND IS_NULLABLE = 'NO') > 0,
  'ALTER TABLE employee_master MODIFY COLUMN dept_id INT NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labour' AND COLUMN_NAME = 'team_name') = 0,
  'ALTER TABLE labour ADD COLUMN team_name VARCHAR(100) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labour' AND COLUMN_NAME = 'father_guardian_name') = 0,
  'ALTER TABLE labour ADD COLUMN father_guardian_name VARCHAR(150) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_column_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labour' AND COLUMN_NAME = 'father_guardian_mobile') = 0,
  'ALTER TABLE labour ADD COLUMN father_guardian_mobile VARCHAR(15) NULL',
  'SELECT 1'
);
PREPARE resource_column_stmt FROM @resource_column_sql;
EXECUTE resource_column_stmt;
DEALLOCATE PREPARE resource_column_stmt;

SET @resource_team_sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labour_team_members') > 0,
  'UPDATE labour team_head
   JOIN (SELECT DISTINCT head_labour_id FROM labour_team_members) mapped
     ON mapped.head_labour_id = team_head.id
   SET team_head.team_name = team_head.full_name
   WHERE team_head.team_name IS NULL OR LENGTH(TRIM(team_head.team_name)) = 0',
  'SELECT 1'
);
PREPARE resource_team_stmt FROM @resource_team_sql;
EXECUTE resource_team_stmt;
DEALLOCATE PREPARE resource_team_stmt;

SET @resource_team_sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labour_team_members') > 0,
  'UPDATE labour team_member
   JOIN labour_team_members mapped ON mapped.member_labour_id = team_member.id
   JOIN labour team_head ON team_head.id = mapped.head_labour_id
   SET team_member.team_name = team_head.full_name
   WHERE team_member.team_name IS NULL OR LENGTH(TRIM(team_member.team_name)) = 0',
  'SELECT 1'
);
PREPARE resource_team_stmt FROM @resource_team_sql;
EXECUTE resource_team_stmt;
DEALLOCATE PREPARE resource_team_stmt;

INSERT INTO employment_type (type)
SELECT 'Labor'
WHERE NOT EXISTS (SELECT 1 FROM employment_type WHERE LOWER(type) = 'labor');

INSERT INTO employment_type (type)
SELECT 'Engineer'
WHERE NOT EXISTS (SELECT 1 FROM employment_type WHERE LOWER(type) = 'engineer');

INSERT INTO employment_type (type)
SELECT 'Office Staff'
WHERE NOT EXISTS (SELECT 1 FROM employment_type WHERE LOWER(type) = 'office staff');

INSERT INTO employment_type (type)
SELECT 'Factory Staff'
WHERE NOT EXISTS (SELECT 1 FROM employment_type WHERE LOWER(type) = 'factory staff');

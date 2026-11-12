USE sathya_dbd;

ALTER TABLE labour_attendance
  ADD COLUMN shift_cost DECIMAL(10,2) NULL;

ALTER TABLE labour_attendance_edit_history
  ADD COLUMN shift_cost DECIMAL(10,2) NULL;

CREATE TABLE IF NOT EXISTS labour_team_members (
  head_labour_id INT NOT NULL,
  member_labour_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (head_labour_id, member_labour_id),
  UNIQUE KEY uq_labour_team_member (member_labour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add rider review audit metadata for admin approval workflow.

ALTER TABLE riders
  ADD COLUMN reviewed_by INT NULL AFTER approval_status,
  ADD COLUMN reviewed_at TIMESTAMP NULL AFTER reviewed_by,
  ADD COLUMN review_note TEXT NULL AFTER reviewed_at,
  ADD CONSTRAINT fk_riders_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
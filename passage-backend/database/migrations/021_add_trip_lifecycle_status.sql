-- Separate an accepted assignment from a trip that has passed pickup
-- verification and actually started.

ALTER TABLE trips
  MODIFY COLUMN start_time TIMESTAMP NULL,
  MODIFY COLUMN status ENUM('awaiting_pickup', 'active', 'completed', 'cancelled') DEFAULT 'awaiting_pickup';

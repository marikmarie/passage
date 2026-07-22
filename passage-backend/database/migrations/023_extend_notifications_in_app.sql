ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS type VARCHAR(100) NOT NULL DEFAULT 'general' AFTER body,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL AFTER type;

ALTER TABLE notifications
  MODIFY COLUMN channel ENUM('in_app', 'push', 'sms', 'email') NOT NULL DEFAULT 'in_app',
  MODIFY COLUMN sent_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_at);

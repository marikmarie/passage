-- Persist verification tokens so pickup/drop-off credentials are truly
-- single-use instead of only signed and short-lived.

CREATE TABLE IF NOT EXISTS watch_verification_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  device_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_watch_token_lookup (trip_id, device_id, expires_at, used_at)
);

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  rider_id INT,
  type ENUM('SOS', 'geofence_entry', 'geofence_exit', 'low_battery', 'offline') NOT NULL,
  message TEXT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE SET NULL
);

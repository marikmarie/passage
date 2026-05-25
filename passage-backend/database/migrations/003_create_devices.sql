CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rider_id INT UNIQUE, -- Can be NULL if not yet assigned to a rider
  imei VARCHAR(50) UNIQUE NOT NULL,
  sim_number VARCHAR(50),
  firmware_version VARCHAR(50),
  battery_level INT DEFAULT 100,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'inactive',
  last_online_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE SET NULL
);

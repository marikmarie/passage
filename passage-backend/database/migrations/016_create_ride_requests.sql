CREATE TABLE IF NOT EXISTS rider_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rider_id INT NOT NULL UNIQUE,
  vehicle_type ENUM('boda', 'tuktuk') NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE,
  INDEX idx_vehicle_availability (vehicle_type, is_available),
  INDEX idx_last_seen_at (last_seen_at)
);

CREATE TABLE IF NOT EXISTS ride_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT NOT NULL,
  kid_id INT NOT NULL,
  device_id INT NULL,
  requested_vehicle_type ENUM('boda', 'tuktuk') NOT NULL,
  journey_type ENUM('morning_to_school', 'afternoon_return', 'custom') DEFAULT 'custom',
  pickup_label VARCHAR(255) NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  destination_label VARCHAR(255) NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  status ENUM('pending_assignment', 'assigned', 'accepted', 'rider_declined', 'cancelled', 'in_transit', 'completed') DEFAULT 'pending_assignment',
  assigned_rider_id INT NULL,
  assigned_at TIMESTAMP NULL,
  accepted_at TIMESTAMP NULL,
  declined_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kid_id) REFERENCES kids(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_rider_id) REFERENCES riders(id) ON DELETE SET NULL,
  INDEX idx_parent_status (parent_user_id, status),
  INDEX idx_rider_status (assigned_rider_id, status),
  INDEX idx_vehicle_status (requested_vehicle_type, status),
  INDEX idx_created_at (created_at)
);

ALTER TABLE trips
  ADD COLUMN ride_request_id INT NULL,
  ADD INDEX idx_trips_ride_request_id (ride_request_id),
  ADD CONSTRAINT fk_trips_ride_request_id FOREIGN KEY (ride_request_id) REFERENCES ride_requests(id) ON DELETE SET NULL;
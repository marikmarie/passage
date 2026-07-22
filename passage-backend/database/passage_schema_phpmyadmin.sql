-- PASSAGE clean schema import for phpMyAdmin
-- Generated to avoid duplicate legacy migration issues.
-- Use on an empty database, or drop existing partial tables first.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS geofences;
DROP TABLE IF EXISTS tracking_logs;
DROP TABLE IF EXISTS watch_verification_tokens;
DROP TABLE IF EXISTS ride_requests;
DROP TABLE IF EXISTS rider_availability;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS kids;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS riders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS schema_migrations;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NULL,
  phone_number VARCHAR(50) UNIQUE NULL,
  password_hash VARCHAR(255) NULL,
  role ENUM('parent', 'support', 'admin', 'rider') DEFAULT 'parent',
  otp_code VARCHAR(10) NULL,
  otp_expires_at DATETIME NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE riders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  parent_user_id INT NULL,
  school VARCHAR(255) NULL,
  grade VARCHAR(50) NULL,
  full_name VARCHAR(255) NULL,
  date_of_birth VARCHAR(20) NULL,
  nationality VARCHAR(100) NULL,
  national_id_number VARCHAR(100) NULL,
  national_id_front_url VARCHAR(500) NULL,
  national_id_back_url VARCHAR(500) NULL,
  profile_photo_url VARCHAR(500) NULL,
  residential_area VARCHAR(255) NULL,
  stage_association VARCHAR(255) NULL,
  driving_licence_number VARCHAR(100) NULL,
  permit_number VARCHAR(100) NULL,
  licence_expiry_date VARCHAR(20) NULL,
  years_of_riding INT NULL,
  authorised_vehicle_class VARCHAR(100) NULL,
  vehicle_type ENUM('boda', 'tuktuk') NULL,
  number_plate VARCHAR(50) NULL,
  ownership_status VARCHAR(100) NULL,
  insurance_info VARCHAR(255) NULL,
  insurance_expiry_date VARCHAR(20) NULL,
  verification_consent_accepted BOOLEAN DEFAULT FALSE,
  training_accepted BOOLEAN DEFAULT FALSE,
  safeguarding_accepted BOOLEAN DEFAULT FALSE,
  approval_status ENUM('draft', 'pending_review', 'approved', 'rejected', 'suspended') DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_riders_user_id (user_id),
  INDEX idx_riders_approval_status (approval_status),
  INDEX idx_riders_reviewed_by (reviewed_by),
  INDEX idx_riders_vehicle_type (vehicle_type)
);

CREATE TABLE devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imei VARCHAR(50) UNIQUE NOT NULL,
  sim_number VARCHAR(50),
  firmware_version VARCHAR(50),
  battery_level INT DEFAULT 100,
  device_token VARCHAR(255),
  status ENUM('active', 'inactive', 'maintenance', 'lost', 'damaged', 'offline') DEFAULT 'inactive',
  current_state ENUM('IDLE_READY', 'RIDE_ASSIGNED', 'DRIVER_NEARBY', 'AWAITING_VERIFICATION', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'DROPOFF_CONFIRMED', 'SOS_ACTIVE', 'LOW_BATTERY', 'OFFLINE') DEFAULT 'IDLE_READY',
  last_online_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE kids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT NOT NULL,
  device_id INT NULL,
  name VARCHAR(255) NOT NULL,
  age INT,
  school VARCHAR(255),
  grade VARCHAR(50),
  date_of_birth DATE NULL,
  gender VARCHAR(50) NULL,
  home_location VARCHAR(255) NULL,
  home_lat DECIMAL(10, 8) NULL,
  home_lng DECIMAL(11, 8) NULL,
  school_location VARCHAR(255) NULL,
  school_lat DECIMAL(10, 8) NULL,
  school_lng DECIMAL(11, 8) NULL,
  morning_pickup_time VARCHAR(50) NULL,
  afternoon_return_time VARCHAR(50) NULL,
  pickup_notes TEXT NULL,
  emergency_contact_name VARCHAR(255) NULL,
  emergency_contact_relationship VARCHAR(100) NULL,
  emergency_contact_phone VARCHAR(50) NULL,
  guardian_name VARCHAR(255) NULL,
  guardian_relationship VARCHAR(100) NULL,
  guardian_phone VARCHAR(50) NULL,
  allow_live_tracking BOOLEAN DEFAULT TRUE,
  safety_consent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
  INDEX idx_parent_user_id (parent_user_id),
  INDEX idx_device_id (device_id)
);

CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rider_id INT NOT NULL,
  device_id INT NOT NULL,
  ride_request_id INT NULL,
  start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    distance_km DECIMAL(6, 2) DEFAULT 0,
    fare_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('awaiting_pickup', 'active', 'completed', 'cancelled') DEFAULT 'awaiting_pickup',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_ride_request_id (ride_request_id)
);

CREATE TABLE rider_availability (
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

CREATE TABLE ride_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT NOT NULL,
  kid_id INT NOT NULL,
  device_id INT NULL,
  assigned_rider_id INT NULL,
    requested_vehicle_type ENUM('boda', 'tuktuk') NOT NULL,
    fare_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  journey_type ENUM('morning_to_school', 'afternoon_return', 'custom') DEFAULT 'custom',
  pickup_label VARCHAR(255) NOT NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  destination_label VARCHAR(255) NOT NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  status ENUM('pending_assignment', 'assigned', 'accepted', 'rider_declined', 'cancelled', 'in_transit', 'completed') DEFAULT 'pending_assignment',
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
  ADD CONSTRAINT fk_trips_ride_request_id FOREIGN KEY (ride_request_id) REFERENCES ride_requests(id) ON DELETE SET NULL;

CREATE TABLE watch_verification_tokens (
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

CREATE TABLE tracking_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  speed DECIMAL(8, 2) DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_tracking_device_time (device_id, timestamp),
  INDEX idx_tracking_timestamp (timestamp)
);

CREATE TABLE geofences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  radius_meters INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  rider_id INT NULL,
  type ENUM('SOS', 'LOW_BATTERY', 'GEOFENCE_EXIT', 'GEOFENCE_ENTER', 'DELAY', 'INFO') NOT NULL,
  message TEXT,
  status ENUM('open', 'acknowledged', 'resolved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE SET NULL
);

  CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    type VARCHAR(100) NOT NULL DEFAULT 'general',
    read_at TIMESTAMP NULL,
    channel ENUM('in_app', 'push', 'sms', 'email') NOT NULL DEFAULT 'in_app',
    sent_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, read_at)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
    provider VARCHAR(50) DEFAULT 'collecto',
    reference VARCHAR(255) UNIQUE,
    provider_ref VARCHAR(255),
    phone VARCHAR(30),
    description VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_payments_user_id (user_id),
  INDEX idx_payments_status (status)
  );

  CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    currency VARCHAR(10) NOT NULL DEFAULT 'UGX',
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    user_id INT NOT NULL,
    payment_id INT NULL,
    direction ENUM('credit', 'debit') NOT NULL,
    type ENUM('topup', 'fare', 'earning', 'payout', 'refund', 'adjustment') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'reversed') NOT NULL DEFAULT 'completed',
    reference VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_wallet_transactions_user (user_id, created_at),
    INDEX idx_wallet_transactions_wallet (wallet_id, created_at)
  );

  CREATE TABLE payout_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rider_user_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    provider ENUM('mtn', 'airtel') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    reference VARCHAR(255) NOT NULL UNIQUE,
    provider_ref VARCHAR(255),
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (rider_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payout_rider_status (rider_user_id, status)
  );

CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  payment_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_subscriptions_user_id (user_id),
  INDEX idx_subscriptions_end_date (end_date)
);

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (filename) VALUES
  ('001_create_users.sql'),
  ('002_create_riders.sql'),
  ('003_create_devices.sql'),
  ('004_create_tracking.sql'),
  ('004_create_tracking_logs.sql'),
  ('005_create_trips.sql'),
  ('006_create_geofences.sql'),
  ('007_create_alerts.sql'),
  ('008_create_notifications.sql'),
  ('008_create_payments.sql'),
  ('009_create_payments.sql'),
  ('010_create_subscriptions.sql'),
  ('011_create_audit_logs.sql'),
  ('013_add_phone_number_and_otp_to_users.sql'),
  ('015_create_kids.sql'),
  ('016_create_ride_requests.sql'),
  ('017_extend_kids_safety_profile.sql'),
  ('018_extend_riders_compliance_profile.sql'),
('019_add_rider_document_metadata.sql'),
('020_add_rider_review_audit.sql'),
('021_add_trip_lifecycle_status.sql'),
('022_add_watch_verification_tokens.sql'),
('023_extend_notifications_in_app.sql'),
('024_add_wallets_and_payment_tracking.sql');

-- PASSAGE canonical MySQL schema
-- Import this single file into an empty MySQL database before running the PHP application.
-- Every physical table intentionally uses the tbl_ prefix.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS tbl_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL UNIQUE,
  phone_number VARCHAR(50) NULL UNIQUE,
  alternative_phone_number VARCHAR(50) NULL,
  national_id_number VARCHAR(100) NULL,
  password_hash VARCHAR(255) NULL,
  role ENUM('parent', 'support', 'admin', 'rider') NOT NULL DEFAULT 'parent',
  otp_code VARCHAR(10) NULL,
  otp_expires_at DATETIME NULL,
  terms_accepted_at TIMESTAMP NULL,
  privacy_consent_at TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_riders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  parent_user_id INT UNSIGNED NULL,
  school VARCHAR(255) NULL,
  grade VARCHAR(50) NULL,
  full_name VARCHAR(255) NULL,
  date_of_birth VARCHAR(20) NULL,
  nationality VARCHAR(100) NULL,
  national_id_number VARCHAR(100) NULL,
  national_id_front_url VARCHAR(500) NULL,
  national_id_back_url VARCHAR(500) NULL,
  profile_photo_url VARCHAR(500) NULL,
  driving_licence_image_url VARCHAR(500) NULL,
  residential_area VARCHAR(255) NULL,
  stage_association VARCHAR(255) NULL,
  driving_licence_number VARCHAR(100) NULL,
  permit_number VARCHAR(100) NULL,
  licence_expiry_date VARCHAR(20) NULL,
  years_of_riding INT NULL,
  authorised_vehicle_class VARCHAR(100) NULL,
  vehicle_type ENUM('boda', 'tuktuk') NULL,
  number_plate VARCHAR(50) NULL,
  permit_image_url VARCHAR(500) NULL,
  vehicle_photo_url VARCHAR(500) NULL,
  ownership_status VARCHAR(100) NULL,
  insurance_info VARCHAR(255) NULL,
  insurance_expiry_date VARCHAR(20) NULL,
  verification_consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  training_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  safeguarding_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  approval_status ENUM('draft', 'pending_review', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'draft',
  reviewed_by INT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  review_note TEXT NULL,
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_riders_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_riders_parent FOREIGN KEY (parent_user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_riders_reviewer FOREIGN KEY (reviewed_by) REFERENCES tbl_users(id) ON DELETE SET NULL,
  INDEX idx_tbl_riders_user (user_id),
  INDEX idx_tbl_riders_approval (approval_status),
  INDEX idx_tbl_riders_reviewer (reviewed_by),
  INDEX idx_tbl_riders_vehicle (vehicle_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_devices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  imei VARCHAR(50) NOT NULL UNIQUE,
  sim_number VARCHAR(50) NULL,
  firmware_version VARCHAR(50) NULL,
  battery_level INT NOT NULL DEFAULT 100,
  device_token VARCHAR(255) NULL,
  status ENUM('active', 'inactive', 'maintenance', 'lost', 'damaged', 'offline') NOT NULL DEFAULT 'inactive',
  current_state ENUM('IDLE_READY', 'RIDE_ASSIGNED', 'DRIVER_NEARBY', 'AWAITING_VERIFICATION', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'DROPOFF_CONFIRMED', 'SOS_ACTIVE', 'LOW_BATTERY', 'OFFLINE') NOT NULL DEFAULT 'IDLE_READY',
  last_online_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_kids (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT UNSIGNED NOT NULL,
  device_id INT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  age INT NULL,
  school VARCHAR(255) NULL,
  grade VARCHAR(50) NULL,
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
  allow_live_tracking BOOLEAN NOT NULL DEFAULT TRUE,
  safety_consent_at TIMESTAMP NULL,
  passport_photo_url VARCHAR(500) NULL,
  school_document_url VARCHAR(500) NULL,
  school_document_unavailable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_kids_parent FOREIGN KEY (parent_user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_kids_device FOREIGN KEY (device_id) REFERENCES tbl_devices(id) ON DELETE SET NULL,
  INDEX idx_tbl_kids_parent (parent_user_id),
  INDEX idx_tbl_kids_device (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_rider_availability (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rider_id INT UNSIGNED NOT NULL UNIQUE,
  vehicle_type ENUM('boda', 'tuktuk') NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_rider_availability_rider FOREIGN KEY (rider_id) REFERENCES tbl_riders(id) ON DELETE CASCADE,
  INDEX idx_tbl_rider_availability_vehicle (vehicle_type, is_available),
  INDEX idx_tbl_rider_availability_seen (last_seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_ride_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT UNSIGNED NOT NULL,
  kid_id INT UNSIGNED NOT NULL,
  device_id INT UNSIGNED NULL,
  assigned_rider_id INT UNSIGNED NULL,
  requested_vehicle_type ENUM('boda', 'tuktuk') NOT NULL,
  fare_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  journey_type ENUM('morning_to_school', 'afternoon_return', 'custom') NOT NULL DEFAULT 'custom',
  pickup_label VARCHAR(255) NOT NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  destination_label VARCHAR(255) NOT NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  status ENUM('pending_assignment', 'assigned', 'accepted', 'rider_declined', 'cancelled', 'in_transit', 'completed') NOT NULL DEFAULT 'pending_assignment',
  assigned_at TIMESTAMP NULL,
  accepted_at TIMESTAMP NULL,
  declined_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_ride_requests_parent FOREIGN KEY (parent_user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_ride_requests_kid FOREIGN KEY (kid_id) REFERENCES tbl_kids(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_ride_requests_device FOREIGN KEY (device_id) REFERENCES tbl_devices(id) ON DELETE SET NULL,
  CONSTRAINT fk_tbl_ride_requests_rider FOREIGN KEY (assigned_rider_id) REFERENCES tbl_riders(id) ON DELETE SET NULL,
  INDEX idx_tbl_ride_requests_parent_status (parent_user_id, status),
  INDEX idx_tbl_ride_requests_rider_status (assigned_rider_id, status),
  INDEX idx_tbl_ride_requests_vehicle_status (requested_vehicle_type, status),
  INDEX idx_tbl_ride_requests_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_trips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rider_id INT UNSIGNED NOT NULL,
  device_id INT UNSIGNED NOT NULL,
  ride_request_id INT UNSIGNED NULL,
  start_time TIMESTAMP NULL,
  end_time TIMESTAMP NULL,
  distance_km DECIMAL(6, 2) NOT NULL DEFAULT 0,
  fare_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('awaiting_pickup', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'awaiting_pickup',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_trips_rider FOREIGN KEY (rider_id) REFERENCES tbl_riders(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_trips_device FOREIGN KEY (device_id) REFERENCES tbl_devices(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_trips_ride_request FOREIGN KEY (ride_request_id) REFERENCES tbl_ride_requests(id) ON DELETE SET NULL,
  INDEX idx_tbl_trips_ride_request (ride_request_id),
  INDEX idx_tbl_trips_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_watch_verification_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  device_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_watch_tokens_trip FOREIGN KEY (trip_id) REFERENCES tbl_trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_watch_tokens_device FOREIGN KEY (device_id) REFERENCES tbl_devices(id) ON DELETE CASCADE,
  INDEX idx_tbl_watch_tokens_lookup (trip_id, device_id, expires_at, used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_tracking_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id INT UNSIGNED NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2) NULL,
  speed DECIMAL(8, 2) NOT NULL DEFAULT 0,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_tracking_logs_device FOREIGN KEY (device_id) REFERENCES tbl_devices(id) ON DELETE CASCADE,
  INDEX idx_tbl_tracking_logs_device_time (device_id, timestamp),
  INDEX idx_tbl_tracking_logs_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_geofences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_user_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  radius_meters INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_geofences_parent FOREIGN KEY (parent_user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  INDEX idx_tbl_geofences_parent (parent_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_alerts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id INT UNSIGNED NOT NULL,
  rider_id INT UNSIGNED NULL,
  type ENUM('SOS', 'LOW_BATTERY', 'GEOFENCE_EXIT', 'GEOFENCE_ENTER', 'DELAY', 'INFO') NOT NULL,
  message TEXT NULL,
  status ENUM('open', 'acknowledged', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_alerts_device FOREIGN KEY (device_id) REFERENCES tbl_devices(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_alerts_rider FOREIGN KEY (rider_id) REFERENCES tbl_riders(id) ON DELETE SET NULL,
  INDEX idx_tbl_alerts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NULL,
  type VARCHAR(100) NOT NULL DEFAULT 'general',
  read_at TIMESTAMP NULL,
  channel ENUM('in_app', 'push', 'sms', 'email') NOT NULL DEFAULT 'in_app',
  sent_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_notifications_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  INDEX idx_tbl_notifications_user_read (user_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'UGX',
  provider VARCHAR(50) NOT NULL DEFAULT 'collecto',
  reference VARCHAR(255) NULL UNIQUE,
  provider_ref VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  description VARCHAR(255) NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_payments_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  INDEX idx_tbl_payments_user (user_id),
  INDEX idx_tbl_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_wallets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  currency VARCHAR(10) NOT NULL DEFAULT 'UGX',
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_wallets_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_wallet_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wallet_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  payment_id INT UNSIGNED NULL,
  direction ENUM('credit', 'debit') NOT NULL,
  type ENUM('topup', 'fare', 'earning', 'payout', 'refund', 'adjustment') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'reversed') NOT NULL DEFAULT 'completed',
  reference VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES tbl_wallets(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_wallet_transactions_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_wallet_transactions_payment FOREIGN KEY (payment_id) REFERENCES tbl_payments(id) ON DELETE SET NULL,
  INDEX idx_tbl_wallet_transactions_user (user_id, created_at),
  INDEX idx_tbl_wallet_transactions_wallet (wallet_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_payout_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rider_user_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  provider ENUM('mtn', 'airtel') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  reference VARCHAR(255) NOT NULL UNIQUE,
  provider_ref VARCHAR(255) NULL,
  failure_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_tbl_payout_requests_rider FOREIGN KEY (rider_user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  INDEX idx_tbl_payout_requests_rider_status (rider_user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_subscriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  plan ENUM('free', 'basic', 'premium', 'enterprise') NOT NULL DEFAULT 'free',
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  payment_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_subscriptions_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tbl_subscriptions_payment FOREIGN KEY (payment_id) REFERENCES tbl_payments(id) ON DELETE SET NULL,
  INDEX idx_tbl_subscriptions_user (user_id),
  INDEX idx_tbl_subscriptions_end (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id INT UNSIGNED NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tbl_audit_logs_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE SET NULL,
  INDEX idx_tbl_audit_logs_entity (entity_type, entity_id),
  INDEX idx_tbl_audit_logs_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

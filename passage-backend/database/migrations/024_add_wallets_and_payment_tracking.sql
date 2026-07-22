ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS reference VARCHAR(255) NULL AFTER provider,
  ADD COLUMN IF NOT EXISTS provider_ref VARCHAR(255) NULL AFTER reference,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER provider_ref,
  ADD COLUMN IF NOT EXISTS description VARCHAR(255) NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL AFTER status;

ALTER TABLE ride_requests
  ADD COLUMN IF NOT EXISTS fare_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER requested_vehicle_type;

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS fare_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER distance_km;

CREATE TABLE IF NOT EXISTS wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  currency VARCHAR(10) NOT NULL DEFAULT 'UGX',
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_id INT NULL,
  direction ENUM('credit', 'debit') NOT NULL,
  type ENUM('topup', 'fare', 'earning', 'payout', 'refund', 'adjustment') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'reversed') NOT NULL DEFAULT 'completed',
  reference VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_wallet_transactions_user (user_id, created_at),
  INDEX idx_wallet_transactions_wallet (wallet_id, created_at)
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rider_user_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  provider ENUM('mtn', 'airtel') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  reference VARCHAR(255) NOT NULL UNIQUE,
  provider_ref VARCHAR(255) NULL,
  failure_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (rider_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_payout_rider_status (rider_user_id, status)
);

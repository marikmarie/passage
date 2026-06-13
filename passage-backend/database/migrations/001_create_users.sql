CREATE TABLE IF NOT EXISTS users (
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

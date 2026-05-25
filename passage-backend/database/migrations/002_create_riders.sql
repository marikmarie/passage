CREATE TABLE IF NOT EXISTS riders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL, -- The rider's user account (for their app login)
  parent_user_id INT NOT NULL, -- The parent who manages them
  school VARCHAR(255),
  grade VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE
);

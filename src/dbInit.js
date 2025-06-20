const db = require('./db');

async function initializeTables() {
  try {
    // 1. Notifications Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        notifiable_id INT NOT NULL,
        notifiable_type VARCHAR(255) NOT NULL,
        type VARCHAR(255),
        data JSON,
        read_at DATETIME NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    // 2. API Clients Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS api_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        system_identifier VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    // 3. API Keys Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (client_id) REFERENCES api_clients(id) ON DELETE CASCADE
      )
    `);

    // 4. Device Tokens Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(512) NOT NULL,
        platform ENUM('android', 'ios') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    console.log('All tables are ready');
  } catch (err) {
    console.error('Failed to initialize DB tables:', err);
  }
}

module.exports = initializeTables;

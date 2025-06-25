require('dotenv').config();
const mysql = require('mysql2/promise');

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = requiredEnv.filter((key) => !process.env[key]);

// if (missing.length > 0) {
//   console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
//   process.exit(1);
// }

// Create the MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;


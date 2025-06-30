require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // On Render, SSL is required. This setting is safe for local use too.
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
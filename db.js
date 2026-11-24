// Creates one shared PostgreSQL connection pool for the whole app.
require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.warn("Warning: DATABASE_URL is not set. Add it to .env or to the host's environment settings.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false
});

// Stops an idle-connection error from crashing the server.
pool.on("error", (error) => {
  console.error("Unexpected database pool error:", error.message);
});

module.exports = pool;

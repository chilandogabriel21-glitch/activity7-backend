// Runs schema.sql then seed.sql using your DATABASE_URL. Usage: npm run db:setup
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function main() {
  for (const file of ["schema.sql", "seed.sql"]) {
    const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
    await pool.query(sql);
    console.log(`Ran ${file}`);
  }
  const result = await pool.query("SELECT COUNT(*) AS total FROM records");
  console.log(`Records in table: ${result.rows[0].total}`);
}

main()
  .catch((error) => {
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

// One-time script to bcrypt-hash all plaintext passwords in flats table
const pool = require("../db");
const bcrypt = require("bcrypt");

async function run() {
  const { rows } = await pool.query("SELECT id, password FROM flats");
  console.log(`Hashing ${rows.length} passwords...`);

  for (const row of rows) {
    // Skip already-hashed values (bcrypt hashes start with $2b$)
    if (row.password && row.password.startsWith("$2b$")) {
      console.log(`  SKIP ${row.id} (already hashed)`);
      continue;
    }
    const hashed = await bcrypt.hash(row.password || "mypassword", 10);
    await pool.query("UPDATE flats SET password = $1 WHERE id = $2", [hashed, row.id]);
    console.log(`  OK   ${row.id}`);
  }

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });

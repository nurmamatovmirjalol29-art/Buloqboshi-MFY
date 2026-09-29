import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
console.log("Havola:", connectionString ? connectionString.slice(0, 60) + "..." : "YO'Q");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000
});

pool.on("error", (err) => {
  console.error("Pool xatosi:", err.message);
});

(async () => {
  try {
    console.log("⏳ Ulanish sinovi...");
    const client = await pool.connect();
    console.log("✅ ULANISH MUVAFFAQIYATLI!");
    console.log("✅ PostgreSQL server bilan aloqa bor");

    const result = await client.query("SELECT NOW() AS vaqt, version() AS versiya");
    console.log("Server vaqti:", result.rows[0].vaqt);
    console.log("Versiya:", result.rows[0].versiya.slice(0, 60));

    client.release();
    await pool.end();
    console.log("✅ Test tugadi");
    process.exit(0);
  } catch (err) {
    console.error("❌ XATO:", err.message);
    console.error("Kod:", err.code);
    console.error("Batafsil:", err);
    await pool.end();
    process.exit(1);
  }
})();
import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString && connectionString.includes("localhost");

export const pool = new Pool({
  connectionString,
  ssl: connectionString && !isLocal
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on("error", (err) => {
  console.error("Pool xatosi:", err.message);
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      ism TEXT NOT NULL,
      email TEXT DEFAULT '',
      matn TEXT NOT NULL,
      sana TIMESTAMPTZ NOT NULL DEFAULT now(),
      approved BOOLEAN NOT NULL DEFAULT false,
      rasm TEXT DEFAULT '',
      rasm_public_id TEXT DEFAULT ''
    );
  `);
  await pool.query(`ALTER TABLE stories ADD COLUMN IF NOT EXISTS rasm_public_id TEXT DEFAULT '';`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      turi TEXT NOT NULL,
      tavsif TEXT DEFAULT '',
      manzil TEXT DEFAULT '',
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      rasm TEXT DEFAULT '',
      rasm_public_id TEXT DEFAULT ''
    );
  `);
  await pool.query(`ALTER TABLE places ADD COLUMN IF NOT EXISTS rasm_public_id TEXT DEFAULT '';`);

  console.log("✅ Ma'lumotlar bazasi jadvallari tayyor (stories, places)");
}
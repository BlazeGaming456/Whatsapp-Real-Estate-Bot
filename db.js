import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();
let client;

async function connectWithRetry(maxAttempts = 5) {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  let attempt = 0;
  const url = process.env.DATABASE_URL || "";
  const isPoolerHost = /pooler\.supabase\.com/.test(url);
  const uses5432 = /:(6543)\//.test(url);

  while (attempt < maxAttempts) {
    attempt++;
    try {
      // Close previous client if any
      if (client) {
        try {
          await client.end();
        } catch {}
      }
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      console.log("Connected to PostgreSQL!");
      return;
    } catch (error) {
      console.error(
        `DB connect attempt ${attempt} failed:`,
        error?.message || error
      );
      if (isPoolerHost && uses5432) {
        console.error(
          "Hint: Supabase pooler usually listens on port 6543. Change port to 6543 or use the non-pooler host with 5432."
        );
      }
      if (attempt >= maxAttempts) throw error;
      await delay(1000 * Math.pow(2, attempt - 1));
    }
  }
}

async function setup() {
  try {
    await connectWithRetry();

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        description TEXT,
        bhk INTEGER,
        area TEXT,
        furnished_status TEXT,
        location TEXT,
        listing_type TEXT,
        price TEXT,
        rentpermonth TEXT,
        number TEXT,
        broker_name TEXT,
        chat_group TEXT,
        links JSONB,
        created_at TIMESTAMP DEFAULT NOW()
        )
        `;

    const createImageTableQuery = `
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
    `;

    await client.query(createTableQuery);
    await client.query(createImageTableQuery);

    // Add missing broker_name column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE listings 
        ADD COLUMN IF NOT EXISTS broker_name TEXT;
      `);
    } catch (error) {
      console.log(
        "broker_name column already exists or error adding it:",
        error.message
      );
    }

    console.log("Table created or already existed!");
  } catch (error) {
    console.error("Error setting up the database:", error);
  }
}

setup();

export { client };

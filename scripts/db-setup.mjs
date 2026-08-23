import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Did you forget the .env file?");
  process.exit(1);
}

const sql = neon(connectionString);

async function applyFile(path) {
  const contents = readFileSync(path, "utf8");
  const statements = contents
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Applied ${path} (${statements.length} statements)`);
}

await applyFile("db/schema.sql");
await applyFile("db/seed.sql");

const restaurants = await sql.query("SELECT * FROM restaurants ORDER BY id");
const reviews = await sql.query("SELECT * FROM reviews ORDER BY created_at");

console.log("\nRestaurants now in the database:");
console.table(restaurants);
console.log("\nReviews now in the database:");
console.table(reviews);

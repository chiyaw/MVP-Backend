import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

console.log(process.env.DATABASE_URL)
if(!process.env.DATABASE_URL) {
  throw new Error("No Postgres URL Fount")
}

module.exports = defineConfig({
  out: './drizzle',
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
    ssl: "prefer"
  },
});

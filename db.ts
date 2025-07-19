// db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './drizzle/schema';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const db = async () => {
  await client.connect();
  return drizzle(client, { schema });
};

export default db;

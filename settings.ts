import dotenv from 'dotenv';
dotenv.config();

export const SERVER_PORT = process.env.SERVER_PORT || 3001;
export const POST_FETCH_CRON_EXPRESSION = '0 22 * * *';
export const JWT_SECRET = process.env.JWT_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const PORT = process.env.PORT;
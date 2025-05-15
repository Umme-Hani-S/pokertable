
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";
import { createClient } from '@supabase/supabase-js';

// Check for Supabase credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_KEY must be set in environment variables",
  );
}

// Create Supabase client for the storage.ts file
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Setup Drizzle ORM to work with the same database
// Extract the database URL from the Supabase URL
const databaseUrl = process.env.SUPABASE_URL;

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });


import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// This is required for the NodeJS environment
neonConfig.webSocketConstructor = ws;

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
// Use direct postgres connection string for Supabase
const databaseUrl = process.env.SUPABASE_URL;

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSchema() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be provided');
    }
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Creating schema via Supabase API...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Create enums
    console.log('Creating enum types...');
    
    // Create seat_status enum
    await executeSql(supabase, `
      CREATE TYPE seat_status AS ENUM ('Open', 'Playing', 'Break', 'Blocked', 'Closed');
    `);
    
    // Create user_role enum
    await executeSql(supabase, `
      CREATE TYPE user_role AS ENUM ('admin', 'club_owner', 'dealer');
    `);
    
    // 2. Create tables
    console.log('Creating tables...');
    
    // Users table
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        name TEXT,
        role user_role NOT NULL DEFAULT 'dealer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Clubs table
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS clubs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER REFERENCES users(id),
        max_tables INTEGER DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Tables table
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        club_id INTEGER REFERENCES clubs(id),
        dealer_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'inactive',
        game_type TEXT,
        stakes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Players table
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        club_id INTEGER REFERENCES clubs(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Table seats
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS table_seats (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        position INTEGER NOT NULL,
        status seat_status DEFAULT 'Closed',
        player_id INTEGER REFERENCES players(id),
        session_id INTEGER,
        player_name TEXT,
        time_in TIMESTAMP WITH TIME ZONE,
        time_out TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(table_id, position)
      );
    `);
    
    // Table sessions
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS table_sessions (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE,
        dealer_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Player time records
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS player_time_records (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id),
        table_id INTEGER REFERENCES tables(id),
        session_id INTEGER REFERENCES table_sessions(id),
        time_in TIMESTAMP WITH TIME ZONE,
        time_out TIMESTAMP WITH TIME ZONE,
        elapsed_time INTEGER, -- in seconds
        status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Player queue
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS player_queue (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id),
        club_id INTEGER REFERENCES clubs(id),
        table_id INTEGER REFERENCES tables(id),
        position INTEGER,
        status TEXT DEFAULT 'waiting',
        player_name TEXT NOT NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Club player limits
    await executeSql(supabase, `
      CREATE TABLE IF NOT EXISTS club_player_limits (
        id SERIAL PRIMARY KEY,
        club_id INTEGER REFERENCES clubs(id) UNIQUE,
        max_players INTEGER DEFAULT 100,
        current_players INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add the admin user
    console.log('Creating admin user...');
    await executeSql(supabase, `
      INSERT INTO users (username, password, role, name)
      VALUES ('admin', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wZZm2h6MpTuHnaN7CNpZS0ORRyziL.', 'admin', 'Administrator')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    console.log('Schema creation completed successfully!');
  } catch (error) {
    console.error('Error creating schema:');
    console.error(error);
  }
}

async function executeSql(supabase, sql) {
  try {
    console.log(`Executing SQL: ${sql.trim().substring(0, 60)}...`);
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });
    
    if (error) {
      console.error(`SQL Error: ${error.message}`);
      if (error.message.includes('already exists')) {
        console.log('Ignoring "already exists" error and continuing...');
      } else {
        throw error;
      }
    } else {
      console.log('SQL executed successfully');
    }
    
    return data;
  } catch (error) {
    console.error(`Error executing SQL: ${error.message}`);
    // Continue with other statements even if one fails
  }
}

createSchema();
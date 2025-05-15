import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // Create a PostgreSQL client
    console.log('Using DATABASE_URL from environment variables');
    
    // Extract hostname from DATABASE_URL to check if it's pointing to Supabase
    const urlMatch = process.env.DATABASE_URL.match(/\/\/([^:@\/]+)(:|@)/);
    const hostname = urlMatch ? urlMatch[1] : 'not found';
    console.log('Database hostname:', hostname);
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Supabase/Heroku PostgreSQL connections
      }
    });

    console.log('Connected to the database.');
    
    // Read the migration SQL file
    const sqlFile = path.join(process.cwd(), 'migrations-saas', '0000_hard_satana.sql');
    console.log('Reading SQL from:', sqlFile);
    
    if (!fs.existsSync(sqlFile)) {
      console.error('SQL file not found!');
      console.log('Available files in migrations-saas:');
      if (fs.existsSync(path.join(process.cwd(), 'migrations-saas'))) {
        console.log(fs.readdirSync(path.join(process.cwd(), 'migrations-saas')));
      } else {
        console.log('migrations-saas directory does not exist');
      }
      throw new Error('SQL file not found');
    }
    
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split into statements by --> statement-breakpoint
    const statements = sql.split('-->');
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Remove statement-breakpoint comment
          const cleanStatement = statement.replace('statement-breakpoint', '').trim();
          if (cleanStatement) {
            console.log(`Executing: ${cleanStatement.substring(0, 60)}...`);
            await pool.query(cleanStatement);
            console.log('Statement executed successfully.');
          }
        } catch (error) {
          console.error(`Error executing statement: ${error.message}`);
        }
      }
    }
    
    console.log('All statements executed. Migration complete!');
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to extract connection string from Supabase URL
function extractSupabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('SUPABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Extract project reference from the URL
  // Format is typically: https://[project-ref].supabase.co
  const matches = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  
  if (!matches || matches.length < 2) {
    console.error('Could not extract project reference from SUPABASE_URL');
    process.exit(1);
  }
  
  const projectRef = matches[1];
  console.log('Extracted project reference:', projectRef);
  
  // Format Supabase Postgres connection string
  // Format: postgres://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres
  // Note: We use the SUPABASE_KEY as the password for simplicity
  const password = process.env.SUPABASE_KEY || 'missing-password';
  
  const dbUrl = `postgres://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
  
  console.log(`Generated DATABASE_URL for Supabase`);
  
  // Create a .env file with the DATABASE_URL
  const envFile = join(__dirname, '..', '.env');
  writeFileSync(envFile, `DATABASE_URL=${dbUrl}\n`, 'utf8');
  
  console.log(`Wrote DATABASE_URL to .env file at ${envFile}`);
  console.log('Please export DATABASE_URL to your environment variables');
  console.log(`export DATABASE_URL='${dbUrl}'`);
  
  return dbUrl;
}

extractSupabaseConnection();
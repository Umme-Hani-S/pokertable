
#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run a command and display its output
function runCommand(command) {
  console.log(`\n> ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`\nError executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

console.log('Starting database migration for Supabase...');

// 1. Push the schema to Supabase
console.log('\n=== Step 1: Push schema to Supabase ===');
runCommand('npm run db:push');

// 2. Run the setup script to populate sample data
console.log('\n=== Step 2: Populate sample data ===');
runCommand('npx tsx scripts/db-setup.ts');

console.log('\n=== Migration completed successfully! ===');
console.log('Your Supabase database now has all the necessary tables and sample data.');
console.log('\nYou can log in with the following credentials:');
console.log('- Admin: username=admin, password=admin123');
console.log('- Club Owner: username=owner, password=owner123');
console.log('- Dealer: username=dealer, password=dealer123');

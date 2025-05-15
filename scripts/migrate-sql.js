const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Create a PostgreSQL client
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    console.log('Connected to the database.');
    
    // Read the migration SQL file
    const sqlFile = path.join(process.cwd(), 'migrations-saas', '0000_hard_satana.sql');
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
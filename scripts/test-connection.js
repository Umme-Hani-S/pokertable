import pg from 'pg';
const { Pool } = pg;

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // Parse the URL to get hostname
    const uri = new URL(process.env.DATABASE_URL);
    console.log('Host:', uri.hostname);
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('Connection pool created, attempting query...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time on database server:', result.rows[0].now);
    
    await pool.end();
  } catch (error) {
    console.error('Error connecting to database:');
    console.error(error);
  }
}

testConnection();
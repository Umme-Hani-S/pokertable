import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase API connection...');
    
    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be provided');
    }
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Using Supabase key for authentication');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to call a simple API endpoint
    console.log('Attempting to call Supabase API...');
    
    try {
      // First, check if we can connect to the REST API
      console.log('Testing health endpoint...');
      const result = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      console.log('API Status code:', result.status);
      
      if (result.ok) {
        console.log('REST API connection successful!');
      } else {
        console.error('Error connecting to REST API:', await result.text());
      }
      
      // Now try to query for users
      console.log('Testing database query via API...');
      const { data, error } = await supabase.from('users').select('*').limit(1);
      
      if (error) {
        console.error('Supabase query error:', error);
      } else {
        console.log('Supabase database query successful!');
        console.log('Response:', data);
      }
    } catch (err) {
      console.error('Error in Supabase operations:', err);
    }
  } catch (error) {
    console.error('Error testing Supabase connection:');
    console.error(error);
  }
}

testSupabaseConnection();
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Expose a pg-compatible query interface using Supabase REST
// For complex SQL, use supabase.rpc() or direct REST calls
// Also export the raw supabase client for direct use in routes

module.exports = supabase;

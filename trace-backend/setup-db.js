/**
 * TRACE — Direct PostgreSQL Setup via Supabase DB
 * Uses pg package to connect to Supabase's PostgreSQL directly
 * and run the full schema + seed
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase direct DB connection
// Password = what was set when you created the Supabase project
// Default is typically the project's "Database Password" in Settings → Database
const DB_CONFIG = {
  host: 'db.oklmvtkbjqkqirhwyzez.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD, // set via: $env:DB_PASSWORD="yourpassword"
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
};

const SCHEMA_SQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

async function setup() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📦 Running schema + seed...');
    await client.query(SCHEMA_SQL);
    console.log('✅ All tables created and seeded!\n');

    // Verify
    const result = await client.query(`
      SELECT tablename, (SELECT count(*) FROM information_schema.columns WHERE table_name = tablename::text) AS cols
      FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('districts','schemes','projects','beneficiaries','transactions','alerts','reports','payments')
      ORDER BY tablename;
    `);
    console.log('📋 Tables created:');
    result.rows.forEach(r => console.log(`   ✓ ${r.tablename}`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

setup();

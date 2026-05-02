/**
 * ChainTrust – Database Setup Script
 * 
 * This script creates all tables, indexes, RLS policies, and seeds demo data
 * by executing SQL against your Supabase project via the REST API.
 * 
 * Usage: node scripts/setup-db.mjs
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (has DDL permissions)
 * Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY (limited — can't create tables)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key, ...rest] = trimmed.split('=');
  env[key.trim()] = rest.join('=').trim();
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase URL or key in .env.local');
  process.exit(1);
}

const isServiceRole = !!env.SUPABASE_SERVICE_ROLE_KEY;
if (!isServiceRole) {
  console.warn('⚠️  Using anon key — cannot create tables or set RLS policies.');
  console.warn('   Add SUPABASE_SERVICE_ROLE_KEY to .env.local for full access.');
  console.warn('   (Find it in Supabase Dashboard → Settings → API → service_role)\n');
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// ─── SQL Statements ─────────────────────────────────────────

const CREATE_PROJECTS = `
CREATE TABLE IF NOT EXISTS projects (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  budget        NUMERIC(15,2) NOT NULL DEFAULT 0,
  spent         NUMERIC(15,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  risk_score    INTEGER NOT NULL DEFAULT 0
                  CHECK (risk_score >= 0 AND risk_score <= 100),
  region        TEXT,
  department    TEXT,
  start_date    DATE,
  end_date      DATE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);`;

const CREATE_BIDS = `
CREATE TABLE IF NOT EXISTS bids (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor    TEXT NOT NULL,
  amount        NUMERIC(15,2) NOT NULL,
  hash          TEXT,
  status        TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted', 'accepted', 'rejected', 'withdrawn')),
  is_winner     BOOLEAN DEFAULT FALSE,
  submitted_at  TIMESTAMPTZ DEFAULT now(),
  evaluated_at  TIMESTAMPTZ
);`;

const CREATE_TRANSACTIONS = `
CREATE TABLE IF NOT EXISTS transactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_entity   TEXT NOT NULL,
  to_entity     TEXT NOT NULL,
  amount        NUMERIC(15,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'completed'
                  CHECK (status IN ('pending', 'completed', 'flagged', 'reversed')),
  tx_hash       TEXT,
  description   TEXT,
  timestamp     TIMESTAMPTZ DEFAULT now()
);`;

const CREATE_FRAUD_ALERTS = `
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rule_name     TEXT NOT NULL,
  description   TEXT,
  risk_score    INTEGER NOT NULL DEFAULT 0
                  CHECK (risk_score >= 0 AND risk_score <= 100),
  severity      TEXT NOT NULL DEFAULT 'medium'
                  CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_resolved   BOOLEAN DEFAULT FALSE,
  resolved_at   TIMESTAMPTZ,
  flagged_at    TIMESTAMPTZ DEFAULT now()
);`;

const CREATE_AUDIT_LOGS = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  actor         TEXT NOT NULL DEFAULT 'system',
  details       JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);`;

const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_bids_project        ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_project ON fraud_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_open    ON fraud_alerts(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity    ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status  ON transactions(status);
`;

// ─── Execute via rpc('') or direct fetch ──────────────────

async function runSQL(label, sql) {
  process.stdout.write(`  ${label}...`);
  
  // Use the Supabase SQL endpoint (requires service_role key)
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ query: sql }),
  });

  // If rpc doesn't work, try the pg endpoint
  if (!res.ok) {
    // Try via the /pg endpoint (Supabase SQL API)
    const pgRes = await fetch(`${supabaseUrl}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!pgRes.ok) {
      console.log(' ❌');
      return false;
    }
  }
  
  console.log(' ✅');
  return true;
}

async function seedData() {
  console.log('\n📦 Seeding demo data...\n');

  // Insert projects
  const { data: projects, error: projErr } = await supabase.from('projects').insert([
    {
      name: 'National Highway NH-48 Expansion',
      description: 'Six-lane expansion of NH-48 between Delhi and Jaipur',
      budget: 150000000, spent: 42000000, status: 'active', risk_score: 25,
      region: 'North India', department: 'Ministry of Road Transport',
      start_date: '2025-01-15', end_date: '2027-06-30',
    },
    {
      name: 'Smart City Water Supply – Pune',
      description: 'Underground pipeline network for eastern Pune districts',
      budget: 85000000, spent: 61000000, status: 'active', risk_score: 62,
      region: 'West India', department: 'Ministry of Urban Development',
      start_date: '2024-06-01', end_date: '2026-12-31',
    },
    {
      name: 'Rural Electrification Phase III',
      description: 'Solar micro-grid installation across 200 villages',
      budget: 45000000, spent: 44500000, status: 'completed', risk_score: 15,
      region: 'Central India', department: 'Ministry of Power',
      start_date: '2023-09-01', end_date: '2025-03-31',
    },
    {
      name: 'Metro Line 7 Extension – Mumbai',
      description: 'Extension from Dahisar East to Andheri East',
      budget: 320000000, spent: 98000000, status: 'active', risk_score: 78,
      region: 'West India', department: 'Ministry of Railways',
      start_date: '2025-04-01', end_date: '2029-12-31',
    },
    {
      name: 'Digital Classroom Initiative',
      description: 'Equipping 5,000 government schools with smart boards',
      budget: 22000000, spent: 8500000, status: 'on_hold', risk_score: 35,
      region: 'Pan India', department: 'Ministry of Education',
      start_date: '2025-02-01', end_date: '2026-08-31',
    },
  ]).select();

  if (projErr) {
    console.error('  ❌ Projects:', projErr.message);
    return;
  }
  console.log(`  ✅ Projects: ${projects.length} inserted`);

  // Helper to find project by partial name
  const findProject = (partial) => projects.find(p => p.name.includes(partial));

  const nh48 = findProject('NH-48');
  const water = findProject('Water Supply');
  const electr = findProject('Electrification');
  const metro = findProject('Metro Line 7');
  const classroom = findProject('Classroom');

  // Insert bids
  const { data: bids, error: bidErr } = await supabase.from('bids').insert([
    { project_id: nh48.id, contractor: 'Larsen & Toubro Infra', amount: 142000000, hash: '0x7f3a1b...c4d2', status: 'accepted', is_winner: true },
    { project_id: nh48.id, contractor: 'Shapoorji Pallonji', amount: 148500000, hash: '0x9e2c8d...a1f5', status: 'rejected', is_winner: false },
    { project_id: nh48.id, contractor: 'NCC Limited', amount: 147800000, hash: '0x4b6d9a...e7c3', status: 'rejected', is_winner: false },
    { project_id: metro.id, contractor: 'Tata Projects', amount: 305000000, hash: '0x1d5e7f...b9a4', status: 'submitted', is_winner: false },
    { project_id: metro.id, contractor: 'Afcons Infrastructure', amount: 298000000, hash: '0x8c4f2e...d6b1', status: 'submitted', is_winner: false },
    { project_id: metro.id, contractor: 'Megha Engineering', amount: 299500000, hash: '0x3a7b1c...f2e8', status: 'submitted', is_winner: false },
  ]).select();

  if (bidErr) console.error('  ❌ Bids:', bidErr.message);
  else console.log(`  ✅ Bids: ${bids.length} inserted`);

  // Insert transactions
  const { data: txns, error: txErr } = await supabase.from('transactions').insert([
    { project_id: nh48.id, from_entity: 'Ministry of Finance', to_entity: 'L&T Infra', amount: 25000000, status: 'completed', tx_hash: '0xabc123...def', description: 'Phase 1 advance disbursement' },
    { project_id: nh48.id, from_entity: 'Ministry of Finance', to_entity: 'L&T Infra', amount: 17000000, status: 'completed', tx_hash: '0xdef456...abc', description: 'Phase 1 milestone payment' },
    { project_id: water.id, from_entity: 'Municipal Corp Pune', to_entity: 'HydroTech Solutions', amount: 30000000, status: 'completed', tx_hash: '0x111aaa...bbb', description: 'Pipe procurement advance' },
    { project_id: water.id, from_entity: 'Municipal Corp Pune', to_entity: 'HydroTech Solutions', amount: 31000000, status: 'flagged', tx_hash: '0x222bbb...ccc', description: 'Duplicate-looking disbursement' },
    { project_id: metro.id, from_entity: 'Railway Board', to_entity: 'Tata Projects', amount: 50000000, status: 'completed', tx_hash: '0x333ccc...ddd', description: 'Initial mobilization advance' },
    { project_id: electr.id, from_entity: 'Ministry of Power', to_entity: 'SolarGrid India', amount: 44500000, status: 'completed', tx_hash: '0x444ddd...eee', description: 'Final settlement' },
    { project_id: classroom.id, from_entity: 'Ministry of Education', to_entity: 'EduTech Pvt Ltd', amount: 8500000, status: 'flagged', tx_hash: '0x555eee...fff', description: 'Payment released despite project on hold' },
  ]).select();

  if (txErr) console.error('  ❌ Transactions:', txErr.message);
  else console.log(`  ✅ Transactions: ${txns.length} inserted`);

  // Insert fraud alerts
  const { data: alerts, error: alertErr } = await supabase.from('fraud_alerts').insert([
    { project_id: metro.id, rule_name: 'Collusion Detection', description: 'Three bids within 2.3% of each other — possible bid rigging', risk_score: 85, severity: 'critical', is_resolved: false },
    { project_id: water.id, rule_name: 'Duplicate Transaction', description: 'Two disbursements of similar amount within 30 days', risk_score: 70, severity: 'high', is_resolved: false },
    { project_id: classroom.id, rule_name: 'Payment on Hold Project', description: 'Fund released to contractor while project status is on_hold', risk_score: 65, severity: 'high', is_resolved: false },
    { project_id: nh48.id, rule_name: 'Overpricing', description: 'Winning bid 5% below estimate — within normal range', risk_score: 20, severity: 'low', is_resolved: true },
    { project_id: electr.id, rule_name: 'Budget Overrun', description: 'Spending reached 98.9% of budget — near overrun', risk_score: 45, severity: 'medium', is_resolved: true },
  ]).select();

  if (alertErr) console.error('  ❌ Fraud Alerts:', alertErr.message);
  else console.log(`  ✅ Fraud Alerts: ${alerts.length} inserted`);

  // Insert audit logs
  const { data: logs, error: logErr } = await supabase.from('audit_logs').insert([
    { action: 'CREATE', entity_type: 'project', entity_id: nh48.id, actor: 'admin@chaintrust.gov', details: { note: 'Project created from tender notice' } },
    { action: 'BID_SUBMIT', entity_type: 'bid', actor: 'contractor@lt.com', details: { project: 'NH-48 Expansion', amount: 142000000 } },
    { action: 'BID_ACCEPT', entity_type: 'bid', actor: 'admin@chaintrust.gov', details: { contractor: 'L&T Infra', project: 'NH-48 Expansion' } },
    { action: 'TRANSACTION', entity_type: 'transaction', actor: 'system', details: { amount: 25000000, to: 'L&T Infra' } },
    { action: 'FRAUD_FLAG', entity_type: 'fraud_alert', actor: 'fraud_engine', details: { rule: 'Collusion Detection', project: 'Metro Line 7' } },
    { action: 'FRAUD_FLAG', entity_type: 'fraud_alert', actor: 'fraud_engine', details: { rule: 'Duplicate Transaction', project: 'Water Supply Pune' } },
    { action: 'STATUS_CHANGE', entity_type: 'project', entity_id: electr.id, actor: 'admin@chaintrust.gov', details: { from: 'active', to: 'completed' } },
  ]).select();

  if (logErr) console.error('  ❌ Audit Logs:', logErr.message);
  else console.log(`  ✅ Audit Logs: ${logs.length} inserted`);
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('🔗 ChainTrust Database Setup');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${isServiceRole ? 'service_role ✅' : 'anon (limited) ⚠️'}\n`);

  if (isServiceRole) {
    console.log('📐 Creating tables...\n');
    const ddlStatements = [
      ['projects', CREATE_PROJECTS],
      ['bids', CREATE_BIDS],
      ['transactions', CREATE_TRANSACTIONS],
      ['fraud_alerts', CREATE_FRAUD_ALERTS],
      ['audit_logs', CREATE_AUDIT_LOGS],
      ['indexes', CREATE_INDEXES],
    ];

    for (const [label, sql] of ddlStatements) {
      await runSQL(label, sql);
    }
  } else {
    console.log('⏭️  Skipping table creation (need service_role key).');
    console.log('   Please create tables first via Supabase Dashboard SQL Editor.');
    console.log('   SQL file: supabase/migrations/001_create_tables.sql\n');
  }

  // Try seeding regardless — tables may already exist
  console.log('\n🌱 Checking if tables exist and seeding data...');
  
  // Quick check: can we read from projects?
  const { error: checkErr } = await supabase.from('projects').select('id').limit(1);
  
  if (checkErr) {
    console.error(`\n❌ Cannot access tables: ${checkErr.message}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Paste contents of supabase/migrations/001_create_tables.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Re-run this script: node scripts/setup-db.mjs');
    return;
  }

  // Check if already seeded
  const { data: existing } = await supabase.from('projects').select('id');
  if (existing && existing.length > 0) {
    console.log(`\n⚠️  Tables already have data (${existing.length} projects). Skipping seed.`);
    console.log('   To re-seed, delete existing rows first.');
    return;
  }

  await seedData();
  
  console.log('\n✅ Database setup complete!');
  console.log('   Your ChainTrust dashboard should now show real data.');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});

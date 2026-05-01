-- ============================================================
-- TRACE — Full Database Schema
-- Paste this entire file into:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. DISTRICTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS districts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR NOT NULL,
  state        VARCHAR NOT NULL,
  risk_score   INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status       VARCHAR DEFAULT 'clean' CHECK (status IN ('clean', 'watch', 'flagged')),
  lat          FLOAT,
  lng          FLOAT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── 2. SCHEMES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schemes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR NOT NULL,
  district_id     UUID REFERENCES districts(id) ON DELETE CASCADE,
  allocated_crore FLOAT DEFAULT 0,
  withdrawn_crore FLOAT DEFAULT 0,
  returned_crore  FLOAT DEFAULT 0,
  missing_crore   FLOAT GENERATED ALWAYS AS (withdrawn_crore - returned_crore) STORED,
  return_rate     FLOAT GENERATED ALWAYS AS (
    CASE WHEN withdrawn_crore > 0 THEN returned_crore / withdrawn_crore ELSE 0 END
  ) STORED,
  risk_score      INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status          VARCHAR DEFAULT 'clean' CHECK (status IN ('clean', 'watch', 'flagged')),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── 3. PROJECTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR NOT NULL,
  district_id         UUID REFERENCES districts(id) ON DELETE CASCADE,
  contractor_name     VARCHAR,
  contract_value_cr   FLOAT DEFAULT 0,
  benchmark_low_cr    FLOAT DEFAULT 0,
  benchmark_high_cr   FLOAT DEFAULT 0,
  bid_anomaly_pct     FLOAT DEFAULT 0,
  bids_received       INTEGER DEFAULT 0,
  risk_score          INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status              VARCHAR DEFAULT 'clean' CHECK (status IN ('clean', 'watch', 'flagged', 'frozen', 'under_review')),
  phase               INTEGER DEFAULT 1,
  phase2_frozen       BOOLEAN DEFAULT FALSE,
  lat                 FLOAT,
  lng                 FLOAT,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- ─── 4. BENEFICIARIES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS beneficiaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id       UUID REFERENCES schemes(id) ON DELETE CASCADE,
  district_id     UUID REFERENCES districts(id) ON DELETE CASCADE,
  account_hash    VARCHAR NOT NULL,
  is_ghost        BOOLEAN DEFAULT FALSE,
  ghost_signals   JSONB DEFAULT '{}',
  amount_cr       FLOAT DEFAULT 0,
  withdrawn_at    TIMESTAMP,
  returned_cr     FLOAT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── 5. TRANSACTIONS (blockchain event log) ─────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      VARCHAR NOT NULL CHECK (event_type IN ('mint', 'allocate', 'withdraw', 'return', 'freeze')),
  entity_id       UUID NOT NULL,
  entity_type     VARCHAR NOT NULL CHECK (entity_type IN ('scheme', 'project', 'beneficiary')),
  amount_cr       FLOAT DEFAULT 0,
  location        VARCHAR,
  district_id     UUID REFERENCES districts(id),
  metadata        JSONB DEFAULT '{}',
  timestamp       TIMESTAMP DEFAULT NOW(),
  tx_hash         VARCHAR NOT NULL
);

-- ─── 6. ALERTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            VARCHAR NOT NULL CHECK (type IN ('cash_black_hole', 'bid_anomaly', 'ghost_cluster', 'payment_frozen')),
  title           VARCHAR NOT NULL,
  description     TEXT,
  district_id     UUID REFERENCES districts(id),
  entity_id       UUID,
  entity_type     VARCHAR,
  risk_score      INTEGER DEFAULT 0,
  status          VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'resolved')),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── 7. REPORTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            VARCHAR NOT NULL CHECK (type IN ('citizen', 'auditor')),
  category        VARCHAR NOT NULL,
  project_id      UUID REFERENCES projects(id),
  district_id     UUID REFERENCES districts(id),
  description     TEXT,
  photo_url       VARCHAR,
  gps_lat         FLOAT,
  gps_lng         FLOAT,
  verdict         VARCHAR CHECK (verdict IN ('approved', 'rejected', 'needs_reinspection') OR verdict IS NULL),
  checklist       JSONB DEFAULT '{}',
  submitted_by    VARCHAR NOT NULL DEFAULT 'citizen',
  immutable       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── 8. PAYMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone       INTEGER NOT NULL CHECK (milestone >= 1 AND milestone <= 4),
  amount_cr       FLOAT DEFAULT 0,
  status          VARCHAR DEFAULT 'pending' CHECK (status IN ('released', 'pending', 'blocked')),
  block_reason    VARCHAR,
  expected_date   DATE,
  released_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schemes_district      ON schemes(district_id);
CREATE INDEX IF NOT EXISTS idx_projects_district     ON projects(district_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_scheme  ON beneficiaries(scheme_id);
CREATE INDEX IF NOT EXISTS idx_transactions_entity   ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_alerts_district       ON alerts(district_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status         ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_reports_project       ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project      ON payments(project_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE districts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;

-- Allow anon read on all tables
CREATE POLICY "anon_read_districts"     ON districts     FOR SELECT USING (true);
CREATE POLICY "anon_read_schemes"       ON schemes       FOR SELECT USING (true);
CREATE POLICY "anon_read_projects"      ON projects      FOR SELECT USING (true);
CREATE POLICY "anon_read_beneficiaries" ON beneficiaries FOR SELECT USING (true);
CREATE POLICY "anon_read_transactions"  ON transactions  FOR SELECT USING (true);
CREATE POLICY "anon_read_alerts"        ON alerts        FOR SELECT USING (true);
CREATE POLICY "anon_read_reports"       ON reports       FOR SELECT USING (true);
CREATE POLICY "anon_read_payments"      ON payments      FOR SELECT USING (true);

-- Allow anon insert (for citizen reports, inspections, invoices)
CREATE POLICY "anon_insert_reports"      ON reports      FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Allow anon update on projects/payments (for payment freeze side-effects)
CREATE POLICY "anon_update_projects"  ON projects  FOR UPDATE USING (true);
CREATE POLICY "anon_update_payments"  ON payments  FOR UPDATE USING (true);

-- ─── SEED DATA ───────────────────────────────────────────────

-- Districts
INSERT INTO districts (id, name, state, risk_score, status, lat, lng) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Jhansi',   'Uttar Pradesh',  84, 'flagged', 25.4484, 78.5685),
  ('a1000000-0000-0000-0000-000000000002', 'Pune',      'Maharashtra',    12, 'clean',   18.5204, 73.8567),
  ('a1000000-0000-0000-0000-000000000003', 'Lucknow',   'Uttar Pradesh',  55, 'watch',   26.8467, 80.9462),
  ('a1000000-0000-0000-0000-000000000004', 'Bhopal',    'Madhya Pradesh', 48, 'watch',   23.2599, 77.4126),
  ('a1000000-0000-0000-0000-000000000005', 'Chennai',   'Tamil Nadu',     18, 'clean',   13.0827, 80.2707)
ON CONFLICT (id) DO UPDATE SET
  risk_score = EXCLUDED.risk_score, status = EXCLUDED.status;

-- Schemes
INSERT INTO schemes (id, name, district_id, allocated_crore, withdrawn_crore, returned_crore, risk_score, status) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'PM-KISAN 2024',      'a1000000-0000-0000-0000-000000000001', 35, 28, 6.2,  84, 'flagged'),
  ('b1000000-0000-0000-0000-000000000002', 'Jal Jeevan Mission', 'a1000000-0000-0000-0000-000000000001', 22, 18, 4.5,  72, 'flagged'),
  ('b1000000-0000-0000-0000-000000000003', 'PM-KISAN 2024',      'a1000000-0000-0000-0000-000000000002', 18, 15, 13.8, 12, 'clean'),
  ('b1000000-0000-0000-0000-000000000004', 'MGNREGS 2024',       'a1000000-0000-0000-0000-000000000003', 28, 22, 14.5, 55, 'watch'),
  ('b1000000-0000-0000-0000-000000000005', 'PM Awas Yojana',     'a1000000-0000-0000-0000-000000000004', 15, 12, 7.8,  48, 'watch'),
  ('b1000000-0000-0000-0000-000000000006', 'PMGSY Roads',        'a1000000-0000-0000-0000-000000000005', 20, 19, 17.5, 18, 'clean')
ON CONFLICT (id) DO UPDATE SET
  withdrawn_crore = EXCLUDED.withdrawn_crore, risk_score = EXCLUDED.risk_score;

-- Projects
INSERT INTO projects (id, name, district_id, contractor_name, contract_value_cr, benchmark_low_cr, benchmark_high_cr, bid_anomaly_pct, bids_received, risk_score, status, phase, phase2_frozen, lat, lng) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'NH-44 Road Repair, Jhansi',    'a1000000-0000-0000-0000-000000000001', 'XYZ Construction Ltd',    10.0, 5.2, 6.1, 80, 4, 79, 'flagged',     2, TRUE,  25.4484, 78.5685),
  ('c1000000-0000-0000-0000-000000000002', 'Jhansi-Orchha Road Widening',  'a1000000-0000-0000-0000-000000000001', 'Bharat Infra Ltd',         8.5, 4.8, 5.5, 55, 3, 65, 'watch',       2, FALSE, 25.4601, 78.5772),
  ('c1000000-0000-0000-0000-000000000003', 'Pune Ring Road Phase I',       'a1000000-0000-0000-0000-000000000002', 'Maharashtra Highways Ltd', 12.0,11.0,12.5,  2, 6, 10, 'clean',       3, FALSE, 18.5204, 73.8567)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status, phase2_frozen = EXCLUDED.phase2_frozen;

-- Payments (4 milestones per project)
INSERT INTO payments (id, project_id, milestone, amount_cr, status, block_reason, expected_date, released_at) VALUES
  ('d1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001',1,2.5,'released',NULL,'2024-02-01','2024-02-05 10:00:00'),
  ('d1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000001',2,3.2,'blocked','Inspection failed: asphalt thickness 2 inches, spec requires 4 inches','2024-04-01',NULL),
  ('d1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000001',3,2.3,'pending',NULL,'2024-06-01',NULL),
  ('d1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000001',4,2.0,'pending',NULL,'2024-08-01',NULL),
  ('d1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000002',1,2.0,'released',NULL,'2024-01-15','2024-01-20 09:00:00'),
  ('d1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000002',2,2.5,'pending',NULL,'2024-04-15',NULL),
  ('d1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000002',3,2.0,'pending',NULL,'2024-07-15',NULL),
  ('d1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000002',4,2.0,'pending',NULL,'2024-10-15',NULL),
  ('d1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000003',1,3.0,'released',NULL,'2024-01-01','2024-01-05 08:00:00'),
  ('d1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000003',2,3.5,'released',NULL,'2024-03-01','2024-03-03 10:00:00'),
  ('d1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000003',3,3.0,'released',NULL,'2024-05-01','2024-05-04 11:00:00'),
  ('d1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000003',4,2.5,'pending', NULL,'2024-08-01',NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, block_reason = EXCLUDED.block_reason;

-- Alerts
INSERT INTO alerts (id, type, title, description, district_id, entity_id, entity_type, risk_score, status) VALUES
  ('e1000000-0000-0000-0000-000000000001','cash_black_hole','₹21.8 crore missing — Jhansi',
   'Cash last seen at SBI Jhansi Branch cluster, April 7–9. 847 beneficiary accounts, only 22% returned. Risk score 84.',
   'a1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','scheme',84,'active'),
  ('e1000000-0000-0000-0000-000000000002','bid_anomaly','NH-44 bid 80% above benchmark — Jhansi',
   'Winning bid of ₹10 crore is 80% above market benchmark of ₹5.2–6.1 crore. Contractor: XYZ Construction Ltd.',
   'a1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','project',79,'active'),
  ('e1000000-0000-0000-0000-000000000003','ghost_cluster','127 ghost accounts detected — Jhansi PM-KISAN',
   '127 beneficiary accounts flagged: new accounts, bulk withdrawals within 4 hours, same GPS coordinates.',
   'a1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','scheme',78,'active'),
  ('e1000000-0000-0000-0000-000000000004','payment_frozen','Phase 2 payment frozen — NH-44',
   '₹3.2 crore milestone 2 payment frozen after field auditor rejected inspection. Asphalt thickness below spec.',
   'a1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','project',75,'active'),
  ('e1000000-0000-0000-0000-000000000005','cash_black_hole','₹7.5 crore watch — Lucknow MGNREGS',
   'Cash return rate 66%, below threshold. Under monitoring.',
   'a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000004','scheme',55,'under_review')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status;

-- Transactions (blockchain log)
INSERT INTO transactions (id, event_type, entity_id, entity_type, amount_cr, location, district_id, metadata, timestamp, tx_hash) VALUES
  ('f1000000-0000-0000-0000-000000000001','mint',    'b1000000-0000-0000-0000-000000000001','scheme',35,  'RBI Mumbai',              'a1000000-0000-0000-0000-000000000001','{"note":"RBI print and allocate"}','2024-01-15 09:00:00','a3f1e2d8c7b6a5940312e1f0d9c8b7a6e5d4c3b2a1f0e9d8'),
  ('f1000000-0000-0000-0000-000000000002','allocate','b1000000-0000-0000-0000-000000000001','scheme',35,  'SBI Jhansi District HQ',  'a1000000-0000-0000-0000-000000000001','{"scheme":"PM-KISAN 2024"}','2024-03-01 10:00:00','b4e2f3c8d7a6e5d4c3b2a1f0e9d8c7b6a5940312e1f0d9c8'),
  ('f1000000-0000-0000-0000-000000000003','withdraw','b1000000-0000-0000-0000-000000000001','scheme',28,  'SBI Jhansi Branch Cluster','a1000000-0000-0000-0000-000000000001','{"accounts":847,"date_range":"Apr 7-9"}','2024-04-09 14:00:00','c5d3e4f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9'),
  ('f1000000-0000-0000-0000-000000000004','return',  'b1000000-0000-0000-0000-000000000001','scheme',6.2, 'SBI Jhansi Branch Cluster','a1000000-0000-0000-0000-000000000001','{"return_rate":0.22,"expected":0.85}','2024-04-09 18:00:00','d6e4f5a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0'),
  ('f1000000-0000-0000-0000-000000000005','allocate','c1000000-0000-0000-0000-000000000001','project',10, 'NHAI Jhansi Office',      'a1000000-0000-0000-0000-000000000001','{"contract":"NH-44","contractor":"XYZ Construction"}','2024-01-20 11:00:00','e7f5a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0'),
  ('f1000000-0000-0000-0000-000000000006','withdraw','c1000000-0000-0000-0000-000000000001','project',5.2,'HDFC Jhansi Corporate',   'a1000000-0000-0000-0000-000000000001','{"milestone":1,"note":"no downstream deposits"}','2024-02-05 10:00:00','f8a6b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1'),
  ('f1000000-0000-0000-0000-000000000007','freeze',  'c1000000-0000-0000-0000-000000000001','project',3.2,'System',                  'a1000000-0000-0000-0000-000000000001','{"milestone":2,"reason":"inspection_rejected"}','2024-04-10 09:00:00','a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4')
ON CONFLICT (id) DO NOTHING;

-- Beneficiaries (10 ghost - Jhansi, 10 clean - Pune)
INSERT INTO beneficiaries (scheme_id, district_id, account_hash, is_ghost, ghost_signals, amount_cr, withdrawn_at, returned_cr) VALUES
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_001',TRUE,'{"new_account":true,"bulk_withdrawal":true,"same_gps":true}',0.042,'2024-04-07 10:15:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_002',TRUE,'{"new_account":true,"bulk_withdrawal":true,"same_gps":true}',0.042,'2024-04-07 10:22:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_003',TRUE,'{"new_account":true,"bulk_withdrawal":true,"same_gps":true}',0.042,'2024-04-07 10:31:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_004',TRUE,'{"new_account":true,"zero_history":true,"same_gps":true}',0.042,'2024-04-08 11:05:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_005',TRUE,'{"new_account":true,"bulk_withdrawal":true}',0.042,'2024-04-08 11:18:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_006',TRUE,'{"bulk_withdrawal":true,"same_gps":true}',0.042,'2024-04-09 09:00:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_007',TRUE,'{"new_account":true,"zero_history":true}',0.042,'2024-04-09 09:15:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_008',TRUE,'{"new_account":true,"bulk_withdrawal":true,"same_gps":true}',0.042,'2024-04-09 09:30:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_009',TRUE,'{"bulk_withdrawal":true,"zero_history":true}',0.042,'2024-04-09 10:00:00',0),
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','hash_jh_010',TRUE,'{"new_account":true,"same_gps":true}',0.042,'2024-04-09 10:30:00',0),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_001',FALSE,'{}',0.029,'2024-03-10 09:00:00',0.025),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_002',FALSE,'{}',0.029,'2024-03-10 09:30:00',0.026),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_003',FALSE,'{}',0.029,'2024-03-11 10:00:00',0.024),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_004',FALSE,'{}',0.029,'2024-03-11 11:00:00',0.027),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_005',FALSE,'{}',0.029,'2024-03-12 09:00:00',0.025),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_006',FALSE,'{}',0.029,'2024-03-12 10:00:00',0.026),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_007',FALSE,'{}',0.029,'2024-03-13 09:00:00',0.028),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_008',FALSE,'{}',0.029,'2024-03-13 10:30:00',0.025),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_009',FALSE,'{}',0.029,'2024-03-14 09:00:00',0.024),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002','hash_pn_010',FALSE,'{}',0.029,'2024-03-14 10:00:00',0.026);

-- Done! ✅ All 8 tables created and seeded.

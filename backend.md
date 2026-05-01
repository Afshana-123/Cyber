# TRACE — Backend PRD
**Version:** 1.0 | **Hackathon Build** | **Stack:** Node.js + Express + PostgreSQL

---

## What This Backend Does

TRACE is an anti-corruption system that tracks government money from RBI printing to final cash withdrawal and flags anomalies when money doesn't behave like honest money should.

The backend:
- Logs every money movement as a blockchain-style event (immutable append-only)
- Runs anomaly detection (cash return rate, ghost accounts, bid collusion)
- Serves all data to the web dashboard and FlutterFlow mobile app via REST API
- Exposes a public ngrok URL so FlutterFlow can hit it directly

---

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Auth | JWT (simple, role-based) |
| Tunnel (dev) | ngrok |
| Deployment | Railway or Render (post-demo) |

---

## Database Schema — 8 Tables

### 1. `districts`
```sql
id           UUID PRIMARY KEY
name         VARCHAR        -- "Jhansi"
state        VARCHAR        -- "Uttar Pradesh"
risk_score   INTEGER        -- 0–100
status       VARCHAR        -- "clean" | "watch" | "flagged"
lat          FLOAT
lng          FLOAT
created_at   TIMESTAMP
```

### 2. `schemes`
```sql
id              UUID PRIMARY KEY
name            VARCHAR        -- "PM-KISAN 2024"
district_id     UUID REFERENCES districts
allocated_crore FLOAT          -- 35
withdrawn_crore FLOAT          -- 28
returned_crore  FLOAT          -- 6.2
missing_crore   FLOAT          -- 21.8 (computed: withdrawn - returned)
return_rate     FLOAT          -- 0.22 (returned / withdrawn)
risk_score      INTEGER        -- 0–100
status          VARCHAR        -- "clean" | "watch" | "flagged"
created_at      TIMESTAMP
```

### 3. `projects` (contracts/tenders)
```sql
id                  UUID PRIMARY KEY
name                VARCHAR        -- "NH-44 road repair"
district_id         UUID REFERENCES districts
contractor_name     VARCHAR
contract_value_cr   FLOAT          -- 10
benchmark_low_cr    FLOAT          -- 5.2
benchmark_high_cr   FLOAT          -- 6.1
bid_anomaly_pct     FLOAT          -- 80 (% above benchmark)
bids_received       INTEGER        -- 4
risk_score          INTEGER        -- 0–100
status              VARCHAR        -- "clean" | "watch" | "flagged" | "frozen"
phase               INTEGER        -- current milestone 1–4
phase2_frozen       BOOLEAN        -- true if payment blocked
created_at          TIMESTAMP
```

### 4. `beneficiaries`
```sql
id              UUID PRIMARY KEY
scheme_id       UUID REFERENCES schemes
district_id     UUID REFERENCES districts
account_hash    VARCHAR        -- hashed Aadhaar — never store raw
is_ghost        BOOLEAN        -- flagged as ghost account
ghost_signals   JSONB          -- { "new_account": true, "bulk_withdrawal": true, "same_gps": true }
amount_cr       FLOAT
withdrawn_at    TIMESTAMP
returned_cr     FLOAT
created_at      TIMESTAMP
```

### 5. `transactions` (blockchain event log — append only, never update)
```sql
id              UUID PRIMARY KEY
event_type      VARCHAR        -- "mint" | "allocate" | "withdraw" | "return" | "freeze"
entity_id       UUID           -- references schemes, projects, or beneficiaries
entity_type     VARCHAR        -- "scheme" | "project" | "beneficiary"
amount_cr       FLOAT
location        VARCHAR        -- branch / ATM name
district_id     UUID REFERENCES districts
metadata        JSONB          -- any extra fields
timestamp       TIMESTAMP
tx_hash         VARCHAR        -- SHA256 of (event_type + entity_id + amount + timestamp)
```

### 6. `alerts`
```sql
id              UUID PRIMARY KEY
type            VARCHAR        -- "cash_black_hole" | "bid_anomaly" | "ghost_cluster" | "payment_frozen"
title           VARCHAR
description     TEXT
district_id     UUID REFERENCES districts
entity_id       UUID           -- the flagged project / scheme
entity_type     VARCHAR
risk_score      INTEGER
status          VARCHAR        -- "active" | "under_review" | "resolved"
created_at      TIMESTAMP
```

### 7. `reports` (citizen + field auditor submissions)
```sql
id              UUID PRIMARY KEY
type            VARCHAR        -- "citizen" | "auditor"
category        VARCHAR        -- "road_quality" | "ghost_project" | "suspicious_activity" | "inspection"
project_id      UUID REFERENCES projects
district_id     UUID REFERENCES districts
description     TEXT
photo_url       VARCHAR
gps_lat         FLOAT
gps_lng         FLOAT
verdict         VARCHAR        -- auditor only: "approved" | "rejected" | "needs_reinspection"
checklist       JSONB          -- auditor only: { "road_width": "pass", "thickness": "fail" }
submitted_by    VARCHAR        -- role: "citizen" | "auditor"
immutable       BOOLEAN        -- true once submitted, never update
created_at      TIMESTAMP
```

### 8. `payments` (contractor milestone tracker)
```sql
id              UUID PRIMARY KEY
project_id      UUID REFERENCES projects
milestone       INTEGER        -- 1, 2, 3, 4
amount_cr       FLOAT
status          VARCHAR        -- "released" | "pending" | "blocked"
block_reason    VARCHAR        -- why it's frozen if blocked
expected_date   DATE
released_at     TIMESTAMP
created_at      TIMESTAMP
```

---

## API Endpoints — 13 Total

### Authentication
All protected routes require header:
```
Authorization: Bearer <jwt_token>
```

Three roles: `admin` | `auditor` | `public`

---

### Auth

#### `POST /api/auth/login`
Request:
```json
{ "phone": "9999999999", "role": "auditor" }
```
Response:
```json
{ "token": "jwt_token_here", "role": "auditor", "name": "Field Auditor 1" }
```
> For hackathon: skip OTP, accept any phone + role and return a valid JWT. Add OTP as roadmap.

---

### Dashboard Endpoints (web)

#### `GET /api/districts`
Returns all districts with risk scores for the India heat map.

Response:
```json
[
  {
    "id": "uuid",
    "name": "Jhansi",
    "state": "Uttar Pradesh",
    "risk_score": 84,
    "status": "flagged",
    "lat": 25.4484,
    "lng": 78.5685,
    "missing_crore": 21.8
  }
]
```

---

#### `GET /api/alerts`
Returns all active alerts sorted by risk score descending. Used for the live alert feed.

Response:
```json
[
  {
    "id": "uuid",
    "type": "cash_black_hole",
    "title": "₹21.8 crore missing — Jhansi",
    "description": "Cash last seen at SBI Jhansi Branch cluster, April 7–9. Risk score 84.",
    "district": "Jhansi",
    "risk_score": 84,
    "status": "active",
    "created_at": "2024-04-09T00:00:00Z"
  }
]
```

---

#### `GET /api/contract/:id`
Full contract drill-down. Used when auditor clicks into a specific project.

Response:
```json
{
  "id": "uuid",
  "name": "NH-44 road repair, Jhansi",
  "contractor_name": "XYZ Construction Ltd",
  "contract_value_cr": 10,
  "benchmark_low_cr": 5.2,
  "benchmark_high_cr": 6.1,
  "bid_anomaly_pct": 80,
  "risk_score": 79,
  "status": "flagged",
  "phase2_frozen": true,
  "payments": [
    { "milestone": 1, "amount_cr": 2.5, "status": "released" },
    { "milestone": 2, "amount_cr": 3.2, "status": "blocked", "block_reason": "Material quantity mismatch" },
    { "milestone": 3, "amount_cr": 2.3, "status": "pending" },
    { "milestone": 4, "amount_cr": 2.0, "status": "pending" }
  ],
  "transaction_log": [
    { "event_type": "allocate", "amount_cr": 10, "timestamp": "...", "tx_hash": "..." },
    { "event_type": "withdraw", "amount_cr": 5.2, "timestamp": "...", "tx_hash": "..." },
    { "event_type": "freeze", "amount_cr": 3.2, "timestamp": "...", "tx_hash": "..." }
  ],
  "reports": [
    { "type": "citizen", "category": "road_quality", "created_at": "..." }
  ]
}
```

---

#### `GET /api/risk-score/:id`
Risk score breakdown for any entity (project, scheme, contractor).

Query param: `?type=project` or `?type=scheme`

Response:
```json
{
  "entity_id": "uuid",
  "total_score": 84,
  "breakdown": {
    "cash_return_rate": 35,
    "bid_anomaly": 20,
    "ghost_accounts": 18,
    "contractor_cash_pattern": 11
  },
  "risk_level": "critical",
  "flagged_at": "2024-04-09T00:00:00Z"
}
```

---

#### `GET /api/schemes/:districtId`
Scheme status for a district. Used by FlutterFlow citizen home screen.

Response:
```json
[
  {
    "id": "uuid",
    "name": "PM-KISAN 2024",
    "allocated_crore": 35,
    "withdrawn_crore": 28,
    "returned_crore": 6.2,
    "missing_crore": 21.8,
    "return_rate": 0.22,
    "risk_score": 84,
    "status": "flagged",
    "beneficiary_count": 847
  }
]
```

---

### App Endpoints (FlutterFlow)

#### `POST /api/report`
Citizen or field auditor submits a report.

Request:
```json
{
  "type": "citizen",
  "category": "road_quality",
  "project_id": "uuid-or-null",
  "district_id": "uuid",
  "description": "Road has potholes near SBI branch",
  "photo_url": "https://...",
  "gps_lat": 25.4484,
  "gps_lng": 78.5685
}
```

Response:
```json
{
  "report_id": "uuid",
  "status": "received",
  "message": "Report submitted. It is now permanently recorded."
}
```

Side effect: if `project_id` is provided, reduce that project's quality score and re-evaluate if payment should freeze.

---

#### `POST /api/inspection`
Field auditor submits on-site inspection. Immutable once submitted.

Request:
```json
{
  "project_id": "uuid",
  "auditor_id": "uuid",
  "gps_lat": 25.4484,
  "gps_lng": 78.5685,
  "photos": ["url1", "url2", "url3"],
  "checklist": {
    "road_width": "pass",
    "thickness": "fail",
    "surface_quality": "partial"
  },
  "verdict": "rejected",
  "notes": "Asphalt thickness is approximately 2 inches, spec requires 4 inches"
}
```

Response:
```json
{
  "inspection_id": "uuid",
  "tx_hash": "sha256_hash",
  "verdict": "rejected",
  "payment_action": "Phase 2 payment frozen automatically"
}
```

Side effect: if verdict is `rejected` — freeze next milestone payment for this project. Log a `freeze` event in transactions table.

---

#### `POST /api/invoice`
Contractor submits material purchase invoice.

Request:
```json
{
  "project_id": "uuid",
  "contractor_id": "uuid",
  "material": "cement",
  "amount_cr": 0.45,
  "invoice_url": "https://...",
  "gst_number": "GSTIN123"
}
```

Response:
```json
{
  "invoice_id": "uuid",
  "tx_hash": "sha256_hash",
  "status": "logged"
}
```

---

#### `POST /api/milestone`
Contractor submits milestone completion proof.

Request:
```json
{
  "project_id": "uuid",
  "milestone": 2,
  "photos": ["url1", "url2", "url3", "url4", "url5"],
  "gps_lat": 25.4484,
  "gps_lng": 78.5685,
  "documents": ["completion_cert_url"]
}
```

Response:
```json
{
  "submission_id": "uuid",
  "milestone": 2,
  "status": "under_review",
  "message": "3-layer verification triggered. Payment pending verification outcome."
}
```

Side effect: trigger the 3-layer verification flag on the dashboard (sets project status to `under_review`).

---

#### `GET /api/payments/:contractId`
Contractor views payment status per milestone.

Response:
```json
{
  "contract_id": "uuid",
  "contractor": "XYZ Construction Ltd",
  "total_value_cr": 10,
  "milestones": [
    { "milestone": 1, "amount_cr": 2.5, "status": "released", "released_at": "2024-04-05" },
    { "milestone": 2, "amount_cr": 3.2, "status": "blocked", "block_reason": "Inspection failed: thickness check" },
    { "milestone": 3, "amount_cr": 2.3, "status": "pending", "expected_date": "2024-06-01" },
    { "milestone": 4, "amount_cr": 2.0, "status": "pending", "expected_date": "2024-08-01" }
  ]
}
```

---

#### `GET /api/risk-score/:contractorId`
Contractor's account risk score. Shown on contractor home screen in FlutterFlow.

Response:
```json
{
  "contractor_id": "uuid",
  "name": "XYZ Construction Ltd",
  "risk_score": 79,
  "risk_level": "high",
  "flags": [
    "Cash withdrawal of ₹5.2 crore with no downstream deposits",
    "Bid was 80% above market benchmark"
  ]
}
```

---

## Anomaly Detection Logic

### Cash Return Rate (CRR)
```
CRR = returned_crore / withdrawn_crore

0.85 – 1.00  → score 0–20   → clean ✅
0.60 – 0.84  → score 21–50  → watch 🟡
0.40 – 0.59  → score 51–70  → flagged 🔴
0.00 – 0.39  → score 71–100 → critical 🔴 → auto-freeze next disbursement
```

### Ghost Account Detector
Flag a beneficiary if 2+ of the following are true:
- Account created less than 30 days before scheme launch
- Zero transaction history except this one scheme credit
- Full amount withdrawn within 4 hours of receiving
- Same GPS coordinates as 5+ other withdrawals

### Bid Collusion Detector
Flag a tender if any of:
- Winning bid is more than 30% above the benchmark ceiling
- Multiple bids submitted from same IP address
- Contractor has won more than 60% of tenders in this district
- Bids from different companies are within 2% of each other

### Risk Score Formula
```
Total Score (0–100) =
  Cash Return Rate score      (max 35 pts)
  Ghost account signals       (max 25 pts)
  Bid anomaly score           (max 20 pts)
  Contractor cash pattern     (max 20 pts)

0–35   → clean ✅
36–65  → watch 🟡
66–100 → flagged 🔴 → CBI alert triggered
```

---

## Seed Data

Run `npm run seed` to populate. Run `npm run seed:reset` to wipe and re-seed.

### The Corrupt Scenario (Jhansi)
```
District:         Jhansi, Uttar Pradesh
Scheme:           PM-KISAN 2024
Allocated:        ₹35 crore
Withdrawn:        ₹28 crore across 847 beneficiary accounts
Returned:         ₹6.2 crore
Missing:          ₹21.8 crore
Last seen:        SBI Jhansi Branch cluster, April 7–9
Risk score:       84
Status:           flagged 🔴

Contract:         NH-44 road repair
Contractor:       XYZ Construction Ltd
Value:            ₹10 crore
Benchmark:        ₹5.2 – ₹6.1 crore
Bid anomaly:      80% above benchmark
Cash withdrawn:   ₹5.2 crore, no downstream deposits
Risk score:       79
Phase 2 frozen:   ₹3.2 crore blocked
```

### The Clean Scenario (Pune)
```
District:         Pune, Maharashtra
Scheme:           PM-KISAN 2024
Allocated:        ₹18 crore
Withdrawn:        ₹15 crore across 612 accounts
Returned:         ₹13.8 crore
Return rate:      92%
Risk score:       12
Status:           clean ✅
```

### Districts to seed (5 total)
| District | State | Risk Score | Status |
|---|---|---|---|
| Jhansi | Uttar Pradesh | 84 | flagged |
| Pune | Maharashtra | 12 | clean |
| Lucknow | Uttar Pradesh | 55 | watch |
| Bhopal | Madhya Pradesh | 48 | watch |
| Chennai | Tamil Nadu | 18 | clean |

---

## CORS Configuration

Allow all origins during development so FlutterFlow and the web dashboard can both hit it:

```js
app.use(cors({ origin: '*' }))
```

---

## ngrok Setup (For FlutterFlow Integration)

After running the backend locally:

```bash
# Install ngrok
npm install -g ngrok

# Start backend
npm run dev   # runs on port 3001

# In a new terminal — expose it
ngrok http 3001

# Copy the https URL e.g. https://abc123.ngrok.io
# Paste this as the base URL in FlutterFlow API calls
```

The ngrok URL changes every restart. For the hackathon demo — start ngrok once and don't restart it.

---

## Environment Variables

Create a `.env` file:

```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/trace
JWT_SECRET=trace_hackathon_secret_2024
NODE_ENV=development
```

---

## Folder Structure

```
trace-backend/
├── src/
│   ├── server.js              ← entry point, Express setup, CORS
│   ├── routes/
│   │   ├── auth.js            ← POST /api/auth/login
│   │   ├── districts.js       ← GET /api/districts
│   │   ├── alerts.js          ← GET /api/alerts
│   │   ├── contracts.js       ← GET /api/contract/:id
│   │   ├── schemes.js         ← GET /api/schemes/:districtId
│   │   ├── riskScore.js       ← GET /api/risk-score/:id
│   │   ├── reports.js         ← POST /api/report, POST /api/inspection
│   │   ├── invoices.js        ← POST /api/invoice
│   │   ├── milestones.js      ← POST /api/milestone
│   │   └── payments.js        ← GET /api/payments/:contractId
│   ├── services/
│   │   ├── anomalyDetector.js ← CRR, ghost account, bid collusion logic
│   │   ├── riskScorer.js      ← combines signals into 0–100 score
│   │   └── blockchainLogger.js← logs events to transactions table with tx_hash
│   ├── models/
│   │   └── db.js              ← PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js            ← JWT verification middleware
│   └── seed/
│       └── seed.js            ← seeds all 5 districts, 3 projects, 500 beneficiaries
├── .env
├── .env.example
├── package.json
└── BACKEND_PRD.md             ← this file
```

---

## What to Build vs Roadmap

### Build now — must be in demo
- All 13 API endpoints returning realistic data
- PostgreSQL tables with seed data
- Cash return rate calculator
- Ghost account detector (rule-based)
- Bid collusion checker (rule-based)
- Risk score calculator
- Blockchain event logger (SHA256 hash per transaction)

### Roadmap — describe in pitch, don't build
- Real Hyperledger Fabric network
- Real Aadhaar verification
- Satellite imagery API
- SMS alerts to auditors
- Actual RBI data feed
- Multi-language support

---

## Demo Scenario — What the Backend Must Return Perfectly

These are the exact API calls the demo makes. These must never fail.

| Step | API Call | Must Return |
|---|---|---|
| 1 | `GET /api/districts` | Jhansi with risk_score 84, status flagged |
| 2 | `GET /api/alerts` | Alert for ₹21.8 crore missing, Jhansi |
| 3 | `GET /api/contract/nh44-uuid` | NH-44 with Phase 2 frozen, cash withdrawal flagged |
| 4 | `GET /api/risk-score/nh44-uuid` | Score 79 with breakdown |
| 5 | `POST /api/report` | Accepts citizen report, returns report_id |
| 6 | `GET /api/contract/nh44-uuid` | Now shows the citizen report linked |
| 7 | `GET /api/payments/nh44-uuid` | Phase 2 shows blocked with reason |
| 8 | `GET /api/risk-score/xyz-contractor` | Score 79, flags listed |
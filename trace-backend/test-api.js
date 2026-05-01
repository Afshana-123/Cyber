/**
 * TRACE Backend — Full API Test Suite
 * Tests all 11 endpoints: happy path + error cases + side effects
 */

const BASE = 'http://localhost:3001';
let passed = 0, failed = 0;
let authToken = '';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function req(method, path, body, token) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

function assert(label, condition, got) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label} — got: ${JSON.stringify(got).substring(0, 120)}`);
    failed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n📌 [1] GET /health');
  const { status, data } = await req('GET', '/health');
  assert('Status 200',             status === 200, status);
  assert('status = ok',            data.status === 'ok', data);
  assert('service field present',  data.service === 'TRACE Backend', data);
}

async function testAuth() {
  console.log('\n📌 [2] POST /api/auth/login');

  // Happy path — auditor
  let r = await req('POST', '/api/auth/login', { phone: '9876543210', role: 'auditor' });
  assert('Status 200',          r.status === 200, r.status);
  assert('Token returned',      typeof r.data.token === 'string' && r.data.token.length > 20, r.data);
  assert('Role = auditor',      r.data.role === 'auditor', r.data.role);
  authToken = r.data.token;

  // All roles work
  for (const role of ['admin', 'contractor', 'public']) {
    const rr = await req('POST', '/api/auth/login', { phone: '9000000001', role });
    assert(`Role ${role} accepted`, rr.status === 200, rr.status);
  }

  // Missing phone
  r = await req('POST', '/api/auth/login', { role: 'auditor' });
  assert('Missing phone → 400', r.status === 400, r.status);

  // Invalid role
  r = await req('POST', '/api/auth/login', { phone: '9999999999', role: 'hacker' });
  assert('Invalid role → 400',  r.status === 400, r.status);
}

async function testDistricts() {
  console.log('\n📌 [3] GET /api/districts');
  const { status, data } = await req('GET', '/api/districts');
  assert('Status 200',                  status === 200, status);
  assert('Returns array',               Array.isArray(data), data);
  assert('5 districts',                 data.length === 5, data.length);
  assert('Sorted by risk_score desc',   data[0].risk_score >= data[1].risk_score, data.map(d=>d.risk_score));
  assert('Jhansi is first (84)',         data[0].name === 'Jhansi' && data[0].risk_score === 84, data[0]);
  assert('Has missing_crore field',     data[0].missing_crore !== undefined, data[0]);
  assert('Jhansi missing_crore > 0',    data[0].missing_crore > 0, data[0].missing_crore);
  assert('Has lat/lng',                 data[0].lat && data[0].lng, data[0]);
  assert('Pune is clean (risk 12)',     data.find(d=>d.name==='Pune')?.risk_score === 12, data);
}

async function testAlerts() {
  console.log('\n📌 [4] GET /api/alerts');
  const { status, data } = await req('GET', '/api/alerts');
  assert('Status 200',                status === 200, status);
  assert('Returns array',             Array.isArray(data), data);
  assert('5 alerts',                  data.length === 5, data.length);
  assert('Sorted by risk_score desc', data[0].risk_score >= data[1].risk_score, data.map(a=>a.risk_score));
  assert('Top alert = cash_black_hole', data[0].type === 'cash_black_hole', data[0].type);
  assert('Has district name',         data[0].district === 'Jhansi', data[0].district);
  assert('All 4 alert types present', 
    ['cash_black_hole','bid_anomaly','ghost_cluster','payment_frozen'].every(t => data.some(a=>a.type===t)), 
    data.map(a=>a.type));
  assert('No resolved alerts',        data.every(a => a.status !== 'resolved'), data.map(a=>a.status));
}

async function testContracts() {
  console.log('\n📌 [5] GET /api/contract/:id');
  const NH44 = 'c1000000-0000-0000-0000-000000000001';
  const PUNE = 'c1000000-0000-0000-0000-000000000003';

  // Jhansi contract — flagged
  let { status, data } = await req('GET', `/api/contract/${NH44}`);
  assert('Status 200',                  status === 200, status);
  assert('Correct contract name',       data.name === 'NH-44 Road Repair, Jhansi', data.name);
  assert('Risk score 79',               data.risk_score === 79, data.risk_score);
  assert('Status flagged',              data.status === 'flagged', data.status);
  assert('phase2_frozen = true',        data.phase2_frozen === true, data.phase2_frozen);
  assert('Has 4 payments',              data.payments?.length === 4, data.payments?.length);
  assert('Milestone 2 blocked',         data.payments?.find(p=>p.milestone===2)?.status === 'blocked', data.payments);
  assert('Milestone 1 released',        data.payments?.find(p=>p.milestone===1)?.status === 'released', data.payments);
  assert('Has tx log',                  Array.isArray(data.transaction_log) && data.transaction_log.length > 0, data.transaction_log);
  assert('Tx log has tx_hash',          data.transaction_log[0]?.tx_hash?.length > 0, data.transaction_log[0]);
  assert('Bid 80% above benchmark',     data.bid_anomaly_pct === 80, data.bid_anomaly_pct);

  // Pune contract — clean
  const p = await req('GET', `/api/contract/${PUNE}`);
  assert('Pune contract clean',         p.data.status === 'clean', p.data.status);
  assert('Pune phase2_frozen = false',  p.data.phase2_frozen === false, p.data.phase2_frozen);
  assert('Pune has 3 released payments',p.data.payments?.filter(pm=>pm.status==='released').length === 3, p.data.payments);

  // Not found
  const nf = await req('GET', '/api/contract/00000000-0000-0000-0000-000000000000');
  assert('Unknown ID → 404',            nf.status === 404, nf.status);
}

async function testSchemes() {
  console.log('\n📌 [6] GET /api/schemes/:districtId');
  const JHANSI = 'a1000000-0000-0000-0000-000000000001';
  const PUNE   = 'a1000000-0000-0000-0000-000000000002';

  let { status, data } = await req('GET', `/api/schemes/${JHANSI}`);
  assert('Status 200',              status === 200, status);
  assert('2 schemes for Jhansi',    data.length === 2, data.length);
  assert('Sorted by risk desc',     data[0].risk_score >= data[1].risk_score, data.map(s=>s.risk_score));
  assert('PM-KISAN flagged',        data[0].status === 'flagged', data[0].status);
  assert('Has missing_crore',       data[0].missing_crore > 0, data[0].missing_crore);
  assert('Has return_rate',         typeof data[0].return_rate === 'number', data[0].return_rate);
  assert('PM-KISAN return_rate ~22%', data[0].return_rate < 0.3, data[0].return_rate);

  const p = await req('GET', `/api/schemes/${PUNE}`);
  assert('Pune scheme = clean',     p.data[0]?.status === 'clean', p.data[0]?.status);
  assert('Pune return_rate > 85%',  p.data[0]?.return_rate > 0.85, p.data[0]?.return_rate);
}

async function testRiskScore() {
  console.log('\n📌 [7] GET /api/risk-score/:id');
  const NH44   = 'c1000000-0000-0000-0000-000000000001';
  const SCHEME = 'b1000000-0000-0000-0000-000000000001';
  const PUNE_P = 'c1000000-0000-0000-0000-000000000003';

  // Project risk score
  let { status, data } = await req('GET', `/api/risk-score/${NH44}?type=project`);
  assert('Status 200',                status === 200, status);
  assert('entity_type = project',     data.entity_type === 'project', data.entity_type);
  assert('risk_level = critical',     data.risk_level === 'critical', data.risk_level);
  assert('Has breakdown',             data.breakdown !== undefined, data.breakdown);
  assert('Breakdown has bid_anomaly', data.breakdown.bid_anomaly > 0, data.breakdown);
  assert('Has flags array',           Array.isArray(data.flags), data.flags);

  // Scheme risk score
  const s = await req('GET', `/api/risk-score/${SCHEME}?type=scheme`);
  assert('Scheme type returned',      s.data.entity_type === 'scheme', s.data.entity_type);
  assert('Has cash_return_rate',      s.data.cash_return_rate !== undefined, s.data);
  assert('Has ghost_count',           s.data.ghost_count >= 0, s.data.ghost_count);
  assert('CRR < 0.3 (22%)',          s.data.cash_return_rate < 0.3, s.data.cash_return_rate);

  // Pune project — clean
  const pp = await req('GET', `/api/risk-score/${PUNE_P}?type=project`);
  assert('Pune risk_level = clean',   pp.data.risk_level === 'clean', pp.data.risk_level);

  // Not found
  const nf = await req('GET', '/api/risk-score/00000000-0000-0000-0000-000000000099');
  assert('Unknown → 404',             nf.status === 404, nf.status);
}

async function testReport() {
  console.log('\n📌 [8] POST /api/report');

  // Happy path
  let { status, data } = await req('POST', '/api/report', {
    type: 'citizen', category: 'road_quality',
    project_id: 'c1000000-0000-0000-0000-000000000001',
    district_id: 'a1000000-0000-0000-0000-000000000001',
    description: 'Large potholes on NH-44 near SBI branch, dangerous for traffic',
    photo_url: 'https://example.com/photo1.jpg',
    gps_lat: 25.4484, gps_lng: 78.5685,
    submitted_by: 'citizen_9876543210'
  });
  assert('Status 201',             status === 201, status);
  assert('Has report_id',          typeof data.report_id === 'string', data);
  assert('Status = received',      data.status === 'received', data.status);
  assert('Immutable message',      data.message.includes('permanently recorded'), data.message);

  // Report without project_id (district-only)
  const r2 = await req('POST', '/api/report', {
    type: 'citizen', category: 'corruption',
    district_id: 'a1000000-0000-0000-0000-000000000001',
    description: 'Funds not reaching beneficiaries',
    gps_lat: 25.45, gps_lng: 78.57,
  });
  assert('No project_id accepted', r2.status === 201, r2.status);

  // Missing required fields
  const bad = await req('POST', '/api/report', { type: 'citizen' });
  assert('Missing fields → 400',   bad.status === 400, bad.status);
}

async function testInspection() {
  console.log('\n📌 [9] POST /api/inspection (Auditor — triggers payment freeze)');

  // Rejected inspection → should freeze next pending milestone
  const NH44 = 'c1000000-0000-0000-0000-000000000001';
  let { status, data } = await req('POST', '/api/inspection', {
    project_id: NH44,
    auditor_id: 'auditor_001',
    gps_lat: 25.4484, gps_lng: 78.5685,
    photos: ['photo1.jpg', 'photo2.jpg'],
    checklist: {
      asphalt_thickness: 'fail',
      road_width: 'fail',
      drainage: 'pass',
      road_marking: 'fail',
    },
    verdict: 'rejected',
    notes: 'Asphalt thickness only 2 inches, spec requires 4. Road width 6m, spec 8m.',
  });
  assert('Status 201',              status === 201, status);
  assert('Has inspection_id',       typeof data.inspection_id === 'string', data);
  assert('Has tx_hash',             typeof data.tx_hash === 'string' && data.tx_hash.length === 64, data.tx_hash);
  assert('Verdict = rejected',      data.verdict === 'rejected', data.verdict);
  assert('Payment freeze triggered',data.payment_action.includes('frozen'), data.payment_action);

  // Approved inspection (Pune — clean project)
  const r2 = await req('POST', '/api/inspection', {
    project_id: 'c1000000-0000-0000-0000-000000000003',
    auditor_id: 'auditor_002',
    gps_lat: 18.5204, gps_lng: 73.8567,
    checklist: { road_width: 'pass', asphalt: 'pass', drainage: 'pass' },
    verdict: 'approved',
    notes: 'All specs met. Excellent work.',
  });
  assert('Approved inspection 201',           r2.status === 201, r2.status);
  assert('Approved — no freeze',              !r2.data.payment_action?.includes('frozen'), r2.data.payment_action);

  // Missing required fields
  const bad = await req('POST', '/api/inspection', { project_id: NH44 });
  assert('Missing fields → 400',    bad.status === 400, bad.status);

  // Unknown project
  const nf = await req('POST', '/api/inspection', {
    project_id: '00000000-0000-0000-0000-000000000000',
    gps_lat: 25.0, gps_lng: 78.0, verdict: 'approved',
  });
  assert('Unknown project → 404',   nf.status === 404, nf.status);
}

async function testInvoice() {
  console.log('\n📌 [10] POST /api/invoice');

  let { status, data } = await req('POST', '/api/invoice', {
    project_id: 'c1000000-0000-0000-0000-000000000001',
    contractor_id: 'xyz_construction',
    material: 'Bitumen Grade 60/70 — 450 MT',
    amount_cr: 1.8,
    invoice_url: 'https://example.com/invoice_001.pdf',
    gst_number: '09ABCDE1234F1Z5',
  });
  assert('Status 201',         status === 201, status);
  assert('Has invoice_id',     typeof data.invoice_id === 'string', data);
  assert('Has tx_hash',        typeof data.tx_hash === 'string' && data.tx_hash.length === 64, data);
  assert('Status = logged',    data.status === 'logged', data.status);

  // Missing required fields
  const bad = await req('POST', '/api/invoice', { project_id: 'c1000000-0000-0000-0000-000000000001' });
  assert('Missing material/amount → 400', bad.status === 400, bad.status);

  // Unknown project
  const nf = await req('POST', '/api/invoice', {
    project_id: '00000000-0000-0000-0000-000000000000',
    material: 'Steel', amount_cr: 1.0,
  });
  assert('Unknown project → 404', nf.status === 404, nf.status);
}

async function testMilestone() {
  console.log('\n📌 [11] POST /api/milestone');

  let { status, data } = await req('POST', '/api/milestone', {
    project_id: 'c1000000-0000-0000-0000-000000000002',
    milestone: 2,
    gps_lat: 25.4601, gps_lng: 78.5772,
    photos: ['site1.jpg', 'site2.jpg', 'site3.jpg'],
    documents: ['completion_cert.pdf'],
  });
  assert('Status 201',                  status === 201, status);
  assert('Has submission_id',           typeof data.submission_id === 'string', data);
  assert('Milestone number returned',   data.milestone === 2, data.milestone);
  assert('Status = under_review',       data.status === 'under_review', data.status);
  assert('3-layer message present',     data.message.includes('3-layer'), data.message);

  // Missing GPS
  const bad = await req('POST', '/api/milestone', { project_id: 'c1000000-0000-0000-0000-000000000002', milestone: 3 });
  assert('Missing GPS → 400',           bad.status === 400, bad.status);
}

async function testPayments() {
  console.log('\n📌 [12] GET /api/payments/:contractId');
  const NH44 = 'c1000000-0000-0000-0000-000000000001';
  const PUNE = 'c1000000-0000-0000-0000-000000000003';

  let { status, data } = await req('GET', `/api/payments/${NH44}`);
  assert('Status 200',              status === 200, status);
  assert('Has contractor name',     typeof data.contractor === 'string', data.contractor);
  assert('Has total_value_cr',      data.total_value_cr === 10, data.total_value_cr);
  assert('4 milestones',            data.milestones?.length === 4, data.milestones?.length);
  assert('M1 released',             data.milestones[0]?.status === 'released', data.milestones[0]);
  assert('M2 blocked with reason',  data.milestones[1]?.status === 'blocked' && data.milestones[1]?.block_reason, data.milestones[1]);
  assert('M3 pending or blocked',   ['pending','blocked'].includes(data.milestones[2]?.status), data.milestones[2]);

  // Pune — all released except last
  const p = await req('GET', `/api/payments/${PUNE}`);
  const released = p.data.milestones?.filter(m => m.status === 'released').length;
  assert('Pune: 3 milestones released', released === 3, released);

  // Not found
  const nf = await req('GET', '/api/payments/00000000-0000-0000-0000-000000000000');
  assert('Unknown → 404',           nf.status === 404, nf.status);
}

async function test404() {
  console.log('\n📌 [13] 404 Handler');
  const { status } = await req('GET', '/api/nonexistent');
  assert('Unknown route → 404', status === 404, status);
}

// ─── Run All ──────────────────────────────────────────────────────────────────
async function runAll() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║    TRACE Backend — Full API Test Suite       ║');
  console.log('╚══════════════════════════════════════════════╝');

  await testHealth();
  await testAuth();
  await testDistricts();
  await testAlerts();
  await testContracts();
  await testSchemes();
  await testRiskScore();
  await testReport();
  await testInspection();
  await testInvoice();
  await testMilestone();
  await testPayments();
  await test404();

  const total = passed + failed;
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed}/${total} passed  ${failed > 0 ? `(${failed} FAILED)` : '🎉 All passed!'}`);
  console.log(`║  Pass rate: ${Math.round(passed/total*100)}%`);
  console.log('╚══════════════════════════════════════════════╝\n');

  if (failed > 0) process.exit(1);
}

runAll().catch(err => {
  console.error('\n💥 Test runner crashed:', err.message);
  process.exit(1);
});

/**
 * TRACE Anomaly Detection Engine
 * Three detectors: Cash Return Rate (CRR), Ghost Accounts, Bid Collusion
 */

// ─── Cash Return Rate (CRR) ─────────────────────────────────────────────────
function calcCRRScore(returnedCrore, withdrawnCrore) {
  if (!withdrawnCrore || withdrawnCrore === 0) return 0;
  const rate = returnedCrore / withdrawnCrore;

  if (rate >= 0.85) return { score: Math.round((1 - rate) * 20), status: 'clean',    rate };
  if (rate >= 0.60) return { score: Math.round(21 + (0.84 - rate) / 0.24 * 29), status: 'watch',    rate };
  if (rate >= 0.40) return { score: Math.round(51 + (0.59 - rate) / 0.19 * 19), status: 'flagged',  rate };
  return { score: Math.round(71 + (0.39 - rate) / 0.39 * 29), status: 'critical', rate };
}

// ─── Ghost Account Detector ─────────────────────────────────────────────────
function detectGhostAccount(signals = {}) {
  const flags = [
    signals.new_account,        // created < 30 days before scheme launch
    signals.zero_history,       // no tx history except this credit
    signals.bulk_withdrawal,    // full amount withdrawn within 4 hours
    signals.same_gps,           // same GPS as 5+ other withdrawals
  ].filter(Boolean).length;

  return {
    isGhost: flags >= 2,
    flagCount: flags,
    score: flags >= 2 ? 25 : flags >= 1 ? 12 : 0,
  };
}

function calcGhostScore(ghostCount, totalBeneficiaries) {
  if (!totalBeneficiaries) return 0;
  const rate = ghostCount / totalBeneficiaries;
  if (rate >= 0.3) return 25;
  if (rate >= 0.1) return 15;
  if (rate >= 0.05) return 8;
  return 0;
}

// ─── Bid Collusion Detector ──────────────────────────────────────────────────
function detectBidCollusion({ contractValueCr, benchmarkHighCr, bidsReceived, sameDomainBids = 0, contractorWinRate = 0, bidProximityPct = 100 }) {
  const flags = [];

  const aboveBenchmarkPct = benchmarkHighCr > 0
    ? ((contractValueCr - benchmarkHighCr) / benchmarkHighCr) * 100
    : 0;

  if (aboveBenchmarkPct > 30) flags.push(`Bid ${aboveBenchmarkPct.toFixed(0)}% above benchmark ceiling`);
  if (sameDomainBids > 0)     flags.push(`${sameDomainBids} bids from same IP/domain`);
  if (contractorWinRate > 60) flags.push(`Contractor won ${contractorWinRate}% of tenders in district`);
  if (bidProximityPct < 2)    flags.push(`Competing bids within 2% of each other`);

  const bidScore = Math.min(20, flags.length * 7 + (aboveBenchmarkPct > 30 ? Math.min(13, aboveBenchmarkPct / 10) : 0));

  return {
    isSuspicious: flags.length > 0,
    flags,
    score: Math.round(bidScore),
    aboveBenchmarkPct: Math.round(aboveBenchmarkPct),
  };
}

// ─── Risk Score Combiner ────────────────────────────────────────────────────
function calcRiskScore({ crrScore = 0, ghostScore = 0, bidScore = 0, contractorCashScore = 0 }) {
  const total = Math.min(100, crrScore + ghostScore + bidScore + contractorCashScore);
  let level = 'clean';
  if (total > 65) level = 'critical';
  else if (total > 35) level = 'watch';

  return { total, level, breakdown: { cash_return_rate: crrScore, ghost_accounts: ghostScore, bid_anomaly: bidScore, contractor_cash_pattern: contractorCashScore } };
}

module.exports = {
  calcCRRScore,
  detectGhostAccount,
  calcGhostScore,
  detectBidCollusion,
  calcRiskScore,
};

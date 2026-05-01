const router = require('express').Router();
const supabase = require('../models/db');
const { calcCRRScore, detectBidCollusion, calcGhostScore } = require('../services/anomalyDetector');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const type = req.query.type || 'project';

  try {
    if (type === 'scheme') {
      const { data: s, error } = await supabase.from('schemes').select('*').eq('id', id).single();
      if (error || !s) return res.status(404).json({ error: 'Scheme not found' });

      const crr = calcCRRScore(s.returned_crore, s.withdrawn_crore);

      const { data: bens } = await supabase.from('beneficiaries').select('is_ghost').eq('scheme_id', id);
      const total = bens?.length || 0;
      const ghost_count = bens?.filter(b => b.is_ghost).length || 0;
      const ghostScore = calcGhostScore(ghost_count, total);

      return res.json({
        entity_id: id,
        entity_type: 'scheme',
        total_score: s.risk_score,
        breakdown: { cash_return_rate: crr.score, bid_anomaly: 0, ghost_accounts: ghostScore, contractor_cash_pattern: 0 },
        risk_level: s.risk_score >= 66 ? 'critical' : s.risk_score >= 36 ? 'watch' : 'clean',
        flagged_at: s.created_at,
        cash_return_rate: crr.rate,
        beneficiary_count: total,
        ghost_count,
      });
    }

    // Try project first
    const { data: p } = await supabase.from('projects').select('*').eq('id', id).single();
    if (p) {
      const bidResult = detectBidCollusion({ contractValueCr: p.contract_value_cr, benchmarkHighCr: p.benchmark_high_cr, bidsReceived: p.bids_received });
      const contractorCashScore = Math.min(20, Math.round(p.bid_anomaly_pct / 5));
      return res.json({
        entity_id: id,
        entity_type: 'project',
        total_score: p.risk_score,
        breakdown: { cash_return_rate: 0, bid_anomaly: bidResult.score, ghost_accounts: 0, contractor_cash_pattern: contractorCashScore },
        risk_level: p.risk_score >= 66 ? 'critical' : p.risk_score >= 36 ? 'watch' : 'clean',
        flagged_at: p.created_at,
        flags: bidResult.flags,
      });
    }

    // Fallback: contractor name search
    const { data: projects } = await supabase.from('projects').select('*').ilike('contractor_name', `%${id}%`).order('risk_score', { ascending: false }).limit(1);
    const proj = projects?.[0];
    if (!proj) return res.status(404).json({ error: 'Entity not found' });

    const bidResult = detectBidCollusion({ contractValueCr: proj.contract_value_cr, benchmarkHighCr: proj.benchmark_high_cr, bidsReceived: proj.bids_received });

    res.json({
      contractor_id: id,
      name: proj.contractor_name,
      risk_score: proj.risk_score,
      risk_level: proj.risk_score >= 66 ? 'high' : proj.risk_score >= 36 ? 'medium' : 'low',
      flags: bidResult.flags.length > 0 ? bidResult.flags : [
        `Bid was ${proj.bid_anomaly_pct}% above market benchmark`,
        `Cash withdrawal of ₹${proj.contract_value_cr} crore with no downstream deposits`,
      ],
    });
  } catch (err) {
    console.error('GET /api/risk-score/:id error:', err.message);
    res.status(500).json({ error: 'Failed to calculate risk score' });
  }
});

module.exports = router;

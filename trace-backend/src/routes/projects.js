const router = require('express').Router();
const supabase = require('../models/db');

// GET /api/projects — list all projects, optional ?district_id filter
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('projects')
      .select('*, districts(name)')
      .order('risk_score', { ascending: false });

    if (req.query.district_id) {
      query = query.eq('district_id', req.query.district_id);
    }

    const { data: projects, error } = await query;
    if (error) throw error;

    const result = projects.map(p => ({
      id: p.id,
      name: p.name,
      district_id: p.district_id,
      district_name: p.districts?.name || null,
      contractor_name: p.contractor_name,
      contract_value_cr: p.contract_value_cr,
      benchmark_low_cr: p.benchmark_low_cr,
      benchmark_high_cr: p.benchmark_high_cr,
      bid_anomaly_pct: p.bid_anomaly_pct,
      bids_received: p.bids_received,
      risk_score: p.risk_score,
      status: p.status,
      phase: p.phase,
      phase2_frozen: p.phase2_frozen,
      lat: p.lat,
      lng: p.lng,
      created_at: p.created_at,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/projects error:', err.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

module.exports = router;

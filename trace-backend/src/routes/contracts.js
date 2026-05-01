const router = require('express').Router();
const supabase = require('../models/db');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', id).single();
    if (pErr || !project) return res.status(404).json({ error: 'Contract not found' });

    const { data: payments } = await supabase
      .from('payments')
      .select('milestone, amount_cr, status, block_reason, expected_date, released_at')
      .eq('project_id', id)
      .order('milestone');

    const { data: txLog } = await supabase
      .from('transactions')
      .select('event_type, amount_cr, location, timestamp, tx_hash, metadata')
      .eq('entity_id', id)
      .eq('entity_type', 'project')
      .order('timestamp');

    const { data: reports } = await supabase
      .from('reports')
      .select('type, category, verdict, gps_lat, gps_lng, created_at, submitted_by')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      id: project.id,
      name: project.name,
      contractor_name: project.contractor_name,
      contract_value_cr: project.contract_value_cr,
      benchmark_low_cr: project.benchmark_low_cr,
      benchmark_high_cr: project.benchmark_high_cr,
      bid_anomaly_pct: project.bid_anomaly_pct,
      bids_received: project.bids_received,
      risk_score: project.risk_score,
      status: project.status,
      phase: project.phase,
      phase2_frozen: project.phase2_frozen,
      lat: project.lat,
      lng: project.lng,
      payments: payments || [],
      transaction_log: txLog || [],
      reports: reports || [],
    });
  } catch (err) {
    console.error('GET /api/contract/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

module.exports = router;

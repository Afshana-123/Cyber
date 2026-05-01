const router = require('express').Router();
const supabase = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const { data: alerts, error: aErr } = await supabase
      .from('alerts')
      .select('*, districts(name)')
      .neq('status', 'resolved')
      .order('risk_score', { ascending: false })
      .order('created_at', { ascending: false });

    if (aErr) throw aErr;

    const result = alerts.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      district: a.districts?.name || null,
      district_id: a.district_id,
      entity_id: a.entity_id,
      entity_type: a.entity_type,
      risk_score: a.risk_score,
      status: a.status,
      created_at: a.created_at,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/alerts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;

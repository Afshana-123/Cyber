const router = require('express').Router();
const supabase = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const { data: districts, error: dErr } = await supabase.from('districts').select('*').order('risk_score', { ascending: false });
    if (dErr) throw dErr;

    // Aggregate missing_crore from schemes
    const { data: schemes, error: sErr } = await supabase.from('schemes').select('district_id, withdrawn_crore, returned_crore');
    if (sErr) throw sErr;

    const missingByDistrict = {};
    for (const s of schemes) {
      missingByDistrict[s.district_id] = (missingByDistrict[s.district_id] || 0) + (s.withdrawn_crore - s.returned_crore);
    }

    const result = districts.map(d => ({
      ...d,
      missing_crore: parseFloat((missingByDistrict[d.id] || 0).toFixed(2)),
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/districts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

module.exports = router;

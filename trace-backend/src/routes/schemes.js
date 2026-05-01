const router = require('express').Router();
const supabase = require('../models/db');

router.get('/:districtId', async (req, res) => {
  const { districtId } = req.params;
  try {
    const { data: schemes, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('district_id', districtId)
      .order('risk_score', { ascending: false });

    if (error) throw error;

    // Get beneficiary counts
    const schemeIds = schemes.map(s => s.id);
    const { data: beneficiaries } = await supabase
      .from('beneficiaries')
      .select('scheme_id')
      .in('scheme_id', schemeIds);

    const countByScheme = {};
    for (const b of beneficiaries || []) {
      countByScheme[b.scheme_id] = (countByScheme[b.scheme_id] || 0) + 1;
    }

    const result = schemes.map(s => ({
      id: s.id,
      name: s.name,
      allocated_crore: s.allocated_crore,
      withdrawn_crore: s.withdrawn_crore,
      returned_crore: s.returned_crore,
      missing_crore: s.missing_crore,
      return_rate: s.return_rate,
      risk_score: s.risk_score,
      status: s.status,
      beneficiary_count: countByScheme[s.id] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/schemes/:districtId error:', err.message);
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

module.exports = router;

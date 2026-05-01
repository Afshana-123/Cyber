const router = require('express').Router();
const supabase = require('../models/db');

router.get('/:contractId', async (req, res) => {
  const { contractId } = req.params;
  try {
    const { data: proj, error: pErr } = await supabase.from('projects').select('id, name, contractor_name, contract_value_cr').eq('id', contractId).single();
    if (pErr || !proj) return res.status(404).json({ error: 'Contract not found' });

    const { data: payments, error: pmErr } = await supabase
      .from('payments')
      .select('milestone, amount_cr, status, block_reason, expected_date, released_at')
      .eq('project_id', contractId)
      .order('milestone');

    if (pmErr) throw pmErr;

    res.json({ contract_id: proj.id, contractor: proj.contractor_name, total_value_cr: proj.contract_value_cr, milestones: payments });
  } catch (err) {
    console.error('GET /api/payments/:contractId error:', err.message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;

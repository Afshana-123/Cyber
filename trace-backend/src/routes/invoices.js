const router = require('express').Router();
const supabase = require('../models/db');
const { logEvent } = require('../services/blockchainLogger');

router.post('/', async (req, res) => {
  const { project_id, contractor_id, material, amount_cr, invoice_url = '', gst_number = '' } = req.body;

  if (!project_id || !material || !amount_cr) {
    return res.status(400).json({ error: 'Missing required fields: project_id, material, amount_cr' });
  }

  try {
    const { data: proj, error } = await supabase.from('projects').select('district_id').eq('id', project_id).single();
    if (error || !proj) return res.status(404).json({ error: 'Project not found' });

    const tx = await logEvent({ eventType: 'withdraw', entityId: project_id, entityType: 'project', amountCr: amount_cr, location: 'Invoice Upload', districtId: proj.district_id, metadata: { material, invoice_url, gst_number, contractor_id } });

    res.status(201).json({ invoice_id: tx.id, tx_hash: tx.tx_hash, status: 'logged' });
  } catch (err) {
    console.error('POST /api/invoice error:', err.message);
    res.status(500).json({ error: 'Failed to submit invoice' });
  }
});

module.exports = router;

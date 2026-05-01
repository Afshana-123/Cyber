const router = require('express').Router();
const supabase = require('../models/db');
const { logEvent } = require('../services/blockchainLogger');

// POST /api/report
router.post('/report', async (req, res) => {
  const { type, category, project_id = null, district_id, description = '', photo_url = '', gps_lat, gps_lng, submitted_by } = req.body;

  if (!type || !category || !district_id || !gps_lat || !gps_lng) {
    return res.status(400).json({ error: 'Missing required fields: type, category, district_id, gps_lat, gps_lng' });
  }

  try {
    const { data: report, error } = await supabase
      .from('reports')
      .insert({ type, category, project_id: project_id || null, district_id, description, photo_url, gps_lat, gps_lng, submitted_by: submitted_by || type, immutable: true })
      .select('id, created_at')
      .single();

    if (error) throw error;

    if (project_id) {
      await logEvent({ eventType: 'freeze', entityId: project_id, entityType: 'project', amountCr: 0, location: `GPS: ${gps_lat},${gps_lng}`, districtId: district_id, metadata: { report_id: report.id, category, type } });
    }

    res.status(201).json({ report_id: report.id, status: 'received', message: 'Report submitted. It is now permanently recorded.', created_at: report.created_at });
  } catch (err) {
    console.error('POST /api/report error:', err.message);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// POST /api/inspection
router.post('/inspection', async (req, res) => {
  const { project_id, auditor_id, gps_lat, gps_lng, photos = [], checklist = {}, verdict, notes = '' } = req.body;

  if (!project_id || !gps_lat || !gps_lng || !verdict) {
    return res.status(400).json({ error: 'Missing required fields: project_id, gps_lat, gps_lng, verdict' });
  }

  try {
    const { data: proj, error: pErr } = await supabase.from('projects').select('district_id').eq('id', project_id).single();
    if (pErr || !proj) return res.status(404).json({ error: 'Project not found' });
    const { district_id } = proj;

    const failed = Object.values(checklist).filter(v => v === 'fail').length;

    const { data: report, error: rErr } = await supabase
      .from('reports')
      .insert({ type: 'auditor', category: 'inspection', project_id, district_id, description: notes, gps_lat, gps_lng, verdict, checklist, submitted_by: auditor_id || 'auditor', immutable: true })
      .select('id')
      .single();

    if (rErr) throw rErr;

    let paymentAction = 'Inspection recorded.';

    if (verdict === 'rejected') {
      // Find the lowest pending milestone and block it
      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('id, milestone, amount_cr')
        .eq('project_id', project_id)
        .eq('status', 'pending')
        .order('milestone')
        .limit(1);

      if (pendingPayments?.length > 0) {
        const pm = pendingPayments[0];
        await supabase.from('payments').update({ status: 'blocked', block_reason: `Inspection rejected: ${failed} checklist items failed` }).eq('id', pm.id);
        await supabase.from('projects').update({ phase2_frozen: true, status: 'flagged' }).eq('id', project_id);
        paymentAction = `Phase ${pm.milestone} payment of ₹${pm.amount_cr} crore frozen automatically`;
      }
    }

    const tx = await logEvent({ eventType: verdict === 'rejected' ? 'freeze' : 'allocate', entityId: project_id, entityType: 'project', amountCr: 0, location: `GPS: ${gps_lat},${gps_lng}`, districtId: district_id, metadata: { inspection_id: report.id, verdict, failed_items: failed } });

    res.status(201).json({ inspection_id: report.id, tx_hash: tx.tx_hash, verdict, payment_action: paymentAction });
  } catch (err) {
    console.error('POST /api/inspection error:', err.message);
    res.status(500).json({ error: 'Failed to submit inspection' });
  }
});

module.exports = router;

const router = require('express').Router();
const supabase = require('../models/db');
const { logEvent } = require('../services/blockchainLogger');

router.post('/', async (req, res) => {
  const { project_id, milestone, photos = [], gps_lat, gps_lng, documents = [] } = req.body;

  if (!project_id || !milestone || !gps_lat || !gps_lng) {
    return res.status(400).json({ error: 'Missing required fields: project_id, milestone, gps_lat, gps_lng' });
  }

  try {
    const { data: proj, error } = await supabase.from('projects').select('district_id').eq('id', project_id).single();
    if (error || !proj) return res.status(404).json({ error: 'Project not found' });

    await supabase.from('projects').update({ status: 'under_review' }).eq('id', project_id);

    const tx = await logEvent({ eventType: 'allocate', entityId: project_id, entityType: 'project', amountCr: 0, location: `GPS: ${gps_lat},${gps_lng}`, districtId: proj.district_id, metadata: { milestone, photos_count: photos.length, documents_count: documents.length } });

    res.status(201).json({ submission_id: tx.id, milestone, status: 'under_review', message: '3-layer verification triggered. Payment pending verification outcome.' });
  } catch (err) {
    console.error('POST /api/milestone error:', err.message);
    res.status(500).json({ error: 'Failed to submit milestone' });
  }
});

module.exports = router;

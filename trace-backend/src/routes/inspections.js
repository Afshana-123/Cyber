const router = require('express').Router();
const supabase = require('../models/db');

// GET /api/inspections — list all inspection-type reports
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('reports')
      .select('*, projects(name, contractor_name)')
      .eq('type', 'auditor')
      .order('created_at', { ascending: false });

    if (req.query.project_id) {
      query = query.eq('project_id', req.query.project_id);
    }

    const { data: inspections, error } = await query;
    if (error) throw error;

    const result = inspections.map(i => ({
      id: i.id,
      project_id: i.project_id,
      project_name: i.projects?.name || null,
      contractor_name: i.projects?.contractor_name || null,
      verdict: i.verdict,
      checklist: i.checklist,
      gps_lat: i.gps_lat,
      gps_lng: i.gps_lng,
      submitted_by: i.submitted_by,
      description: i.description,
      created_at: i.created_at,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/inspections error:', err.message);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

module.exports = router;

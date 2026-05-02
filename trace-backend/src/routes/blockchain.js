const router = require('express').Router();
const supabase = require('../models/db');

/**
 * GET /api/blockchain
 * Returns the last N transactions from the immutable ledger.
 * Query params:
 *   ?limit=50  (default 50, max 200)
 *   ?entity_id=<uuid>  (filter by project/district/scheme)
 *   ?event_type=freeze|allocate|flag|report
 */
router.get('/', async (req, res) => {
  const limit     = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const entityId  = req.query.entity_id || null;
  const eventType = req.query.event_type || null;

  try {
    let query = supabase
      .from('transactions')
      .select('id, tx_hash, event_type, entity_id, entity_type, amount_cr, location, district_id, timestamp, metadata, districts(name, state)')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (entityId)  query = query.eq('entity_id', entityId);
    if (eventType) query = query.eq('event_type', eventType);

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      total: data.length,
      ledger: data.map(tx => ({
        tx_hash:     tx.tx_hash,
        event_type:  tx.event_type,
        entity_id:   tx.entity_id,
        entity_type: tx.entity_type,
        amount_cr:   tx.amount_cr,
        location:    tx.location,
        district:    tx.districts?.name || null,
        state:       tx.districts?.state || null,
        timestamp:   tx.timestamp,
        metadata:    tx.metadata,
      })),
    });
  } catch (err) {
    console.error('GET /api/blockchain error:', err.message);
    res.status(500).json({ error: 'Failed to fetch blockchain ledger' });
  }
});

/**
 * GET /api/blockchain/:txHash
 * Returns a single transaction by its hash — proof-of-record lookup.
 */
router.get('/:txHash', async (req, res) => {
  const { txHash } = req.params;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, districts(name, state)')
      .eq('tx_hash', txHash)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Transaction not found' });

    res.json({
      tx_hash:     data.tx_hash,
      event_type:  data.event_type,
      entity_id:   data.entity_id,
      entity_type: data.entity_type,
      amount_cr:   data.amount_cr,
      location:    data.location,
      district:    data.districts?.name || null,
      state:       data.districts?.state || null,
      timestamp:   data.timestamp,
      metadata:    data.metadata,
      immutable:   true,
      verified:    true,
    });
  } catch (err) {
    console.error('GET /api/blockchain/:txHash error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;

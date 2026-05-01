const crypto = require('crypto');
const supabase = require('../models/db');

async function logEvent({ eventType, entityId, entityType, amountCr = 0, location = 'System', districtId = null, metadata = {} }) {
  const now = new Date().toISOString();
  const raw = `${eventType}:${entityId}:${amountCr}:${now}:${Math.random()}`;
  const txHash = crypto.createHash('sha256').update(raw).digest('hex');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      event_type: eventType,
      entity_id: entityId,
      entity_type: entityType,
      amount_cr: amountCr,
      location,
      district_id: districtId,
      metadata,
      tx_hash: txHash,
    })
    .select('id, tx_hash, timestamp')
    .single();

  if (error) throw new Error(`blockchainLogger error: ${error.message}`);
  return data;
}

module.exports = { logEvent };

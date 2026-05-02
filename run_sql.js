const fs = require('fs');

async function runSQL() {
  const url = 'https://oklmvtkbjqkqirhwyzez.supabase.co/pg';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbG12dGtianFrcWlyaHd5emV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY0MjUxMSwiZXhwIjoyMDkzMjE4NTExfQ.mvCAn733Gv7-ffONdsAIgDd7zRSofcEMmjchwbo2k14';
  
  const query = `
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'received' CHECK (status IN ('received', 'under_investigation', 'resolved'));
    UPDATE reports SET status = 'received' WHERE status IS NULL;
    NOTIFY pgrst, 'reload schema';
  `;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({ query })
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

runSQL();

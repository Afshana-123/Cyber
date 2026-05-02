/**
 * Upload generated report photos to Supabase Storage and update DB records.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oklmvtkbjqkqirhwyzez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbG12dGtianFrcWlyaHd5emV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY0MjUxMSwiZXhwIjoyMDkzMjE4NTExfQ.mvCAn733Gv7-ffONdsAIgDd7zRSofcEMmjchwbo2k14'
);

const BUCKET = 'report-photos';
const BASE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', 'fb1ae2d3-2a51-4ae1-b94b-1f3edc08c16c');

// Images mapped to report categories
const IMAGES = {
  citizen: [
    { file: 'poor_quality_road_1777689245511.png', storageName: 'poor_quality_road.png' },
    { file: 'cracked_road_closeup_1777689304986.png', storageName: 'cracked_road_closeup.png' },
  ],
  auditor: [
    { file: 'inspection_site_1777689271794.png', storageName: 'inspection_site.png' },
    { file: 'material_inspection_1777689324983.png', storageName: 'material_inspection.png' },
  ],
};

async function uploadImage(localFile, storagePath) {
  const fileBuffer = fs.readFileSync(localFile);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  // Return public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function main() {
  // 1. Upload all images
  console.log('📸 Uploading images to Supabase Storage...\n');
  const urls = { citizen: [], auditor: [] };

  for (const type of ['citizen', 'auditor']) {
    for (const img of IMAGES[type]) {
      const localPath = path.join(BASE_DIR, img.file);
      if (!fs.existsSync(localPath)) {
        console.log(`  ⚠ File not found: ${img.file}`);
        continue;
      }
      const publicUrl = await uploadImage(localPath, `seed/${img.storageName}`);
      urls[type].push(publicUrl);
      console.log(`  ✅ ${type}: ${img.storageName} → ${publicUrl}`);
    }
  }

  // 2. Fetch all reports
  console.log('\n📋 Fetching reports from database...');
  const { data: reports, error: fetchErr } = await supabase
    .from('reports')
    .select('id, type, category')
    .order('created_at', { ascending: true });

  if (fetchErr) { console.error('Fetch error:', fetchErr.message); return; }
  console.log(`   Found ${reports.length} reports\n`);

  // 3. Update each report with a relevant photo URL (round-robin across available images)
  console.log('🔄 Updating report photo_url fields...\n');
  let citizenIdx = 0, auditorIdx = 0;

  for (const report of reports) {
    let photoUrl;
    if (report.type === 'auditor' && urls.auditor.length > 0) {
      photoUrl = urls.auditor[auditorIdx % urls.auditor.length];
      auditorIdx++;
    } else if (urls.citizen.length > 0) {
      photoUrl = urls.citizen[citizenIdx % urls.citizen.length];
      citizenIdx++;
    }

    if (photoUrl) {
      const { error: upErr } = await supabase
        .from('reports')
        .update({ photo_url: photoUrl })
        .eq('id', report.id);

      if (upErr) {
        console.log(`  ❌ ${report.id.slice(0, 8)} — ${upErr.message}`);
      } else {
        console.log(`  ✅ ${report.id.slice(0, 8)} (${report.type}/${report.category}) → ${photoUrl.split('/').pop()}`);
      }
    }
  }

  console.log('\n✅ Done! All reports updated with relevant photos.');
}

main().catch(console.error);

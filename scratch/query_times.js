const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/speed_logs?select=checked_at,airport_id&order=checked_at.desc&limit=50`,
    { headers }
  );
  if (!resp.ok) {
    console.error(await resp.text());
    return;
  }
  const logs = await resp.json();
  
  // Group by checked_at to find unique run times
  const runTimes = Array.from(new Set(logs.map(l => l.checked_at))).sort().reverse();
  console.log('Unique run times of recent checks:');
  runTimes.forEach(t => {
    const utcDate = new Date(t);
    const bjTime = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000).toISOString().replace('Z', ' +08:00');
    console.log(`UTC: ${t} => Beijing: ${bjTime}`);
  });
}

main().catch(console.error);

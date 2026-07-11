const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  console.log('Querying latest speed_logs...');
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/speed_logs?select=checked_at,airport_id,website_ok,sub_ok&order=checked_at.desc&limit=10`,
    { headers }
  );
  if (!resp.ok) {
    console.error('Failed to query:', await resp.text());
    return;
  }
  const logs = await resp.json();
  console.log('Latest 10 speed logs:');
  console.log(JSON.stringify(logs, null, 2));

  console.log('Querying site stats via RPC get_site_stats...');
  const rpcResp = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/get_site_stats`,
    { headers }
  );
  if (!rpcResp.ok) {
    console.error('Failed to query RPC:', await rpcResp.text());
    return;
  }
  const stats = await rpcResp.json();
  console.log('RPC get_site_stats response:');
  console.log(JSON.stringify(stats, null, 2));

  // Also query system time on the Supabase server
  console.log('Current local time in JS:', new Date().toISOString());
}

main().catch(console.error);

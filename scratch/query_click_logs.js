const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  console.log('Querying click_logs...');
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/click_logs?select=*&limit=10`,
    { headers }
  );
  if (!resp.ok) {
    console.error('Failed to query click_logs:', await resp.text());
  } else {
    const logs = await resp.json();
    console.log('Click logs count:', logs.length);
    console.log('Click logs:', JSON.stringify(logs, null, 2));
  }

  console.log('\nQuerying airports...');
  const airResp = await fetch(
    `${SUPABASE_URL}/rest/v1/airports?select=id,name,balance,bid_price,score&status=eq.active`,
    { headers }
  );
  if (!airResp.ok) {
    console.error('Failed to query airports:', await airResp.text());
  } else {
    const airports = await airResp.json();
    console.log('Airports list:');
    console.log(JSON.stringify(airports, null, 2));
  }
}

main().catch(console.error);

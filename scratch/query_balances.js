const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  console.log('Querying airports...');
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/airports?select=id,name,balance,bid_price,score&status=eq.active`,
    { headers }
  );
  if (!resp.ok) {
    console.error('Failed to query:', await resp.text());
    return;
  }
  const airports = await resp.json();
  console.log('Airports list:');
  console.log(JSON.stringify(airports, null, 2));
}

main().catch(console.error);

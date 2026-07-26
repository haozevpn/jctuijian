const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  console.log('Inserting test click log...');
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/click_logs`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        airport_id: 'jilian',
        from_page: 'test_script',
        charged: true,
        amount: 0.50,
      }),
    }
  );

  console.log('Insert status:', resp.status, resp.statusText);
  console.log('Insert body:', await resp.text());
}

main().catch(console.error);

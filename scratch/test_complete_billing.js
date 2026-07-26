const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  // 1. Query initial balance
  console.log('1. Querying initial balance for airport "jilian"...');
  let resp = await fetch(`${SUPABASE_URL}/rest/v1/airports?select=balance&id=eq.jilian`, { headers });
  if (!resp.ok) {
    console.error('Failed to query initial balance:', await resp.text());
    return;
  }
  const initialData = await resp.json();
  const initialBalance = parseFloat(initialData[0].balance);
  console.log(`Initial Balance: ¥${initialBalance.toFixed(2)}`);

  // 2. Insert click log
  console.log('\n2. Inserting click log for "jilian" with amount 0.50...');
  resp = await fetch(`${SUPABASE_URL}/rest/v1/click_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      airport_id: 'jilian',
      from_page: 'verification_script',
      charged: true,
      amount: 0.50,
    }),
  });
  console.log('Insert status:', resp.status, resp.statusText);
  if (!resp.ok) {
    console.error('Insert failed:', await resp.text());
    return;
  }
  console.log('Insert succeeded!');

  // 3. Wait for trigger to complete
  console.log('\n3. Waiting 1.5 seconds for DB trigger to deduct balance...');
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 4. Query final balance
  console.log('4. Querying final balance for airport "jilian"...');
  resp = await fetch(`${SUPABASE_URL}/rest/v1/airports?select=balance&id=eq.jilian`, { headers });
  if (!resp.ok) {
    console.error('Failed to query final balance:', await resp.text());
    return;
  }
  const finalData = await resp.json();
  const finalBalance = parseFloat(finalData[0].balance);
  console.log(`Final Balance: ¥${finalBalance.toFixed(2)}`);

  // 5. Compare
  const diff = initialBalance - finalBalance;
  console.log(`\nDiff: ¥${diff.toFixed(2)} (Expected deduction: ¥0.50)`);
  if (Math.abs(diff - 0.50) < 0.001) {
    console.log('✅ SUCCESS: CPC billing is working perfectly!');
  } else {
    console.log('❌ FAILURE: Balance was not deducted correctly.');
  }
}

main().catch(console.error);

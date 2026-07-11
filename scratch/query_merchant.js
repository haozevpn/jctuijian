const SUPABASE_URL  = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

fetch(`${SUPABASE_URL}/rest/v1/airports?select=id,name,merchant_email,merchant_pass,status&name=eq.边界云`, {
  headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
})
.then(r => r.json())
.then(rows => {
  if (!rows || rows.length === 0) { console.log('未找到边界云'); return; }
  rows.forEach(r => {
    console.log('机场名称:', r.name);
    console.log('商户邮箱:', r.merchant_email);
    console.log('登录密码:', r.merchant_pass);
    console.log('账户状态:', r.status);
  });
})
.catch(e => console.error(e));

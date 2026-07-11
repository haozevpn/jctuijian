// diagnose.js — 检查 GitHub Actions 是否正常运行
const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';
const h = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function main() {
  // 1. 检查最近 48 小时 speed_logs 有无新记录
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const logsResp = await fetch(
    `${SUPABASE_URL}/rest/v1/speed_logs?select=airport_id,checked_at,website_ok&checked_at=gte.${since48h}&order=checked_at.desc&limit=20`,
    { headers: h }
  );
  const logs = await logsResp.json();

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  诊断报告：GitHub Actions 监测执行状态');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!Array.isArray(logs) || logs.length === 0) {
    console.log('');
    console.log('  ❌ 过去 48 小时 speed_logs 完全没有新记录！');
    console.log('');
    console.log('  可能原因：');
    console.log('  1. GitHub Actions 被自动禁用（仓库超过 60 天无提交）');
    console.log('  2. SUPABASE_SERVICE_KEY 密钥未配置到 GitHub Secrets');
    console.log('  3. check.py 运行报错（缺少 Python 依赖）');
    console.log('');
    console.log('  解决方案：');
    console.log('  → 前往 https://github.com/haozevpn/vpn/actions');
    console.log('     查看是否有 Airport Monitor 最近运行记录');
    console.log('     如果 Actions 被禁用，点击 "Enable workflow" 重新启用');
  } else {
    const latest = new Date(logs[0].checked_at);
    const minutesAgo = Math.round((Date.now() - latest.getTime()) / 60000);
    console.log('');
    console.log(`  ✅ 最近一次检测：${logs[0].checked_at} (${minutesAgo} 分钟前)`);
    console.log(`  📊 过去 48 小时共 ${logs.length} 条检测记录`);
    console.log('');
    console.log('  最近 10 条记录（按时间倒序）：');
    logs.slice(0, 10).forEach(r => {
      const t = new Date(r.checked_at).toLocaleString('zh-CN');
      console.log(`    ${t}  ${r.airport_id.padEnd(20)}  官网: ${r.website_ok ? '✅' : '❌'}`);
    });
  }

  // 2. 检查当前分数分布
  const airResp = await fetch(
    `${SUPABASE_URL}/rest/v1/airports?select=name,score,score_delta,updated_at&status=eq.active&order=score.desc`,
    { headers: h }
  );
  const airports = await airResp.json();

  console.log('');
  console.log('  当前数据库评分（实时）：');
  airports.forEach(a => {
    const updated = new Date(a.updated_at).toLocaleString('zh-CN');
    console.log(`    ${(a.name||'').padEnd(14)} 评分: ${String(a.score).padStart(5)}  delta: ${String(a.score_delta).padStart(7)}  更新时间: ${updated}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(e => console.error('诊断异常:', e));

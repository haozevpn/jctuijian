const SUPABASE_URL      = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function updateScores() {
  console.log("正在连接 Supabase REST API 并修复评分为 0 的机场...");
  try {
    // 1. 获取所有机场
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/airports?select=id,name,score`,
      {
        headers: {
          'apikey':        SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!resp.ok) {
      console.error("❌ 获取数据失败，HTTP 状态码:", resp.status);
      return;
    }
    const airports = await resp.json();
    console.log("当前机场数据:");
    console.log(airports);

    // 2. 遍历并更新评分为 0 的机场
    for (const airport of airports) {
      if (airport.score === 0 || airport.score === null) {
        console.log(`正在更新 ${airport.name} (${airport.id}) 的评分为 75.0...`);
        const updateResp = await fetch(
          `${SUPABASE_URL}/rest/v1/airports?id=eq.${airport.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey':        SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type':  'application/json',
              'Prefer':        'return=representation'
            },
            body: JSON.stringify({ score: 75.0 })
          }
        );
        if (updateResp.ok) {
          console.log(`✅ ${airport.name} 更新成功！`);
        } else {
          console.error(`❌ ${airport.name} 更新失败，状态码:`, updateResp.status);
        }
      }
    }
    console.log("所有修复更新操作已完成！");
  } catch (err) {
    console.error("❌ 操作异常:", err);
  }
}

updateScores();

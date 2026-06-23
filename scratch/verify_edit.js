// scratch/verify_edit.js
const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function run() {
  console.log('=== 开始程序化验证广告编辑 PATCH API ===');
  
  // 1. 查询当前极连机场 (jilian) 的广告活动 (ID: 1)
  console.log('1. 查询 ID: 1 的广告活动...');
  let resp = await fetch(`${SUPABASE_URL}/rest/v1/promotions?id=eq.1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  if (!resp.ok) {
    throw new Error('查询失败: ' + await resp.text());
  }
  
  const original = (await resp.json())[0];
  console.log('当前广告数据:', original);

  // 2. 修改广告属性（保存原始值，以便稍后恢复）
  const originalTitle = original.title;
  const testTitle = '极连机场年中特惠活动-' + Math.floor(Math.random() * 1000);
  
  console.log(`2. 发送 PATCH 请求，将活动标题修改为: "${testTitle}"...`);
  let patchResp = await fetch(`${SUPABASE_URL}/rest/v1/promotions?id=eq.1`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      title: testTitle
    })
  });

  if (!patchResp.ok) {
    throw new Error('修改失败: ' + await patchResp.text());
  }

  const patched = await patchResp.json();
  console.log('PATCH 响应数据:', patched);

  // 3. 验证是否修改成功
  console.log('3. 验证数据是否在数据库中生效...');
  let verifyResp = await fetch(`${SUPABASE_URL}/rest/v1/promotions?id=eq.1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  const verified = (await verifyResp.json())[0];
  console.log('最新查询结果:', verified);

  if (verified.title === testTitle) {
    console.log('✅ 数据库 PATCH 接口测试成功！数据已实时更新。');
  } else {
    throw new Error(`❌ 验证失败：标题应为 "${testTitle}"，但在数据库中为 "${verified.title}"`);
  }

  // 4. 恢复原始值
  console.log(`4. 恢复广告标题为原始值: "${originalTitle}"...`);
  let revertResp = await fetch(`${SUPABASE_URL}/rest/v1/promotions?id=eq.1`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      title: originalTitle
    })
  });

  if (revertResp.ok) {
    console.log('✅ 恢复成功！');
  } else {
    console.warn('⚠️ 恢复失败:', await revertResp.text());
  }

  console.log('=== 验证程序全部完成 ===');
}

run().catch(err => {
  console.error('验证中发生错误:', err);
  process.exit(1);
});

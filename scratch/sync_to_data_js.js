const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jsdvhryfmuadxaijmsjb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ufJ4lt-JiL9ONh5X9X6ZHw_PE58RM1F';

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  console.log('Fetching active airports from Supabase...');
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/airports?select=id,name,website_url,affiliate_url,tags,tag_colors,highlight,conclusion,price,category,score,score_delta,days_online,status&status=eq.active`,
    { headers }
  );

  if (!resp.ok) {
    console.error('Failed to query:', await resp.text());
    return;
  }

  const rows = await resp.json();
  console.log(`Fetched ${rows.length} airports.`);

  // Map to the structure expected by assets/data.js
  const airports = rows.map(row => ({
    id: row.id,
    name: row.name,
    score: row.score !== null ? Number(row.score) : 75.0,
    scoreDelta: row.score_delta || '+0.00',
    url: row.affiliate_url || row.website_url || '',
    reportSlug: row.id,
    tags: row.tags || [],
    tagColors: row.tag_colors || [],
    daysOnline: row.days_online || 0,
    highlight: row.highlight || '',
    conclusion: row.conclusion || '',
    category: row.category || ["today"],
    price: row.price || '',
    risk: null,
    status: row.status
  }));

  // Sort them descending by score
  airports.sort((a, b) => b.score - a.score);

  const dataJsPath = path.join(__dirname, '..', 'assets', 'data.js');

  const dataContent = `// ============================================================
//  机场数据源 — jctuijian.com
//  注意：订阅链接(sub_url)含私密 token，只存在 Supabase 数据库中
//       本文件仅含前端展示所需的公开信息
// ============================================================

window.AIRPORTS_DATA = ${JSON.stringify(airports, null, 2)};

// ── 标签颜色映射 ──────────────────────────────────────────
window.TAG_COLOR_MAP = {
  blue:   { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  green:  { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  yellow: { bg: "#FEFCE8", text: "#CA8A04", border: "#FDE68A" },
  purple: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  orange: { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  red:    { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  dark:   { bg: "#1F2937", text: "#F9FAFB", border: "#374151" },
};

// ── 分类配置 ──────────────────────────────────────────────
window.CATEGORIES = [
  { key: "today",  label: "今日推荐", icon: "" },
  { key: "stable", label: "长期稳定", icon: "" },
  { key: "value",  label: "性价比",   icon: "" },
  { key: "new",    label: "新入榜",   icon: "" },
  { key: "risk",   label: "风险预警", icon: "" },
];

// ── 站点统计 ──────────────────────────────────────────────
const _d = new Date();
const _year = _d.getFullYear();
const _month = String(_d.getMonth() + 1).padStart(2, '0');
const _date = String(_d.getDate()).padStart(2, '0');

window.SITE_STATS = {
  monitored: ${airports.length},
  speedTests: 1240,
  lastUpdate: "刚刚更新",
  detectDate: \`\${_year}-\${_month}-\${_date}\`,
};
`;

  fs.writeFileSync(dataJsPath, dataContent, 'utf8');
  console.log('Successfully updated assets/data.js with latest Supabase data.');
}

main().catch(console.error);

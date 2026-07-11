const fs = require('fs');
const path = require('path');

const airportsJsonPath = path.join(__dirname, 'temp_airports.json');
const dataJsPath = path.join(__dirname, '..', 'assets', 'data.js');

const airports = JSON.parse(fs.readFileSync(airportsJsonPath, 'utf8'));

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
console.log('Successfully updated assets/data.js with ' + airports.length + ' airports.');

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
    `${SUPABASE_URL}/rest/v1/airports?select=id,name,website_url,affiliate_url,tags,tag_colors,highlight,conclusion,price,category,score,score_delta,days_online,status,plan_monthly,plan_quarterly,plan_halfyear,plan_yearly,plan_trial,plan_unlimited,price_yearly,tg_group_url,tg_channel_url,tg_group_members,ticket_support,customer_bot,tg_active_at&status=eq.active`,
    { headers }
  );

  if (!resp.ok) {
    console.error('Failed to query Supabase:', await resp.text());
    return;
  }

  const rows = await resp.json();
  console.log(`Fetched ${rows.length} active airports.`);

  // 1. Map and write assets/data.js
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

  // Sort by score desc
  airports.sort((a, b) => b.score - a.score);

  const targetDir = path.resolve(__dirname, '..');
  const dataJsPath = path.join(targetDir, 'assets', 'data.js');

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
  detectDate: \`\${_year}-\$\{\_month\}-\$\{\_date\}\`,
};
`;

  fs.writeFileSync(dataJsPath, dataContent, 'utf8');
  console.log('Successfully synced data to assets/data.js.');

  // 2. Generate static HTML files for reports
  const templatePath = path.join(targetDir, 'report.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  for (const row of rows) {
    const destDir = path.join(targetDir, 'airports', row.id);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    let pageHtml = templateHtml;

    // A. Replace resource paths (make them absolute)
    pageHtml = pageHtml.replace(/href="assets\/style\.css"/g, 'href="/assets/style.css"');
    pageHtml = pageHtml.replace(/src="assets\/data\.js\?v=\d+"/g, 'src="/assets/data.js"');

    // B. Inject customized SEO tags (title, description, keywords, canonical)
    const titleRegex = /<title>机场测评与实时节点延迟报告 - JcTuijian<\/title>/;
    const customTitle = `<title>【${row.name}】官网链接与2026年最新测速报告 - 科学上网梯子与VPN推荐 - JcTuijian</title>\n  <meta name="description" content="【${row.name}】怎么样？本站提供${row.name}官网最新可用性监测与翻墙梯子测速，7x24小时全天候节点延迟与丢包率分析。最新测评结论：${row.conclusion || '该商户已完成入驻与资料审核，节点全天候稳定在线监控中。'}" />\n  <meta name="keywords" content="${row.name},${row.name}官网,${row.name}怎么样,${row.name}测评,机场推荐,梯子推荐,vpn推荐,VPN推荐" />\n  <link rel="canonical" href="https://jctuijian.com/airports/${row.id}/" />`;
    pageHtml = pageHtml.replace(titleRegex, customTitle);

    // C. Pre-render static content blocks in HTML
    pageHtml = pageHtml.replace(
      /<h1 class="hero-title" id="airport-name-title">加载中\.\.\.<\/h1>/,
      `<h1 class="hero-title" id="airport-name-title">${row.name} 机场评测报告</h1>`
    );
    pageHtml = pageHtml.replace(
      /<p class="hero-desc" id="airport-conclusion-text">正在从云端拉取该机场最新测速监控结论\.\.\.<\/p>/,
      `<p class="hero-desc" id="airport-conclusion-text">${row.highlight || '高速节点'}</p>`
    );

    // Replace the default long placeholder text for details
    const defaultDetailsPattern = /该商户已完成实名入驻与资料审核，线路正处于全天候监测中，节点通畅度高。本站评测数据全部基于真实监测，建议结合官网可达性、近期投诉、风险预警和30天趋势一起判断，不仅按单次测速决定是否长期使用。/;
    pageHtml = pageHtml.replace(
      defaultDetailsPattern,
      row.conclusion || '该商户已完成实名入驻与资料审核，线路正处于全天候监测中，节点通畅度高。'
    );

    // Score placeholder
    const scoreVal = row.score !== null ? Number(row.score) : 75.0;
    const scoreClass = scoreVal >= 80 ? 'high' : (scoreVal >= 60 ? 'mid' : 'low');
    pageHtml = pageHtml.replace(
      /<div class="score-number" id="val-score">--<\/div>/,
      `<div class="score-number ${scoreClass}" id="val-score">${scoreVal.toFixed(2)}</div>`
    );

    // Score label placeholder
    let scoreLabel = '综合评级：良好';
    let scoreColor = '#F59E0B';
    if (scoreVal >= 90) {
      scoreLabel = '综合评级：卓越';
      scoreColor = '#10B981';
    } else if (scoreVal >= 80) {
      scoreLabel = '综合评级：优秀';
      scoreColor = '#0EA5E9';
    } else if (scoreVal < 65) {
      scoreLabel = '综合评级：风险/极低';
      scoreColor = '#EF4444';
    }
    pageHtml = pageHtml.replace(
      /<div class="score-rating" id="val-score-label">--<\/div>/,
      `<div class="score-rating" id="val-score-label" style="color: ${scoreColor}">${scoreLabel}</div>`
    );

    // D. Hardcode the airportId in JavaScript block
    pageHtml = pageHtml.replace(
      /const airportId = urlParams\.get\('id'\) \|\| 'jilian';/,
      `const airportId = '${row.id}';`
    );

    // E. Replace all instances of __AIRPORT_NAME__ with row.name
    pageHtml = pageHtml.replace(/__AIRPORT_NAME__/g, row.name);

    const destPath = path.join(destDir, 'index.html');
    fs.writeFileSync(destPath, pageHtml, 'utf8');
    console.log(`Generated: /airports/${row.id}/index.html`);
  }

  // 3. Generate sitemap.xml dynamically
  console.log('Generating sitemap.xml...');
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jctuijian.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/all.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/promo.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/risk.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/method.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/tools.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/tools-download.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/tools-streaming.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/tools-ip.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/tools-dns.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/news.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/news/prevent-risk.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/news/iepl-vs-transit.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jctuijian.com/news/payment-safety.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

  for (const row of rows) {
    sitemapContent += `  <url>
    <loc>https://jctuijian.com/airports/${row.id}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  sitemapContent += `</urlset>\n`;
  fs.writeFileSync(path.join(targetDir, 'sitemap.xml'), sitemapContent, 'utf8');
  console.log('Successfully generated sitemap.xml.');

  console.log('All static pages and sitemap generated successfully!');
}

main().catch(console.error);

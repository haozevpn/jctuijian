const fs = require('fs');
const path = require('path');

const newNavbar = `<!-- ══════════════════════════════════════════════════════════
     导航栏
══════════════════════════════════════════════════════════ -->
<header>
  <nav class="navbar" id="navbar" aria-label="主导航">
    <div class="container navbar-inner">

      <!-- Logo -->
      <a class="navbar-logo" href="/index.html" aria-label="机场推荐 JcTuijian 首页">
        <div class="logo-icon" aria-hidden="true" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z"/>
          </svg>
        </div>
        <span>机场推荐<span style="color:var(--color-brand);">JcTuijian</span></span>
      </a>

      <!-- Burger Menu Toggle for Mobile -->
      <button class="menu-toggle" id="menu-toggle" aria-label="打开菜单" aria-expanded="false">
        ☰
      </button>

      <!-- Nav Links -->
      <nav class="navbar-nav" id="navbar-nav" aria-label="分类导航">
        <a href="/index.html" id="nav-today">今日推荐</a>
        <a href="/all.html" id="nav-all">全量榜单</a>
        <a href="/promo.html" id="nav-promo">活动优惠</a>
        <a href="/risk.html" id="nav-risk">跑路预警 <span class="badge">紧急</span></a>
        <a href="/method.html" id="nav-method">测评方法</a>

        <!-- 工具下拉菜单 -->
        <div class="dropdown" id="nav-tools-dropdown">
          <a href="/tools.html" class="dropdown-trigger" id="nav-tools">工具</a>
          <div class="dropdown-content">
            <a href="/tools-download.html">翻墙工具下载</a>
            <a href="/tools-streaming.html">流媒体解锁检测</a>
            <a href="/tools-ip.html">IP 检测</a>
            <a href="/tools-dns.html">DNS 泄漏检测</a>
          </div>
        </div>

        <!-- 资讯下拉菜单 -->
        <div class="dropdown" id="nav-news-dropdown">
          <a href="/news.html" class="dropdown-trigger" id="nav-news">资讯</a>
          <div class="dropdown-content">
            <a href="/news.html">全部资讯</a>
            <a href="/news.html?cat=测评">机场测评</a>
            <a href="/news.html?cat=预警">风险预警</a>
            <a href="/news.html?cat=教程">使用教程</a>
            <a href="/news.html?cat=安全">支付安全</a>
            <a href="/news.html?cat=协议">客户端协议</a>
            <a href="/news.html?cat=监管">行业监管</a>
            <a href="/news.html?cat=运营">机场主运营</a>
            <a href="/news.html?cat=AI">AI工具</a>
          </div>
        </div>
      </nav>

      <!-- Actions -->
      <div class="navbar-actions">
        <button class="btn-ghost" id="btn-login" aria-label="登录" onclick="window.location.href='/portal.html'">登录</button>
        <a href="/portal.html" class="btn-primary" id="btn-apply" aria-label="申请入驻测试">
          申请入驻测试 ↗
        </a>
      </div>

    </div>
  </nav>
</header>`;

const rootDir = path.resolve(__dirname, '..');
const filesToUpdate = [
  'index.html',
  'all.html',
  'promo.html',
  'risk.html',
  'method.html',
  'report.html'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match header block in root pages
  // Match <header>...</header>
  const headerRegex = /<header>[\s\S]*?<\/header>/;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, newNavbar);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated navbar in: ${file}`);
  } else {
    console.log(`No <header> element found in: ${file}`);
  }
});

console.log('Navbar batch update completed!');

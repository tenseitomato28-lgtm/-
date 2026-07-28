/* =========================================================================
   publish-next.js — queue/ の先頭記事を1本、サイトに公開するスクリプト
   GitHub Actions から毎日18時(JST)に実行される。手動実行も可:
     node scripts/publish-next.js
   ========================================================================= */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const BASE = "https://murinaku-blog.pages.dev";

const queueDir = path.join(ROOT, "queue");
const files = fs.existsSync(queueDir)
  ? fs.readdirSync(queueDir).filter(f => f.endsWith(".json")).sort()
  : [];
if (files.length === 0) {
  console.log("queue is empty — nothing to publish");
  process.exit(0);
}

const qf = path.join(queueDir, files[0]);
const p = JSON.parse(fs.readFileSync(qf, "utf8"));

// 日付（JST）
const now = new Date(Date.now() + 9 * 3600 * 1000);
const iso = now.toISOString().slice(0, 10);
const jp = `${now.getUTCFullYear()}年${now.getUTCMonth() + 1}月${now.getUTCDate()}日`;

const url = `${BASE}/posts/${p.slug}.html`;
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---- 1) 記事HTML ---- */
const bodyHtml = p.body.map(t => `    <p>${t}</p>`).join("\n");
const aff = JSON.stringify(p.affiliate || [], null, 6).replace(/\n/g, "\n    ");
const post = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title} — 無理なく</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="無理なく">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="ja_JP">
<meta property="article:published_time" content="${iso}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${p.title}">
<meta name="twitter:description" content="${p.desc}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%E2%98%94%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="/assets/post.css">
<link rel="stylesheet" href="/assets/monetize.css">
</head>
<body>
<button class="theme-toggle" id="toggle" aria-label="テーマ切り替え">☽</button>

<header class="masthead">
  <div class="masthead-inner">
    <a href="../index.html" class="site-name">← 無理なく</a>
    <h1 class="post-title">${p.title}</h1>
    <div class="post-meta">
      <span>${jp}</span>
      <span class="tag">${p.tag}</span>
    </div>
  </div>
</header>

<main class="article-wrap">
  <div id="ad-top"></div>
  <article class="post-body">
${bodyHtml}
    <a href="../index.html" class="back-link">← 記事一覧にもどる</a>
  </article>
  <div id="monetize"></div>
</main>

<footer>&copy; 2026 無理なく</footer>

<script>
  window.PAGE = {
    title: ${JSON.stringify(p.title)},
    affiliate: ${aff}
  };
</script>
<script src="/assets/config.js"></script>
<script src="/assets/theme.js"></script>
<script src="/assets/monetize.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "posts", p.slug + ".html"), post);

/* ---- 2) index.html にカードを先頭挿入 ---- */
const idxPath = path.join(ROOT, "index.html");
let idx = fs.readFileSync(idxPath, "utf8");
const card = `  <a class="post-card" href="posts/${p.slug}.html">
    <div class="card-date">${jp} ・ ${p.tag}</div>
    <h2 class="card-title">${p.title}</h2>
    <p class="card-excerpt">${p.excerpt}</p>
  </a>

`;
const marker = '<div class="posts-label">記事一覧</div>\n\n';
if (!idx.includes(marker)) { console.error("index marker not found"); process.exit(1); }
idx = idx.replace(marker, marker + card);
fs.writeFileSync(idxPath, idx);

/* ---- 3) sitemap.xml に追加 ---- */
const smPath = path.join(ROOT, "sitemap.xml");
let sm = fs.readFileSync(smPath, "utf8");
const smEntry = `  <url>
    <loc>${url}</loc>
    <lastmod>${iso}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
sm = sm.replace(/(<urlset[^>]*>\n)/, `$1${smEntry}`);
fs.writeFileSync(smPath, sm);

/* ---- 4) feed.xml の先頭に追加（dlvr.it がこれを拾ってXに自動投稿） ----
   <description> は dlvr.it の投稿テンプレートで {description} として使える。
   queue の JSON に "tweet" を書いておくと、その記事だけX用の文面を差し替えられる。
   書かなければ従来どおり desc（=meta description）がそのまま入る。          */
function rfc822(d) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const mons = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const pad = n => String(n).padStart(2, "0");
  return `${days[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${mons[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00 +0000`;
}
const fdPath = path.join(ROOT, "feed.xml");
let fd = fs.readFileSync(fdPath, "utf8");
const item = `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.tweet || p.desc)}</description>
      <pubDate>${rfc822(new Date())}</pubDate>
    </item>
`;
fd = fd.replace(/(<language>ja<\/language>\n)/, `$1${item}`);
fs.writeFileSync(fdPath, fd);

/* ---- 5) queueから削除 ---- */
fs.unlinkSync(qf);
console.log(`published: ${p.title} (${p.slug}) — ${files.length - 1} left in queue`);

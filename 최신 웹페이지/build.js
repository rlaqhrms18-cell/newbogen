/* build.js — content/posts/*.md → 정적 HTML 생성 (의존성 없음)
   Decap CMS가 마크다운을 커밋하면 Netlify가 이 스크립트를 실행해 사이트를 다시 만듭니다. */
"use strict";
const fs = require("fs");
const path = require("path");

const BASE = process.env.URL || "https://gleeful-crostata-f32160.netlify.app";
const GV = "544e_BCK6EvdJ5xpTE8RaL24e72NXDd_b9Wztp6o2kk";
const NV = "b0c68b9e61b560a6eeb581176627aaa7ab2eb4b8";
const BV = "18D7AE69B70160AAE084C57E94C49DE3";
const VERIFY =
`  <meta name="google-site-verification" content="${GV}" />
  <meta name="naver-site-verification" content="${NV}" />
  <meta name="msvalidate.01" content="${BV}" />`;

function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));}
function inline(s){
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

/* ---- 프런트매터 파서 ---- */
function parseFM(raw){
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const data = {tags:[]};
  let body = raw;
  if(m){
    body = m[2];
    const lines = m[1].split("\n");
    let key = null;
    for(const line of lines){
      const li = line.replace(/\s+$/,"");
      if(/^\s*-\s+/.test(li) && key){
        data[key].push(li.replace(/^\s*-\s+/,"").trim().replace(/^["']|["']$/g,""));
        continue;
      }
      const mm = li.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if(mm){
        key = mm[1];
        const v = mm[2].trim();
        if(v === "" ){ data[key] = []; }
        else { data[key] = v.replace(/^["']|["']$/g,""); key = null; }
      }
    }
  }
  return {data, body: body.replace(/^\n+/,"")};
}

/* ---- 마크다운 → HTML (블록 단위) ---- */
function renderMd(md){
  const lines = md.replace(/\r/g,"").split("\n");
  const blocks = [];
  const toc = [];
  let hcount = 0;
  let i = 0;
  function flushPara(buf){
    if(buf.length){ blocks.push({t:"p", html:`<p>${inline(buf.join(" "))}</p>`}); }
  }
  while(i < lines.length){
    let line = lines[i];
    if(/^\s*$/.test(line)){ i++; continue; }
    // heading
    let hm = line.match(/^(#{1,3})\s+(.*)$/);
    if(hm){
      const level = hm[1].length;
      const text = hm[2].trim();
      if(level === 1){ blocks.push({t:"h1", html:`<h1>${inline(text)}</h1>`}); }
      else {
        const id = "h-" + (hcount++);
        const tag = "h"+level;
        toc.push({level, id, text});
        blocks.push({t:tag, html:`<${tag} id="${id}">${inline(text)}</${tag}>`});
      }
      i++; continue;
    }
    // table
    if(/^\s*\|/.test(line)){
      const tbl = [];
      while(i < lines.length && /^\s*\|/.test(lines[i])){ tbl.push(lines[i]); i++; }
      const rows = tbl.map(r => r.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(c=>c.trim()));
      const head = rows[0];
      const body = rows.slice(2); // skip separator row
      let h = "<thead><tr>" + head.map(c=>`<th>${inline(c)}</th>`).join("") + "</tr></thead>";
      let b = "<tbody>" + body.map(r=>"<tr>"+r.map(c=>`<td>${inline(c)}</td>`).join("")+"</tr>").join("") + "</tbody>";
      blocks.push({t:"table", html:`<div class="table-wrap"><table>${h}${b}</table></div>`});
      continue;
    }
    // blockquote
    if(/^\s*>\s?/.test(line)){
      const buf = [];
      while(i < lines.length && /^\s*>\s?/.test(lines[i])){ buf.push(lines[i].replace(/^\s*>\s?/,"")); i++; }
      blocks.push({t:"quote", html:`<blockquote>${inline(buf.join(" "))}</blockquote>`});
      continue;
    }
    // unordered list
    if(/^\s*[-*]\s+/.test(line)){
      const items = [];
      while(i < lines.length && /^\s*[-*]\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*[-*]\s+/,"")); i++; }
      blocks.push({t:"ul", html:"<ul>"+items.map(it=>`<li>${inline(it)}</li>`).join("")+"</ul>"});
      continue;
    }
    // ordered list
    if(/^\s*\d+\.\s+/.test(line)){
      const items = [];
      while(i < lines.length && /^\s*\d+\.\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*\d+\.\s+/,"")); i++; }
      blocks.push({t:"ol", html:"<ol>"+items.map(it=>`<li>${inline(it)}</li>`).join("")+"</ol>"});
      continue;
    }
    // paragraph (collect until blank or special)
    const buf = [];
    while(i < lines.length && !/^\s*$/.test(lines[i]) &&
          !/^(#{1,3})\s/.test(lines[i]) && !/^\s*\|/.test(lines[i]) &&
          !/^\s*>\s?/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) &&
          !/^\s*\d+\.\s+/.test(lines[i])){ buf.push(lines[i]); i++; }
    flushPara(buf);
  }
  // 광고 삽입: 본문 중간 h2 앞 + 맨 끝
  const h2idx = blocks.map((b,ix)=>b.t==="h2"?ix:-1).filter(x=>x>=0);
  if(h2idx.length >= 3){
    const mid = h2idx[Math.floor(h2idx.length/2)];
    blocks.splice(mid,0,{t:"ad", html:'<div class="ad-slot ad-inline" data-ad="inline">광고 영역 (본문 중간)</div>'});
  }
  let bodyHtml = blocks.map(b=>b.html).join("\n");
  bodyHtml += '\n<div class="ad-slot ad-leaderboard" data-ad="bottom">광고 영역 (글 하단)</div>';
  return {bodyHtml, toc};
}

function readingTime(md){ return Math.max(1, Math.round(md.replace(/\s/g,"").length/500)); }
function tocHtml(toc){
  return toc.map(h=>`<a href="#${h.id}" class="${h.level===3?"lvl-3":"lvl-2"}">${esc(h.text)}</a>`).join("\n");
}

/* ---- 글 읽어오기 ---- */
const DIR = path.join(__dirname, "content", "posts");
let posts = [];
if(fs.existsSync(DIR)){
  for(const f of fs.readdirSync(DIR)){
    if(!f.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(DIR,f), "utf-8");
    const {data, body} = parseFM(raw);
    const slug = data.slug || f.replace(/\.md$/,"");
    posts.push({
      slug,
      file: slug + ".html",
      title: data.title || slug,
      category: data.category || "기타",
      tags: Array.isArray(data.tags)?data.tags:[],
      summary: data.summary || "",
      date: (data.date||"2026-01-01").slice(0,10),
      md: body
    });
  }
}
posts.sort((a,b)=> (a.date<b.date?1:a.date>b.date?-1:0) || (a.title<b.title?-1:1));

/* ---- 글 페이지 ---- */
fs.mkdirSync(path.join(__dirname,"posts"), {recursive:true});
posts.forEach((p, idx) => {
  const {bodyHtml, toc} = renderMd(p.md);
  const rt = readingTime(p.md);
  const url = `${BASE}/posts/${p.file}`;
  const datek = p.date.replace(/-/g,".");
  const others = posts.filter((_,j)=>j!==idx).slice(0,4);
  const related = others.map(o=>`<a class="post-card" href="${o.file}" style="display:block;margin-bottom:10px"><span class="cat">${esc(o.category)}</span><h2 style="font-size:1.05rem;margin:6px 0 0">${esc(o.title)}</h2></a>`).join("\n        ");
  const ld = JSON.stringify({
    "@context":"https://schema.org","@type":"Article",headline:p.title,description:p.summary,
    articleSection:p.category,keywords:p.tags.join(", "),
    datePublished:p.date+"T09:00:00+09:00",dateModified:p.date+"T09:00:00+09:00",
    author:{"@type":"Organization",name:"지식창고"},publisher:{"@type":"Organization",name:"지식창고"},
    mainEntityOfPage:{"@type":"WebPage","@id":url}
  });
  const tocBox = toc.length ? `<div class="toc-box" id="tocBox">
        <button class="toc-toggle" id="tocToggle" aria-expanded="true">목차 <span class="toc-caret">▾</span></button>
        <nav class="toc" id="toc">
${tocHtml(toc)}
        </nav>
      </div>` : "";
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)} — 지식창고</title>
  <meta name="description" content="${esc(p.summary)}" />
  <meta name="keywords" content="${esc(p.tags.join(", "))}" />
  <meta name="theme-color" content="#0b0f17" />
${VERIFY}
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.summary)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:site_name" content="지식창고" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/style.css" />
  <script type="application/ld+json">${ld}</script>
</head>
<body class="post-page">
  <div class="reading-progress" id="readingProgress"></div>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="../index.html"><span class="brand-mark">📚</span><span class="brand-name">지식창고</span></a>
      <div class="header-actions">
        <div class="font-controls" aria-label="글자 크기 조절">
          <button class="icon-btn" id="fontDown" title="글자 작게">A-</button>
          <button class="icon-btn" id="fontUp" title="글자 크게">A+</button>
        </div>
        <button class="icon-btn" id="themeToggle" title="다크/라이트 전환">🌙</button>
      </div>
    </div>
  </header>
  <div class="container"><div class="ad-slot ad-leaderboard" data-ad="header">광고 영역 (헤더 하단)</div></div>
  <main class="container post-layout">
    <article class="article">
      <header class="article-head">
        <span class="a-cat">${esc(p.category)}</span>
        <h1 class="a-title">${esc(p.title)}</h1>
        <div class="a-meta"><span>📅 ${datek}</span><span>⏱ 약 ${rt}분</span></div>
      </header>
      <div class="a-body" id="aBody">
${bodyHtml}
      </div>
      <div class="share-row">
        <button class="btn btn-ghost btn-sm" id="copyLink">🔗 링크 복사</button>
        <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://search.naver.com/search.naver?query=${encodeURIComponent(p.title)}">N 네이버에서 검색</a>
      </div>
      <nav class="related" aria-label="다른 글"><h3>다른 글 보기</h3>
        ${related}
      </nav>
    </article>
    <aside class="post-side">
      ${tocBox}
      <div class="ad-slot ad-rect sticky-ad" data-ad="sidebar">광고 영역 (사이드바)</div>
    </aside>
  </main>
  <footer class="site-footer"><div class="container">
    <p class="footer-brand">📚 지식창고</p>
    <p class="footer-desc">본 사이트의 정보는 일반적인 참고용이며, 구체적인 결정은 전문가 상담을 권장합니다.</p>
    <p class="footer-copy">© <span id="year"></span> 지식창고. All rights reserved.</p>
  </div></footer>
  <script src="../js/site.js"></script>
  <script src="../js/article.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname,"posts",p.file), html);
});

/* ---- 홈 ---- */
const cards = posts.map(p=>{
  const tags = p.tags.slice(0,3).map(t=>`<span class="tag">#${esc(t)}</span>`).join("");
  return `      <article class="post-card" data-title="${esc(p.title+" "+p.tags.join(" "))}" data-cat="${esc(p.category)}" onclick="location.href='posts/${p.file}'">
        <span class="cat">${esc(p.category)}</span>
        <h2>${esc(p.title)}</h2>
        <p class="excerpt">${esc(p.summary.slice(0,110))}…</p>
        <div class="post-meta"><span>📅 ${p.date.replace(/-/g,".")}</span><span>⏱ ${readingTime(p.md)}분</span></div>
        <div class="post-tags">${tags}</div>
      </article>`;
}).join("\n");
const popular = posts.map(p=>`<li><a href="posts/${p.file}">${esc(p.title)}</a></li>`).join("\n");
const catCount = {};
posts.forEach(p=>catCount[p.category]=(catCount[p.category]||0)+1);
const cats = Object.keys(catCount);
const catlist = cats.map(c=>`<li><a href="#" data-cat="${esc(c)}">${esc(c)}<span class="count">${catCount[c]}</span></a></li>`).join("\n");
const chips = `<button class="chip active" data-cat="전체">전체</button>`+cats.map(c=>`<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("");

const index = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>지식창고 — 생활 금융·신용 정보</title>
  <meta name="description" content="신용점수, 대출, 정부지원 금융까지. 실생활에 바로 쓰는 금융 정보를 쉽게 정리한 블로그." />
  <meta name="theme-color" content="#0b0f17" />
  <link rel="canonical" href="${BASE}/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="지식창고 — 생활 금융·신용 정보" />
  <meta property="og:description" content="신용점수, 대출, 정부지원 금융까지. 실생활에 바로 쓰는 금융 정보를 쉽게 정리한 블로그." />
  <meta property="og:locale" content="ko_KR" />
${VERIFY}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html"><span class="brand-mark">📚</span><span class="brand-name">지식창고</span></a>
      <nav class="site-nav" id="catNav"></nav>
      <div class="header-actions">
        <button class="icon-btn" id="themeToggle" title="다크/라이트 전환">🌙</button>
        <a class="btn btn-primary btn-sm" href="/admin/">관리자</a>
      </div>
    </div>
  </header>
  <div class="container"><div class="ad-slot ad-leaderboard" data-ad="header">광고 영역 (헤더 하단)</div></div>
  <main class="container layout">
    <section class="content-col">
      <div class="hero">
        <h1 class="hero-title">생활 속 금융, 쉽게 읽는 지식창고</h1>
        <p class="hero-sub">신용점수부터 대출·정부지원 금융까지, 꼭 필요한 정보만 정리했습니다.</p>
        <div class="searchbar"><input type="search" id="searchInput" placeholder="검색어를 입력하세요 (예: 신용점수, 햇살론)" aria-label="검색" /></div>
      </div>
      <div class="chips" id="chipFilters">${chips}</div>
      <div class="post-list" id="postList">
${cards}
      </div>
      <div class="empty-state" id="emptyState" hidden><p>검색 결과가 없습니다.</p></div>
    </section>
    <aside class="side-col">
      <div class="ad-slot ad-rect" data-ad="sidebar">광고 영역 (사이드바)</div>
      <div class="widget"><h3 class="widget-title">인기 글</h3><ol class="popular-list">${popular}</ol></div>
      <div class="widget"><h3 class="widget-title">카테고리</h3><ul class="cat-list" id="catList">${catlist}</ul></div>
    </aside>
  </main>
  <footer class="site-footer"><div class="container">
    <p class="footer-brand">📚 지식창고</p>
    <p class="footer-desc">본 사이트의 정보는 일반적인 참고용이며, 구체적인 결정은 전문가 상담을 권장합니다.</p>
    <p class="footer-copy">© <span id="year"></span> 지식창고. All rights reserved.</p>
  </div></footer>
  <script src="js/site.js"></script>
  <script src="js/home.js"></script>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  <script>if(window.netlifyIdentity){window.netlifyIdentity.on("init",function(u){if(!u){window.netlifyIdentity.on("login",function(){document.location.href="/admin/";});}});}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname,"index.html"), index);

/* ---- sitemap ---- */
let urls = [`<url><loc>${BASE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`];
posts.forEach(p=>urls.push(`<url><loc>${BASE}/posts/${p.file}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`));
fs.writeFileSync(path.join(__dirname,"sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+urls.map(u=>"  "+u).join("\n")+`\n</urlset>\n`);

/* ---- robots.txt ---- */
fs.writeFileSync(path.join(__dirname,"robots.txt"),
  "User-agent: *\nAllow: /\nDisallow: /admin/\n\nUser-agent: Yeti\nAllow: /\n\nSitemap: "+BASE+"/sitemap.xml\n");

console.log("BUILD OK — posts:", posts.map(p=>p.file).join(", "));

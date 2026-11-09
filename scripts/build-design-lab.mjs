import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "docs/reference/design-lab");
const themes = [
  { id: "thoughtstream", name: "ThoughtStream", description: "좁은 읽기 폭, 부드러운 회색, 조용한 세리프.", mood: "가장 차분한 읽기 공간", source: "https://designmd.ai/chef/thoughtstream" },
  { id: "warm-editorial", name: "Warm Editorial", description: "따뜻한 종이색, 큰 제목, 테라코타 포인트.", mood: "작은 독립 잡지처럼", source: "https://github.com/nexu-io/open-design/blob/main/design-systems/warm-editorial/DESIGN.md" },
  { id: "editorial-logbook", name: "Editorial Logbook", description: "힘 있는 한글 제목과 담백한 연대기 목록.", mood: "개발자의 정돈된 기록장", source: "https://github.com/Yeachan-Heo/gaebal-gajae-blog/blob/main/DESIGN.md" },
];
const escape = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const inline = (s) => escape(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const posts = [];
for (const dir of await readdir(path.join(root, "fixtures/demo-posts"), { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith("_")) continue;
  const source = await readFile(path.join(root, "fixtures/demo-posts", dir.name, "page.mdx"), "utf8");
  const meta = JSON.parse(source.match(/export const post = (\{[\s\S]*?\});/)[1]);
  posts.push({ ...meta, slug: dir.name, body: source.split("<PostHeader {...post} />")[1].trim(), category: dir.name === "motion-you-can-feel" ? "인터랙션" : ["following-a-request", "keyboard-friendly-links"].includes(dir.name) ? "개발노트" : "에세이" });
}
posts.sort((a, b) => b.date.localeCompare(a.date));
const date = (d) => new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date(`${d}T00:00:00+09:00`));
const arrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const intro = "개발하며 마주친 문제와 그 과정에서 배운 것들을 기록합니다.";
const heroTitle = "개발하고, 생각하고,<br>기록합니다.";
const demos = {
  PressScaleDemo: '<div class="demo-box"><div class="press-pair"><div><button type="button" class="demo-button">눌러보세요</button><small>기본 버튼</small></div><div><button type="button" class="demo-button press-scale">눌러보세요</button><small>눌림 효과</small></div></div></div>',
  StaggerOrderDemo: '<div class="demo-box"><div class="stagger-example" data-stagger><h3>먼저 전하고 싶은 이야기</h3><p>제목 다음에는 짧은 설명이 이어집니다.</p><span class="stagger-action">이어서 읽기</span></div><button class="demo-button" type="button" data-replay>다시 재생</button></div>',
  EasingDemo: '<div class="demo-box" data-easing>'+["linear", "ease-out", "ease-in-out"].map((ease)=>`<div class="easing-row"><code>${ease}</code><div class="track"><span class="ball" style="--ease:${ease}"></span></div></div>`).join("")+'<button class="demo-button" type="button" data-play aria-pressed="false">재생</button></div>',
  FlowDiagram: '<div class="demo-box"><div class="flow-scroll"><div class="flow-example">'+["요청 보내기","데이터 조회","응답 받기","화면 표시"].map((s,i)=>`<div style="--step:${i}"><span>${s}</span><small>${i===1?"서버":"브라우저"}</small></div>`).join("")+'</div></div><p class="demo-caption">단계가 차례로 강조되는 설명용 시뮬레이션입니다.</p></div>',
  ShellDiagram: '<div class="demo-box shell-example"><div class="shop-header">SHOP <span class="fill-later">장바구니: 3</span></div><h3>운동화</h3><p>가볍고 편안한 데일리 러닝화.</p><span class="fill-later stock">재고 12개 남음</span><p class="demo-caption">고정된 화면 위에 동적 내용이 채워지는 예시입니다.</p></div>',
};

function renderArticle(body) {
  const blocks = [];
  const block = (html) => { const key = `@@BLOCK${blocks.length}@@`; blocks.push(html); return `\n\n${key}\n\n`; };
  body = body.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, language, code) => block(`<pre aria-label="${escape(language || "코드")} 예시"><code>${escape(code.trimEnd())}</code></pre>`));
  body = body.replace(/<DemoCaption>([\s\S]*?)<\/DemoCaption>/g, (_, text) => block(`<p class="demo-caption">${inline(text.trim())}</p>`));
  body = body.replace(/<(PressScaleDemo|StaggerOrderDemo|EasingDemo|FlowDiagram|ShellDiagram)\b[\s\S]*?\/>/g, (_, name) => block(demos[name]));
  return body.split(/\n\s*\n/).map((paragraph) => {
    const p = paragraph.trim();
    if (!p) return "";
    const stored = p.match(/^@@BLOCK(\d+)@@$/);
    if (stored) return blocks[Number(stored[1])];
    if (p.startsWith("## ")) return `<h2>${inline(p.slice(3))}</h2>`;
    if (p.startsWith("> ")) return `<blockquote><p>${inline(p.replace(/^> /gm, ""))}</p></blockquote>`;
    if (p.startsWith("- ")) return `<ul>${p.split("\n").map((line)=>`<li>${inline(line.replace(/^- /,""))}</li>`).join("")}</ul>`;
    if (p.startsWith("|")) {
      const rows = p.split("\n").filter((line)=>!/^\|[\s:|-]+\|$/.test(line));
      return `<div class="table-scroll"><table>${rows.map((line,i)=>`<${i===0?"thead":"tbody"}><tr>${line.split("|").slice(1,-1).map((cell)=>`<${i===0?'th scope="col"':'td'}>${inline(cell.trim())}</${i===0?"th":"td"}>`).join("")}</tr></${i===0?"thead":"tbody"}>`).join("")}</table></div>`;
    }
    return `<p>${inline(p).replaceAll("\n", " ")}</p>`;
  }).join("\n");
}

function head(title, css, body) {
  return `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light"><meta name="description" content="같은 예시 글로 비교하는 블로그 디자인 시안"><title>${escape(title)} · 최호</title><link rel="stylesheet" href="${css}"></head><body>${body}</body></html>\n`;
}
function toolbar(theme, page) {
  return `<aside class="lab-toolbar" aria-label="디자인 비교"><a href="../index.html">${arrow}<span>세 가지 디자인</span></a><nav aria-label="디자인 선택">${themes.map((t)=>`<a href="../${t.id}/${page}" ${theme.id===t.id?'aria-current="page"':""}>${t.name}</a>`).join("")}</nav><a href="DESIGN.md" class="source-link">DESIGN.md</a></aside>`;
}
function header() {
  return `<header class="site-header"><a class="brand" href="index.html">최호<span>프론트엔드 개발자</span></a><nav aria-label="블로그 탐색"><a href="index.html#writing">글</a><a href="index.html#about">소개</a><a href="https://github.com/choihooo" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a></nav></header>`;
}
function footer(theme) {
  return `<footer class="site-footer"><span>© 2026 최호</span><p>화면 확인용 예시 글입니다.</p><a href="${theme.source}" target="_blank" rel="noopener noreferrer">디자인 출처 ${arrow}</a></footer>`;
}
function row(p) {
  return `<li data-category="${p.category}"><a class="article-row" href="${p.slug}.html"><time datetime="${p.date}">${date(p.date)}</time><div><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p></div><span class="row-arrow">${arrow}</span></a></li>`;
}
function home(theme) {
  const latest = posts[0];
  const hero = `<section class="hero" id="about"><h1>${heroTitle}</h1><div class="hero-description"><p>${intro}</p><p class="hero-small">작은 발견과 오래 남기고 싶은 생각들.</p><a class="read-link" href="#writing">글 읽기 ${arrow}</a></div></section>`;
  let writing;
  if (theme.id === "editorial-logbook") {
    writing = `<section class="featured" aria-labelledby="latest"><h2 id="latest">가장 최근의 기록</h2><a href="${latest.slug}.html"><time datetime="${latest.date}">${date(latest.date)}</time><h3>${latest.title}</h3><p>${latest.description}</p><span>글 읽기 ${arrow}</span></a></section><section class="writing" id="writing"><div class="section-heading"><h2>기록 모아 보기</h2><span>2026</span></div><div class="filters" role="group" aria-label="글 분류">${["전체","에세이","인터랙션","개발노트"].map((c)=>`<button type="button" data-filter="${c}" aria-pressed="${c==="전체"}">${c}</button>`).join("")}</div><ul class="article-list">${posts.map(row).join("")}</ul><p class="filter-empty" hidden>이 분류에는 아직 글이 없습니다.</p></section>`;
  } else {
    writing = `<section class="writing" id="writing"><div class="section-heading"><h2>최근 글</h2><span>2026</span></div><ul class="article-list">${posts.map(row).join("")}</ul></section>`;
  }
  return head(theme.name, "../assets/site.css", `${toolbar(theme,"index.html")}<div class="site ${theme.id}">${header()}<main>${hero}${writing}</main>${footer(theme)}</div><script src="../assets/site.js" defer></script>`);
}
function detail(theme, p, index) {
  const next = posts[(index+1)%posts.length];
  return head(`${p.title} — ${theme.name}`, "../assets/site.css", `${toolbar(theme,p.slug+".html")}<div class="site ${theme.id} article-site">${header()}<main class="article-main"><a class="back" href="index.html#writing">${arrow}전체 글</a><article><header class="article-heading"><h1>${p.title}</h1><p class="article-lede">${p.description}</p><div class="article-meta"><time datetime="${p.date}">${date(p.date)}</time><span>최호</span><span>예시 글</span></div></header><div class="article-body">${renderArticle(p.body)}</div></article><nav class="article-next" aria-label="다음 글"><span>다음 글</span><a href="${next.slug}.html">${next.title} ${arrow}</a></nav></main>${footer(theme)}</div><script src="../assets/site.js" defer></script>`);
}
function gallery() {
  return head("같은 글, 세 가지 여백", "assets/gallery.css", `<header class="gallery-header"><a href="/">최호의 블로그 ${arrow}</a><span>Design studies · 2026</span></header><main class="gallery-main"><div class="gallery-intro"><h1>같은 글,<br>세 가지 여백.</h1><p>내용은 그대로 두고, 글자와 간격과 색을 바꿨습니다.<br>각 사이트의 메인과 상세를 오가며 비교해 보세요.</p></div><div class="studies">${themes.map((t)=>`<section class="study"><a href="${t.id}/index.html" class="preview-link" aria-label="${t.name} 메인 보기"><div class="preview-viewport"><iframe src="${t.id}/index.html?preview=1" title="${t.name} 미리보기" loading="lazy" tabindex="-1" scrolling="no"></iframe></div></a><div class="study-info"><h2><a href="${t.id}/index.html">${t.name} ${arrow}</a></h2><p>${t.description}</p><nav aria-label="${t.name} 화면"><a href="${t.id}/index.html">메인 보기</a><a href="${t.id}/${posts[0].slug}.html">상세 보기</a><a href="${t.id}/DESIGN.md">원문</a></nav></div></section>`).join("")}</div><footer class="gallery-footer"><p>원본 DESIGN.md의 색상·타이포그래피·레이아웃 규칙을 적용한 비교 시안입니다.<br>한글 글꼴은 Noto Serif KR / Noto Sans KR로 조정했습니다. 모든 글은 예시 데이터입니다.</p><a href="/">현재 블로그로 돌아가기 ${arrow}</a></footer></main><script src="assets/gallery.js" defer></script>`);
}
await mkdir(output,{recursive:true});
for (const theme of themes) {
  await mkdir(path.join(output,theme.id),{recursive:true});
  await writeFile(path.join(output,theme.id,"index.html"),home(theme));
  for (const [i,post] of posts.entries()) await writeFile(path.join(output,theme.id,post.slug+".html"),detail(theme,post,i));
}
await writeFile(path.join(output,"index.html"),gallery());
console.log(`Built 3 design studies × ${posts.length+1} pages + comparison gallery.`);

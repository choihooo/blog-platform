import assert from 'node:assert/strict';

const origin = process.argv[2];
assert.ok(origin, 'Usage: node scripts/check-deployment.mjs <origin> [--indexable] [--site-url <canonical-origin>]');
const indexable = process.argv.includes('--indexable');
const siteOption = process.argv.indexOf('--site-url');
const site = new URL(siteOption >= 0 ? process.argv[siteOption + 1] : 'https://hozorica.com');
assert.equal(site.pathname, '/', 'Canonical site must be a root URL');
const get = pathname => fetch(new URL(pathname, origin), { redirect: 'follow', signal: AbortSignal.timeout(30_000) });
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
const canonicalOf = html => [...html.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]).filter(tag => attr(tag, 'rel') === 'canonical').map(tag => attr(tag, 'href'));
const schemas = html => [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m => {
  const data = JSON.parse(m[1]); return data['@graph'] ?? [data];
});
function verifyPage(html, response, pathname) {
  const expected = new URL(pathname, site).href;
  assert.deepEqual(canonicalOf(html).map(value => new URL(value).href), [expected], `${pathname}: canonical`);
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]).find(tag => attr(tag, 'name') === 'robots');
  const directives = new Set((attr(tag ?? '', 'content') ?? '').toLowerCase().split(/\s*,\s*/));
  assert.ok(indexable ? directives.has('index') && directives.has('follow') && !directives.has('noindex') && !directives.has('nofollow') : directives.has('noindex') && directives.has('nofollow'), `${pathname}: robots policy mismatch`);
  if (indexable) assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', /noindex|nofollow|none/i, `${pathname}: X-Robots-Tag`);
  assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, `${pathname}: one H1 required`);
  assert.match(html, /<title>[^<]+<\/title>/i, `${pathname}: title`);
  assert.ok([...html.matchAll(/<meta\b[^>]*>/gi)].some(m => attr(m[0], 'name') === 'description' && attr(m[0], 'content')), `${pathname}: description`);
}

const [home, robots, sitemap, og, icon] = await Promise.all([get('/'), get('/robots.txt'), get('/sitemap.xml'), get('/opengraph-image.png'), get('/icon.svg')]);
for (const response of [home, robots, sitemap, og, icon]) assert.equal(response.status, 200, response.url);
const html = await home.text();
assert.ok(html.includes('최호') && html.includes('AI에'));
assert.ok(html.includes('class="blog-profile-name">최호</h1>'), 'Profile title must preserve its current styling');
assert.ok(html.includes('href="mailto:hochoi8621@gmail.com"'), 'Footer email is required');
assert.ok(html.includes('href="https://www.linkedin.com/in/howuchoi/"'), 'Footer LinkedIn is required');
verifyPage(html, home, '/');
const homeSchemas = schemas(html);
for (const type of ['WebSite', 'Person']) assert.ok(homeSchemas.some(data => data['@type'] === type), `Homepage ${type} schema`);
const paths = [...new Set([...html.matchAll(/<a\b[^>]*href=["'](\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*)["']/gi)].map(m => m[1]))];
assert.ok(paths.length > 0, 'Published articles must be linked on the homepage');
for (const pathname of paths) {
  const response = await get(pathname);
  assert.equal(response.status, 200, pathname);
  const body = await response.text();
  verifyPage(body, response, pathname);
  const articles = schemas(body).filter(data => data['@type'] === 'BlogPosting');
  assert.equal(articles.length, 1, `${pathname}: BlogPosting schema`);
  assert.equal(articles[0].mainEntityOfPage, new URL(pathname, site).href, `${pathname}: schema URL`);
  assert.ok(articles[0].headline && articles[0].author?.name, `${pathname}: schema headline/author`);
}
const robotText = await robots.text();
assert.match(robotText, indexable ? /Allow:\s*\//i : /Disallow:\s*\//i);
if (indexable) {
  assert.doesNotMatch(robotText, /Disallow:\s*\/\s*$/im, 'Production robots must allow crawling');
  assert.ok(robotText.includes(new URL('/sitemap.xml', site).href), 'robots must advertise the sitemap');
}
const sitemapText = await sitemap.text();
const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.deepEqual(sitemapUrls.sort(), indexable ? ['/', ...paths].map(pathname => new URL(pathname, site).href).sort() : [], 'Sitemap must match all published canonical URLs');
assert.match(og.headers.get('content-type') ?? '', /image\/png/);
const png = Buffer.from(await og.arrayBuffer());
assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
assert.match(await icon.text(), /#FF6F0F/);
const forbidden = ['/color-lab', '/design-lab/index.html', '/blog/_template', '/blog/_drafts', '/archive/manifest.json', '/blog/a-little-more-space', '/blog/motion-you-can-feel', '/blog/small-components', '/blog/ai-small-tools', '/blog/browser-first-notes', '/blog/first-notes', '/blog/following-a-request', '/blog/keyboard-friendly-links', '/blog/notes-worth-keeping', '/blog/release-smoke'];
await Promise.all(forbidden.map(async pathname => assert.equal((await get(pathname)).status, 404, pathname)));
console.log(`Verified ${origin}: ${paths.length} published articles, home/article robots, canonical, JSON-LD, sitemap, OG, favicon and private/demo paths.`);

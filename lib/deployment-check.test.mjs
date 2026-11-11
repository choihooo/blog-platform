import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

async function checkFixture(articleRobots = 'index, follow', indexable = true) {
  const site = 'https://hozorica.com';
  const schema = value => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
  const meta = (path, robots) => `<title>테스트</title><meta name="description" content="설명"><meta name="robots" content="${robots}"><link rel="canonical" href="${path === "/" ? site : site + path}">`;
  const png = Buffer.alloc(24); png.writeUInt32BE(1200, 16); png.writeUInt32BE(630, 20);
  const server = createServer((req, res) => {
    const pages = {
      '/': `${meta('/', indexable ? 'index, follow' : 'noindex, nofollow')}<h1 class="blog-profile-name">최호</h1>AI에<a href="mailto:hochoi8621@gmail.com">메일</a><a href="https://www.linkedin.com/in/howuchoi/">LinkedIn</a><a href="/blog/first-post">발행된 글</a>${schema({ '@graph': [{ '@type': 'WebSite' }, { '@type': 'Person' }] })}`,
      '/blog/first-post': `${meta('/blog/first-post', articleRobots)}<h1>발행된 글</h1>${schema({ '@type': 'BlogPosting', headline: '발행된 글', author: { name: '최호' }, mainEntityOfPage: site + '/blog/first-post' })}`,
      '/robots.txt': indexable ? 'User-agent: *\nAllow: /\nSitemap: https://hozorica.com/sitemap.xml' : 'User-agent: *\nDisallow: /',
      '/sitemap.xml': indexable ? `<urlset><url><loc>${site}/</loc></url><url><loc>${site}/blog/first-post</loc></url></urlset>` : '<urlset></urlset>',
      '/icon.svg': '<svg fill="#FF6F0F"/>',
    };
    if (req.url === '/opengraph-image.png') { res.setHeader('Content-Type', 'image/png'); res.end(png); }
    else if (pages[req.url]) res.end(pages[req.url]);
    else { res.statusCode = 404; res.end('not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    return await new Promise(resolve => {
      const child = spawn(process.execPath, ['scripts/check-deployment.mjs', `http://127.0.0.1:${server.address().port}`, ...(indexable ? ['--indexable'] : [])]);
      let output = '';
      child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
      child.on('close', code => resolve({ code, output }));
    });
  } finally { await new Promise(resolve => server.close(resolve)); }
}

test('deployment check accepts a published blog and verifies its article rather than requiring an empty site', async () => {
  const result = await checkFixture();
  assert.equal(result.code, 0, result.output);
  assert.match(result.output, /1 published/);
});
test('deployment check rejects a noindexed article even when the homepage is indexable', async () => {
  const result = await checkFixture('noindex, nofollow');
  assert.notEqual(result.code, 0);
  assert.match(result.output, /first-post.*robots/);
});

test('preview checks preserve noindex and an empty sitemap even with published articles', async () => {
  const result = await checkFixture('noindex, nofollow', false);
  assert.equal(result.code, 0, result.output);
});

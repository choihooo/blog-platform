import assert from 'node:assert/strict';
import test from 'node:test';
import { getWebsiteStructuredData, getArticleStructuredData, serializeStructuredData } from './structured-data.ts';
const site = new URL('https://hozorica.com');
test('articles share the real author identity and preserve publication dates without inventing modification dates', () => {
  const post = { title: '실제 경험', description: '글 설명', date: '2026-05-28' };
  const data = getArticleStructuredData(post, 'embedding-based-recommendations', site);
  assert.equal(data['@type'], 'BlogPosting');
  assert.equal(data.mainEntityOfPage, 'https://hozorica.com/blog/embedding-based-recommendations');
  assert.equal(data.headline, post.title);
  assert.equal(data.datePublished, '2026-05-28T00:00:00+09:00');
  assert.equal(data.author['@id'], 'https://hozorica.com/#person');
  assert.equal(data.author.name, '최호');
  assert.equal('dateModified' in data, false);
  const home = getWebsiteStructuredData(site);
  assert.equal(home['@graph'].find(x => x['@type'] === 'Person')['@id'], data.author['@id']);
});
test('JSON-LD escapes script-breaking text and still round-trips the original title', () => {
  const title = '</script><script>alert(1)</script>';
  const serialized = serializeStructuredData({ headline: title });
  assert.equal(serialized.includes('<'), false);
  assert.equal(JSON.parse(serialized).headline, title);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createStore } from './store.mjs';
import { createHandler } from './handler.mjs';
import { createD1Query, getDatabase } from './database.mjs';
import { issueIdentity, verifyIdentity } from './identity.mjs';

const secret = 'test-secret-with-at-least-thirty-two-characters';
function setup() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../../db/migrations/0001_engagement.sql', import.meta.url), 'utf8'));
  const query = async (sql, params = []) => db.prepare(sql).all(...params);
  const store = createStore(query);
  const handler = createHandler({ store, secret, validSlug: async slug => slug === 'first-notes', ipHeader: 'x-test-ip' });
  return { db, store, handler };
}
function req(method = 'GET', body, cookie = '', extra = {}) {
  return new Request('https://blog.test/api/engagement/first-notes', {
    method,
    headers: { origin: 'https://blog.test', 'content-type': 'application/json', cookie, 'x-test-ip': '127.0.0.1', ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
async function session(handler) {
  const response = await handler(req(), 'first-notes');
  return response.headers.get('set-cookie').split(';')[0];
}
function comment(body = '좋은 글 감사합니다.', id = crypto.randomUUID()) {
  return { action: 'comment', nickname: '다정한너구리', body, id };
}

test('signed browser identity rejects forgery and short secrets', () => {
  const value = issueIdentity(secret);
  assert.ok(verifyIdentity(value, secret));
  assert.equal(verifyIdentity(value + 'x', secret), null);
  assert.equal(verifyIdentity(value, secret + 'other'), null);
  assert.throws(() => issueIdentity('short'));
});

test('GET establishes HttpOnly identity, no caching, isolated articles and initial state', async () => {
  const { handler } = setup();
  const res = await handler(req(), 'first-notes');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('set-cookie'), /HttpOnly/);
  assert.match(res.headers.get('set-cookie'), /SameSite=Lax/);
  assert.match(res.headers.get('set-cookie'), /Secure/);
  assert.match(res.headers.get('cache-control'), /no-store/);
  assert.deepEqual(await res.json(), { comments: [], commentCount: 0, likeCount: 0, liked: false, nextCursor: null });
  assert.equal((await handler(req(), '_template')).status, 404);
});

test('comments persist as plain text; retries are idempotent; cooldown is atomic', async () => {
  const { handler, store } = setup();
  const cookie = await session(handler);
  const payload = comment("<script>alert('x')</script> '); DROP TABLE comments; --");
  const responses = await Promise.all([handler(req('POST', payload, cookie), 'first-notes'), handler(req('POST', payload, cookie), 'first-notes')]);
  for (const response of responses) assert.equal(response.status, 200);
  assert.equal((await handler(req('POST', comment('too soon'), cookie), 'first-notes')).status, 429);
  const state = await store.read('first-notes', 'another-visitor');
  assert.equal(state.commentCount, 1);
  assert.equal(state.comments[0].body, payload.body);
  assert.equal(state.comments[0].nickname, payload.nickname);
  assert.equal('visitor' in state.comments[0], false);
  assert.equal((await store.read('other-post', 'another-visitor')).commentCount, 0);
});

test('likes set desired state, retries do not inflate counts; cancellation persists', async () => {
  const { handler } = setup();
  const cookie = await session(handler);
  for (let i = 0; i < 2; i++) {
    const res = await handler(req('POST', { action: 'like', liked: true }, cookie), 'first-notes');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { likeCount: 1, liked: true });
  }
  const reload = await (await handler(req('GET', undefined, cookie), 'first-notes')).json();
  assert.equal(reload.liked, true);
  const otherCookie = await session(handler);
  assert.equal((await (await handler(req('GET', undefined, otherCookie), 'first-notes')).json()).liked, false);
  const undo = await handler(req('POST', { action: 'like', liked: false }, cookie), 'first-notes');
  assert.deepEqual(await undo.json(), { likeCount: 0, liked: false });
});

test('pagination is stable when comments share a timestamp; hidden comments stay private', async () => {
  const { db, store } = setup();
  const insert = db.prepare('INSERT INTO comments (id, slug, nickname, body, visitor, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < 45; i++) insert.run(crypto.randomUUID(), 'first-notes', '다정한너구리', `${i}`, `v${i}`, 1000);
  db.prepare('UPDATE comments SET hidden = 1 WHERE body = ?').run('0');
  const seen = [];
  let cursor;
  do {
    const page = await store.read('first-notes', 'reader', cursor);
    assert.equal(page.commentCount, 44);
    seen.push(...page.comments.map(x => x.id));
    cursor = page.nextCursor;
  } while (cursor);
  assert.equal(seen.length, 44);
  assert.equal(new Set(seen).size, 44);
});

test('validation rejects empty, overlong, arbitrary nicknames, malformed payloads and cursors', async () => {
  const { handler } = setup();
  const cookie = await session(handler);
  for (const payload of [comment('  '), comment('a'.repeat(1001)), { ...comment(), nickname: '관리자' }, { action: 'like', liked: 'yes' }, null, []]) {
    assert.equal((await handler(req('POST', payload, cookie), 'first-notes')).status, 400);
  }
  const large = await handler(req('POST', comment('가'.repeat(4000)), cookie), 'first-notes');
  assert.equal(large.status, 413);
  assert.equal((await handler(new Request('https://blog.test/api/engagement/first-notes?cursor=garbage'), 'first-notes')).status, 400);
  assert.equal((await handler(new Request('https://blog.test/api/engagement/first-notes', { method: 'POST', headers: { origin: 'https://blog.test', 'content-type': 'application/json', cookie }, body: '{broken' }), 'first-notes')).status, 400);
});

test('writes reject foreign/missing Origin, missing/forged session and non-JSON content', async () => {
  const { handler } = setup();
  const cookie = await session(handler);
  assert.equal((await handler(req('POST', comment(), cookie, { origin: 'https://evil.test' }), 'first-notes')).status, 403);
  assert.equal((await handler(req('POST', comment(), cookie, { origin: '' }), 'first-notes')).status, 403);
  assert.equal((await handler(req('POST', comment()), 'first-notes')).status, 401);
  assert.equal((await handler(req('POST', comment(), 'blog_visitor=forged'), 'first-notes')).status, 401);
  assert.equal((await handler(req('POST', comment(), cookie, { 'content-type': 'text/plain' }), 'first-notes')).status, 415);
  assert.equal((await handler(req('POST', comment(), cookie, { 'content-type': 'application/jsonp' }), 'first-notes')).status, 415);
});

test('trusted network rate limit works across browser identities', async () => {
  const { handler } = setup();
  const statuses = [];
  for (let i = 0; i < 11; i++) {
    const cookie = await session(handler);
    statuses.push((await handler(req('POST', comment(), cookie), 'first-notes')).status);
  }
  assert.equal(statuses[0], 200);
  assert.equal(statuses.at(-1), 429);
});

test('provider errors expose no secrets, production refuses local persistence', async () => {
  const handler = createHandler({ store: { read: async () => { throw new Error('secret-token'); } }, secret, validSlug: async () => true });
  const response = await handler(req(), 'first-notes');
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes('secret-token'), false);
  await assert.rejects(() => getDatabase({ NODE_ENV: 'production', ENGAGEMENT_STORAGE: 'sqlite' }), /configuration/i);
});

test('D1 sends parameterized queries with server auth and checks nested success flags', async () => {
  let called;
  const config = { CLOUDFLARE_ACCOUNT_ID: 'account', CLOUDFLARE_D1_DATABASE_ID: 'database', CLOUDFLARE_D1_API_TOKEN: 'private-token' };
  const query = createD1Query(config, async (url, options) => {
    called = { url, options };
    return Response.json({ success: true, result: [{ success: true, results: [{ count: 3 }] }] });
  });
  assert.deepEqual(await query('SELECT ? AS count', [3]), [{ count: 3 }]);
  assert.match(called.url, /accounts\/account\/d1\/database\/database\/query$/);
  assert.equal(called.options.headers.Authorization, 'Bearer private-token');
  assert.deepEqual(JSON.parse(called.options.body), { sql: 'SELECT ? AS count', params: [3] });
  for (const data of [{ success: false }, { success: true, result: [{ success: false }] }, { success: true }]) {
    await assert.rejects(() => createD1Query(config, async () => Response.json(data))('SELECT 1'), /database/i);
  }
});

test('initial loading times out even with a navigation abort signal; navigation also cancels requests', { timeout: 200 }, async () => {
  const { requestJson } = await import('./request.mjs');
  const fetcher = async (_url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const navigation = new AbortController();
  const keepProcessAlive = setTimeout(() => {}, 100);
  try {
    await assert.rejects(() => requestJson('/api/test', undefined, navigation.signal, { fetcher, timeoutMs: 5 }), /연결/);
    assert.equal(navigation.signal.aborted, false);
    const pending = requestJson('/api/test', undefined, navigation.signal, { fetcher });
    navigation.abort();
    await assert.rejects(() => pending);
  } finally { clearTimeout(keepProcessAlive); }
});

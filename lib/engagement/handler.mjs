import { issueIdentity, verifyIdentity, hashKey } from './identity.mjs';
import { parseCursor } from './store.mjs';
import { isNickname } from './nickname.mjs';

const COOKIE = 'blog_visitor';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function reply(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', ...headers } });
}
async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new Error('large'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createHandler({ store, secret, validSlug, ipHeader = '' }) {
  return async function handle(request, slug) {
    try {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !await validSlug(slug)) return reply({ error: '글을 찾을 수 없어요.' }, 404);
      const url = new URL(request.url);
      const cookie = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
      const visitor = verifyIdentity(cookie, secret);
      if (request.method === 'GET') {
        const cursor = url.searchParams.get('cursor');
        try { parseCursor(cursor); } catch { return reply({ error: '댓글 목록 주소가 올바르지 않아요.' }, 400); }
        const identity = visitor ? cookie : issueIdentity(secret);
        const id = visitor ?? verifyIdentity(identity, secret);
        const state = await store.read(slug, hashKey(`visitor:${id}`, secret), cursor);
        return reply(state, 200, visitor ? {} : { 'Set-Cookie': `${COOKIE}=${identity}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${url.protocol === 'https:' ? '; Secure' : ''}` });
      }
      if (request.method !== 'POST') return reply({ error: '지원하지 않는 요청이에요.' }, 405, { Allow: 'GET, POST' });
      if (request.headers.get('origin') !== url.origin || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: '이 블로그에서 다시 시도해 주세요.' }, 403);
      if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return reply({ error: '요청 형식이 올바르지 않아요.' }, 415);
      if (!visitor) return reply({ error: '브라우저 쿠키를 허용한 뒤 새로고침해 주세요.' }, 401);
      let data;
      try { data = await readBody(request); } catch (error) {
        return reply({ error: error.message === 'large' ? '입력 내용이 너무 길어요.' : '요청 내용을 확인해 주세요.' }, error.message === 'large' ? 413 : 400);
      }
      if (!data || Array.isArray(data) || typeof data !== 'object') return reply({ error: '요청 내용을 확인해 주세요.' }, 400);
      const key = hashKey(`visitor:${visitor}`, secret);
      if (data.action === 'comment') {
        if (!isNickname(data.nickname) || typeof data.body !== 'string' || !data.body.trim() || Array.from(data.body.trim()).length > 1000 || !uuid.test(data.id ?? '')) return reply({ error: '댓글은 1~1,000자로 입력해 주세요.' }, 400);
        // Successful retries bypass the limiter, including after a lost response.
        const existing = await store.existingComment(data.id, key, slug);
        if (existing) return reply({ comment: existing });
      } else if (data.action !== 'like' || typeof data.liked !== 'boolean') return reply({ error: '요청 내용을 확인해 주세요.' }, 400);
      const ip = ipHeader && request.headers.get(ipHeader)?.split(',')[0]?.trim();
      const scope = data.action === 'comment' ? 'comment' : 'like';
      if (!await store.allow(`${scope}:visitor:${key}`, scope === 'comment' ? 5 : 60)
        || (ip && !await store.allow(`${scope}:network:${hashKey(ip, secret)}`, scope === 'comment' ? 10 : 120))) {
        return reply({ error: '요청이 많아요. 1분 뒤 다시 시도해 주세요.' }, 429, { 'Retry-After': '60' });
      }
      if (data.action === 'like') return reply(await store.setLike(slug, key, data.liked));
      const saved = await store.addComment({ id: data.id, slug, nickname: data.nickname, body: data.body.trim(), visitor: key });
      if (!saved) return reply({ error: '댓글은 30초 간격으로 남길 수 있어요.' }, 429, { 'Retry-After': '30' });
      return reply({ comment: saved });
    } catch {
      return reply({ error: '댓글과 좋아요를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' }, 503);
    }
  };
}

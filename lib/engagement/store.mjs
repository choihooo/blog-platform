const PAGE_SIZE = 20;
export function parseCursor(value) {
  if (!value) return null;
  if (value.length > 150) throw new Error('Invalid cursor');
  const decoded = Buffer.from(value, 'base64url').toString();
  const match = /^(\d{1,16}):([\da-f-]{36})$/.exec(decoded);
  if (!match || !Number.isSafeInteger(Number(match[1]))) throw new Error('Invalid cursor');
  return { time: Number(match[1]), id: match[2] };
}

export function createStore(query) {
  async function likes(slug, visitor) {
    const [row] = await query('SELECT COUNT(*) AS count, COALESCE(MAX(visitor = ?), 0) AS liked FROM article_likes WHERE slug = ?', [visitor, slug]);
    return { likeCount: Number(row.count), liked: Boolean(row.liked) };
  }
  async function read(slug, visitor, cursor) {
    const before = parseCursor(cursor);
    const rows = await query(`SELECT id, nickname, body, created_at AS createdAt FROM comments
      WHERE slug = ? AND hidden = 0 ${before ? 'AND (created_at < ? OR (created_at = ? AND id < ?))' : ''}
      ORDER BY created_at DESC, id DESC LIMIT ?`,
    [slug, ...(before ? [before.time, before.time, before.id] : []), PAGE_SIZE + 1]);
    const [count] = await query('SELECT COUNT(*) AS count FROM comments WHERE slug = ? AND hidden = 0', [slug]);
    const comments = rows.slice(0, PAGE_SIZE);
    const last = comments.at(-1);
    return { comments, commentCount: Number(count.count), ...await likes(slug, visitor),
      nextCursor: rows.length > PAGE_SIZE ? Buffer.from(`${last.createdAt}:${last.id}`).toString('base64url') : null };
  }
  async function existingComment(id, visitor, slug) {
    return (await query('SELECT id, nickname, body, created_at AS createdAt FROM comments WHERE id = ? AND visitor = ? AND slug = ? AND hidden = 0', [id, visitor, slug]))[0];
  }
  async function addComment({ id, slug, nickname, body, visitor }, now = Date.now()) {
    const existing = await existingComment(id, visitor, slug);
    if (existing) return existing;
    const rows = await query(`INSERT INTO comments (id, slug, nickname, body, visitor, created_at)
      SELECT ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM comments WHERE visitor = ? AND created_at > ?)
      ON CONFLICT(id) DO NOTHING RETURNING id, nickname, body, created_at AS createdAt`,
    [id, slug, nickname, body, visitor, now, visitor, now - 30_000]);
    return rows[0] ?? await existingComment(id, visitor, slug) ?? null;
  }
  async function setLike(slug, visitor, liked) {
    if (liked) await query('INSERT INTO article_likes (slug, visitor) VALUES (?, ?) ON CONFLICT DO NOTHING', [slug, visitor]);
    else await query('DELETE FROM article_likes WHERE slug = ? AND visitor = ?', [slug, visitor]);
    return likes(slug, visitor);
  }
  async function allow(key, max, now = Date.now()) {
    await query('DELETE FROM engagement_limits WHERE started_at < ?', [now - 86_400_000]);
    const rows = await query(`INSERT INTO engagement_limits (key, started_at, count) VALUES (?, ?, 1)
      ON CONFLICT(key) DO UPDATE SET
        count = CASE WHEN started_at <= ? THEN 1 ELSE count + 1 END,
        started_at = CASE WHEN started_at <= ? THEN excluded.started_at ELSE started_at END
      WHERE started_at <= ? OR count < ? RETURNING count`, [key, now, now - 60_000, now - 60_000, now - 60_000, max]);
    return rows.length > 0;
  }
  return { read, addComment, existingComment, setLike, allow };
}

-- Apply once to the new D1 database before enabling the API.
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  nickname TEXT NOT NULL CHECK(length(nickname) BETWEEN 2 AND 24),
  body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 1000),
  visitor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK(hidden IN (0, 1))
);
CREATE INDEX IF NOT EXISTS comments_article ON comments(slug, hidden, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS comments_cooldown ON comments(visitor, created_at DESC);
CREATE TABLE IF NOT EXISTS article_likes (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (slug, visitor)
);
CREATE TABLE IF NOT EXISTS engagement_limits (
  key TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  count INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS engagement_limits_expiry ON engagement_limits(started_at);

-- D1 schema for blog migration (UUID/text-first strategy)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  category_id TEXT,
  hero_image_key TEXT,
  published_at TEXT,
  updated_at TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT,
  parent_slug TEXT,
  depth INTEGER NOT NULL CHECK (depth IN (1, 2)),
  created_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_refs (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  github_identity TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS migration_runs (
  id TEXT PRIMARY KEY,
  phase TEXT NOT NULL,
  status TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT,
  summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_media_refs_post_id ON media_refs(post_id);
CREATE INDEX IF NOT EXISTS idx_migration_runs_status ON migration_runs(status);
CREATE INDEX IF NOT EXISTS idx_migration_runs_phase_status ON migration_runs(phase, status);

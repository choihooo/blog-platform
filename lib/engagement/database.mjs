import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/** @param {Record<string, string | undefined>} config */
export function createD1Query(config, fetcher = fetch) {
  const account = config.CLOUDFLARE_ACCOUNT_ID;
  const database = config.CLOUDFLARE_D1_DATABASE_ID;
  const token = config.CLOUDFLARE_D1_API_TOKEN;
  if (!account || !database || !token) throw new Error('Engagement configuration missing');
  return async (sql, params = []) => {
    const response = await fetcher(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }), cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Engagement database unavailable');
    const data = await response.json();
    const result = data.result?.[0];
    if (!data.success || !result?.success || !Array.isArray(result.results)) throw new Error('Engagement database unavailable');
    return result.results;
  };
}

let localDatabase;
/** @param {Record<string, string | undefined>} config */
export async function getDatabase(config = process.env) {
  if (config.ENGAGEMENT_STORAGE !== 'sqlite') return createD1Query(config);
  if (config.NODE_ENV === 'production') throw new Error('Engagement configuration: SQLite is development-only');
  if (!localDatabase) {
    localDatabase = (async () => {
      // Explicit local preview only. Production always uses D1.
      const { DatabaseSync } = await import('node:sqlite');
      await mkdir(path.join(process.cwd(), '.local'), { recursive: true });
      const db = new DatabaseSync(path.join(process.cwd(), '.local', 'engagement.sqlite'));
      db.exec(await readFile(path.join(process.cwd(), 'db/migrations/0001_engagement.sql'), 'utf8'));
      db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
      return async (sql, params = []) => db.prepare(sql).all(...params);
    })();
  }
  return localDatabase;
}

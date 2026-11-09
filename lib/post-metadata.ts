export type PostMeta = { title: string; description: string; date: string; demo?: boolean };

export function validatePostCanonical(value: unknown, slug: string, site: URL): void {
  const expected = new URL(`/blog/${slug}`, site).href;
  if (typeof value === "string" || value instanceof URL) {
    try { if (new URL(String(value), site).href === expected) return; } catch { /* Report with slug below. */ }
  }
  throw new Error(`[${slug}] metadata canonical must match ${expected}`);
}

export function validatePostMeta(value: unknown, slug: string): PostMeta {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`[${slug}] Invalid public slug`);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`[${slug}] Invalid post metadata`);
  const data = value as Record<string, unknown>;
  function field(name: "title" | "description" | "date") {
    const result = data[name];
    if (typeof result !== "string" || !result.trim()) throw new Error(`[${slug}] Missing ${name}`);
    return result.trim();
  }
  const title = field("title");
  const description = field("description");
  const date = field("date");
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`[${slug}] Invalid calendar date: ${date}`);
  }
  if (data.demo === true) throw new Error(`[${slug}] Demo posts belong in fixtures, not public routes`);
  if (data.demo !== undefined && typeof data.demo !== "boolean") throw new Error(`[${slug}] Invalid demo flag`);
  return { title, description, date, ...(data.demo === false ? { demo: false } : {}) };
}

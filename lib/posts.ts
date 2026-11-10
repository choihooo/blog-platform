import fs from "node:fs/promises";
import path from "node:path";
import { validatePostMeta, validatePostCanonical, type PostMeta } from "./post-metadata";
import { getSiteConfig } from "./site";
export { validatePostMeta } from "./post-metadata";
export type { PostMeta } from "./post-metadata";

export type Post = PostMeta & { slug: string };

const BLOG_DIR = path.join(process.cwd(), "app", "blog");

// app/blog/<slug>/page.mdx 를 스캔해서 각 글이 export한 `post` 메타데이터를 모은다.
// 새 글은 폴더만 추가하면 목록에 자동으로 나타난다.
export async function getPosts(): Promise<Post[]> {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const posts: Post[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    try {
      await fs.access(path.join(BLOG_DIR, entry.name, "page.mdx"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    const mod = await import(`@/app/blog/${entry.name}/page.mdx`);
    const post = validatePostMeta(mod.post, entry.name);
    validatePostCanonical(mod.metadata?.alternates?.canonical, entry.name, getSiteConfig().url);
    posts.push({ slug: entry.name, ...post });
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

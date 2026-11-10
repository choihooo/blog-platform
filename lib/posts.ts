import fs from "node:fs/promises";
import path from "node:path";

export type PostMeta = {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  demo?: boolean;
};

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
    } catch {
      continue;
    }
    const mod = await import(`@/app/blog/${entry.name}/page.mdx`);
    posts.push({ slug: entry.name, ...(mod.post as PostMeta) });
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

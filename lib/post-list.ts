import type { Post } from "./posts";

export function filterPosts(posts: Post[], query: string): Post[] {
  const terms = query.normalize("NFKC").toLocaleLowerCase("ko-KR").trim().split(/\s+/).filter(Boolean);
  return posts.filter(post => {
    const text = `${post.title} ${post.description}`.normalize("NFKC").toLocaleLowerCase("ko-KR");
    return terms.every(term => text.includes(term));
  });
}

export function groupPostsByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const groups = new Map<string, Post[]>();
  for (const post of [...posts].sort((a, b) => b.date.localeCompare(a.date))) {
    const year = post.date.slice(0, 4);
    const group = groups.get(year) ?? [];
    group.push(post);
    groups.set(year, group);
  }
  return [...groups].map(([year, posts]) => ({ year, posts }));
}

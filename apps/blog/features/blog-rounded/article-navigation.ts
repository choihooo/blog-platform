export type ArticleListEntry = { slug: string; title: string; publishedAt: string };

export function getArticleNavigation(posts: ArticleListEntry[], currentSlug: string) {
  const ordered = [...posts].sort(
    (a, b) =>
      (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0) ||
      a.slug.localeCompare(b.slug),
  );
  const index = ordered.findIndex((post) => post.slug === currentSlug);
  const start = index < 0 ? 0 : Math.min(Math.max(0, index - 2), Math.max(0, ordered.length - 5));
  return {
    previous: index >= 0 ? ordered[index + 1] : undefined,
    next: index > 0 ? ordered[index - 1] : undefined,
    items: ordered.slice(start, start + 5),
    total: ordered.length,
  };
}

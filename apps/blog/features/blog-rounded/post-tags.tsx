export function PostTags({ tags }: { tags: { slug: string; label: string }[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="rounded-blog-tags" aria-label="글 태그">
      {tags.map((tag) => (
        <li key={tag.slug}>#{tag.label}</li>
      ))}
    </ul>
  );
}

import Link from "next/link";

export function PostTags({
  tags,
  linkBasePath,
}: {
  tags: { slug: string; label: string }[];
  linkBasePath?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <ul className="rounded-blog-tags" aria-label="글 태그">
      {tags.map((tag) => (
        <li key={tag.slug}>
          {linkBasePath ? (
            <Link href={`${linkBasePath}/${tag.slug}`}>#{tag.label}</Link>
          ) : (
            <>#{tag.label}</>
          )}
        </li>
      ))}
    </ul>
  );
}

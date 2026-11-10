import Link from "next/link";
import type { Post } from "@/lib/posts";
import { groupPostsByYear } from "@/lib/post-list";
import { BlogSearch } from "@/components/BlogSearch";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00+09:00`).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul",
  });
}

export function WritingList({ posts }: { posts: Post[] }) {
  const groups = groupPostsByYear(posts);

  return (
    <section id="writing" className="scroll-mt-8">
      <div className="writing-heading mb-4">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">글</h2>
        <BlogSearch posts={posts} />
      </div>

      {posts.some(post => post.demo) && (
        <p className="mb-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">화면 확인을 위한 예시 글입니다.</p>
      )}

      {posts.length === 0 ? (
        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ year, posts: yearPosts }) => (
            <section key={year} aria-labelledby={`writing-year-${year}`}>
              <h3 id={`writing-year-${year}`} className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">{year}</h3>
              <ul className="flex flex-col">
                {yearPosts.map(post => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group -mx-3 flex flex-col gap-2 rounded-lg px-3 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900">
                      <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <span className="font-medium">{post.title}</span>
                        <time dateTime={post.date} className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400">{formatDate(post.date)}</time>
                      </span>
                      <span className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{post.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

import type { PostMeta } from "@/lib/post-metadata";
import { getSiteConfig } from "@/lib/site";
import { getArticleStructuredData } from "@/lib/structured-data";
import { StructuredData } from "@/components/StructuredData";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostHeader({ title, date, description, slug }: PostMeta & { slug: string }) {
  return (
    <header className="not-prose mb-12">
      <StructuredData data={getArticleStructuredData({ title, date, description }, slug, getSiteConfig().url)} />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <time
        dateTime={date}
        className="mt-2 block text-sm text-neutral-500 dark:text-neutral-400"
      >
        {formatDate(date)}
      </time>
    </header>
  );
}

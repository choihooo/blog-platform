import Link from "next/link";
import { ArticleEngagement } from "@/components/ArticleEngagement";
import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Link
        href="/"
        className="mb-10 inline-block text-sm text-neutral-500 transition-colors hover:text-foreground dark:text-neutral-400"
      >
        ← 최호
      </Link>
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:underline-offset-4">
        {children}
      </article>
      <ArticleEngagement />
    </div>
  );
}

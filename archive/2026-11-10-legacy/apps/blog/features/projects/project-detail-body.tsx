import Link from "next/link";

import { ProjectBlockRenderer } from "./project-block-renderer";
import type { ProjectRelatedPost, ProjectSection } from "@blog-platform/core/content/catalog";

export function ProjectSections({ sections }: { sections: readonly ProjectSection[] }) {
  return (
    <div className="divide-y divide-border">
      {sections.map((section, sectionIndex) => (
        <section className="scroll-mt-24 py-12 sm:py-16" id={section.id} key={section.id}>
          <header className="mb-8 border-b border-border pb-4">
            {section.eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                {section.eyebrow}
              </p>
            ) : null}
            <h2
              className={`${section.eyebrow ? "mt-2" : ""} text-2xl font-semibold tracking-tight sm:text-3xl`}
            >
              {section.title}
            </h2>
          </header>
          <div className="space-y-10">
            {section.blocks.map((block, blockIndex) => {
              const blockId = "id" in block ? block.id : undefined;
              const anchorId = blockId ? `${section.id}-${blockId}` : undefined;
              return (
                <ProjectBlockRenderer
                  anchorId={anchorId}
                  block={block}
                  key={anchorId ?? `${block.type}-${blockIndex}`}
                  priority={sectionIndex === 0 && blockIndex === 0}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function RelatedPosts({ posts }: { posts?: readonly ProjectRelatedPost[] }) {
  if (!posts?.length) return null;
  return (
    <section
      aria-labelledby="project-related-posts"
      className="border-t border-border py-12 sm:py-16"
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        From the blog
      </p>
      <h2
        className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        id="project-related-posts"
      >
        관련 글
      </h2>
      <div className="mt-6 divide-y divide-border border-y border-border">
        {posts.map((post) => (
          <Link
            className="group grid gap-2 py-5 no-underline transition-colors hover:text-primary hover:no-underline active:translate-y-px sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
            href={`/blog/${post.slug}`}
            key={post.slug}
          >
            <span>
              <span className="block text-base font-semibold sm:text-lg">{post.title}</span>
              {post.excerpt ? (
                <span className="mt-1 block max-w-3xl text-sm leading-6 text-muted-foreground">
                  {post.excerpt}
                </span>
              ) : null}
            </span>
            <svg
              aria-hidden="true"
              className="hidden size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="M6 14 14 6m-6 0h6v6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}

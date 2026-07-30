import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { getPostBySlug, getPublishedPosts } from "../../../lib/content";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function Callout({ children }: { children: ReactNode }) {
  return <aside className="callout">{children}</aside>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="page">
      <article className="post-layout">
        <div>
          <header className="post-header">
            <div className="meta">
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              <span>{post.readingTimeLabel}</span>
              {post.authorProfile ? <span>{post.authorProfile.name}</span> : null}
            </div>
            <h1>{post.title}</h1>
            {post.excerpt ? <p className="post-summary">{post.excerpt}</p> : null}
            <div className="taxonomy">
              {post.categoryEntry ? (
                <Link className="pill" href={`/categories/${post.categoryEntry.slug}`}>
                  {post.categoryEntry.label}
                </Link>
              ) : null}
              {post.tagEntries.map((tag) => (
                <Link className="pill" href={`/tags/${tag.slug}`} key={tag.slug}>
                  {tag.label}
                </Link>
              ))}
            </div>
          </header>
          <div className="prose">
            <MDXRemote
              source={post.body}
              components={{ Callout }}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeSlug],
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </div>
        {post.toc.length > 0 ? (
          <aside className="toc" aria-label="Table of contents">
            <strong>On this page</strong>
            {post.toc.map((item) => (
              <a href={`#${item.slug}`} key={`${item.depth}-${item.slug}`}>
                {item.text}
              </a>
            ))}
          </aside>
        ) : null}
      </article>
    </main>
  );
}

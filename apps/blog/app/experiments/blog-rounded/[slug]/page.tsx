import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MainHeader } from "@/features/navigation/main-header";
import {
  getPostBySlug,
  getAllPublishedPosts,
  getSiteConfig,
  listCategories,
} from "@/features/blog/server/content-source";
import { formatPostDate } from "@/shared/date/date-format";
import { PostBodyRenderer } from "@/app/posts/[slug]/post-body-renderer";
import { blogPreviewPath, canOptimizePreviewImage } from "@/features/blog-rounded/preview-model";
import "@/features/blog-rounded/rounded-blog.css";
import { preparePreviewArticle } from "@/features/blog-rounded/preview-article";
import { ArticleNavigationPanel } from "@/features/blog-rounded/article-navigation-panel";
import { PostTags } from "@/features/blog-rounded/post-tags";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post?.title ?? "블로그 시안",
    robots: { index: false, follow: false, noarchive: true },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function RoundedBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, site, parents, children, posts] = await Promise.all([
    getPostBySlug(slug),
    getSiteConfig(),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
    getAllPublishedPosts({ analyzeBody: false }),
  ]);
  if (!post) notFound();
  const category = [...parents, ...children].find((item) => item.slug === post.category);
  const author = post.authorProfile?.name || site.defaultAuthorName || "Hozorica";
  const article = preparePreviewArticle(post);

  return (
    <div className="rounded-blog">
      <MainHeader active="blog" />
      <main className="rounded-blog-article-wrap">
        <Link className="rounded-blog-back" href={blogPreviewPath}>
          <ArrowLeft size={16} aria-hidden="true" />글 목록으로
        </Link>
        <article className="rounded-blog-document">
          <header className="rounded-blog-article-heading">
            <span className="rounded-blog-badge">{category?.label || "기록"}</span>
            <h1>{post.title}</h1>
            <div className="rounded-blog-article-meta">
              <img src="/icon.png" alt="" width={30} height={30} />
              <span>{author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTimeLabel}</span>
            </div>
            <PostTags tags={post.tagEntries} />
          </header>
          {post.coverImage && (
            <Image
              className="rounded-blog-article-cover"
              src={post.coverImage}
              alt=""
              width={1280}
              height={720}
              priority
              unoptimized={!canOptimizePreviewImage(post.coverImage)}
              sizes="(max-width: 759px) calc(100vw - 72px), 992px"
            />
          )}
          <div className="rounded-blog-reading-layout">
            <div className="prose">
              <PostBodyRenderer
                analyticsContext={{
                  provider: "none",
                  slug: post.slug,
                  title: post.title,
                  url: `${site.siteUrl}/blog/${post.slug}`,
                  siteUrl: site.siteUrl,
                }}
                nodes={article.nodes}
              />
            </div>
            {article.toc.length > 0 && (
              <aside className="rounded-blog-toc" aria-label="이 글의 목차">
                <h2>이 글의 목차</h2>
                {article.toc.map((item) => (
                  <Link href={`#${item.slug}`} key={item.slug}>
                    {item.text}
                  </Link>
                ))}
              </aside>
            )}
          </div>
          <ArticleNavigationPanel posts={posts} currentSlug={post.slug} />
          <footer className="rounded-blog-article-bottom">
            <span>HOZORICA · BLOG</span>
            <Link href={`/blog/${post.slug}`}>
              현재 디자인으로 보기
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}

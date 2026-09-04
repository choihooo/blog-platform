import { createSeoSubject, type SeoSite, type SeoSubject } from "@blog-platform/seo-engine";

import type { PublicPost } from "../server/content-source";

export function siteForSeo(site: {
  siteName: string;
  siteUrl: string;
  description?: string;
  defaultAuthor?: string;
  defaultAuthorName?: string;
  defaultAuthorAvatar?: string;
  adminGithubLogin?: string;
}): SeoSite {
  return {
    siteName: site.siteName,
    siteUrl: site.siteUrl,
    contentPath: "/blog",
    description: site.description,
    defaultAuthor: site.defaultAuthor
      ? {
          id: site.defaultAuthor,
          name: site.defaultAuthorName || site.defaultAuthor,
          avatar: site.defaultAuthorAvatar,
          url: `${site.siteUrl.replace(/\/+$/, "")}/resume`,
          sameAs: site.adminGithubLogin
            ? [`https://github.com/${site.adminGithubLogin}`]
            : undefined,
        }
      : undefined,
  };
}

export function postToSeoSubject(post: PublicPost, site: SeoSite): SeoSubject {
  return createSeoSubject({
    post: {
      path: post.path,
      status: post.status,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      author: post.author,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      category: post.category,
      tags: post.tags,
      body: post.body,
    },
    site,
    author: post.authorProfile
      ? {
          id: post.authorProfile.id,
          name: post.authorProfile.name,
          avatar: post.authorProfile.avatar,
          url:
            post.authorProfile.id === site.defaultAuthor?.id ? site.defaultAuthor.url : undefined,
          sameAs:
            post.authorProfile.id === site.defaultAuthor?.id
              ? site.defaultAuthor.sameAs
              : undefined,
        }
      : site.defaultAuthor,
    category: post.categoryEntry
      ? {
          slug: post.categoryEntry.slug,
          label: post.categoryEntry.label,
          description: post.categoryEntry.description,
        }
      : undefined,
    tags: post.tagEntries.map((tag) => ({
      slug: tag.slug,
      label: tag.label,
      description: tag.description,
    })),
    analysis: {
      headings: post.toc.map((item) => ({ ...item })),
      toc: post.toc,
      readingTime: { minutes: 1, words: 0, label: post.readingTimeLabel },
    },
  });
}

export function postsToSeoSubjects(posts: PublicPost[], site: SeoSite) {
  return posts.map((post) => postToSeoSubject(post, site));
}

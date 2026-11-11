import type { PostMeta } from './post-metadata';

export function getWebsiteStructuredData(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': new URL('#website', site).href, url: site.href, name: '최호', inLanguage: 'ko-KR', publisher: { '@id': new URL('#person', site).href } },
      { '@type': 'Person', '@id': new URL('#person', site).href, name: '최호', url: site.href },
    ],
  };
}

export function getArticleStructuredData(post: PostMeta, slug: string, site: URL) {
  const url = new URL(`/blog/${encodeURIComponent(slug)}`, site).href;
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${url}#article`,
    url, mainEntityOfPage: url, headline: post.title, description: post.description,
    datePublished: `${post.date}T00:00:00+09:00`, inLanguage: 'ko-KR',
    author: { '@type': 'Person', '@id': new URL('#person', site).href, name: '최호', url: site.href },
    isPartOf: { '@type': 'WebSite', '@id': new URL('#website', site).href, name: '최호', url: site.href },
  };
}

export function serializeStructuredData(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

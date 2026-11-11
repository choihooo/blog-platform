import { notFound } from 'next/navigation';
import BlogLayout from '@/app/blog/layout';
import MopingArticle from '@/app/blog/moping-retrospective/page.mdx';

export const metadata = { title: '모핑 개발 회고 · 로컬 미리보기', robots: { index: false, follow: false } };

export default function MopingPreview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <BlogLayout><MopingArticle /></BlogLayout>;
}

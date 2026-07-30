import { PostList } from "./components/post-list";
import { getPublishedPosts, getSiteConfig } from "../lib/content";

export default async function BlogHomePage() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPublishedPosts()]);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Published posts</p>
        <h1>{site.siteName}</h1>
        <p>Repository에 저장된 MDX 글 중 공개 상태인 글만 보여줍니다.</p>
      </section>
      <PostList posts={posts} />
    </main>
  );
}

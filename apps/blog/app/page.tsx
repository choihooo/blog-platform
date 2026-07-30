import { PostList } from "./components/post-list";
import { getPublishedPosts, getSiteConfig } from "../lib/content";

export default async function BlogHomePage() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPublishedPosts()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <section className="mb-10 grid gap-4">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Published posts</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          {site.siteName}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          Repository에 저장된 MDX 글 중 공개 상태인 글만 보여줍니다.
        </p>
      </section>
      <PostList posts={posts} />
    </main>
  );
}

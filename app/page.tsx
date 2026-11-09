import { getPosts } from "@/lib/posts";
import { ProfileIntro } from "@/components/ProfileIntro";
import { WritingList } from "@/components/WritingList";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div>
      <ProfileIntro accent="#FF6F0F" />
      <WritingList posts={posts} />
    </div>
  );
}

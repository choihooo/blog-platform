import { StructuredData } from "@/components/StructuredData";
import { getWebsiteStructuredData } from "@/lib/structured-data";
import { getSiteConfig } from "@/lib/site";
import { getPosts } from "@/lib/posts";
import { ProfileIntro } from "@/components/ProfileIntro";
import { WritingList } from "@/components/WritingList";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div>
      <StructuredData data={getWebsiteStructuredData(getSiteConfig().url)} />
      <ProfileIntro accent="#FF6F0F" />
      <WritingList posts={posts} />
    </div>
  );
}

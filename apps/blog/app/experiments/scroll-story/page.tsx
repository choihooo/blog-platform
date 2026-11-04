import type { Metadata } from "next";

import { ScrollStory } from "@/features/scroll-story/scroll-story";
import { PortfolioChat } from "@/features/pixel-room/portfolio-chat";
import "@/features/pixel-room/pixel-room.css";

export const metadata: Metadata = {
  title: "호조리카 · 스크롤 시안",
  robots: { index: false, follow: false },
};

export default function ScrollStoryPreviewPage() {
  return (
    <>
      <ScrollStory />
      <div className="pixel-room-page scroll-story-chat">
        <PortfolioChat />
      </div>
    </>
  );
}

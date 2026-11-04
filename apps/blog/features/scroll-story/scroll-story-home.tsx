import { PortfolioChat } from "@/features/pixel-room/portfolio-chat";
import { ScrollStory } from "./scroll-story";
import "@/features/pixel-room/pixel-room.css";

export function ScrollStoryHome() {
  return (
    <>
      <ScrollStory />
      <div className="pixel-room-page scroll-story-chat">
        <PortfolioChat />
      </div>
    </>
  );
}

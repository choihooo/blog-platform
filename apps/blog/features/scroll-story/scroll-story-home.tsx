import { PortfolioChat } from "@/features/chat/portfolio-chat";
import { ScrollStory } from "./scroll-story";

export function ScrollStoryHome() {
  return (
    <>
      <ScrollStory />
      <div className="chat-surface scroll-story-chat">
        <PortfolioChat />
      </div>
    </>
  );
}

import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("chat entrypoints", () => {
  it("shares one closed chat on the home and room without preloading a model", async () => {
    expect(existsSync(new URL("./portfolio-chat.tsx", import.meta.url))).toBe(true);
    const { ScrollStoryHome } = await import("../scroll-story/scroll-story-home");
    const { PixelRoom } = await import("../pixel-room/pixel-room");
    for (const element of [<ScrollStoryHome />, <PixelRoom />]) {
      const html = renderToStaticMarkup(element);
      expect(html.match(/aria-controls="portfolio-chat-panel"/g)).toHaveLength(1);
      expect(html).toContain('aria-expanded="false"');
      expect(html).not.toContain(".gguf");
      expect(html).not.toContain("wllama.wasm");
    }
  });
});

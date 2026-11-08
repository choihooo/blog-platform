import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("chat entrypoints", () => {
  it("renders one closed chat on the home without preloading a model", async () => {
    const { ScrollStoryHome } = await import("../scroll-story/scroll-story-home");
    const html = renderToStaticMarkup(<ScrollStoryHome />);
    expect(html.match(/aria-controls="portfolio-chat-panel"/g)).toHaveLength(1);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(".gguf");
    expect(html).not.toContain("wllama.wasm");
  });
});

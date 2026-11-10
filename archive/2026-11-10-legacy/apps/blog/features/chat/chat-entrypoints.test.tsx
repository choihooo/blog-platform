import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

describe("chat entrypoints", () => {
  it.each(["/", "/blog", "/blog/example", "/projects", "/projects/kusting", "/about", "/resume"])(
    "renders exactly one closed chat on %s without preloading a model",
    async (pathname) => {
      route.pathname = pathname;
      const { ScrollStoryHome } = await import("../scroll-story/scroll-story-home");
      const { HomeAwareShell } = await import("../navigation/home-aware-shell");
      const html = renderToStaticMarkup(
        <HomeAwareShell header={<header>메뉴</header>}>
          {pathname === "/" ? <ScrollStoryHome /> : <p>페이지 내용</p>}
        </HomeAwareShell>,
      );
      expect(html.match(/aria-controls="portfolio-chat-panel"/g)).toHaveLength(1);
      expect(html).toContain('aria-expanded="false"');
      expect(html).not.toContain(".gguf");
      expect(html).not.toContain("wllama.wasm");
    },
  );
});

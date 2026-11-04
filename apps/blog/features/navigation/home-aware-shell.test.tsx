import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HomeAwareShell } from "./home-aware-shell";
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
describe("public header policy", () => {
  it.each(["/", "/experiments/pixel-room", "/blog", "/projects", "/resume", "/unknown"])(
    "renders the correct shell for %s",
    (path) => {
      route.pathname = path;
      const html = renderToStaticMarkup(
        <HomeAwareShell header={<header>메뉴</header>}>
          <p>내용</p>
        </HomeAwareShell>,
      );
      expect(html.includes("<header>메뉴</header>")).toBe(
        !["/", "/experiments/pixel-room"].includes(path),
      );
      expect(html).toContain("<p>내용</p>");
    },
  );
});

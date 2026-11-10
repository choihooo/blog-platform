import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BlogHeaderSearchForm } from "../blog/components/blog-search-form";
import { SiteShell } from "./site-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog/page/2",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("site shell composition", () => {
  it("renders the supplied search once in the archive header", () => {
    const html = renderToStaticMarkup(
      <SiteShell
        categories={[]}
        siteName="Blog"
        headerSearch={
          <div data-search-owner="layout">
            <BlogHeaderSearchForm />
          </div>
        }
      >
        <p>Archive</p>
      </SiteShell>,
    );
    expect(html).toContain('data-search-owner="layout"');
    expect(html.match(/action="\/blog\/search"/g)).toHaveLength(1);
    expect(html).toContain('name="q"');
    expect(html).toContain("Archive");
  });
});

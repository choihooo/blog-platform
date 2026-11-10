import { describe, expect, it } from "vitest";
import config from "../../../next.config.mjs";
import { legacyPostSlugs } from "../data/legacy-post-redirects.mjs";

describe("legacy post redirects", () => {
  it("maps known desktop, mobile and intermediate slugs directly to canonical articles", async () => {
    const rules = await config.redirects!();
    for (const [id, slug] of Object.entries(legacyPostSlugs)) {
      for (const source of [`/${id}`, `/m/${id}`, `/posts/tistory-${id}`, `/blog/tistory-${id}`]) {
        expect(rules.find((rule) => rule.source === source)).toMatchObject({
          destination: `https://hozorica.com/blog/${slug}`,
          permanent: true,
        });
      }
    }
    expect(rules.some((rule) => rule.source === "/999")).toBe(false);
    expect(rules.some((rule) => rule.source === "/:id")).toBe(false);
  });
});

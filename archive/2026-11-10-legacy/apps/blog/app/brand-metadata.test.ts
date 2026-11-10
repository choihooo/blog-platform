import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/blog/server/content-source", () => ({
  getSiteConfig: async () => ({
    siteUrl: "https://hozorica.com",
    siteName: "Hozorica",
    description: "Hozorica blog",
  }),
  listCategories: async () => [],
}));

import { generateMetadata } from "./layout";

describe("site brand metadata", () => {
  it("uses the current character card for website sharing", async () => {
    const metadata = await generateMetadata();
    expect(metadata.openGraph?.images).toEqual([
      { url: "/brand/hozorica-card-v2.webp", width: 1200, height: 630 },
    ]);
    expect(metadata.twitter).toMatchObject({ images: ["/brand/hozorica-card-v2.webp"] });
  });
});

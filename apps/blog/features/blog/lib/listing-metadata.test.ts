import { describe, expect, it } from "vitest";
import { homeListingMetadata } from "./listing-metadata";

describe("blog listing metadata", () => {
  it("gives the first page an explicit browser title", () => {
    const metadata = homeListingMetadata({ siteUrl: "https://hozorica.com", page: 1 });
    expect(metadata.title).toBe("블로그");
    expect(metadata.alternates?.canonical).toBe("https://hozorica.com/blog");
  });
});

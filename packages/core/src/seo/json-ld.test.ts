import { describe, expect, it } from "vitest";
import { generateJsonLd } from "./json-ld.js";
import { draftSubject, seoSubject } from "./test-fixtures.js";

describe("generateJsonLd", () => {
  it("returns BlogPosting and breadcrumbs for published posts only", () => {
    const output = generateJsonLd(
      seoSubject({
        author: {
          id: "ho",
          name: "Ho",
          url: "https://example.com/resume",
          sameAs: ["https://github.com/ho"],
        },
      }),
    );
    expect(output.map((item) => (item as { "@type": string })["@type"])).toEqual([
      "BlogPosting",
      "BreadcrumbList",
    ]);
    expect(output[0]).toMatchObject({
      author: {
        "@id": "https://example.com/resume#person",
        "@type": "Person",
        name: "Ho",
        sameAs: ["https://github.com/ho"],
        url: "https://example.com/resume",
      },
      image: "https://example.com/media/cover.webp",
      mainEntityOfPage: {
        "@id": "https://example.com/posts/hello-world",
        "@type": "WebPage",
      },
      publisher: { "@type": "Organization", name: "Ho's Blog" },
    });
    expect(generateJsonLd(draftSubject())).toEqual([]);
    expect(JSON.stringify(output)).not.toContain("undefined");
  });
});

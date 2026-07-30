import { describe, expect, it } from "vitest";
import { generateJsonLd } from "./json-ld.js";
import { seoSubject } from "./test-fixtures.js";

describe("generateJsonLd", () => {
  it("returns BlogPosting and breadcrumbs for published posts only", () => {
    expect(
      generateJsonLd(seoSubject()).map((item) => (item as { "@type": string })["@type"]),
    ).toEqual(["BlogPosting", "BreadcrumbList"]);
    expect(generateJsonLd(seoSubject({ status: "draft" }))).toEqual([]);
  });
});

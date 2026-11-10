import { describe, expect, it } from "vitest";

import { personJsonLd, profilePageJsonLd, serializeJsonLd } from "./person-json-ld";

const site = {
  adminGithubLogin: "choihooo",
  defaultAuthor: "ho",
  defaultAuthorAvatar: "/resume/profile.png",
  defaultAuthorName: "Ho Choi",
  description: "Portfolio",
  siteUrl: "https://example.com/",
};

describe("person JSON-LD", () => {
  it("uses one stable author identity across the site", () => {
    expect(personJsonLd(site)).toMatchObject({
      "@id": "https://example.com/resume#person",
      "@type": "Person",
      image: "https://example.com/resume/profile.png",
      sameAs: ["https://github.com/choihooo"],
      url: "https://example.com/resume",
    });
    expect(profilePageJsonLd(site).mainEntity).toEqual(personJsonLd(site));
  });

  it("escapes markup-significant characters before embedding JSON-LD", () => {
    expect(serializeJsonLd({ value: "</script>" })).not.toContain("</script>");
  });
});

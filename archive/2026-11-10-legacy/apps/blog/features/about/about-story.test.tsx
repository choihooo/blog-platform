import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AboutStory } from "./about-story";

describe("About story document", () => {
  it("ships a readable introduction and real links before JavaScript or motion is enabled", () => {
    const html = renderToStaticMarkup(
      <AboutStory
        contact={{ email: "hello@example.com", githubUrl: "https://github.com/example" }}
      />,
    );
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    for (const text of ["호조리카", "축구", "함께", "사진"]) expect(html).toContain(text);
    for (const href of [
      "/projects",
      "/resume",
      "mailto:hello@example.com",
      "https://github.com/example",
    ])
      expect(html).toContain(`href="${href}"`);
    expect(html).not.toContain("autoPlay");
    expect(html).not.toContain('src="/brand/about/story.mp4"');
    expect(html).not.toContain('aria-hidden="true" id="about-');
    expect(html).toContain('data-mode="static"');
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeoPanel } from "./seo-panel";

const report = {
  score: 100,
  status: "pass" as const,
  blockingIssues: [],
  warnings: [],
  passedChecks: [],
  searchPreview: { title: "Title", description: "Description", url: "https://example.com" },
  socialPreview: { title: "Title", description: "Description", image: "/og/title" },
  jsonLdPreview: [],
  generatedUrls: {},
  evaluatedAt: "2026-07-30",
};

describe("SeoPanel", () => {
  it("shows score, preview, and links without metrics", () => {
    render(
      <SeoPanel
        links={{ publicPostUrl: "https://example.com", disabledReasons: [] }}
        report={report}
      />,
    );
    expect(screen.getByText("100/100")).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.queryByText(/views/i)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { aiWorkflowProject } from "./data/ai-workflow";
import { kustingProject } from "./data/kusting";
import { getProjectSections, getProjectToc } from "./project-content";

describe("project content", () => {
  it("keeps native block order and builds nested TOC items", () => {
    const sections = getProjectSections(aiWorkflowProject);
    const toc = getProjectToc(sections);

    expect(sections[0]?.blocks.map((block) => block.type)).toEqual([
      "image",
      "text",
      "text",
      "result",
    ]);
    expect(toc[0]).toEqual({
      children: [
        { href: "#dom-context-problem", label: "Problem" },
        { href: "#dom-context-approach", label: "Approach" },
        { href: "#dom-context-result", label: "Result" },
      ],
      href: "#dom-context",
      label: "화면 이미지와 실제 DOM 요소가 연결되지 않음",
    });
  });

  it("converts legacy stories without losing their narrative", () => {
    const sections = getProjectSections(kustingProject);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.blocks.map((block) => block.type)).toEqual(["text", "text", "result"]);
    expect(getProjectToc(sections)[0]?.children.map((child) => child.label)).toEqual([
      "Problem",
      "Approach",
      "Result",
    ]);
  });
});

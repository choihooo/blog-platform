import { describe, expect, it } from "vitest";

import { apiDataTransitionProject } from "./data/api-data-transition";
import { aiWorkflowProject } from "./data/ai-workflow";
import { commaProject } from "./data/comma";
import { forensicAgentProject } from "./data/forensic-agent";
import { geobugirinProject } from "./data/geobugirin";
import { i18nValidationProject } from "./data/i18n-validation";
import { kustingProject } from "./data/kusting";
import { nexacroReactPocProject } from "./data/nexacro-react-poc";
import { typescriptMigrationProject } from "./data/typescript-migration";
import { projects } from "./project-data";
import { getProjectSections, getProjectToc } from "./project-content";

describe("project content", () => {
  it("provides complete header metadata for every registered project", () => {
    for (const project of projects) {
      expect(project.role).toBeTruthy();
      expect(project.period).toBeTruthy();
      expect(project.organization).toBeTruthy();
      expect(project.team).toBeTruthy();
    }
  });

  it("links public project evidence to a verifiable source", () => {
    expect(geobugirinProject.evidence).toContainEqual({
      type: "repository",
      label: "Tauri 마이그레이션 저장소",
      href: "https://github.com/choihooo/gbgr-migration",
    });
  });

  it("keeps native block order and builds nested TOC items", () => {
    const sections = getProjectSections(aiWorkflowProject);
    const toc = getProjectToc(sections);

    expect(sections[0]?.blocks.map((block) => block.type)).toEqual([
      "image",
      "text",
      "text",
      "text",
      "result",
    ]);
    expect(toc[0]).toEqual({
      children: [
        { href: "#dom-context-problem", label: "문제" },
        { href: "#dom-context-analysis", label: "원인 분석" },
        { href: "#dom-context-solution", label: "해결" },
        { href: "#dom-context-result", label: "결과" },
      ],
      href: "#dom-context",
      label: "AI가 화면의 수정 대상을 정확히 찾지 못함",
    });
  });

  it.each([
    aiWorkflowProject,
    nexacroReactPocProject,
    forensicAgentProject,
    apiDataTransitionProject,
    i18nValidationProject,
    typescriptMigrationProject,
    kustingProject,
    commaProject,
    geobugirinProject,
  ])("uses problem, analysis, solution, and result for every $name case", (project) => {
    const sections = getProjectSections(project);

    for (const section of sections) {
      expect(
        section.blocks
          .filter((block) => "id" in block && block.id)
          .map((block) => ("title" in block ? block.title : undefined)),
      ).toEqual(["문제", "원인 분석", "해결", "결과"]);
    }
  });
});

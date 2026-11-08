import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { apiDataTransitionProject } from "@blog-platform/core/content/catalog";
import { aiWorkflowProject } from "@blog-platform/core/content/catalog";
import { commaProject } from "@blog-platform/core/content/catalog";
import { forensicAgentProject } from "@blog-platform/core/content/catalog";
import { geobugirinProject } from "@blog-platform/core/content/catalog";
import { i18nValidationProject } from "@blog-platform/core/content/catalog";
import { kustingProject } from "@blog-platform/core/content/catalog";
import { nexacroReactPocProject } from "@blog-platform/core/content/catalog";
import { typescriptMigrationProject } from "@blog-platform/core/content/catalog";
import { projects } from "@blog-platform/core/content/catalog";
import { getProjectSections, getProjectToc } from "./project-content";

describe("project content", () => {
  it("registers publishing showcases with live links and existing media", () => {
    for (const slug of ["still", "afterimage"]) {
      const project = projects.find((item) => item.slug === slug)!;
      expect(project.format).toBe("showcase");
      expect(project.evidence).toContainEqual({
        type: "deployment",
        label: "사이트 바로 보기",
        href: `https://${slug}.hozorica.com/`,
      });
      for (const section of getProjectSections(project)) {
        for (const block of section.blocks) {
          const paths =
            block.type === "image"
              ? [block.src]
              : block.type === "video"
                ? [block.mp4Src, block.poster]
                : [];
          for (const path of paths) expect(existsSync(resolve("public", path.slice(1)))).toBe(true);
        }
      }
    }
  });
  it("provides complete header metadata for every registered project", () => {
    for (const project of projects) {
      expect(project.role).toBeTruthy();
      expect(project.organization).toBeTruthy();
      if (project.format !== "showcase") {
        expect(project.period).toBeTruthy();
        expect(project.team).toBeTruthy();
      }
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

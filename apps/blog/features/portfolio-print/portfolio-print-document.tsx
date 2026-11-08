"use client";

import { aiWorkflowProject } from "@blog-platform/core/content/catalog";
import type { ProjectContentBlock, ProjectSection } from "@blog-platform/core/content/catalog";

import {
  PrintCoverSheet,
  PrintOverviewSheet,
  PrintSystemSheet,
  type ImageBlock,
  type ResultBlock,
} from "./portfolio-print-sheets";
import styles from "./portfolio-print.module.css";

type TextBlock = Extract<ProjectContentBlock, { type: "text" }>;
const project = aiWorkflowProject;

function findBlock<T extends ProjectContentBlock["type"]>(
  section: ProjectSection,
  type: T,
  id?: string,
) {
  return section.blocks.find(
    (block) => block.type === type && (id === undefined || ("id" in block && block.id === id)),
  ) as Extract<ProjectContentBlock, { type: T }> | undefined;
}

function paragraphs(block?: TextBlock) {
  if (!block) return [];
  return typeof block.body === "string" ? [block.body] : [...block.body];
}

export function PortfolioPrintDocument() {
  const domCase = project.sections[0]!;
  const parallelCase = project.sections[2]!;
  const domProblem = paragraphs(findBlock(domCase, "text", "problem"));
  const domAnalysis = paragraphs(findBlock(domCase, "text", "analysis"));
  const domSolution = paragraphs(findBlock(domCase, "text", "solution"));
  const domResult = findBlock(domCase, "result", "result") as ResultBlock | undefined;
  const domImage = findBlock(domCase, "image") as ImageBlock | undefined;
  const architectureImage = findBlock(parallelCase, "image") as ImageBlock | undefined;
  const parallelSolution = paragraphs(findBlock(parallelCase, "text", "solution"));
  const parallelResult = findBlock(parallelCase, "result", "result") as ResultBlock | undefined;

  return (
    <main className={styles.document}>
      <PrintCoverSheet />
      <PrintOverviewSheet
        domAnalysis={domAnalysis}
        domCase={domCase}
        domImage={domImage}
        domProblem={domProblem}
        domSolution={domSolution}
      />
      <PrintSystemSheet
        architectureImage={architectureImage}
        domResult={domResult}
        parallelResult={parallelResult}
        parallelSolution={parallelSolution}
      />
    </main>
  );
}

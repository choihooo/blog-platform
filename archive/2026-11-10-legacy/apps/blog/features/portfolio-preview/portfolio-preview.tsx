"use client";

import { AnalysisFrame, CoverFrame, ProjectFrame, SystemFrame } from "./portfolio-preview-frames";
import styles from "./portfolio-preview.module.css";

export function PortfolioPreview() {
  return (
    <main className={styles.preview}>
      <nav aria-label="프리뷰 페이지" className={styles.rail}>
        {[
          ["01", "Cover"],
          ["02", "Project"],
          ["03", "Analysis"],
          ["04", "System"],
        ].map(([number, label]) => (
          <a href={`#frame-${number}`} key={number}>
            <span>{number}</span>
            <small>{label}</small>
          </a>
        ))}
      </nav>
      <CoverFrame />
      <ProjectFrame />
      <AnalysisFrame />
      <SystemFrame />
    </main>
  );
}

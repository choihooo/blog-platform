import { adminPlatformProject } from "./data/admin-platform";
import { aiWorkflowProject } from "./data/ai-workflow";
import { cmc19Project } from "./data/cmc-19";
import { dreamTrackProject } from "./data/dream-track";
import { frontendPlatformProject } from "./data/frontend-platform";
import { geobugirinProject } from "./data/geobugirin";
import { jikhaengProject } from "./data/jikhaeng";
import { kustingProject } from "./data/kusting";
import { sirenPathProject } from "./data/siren-path";
import type { ProjectCaseStudy } from "./project-types";

export type { ProjectCaseStudy, ProjectMetric, ProjectStory } from "./project-types";

export const projects: readonly ProjectCaseStudy[] = [
  aiWorkflowProject,
  kustingProject,
  geobugirinProject,
  dreamTrackProject,
  jikhaengProject,
  sirenPathProject,
  frontendPlatformProject,
  adminPlatformProject,
  cmc19Project,
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

import { aiWorkflowProject } from "./data/ai-workflow";
import { apiDataTransitionProject } from "./data/api-data-transition";
import { commaProject } from "./data/comma";
import { forensicAgentProject } from "./data/forensic-agent";
import { geobugirinProject } from "./data/geobugirin";
import { i18nValidationProject } from "./data/i18n-validation";
import { kustingProject } from "./data/kusting";
import { nexacroReactPocProject } from "./data/nexacro-react-poc";
import { typescriptMigrationProject } from "./data/typescript-migration";
import type { ProjectCaseStudy } from "./project-types";

export type * from "./project-types";

export const projects: readonly ProjectCaseStudy[] = [
  aiWorkflowProject,
  nexacroReactPocProject,
  forensicAgentProject,
  apiDataTransitionProject,
  i18nValidationProject,
  typescriptMigrationProject,
  kustingProject,
  commaProject,
  geobugirinProject,
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

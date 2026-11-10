import { aiWorkflowProject } from "./data/ai-workflow.js";
import { afterimageProject } from "./data/afterimage.js";
import { stillProject } from "./data/still.js";
import { apiDataTransitionProject } from "./data/api-data-transition.js";
import { commaProject } from "./data/comma.js";
import { forensicAgentProject } from "./data/forensic-agent.js";
import { geobugirinProject } from "./data/geobugirin.js";
import { i18nValidationProject } from "./data/i18n-validation.js";
import { kustingProject } from "./data/kusting.js";
import { nexacroReactPocProject } from "./data/nexacro-react-poc.js";
import { typescriptMigrationProject } from "./data/typescript-migration.js";
import type { ProjectCaseStudy } from "./project-types.js";

export type * from "./project-types.js";

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
  stillProject,
  afterimageProject,
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

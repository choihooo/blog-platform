import { ProjectDetailLoadingSkeleton } from "@/features/projects/project-loading-skeleton";
import { ProjectModal } from "@/features/projects/project-modal";

export default function ProjectDetailModalLoading() {
  return (
    <ProjectModal projectName="PROJECT">
      <ProjectDetailLoadingSkeleton />
    </ProjectModal>
  );
}

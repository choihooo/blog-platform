import { ProjectFeedModal } from "@/features/projects/project-feed-modal";
import { ProjectFeedLoadingSkeleton } from "@/features/projects/project-loading-skeleton";

export default function ProjectsModalLoading() {
  return (
    <ProjectFeedModal>
      <ProjectFeedLoadingSkeleton />
    </ProjectFeedModal>
  );
}

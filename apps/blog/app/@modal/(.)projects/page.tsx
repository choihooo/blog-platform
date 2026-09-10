import { ProjectFeedModal } from "@/features/projects/project-feed-modal";
import { ProjectsPage } from "@/features/projects/projects-page";

export default function ProjectsModalPage() {
  return (
    <ProjectFeedModal>
      <ProjectsPage variant="modal" />
    </ProjectFeedModal>
  );
}

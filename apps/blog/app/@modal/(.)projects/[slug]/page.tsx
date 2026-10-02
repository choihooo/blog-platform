import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/features/projects/project-detail-page";
import { getProject } from "@/features/projects/project-data";
import { ProjectModal } from "@/features/projects/project-modal";

type ProjectModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectModalPage({ params }: ProjectModalPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  return (
    <ProjectModal
      projectName={project.name}
      siteUrl={
        project.format === "showcase"
          ? project.evidence?.find((item) => item.type === "deployment")?.href
          : undefined
      }
    >
      <ProjectDetailPage mode="modal" project={project} />
    </ProjectModal>
  );
}

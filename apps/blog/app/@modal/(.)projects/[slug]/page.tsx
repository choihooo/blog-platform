import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/features/projects/project-detail-page";
import { getProject, projects } from "@/features/projects/project-data";
import { ProjectModal } from "@/features/projects/project-modal";

type ProjectModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectModalPage({ params }: ProjectModalPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projects[projectIndex - 1];
  const nextProject = projects[projectIndex + 1];

  return (
    <ProjectModal
      nextProject={nextProject ? { name: nextProject.name, slug: nextProject.slug } : undefined}
      previousProject={
        previousProject ? { name: previousProject.name, slug: previousProject.slug } : undefined
      }
      projectName={project.name}
    >
      <ProjectDetailPage mode="modal" project={project} />
    </ProjectModal>
  );
}

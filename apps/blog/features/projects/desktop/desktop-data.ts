import { projects } from "@blog-platform/core/content/catalog";
import { projectCardAssets } from "../project-card-assets";

export const desktopProjects = projects;
export function projectIdFromHash(hash: string): string | undefined {
  try {
    const slug = decodeURIComponent(hash.replace(/^#/, ""));
    return projects.some((project) => project.slug === slug) ? slug : undefined;
  } catch {
    return undefined;
  }
}
export function projectPoster(slug: string) {
  const media = projectCardAssets[slug];
  return media
    ? media.primaryMode === "logo"
      ? media.secondary
      : media.primary
    : "/brand/no-thumbnail.webp";
}
export const projectPreviews: Record<string, { src: string; poster: string }> = {
  afterimage: {
    src: "/projects/afterimage/interaction.mp4",
    poster: "/projects/afterimage/card.jpg",
  },
  comma: {
    src: "/projects/comma/native-gallery-feed-flow.mp4",
    poster: "/projects/comma/native-gallery-feed-flow-poster.jpg",
  },
  geobugirin: {
    src: "/projects/geobugirin/posture-feedback.mp4",
    poster: "/projects/geobugirin/posture-feedback-poster.jpg",
  },
};
export function windowTitle(id: string) {
  return id === "about"
    ? "호조리카 소개"
    : id === "projects"
      ? "모든 프로젝트"
      : projects.find((p) => p.slug === id)?.name || "프로젝트";
}

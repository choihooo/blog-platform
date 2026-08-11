import type {
  ProjectCaseStudy,
  ProjectContentBlock,
  ProjectSection,
  ProjectStory,
} from "./project-types";

export type ProjectTocItem = {
  children: readonly {
    href: string;
    label: string;
  }[];
  href: string;
  label: string;
};

function legacyStoryToSection(story: ProjectStory, index: number): ProjectSection {
  const sectionId = `story-${index + 1}`;
  const blocks: ProjectContentBlock[] = [];

  if (story.image) {
    blocks.push({
      alt: story.image.alt,
      caption: story.image.caption,
      layout: "wide",
      src: story.image.src,
      type: "image",
    });
  }

  blocks.push(
    {
      body: story.problem,
      id: "problem",
      title: "Problem",
      type: "text",
    },
    {
      body: story.approach,
      id: "approach",
      title: "Approach",
      type: "text",
    },
    {
      body: story.result,
      id: "result",
      title: "Result",
      type: "result",
    },
  );

  return {
    blocks,
    eyebrow: story.eyebrow,
    id: sectionId,
    title: story.title,
  };
}

export function getProjectSections(project: ProjectCaseStudy): readonly ProjectSection[] {
  return project.sections ?? project.stories.map(legacyStoryToSection);
}

export function getProjectToc(sections: readonly ProjectSection[]): readonly ProjectTocItem[] {
  return sections.map((section) => ({
    children: section.blocks.flatMap((block) => {
      if (!("id" in block) || !block.id || !("title" in block) || !block.title) {
        return [];
      }

      return [
        {
          href: `#${section.id}-${block.id}`,
          label: block.tocLabel ?? block.title,
        },
      ];
    }),
    href: `#${section.id}`,
    label: section.title,
  }));
}

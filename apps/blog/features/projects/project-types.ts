export type ProjectMetric = {
  detail: string;
  label: string;
  value: string;
};

type ProjectBlockBase = {
  id?: string;
  layout?: "reading" | "wide" | "full";
  title?: string;
  tocLabel?: string;
};

export type ProjectTextBlock = ProjectBlockBase & {
  body: string | readonly string[];
  type: "text";
};

export type ProjectImageBlock = ProjectBlockBase & {
  alt: string;
  caption?: string;
  height?: number;
  src: string;
  type: "image";
  width?: number;
};

export type ProjectBulletsBlock = ProjectBlockBase & {
  items: readonly string[];
  type: "bullets";
};

export type ProjectMetricsBlock = ProjectBlockBase & {
  items: readonly ProjectMetric[];
  type: "metrics";
};

export type ProjectResultBlock = ProjectBlockBase & {
  body: string;
  type: "result";
};

export type ProjectQuoteBlock = ProjectBlockBase & {
  attribution?: string;
  body: string;
  type: "quote";
};

export type ProjectCodeBlock = ProjectBlockBase & {
  caption?: string;
  code: string;
  language?: string;
  type: "code";
};

export type ProjectDividerBlock = {
  type: "divider";
};

export type ProjectColumnsBlock = ProjectBlockBase & {
  items: readonly {
    body: string | readonly string[];
    title?: string;
  }[];
  type: "columns";
};

export type ProjectContentBlock =
  | ProjectTextBlock
  | ProjectImageBlock
  | ProjectBulletsBlock
  | ProjectMetricsBlock
  | ProjectResultBlock
  | ProjectQuoteBlock
  | ProjectCodeBlock
  | ProjectDividerBlock
  | ProjectColumnsBlock;

export type ProjectSection = {
  blocks: readonly ProjectContentBlock[];
  eyebrow?: string;
  id: string;
  title: string;
};

export type ProjectStory = {
  approach: string;
  eyebrow: string;
  image?: {
    alt: string;
    caption: string;
    src: string;
  };
  problem: string;
  result: string;
  title: string;
};

export type ProjectRelatedPost = {
  excerpt?: string;
  slug: string;
  title: string;
};

type ProjectCaseStudyBase = {
  description: string;
  index: string;
  meta: string;
  metrics: readonly ProjectMetric[];
  name: string;
  organization: string;
  period: string;
  role: string;
  relatedPosts?: readonly ProjectRelatedPost[];
  slug: string;
  technologies: readonly string[];
};

export type ProjectCaseStudy = ProjectCaseStudyBase &
  (
    | {
        sections: readonly ProjectSection[];
        stories?: never;
      }
    | {
        sections?: never;
        stories: readonly ProjectStory[];
      }
  );

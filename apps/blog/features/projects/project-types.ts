export type ProjectMetric = {
  detail: string;
  label: string;
  value: string;
};

type ProjectBlockBase = {
  id?: string;
  layout?: "compact" | "reading" | "wide" | "full" | "portrait";
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

export type ProjectVideoBlock = ProjectBlockBase & {
  ariaLabel: string;
  caption?: string;
  height?: number;
  mp4Src: string;
  poster: string;
  type: "video";
  webmSrc?: string;
  width?: number;
};

export type ProjectVideoComparisonBlock = ProjectBlockBase & {
  afterMp4Src: string;
  afterPoster: string;
  afterLabel: string;
  afterWebmSrc?: string;
  ariaLabel: string;
  beforeMp4Src: string;
  beforePoster: string;
  beforeLabel: string;
  beforeWebmSrc?: string;
  caption?: string;
  height?: number;
  type: "video-comparison";
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
  | ProjectVideoBlock
  | ProjectVideoComparisonBlock
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

export type ProjectEvidence = {
  href: string;
  label: string;
  type: "award" | "demo" | "deployment" | "report" | "repository";
};

type ProjectCaseStudyBase = {
  description: string;
  evidence?: readonly ProjectEvidence[];
  index: string;
  meta: string;
  metrics: readonly ProjectMetric[];
  name: string;
  organization: string;
  period: string;
  role: string;
  team?: string;
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

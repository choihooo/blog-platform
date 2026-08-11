export type ProjectMetric = {
  detail: string;
  label: string;
  value: string;
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

export type ProjectCaseStudy = {
  description: string;
  index: string;
  meta: string;
  metrics: readonly ProjectMetric[];
  name: string;
  organization: string;
  period: string;
  role: string;
  slug: string;
  stories: readonly ProjectStory[];
  technologies: readonly string[];
};

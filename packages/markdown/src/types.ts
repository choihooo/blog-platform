export interface ValidationIssue {
  code: string;
  message: string;
  path: string[];
  severity?: "error" | "warning";
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

export interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

export interface ReadingTimeResult {
  minutes: number;
  words: number;
  label: string;
}

export type RepositoryContentKind =
  "post" | "author" | "site-config" | "category-config" | "tag-config" | "media";

export type ListFilesRoot = "posts" | "authors" | "config" | "media";

export type ContentChangeIntent =
  | "create-draft"
  | "save-draft"
  | "prepare-publish"
  | "prepare-unpublish"
  | "prepare-archive"
  | "update-site-config"
  | "save-media"
  | "delete-file";

export type RepositoryFailureCode =
  | "unauthorized"
  | "missing-file"
  | "duplicate-file"
  | "stale-file"
  | "rate-limit"
  | "validation-failure"
  | "temporary-connectivity"
  | "unknown";

export type RepositoryFailureState = {
  code: RepositoryFailureCode;
  message: string;
  retryable: boolean;
  path?: string;
  submittedContent?: string;
};

export type AdapterResult<T> =
  { success: true; data: T } | { success: false; error: RepositoryFailureState };

export type RepositoryContentFile = {
  path: string;
  kind: RepositoryContentKind;
  content: string;
  encoding: "utf8" | "base64";
  sha: string;
  sizeBytes: number;
  updatedAt?: string;
};

export type RepositoryFileSummary = Omit<
  RepositoryContentFile,
  "content" | "encoding" | "updatedAt"
>;

export type ContentChangeRequest = {
  path: string;
  content: string;
  intent: ContentChangeIntent;
  expectedSha?: string;
};

export type ContentChangeResult = {
  path: string;
  sha?: string;
  commitId?: string;
  summary: string;
  status: "created" | "updated" | "deleted";
};

export type ContentAdapter = {
  listFiles(input: {
    root: ListFilesRoot;
  }): Promise<AdapterResult<{ files: RepositoryFileSummary[] }>>;
  readFile(input: { path: string }): Promise<AdapterResult<{ file: RepositoryContentFile }>>;
  createFile(input: ContentChangeRequest): Promise<AdapterResult<ContentChangeResult>>;
  updateFile(
    input: ContentChangeRequest & { expectedSha: string },
  ): Promise<AdapterResult<ContentChangeResult>>;
  deleteFile(input: {
    path: string;
    expectedSha: string;
    intent: "delete-file";
  }): Promise<AdapterResult<ContentChangeResult>>;
  commitMedia(input: {
    path: string;
    contentBase64: string;
    expectedSha?: string;
    intent: "save-media";
  }): Promise<AdapterResult<ContentChangeResult>>;
};

export type PublicRefreshOperation = "publish" | "unpublish" | "archive" | "retry";

export type PublicRefreshMetadata = {
  slug?: string;
  category?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
};

export type PublicRefreshRequest = {
  operation: PublicRefreshOperation;
  previous?: PublicRefreshMetadata;
  next?: PublicRefreshMetadata;
};

export type PublicRefreshResult =
  | { ok: true; targets: string[]; refreshedAt: string }
  | {
      ok: false;
      targets: string[];
      failedTargets: string[];
      refreshedAt?: string;
      message: string;
      retryable: boolean;
    };

export type PublicRefreshRetryToken = {
  operation: Exclude<PublicRefreshOperation, "retry">;
  targets: string[];
  postPath: string;
  postSha: string;
  issuedAt: string;
};

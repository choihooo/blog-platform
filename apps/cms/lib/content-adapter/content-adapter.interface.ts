export type ContentSourceMode = "legacy" | "d1r2";

export type ContentFailureCode =
  | "validation-failure"
  | "auth-required"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "upstream-failure"
  | "storage-failure"
  | "retryable-failure";

export type ContentFailure = {
  code: ContentFailureCode;
  message: string;
  retryable: boolean;
  path?: string;
};

export type ContractResult<T> = { ok: true; data: T } | { ok: false; error: ContentFailure };

export type PostRecord = {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string;
  categoryId?: string | null;
  categoryPath?: string | null;
  heroImageKey?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  isPublished: 0 | 1;
  viewCount: number;
  tags?: string[];
  mediaRefs?: MediaReference[];
};

export type TagRecord = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentSlug?: string | null;
  depth: 1 | 2;
  createdAt: string;
};

export type MediaReference = {
  id: string;
  postId: string;
  r2Key: string;
  r2Url?: string;
  kind: "hero" | "body" | "og" | "pdf" | "attachment";
  width?: number | null;
  height?: number | null;
};

export type MediaPolicyInput = {
  sourceUrl: string;
  postSlug: string;
  kind?: MediaReference["kind"];
};

export type MigrationRunStatus = "running" | "succeeded" | "failed" | "cancelled";

export type MigrationRunRecord = {
  id: string;
  phase: "extract" | "upload" | "import" | "verify" | "complete" | "rollback";
  status: MigrationRunStatus;
  startAt: string;
  endAt?: string | null;
  summary: string;
};

export type ContentListInput = {
  publishedOnly: boolean;
  page: number;
  limit: number;
  tagSlug?: string;
  categoryPath?: string;
  query?: string;
  includeTotal?: boolean;
  includeTags?: boolean;
  includeMedia?: boolean;
};

export type CategoryListInput = {
  depth: 1 | 2;
  parentSlug?: string;
};

export type ContentAdapter = {
  listPosts(
    input: ContentListInput,
  ): Promise<ContractResult<{ items: PostRecord[]; total: number }>>;
  getPostBySlug(
    slug: string,
    options?: { includeUnpublished?: boolean },
  ): Promise<ContractResult<PostRecord | null>>;
  getPostsByTag(input: {
    tagSlug: string;
    publishedOnly: boolean;
    page?: number;
    limit?: number;
  }): Promise<ContractResult<{ items: PostRecord[]; total: number }>>;
  getPostsByCategoryPath(input: {
    categoryPath: string;
    publishedOnly: boolean;
    page?: number;
    limit?: number;
  }): Promise<ContractResult<{ items: PostRecord[]; total: number }>>;
  listCategories(input: CategoryListInput): Promise<ContractResult<{ items: CategoryRecord[] }>>;
  listTags(): Promise<ContractResult<{ items: TagRecord[] }>>;
  createCategory(input: {
    category: Omit<CategoryRecord, "createdAt"> & { createdAt?: string };
    authorIdentity: string;
  }): Promise<ContractResult<CategoryRecord>>;
  updateCategory(input: {
    categoryId: string;
    category: Pick<CategoryRecord, "name" | "slug"> & {
      parentSlug?: string | null;
    };
    authorIdentity: string;
  }): Promise<ContractResult<CategoryRecord>>;
  createTag(input: { tag: TagRecord; authorIdentity: string }): Promise<ContractResult<TagRecord>>;
  createPost(input: {
    post: PostRecord;
    authorIdentity: string;
  }): Promise<ContractResult<PostRecord>>;
  updatePost(input: {
    slug: string;
    post: Partial<PostRecord>;
    authorIdentity: string;
  }): Promise<ContractResult<PostRecord>>;
  deletePost(input: {
    slug: string;
    authorIdentity: string;
  }): Promise<ContractResult<{ slug: string }>>;
  upsertMediaRef(input: {
    mediaRef: MediaReference;
    authorIdentity: string;
  }): Promise<ContractResult<MediaReference>>;
  deleteMediaRef(input: {
    mediaRefId: string;
    authorIdentity: string;
  }): Promise<ContractResult<{ id: string }>>;
};

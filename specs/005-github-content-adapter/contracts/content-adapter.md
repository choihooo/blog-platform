# Contract: CMS Content Adapter

## Purpose

CMS가 content repository와 통신할 때 사용하는 내부 service contract다. UI, editor, publish
workflow는 이 contract에만 의존하고 local adapter와 GitHub adapter의 세부 차이를 알지 않는다.

## Path Boundary

Allowed read/write roots:

- `content/posts/`
- `content/authors/`
- `content/site.json`
- `content/categories.json`
- `content/tags.json`
- `public/media/`

All paths are repository-relative. Absolute paths, path traversal, hidden workflow files, and paths
outside the allowed roots are invalid.

## Operations

### `listFiles`

Lists repository files visible to CMS.

**Input**:

```ts
type ListFilesInput = {
  root: "posts" | "authors" | "config" | "media";
};
```

**Success**:

```ts
type ListFilesSuccess = {
  files: Array<{
    path: string;
    kind: RepositoryContentKind;
    sha: string;
    sizeBytes: number;
  }>;
};
```

### `readFile`

Reads one CMS-approved repository file.

**Input**:

```ts
type ReadFileInput = {
  path: string;
};
```

**Success**:

```ts
type ReadFileSuccess = {
  file: {
    path: string;
    kind: RepositoryContentKind;
    content: string;
    sha: string;
    sizeBytes: number;
  };
};
```

### `createFile`

Creates a new repository file and fails if the path already exists.

**Input**:

```ts
type CreateFileInput = {
  path: string;
  content: string;
  intent: ContentChangeIntent;
};
```

**Success**:

```ts
type CreateFileSuccess = {
  path: string;
  sha: string;
  commitId?: string;
  status: "created";
  summary: string;
};
```

### `updateFile`

Updates an existing repository file only when the last-read SHA still matches.

**Input**:

```ts
type UpdateFileInput = {
  path: string;
  content: string;
  expectedSha: string;
  intent: ContentChangeIntent;
};
```

**Success**:

```ts
type UpdateFileSuccess = {
  path: string;
  sha: string;
  commitId?: string;
  status: "updated";
  summary: string;
};
```

### `deleteFile`

Deletes an existing repository file only when the last-read SHA still matches.

**Input**:

```ts
type DeleteFileInput = {
  path: string;
  expectedSha: string;
  intent: "delete-file";
};
```

**Success**:

```ts
type DeleteFileSuccess = {
  path: string;
  commitId?: string;
  status: "deleted";
  summary: string;
};
```

### `commitMedia`

Creates or replaces a media file under `public/media/`.

**Input**:

```ts
type CommitMediaInput = {
  path: string;
  contentBase64: string;
  expectedSha?: string;
  intent: "save-media";
};
```

**Success**:

```ts
type CommitMediaSuccess = {
  path: string;
  sha: string;
  commitId?: string;
  status: "created" | "updated";
  summary: string;
};
```

## Result Shape

All operations return a discriminated result.

```ts
type AdapterResult<T> =
  { success: true; data: T } | { success: false; error: RepositoryFailureState };
```

Failed write results must include the submitted content in `RepositoryFailureState` when preserving
the user's edit is relevant.

## Commit Summary Rules

- `create-draft`: `post(<slug>): create draft`
- `save-draft`: `post(<slug>): save draft`
- `prepare-publish`: `post(<slug>): publish`
- `prepare-unpublish`: `post(<slug>): unpublish`
- `prepare-archive`: `post(<slug>): archive`
- `save-media`: `media(<slug>): upload <filename>`
- `update-site-config`: `settings: update site config`
- `delete-file`: `<kind>(<slug>): delete`

## Exclusions

- Authentication UI and route guards belong to CMS Auth + Shell.
- Rich-text editing belongs to CMS Editor.
- Image validation and conversion UX belongs to Media Upload.
- Public revalidation belongs to Publish Workflow.

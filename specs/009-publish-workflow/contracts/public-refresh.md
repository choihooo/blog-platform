# Contract: Public Refresh

## Purpose

Publish, Unpublish, Archive 이후 공개 blog 표면이 최신 published 콘텐츠를 반영하도록 요청하는 내부
contract다. 이 contract는 공개 산출물 파일을 생성하거나 commit하지 않고, 이미 존재하는 public
route가 현재 repository 콘텐츠를 다시 읽도록 만든다.

## Refresh Target Input

```ts
type PublicRefreshRequest = {
  operation: "publish" | "unpublish" | "archive" | "retry";
  previous?: {
    slug?: string;
    category?: string;
    tags?: string[];
    status?: "draft" | "published" | "archived";
  };
  next?: {
    slug?: string;
    category?: string;
    tags?: string[];
    status?: "draft" | "published" | "archived";
  };
};
```

## Target Expansion

Every Publish, Unpublish, and Archive refresh includes:

```text
/
/rss.xml
/sitemap.xml
/robots.txt
```

When a previous or next slug exists, include:

```text
/posts/<slug>
/og/<slug>
```

When a previous or next category exists, include:

```text
/categories/<category>
```

When previous or next tags exist, include each:

```text
/tags/<tag>
```

## Result Shape

```ts
type PublicRefreshResult =
  | {
      ok: true;
      targets: string[];
      refreshedAt: string;
    }
  | {
      ok: false;
      targets: string[];
      failedTargets: string[];
      refreshedAt?: string;
      message: string;
      retryable: boolean;
    };
```

## Retry Token

```ts
type PublicRefreshRetryToken = {
  operation: "publish" | "unpublish" | "archive";
  targets: string[];
  postPath: string;
  postSha: string;
  issuedAt: string;
};
```

## Rules

- Duplicate targets are removed before refresh execution.
- Save draft never creates a `PublicRefreshRequest`.
- Public refresh failure never rolls back a successful repository commit.
- A retry token is created only after repository change success and public refresh failure.
- Retry executes only the targets encoded in the retry token.
- Refresh implementation must not write `rss.xml`, `sitemap.xml`, `robots.txt`, JSON-LD, metadata,
  or OG image files into the repository.
- Public blog route behavior remains published-only: `draft` and `archived` posts are absent even if
  a refresh target is requested for their old slug.

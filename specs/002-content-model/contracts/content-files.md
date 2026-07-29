# Contract: Content Files

## 목적

이 계약은 `content/` 아래 운영 콘텐츠 파일의 위치와 필수 형태를 정의한다. 구현은 이 계약을 기준으로
샘플 콘텐츠와 검증 로직을 작성해야 한다.

## Directory Contract

```text
content/
├── authors/
│   └── ho.md
├── posts/
│   └── hello-world.mdx
├── categories.json
├── tags.json
└── site.json
```

## `content/posts/*.mdx`

각 파일은 YAML frontmatter와 MDX body를 가진다.

```mdx
---
title: "Hello World"
status: "published"
slug: "hello-world"
author: "ho"
publishedAt: "2026-07-30"
excerpt: "블로그 플랫폼의 첫 샘플 글입니다."
category: "engineering"
tags:
  - "blog"
  - "mdx"
---

# Hello World

본문은 비어 있지 않아야 합니다.
```

### Rules

- `status`는 `draft`, `published`, `archived`만 허용한다.
- `published`는 `title`, `slug`, `author`, `publishedAt`, non-empty body가 필수다.
- `draft`는 slug 없이 존재할 수 있다.
- `archived`는 공개 목록과 생성 산출물에서 제외한다.
- 모든 post slug는 전체 post set에서 unique해야 한다.

## `content/authors/*.md`

작성자 파일은 YAML frontmatter와 선택적인 Markdown 소개 본문을 가진다.

```md
---
id: "ho"
name: "Ho Choi"
githubLogin: "replace-me"
githubUserId: "0"
avatar: "/media/authors/ho.png"
---

단일 운영자 프로필입니다.
```

### Rules

- `id`, `name`, `githubLogin`, `githubUserId`는 필수다.
- `published` post의 `author`는 등록된 author `id`여야 한다.

## `content/categories.json`

```json
[
  {
    "slug": "engineering",
    "label": "Engineering",
    "description": "개발과 시스템 설계"
  }
]
```

### Rules

- `slug`와 `label`은 필수다.
- `slug`는 중복될 수 없다.

## `content/tags.json`

```json
[
  {
    "slug": "blog",
    "label": "Blog"
  },
  {
    "slug": "mdx",
    "label": "MDX"
  }
]
```

### Rules

- `slug`와 `label`은 필수다.
- `slug`는 중복될 수 없다.

## `content/site.json`

```json
{
  "siteName": "Ho's Blog",
  "siteUrl": "https://example.com",
  "defaultAuthor": "ho",
  "adminGithubLogin": "replace-me",
  "adminGithubUserId": "0",
  "github": {
    "owner": "replace-me",
    "repo": "blog",
    "branch": "main"
  },
  "analytics": {
    "provider": "ga4"
  },
  "features": {
    "aiAssistant": false,
    "internalLinkSuggestions": false
  }
}
```

### Rules

- `defaultAuthor`는 등록된 author `id`여야 한다.
- MVP에서 `features.aiAssistant`와 `features.internalLinkSuggestions`는 기본적으로 `false`다.
- 별도 CMS database, object storage, 예약 발행 설정을 요구하지 않는다.

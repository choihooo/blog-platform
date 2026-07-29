<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- I. MVP Scope Discipline -> I. MVP 범위 규율
- II. File-Based Content Authority -> II. 파일 기반 콘텐츠 권위
- III. Shared Package Ownership -> III. 공유 패키지 소유권
- IV. Secure Publishing Boundary -> IV. 안전한 발행 경계
- V. Generated SEO and Analytics Outputs -> V. 생성형 SEO 및 분석 산출물
Added sections:
- Documentation and Completion Workflow
Removed sections:
- None
Follow-up TODOs:
- None
-->

# 블로그 플랫폼 헌법

## Core Principles

### I. MVP 범위 규율

플랫폼은 단일 운영자 기술 블로그 MVP에 최적화되어야 한다. 초기 작업은 멀티테넌트 SaaS 동작, 공개
사용자 계정, 댓글, 뉴스레터, 결제, 구독, 다중 작성자 권한, 복잡한 승인 체인, 다국어 로컬라이제이션,
object storage, PostgreSQL, 별도 CMS 데이터베이스, 예약 발행, AI 콘텐츠 생성, 내부 링크 자동화,
GA4/Search Console API 통합 대시보드를 도입해서는 안 된다. Post-MVP 기능은 MVP 아키텍처를 복잡하게
만들지 않도록 기능 플래그로 격리하거나 독립적으로 분리해야 한다.

근거: 제품 목표는 한 명의 운영자가 글쓰기, 미리보기, 발행, SEO, 분석 콘솔 연결을 안정적으로 처리하는
흐름이다. 이 목표에 직접 기여하지 않는 플랫폼 기능은 초기 위험만 증가시킨다.

### II. 파일 기반 콘텐츠 권위

GitHub repository는 콘텐츠의 원본이어야 한다. 글은 `content/posts/*.mdx`에 저장되어야 하며, 발행
상태는 frontmatter에서 판단해야 하고, 미디어는 헌법 개정이 없는 한 `public/media` 아래에 있어야
한다. 공개 블로그는 런타임에 로컬 콘텐츠 파일만 읽어야 하며 GitHub API 자격 증명을 요구해서는 안
된다. CMS는 GitHub Contents API mutation과 file SHA 기반 optimistic locking으로 쓰기를 수행해야
한다.

근거: 파일 기반 콘텐츠는 공개 블로그를 빠르고 감사 가능하며 Vercel에 배포하기 쉽고, Git 이력을 통해
복구하기 쉽게 만든다.

### III. 공유 패키지 소유권

Markdown, MDX 렌더링, SEO, analytics, editor, AI flag, 공유 UI 로직은 둘 이상의 앱에서 사용될 때
`packages/` 아래 패키지에 위치해야 한다. `apps/blog`와 `apps/cms`는 도메인 로직을 중복 구현하지 않고
이 패키지들을 사용해야 한다. 패키지 API는 명확한 소유권, 안정적인 입력과 출력, schema, 변환, 생성
metadata에 대한 집중 테스트를 정의해야 한다.

근거: 블로그와 CMS는 동일한 콘텐츠 파싱, 미리보기, SEO, analytics 동작을 공유해야 한다. 공유
패키지는 운영자가 미리보는 결과와 독자가 보는 결과 사이의 drift를 막는다.

### IV. 안전한 발행 경계

초안, 보관 글, 안전하지 않은 MDX, 비공개 CMS 작업은 공개 노출에서 차단되어야 한다. 공개 페이지, RSS,
Sitemap, JSON-LD, OG 이미지는 `status: published` 콘텐츠만 포함해야 한다. Preview access는 30분
TTL의 stateless HMAC token을 사용해야 한다. CMS 접근은 설정된 GitHub 관리자 identity로 제한해야 하며
immutable user ID와 login을 모두 검증해야 한다. MDX 렌더링은 unsafe HTML, script tag, event handler,
arbitrary runtime evaluation, 지원하지 않는 interactive component를 sanitize해야 한다.

근거: repository에는 미발행 편집물과 권한이 필요한 발행 제어가 포함된다. 공개 블로그는 초안, 자격
증명, 안전하지 않은 콘텐츠를 노출하지 않고 읽을 수 있어야 한다.

### V. 생성형 SEO 및 분석 산출물

SEO 핵심 산출물은 게시글별 수동 관리가 아니라 검증된 글과 사이트 metadata에서 생성되어야 한다.
여기에는 slug 정책, canonical metadata, Open Graph metadata, OG image, JSON-LD, Table of Contents,
reading time, RSS, Sitemap, robots.txt가 포함된다. SEO scoring은 MVP에서 rule-based 방식이어야 하며
결정적인 0-100 결과를 생성해야 한다. Analytics는 합의된 GA4/GTM 이벤트를 발행해야 하고, CMS는
MVP에서 분석 데이터를 저장하지 않고 외부 콘솔 링크를 제공해야 한다.

근거: 이 플랫폼의 목적은 반복적인 SEO와 발행 작업을 제거하면서 예측 가능하고 검사 가능한 동작을
유지하는 것이다.

## Platform Constraints

구현은 헌법 개정이 없는 한 TypeScript, pnpm, Turborepo, Next.js App Router, Node.js, Vercel을 기본
배포 대상으로 사용해야 한다. 목표 workspace 구조는 다음과 같다.

```txt
apps/
  blog/
  cms/

packages/
  editor/
  seo-engine/
  markdown/
  design-system/
  analytics/
  ai/
```

Editor는 Tiptap 기반이어야 하며, MVP에서는 Tiptap JSON과 MDX 사이에서 안정적으로 round-trip 가능한
node와 mark만 지원해야 한다. Markdown 및 MDX pipeline은 custom parser를 직접 구현하지 않고 unified,
remark, rehype, MDX, gray-matter, Zod, syntax highlighter 같은 검증된 라이브러리를 감싸야 한다. UI
작업은 `packages/design-system`을 통해 shadcn/ui, Tailwind CSS, Radix primitive, lucide-react를
사용해야 하며, MVP 색상 선택은 shadcn/ui 기본 palette 안에 머물러야 한다.

## Development Workflow

모든 phase는 문서화된 앱 경계를 유지해야 한다. `apps/blog`는 공개 읽기 전용이고, `apps/cms`는 인증된
콘텐츠 mutation을 수행하며, `docs/`는 별도 앱이 아니라 Markdown 문서 폴더로 남아야 한다. Feature
작업은 영향받는 contract에 비례하는 validation과 test를 정의해야 한다. 필수 test coverage는 해당
영역이 구현되는 시점에 content schema validation, slug uniqueness, published-only filtering, MDX
sanitization, heading 및 TOC 생성, reading time, SEO scoring, generated outputs, GitHub write
conflict handling, preview token validation, analytics event emission을 포함한다.

Implementation plan은 헌법에서 벗어나는 모든 사항을 명시해야 한다. deviation은 해당 구현에 의존하는
코드가 승인되기 전에 근거, migration 또는 rollback 경로, 헌법 개정 승인을 가져야 한다.

## Documentation and Completion Workflow

모든 프로젝트 문서, Spec Kit 산출물, 작업 계획, 체크리스트, 완료 보고, README, package 문서는
한국어로 작성되어야 한다. 단, 코드 식별자, 파일 경로, 명령어, API 이름, 라이브러리 이름, 표준 약어,
원문 인용, 외부 서비스명처럼 번역하면 정확성이 떨어지는 기술 용어는 원문을 유지할 수 있다. 새 문서를
만들거나 기존 문서를 수정할 때는 이 언어 규칙을 검토해야 하며, 영어 문서가 필요한 예외는 해당 문서
안에 이유를 명시해야 한다.

모든 작업은 완료 시 변경사항을 검토하고 추천 commit message를 제시해야 한다. 사용자가 commit을
명시적으로 금지하지 않았고 repository 상태가 commit 가능한 경우, 작업자는 추천 commit message를
사용해 변경사항을 commit해야 한다. 관련 없는 사용자 변경사항이 섞여 있으면 해당 변경사항은 commit에
포함하지 말고, 분리가 불가능한 경우 사용자에게 확인해야 한다.

근거: 한국어 문서 기준은 1인 운영자의 판단 속도를 높이고, 완료 시 commit 규칙은 작업 단위를 추적
가능하게 유지한다.

## Governance

이 헌법은 충돌하는 프로젝트 관행, 계획, 구현 선호보다 우선한다. Feature specification,
implementation plan, task list, code review, release는 Core Principles, Platform Constraints,
Development Workflow, Documentation and Completion Workflow 준수를 검증해야 한다.

개정은 이 파일의 문서 변경으로 제안되어야 한다. 각 개정은 변경 이유, 영향받는 원칙 또는 섹션,
migration 영향, 필요한 후속 작업을 설명해야 한다. Governance 변경은 semantic versioning을 사용한다.

- MAJOR: 핵심 원칙을 제거하거나 재정의하거나, 이전에 금지한 아키텍처를 허용한다.
- MINOR: 원칙이나 섹션을 추가하거나 governance 요구사항을 실질적으로 확장한다.
- PATCH: 문구를 명확히 하거나 오타를 수정하거나 의미를 바꾸지 않는 정리를 수행한다.

구현 phase가 완료되기 전에 compliance review가 필요하다. 해결되지 않은 헌법 충돌은 관련 spec 또는
plan에 문서화하고 production-facing 동작을 shipping하기 전에 해결해야 한다.

**Version**: 1.1.0 | **Ratified**: 2026-07-30 | **Last Amended**: 2026-07-30

# 기능 명세: Repo Foundation

**Feature Branch**: `main`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "로드맵의 첫 번째 작업인 Phase 0 Repo Foundation을 구현한다."

## 사용자 시나리오 및 테스트 _(필수)_

### 사용자 스토리 1 - 블로그 플랫폼 workspace 초기화 (Priority: P1)

블로그 운영자로서, 공개 블로그, 비공개 CMS, 공유 패키지, 문서 영역을 포함한 workspace 기반을 갖추고
싶다. 그래야 이후 feature phase를 올바른 소유권 경계 안에서 개발할 수 있다.

**우선순위 근거**: workspace 기반이 없으면 content model, rendering, CMS, SEO, analytics, publishing
작업을 일관되게 개발하고 검증할 수 없다.

**독립 테스트**: repository 구조를 확인하고 repository root에서 문서화된 workspace validation
command를 실행해 독립적으로 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** fresh checkout 상태의 repository가 있을 때, **When** 운영자가 root workspace를
   확인하면, **Then** 공개 블로그 app, 비공개 CMS app, 공유 package 영역, 문서 폴더가 모두 존재한다.
2. **Given** workspace dependency가 설치되어 있을 때, **When** 운영자가 root validation workflow를
   실행하면, **Then** 두 app과 모든 공유 package가 validation 대상에 포함된다.

---

### 사용자 스토리 2 - 초기 app 두 개를 로컬에서 실행 (Priority: P2)

블로그 운영자로서, 공개 블로그와 비공개 CMS app이 서로 분리된 로컬 실행 경험으로 시작되기를 원한다.
그래야 feature 작업 전에 플랫폼 경계를 확인할 수 있다.

**우선순위 근거**: MVP는 reader-facing blog 동작과 authenticated operator CMS 동작의 명확한 분리에
의존한다.

**독립 테스트**: 각 app을 로컬에서 시작하고, unfinished content, CMS, publishing feature에 의존하지
않는 초기 page가 노출되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** workspace가 설치되어 있을 때, **When** 운영자가 공개 블로그를 로컬에서 시작하면,
   **Then** 초기 공개 블로그 page에 접근할 수 있다.
2. **Given** workspace가 설치되어 있을 때, **When** 운영자가 CMS를 로컬에서 시작하면, **Then** 초기
   CMS page에 접근할 수 있다.

---

### 사용자 스토리 3 - 공유 package 소유권 준비 (Priority: P3)

향후 feature 구현자로서, 공유 package 영역이 명확한 소유권과 함께 존재하기를 원한다. 그래야
Markdown, editor, SEO, analytics, AI flag, design-system 작업이 app 사이에서 중복되지 않는다.

**우선순위 근거**: 이후 phase는 공유 contract에 의존한다. package boundary를 초기에 준비하면 blog
output과 CMS preview 사이의 drift를 줄일 수 있다.

**독립 테스트**: 각 공유 package가 발견 가능한 package boundary를 가지고 있고 root validation
workflow에 참여하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** repository foundation이 존재할 때, **When** 향후 feature가 공유 Markdown, editor, SEO,
   analytics, AI flag, design-system 동작을 필요로 하면, **Then** 해당 작업을 둘 공유 package 위치가
   존재한다.
2. **Given** root validation workflow가 실행될 때, **When** 공유 package가 최소한의 유효한 package
   definition을 가지고 있으면, **Then** app별 중복 구현 없이 validation에 포함된다.

### Edge Cases

- repository에 이미 `docs/` 폴더가 있으면 foundation은 이를 교체하지 않고 현재 문서를 보존해야 한다.
- dependency 설치 전 root command를 실행하면 사용자가 설치 누락을 이해할 수 있는 실패 결과가 나와야
  한다.
- 공유 package에 아직 feature code가 없어도 workspace validation에 참여할 수 있는 최소 metadata는
  있어야 한다.
- 각 app을 독립적으로 시작할 때 GitHub credential, content file, authentication setup, deployment
  configuration이 필요해서는 안 된다.

## 요구사항 _(필수)_

### Functional Requirements

- **FR-001**: repository는 공개 블로그 app, 비공개 CMS app, 공유 package, 문서 영역을 포함한 root
  workspace definition을 제공해야 한다.
- **FR-002**: repository는 dependency 설치, workspace validation, 전체 build, type check, lint,
  format, local development를 위한 root package definition과 command를 제공해야 한다.
- **FR-003**: repository는 reader-facing 공개 블로그를 위한 `apps/blog` app boundary를 포함해야
  한다.
- **FR-004**: repository는 operator-facing 비공개 CMS를 위한 `apps/cms` app boundary를 포함해야
  한다.
- **FR-005**: repository는 editor, Markdown/MDX processing, SEO behavior, design system, analytics
  behavior, AI feature flag를 위한 공유 package boundary를 포함해야 한다.
- **FR-006**: repository는 type checking, linting, formatting, workspace build를 위한 공유
  configuration을 제공해 future app과 package가 하나의 validation path를 따르게 해야 한다.
- **FR-007**: 초기 공개 블로그 app은 로컬에서 실행 가능해야 하며 content authoring feature 없이도
  명확한 초기 page를 표시해야 한다.
- **FR-008**: 초기 CMS app은 로컬에서 실행 가능해야 하며 authentication 또는 publishing feature
  없이도 명확한 초기 page를 표시해야 한다.
- **FR-009**: root validation은 두 app과 모든 공유 package를 포함해 누락된 package participation을
  조기에 발견해야 한다.
- **FR-010**: foundation은 기존 `docs/` 문서 폴더를 보존해야 하며 별도 documentation app을
  도입해서는 안 된다.
- **FR-011**: foundation은 MVP 경계를 지켜야 하며 database, object storage, multi-user permission
  model, scheduled publishing, AI content generation, integrated analytics dashboard를 도입해서는 안
  된다.

### 주요 Entity

- **Workspace**: app, 공유 package, 문서, root validation command를 조정하는 top-level repository
  boundary.
- **Application Boundary**: 고유 audience와 responsibility를 가진 runnable product surface. 공개
  블로그는 reader-facing이고 CMS는 operator-facing이다.
- **Shared Package Boundary**: 둘 이상의 app에서 사용할 동작을 담는 재사용 ownership 영역.
- **Documentation Area**: product decision, implementation plan, operational guidance를 기록하는
  기존 Markdown 문서 폴더.

## 성공 기준 _(필수)_

### Measurable Outcomes

- **SC-001**: 신규 contributor가 repository를 연 뒤 2분 이내에 모든 필수 app과 package boundary를
  식별할 수 있다.
- **SC-002**: root validation workflow가 두 app과 모든 공유 package를 포함해 성공적으로 완료된다.
- **SC-003**: dependency 설치 후 5분 이내에 공개 블로그와 CMS를 각각 로컬에서 시작하고 독립적으로
  접근할 수 있다.
- **SC-004**: platform constitution이 요구하는 MVP package boundary의 100%가 workspace에 표현된다.
- **SC-005**: foundation 작업으로 금지된 MVP 제외 항목이 도입되지 않는다.

## 가정

- feature scope는 repository foundation, workspace validation, 초기 app shell, 공유 package
  skeleton, 문서 보존으로 제한한다.
- content modeling, rendering, CMS editing, authentication, publishing workflow는 이후 phase에서
  다루므로 초기 app page는 최소 수준이어도 된다.
- 공유 package는 root validation에 참여할 수 있다면 최소 package metadata와 placeholder export로
  시작할 수 있다.
- constitution의 platform constraint가 이 foundation의 기준이다.

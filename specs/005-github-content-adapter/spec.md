# Feature Specification: GitHub Content Adapter

**Feature Branch**: `005-github-content-adapter`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "다음 작업 해줘봐"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 콘텐츠 파일 읽기 (Priority: P1)

운영자는 CMS에서 repository에 저장된 글, 설정, taxonomy 파일을 최신 상태로 불러와 편집을 시작할 수
있다.

**Why this priority**: CMS가 repository 콘텐츠를 신뢰할 수 있게 읽지 못하면 이후 인증, 에디터, 발행
workflow가 모두 실제 콘텐츠 원본과 연결되지 않는다.

**Independent Test**: 샘플 repository 콘텐츠가 있을 때 CMS 읽기 흐름을 실행해 글 목록, 단일 글 원문,
site/category/tag 설정, 각 파일의 변경 기준값이 표시되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** repository에 글 파일이 존재한다, **When** 운영자가 CMS에서 글 목록을 연다, **Then**
   CMS는 글 파일 목록과 각 파일의 현재 변경 기준값을 표시한다.
2. **Given** 운영자가 특정 글을 선택한다, **When** CMS가 글 파일을 불러온다, **Then** CMS는 원문,
   frontmatter, 파일 경로, 현재 변경 기준값을 함께 제공한다.

---

### User Story 2 - Draft 저장 및 수정 (Priority: P2)

운영자는 CMS에서 새 draft를 만들거나 기존 draft를 저장할 때 repository 콘텐츠 원본에 변경사항을 남길
수 있다.

**Why this priority**: 파일 기반 콘텐츠 권위 원칙을 지키려면 CMS 저장 결과가 별도 저장소가 아니라
repository 파일 변경으로 남아야 한다.

**Independent Test**: 새 draft 생성과 기존 draft 저장을 각각 실행해 repository 파일이 생성 또는
갱신되고, 운영자가 변경 결과와 commit 목적을 확인할 수 있는지 검증한다.

**Acceptance Scenarios**:

1. **Given** 운영자가 새 글을 작성했다, **When** draft 저장을 요청한다, **Then** repository에 새 글
   파일이 생성되고 CMS는 저장 완료 상태를 보여준다.
2. **Given** 운영자가 기존 draft를 수정했다, **When** 저장을 요청한다, **Then** repository의 기존 글
   파일이 갱신되고 CMS는 최신 변경 기준값을 받는다.

---

### User Story 3 - 충돌과 실패 복구 (Priority: P3)

운영자는 같은 파일이 외부에서 먼저 변경되었거나 repository 저장이 실패해도 현재 편집 내용을 잃지
않고 복구 가능한 상태를 확인할 수 있다.

**Why this priority**: 단일 운영자 MVP라도 Git commit, 다른 기기, 자동화 작업으로 파일 충돌이 발생할
수 있으며, 저장 실패가 글 손실로 이어지면 CMS를 신뢰할 수 없다.

**Independent Test**: 오래된 변경 기준값으로 저장을 시도하거나 repository 접근 실패를 재현해, 기존
파일이 덮어써지지 않고 CMS가 복구 가능한 오류 상태와 사용자의 현재 편집본을 유지하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 운영자가 읽은 뒤 같은 파일이 repository에서 먼저 바뀌었다, **When** 운영자가 저장을
   요청한다, **Then** CMS는 기존 파일을 덮어쓰지 않고 충돌 상태를 표시한다.
2. **Given** repository 저장 요청이 권한, 제한, 네트워크 문제로 실패한다, **When** 오류가 발생한다,
   **Then** CMS는 실패 이유를 구분해 보여주고 현재 편집 내용을 유지한다.

---

### Edge Cases

- 글 파일이 삭제되었거나 이동된 뒤 저장을 시도하면 새 파일로 조용히 덮어쓰지 않고 파일 없음 상태를
  반환한다.
- 변경 기준값이 누락된 기존 파일 수정 요청은 거부되어 무조건 overwrite를 방지한다.
- 같은 slug나 파일 경로로 새 글을 생성하려는 요청은 기존 콘텐츠를 덮어쓰지 않고 중복 상태를
  반환한다.
- 권한 만료, 접근 거부, 사용량 제한, 일시적 네트워크 실패는 운영자가 다음 행동을 판단할 수 있도록
  서로 구분된 상태로 전달된다.
- 미디어 저장이 실패하면 본문에는 repository에서 접근 불가능한 임시 경로가 남지 않는다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide CMS-facing operations to list, read, create, update, and delete
  repository content files within the approved content and media areas.
- **FR-002**: System MUST include a current file change identifier whenever an existing repository
  content file is read for editing.
- **FR-003**: System MUST require the last-read file change identifier when updating or deleting an
  existing content file.
- **FR-004**: System MUST reject stale update or delete requests without overwriting newer
  repository content.
- **FR-005**: System MUST return the latest available file change identifier after a successful
  create or update.
- **FR-006**: System MUST preserve the operator's submitted content when create, update, delete, or
  media save operations fail.
- **FR-007**: System MUST normalize repository failure states into user-actionable categories,
  including unauthorized access, missing file, duplicate file, stale file, rate limit, validation
  failure, and temporary connectivity failure.
- **FR-008**: System MUST support draft creation, draft save, publish preparation, unpublish
  preparation, archive preparation, site setting update, and media save intents as distinct content
  change purposes.
- **FR-009**: System MUST produce human-readable change summaries suitable for repository history
  for every successful content or media change.
- **FR-010**: System MUST prevent CMS writes outside the approved content and media paths.
- **FR-011**: System MUST not introduce a separate CMS database, object storage service, or
  multi-author approval workflow for this feature.

### Key Entities _(include if feature involves data)_

- **Repository Content File**: A tracked file used by the blog platform, including post MDX, site
  settings, category metadata, tag metadata, and author profile content.
- **File Change Identifier**: The repository-provided value that identifies the exact version of a
  file read by CMS before an update or delete attempt.
- **Content Change Request**: A CMS request to create, update, delete, publish, unpublish, archive,
  or save media with a clear purpose and user-visible summary.
- **Content Conflict**: A rejected write caused by the repository file changing after CMS last read
  it.
- **Repository Failure State**: A normalized failure category that CMS can show to the operator
  without exposing low-level transport details.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: CMS can list and read the MVP sample content set in under 3 seconds during normal
  repository availability.
- **SC-002**: 100% of stale file update attempts are rejected without overwriting newer repository
  content.
- **SC-003**: 100% of failed write attempts preserve the operator's submitted title, frontmatter,
  body, and media reference data for retry or recovery.
- **SC-004**: At least 95% of repository failure cases in validation are mapped to a specific
  user-actionable category rather than a generic unknown error.
- **SC-005**: A new draft can be created from CMS input and then read back with matching title,
  status, frontmatter, body, and file change identifier.
- **SC-006**: The feature completes without adding a CMS database, object storage dependency, or
  multi-author workflow.

## Assumptions

- 기존 로드맵의 Phase 3 Blog Rendering 다음 작업은 Phase 4 GitHub Content Adapter다.
- MVP 운영자는 단일 관리자이며, 실제 관리자 인증 화면과 route guard는 다음 CMS Auth + Shell
  phase에서 완성한다.
- 이 feature는 CMS가 사용할 콘텐츠 저장 경계를 정의하고 검증하는 데 집중하며, rich-text editor UI는
  이후 CMS Editor phase에서 다룬다.
- 미디어 저장은 repository 안의 승인된 media 경로에 남기는 범위까지만 포함하고, 이미지 변환 UI와
  편집기 삽입 경험은 이후 Media Upload phase에서 확장한다.
- 공개 블로그는 계속 로컬 콘텐츠 파일만 읽으며, 이 feature로 공개 런타임에 repository 쓰기 권한이나
  외부 credential 요구사항을 추가하지 않는다.

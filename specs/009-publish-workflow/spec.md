# Feature Specification: Publish Workflow

**Feature Branch**: `009-publish-workflow`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "다음작업 스펙킷 명세해줘"를 로드맵의 다음 미완료 단계인 "Phase 8: Publish Workflow"로 해석

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 글 저장과 발행 (Priority: P1)

운영자는 CMS editor에서 작성 중인 글을 저장하고, Publish 버튼으로 공개 가능한 상태로 전환한 뒤 공개
블로그에서 해당 글이 나타나는 것을 확인할 수 있다.

**Why this priority**: Draft에서 공개 글로 전환하는 흐름이 블로그 운영의 핵심이다. 이 흐름이 안정적이지
않으면 CMS editor, media upload, 공개 블로그 렌더링이 하나의 운영 작업으로 연결되지 않는다.

**Independent Test**: 관리자 계정으로 초안을 열고 저장 후 발행을 실행한다. 발행 성공 후 글 상태,
발행일, slug, 공개 목록 및 상세 페이지 노출이 기대대로 바뀌는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 유효한 제목, 작성자, 본문을 가진 초안이 있다, **When** 운영자가 Publish를 실행한다,
   **Then** 글은 `published` 상태가 되고 공개 블로그의 목록과 상세 페이지에서 접근 가능하다.
2. **Given** 발행하려는 초안에 `publishedAt`이 없다, **When** 운영자가 Publish를 실행한다, **Then**
   CMS는 발행 시각을 자동으로 채우고 발행 결과에 표시한다.
3. **Given** 발행하려는 초안에 slug가 없다, **When** 운영자가 Publish를 실행한다, **Then** CMS는 제목
   기반 slug를 생성하고 중복 검사를 통과한 경우에만 발행한다.

---

### User Story 2 - 발행 취소와 보관 (Priority: P2)

운영자는 이미 발행된 글을 공개 노출에서 내리거나 보관 상태로 전환하고, 해당 글이 공개 블로그와 자동
공개 산출물에서 제외되는 것을 확인할 수 있다.

**Why this priority**: 잘못 발행한 글이나 오래된 글을 공개 표면에서 빠르게 제거할 수 있어야 안전한 발행
경계를 유지할 수 있다.

**Independent Test**: 발행된 글에 대해 Unpublish와 Archive를 각각 실행하고, 공개 목록, 상세 페이지,
RSS, Sitemap에서 제외되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 공개 블로그에 노출 중인 글이 있다, **When** 운영자가 Unpublish를 실행한다, **Then** 글은
   초안 상태로 돌아가고 공개 목록, 상세 페이지, RSS, Sitemap에서 제외된다.
2. **Given** 공개 블로그에 노출 중인 글이 있다, **When** 운영자가 Archive를 실행한다, **Then** 글은
   보관 상태가 되고 공개 목록, 상세 페이지, RSS, Sitemap에서 제외된다.
3. **Given** 보관된 글이 있다, **When** 운영자가 공개 상세 URL로 접근한다, **Then** 공개 블로그는 해당
   글을 공개 글로 표시하지 않는다.

---

### User Story 3 - 실패 분리와 재시도 (Priority: P3)

운영자는 저장소 변경 성공, 공개 반영 실패, 충돌, 권한 실패, 검증 실패를 서로 구분해서 보고, 글 내용을
잃지 않은 상태에서 필요한 작업을 재시도할 수 있다.

**Why this priority**: 발행은 콘텐츠 변경과 공개 반영이 이어지는 작업이다. 두 단계의 실패를 구분하지
못하면 운영자는 글이 저장되었는지, 공개에 반영되었는지 판단할 수 없다.

**Independent Test**: 검증 실패, 중복 slug, 저장소 충돌, 공개 반영 실패를 각각 재현하고 CMS가 상태와
재시도 동작을 구분해 표시하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 발행 commit은 성공했지만 공개 반영이 실패했다, **When** CMS가 결과를 표시한다, **Then**
   운영자는 저장소 변경 성공과 공개 반영 실패를 분리해서 확인하고 공개 반영을 재시도할 수 있다.
2. **Given** 같은 slug를 가진 다른 글이 이미 있다, **When** 운영자가 Publish를 실행한다, **Then** CMS는
   발행을 막고 중복 slug를 수정해야 함을 표시한다.
3. **Given** 저장소 충돌이 발생했다, **When** 운영자가 Save, Publish, Unpublish, Archive 중 하나를
   실행한다, **Then** CMS는 최신 콘텐츠를 다시 확인해야 하는 충돌 상태를 표시하고 기존 편집 내용을
   보존한다.

---

### Edge Cases

- 제목이 비어 있거나 slug로 변환할 수 없는 경우 Publish는 repository 변경 없이 실패해야 한다.
- 본문이 비어 있거나 작성자가 누락된 글은 Publish할 수 없어야 한다.
- `publishedAt`이 이미 있는 발행 글을 다시 저장하거나 발행 상태로 유지할 때 기존 발행일을 임의로
  덮어쓰지 않아야 한다.
- 같은 글을 빠르게 여러 번 Save 또는 Publish해도 중복 commit 의도가 표시되거나 충돌 상태로 안전하게
  처리되어야 한다.
- Unpublish 또는 Archive 중 공개 반영이 실패해도 상태 변경 성공 여부와 공개 반영 실패 여부가 따로
  표시되어야 한다.
- 관련 category 또는 tag가 바뀐 상태로 발행하면 이전 분류와 새 분류 공개 경로가 모두 최신 상태가
  되도록 공개 반영 대상에 포함되어야 한다.
- 인증 세션이 만료되거나 관리자 권한 검증에 실패하면 repository 변경과 공개 반영을 실행하지 않아야
  한다.
- CMS는 RSS, Sitemap, robots policy, OG image 같은 공개 산출물 파일을 직접 생성해 commit하지 않아야
  한다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: CMS는 인증된 관리자에게 글 저장 동작을 제공해야 한다.
- **FR-002**: CMS는 인증된 관리자에게 글 발행 동작을 제공해야 한다.
- **FR-003**: CMS는 인증된 관리자에게 발행 취소 동작을 제공해야 한다.
- **FR-004**: CMS는 인증된 관리자에게 보관 동작을 제공해야 한다.
- **FR-005**: Save는 작성 중인 콘텐츠와 metadata를 repository 콘텐츠 원본에 반영해야 한다.
- **FR-006**: Save draft는 공개 블로그, RSS, Sitemap, robots policy, OG image 공개 반영을 실행하지
  않아야 한다.
- **FR-007**: Publish는 글 상태를 `published`로 전환하고 공개 가능한 필수 정보 검증을 통과한 경우에만
  repository 콘텐츠 원본에 반영해야 한다.
- **FR-008**: Publish는 `publishedAt`이 비어 있는 글에 발행 시각을 자동 설정해야 한다.
- **FR-009**: Publish는 slug가 비어 있는 글에 제목 기반 slug 후보를 생성해야 한다.
- **FR-010**: Publish는 전체 글 목록 기준 slug 중복을 검사하고, 중복이 있으면 repository 변경 없이
  발행을 막아야 한다.
- **FR-011**: Publish는 제목, slug, 작성자, 발행일, 비어 있지 않은 본문이 없는 글을 공개 상태로
  전환하지 않아야 한다.
- **FR-012**: Unpublish는 발행된 글을 초안 상태로 전환하고 공개 노출 대상에서 제외되게 해야 한다.
- **FR-013**: Archive는 글을 보관 상태로 전환하고 공개 노출 대상에서 제외되게 해야 한다.
- **FR-014**: Publish, Unpublish, Archive는 영향을 받는 공개 목록, 상세 글, 분류, 태그, RSS, Sitemap,
  robots policy, OG image가 최신 콘텐츠를 반영하도록 공개 반영을 요청해야 한다.
- **FR-015**: CMS는 repository 변경 결과와 공개 반영 결과를 별도 상태로 표시해야 한다.
- **FR-016**: CMS는 repository 변경은 성공했지만 공개 반영이 실패한 경우 공개 반영 재시도 동작을
  제공해야 한다.
- **FR-017**: CMS는 Save, Publish, Unpublish, Archive의 성공 commit 의도를 운영자가 이해할 수 있는
  메시지로 남겨야 한다.
- **FR-018**: CMS는 저장소 충돌, 네트워크 실패, 권한 실패, 검증 실패, 공개 반영 실패를 서로 구분해
  표시해야 한다.
- **FR-019**: CMS는 실패 상황에서 현재 편집 내용과 복구 가능한 로컬 초안 상태를 보존해야 한다.
- **FR-020**: CMS는 인증되지 않았거나 관리자 검증에 실패한 사용자가 Save, Publish, Unpublish, Archive,
  공개 반영 재시도를 실행하지 못하게 해야 한다.
- **FR-021**: 공개 블로그와 자동 공개 산출물은 `published` 상태 글만 포함해야 하며 `draft`와
  `archived` 글을 제외해야 한다.
- **FR-022**: CMS는 이 feature에서 예약 발행, 다중 작성자 승인, SEO scoring 구현, 분석 대시보드,
  RSS/Sitemap 파일 직접 commit, AI 글쓰기 생성을 도입하지 않아야 한다.

### Key Entities _(include if feature involves data)_

- **Publishable Post**: CMS에서 저장, 발행, 발행 취소, 보관 대상이 되는 글. 상태, 제목, slug, 작성자,
  발행일, 본문, 분류, 태그, 콘텐츠 식별자, 최신 콘텐츠 버전을 가진다.
- **Publication State**: 글의 공개 상태. `draft`, `published`, `archived`만 허용하며 공개 노출 여부를
  결정한다.
- **Publication Operation**: 운영자가 실행하는 Save, Publish, Unpublish, Archive, 공개 반영 재시도
  작업. 요청자, 대상 글, 작업 의도, 검증 결과, repository 변경 결과, 공개 반영 결과를 가진다.
- **Public Refresh Target**: 글 상태 변경 이후 최신 상태가 반영되어야 하는 공개 표면. 홈, 글 상세,
  관련 분류, 관련 태그, RSS, Sitemap, robots policy, OG image를 포함한다.
- **Operation Result**: 작업 완료 후 CMS가 표시하는 결과. repository 변경 성공 여부, 공개 반영 성공
  여부, 실패 원인, 재시도 가능 여부를 구분한다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 운영자는 유효한 초안을 열어 Save와 Publish를 2분 안에 완료하고 공개 블로그에서 글을
  확인할 수 있다.
- **SC-002**: Publish 성공 후 95% 이상의 정상 작업에서 홈, 글 상세, 관련 분류, 관련 태그, RSS, Sitemap
  공개 표면이 최신 상태를 30초 안에 반영한다.
- **SC-003**: Unpublish 또는 Archive 성공 후 대상 글은 공개 목록, 상세 페이지, RSS, Sitemap에서 30초
  안에 사라진다.
- **SC-004**: 중복 slug, 누락된 필수 field, 빈 본문, 권한 실패 검증 케이스는 100% repository 변경 없이
  차단된다.
- **SC-005**: repository 변경 성공 후 공개 반영 실패를 재현했을 때 CMS는 두 결과를 100% 구분해 표시하고
  공개 반영 재시도 동작을 제공한다.
- **SC-006**: 저장소 충돌 또는 네트워크 실패를 재현해도 운영자의 현재 편집 내용은 100% 보존된다.
- **SC-007**: 공개 블로그, RSS, Sitemap 검증에서 `draft`와 `archived` 글 노출 사례가 0건이어야 한다.

## Assumptions

- 단일 운영자 MVP이며 Save, Publish, Unpublish, Archive는 모두 기존 관리자 인증 경계를 재사용한다.
- 콘텐츠 원본은 기존 repository 파일 구조이며 별도 CMS database는 도입하지 않는다.
- 공개 반영은 Publish, Unpublish, Archive에서만 필요하고 Save draft에서는 실행하지 않는다.
- `publishedAt`이 이미 있는 발행 글은 명시적인 재발행 정책이 생기기 전까지 기존 발행일을 유지한다.
- 예약 발행, 승인 workflow, 여러 작성자 권한, SEO scoring, 생성 산출물 자체 구현은 후속 phase에서
  다룬다.
- 공개 산출물은 파일로 commit되는 것이 아니라 공개 블로그와 공유 패키지가 현재 `published` 콘텐츠를
  기준으로 제공한다.

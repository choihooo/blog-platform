# Feature Specification: CMS Auth + Shell

**Feature Branch**: `006-cms-auth-shell`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "다음 작업 ㄱㄱㄱ"를 로드맵의 다음 미완료 단계인 "Phase 5: CMS Auth + Shell"로 해석

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 관리자만 CMS 접근 (Priority: P1)

운영자는 자신의 GitHub 계정으로 CMS에 로그인하고, 사이트 설정에 등록된 관리자 identity와 일치할 때만
CMS 화면에 접근할 수 있다.

**Why this priority**: CMS는 repository 콘텐츠를 읽고 수정할 수 있으므로, 인증되지 않았거나 관리자가
아닌 사용자가 접근하면 초안과 설정이 노출되거나 변경될 수 있다.

**Independent Test**: 관리자 identity가 등록된 사이트 설정과 로그인된 GitHub 사용자 정보를 준비한 뒤
CMS 진입을 시도해 관리자만 shell에 도달하고 그 외 사용자는 거부되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 사이트 설정에 등록된 관리자 GitHub login과 user id가 있다, **When** 같은 login과 user
   id를 가진 운영자가 CMS에 로그인한다, **Then** CMS는 운영자에게 기본 shell을 표시한다.
2. **Given** 사용자가 로그인하지 않았다, **When** CMS 보호 화면에 접근한다, **Then** CMS는 사용자를
   로그인 흐름으로 보낸다.
3. **Given** 로그인한 GitHub 사용자의 login 또는 user id 중 하나라도 사이트 설정과 다르다, **When**
   사용자가 CMS에 접근한다, **Then** CMS는 접근 거부 상태를 표시하고 콘텐츠를 보여주지 않는다.

---

### User Story 2 - 콘텐츠 변경 요청 보호 (Priority: P2)

운영자는 인증된 관리자 세션에서만 CMS mutation을 실행할 수 있고, 관리자가 아닌 사용자나 세션이 없는
요청은 콘텐츠 변경을 수행하지 못한다.

**Why this priority**: 화면 접근 보호만으로는 충분하지 않다. 저장, 삭제, 미디어 commit 같은 변경 요청은
항상 관리자 identity 검증을 통과해야 repository 콘텐츠 권위와 안전한 발행 경계를 유지할 수 있다.

**Independent Test**: 관리자, 비관리자, 미로그인 상태에서 대표 mutation을 요청해 관리자 요청만
허용되고 나머지는 repository 변경 없이 거부되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 로그인한 사용자의 GitHub login과 user id가 사이트 설정의 관리자 값과 모두 일치한다,
   **When** 사용자가 CMS mutation을 요청한다, **Then** CMS는 변경 요청을 허용한다.
2. **Given** 로그인한 사용자가 사이트 설정의 관리자 값과 일치하지 않는다, **When** 사용자가 CMS
   mutation을 요청한다, **Then** CMS는 변경 요청을 거부하고 repository 콘텐츠를 변경하지 않는다.
3. **Given** 사용자가 로그인하지 않았다, **When** CMS mutation을 요청한다, **Then** CMS는 변경 요청을
   거부하고 인증 필요 상태를 반환한다.

---

### User Story 3 - 기본 CMS Shell 탐색 (Priority: P3)

운영자는 인증 후 CMS shell에서 글 관리와 설정 영역으로 이동할 수 있으며, 현재 위치와 세션 상태를
명확히 확인할 수 있다.

**Why this priority**: 인증이 끝난 뒤 편집기와 발행 workflow를 붙일 안정적인 작업 표면이 필요하다.
단, 이 단계는 shell과 navigation까지만 제공해 이후 editor, media, publish 기능과 범위를 분리한다.

**Independent Test**: 관리자 계정으로 로그인해 CMS shell을 열고 sidebar, top bar, posts navigation,
settings navigation, 로그아웃 또는 계정 상태 표시가 일관되게 동작하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 CMS에 로그인했다, **When** CMS shell이 열린다, **Then** sidebar와 top bar가
   표시되고 현재 사용자 상태를 확인할 수 있다.
2. **Given** 관리자가 CMS shell에 있다, **When** 글 관리 navigation을 선택한다, **Then** CMS는 글 관리
   영역으로 이동하거나 해당 영역의 준비 상태를 표시한다.
3. **Given** 관리자가 CMS shell에 있다, **When** 설정 navigation을 선택한다, **Then** CMS는 설정 영역으로
   이동하거나 해당 영역의 준비 상태를 표시한다.

---

### Edge Cases

- 사이트 설정에 관리자 login 또는 user id가 누락되어 있으면 CMS는 관리자 접근을 허용하지 않고 설정
  오류 상태를 표시한다.
- 로그인한 GitHub login이 일치하더라도 immutable user id가 다르면 접근과 mutation을 모두 거부한다.
- 로그인한 GitHub user id가 일치하더라도 login이 다르면 계정 rename 또는 설정 drift 가능성을 명확히
  표시하고 접근을 거부한다.
- 세션이 만료된 상태에서 보호 화면이나 mutation을 요청하면 콘텐츠를 노출하거나 변경하지 않고 재인증을
  요구한다.
- 사이트 설정을 읽을 수 없으면 CMS는 fail-closed 방식으로 접근과 mutation을 거부한다.
- 관리자 검증 중 오류가 발생해도 draft, archived 글 또는 repository credential을 공개 화면에 노출하지
  않는다.
- shell navigation은 editor, media upload, publish workflow가 아직 없어도 깨진 화면 대신 준비 상태를
  보여준다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: CMS는 GitHub 계정 기반 로그인 흐름을 제공해야 한다.
- **FR-002**: CMS는 인증된 세션에서 GitHub login과 immutable GitHub user id를 확인할 수 있어야 한다.
- **FR-003**: CMS는 사이트 설정에 등록된 `adminGithubLogin`과 `adminGithubUserId`를 관리자 기준값으로
  사용해야 한다.
- **FR-004**: CMS는 로그인한 사용자의 GitHub login과 user id가 사이트 설정의 관리자 기준값과 모두
  일치할 때만 보호 화면 접근을 허용해야 한다.
- **FR-005**: CMS는 미로그인 사용자의 보호 화면 접근을 로그인 흐름으로 연결해야 한다.
- **FR-006**: CMS는 비관리자 로그인 사용자의 보호 화면 접근을 거부하고 콘텐츠 원문, 초안, 설정 세부값을
  표시하지 않아야 한다.
- **FR-007**: CMS는 모든 콘텐츠 mutation 전에 현재 세션의 관리자 identity를 다시 검증해야 한다.
- **FR-008**: CMS는 미로그인 또는 비관리자 mutation 요청을 repository 변경 없이 거부해야 한다.
- **FR-009**: CMS는 사이트 설정을 읽을 수 없거나 관리자 기준값이 불완전하면 접근과 mutation을
  fail-closed 방식으로 거부해야 한다.
- **FR-010**: CMS shell은 인증된 관리자에게 sidebar, top bar, 글 관리 navigation, 설정 navigation,
  현재 사용자 상태를 제공해야 한다.
- **FR-011**: CMS shell은 아직 구현되지 않은 editor, media upload, publish workflow를 실행 가능한 기능처럼
  표시하지 않아야 한다.
- **FR-012**: CMS shell은 승인된 디자인 시스템의 기본 색상 체계 안에서 표현되어야 하며, 이 feature에서
  별도 브랜드 색상이나 임의 색상 팔레트를 도입하지 않아야 한다.
- **FR-013**: CMS는 접근 거부, 인증 필요, 설정 오류, 세션 만료 상태를 운영자가 다음 행동을 판단할 수
  있는 메시지로 구분해야 한다.
- **FR-014**: CMS는 로그아웃 또는 세션 종료 후 보호 화면과 mutation 접근을 다시 차단해야 한다.

### Key Entities _(include if feature involves data)_

- **관리자 Identity**: 사이트 설정에 저장된 `adminGithubLogin`과 `adminGithubUserId`의 조합이며 CMS 접근과
  mutation 허용 여부를 결정하는 기준이다.
- **인증 세션**: 로그인한 GitHub 사용자의 login, immutable user id, 세션 상태, 만료 여부를 포함하는 현재
  사용자 상태이다.
- **CMS 접근 결정**: 인증 세션과 관리자 Identity 비교 결과, 거부 사유, 다음 행동 안내를 포함하는 보호
  판단 결과이다.
- **CMS Shell Navigation**: 인증된 관리자가 사용할 수 있는 글 관리, 설정, 계정 상태 영역의 탐색 구조이다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 등록된 관리자 계정은 로그인 후 10초 이내에 CMS shell에 도달할 수 있다.
- **SC-002**: 미로그인 사용자의 보호 화면 접근 시도 100%가 콘텐츠 표시 없이 로그인 흐름으로 연결된다.
- **SC-003**: 사이트 설정과 login 또는 user id가 일치하지 않는 사용자 접근 시도 100%가 콘텐츠 표시 없이
  거부된다.
- **SC-004**: 미로그인 또는 비관리자 mutation 요청 100%가 repository 콘텐츠 변경 없이 거부된다.
- **SC-005**: 관리자, 비관리자, 미로그인, 설정 오류, 세션 만료 상태를 포함한 인증 관련 검증 시나리오가
  모두 독립적으로 재현 가능하다.
- **SC-006**: 관리자 사용자는 CMS shell에서 글 관리와 설정 영역의 위치를 첫 시도에서 95% 이상 정확히
  찾을 수 있다.
- **SC-007**: 이 feature에서 추가되는 CMS 화면은 승인된 기본 색상 체계 밖의 임의 색상 사용이 0건이다.

## Assumptions

- 단일 운영자 MVP이므로 관리자 역할은 한 명의 GitHub 계정으로 제한한다.
- 관리자 기준값은 기존 `content/site.json`의 `adminGithubLogin`과 `adminGithubUserId`를 신뢰 가능한 설정
  원본으로 사용한다.
- GitHub 계정 rename 가능성을 고려해 login과 immutable user id를 모두 요구하며, 둘 중 하나만 일치하는
  경우는 안전하게 거부한다.
- 이 feature는 인증, 권한 검증, CMS shell navigation만 포함하며 rich-text editor, media upload, publish
  workflow, preview token은 후속 phase에서 다룬다.
- 공개 블로그는 이 feature 이후에도 GitHub credential이나 CMS 세션을 필요로 하지 않는다.

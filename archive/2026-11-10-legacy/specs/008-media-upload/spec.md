# Feature Specification: Media Upload

**Feature Branch**: `008-media-upload`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "다음 할 일 명세해줘 로드맵 보고"를 로드맵의 다음 미완료 단계인 "Phase 7:
Media Upload"로 해석

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 본문 이미지 업로드 (Priority: P1)

운영자는 CMS editor에서 본문에 이미지를 추가할 때 로컬 이미지 파일을 선택하고, 업로드가 성공한 뒤 글
본문에 공개 접근 가능한 이미지 참조가 삽입되는 것을 확인할 수 있다.

**Why this priority**: 이미지가 포함된 글을 작성하려면 운영자가 파일 경로를 직접 만들거나
repository에 수동 commit하지 않고도 편집 흐름 안에서 이미지를 추가할 수 있어야 한다.

**Independent Test**: 관리자 계정으로 기존 초안 또는 새 초안을 열고 허용된 이미지 파일을 본문에
추가한 뒤, 업로드 성공 후 편집 문서와 저장될 MDX에 공개 이미지 경로만 남는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 CMS editor에서 글을 편집 중이다, **When** 허용된 이미지 파일을 본문에
   삽입한다, **Then** CMS는 업로드 진행 상태를 표시하고 성공 후 본문 이미지 참조를 공개 경로로
   바꾼다.
2. **Given** 본문 이미지 업로드가 완료되었다, **When** 운영자가 글을 저장한다, **Then** 저장될
   본문에는 임시 로컬 경로나 blob URL이 아닌 공개 이미지 경로가 포함된다.
3. **Given** 업로드된 이미지에 대체 텍스트 또는 제목이 입력되어 있다, **When** 글이 저장 가능한
   콘텐츠로 변환된다, **Then** 이미지 참조는 해당 설명 정보를 보존한다.

---

### User Story 2 - 커버 이미지 업로드 (Priority: P2)

운영자는 글 metadata 영역에서 커버 이미지를 업로드하고, 업로드가 성공하면 글의 커버 이미지 값이 공개
경로로 갱신되는 것을 확인할 수 있다.

**Why this priority**: 커버 이미지는 공개 목록, 상세 화면, 공유 미리보기 품질에 영향을 주므로 본문
이미지와 별도로 metadata 흐름에서 관리될 필요가 있다.

**Independent Test**: 관리자 계정으로 글 편집 화면을 열고 커버 이미지 파일을 선택한 뒤, 업로드 성공
후 metadata의 커버 이미지 값이 공개 경로로 바뀌고 저장 가능한 상태가 되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 글 metadata를 편집 중이다, **When** 허용된 커버 이미지 파일을 선택한다,
   **Then** CMS는 업로드 진행 상태를 표시하고 성공 후 커버 이미지 경로를 metadata에 반영한다.
2. **Given** 글에 기존 커버 이미지가 있다, **When** 관리자가 새 커버 이미지를 업로드한다, **Then**
   CMS는 글 metadata가 새 공개 경로를 참조하게 하고 기존 파일 삭제는 수행하지 않는다.
3. **Given** 커버 이미지 업로드가 완료되었다, **When** 운영자가 preview를 확인한다, **Then**
   preview는 새 커버 이미지 참조를 인식할 수 있는 상태를 보여준다.

---

### User Story 3 - 실패와 제한 처리 (Priority: P3)

운영자는 허용되지 않는 파일, 너무 큰 파일, 업로드 실패, 세션 만료, 권한 실패 상황에서 글 원본이
오염되지 않고 현재 편집 내용을 유지한 채 다음 행동을 판단할 수 있다.

**Why this priority**: 이미지 업로드는 파일 검증과 repository commit 실패 가능성이 높다. 실패 시
임시 blob URL이나 손상된 이미지 참조가 MDX에 남으면 공개 글과 저장 원본의 신뢰도가 떨어진다.

**Independent Test**: 허용되지 않는 파일 형식, 2MB 초과 파일, 업로드 실패, 권한 실패를 각각 재현해
편집 내용이 유지되고 저장될 콘텐츠에 임시 이미지 참조가 남지 않는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 허용되지 않는 파일 형식을 선택했다, **When** 업로드를 시도한다, **Then** CMS는
   파일을 거부하고 본문 또는 metadata에 이미지 참조를 추가하지 않는다.
2. **Given** 관리자가 2MB를 초과하는 이미지 파일을 선택했다, **When** 업로드를 시도한다, **Then**
   CMS는 파일 크기 제한을 안내하고 repository 변경을 만들지 않는다.
3. **Given** 이미지 업로드 commit이 실패했다, **When** CMS가 실패 상태를 표시한다, **Then** 현재
   편집 내용은 유지되지만 저장될 MDX와 metadata에는 임시 blob URL이 남지 않는다.

---

### Edge Cases

- 파일 확장자가 허용되어도 실제 이미지로 해석할 수 없으면 업로드를 거부한다.
- 파일명이 같거나 같은 글에서 여러 이미지를 올려도 기존 repository 파일을 덮어쓰지 않는다.
- slug가 아직 없는 새 초안에서 본문 이미지를 업로드하면 임시 식별자가 아닌 저장 가능한 글 식별
  정책에 맞는 안정적인 경로를 사용해야 한다.
- 같은 파일을 반복 업로드해도 운영자가 어떤 이미지가 본문 또는 커버에 연결되었는지 혼동하지 않게
  상태를 표시한다.
- 업로드 중 화면을 벗어나거나 새로고침해도 저장될 콘텐츠에는 임시 로컬 경로나 blob URL이 남지
  않는다.
- 세션 만료 또는 권한 실패가 발생하면 repository 변경 없이 재인증 또는 접근 거부 상태를 표시한다.
- 이미지를 글에서 제거해도 MVP에서는 repository의 기존 미디어 파일을 자동 삭제하지 않고 글 참조만
  제거한다.
- 업로드 성공 후 글 저장이 실패하면 업로드된 미디어 파일은 유지되며, 글 본문의 참조와 편집 내용은
  운영자가 재시도할 수 있게 보존된다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: CMS는 인증된 관리자에게 본문 이미지 업로드 시작 동작을 제공해야 한다.
- **FR-002**: CMS는 인증된 관리자에게 커버 이미지 업로드 시작 동작을 제공해야 한다.
- **FR-003**: CMS는 `webp`, `png`, `jpg`, `jpeg` 이미지 파일만 업로드 대상으로 허용해야 한다.
- **FR-004**: CMS는 파일당 2MB를 초과하는 이미지를 repository 변경 없이 거부해야 한다.
- **FR-005**: CMS는 업로드 대상 파일이 실제 이미지로 처리 가능한지 확인하고, 처리할 수 없는 파일을
  거부해야 한다.
- **FR-006**: CMS는 업로드 이미지가 가능한 경우 webp 형식으로 저장될 수 있게 준비해야 한다.
- **FR-007**: CMS는 커버 이미지를 `public/media/covers/` 아래의 slug와 content hash 기반 공개 경로로
  연결해야 한다.
- **FR-008**: CMS는 본문 이미지를 `public/media/posts/<slug>/` 아래의 content hash 기반 공개 경로로
  연결해야 한다.
- **FR-009**: CMS는 이미지 업로드 성공 시 repository에 미디어 변경을 남기고, 글 본문 또는
  metadata에는 해당 공개 경로만 반영해야 한다.
- **FR-010**: CMS는 업로드된 본문 이미지를 MDX 저장 시 Markdown image syntax로 표현할 수 있어야
  한다.
- **FR-011**: CMS는 이미지 대체 텍스트와 제목 정보를 운영자가 입력하거나 수정할 수 있게 해야 하며,
  저장 가능한 이미지 참조에 이를 보존해야 한다.
- **FR-012**: CMS는 이미지 caption이 입력된 경우 MVP 범위에서 이미지 바로 아래 본문 문단으로
  보존해야 한다.
- **FR-013**: CMS는 업로드 진행, 성공, 실패, 제한 위반 상태를 운영자가 구분할 수 있게 표시해야 한다.
- **FR-014**: CMS는 업로드 실패, 제한 위반, 세션 만료, 권한 실패 상황에서 임시 로컬 경로, blob URL,
  data URL을 저장될 MDX 또는 metadata에 남기지 않아야 한다.
- **FR-015**: CMS는 업로드 실패 후 현재 편집 내용을 유지하고, 운영자가 파일을 다시 선택하거나 편집을
  계속할 수 있게 해야 한다.
- **FR-016**: CMS는 이미지 업로드 commit이 성공했지만 글 저장이 아직 완료되지 않은 상태를 운영자가
  인지할 수 있게 해야 한다.
- **FR-017**: CMS는 본문 또는 metadata에서 이미지 참조를 제거할 수 있게 해야 하며, 이 feature에서는
  repository의 미사용 미디어 파일 자동 삭제를 수행하지 않아야 한다.
- **FR-018**: CMS는 새 미디어 업로드 기능을 발행, 예약 발행, SEO scoring, 분석 대시보드, AI 글쓰기
  생성 기능과 결합하지 않아야 한다.
- **FR-019**: CMS media upload 화면과 상태 표시는 기존 CMS editor 및 승인된 디자인 시스템 범위
  안에서 제공되어야 하며 별도 브랜드 색상이나 임의 색상 팔레트를 도입하지 않아야 한다.

### Key Entities _(include if feature involves data)_

- **미디어 업로드 요청**: 운영자가 선택한 이미지 파일, 대상 위치, 이미지 설명 정보, 업로드 상태를
  포함하는 요청이다.
- **미디어 파일**: repository의 공개 미디어 경로에 저장되어 공개 블로그와 CMS preview에서 참조
  가능한 이미지 산출물이다.
- **본문 이미지 참조**: 편집 문서와 MDX 본문에 포함되는 이미지 경로, 대체 텍스트, 제목, caption
  정보이다.
- **커버 이미지 참조**: 글 metadata에 저장되는 대표 이미지 경로와 관련 설명 정보이다.
- **업로드 상태**: 대기, 검증 실패, 업로드 중, 성공, 실패, 권한 실패, 세션 만료를 구분하는 사용자
  안내 상태이다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 관리자는 CMS editor에서 허용된 본문 이미지를 선택한 뒤 10초 이내에 업로드 완료 또는
  실패 상태를 확인할 수 있다.
- **SC-002**: 허용된 대표 이미지 10개 중 10개가 업로드 후 공개 경로로 본문 또는 metadata에 연결된다.
- **SC-003**: 허용되지 않는 파일 형식과 2MB 초과 파일 검증 시나리오 100%가 repository 변경 없이
  차단된다.
- **SC-004**: 업로드 실패, 세션 만료, 권한 실패 시나리오 100%에서 저장될 MDX와 metadata에 blob URL,
  data URL, 임시 로컬 경로가 남지 않는다.
- **SC-005**: 본문 이미지 저장 검증 시나리오 100%에서 이미지 참조가 대체 텍스트와 공개 경로를 포함한
  Markdown image syntax로 표현된다.
- **SC-006**: 운영자는 첫 사용 테스트에서 90% 이상 본문 이미지 업로드, 커버 이미지 업로드, 실패 후
  재시도를 도움말 없이 완료할 수 있다.
- **SC-007**: 이 feature에서 repository 미사용 파일 자동 삭제, object storage, 예약 발행, SEO
  scoring, 분석 대시보드, AI 생성 기능 도입은 0건이다.

## Assumptions

- 이 feature는 로드맵의 "Phase 7: Media Upload"에 해당하며, 이전 phase의 CMS 인증, content adapter,
  editor 저장, local draft backup 기반이 존재한다고 가정한다.
- 콘텐츠 원본은 계속 GitHub repository이며, 미디어도 MVP에서는 repository 안 공개 미디어 경로에
  저장한다.
- slug가 없는 새 초안은 이미지 업로드 전에 저장 가능한 글 식별자가 필요하다는 정책을 따른다.
- 이미지 삭제는 이 feature에서 글 참조 제거까지만 다루며, 미사용 repository 파일 정리는 Post-MVP로
  미룬다.
- object storage, 이미지 CDN 전환, 대량 미디어 라이브러리, 이미지 자산 검색, 다중 작성자 승인 흐름은
  MVP 범위에서 제외한다.
- 발행, unpublish, archive, revalidation은 후속 Publish Workflow phase에서 다룬다.

# Feature Specification: CMS Editor

**Feature Branch**: `007-cms-editor`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "지금 다음작업 명세해봐"를 로드맵의 다음 미완료 단계인 "Phase 6: CMS
Editor"로 해석

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 글 작성 및 편집 (Priority: P1)

운영자는 CMS에서 새 글 초안을 만들거나 기존 글을 열어 제목, 본문, 기본 metadata를 시각적으로 편집할
수 있다.

**Why this priority**: CMS의 핵심 가치는 repository 파일을 직접 만지지 않고도 글을 작성하고 저장
가능한 상태로 만드는 것이다. 편집 표면이 없으면 이후 미디어, 발행, SEO phase가 사용자 흐름에 연결될
수 없다.

**Independent Test**: 관리자 계정으로 CMS에 로그인한 뒤 새 초안을 만들고 제목, 단락, heading, 목록,
인용문, 코드 블록, 링크를 입력해 저장 가능한 편집 상태가 되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 CMS 글 관리 화면에 있다, **When** 새 글 작성을 시작한다, **Then** CMS는 빈
   초안 편집 화면을 표시하고 제목과 본문을 입력할 수 있게 한다.
2. **Given** 관리자가 기존 글을 열었다, **When** 본문과 기본 metadata를 수정한다, **Then** CMS는
   변경 상태를 표시하고 저장 가능한 상태로 유지한다.
3. **Given** 관리자가 지원되는 서식 도구를 사용한다, **When** 단락, heading, 목록, 인용문, 링크,
   코드 블록을 추가한다, **Then** 편집 화면은 해당 서식을 명확히 표시한다.

---

### User Story 2 - MDX 저장 형식 보존 (Priority: P2)

운영자는 편집한 글이 기존 콘텐츠 원본과 호환되는 MDX 파일로 저장되고, 다시 열었을 때 같은 의미의
편집 문서로 복원되는 것을 기대할 수 있다.

**Why this priority**: 이 플랫폼의 콘텐츠 원본은 repository의 MDX 파일이다. 편집기는 사용하기 쉬운
화면을 제공하되 원본 형식을 깨거나 지원하지 않는 문법을 조용히 손상시키면 안 된다.

**Independent Test**: 지원되는 블록과 inline 서식이 포함된 글을 편집해 저장 가능한 MDX로 변환한 뒤
같은 글을 다시 열어 구조와 metadata가 유지되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 지원되는 서식만 포함한 글을 편집했다, **When** 저장을 요청한다, **Then** CMS는
   공개 블로그와 공유 변환 규칙이 이해할 수 있는 MDX 콘텐츠를 준비한다.
2. **Given** 저장된 MDX 글이 있다, **When** 관리자가 글을 다시 연다, **Then** CMS는 제목, metadata,
   본문 구조, 지원되는 서식을 같은 의미의 편집 문서로 복원한다.
3. **Given** 글에 편집기가 안전하게 처리할 수 없는 MDX 문법이 있다, **When** 관리자가 편집 모드로
   열려고 한다, **Then** CMS는 손상 가능성을 알리고 자동 변환이나 저장을 진행하지 않는다.

---

### User Story 3 - 변경 손실 방지와 복구 (Priority: P3)

운영자는 저장 전 브라우저 새로고침, 세션 만료, 저장 실패, 충돌 상황에서도 현재 편집 내용을 잃지 않고
복구하거나 다음 행동을 선택할 수 있다.

**Why this priority**: 긴 글 작성 중 손실은 운영자 신뢰를 크게 낮춘다. MVP editor는 발행 자동화보다
먼저 작성 중인 초안을 보호해야 한다.

**Independent Test**: 글을 수정한 뒤 저장하지 않고 새로고침하거나 저장 실패와 충돌 상태를 재현해,
운영자가 복구 안내와 현재 변경 내용을 확인할 수 있는지 검증한다.

**Acceptance Scenarios**:

1. **Given** 관리자가 글을 수정했지만 아직 저장하지 않았다, **When** 화면을 새로고침한다, **Then**
   CMS는 최근 편집 내용을 복구할 수 있는 선택지를 제공한다.
2. **Given** 저장 요청이 실패했다, **When** CMS가 실패 상태를 표시한다, **Then** 운영자의 현재 편집
   내용은 화면에 남아 있고 재시도 또는 복구 판단이 가능하다.
3. **Given** 같은 글이 외부에서 변경되어 충돌이 발생했다, **When** 관리자가 저장을 시도한다,
   **Then** CMS는 덮어쓰기 없이 충돌 상태와 현재 편집 내용 보존 여부를 명확히 보여준다.

---

### Edge Cases

- 글 제목이 비어 있으면 CMS는 저장 가능한 글로 처리하지 않고 제목 입력을 요구한다.
- 본문이 비어 있는 글은 초안으로는 유지할 수 있지만 published 상태 요구사항을 만족한 것으로 표시하지
  않는다.
- slug가 아직 없는 새 초안은 임시 편집 식별자로 작업을 유지하고, slug 생성은 저장 또는 발행 phase의
  기존 정책과 충돌하지 않아야 한다.
- 지원하지 않는 MDX import, export, JSX, unsafe HTML, event handler, script성 콘텐츠는 편집 가능한
  문서로 자동 변환하지 않는다.
- 이미지가 포함된 기존 글은 public path 기반 이미지 참조를 표시할 수 있어야 하지만, 새 미디어
  업로드는 이 feature의 범위에 포함하지 않는다.
- 세션이 만료된 상태에서 저장을 시도하면 CMS는 repository 변경 없이 재인증을 요구하고 편집 내용을
  유지해야 한다.
- 저장 충돌, 네트워크 실패, 권한 실패는 서로 구분되는 상태로 표시되어야 한다.
- 복구 가능한 임시 편집 내용은 성공적인 저장 이후 운영자가 혼동하지 않도록 정리되어야 한다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: CMS는 인증된 관리자에게 새 글 초안 작성 화면을 제공해야 한다.
- **FR-002**: CMS는 인증된 관리자가 기존 글을 열어 제목, 본문, 기본 metadata를 편집할 수 있게 해야
  한다.
- **FR-003**: CMS editor는 paragraph, heading, bullet list, ordered list, blockquote, horizontal
  rule, link, image reference, inline code, code block, bold, italic 서식을 지원해야 한다.
- **FR-004**: CMS editor는 지원되는 서식 도구의 현재 상태와 적용 가능 여부를 운영자가 알아볼 수 있게
  표시해야 한다.
- **FR-005**: CMS는 편집 문서를 저장 가능한 MDX 콘텐츠와 frontmatter로 변환할 수 있어야 한다.
- **FR-006**: CMS는 저장된 MDX 콘텐츠와 frontmatter를 같은 의미의 편집 문서로 다시 열 수 있어야
  한다.
- **FR-007**: CMS는 지원하지 않는 MDX 문법을 자동으로 손상시키거나 삭제하지 않아야 하며, 편집 불가
  상태 또는 안전한 안내를 제공해야 한다.
- **FR-008**: CMS는 변경 여부를 추적하고, 저장되지 않은 변경이 있을 때 운영자가 이를 인지할 수 있게
  해야 한다.
- **FR-009**: CMS는 저장 전 임시 편집 내용을 복구 가능한 상태로 보존해야 한다.
- **FR-010**: CMS는 성공적인 저장 이후 해당 글의 임시 복구 상태를 정리해야 한다.
- **FR-011**: CMS는 저장 실패 시 현재 편집 내용을 유지하고 재시도 가능한 상태를 제공해야 한다.
- **FR-012**: CMS는 repository 충돌 발생 시 현재 편집 내용을 덮어쓰지 않고 충돌 상태를 운영자에게
  알려야 한다.
- **FR-013**: CMS는 세션 만료 또는 권한 실패 상태에서 저장을 차단하고 재인증 또는 접근 거부 상태를
  표시해야 한다.
- **FR-014**: CMS editor preview는 공개 블로그와 같은 콘텐츠 의미, heading, code block, link, image
  reference를 보여줘야 한다.
- **FR-015**: CMS는 이 feature에서 새 미디어 업로드, 발행, 예약 발행, SEO scoring, 분석 대시보드, AI
  글쓰기 생성을 제공하지 않아야 한다.
- **FR-016**: CMS editor는 승인된 디자인 시스템의 기본 색상과 shell navigation 안에서 제공되어야
  하며, 별도 브랜드 색상이나 임의 색상 팔레트를 도입하지 않아야 한다.

### Key Entities _(include if feature involves data)_

- **편집 문서**: 운영자가 CMS에서 수정하는 글의 현재 제목, 본문 구조, 기본 metadata, 변경 상태를
  나타낸다.
- **MDX 콘텐츠**: repository에 저장되는 글 원본이며 frontmatter와 본문을 포함한다.
- **지원 서식**: MVP editor가 안전하게 표시하고 저장하고 다시 열 수 있는 block 및 inline 서식
  집합이다.
- **임시 편집 백업**: 저장 전 손실 방지를 위해 특정 글 또는 새 초안에 연결되는 복구 가능한 편집
  상태이다.
- **편집 충돌 상태**: 마지막으로 읽은 원본과 저장 시점의 원본이 달라 덮어쓰기를 막아야 하는
  상태이다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 관리자는 로그인 후 15초 이내에 새 초안 편집 화면을 열고 제목과 본문 입력을 시작할 수
  있다.
- **SC-002**: 지원 서식이 포함된 대표 글 10개 중 10개가 저장 가능한 MDX로 변환되고 다시 열었을 때
  같은 의미의 문서 구조를 유지한다.
- **SC-003**: 지원하지 않는 MDX 문법이 포함된 대표 입력 100%가 조용한 손상 없이 편집 불가 또는 안내
  상태로 처리된다.
- **SC-004**: 저장하지 않은 변경이 있는 상태에서 새로고침한 검증 시나리오 100%에서 운영자가 최근
  편집 내용을 복구할 수 있다.
- **SC-005**: 저장 실패, 세션 만료, 권한 실패, 충돌 상태가 각각 독립적으로 재현되고 서로 다른 사용자
  안내로 구분된다.
- **SC-006**: 운영자는 첫 사용 테스트에서 90% 이상 제목 편집, 본문 편집, preview 확인, 저장 시도를
  도움말 없이 완료할 수 있다.
- **SC-007**: 이 feature에서 추가되는 CMS editor 화면의 임의 색상 사용은 0건이며 기존 shell
  navigation 범위를 벗어난 실행 가능한 후속 phase 기능 노출도 0건이다.

## Assumptions

- 이 feature는 로드맵의 "Phase 6: CMS Editor"에 해당하며, 이전 phase의 CMS 인증, shell, content
  adapter, markdown 변환 기반이 존재한다고 가정한다.
- 단일 운영자 MVP이므로 collaborative editing, 댓글, 승인 workflow, 다중 작성자 권한은 범위에서
  제외한다.
- 새 미디어 업로드는 후속 Media Upload phase에서 다루며, 이 feature는 기존 public path 이미지 참조의
  표시와 보존만 다룬다.
- 발행, unpublish, archive, revalidation은 후속 Publish Workflow phase에서 다룬다.
- SEO scoring과 generated SEO outputs는 후속 SEO 및 Generated Outputs phase에서 다룬다.
- 임시 편집 백업은 운영자의 작성 손실 방지를 위한 로컬 복구 수단이며, repository 콘텐츠 원본을
  대체하지 않는다.

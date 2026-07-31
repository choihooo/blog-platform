# 기능 명세: Markdown/MDX Engine

**Feature Branch**: `main`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "로드맵의 세 번째 작업인 Phase 2 Markdown/MDX Engine을 구현한다."

## 사용자 시나리오 및 테스트 _(필수)_

### 사용자 스토리 1 - 같은 입력에서 일관된 글 변환 (Priority: P1)

블로그 운영자로서, repository의 MDX 글이 공개 블로그와 CMS preview에서 같은 방식으로 해석되기를
원한다. 그래야 작성 중에 확인한 결과와 독자가 보는 결과가 어긋나지 않고, 이후 발행 workflow와 SEO
산출물이 동일한 콘텐츠 기준을 사용할 수 있다.

**우선순위 근거**: Markdown/MDX 변환은 공개 렌더링, CMS preview, SEO, generated outputs의 공통
기반이다. 이 기준이 먼저 안정화되지 않으면 이후 phase가 같은 콘텐츠를 다르게 처리할 위험이 크다.

**독립 테스트**: 샘플 MDX와 frontmatter를 입력으로 제공했을 때, 공개 렌더링용 결과와 preview용
결과가 동일한 metadata, 본문 구조, heading 정보를 반환하는지 검증해 독립적으로 테스트할 수 있다.

**Acceptance Scenarios**:

1. **Given** 유효한 frontmatter와 본문을 가진 샘플 MDX 글이 있을 때, **When** 글 변환을 실행하면,
   **Then** 제목, slug, 작성자, 발행일, 요약, 본문이 구분된 결과로 제공된다.
2. **Given** 같은 샘플 MDX 글을 공개 블로그와 CMS preview가 사용할 때, **When** 두 흐름이 변환
   결과를 요청하면, **Then** 동일한 본문 구조와 metadata를 기준으로 표시할 수 있다.
3. **Given** frontmatter가 누락되었거나 형식이 잘못된 글이 있을 때, **When** 글 변환을 실행하면,
   **Then** 운영자가 수정할 수 있는 명확한 실패 사유가 제공된다.

---

### 사용자 스토리 2 - TOC와 reading time 생성 (Priority: P2)

블로그 운영자로서, 글 본문에서 목차와 예상 읽기 시간이 자동으로 만들어지기를 원한다. 그래야 게시글
페이지가 긴 글을 탐색하기 쉬워지고, 운영자가 반복적인 보조 metadata를 수동으로 관리하지 않아도 된다.

**우선순위 근거**: 로드맵은 TOC와 reading time을 MVP 필수 산출물로 정의한다. 이 정보는 공개 게시글
페이지와 SEO 관련 생성 산출물의 입력이 되므로 Markdown/MDX engine에서 안정적으로 제공되어야 한다.

**독립 테스트**: heading이 여러 단계로 포함된 글과 중복 heading을 가진 글을 입력하고, 생성된 TOC
항목, heading slug, 예상 읽기 시간이 기대한 값과 일치하는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 여러 heading level을 가진 글이 있을 때, **When** TOC 생성을 실행하면, **Then** 허용된
   깊이의 heading만 순서대로 포함된 목차가 제공된다.
2. **Given** 같은 제목의 heading이 여러 번 등장할 때, **When** heading slug를 생성하면, **Then** 각
   heading은 충돌하지 않는 고유 anchor를 가진다.
3. **Given** 본문 길이가 다른 글들이 있을 때, **When** reading time을 계산하면, **Then** 운영자와
   독자가 이해할 수 있는 예상 읽기 시간이 일관된 규칙으로 제공된다.

---

### 사용자 스토리 3 - 안전하지 않은 MDX 차단 (Priority: P3)

블로그 운영자로서, 글 안의 안전하지 않은 HTML, script, 임의 실행, 지원하지 않는 interactive 요소가
공개 페이지나 preview에서 렌더링되지 않기를 원한다. 그래야 초안과 외부에서 가져온 글을 검토할 때도
독자와 CMS 세션이 불필요한 보안 위험에 노출되지 않는다.

**우선순위 근거**: 헌법은 unsafe MDX와 arbitrary runtime evaluation 차단을 안전한 발행 경계의 핵심
요구로 둔다. Markdown/MDX engine이 이 기준을 강제해야 이후 공개 렌더링과 CMS preview가 같은 보안
정책을 공유할 수 있다.

**독립 테스트**: script, event handler, unsafe HTML, 허용되지 않은 component가 포함된 MDX를 입력하고
렌더링 가능한 결과에서 제외되거나 검증 실패로 처리되는지 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** inline script가 포함된 글이 있을 때, **When** 글 변환 또는 렌더링 준비를 실행하면,
   **Then** script는 실행 가능한 출력에 포함되지 않는다.
2. **Given** event handler나 unsafe HTML이 포함된 글이 있을 때, **When** preview 또는 공개 렌더링
   결과를 만들면, **Then** 해당 위험 요소는 제거되거나 명확한 검증 실패로 보고된다.
3. **Given** MVP에서 지원하지 않는 interactive component가 포함된 글이 있을 때, **When** 글 변환을
   실행하면, **Then** 운영자는 지원되지 않는 요소라는 실패 사유를 확인할 수 있다.

### Edge Cases

- 빈 본문이나 heading이 없는 본문은 변환에 성공할 수 있지만 TOC는 빈 목록으로 제공되어야 한다.
- 같은 텍스트의 heading이 반복되어도 생성된 anchor는 글 안에서 충돌하지 않아야 한다.
- frontmatter 구분자가 깨졌거나 값 형식이 잘못된 글은 조용히 무시되지 않고 수정 가능한 실패로
  보고되어야 한다.
- code block 언어가 없거나 지원하지 않는 언어로 지정되어도 글 전체 변환이 실패해서는 안 된다.
- unsafe HTML, inline `<script>`, event handler, 임의 import/export, runtime evaluation은 공개
  가능한 출력에 포함되지 않아야 한다.
- MDX component allowlist 밖의 component는 안전한 fallback 또는 명확한 실패로 처리되어야 한다.
- 같은 입력을 반복 처리해도 metadata, TOC, heading slug, reading time 결과는 바뀌지 않아야 한다.

## 요구사항 _(필수)_

### Functional Requirements

- **FR-001**: 시스템은 MDX 글에서 frontmatter와 본문을 분리하고, 유효한 metadata와 본문을 구분된
  결과로 제공해야 한다.
- **FR-002**: 시스템은 metadata를 다시 파일 저장 가능한 frontmatter 형태로 표현할 수 있어야 한다.
- **FR-003**: 시스템은 공개 블로그와 CMS preview가 같은 입력에서 같은 변환 결과를 사용할 수 있는
  공통 콘텐츠 변환 계약을 제공해야 한다.
- **FR-004**: 시스템은 글 본문에서 heading 목록을 추출하고 각 heading에 안정적인 anchor를 부여해야
  한다.
- **FR-005**: 시스템은 허용된 heading depth를 기준으로 게시글 TOC를 생성해야 한다.
- **FR-006**: 시스템은 본문 내용을 기준으로 예상 reading time을 일관된 규칙으로 계산해야 한다.
- **FR-007**: 시스템은 code block을 사람이 읽기 쉬운 표시 대상으로 준비하되, 지원되지 않는 언어가 글
  전체 실패로 이어지지 않게 처리해야 한다.
- **FR-008**: 시스템은 unsafe HTML, inline script, event handler, 임의 import/export, arbitrary
  runtime evaluation을 공개 가능한 출력에서 차단해야 한다.
- **FR-009**: 시스템은 MVP에서 허용된 MDX component만 렌더링 대상으로 인정하고, 허용되지 않은
  component를 명확한 실패 또는 안전한 fallback으로 처리해야 한다.
- **FR-010**: 시스템은 변환 실패가 발생했을 때 운영자가 원인을 수정할 수 있도록 실패 위치 또는 실패
  범주를 포함한 메시지를 제공해야 한다.
- **FR-011**: 시스템은 같은 입력에 대해 metadata, 본문 구조, TOC, heading slug, reading time이 반복
  실행마다 동일하게 생성되도록 해야 한다.
- **FR-012**: 시스템은 공개 블로그 runtime에서 GitHub API나 별도 CMS 데이터베이스를 요구하지 않는
  파일 기반 콘텐츠 흐름을 유지해야 한다.

### 주요 Entity

- **MDX Document**: frontmatter와 본문을 포함한 글 원본. 공개 블로그와 CMS preview의 공통 입력이다.
- **Frontmatter Metadata**: 글의 제목, slug, 상태, 작성자, 발행일, 요약, cover image, 분류 정보를
  담는 구조화된 metadata.
- **Rendered Content**: 안전 정책을 통과해 공개 블로그나 preview에서 표시할 수 있는 본문 표현.
- **Heading**: 본문 안의 제목 단위. 표시 텍스트, depth, anchor를 가진다.
- **Table of Contents**: 허용된 heading을 순서와 depth에 맞게 정리한 탐색 metadata.
- **Reading Time**: 본문 길이를 기준으로 계산된 예상 읽기 시간.
- **Allowed Component**: MVP에서 표시가 허용된 MDX component.
- **Validation Failure**: 변환 또는 안전성 검증 중 발견된 수정 가능한 실패 사유.

## 성공 기준 _(필수)_

### Measurable Outcomes

- **SC-001**: 샘플 MDX 글은 공개 블로그와 CMS preview에서 동일한 metadata, 본문 구조, TOC, reading
  time 결과를 제공한다.
- **SC-002**: heading 추출, 중복 heading slug, TOC depth, reading time, unsafe content 차단 사례가
  각각 독립 검증에서 100% 기대 결과를 반환한다.
- **SC-003**: unsafe HTML, inline script, event handler, 임의 실행 요소가 포함된 입력은 공개 가능한
  출력에 실행 가능한 위험 요소를 남기지 않는다.
- **SC-004**: 같은 MDX 입력을 10회 반복 처리해도 heading anchor, TOC, reading time 결과가 동일하다.
- **SC-005**: frontmatter 오류와 지원하지 않는 component 오류는 운영자가 수정할 수 있는 실패 범주로
  구분되어 보고된다.
- **SC-006**: Markdown/MDX engine 산출물은 MVP에서 금지한 remote runtime evaluation, arbitrary
  import/export, unsafe interactive component 편집을 도입하지 않는다.

## 가정

- feature scope는 Markdown/MDX parsing, frontmatter serialization, rendering 준비, heading/TOC,
  reading time, code block 표시 준비, 안전성 검증으로 제한한다.
- 공개 라우트 UI, CMS editor UI, GitHub write mutation, SEO score 계산, RSS/Sitemap/JSON-LD/OG image
  생성은 이후 phase에서 다룬다.
- MVP에서는 글 작성자가 임의 interactive component를 추가하거나 편집할 수 없으며, 허용된 component만
  표시 대상으로 인정한다.
- code block 표시 품질은 글을 읽을 수 있는 수준을 목표로 하며, 지원되지 않는 언어는 안전한 일반 code
  block으로 표시될 수 있다.
- 콘텐츠 원본은 repository의 로컬 파일이며 공개 블로그 runtime은 외부 콘텐츠 API 접근 없이 렌더링
  준비된 결과를 사용할 수 있어야 한다.

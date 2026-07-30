# 기능 명세: SEO 자동화

**Feature Branch**: `[010-seo-automation]`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "다음 작업"에서 기존 로드맵의 다음 MVP 축으로 추론한 SEO 자동화 및 분석 연결

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 발행 글 SEO 산출물 자동 생성 (Priority: P1)

운영자는 글을 발행한 뒤 별도 파일 생성이나 수동 설정 없이 공개 글, 검색 엔진, 피드 리더, 소셜 공유가
동일한 발행 콘텐츠 metadata를 반영하기를 원한다. 그래야 글마다 반복적인 SEO 작업을 하지 않고도 검색
노출과 공유 품질을 안정적으로 유지할 수 있다.

**Why this priority**: MVP 블로그는 발행된 글이 검색과 공유 표면에서 올바르게 표현되어야 한다. 이
흐름이 없으면 콘텐츠 발행의 핵심 가치가 완성되지 않는다.

**Independent Test**: 발행 상태의 샘플 글을 기준으로 공개 글 metadata, canonical 정보, Open Graph 정보,
JSON-LD, RSS, Sitemap, robots 정책, OG 이미지가 생성되고 초안과 보관 글이 제외되는지 확인하면 독립적으로
검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** 발행 상태의 글과 사이트 metadata가 존재할 때, **When** 독자 또는 검색 크롤러가 공개 글과
   생성 산출물을 조회하면, **Then** 글 제목, 설명, canonical URL, 게시일, 수정일, 대표 이미지, 작성자,
   카테고리, 태그가 일관되게 반영된다.
2. **Given** 초안 또는 보관 상태의 글이 존재할 때, **When** 공개 글, RSS, Sitemap, JSON-LD, OG 이미지
   산출물을 조회하면, **Then** 해당 글은 모든 공개 SEO 산출물에서 제외된다.

---

### User Story 2 - CMS에서 SEO 상태 점검 (Priority: P2)

운영자는 글을 작성하거나 발행하기 전에 CMS에서 SEO 점수와 문제 목록을 확인하고 싶다. 그래야 누락된
제목, 설명, 대표 이미지, alt 텍스트, heading 구조 같은 문제를 발행 전에 고칠 수 있다.

**Why this priority**: 발행 후 산출물이 자동 생성되더라도 입력 metadata 품질이 낮으면 검색과 공유 품질이
떨어진다. 운영자가 발행 전에 문제를 볼 수 있어야 반복 수정 비용이 줄어든다.

**Independent Test**: SEO metadata가 완성된 글과 결함이 있는 글을 각각 CMS에서 열어 점수, 차단 오류,
경고, 미리보기 정보가 예상대로 표시되는지 확인하면 독립적으로 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** SEO 필수 metadata가 부족한 글을 편집 중일 때, **When** 운영자가 SEO 상태를 확인하면,
   **Then** CMS는 0-100 점수, 발행 전 해결해야 하는 차단 오류, 권장 경고를 구분해 표시한다.
2. **Given** SEO 기준을 충족한 발행 글을 편집 중일 때, **When** 운영자가 SEO 상태를 확인하면, **Then**
   CMS는 통과 상태와 검색/공유 미리보기 정보를 표시한다.

---

### User Story 3 - 분석 이벤트와 외부 콘솔 연결 (Priority: P3)

운영자는 공개 블로그의 기본 독자 행동이 분석 도구로 전송되고, CMS에서 글별 공개 페이지와 외부 분석
콘솔로 바로 이동할 수 있기를 원한다. 그래야 MVP 안에서 별도 통합 대시보드를 만들지 않고도 성과 확인
동선을 확보할 수 있다.

**Why this priority**: 분석은 운영 개선에 필요하지만 MVP에서는 자체 지표 저장과 API 통합보다 이벤트
발행과 외부 콘솔 연결이 더 작은 범위로 충분한 가치를 제공한다.

**Independent Test**: 공개 블로그에서 페이지 조회, 글 읽기, 공유 같은 합의된 이벤트가 설정된 분석
provider로 전송되고, CMS가 글별 공개 URL과 외부 콘솔 링크를 제공하는지 확인하면 독립적으로 검증할 수
있다.

**Acceptance Scenarios**:

1. **Given** 사이트에 분석 provider가 설정되어 있을 때, **When** 독자가 공개 글을 조회하거나 합의된
   행동을 수행하면, **Then** 해당 이벤트는 글 slug와 공개 URL을 포함해 분석 도구로 전송된다.
2. **Given** 운영자가 CMS에서 발행 글을 보고 있을 때, **When** 분석 링크 영역을 확인하면, **Then** 공개
   글, GA4 페이지 보고서, Search Console 성과 화면으로 이동할 수 있는 링크가 제공된다.

---

### Edge Cases

- 필수 SEO metadata가 비어 있거나 너무 짧거나 너무 길면 발행 전 차단 오류 또는 경고로 분류되어야 한다.
- 대표 이미지가 없거나 이미지 alt 텍스트가 없으면 공개 산출물은 안전한 fallback을 사용하고 CMS는 경고를
  표시해야 한다.
- slug, canonical URL, 사이트 URL 조합이 유효하지 않으면 생성 산출물이 잘못된 공개 URL을 노출하지 않아야
  한다.
- 발행 글이 0개일 때 RSS와 Sitemap은 유효한 빈 상태를 제공해야 한다.
- 분석 provider 설정이 없거나 비활성화되어 있으면 공개 블로그는 오류 없이 동작하고 이벤트 전송만
  생략해야 한다.
- 초안 미리보기 접근은 공개 SEO 산출물, RSS, Sitemap, 분석 이벤트에 포함되지 않아야 한다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 발행 글과 사이트 metadata를 기준으로 글별 제목, 설명, canonical URL, Open Graph,
  Twitter 공유 metadata를 생성해야 한다.
- **FR-002**: 시스템은 발행 글에 대해 글 구조화 데이터와 breadcrumb 구조화 데이터를 생성해야 한다.
- **FR-003**: 시스템은 발행 글만 포함하는 RSS feed를 제공해야 한다.
- **FR-004**: 시스템은 발행 글, 공개 목록, 카테고리, 태그 표면만 포함하는 Sitemap을 제공해야 한다.
- **FR-005**: 시스템은 공개 색인 정책과 Sitemap 위치를 표현하는 robots 정책을 제공해야 한다.
- **FR-006**: 시스템은 발행 글별 공유 이미지 또는 안정적인 fallback 공유 이미지를 제공해야 한다.
- **FR-007**: 시스템은 초안과 보관 글을 공개 metadata, RSS, Sitemap, JSON-LD, 공유 이미지, 분석 이벤트에서
  제외해야 한다.
- **FR-008**: CMS는 글별 SEO 점수를 0-100 범위의 결정적인 값으로 표시해야 한다.
- **FR-009**: CMS는 SEO 문제를 발행 전 차단 오류와 권장 경고로 구분해 표시해야 한다.
- **FR-010**: SEO 점검은 제목, 설명, slug, canonical URL, 대표 이미지, 이미지 alt 텍스트, heading 구조,
  excerpt, category, tag, reading time, 구조화 데이터 입력 완성도를 평가해야 한다.
- **FR-011**: CMS는 검색 결과 미리보기와 공유 미리보기에 필요한 핵심 내용을 운영자가 확인할 수 있게
  표시해야 한다.
- **FR-012**: 공개 블로그는 설정된 분석 provider에 대해 페이지 조회, 글 읽기, heading 탐색, 외부 링크
  클릭, 공유 시도 이벤트를 전송해야 한다.
- **FR-013**: 분석 이벤트는 이벤트 이름, 글 slug, 공개 URL, 콘텐츠 분류, 발생 시각을 포함해야 하며 개인
  식별 정보를 포함하지 않아야 한다.
- **FR-014**: CMS는 발행 글별 공개 URL, GA4 외부 콘솔 링크, Search Console 외부 콘솔 링크를 제공해야
  한다.
- **FR-015**: 분석 provider가 설정되지 않았거나 비활성화된 경우 시스템은 공개 블로그와 CMS를 정상
  표시하고 분석 전송과 콘솔 링크만 비활성 상태로 처리해야 한다.
- **FR-016**: CMS는 GA4/Search Console API 기반 통합 대시보드, 자체 분석 저장소, ranking 자동 추천,
  AI 기반 SEO 생성 기능을 이 feature에 포함하지 않아야 한다.
- **FR-017**: 생성 산출물은 수동으로 repository에 파일을 저장하지 않고 발행 콘텐츠의 현재 상태를
  반영해야 한다.
- **FR-018**: 운영자는 SEO 점검 결과와 분석 링크가 공개 발행 상태에 어떤 영향을 받는지 CMS에서 이해할
  수 있어야 한다.

### Key Entities

- **SEO Report**: 글 하나의 SEO 점검 결과. 점수, 차단 오류, 경고, 통과 항목, 검색 미리보기, 공유
  미리보기를 포함한다.
- **Generated SEO Output**: 공개 블로그가 발행 콘텐츠에서 생성하는 metadata, 구조화 데이터, RSS 항목,
  Sitemap 항목, robots 정책, 공유 이미지 표현.
- **Analytics Event**: 공개 독자 행동을 나타내는 이벤트. 이벤트 이름, 글 slug, 공개 URL, 콘텐츠 분류,
  발생 시각을 포함하고 개인 식별 정보는 포함하지 않는다.
- **External Console Link**: 발행 글 기준으로 운영자가 외부 분석 콘솔에서 성과를 확인할 수 있게 하는
  링크. 공개 글 URL, GA4, Search Console 링크를 포함한다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 발행 글 100%가 제목, 설명, canonical URL, Open Graph metadata, 구조화 데이터, RSS 항목,
  Sitemap 항목 중 적용 가능한 산출물을 자동으로 제공한다.
- **SC-002**: 초안과 보관 글이 공개 글 목록, RSS, Sitemap, 구조화 데이터, 공유 이미지, 분석 이벤트에
  노출되는 사례가 0건이어야 한다.
- **SC-003**: 운영자는 CMS에서 SEO 점수와 문제 목록을 2초 이내에 확인할 수 있다.
- **SC-004**: SEO metadata가 완성된 샘플 글은 90점 이상을 받고, 필수 metadata가 누락된 샘플 글은 최소
  하나 이상의 차단 오류를 표시한다.
- **SC-005**: 정상 설정된 분석 provider에서 합의된 공개 독자 행동 이벤트의 95% 이상이 글 slug와 공개
  URL을 포함해 전송된다.
- **SC-006**: 발행 글 화면에서 운영자는 공개 글, GA4, Search Console 외부 콘솔 링크에 각각 한 번의
  클릭으로 접근할 수 있다.
- **SC-007**: 발행 글 100개와 카테고리 20개, 태그 50개가 있는 상태에서도 RSS, Sitemap, SEO 점검은
  운영자가 체감할 수 있는 지연 없이 완료된다.
- **SC-008**: SEO 산출물과 분석 링크 검증 중 repository에 생성 파일을 commit해야 하는 흐름이 0건이어야
  한다.

## Assumptions

- 이 feature는 기존 콘텐츠 모델, Markdown/MDX 분석, 공개 블로그 렌더링, CMS 편집, 발행 workflow가
  존재한다는 전제에서 진행한다.
- SEO 점수는 MVP에서 rule-based 방식으로 계산하며 AI 기반 키워드 분석이나 경쟁 글 분석은 포함하지
  않는다.
- 분석 provider는 MVP에서 GA4 또는 GTM 설정 중 하나를 사용할 수 있으며, API 기반 지표 조회는 포함하지
  않는다.
- Search Console과 GA4 성과 확인은 외부 콘솔 링크로 제공하고 CMS 내부 대시보드는 Post-MVP로 남긴다.
- 공개 생성 산출물은 발행 콘텐츠의 현재 상태를 읽어 제공하며 RSS, Sitemap, robots, OG 이미지 파일을
  CMS가 repository에 직접 저장하지 않는다.

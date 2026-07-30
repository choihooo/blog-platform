# 기능 명세: Generated Outputs

**Feature Branch**: `011-generated-outputs`

**Created**: 2026-07-30

**Status**: Draft

**Input**: 사용자 설명: "로드맵 보고 다음작업 스펙킷으로 명세해줘"를 로드맵의 다음 단계인 "Phase 10: Generated Outputs"로 해석

## 사용자 시나리오 및 테스트 _(필수)_

### 사용자 스토리 1 - 발행 글 SEO 산출물 자동 제공 (Priority: P1)

운영자는 글을 발행한 뒤 검색 엔진, 피드 리더, 소셜 공유 표면에서 공개 글의 제목, 설명, URL, 이미지,
구조화 데이터가 자동으로 일관되게 제공되기를 원한다. 그래야 글마다 별도 SEO 파일이나 공유 이미지를
수동으로 관리하지 않고도 공개 노출 품질을 유지할 수 있다.

**우선순위 근거**: 이 기능은 공개 블로그가 발행 콘텐츠를 검색, 피드, 공유 환경에 올바르게 노출하기
위한 핵심 산출물이다. 발행된 글이 공개 페이지 안에서만 보이고 외부 소비 표면에서 부정확하면 MVP의
발행 흐름이 완성되지 않는다.

**독립 테스트**: 발행 글이 있는 상태에서 글 상세, RSS, Sitemap, robots 정책, JSON-LD, OG 이미지 URL을
확인해 동일한 글 metadata가 반영되고 초안/보관 글이 제외되는지 검증할 수 있다.

**Acceptance Scenarios**:

1. **Given** 발행 상태의 글과 사이트 metadata가 존재할 때, **When** 독자 또는 크롤러가 글 상세와 생성
   산출물을 조회하면, **Then** 제목, 설명, canonical URL, Open Graph, Twitter metadata, JSON-LD, OG
   이미지 URL이 같은 공개 글 정보를 반영한다.
2. **Given** 초안 또는 보관 상태의 글이 repository에 존재할 때, **When** RSS, Sitemap, JSON-LD, OG
   이미지, metadata 산출물을 조회하면, **Then** 해당 글은 공개 산출물에 포함되지 않는다.

---

### 사용자 스토리 2 - 피드와 크롤러용 사이트 산출물 제공 (Priority: P2)

독자와 검색 크롤러는 사이트의 최신 발행 글, 공개 URL 목록, 색인 정책을 표준 위치에서 확인할 수 있다.
그래야 피드 구독, 검색 색인, 사이트 발견 흐름이 운영자의 수동 파일 관리 없이 동작한다.

**우선순위 근거**: RSS, Sitemap, robots 정책은 공개 블로그의 검색 및 구독 발견성을 높이는 기본
산출물이다. 글별 metadata 다음으로 사이트 단위의 자동 노출 품질을 보장한다.

**독립 테스트**: 발행 글 여러 개와 카테고리/태그가 있는 상태에서 RSS에는 최신 발행 글이 들어가고,
Sitemap에는 공개 표면만 들어가며, robots 정책에는 Sitemap 위치가 포함되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 여러 발행 글이 있을 때, **When** RSS feed를 조회하면, **Then** 최신 발행 글이 최신순으로
   포함되고 각 항목은 공개 URL, 제목, 설명, 게시일을 제공한다.
2. **Given** 사이트 URL 설정이 존재할 때, **When** robots 정책을 조회하면, **Then** 공개 색인 정책과
   Sitemap URL이 포함된다.
3. **Given** 발행 글, 카테고리, 태그 공개 페이지가 있을 때, **When** Sitemap을 조회하면, **Then** 공개
   접근 가능한 URL만 포함된다.

---

### 사용자 스토리 3 - 글 본문 보조 정보 표시 (Priority: P3)

독자는 글 상세 페이지에서 목차와 예상 읽기 시간을 확인하고 원하는 heading으로 빠르게 이동할 수 있다.
그래야 긴 글을 읽기 전에 분량을 판단하고 관심 있는 구간으로 이동할 수 있다.

**우선순위 근거**: TOC와 reading time은 발행 글 경험을 개선하지만, 검색/피드 산출물보다 직접적인
발견성 영향은 작다. 다만 이미 Markdown/MDX 분석 결과를 기반으로 자동 생성되어야 하므로 이 phase에서
함께 완성한다.

**독립 테스트**: heading이 여러 개 있는 발행 글 상세를 열어 목차, heading anchor, reading time이
표시되고 본문 구조와 일치하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** heading이 있는 발행 글을 열었을 때, **When** 독자가 글 상세 페이지를 보면, **Then** 본문
   구조에 맞는 목차와 heading anchor가 표시된다.
2. **Given** 글 본문이 존재할 때, **When** 독자가 글 상세 페이지를 보면, **Then** 예상 읽기 시간이
   표시되고 본문 변경 시 최신 내용 기준으로 갱신된다.

### Edge Cases

- 발행 글이 0개일 때 RSS와 Sitemap은 오류 대신 유효한 빈 상태를 제공해야 한다.
- 사이트 URL, slug, canonical 조합이 유효하지 않으면 잘못된 공개 URL을 산출물에 노출하지 않아야 한다.
- 제목이나 설명이 긴 글의 OG 이미지는 텍스트가 잘리거나 겹치지 않고 읽을 수 있게 표시되어야 한다.
- 대표 이미지가 없는 글은 안정적인 fallback OG 이미지를 제공해야 한다.
- 같은 제목 또는 heading이 반복되어도 heading anchor와 목차 링크는 충돌 없이 생성되어야 한다.
- draft preview 접근은 RSS, Sitemap, JSON-LD, robots, OG 이미지 산출물에 포함되지 않아야 한다.

## 요구사항 _(필수)_

### 기능 요구사항

- **FR-001**: 시스템은 발행 글별 제목, 설명, canonical URL, Open Graph metadata, Twitter metadata를
  자동 생성해야 한다.
- **FR-002**: 시스템은 발행 글별 `BlogPosting` 구조화 데이터를 제공해야 한다.
- **FR-003**: 시스템은 발행 글 상세의 탐색 맥락을 표현하는 `BreadcrumbList` 구조화 데이터를 제공해야
  한다.
- **FR-004**: 시스템은 발행 글만 포함하는 RSS feed를 표준 공개 위치에서 제공해야 한다.
- **FR-005**: 시스템은 발행 글, 공개 목록, 공개 카테고리, 공개 태그 표면만 포함하는 Sitemap을 제공해야
  한다.
- **FR-006**: 시스템은 공개 색인 정책과 Sitemap 위치를 표현하는 robots 정책을 제공해야 한다.
- **FR-007**: 시스템은 발행 글마다 공유 가능한 OG 이미지 URL을 제공해야 하며, 대표 이미지가 없는 경우
  fallback 이미지를 제공해야 한다.
- **FR-008**: 시스템은 OG 이미지에서 긴 제목, 긴 카테고리명, 긴 작성자명이 시각적으로 겹치지 않도록
  처리해야 한다.
- **FR-009**: 시스템은 초안과 보관 글을 metadata, RSS, Sitemap, JSON-LD, robots 관련 URL, OG 이미지
  산출물에서 제외해야 한다.
- **FR-010**: 시스템은 글 상세 페이지에 목차를 표시하고 목차 항목이 해당 heading으로 이동할 수 있게
  해야 한다.
- **FR-011**: 시스템은 글 상세 페이지에 예상 읽기 시간을 표시해야 한다.
- **FR-012**: 생성 산출물은 repository에 수동 파일로 저장되지 않고 현재 발행 콘텐츠와 사이트 metadata를
  기준으로 제공되어야 한다.
- **FR-013**: 생성 산출물은 사이트 URL, slug, 게시일, 수정일, 작성자, 카테고리, 태그, 대표 이미지,
  excerpt 같은 기존 콘텐츠 metadata를 일관되게 사용해야 한다.
- **FR-014**: RSS, Sitemap, robots, OG 이미지, 구조화 데이터 산출물은 발행 글이 없거나 일부 metadata가
  부족한 경우에도 공개 페이지 전체를 실패시키지 않아야 한다.
- **FR-015**: 이 feature는 SEO 점수 계산, CMS SEO panel, GA4/GTM 이벤트 발행, 외부 분석 콘솔 링크를
  포함하지 않아야 한다.

### 핵심 엔티티

- **Generated Metadata**: 발행 글과 사이트 정보를 바탕으로 생성되는 제목, 설명, canonical URL, Open
  Graph, Twitter metadata 표현.
- **Structured Data**: 발행 글의 검색 노출 맥락을 설명하는 `BlogPosting`과 `BreadcrumbList` 데이터.
- **Feed Item**: RSS에 포함되는 발행 글 항목. 공개 URL, 제목, 설명, 게시일, 작성자 정보를 포함한다.
- **Sitemap Entry**: 검색 크롤러가 발견할 수 있는 공개 URL 항목. 홈, 글 상세, 카테고리, 태그 같은 공개
  표면을 나타낸다.
- **OG Image Representation**: 소셜 공유에 사용되는 글별 이미지 표현. 글 제목, 사이트명, 카테고리,
  대표 이미지 또는 fallback 상태를 포함한다.
- **Reading Aid**: 글 상세에 표시되는 목차, heading anchor, 예상 읽기 시간.

## 성공 기준 _(필수)_

### 측정 가능한 결과

- **SC-001**: 발행 글 100%가 제목, 설명, canonical URL, Open Graph metadata, Twitter metadata,
  `BlogPosting` JSON-LD, OG 이미지 URL을 제공한다.
- **SC-002**: 초안과 보관 글이 RSS, Sitemap, JSON-LD, OG 이미지 URL, 공개 metadata에 포함되는 사례가
  0건이어야 한다.
- **SC-003**: `/robots.txt`는 설정된 사이트 URL 기준 Sitemap URL을 100% 포함한다.
- **SC-004**: RSS feed는 최신 발행 글을 최신순으로 포함하며, 발행 글 0개 상태에서도 유효한 응답을
  제공한다.
- **SC-005**: Sitemap은 공개 접근 가능한 홈, 발행 글, 공개 카테고리, 공개 태그 URL만 포함하고 비공개
  CMS 또는 preview URL을 포함하지 않는다.
- **SC-006**: heading이 있는 발행 글 100%에서 목차 링크가 실제 heading 위치로 이동한다.
- **SC-007**: 대표 이미지가 없는 발행 글 100%가 fallback OG 이미지를 제공한다.
- **SC-008**: 긴 제목을 가진 샘플 글의 OG 이미지는 제목이 이미지 경계 밖으로 나가거나 다른 텍스트와
  겹치는 시각적 결함 없이 표시된다.

## 가정

- 이 feature는 기존 콘텐츠 모델, Markdown/MDX 분석, 공개 블로그 렌더링, 발행 workflow, SEO engine의
  metadata 생성 규칙이 존재한다는 전제에서 진행한다.
- 공개 생성 산출물은 발행 콘텐츠의 현재 상태를 읽어 제공하며 CMS가 `rss.xml`, `sitemap.xml`,
  `robots.txt`, OG 이미지 파일을 repository에 commit하지 않는다.
- 발행 글의 필수 metadata가 일부 부족한 경우에는 가능한 fallback을 사용하되, SEO 점수와 발행 차단
  판단은 별도 SEO engine feature의 책임으로 둔다.
- Analytics MVP와 외부 콘솔 링크는 다음 phase에서 별도 명세로 다룬다.
- 사이트는 단일 언어/단일 운영자 블로그이며 다국어 alternate URL, 다중 작성자 권한, 예약 발행 산출물은
  MVP 범위에 포함하지 않는다.

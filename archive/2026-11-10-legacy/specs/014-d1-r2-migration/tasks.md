# Tasks: d1-r2-migration

**Input**: Design documents from `/specs/014-d1-r2-migration/`

**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 마이그레이션 실행에 필요한 기반을 구성한다.

- [x] T001 `scripts/migration/d1-schema.sql`에
      posts/tags/categories/post_tags/media_refs/admins/migration_runs 스키마 DDL 초안 작성
- [x] T002 `scripts/migration/schema-map.md`에 D1 타입 매핑 규칙( TEXT/INTEGER/TEXT 기준) 문서화
- [x] T002a `scripts/migration/schema-map.md`에 category depth/parent 제약(최대 2단계) 매핑 규칙
      문서화
- [x] T003 `scripts/migration/.env.example`에 D1 DB ID, D1 API token, R2 bucket, R2 공개 URL, legacy
      fallback switch 변수 정의
- [x] T004 `package.json`에 migration 실행 스크립트 추가 (`migrate:extract`, `migrate:dry-run`,
      `migrate:verify`, `migrate:run`)
- [x] [P] T005 `scripts/migration/` 하위 폴더(`run-migration.ts`, `verify-migration.ts`,
      `dry-run.ts`, `report.ts`) 생성

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리의 시작 전에 완료해야 하는 공통 기반 구축

- [x] T006 `apps/cms/lib/content-adapter/content-adapter.interface.ts`에 공통
      인터페이스(목록/상세/태그/CRUD/미디어 참조) 정형화
- [x] [P] T007 `apps/cms/lib/content-adapter/types.ts`에 Post, Tag, Category, PostTag,
      MediaReference, Admin, MigrationRun 타입을 도메인 타입으로 정리
- [x] T008 `apps/cms/lib/content-adapter/local-adapter.ts`를 legacy 유지 로직(기존 GitHub 기반)로
      정리 및 adapter 선택 가드 분리
- [x] [P] T009 `apps/blog/lib/content-source.ts`에 현재 데이터 소스 모드 분기용 진입점 토글 형태
      추가
- [x] T010 `apps/blog/lib/content-source.ts` 및 `apps/cms/lib/content-adapter/content-adapter.ts`에
      공통 실패 코드(`validation-failure`, `auth-required`, `forbidden`, `not-found`, `conflict`,
      `upstream-failure`, `storage-failure`, `retryable-failure`) 반환 규격 적용
- [x] [P] T011 `apps/cms/lib/content-adapter/d1-r2-adapter.ts` 생성: D1 조회/저장 최소 인터페이스
      stub + 에러 매핑
- [x] [P] T012 `apps/blog/lib/content.ts`에 slug 기반 공개 목록/상세 필터링 계약 재확인
- [x] T013 `scripts/migration/run-migration.ts`에서 `contentSourceMode` 초기값을 `legacy`로 고정하는
      기본 런타임 switch 코드 추가
- [x] T014 `apps/cms/lib/admin-ops/migration-switch.ts`에서 롤백 대상 모드(`legacy`, `d1r2`) 상태
      모델 정의
- [x] [P] T015 `apps/cms/lib/admin-ops/rollback.ts`에 롤백 실행 진입점 및 감사 로그 포맷 정의

## Phase 3: User Story 1 - 기존 공개 게시글이 그대로 노출됨 (Priority: P1) 🎯 MVP

**Goal**: D1 기반 조회로 전환해도 기존 slug 기반 공개 페이지가 동일하게 동작한다.

**Independent Test**: 기존 slug 5개 공개 글 조회에서 제목·본문·발행일·썸네일이 기존과 동일하게
보이며 초안/보관은 비노출.

- [x] T016 [US1] `apps/cms/lib/migration/import-to-d1.ts`에서
      category/post/category_id/tag/post_tags 적재 순서 구현(카테고리→태그→글→연결)
- [x] [P] T017 [US1] `apps/cms/lib/migration/import-to-d1.ts`에 Post 마이그레이션
      insert/update/idempotent 처리 추가
- [x] T018 [US1] `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에
      `listPosts`/`getPostBySlug`/`getPostsByTag`/`getPostsByCategoryPath` D1 SQL 구현
- [x] T019 [US1] `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에 published filter + slug 정합성
      정렬 추가
- [x] T020 [US1] `apps/blog/lib/content-source.ts`에 D1 읽기 모드 시
      `contentAdapter.listPosts/getPostBySlug/getPostsByTag/getPostsByCategoryPath` 연결
- [x] [P] T021 [US1] `apps/blog/lib/content-source.ts`에 legacy 모드 대비 응답 스키마 동등성 변환
      테스트 헬퍼 추가
- [x] T022 [US1] `apps/blog/app/posts/[slug]/page.tsx`에서 slug 라우팅 경로에서 새 읽기 adapter를
      사용하도록 교체
- [x] T023 [US1] `apps/blog/app/page.tsx` 공개 목록 렌더링에서 publishedOnly/slug sorting 조건을 D1
      경로에도 동일 적용
- [x] T024 [US1] `apps/blog/lib/content.ts`와 `apps/blog/lib/content-source.test.ts`에 dual-run 비교
      스니펫용 조회 일치성 유틸 추가
- [x] T025 [US1] `scripts/migration/verify-migration.ts`에서 sample 1건 shadow compare 로직
      구현(legacy vs d1r2)

## Phase 3.5: User Story 1.5 - 카테고리 페이지 조회 유지 (Priority: P1)

**Goal**: `/categories/[categoryPath]` 경로가 기존 링크/탐색 흐름과 동일하게 동작한다.

- [x] T057 [US1.5] `apps/cms/lib/migration/extract-from-supabase.ts`에 카테고리/부모 카테고리 추출
      및 depth 1/2 정규화 로직 추가
- [x] [P] T058 [US1.5] `apps/cms/lib/migration/import-to-d1.ts`에 category 별칭(`depth1`,
      `depth1/depth2`) 매핑 및 post.category_id 반영
- [x] T059 [US1.5] `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에 카테고리 경로
      조회(`getPostsByCategoryPath`) 쿼리와 depth 초과 검증 추가
- [x] T060 [US1.5] `apps/blog/lib/content-source.ts`와 공개
      라우팅(`/categories/[...categoryPath]`)에 category filter 계약 연결

## Phase 4: User Story 2 - 본문 이미지/썸네일 노출 연속성

**Goal**: Supabase 이미지 링크를 R2 키로 치환해 썸네일·본문·OG 노출이 끊기지 않음.

**Independent Test**: 대상 글 3개 기준 본문 이미지 10개 이상에서 깨진 이미지 링크가 없고,
미리보기/OG가 정상 노출됨.

- [x] T026 [US2] `apps/cms/lib/migration/map-media.ts`에 Supabase URL 패턴 추출 및 치환표 생성 로직
      구현
- [x] [P] T027 [US2] `scripts/migration/upload-media-to-r2.ts`에 R2 업로드 및
      `blog/{YYYY}/{MM}/{slug}/{uuid}.webp` 키 생성 구현
- [x] T028 [US2] `scripts/migration/upload-media-to-r2.ts`에 업로드 실패 재시도(지수 backoff + 최대
      재시도) 구현
- [x] T029 [US2] `apps/cms/lib/migration/map-media.ts`에 kind별 정책(`hero`, `body`, `og`, `pdf`)
      적용
- [x] [P] T030 [US2] `apps/cms/lib/migration/extract-from-supabase.ts`에서 글 본문 HTML/MDX URL 치환
      대상을 추출하는 파서 보강
- [x] T031 [US2] `apps/cms/lib/migration/import-to-d1.ts`에 `media_refs` insert 전치리(키 유효성
      검증, 중복 키 충돌 처리)
- [x] T032 [US2] `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에 글 조회 시 media_refs를 집계해
      `hero`/본문 참조를 반환
- [x] [P] T033 [US2] `apps/blog/app/posts/[slug]/page.tsx`와 `apps/blog/app/og/[slug]/route.ts`의
      이미지 URL 렌더링에서 r2_url 노출 경로 우선순위 적용
- [x] T034 [US2] `apps/cms/lib/migration/import-to-d1.ts`에서 media refs 매핑 실패 항목을 migration
      report JSON에 기록
- [x] T035 [US2] `scripts/migration/report.ts`에 이미지 치환 실패 목록, 재시도 큐, 성공률 집계 출력
      추가

## Phase 5: User Story 3 - 관리자 글 편집 플로우 유지 (Priority: P2)

**Goal**: 기존 CMS 화면/경로를 유지한 채 글 생성·수정·삭제가 새 백엔드로 작동.

**Independent Test**: 글 1건을 작성/수정/삭제 후 목록과 상세 반영이 즉시 일치함.

- [x] T036 [US3] `apps/cms/lib/content-adapter/github-fallback-adapter.ts`에서 기존 동작 정합성
      기준을 유지한 하위호환 가드 정리
- [x] T037 [US3] `apps/cms/lib/content-adapter/content-adapter.ts`에 contentSourceMode 기반
      라우팅(`legacy`/`d1r2`) 구현
- [x] [P] T038 [US3] `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에
      `createPost`/`updatePost`/`deletePost` 구현
- [x] T039 [US3] `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에 `upsertMediaRef`/`deleteMediaRef`
      구현 및 postId 정합성 검사 추가
- [x] [P] T040 [US3] `apps/cms/app/actions/editor-actions.ts`에서 adapter 생성/주입을 content-source
      모드 기반으로 전환
- [x] T041 [US3] `apps/cms/app/actions/editor-actions.ts`의 slug 중복/형식 검증 규칙을 새 저장소에도
      동일 적용
- [x] [P] T042 [US3] `apps/cms/components/editor-screen.tsx`에서 글 저장 성공 시 새 adapter 응답으로
      canonical slug/updatedAt 표시
- [x] T043 [US3] `apps/cms/components/editor-screen.tsx`에 게시글 수정/삭제 후 목록 반영 경로를
      adapter 결과를 이용해 즉시 갱신
- [x] T044 [US3] `apps/cms/lib/editor-ops/media-file.ts`(또는 기존 유사 파일)에서 본문/썸네일 교체
      시 이전 미디어 보존 정책 명시

## Phase 6: User Story 4 - 신속 롤백 가능성 확보 (Priority: P3)

**Goal**: 장애 발생 시 1분 내 legacy 모드 복귀가 가능하고, 이중 보관·모니터링이 유지됨.

**Independent Test**: `contentSourceMode`를 legacy로 회귀 전환해 1분 이내 공개 조회가 정상 동작함.

- [x] T045 [US4] `apps/cms/lib/admin-ops/migration-switch.ts`에 런타임 환경변수 기반 모드 전환
      API/헬퍼 구현
- [x] T046 [US4] `apps/cms/lib/admin-ops/rollout-checks.ts`에 dual-run 활성화, 조회 일치율, 이미지
      노출율 임계치 계산 로직 추가
- [x] [P] T047 [US4] `apps/cms/lib/admin-ops/rollback.ts`에 자동 롤백 트리거와 알림 대상 기록 포맷
      구현
- [x] [P] T048 [US4] `scripts/migration/verify-migration.ts`에 rollback 전환 전후 비교 리포트 생성
      및 저장 처리
- [x] T049 [US4] `scripts/migration/run-migration.ts`에 상태 기계(`stable-legacy`, `shadow-compare`,
      `active-new`, `rollback`, `stabilized`) 반영
- [x] T050 [US4] `apps/cms/lib/migration/runbook.ts`에 7일 이중 보관 기간 정책 및 재동기화 메모 저장
- [x] T051 [US4] `scripts/migration/report.ts`에 일일 모니터링 요약(`rows_read`, 이미지 노출률,
      500율, 이중조회 차이율) 생성

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: 릴리즈 전 신뢰도를 높이는 마무리 작업

- [x] T052 [P] `scripts/migration/dry-run.ts`로 샘플 1건 dry-run 스크립트 실행 가이드 정리
- [x] T053 [P] `scripts/migration/verify-migration.ts`로 7일 모니터링용 샘플 리포트 템플릿 생성
- [x] T054 `specs/014-d1-r2-migration/quickstart.md` 실행 명령/예상값/실패 대응 지침 갱신
- [x] T055 `scripts/migration/run-migration.ts`에 재시작 가능한 실패 항목 재로드 큐 및 checkpoint
      기록 추가
- [x] T056 [P] `specs/014-d1-r2-migration/checklists/requirements.md`의 운영 체크 항목 상태 최신화

## Workload Estimate (실측 목적)

- 총 1인 기준 소요 예상: **3.5~4일** (우선순위 작업만 완료), **5~6일** (폴리싱 + 릴리즈 검증 포함)
- 병렬 투입(2인 이상) 또는 API/UI 작업 분할 시: **3~4일**
- API 기준 정밀화(응답시간/타임아웃/재시도/임계치 체크) 반영 시간: **0.5일**
- 추천 일일 투입 스케줄: 1일차(Phase 1~~2 + US1 기반), 2일차(US1/US1.5 완료), 3일차(US2/US3 병렬),
  4일차(US4/Final), 5~~6일차(지표 튜닝 및 이슈 정리)

## 추천 일정 (1인 기준, 월~금)

- **Day 1**
  - `T001~T015` Phase 0~2 기반 인프라/스위치/타입/어댑터 골격 구축
  - API 규격 점검: `listPosts/getPostBySlug/getPostsByTag` timeout/타임아웃 fallback 처리 정합성
    확인
  - 실패 대응 템플릿: 실패 코드 분류(`validation-failure`/`upstream-failure`/`retryable-failure`)
    정렬
- **Day 2**
  - US1 + US1.5: `T016~T025`, `T057~T060` 전개
  - 카테고리 1차/2차 조회 경로(최대 2단계) 및 slug 라우트의 목록 정합성 검증
  - SLO 게이팅: `listPosts` p95 600ms, `getPostBySlug` p95 500ms 샘플 측정
- **Day 3**
  - US2 + US3 병렬: `T026~T035`, `T036~T044`
  - write API 성능 점검: `create/update/delete/upsertMediaRef` p95 및 timeout(1.2~2.0초) 기준 검증
  - 업로드 재시도/키 충돌 대응, 이미지 치환 실패 큐 정합성 확인
- **Day 4**
  - US4 + Final: `T045~T056`
  - 롤백 시나리오 점검(1분 복구), 1일치 모니터링 리포트 파이프라인 마감
  - 이중조회 비교 오차율/이미지 노출율/카테고리 페이지 일치율 임계치 점검
- **Day 5~6 (버퍼)**
  - 실패 항목 정리, 예외 입력 데이터 보정, 문서/체크리스트 동기화
  - API 회귀 테스트 결과 기준 병합 및 최종 승인 기준 충족 확인

### 병렬 시나리오(2~3인)

- Day 1: Phase 0~2 + 마이그레이션 추출/로더 병렬 분담
- Day 2: US1 + US1.5 병렬 완료, `US2-이미지` 1개 트랙, `US4-롤백` 1개 트랙 동시 진행
- Day 3: 성능 측정 스탠드업 실행 후 미해결 이슈만 집중 정리

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: 즉시 시작 가능 (Setup)
- **Phase 2**: Phase 1 완료 후 진행 (모든 Story의 선행 조건)
- **Phase 3~6**: Phase 2 완료 후 시작 (Story별 독립적으로 진행 가능하나 우선순위 권장)
- **Final**: Phase 3~6 완료 후 진행

### User Story Dependencies

- **US1**: Phase 2 완료 후 바로 시작 가능 (MVP)
- **US2**: US1 이후 권장(이미지 치환 검증을 위해 게시글 기본 조회 경로 안정화가 바람직)
- **US3**: US1 이후 권장(CMS write path는 공개 경로와 동일 데이터 계약 의존)
- **US4**: US1/US2 완료 후 권장(롤백 대상 모니터링은 조회/미디어 경로 정상화 기반)
- **US1.5**: US1 + T058 완료 후 우선 수행, 카테고리 경로 조회 안정화 이후 US2 병행 가시화

## Parallel Opportunities

- Phase 1: T003, T005는 병렬 가능
- Phase 2: T007, T009, T011, T012, T015는 병렬 가능
- US1: T017와 T020, T022는 병렬 의존성 검토 후 병렬 가능
- US2: T027, T030, T033은 병렬 가능
- US3: T038, T040, T042는 병렬 가능
- US4: T047, T048, T051은 병렬 가능
- US1.5: T057, T058, T060은 병렬 검토 후 병렬 가능

## Implementation Strategy (MVP)

1. Phase 1 + Phase 2 완료
2. **US1만** 완료 후 독립 검증(샘플 slug 공개 노출 확인)
3. 정합 확인 후 US1.5를 먼저 수행해 카테고리 페이지 경로 정합성 확보
4. 정합 확인 후 US2 또는 US3 병렬 착수
5. 전체 기능 정착 후 US4 및 Final 단계 적용

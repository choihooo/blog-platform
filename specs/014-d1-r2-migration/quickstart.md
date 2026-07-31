# Quickstart: d1-r2-migration

## Prerequisites

- `pnpm install` 실행 완료
- Supabase 프로젝트 접근 키를 갖춘 읽기 전용 추출 계정
- D1, R2 데이터베이스/버킷 생성 완료
- 마이그레이션 runbook에 사용할 작업 계정의 관리자 권한
- 기존 블로그 feature spec와 plan 산출물 확인 완료

## 1. 사전 점검

1. CMS와 blog의 현재 글/태그 API 조회가 정상인지 확인한다.
2. Supabase에서 대상 글, 태그, `categories`(1차/2차), `post_tag`, 미디어 메타를 추출 가능한지
   점검한다.
3. 기존 공개 링크에서 이미지 URL 패턴과 카테고리 경로(`depth1`/`depth1/depth2`)를 샘플링해 R2/ D1
   이동 규칙을 적용할 수 있는지 검토한다.
4. R2 버킷 접근 권한과 CORS/폴더 규칙을 확인한다.

Expected:

- 현재 조회가 실패 없이 동작한다.
- 추출 스키마에 slug/본문 링크가 1개 이상 확인된다.
- 버킷/키 정책으로 업로드 실패가 예상되지 않는다.

## 2. Dry Run (샘플 대상)

1. 샘플 1개 글을 골라 migration dry-run을 실행한다.
2. `posts`, `tags`, `categories`, `post_tag`, `media_refs` 적재 순서를 시뮬레이션한다.
3. Supabase URL을 임시 R2 키로 치환하고, 치환 실패 레코드를 출력한다.
4. 카테고리 매핑(최대 2단계)과 `categoryPath`(`depth1/depth2`) 치환 규칙을 검증한다.

예시:

```bash
MIGRATION_SAMPLE_SLUG=sample-post \
MIGRATION_RUNBOOK_ID=runbook-dry \
CONTENT_SOURCE_MODE=legacy \
DRY_RUN=1 \
pnpm migrate:dry-run
```

Expected:

- 적재 순서가 로그에 그대로 남는다.
- 치환 실패 항목이 있으면 재시도 큐에 기록된다.
- 게시글 본문에 치환 대상 URL 목록이 누락되지 않았다.

## 3. 본 이관 Dry-Verified (이중 조회)

1. full migration을 실행해 본문+태그+미디어 참조까지 D1/R2에 반영한다.
2. 전환 플래그 없이 dual-run 검증 모드로 1개 샘플 글을 동시 조회한다.
3. 글 제목, 내용, slug, 이미지 URL, 태그, 카테고리 경로, 노출 상태를 기존 시스템과 비교한다.

Expected:

- 샘플 글 1건 기준 응답 속성의 주요 누락이 없다.
- 이미지 노출 항목이 100% 또는 사전 승인된 예외 범위 이내다.
- 롤백 트리거 조건이 있을 경우 즉시 감지된다.

예시:

```bash
MIGRATION_SAMPLE_SLUG=sample-post \
MIGRATION_RUNBOOK_ID=runbook-verify \
CONTENT_SOURCE_MODE=legacy \
MIGRATION_REPORT_FILE=./scripts/migration/verify-report.json \
pnpm migrate:verify > scripts/migration/verify-output.json
```

## 4. 관리자 동작 검증

1. CMS에서 새 글을 생성하고 썸네일을 업로드한다.
2. 글을 저장·수정·삭제한다.
3. 새 소스로 읽기 기능을 활성화하고 결과를 조회한다.

Expected:

- 관리자 인터페이스가 기존 흐름에서 크게 바뀌지 않는다.
- D1/R2 기반으로도 저장/조회/수정/삭제가 수행된다.
- `hero`/본문 이미지가 공개 URL에 정상 반영된다.

## 5. 안정화 및 롤백 점검

1. 전환 플래그를 켠 상태로 7일 운영 모니터링 규칙을 시작한다.
2. 조회 일치율과 이미지 노출율을 1일 단위로 기록한다.
3. 카테고리 페이지(`/categories/...`) 일치율을 별도 지표로 기록한다.
4. 이슈 발생 시 롤백 플래그로 이전 모드로 1분 내 복귀 훈련을 수행한다.

Expected:

- 7일 모니터링 기간 동안 major 장애가 재발하지 않는다.
- 롤백 후 기능이 복구된다.
- 기존 모드와 신규 모드에서 공개 글 응답 차이가 허용치 내에 있다.

## 6. API SLO 점검 (optional, 권장)

1. 샘플 100~200회 조회를 기반으로 p95를 계산한다.
2. API 타임아웃/재시도 표와 비교한다.
3. `retryable-failure` 비중과 재시도 3회 이내 회복 비율을 계산한다.

Expected:

- `listPosts` p95 600ms 이하, `getPostBySlug` p95 500ms 이하,
  `getPostsByTag`/`getPostsByCategoryPath` p95 700ms 이하.
- read timeout 2.5초, write timeout 5초, upload timeout 15초 준수.
- `retryable-failure` 5% 초과 시 대응 티켓 등록.

## Full Validation

```bash
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm typecheck
pnpm lint
```

## Validation Results

- 2026-07-31 기준으로 실제 실행 결과는 migration runbook 수행 후 본 스펙의 tasks 단계에서 기록한다.

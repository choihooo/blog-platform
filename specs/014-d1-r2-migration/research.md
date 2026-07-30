# Research: D1 + R2 Migration

## Decision: D1를 기본 SQL 저장소로 채택하고 타입 변환 정책은 명시 스키마로 고정한다

**Rationale**: 글/태그/관계형 메타데이터는 정합성과 정렬/필터 요건이 크다. D1는 SQLite 계열이라도
기존 Supabase PostgreSQL 구조를 그대로 쓰지 못하므로, 키/시간/불리언/정수/텍스트를 정규화해
명시적 스키마 변환이 필요하다. `published_at`, `updated_at`은 ISO8601 텍스트로 유지하고,
`is_published`는 `INTEGER`(0/1)로 고정한다.

**Alternatives considered**:

- PostgreSQL 호환 레이어 사용: 구조 전환 이점이 크지 않고 마이그레이션 단계를 길게 만든다.
- 파일 기반 index DB 유지: 검색/필터/조인 성능 요구를 충족하기 어렵다.

## Decision: R2 키를 `blog/{YYYY}/{MM}/{slug}/{uuid}.webp`로 고정한다

**Rationale**: 월 단위 파티션은 운영 정합성 점검과 비용 모니터링이 쉽고, 글/월 단위로 정리되어
삭제/교체/교차 참조가 명확하다. 파일명은 변경 이력 보존을 위해 `uuid` 기반을 사용한다.

**Alternatives considered**:

- 날짜만 포함하는 단일 평면 폴더: 검색은 쉬우나 정합성 추적이 어렵다.
- slug 없이 hash 중심 경로: 운영자가 URL 맥락으로 미디어를 추적하기 어렵다.

## Decision: 마이그레이션은 `dry-run -> sample dual-run -> full migration` 3단계로 수행한다

**Rationale**: 사용량이 낮은 블로그라도 게시글 1건 미루어 본 정합성 오차가 그대로 누적되기 때문에,
완전 전환 전 동시 조회 검증이 필요하다.

**Alternatives considered**:

- 직접 full migration 즉시 전환: 실패 시 rollback은 가능해도 정합성 근거가 부족해 운영 판단 리스크가 높다.
- dual-run 없이 샘플 교차 비교: 실 사용량 분포와 에지 케이스를 놓친다.

## Decision: 이미지 치환은 URL 치환표를 생성하고 정합성 검사 로그를 먼저 산출한다

**Rationale**: 본문 이미지 URL은 Supabase 도메인/패턴이 혼합될 가능성이 높고, 누락 건을
빠르게 탐지하려면 `supabase_url -> r2_key` 매핑표가 필요하다. 치환 실패 항목은 재처리 큐에 넣어
재업로드+재치환하도록 한다.

**Alternatives considered**:

- 요청 시점 on-the-fly 치환: 성능과 추적성 모두 저하되고 오동작 시 원인 역추적이 어렵다.
- 치환 없이 링크 유지: 링크 노후화로 공개 깨짐이 발생한다.

## Decision: 카테고리는 1차/2차 depth로 고정한다

**Rationale**: 글 중심 운영에서 카테고리 분류의 가독성과 라우팅 단순성이 중요하다. 2단계(depth1, depth1/depth2)로
제한하면 계층 규칙이 명확해지고, D1 쿼리 비용/조인 복잡도를 낮출 수 있다.  
마이그레이션 대상 데이터에 3단계 이상이 존재하면 별도 보정 이슈로 기록하고, 운영 스키마에 맞춰
부모-자식 재매핑 또는 정정 후 적재한다.

**Alternatives considered**:

- 무제한 depth: 유연성은 있으나 경로/정렬 로직이 깊어져 정합성 검증 비용이 증가한다.
- 1단계만 허용: 분류 분해능이 떨어져 카테고리 기반 탐색 유틸리티가 퇴색한다.

## Decision: 롤백은 환경 변수 기반 라우팅/스위치로 처리한다

**Rationale**: 새 경로 실패 시 1분 내로 기존 데이터 소스 복귀가 요구된다. 코드 변경 없이 동작
하게 하려면 운영 환경에서 switch 플래그를 중심으로 처리해야 한다.

**Alternatives considered**:

- 완전 분기 코드 배포: 롤백이 느려지고, 장애 전파 범위를 줄이기 어렵다.
- 2중 배포 운영: 비용이 증가하고 변경 관리가 복잡해진다.

## Decision: 통계 모니터링은 `조회 일치율`, `이미지 노출율`, `클래스별 처리량` 3축으로 최소화한다

**Rationale**: 블로그 특성상 댓글·검색 같은 이벤트는 부재하므로 핵심 품질 신호는 단순하고
가시적으로 해석 가능해야 한다.

**Alternatives considered**:

- 모든 지표 수집: 비용과 운영 신호 과부하가 발생한다.
- 단일 API 성공률만 사용: 이미지 손상 같은 핵심 품질 이슈를 놓친다.

# Research: Security Hardening

## Decision: Reuse existing CMS admin identity guard and harden mutation edges

**Rationale**: `apps/cms/lib/auth`는 이미 `adminGithubLogin`과 `adminGithubUserId`를 함께 검증하는
guard와 protected content operation wrapper를 제공한다. 새 인증 체계를 만들지 않고 모든 mutation
entrypoint가 이 wrapper를 거치는지 보강하는 편이 가장 작고 안전하다.

**Alternatives considered**: 별도 permission service 도입. 기각 이유는 단일 운영자 MVP에는 과하고
다중 관리자/승인 workflow 범위로 번진다.

## Decision: GitHub App credential readiness is validated before adapter use

**Rationale**: 기존 GitHub adapter는 token 문자열을 입력받아 Contents API를 호출한다. Security
hardening은 여기에 GitHub App installation token 준비 상태를 별도 helper로 추가하고, 누락/권한
부족/HTTP 실패를 secret-safe repository failure로 정규화한다. 이렇게 하면 adapter contract를 크게
바꾸지 않고 최소 권한 경계를 추가할 수 있다.

**Alternatives considered**: OAuth user access token으로 write 수행. 기각 이유는 CMS write 권한과
GitHub App 권한 제한 목표가 흐려지고 장기 노출 credential 관리가 어려워진다.

## Decision: Preview token is stateless HMAC with fixed 30 minute TTL

**Rationale**: 헌법은 30분 TTL의 stateless HMAC preview token을 요구한다. Payload에는 slug, exp,
contentSha, nonce를 넣고 서버에서 서명/검증한다. DB 저장 없이 token 자체와 현재 content
identifier만으로 만료와 stale content를 판정할 수 있다.

**Alternatives considered**: 서버 저장 preview session. 기각 이유는 별도 DB/스토리지와 cleanup
정책이 필요해 MVP 범위를 벗어난다.

## Decision: Preview route is isolated under `/preview/[slug]` with private no-store

**Rationale**: 이미 robots/generated output 계약은 `/preview`를 public indexing에서 제외한다. 별도
preview route를 두면 public post route의 published-only 경계를 건드리지 않고 draft preview 예외를
다룰 수 있다. 응답은 항상 private no-store 캐시 정책을 포함해야 한다.

**Alternatives considered**: `/posts/[slug]?preview=...`에 예외 추가. 기각 이유는 public route의
published-only 보장과 analytics/generated output 경계를 복잡하게 만든다.

## Decision: Secret exposure guard is string redaction plus boundary tests

**Rationale**: 실제 secret 노출 방지는 "client로 보내지 않기"가 1차이고, 오류 메시지/loggable
failure에는 known secret-like 값을 redaction하는 작은 helper로 충분하다. 테스트는 UI 메시지,
repository failure, analytics/generated output에 secret raw value가 없는지 확인한다.

**Alternatives considered**: 전역 logging framework 도입. 기각 이유는 현재 앱에 logging
infrastructure가 없고 MVP 보안 요구를 해결하기보다 surface만 늘린다.

## Decision: MDX safety policy is reused for preview

**Rationale**: `packages/markdown`의 MDX safety validation은 public rendering과 CMS preview가
공유하는 보안 정책이다. Draft preview도 같은 분석/렌더링 경로를 사용해 unsafe HTML, script, event
handler, unsupported component를 차단해야 drift가 없다.

**Alternatives considered**: preview route에서 별도 sanitizer 구현. 기각 이유는 중복 보안 정책이
생기고 public rendering과 preview 결과가 달라질 수 있다.

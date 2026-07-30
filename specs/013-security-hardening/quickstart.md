# Quickstart: Security Hardening

## Prerequisites

- `pnpm install` 완료
- `content/site.json`에 `adminGithubLogin`, `adminGithubUserId` 설정
- local validation용 GitHub App 환경변수 fixture 준비
- preview validation용 `PREVIEW_TOKEN_SECRET` 설정

## Validation Commands

```sh
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test

pnpm --filter @blog-platform/blog typecheck
pnpm --filter @blog-platform/blog lint
pnpm --filter @blog-platform/blog test

pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown test
```

## Scenario 1: CMS mutation guard

1. 관리자 login과 user id가 모두 일치하는 session을 만든다.
2. login만 일치하는 session, user id만 일치하는 session, 미인증 상태를 만든다.
3. save/publish/archive/media/settings update mutation을 각각 실행한다.

Expected outcome:

- 관리자 session만 repository write operation을 실행한다.
- 비관리자와 미인증 상태는 repository write 전에 차단된다.
- failure message에 secret 원문이 없다.

## Scenario 2: GitHub write credential readiness

1. 필수 GitHub App 설정이 모두 있는 ready fixture를 검증한다.
2. `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID`, repository owner/repo/branch가 누락된 fixture를 각각
   검증한다.
3. unauthorized, rate limit, temporary failure 응답을 adapter failure로 정규화한다.

Expected outcome:

- ready 상태에서만 adapter가 write를 시도한다.
- 누락/권한 부족 상태에서 editor content는 보존 가능한 실패 상태로 남는다.
- token/private key/authorization header는 메시지에 포함되지 않는다.

## Scenario 3: Draft preview token

1. draft slug와 contentSha로 preview token을 발급한다.
2. 같은 slug와 contentSha로 30분 이내 검증한다.
3. 만료된 token, 다른 slug, 다른 contentSha, 잘못된 signature를 검증한다.

Expected outcome:

- valid token만 preview를 허용한다.
- expired, slug mismatch, stale content, invalid signature는 draft body를 노출하지 않는다.

## Scenario 4: Preview route boundary

1. `/preview/[slug]`에 valid token으로 접근한다.
2. invalid token과 token 없는 접근을 시도한다.
3. unsafe MDX fixture로 preview 렌더링을 시도한다.
4. RSS/Sitemap/JSON-LD/OG/analytics output에 preview content가 없는지 확인한다.

Expected outcome:

- valid preview response는 `Cache-Control: private, no-store`를 포함한다.
- invalid preview access는 draft body를 렌더링하지 않는다.
- unsafe MDX는 preview에서도 차단된다.
- public generated outputs와 analytics는 published-only 경계를 유지한다.

## Scenario 5: Secret exposure guard

1. known secret-like fixture 값을 GitHub token, private key, preview secret, session secret으로 준비한다.
2. UI failure message, repository failure, analytics payload, generated output 문자열을 검사한다.

Expected outcome:

- secret raw value가 public/client-facing 문자열에 포함되는 사례가 0건이다.

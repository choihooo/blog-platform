# Data Model: Security Hardening

## AdminIdentity

CMS mutation을 허용할 단일 GitHub 관리자 identity.

### Fields

- `githubLogin`: GitHub login 문자열.
- `githubUserId`: GitHub immutable user id 문자열.
- `sourcePath`: identity가 로드된 설정 파일 경로.

### Validation Rules

- `githubLogin`과 `githubUserId`가 모두 설정되어야 한다.
- placeholder 값은 misconfigured 상태로 취급한다.
- session의 login과 user id가 모두 일치해야 authorized 상태다.
- 둘 중 하나만 일치하면 forbidden 상태다.

## MutationAccessDecision

CMS mutation 수행 여부를 결정하는 접근 결과.

### Fields

- `status`: `authorized`, `unauthenticated`, `expired`, `forbidden`, `misconfigured`.
- `reason`: 사용자에게 보여줄 secret-free 설명.
- `session`: authorized 상태일 때의 관리자 session 요약.

### Validation Rules

- `authorized`가 아니면 repository write operation을 실행하지 않는다.
- 실패 reason은 OAuth secret, GitHub token, App private key, preview secret 값을 포함하면 안 된다.
- retryable 여부는 unauthenticated/expired와 config/forbidden을 구분해야 한다.

## GitHubWriteCredentialState

Repository write에 필요한 GitHub App 설정과 installation token 준비 상태.

### Fields

- `status`: `ready`, `missing-config`, `invalid-config`, `unauthorized`, `rate-limited`.
- `requiredVariables`: 필요한 runtime setting 이름 목록.
- `message`: secret-free 실패 메시지.
- `tokenExpiresAt`: ready 상태의 token 만료 시각.

### Validation Rules

- `ready`가 아니면 GitHub write adapter를 생성하지 않는다.
- message는 secret 원문이나 private key 내용을 포함하지 않는다.
- 필요한 권한 범위는 contents write와 metadata read에 한정한다.
- missing/invalid/unauthorized 상태에서도 제출된 editor content는 보존 가능한 실패 상태에 포함되어야 한다.

## PreviewTokenPayload

Draft preview 접근을 증명하는 signed token payload.

### Fields

- `slug`: preview 대상 글 slug.
- `exp`: 만료 시각.
- `contentSha`: token 생성 시점의 content identifier.
- `nonce`: replay와 token uniqueness를 위한 무작위 값.

### Validation Rules

- `exp`는 발급 시점부터 30분 이하여야 한다.
- 현재 시각이 `exp` 이후이면 token은 invalid다.
- 요청 slug와 payload slug가 다르면 invalid다.
- 현재 content identifier와 payload contentSha가 다르면 invalid다.
- nonce는 비어 있으면 invalid다.

## PreviewRequest

Public blog preview route에서 처리하는 접근 요청.

### Fields

- `requestedSlug`: URL path의 slug.
- `token`: signed preview token.
- `currentContentSha`: 현재 repository content identifier.
- `renderableContent`: 안전성 검증을 통과한 draft content.

### State Transitions

- `missing-token` → 404 또는 access denied 상태.
- `invalid-token` → draft content 미노출.
- `expired-token` → draft content 미노출.
- `stale-content` → draft content 미노출.
- `valid` → private no-store 응답으로 preview content 렌더링.

## SecretExposureSurface

Secret이 노출되면 안 되는 출력 표면.

### Fields

- `surface`: `client-bundle`, `ui-message`, `repository-error`, `analytics-payload`,
  `generated-output`, `content-file`.
- `rawValue`: 검사 대상 secret-like 문자열.
- `redactedValue`: 노출 가능한 대체 문자열.

### Validation Rules

- `NEXT_PUBLIC_`이 아닌 runtime secret은 client bundle에 포함하지 않는다.
- UI와 repository failure message는 secret raw value를 포함하지 않는다.
- analytics payload와 generated output은 GitHub token, private key, preview secret, session secret을 포함하지
  않는다.

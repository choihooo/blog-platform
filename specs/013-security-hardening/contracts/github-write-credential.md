# Contract: GitHub Write Credential

## Purpose

CMS가 GitHub repository에 최소 권한으로 콘텐츠를 쓰기 위한 credential readiness와 failure normalization 계약이다.

## Required Runtime Settings

```txt
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_INSTALLATION_ID
GITHUB_OWNER
GITHUB_REPO
GITHUB_BRANCH
```

## Credential State

```ts
type GitHubWriteCredentialState =
  | { status: "ready"; token: string; tokenExpiresAt: string }
  | {
      status: "missing-config" | "invalid-config" | "unauthorized" | "rate-limited";
      requiredVariables: string[];
      message: string;
    };
```

## Rules

- `ready` 상태에서만 GitHub content adapter를 생성한다.
- GitHub App 권한은 repository contents read/write와 metadata read에 한정한다.
- missing/invalid/unauthorized 상태는 secret-free repository failure로 변환한다.
- `message`에는 private key, token, raw secret, request authorization header가 포함되면 안 된다.
- GitHub HTTP 401/403/429/5xx 실패는 기존 repository failure code로 정규화되어야 한다.

## Acceptance

- 필수 설정 누락 시 adapter creation이 실패하고 editor content는 보존된다.
- 권한 부족 시 unauthorized failure가 표시되며 secret 원문은 노출되지 않는다.
- rate limit은 retryable failure로 유지된다.

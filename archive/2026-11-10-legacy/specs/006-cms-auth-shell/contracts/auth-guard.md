# Contract: CMS Auth Guard

## Purpose

CMS route, page, and mutation code가 같은 관리자 검증 규칙을 사용하도록 하는 내부 contract다. 모든
보호 판단은 GitHub session identity와 `content/site.json`의 관리자 identity를 비교한다.

## Admin Identity Source

Required site config fields:

```ts
type AdminIdentity = {
  githubLogin: string;
  githubUserId: string;
};
```

Mapping:

- `githubLogin` comes from `content/site.json.adminGithubLogin`
- `githubUserId` comes from `content/site.json.adminGithubUserId`

## Session Shape

```ts
type CmsSession = {
  githubLogin: string;
  githubUserId: string;
  displayName?: string;
  avatarUrl?: string;
  expiresAt: string;
};
```

## Access Decision

```ts
type AccessDecision =
  | {
      status: "authorized";
      session: CmsSession;
      adminIdentity: AdminIdentity;
      nextAction: "continue";
    }
  | {
      status: "unauthenticated" | "forbidden" | "misconfigured" | "expired";
      reason: string;
      session?: CmsSession;
      adminIdentity?: AdminIdentity;
      nextAction: "sign-in" | "sign-out-and-retry" | "fix-site-config" | "retry";
    };
```

## Decision Rules

- Return `authorized` only when `session.githubLogin === adminIdentity.githubLogin` and
  `session.githubUserId === adminIdentity.githubUserId`.
- Return `unauthenticated` when no session exists.
- Return `expired` when the session is no longer valid.
- Return `misconfigured` when `content/site.json` cannot be read or admin fields are missing, empty,
  or placeholder-only.
- Return `forbidden` when a valid session exists but login or user id does not match.
- Never include raw OAuth secrets, repository credentials, or private content in the decision.

## Route Guard Behavior

- Anonymous access to CMS protected routes redirects to the login flow.
- Forbidden access renders an access-denied state without content list, draft body, site settings
  detail, or repository credential information.
- Misconfigured access renders a setup error state with the site config fields that must be fixed,
  but not the protected content.
- Authorized access renders the requested shell route.

## Mutation Guard Behavior

Mutation handlers or server actions must call the guard before content adapter operations. Future
CMS mutations must use `guardMutation` or `createProtectedContentOperations` at the server boundary
before invoking `createFile`, `updateFile`, `deleteFile`, `commitMedia`, or settings update
operations. Page-level access checks are not sufficient authorization for mutation handlers.

```ts
type GuardedMutationResult<TSuccess> =
  | { ok: true; value: TSuccess }
  | {
      ok: false;
      code: "auth-required" | "forbidden" | "auth-misconfigured" | "session-expired";
      message: string;
      retryable: boolean;
    };
```

Required mapping:

| Access status     | Mutation code        | Retryable | Repository change |
| ----------------- | -------------------- | --------- | ----------------- |
| `authorized`      | none                 | n/a       | allowed           |
| `unauthenticated` | `auth-required`      | Yes       | blocked           |
| `expired`         | `session-expired`    | Yes       | blocked           |
| `forbidden`       | `forbidden`          | No        | blocked           |
| `misconfigured`   | `auth-misconfigured` | No        | blocked           |

## Validation Scenarios

- Admin login and id both match: route access and mutation are allowed.
- Login matches but id differs: route access and mutation are denied.
- Id matches but login differs: route access and mutation are denied.
- No session: protected route redirects, mutation returns `auth-required`.
- Missing admin config: route and mutation both fail closed with `auth-misconfigured`.
- Expired session: route and mutation require re-authentication.

# Contract: CMS Mutation Security

## Purpose

`apps/cms`의 모든 repository write mutation이 단일 관리자 identity 검증을 통과한 뒤에만 실행되는
계약이다.

## Protected Operations

- draft create
- draft save
- publish
- unpublish
- archive
- media upload
- settings update

## Access Decision

```ts
type MutationAccessDecision =
  | { status: "authorized"; session: { githubLogin: string; githubUserId: string } }
  | {
      status: "unauthenticated" | "expired" | "forbidden" | "misconfigured";
      reason: string;
    };
```

## Rules

- `authorized`가 아니면 repository adapter operation을 호출하지 않는다.
- 관리자 권한은 GitHub login과 immutable user id가 모두 일치할 때만 인정한다.
- auth failure response는 submitted editor content를 보존 가능한 상태로 유지해야 한다.
- failure message는 OAuth secret, GitHub token, GitHub App private key, preview secret을 포함하지
  않는다.

## Acceptance

- 미인증 mutation은 repository write 전에 차단된다.
- login만 일치하거나 user id만 일치하는 session은 forbidden이다.
- misconfigured admin identity는 모든 mutation을 차단한다.
- protected operation 목록의 모든 entrypoint가 동일한 guard를 사용한다.

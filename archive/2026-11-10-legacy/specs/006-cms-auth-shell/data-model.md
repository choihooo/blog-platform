# Data Model: CMS Auth + Shell

## AdminIdentity

`content/site.json`에 저장된 CMS 관리자 기준 identity다.

**Fields**:

- `githubLogin`: 관리자 GitHub login. `adminGithubLogin`에서 읽는다.
- `githubUserId`: 관리자 immutable GitHub user id. `adminGithubUserId`에서 읽는다.
- `sourcePath`: 기준값을 읽은 repository-relative path. MVP에서는 `content/site.json`이다.

**Validation rules**:

- `githubLogin`은 비어 있으면 안 된다.
- `githubUserId`는 비어 있으면 안 되며 placeholder 값이면 운영 환경에서 유효한 관리자로 취급하지
  않는다.
- 기준값 중 하나라도 누락되거나 읽을 수 없으면 access decision은 fail-closed여야 한다.

## CmsSession

현재 로그인한 GitHub 사용자의 CMS 세션 표현이다.

**Fields**:

- `githubLogin`: OAuth profile에서 확인한 GitHub login.
- `githubUserId`: OAuth profile에서 확인한 immutable GitHub user id.
- `displayName`: CMS top bar에 표시할 사용자 이름.
- `avatarUrl`: CMS top bar에 표시할 GitHub avatar URL.
- `expiresAt`: 세션 만료 시각.

**Validation rules**:

- 관리자 검증에는 `githubLogin`과 `githubUserId`가 모두 필요하다.
- 만료되었거나 필수 identity field가 없는 세션은 authenticated 상태로 취급하지 않는다.
- UI 표시 field 누락은 접근 거부 사유가 아니지만, identity field 누락은 접근 거부 사유다.

## AccessDecision

CMS route 또는 mutation을 허용할지 판단한 결과다.

**Fields**:

- `status`: `authorized`, `unauthenticated`, `forbidden`, `misconfigured`, `expired`.
- `reason`: 운영자에게 표시하거나 로그로 남길 수 있는 짧은 이유.
- `session`: 검증에 사용한 `CmsSession`, 존재할 때만 포함한다.
- `adminIdentity`: 검증에 사용한 `AdminIdentity`, 읽기에 성공했을 때만 포함한다.
- `nextAction`: `sign-in`, `sign-out-and-retry`, `fix-site-config`, `retry`, `continue`.

**Validation rules**:

- `authorized`는 세션과 관리자 기준값의 login, user id가 모두 일치할 때만 가능하다.
- `unauthenticated`, `forbidden`, `misconfigured`, `expired` 상태에서는 content adapter mutation을
  호출하면 안 된다.
- `misconfigured`는 사이트 설정을 읽을 수 없거나 관리자 기준값이 불완전할 때 사용한다.

## GuardedMutationRequest

CMS가 repository 변경을 시도하기 전에 guard를 통과해야 하는 mutation 요청이다.

**Fields**:

- `operation`: `create-file`, `update-file`, `delete-file`, `commit-media`, `update-settings`.
- `path`: 변경 대상 repository-relative path.
- `submittedAt`: 요청 시각.
- `accessDecision`: 요청 직전에 평가한 `AccessDecision`.

**Validation rules**:

- `accessDecision.status`가 `authorized`가 아니면 mutation은 repository 변경 없이 거부되어야 한다.
- 거부된 mutation은 기존 content adapter 실패와 구분 가능한 인증/권한 실패 상태를 반환해야 한다.
- 요청 path와 payload validation은 authorized 이후에도 기존 adapter contract를 따라 수행한다.

## ShellNavigationItem

인증된 관리자가 CMS shell에서 사용할 수 있는 navigation 항목이다.

**Fields**:

- `id`: `posts`, `settings`, `account`.
- `label`: 사용자에게 표시되는 항목 이름.
- `href`: CMS 내부 경로.
- `state`: `active`, `available`, `disabled`.
- `reason`: `disabled`일 때 표시할 준비 상태 설명.

**Validation rules**:

- `posts`와 `settings`는 인증된 관리자에게 표시되어야 한다.
- 아직 구현되지 않은 editor, media upload, publish workflow는 실행 가능한 navigation 항목으로
  표시하지 않는다.
- 현재 경로와 일치하는 항목은 `active` 상태를 제공해야 한다.

## State Transitions

```text
anonymous request -> unauthenticated decision -> login flow
oauth callback -> cms session -> admin identity comparison
cms session + matching admin identity -> authorized decision -> cms shell
cms session + mismatched login or id -> forbidden decision -> access denied
missing/invalid site config -> misconfigured decision -> fail-closed state
authorized decision + mutation request -> adapter request
non-authorized decision + mutation request -> no repository change
active session expires -> expired decision -> re-authentication required
```

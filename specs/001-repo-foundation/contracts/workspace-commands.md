# Contract: Workspace Commands

## 목적

repo foundation이 제공해야 하는 root command behavior를 정의한다. 이 command들은 contributor가
workspace를 검증하기 위해 사용하는 외부-facing interface다.

## 필수 Command

### Install

**Command**: `pnpm install`

**Expected outcome**:

- repository root에서 workspace dependency를 설치한다.
- 두 application과 모든 shared package가 validation을 수행할 준비가 된다.

### Build

**Command**: `pnpm build`

**Expected outcome**:

- workspace build path를 실행한다.
- build work를 노출하는 `apps/blog`, `apps/cms`, 모든 shared package를 포함한다.
- 포함된 workspace가 build되지 않으면 실패한다.

### Type Check

**Command**: `pnpm typecheck`

**Expected outcome**:

- 두 application과 모든 shared package에 대해 type validation을 실행한다.
- 참여 workspace 중 하나라도 type error가 있으면 실패한다.

### Lint

**Command**: `pnpm lint`

**Expected outcome**:

- 두 application과 모든 shared package에 대해 static analysis를 실행한다.
- 참여 workspace 중 하나라도 lint violation이 있으면 실패한다.

### Format Check

**Command**: `pnpm format:check`

**Expected outcome**:

- file을 다시 쓰지 않고 formatting을 검사한다.
- file이 repository formatting rule과 일치하지 않으면 실패한다.

### Local Development

**Command**: `pnpm dev`

**Expected outcome**:

- foundation validation을 위한 local development workflow를 시작한다.
- combined dev command 또는 문서화된 app-specific dev command를 통해 두 초기 app shell을 사용할
  수 있게 한다.

## Failure Contract

- dependency 설치 전에 validation을 실행하면 missing dependency 또는 missing installation을
  명확히 알리는 실패가 발생해야 한다.
- app 또는 shared package가 누락되면 workspace validation 또는 workspace listing으로 발견할 수
  있어야 한다.
- Phase 0 validation을 위해 root command가 GitHub credential, content file, database service,
  object storage, analytics credential, AI credential을 요구해서는 안 된다.

# Data Model: Repo Foundation

## Workspace

**의미**: application, 공유 package, documentation, validation command를 조정하는 top-level
repository boundary.

**Fields**:

- `name`: workspace 또는 package의 사람이 읽을 수 있는 이름.
- `packageManager`: contributor가 사용하는 package manager.
- `apps`: workspace에 포함된 application boundary collection.
- `packages`: workspace에 포함된 shared package boundary collection.
- `docsPath`: documentation folder path.
- `rootCommands`: repository root에서 사용할 수 있는 command.

**Validation Rules**:

- `apps/blog`를 포함해야 한다.
- `apps/cms`를 포함해야 한다.
- 모든 필수 shared package boundary를 포함해야 한다.
- `docs/`를 보존해야 한다.
- app과 shared package를 포함하는 root validation command를 노출해야 한다.

## Application Boundary

**의미**: 고유 audience와 responsibility를 가진 runnable product surface.

**Fields**:

- `path`: application의 repository path.
- `audience`: blog는 reader, CMS는 operator.
- `responsibility`: public reading experience 또는 private content operations shell.
- `localRoute`: local validation에 사용하는 initial route.
- `requiresCredentialsForFoundation`: Phase 0 validation에 credential이 필요한지 여부.

**Validation Rules**:

- `apps/blog`는 reader-facing이고 locally runnable해야 한다.
- `apps/cms`는 operator-facing이고 locally runnable해야 한다.
- foundation app shell은 GitHub credential, authentication setup, content file, deployment
  configuration을 요구해서는 안 된다.

## Shared Package Boundary

**의미**: application이 공유하는 behavior를 담는 reusable ownership area.

**Fields**:

- `path`: package의 repository path.
- `domain`: editor, Markdown, SEO, design system, analytics, AI flag 중 하나.
- `consumers`: 이후 phase에서 package를 사용할 application.
- `participatesInValidation`: package가 root workspace validation에 포함되는지 여부.

**Validation Rules**:

- `editor`, `markdown`, `seo-engine`, `design-system`, `analytics`, `ai`가 모두 존재해야 한다.
- workspace가 발견할 수 있는 package metadata를 가져야 한다.
- Phase 0에서는 Post-MVP behavior를 포함해서는 안 된다.

## Validation Workflow

**의미**: foundation이 일관된 상태인지 증명하는 반복 가능한 root-level check.

**Fields**:

- `installCommand`: dependency installation entry point.
- `buildCommand`: workspace build entry point.
- `typecheckCommand`: type validation entry point.
- `lintCommand`: static analysis entry point.
- `formatCommand`: formatting entry point.
- `devCommands`: app별 local startup entry point.

**Validation Rules**:

- root package definition에 문서화되어야 한다.
- 적용 가능한 범위에서 두 app과 모든 shared package를 포함해야 한다.
- dependency가 누락되었을 때 명확하게 실패해야 한다.

## Documentation Area

**의미**: 기존 Markdown project documentation.

**Fields**:

- `path`: documentation의 repository path.
- `documents`: 기존 planning 및 product documentation.
- `isApplication`: 이 folder가 runnable app인지 여부.

**Validation Rules**:

- `docs/`에 남아야 한다.
- 기존 roadmap과 platform spec file을 보존해야 한다.
- Phase 0에서 별도 documentation application이 되어서는 안 된다.

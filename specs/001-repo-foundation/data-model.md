# Data Model: Repo Foundation

## Workspace

**Represents**: The top-level repository boundary that coordinates applications, shared packages, documentation, and validation commands.

**Fields**:

- `name`: Human-readable workspace/package name.
- `packageManager`: The package manager used by contributors.
- `apps`: Collection of application boundaries included in the workspace.
- `packages`: Collection of shared package boundaries included in the workspace.
- `docsPath`: Path to the documentation folder.
- `rootCommands`: Commands available from the repository root.

**Validation Rules**:

- Must include `apps/blog`.
- Must include `apps/cms`.
- Must include all required shared package boundaries.
- Must preserve `docs/`.
- Must expose root validation commands that include apps and shared packages.

## Application Boundary

**Represents**: A runnable product surface with a distinct audience and responsibility.

**Fields**:

- `path`: Repository path for the application.
- `audience`: Reader for the blog, operator for the CMS.
- `responsibility`: Public reading experience or private content operations shell.
- `localRoute`: Initial route used for local validation.
- `requiresCredentialsForFoundation`: Whether credentials are needed for Phase 0 validation.

**Validation Rules**:

- `apps/blog` must be reader-facing and locally runnable.
- `apps/cms` must be operator-facing and locally runnable.
- Foundation app shells must not require GitHub credentials, authentication setup, content files, or deployment configuration.

## Shared Package Boundary

**Represents**: A reusable ownership area for behavior shared by applications.

**Fields**:

- `path`: Repository path for the package.
- `domain`: Editor, Markdown, SEO, design system, analytics, or AI flags.
- `consumers`: Applications expected to consume the package in later phases.
- `participatesInValidation`: Whether the package is included in root workspace validation.

**Validation Rules**:

- Must exist for `editor`, `markdown`, `seo-engine`, `design-system`, `analytics`, and `ai`.
- Must have enough package metadata to be discovered by the workspace.
- Must not contain post-MVP behavior in Phase 0.

## Validation Workflow

**Represents**: The repeatable root-level checks that prove the foundation is coherent.

**Fields**:

- `installCommand`: Dependency installation entry point.
- `buildCommand`: Workspace build entry point.
- `typecheckCommand`: Type validation entry point.
- `lintCommand`: Static analysis entry point.
- `formatCommand`: Formatting entry point.
- `devCommands`: Local startup entry points for each app.

**Validation Rules**:

- Must be documented in the root package definition.
- Must include both apps and all shared packages where applicable.
- Must fail clearly when dependencies are missing.

## Documentation Area

**Represents**: Existing Markdown project documentation.

**Fields**:

- `path`: Repository path for documentation.
- `documents`: Existing planning and product documentation.
- `isApplication`: Whether the folder is a runnable app.

**Validation Rules**:

- Must remain at `docs/`.
- Must preserve existing roadmap and platform spec files.
- Must not become a separate documentation application in Phase 0.

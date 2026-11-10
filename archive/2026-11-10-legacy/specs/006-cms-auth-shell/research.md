# Research: CMS Auth + Shell

## Decision: Use Auth.js/NextAuth with GitHub provider for CMS login

**Rationale**: The roadmap explicitly allows NextAuth/Auth.js or a direct Next.js OAuth flow.
Auth.js provides a maintained GitHub provider, standard OAuth callback handling, session helpers,
and environment variable inference for GitHub OAuth credentials. That keeps this phase focused on
administrator identity validation rather than hand-writing OAuth plumbing.

**Alternatives considered**:

- Hand-rolled OAuth flow: rejected because it increases security and callback edge-case work without
  adding product value for the MVP.
- GitHub App installation authentication as the user login: rejected because the content adapter's
  repository credential and the human operator session are separate concerns.

## Decision: Validate both GitHub login and immutable user id

**Rationale**: The constitution and spec require login and immutable user id to match
`content/site.json`. GitHub login can change over time, while GitHub's user id is durable. Requiring
both detects account rename or config drift and avoids allowing access from a user who only matches
one identifier.

**Alternatives considered**:

- Login-only check: rejected because GitHub login is renameable.
- User-id-only check: rejected because the operator needs a human-readable mismatch when site config
  or account rename state drifts.

## Decision: Use fail-closed access decisions

**Rationale**: CMS protects draft content and repository mutation. If session lookup, site config
loading, or admin identity validation fails, the safe behavior is to deny access and show an
operator-facing state rather than exposing content or allowing writes.

**Alternatives considered**:

- Allow read-only access when config fails: rejected because draft and settings visibility are still
  sensitive.
- Permit mutations after page-level auth only: rejected because direct mutation requests can bypass
  page navigation.

## Decision: Guard both route entry and mutation boundaries

**Rationale**: Page-level protection provides user-friendly redirects and access-denied screens, but
server-side mutation handlers must independently verify the current session before using the content
adapter. This avoids relying on UI navigation as a security boundary.

**Alternatives considered**:

- Route guard only: rejected because direct requests to mutation endpoints or server actions need
  their own authorization check.
- Mutation guard only: rejected because unauthenticated users would still see protected CMS shell
  structure and possibly sensitive state.

## Decision: Use Next.js 16 `proxy.ts` only for lightweight routing protection

**Rationale**: Next.js 16 documents `proxy.ts` as the file-system convention for code that runs
before a request completes. It is useful for coarse login redirects, while full admin identity
checks stay in server-side CMS auth helpers where site config and session context are available.

**Alternatives considered**:

- Put full admin validation in `proxy.ts`: rejected because identity comparison depends on project
  content config and should share the same server helper used by mutations.
- Skip routing protection entirely: rejected because unauthenticated users should be sent to login
  before protected shell rendering starts.

## Decision: Keep shell UI in `apps/cms` and reusable primitives in `packages/design-system`

**Rationale**: The shell layout is CMS-specific, but roadmap-required primitives such as Button,
Input, Dialog, Tabs, Dropdown Menu, Badge, and Form should be available to later editor and publish
phases. This follows the constitution's shared package ownership rule without moving auth behavior
into a shared package.

**Alternatives considered**:

- Build all UI directly in `apps/cms`: rejected because later CMS phases would duplicate primitives.
- Move the full shell into `packages/design-system`: rejected because app navigation and auth state
  are CMS-specific.

## Sources

- Auth.js GitHub provider documentation: https://authjs.dev/getting-started/providers/github
- Auth.js Next.js reference: https://authjs.dev/reference/nextjs
- GitHub REST users documentation: https://docs.github.com/en/rest/users/users
- Next.js `proxy.ts` file convention:
  https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- Next.js middleware-to-proxy migration note: https://nextjs.org/docs/messages/middleware-to-proxy

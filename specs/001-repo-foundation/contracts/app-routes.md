# Contract: Initial App Routes

## Purpose

Define the local route behavior required for the initial public blog and CMS app shells.

## Public Blog App

**Boundary**: `apps/blog`

**Audience**: Blog readers

**Required initial route**: `/`

**Expected behavior**:

- Shows an initial public blog page.
- Does not expose draft, archived, preview, publishing, analytics-dashboard, or CMS behavior.
- Does not require GitHub credentials, content files, authentication setup, or deployment configuration.

## CMS App

**Boundary**: `apps/cms`

**Audience**: Single blog operator

**Required initial route**: `/`

**Expected behavior**:

- Shows an initial CMS page or shell.
- Does not require authentication setup for Phase 0 validation.
- Does not perform GitHub mutations, publishing actions, preview-token generation, analytics lookups, or AI generation.

## Validation Contract

- Each app can be started independently for local inspection.
- The app shown in the browser clearly reflects its boundary: public blog versus private CMS.
- Both app shells are sufficient for foundation validation and do not imply that later content, auth, editor, or publishing features are complete.

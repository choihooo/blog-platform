# Contract: Initial App Routes

## 목적

초기 공개 블로그와 CMS app shell이 제공해야 하는 local route behavior를 정의한다.

## Public Blog App

**Boundary**: `apps/blog`

**Audience**: blog reader

**Required initial route**: `/`

**Expected behavior**:

- 초기 public blog page를 보여준다.
- draft, archived, preview, publishing, analytics-dashboard, CMS behavior를 노출하지 않는다.
- GitHub credential, content file, authentication setup, deployment configuration을 요구하지
  않는다.

## CMS App

**Boundary**: `apps/cms`

**Audience**: 단일 blog operator

**Required initial route**: `/`

**Expected behavior**:

- 초기 CMS page 또는 shell을 보여준다.
- Phase 0 validation에 authentication setup을 요구하지 않는다.
- GitHub mutation, publishing action, preview-token generation, analytics lookup, AI generation을
  수행하지 않는다.

## Validation Contract

- 각 app은 local inspection을 위해 독립적으로 시작할 수 있다.
- browser에 표시되는 app은 public blog와 private CMS 경계를 명확히 드러낸다.
- 두 app shell은 foundation validation에 충분하며 이후 content, auth, editor, publishing
  feature가 완료되었음을 암시하지 않는다.

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
- GitHub credential, content file, authentication setup, deployment configuration을 요구하지 않는다.

## Public project details

- `/projects/still`과 `/projects/afterimage`는 기존 `/projects/[slug]` 상세와 가로채기 모달을
  재사용한다. 직접 진입·새로고침·뒤로 가기 동작은 다른 프로젝트와 동일하다.
- 프로젝트 데이터의 선택 필드 `format: "showcase"`는 Web Publishing Showcase 헤더와 이미지·영상 우선
  본문을 선택한다. 기본값은 기존 case study 표시다.
- `period`는 선택 필드다. 확인되지 않은 기간·팀·기술 스택은 UI에서 생략하고 검색 문서에도
  `undefined`를 노출하지 않는다. 성과가 없는 작업에 수치를 만들어 넣지 않는다.

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
- 두 app shell은 foundation validation에 충분하며 이후 content, auth, editor, publishing feature가
  완료되었음을 암시하지 않는다.

# Research: Content Model

## Decision: 콘텐츠 원본은 root `content/` 디렉터리로 둔다

**Rationale**: 헌법은 GitHub repository를 콘텐츠 원본으로 두고 글을 `content/posts/*.mdx`에
저장하도록 정한다. root `content/`는 `apps/blog`, `apps/cms`, 공유 package가 모두 같은 상대 경로를
기준으로 찾을 수 있어 공개 blog와 CMS preview 사이의 차이를 줄인다.

**Alternatives considered**:

- `apps/blog/content/`: 공개 blog에는 단순하지만 CMS와 공유 package가 같은 원본을 참조하기 어렵다.
- `packages/markdown/fixtures/`: 테스트 fixture로는 적합하지만 실제 운영 콘텐츠 원본으로 부적절하다.
- 외부 CMS 또는 database: MVP 범위와 파일 기반 콘텐츠 권위 원칙을 위반한다.

## Decision: 콘텐츠 schema와 검증 API는 `packages/markdown`가 소유한다

**Rationale**: frontmatter parsing, schema validation, slug policy는 공개 blog, CMS, SEO phase가
모두 재사용할 shared domain logic이다. `packages/markdown`에 집중하면 앱별 중복 구현을 피하고
package contract test로 안정성을 확인할 수 있다.

**Alternatives considered**:

- `apps/blog`에 content loader를 먼저 구현: CMS preview와 검증 로직이 중복될 가능성이 높다.
- 새 `packages/content` package 생성: 현재 constitution의 목표 package 목록에 없고 Phase 0
  skeleton과 어긋난다.
- `packages/seo-engine`에 metadata 검증 포함: SEO scoring과 콘텐츠 유효성의 소유권이 섞인다.

## Decision: `zod`로 상태별 frontmatter schema를 정의한다

**Rationale**: 현재 로드맵이 Zod schema 작성을 명시하고 있고, TypeScript workspace에서 runtime
validation과 static type inference를 함께 제공한다. `draft`, `published`, `archived`를 discriminated
state로 검증하면 상태별 필수 field 차이를 명확히 표현할 수 있다.

**Alternatives considered**:

- 수동 validation 함수만 사용: 초기에는 단순하지만 오류 메시지와 type inference가 약해진다.
- JSON Schema만 사용: cross-language portability는 좋지만 현재 TypeScript package의 개발 경험이
  떨어진다.
- frontmatter를 느슨하게 허용: published-only filtering과 SEO 입력 안정성이 낮아진다.

## Decision: frontmatter parsing은 `gray-matter`를 사용한다

**Rationale**: MDX 파일의 frontmatter와 body를 분리하는 검증된 라이브러리이며, 이후 Markdown/MDX
engine phase에서 같은 입력 처리를 확장하기 쉽다. 직접 parser를 만들지 않는 헌법의 방향과도 맞다.

**Alternatives considered**:

- 직접 frontmatter parser 작성: edge case 처리와 유지보수 비용이 불필요하게 커진다.
- MDX compiler로 frontmatter까지 처리: Phase 1의 목적보다 무겁고 unsafe MDX 차단은 Phase 2에서
  다룬다.

## Decision: slug 정책은 제목 기반 생성과 전체 post 목록 기준 중복 검사로 나눈다

**Rationale**: 초안은 slug 없이 존재할 수 있지만 Save/Publish 시점에는 URL 후보가 필요하다. 생성과
중복 검사를 분리하면 CMS 저장 flow와 공개 build validation이 같은 정책을 재사용할 수 있다.

**Alternatives considered**:

- 파일명을 항상 slug로 사용: draft 임시 ID와 제목 변경 시나리오가 불편하다.
- 중복 시 자동 suffix를 붙여 항상 저장: 운영자가 의도하지 않은 공개 URL을 만들 수 있다.
- 중복 검사를 공개 blog loader에만 둔다: CMS 저장 전에 충돌을 발견하지 못한다.

## Decision: Vitest를 content model package test runner로 사용한다

**Rationale**: TypeScript/ESM package를 빠르게 검증할 수 있고, schema validation과 순수 함수
테스트에 적합하다. 기존 Turborepo command에 package-level test script를 추가하기 쉽다.

**Alternatives considered**:

- Node built-in test runner: 의존성은 줄지만 matcher와 TypeScript workflow 편의성이 낮다.
- Jest: 생태계는 넓지만 ESM/TypeScript 설정 부담이 더 크다.
- 수동 validation script만 작성: 반복 가능한 unit test coverage로 보기 어렵다.

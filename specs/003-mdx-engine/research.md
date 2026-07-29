# Research: Markdown/MDX Engine

## Decision: MDX 처리는 established MDX/unified pipeline을 감싼다

**Rationale**: 프로젝트 헌법은 custom parser를 직접 만들지 않고 unified, remark, rehype, MDX 계열
라이브러리를 감싸도록 요구한다. `@mdx-js/mdx`는 MDX를 JavaScript로 compile할 수 있는 core compiler이며,
Next.js나 bundler가 있으면 integration을 사용할 수 있다는 공식 guidance를 제공한다. 이 feature에서는
`packages/markdown`가 parsing, analysis, validation, rendering preparation의 공통 계약을 소유하고,
실제 app rendering integration은 이후 blog/CMS phase에서 연결한다.

**Alternatives considered**:

- 직접 Markdown/MDX parser 구현: 헌법 위반이고 보안 및 syntax coverage 위험이 크다.
- app별 MDX 처리: preview와 public rendering drift를 만들 수 있어 공유 패키지 원칙에 맞지 않는다.

## Decision: frontmatter parsing은 기존 `gray-matter`를 유지하고 serialization을 추가한다

**Rationale**: Phase 1에서 `parsePostFile`이 이미 `gray-matter`를 사용해 frontmatter와 body를 분리한다.
기존 검증과 data model을 유지하면 콘텐츠 모델 phase와 호환되고, CMS editor 저장 workflow에서 같은
metadata를 파일로 되돌릴 수 있다.

**Alternatives considered**:

- remark-frontmatter만 사용: AST 분석에는 유용하지만 기존 schema validation 결과와 저장 흐름을 다시
  맞춰야 한다.
- YAML string 직접 조립: escaping, array, date formatting 오류 가능성이 높다.

## Decision: heading, TOC, reading time은 deterministic analysis 결과로 제공한다

**Rationale**: TOC와 reading time은 MVP 필수 generated metadata다. heading은 MDX AST에서 추출하고
`github-slugger`로 같은 문서 안 slug 충돌을 해결한다. reading time은 본문 텍스트 기준의 일관된 규칙을
사용해 같은 입력에서 같은 결과를 만든다.

**Alternatives considered**:

- HTML 출력 후 selector 기반 추출: 렌더링 integration에 종속되고 CMS preview와 public blog 간 drift가
  생길 수 있다.
- 정규식 기반 heading parsing: MDX, fenced code block, JSX가 섞인 입력에서 오탐 가능성이 크다.

## Decision: code block 표시 준비는 `shiki`를 직접 사용한다

**Rationale**: MVP의 우선순위는 안전하고 예측 가능한 글 표시 준비다. `shiki`를 직접 사용하면 code block
language fallback과 tokenization 정책을 package 안에서 명확히 테스트할 수 있고, sanitize schema와
highlight class 허용 범위를 별도 plugin 동작에 과도하게 의존하지 않아도 된다.

**Alternatives considered**:

- `rehype-pretty-code`: 좋은 rehype integration이지만 sanitize schema와 class allowlist 조율이 별도
  복잡도를 만든다.
- highlight 미지원: 로드맵의 code block rendering 완료 기준을 만족하지 못한다.

## Decision: unsafe MDX는 sanitize와 AST allowlist를 함께 사용해 차단한다

**Rationale**: `rehype-sanitize`는 schema에 명시적으로 허용되지 않은 HTML을 제거하는 unified plugin으로
공식 설명된다. 다만 MDX는 JSX와 JavaScript 표현을 포함할 수 있으므로 sanitize만으로 import/export,
event handler, arbitrary runtime evaluation, unsupported component 정책을 모두 표현하기 어렵다.
따라서 AST 검증 단계에서 위험 요소를 먼저 실패로 보고하고, HTML 단계에서는 `rehype-sanitize` schema로
출력 방어를 추가한다.

**Alternatives considered**:

- sanitize만 적용: MDX JSX와 JavaScript 실행 정책을 충분히 설명하지 못한다.
- 모든 MDX JSX 허용: MVP의 안전한 발행 경계와 interactive component 제한을 위반한다.

## Decision: runtime MDX evaluation은 MVP engine 계약에서 제외한다

**Rationale**: MDX content는 JavaScript로 compile/evaluate될 수 있고, remote/untrusted content 렌더링은
code execution 위험을 만든다. `next-mdx-remote`에는 2026년에 untrusted MDX processing 관련 RCE advisory가
있었고 fixed version이 언급되어 있다. 이 feature는 `evaluate`, `run`, `runSync`, 구버전 remote serialize
패턴을 public contract로 노출하지 않고, 안전성 검증을 통과한 repository content만 이후 rendering
integration에 전달하도록 제한한다.

**Alternatives considered**:

- `evaluate` 기반 preview: 구현은 단순하지만 arbitrary execution 차단 요구와 충돌한다.
- remote MDX serialize를 핵심 package API로 노출: 버전과 호출 환경에 따른 보안 위험을 package
  consumer에게 전파한다.

## Sources

- MDX package documentation: https://mdxjs.com/packages/mdx/
- rehype-sanitize documentation: https://github.com/rehypejs/rehype-sanitize
- Next.js MDX guide: https://nextjs.org/docs/app/guides/mdx
- next-mdx-remote repository and security advisory context:
  https://github.com/hashicorp/next-mdx-remote,
  https://discuss.hashicorp.com/t/hcsec-2026-01-arbitrary-code-execution-in-react-server-side-rendering-of-untrusted-mdx-content/77155

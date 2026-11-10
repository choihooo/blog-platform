# Core

Blog·CMS·RAG Worker가 공유하는 로직이다. `.` barrel과 `src/*` 직접 접근은 공개하지 않는다.

| Subpath                               | 책임                                              | 실행 환경                 |
| ------------------------------------- | ------------------------------------------------- | ------------------------- |
| `@blog-platform/core/content`         | editor model·rich JSON·검증·변환·공통 레코드 타입 | 순수 코드                 |
| `@blog-platform/core/content/catalog` | 프로젝트·프로필·이력서 원본과 타입                | 순수 코드                 |
| `@blog-platform/core/seo`             | metadata·JSON-LD·RSS·sitemap·robots·SEO report    | 순수 코드                 |
| `@blog-platform/core/analytics`       | 이벤트·지표 정규화·외부 콘솔 링크                 | 순수 코드                 |
| `@blog-platform/core/search`          | corpus·chunking·질의·응답 계약                    | Web API, Node/Worker 공용 |
| `@blog-platform/core/storage`         | D1 CRUD·R2/로컬 media·설정 로더·secret redaction  | Node 서버 전용            |

content·seo·analytics·search는 storage·Next.js·앱 내부 모듈에 의존하지 않는다. CMS auth·발행 작업과
Blog cache/RAG HTTP 호출, Worker binding 조립은 각 앱에 남긴다.

## 콘텐츠 계약

`loadPostContent`, `parsePostContent`, `serializePostContent`, `postRecordToEditorDocument`와 기존
editor export를 제공한다. 본문은 `{ version: 1, nodes }`이며 표·중첩 목록·inline runs·이미지
caption과 링크를 보존한다. 지원하지 않는 JSX/unsafe HTML을 자동 허용하지 않고
attachment/blob/data/file URL을 저장할 수 있는 미디어 경로로 취급하지 않는다. Markdown fallback·HTML
paste·Tiptap round-trip 테스트는 `src/content`가 소유한다.

## 저장소 계약

`createContentAdapter()`와 `createD1R2ContentAdapter()`는 같은 D1 CRUD 구현이다.
글·카테고리·태그·미디어 참조 메서드와 `ContractResult<T>`를 유지한다. legacy 파일 저장 모드 인자는
제공하지 않는다. D1 binding → 로컬 proxy → Cloudflare REST의 기존 연결 규칙을 유지한다.

`createMediaStore(root).put({ path, contentBase64, expectedSha? })`는
`ContractResult<{ path, publicPath, sha, sizeBytes }>`를 반환한다. development이고 R2 설정이 없으면
로컬, 그 외에는 R2를 사용하며 production 설정 누락은 실패다. 이미지 검증과 CMS 관리자 guard는 호출
앱의 책임이다. 경로·hash·R2 key와 공개 URL을 재작성하지 않는다.

`loadSiteConfig({ root?, bundled })`에는 앱이 정적 import한 `content/site.json`을 전달한다. 명시적
root 읽기 실패는 기본값, 암시적 root 읽기 실패는 bundled 설정을 사용한다. bundled JSON을 core 밖에서
정적으로 import하도록 해서 패키지 빌드가 앱 경로에 의존하지 않게 한다.

## 검색과 검증

기존 문서·chunk id·임베딩 입력은 이동 전 golden snapshot으로 확인한다.
모델·차원·namespace·chunking을 바꾸는 작업은 별도 재색인 계획이 필요하다. 구조 단순화는 인덱스를
다시 쓰지 않는다.

```sh
pnpm --filter @blog-platform/core format:check
pnpm --filter @blog-platform/core build
pnpm --filter @blog-platform/core lint
pnpm --filter @blog-platform/core typecheck
pnpm --filter @blog-platform/core test
```

저장소는 mock/임시 디렉터리로 검사한다. 실제 D1/R2 쓰기·발행·동기화·배포를 테스트에서 실행하지
않는다.

검색용 `textFromPostContent`는 저장된 표·중첩 본문을 읽기 전용 텍스트로 투영한다. 손상된 editor
JSON은 빈 텍스트로 처리하며 편집·저장 모델을 확장하지 않는다. Gemini 검색은 별도 768차원
프로필·인덱스로 격리하고 legacy Workers AI 1024차원·public-v1 기본값을 유지한다. 재색인·전환·롤백은
`docs/runbooks/2026-11-06-gemini-rag.md`를 따른다.

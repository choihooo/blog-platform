# CMS·RAG Worker 책임 경계와 동작 보존 명세

작성일: 2026-11-09. 상태: CMS·Worker 구조 변경 구현, 단계별 검증 기록은 `docs/audits/` 참조.

## 범위와 기준

Blog에서 적용한 UI/비즈니스 분리, feature 책임, 공통 유틸, custom hook, BFF의 다섯 기준을 CMS와
Worker에 적용한다. 두 앱은 별도 계획으로 실행하며 CMS를 먼저 권장한다. 이번 산출물은 계획이며 소스
수정·저장·발행·동기화·배포를 포함하지 않는다.

조사 경로는 `apps/cms`, `apps/rag-worker`, 해당 `AGENTS.md`, `docs/development-guide.md`, 기존
발행·미디어·인증·분석·RAG 계약과 Blog의 서버 경계다. 현재 작업 트리의 기존 Blog 변경을 보존한다.
실행을 시작할 때 기준 커밋과 미커밋 변경을 다시 기록한다.

## 현재 구조와 판단

| 기준             | CMS 현황과 변경 방향                                                                                                                                         | Worker 현황과 변경 방향                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| UI/비즈니스 분리 | `editor-screen.tsx` 638줄에 Tiptap·저장·발행·백업·이미지 제어가 함께 있다. 이미 분리된 save/publish workflow는 유지하고 클라이언트 제어를 hook으로 이동한다. | `index.ts` 202줄에 라우팅·인증·동기화·검색·생성 제어가 있다. HTTP handler와 서비스로 나눈다.                                    |
| feature 책임     | `components`, `lib`, `app/actions`에 같은 기능이 흩어져 있다. editor/posts/taxonomy/analytics로 묶는다.                                                      | 제품 런타임은 TS 3파일과 운영 CLI 2파일로 작다. 검색·답변·동기화와 provider adapter를 구분하되 CMS 폴더 구조를 복제하지 않는다. |
| 공통 유틸        | 클라이언트의 제목 후보와 서버 preview의 path 우선 후보는 정책이 다르므로 model/server에서 구분한다. analytics가 쓰는 글 목록은 posts 서버 API로 옮긴다.      | JSON 응답·인증·오류 처리는 HTTP, 프로필·corpus·임베딩 선택은 retrieval, Gemini 통신은 provider가 소유한다.                      |
| custom hook      | 복합 편집 제어와 카테고리 표시 상태에 적용한다. 단순 표현 컴포넌트마다 hook을 만들지는 않는다.                                                               | React UI가 없으므로 해당 없음. 순수 함수와 비동기 서비스로 대체한다.                                                            |
| BFF              | Next route와 Server Actions가 이미 경계다. 인증·캐시 무효화·DTO 변환을 남기고 기능 로직을 호출한다.                                                          | Blog BFF 뒤의 내부 API다. Worker HTTP 경계를 얇게 만들며 새 API 계층이나 공개 endpoint를 추가하지 않는다.                       |

추가 확인 사항:

- `category-manager.tsx`는 431줄이며 트리 표시·삭제 제한·폼·모달이 함께 있다.
- `google-analytics-provider.ts`는 703줄이며 자격 증명·Google HTTP·정규화·mock 데이터가 함께 있다.
- CMS lint는 현재 `app lib next.config.mjs`만 검사한다. Vitest도 app/components/lib만 포함하므로
  features/shared를 만들 때 검사 경로를 같이 확장해야 한다.
- 현재 클라이언트의 `app/actions` import는 Next의 명시적인 Server Action RPC다. 이를 곧바로 서버
  코드의 브라우저 유출이라고 판단하지 않는다. 구조를 바꿀 때는 page에서 action 함수를 capability
  prop으로 전달하여 feature가 app에 역으로 의존하지 않게 한다.
- `lib/editor/index.ts`는 브라우저용 함수와 서버 함수가 섞인 barrel이다. client/server 진입점을
  분리하고 공유 DTO는 Node·환경 변수·스토리지 import가 없는 model 파일에 둔다.
- 기존 RAG 계약 문서에는 삭제된 Blog local/Kanana 모드 설명이 남아 있다. Worker의 두 임베딩
  프로필과는 다른 문제다. 최종 문서 정리에서 실제 Blog 호출부와 맞추고 로컬 생성 모드를 되살리지
  않는다.

## CMS 목표 경계

| 위치                                                            | 소유 책임                                                                            | 허용 의존성                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `app/**`                                                        | URL, 세션 진입, Server Action facade, route 응답, Next cache 무효화, capability 조립 | feature 공개 진입점, shared, 기존 auth/security                                          |
| `features/editor/{components,hooks,model,server}`               | 문서 편집·백업·저장·발행·미리보기·본문/커버 미디어                                   | core/content·seo·analytics, posts 서버 API, shared; client는 server를 값 import하지 않음 |
| `features/posts/{components,model,server}`                      | 운영자 글 목록·요약·경로 계약                                                        | core/content·storage, shared                                                             |
| `features/taxonomy/{components,hooks,model,server}`             | 분류 트리·폼·태그·카테고리 작업                                                      | core/content·storage, shared                                                             |
| `features/analytics/{components,model,server}`                  | 대시보드·기간·provider 정규화·Google 통신                                            | posts의 명시적 서버 목록 API, core/analytics, shared                                     |
| `features/public-content/server`                                | Blog가 읽는 공개 콘텐츠 조회·필터·projection                                         | core/content·storage                                                                     |
| `shared/ui`, `shared/server`                                    | 실제 복수 기능에서 쓰는 필드와 사이트 설정·저장소 root                               | core, 루트 site 설정; UI는 서버 값을 import하지 않음                                     |
| 기존 `components/{shell,auth}`, `lib/{auth,security,migration}` | 인증 셸·접근 정책·토큰·복구 도구                                                     | 기존 계약 유지; feature 폴더를 만들기 위한 이동은 하지 않음                              |

`app → feature → shared/core`를 기본 방향으로 한다. analytics의 posts 조회는 feature 서버 공개 API를
통한 의도된 의존성이다. editor 내부 파일을 analytics가 참조하지 않는다. 공통 코드를 뽑을 때
`packages/core`의 기존 serializer/storage/search/analytics를 먼저 재사용한다. Next/Auth/캐시 로직을
공유 패키지로 올리지 않는다. 새 의존성은 추가하지 않는다.

## Worker 목표 경계

`index.ts → http/handlers → services → retrieval/providers → core 및 Cloudflare bindings`.

- `index.ts`는 default fetch export와 dispatch만 유지한다.
- `http`는 JSON/no-store, 인증, loopback 판별, 기존 오류 매핑을 소유한다.
- `handlers`는 요청 검증과 응답 DTO를 소유한다. `/sync`와 local D1의 특수 검증 순서를 보존한다.
- `services`는 답변 생성 뒤 evidence 재검증과 동기화 revision/batch orchestration을 소유한다.
- `retrieval.ts`는 기존 공개 함수 계약을 유지하면서 primary corpus·검색·프로필 선택을 소유한다.
- `providers/gemini-http.ts`는 transport, `gemini.ts`는 임베딩·근거 답변 생성 정책을 소유한다. 일반
  목적 DI 컨테이너나 provider 플러그인 프레임워크는 만들지 않는다.
- `scripts/sync.mjs`, `scripts/sync-options.mjs`는 운영 CLI로 유지한다.

## 변경하지 않을 계약

### CMS

- 단일 운영자 인증·mutation guard·fail closed·secret redaction을 유지한다.
- native editor document version 1과 중첩 rich content를 유지한다. 임시 저장은 공개 갱신을 하지
  않는다.
- Publish/Unpublish/Archive 상태 전이, slug, publishedAt, updatedAt, 충돌 감지와 재시도 정보를
  유지한다.
- 저장 성공·공개 페이지 갱신 결과·RAG 후속 동기화 결과를 같은 실패로 합치지 않는다. Blog BFF의
  성공/경고 의미를 보존하며 이번 구조 변경으로 새로운 부분 성공 상태 체계를 만들지 않는다.
- 발행 저장이 끝난 뒤 공개 갱신만 실패하면 기존 문서/sha/targets/retryToken을 유지한다. retry는
  재저장·재발행 없이 공개 갱신만 수행한다.
- Preview HMAC은 slug/contentSha/만료를 결합하고 만료 시간은 30분이다.
- `/api/public-content`는 공개 글만 반환하며 404/502, 필터·page/limit, categories와
  `public, s-maxage=60, stale-while-revalidate=300`를 유지한다.
- 미디어 type/size/alt 검증과 스토리지 경로를 유지한다. 보안 수정·pagination 개선은 별도 변경으로
  분리한다.

### Worker

- GET `/health`는 공개, POST `/search`·`/answer`는 `RAG_SEARCH_TOKEN`, POST `/sync`· `/__local/d1`은
  `RAG_ADMIN_TOKEN`을 사용한다. local D1은 loopback만 허용한다.
- 모든 JSON 응답의 `Cache-Control: no-store`, 입력 상한, 상태 코드·error payload와 검색/답변 합산
  30회/60초 제한을 유지한다. 내부 evidence ID는 응답에 노출하지 않는다.
- Vectorize 조회 후 primary D1 원문을 읽어 삭제·비공개·오래된 벡터를 제거하고, 생성 완료 후 선택
  evidence를 다시 읽어 변경되면 답변 전체를 503으로 폐기한다.
- 근거 없으면 모델 호출 없이 정상 응답, quota는 429, provider/근거 변경은 503이다. 실패를 근거
  없음으로 바꾸거나 다른 유료 모델로 자동 전환하지 않는다.
- sync는 최대 16청크, offset/revision 변경은 409, contentRevision은 provider 독립이다. dryRun은
  추론·upsert를 하지 않는다. 페이지 임베딩 실패 시 해당 페이지를 upsert하지 않는다.
- Workers AI `@cf/baai/bge-m3`/1024/`public-v1`/`INDEX`, Gemini
  `gemini-embedding-001`/768/L2/`public-gemini-v1`/`INDEX_GEMINI`를 각각 유지한다.
- Gemini HTTP timeout/취소·262144바이트 응답 상한, sources 최대 3·발췌 550자, answer 최대
  4000자·STOP 판정·근거 URL 링크 제한·20초 예산 안의 의미 검증 재요청 1회를 유지한다.
- wrangler 설정·remote bindings·keep_vars·배포 변수·인덱스·namespace·청크 ID를 바꾸지 않는다.

## 검증과 완료 기준

실행 시작 시 각 앱의 현재 테스트 결과와 테스트 수를 기록한다. 각 task는 관련 기존 테스트를
이동/유지하고, 비어 있던 보존 사례만 추가한다. 마지막에는 CMS format/lint/typecheck/test/build,
Worker typegen/typecheck/test/build를 모두 실행한다. build는 Worker에서
`wrangler deploy --dry-run`이다. 계약 접점은 Blog의 revalidate/RAG/content-source 테스트와 함께
확인한다.

테스트는 fetch·D1·R2·AI·Vectorize를 mock한다. Worker local dev에도 remote binding이 있으므로 검증 중
`wrangler dev`·실제 sync CLI·운영 발행/업로드를 실행하지 않는다. 실제 운영 호출을 해야 하는 새
작업은 별도 범위다. 이번 계획 문서 작성에서는 문서 형식과 diff만 검사한다.

관련 계약: `specs/008-media-upload/contracts`, `specs/009-publish-workflow/contracts`,
`specs/013-security-hardening/contracts`, `specs/014-d1-r2-migration/contracts`,
`specs/015-ga-gsc-dashboard/contracts`, `specs/016-gemini-rag/contracts/rag-api.md`.

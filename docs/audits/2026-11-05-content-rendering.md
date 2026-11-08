# 공개 글 렌더링 전수 조사 — 2026-11-05

## 후속 복구 완료

아래는 복구 전 조사 기록이다. 이후 사용자 요청으로 원문 32개를 복구하고 Blog/CMS/RAG Worker의 문서
보존 경로를 수정·배포했다. 운영 35개 재검사에서 코드 블록 149개, 표 15개, 본문 이미지 106개를
확인했다. 원문 코드 130개·표 셀 283개를 대조했으며 metadata와 비공개 글을 보존했다. 상세
실행·검증·rollback은 [복구 runbook](../runbooks/2026-11-05-content-recovery.md)을 따른다.

## 범위와 결과

공개 CMS의 published 글 35개 전부를 조사했다. 각 글의 저장 JSON, 로컬 라운드 시안 상세 페이지, 운영
블로그 상세 페이지를 대조했다. 티스토리에서 이전한 32개는 원본 공개 HTML도 가져와 비교했다. 비공개
초안은 범위에 포함하지 않았다.

35개 중 31개에서 아래 항목 중 하나 이상을 확인했다. 나머지 4개는 이번 자동 검사에서 이상을 발견하지
못했다는 뜻이며, 모든 화면 크기에서 시각 검수가 끝났다는 뜻은 아니다. 조사 시점의 로컬과 운영
HTML에서 같은 본문 문제를 확인했다.

| 문제                                             | 영향                                                          |
| ------------------------------------------------ | ------------------------------------------------------------- |
| 코드 블록을 문단으로 잘못 저장해 백틱 노출       | 15개 글, 펜스가 남은 비코드 노드 111개                        |
| 표의 행·열 구조 소실                             | 9개 글, 원본 표 15개                                          |
| 원본 h1을 문단·목록 등으로 변환해 제목 계층 소실 | 12개 글, 원본 h1 43개                                         |
| 번호 목록을 항목별 독립 ol로 출력                | 4개 글, orderedList 노드 13개                                 |
| 본문·캡션에 강조 표시 **가 남음                  | 8개 글, 운영 HTML 텍스트 33곳                                 |
| 링크로 감싼 이미지 문법 노출                     | 2개 글                                                        |
| 빈 제목 문법 ## 또는 ### 노출                    | 4개 글, 문단 5곳·캡션 2곳                                     |
| 원본 코드의 JSX·제네릭 토큰 소실                 | 8개 글에서 원본 대비 누락 후보 확인, 아래 직접 확인 사례 포함 |

각 항목의 글 수는 중복된다. 긴 이미지 캡션은 별도 수동 검토 대상으로 표시했다.

## 우선 복구할 문제

### 1. 코드 블록과 코드 내용 손상

[React Router 글](https://hozorica.com/blog/react-router-loader-action)의 원본은 다음과 같다.

```tsx
function App() {
  return <RouterProvider router={router} />;
}
```

현재 저장된 본문은 `return ;`이다. 컴포넌트 태그가 이미 없어져 렌더러만 고쳐서는 복원할 수 없다.
같은 글의 라우트 설정에서도 `element: ,`, `errorElement:`처럼 값이 사라졌다.

[서버·클라이언트 컴포넌트 글](https://hozorica.com/blog/nextjs-server-client-components)에는 JSX
태그 없이 `setCount(count + 1)}>` 등이 남는다.
[CS 디자인 패턴](https://hozorica.com/blog/cs-design-patterns-interview)의
`type Listener = (state: T) => void;`에는 원본 제네릭 선언이 빠져 있다.

별도로 [검증 가능한 AI UI](https://hozorica.com/blog/verifiable-ai-ui-design)의 `meeting-record.mp4`
예제는 운영·로컬 모두 `<pre><code>` 대신 두 개의 `<p>`로 출력되며 백틱이 그대로 보인다.

원인:

- `scripts/migration/import-tistory.ts`의 `htmlToMarkdown`은 pre/code의 HTML 엔티티를 먼저 해제한
  후, 전체 문자열에 `/<[^>]+>/g` 태그 제거를 적용한다. 코드 안의 JSX·제네릭까지 HTML로 간주할 수
  있다.
- 같은 함수가 코드 내부 공백과 들여쓰기에도 정규화를 적용한다.
- `packages/editor/src/post-content.ts`의 `legacyMarkdownToPostContent`는 먼저 빈 줄로 전체 본문을
  분할한 뒤 코드 펜스를 인식한다. 내부에 빈 줄이 있는 코드 블록이 여러 문단으로 쪼개진다.
- 현재 글은 모두 JSON이므로 이 fallback을 고쳐도 기존 저장 데이터는 자동 복구되지 않는다.

### 2. 표가 긴 문장으로 뭉개짐

원본 표 15개가 저장 모델과 운영 HTML 모두에서 표로 유지되지 않았다. 운영 본문에서 table 요소는
검출되지 않았다.

예: [거부기린 회고](https://hozorica.com/blog/geobugirin-10000-users-retrospective)의 연령·직업·지역
통계 표 3개가 paragraph로 저장됐다. 지역 표는
`지역 / 샘플 수 / 평균 가입 확률 / 서울 / 2,578명 / 55.9% ...`가 하나의 문단에 들어 있다.

영향 글: 모아이 ADK 후기, 거부기린 회고, Data Stream, TypeScript 성능 측정, 개인 이슈 트래커, 스킬
vs 멀티에이전트, CS 디자인 패턴, 커스텀 도메인, 정규표현식.

원인: HTML 이전 과정에 table 행·열 변환이 없고, 현재 EditorNodeType에도 table 노드가 없다. CSS에는
표 스타일이 있지만 실제 표 구조가 전달되지 않는다.

### 3. 제목·번호 목록 구조 손실

HTML 이전 함수는 h2/h3/h4만 Markdown 제목으로 변환한다. 원본 h1은 일반 태그 제거 대상이어서 본문
문장이나 목록으로 남는다. 예를 들어 SSR 글의 `📌 SPA란?`, 메모이제이션 글의 `메모이제이션이란?`은
paragraph에 들어 있다. 제목 스타일과 목차에서도 빠진다.

번호 목록은 `PostBodyRenderer`가 각 orderedList 노드마다 새 ol을 생성하고 start/value를 지정하지
않는다. Nest 글의 연속된 설명 2개, 10x 후기의 이벤트 흐름 3개, React Router 글의 3개 항목, ICT
후기의 5개 항목이 해당한다. 원래 연속 번호가 필요한 목록을 브라우저가 각각 1번부터 계산한다.

### 4. 강조·이미지 문법과 캡션 손상

- GGUF/MLX, AWS 서평, 우리 프로그래머들, 로그인 글 등에서 `**`가 문장에 남는다.
- `parseInline`은 문자열이 **로 시작하고 끝나면 중간 구성과 관계없이 외곽 두 글자씩을 제거하고
  전체를 bold로 취급한다. 여러 강조 구간을 가진 문장에서 짝이 깨질 수 있다.
- marks 또는 href가 있으면 공개 렌더러가 인라인 Markdown 파싱을 건너뛴다. 이미 잘못 저장된 강조
  구분자가 그대로 출력된다.
- figcaption은 인라인 Markdown 파싱 없이 문자열로 출력한다.
- Certificate Manager와 Data Stream 글의 `[![](이미지)](링크)`는 image 노드로 변환되지 않는다.
  인라인 링크 정규식도 중첩 이미지 문법을 처리하지 못한다.
- 이미지 다음의 일반 문단을 무조건 캡션으로 흡수하는 fallback 때문에 GGUF 글의 도입 문단 등이
  캡션으로 들어 있다. 정확한 원문 캡션 경계를 확인해 복구해야 한다.
- 빈 `##` 또는 `###`가 SEO 글·개인 이슈 트래커의 paragraph, AI UI 글·Electron/Tauri 글의
  figcaption에 남는다.

## 35개 글별 결과

| 글                                                                                                                                                     | 확인한 문제·검토 항목                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| [Nest DI & IoC](https://hozorica.com/blog/nest-di-ioc)                                                                                                 | 번호 목록 분리                                                  |
| [10x 프로덕트 데이터 분석 수업 후기](https://hozorica.com/blog/10x-product-data-analysis-review)                                                       | 번호 목록 분리                                                  |
| [AI와 협업하는 디자인 시스템 만들기](https://hozorica.com/blog/hozui-with-ai)                                                                          | 이번 자동 검사에서 이상 미검출                                  |
| [검증 가능한 AI UI 설계하기](https://hozorica.com/blog/verifiable-ai-ui-design)                                                                        | 코드 펜스 노출, 강조 문법 잔여 2곳, 빈 제목 문법 노출           |
| [강남언니 SEO 웹 전략을 보고 정리한 테크니컬 SEO](https://hozorica.com/blog/gangnamunni-technical-seo-strategy)                                        | 빈 제목 문법 노출                                               |
| [한국어 번역으로 기여하기](https://hozorica.com/blog/contributing-korean-translation)                                                                  | 이번 자동 검사에서 이상 미검출                                  |
| [태그 기반 추천에서 임베딩 기반 맞춤 추천으로 바꾼 과정](https://hozorica.com/blog/tag-recommendation-to-embedding-recommendation)                     | 코드 펜스 노출                                                  |
| [AI로 더 빨리 만들수록, 더 깊게 이해해야 한다](https://hozorica.com/blog/build-faster-with-ai-understand-deeper)                                       | 이번 자동 검사에서 이상 미검출                                  |
| [쉽고 간편한 SSL/TLS 인증서 등록, 발급, 관리를 위한 Certificate Manager](https://hozorica.com/blog/ssl-tls-certificate-manager)                        | 원문 h1 1개 구조 소실, 링크 이미지 문법 노출                    |
| ["코딩 1도 몰라도 된다"는 말이 가장 무섭다: 모아이 ADK 발표 후기](https://hozorica.com/blog/moai-adk-talk-review)                                      | 표 1개 소실                                                     |
| [현업에서는 이렇게 AI를 운영한다 - 구름 커밋 후기](https://hozorica.com/blog/goorm-commit-ai-operations-review)                                        | 이번 자동 검사에서 이상 미검출                                  |
| [프론트엔드 개발자의 시선으로 바라본 AWS의 전체 구조](https://hozorica.com/blog/aws-overview-for-frontend-developers)                                  | 강조 문법 잔여 6곳                                              |
| [거부기린 - 만 명의 사용자가 내 서비스를 이용해봤다고?](https://hozorica.com/blog/geobugirin-10000-users-retrospective)                                | 코드 펜스 노출, 표 3개 소실, 강조 문법 잔여 3곳, 장문 캡션 검토 |
| [GGUF, MLX 그게 뭔데..?](https://hozorica.com/blog/gguf-mlx-explained)                                                                                 | 강조 문법 잔여 9곳                                              |
| [Electron 웹뷰 앱을 Tauri Native UI로 마이그레이션하기 1: 왜 지금 갈아타는가](https://hozorica.com/blog/electron-webview-to-tauri-native-ui-migration) | 빈 제목 문법 노출                                               |
| [서버 관리 없이 실시간 데이터 처리, 네이버클라우드 Data Stream 살펴보기](https://hozorica.com/blog/naver-cloud-data-stream)                            | 표 1개 소실, 강조 문법 잔여 2곳, 링크 이미지 문법 노출          |
| [TypeScript 컴파일러 성능 측정 (3.9 vs 5.8)](https://hozorica.com/blog/typescript-compiler-performance-39-vs-58)                                       | 표 1개 소실, 강조 문법 잔여 4곳                                 |
| [AI 시대의 개인 이슈 트래커 - 나만의 Linear를 만들어봤다](https://hozorica.com/blog/ai-personal-issue-tracker-linear)                                  | 표 1개 소실, 빈 제목 문법 노출                                  |
| [타입 스크립트 컴파일러 동작 방식](https://hozorica.com/blog/typescript-compiler-internals)                                                            | 코드 펜스 노출                                                  |
| [AI 에이전트 스킬 vs 멀티에이전트](https://hozorica.com/blog/ai-agent-skills-vs-multi-agent)                                                           | 표 1개 소실, 장문 캡션 검토                                     |
| [CS 디자인 패턴 정리 및 면접 포인트](https://hozorica.com/blog/cs-design-patterns-interview)                                                           | 코드 펜스 노출, 표 2개 소실                                     |
| [우리, 프로그래머들 서평](https://hozorica.com/blog/woori-programmers-book-review)                                                                     | 원문 h1 5개 구조 소실, 강조 문법 잔여 4곳                       |
| [개발자는 글을 못쓴다고요 서평](https://hozorica.com/blog/developer-writing-book-review)                                                               | 코드 펜스 노출, 원문 h1 1개 구조 소실                           |
| [[Nextjs] Next.js로 구현하는 로그인](https://hozorica.com/blog/nextjs-login-implementation)                                                            | 코드 펜스 노출, 강조 문법 잔여 3곳                              |
| [[Next.js] 서버 컴포넌트 vs 클라이언트 컴포넌트](https://hozorica.com/blog/nextjs-server-client-components)                                            | 코드 펜스 노출, 원문 h1 1개 구조 소실                           |
| [React-Router-Dom 로더와 액션](https://hozorica.com/blog/react-router-loader-action)                                                                   | 코드 펜스 노출, 원문 h1 3개 구조 소실, 번호 목록 분리           |
| [2025 ICT 인턴십 합격 후기](https://hozorica.com/blog/ict-internship-2025-review)                                                                      | 원문 h1 6개 구조 소실, 번호 목록 분리                           |
| [깃허브 액션으로 CI해보기](https://hozorica.com/blog/github-actions-ci)                                                                                | 코드 펜스 노출                                                  |
| [[React] 리액트 개발 도구를 활용해 좋은 웹 어플리케이션 만들기](https://hozorica.com/blog/react-devtools-guide)                                        | 코드 펜스 노출, 원문 h1 2개 구조 소실                           |
| [[React] SSR은 뭘까..?](https://hozorica.com/blog/react-ssr-explained)                                                                                 | 원문 h1 4개 구조 소실                                           |
| [2024 Sparcs 과학 해커톤 회고](https://hozorica.com/blog/sparcs-science-hackathon-2024-retrospective)                                                  | 원문 h1 8개 구조 소실                                           |
| [[React] useThrottle과 useDebounce에 대해서 알아보자](https://hozorica.com/blog/react-throttle-debounce)                                               | 코드 펜스 노출, 원문 h1 5개 구조 소실                           |
| [[React] 언제 메모이제이션을 해야할까?](https://hozorica.com/blog/react-memoization-timing)                                                            | 코드 펜스 노출, 원문 h1 6개 구조 소실                           |
| [깃허브 페이지 커스텀 도메인 연결하기](https://hozorica.com/blog/github-pages-custom-domain)                                                           | 코드 펜스 노출, 표 2개 소실                                     |
| [정규표현식](https://hozorica.com/blog/regular-expression)                                                                                             | 코드 펜스 노출, 표 3개 소실, 원문 h1 1개 구조 소실              |

## 검증과 한계

- 공개 API: `GET https://cms.hozorica.com/api/public-content?limit=100&includeTotal=true` —
  total=35, posts=35. 모두 structured JSON.
- 읽기 전용 검사: `python3 /tmp/audit-blog-content.py` — 운영 상세 35개와 로컬 시안 상세 35개 HTTP
  200, 본문 HTML·노드 유형 대조.
- 티스토리 공개 원문 32개를 가져와 표·h1·코드 내용 대조.
- Aside 브라우저 snapshot에서 AI UI 글의 백틱 노출을 재현.
- 이미지 103개는 Python urllib GET/HEAD에서 403이 나왔으나 curl GET 전수 검사에서는 모두 HTTP 200과
  image Content-Type을 반환했다(WebP 92, PNG 6, GIF 4, JPEG 1). 파일 누락으로 판정하지 않았다.
  브라우저의 실제 이미지 디코딩까지 전수 확인한 결과는 아니다.
- 변경은 이 조사 문서뿐이다. 앱 소스·발행 콘텐츠·D1/R2 원격 데이터는 수정하지 않았다. 기존 사용자
  변경을 보존했다.
- 코드 변경이 없어 lint/typecheck/test/build는 실행하지 않았다.
- 전체 외부 링크 목적지, 모든 이미지의 실제 디코딩, 모바일·데스크톱의 전체 화면 시각 검수는 완료
  범위에 포함하지 않았다.
- 현재 앱의 remote와 d1r2 경로는 모두 `toPublicSourcePost → loadPostContent → PostBodyRenderer`를
  사용한다. 실제 네트워크 검사는 현재 설정된 remote 공개 경로이며, D1 직접 경로는 코드 추적으로
  확인했다.

## 복구 순서

1. 원문 pre/code를 독립적으로 보존하는 변환과 회귀 테스트를 먼저 준비한다. 코드 펜스 안 빈
   줄·JSX·제네릭·들여쓰기 보존을 확인한다.
2. 표·제목·목록·캡션의 모델 표현과 변환 계약을 결정하고 공개 렌더러와 CMS 편집 경로를 함께 맞춘다.
3. 티스토리 원본에서 손상된 내용을 다시 추출해 현재 글 id·slug·게시일·수정 내용을 보존하는 dry-run
   복구안을 만든다.
4. 수정 전후 본문 차이, 대상 글 수, rollback 자료와 재실행 방법을 검증한 뒤 원격 콘텐츠 변경을 별도
   수행한다.

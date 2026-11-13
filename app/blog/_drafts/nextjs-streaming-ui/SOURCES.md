# Next.js 스트리밍 UI 초안 자료

- 노션 원문: https://app.notion.com/p/41725d3f8c8b81f18983fba7202c8a68
- 변환일: 2026-11-14 (Asia/Seoul).
- 원문 스냅샷: /Users/choiho/Documents/Codex/2026-11-14/nextjs-streaming-conversion/notion-source.md
- 비공개 초안: app/blog/_drafts/nextjs-streaming-ui/page.mdx
- 발행용 slug / canonical 경로: nextjs-streaming-ui / /blog/nextjs-streaming-ui
- 메타데이터 날짜 2026-11-14는 초안용 임시 날짜다. 원문에 발행일은 없으며 정식 발행 전에 확정한다. 노션 수정일을 발행일로 사용하지 않았다.
- 처음 변환할 때는 사용자가 확정한 ‘한다’체를 유지했다. 후속 요청으로 현재 제목·본문·표는 ‘입니다·합니다’체로 바꿨으며 코드 예제 안의 문자열은 보존했다.

## 변환과 보존

노션의 6개 절, 표 4개, 코드 블록 13개를 보존했다. <code>·<b> 마크업을 Markdown 인라인 코드·강조로 바꾸고 JSX가 들어 있는 코드 펜스의 언어만 ts에서 tsx로 바로잡았다. 한글 조사 바로 앞의 강조 구문이 별표로 표시되던 RSC 용어는 <strong>으로 보존했다. 코드 본문·예시 수치·타임라인·의사 코드에 대한 설명은 바꾸지 않았다. 0.2초·3초는 설명용 가정이며 실제 측정값이 아니다.

원문을 수정하지 않았다. 새 흐름도·데모와 이미지·미디어는 추가하지 않았다. 원문 fetch에서 이미지·임베드·하위 페이지·토글 및 잘린 콘텐츠 표시가 없었다. 데이터 조회 함수는 존재를 가정한 설명용 예제이며 현재 블로그의 기능으로 구현하지 않는다.

현재 노션 fetch의 본문에는 참고 자료 절이 없었다. 이 대화에서 확인·정리한 링크를 아래에 보존했으며 글 화면에는 외부 링크 목록을 표시하지 않는다.

## 참고한 글

- 스트리밍 JSON 한국어 번역: https://hanameee.github.io/posts/progressive_json
- Progressive JSON 원문: https://overreacted.io/progressive-json/
- 스트리밍 HTML과 DOM 비교 알고리즘 한국어 번역: https://soobing.github.io/react/html-node-streaming/
- Streaming HTML 원문: https://aralroca.com/blog/html-node-streaming
- 리액트 서버 컴포넌트 톺아보기 한국어 번역: https://roy-jung.github.io/250323-react-server-components/
- The Forensics of React Server Components 원문: https://www.smashingmagazine.com/2024/05/forensics-react-server-components/

## 공식 문서

- https://nextjs.org/learn/dashboard-app/streaming
- https://nextjs.org/docs/app/guides/streaming
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://nextjs.org/docs/app/api-reference/file-conventions/loading
- https://nextjs.org/docs/app/getting-started/fetching-data
- https://react.dev/reference/react/use
- https://ko.react.dev/reference/react/Suspense

## 추가 자료

- 선언적 부분 업데이트 번역: https://ykss.netlify.app/translation/2026/declarative-partial-updates/
- 제안 저장소: https://github.com/WICG/declarative-partial-updates
- 리액트 렌더링의 미래: https://kofearticle.substack.com/p/korean-fe-article-06e

## MDX 변환 단계의 검증 결과

- Node v24.22.1, pnpm 10.28.1에서 pnpm test 84개, pnpm lint, pnpm exec tsc --noEmit, pnpm build 통과.
- 임시 공개 경로 app/blog/nextjs-streaming-ui/page.mdx로 MDX 컴파일과 실제 브라우저 렌더링을 확인했다. 제목 1개, 본문 h2 6개, 자동 목차 링크 18개, 표 4개, 코드 블록 13개가 표시됐다.
- 1280px 데스크톱·375px 모바일에서 페이지 가로 넘침이 없었다. SUIT 700, 본문 15px·인라인 코드 14.125px·코드 블록 14px을 확인했다. 긴 코드는 기존 코드 영역 안에서 스크롤한다.
- 목차를 키보드 Tab·Enter로 이동하고 2px focus-visible outline 및 앵커 이동을 확인했다. 코드 복사 성공 상태와 메인↔상세 링크 이동을 확인했다.
- 스크린샷: /Users/choiho/Documents/Codex/2026-11-14/nextjs-streaming-conversion/verification/ 의 desktop.png, mobile.png, mobile-code.png.
- 원문과 MDX의 코드 본문·표를 완전히 대조했다. 인라인 마크업을 제외한 본문도 일치했다. 예제 코드 자체의 데이터 조회나 상호작용 실행 검증은 하지 않았으며 코드 블록으로서 렌더링되는 것을 검증했다.
- 일회성 공개 미리보기 경로를 제거하고 다시 빌드했다. 최종 라우트 목록에 /blog/nextjs-streaming-ui는 없다. 기존 개발 서버는 유지했고 새 서버·데모는 만들지 않았다.
- git diff --check 통과. 기존 사용자 변경·노션 원문·전역 스타일·디자인 기준·아카이브는 수정하지 않았다. 커밋·push·배포하지 않았다.

## 후속 요청: 흐름도와 데모

- 1절 타임라인 표 뒤: StreamingComparison. 동일한 0.2초·3초 조건에서 전체 응답 대기와 영역별 표시를 나란히 비교한다. 경과 시간을 직접 이동하고 재생·일시정지·다시 재생할 수 있다.
- 2절 template 설명 뒤: HtmlStreamFlow. 초기 HTML, 나중에 도착한 댓글 HTML·스크립트, DOM 교체를 연결한 정적 흐름도다. 모바일에서는 세로로 배치한다.
- 4절 중첩 경계 설명 뒤: SuspenseBoundaries. 하나의 경계·독립 경계·중첩 경계를 나란히 보여주며 느린 영역을 본문 또는 댓글로 바꿀 수 있다. 선택 변경은 재생 상태를 초기화한다.
- 구현: visuals/StreamingDemo.tsx, visuals/HtmlStreamFlow.tsx, visuals/model.ts, visuals/streaming.module.css. 기존 TypeScript 글의 Frame과 프레임·컨트롤 스타일을 재사용했다. 글로벌 스타일과 확정 디자인 파일은 바꾸지 않았다.
- 기존 본문은 연결 문장 하나와 import·삽입만 추가했다. 6개 절·표 4개·코드 블록 13개를 유지했고 노션 원문은 수정하지 않았다. 도표 아래에 새 캡션이나 설명을 붙이지 않았다.
- 순수 상태 모델 테스트를 먼저 실행해 구현 파일 부재로 실패하는 것을 확인한 뒤 구현했다. 새 테스트는 준비 시점의 경계값, 댓글이 먼저 준비됐을 때 중첩 경계의 대기, 일시정지·재생·종료·시점 이동을 검증한다. pnpm test 총 88개 통과, pnpm lint·pnpm exec tsc --noEmit·임시 라우트를 포함한 pnpm build 통과.
- 브라우저에서 0.2초에 본문만 먼저 표시되는 상태와, 본문이 느릴 때 독립 경계에서만 댓글이 표시되는 상태를 확인했다. 재생·일시정지·다시 재생·시간 이동·느린 영역 변경에 따른 초기화를 실제 조작했다. 완료 후 자동 반복하지 않는다.
- 화면 밖에서 경과 시간이 멈추는 것을 확인했다. Aside의 탭 전환은 document.hidden을 바꾸지 않아 실제 비활성 탭 조건을 재현하지 못했다. 대신 QA 페이지에서 테스트용 hidden/visibilitychange 신호를 주입해 정지와 복귀 후 재개를 확인하고 즉시 원복했다. 실제 탭 비활성화의 직접 검증과 구분한다.
- 1280px·375px에서 화면과 도표의 가로 넘침이 없고 글자가 잘리지 않았다. 모션 줄이기에서는 3초 완료 상태를 정적으로 표시하고 재생·시간 조작은 비활성화한다. 다크 모드의 완료색·배경과 키보드 2px 초점도 확인했다.
- 본문 h2 6개, 자동 목차 링크 18개, 코드 13개, 표 4개를 확인했다. 시각화 제목은 목차에 포함되지 않으며 코드 복사도 성공했다.
- 스크린샷과 브라우저 로그: /Users/choiho/Documents/Codex/2026-11-14/nextjs-streaming-conversion/visual-verification/.
- 데모는 브라우저 안에서 상태를 재생하는 설명용 시뮬레이션이다. 실제 API 요청·서버 스트리밍·React Suspense 렌더러를 실행하거나 성능을 측정하지 않는다. HTML 흐름도에는 애니메이션 시간이나 측정값이 없다.
- 일회성 공개 경로를 제거한 뒤 다시 pnpm build·pnpm exec tsc --noEmit·git diff --check를 통과했다. app-paths-manifest에도 이 글의 공개 라우트가 없음을 확인했다. 코드 본문 13개와 표 4개는 노션 보존본과 일치한다. 커밋·push·배포는 하지 않았다.

## 후속 요청: animation 글의 데모 표현 참고

- 사용자 지정 참고: https://yunbh.vercel.app/blog/animation . Aside에서 실제 데모를 조작하고 나란히 놓인 화면, 옅은 바탕·흰 화면, 모서리의 작은 재생 버튼, 등장 순서에 따른 차이를 확인했다. 원저자의 문구·이미지·구현 코드를 복제하지 않았다.
- 두 인터랙티브 데모를 상태 카드 중심에서 작은 블로그 화면 중심으로 바꿨다. 조회 카드와 범례는 제거하고, 스켈레톤·본문·가상 댓글 두 개로 실제 표시 순서를 보여준다. 가상 댓글은 설명용 콘텐츠다.
- 전환은 준비 상태 변화에 맞춘 opacity 220ms·translateY 6px/260ms ease-out이다. 로딩 스피너는 재생 중에만 돌고 화면 밖·비활성 상태·모션 줄이기에서는 멈춘다. 실제 응답 시간이나 성능 측정값을 나타내지 않는다.
- 재생·일시정지·다시 재생을 작은 아이콘 버튼으로 정리하고, 시간 슬라이더와 느린 영역 선택은 유지했다. 선택을 바꿀 때 시간은 0으로 돌아가고 select의 키보드 초점은 유지된다. 기존 경계 모델과 Node 테스트는 변경하지 않았다.
- 외부 프레임의 12px 라운드·타이포그래피·간격 토큰, 본문·전역 CSS·정적 HTML 흐름도는 유지했다. 수정 파일은 StreamingDemo.tsx와 streaming.module.css이며 필요한 기록만 덧붙였다.
- Node 24.22.1에서 테스트 88개·린트·타입 검사·임시 공개 라우트를 포함한 빌드 통과. 브라우저에서 0.2초 준비 상태, 경계별 차이, 재생·정지·다시 재생·시점 이동·선택 초기화·화면 밖 정지를 확인했다. 375px에서 페이지와 figure 가로 넘침이 없고 목차 18개·코드 13개가 유지됐다. 코드 복사, select 초점 보존, 다크 모드·모션 줄이기 최종 상태도 확인했다.
- 참고 화면과 구현 검증 스크린샷·로그: /Users/choiho/Documents/Codex/2026-11-14/nextjs-streaming-conversion/reference-animation/.

## 후속 요청: 로컬 미리보기 유지

사용자가 데모를 로컬에서 직접 보도록 요청해 app/blog/nextjs-streaming-ui/page.mdx를 만들고 기존 localhost:3000 개발 서버에서 열었다. 비공개 초안과 본문·메타데이터가 같고, 시각화 import만 비공개 초안의 컴포넌트를 가리킨다. 이 미리보기 경로와 기존 서버는 유지한다. 공개 경로에 있는 파일은 향후 배포에 포함될 수 있으나 이번 요청은 로컬 미리보기이며 커밋·push·배포는 하지 않았다.

## 후속 요청: 합니다체·슬라이더 제거·자동 재생

- 제목·본문·표와 데모의 가상 댓글을 입니다·합니다체로 통일했다. 코드 펜스 13개 안의 코드는 그대로 유지했으며 노션 원문은 수정하지 않았다.
- 슬라이더, 관련 CSS와 더 이상 쓰지 않는 seek 액션을 제거했다. 데모는 뷰포트에 들어오면 한 번 자동으로 재생되고, 화면 밖에서는 멈추며 다시 들어오면 이어 재생한다. 느린 영역을 변경하면 0부터 자동으로 다시 재생한다. 수동 일시정지·재생·다시 재생과 모션 줄이기에서는 완료 상태 표시를 유지한다.
- 자동 재생 동작 테스트를 먼저 실패시킨 후 초기 상태 생성 함수를 추가했다. Node 24.22.1에서 테스트 89개·린트·타입 검사·빌드를 통과했다.
- 실제 브라우저에서 슬라이더 0개, 화면 진입 후 자동 재생, 화면 밖 대기, 한 번 재생 후 정지, 선택 변경 후 재생과 select 초점 유지, 375px 가로 넘침 없음, 모션 줄이기 정적 완료 상태, 코드 복사를 확인했다. 목차 링크는 18개다.
- 로그·화면: /Users/choiho/Documents/Codex/2026-11-14/nextjs-streaming-conversion/autoplay-verification/ . 로컬 미리보기는 초안과 동기화해 유지했다.


## 후속 요청: 화면 진입·반복 재생·진행률 표시

- 두 데모 모두 화면에 20% 이상 들어오면 시작한다. 3초 재생 후 완료 화면을 2초 유지하고 처음부터 반복한다. 화면 밖이거나 문서가 숨겨지면 재생·대기 시간이 멈추고, 복귀하면 이어진다.
- 데모 하단에 수동 조작이 없는 progressbar를 추가했다. 재생 중 0~100%로 차오르고, 대기 중에는 100%와 ‘완료 · 다시 재생 대기’를 표시한다. 슬라이더는 추가하지 않았다. 일시정지·재생·다시 재생 및 시나리오 변경 초기화를 유지했다.
- 반복 주기 경계, 대기 중 일시정지, 여러 주기를 넘긴 시간 보존 테스트를 먼저 실패시킨 후 구현했다. Node 24.22.1에서 pnpm test 90개, pnpm lint, pnpm exec tsc --noEmit, pnpm build를 통과했다.
- 실제 브라우저에서 진입 전 0%, 진입 후 증가, 100% 완료 대기, 다음 주기 재시작, 수동 정지 시 고정, 화면 밖 5.2초 동안 고정, 선택 변경 및 select 초점 유지를 확인했다. progressbar는 키보드 초점 대상이 아니고 range input은 0개다.
- 375px 모바일 문서 너비는 375px로 가로 넘침이 없었다. 모션 줄이기에서는 두 데모 모두 정적 100% 완료 상태와 비활성 재생 버튼을 확인했다. 본문 h2 6개, 코드 블록 13개, 표 4개를 유지했다.
- 화면·로그: /Users/choiho/Documents/Codex/2026-11-14/nextjs-streaming-conversion/loop-verification/ . 기존 로컬 미리보기 경로와 개발 서버를 유지했다. 커밋·push·배포하지 않았다.

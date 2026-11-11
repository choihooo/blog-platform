# GA4 · Microsoft Clarity

`components/Analytics.tsx`를 루트 레이아웃에서 한 번 불러옵니다. 화면 요소나 스타일은 추가하지 않고 `next/script`의 `afterInteractive` 전략으로 추적 코드를 실행합니다. 추가 패키지는 필요하지 않습니다.

## 연결

1. GA4에서 `https://hozorica.com`용 웹 데이터 스트림을 만들고 측정 ID(`G-…`)를 확인합니다. 보고 시간대는 대한민국 서울, 통화는 KRW를 사용합니다.
2. Clarity에서 같은 사이트 주소로 프로젝트를 만들고 프로젝트 ID를 확인합니다.
3. Vercel의 **Production** 환경에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`와 `NEXT_PUBLIC_CLARITY_PROJECT_ID`를 등록하고 재배포합니다.

두 값은 브라우저에 공개되는 식별자이며 계정 비밀번호나 API 비밀키가 아닙니다. 실제 설정값은 Git에 넣지 않습니다. `VERCEL_ENV=production`일 때만 추적 코드를 포함하므로 로컬 개발과 Preview는 수집하지 않습니다. 각 ID가 비어 있거나 형식이 잘못되면 해당 서비스의 스크립트를 생략합니다.

## 페이지 이동과 확인

GA4 웹 스트림의 향상된 측정에서 페이지 조회와 **브라우저 기록 이벤트에 따른 페이지 변경**을 켭니다. 초기 조회와 Next.js의 클라이언트 페이지 이동은 Google 태그가 수집합니다. 중복 조회를 막기 위해 별도 라우트 변경 이벤트는 보내지 않습니다.

배포 후 홈 → 글 상세 → 홈을 이동하며 브라우저 네트워크에서 GA4의 `g/collect`와 Clarity의 `collect` 요청을 확인합니다. GA4 실시간 보고서에서도 방문이 표시되는지 확인하고, Clarity에서는 수집 상태와 이후 세션 녹화를 확인합니다. 광고 차단 확장 기능은 요청을 막을 수 있습니다.

Clarity의 Settings → Setup에서 Google Analytics 통합을 연결하면 Clarity 안에서 GA 데이터를 함께 볼 수 있습니다. 두 스크립트의 수집 자체에 필수인 설정은 아닙니다.

## 사용자 행동 이벤트

`AnalyticsEvents`는 유효한 GA4 ID가 있는 Production에서만 마운트됩니다. 이벤트 전송 오류는 사용자 동작으로 전파하지 않으며, 외부 Google 태그 로드 전 이벤트는 기존 데이터 레이어에 대기합니다. 페이지 조회는 기존 자동 수집을 그대로 사용합니다.

| 이벤트 | 기록 시점 | 주요 매개변수 |
| --- | --- | --- |
| `article_like` | 서버에 좋아요·취소가 저장된 뒤 | `article_slug`, `like_action` (`like`/`unlike`) |
| `comment_submit` | 서버가 댓글 저장 성공을 반환한 뒤 | `article_slug` |
| `search_open` | 검색 창 열기 | 없음 |
| `blog_search` | 300ms 검색이 완료되고 결과가 확정됐을 때 | `query_length`, `result_count` |
| `search_result_click` | 검색 결과 선택 | `article_slug`, `result_position` (1부터) |
| `code_copy` | 클립보드 복사 성공 또는 실패 | `copy_status`, `code_language`, `code_index` (본문에서 1부터) |
| `github_click` / `email_click` | 해당 링크 클릭 | `link_location` (`header`/`footer`/`article`/`other`) |
| `article_read_progress` | 본문 도달 구간을 처음 통과 | `article_slug`, `article_visit_id`, `percent_scrolled` |
| `article_read_summary` | 탭 숨김·페이지 종료·다른 경로 이동 | 아래 읽기 요약 매개변수 |

각 이벤트의 `page_path`와 `page_location`에는 query/hash를 제외한 경로만 넣습니다. 서버 응답 전에 페이지를 옮겨도 좋아요·댓글 이벤트는 저장한 원래 글의 경로를 사용합니다. 검색어·댓글 원문·닉네임·이메일 주소·복사한 코드는 보내지 않습니다. 전송 함수는 이벤트별 허용 매개변수만 통과시킵니다.

### 글을 어디까지 봤는지

본문의 시작(제목·메타데이터·목차 제외)부터 본문 끝까지를 100%로 봅니다. 화면 아래쪽이 본문의 25·50·75·90·100%를 처음 통과할 때 `article_read_progress`를 한 번씩 보냅니다. 짧은 글이 화면 안에 모두 들어오면 곧바로 100%이며, 이는 화면 도달을 뜻할 뿐 실제 독해를 증명하지 않습니다. 댓글·푸터 길이는 분모에 넣지 않습니다.

읽기 요약의 `max_scroll_percent`는 방문 중 최대 도달률, `last_scroll_percent`는 마지막 화면 위치입니다. 끝까지 내렸다가 위로 돌아간 경우 두 값은 다릅니다. `max_section`과 `last_section`은 각각 해당 위치에서 화면 중간 위에 있던 마지막 h2/h3의 ID이며, 첫 섹션 앞은 `intro`입니다.

`active_read_seconds`는 탭이 보이고 본문이 화면에 걸려 있던 시간으로, 직전 요약 이후의 증분 초입니다. 숨긴 탭이나 본문 밖에서 보낸 시간은 제외합니다. 스크롤·창 크기·본문 크기 변경은 애니메이션 프레임으로 합쳐 측정합니다.

`summary_reason`은 `tab_hidden`, `page_exit`, `route_change`입니다. 숨김은 탭 전환일 수도 있으므로 종료 확정으로 해석하지 않습니다. 숨김 직후 pagehide가 연달아 와도 같은 상태는 중복 전송하지 않습니다. 다시 돌아와 더 읽으면 같은 `article_visit_id`에 증가하는 `summary_sequence`로 추가 요약을 보냅니다. 최대 도달률은 방문 ID별 최신값/최댓값으로, 활성 시간은 증분 합계로 분석합니다. 무작위 방문 ID는 개인정보나 영구 사용자 식별자가 아니며 고카디널리티를 피하려고 맞춤 측정기준으로 등록하지 않습니다.

브라우저·OS 강제 종료, 오프라인, 광고 차단 등으로 마지막 이벤트가 누락될 수 있습니다. 단계별 도달 이벤트도 함께 봅니다. 페이지가 뒤로/앞으로 캐시에 복원되면 같은 방문을 이어가며 숨겨졌던 시간은 더하지 않습니다.

### GA4 보고서에서 보기

속성 `488661671`에 이벤트 범위 맞춤 측정기준 9개(`article_slug`, `percent_scrolled`, `like_action`, `copy_status`, `code_language`, `link_location`, `last_section`, `max_section`, `summary_reason`)와 측정항목 5개(`max_scroll_percent`, `last_scroll_percent`, `active_read_seconds`, `result_count`, `query_length`)를 등록했습니다. 활성 시간 단위는 초, 나머지 측정항목은 표준입니다.

실시간 보고서에서 이벤트 수신을 확인합니다. 탐색에서는 글 식별자와 이벤트 이름/본문 도달 구간을 행으로 두면 글별 진행 구간을 비교할 수 있습니다. 일반 보고서에서 새 맞춤 정의가 표시되기까지는 [Google 안내 기준 24–48시간](https://support.google.com/analytics/answer/14239696)이 걸릴 수 있습니다. 과거 데이터의 소급 집계를 전제로 사용하지 않습니다.

## 공식 안내

- [Next.js Script](https://nextjs.org/docs/app/guides/scripts)
- [GA4 향상된 측정](https://support.google.com/analytics/answer/9216061)
- [Clarity 설치](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup)
- [Clarity와 Google Analytics 통합](https://learn.microsoft.com/en-us/clarity/ga-integration/ga-integration)

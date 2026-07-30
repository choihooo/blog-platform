# Contract: Public Analytics Binding

## Purpose

`apps/blog`가 공개 글 상세와 독자 상호작용을 analytics event contract에 연결하는 방식의 UI 동작 계약이다.

## Article View

- 발행 글 상세 페이지가 표시되면 `article_view`를 한 번 발행한다.
- draft, archived, 404, preview 전용 표면에서는 public analytics event를 만들지 않는다.
- provider disabled 상태에서는 사용자 경험을 변경하지 않고 전송만 생략한다.

## Scroll Milestones

- 본문 기준 50% 지점에 처음 도달하면 `scroll_50`을 발행한다.
- 본문 기준 90% 지점에 처음 도달하면 `scroll_90`을 발행한다.
- 같은 글 페이지 표시 안에서 각 milestone은 최대 한 번만 발행한다.
- 글 slug가 바뀌면 milestone state는 새 글 기준으로 초기화한다.

## Code Copy

- 코드 블록 복사가 성공하면 `code_copy`를 발행한다.
- target에는 코드 블록 위치 또는 안정적인 block id를 넣는다.
- 복사 실패는 성공 이벤트로 기록하지 않는다.

## TOC Click

- 목차 항목 클릭 시 `toc_click`을 발행한다.
- target에는 heading id 또는 heading text에서 파생된 비민감 값을 넣는다.

## Link Click

- 사이트 origin과 같은 URL 또는 root-relative URL 클릭은 `internal_link_click`으로 기록한다.
- 다른 http/https origin 클릭은 `external_link_click`으로 기록한다.
- hash-only, mailto, tel, 빈 href, 파싱 불가능한 href는 ignored로 처리하고 click event를 만들지 않는다.

## Search

- 검색어가 trim 후 비어 있지 않을 때 `search`를 발행한다.
- target에는 trim된 검색어를 넣되, 공개 검색 상호작용에 필요한 값만 포함한다.

## Share

- 공유 동작이 완료되거나 fallback 공유 동작이 실행되면 `share`를 발행한다.
- 브라우저의 기본 공유 기능이 지원되지 않아도 fallback 동작은 공개 페이지를 실패시키지 않아야 한다.

## Acceptance

- provider 설정 누락 시 공개 글 렌더링과 상호작용 오류가 0건이어야 한다.
- configured provider에서는 MVP 이벤트 9종이 canonical event name으로 provider payload에 매핑되어야 한다.
- event binding은 콘텐츠 노출 정책을 변경하지 않아야 한다.

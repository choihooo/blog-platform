# Blog analytics events implementation plan

**Goal:** Add the requested interaction events and article reading depth to the existing GA4 installation without changing visible UI.

**Architecture:** A production-only client observer installs a guarded, allowlisted GA4 sender and observes contact links and article reading. Existing success handlers report likes, comments and copies; settled searches report only counts. Reading state is independent of React and tested with a controlled clock.

**Spec:** Current user request: 좋아요, 댓글 등록, 검색, 코드 복사, GitHub·메일 클릭, 글을 어디까지 보고 떠났는지.

## Constraints

- Keep current styles, layout and interaction behavior. Send no search terms, comment text, nicknames, email addresses or copied code.
- Keep local/Preview tracking disabled. A missing or throwing analytics library must never break an interaction.
- Use the isolated source of the deployed release; exclude concurrent article and search-design changes from deployment. Preserve those changes when applying analytics hooks back to the shared workspace.
- Use article-relative viewport exposure, not document/scrollbar percentage. Distinguish greatest depth from last position and pause active time in hidden tabs or outside the article.
- Exit delivery is best effort. Flush on route change, hidden tab and pagehide, deduplicate overlapping lifecycle events and label the reason.

## Tasks

- [x] Sender and reading state: write failing Node tests for production activation, safe payloads, unavailable GA, link classification, crossed thresholds, reverse scrolling, hidden time, duplicate lifecycle summaries and separate visits; implement the smallest passing modules.
- [x] Wire events: add a nonvisual `AnalyticsEvents` client component; report successful persisted likes/comments, settled searches, result selection, copy result and contact link clicks. Read from the existing article and headings without markup changes.
- [x] Verify and release: run all tests, lint, build, typecheck; browser-test interactions against an isolated local SQLite database and capture the GA boundary without sending test comments to production. Refresh only the affected nonvisual design hashes. Register GA custom definitions, deploy the isolated source and check live event receipt and existing page behavior.

## Event contract

`article_like`, `comment_submit`, `search_open`, `blog_search`, `search_result_click`, `code_copy`, `github_click`, `email_click`, `article_read_progress`, `article_read_summary`.

Progress milestones: 25, 50, 75, 90, 100 percent, once per article visit. Summary: article slug, random visit ID, maximum/last percent, maximum/last section ID, incremental active seconds, reason and sequence. No custom page_view events.

## Review focus

Late API completion after navigation must keep its original article path. Short articles and restored scroll positions must clamp correctly. Hidden/pagehide and back-forward cache must not duplicate a summary or count background time. Query clears/close and IME composition must not report stale or intermediate searches. Analytics failures must not affect successful user actions.

## Verification record

Core tests: 11/11 GREEN after RED for absent modules and canonical GA queue protocol. Isolated full suite: 65/65. Shared workspace suite: 76/76. Lint, build and TypeScript checks passed for both sources. Fresh reviewer found the GA command queue shape issue (fixed with regression test); hidden-only viewport sampling was also removed. Local browser verified all interaction events and two article visits with each milestone once; max 100% versus last 48%, correct sections and route-change summary. Mobile home/article widths were 390px with no overflow; keyboard search and navigation passed. Production deployment and site checks passed; GA4 realtime confirmed search_open, blog_search, search_result_click, code_copy, article_read_progress and article_read_summary after live browser interactions. Registered 9 event-scoped dimensions and 5 metrics. Production dpl_njXNynswVSV6Je6rtMoMuhQohSXm is live. No Git commit or push; concurrent changes preserved. Dedicated local QA server stopped.

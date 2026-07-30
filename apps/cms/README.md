# CMS App

단일 운영자용 비공개 CMS다. GitHub 관리자 검증을 통과한 사용자만 repository content mutation을
실행할 수 있다.

## Publish Workflow

- Save는 draft 저장만 수행하고 public refresh를 실행하지 않는다.
- Publish는 slug와 `publishedAt`을 보정한 뒤 `prepare-publish` intent로 post MDX를 저장한다.
- Unpublish와 Archive는 repository 파일을 유지한 채 status만 `draft` 또는 `archived`로 바꾼다.
- Publish, Unpublish, Archive 이후 public refresh target을 계산하고, refresh 실패는 repository
  commit 성공과 분리해서 표시한다.
- 예약 발행, 승인 workflow, CMS database, RSS/Sitemap 파일 commit은 MVP 범위가 아니다.

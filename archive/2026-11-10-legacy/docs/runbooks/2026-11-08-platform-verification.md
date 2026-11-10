# 운영 검증 runbook — ops-check-platform-20261108-732be769a5

## 범위와 권한

사용자가 포맷 수정·리팩터링 커밋/통합·실제 로그인/R2/발행 갱신/AI 검색 검증을 요청했다. 운영 CMS의
로그인된 관리자 세션과 기존 Cloudflare OAuth 권한을 사용한다. 새 소스의 운영 배포는 하지 않는다.
현재 운영 CMS의 E2E 동작과 통합 소스의 검사 결과를 구분한다.

## 검증 리소스

- Runbook id: `ops-check-platform-20261108-732be769a5`
- 일회성 글 slug: `ops-check-platform-20261108-732be769a5`
- 일회성 이미지: `blog-assets/media/covers/ops-check-platform-20261108-732be769a5-3f9f5cfd0cf9.png`
- 제목: `[운영 검증] 플랫폼 구조 단순화 732be769a5`
- 실행 기록과 정확한 id/결과는 ignored `_workspace/platform-simplification/finish/`에 남긴다.

## 실행 순서

1. 위 slug와 이미지가 존재하지 않는지 확인하고 이미지 삭제 권한을 사전 확인한다.
2. CMS에서 제목·본문·slug를 입력하고 커버 이미지를 업로드한다. R2의 실제 바이트와 URL을 확인한다.
3. Save → Publish 순서로 실행하고 공개 URL·CMS 공개 API에서 같은 글을 확인한다.
4. Unpublish로 공개에서 제거하고, 이 runbook의 slug/id/제목이 모두 일치하는 글만 D1에서 삭제한다.
5. 위 단일 이미지 key만 삭제한다. 글/API/이미지의 부재와 다른 글의 정상 응답을 확인한다.

## rollback과 재실행

기존 글과 이미지는 변경하지 않는다. 실패해도 이 slug의 공개 상태를 먼저 해제한 뒤 위 단일
글·이미지만 삭제한다. id/제목이 예상과 다르면 삭제하지 않는다. D1 삭제는 정확한 id·slug·제목
조건으로 한정한다. 재실행은 새 runbook id·새 slug·새 이미지 key로 시작한다. 같은 id로 발행/업로드를
반복하지 않는다.

## 상태

- 로그인된 운영 CMS에서 Save·Publish 후 공개 API의 `isPublished: 1`을 확인했다.
- 실제 글 id: `fd177374-407a-4a3c-8ccb-a0500635ce13`.
- 운영 업로드는 이미지를 WebP로 정규화했다. 실제 업로드 key는
  `media/covers/ops-check-platform-20261108-732be769a5-285e4e528df0.webp`다.
- 처음 예상한 PNG key는 존재하지 않았고 삭제 권한 사전 확인만 했다. 정리는 실제 WebP key를 대상으로
  한다.
- 공개 페이지 200과 제목·본문 일치, 이미지 200과 실제 WebP 바이트를 확인했다.
- Unpublish 후 D1의 `is_published = 0`을 확인했다. 그러나 운영 공개 API와 Blog가 글을 계속 노출했다.
  CMS의 slug 조회가 발행 상태를 검사하지 않는 기존 오류를 확인했고 소스에 회귀 테스트와 검사를
  추가했다. 새 소스는 배포하지 않았으므로 운영 수정 완료로 해석하면 안 된다.
- 위 id·slug·제목과 `is_published = 0`을 모두 조건으로 단일 D1 글을 삭제했다. 이후 동일 id/slug는
  0건이다.
- 실제 WebP 객체를 삭제했고 공개 이미지 URL은 404다. 글 공개 URL과 CMS 공개 API도 404, 기존
  `/blog/nest-di-ioc`는 200임을 확인했다.
- 발행 시 생성된 검색 벡터 `242e5bd4955d8eb4f09fb7fee97cd54b4dddbaa55e7b7cf8702bceda2051daf3`만
  삭제했다. 비동기 삭제 반영 후 Vectorize 조회에서 해당 id가 없음을 확인했다.
- 임시 리소스 정리 완료. 원래 글·이미지·벡터는 수정하지 않았다.

# 서버 저장소 작업 지침

- Node 서버 전용이며 client/Worker의 pure entry에서 import하지 않는다.
- schema·R2 key·공개 URL·응답/실패 계약을 임의 변경하지 않는다.
- 앱의 인증 guard와 비밀 redaction을 유지한다. 테스트는 mock/임시 로컬 파일만 사용한다.
- 실제 원격 D1/R2 변경·발행·revalidate·배포·대량 sync는 명시 요청이 있을 때만 수행한다.

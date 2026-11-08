# 공통 검색 작업 지침

- 앱·Next.js·Node storage에 의존하지 않고 content/catalog과 Web API를 사용한다.
- 공개 데이터와 현재 corpus 순서·내용·chunk id를 유지한다.
- 모델 `@cf/baai/bge-m3`, 1024차원, namespace `public-v1`, sync batch 16개를 변경하지 않는다.
- chunking·embedding 입력 변경은 기존 인덱스의 재동기화 계획이 필요하며 원격 sync는 명시 요청 전
  실행하지 않는다.

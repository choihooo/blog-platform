# 개발 서버 네이버 모델 연결

2026-09-06. 개발 모드에만 HyperCLOVA X SEED Text Instruct 1.5B Q4_K_M을 연결했다. 프로덕션 기본
URL은 기존 Kanana 설정을 유지한다. 배포하지 않았다.

- 선택: `features/pixel-room/chat-model.ts`, `kanana-model-source.ts`
- 개발 파일: `/models/hyperclova-q4-6e0841f886f5-v1/model.gguf`
- 크기: 1,006,572,160 bytes
- SHA-256 검증: `6e0841f886f55411327d4659308f2408424f0ac55a2d32f60a49f470c71381a6`
- 정확한 다운로드 원본과 revision은 `NAVER_MODEL.sourceUrl`에 기록했다.
- `NEXT_PUBLIC_KANANA_MODEL_URL`을 설정하면 기존처럼 URL을 우선한다. 다른 모델로 override할 경우 UI
  메타데이터도 함께 맞춰야 한다.
- 원복: 개발 URL을 보존된 `LOCAL_SPLIT_MODEL_URL`로 되돌리고 `CHAT_MODEL` 표시를 카나나로 맞춘 뒤
  페이지를 새로고침한다.

모델 파일은 Git에서 제외한다. 다른 로컬 체크아웃에서는 검증한 파일을 위 경로에 별도 준비해야 한다.
파일이 없을 때 외부 호스트로 자동 전환하거나 새 다운로드를 시작하지 않는다.

Wllama와 기존 다운로드/캐시/취소 처리, RAG 검색 API는 유지했다. URL이 달라 카나나 캐시와 분리되며
기존 캐시는 지우지 않는다. 첫 진입 자동 로딩과 모델 준비 중 안내를 유지하고, 헤더·다운로드 용량·개발
진단의 Q4 표시를 변경했다.

별도 실험의 `portfolio-policy.mjs` 전체를 앱에 연결한 것은 아니다. 기존 서비스의 구조화 이력서
출력과 블로그별 생성 방식은 유지한다. 라이선스 재배포 검토와 프로덕션 전환은 별도 작업이다.

검증: 모델 HTTP 200/정확한 Content-Length, 파일 해시 일치, 전체 테스트 92개·타입 검사·lint 통과.
실제 개발 서버 브라우저에서 네이버 모델명이 표시되고 로딩 완료 후 입력이 활성화되는 것을 확인했다.

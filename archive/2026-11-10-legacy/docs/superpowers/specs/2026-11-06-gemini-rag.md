# Gemini RAG 전환 설계

## 목적과 범위

현재 Workers AI BGE-M3 임베딩과 브라우저 Kanana 답변 생성을 Gemini API로 전환한다. 임베딩 전환을
먼저 검증하고 답변 생성 전환을 이어서 적용한다. 이 문서는 제안한 설계이며 아직 원격 리소스
생성·동기화·배포를 승인하거나 수행한 기록은 아니다.

## 결정

- 콘텐츠 권위는 기존 D1·공개 프로젝트·이력서 데이터에 둔다. Vectorize를 계속 사용한다.
- 텍스트 임베딩은 `gemini-embedding-001`, `outputDimensionality: 768`을 사용한다. 문서는
  `RETRIEVAL_DOCUMENT`, 질문은 `RETRIEVAL_QUERY`로 요청하고 양쪽 벡터를 L2 정규화한다. 0벡터·비유한
  값·잘못된 차원은 실패 처리한다.
- Gemini Embedding 2도 무료지만 첫 전환에서는 텍스트 전용 모델로 범위를 제한한다. 모델 변경은 검색
  평가를 거친 별도 인덱스 전환으로 다룬다.
- 새 Vectorize 인덱스는 `hozorica-rag-gemini-001-768-v1`, cosine, namespace `public-gemini-v1`이다.
  기존 1024차원 인덱스·`public-v1`은 보존한다.
- Gemini 키와 임베딩·생성 호출은 Worker에 모은다. Next 서버는 인증된 Worker를 호출하고, 브라우저는
  기존 `/api/rag`만 호출한다. 추가 SDK 없이 서버 `fetch`로 REST API를 사용한다.
- 생성 모델은 `GEMINI_GENERATION_MODEL=gemini-3.8-flash`로 명시한다. 모델 변경이나 계정의 무료 접근
  불가는 자동 대체하지 않는다. `generateContent`의 단발 JSON 응답부터 구현한다. 스트리밍·Google File
  Search·Google Search grounding은 이번 범위에서 제외한다.
- 기존 확정 답변·후속 질문 처리는 유지하고, 검색된 근거가 있는 일반 질문만 Gemini로 생성한다. 근거
  최대 3개, 각 발췌 최대 550자, 답변 최대 4000자 계약을 유지한다. 생성 최대 출력은 1024토큰이며
  요청당 생성 호출은 1회다. 출력 제한 종료나 빈 답변·차단 응답은 성공으로 내보내지 않는다.
- 이전 AI 답변과 클라이언트가 제공한 본문을 근거로 사용하지 않는다. 출처 URL은 서버 검색 결과에서
  결정하고 모델이 만든 URL을 신뢰하지 않는다. 자료 안의 지시문을 따르지 않도록 분리한다.
- 기존 브라우저 모델 코드는 롤백 기간에 별도 컴포넌트로 보존하되 Gemini 모드에서 로드하지 않는다.
  전환 확인 후 삭제는 별도 작업이다.

## 무료 등급 운영

- 무료 등급 전용 Google 프로젝트를 사용한다. 실제 모델별 RPM·TPM·RPD는 구현·실행 시 AI Studio에서
  확인한다. 문서의 무료 제공 여부가 해당 계정의 사용 가능 용량을 보장하지 않는다.
- 유료 전환·결제 연결·키 등록은 자동 실행하지 않는다. Vectorize 비용은 별도다.
- 동기화는 기존 16청크 페이지·revision을 유지하되 Gemini 요청은 청크당 1회, 동시성 1로 시작한다.
  계정 할당량에 맞춘 요청 간격을 필수 설정하고 429에서는 진행 위치를 유지해 중단한다. 유료 비동기
  Batch API는 사용하지 않는다.
- `/search`와 `/answer`는 같은 Worker aggregate 30회/60초 제한을 공유한다. 이것은 전역 예산 상한이
  아니며 Google 프로젝트 할당량이 최종 제한이다. 무제한 재시도는 금지한다.
- 무료 등급의 데이터 처리 조건을 사용자에게 고지한다. 공개 콘텐츠와 질문만 전송하며 비밀키·질문·
  원문·공급자 오류 본문을 로그에 남기지 않는다.

## 전환·완료 기준

- provider·모델·차원·task type·정규화·입력 포맷 버전을 임베딩 프로필에 고정하고 새 ID에 포함한다.
  legacy 프로필은 기존 청크 ID를 그대로 재현한다. 검색·동기화·stale 검증은 같은 프로필을 사용한다.
- 새 인덱스의 동기화·비동기 반영·검색 품질을 확인한 뒤 검색 provider를 변경한다. 기존 0.48 컷오프를
  Gemini 성능 근거로 간주하지 않고 평가 세트에서 별도 보정한다.
- 검색 뒤 최신 D1 공개 상태를 재검증하며 미발행·삭제·수정된 stale 청크를 제외한다.
- 인증·입력 제한·same-origin·no-store·400/429/503 의미를 유지한다. Gemini 429는 429, 그 외 호출
  실패는 503으로 반환하고 정상적인 근거 없음으로 바꾸지 않는다.
- 새 인덱스 전환과 Gemini 생성은 독립적으로 롤백할 수 있어야 한다. 롤백 시 최신 콘텐츠로 legacy
  인덱스를 재동기화하고 반영을 확인한다. 그동안은 구조화 답변만 제공하거나 검색을 중단한다.
- mock 검사와 실제 공급자·브라우저 검증을 구분한다. 실제 호출·원격 변경은 실행 단계에서 사용자 요청
  범위를 확인한 뒤 진행한다.

## 근거

2026-11-06 공식 문서 확인:

- [Gemini 임베딩·task type·축소 차원 정규화](https://aistudio.google.com/docs/embeddings)
- [일반 생성 REST API](https://ai.google.dev/api/generate-content)
- [모델별 무료 등급 가격표](https://aistudio.google.com/docs/pricing)
- [프로젝트별 할당량](https://aistudio.google.com/docs/rate-limits)
- [Vectorize 최대 1536차원](https://developers.cloudflare.com/vectorize/platform/limits/)

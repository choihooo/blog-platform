# 운영 카나나 3조각 다운로드

## 구성

- 모델은 기존 Kanana 2 1.3B Q8 그대로다. 재양자화하지 않았다.
- R2 버킷: `blog-assets`, 경로: `models/kanana-q8-0b63b6b68f0c-v1/`.
- 조각: `kanana-q8-00001-of-00003.gguf`부터 `00003`까지.
- 크기: 516,791,200 / 511,608,032 / 349,491,776 bytes.
- 공개 기본 주소는 `kanana-model.json.publicModelBaseUrl`로 관리한다.
- Wllama 3.6.1이 첫 파일명에서 나머지 URL을 계산하며 `parallelDownloads: 3`으로 동시에 받는다.
- 기존 다운로드 진행률, 브라우저 캐시, 전체 다운로드 후 런타임 초기화 흐름을 유지한다.
- 파일 분할은 전체 용량이나 추론 메모리를 줄이지 않는다. 일부 조각만으로 답변을 시작하지 않는다.

## 업로드·접근 설정

Wrangler 기본 업로드 크기 제한 때문에 기존 Wrangler 로그인과 원격 R2 바인딩을 이용해 8MiB 파트로
멀티파트 업로드했다. 업로드용 공개 API, 새 인증 키, 추가 운영 Worker는 만들지 않았다. 로컬 원본
SHA-256을 확인하고, 같은 이름의 기존 객체가 다른 경우 덮어쓰기를 거부한다.

R2의 기존 CORS 정책이 없음을 확인한 뒤 `hozorica.com`, `www.hozorica.com`, `localhost:3001`에
GET/HEAD를 허용했다. Range와 If-None-Match 요청, Content-Length/Content-Range/Accept-Ranges/ETag
응답 헤더를 허용한다. 앱 CSP에도 해당 R2 호스트만 추가했다. PUT/DELETE의 브라우저 접근은 허용하지
않았다.

현재 공개 주소는 기존 `r2.dev` 주소다. 이는 사용자 지정 CDN 도메인이 아니며, 높은 트래픽에서는 R2
사용자 지정 도메인과 캐시 설정을 별도로 구성해야 한다.

## 캐시·롤백

기존 Hugging Face 단일 파일과 R2 조각은 URL이 달라 최초 전환 시 다시 다운로드한다. 기존 사용자
캐시는 임의로 삭제하지 않는다.

단일 파일로 돌아가려면 운영 `NEXT_PUBLIC_KANANA_MODEL_URL`에 기존 `kanana-model.json.sourceUrl`을
지정하고 재배포하거나, 직전 Vercel 배포 `dpl_FDHhZt3pXg55wAyuVgDcQPuGHzW4`로 전환한다.

## 검증

- Blog 94테스트, 타입 검사, lint 통과.
- 공개 파일 접근 및 운영 배포 결과는 작업 완료 시 아래에 기록한다.

### 2026-09-06 최종 검증

- R2 3개 조각 및 manifest 업로드 완료. 업로더의 임시 원격 바인딩 세션은 종료했다.
- 3개 파일 각각 HEAD 200, 정확한 Content-Length, Range GET 206, GGUF 매직 헤더,
  `Origin: https://hozorica.com`에 대한 CORS 확인.
- 공개 주소에서 3파일을 동시에 전체 다운로드하여 모두 로컬 manifest의 SHA-256과 일치함을 확인했다.
  네트워크 검증이며 브라우저 추론 속도 비교 측정은 아니다.
- Wllama의 실제 `ModelManager.parseModelUrl`이 첫 파일 URL에서 정확히 3개의 R2 URL을 생성함을
  확인했다.
- Vercel 운영 빌드 성공. 배포: `dpl_2Jr5PsdGcDZsuL6VSae6fM6WUeu1`,
  `https://blog-9n1voh0e9-hochois-projects.vercel.app`.
- 배포된 JS 번들에서 R2 설정·첫 조각 파일명 확인. 새 배포의 홈과 RAG API HTTP 200 확인, CSP의 R2
  허용 확인.
- 이번 작업에서는 GPU 초기화 후 모델의 최종 답변 생성까지 다시 실행하지 않았다.
- `vercel promote` 성공. `https://hozorica.com`에서 새 CSP와 픽셀 작업실 HTTP 200 확인, 운영 전환
  완료.

# RAG Worker 작업 지침

## 책임

이 Worker는 Cloudflare D1의 공개 콘텐츠와 Vectorize를 사용하며 Workers AI 또는 Gemini 임베딩으로
검색한다. Gemini 생성 호출과 키는 Worker 안에서만 처리한다.

- `/search`: 검색용 읽기 경로
- `/answer`: 검색된 공개 근거에 기반한 Gemini 답변 경로
- `/sync`: corpus를 임베딩하고 Vectorize에 동기화하는 관리자 경로
- `/__local/d1`: 로컬 요청에서만 허용되는 관리자용 D1 점검 경로

### 라우트와 인증 계약

- `/health` GET은 상태 확인용이고, `/search`·`/answer` POST는 `RAG_SEARCH_TOKEN`, `/sync`와
  `/__local/d1`은 `RAG_ADMIN_TOKEN`을 사용한다. 두 토큰을 서로 바꾸거나 클라이언트에 노출하지
  않는다.
- `/sync`의 `offset`과 `revision`은 16개 batch 동기화와 corpus 변경 감지에 사용한다. revision이
  바뀌면 처음부터 다시 동기화하도록 유지한다.

## Cloudflare 안전 규칙

- `wrangler.jsonc`의 D1, Workers AI, Vectorize binding과 원격 리소스 설정을 먼저 확인한다.
- 토큰과 계정 정보는 소스, 로그, 테스트 출력에 넣지 않는다.
- `wrangler deploy`, 원격 D1 변경, Vectorize 대량 동기화는 사용자가 명시적으로 요청한 경우에만
  실행한다.
- binding을 바꾸면 `wrangler types`와 TypeScript 검증을 함께 확인한다.
- 검색 경로와 동기화 경로의 인증 토큰을 서로 바꾸지 않는다.

## RAG 데이터 규칙

- 발행된 콘텐츠만 검색 corpus에 포함한다.
- 임베딩 차원, namespace, document id 규칙을 임의로 바꾸지 않는다.
- 현재 임베딩 모델은 `@cf/baai/bge-m3`, 차원은 1024, Vectorize namespace는 `public-v1`이다. batch
  크기나 이 값을 바꾸면 기존 index 재생성·재동기화 계획을 기록한다.
- Gemini는 별도 INDEX_GEMINI, `gemini-embedding-001` 768차원·L2 정규화·`public-gemini-v1`을
  사용한다. 검색·동기화·stale 검증은 같은 프로필을 사용하며 기존 인덱스와 혼합하지 않는다.
- Gemini cutoff는 평가 후 명시한다. 실패를 근거 없음으로 바꾸거나 유료 모델로 자동 전환하지 않는다.
- 삭제·비공개 콘텐츠가 검색 결과에 남지 않도록 원본 D1 상태를 재확인한다.
- chunking, embedding, vector upsert 계약을 바꾸면 기존 index와 재동기화 가능성을 기록한다.
- 검색은 Vectorize 조회 뒤 최신 D1 corpus를 다시 읽어 stale vector를 제거한다. 이 순서를 바꾸면
  비공개·삭제 콘텐츠 노출 회귀 테스트를 갱신한다.

### 로컬 동기화

- `scripts/sync.mjs`는 `.dev.vars`의 `RAG_ADMIN_TOKEN`과 기본 로컬 endpoint를 사용한다. production
  token이나 원격 endpoint를 실수로 사용하지 않도록 실행 전에 endpoint와 변수 출처를 확인한다.
- sync 기본은 dry-run이며 쓰기는 `--execute --requests-per-minute N`으로 명시한다. 원격 endpoint는
  `--allow-remote`도 필요하다. 로컬 주소라도 remote binding의 쓰기에는 사용자 실행 요청이 필요하다.
- 전환·재실행·롤백은 `docs/runbooks/2026-11-06-gemini-rag.md`를 따른다.

## 검증

```sh
pnpm --filter @blog-platform/rag-worker typegen
pnpm --filter @blog-platform/rag-worker typecheck
pnpm --filter @blog-platform/rag-worker test
pnpm --filter @blog-platform/rag-worker build
```

검색 계약을 바꾼 경우에는 `apps/blog`의 RAG 호출부와 테스트도 함께 확인한다.

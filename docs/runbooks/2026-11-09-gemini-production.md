# Gemini 운영 전환

- Runbook ID: `gemini-rag-production-20261109`.
- 사용자 요청: 운영 Gemini 설정·배포·실제 검색·채팅·CMS 갱신 검증 전체 진행.
- 소스: `a622500200e69e88ca0415b9eedc12b81f810abb`의 clean Git snapshot.
- 상태: Worker와 Blog 운영 전환 및 실제 검색·답변·CMS 공개/비공개 갱신 확인 완료. 상세 증거와 한계는
  [운영 감사](../audits/2026-11-09-gemini-production.md)에 기록한다.
- 키는 Worker secret에만 추가했다. Vercel·소스·로그에는 Gemini 키를 넣지 않는다.

## 배포 대상과 설정

- 기존 Worker 주소: `https://hozorica-portfolio-rag.hochoi8621.workers.dev`.
- Gemini Worker version: `373e8afa-f147-4c5f-aadb-e5ddd0dba053`.
- 기존 Worker version: `f2e0ee34-ebcc-4537-bb5a-a50cc6195ef3`.
- 후보 Blog: `https://blog-pdmls2tb0-hochois-projects.vercel.app`,
  `dpl_DX5UTRjfWNiY4RXQsEkpHRUhHXMB`.
- 이전 운영 Blog: `https://blog-h7fcpayyr-hochois-projects.vercel.app`,
  `dpl_AP2yqK3V8qLUVmUM5xVWxHA9Z4wS`.
- Worker: provider `gemini`, cutoff `0.7`, document embed delay `750` ms, generation
  `gemini-3.5-flash-lite`. 기존 검색·관리 토큰을 유지한다.
- `wrangler.jsonc`의 `keep_vars: true`로 이후 코드 배포에서도 운영 공급자·cutoff 설정을 보존한다. 새
  환경은 별도 설정이 필요하며 이 옵션만으로 Gemini가 자동 활성화되지는 않는다.
- Blog: `RAG_ANSWER_PROVIDER=gemini`, `NEXT_PUBLIC_RAG_CHAT_MODE=remote`를 production에 추가. 기존
  Worker URL과 토큰은 유지한다. public 모드는 빌드 시 반영한다.
- 후보 인덱스 `hozorica-rag-gemini-001-768-v1`, namespace `public-gemini-v1`.
- 전환 전 dry-run: 580개, revision
  `5ec17c3abf5bbc92675432a08ff602f9b830f0ee870bd905e45c2fdfabceea41`, contentRevision
  `848fbfbf432aaf6af9184b6aef17cad8ce765764fe567192b9684d8b6ba21f2f`. 이전 검증과 일치하므로 전체
  재임베딩은 실행하지 않는다.

## 검증 데이터와 재실행

CMS 검증은 기존 글을 변경하지 않고 slug `gemini-rollout-probe-20261109`, 제목
`[운영 점검] Gemini 검색 갱신 20261109`인 새 임시 글 한 건만 사용한다. 정상 CMS 발행·비공개 전환과
검색 갱신을 확인하고 해당 글만 삭제한다. 공개 중에는 테스트 문구가 잠시 노출될 수 있다. 벡터가
남아도 최신 D1 재확인으로 비공개·삭제 글이 제외되는지 확인한다. 같은 slug가 이미 존재하면 다른 글을
덮어쓰지 않고 새 고유 slug를 사용한다. 전환 실패 시 임시 데이터부터 정리한다.

전체 sync를 반복하지 않는다. 추가 동기화는 먼저 dry-run으로 현재 revision과 변경 범위를 확인한다.
같은 프로필·revision의 기존 vector ID는 건너뛴다. 429는 중단하고 quota 회복 후 재실행한다.

실제 probe ID는 `e617e9cf-d9d7-4cb2-b24d-748099d8034d`다. CMS에 hard delete UI가 없으므로 비공개
상태를 D1에서 재확인한 뒤 id·slug·제목·`is_published = 0`을 모두 제한해 한 행만 삭제했다. 삭제
1건·남은 0건을 확인했다. probe의 Gemini 청크 ID
`39bf7f0ebfdc38a3b2007c048a609a8c8436b1c56c7ba6a178f25e4c54934897`는 실제 원격 인덱스에서 확인했다.
비공개 후 검색 제외를 확인한 뒤 해당 테스트 벡터만 삭제했고 원격 ID 재조회에서 부재를 확인했다. 기존
콘텐츠·벡터는 유지한다.

## 롤백

블로그는 이전 배포를 promote하면 이전 빌드·런타임 환경으로 되돌아간다.

```sh
vercel promote https://blog-h7fcpayyr-hochois-projects.vercel.app --scope hochois-projects --yes
pnpm --filter @blog-platform/rag-worker exec wrangler versions deploy f2e0ee34-ebcc-4537-bb5a-a50cc6195ef3@100% --yes
```

재배포 시 자동 전환을 막으려면 Blog production의 답변 공급자·채팅 모드도 `local`로 되돌린다. 이전
Worker 인덱스는 삭제하지 않는다. 전환 후 새 글을 추가한 경우 기존 인덱스에는 해당 글이 없을 수
있으므로 최신 corpus 재동기화 여부를 확인한다. 배포 롤백만으로 과거 콘텐츠 상태를 복원하지 않는다.

운영 도메인 승격 전 Worker를 실제 이전 version으로 잠시 복구해 health 200을 확인한 뒤 Gemini
version으로 재전환했다. 이 검증은 전체 콘텐츠 복구 실습과 구분한다.

# Gemini 운영 전환 검증 — 2026-11-09

Runbook: `gemini-rag-production-20261109`.
[설정·검증 데이터·재실행·롤백](../runbooks/2026-11-09-gemini-production.md).

## 적용

사용자가 운영 설정·배포·검증 전체 진행을 요청했다. `a622500`의 clean snapshot을 Vercel에 배포하고
후보 검사 후 기존 `hozorica.com` 운영 도메인에 promote했다. Worker는 기존 주소를 유지하며 Gemini
version `373e8afa-f147-4c5f-aadb-e5ddd0dba053`을 100%로 배포했다. 최종 Vercel inspect는
`dpl_DX5UTRjfWNiY4RXQsEkpHRUhHXMB` Ready와 운영 도메인의 일치를 확인했다.

Gemini 키는 Worker secret에만 추가했고 기존 검색·관리 토큰은 보존했다. Blog production에 답변 공급자
`gemini`, 채팅 모드 `remote`를 등록했다. 키·토큰 값은 소스·보고서·클라이언트에 넣지 않았다.
`keep_vars: true`를 Wrangler 설정에 추가해 다음 배포에서 운영 변수 삭제를 방지한다.

AI Studio의 실제 `hozorica` 프로젝트는 Free tier였다. 표시된 한도는 embedding 100 RPM·30,000 TPM·
1,000 RPD, Flash Lite 생성 15 RPM·250,000 TPM·500 RPD였다. 유료 전환·결제 변경은 하지 않았다. 확인
출처:
[AI Studio 프로젝트 할당량](https://aistudio.google.com/rate-limit?timeRange=last-hour&project=hozorica).
이는 확인 시점 한도이며 향후 할당량 보장이 아니다.

## API·실제 브라우저

- 후보 Worker의 실제 Gemini 답변에 거부기린 43명·약 1,300시간과 프로젝트 출처를 확인했다. 넥사크로
  성과 검색은 프로젝트를 우선했고 미등록 프로젝트 검색은 빈 출처였다.
- 후보 Blog에서 대표 프로젝트 목록, 거부기린 성과, GGUF 글 생성 소개, 넥사크로 성과, 미등록 프로젝트
  질문이 200이었다. GGUF 질문은 정형 답변 우회 대상이 아닌 실제 생성 경로였다.
- 운영 `https://hozorica.com/api/rag`에서도 GGUF 생성 소개와 거부기린 수치·출처가 200이었고
  `Cache-Control: no-store`를 확인했다. 이후 실제 운영 브라우저에서 GGUF 답변·출처를 다시 확인했다.
- 후보 브라우저 1440×1000·390×844에서 채팅 버튼, 즉시 열기, 수치·출처, 대표 프로젝트 → 두 번째
  프로젝트 자세히, 즉시 중지, 닫기를 확인했다. 데스크톱 36개·모바일 40개 Resource Timing 항목에서
  GGUF·shard·wllama·모델 다운로드 URL 일치는 0이었다. 운영 재검사 33개 항목에서도 0이었다. 이는 전체
  HAR나 모든 네트워크 계층을 수집한 결과와는 구분한다.
- 기존 정형 후속 질문은 통과했다. 자유형 질문 `그 사용자 수와 사용 시간은 어떤 기준으로 측정했어?`는
  대상을 해결하지 못해 안내 응답을 반환했다. 기존 제한된 후속 질문 resolver의 한계로 기록하며 모든
  자연어 후속 질문이 지원된다고 보고하지 않는다.

## CMS·원격 데이터 정리

기존 글은 수정하지 않았다. 새 임시 글 한 건만 정상 CMS로 저장·발행·비공개 전환했다. KST 기준 저장
03:13:03, 발행 03:13:12, 비공개 전환 03:13:58이었다. CMS 확인 메시지와 공개 시 본문을 확인했다.
별도의 refresh 세부 상태는 CMS UI에 노출되지 않았다.

발행한 probe의 실제 Gemini 청크 ID를 재계산해 원격 `public-gemini-v1` 인덱스에서 확인했다. 이
probe에 대해 별도 수동 sync는 실행하지 않았으므로 CMS 발행 경로가 인덱스에 반영된 증거다. 발행 중
해당 글을 정답으로 반환하는 검색을 직접 포착하지는 못했다. 비공개 후 원격 Worker 검색은 빈 출처였고
CMS API와 후보·운영 Blog는 404였다. 처음 운영 페이지 요청에는 stale 본문이 한 번 관찰됐으며 이후
독립 재조회는 404였다. 즉시 모든 캐시에서 사라진 것으로 보고하지 않는다.

CMS에 hard delete가 없어 private 상태와 id·slug·제목을 모두 확인한 guarded D1 DELETE로 해당 probe 한
행만 정리했다. 삭제 1건·남은 0건을 확인했다. probe 벡터도 정확한 ID로 삭제했고 원격 ID 재조회에서
부재를 확인했다. 임시 archive 조작 후 CMS 목록이 draft로 표시된 현상은 기록하되 이번 Gemini 변경의
수정 대상으로 확대하지 않았다.

최종 corpus dry-run은 580개였고 전환 전과 revision·contentRevision이 같았다. 전체 재임베딩·기존
인덱스 삭제·기존 글 수정은 하지 않았다. 배포 준비 중 생성된 빈 임시 Vercel 프로젝트는 즉시
삭제했으며 운영 도메인에는 연결하지 않았다.

## SEO·배포 검증과 한계

`seo-technical` 스킬의 관련 항목을 적용했다. 후보 및 실제 운영 홈·목록·GGUF 글·거부기린 프로젝트는
200, canonical은 기존 운영 URL을 가리켰다. 실제 글 JSON-LD를 파싱했고 sitemap은 200이며 probe URL이
없었다. 비공개 probe는 404였다. 앱 본문 렌더러·공개 URL을 변경하지 않았으며 새 CWV·검색엔진 색인
측정이나 사이트 전체 SEO 감사는 수행하지 않았다.

운영 소스의 병합본 테스트 727개 통과·1개 건너뜀, lint·typecheck·build와 Core·Blog 형식 검사는 앞선
검증과 동일하다. Vercel에서 실제 운영 빌드를 새로 완료했다. 이후 추가한 `keep_vars` 설정은 Wrangler
build dry-run으로 검증했다. 소스 런타임 변경은 없다.

Worker는 운영 도메인 승격 전 이전 version으로 복구해 health 200을 확인하고 Gemini version으로
재전환했다. Vercel 이전 Ready 배포는 보존했다. Vercel promote 롤백과 전체 콘텐츠·인덱스 복구는 실제
실행하지 않았다. 무료 quota 초과 시 자동 유료 전환이나 로컬 모델 자동 우회는 하지 않는다.

기술 검증은 위 범위에서 통과했다. 생성 답변에 대한 사람의 최종 의미 검수와 장기간 사용량·오류율
관찰은 자동 검사와 별개다.

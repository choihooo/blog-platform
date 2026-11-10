# Gemini 검색 인덱스 재임베딩 실행 기록

- Runbook ID: `gemini-rag-20261106`
- 실행일: 2026-11-07 (Asia/Seoul)
- 코드: `cf972599f5ea7e0d52c257fbb7bb9346e1a607f9`
- 승인 범위: 사용자 요청에 따른 새 인덱스 생성과 공개 콘텐츠 재임베딩.
- 운영 Worker/Next 배포 및 운영 검색 전환은 포함하지 않는다.
- Google 프로젝트: `hozorica-blog` (`hozorica`), AI Studio에서 Free Tier 확인.
- 실제 API 연결 검사: embedding-001 768차원 HTTP 200, Flash-Lite 생성 HTTP 200.
- API 키는 로컬 `.dev.vars`에만 저장하며 권한은 600이다. 키 값은 기록하지 않는다.

## 사전 확인

AI Studio에 표시된 해당 프로젝트 한도:

| 모델                  | RPM |     TPM |   RPD |
| --------------------- | --: | ------: | ----: |
| gemini-embedding-001  | 100 |  30,000 | 1,000 |
| gemini-3.5-flash-lite |  15 | 250,000 |   500 |
| gemini-3.8-flash      |   5 | 250,000 |    20 |

기존 `hozorica-portfolio-rag` 인덱스를 보존한 채 `hozorica-rag-gemini-001-768-v1`을 cosine
768차원으로 생성했다. namespace는 `public-gemini-v1`이다.

로컬 Worker `http://127.0.0.1:8791`에서 원격 D1을 읽고 새 Vectorize에만 쓴다. 검색 cutoff `0.6`은
후보 환경을 시작하기 위한 임시 값이며 품질 평가로 확정한 값이 아니다.

dry-run 결과:

- 청크: 790개, 예상 호출 상한: 790건.
- revision: `e8f0357ce56a4020548fe8c1b04dfcc4178b3ab1168d68874368a9ac4179f6dc`
- contentRevision: `44097c8488736f7bad8710b4f110aa5bf55c0320cae108f71ec07ccf5e5da49b`
- profile: `gemini-001-768-v1`
- 실행 전 새 인덱스 vectorCount: 0.

## 실행

```sh
pnpm --filter @blog-platform/rag-worker sync --endpoint http://127.0.0.1:8791
pnpm --filter @blog-platform/rag-worker sync --execute --requests-per-minute 60 --endpoint http://127.0.0.1:8791
```

문서 임베딩은 동시성 1, 호출 간격 1,000ms로 시작했다. 첫 48개 이후에는 같은 `runSync`를 호출하는
일회성 로컬 실행기를 사용해 API 처리 시간도 페이지 간격에 포함했다. 페이지 시작 사이의 간격은 최소
`청크 수 × 1,000ms`로 유지해 분당 60건 제한을 지켰다. 재실행은 위 기본 CLI로도 가능하며, 기본 CLI는
API 처리 시간 외에 페이지 대기를 추가하므로 더 보수적으로 동작한다. 429나 다른 실패가 발생하면
중단하고 offset/revision을 기록한다.

중간 확인에서 업로드 160개에 비해 인덱스 통계가 0으로 표시되어 실행을 잠시 멈췄다. 이후
`wrangler vectorize info`와 `list-vectors` 양쪽에서 실제 벡터 128개가 확인되어 비동기 반영 지연임을
확인하고 재개했다. 삭제·재생성·중복 재임베딩으로 처리하지 않았다.

재임베딩 실행은 종료 코드 0으로 완료됐다. 50페이지의 `indexed` 합계는 790이며 마지막 `nextOffset`은
null이다. 전체 페이지의 revision/contentRevision은 각각 한 가지 값으로 동일하다. 완료 후 dry-run도
처음과 같은 790개 및 같은 revision/contentRevision을 반환했다.

## 검증

- `/health`: HTTP 200.
- 저장된 벡터 3개 표본: 모두 768차원, namespace `public-gemini-v1`, L2 norm 약 1.0.
- 실제 Gemini query embedding과 새 인덱스를 사용하는 로컬 `/search` 검사:

| 질문                                        | HTTP | 기대 출처가 상위 3개에 포함   |
| ------------------------------------------- | ---: | ----------------------------- |
| Nexacro에서 React로 옮긴 PoC 사례가 있나요? |  200 | `/projects/nexacro-react-poc` |
| Nest의 의존성 주입과 제어 역전을 설명한 글  |  200 | `/blog/nest-di-ioc`           |
| GGUF와 MLX 모델 형식에 대한 글              |  200 | `/blog/gguf-mlx-explained`    |

위 검사는 연결과 검색 smoke test다. 전체 검색 품질 평가나 cutoff calibration 합격을 의미하지 않는다.
이번 작업에는 소스 코드 변경이 없어 앱 테스트·빌드는 다시 실행하지 않는다.

Vectorize 전체 반영 확인: `list-vectors --count 1000 --json`에서 `totalCount: 790`, 목록 790개, 고유
ID 790개, `isTruncated: false`를 확인했다. 업로드 790개가 모두 반영됐다. 기존 1024차원 인덱스도
`vectorize list`에서 보존된 것을 확인했다.

최종 `vectorize info`: dimensions 768, vectorCount 790, processedUpToMutation
`30904511-df16-4574-b199-8f0a850a804e`, processedUpToDatetime `2026-11-06T19:22:36.767Z` (한국 시각
2026-11-07 04:22:36).

운영 Worker/Next 배포, 운영 Secret 등록, 운영 검색 전환은 수행하지 않았다. 로컬 Worker만 사용해
동기화했다. 다음 단계는 검색 임계값 calibration 및 품질 평가다.

## 재실행·롤백

- 같은 revision으로 재실행하면 기존 ID는 건너뛴다. 실패한 페이지는
  `--offset <offset> --revision <revision>`으로 재개한다.
- 409는 콘텐츠 변경이므로 dry-run을 다시 확인하고 offset 0부터 시작한다.
- 운영은 기존 인덱스를 계속 사용하므로 이번 인덱스를 사용하지 않으면 운영 롤백은 필요 없다.
- 새 인덱스 삭제는 수행하지 않는다. 운영 전환 전 검색 cutoff calibration과 품질 평가가 필요하다.
- SEO: 공개 페이지 렌더링·메타데이터 변경이 없어 이번 작업에서는 생략한다.

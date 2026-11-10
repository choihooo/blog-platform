# PR #8 병합 전 검토

- 대상: https://github.com/choihooo/blog-platform/pull/8
- 검토 커밋: `a836eaf847ced4cd9cca32fe3b17de730ae3ca19`
- 기준 main: `5cda2847051630394ed463cd378e4daaa6a583bc`
- 병합 결과: `1a2bc8e63f9c44ddb1e211885cde636437a1e3d9`, 검토 커밋과 동일한 파일 트리

## 코드 검토와 검증

독립 검토에서 HTML/Markdown/Tiptap 변환, Blog 렌더링, 저장 전 검증, 구형 콘텐츠 호환성, 복구
스크립트의 변경 가드에 병합을 막는 문제를 발견하지 못했다.

PR의 모든 추적 파일과 검증용 소스의 Git blob 일치를 확인했다. 해당 소스에서 `pnpm test --force`는
654개 통과, 원문 manifest 전용 테스트 1개 기본 건너뜀이다. manifest를 지정한 실제 복구 글 왕복
테스트 3개는 독립 검토에서 모두 통과했다. `pnpm lint`, `pnpm typecheck`, `git diff --check`도
통과했다. Blog/CMS의 PR 미리보기 배포는 모두 성공했다.

GitHub Actions는 작업과 로그를 생성하기 전에 `startup_failure`로 종료했다. main과 동일한
워크플로이며 재실행도 거부되어 Actions 통과로 보고하지 않았다.

## 현재 PR 미리보기의 SEO 및 본문 검사

`seo-page` 기준으로 보호된 Vercel PR 배포 `dpl_8rqbFMAFPasz2wXP6NVudquwj1n1`을 직접 조회했다. 운영
페이지로 미배포 소스 검증을 대신하지 않았다.

| 글                                     | H1  | 표  | 코드 블록 | SEO 확인                                        |
| -------------------------------------- | --- | --- | --------- | ----------------------------------------------- |
| `geobugirin-10000-users-retrospective` | 1개 | 3개 | 1개       | 제목·설명·운영 canonical·OG 태그·유효한 JSON-LD |
| `nest-di-ioc`                          | 1개 | 0개 | 18개      | 제목·설명·운영 canonical·OG 태그·유효한 JSON-LD |

두 페이지 모두 새 rich 콘텐츠 렌더러를 사용했다. 관련 공개 동작 오류는 확인하지 못했다. 이번 검토는
HTML 구조와 메타데이터 검사이며 Core Web Vitals 실측은 수행하지 않았다. 상세 관측값은 로컬 복구
폴더의 `pr8-premerge-seo.json`에 보관했다.

작업 중이던 로컬 브랜치, 인덱스 및 다른 UI 변경은 병합 과정에서 보존했다. 이 검토 기록은 병합 후
로컬에 추가한 문서이며 위 PR의 병합 트리에는 포함되지 않는다.

## 병합 후 운영 확인

main 자동 배포는 Blog `dpl_FssNydXqCE9EMgasn2Aachu1QGNF`, CMS `dpl_71kWhcAxTnL6ieJPJETMmc7esjBx`
모두 성공했다. `python3 scripts/migration/verify-published-rendering.py` 재실행 결과 공개 글 35편,
코드 블록 149개, 표 15개, 본문 이미지 106개가 모두 통과했다. GitHub Actions 자체는 병합 후에도 같은
실행 시작 실패 상태이며 성공으로 취급하지 않았다.

# 작업 바탕화면 정식 전환 배포

사용자가 승인한 `/experiments/interactive-portfolio`를 `/projects`로 승격한다. 메인 캐릭터 스크롤,
블로그, 이력서와 기존 프로젝트 상세 URL은 유지한다.

- Blog project: `prj_EeQ41fKsfraKfkGhVV5CUfY5WeaJ`, scope `hochois-projects`.
- 직전 운영: `dpl_7vwZ7eiJpRWDVb71VHA7Rf22sUHd`,
  `https://blog-kylwobfxr-hochois-projects.vercel.app`.
- rollback: 위 배포를 `vercel promote <url> --scope hochois-projects --yes`로 복구.
- 원본 `/Users/choiho/coding/blog`의 미커밋 작업은 보존하고, 격리 브랜치의 검증된 소스를 배포한다.
  merge/push는 이번 배포 작업에 포함하지 않는다.
- `/projects`는 canonical `/projects`, index/follow. 자체 MainHeader가 있으므로 SiteShell 중복은
  숨긴다.
- `/experiments/interactive-portfolio` → `/projects` permanent redirect. 상세의 작업실 링크도 정식
  주소.
- 기존 `/projects#slug`는 등록된 프로젝트를 자동으로 열고, 잘못된 hash는 무시한다.
- JS 미실행 시 11개의 실제 상세 링크를 제공한다. 사용자 요청으로 JS 사용 시 하단 중복 목록은 없다.
- 11개 아이콘, 드래그·크기 조절·최소화·복원, 상세 문서 톤, 메인 공통 헤더, 풍부한 미리보기를
  배포한다.
- DB/R2 콘텐츠 쓰기는 없으며 비밀키/모델 파일은 배포 snapshot에 복사하지 않는다.

## 검증과 배포 결과

- 배포 소스 commit `ce3805e`. 격리된 git archive snapshot에 Blog 프로젝트 연결과 실제 소스가
  존재하는지 확인했다. `.env.local`과 개인 모델을 포함하지 않았다.
- 전체 Blog 테스트 412개/45파일, lint/typecheck/format 검사 통과. 별도 배포 전 검토에서
  Critical/Important 문제 없음. 기존 OG/콘텐츠 데이터 계약은 변경하지 않았다.
- 후보: `https://blog-cxezrrwgk-hochois-projects.vercel.app`, `dpl_Eqxi1eidyP3DfRZqccJkoZK4Qy4g`.
  149페이지 운영 빌드 통과 후 promote 완료.
- 후보 브라우저에서 icon 11개, header 1개, 캐릭터 이미지 로드, canonical/index/follow, hash 미리보기
  복원 및 상세→작업실 이동을 확인했다.
- 운영 `/projects`, `/`, `/blog`, `/projects/kusting` HTTP 200. 예전 실험 주소는 HTTP 308, Location
  `/projects`. 운영 SSR에 11개 프로젝트 아이콘이 존재함을 확인했다.
- 실제 운영 브라우저에서 미리보기/상세/복귀 및 390×844 화면의 가로 overflow 없음과 헤더 1개를
  확인했다. GGUF/MLX 글의 OG 이미지가 기존 R2 썸네일 URL을 유지하는 것도 확인했다.
- 운영 메인 Portfolio 장면의 바로가기에서 새 `/projects` 진입 동작을 확인했다.
- 원본 checkout과 원격 Git branch는 변경하지 않았다. 후속 Git 기반 배포 전 이 작업 브랜치의 변경을
  통합해야 수동 배포한 작업실이 유지된다.

## Git 통합 검증

- 사용자 요청으로 `codex/scroll-story-home`을 push하고 PR #3에서 `main` 통합을 진행한다. 위 기록은
  최초 수동 배포 시점의 상태다. 원본 checkout의 미커밋 변경은 계속 보존한다.
- CMS의 Vitest globals가 꺼져 자동 등록되지 않던 React cleanup을 setup 파일에서 명시한다. 테스트 간
  DOM 격리 회귀 검사와 CMS 전체 141개 테스트, 저장소 전체 테스트·lint·typecheck·format 통과.
- Blog Preview에는 콘텐츠 소스 설정이 없어 빌드가 실패했다. 공개 읽기 전용 API가 HTTP 200으로
  응답하는 것을 확인하고 Preview에만 `BLOG_CONTENT_PROXY_URL=https://cms.hozorica.com`을 설정한다.
  운영 D1/R2 설정과 콘텐츠 데이터는 변경하지 않는다.
- GitHub CI의 Build 단계도 같은 공개 읽기 전용 API를 사용한다. CI에 운영 D1 비밀키를 복사하지 않고
  실제 발행 콘텐츠로 정적 페이지 생성을 검증한다. 테스트 단계의 콘텐츠 fixture 설정은 유지한다.

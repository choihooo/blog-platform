# 작업 바탕화면 정식 전환 배포

사용자가 승인한 `/experiments/interactive-portfolio`를 `/projects`로 승격한다.
메인 캐릭터 스크롤, 블로그, 이력서와 기존 프로젝트 상세 URL은 유지한다.

- Blog project: `prj_EeQ41fKsfraKfkGhVV5CUfY5WeaJ`, scope `hochois-projects`.
- 직전 운영: `dpl_7vwZ7eiJpRWDVb71VHA7Rf22sUHd`,
  `https://blog-kylwobfxr-hochois-projects.vercel.app`.
- rollback: 위 배포를 `vercel promote <url> --scope hochois-projects --yes`로 복구.
- 원본 `/Users/choiho/coding/blog`의 미커밋 작업은 보존하고, 격리 브랜치의 검증된 소스를 배포한다.
  merge/push는 이번 배포 작업에 포함하지 않는다.
- `/projects`는 canonical `/projects`, index/follow. 자체 MainHeader가 있으므로 SiteShell 중복은 숨긴다.
- `/experiments/interactive-portfolio` → `/projects` permanent redirect. 상세의 작업실 링크도 정식 주소.
- 기존 `/projects#slug`는 등록된 프로젝트를 자동으로 열고, 잘못된 hash는 무시한다.
- JS 미실행 시 11개의 실제 상세 링크를 제공한다. 사용자 요청으로 JS 사용 시 하단 중복 목록은 없다.
- 11개 아이콘, 드래그·크기 조절·최소화·복원, 상세 문서 톤, 메인 공통 헤더, 풍부한 미리보기를 배포한다.
- DB/R2 콘텐츠 쓰기는 없으며 비밀키/모델 파일은 배포 snapshot에 복사하지 않는다.

검증·배포 결과는 실행 후 아래에 추가한다.

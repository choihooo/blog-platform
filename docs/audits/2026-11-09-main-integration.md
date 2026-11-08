# 전체 작업의 main 통합 검증

사용자 요청으로 구조 단순화·비공개 글 접근 수정·About 페이지와 기존 미커밋 변경을 모두 커밋했다.
기존 미커밋 변경은 `6513b26`의 79개 파일이며, 원래 작업공간과 파일 내용을 대조한 뒤 해당 작업공간의
브랜치와 index도 같은 커밋으로 맞췄다. 비밀값·개인 모델·생성물은 포함하지 않았다.

최신 `origin/main` 기준은 `1a2bc8e`였다. main에 이미 있던 #7 정식 둥근 블로그와 #8 콘텐츠 보존이
다른 이력으로 겹쳐 충돌했다. main의 정식 목록·상세·실험 경로 분리와 링크·공유·분석·SEO를 유지하고,
콘텐츠 보존 코드는 core로 옮긴 위치에서 유지했다. About과 둥근 블로그의 헤더 정책도 함께 반영했다.
콘텐츠 파서·serializer·HTML·Tiptap의 기존 구현은 main과 동일하며 import 경로만 core로 통일했다.

## 통합본 검사

- frozen lockfile 설치, 전체 format·lint·typecheck·build 통과.
- 전체 테스트 651개 통과·1개 건너뜀. main의 정식 블로그 회귀 검사도 포함한다.
- 빌드와 typecheck 동시 실행 중 `.next/types` 재생성으로 파일 누락 오류가 발생했다. 빌드 완료 후
  생성 파일을 확인하고 typecheck를 다시 실행해 통과했다. 소스 수정으로 숨기지 않았다.
- 실제 공개 콘텐츠를 읽는 로컬 production 서버에서 HTTP 10개 경로를 확인했다. 홈·About·정식
  블로그·실험 목록/상세·이전 글 URL redirect·검색·sitemap·없는 글 404를 포함한다.
- 정식 둥근 목록의 `/blog` 링크, rich 본문, 글 canonical·JSON-LD와 실험 페이지 noindex를 확인했다.
  `seo-technical`의 관련 공개 URL·색인 경계 검사를 적용했다.
- 독립 소스 리뷰에서 조치할 Critical/Important 문제는 없었다. 오래된 공유 패키지 import나 충돌
  marker도 남기지 않았다.

검사 로그는 ignored `_workspace/platform-simplification/main-integration/`에 보관한다. 운영 배포와
접근 검증의 이전 기록은 [배포 감사](2026-11-09-platform-deployment.md)를 따른다. 이번 main
통합에서는 D1·R2·Vectorize 데이터를 수정하지 않았다.

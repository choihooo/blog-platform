# 블로그 메타데이터·읽기 시간·브랜드 이미지

- 첫 블로그 목록의 `title: undefined`를 명시적인 `블로그`로 변경했다. 루트 템플릿과 결합한 브라우저
  제목은 `블로그 | Hozorica`다. 페이지 번호별 제목과 canonical은 유지한다.
- 목록의 analyzeBody=false 경로는 문자 수/1000, 상세는 Unicode 단어 수/220을 사용해 같은 글의 읽기
  시간이 달랐다. editor 패키지의 `calculateReadingTime(text)`로 계산을 통일했다. 목록은 목차·코드
  블록 분석을 여전히 생략하며 기존 상세 계산과 빈 문서 preview 동작을 유지한다.
- 실제 공개 Nest 글 데이터에서 목록·상세 모두 `8 min read`로 일치함을 확인했다. DB 수정은 없다.
- D1/R2 공개 읽기 캐시의 namespace를 갱신해 배포 전 계산된 읽기 시간 문자열을 재사용하지 않는다.
  기존 cache tag와 300초 재검증 간격은 유지하며 콘텐츠 저장이나 발행 작업은 실행하지 않는다.
- 기본 OG 카드는 현재 사이트의 아이보리 배경에 남색 `Hozorica`와 흰색 옷 캐릭터만 남긴 구성이다.
  1200×630 WebP, `/brand/hozorica-card-v2.webp`로 새 URL을 사용한다. 글별 표지 썸네일과 `/og/:slug`
  fallback은 유지한다.
- 아이콘은 승인된 프로필 원본에서 PNG 512×512, Apple PNG 180×180, ICO 32×32로 변환했다. ICO에는 RGBA
  PNG를 포함해 Next.js 디코더와 호환한다. Next 파일 기반 메타데이터로 실제 크기와 내용 해시를
  반영하므로 루트의 중복 고정 아이콘 설정은 제거했다.
- 승인 원본과 생성 정보는 `apps/blog/public/brand/README.md`에 기록했다. 이전 OG URL은 기존 공유
  링크를 위해 유지한다.

## 검증

문제 재현 테스트가 제목·읽기 시간·기본 OG 경로에서 실패하는 것을 먼저 확인한 뒤 수정했다. 전체
테스트(블로그 420개, CMS 141개, editor 17개, SEO 15개 포함), lint, typecheck, format, 전체
production build를 통과했다. 실제 글 데이터 확인도 공개 읽기 API만 사용했다.

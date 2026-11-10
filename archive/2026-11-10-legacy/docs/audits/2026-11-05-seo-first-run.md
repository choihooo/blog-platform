# Codex SEO 첫 실행 결과

- 점검일: 2026-11-05 (Asia/Seoul)
- 대상: 운영 사이트 `https://hozorica.com`
- 도구: `squarepots/claude-seo-for-codex`, 플러그인 `2.2.4+codex.1`
- 확인한 소스 commit: `c4574d25d3f5a368d817cead78b9f11f9237adfa`
- 방식: 설치된 `seo`, `seo-technical`, `seo-page` 지침을 읽고 번들 도구로 표본 점검. 전체 사이트
  병렬 감사나 로컬 미커밋 코드의 배포 전 검증은 아니다.
- 앱 코드, 원격 콘텐츠, 배포 설정은 변경하지 않았다. 기존 미커밋 작업을 보존했다.

## 설치와 실행 환경

다음 명령으로 사용자 범위 플러그인을 설치했다.

```sh
codex plugin marketplace add squarepots/claude-seo-for-codex
codex plugin add claude-seo-for-codex@claude-seo-for-codex
codex plugin list --marketplace claude-seo-for-codex --json
```

마지막 명령에서 `installed: true`, `enabled: true`, 버전 `2.2.4+codex.1`을 확인했다. 새 스킬의 자동
발견과 선택은 다음 턴부터 사용할 수 있다. 이번 점검에서는 설치 파일을 직접 읽고 번들 실행기를
호출했다.

기본 PATH의 Python이 3.10 미만이라 최초 doctor 실행이 실패했다. 이미 설치된 Python 3.12.13의 경로를
해당 프로세스에만 추가하여 setup을 실행했다. 전역 Python 패키지는 설치하지 않았다. setup은 플러그인
내부 전용 가상 환경과 Chromium을 설치했다.

설치된 플러그인 루트에서 실행할 때의 명령은 다음과 같다.

```sh
PATH=/Users/choiho/.local/share/uv/python/cpython-3.12.13-macos-aarch64-none/bin:$PATH bin/codex-seo setup
PATH=/Users/choiho/.local/share/uv/python/cpython-3.12.13-macos-aarch64-none/bin:$PATH bin/codex-seo doctor --json
```

doctor 최종 결과: `ready: true`, `browser_ready: true`, `reasons: []`. 쉘 전체의 PATH는 변경하지
않았으므로 이후에도 이 Python 경로가 필요할 수 있다.

## 점검 범위와 통과 항목

| 대상                              | HTTP | canonical     | H1  |
| --------------------------------- | ---- | ------------- | --- |
| `/`                               | 200  | 홈페이지      | 1개 |
| `/blog`                           | 200  | 해당 페이지   | 1개 |
| `/projects`                       | 200  | 해당 페이지   | 1개 |
| `/projects/kusting`               | 200  | 해당 페이지   | 1개 |
| `/resume`                         | 200  | 해당 페이지   | 1개 |
| `/blog/nest-di-ioc`               | 200  | 해당 페이지   | 1개 |
| `/blog/tags/seo`                  | 200  | 해당 페이지   | 1개 |
| `/seo-audit-nonexistent-20261105` | 404  | 홈페이지 상속 | 1개 |

- 위 정상 페이지 7곳에서 의도치 않은 meta noindex를 발견하지 않았다. 명시적인 index/follow가 없어도
  noindex가 없는 것 자체는 결함이 아니다. 404 응답에는 noindex가 있다.
- HTTP 홈페이지 → HTTPS 홈페이지: 308.
- `/posts/nest-di-ioc` → `/blog/nest-di-ioc`: 308.
- `/experiments/interactive-portfolio` → `/projects`: 308.
- robots.txt는 200이고 공개 경로를 허용하며 `/cms`, `/preview`를 차단한다.
- 번들 `sitemap_discovery.py`가 robots.txt에 선언된 sitemap.xml을 유효한 XML urlset으로 확인했다.
  URL은 124개다. 이 124개 모두의 상태·색인 여부까지 검사한 것은 아니다.
- 홈페이지와 글 상세를 Chromium으로 렌더링했다. 글 상세는 모바일 viewport를 사용했다. 두 페이지 모두
  초기 HTML과 렌더링 후 title, canonical, H1, 구조화 데이터 유형이 일치한다.
- 홈페이지 Person, 이력서 ProfilePage/Person, 글 BlogPosting/BreadcrumbList를 확인했다. 렌더러는
  홈페이지·글의 JSON-LD를 유효한 JSON으로 판독했다. Google 리치 결과 적격성이나 모든 Schema.org
  속성에 대한 외부 검증을 의미하지 않는다.
- 두 렌더링에서 수집된 console_errors는 빈 배열이었다.
- 대표 공통 OG WebP와 글 OG PNG가 모두 200으로 응답했다.

## 개선 항목

### Medium: 페이지별 공유 메타데이터가 홈페이지 정보를 상속함

관찰한 `/blog`, `/projects`, `/projects/kusting`, `/resume`, `/blog/tags/seo`는 canonical과 브라우저
title은 페이지별로 다르지만, `og:url`은 모두 `https://hozorica.com`, `og:title`과 `twitter:title`은
모두 `Hozorica`다. 공유 설명도 공통 블로그 소개를 상속한다. 홈페이지 역시 일반 description과 공유
description이 다르다.

글 상세 `/blog/nest-di-ioc`는 자체 OG URL·제목·설명을 정상 출력한다. 실제 영향 범위는 공유
미리보기의 페이지 구분이며, 이 현상만으로 검색 색인 차단이나 순위 하락을 단정하지 않는다.

- 원인 후보: `apps/blog/app/layout.tsx`의 공통 Open Graph/Twitter 값을 개별 페이지에서 덮어쓰지
  않는다. 목록 메타데이터는 `apps/blog/features/blog/lib/listing-metadata.ts`, 프로젝트와 이력서
  메타데이터는 각 route에서 만든다.
- 제안: route 또는 기존 SEO 메타데이터 생성 계층에서 페이지 title/description/canonical과 공유
  메타데이터를 함께 생성한다. 공통 대표 이미지는 유지할 수 있다.
- 검증: 위 표본 페이지의 초기 HTML에서 og:url이 해당 canonical과 일치하고 공유 제목·설명이 페이지
  목적에 맞는지 확인한다. 불일치가 남으면 수정이 완료되지 않은 것으로 본다.
- 추적: 배포마다 같은 표본 URL의 공유 메타데이터를 비교한다.

### Low: 목록과 태그 설명을 구체화할 여지

`/blog`와 `/blog/tags/seo`의 description은 공통 소개인 `기록하고 실험하는 개발 블로그`다. 각 목록의
주제와 범위를 설명하면 페이지 구분에 도움이 될 수 있다. 검색 결과 개선은 측정되지 않았으며 배포 차단
조건으로 삼지 않는다. 한국어 페이지에 영어 글자 수·키워드 밀도 기준을 기계적으로 적용하지 않는다.

### 추가 확인: 본문 이미지의 공간 예약

표본 글의 본문 도표 2개는 설명 alt와 lazy loading이 있지만 HTML width/height 속성이 없다. CSS에서
비율이나 공간을 예약하는지까지 확인하지 않았으므로 CLS 오류로 확정하지 않는다. 실제 레이아웃 이동을
측정한 뒤 필요한 경우 비율 정보를 추가한다. 카드·장식 이미지의 빈 alt는 주변 링크 이름과 역할을
확인하기 전 결함으로 취급하지 않는다.

## 실제 실행한 분석 명령

아래 명령은 설치된 플러그인 루트에서 위 Python PATH를 적용하여 실행했다.

```sh
bin/codex-seo run parse_html.py <저장한 HTML> --url <대상 URL> --json
bin/codex-seo run sitemap_discovery.py https://hozorica.com --json
bin/codex-seo run render_page.py https://hozorica.com/ --mode always --json
bin/codex-seo run render_page.py https://hozorica.com/blog/nest-di-ioc --mode always --viewport mobile --json
bin/codex-seo run render_page.py https://hozorica.com/ --mode always --output <출력 HTML>
bin/codex-seo run render_page.py https://hozorica.com/blog/nest-di-ioc --mode always --viewport mobile --output <출력 HTML>
```

원본 HTTP HTML 8개 및 렌더링 HTML 2개를 번들 parser로 분석했다. HTTP 응답·헤더와 리다이렉트는 curl로
확인했다. 원시 자료는 로컬 임시 폴더 `/tmp/codex-seo-review.zAHIFn`에 있으며 운영체제의 정리 대상이
될 수 있다. 보고서가 지속 보관할 결과다.

렌더러의 `--json`은 `--output`보다 먼저 종료하므로 두 옵션을 함께 주면 HTML 파일이 생성되지 않았다.
JSON 요약과 HTML 저장을 분리해 재실행했다. 플러그인 소스는 수정하지 않았다.

## 제한과 배포 판단

- 표본에서 Critical/High로 확정할 SEO 문제는 발견하지 못했다. 전체 사이트의 배포 승인으로 해석하지
  않는다. 로컬 미커밋 변경과 현재 운영 배포는 다를 수 있다.
- Lighthouse, CrUX/CWV, Search Console 색인·실적, SERP, 백링크와 전체 링크 크롤링은 미실행이다. 계정
  연결·유료 API 호출은 하지 않았다. 모바일 viewport 렌더링을 수행했으나 시각 검수나 가로
  overflow·터치 영역 측정은 수행하지 않았다.
- 홈페이지 첫 렌더링에 DOM 안정화 시간 초과 진단이 있었다. 애니메이션이 있는 페이지에서의 수집
  제한으로 기록하며 성능 실패나 검색 차단으로 단정하지 않는다.
- 수집 시간이 Core Web Vitals는 아니다. 미측정 범주가 있어 전체 SEO 점수는 산정하지 않았다.
- 앱 코드 변경이 없어 lint/typecheck/test/build는 재실행하지 않았다. 기존 CI에 새 검사나 배포 차단
  조건을 추가하지 않았다.

후속 우선순위는 페이지별 공유 메타데이터 보완과 회귀 검사, 미리보기 배포의 실제 HTML 검사, 실측 성능
점검 순서다.

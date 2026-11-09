# DESIGN.md 비교 시안

2026-11-10. 사용자가 고른 세 공개 문서를 직접 다운로드하고 각각 메인과 상세를 만들었습니다. 메인 3개, 상세 15개, 비교 페이지 1개입니다. 기존 블로그 화면은 교체하지 않았습니다.

## 출처

- ThoughtStream: https://designmd.ai/chef/thoughtstream
- Warm Editorial: https://github.com/nexu-io/open-design/blob/main/design-systems/warm-editorial/DESIGN.md
- Editorial Logbook: https://github.com/Yeachan-Heo/gaebal-gajae-blog/blob/main/DESIGN.md

원문은 `docs/reference/design-lab/<안>/DESIGN.md`이며 바꾸지 않았습니다. 다운로드한 파일의 SHA-256과 URL은 `docs/reference/design-lab/sources.json`에 있습니다. 원문의 브랜드·프로젝트 정보는 최호의 사실로 재사용하지 않았습니다.

## 각 안에서 적용한 것

| 안 | 핵심 규칙 | 화면 구성 |
| --- | --- | --- |
| ThoughtStream | #FAFAF9·#1C1917, 680px, 본문 17px/1.8, 큰 섹션 여백, 각진 형태·그림자 없음 | 좁은 단일 열, 세리프 제목, 제목·설명·날짜를 세로로 쌓은 목록 |
| Warm Editorial | #FAF7F2·#1C1A17·#C0512F, 1200px, 최대 80px 세리프, 데스크톱 72vh 히어로 | 넓은 소개, 큰 대표 글과 오른쪽 글 목록, 종이색과 테라코타 링크 |
| Editorial Logbook | #F7F1E8·#FFFAF2·#201815·#C9472F, 1120px, 60px 굵은 제목, 작은 메타데이터 | 대표 글 1개, 실제로 동작하는 분류 필터, 날짜를 왼쪽에 둔 연대기 목록 |

## 조정·대체

- 유료·영문 지정 글꼴을 설치하지 않았습니다. 한글에 맞게 Noto Serif KR와 Noto Sans KR를 사용했고, 글꼴은 Google Fonts에서 필요한 글자만 받아 로컬 제공하며 OFL을 동봉했습니다. 원본과 글꼴 자체가 동일한 복제는 아닙니다.
- Warm Editorial의 작은 회색 글자는 대비를 위해 #746C65로 조정했습니다. 한글 제목의 줄 높이는 1.35 이상을 사용합니다.
- 데모의 작은 버튼은 Warm Editorial의 중립색 외곽선 변형으로 처리해 글자 대비를 확보했습니다. 자동 검사에서 원문 글꼴과 비교 도구막대의 색상이 원본과 다르다고 표시한 항목은 위의 한글 대체 및 비교 UI에 해당합니다.
- Logbook의 고유 캐릭터·프로젝트·RSS·언어 전환 등 실제 데이터나 기능이 없는 요소는 추가하지 않았습니다. 분류는 예시 글에 맞춘 에세이·인터랙션·개발노트입니다.
- 비교 도구막대는 시안 밖에 두었습니다. 안끼리 같은 상세 글로 바로 이동할 수 있습니다.
- 동작 예시는 외부 프레임워크 없이 HTML·CSS·JavaScript로 재구성한 비교용 데모입니다. 실제 블로그의 React 데모 소스는 바꾸지 않았습니다.
- 모든 화면은 예시 글을 사용하고 noindex입니다. 본문은 기존 MDX에서 가져오되 이 도구의 작은 렌더러는 현재 예시에서 사용하는 제목·문단·인용·목록·표·코드·데모만 지원합니다. 실제 블로그의 MDX 파이프라인을 대체하지 않습니다.

## 재생성

`pnpm design:lab` 실행 후 앱을 실행하면 `/design-lab/index.html`로 접근할 수 있습니다. 새 public 파일을 추가했다면 프로덕션 서버를 재시작합니다.

운영 사이트에서는 제공하지 않습니다. 로컬 비교는 `pnpm design:lab` 후 `python3 -m http.server 4184 --directory docs/reference`로 열어 `/design-lab/index.html`을 확인합니다.

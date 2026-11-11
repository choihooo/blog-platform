# hozorica.com AI 검색 준비도 분석

분석일: 2026-11-11 (Asia/Seoul). 대상: 운영 홈과 공개 글 3개, 현재 저장소.

**GEO Readiness Score: 62/100. 가장 큰 제약은 운영 사이트의 크롤링·색인 차단입니다.**

점수는 수동 진단 지표이며 검색 순위·AI 인용률·노출 확률을 측정한 값이 아닙니다. 준비도 점수와 실제 검색 접근 자격은 별개입니다. Google AI 검색은 일반 검색의 색인·품질 요건을 따릅니다. [Google AI 검색 안내](https://developers.google.com/search/docs/appearance/ai-features)

## 1. 점수와 플랫폼별 판단

| 항목 | 점수 | 근거 |
| --- | ---: | --- |
| 인용 가능한 내용 | 19/25 | 직접 구현한 사례·측정값·한계가 있으나 공개 근거 링크 부족 |
| 구조·가독성 | 18/20 | 글별 H1 하나, H2/H3 계층, 짧은 문단, 목차·코드 예시 |
| 시각 자료 | 12/15 | 회고 사진 4장, 임베딩 구조도, 컴파일 데모와 수치 표 |
| 저자·신뢰 근거 | 5/20 | 이름·직무·프로필·발행일 존재. 글별 저자 설명과 독립 검증 근거 부족 |
| 기술 접근성 | 8/20 | 초기 HTML에 본문 존재. robots 차단·noindex·빈 사이트맵 |
| 합계 | **62/100** | llms.txt와 RSL 부재에는 감점하지 않음 |

기술 항목 배점은 초기 HTML 8, 크롤링 허용 4, 색인 허용 4, 사이트맵 2, canonical 2입니다. 초기 HTML 6점과 canonical 2점을 부여했습니다. 상호작용 후 데모 상태 전체의 비-JavaScript 제공 여부는 확인하지 않았습니다.

| 플랫폼 | 공통 준비도 | 현재 제약 |
| --- | ---: | --- |
| Google AI Overviews | 62/100 | Googlebot 차단·noindex. 색인되고 스니펫 대상으로 제공되어야 함 |
| Google AI Mode | 62/100 | 같은 색인 제약. 실제 인용 여부 미측정 |
| ChatGPT Search | 62/100 | OAI-SearchBot에 전체 차단 적용 |
| Perplexity | 62/100 | PerplexityBot에 전체 차단 적용 |

플랫폼별 실측 자료가 없어 동일한 공통 준비도 점수를 적용했습니다. 서로 다른 점수를 만들 근거는 없습니다. Search Console, Bing Webmaster Tools, 실제 봇 로그, 플랫폼별 인용 추적 데이터에는 접근하지 않았습니다. 따라서 기존 색인이 없거나 실제 인용이 전혀 없다는 결론을 내리지 않습니다.

## 2. 운영 HTTP 응답

| 경로 | HTTP | 결과 |
| --- | ---: | --- |
| `/` | 200 | `noindex, nofollow`, 운영 도메인 canonical |
| `/blog/typescript-compiler-performance` | 200 | `noindex, nofollow`, 글별 canonical, 본문·표 포함 |
| `/blog/embedding-based-recommendations` | 200 | `noindex, nofollow`, 글별 canonical, 본문·구조도 포함 |
| `/blog/geobugirin-retrospective` | 200 | `noindex, nofollow`, 글별 canonical, 본문·사진 포함 |
| `/robots.txt` | 200 | `User-Agent: *` / `Disallow: /` |
| `/sitemap.xml` | 200 | URL 항목 없는 빈 `urlset` |
| `/llms.txt`, `/llms-full.txt` | 404 | 선택 파일 미제공 |

확인한 응답에는 X-Robots-Tag 헤더가 없었습니다. 차단은 HTML meta robots에서 확인했습니다. 홈과 글 3개 모두 JSON-LD가 없습니다.

`lib/site.ts`는 `VERCEL_ENV=production`이면서 `SITE_INDEXABLE=true`일 때만 색인을 허용합니다. robots와 sitemap도 이 조건을 공유합니다. 운영 환경 변수 자체는 읽지 않았으나 관찰한 응답은 비색인 분기와 일치합니다. `docs/deployment.md`에는 공개 준비 전 차단을 유지하는 정책이 있으므로 단순 코드 오류로 분류하지 않습니다.

robots 차단은 접근 인증이 아닙니다. 또한 크롤링을 막으면 봇이 noindex 지시를 새로 읽지 못할 수 있습니다. 공개 전환 시 robots 허용·noindex 제거·사이트맵 생성을 함께 확인해야 합니다. [Google robots.txt 안내](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

## 3. AI 크롤러 접근

다음은 **robots 규칙의 해석**입니다. 공급자 IP에서의 요청 성공이나 WAF 통과를 검증한 결과는 아닙니다.

| 봇·토큰 | 현재 규칙 | 해석 |
| --- | --- | --- |
| Googlebot | 차단 | 일반 검색과 Google AI 검색의 크롤링 |
| OAI-SearchBot | 차단 | ChatGPT 검색용 |
| GPTBot | 차단 | 모델 학습용. 검색 봇과 구분 |
| PerplexityBot | 차단 | Perplexity 검색용 |
| ClaudeBot / Claude-SearchBot | 차단 | 학습과 검색용 토큰을 구분할 것 |
| CCBot, anthropic-ai, Bytespider, cohere-ai | 차단 | wildcard 적용. 토큰의 현재 운영 여부까지 확인한 것은 아님 |
| Google-Extended, Google-CloudVertexBot | 차단 | Googlebot 검색 크롤링과 별도 제어 |
| ChatGPT-User, Perplexity-User | 규칙상 차단 | 사용자 요청 fetcher. robots가 항상 적용된다고 가정할 수 없음 |
| Google-Agent, Google-NotebookLM, Google Messages | 규칙상 차단 | 개별 사용자 요청 동작은 미검증 |

스킬의 GPTBot을 검색 봇으로 분류한 설명은 수정해서 해석했습니다. ChatGPT 검색을 위해 학습용 GPTBot까지 허용할 필요는 없습니다. [OpenAI 봇 안내](https://platform.openai.com/docs/bots), [Perplexity 봇 안내](https://docs.perplexity.ai/guides/bots)

공개 검색 전환 시 현 코드가 생성할 기본 규칙입니다. 현재 설정을 변경하지는 않았습니다.

```txt
User-Agent: *
Allow: /

Sitemap: https://hozorica.com/sitemap.xml
```

학습 수집 허용 정책은 검색 공개와 따로 정합니다. 학습용 토큰의 차단을 추가할 경우 최신 공식 토큰을 확인하고 검색 봇과 구분해야 합니다.

## 4. 서버 렌더링·JavaScript 의존성

운영 응답의 `<article>` 안에서 세 글의 제목·문단·발행일을 확인했습니다. TypeScript 글의 `2.54`, `2.37`, `6.7%`, `14.1%`와 표 3개가 초기 HTML에 있습니다. 임베딩 글에는 Cloudflare·Ollama와 구조 설명이 있고 회고에는 사진 4개와 대체 텍스트가 있습니다.

핵심 글을 읽기 위해 클라이언트 JavaScript가 필수는 아닙니다. 응답만으로 매 요청 SSR인지 빌드 시 정적 생성인지 구분하지는 않습니다. 데모 상태 변경·댓글·좋아요는 상호작용 기능이며, 핵심 설명과 수치는 본문·표로도 제공됩니다. 모든 AI 크롤러가 JavaScript를 절대 실행하지 않는다는 일반화는 사용하지 않습니다.

## 5. 저자와 외부 언급

사이트는 ‘최호’, ‘프론트엔드 개발자’, [GitHub](https://github.com/choihooo), [LinkedIn](https://www.linkedin.com/in/howuchoi/)을 연결합니다. 이는 사이트가 선언한 저자 연결이며 제3자 추천이나 경력 검증과는 다릅니다.

| 채널 | 확보한 근거 | 판정 |
| --- | --- | --- |
| LinkedIn | footer의 본인 프로필 링크 | 독립 언급으로 집계하지 않음 |
| GitHub | 본인 프로필 링크와 MDX 주석의 관련 PR | PR은 렌더링 본문에 없어 독자가 따라갈 수 없음 |
| Wikipedia / Wikidata | 확정 가능한 독립 언급 미확보 | 존재하지 않는다는 뜻이 아님 |
| Reddit | 확정 가능한 독립 언급 미확보 | 존재하지 않는다는 뜻이 아님 |
| YouTube | 확정 가능한 독립 언급 미확보 | 동명이인·유사 명칭을 세지 않음 |

외부 조사에서 이전 디자인과 이전 글 경로를 담은 검색 결과도 관찰했습니다. 이를 현재 글의 색인 증거로 사용하지 않았습니다. 채널별 외부 언급 전수 조사와 프로필 교차 검증은 완료하지 못했습니다.

언급과 인용의 상관관계를 순위 상승의 인과관계로 해석하지 않습니다. 이 개인 블로그에 Wikipedia 문서를 만들거나 무관한 커뮤니티에 언급을 늘리는 작업은 권하지 않습니다. 실제 프로젝트 근거와 저자 연결이 우선입니다.

## 6. 문단별 인용 가능성

스킬의 ‘134–167 words’는 한국어에서 검증된 최적 길이도 Google 필수 요건도 아닙니다. 어절 수를 맞추기 위해 글을 바꾸지 않습니다. 다음은 MDX의 H2 구간에서 코드 블록·JSX 태그를 제거하고 공백으로 센 참고값입니다. 개별 문단 길이나 영문 word count와 다릅니다.

| 글·H2 구간 | 참고 어절 수 | 평가 |
| --- | ---: | --- |
| 임베딩: 글을 비교하기 전에 입력부터 정리했습니다 | 135 | 사용자·글 입력과 제목·설명·태그·출처 역할이 명확함 |
| 임베딩: 추천한 이유도 함께 보여주었습니다 | 158 | 추천 이유와 키워드 오인 문제를 함께 설명 |
| 임베딩: 추천 점수와 읽고 싶은 글 사이에 남은 차이 | 137 | 규칙 검증과 실제 품질 검증의 차이를 명시 |
| 회고: 체격과 기준 자세를 반영해 동아리 대상을 받았습니다 | 158 | 문제·정규화·보정·결과 연결. 수상 근거 확인 경로 보완 가능 |
| 회고: 창업을 준비하며 사용자가 돈을 낼 이유를 고민했습니다 | 160 | 회고로서 의미 있음. 길이만으로 기술 답변 인용 적합성을 판단하지 않음 |

TypeScript 결과 구간은 255어절이며 표와 하위 제목을 포함합니다. 강점은 길이보다 버전·조건·반복 횟수·중앙값·한계를 구체적으로 밝힌 데 있습니다. 운영 HTML의 세 글에서 100어절 이상인 단일 `<p>`는 찾지 못했습니다. 짧은 문단을 유지해도 됩니다.

## 7. 가장 영향이 큰 변경 5개

1. **공개 준비가 끝났다면 색인 설정 전환.** Production의 `SITE_INDEXABLE=true`를 적용한 배포 후 robots 허용, 홈·글 3개의 index/follow, canonical, 사이트맵 URL 4개를 확인합니다. 현재 차단을 임의로 해제하지 않았습니다. 노출 시점은 보장하지 않습니다.
2. **공개 근거 링크 보강.** 임베딩 관련 PR·구현 코드, TypeScript 실험 저장소·공식 진단 문서를 독자에게 보이는 본문 링크로 연결합니다. 주석과 비공개 Notion은 공개 근거로 취급하지 않습니다. 실험 저장소의 정확한 공개 URL은 추가 확인이 필요합니다.
3. **도입부에 결과·범위·한계 연결.** TypeScript는 같은 코드·설정에서 버전만 비교한 결과를, 임베딩은 태그 불일치 문제·해결·추천 품질 미측정을 빠르게 파악하도록 보완합니다. 회고의 개인 서사는 유지합니다.
4. **글과 저자의 연결 명시.** 확인된 이름·직무·프로필로 글별 저자 표시와 Person/BlogPosting 연결을 검토합니다. 경력·수상·측정값을 추정하지 않습니다. 표시 위치 변경은 승인된 디자인 범위에서 별도 검토합니다.
5. **실제 검색 수집·인용 측정.** 공개 후 Search Console URL 검사·사이트맵, 실제 봇 로그, 인용 URL을 기록합니다. 예시 질의는 ‘TypeScript 3.9 5.8 증분 빌드 비교’, ‘태그 추천 임베딩 추천 이유’, ‘Tauri 최소화 카메라 추론 분리’입니다. 직접 측정 전에는 성과를 주장하지 않습니다.

## 8. 구조화 데이터 권고

홈과 글 3개에 JSON-LD가 없습니다. 구조화 데이터는 관계를 명확히 하는 보완책이며 AI 인용을 보장하지 않습니다. 특별한 AI 전용 스키마도 필요하지 않습니다. [Google Article 문서](https://developers.google.com/search/docs/appearance/structured-data/article), [Google AI 최적화 안내](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

| 대상 | 권고 | 제한 |
| --- | --- | --- |
| Person | `@id`, `name`, `url`, `sameAs` | 이름·홈·실제 GitHub와 LinkedIn. 회사·학위·자격 추정 금지 |
| BlogPosting | `headline`, `description`, `datePublished`, `author`, `mainEntityOfPage`, `url` | 기존 post 메타데이터·canonical 사용. author는 동일 Person 참조 |
| 수정일 | `dateModified` | 실제 내용 수정 근거가 있을 때만 추가. 발행일 유지 |
| 이미지 | `image` | 실제 대표 이미지·OG 이미지 적합성 확인 후 사용 |

실재하지 않는 Organization을 만들지 않습니다. FAQPage 추가나 모든 제목의 질문형 변경도 권하지 않습니다.

## 9. 구체적인 본문 수정 초안

아래는 제안이며 원문에는 적용하지 않았습니다. 기존 수치와 한계를 유지합니다.

### TypeScript: 도입부 뒤에 실험 요약

> 같은 코드와 설정에서 TypeScript 3.9.5와 5.8.3을 비교했습니다. 클린 빌드와 증분 빌드를 각각 5회 실행한 중앙값은 2.54초에서 2.37초, 1.28초에서 1.10초로 줄었습니다. 단축률은 각각 6.7%, 14.1%입니다. 당시 CPU·운영체제·Node.js 버전은 기록하지 못했으며, 이 실험으로 실무 마이그레이션의 개별 변경 효과를 구분할 수는 없습니다.

결과 표·명령은 유지하고 공개 실험 저장소와 원시 기록이 확인되면 연결합니다.

### 임베딩: 문제·해결·검증 범위 요약

> 블로그 스터디의 추천을 태그 일치에서 사용자 취향과 글의 의미를 비교하는 방식으로 바꿨습니다. 태그가 없거나 관심사와 다른 단어가 붙은 글도 비교하기 위해 제목·설명 등을 임베딩에 활용했습니다. 추천 이유를 함께 보여주고, 임베딩이 준비되지 않았을 때는 기존 태그 방식이나 최신순으로 목록을 제공했습니다. 입력과 추천 이유는 테스트했지만, 사용자가 실제로 읽고 싶은 글을 더 잘 추천하는지는 측정하지 못했습니다.

MDX 주석의 [관련 PR #84](https://github.com/bbbang105/study-admin/pull/84)는 공개 접근성과 내용 일치를 확인한 뒤 연결할 후보입니다. 이번 분석에서 PR 구현을 새로 검증하지는 않았습니다.

### 거부기린: 실행 구조 변경 요약

> 메인 화면을 최소화해도 자세 판단이 계속되도록 카메라 수집과 분석을 화면에서 분리했습니다. Python 엔진이 카메라를 직접 읽고 분석하며, Rust는 엔진 실행과 결과 전달을, React는 결과 표시를 맡았습니다. 전환 후 최소화 상태에서 위젯과 자세 판단이 계속 동작하는 것은 확인했지만, Electron과 Tauri의 성능 차이는 따로 측정하지 않았습니다.

기존 첫 문단의 서비스 정의와 사진 대체 텍스트는 명확합니다. 자세 추정 기능을 의학적으로 검증된 치료 효과로 확대해서 서술하지 않습니다.

## 10. llms.txt·라이선스

`/llms.txt`, `/llms-full.txt` 모두 404입니다. 감점하지 않았으며 상위 우선순위에도 넣지 않았습니다. Google AI 검색에 필수인 파일이 아니고, 다른 서비스의 실제 사용 여부·인용 효과도 이번 분석에서 입증하지 못했습니다. [Google AI 최적화 안내](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

별도 도구용 링크 목록이 필요할 때만 사용할 템플릿입니다. 실제 엔드포인트는 생성하지 않았습니다.

```md
# 최호의 블로그
> 프론트엔드 개발자 최호의 구현 경험과 학습 기록입니다.

## 글
- [TypeScript 컴파일과 빌드 비교](https://hozorica.com/blog/typescript-compiler-performance): 실험 조건·결과·한계
- [임베딩 기반 추천](https://hozorica.com/blog/embedding-based-recommendations): 입력·추천 이유·갱신·대체 경로
- [거부기린 회고](https://hozorica.com/blog/geobugirin-retrospective): 자세 추정과 앱 실행 구조 개선

## 저자
- [최호](https://hozorica.com/)
- [GitHub](https://github.com/choihooo)
- [LinkedIn](https://www.linkedin.com/in/howuchoi/)
```

확인한 HTML·robots에서 RSL 선언은 발견하지 못했습니다. 가능한 모든 라이선스 경로를 조사한 것은 아닙니다. 검색 인용 필수 요건으로 점수화하지 않았으며 콘텐츠 이용 정책이 정해지면 별도 검토합니다.

## 11. 범위와 검증 한계

- 변경한 것은 이 보고서뿐입니다. 사이트 코드·글·디자인·운영 환경 변수·배포는 변경하지 않았습니다.
- 운영 홈·글 3개·robots·sitemap·llms 경로의 HTTP 응답과 저장소 설정을 대조했습니다. 앱을 수정하지 않아 lint·타입 검사·빌드·모바일 UI 검증은 실행하지 않았습니다.
- 봇별 공급자 IP 요청·WAF·실제 색인·검색 순위·플랫폼별 인용률·유입량은 미측정입니다. 외부 언급 조사도 제한적입니다.
- 스킬의 특정 단어 수, 오래된 글의 인용 자격 상실, 특정 채널 비율을 순위 공식으로 사용하지 않았습니다. 발행일만 바꾸거나 기계적으로 문단을 나누는 작업은 권하지 않습니다.

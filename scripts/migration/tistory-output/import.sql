INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_book_review', '서평', 'book-review', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_cs', 'CS', 'cs', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_engineering', '개발', 'engineering', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_engineering_ai', '개발 AI', 'engineering-ai', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_engineering_fe', '개발 FE', 'engineering-fe', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_retrospective', '회고', 'retrospective', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at) VALUES ('cat_tistory', 'Tistory', 'tistory', NULL, NULL, 1, '2026-07-31T08:38:43.487Z') ON CONFLICT(slug) DO UPDATE SET name=excluded.name, parent_id=excluded.parent_id, parent_slug=excluded.parent_slug, depth=excluded.depth;
INSERT INTO tags (id, name, slug) VALUES ('tag_ai', 'AI', 'ai') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_certificate_manger', 'Certificate Manger', 'certificate-manger') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_cs', 'cs전공지식', 'cs') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_datastream', 'datastream', 'datastream') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_dv_certificate', 'DV Certificate', 'dv-certificate') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_kafka', 'Kafka기반', 'kafka') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_next', 'NeXT', 'next') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_nextjs', 'Nextjs', 'nextjs') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_ssl', 'SSL', 'ssl') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_ssl_tls', 'ssl/tls', 'ssl-tls') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_46e51a03', '우리프로그래머들', 'tistory-tag-46e51a03') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_85f75719', '협찬', 'tistory-tag-85f75719') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_8648bb14', '길벗', 'tistory-tag-8648bb14') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_91128800', '서버 컴포넌트', 'tistory-tag-91128800') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_95dd261e', '디자인패턴', 'tistory-tag-95dd261e') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_95e74138', '거부기린', 'tistory-tag-95e74138') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_ac6828de', '정규표현식', 'tistory-tag-ac6828de') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_b65551c6', '실시간데이터스트리밍', 'tistory-tag-b65551c6') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_e225a6fd', '로그인', 'tistory-tag-e225a6fd') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_f56917f5', '구름커밋', 'tistory-tag-f56917f5') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_fac711c0', '클라이언트 컴포넌트', 'tistory-tag-fac711c0') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO tags (id, name, slug) VALUES ('tag_tls', 'TLS', 'tls') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_39', 'tistory-39', '검증 가능한 AI UI 설계하기', '## AI를 신뢰한다는 말

ChatGPT에게 코드를 물어보고 그대로 붙여 넣은 적이 있다. 같은 질문을 해놓고도 검색 결과나 공식 문서를 다시 확인한 적도 있다.

둘 다 AI를 사용한 행동이지만, 신뢰한 방식은 다르다. 앞의 경우에는 답변을 바로 의사결정에 반영했고, 뒤의 경우에는 AI를 출발점으로만 썼다.

인간-AI 상호작용 연구에서 신뢰는 보통 이런 차이를 가리킨다. 사용자가 AI의 능력과 한계를 어느 정도 이해하고, 그 수준에 맞게 의존하는가. 그래서 신뢰는 만족도나 사용 의도와 구분된다.

만족도는 결과나 경험이 마음에 들었는지에 가깝다. 사용 의도는 앞으로도 계속 쓸 생각이 있는지를 말한다. 반면 신뢰는 AI의 결과가 완전히 맞는지 모르는 상황에서도 그 결과를 판단에 반영하려는 정도다.

ChatGPT를 매일 쓰는 개발자도 보안이나 결제 로직을 만들 때는 공식 문서를 함께 확인한다. 사용 의도는 높지만, 신뢰는 상황에 따라 조절하고 있는 셈이다.

### 과신과 불신

AI의 실제 능력보다 신뢰가 높으면 과신이 생긴다. 사용자는 AI가 틀린 답을 내도 그대로 받아들이고, 결과를 검증하지 않게 된다.

반대로 AI의 실제 능력보다 신뢰가 낮으면 불신이 생긴다. AI가 맞는 답을 제시해도 사용자는 끝까지 직접 확인하거나 아예 사용하지 않는다. 이 경우에는 AI가 줄 수 있는 이점도 사라진다.

최근 연구에서 다루는 핵심은 신뢰의 양보다 보정이다. AI가 잘 맞는 상황에서는 빠르게 받아들이고, 틀릴 가능성이 큰 상황에서는 확인하도록 돕는 일이다.

이 관점에서 AI 인터페이스의 역할도 달라진다. 좋은 인터페이스는 AI를 유능하게 보이도록 포장하는 화면보다, 사용자가 의존 수준을 조절할 수 있게 해주는 화면에 가깝다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/021e9930fcb5cad2.png)

##

## 인터페이스가 신뢰를 바꾼다

사용자가 AI의 답변을 판단하려면 출처, 근거, 과거 성능을 확인해야 한다. 그러나 매번 모델의 정확도를 직접 평가하기는 어렵다. 실제 서비스에서는 화면에 드러난 여러 단서가 판단에 영향을 준다.

그중 하나가 의인화다.

`Believing Anthropomorphism` 연구는 2,165명의 참가자를 대상으로 LLM 인터페이스의 의인화 단서가 사용자 인식에 어떤 영향을 미치는지 실험했다. 연구진은 같은 가상의 LLM을 텍스트만 제공하는 조건과 음성·텍스트를 함께 제공하는 조건으로 나눴다. AI가 자신을 `I`라고 표현하는 조건과 `the system`이라고 표현하는 조건도 비교했다.

음성과 텍스트를 함께 제공한 인터페이스는 텍스트만 제공한 인터페이스보다 더 인간적인 시스템으로 인식됐다. 여기까지는 예상 가능한 결과다. 흥미로운 점은 음성이 추가된 조건에서 참가자들이 AI가 제공한 정보의 정확성까지 더 높게 평가했다는 점이다. 일부 조건에서는 AI가 자신을 `I`라고 표현했을 때 정보의 정확성은 더 높게, 위험은 더 낮게 평가됐다.

음성이나 1인칭 표현이 모델의 추론 능력을 높인 것은 아니다. 달라진 것은 성능이 아니라 사용자가 시스템을 받아들이는 방식이었다.

```
인간적인 표현
사람처럼 느껴지는 시스템
더 정확해 보이는 답변
낮게 평가되는 위험
```

이 결과는 인터페이스가 단순한 포장이 아니라 사용자가 AI의 능력을 추론하는 단서로 작동한다는 점을 보여준다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/480a55192259555c.png)

AI가 친근하고 자연스럽게 말한다는 사실과 답변이 정확하다는 사실은 분리해서 봐야 한다. 자연스러운 음성, 1인칭 표현, 공감하는 말투는 사용자가 AI를 더 유능하게 느끼게 만들 수 있다. 그러면 답변의 근거보다 화면의 인상이 신뢰 판단에 더 크게 작용할 수 있다.

이 문제는 AI가 틀렸을 때 커진다. 인간적인 인터페이스는 잘못된 답변도 자연스럽고 설득력 있게 전달할 수 있기 때문이다. 의료, 금융, 채용, 법률, 포렌식처럼 판단 비용이 큰 분야에서는 친근함이나 전문적인 인상이 정확성을 대신해서는 안 된다.

## 설명과 신뢰도 표시의 한계

많은 AI 서비스는 결과를 더 신뢰할 수 있게 만들기 위해 설명 기능을 제공한다. 결과 옆에 `신뢰도 92%` 같은 수치를 표시하거나, AI가 판단한 이유를 문장으로 보여준다. 특정 영역을 색으로 강조하거나 그래프로 시각화하는 방식도 자주 쓰인다.

직관적으로는 설명이 많을수록 사용자가 AI를 더 잘 이해할 것처럼 보인다. 실제 결과는 단순하지 않았다.

`Engaging with AI: How Interface Design Shapes Human-AI Collaboration in High-Stakes Decision-Making` 연구는 당뇨병 관리 의사결정 상황에서 여러 종류의 AI 지원 인터페이스를 비교했다. 총 108명이 참여했고, 연구진은 텍스트 설명, 시각적 설명, 신뢰도 표시, 과거 성능 시각화, 사용자에게 먼저 의견을 묻는 방식 등을 실험했다.

연구 결과, 신뢰도 표시와 텍스트 설명, 과거 성능 시각화는 인간과 AI가 함께 수행한 과제의 성과를 높이는 데 도움이 됐다. AI의 추론 근거가 제공됐을 때는 신뢰 형성에도 긍정적인 영향이 있었다.

반면 단순한 시각적 설명은 사용자의 신뢰에 큰 영향을 주지 못했다. 사용자에게 먼저 의견을 요구하거나 AI가 질문을 던지는 방식은 더 깊은 사고를 유도했지만, 동시에 인지적 부담을 높여 과제 수행 성과를 낮추기도 했다.

설명 기능의 효과는 존재 여부보다 형식과 맥락에 달려 있었다.

### 숫자는 빠르지만 불완전하다

Confidence를 숫자로 보여주는 방식은 간단하다.

```
AI 신뢰도 92%
```

이 숫자는 사용자가 결과를 빠르게 훑는 데 도움을 줄 수 있다. Confidence가 낮다면 한 번 더 확인하고, 높다면 우선순위를 높게 둘 수 있다.

문제는 사용자가 `92%`의 의미를 알기 어렵다는 데 있다. 모델이 정답일 확률인지, 특정 클래스에 대한 출력값인지, 과거 데이터에서 측정된 정확도인지가 화면만으로는 분명하지 않다. 높은 숫자는 그 자체로 강한 인상을 주기 때문에 근거 확인을 건너뛰게 만들 수도 있다.

문장형 설명도 같은 한계를 가진다.

```
환자의 혈당 수치, 식사 기록, 이전 투약 패턴을 분석한 결과
현재 인슐린 투여량을 유지하는 것이 적절합니다.
```

문장은 그럴듯하다. 그러나 사용자가 실제 혈당 수치나 투약 기록을 확인할 수 없다면, 이 설명은 검증 가능한 근거라기보다 결론을 다시 말한 문장에 가깝다.

좋은 설명은 결론을 꾸미는 문장이 아니다. 사용자가 그 결론을 확인할 수 있게 만드는 정보다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/2152d6139b137a07.png)

### 정보가 많아도 판단은 어려워질 수 있다

AI의 판단 근거를 모두 노출하면 사용자는 많은 정보를 한꺼번에 마주한다.

```
Confidence
Feature Importance
Attention Map
추론 과정
과거 정확도
원본 데이터
메타데이터
유사 사례
시스템 로그
```

각 정보는 의미가 있을 수 있다. 그러나 사용자가 무엇을 먼저 봐야 하는지 모르면 화면은 복잡해지고 판단은 느려진다.

그래서 설명 UI는 정보량보다 순서가 중요하다. 처음에는 결론과 불확실성을 보여주고, 다음에는 핵심 근거를 보여주고, 더 필요한 경우 원본 데이터와 세부 분석으로 들어갈 수 있어야 한다.

```
1. AI의 결론과 불확실성
2. 결론을 뒷받침하는 핵심 근거
3. 원본 데이터와 세부 분석
```

사용자가 AI의 결과와 근거를 빠르게 비교하고, 필요할 때 원본까지 확인할 수 있어야 한다. 이때 설명은 설득 장치보다 검증 장치에 가까워진다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/342443e94bbec134.png)

## Evidence UI를 설계한 과정

이 관점을 실제 제품에 적용할 기회가 있었다.

내가 참여한 프로젝트는 AI가 문서, 이미지, 음성, 영상 파일을 분석하고 관련도가 높은 자료를 찾아주는 포렌식 데스크톱 서비스였다. 기존 결과 화면은 파일명과 AI가 계산한 관련도 점수를 중심으로 구성돼 있었다.

```
meeting-record.mp4

관련도 점수: 0.91
```

점수는 결과를 정렬하고 우선순위를 정하는 데 유용했다. 그러나 사용자는 바로 다음 질문에 답할 수 없었다.

> 
이 파일이 왜 탐지됐을까?**

영상 파일의 관련도 점수가 `0.91`로 표시돼도 어떤 음성 구간이 탐지됐는지, 화면 속 어떤 문장이 검색어와 일치했는지, 어떤 메타데이터가 판단에 쓰였는지 알 수 없었다.

사용자는 점수를 믿거나 원본 파일을 처음부터 다시 확인해야 했다. 영상이나 음성처럼 길이가 긴 파일에서는 이 비용이 특히 컸다. 몇 초짜리 관련 구간을 찾기 위해 전체 파일을 재생해야 했고, 문서와 이미지도 원본을 따로 열어 탐지된 내용을 찾아야 했다.

AI의 정확도만의 문제가 아니었다. 결과를 검증할 수 있는 정보가 화면에 부족했다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/72cf9ba739aee18e.png)

### 설명 대신 원본 근거

처음에는 점수 옆에 AI의 판단 이유를 텍스트로 추가하는 방식을 생각했다.

```
이 파일은 검색어와 관련된 내용을 포함하고 있어 높은 점수를 받았습니다.
```

이런 문장은 점수를 풀어서 설명할 뿐이다. 사용자가 직접 확인할 수 있는 정보는 늘어나지 않는다.

그래서 AI가 만든 설명문보다 원본 근거를 결과 화면에 붙이는 방향으로 설계했다. 파일 유형에 따라 근거 구조를 다르게 잡았다.

```
문서: 검색어와 일치한 본문 문장
이미지: OCR로 추출된 일치 텍스트와 원본 위치
오디오: STT로 변환된 발화 내용과 타임스탬프
영상: 관련 음성 구간, 화면 OCR, 재생 위치
공통: 파일 생성 시각, 위치, 형식 등의 메타데이터
```

핵심은 모든 파일을 같은 카드로 처리하지 않는 것이었다. 사용자는 문서, 이미지, 음성, 영상을 검증할 때 서로 다른 단서를 본다. UI도 그 차이를 따라가야 했다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/39d1b67b1bbdffd4.png)

### OCR과 STT는 이동 지점이 됐다

이미지와 영상 프레임에서는 OCR로 추출한 텍스트 중 검색어와 일치한 문장을 보여줬다.

```
탐지된 문장

"프로젝트 계약 관련 자료는 별도 서버에 보관합니다."
```

텍스트만 보여주면 사용자는 OCR 결과를 다시 믿어야 한다. 그래서 가능한 경우 해당 문장이 발견된 원본 이미지나 프레임을 함께 확인할 수 있게 했다. 사용자는 실제 이미지에 문장이 있는지, OCR이 글자를 잘못 읽지 않았는지, 검색어가 문맥상 의미 있게 쓰였는지 비교할 수 있었다.

음성과 영상은 STT 결과를 세그먼트 단위로 나눴다. 각 세그먼트에는 변환된 문장과 시작·종료 시각을 포함했다.

```
[02:14~02:22]

"관련 파일은 외부 저장 장치로 옮겨 두겠습니다."
```

사용자가 세그먼트를 선택하면 해당 재생 위치로 바로 이동한다. STT 문장은 정답이 아니라 원본 음성을 빠르게 확인하기 위한 인덱스로 사용했다.

### 메타데이터는 별도의 근거로 다뤘다

파일명, 생성 시각, 수정 시각, 촬영 위치, 파일 형식 같은 메타데이터도 함께 제공했다. 메타데이터는 OCR이나 STT와 성격이 다르다. 콘텐츠의 의미보다 파일의 생성 배경과 관계를 추론하는 데 도움을 준다.

다만 메타데이터도 확정적인 사실처럼 표현하지 않았다. 일부 값은 누락되거나 수정될 수 있고, 기기 설정에 따라 부정확할 수도 있기 때문이다.

화면 안에서는 각 정보의 역할을 분리했다.

```
AI 관련도 점수: 확인 순서를 정하는 신호
OCR·STT: 콘텐츠에서 발견한 근거
메타데이터: 파일의 맥락을 이해하기 위한 보조 정보
원본 파일: 사용자가 최종 판단을 내리는 대상
```

이 구분 덕분에 점수, 근거, 원본이 한 덩어리처럼 보이지 않았다. 사용자는 높은 점수를 정답으로 받아들이기보다, 점수를 따라 근거를 보고 원본에서 확인할 수 있었다.

### 결과에서 원본까지의 이동

근거가 있어도 여러 화면을 오가야 한다면 검증은 쉽게 생략된다. 결과 목록에서 파일을 선택하면 점수, 핵심 근거, 원본 미리보기를 한 흐름에서 볼 수 있게 한 이유다.

초기 화면에는 대표 근거만 보여줬다. 세부 OCR 결과, STT 세그먼트, 전체 메타데이터는 필요할 때 펼쳐보게 했다.

```
1. 파일과 관련도 점수 확인
2. 대표 OCR·STT 근거 확인
3. 근거 선택
4. 원본의 해당 위치로 이동
5. 최종 판단
```

가능한 모든 정보를 한 화면에 나열하기보다, 결과에서 원본 확인까지 걸리는 시간을 줄이는 데 집중했다.

## 설계 원칙

연구와 프로젝트 경험을 함께 놓고 보면, 검증 가능한 AI UI에는 몇 가지 조건이 필요했다.

### 결과와 근거를 가까이 둔다

AI는 결론을 제시하는 데서 끝나면 안 된다. 사용자가 그 결론을 판단할 수 있도록 근거를 함께 제공해야 한다.

```
위험도 91%

[근거 보기]
```

이렇게 근거가 접힌 버튼 뒤에 있거나 다른 화면에 있으면 사용자는 확인을 미룬다. 결과 바로 옆에서 핵심 근거를 볼 수 있으면 검증 비용이 낮아진다.

### AI의 역할과 불확실성을 표현한다

AI의 답변을 확정적인 사실처럼 표현하면 사용자는 AI가 판단한 것인지, 사람이 확인한 것인지 구분하기 어렵다.

```
이 파일은 악성 파일입니다.
```

더 나은 표현은 AI의 역할과 사용자의 다음 행동을 함께 알려준다.

```
악성 파일일 가능성이 높습니다.

다음 근거를 바탕으로 탐지했습니다.

최종 판단을 위해 원본을 확인해주세요.
```

사용자는 AI가 무엇을 알고 있고 무엇을 모르는지 이해할 수 있어야 한다.

### 화면의 인상보다 근거를 앞세운다

친근한 말투, 자연스러운 애니메이션, 전문적인 화면은 사용성을 높일 수 있다. 그러나 이런 요소가 정확성의 근거처럼 보이면 위험하다.

사용자가 확인해야 하는 것은 인터페이스의 분위기보다 판단 근거다. 디자인은 AI를 유능해 보이게 만드는 데 쓰기보다, 근거를 찾고 비교하는 과정을 쉽게 만드는 데 써야 한다.

### 중요한 결정에는 확인 단계를 넣는다

영화 추천이 틀리는 것과 의료, 금융, 채용, 법률, 포렌식 판단이 틀리는 것은 비용이 다르다. 판단 비용이 큰 영역에서는 사용자가 AI 결과를 그대로 받아들이지 않도록 화면이 개입해야 한다.

가능한 방식은 단순하다.

- 원본 데이터를 함께 보여주기

- 최종 제출 전에 근거를 다시 확인하게 하기

- 사용자의 판단을 먼저 입력하게 하기

- AI가 놓친 가능성을 함께 제시하기

모든 상황에서 검증을 강제할 필요는 없다. 다만 중요한 의사결정에서는 사용자가 한 번 멈춰 확인할 수 있어야 한다.

## 검증 가능성이 신뢰를 만든다

처음에는 Evidence UI의 성과를 두고 사용자가 AI를 더 신뢰하게 됐다고 설명할 수 있다고 생각했다. 연구를 살펴본 뒤에는 그 표현이 충분하지 않다고 느꼈다.

사용자가 AI 결과를 더 자주 받아들였다는 사실만으로는 좋은 변화인지 알 수 없다. AI가 틀린 상황에서도 결과를 그대로 따른다면 과신이 늘어난 것일 수 있다.

Evidence UI가 바꾼 것은 신뢰의 양보다 판단 과정이었다. 사용자는 다음 질문에 더 빨리 답할 수 있었다.

```
AI는 왜 이 파일을 탐지했는가?
그 근거는 원본에도 실제로 존재하는가?
OCR이나 STT가 잘못 해석한 것은 아닌가?
이 결과를 받아들여도 되는가?
```

점수만 있던 화면에서는 사용자가 AI의 판단을 믿거나 원본을 처음부터 다시 조사해야 했다. Evidence UI에서는 AI가 제시한 근거를 따라가며 원본과 비교하고, 필요하면 결과를 거부할 수 있었다.

AI UI에서 신뢰는 보기 좋은 화면이나 높은 점수에서 만들어지지 않는다. 결과와 근거가 연결되어 있고, 사용자가 그 근거를 원본에서 확인할 수 있을 때 생긴다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-39/74549bbb0ad45a88.png)

※ 이미지에 대하여**

본 글에 포함된 UI 이미지는 설명을 돕기 위해 AI를 활용하여 제작한 **예시(Mockup)** 입니다. 실제 프로젝트의 화면이나 회사의 내부 UI를 사용하지 않았으며, 제품 구조와 UX 설계 의도를 이해하기 쉽도록 재구성한 이미지입니다.

## 참고 문헌 (References)

> 
본 글의 내용은 다음 연구들을 참고하여 작성했습니다.

- **Liu, Z. et al.** (2025). _Eye-Tracking Evidence That Verifiable Explanations Support Visual Evidence Checking._ Nature Communications.[https://doi.org/10.1038/s41467-025-60281-7](https://doi.org/10.1038/s41467-025-60281-7)

- **Lai, V., et al.** (2023). _How Human-Centered Explainable AI Interface Are Designed and Evaluated: A Systematic Survey._ arXiv:2403.14496.

- **Hoffman, R. R., et al.** (2018). _Metrics for Explainable AI: Challenges and Prospects._ arXiv:1812.04608.

- **Eiband, M., et al.** (2019). _Bringing Transparency Design into Practice._ IUI 2019.

- **Miller, T.** (2019). _Explanation in Artificial Intelligence: Insights from the Social Sciences._ Artificial Intelligence, 267, 1-38.', 'AI를 신뢰한다는 말ChatGPT에게 코드를 물어보고 그대로 붙여 넣은 적이 있다. 같은 질문을 해놓고도 검색 결과나 공식 문서를 다시 확인한 적도 있다.둘 다 AI를 사용한 행동이지만, 신뢰한 방식은 다르다. 앞의 경우에는 답변을 바로 의사결정에 반영했고, 뒤의 경우에는 AI를 출발점으로만 썼다. 인간-AI 상호작용 연', (SELECT id FROM categories WHERE slug = 'engineering-fe' LIMIT 1), 'blog/tistory/tistory-39/021e9930fcb5cad2.png', '2026-07-27T15:55:39+09:00', '2026-07-27T15:55:39+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_39';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_37', 'tistory-37', '강남언니 SEO 웹 전략을 보고 정리한 테크니컬 SEO', 'FECONF 2025에서 공개된 강남언니 SEO 웹 전략 영상을 봤다. 제목부터 강했다. 1년에 10억 원을 절약했다는 이야기였는데, 단순히 광고비를 아꼈다는 말보다 더 인상적이었던 건 SEO를 바라보는 관점이었다.

나는 SEO라고 하면 먼저 메타 태그, 시멘틱 태그, LCP 같은 키워드를 떠올렸다. 프론트엔드 개발자가 챙겨야 하는 SEO도 그 정도라고 생각하기 쉬웠다. 그런데 강남언니 사례에서 중요한 포인트는 조금 달랐다.

핵심은 검색 엔진이 우리 페이지를 얼마나 잘 발견하고, 이해하고, 노출하고, 사용자가 클릭하게 만들 수 있는가였다. 즉, SEO는 태그 몇 개를 넣는 작업이 아니라 검색 유입 퍼널을 설계하는 일에 가까웠다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-37/681755bfee336289.png)

## SEO를 퍼널로 보기

영상에서 가장 좋았던 부분은 SEO를 퍼널로 나눠서 설명한 점이었다.

검색 유입은 크게 이렇게 볼 수 있다.

- 검색 노출: 페이지가 검색 결과에 뜨는가

- 검색 유입: 사용자가 검색 결과에서 클릭하는가

- 앱 내 전환: 들어온 사용자가 서비스가 원하는 행동을 하는가

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-37/4483ca8e118806e5.png)

프론트엔드 개발자가 흔히 말하는 SEO 작업은 보통 앞의 두 단계와 많이 연결된다. 페이지가 검색 엔진에 잘 수집되고, 검색 결과에서 클릭하고 싶게 보여야 한다.

강남언니처럼 병원, 시술, 리뷰, 지역 같은 페이지가 많은 서비스에서는 이 퍼널이 더 중요해진다. 페이지가 많다는 것은 SEO 기회가 많다는 뜻이기도 하지만, 동시에 잘못 관리하면 검색 봇의 리소스를 낭비할 수 있다는 뜻이기도 하다.

##

## 크롤링이 된다고 노출되는 것은 아니다

SEO를 공부할 때 자주 헷갈리는 개념이 크롤링과 인덱싱이다.

크롤링은 검색 봇이 페이지를 방문해서 수집하는 과정이다. 인덱싱은 수집한 페이지가 검색 엔진의 색인에 등록되는 과정이다. 검색 결과에 노출되려면 단순히 크롤링되는 것만으로는 부족하고, 인덱싱까지 되어야 한다.

이 차이를 이해하면 테크니컬 SEO의 역할이 더 분명해진다.

테크니컬 SEO는 검색 엔진이 우리 사이트의 중요한 페이지를 잘 찾고, 불필요한 페이지에 시간을 쓰지 않게 만들고, 수집한 페이지의 의미를 정확히 이해하도록 돕는 작업이다.

## 크롤링 버짓을 아껴야 한다

강남언니 사례에서 특히 기억에 남은 개념은 크롤링 버짓이었다.

검색 봇은 우리 사이트를 무한히 탐색하지 않는다. 하루 동안 특정 사이트에 사용할 수 있는 시간과 리소스가 제한되어 있다. 이 리소스를 크롤링 버짓이라고 볼 수 있다.

페이지가 적은 사이트라면 크게 체감되지 않을 수 있다. 하지만 강남언니처럼 병원, 시술, 리뷰, 지역, 필터 조합으로 많은 URL이 만들어지는 서비스에서는 이야기가 달라진다.

예를 들어 필터 페이지를 생각해보면, 지역과 정렬 조건과 카테고리가 조합되면서 수많은 URL이 생긴다. 이 중에는 검색 유입 가치가 있는 페이지도 있지만, 거의 같은 내용을 보여주는 중복 페이지도 생길 수 있다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-37/be728a7dbcd0736d.png)

모든 URL을 검색 봇에게 열어두면 이런 문제가 생긴다.

- 의미 없는 URL이 크롤링된다.

- 중복 콘텐츠가 늘어난다.

- 중요한 페이지의 수집 우선순위가 밀린다.

- 검색 엔진이 대표 페이지를 판단하기 어려워진다.

그래서 테크니컬 SEO에서는 어떤 페이지를 검색 엔진에 보여줄 것인가를 정해야 한다. 이건 단순한 개발 구현이 아니라 제품과 비즈니스 판단이 섞인 작업이다.

##

## 사이트맵은 URL 목록이 아니라 전략이다

사이트맵은 검색 엔진에게 우리 사이트의 URL을 알려주는 파일이다. 그런데 영상 내용을 정리하면서 사이트맵을 단순한 체크리스트로 보면 안 되겠다고 느꼈다.

사이트맵은 검색 엔진에게 이 페이지들이 중요하다고 알려주는 신호에 가깝다.

큰 서비스에서는 모든 URL을 하나의 사이트맵에 넣을 수도 없다. 사이트맵에는 URL 수와 용량 제한이 있기 때문에, 규모가 커지면 여러 파일로 나누고 사이트맵 인덱스로 묶어야 한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-37/80d2e68b74643fbe.png)

예를 들어 이런 식의 기준이 필요하다.

- 정적 페이지 사이트맵

- 병원 페이지 사이트맵

- 시술 페이지 사이트맵

- 리뷰 페이지 사이트맵

- 국가나 언어별 사이트맵

- 지역 조합 페이지 사이트맵

중요한 건 파일을 나누는 기술 자체가 아니다. 어떤 URL 그룹이 검색 유입 가치가 있는지 판단하고, 그 URL을 검색 엔진에 명확히 전달하는 것이다.

## Canonical은 중복 URL의 기준을 잡는다

동적 페이지가 많아지면 같은 콘텐츠가 여러 URL로 접근되는 일이 많다.

예를 들어 같은 병원 페이지라도 쿼리스트링이나 유입 경로에 따라 URL이 달라질 수 있다. 사용자는 같은 내용을 보고 있지만 검색 엔진 입장에서는 서로 다른 페이지처럼 보일 수 있다.

이때 canonical 태그가 필요하다.

canonical은 검색 엔진에게 이 페이지의 대표 URL은 이것이다라고 알려준다. 중복 URL이 생기는 서비스에서 canonical이 없으면 SEO 가치가 여러 URL로 흩어질 수 있고, 검색 엔진이 어떤 페이지를 기준으로 삼아야 할지 헷갈릴 수 있다.

프론트엔드에서는 페이지별 canonical URL을 정확히 생성하는 로직이 중요하다. 특히 다국어, 지역, 필터, 정렬, 검색 조건이 섞이는 서비스라면 더 그렇다.

## 검색 결과에서 클릭하고 싶게 만들기

검색 결과에 뜨는 것만으로는 부족하다. 사용자가 클릭해야 유입이 생긴다.

이 단계에서는 메타 태그, Open Graph, 구조화 데이터가 중요해진다.

title과 description은 검색 결과에서 사용자가 가장 먼저 보는 정보다. SNS에 공유될 때는 OG 태그가 첫인상을 만든다. 다국어 서비스라면 언어별 메타 정보가 제대로 나오는지도 중요하다.

영상 메모를 정리하면서 기억에 남은 예시는 검색 결과에 엉뚱한 언어나 내부 키값이 노출되는 문제였다. 사용자가 일본어로 검색했는데 한국어 설명이 나오거나, 사람이 읽을 문장이 아니라 개발 중 쓰던 키값이 보인다면 클릭률과 신뢰도가 떨어질 수밖에 없다.

결국 메타 태그는 단순히 head에 넣는 코드가 아니라 검색 결과에서 사용자를 설득하는 문구다.

## 구조화 데이터는 검색 엔진에게 설명서를 주는 일이다

구조화 데이터도 중요하다. 검색 엔진은 HTML을 읽고 페이지의 의미를 추론하지만, 구조화 데이터를 넣으면 페이지의 정보를 더 명확히 전달할 수 있다.

예를 들어 병원 서비스라면 병원 정보, 리뷰, 평점, 위치, FAQ 같은 데이터를 검색 엔진이 이해하기 좋은 형태로 제공할 수 있다. 이벤트 페이지라면 이벤트 날짜와 장소를, 블로그 글이라면 작성자와 발행일을 알려줄 수 있다.

보통 JSON-LD 형식으로 넣고, [Schema.org](http://schema.org/)의 타입을 따른다.

프론트엔드 개발자 입장에서는 이 부분이 꽤 흥미롭다. 검색 결과에서 별점, FAQ, breadcrumb 같은 리치 결과가 나오는 것이 단순히 검색 엔진이 알아서 해주는 일이 아니라, 우리가 페이지에 어떤 정보를 구조화해서 넣었는지와 연결되기 때문이다.

## 성능 개선도 SEO와 연결된다

LCP, INP, CLS 같은 Core Web Vitals는 사용자 경험 지표로 많이 이야기된다. 그런데 SEO 관점에서도 성능은 중요하다.

페이지가 느리면 사용자가 이탈할 가능성이 높고, 검색 봇이 같은 시간 안에 수집할 수 있는 페이지 수도 줄어든다. 특히 페이지 수가 많은 서비스에서는 개별 페이지의 수집 비용을 줄이는 것이 크롤링 효율과 연결된다.

그래서 LCP 개선은 단순히 Lighthouse 점수를 올리는 작업이 아니다. 검색 봇이 페이지를 더 빠르게 읽고, 사용자가 검색 유입 후 더 안정적으로 페이지를 경험하게 만드는 작업이다.

## SEO는 배포하고 끝나는 작업이 아니다

SEO 작업은 배포 직후 바로 결과가 보이지 않는다. 검색 엔진이 다시 크롤링하고, 인덱싱하고, 검색 결과에 반영하는 데 시간이 걸린다.

그래서 모니터링이 필요하다.

볼 수 있는 지표는 다음과 같다.

- 검색 노출 수

- 클릭 수

- CTR

- 평균 게재 순위

- 색인된 페이지 수

- 크롤링 오류

- 사이트맵 상태

- Core Web Vitals

- 유입 이후 전환율

Google Search Console은 필수에 가깝고, 한국 사용자 대상 서비스라면 네이버 서치어드바이저도 같이 봐야 한다.

중요한 건 검색 순위가 올랐는가만 보는 것이 아니다. 노출이 늘었는지, 클릭이 늘었는지, 들어온 사용자가 실제 서비스 행동으로 이어졌는지를 함께 봐야 한다.

## 정리

이번 영상을 보고 테크니컬 SEO를 조금 다르게 보게 됐다.

예전에는 테크니컬 SEO를 메타 태그, 시멘틱 태그, sitemap.xml, robots.txt 같은 체크리스트로 이해했다. 물론 이것들도 중요하다. 하지만 강남언니 사례에서 더 크게 보였던 것은 검색 유입 전체를 설계하는 관점이었다.

테크니컬 SEO는 결국 이런 질문에 답하는 일이다.

- 검색 봇이 중요한 페이지를 찾을 수 있는가?

- 불필요한 URL에 크롤링 버짓을 낭비하고 있지 않은가?

- 수집된 페이지가 인덱싱될 만큼 명확한가?

- 중복 URL의 대표 기준이 잡혀 있는가?

- 검색 결과에서 사용자가 클릭할 이유가 보이는가?

- 유입 이후 실제 전환까지 이어지는가?

SEO는 검색 순위를 억지로 올리는 기술이 아니다. 좋은 페이지가 검색 엔진과 사용자에게 제대로 발견되도록 길을 정리하는 작업이다.

특히 프론트엔드 개발자는 그 길의 많은 부분을 코드로 만들 수 있다. 그래서 테크니컬 SEO는 단순한 부가 작업이 아니라, 서비스 성장과 직접 연결되는 프론트엔드의 중요한 영역이라고 느꼈다.

## 참고

- FECONF 2025 강남언니 SEO 웹 전략: [https://www.youtube.com/watch?v=7Ps7fVCaVGs](https://www.youtube.com/watch?v=7Ps7fVCaVGs)

- Google Search Central SEO 기본 가이드: [https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ko)

_이미지는 Chatgpt를 이용하여 생성했습니다._', 'FECONF 2025에서 공개된 강남언니 SEO 웹 전략 영상을 봤다. 제목부터 강했다. 1년에 10억 원을 절약했다는 이야기였는데, 단순히 광고비를 아꼈다는 말보다 더 인상적이었던 건 SEO를 바라보는 관점이었다.나는 SEO라고 하면 먼저 메타 태그, 시멘틱 태그, LCP 같은 키워드를 떠올렸다. 프론트엔드 개발자가 챙', (SELECT id FROM categories WHERE slug = 'engineering-fe' LIMIT 1), 'blog/tistory/tistory-37/681755bfee336289.png', '2026-07-17T12:26:31+09:00', '2026-07-17T12:26:31+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_37';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_36', 'tistory-36', '한국어 번역으로 기여하기', '최근 `holistics/dbx-multi-lang` 저장소에 한국어 locale을 추가하는 PR을 보냈다.

처음에는 단순히 "한국어 번역 파일을 추가하면 되겠지" 정도로 생각했다. 한국어 문장을 채워 넣고, 파일을 추가하고, PR을 올리면 끝나는 작업에 가까울 거라고 봤다. 그런데 막상 작업해보니 생각보다 단순한 번역 작업은 아니었다. 기존 locale 구조를 맞춰야 했고, 패키지에서 실제로 export되도록 연결해야 했고, placeholder나 특수 문자가 런타임에서 깨지지 않는지도 확인해야 했다.

결과적으로 PR은 merge되었고, `dbdiagram.io`와 `dbdocs.io`에서 사용할 수 있는 다국어 패키지에 한국어 locale이 추가되었다. 큰 기능을 만든 것은 아니지만, 한국어 사용자가 제품을 더 자연스럽게 이해할 수 있게 만드는 변화라는 점에서 의미가 있었다.

이번 작업을 하면서 가장 크게 느낀 건 로컬라이징도 결국 코드에 가깝다는 점이었다. 사람이 읽는 자연어처럼 보이지만, 실제로는 애플리케이션이 읽고 해석하는 리소스다. key 구조가 맞아야 하고, interpolation이 유지되어야 하고, i18n 라이브러리의 문법도 지켜야 한다. 단어 하나를 바꾸는 일처럼 보여도 실제로는 화면의 의미, 사용자 행동, 런타임 안정성과 연결되어 있었다.

그래서 이번 글에서는 한국어 locale을 추가하면서 어떤 구조를 봤고, 어떤 방식으로 검증했고, 리뷰 과정에서 무엇을 배웠는지 정리해보려고 한다. 거창한 오픈소스 기여기는 아니지만, 작은 PR을 보내는 과정에서도 생각보다 배울 게 많았다. 특히 나처럼 프론트엔드 개발을 하면서 제품 문구나 UI 흐름을 자주 마주치는 사람에게는 꽤 현실적인 경험이었다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-36/3e420da7a5173b0d.png)

## 프로젝트 구조 파악하기

`dbx-multi-lang`은 `dbdiagram.io`와 `dbdocs.io`의 다국어 지원을 관리하는 저장소다. 각 언어별 번역 문구가 YAML 파일로 관리되고, 빌드 과정을 거쳐 `dist/{locale}.json` 형태로 만들어지는 구조였다. 처음 저장소를 봤을 때는 언어별 폴더가 있어서 비교적 단순한 구조처럼 보였다. 하지만 실제로 한국어를 추가하려면 단순히 `locales/ko` 폴더만 만들면 끝나는 게 아니었다

.

먼저 기존 언어들이 어떤 구조로 되어 있는지 봐야 했다. 각 locale은 같은 key 구조를 가져야 하고, 영어 원문에 있는 key가 한국어에는 빠지면 안 된다. UI에서 특정 key를 찾는데 한국어 파일에만 빠져 있으면 결국 런타임에서 문제가 생길 수 있기 때문이다. 그래서 기존 locale 파일을 기준으로 어떤 파일이 있고, 각 파일 안에 어떤 nested key가 있는지 확인하는 과정이 필요했다.

그리고 locale 자체도 패키지에 등록해야 했다. `locales/metadata.yaml`에 `ko`를 추가하고, `src/index.js`에서 `dist/ko.json`을 import하도록 연결하고, `package.json`의 exports에도 `./dist/ko.json`을 추가해야 했다. 그래야 패키지를 사용하는 쪽에서 한국어 리소스를 실제로 가져다 쓸 수 있다.

이 과정에서 로컬라이징은 단순히 텍스트를 채우는 일이 아니라, 애플리케이션이 그 언어를 하나의 정식 리소스로 인식하게 만드는 작업이라는 생각이 들었다. 번역 파일을 추가하는 것과 제품에서 사용할 수 있는 locale을 추가하는 것은 조금 다른 문제였다. 전자는 문장을 만드는 일이고, 후자는 그 문장이 빌드와 배포 구조 안에 들어가도록 연결하는 일에 가까웠다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-36/ed567716d2b88304.png)

## 한국어 번역 작업: 문맥과 일관성 맞추기

이번 PR에서는 `locales/ko` 아래에 12개의 YAML 파일을 추가했다. 계정 설정, 인증, 결제, 공통 UI, 데이터베이스 관련 문구, 다이어그램, 모달, 포털, 워크스페이스처럼 서비스의 여러 영역에 걸쳐 있는 문구들이었다. 파일 수만 보면 많다고 느껴질 수 있지만, 실제로 더 어려웠던 부분은 양보다 문맥이었다.

처음에는 영어 문장을 한국어로 옮기는 일처럼 보였지만, 실제로는 각 문구가 어디에서 쓰이는지 계속 상상해야 했다. 버튼인지, 토스트 메시지인지, 에러 문구인지, 설정 화면의 설명인지에 따라 한국어 표현이 달라져야 했다. 예를 들어 버튼 문구는 길면 어색하다. 반대로 에러 메시지는 너무 짧으면 사용자가 다음에 뭘 해야 하는지 알기 어렵다. 계정 삭제나 워크스페이스 삭제처럼 위험한 동작은 조금 딱딱하더라도 명확해야 한다.

또 하나 신경 쓴 건 용어의 일관성이었다. `workspace`를 어떤 곳에서는 "작업 공간"이라고 하고, 다른 곳에서는 "워크스페이스"라고 하면 같은 제품 안에서 어색해진다. `diagram`, `collaborator`, `permission`, `publish` 같은 단어들도 마찬가지였다. 한국어로 자연스럽게 풀어 쓰는 게 좋은 경우도 있고, 제품에서 이미 익숙하게 쓰는 외래어를 유지하는 편이 나은 경우도 있었다. 그래서 전체 문맥에서 자연스럽게 읽히는 표현을 고르되, 한 번 정한 표현은 최대한 유지하려고 했다.

그리고 번역 중간중간 `{count}`, `{email}`, `{provider}` 같은 placeholder가 있었다. 이런 값은 번역하면서 실수로 지우거나 순서를 바꾸면 안 된다. HTML 태그가 포함된 문구도 있었다. 문장 자체는 한국어지만 그 안에는 런타임에서 치환될 데이터와 UI에서 해석될 태그가 섞여 있었다. 결국 사람이 읽는 문장이면서 동시에 i18n 런타임이 해석하는 데이터이기도 했다.

이 지점에서 번역 파일도 그냥 문서가 아니라 코드에 더 가깝게 느껴졌다. 자연스러운 한국어를 만드는 것도 중요하지만, 원래 문구가 가진 구조를 망가뜨리지 않는 것이 그만큼 중요했다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-36/33bc912d8f18855a.png)

## 빌드와 테스트로 검증하기

번역을 다 했다고 바로 PR을 올리기에는 불안했다. 특히 locale 파일은 눈으로 봤을 때 자연스러워 보여도, key가 빠져 있거나 placeholder가 맞지 않으면 나중에 문제가 생길 수 있다. 파일이 많고 nested 구조도 깊다 보니 눈으로 하나씩 비교하는 것만으로는 충분하지 않다고 느꼈다.

그래서 `npm run build`를 돌려서 `dist/ko.json`이 정상적으로 생성되는지 확인했다. 12개의 YAML 파일이 하나의 한국어 JSON 리소스로 잘 병합되는지 보는 과정이었다. 빌드가 성공한다는 것은 최소한 YAML 문법이 깨지지 않았고, 빌드 파이프라인 안에서 한국어 locale이 정상적인 입력으로 처리된다는 뜻이었다.

그다음에는 `npm test`로 locale completeness 테스트를 확인했다. 기존 영어 locale과 비교했을 때 빠진 key가 없는지, placeholder나 tag가 어긋나지 않는지 확인하는 테스트였다. 로컬라이징 작업에서는 이런 검증이 특히 중요한 것 같다. 문구 하나하나는 작아 보이지만, 빠진 key 하나가 특정 화면에서는 바로 깨진 UI가 될 수 있다. 또 placeholder가 맞지 않으면 문장이 이상해지는 정도가 아니라 런타임 에러로 이어질 수도 있다.

이번 작업을 하면서 "번역 PR에도 테스트 플랜이 필요하다"는 걸 확실히 느꼈다. PR 본문에도 build와 test를 어떻게 확인했는지 적었다. `npm run build`로 `dist/ko.json`이 생성되는지 확인했고, `npm test`로 locale completeness 테스트가 통과하는지 확인했고, placeholder와 tag mismatch가 없는지도 봤다고 적었다.

리뷰어 입장에서도 단순히 파일이 많이 추가된 PR보다, 어떤 방식으로 검증했는지 적혀 있는 PR이 훨씬 보기 편할 것 같았다. 특히 번역 PR은 변경된 줄 수가 많아지기 쉽다. 그런 상황에서 "이 사람이 어떤 기준으로 확인했는지"가 PR 본문에 남아 있으면 리뷰 부담을 조금 줄일 수 있다.

## 리뷰에서 배운 것: vue-i18n의 `@` escape 문제

PR을 올리고 나서 자동 리뷰에서 흥미로운 지적이 있었다. 몇몇 문구에 `dbdiagram@holistics.io` 같은 이메일 주소가 들어가 있었는데, `vue-i18n` v9 이상에서는 `@` 문자가 linked message 문법에 사용된다고 했다. 그래서 이메일 주소 안의 `@`를 그대로 두면 런타임에서 메시지를 컴파일할 때 에러가 날 수 있다는 내용이었다.

해결 방법은 `@`를 그대로 쓰지 않고 다음처럼 escape하는 것이었다.

```
dbdiagram{''@''}holistics.io
```

처음 봤을 때는 조금 의외였다. 이메일 주소는 그냥 문자열이라고 생각하기 쉽다. 사용자가 보는 화면에서도 이메일 주소는 특별한 기능을 하는 코드가 아니라 단순 텍스트에 가깝다. 그런데 i18n 리소스 입장에서는 이 문자열도 런타임 파서가 읽는 입력이다. 파서가 특별한 의미로 해석하는 문자가 있다면, 사람이 보기에는 평범한 문장이어도 실행 시점에는 문제가 될 수 있다.

이 부분이 이번 PR에서 제일 기억에 남았다. 로컬라이징은 단순히 언어를 옮기는 일이 아니라, 사용하는 i18n 라이브러리의 문법과 제약까지 같이 이해해야 하는 작업이었다. 특히 `@`, `{}`, HTML 태그, interpolation 같은 요소들은 번역 과정에서도 코드처럼 조심해서 다뤄야 한다. 한국어 문장으로 자연스럽게 바꾸는 과정에서 이런 기호를 건드리면, 문장은 좋아졌는데 애플리케이션은 깨지는 상황이 생길 수 있다.

자동 리뷰가 이런 부분을 잡아준 것도 좋았다. 사람이 보기에는 지나치기 쉬운 문제인데, 실제 서비스에서는 꽤 치명적인 런타임 에러가 될 수 있기 때문이다. 나도 처음부터 vue-i18n의 linked message 문법까지 의식하고 작업한 것은 아니었기 때문에, 리뷰를 통해 새로 배운 부분이었다.

이 경험 덕분에 앞으로 i18n 파일을 볼 때는 문장 자체뿐 아니라 그 문장이 어떤 파서와 런타임을 거치는지도 같이 봐야겠다는 생각을 하게 됐다. 번역 문자열은 그냥 텍스트가 아니라 실행 환경을 가진 데이터였다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-36/d8fcc3436c997b5d.png)

## 작은 PR이지만 실제 제품 경험을 바꾸는 기여

이후 maintainer가 changelog를 업데이트했고, PR은 승인된 뒤 merge되었다. 큰 기능을 만든 것도 아니고, 복잡한 아키텍처를 바꾼 것도 아니다. 하지만 한국어 사용자가 서비스를 볼 때 처음부터 한국어로 이해할 수 있게 만드는 변화라는 점에서는 충분히 의미 있는 기여라고 느꼈다.

오픈소스 기여라고 하면 뭔가 거대한 기능을 추가하거나 어려운 버그를 고쳐야 할 것 같은 부담이 있다. 나도 예전에는 기여라고 하면 꽤 큰 단위의 작업을 떠올렸던 것 같다. 그런데 이번 경험을 통해 꼭 그렇지는 않다는 생각이 들었다. 번역, 문서, 누락된 export, 테스트 보강처럼 작아 보이는 작업도 실제 사용자 경험과 연결된다.

그리고 그런 작업 안에도 제품 구조를 이해하고, 테스트하고, 리뷰를 반영하는 개발자의 과정이 들어 있다. 이번 PR도 단순히 한국어 문장을 추가한 것만은 아니었다. 기존 locale 구조를 보고, 빌드 결과를 확인하고, 패키지 export를 연결하고, 리뷰에서 나온 런타임 이슈를 반영했다. 크기는 작지만 하나의 기능이 제품에 들어가기 위해 거치는 흐름을 다시 경험한 셈이다.

특히 로컬라이징은 사용자 경험과 가까운 작업이라 더 직접적으로 느껴졌다. 어떤 사람에게는 영어 UI가 큰 장벽이 아닐 수 있지만, 어떤 사람에게는 처음 제품을 이해하는 데 꽤 큰 비용이 된다. 한국어 locale이 추가되면 적어도 한국어 사용자에게는 그 비용이 조금 줄어든다. 그런 점에서 작은 PR이지만 실제 제품 경험을 바꾸는 기여라고 생각했다.

이번 PR은 그런 점에서 좋은 시작점이었다. 앞으로도 꼭 큰 기능이 아니더라도, 내가 발견한 작은 불편이나 빠진 부분을 고쳐서 upstream에 보내는 일을 더 해봐도 좋겠다는 생각이 들었다. 특히 내가 실제로 쓰거나 관심 있는 제품이라면 더 그렇다. 사용자의 입장에서 어색한 부분을 발견하고, 개발자의 입장에서 구조를 확인하고, 다시 기여자의 입장에서 PR로 정리하는 과정이 자연스럽게 이어질 수 있기 때문이다.

기여가 merge되는 경험도 생각보다 동기부여가 됐다. 내가 만든 코드나 문구가 내 저장소 안에만 남는 게 아니라, 다른 사람이 사용하는 프로젝트의 일부가 된다는 감각이 있었다. 그게 아주 작은 변화라도 오픈소스 기여의 재미는 거기에 있는 것 같다.

## 마치며

이번에 한국어 locale을 추가하면서 로컬라이징을 조금 다르게 보게 됐다. 예전에는 번역 파일을 제품의 부속물처럼 생각했던 것 같다. 기능이 먼저 있고, 그 기능에 붙는 텍스트를 여러 언어로 바꿔놓은 정도로 봤다. 하지만 실제로 작업해보니 locale 파일은 UI와 런타임 사이에 있는 중요한 인터페이스였다.

key 구조가 맞아야 하고, placeholder가 유지되어야 하고, i18n 라이브러리의 문법도 지켜야 한다. 자연스러운 표현을 고르는 일도 중요하지만, 그 표현이 애플리케이션 안에서 안전하게 해석되는지도 봐야 한다. 문장이 아무리 좋아도 key가 빠지거나 특수 문자가 잘못 처리되면 결국 사용자에게는 깨진 화면이나 에러로 보일 수 있다.

결국 i18n 번역 파일도 코드다. 사람이 읽는 문장이지만, 동시에 애플리케이션이 실행 중에 해석하는 리소스다. 그래서 자연스러운 한국어 표현만큼이나 구조, 검증, 런타임 제약을 함께 봐야 한다. 이번 작업에서 `@` escape 문제를 겪은 것도 이 생각을 더 강하게 만들었다.

작은 PR이었지만, 오픈소스에 기여하는 흐름을 다시 경험할 수 있었고, 로컬라이징 작업을 더 개발자다운 관점으로 볼 수 있게 된 계기였다. 코드를 많이 바꾸지 않아도, 제품 구조를 이해하고 검증을 거치고 리뷰를 반영하는 과정은 똑같이 중요했다.

다음에 비슷한 작업을 한다면 번역 glossary를 먼저 정리하거나, placeholder와 특수 문자 검증을 더 자동화해보고 싶다. 예를 들어 주요 용어를 먼저 정해두면 번역 중간에 표현이 흔들리는 일을 줄일 수 있고, `@`나 `{}` 같은 특수 문자는 스크립트로 한 번 더 확인할 수도 있을 것 같다.

작은 개선이라도 실제 제품 경험을 조금 더 나아지게 만들 수 있다면, 그런 기여를 계속 해봐도 좋겠다는 생각이 들었다. 이번 글도 그런 의미에서 단순한 작업 기록이라기보다는, 작은 PR을 통해 로컬라이징과 오픈소스 기여를 다시 생각해본 기록에 가깝다. 다음에는 더 자연스러운 한국어 문구뿐 아니라, 그 문구를 안전하게 유지할 수 있는 검증 방식까지 같이 고민해보고 싶다.', '최근 holistics/dbx-multi-lang 저장소에 한국어 locale을 추가하는 PR을 보냈다.처음에는 단순히 “한국어 번역 파일을 추가하면 되겠지” 정도로 생각했다. 한국어 문장을 채워 넣고, 파일을 추가하고, PR을 올리면 끝나는 작업에 가까울 거라고 봤다. 그런데 막상 작업해보니 생각보다 단순한 번역 작업은', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-36/3e420da7a5173b0d.png', '2026-07-12T22:15:28+09:00', '2026-07-12T22:15:28+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_36';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_35', 'tistory-35', '태그 기반 추천에서 임베딩 기반 맞춤 추천으로 바꾼 과정', '## 1. 태그 기반 추천의 한계

### 기존 추천 방식

study-admin은 블로그 스터디를 운영하기 위한 관리 서비스다. 스터디원들이 작성한 글을 모아 보고, 외부 아티클이나 컨퍼런스 콘텐츠를 큐레이션하는 기능이 있다.

처음 추천 방식은 단순했다. 사용자의 관심사 태그와 콘텐츠에 붙은 태그가 얼마나 겹치는지 보고 정렬했다.

```
추천 점수 = 사용자 interests &cap; 콘텐츠 tags 개수
```

작은 서비스에서는 이 방식도 나쁘지 않다. 구현이 쉽고, 결과를 설명하기도 쉽다. 예를 들어 사용자가 React, LLM에 관심이 있고 콘텐츠 태그에도 React가 붙어 있다면, 왜 추천됐는지 비교적 명확하다.

하지만 실제 데이터를 넣고 써보면 한계가 빨리 보였다.

### 태그가 비어 있으면 추천도 비어버린다

첫 번째 문제는 태그가 비어 있거나 부정확한 콘텐츠가 많다는 점이었다. RSS나 외부 큐레이션 소스에서 들어오는 글은 항상 정리된 태그를 가지고 있지 않다. 제목과 설명만 보면 분명히 LLM, 데이터베이스, 프론트엔드와 관련된 글인데, 태그가 비어 있으면 추천 후보에서 밀릴 수 있었다.

### 같은 의미를 다른 단어로 표현하는 문제

두 번째 문제는 표기 차이다. pgvector, vector search, embedding, RAG는 서로 가까운 주제지만 문자열로 보면 전부 다른 값이다. 사용자가 LLM에 관심을 등록해두었더라도, 콘텐츠가 vector search나 embeddings라는 태그만 가지고 있으면 단순 overlap 방식에서는 잘 잡히지 않는다.

세 번째 문제는 의미 유사도를 반영하기 어렵다는 점이었다. 사용자가 관심사에 정확히 같은 단어를 입력하지 않아도, 실제로는 관심 있을 만한 글이 있다. 예를 들어 AI, LLM, 검색, 추천 시스템은 서로 맞닿아 있는 주제다. 그런데 태그 기반 추천은 이런 관계를 이해하지 못한다.

### 추천은 설명 가능해야 한다

마지막으로 추천 결과를 설명하는 방식도 애매했다. 맞춤 추천 탭을 만들더라도 사용자는 결국 "왜 이 글이 나한테 추천됐지?"를 궁금해한다. 추천이 납득되지 않으면 개인화 기능은 오히려 신뢰를 잃는다. 단순히 순서를 바꾸는 것만으로는 부족했고, 추천 결과가 어떤 근거로 나왔는지 함께 보여줄 필요가 있었다.

그래서 추천 방식을 태그 overlap 중심에서 사용자 취향과 콘텐츠의 의미적 유사도를 보는 구조로 바꾸기로 했다. 단순히 벡터 검색을 붙이는 것이 아니라, 추천 이유와 점수 배지까지 함께 설계해서 사용자가 결과를 이해할 수 있는 추천 시스템을 목표로 잡았다.

## 2. 사용자와 콘텐츠를 임베딩으로 표현하기

### 비교 가능한 텍스트로 정규화하기

추천을 의미 유사도 기반으로 바꾸려면 먼저 사용자와 콘텐츠를 같은 비교 공간에 올려야 했다. 그래서 study-admin에서는 사용자 취향, 큐레이션 아이템, 스터디 글을 각각 임베딩용 텍스트로 변환한 뒤 벡터로 저장했다.

이 로직은 packages/shared/src/ai/embedding-text.ts에 모아두었다. 추천 API나 봇 서비스 곳곳에서 제각각 문자열을 만들지 않고, 공유 패키지의 함수로 동일한 규칙을 사용하게 했다.

### 사용자 취향 임베딩 텍스트

사용자 취향은 buildMemberPreferenceText에서 만든다. 사용자의 파트, 관심사, 자기소개를 하나의 짧은 문장으로 합친다.

```
export function buildMemberPreferenceText(input: {
 part: string;
 bio?: string | null;
 interests?: string[] | null;
}): string {
 const segments = [`${part || ''스터디''} 개발자.`];
 if (interests.length > 0) segments.push(`관심사: ${interests.join('', '')}.`);
 if (bio) segments.push(`소개: ${bio}`);

return segments.join('' '');
}
```

예를 들면 이런 문장이 된다.

```
Backend 개발자. 관심사: React, 성능 최적화. 소개: API와 DB 성능을 좋아합니다.
```

이 텍스트는 사용자가 어떤 파트에 속해 있고, 어떤 주제를 좋아하며, 자기소개에서 어떤 맥락을 드러내는지를 함께 담는다. 단순히 관심사 배열만 임베딩하는 것보다 사용자의 취향을 조금 더 풍부하게 표현할 수 있다.

### 큐레이션 콘텐츠 임베딩 텍스트

큐레이션 아이템은 buildCurationItemEmbeddingText에서 만든다. 외부 아티클이나 컨퍼런스 콘텐츠는 본문 전체를 가져오지 않는 경우가 많기 때문에, 추천에 사용할 수 있는 메타데이터를 최대한 안정적으로 묶었다.

```
Title: React Server Components 성능 최적화
Description: Streaming과 cache 전략 정리
Tags: React, Performance
Source: Frontend Weekly
```

실제 함수는 title을 기본으로 넣고, description, tags, sourceName이 있을 때만 줄을 추가한다. 값이 비어 있으면 억지로 빈 필드를 넣지 않는다. 이렇게 하면 태그가 없더라도 제목과 설명만으로 임베딩을 만들 수 있고, 출처 정보가 있으면 추천 이유를 만들 때도 활용할 수 있다.

### 스터디 글에는 작성자 맥락을 넣었다

스터디 글은 buildPostEmbeddingText로 만든다. 여기에는 글 자체의 제목과 설명뿐 아니라 작성자 맥락도 들어간다.

```
Title: React 성능 최적화
Description: memo와 서버 컴포넌트 이야기
Author part: frontend
Author interests: React, Next.js
Round: 4
```

작성자 정보를 넣은 이유는 스터디 글의 설명이 항상 충분하지 않기 때문이다. 어떤 글은 제목만 있고 설명이 짧을 수 있다. 이때 작성자의 파트, 관심사, 자기소개, 회차 정보를 함께 넣으면 글의 의미를 보강할 수 있다.

### 해시로 중복 임베딩을 피하기

임베딩 생성은 봇 서버의 EmbeddingService가 담당한다. 예를 들어 큐레이션 아이템은 DB에서 title, description, tags, sourceName을 조회한 뒤 buildCurationItemEmbeddingText로 텍스트를 만들고, 그 텍스트를 임베딩 서버에 보낸다.

```
const embeddingText = buildCurationItemEmbeddingText(row);
const embeddingTextHash = sha256Text(embeddingText);
const embedding = await this.embed(embeddingText);
```

사용자 취향과 스터디 글도 같은 흐름을 탄다. 텍스트를 만들고, SHA-256 해시를 만들고, 임베딩을 생성한 뒤 DB에 저장한다.

해시를 저장한 이유는 같은 텍스트를 반복해서 임베딩하지 않기 위해서다. 임베딩 텍스트가 그대로라면 벡터도 다시 만들 필요가 없다. 반대로 사용자가 프로필을 바꾸거나 글 설명이 바뀌면 텍스트 해시가 달라지므로 재생성 대상인지 판단할 수 있다.

### 텍스트 생성 규칙도 테스트했다

이 부분은 테스트도 추가했다. embedding-text.property.test.ts에서는 큐레이션 텍스트와 사용자 취향 텍스트가 안정적으로 생성되는지, 같은 문자열은 같은 해시를 만들고 다른 문자열은 다른 해시를 만드는지 확인한다.

추천 품질은 모델만으로 결정되지 않는다. 어떤 정보를 어떤 순서와 형식으로 임베딩하느냐가 결과에 큰 영향을 준다. 그래서 이 작업에서는 임베딩 모델을 붙이는 것보다, 사용자와 콘텐츠를 비교 가능한 텍스트로 정규화하는 규칙을 먼저 잡는 것이 중요했다.

## 3. pgvector로 추천 점수 만들기

### 벡터 저장 구조

임베딩을 만들었다면 다음 문제는 어디에 어떻게 저장하고 조회할지였다. study-admin에서는 Supabase Postgres에 pgvector를 붙여서 임베딩을 저장했다.

마이그레이션에서는 먼저 extensions 스키마를 만들고, vector 확장을 활성화한다.

```
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
```

큐레이션 아이템은 기존 curation_items 테이블에 임베딩 컬럼을 추가했다.

```
ALTER TABLE public.curation_items
 ADD COLUMN IF NOT EXISTS embedding extensions.vector(768),
 ADD COLUMN IF NOT EXISTS embedding_text_hash varchar(64),
 ADD COLUMN IF NOT EXISTS embedding_model varchar(100),
 ADD COLUMN IF NOT EXISTS embedded_at timestamp with time zone
```

사용자 취향과 스터디 글은 별도 테이블로 분리했다. 사용자 취향은 member_preference_embeddings, 스터디 글은 post_embeddings에 저장한다.

```
member_preference_embeddings.embedding vector(768)
post_embeddings.embedding vector(768)
curation_items.embedding vector(768)
```

큐레이션 아이템은 테이블 자체가 추천 대상이라 컬럼을 직접 추가했고, 포스트는 posts 테이블을 추천 메타데이터로 복잡하게 만들지 않기 위해 별도 테이블로 뺐다.

### HNSW 인덱스 붙이기

벡터 검색에는 HNSW 인덱스를 붙였다. 마이그레이션에서는 cosine distance 기준으로 검색할 수 있도록 extensions.vector_cosine_ops를 사용한다.

```
CREATE INDEX IF NOT EXISTS idx_curation_items_embedding_hnsw
 ON public.curation_items
 USING hnsw (embedding extensions.vector_cosine_ops)
 WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_member_preference_embeddings_embedding_hnsw
 ON public.member_preference_embeddings
 USING hnsw (embedding extensions.vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_post_embeddings_embedding_hnsw
 ON public.post_embeddings
 USING hnsw (embedding extensions.vector_cosine_ops);
```

추천 쿼리에서는 pgvector의 cosine distance 연산자인 를 사용한다. 거리는 가까울수록 작기 때문에, 추천 점수로 쓰기 위해 1 - distance 형태로 의미 유사도를 만들었다.

```
const semanticScoreExpr = sql `
 coalesce(1 - (${curationItems.embedding} ${memberPreferenceEmbeddings.embedding}), 0)
`;
```

포스트 추천에서도 같은 방식으로 post_embeddings.embedding과 member_preference_embeddings.embedding을 비교한다.

### 큐레이션 추천 점수

큐레이션 추천은 의미 유사도를 중심으로 두되, 최신성과 기존 관련도 점수를 함께 섞었다.

```
finalScore =
 semanticScore * 0.65
 + freshnessScore * 0.20
 + relevanceScore * 0.15
```

실제 API에서는 다음처럼 계산한다.

```
const semanticScoreExpr = sql `
 coalesce(1 - (${curationItems.embedding} ${memberPreferenceEmbeddings.embedding}), 0)
`;
const freshnessScoreExpr = sql `exp(-(${ageDaysExpr}) / 14.0)`;
const normalizedRelevanceExpr = sql `
 least(greatest(coalesce(${curationItems.relevanceScore}, 0), 0), 100) / 100.0
`;
const finalScoreExpr = sql `
 ((${semanticScoreExpr}) * 0.65
 + (${freshnessScoreExpr}) * 0.20
 + (${normalizedRelevanceExpr}) * 0.15)
`;
```

freshnessScore는 exp(-ageDays / 14.0)로 계산했다. 오늘 올라온 글은 1에 가깝고, 시간이 지날수록 자연스럽게 낮아진다. 단순히 최신순으로만 정렬하지 않고, 오래된 글도 의미적으로 정말 잘 맞으면 추천될 수 있게 하기 위한 보정이다.

큐레이션 정렬은 최종 점수 기준으로 한다.

```
final_score DESC
publishedAt DESC NULLS LAST
id DESC
```

무한 스크롤에서 추천 순서가 흔들리지 않도록 cursor에는 rankingAsOf 시각도 포함했다. 최신성 점수가 시간에 따라 계속 바뀌기 때문에, 다음 페이지를 가져올 때도 같은 기준 시각으로 계산해야 랭킹이 안정적으로 유지된다.

```
finalScore|publishedAt|id|rankingAsOfIso
```

### 포스트 추천 점수

스터디 글 추천은 큐레이션과 조금 다르게 잡았다. 스터디원이 올린 글은 조회수, 댓글, 리액션 같은 반응 정보가 있고, 작성자와의 관계도 약간의 의미가 있다고 봤다.

```
finalScore =
 semanticScore * 0.70
 + freshnessScore * 0.15
 + popularityScore * 0.10
 + authorAffinityScore * 0.05
```

코드에서는 댓글, 조회, 리액션을 합쳐 인기 점수를 만든다.

```
const popularScore = sql `
 COALESCE(${posts.commentCount}, 0) * 3
 + (SELECT COUNT(*) FROM post_views pv WHERE pv.post_id = ${posts.id}) * 2
 + (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = ${posts.id})
`;
```

작성자 친화도는 같은 파트면 1.0, 관심사가 하나라도 겹치면 0.5, 아니면 0.0으로 계산했다.

```
authorAffinityScoreExpr = sql `case
 when ${members.part} = ${currentMemberPart} then 1.0
 when coalesce(array_length(
 ARRAY(
 SELECT unnest(coalesce(${members.interests}, ARRAY[]::text[]))
 INTERSECT
 SELECT unnest(${interestsArray})
 ), 1), 0) > 0 then 0.5
 else 0.0
end`;
```

다만 포스트 추천에서는 최종 점수보다 의미 유사도를 더 강하게 우선했다.

```
semantic_score DESC
final_score DESC
publishedAt DESC
```

즉 최신성, 인기, 작성자 친화도는 추천을 완전히 뒤집는 요소가 아니라, 의미적으로 비슷한 글들 사이에서 순서를 보정하는 역할에 가깝다. 추천의 중심은 여전히 사용자 취향과 글 임베딩의 의미 유사도다.

## 4. 추천 이유를 함께 보여주기

### 추천은 정렬만으로 끝나지 않는다

추천 탭을 만들 때 중요하게 본 것은 "어떤 글을 위에 둘 것인가"만이 아니었다. 사용자가 추천 결과를 봤을 때 왜 이 글이 나왔는지 이해할 수 있어야 했다.

추천 결과가 납득되지 않으면 개인화 기능은 오히려 불편해진다. 사용자는 "내 관심사와 상관없는 글이 왜 추천되지?"라고 느낄 수 있고, 그러면 맞춤 추천 탭 자체를 신뢰하지 않게 된다.

그래서 추천 API는 단순히 정렬된 콘텐츠만 반환하지 않고, 추천 이유도 함께 내려주도록 했다.

### LLM 없이 deterministic하게 만들기

처음에는 추천 이유를 LLM으로 생성할 수도 있다고 생각할 수 있다. 하지만 이 기능에서는 그렇게 하지 않았다.

추천 이유는 packages/shared/src/ai/recommendation-reason.ts에서 deterministic하게 만든다. 추천 점수를 계산할 때 이미 사용한 신호를 다시 활용하는 방식이다.

큐레이션 추천 이유의 응답 형태는 다음과 같다.

```
export interface RecommendationReason {
 summary: string;
 reasons: string[];
 matchedKeywords: string[];
 semanticScore: number | null;
 freshnessScore: number | null;
 relevanceScore: number | null;
}
```

포스트 추천은 큐레이션과 조금 다르게 popularityScore, authorAffinityScore도 포함한다.

```
export interface PostRecommendationReason {
 summary: string;
 reasons: string[];
 matchedKeywords: string[];
 semanticScore: number | null;
 freshnessScore: number | null;
 popularityScore: number | null;
 authorAffinityScore: number | null;
}
```

이렇게 만든 이유는 단순하다. 매 요청마다 LLM을 호출하지 않으면 빠르고, 비용이 들지 않고, 같은 입력에 대해 같은 추천 이유가 나온다. 무엇보다 추천 이유가 실제 점수 계산에 사용한 신호와 연결된다.

### 추천 이유를 만드는 규칙

큐레이션은 buildRecommendationReason에서 만든다. 사용자 관심사가 제목, 설명, 태그와 직접 매칭되면 관심사 기반 이유를 추가한다.

```
if (matchedKeywords.length > 0) {
 reasons.push(`관심사 ${matchedKeywords.join('', '')}와 연결돼요.`);
}
if (semanticScore !== null && semanticScore >= 0.6) {
 reasons.push(''프로필 관심사와 의미적으로 가까운 글이에요.'');
}
if (freshnessScore >= 0.6) {
 reasons.push(''최근 올라온 글이에요.'');
}
if (relevanceScore >= 0.6) {
 reasons.push(''스터디 키워드 관련도가 높은 글이에요.'');
}
if (input.sourceName) {
 reasons.push(`${input.sourceName}에서 가져온 글이에요.`);
}
```

포스트는 buildPostRecommendationReason에서 만든다. 의미 유사도, 최신성뿐 아니라 같은 파트의 글인지, 조회·댓글·리액션 반응이 있는지도 이유에 반영한다.

```
if (
 authorAffinityScore !== null &&
 authorAffinityScore >= 0.9 &&
 input.authorPart &&
 input.currentMemberPart &&
 input.authorPart === input.currentMemberPart
) {
 reasons.push(`같은 ${input.authorPart} 파트의 글이에요.`);
}

if (popularityScore !== null && popularityScore >= 0.3) {
 reasons.push(''조회, 댓글, 리액션 반응이 있는 글이에요.'');
}
```

관심사 키워드가 직접 매칭되면 summary도 더 구체적으로 만든다.

```
React, 성능 최적화 관심사에 잘 맞아요.
```

직접 매칭된 키워드가 없더라도 의미 유사도가 있으면 다음처럼 요약한다.

```
관심도 76%로 추천됐어요.
```

### 점수 배지 UI

프론트에서는 추천 이유를 카드 안에 바로 보여준다. 큐레이션 카드에서는 RecommendationScoreBadges가 semanticScore, freshnessScore, relevanceScore를 퍼센트로 변환해 표시한다.

```
const scores = [
 { label: ''관심도'', value: toPercent(reason.semanticScore) },
 { label: ''최신성'', value: toPercent(reason.freshnessScore) },
 { label: ''관련도'', value: toPercent(reason.relevanceScore), hideWhenZero: true },
];
```

포스트 카드에서는 PostRecommendationBadges가 관심도, 최신성, 인기를 보여준다.

```
const scores = [
 { label: ''관심도'', value: toPercent(reason.semanticScore) },
 { label: ''최신성'', value: toPercent(reason.freshnessScore), hideWhenZero: true },
 { label: ''인기'', value: toPercent(reason.popularityScore), hideWhenZero: true },
];
```

이 UI는 추천 시스템을 블랙박스로 두지 않기 위한 장치다. 사용자는 단순히 "맞춤 추천"이라는 결과만 보는 것이 아니라, 이 글이 관심도 때문에 올라왔는지, 최신성 때문인지, 인기나 관련도 때문인지 확인할 수 있다.

### 짧은 키워드 오탐 막기

추천 이유를 만들 때는 관심사 키워드 매칭도 조심해야 했다. 특히 AI처럼 짧은 영어 키워드는 다른 단어 안에 포함되기 쉽다.

예를 들어 매일메일 같은 문자열 안에 ai가 들어 있다고 해서 사용자의 AI 관심사와 매칭하면 안 된다. 그래서 ASCII 키워드는 단어 경계를 확인하도록 처리했다.

```
if (isAsciiKeyword(normalizedKeyword)) {
 const pattern = new RegExp(
 `(^|[^a-z0-9+#.])${escapeRegExp(normalizedKeyword)}(?=$|[^a-z0-9+#.])`,
 ''i''
 );
 return pattern.test(haystack);
}
```

이 부분은 테스트도 추가했다.

```
expect(
 findMatchedKeywords({
 interests: [''AI''],
 title: ''브라우저 렌더링 파이프라인'',
 description: ''매일메일을 참고해 HTML 파서와 DOM 생성 과정을 정리합니다.'',
 })
).toEqual([]);
```

작은 디테일이지만 추천 이유에서는 이런 오탐이 신뢰도를 크게 떨어뜨릴 수 있다. 추천 이유는 사용자에게 직접 노출되는 문장이기 때문에, 점수 계산만큼이나 보수적으로 다뤄야 했다.

## 5. 임베딩 갱신을 사용자 요청에서 분리하기

### 임베딩은 중요하지만 필수 경로는 아니다

임베딩 기반 추천을 붙이면서 가장 조심한 부분은 사용자 요청 흐름이었다. 프로필을 저장하거나 글을 등록할 때마다 임베딩을 즉시 생성하면, 사용자의 기본 동작이 임베딩 서버 상태에 묶인다.

예를 들어 임베딩 서버가 느리거나 첫 요청에서 모델을 로딩하느라 시간이 오래 걸리면, 사용자는 단순히 프로필을 저장했을 뿐인데 응답이 늦어진다. 더 나쁘게는 임베딩 서버가 실패했을 때 프로필 저장이나 글 등록 자체가 실패한 것처럼 보일 수 있다.

추천 데이터는 중요하지만, 글 등록과 프로필 저장은 추천 시스템보다 더 기본적인 기능이다. 그래서 임베딩 갱신을 사용자 요청의 필수 경로에서 분리했다.

### Next.js after로 응답 이후 실행하기

웹 서버에서는 직접 임베딩을 만들지 않는다. 대신 packages/web/src/lib/embedding-refresh.ts에 임베딩 갱신 요청을 예약하는 함수를 두었다.

```
export function scheduleMemberPreferenceEmbeddingRefresh(memberId: string): void {
 after(async () => {
 try {
 await postToBot(''/api/internal/embedding/member-preference'', { memberId });
 } catch (error) {
 console.error(''[embedding-refresh] 멤버 취향 임베딩 갱신 실패:'', error);
 }
 });
}
```

after() 안에서 봇 내부 API를 호출하기 때문에, 사용자에게 응답을 반환한 뒤 임베딩 갱신을 이어서 수행할 수 있다.

큐레이션과 포스트도 같은 방식이다. 여러 ID가 들어올 수 있는 작업은 중복을 제거하고 최대 100개까지만 보낸다.

```
export function schedulePostEmbeddingRefresh(postIds: string[]): void {
 const uniquePostIds = [...new Set(postIds)].slice(0, 100);
 if (uniquePostIds.length === 0) return;

after(async () => {
 try {
 await postToBot(''/api/internal/embedding/batch'', { postIds: uniquePostIds });
 } catch (error) {
 console.error(''[embedding-refresh] 포스트 임베딩 일괄 갱신 실패:'', error);
 }
 });
}
```

내부 API 호출에는 BOT_API_SECRET을 Bearer 토큰으로 붙이고, 요청 timeout도 10초로 제한했다.

```
const response = await fetch(`${BOT_API_URL}${path}`, {
 method: ''POST'',
 headers: {
 Authorization: `Bearer ${BOT_API_SECRET}`,
 ''Content-Type'': ''application/json'',
 },
 body: JSON.stringify(body),
 signal: AbortSignal.timeout(10_000),
});
```

### 실제 호출 지점

프로필 온보딩과 프로필 수정에서는 멤버 정보를 저장한 뒤 취향 임베딩 갱신을 예약한다.

```
scheduleMemberPreferenceEmbeddingRefresh(existingMember.id);
```

수동으로 글을 등록하거나 기존 글을 수정할 때는 포스트 임베딩 갱신을 예약한다.

```
schedulePostEmbeddingRefresh([newPost.id]);
```

관리자 큐레이션 크롤링에서는 새로 들어온 큐레이션 아이템 ID들을 모아서 일괄 갱신한다.

```
const totalNewItems = results.reduce((sum, r) => sum + r.newItemsAdded, 0);
scheduleCurationItemEmbeddingRefresh(insertedItemIds);
```

이 구조 덕분에 웹 API는 사용자 요청을 먼저 처리하고, 추천용 임베딩은 뒤에서 따라오게 된다.

### 봇 내부 API로 임베딩 갱신하기

실제 임베딩 생성은 봇 서버가 담당한다. 봇 서버에는 내부 API 4종을 추가했다.

```
POST /api/internal/embedding/member-preference
POST /api/internal/embedding/curation-item
POST /api/internal/embedding/post
POST /api/internal/embedding/batch
```

내부 API는 Bearer token 인증을 거치고, trigger endpoint에는 rate limit도 걸었다.

```
const triggerLimiter = rateLimit({
 windowMs: 60 * 1000,
 max: 10,
});
```

batch API에서는 memberIds, curationItemIds, postIds를 받아서 각각 중복 제거 후 최대 100개까지만 처리한다. 또한 모든 ID가 UUID 형식인지 검증한다.

```
const uniquePostIds = [...new Set(postIds)].slice(0, MAX_EMBEDDING_BATCH_SIZE);

if (
 allIds.length === 0 ||
 allIds.some((id) => typeof id !== ''string'' || !UUID_RE.test(id))
) {
 return res.status(400).json({ error: ''유효한 임베딩 갱신 ID가 필요합니다'' });
}
```

검증을 통과하면 EmbeddingService의 refreshMemberPreference, refreshCurationItem, refreshPost를 호출해 실제 임베딩을 갱신한다.

### 실패한 임베딩은 백필로 복구하기

비동기 갱신 구조에서는 실패 가능성을 인정해야 한다. after() 안에서 호출한 임베딩 갱신이 실패해도 사용자 요청은 이미 성공했기 때문에, 나중에 누락된 임베딩을 복구할 경로가 필요하다.

그래서 백필 스크립트 3종을 추가했다.

```
backfill-curation-embeddings
backfill-post-embeddings
backfill-member-preference-embeddings
```

각 스크립트는 EmbeddingService의 백필 메서드를 호출한다.

```
const updated = await getEmbeddingService().backfillMissingPosts(limit);
console.log(`Updated ${updated} post embeddings`);
```

큐레이션과 포스트 백필은 기본적으로 임베딩이 없거나 embedded_at이 비어 있는 데이터를 찾아 채운다. 멤버 취향 백필은 추천 화면에서 의미가 있는 active, ob, dormant 상태의 멤버를 대상으로 한다.

이 구조는 추천 시스템을 사용자 요청의 동기 작업이 아니라 백그라운드에서 따라오는 보조 시스템으로 만든다. 사용자의 기본 흐름은 빠르게 유지하고, 추천 품질은 내부 API와 백필 스크립트로 점진적으로 따라오게 하는 방식이다.

## 6. 결과와 배운 점

### 두 화면에 맞춤 추천 탭을 붙였다

이번 작업의 결과로 /curation과 /posts 두 화면에 맞춤 추천 탭을 추가했다.

/curation에서는 외부 아티클과 컨퍼런스 콘텐츠를 사용자 취향에 맞게 정렬한다. 기존에는 전체, 컨퍼런스, 아티클처럼 콘텐츠 종류 중심으로만 볼 수 있었는데, 여기에 맞춤 탭을 추가했다.

/posts에서는 스터디원이 올린 글을 추천순으로 볼 수 있게 했다. 최신순과 인기순만 있던 흐름에 사용자 취향 기반 추천을 추가했고, 본인이 작성한 글은 추천 대상에서 제외했다.

화면에서는 추천 이유와 점수 배지도 함께 노출한다.

```
관심도 89% · 최신성 96% · 관련도 86%
관심도 72% · 최신성 82% · 인기 35%
```

사용자는 단순히 "맞춤 추천"이라는 결과만 보는 것이 아니라, 이 글이 어떤 신호 때문에 추천됐는지 확인할 수 있다.

### fallback과 backfill까지 포함한 구현

이번 작업에서 중요했던 것은 "잘 될 때"만 보는 것이 아니었다.

취향 임베딩이 없는 사용자가 있을 수 있다. 큐레이션 글에 태그가 없을 수 있다. 임베딩 서버가 실패할 수 있다. 기존 데이터에는 아직 임베딩이 없을 수 있다.

그래서 fallback과 backfill을 같이 넣었다.

큐레이션 추천에서는 취향 임베딩이 없으면 기존 태그 overlap 방식으로 fallback한다. 임베딩 기반 추천으로 바꿨다고 해서 태그를 완전히 버리지 않은 이유다. 태그는 필터, 추천 이유, fallback에서 여전히 유용하다.

기존 데이터는 백필 스크립트로 추천 시스템에 편입할 수 있게 했다.

```
backfill-curation-embeddings
backfill-post-embeddings
backfill-member-preference-embeddings
```

이 구조 덕분에 배포 시점에 이미 쌓여 있던 큐레이션, 포스트, 멤버 데이터도 점진적으로 임베딩 추천에 포함할 수 있다.

### 테스트한 것들

작은 추천 시스템이라도 문자열 처리와 추천 이유 생성에는 예상치 못한 오탐이 생기기 쉽다. 그래서 다음 테스트를 추가했다.

- 임베딩 텍스트 생성 규칙과 해시 결정성

- 추천 이유 생성과 키워드 매칭

- 짧은 ASCII 키워드 오탐 방지

- 큐레이션 태그 추론 규칙

- 태그 추론 결과가 허용된 관심사 목록 안에 있는지 확인하는 property test

특히 AI 같은 짧은 키워드가 다른 단어 내부에서 잘못 매칭되지 않도록 테스트한 점이 중요했다. 추천 이유는 사용자에게 직접 노출되는 문장이기 때문에, 작은 오탐도 신뢰도를 떨어뜨릴 수 있다.

### 배운 점

이번 작업을 하면서 추천 기능은 알고리즘만의 문제가 아니라는 걸 다시 느꼈다.

처음에는 "태그 기반 추천을 임베딩 기반 추천으로 바꾸면 된다"고 생각하기 쉽다. 하지만 실제 서비스 흐름에 넣으려면 더 많은 질문에 답해야 한다.

- 추천 결과를 사용자가 납득할 수 있는가?

- 추천 이유가 실제 점수 계산과 연결되어 있는가?

- 임베딩 서버가 느리거나 실패해도 기본 기능은 동작하는가?

- 기존 데이터는 어떻게 추천 시스템에 편입할 것인가?

- 추천 데이터가 없을 때는 어떤 fallback을 쓸 것인가?

이번 구현에서 가장 중요했던 판단은 "AI를 어디에 둘 것인가"였다. 매 요청마다 LLM을 호출해 추천 이유를 생성하는 대신, 임베딩은 미리 만들고 추천 이유는 구조화된 점수 신호로 만들었다. 사용자 요청은 먼저 성공시키고, 임베딩 갱신은 백그라운드로 보냈다.

결국 추천 시스템에서 중요한 것은 점수를 잘 계산하는 것만이 아니었다. 사용자가 결과를 신뢰할 수 있어야 하고, 운영자가 실패를 복구할 수 있어야 하며, 기본 사용자 흐름이 추천 시스템 때문에 느려지지 않아야 했다.

작은 사이드 프로젝트였지만, 추천을 알고리즘이 아니라 제품 흐름과 운영 구조까지 포함해서 볼 수 있었던 작업이었다.', '1. 태그 기반 추천의 한계기존 추천 방식study-admin은 블로그 스터디를 운영하기 위한 관리 서비스다. 스터디원들이 작성한 글을 모아 보고, 외부 아티클이나 컨퍼런스 콘텐츠를 큐레이션하는 기능이 있다.처음 추천 방식은 단순했다. 사용자의 관심사 태그와 콘텐츠에 붙은 태그가 얼마나 겹치는지 보고 정렬했다.추천 점수 ', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), NULL, '2026-05-28T13:38:07+09:00', '2026-06-14T21:43:49+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_35';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_34', 'tistory-34', 'AI로 더 빨리 만들수록, 더 깊게 이해해야 한다', 'AI와 개발에 대해 이야기하는 구름 커밋 세션을 들었다. 요즘 워낙 "AI로 개발자가 대체된다", "바이브 코딩이면 혼자 서비스도 만든다" 같은 말이 많아서 조금은 뻔한 이야기일 줄 알았는데, 실제 현장에서 부딪힌 사례들이 꽤 구체적이었다.

듣고 나서 제일 크게 남은 건 하나였다. AI가 코드를 잘 짜는 시대가 됐지만, 그 코드를 이해하지 못한 책임은 결국 사람에게 돌아온다.

## AI가 만든 코드는 빠르게 부채가 된다

가장 인상 깊었던 사례는 STT 모델 이야기였다. 비개발자가 "음악을 텍스트로 바꿔줘"라고 요구했는데, AI가 서버에 무거운 STT 모델을 직접 올리는 방식으로 구현해버렸다고 한다. 요구사항만 보면 틀린 건 아닌데, 운영 관점에서는 서버 성능을 크게 갉아먹는 선택이었다.

문제는 이런 일이 한 번으로 끝나지 않는다는 점이다. 코드베이스는 점점 복잡해지고, 사람은 바쁘고, 리뷰는 느슨해진다. 그러다 보면 어느 순간 "왜 서비스가 느려졌지?", "왜 이 구조가 들어왔지?"를 뒤늦게 추적하게 된다.

AI가 잘못했다기보다는, 사람이 개입해야 할 지점을 놓친 결과에 가까워 보였다. 특히 인프라, 보안, 결제, 성능처럼 한번 잘못 들어가면 나중에 비용이 커지는 영역은 AI에게 맡기더라도 사람이 게이트를 잡고 있어야 한다.

나도 이 부분이 제일 크게 남았다. AI를 쓰면서 가장 무서운 건 단순히 버그가 생기는 게 아니라, 내가 이해하지 못한 결정들이 코드베이스 안에 조용히 쌓이는 일인 것 같다. 겉으로는 기능이 돌아가니까 넘어가지만, 나중에 다시 보면 왜 이렇게 설계됐는지 설명하기 어려운 부분들이 생긴다. 이게 결국 인지 부채라는 말로 가장 잘 설명되는 문제였다.

## 바이브 코딩은 MVP까지는 빠르다

뉴스 브리핑 서비스를 바이브 코딩으로 시작했다는 이야기도 나왔다. 원하는 사이트를 구독하면 매일 아침 데이터를 가져와 요약 리포트를 보내주는 서비스였고, 실제로 수익화도 되고 있었다.

초기에는 AI로 빠르게 만들 수 있다. 문제는 사용자가 늘어난 다음이다. 크롤링하고, 요약하고, 정해진 시간에 메일을 보내야 하는 플로우는 사용자가 천 명 단위로 넘어가면 전혀 다른 문제가 된다. 7시에 메일이 가야 하는데 절반 정도가 못 받는다면, 그건 단순한 버그가 아니라 유료 고객에게 직접 영향을 주는 장애다.

이 지점이 AI 개발의 현실적인 경계처럼 느껴졌다. MVP 검증 단계에서는 문제를 가장 잘 아는 사람이 AI로 빠르게 만드는 게 훨씬 효율적일 수 있다. 하지만 운영 수준으로 올라가는 순간부터는 구조, 성능, 장애 대응, 책임 소재가 중요해진다. 그때는 결국 소프트웨어를 책임지는 사람이 필요하다.

## 모든 코드를 이해해야 할까

세션에서 나온 질문 중 가장 핵심은 이거였다. AI가 만든 코드를 사람이 전부 이해해야 할까, 아니면 스펙과 테스트로 충분할까.

답은 생각보다 단순했다. 영역마다 다르다.

개인정보, 결제, 권한, 보안, 프로덕션 장애처럼 문제가 터졌을 때 영향 범위가 큰 영역은 사람이 깊게 봐야 한다. 반대로 내부 대시보드나 위험도가 낮은 자동화 작업은 스펙과 테스트 중심으로 위임할 수 있다.

결국 기준은 "장애가 났을 때 어디까지 번지는가"였다. 영향 범위가 크면 사람의 이해가 필요하고, 영향 범위가 작으면 높은 수준의 스펙과 테스트로도 충분히 갈 수 있다.

이 관점이 꽤 현실적이었다. AI를 무조건 믿자는 것도 아니고, 모든 코드를 사람이 붙잡고 있어야 한다는 이야기도 아니다. 중요한 건 어디에서 사람이 핸들을 잡아야 하는지 판단하는 능력이다.

## 이제 스펙은 코드처럼 관리해야 한다

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-34/cfb8d5b1bcba9ca9.png)

AI에게 일을 시킬 때 남는 것은 결국 의도다. 그 의도는 PRD가 되기도 하고, 스펙이 되기도 하고, 테스트가 되기도 한다.

코드 생성량이 많아질수록 스펙의 중요도는 더 올라간다. AI가 수백 줄, 수천 줄 코드를 만들어놓은 뒤 문제가 생기면 사람이 전체를 즉시 이해하기 어렵다. 그래서 처음에 무엇을 만들려고 했는지, 어떤 조건을 만족해야 하는지, 무엇은 절대 깨지면 안 되는지를 남겨둬야 한다.

특히 인상 깊었던 건 스펙도 버전 관리해야 한다는 말이었다. 코드가 바뀌듯 의도도 바뀐다. 그런데 의도는 기록하지 않으면 사라진다. 나중에 "왜 이렇게 만들었지?"가 되는 순간부터 유지보수 비용이 올라간다.

나도 스펙과 PRD의 중요성은 꽤 체감하고 있었다. `superpowers`, `speckit`, `gstack` 같은 도구를 쓰면서 작업 전에 요구사항을 정리하고, 에이전트가 바로 구현으로 달려가지 않게 막는 방식은 어느 정도 익숙해졌다. 그런데 요즘은 그다음 단계로 ADR의 필요성을 느낀다. 무엇을 만들지뿐 아니라, 왜 이 선택을 했고 어떤 대안을 버렸는지까지 남겨야 나중에 컨텍스트를 잃지 않는다.

AI 시대의 문서는 보여주기용 산출물이 아니라, 다음 작업을 위한 실행 컨텍스트에 가까워지는 것 같다.

## 그래도 AI가 확실히 좋은 영역

물론 AI를 경계해야 한다는 말이 AI를 덜 쓰자는 뜻은 아니다. 오히려 잘 맞는 영역에서는 이미 확실히 도움이 된다.

내가 특히 효용을 느끼는 건 초안 작성과 테스트 작성이다. 빈 문서에서 시작할 때보다 AI가 초안을 만들어주면 훨씬 빨리 생각을 정리할 수 있다. 테스트도 마찬가지다. 예전에는 귀찮아서 미루던 케이스들을 AI에게 먼저 뽑게 하면, 내가 놓친 경계 조건을 다시 생각해보게 된다.

다만 여기서도 중요한 건 그대로 믿지 않는 것이다. 초안은 초안이고, 테스트도 결국 내가 검증해야 한다. AI가 만들어준 결과물을 내 판단 없이 받아들이는 순간 다시 인지 부채가 쌓인다.

## 주니어에게 문법보다 중요한 것

주니어 개발자 이야기도 꽤 많이 나왔다. 예전에는 직접 부딪히고 디버깅하면서 성장했다. 그런데 이제는 그 시행착오를 AI가 대신 겪는다. 생산성은 올라가지만, 사람이 배울 기회는 줄어들 수 있다.

그래서 더 의식적으로 봐야 한다. AI가 어디서 막혔는지, 왜 다른 설계를 제안했는지, 어떤 에러를 어떻게 풀었는지를 그냥 넘기면 안 된다. 에이전트의 시행착오를 내 경험으로 흡수해야 한다.

문법 자체의 가치는 점점 낮아진다. 대신 정확한 용어를 알고, 왜 이 기술을 선택했는지 설명하고, 언어와 시스템의 장단점을 엔지니어링 관점에서 이해하는 능력이 중요해진다.

결국 좋은 개발자는 코드를 많이 외운 사람이 아니라, 문제를 정확히 설명하고 적절한 기술적 판단을 내릴 수 있는 사람에 가까워지는 것 같다.

## 산출물이 많아지는 것도 문제다

AI를 쓰면 코드도 늘고 문서도 늘어난다. 예전에는 개발 비용이 높아서 자연스럽게 가성비를 따졌는데, 이제는 만들기 쉬워지다 보니 굳이 필요 없는 구조까지 만들어지는 경우가 많아진다.

겉으로는 아키텍처가 예뻐지고 문서가 체계적으로 보일 수 있다. 그런데 너무 많아지면 결국 아무도 안 본다. 이건 기술 부채라기보다 인지 부채에 가깝다.

이 문제에 대한 답도 결국 단순함이었다. 처음 설계할 때부터 최대한 단순하게 만들도록 요구해야 한다. AI에게도 "좋은 구조"만 말할 게 아니라 "필요 이상으로 벌리지 말라"는 기준을 줘야 한다.

나도 AI가 오버엔지니어링하는 경우를 자주 봤다. 작은 기능 하나를 부탁했는데 폴더 구조를 새로 만들고, 추상화를 추가하고, 지금 당장 필요 없는 확장성까지 챙기려는 식이다. 처음에는 그럴듯해 보이지만, 내가 컨텍스트를 놓친 상태에서 그런 구조가 들어오면 나중에는 오히려 작업 속도를 떨어뜨린다.

그리고 더 중요한 질문은 이거다. 이 일이 정말 팀의 목표와 맞는가. KPI나 OKR, 매출, 운영 비용 절감, 사용자 가치와 연결되는가. AI가 일을 쉽게 만들어줄수록, 오히려 이 질문은 더 자주 해야 한다.

## 조직의 컨텍스트가 AI의 성능이 된다

팀 단위 AI 활용에서 반복해서 나온 말은 기록이었다. 회의록, PRD, ADR, 커밋 로그, 세션 로그가 잘 남아 있으면 AI가 읽을 컨텍스트가 생긴다.

정보가 흩어져 있거나 사람 머릿속에만 있으면 AI도 제대로 일하기 어렵다. 반대로 의사결정과 맥락이 구조화되어 있으면, 새로운 작업을 시작할 때 훨씬 빠르게 이어갈 수 있다.

실제로 어떤 조직에서는 로컬에 남는 에이전트 세션 로그를 중앙 저장소나 원격 환경으로 동기화해 관리한다고 했다. 물론 그대로 다 올리면 보안 문제가 생기니, 민감한 정보는 마스킹하고 필요한 부분만 모아 분석하는 식이다. 팀원들이 어떤 식으로 AI를 쓰는지 보고, 자주 막히는 지점이나 반복되는 실수를 찾아 스킬과 워크플로우를 개선한다는 이야기도 나왔다.

이제 문서화는 단순히 사람끼리 공유하기 위한 일이 아닌 것 같다. 에이전트가 팀의 맥락을 이해하도록 만드는 인프라에 가깝다. 앞으로는 에이전트 옵스, 세션 로그 중앙화, 민감 정보 마스킹, 워크플로우 자동화 같은 것들이 팀 생산성의 중요한 축이 될 것 같다.

## 많이 돌리는 것보다 정확히 맡기는 것

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-34/7a244e6a7ba681a7.png)

개인적으로 가장 공감한 부분은 에이전트 탭을 많이 띄워놓는 이야기였다. 여러 개를 동시에 돌리면 겉으로는 생산성이 엄청나 보인다. 그런데 결국 사람이 따라가지 못하면 인지 부하만 쌓인다.

나도 비슷한 문제를 겪었다. 에이전틱 코딩이 처음 바이럴되기 시작했을 때, 잘 쓰는 사람들을 따라 해보려고 여러 개의 탭을 켜두고 동시에 여러 프로젝트를 돌리거나, 하나의 프로젝트 안에서도 여러 기능을 병렬로 개발하려고 했다. 겉으로는 뭔가 많이 진행되는 것처럼 보였지만, 정작 내가 각 작업의 컨텍스트를 충분히 붙잡고 있지 못했다. 결국 어느 탭에서 무슨 결정을 했는지 다시 따라가느라 시간이 들었고, 작업 능률도 생각보다 떨어졌다.

패널 중 한 분은 오히려 탭을 줄이고, 하나의 문제에 더 집중한다고 했다. 처음에 의도를 명확히 하고, 모르는 부분을 AI가 질문하게 만들고, PRD를 잘 만드는 데 시간을 더 쓴다는 이야기였다.

이게 지금 AI 개발을 대하는 꽤 좋은 태도처럼 느껴졌다. AI를 많이 쓰는 것보다 무엇을 왜 시키는지 명확히 하는 게 더 중요하다. 처음에 의도를 잘못 주면, AI는 그 잘못된 방향으로도 아주 빠르게 달려간다.

이번 세션을 듣고 나서 AI 개발에 대한 생각이 조금 정리됐다. AI는 분명 개발을 빠르게 만든다. 하지만 속도가 올라간 만큼 검증, 스펙, 테스트, 운영 책임의 중요도도 같이 올라간다.

앞으로 개발자에게 중요한 건 단순히 코드를 치는 능력이 아닐 수 있다. 문제를 정의하고, 의도를 구조화하고, 위험한 영역을 구분하고, AI가 만든 결과를 운영 가능한 소프트웨어로 책임지는 능력.

나는 여기에 꽤 동의한다. 앞으로는 기획, 디자인, 개발, 셀링을 완전히 나눠서 생각하기 어려워질 것 같다. AI가 각 영역의 실행 비용을 낮춰버리면, 결국 살아남는 사람은 자기 영역만 잘하는 사람이 아니라 문제를 정의하고, 만들고, 보여주고, 팔 수 있는 사람에 가까워질 것 같다.

그래서 이 세션은 낙관보다 경각심에 가까웠다. AI를 쓰면 더 많은 걸 할 수 있다는 기대도 있지만, 동시에 준비하지 않으면 더 빠르게 뒤처질 수 있다는 불안도 생긴다. 결국 AI 시대에도 본질은 비슷한 것 같다. 더 빨리 만들 수 있게 됐을 뿐, 무엇을 만들지와 왜 그렇게 만들어야 하는지는 여전히 사람이 답해야 한다.', 'AI와 개발에 대해 이야기하는 구름 커밋 세션을 들었다. 요즘 워낙 "AI로 개발자가 대체된다", "바이브 코딩이면 혼자 서비스도 만든다" 같은 말이 많아서 조금은 뻔한 이야기일 줄 알았는데, 실제 현장에서 부딪힌 사례들이 꽤 구체적이었다.듣고 나서 제일 크게 남은 건 하나였다. AI가 코드를 잘 짜는 시대가 됐지만, 그', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-34/cfb8d5b1bcba9ca9.png', '2026-05-28T11:03:29+09:00', '2026-05-28T11:03:29+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_34';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_33', 'tistory-33', '쉽고 간편한 SSL/TLS 인증서 등록, 발급, 관리를 위한 Certificate Manager', '본 포스팅은 네이버클라우드에서 소정의 수수료를 제공받아 작성된 글입니다.

썸네일 출처: 네이버클라우드 제공 이미지

인증서 만료는 작은 설정 문제가 아니라 서비스 신뢰 문제다 
웹사이트를 운영하고 있다면 사이트의 보안 유지는 더 이상 선택이 아닙니다. 특히 웹사이트와 사용자 사이의 신뢰 관계를 만들기 위해서는 보안서버 구축이 사실상 필수에 가깝습니다. 그 과정에서 자연스럽게 만나게 되는 것이 바로 SSL/TLS 인증서입니다.

문제는 여기서 끝나지 않는다는 점입니다. 인증서는 발급만 받으면 끝나는 자산이 아니라, 적용 위치를 관리하고 만료 시점을 놓치지 않고 갱신 후 반영 상태까지 확인해야 하는 운영 자산에 가깝습니다. 운영자 입장에서는 작은 설정 하나처럼 보여도, 사용자 입장에서는 브라우저 경고 한 번으로 서비스 전체 신뢰도가 흔들릴 수 있습니다.

이런 흐름 안에서 네이버클라우드는 클라우드와 온프레미스 환경 모두에서 활용할 수 있는 **Advanced Domain Validated 인증서**를 제공하고 있습니다. 운영자 입장에서는 데이터를 보호하는 기본 장치를 갖추고, 개인정보보호법 등 보안서버 구축이 요구되는 환경을 준비할 때 검토할 수 있는 선택지에 가깝습니다.

## 왜 인증서는 발급보다 관리가 더 어렵나

처음 HTTPS를 붙일 때는 인증서 발급과 적용이 가장 큰 일처럼 보입니다. 하지만 실제 운영에서는 그 뒤가 더 길게 남습니다.

운영자는 보통 이런 질문 앞에서 자주 막힙니다.

- 지금 어떤 도메인에 어떤 인증서가 붙어 있나

- 만료일이 가장 가까운 인증서는 무엇인가

- 갱신 후 어디까지 다시 반영해야 하나

- Load Balancer, CDN, Edge, 외부 서버 중 어디가 빠졌나

도메인이 하나일 때는 기억으로도 버틸 수 있습니다. 문제는 서비스가 늘어나고 적용 위치가 흩어질 때부터 시작됩니다. 인증서가 여러 개로 늘어나고, 연결 지점도 많아지면 "발급했다"보다 "계속 관리할 수 있다"가 더 중요한 기준이 됩니다.

운영자 입장에서 인증서 관리는 결국 세 가지로 압축됩니다.

- **위치 파악**: 어디에 붙어 있는지

- **상태 확인**: 언제 만료되는지

- **반영 관리**: 갱신 후 어디까지 다시 적용해야 하는지

이 셋 중 하나만 놓쳐도 사용자는 곧바로 브라우저 경고를 마주할 수 있습니다. 그래서 SSL/TLS 인증서를 보는 기준도 단순히 보안 기능 유무가 아니라, 운영자가 이 세 가지를 얼마나 안정적으로 관리할 수 있느냐로 옮겨가야 합니다.

## HTTPS는 기술 설정이 아니라 신뢰 인터페이스다

SSL/TLS 인증서의 기술적 역할은 분명합니다. 웹서버와 브라우저 사이의 데이터를 암호화하고, 중간 노출이나 변조 위험을 줄여줍니다. 사용자가 입력한 정보가 네트워크 구간에서 평문으로 오가지 않게 만들고, 서비스가 최소한의 안전장치를 갖추고 있다는 신호를 주는 역할도 합니다.

하지만 운영 관점에서 더 크게 보이는 것은 사용자 경험입니다. 특히 로그인, 결제, 문의, 신청처럼 사용자의 입력이 오가는 페이지에서는 HTTPS가 기본 조건입니다. 이때 인증서가 정상 적용되어 있지 않다면 서비스 품질과 별개로 신뢰가 먼저 무너질 수 있습니다.

실무에서는 개인정보보호법 등 관련 요구사항 때문에 보안서버 구축이 필요한 경우도 많습니다. 즉, SSL/TLS 인증서는 기술팀만 신경 쓰는 설정이 아니라 법률 준수와 신뢰 확보가 함께 걸린 기본 인프라로 보는 편이 맞습니다.

그래서 인증서를 볼 때는 "암호화 기능이 있다"보다 다음 질문이 먼저 나와야 합니다.

- 사용자가 불안해질 지점을 줄여주는가

- 운영자가 놓칠 수 있는 확인 포인트를 줄여주는가

- 만료나 재적용 이슈를 계속 추적할 수 있는가

- 법률과 정책이 요구하는 보안서버 기준을 갖추는 데 도움이 되는가

이 기준으로 보면 인증서 도구도 단순 발급 기능보다 **운영 부담을 얼마나 줄여주는지**로 읽게 됩니다.

## Certificate Manager란?

**Certificate Manager**는 SSL 인증서를 간편하게 등록, 발급, 관리할 수 있게 해주는 네이버클라우드의 서비스입니다. 등록된 인증서는 **Load Balancer**와 **Global Edge** 등 다양한 연동 서비스에서 활용할 수 있습니다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-33/ef109698ca8c1abc.webp)

이미지 출처: 네이버클라우드 제공 이미지

운영자 입장에서 이 서비스의 핵심은 인증서를 파일처럼 따로 들고 다니는 것이 아니라, 등록부터 조회, 적용, 상태 확인까지 한 흐름 안에서 다룰 수 있다는 점입니다. 통합 인증서 등록, 인증서 발급, **만료 알림**을 한 서비스 안에서 관리할 수 있다는 점이 실무적으로 의미가 있습니다.

### 1. 인증서 등록과 적용 흐름을 한곳에서 본다

Certificate Manager를 사용하면 기존에 보유한 공인 SSL 인증서를 등록해 관리할 수 있고, 필요한 경우 새 인증서를 발급받을 수도 있습니다. 여기서 중요한 것은 단순히 "발급 가능"하다는 사실보다, 등록된 인증서를 실제 서비스 적용 흐름과 연결해서 볼 수 있다는 점입니다.

운영 중에는 인증서를 어디에 저장했는지보다, 지금 어떤 서비스에 연결돼 있고 어떤 상태인지 더 자주 확인하게 됩니다. 그런 점에서 인증서 보관, 서비스 적용, 상태 추적이 분리된 구조보다 한 서비스 안에서 이어지는 구조가 관리 포인트를 줄여줍니다.

### 2. 만료 알림이 운영 리스크를 줄인다

인증서 사고는 대개 복잡한 암호학 이론 때문에 나는 것이 아니라, 만료일을 놓치거나 반영 대상을 빠뜨려서 생깁니다. 그래서 만료일 관리는 편의 기능이 아니라 운영 리스크 관리에 가깝습니다.

Certificate Manager는 인증서 발급, 조회, 관리와 함께 **만료 알림** 기능을 제공합니다. 여러 인증서를 동시에 운영하는 환경에서는 이런 기능이 있을 때와 없을 때의 체감 차이가 큽니다. 운영자가 달력, 메모, 수기 체크리스트에만 의존하지 않아도 되기 때문입니다.

### 3. Load Balancer와 Global Edge까지 이어지는 활용

인증서는 서버 한 대에만 붙는 자산이 아닙니다. 서비스 구조에 따라 Load Balancer, CDN, Global Edge 같은 여러 지점에 함께 걸릴 수 있습니다.

Certificate Manager에 등록된 인증서는 네이버클라우드의 연동 서비스에서 조회하고 서비스에 적용할 수 있습니다. 특히 Load Balancer와 Global Edge처럼 실제 사용자 접점에 가까운 구간에서 인증서가 쓰인다면, 적용 상태를 한눈에 추적할 수 있는 구조가 훨씬 중요해집니다.

즉, Certificate Manager를 볼 때는 기능 수보다 먼저 이렇게 질문하는 편이 좋습니다.

- 인증서 적용 위치를 한 서비스 안에서 추적할 수 있는가

- 만료와 갱신 이슈를 서비스 단위로 관리할 수 있는가

- 운영자가 확인해야 할 지점을 몇 개나 줄여주는가

## 기존 Cloud Basic 인증서와 Advanced 인증서의 차이

기존의 **Cloud Basic 인증서**는 네이버클라우드 플랫폼 안에서 사용하는 데 초점이 맞춰져 있었습니다. 네이버클라우드 서비스와 연동해 HTTPS를 적용하는 목적이라면 충분히 유용한 선택지입니다.

반면 새로 출시된 **Advanced 인증서**는 네이버클라우드 플랫폼 외에 **타 클라우드 및 온프레미스 환경 모두에서 사용할 수 있는 인증서**입니다. 즉, 네이버클라우드 안에서만 머무르는 구조가 아니라, 외부 환경까지 포함한 운영 시나리오를 함께 고려할 수 있습니다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-33/da291edccb22ac25.webp)

이미지 출처: 네이버클라우드 제공 이미지

### Advanced DV 인증서가 의미 있는 이유

Advanced 인증서는 공인 SSL 인증서를 등록해 연계 서비스에서 조회 및 서비스 적용이 가능합니다. 여기에 더해 **DV 인증서 다운로드도 가능**하기 때문에 네이버클라우드 플랫폼 외부에서도 자유롭게 사용할 수 있습니다.

이 차이는 운영 구조가 단순하지 않을수록 더 크게 느껴집니다. 예를 들어 앞단 일부는 네이버클라우드에서 처리하고, 다른 일부는 타 클라우드나 on-premise 환경에서 운영하는 경우가 있습니다. 이런 구조에서 인증서 발급 기준과 운영 기준이 완전히 분리되면 갱신과 재반영 시점마다 관리 복잡도가 커집니다.

반대로 Advanced DV 인증서를 활용하면, 관리 기준점은 Certificate Manager에 두면서도 실제 적용 대상은 더 넓게 가져갈 수 있습니다. 운영자 입장에서는 특정 플랫폼 안에 갇히지 않으면서도 인증서 흐름을 한 축으로 정리할 수 있다는 점이 장점입니다.

### 클라우드와 온프레미스를 같이 보는 환경에 맞다

실제 서비스는 한 환경만 쓰지 않는 경우가 많습니다. 외부 트래픽을 받는 영역은 클라우드에서 운영하고, 내부 시스템이나 기존 레거시 자산은 온프레미스에 남겨두는 식입니다. 이때 환경별로 다른 인증서 발급 방식, 다른 만료 추적 방식, 다른 반영 절차를 쓰기 시작하면 운영자는 같은 일을 여러 번 반복하게 됩니다.

Advanced DV 인증서는 이런 상황에서 실무적으로 검토할 만한 선택지입니다. 네이버클라우드 연동 서비스에 인증서를 적용하면서도, 필요 시 다운로드해 외부 환경까지 활용할 수 있기 때문입니다. 결국 중요한 것은 기술적 화려함이 아니라 **관리 방식의 일관성**입니다.

### 빠르고 자동화된 발급 흐름도 강점이다

Advanced Domain Validated 인증서는 도메인 소유권 또는 제어권을 확인한 뒤 발급되는 DV 인증서입니다. Certificate Manager에서는 DNS 레코드 수정이나 이메일 검증을 통해 도메인 제어권을 확인할 수 있습니다.

신청, 접수, 발급 과정에서 **완전히 자동화된 빠른 발급**이 가능하다는 점도 눈여겨볼 부분입니다. 인증서는 생각보다 갑자기 필요한 일이 많고, 발급 지연은 HTTPS 적용 일정이나 배포 일정 전체를 밀 수 있습니다. 그래서 발급 과정 자동화는 단순 편의 기능이 아니라 운영 속도와 연결됩니다.

네이버클라우드는 추후 인증서 적용 및 갱신의 **완전 자동화**도 준비 중이라고 안내하고 있습니다. 실제 운영에서는 이 부분이 안정화될수록 반복 확인 지점을 더 줄일 수 있을 것으로 보입니다.

## 이런 상황이라면 특히 잘 맞는다

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-33/21689953b07f3ff0.webp)

이미지 출처: 네이버클라우드 제공 이미지

### HTTPS 전환을 준비 중일 때

새 사이트를 만들거나 기존 HTTP 사이트를 HTTPS로 바꿔야 한다면 인증서 발급과 적용은 반드시 거쳐야 합니다. 이때 중요한 것은 발급 자체보다 **누락 없이 반영하고 이후에도 계속 관리할 수 있느냐**입니다.

Certificate Manager는 이 흐름을 한 서비스 안에서 정리하기 좋습니다. HTTPS 전환을 처음 하거나, 운영 체크리스트를 아직 체계화하지 못한 팀이라면 특히 유용할 수 있습니다.

### 여러 도메인과 인증서를 동시에 관리할 때

대표 도메인, 서브도메인, 이벤트 페이지, API 서버, 관리자 페이지까지 늘어나면 인증서도 함께 늘어납니다. 그때부터는 발급 기능보다 조회, 상태 확인, 만료 추적의 중요도가 더 커집니다.

이런 환경에서는 인증서를 한곳에서 보고 관리할 수 있는 구조가 실수를 줄이는 데 도움이 됩니다. 인증서가 어느 서비스에 연결돼 있는지, 어떤 것이 먼저 만료되는지, 갱신 뒤 어디까지 다시 적용해야 하는지 한 화면에서 따라갈 수 있어야 운영 실수가 줄어듭니다.

### 클라우드와 외부 환경이 섞여 있을 때

서비스 일부는 네이버클라우드, 일부는 다른 클라우드나 온프레미스에 있다면 인증서 운용 기준이 흩어지기 쉽습니다. Advanced DV 인증서는 이런 환경에서 관리 기준점을 단순하게 가져가는 데 의미가 있습니다.

특히 플랫폼이 섞여 있을수록 운영자는 제품 기능보다 "이 인증서를 어디까지 재사용할 수 있는가", "누가 갱신 책임을 가지는가", "만료 전에 어떤 순서로 반영할 것인가"를 더 먼저 보게 됩니다. Advanced DV는 바로 그 운영 질문에 대응하는 쪽에 가깝습니다.

## 요금과 운영 관점에서 같이 볼 포인트

네이버클라우드는 Advanced DV에 대해 **실용적인 서비스 구성과 시간 단위 종량제 요금**을 안내하고 있습니다. 다만 과금 단위와 별개로 실제 청구가 어떤 주기로 정산되는지, 계약 조건이 어떻게 적용되는지는 도입 전에 꼭 확인하는 편이 좋습니다.

또한 안내 기준으로 **1년 단위로 요금이 청구된다**는 점도 함께 봐야 합니다. 운영자 입장에서는 기술 기능만 보는 것이 아니라, 실제 도입 비용과 갱신 주기, 예산 반영 방식까지 같이 확인하는 편이 현실적입니다.

## 맺음말

인증서는 발급받고 끝나는 자산이 아닙니다. 실제 운영에서는 **어디에 적용되어 있는지, 언제 만료되는지, 갱신 뒤 어디까지 다시 반영해야 하는지**를 계속 추적해야 합니다. 그래서 인증서 문제는 작은 설정 문제가 아니라 서비스 신뢰 문제로 이어집니다.

Certificate Manager는 이 관리 흐름을 한곳으로 모으는 데 의미가 있는 도구입니다. 그리고 Advanced Domain Validated 인증서는 네이버클라우드 내부뿐 아니라 타 클라우드와 온프레미스까지 고려해야 하는 운영 상황에서 검토할 만한 선택지입니다.

신청, 접수, 발급 과정에서 완전히 자동화된 빠른 발급이 가능하고, 추후 인증서 적용 및 갱신 자동화도 준비되고 있다는 점은 운영 관점에서 분명 참고할 만합니다. 안전한 웹사이트 운영을 준비하고 있다면, 네이버클라우드 **Certificate Manager**의 **Advanced Domain Validated SSL/TLS 인증서**를 기준으로 인증서 관리 방식을 점검해보는 것부터 시작해도 좋겠습니다.

[![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-33/91430977fbe346aa.webp)](https://www.ncloud.com/product/security/certificateManager) 
 [![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-33/1f5a518a27eb8acc.webp)](https://www.ncloud.com/support/question/sales?inputchannel=mkt)', '본 포스팅은 네이버클라우드에서 소정의 수수료를 제공받아 작성된 글입니다. 썸네일 출처: 네이버클라우드 제공 이미지인증서 만료는 작은 설정 문제가 아니라 서비스 신뢰 문제다웹사이트를 운영하고 있다면 사이트의 보안 유지는 더 이상 선택이 아닙니다. 특히 웹사이트와 사용자 사이의 신뢰 관계를 만들기 위해서는 보안서버 구축이 사', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-33/ef109698ca8c1abc.webp', '2026-05-26T20:39:33+09:00', '2026-05-26T20:39:33+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_33';
INSERT INTO tags (id, name, slug) VALUES ('tag_certificate_manger', 'Certificate Manger', 'certificate-manger') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_33', (SELECT id FROM tags WHERE slug = 'certificate-manger' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_dv_certificate', 'Dv Certificate', 'dv-certificate') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_33', (SELECT id FROM tags WHERE slug = 'dv-certificate' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_ssl', 'Ssl', 'ssl') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_33', (SELECT id FROM tags WHERE slug = 'ssl' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_ssl_tls', 'Ssl Tls', 'ssl-tls') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_33', (SELECT id FROM tags WHERE slug = 'ssl-tls' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tls', 'Tls', 'tls') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_33', (SELECT id FROM tags WHERE slug = 'tls' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_32', 'tistory-32', '"코딩 1도 몰라도 된다"는 말이 가장 무섭다: 모아이 ADK 발표 후기', '최근 구름에서 열린 에이전트 코딩 세션에 다녀왔다. 발표자는 모아이(Moai) ADK라는 에이전트 개발 키트를 만든 분이었다. 세션은 본인의 실패 경험에서 시작해, 그 실패를 줄이기 위해 어떤 도구와 작업 방식을 만들었는지 설명하는 흐름이었다.

2시간 정도 들었고, 끝나고 나니 몇 가지는 기록해두는 게 좋겠다고 생각했다.

## 1. "AI한테 다 맡겼다가 500달러 날렸습니다"

발표는 2024년 말의 실패 이야기로 시작됐다. 발표자는 와디즈에서 LLM 기반 사주 분석 서비스를 크라우드펀딩했다. 1차는 성공했지만 2차에서 문제가 터졌다.

Cursor에 500달러를 썼는데, AI가 기존 코드를 마음대로 바꿔버렸다고 했다. 분명히 잘 돌아가는 것을 확인했는데 PDF 라이브러리가 어느 순간 교체되어 있었다. LangChain은 마이너 버전만 올라가도 기존 기능이 깨졌다. 70시간 동안 작업했지만 결국 고객에게 100% 환불했고, 1차 프로젝트는 절반의 성공으로 정리했다고 한다.

이 이야기를 들으면서 최근 AI 코딩 도구의 "다 맡기면 된다"는 식의 메시지가 꽤 위험하다고 느꼈다. AI가 코드를 빨리 만들 수 있다는 것과, 서비스 운영 책임까지 대신 져준다는 것은 완전히 다른 문제다.

## 2. LLM보다 하네스가 결과를 더 많이 바꾼다

세션에서 오래 남은 말은 "LLM은 다 고만고만하다"는 표현이었다.

발표자는 OpenAI, Claude, Gemini를 모두 써봤고, 세 모델을 동시에 브레인스토밍시켜 테스트까지 해봤다고 했다. 그의 결론은 단일 LLM의 차이보다 어떤 하네스, 즉 어떤 작업 프레임워크를 얹느냐가 결과를 더 크게 바꾼다는 쪽이었다.

Codex, Gemini, Claude Code의 공식 매뉴얼을 비교해보라는 말도 있었다. 도구마다 제공하는 기능 범위가 다르기 때문이다. Claude Code는 최대 10개 태스크까지 동시에 병렬 수행할 수 있는데, 멀티 에이전트 작업에서는 이 차이가 꽤 크게 느껴진다고 했다.

## 3. 스펙 문서: 에이전트와 사람이 같이 보는 문서

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-32/2d6cc4a907d4c9c7.png)

발표자가 실패를 분석하며 찾은 해답은 스펙 문서였다.

PRD는 보통 사람을 위한 문서에 가깝다. 에이전트에는 절차적 지시, 현재 상황, 목표, 제약이 한 장의 마크다운 안에 정리된 문서가 더 잘 맞는다고 했다.

이 부분은 바로 이해됐다. "웹 게임을 만들어라"라고 하면 AI가 서버 배포까지 포함한 게임을 만들 수도 있다. "웹 브라우저에서 돌아가는 클래식 오목 게임"이라고 써야 원하는 방향에 가까워진다. 목적어가 빠지면 AI는 부족한 부분을 확률적으로 채운다.

스펙 문서의 진행 상황을 커밋과 함께 계속 기록해야 한다는 말도 있었다. 이렇게 하면 세션이 끊겨도 어디까지 했는지 파악할 수 있고, 같은 설명을 다시 반복할 일이 줄어든다.

## 4. 신규는 TDD, 기존은 DDD

프로젝트 유형별로 접근을 달리해야 한다는 설명도 실용적이었다.

- 신규 프로젝트 -> TDD (테스트 주도 개발)

- 기존 프로젝트 -> DDD (도메인 주도 개발)

기존 프로젝트를 코드 배경 없이 수정하면 단면만 보고 코어를 건드릴 수 있다. 그래서 먼저 전체 코드 분석, 코드 맵 생성, 기술 스택 고정을 거친 뒤 개발을 시작해야 한다고 했다.

"AI가 분석과 기록은 사람보다 잘한다. 이걸 인정해야 한다"는 말도 기억에 남았다. 사람은 판단과 책임을 맡고, AI에는 문서화와 반복 검증을 맡기는 쪽이 현실적인 분업처럼 보였다.

## 5. 모아이 ADK: 4단계 워크플로우

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-32/888ee883929ce7a4.png)

발표 후반부는 모아이 ADK 소개였다. 발표자가 본인이 쓰려고 만든 에이전트 개발 키트이고, 기본 흐름은 4단계로 구성되어 있다.

- /project로 전체 코드를 읽고 코드 맵을 만든다. 기술 스펙, 버전, 보안 이슈까지 정리한다. 신규 프로젝트라면 질문을 통해 기술 스택도 추천한다.

- 요구사항을 기반으로 마크다운 스펙 문서를 만들고, 뼈대 디렉토리 구조와 기술 스택 버전 고정까지 처리한다.

- 복잡도를 예측해 병렬 또는 순차 전략을 정한다. LSP 서버로 에러를 줄이고 테스트 커버리지 85% 달성을 목표로 둔다.

- Sync로 코드와 스펙 문서를 맞춘다. 개발 중 정책이 바뀌어도 문서와 코드가 따로 놀지 않게 하는 기능이다.

여기에 Fix와 Loop도 붙는다. Fix는 버그 메시지를 넣으면 포팅, 타입, 보안 이슈를 찾아주는 기능이고, Loop는 반복 검증을 최대 100회까지 돌리는 기능이라고 했다. 발표자는 퇴근할 때 "오늘 코딩한 거 보안 체크해라"라고 걸어두고, 다음 날 결과를 확인하는 식으로 쓴다고 했다.

## Python -> Go" data-ke-size="size26">6. 언어 선택: TypeScript -> Python -> Go

모아이를 어떤 언어로 만들지 고른 과정도 흥미로웠다.

처음에는 TypeScript로 시작했지만 Claude가 npm을 제거하고 Bun으로 전환하면서 환경이 꼬이기 시작했고, Windows에서 버그가 많이 났다고 했다. Python은 의존성 문제가 컸다.

최종 선택은 Go였다. 런타임 에러가 적고, 설치가 간단하고, Windows에서도 안정적이라는 이유였다. 발표자 본인은 Rust를 더 좋아하지만, 개발자가 좋아하는 기술보다 사용자에게 좋은 기술을 골랐다고 했다. 이 판단은 제품을 쓰는 사람 입장에서 설득력이 있었다.

Go로 전환하면서 기존 코드를 전부 새로 썼고, Codex, Gemini, Claude 세 개를 브레인스토밍시켜 하루 반나절 동안 교차 검증했다고 한다. 도구를 만든 과정 자체가 발표 내용과 맞물려 있었다.

## 7. 모아이 vs Spec Kit: 같은 문제를 다른 방식으로 푸는 도구

세션을 들으면서 GitHub에서 봤던 Spec Kit가 떠올랐다. 둘 다 스펙 기반 개발(Spec-Driven Development)을 다루고, Claude Code 같은 에이전트 코딩 도구와 연결해 쓰며, 에이전트가 읽을 수 있는 마크다운 문서를 중시한다.

다만 두 도구의 사용 장면은 꽤 달라 보였다.

### 공통점

모아이와 Spec Kit 모두 코드를 바로 짜기보다 스펙 문서를 먼저 만든다. 에이전트가 읽을 수 있는 설계서를 만들고, 그 설계서를 기준으로 코드를 생성한다는 점에서는 출발점이 같다.

### 워크플로우 구조

Spec Kit는 specify -> plan -> tasks -> implement -> review -> merge의 6단계 파이프라인이 명확하다. 각 단계가 독립된 명령어로 분리되어 있고, Kanban 대시보드에서 워크 패키지 상태를 추적할 수 있다. 검수, 승인, 머지 전략까지 들어가 있어 여러 명이 협업하는 환경에 더 잘 맞아 보였다.

모아이는 상대적으로 유연하다. /project로 분석하고 스펙을 만든 뒤, 복잡도에 따라 병렬 또는 순차 전략을 정한다. 발표자가 "코드 안 보고 코딩하는 게 아니라, 스펙과 DB 스키마만 보면 된다"고 했던 것처럼 사람이 직접 봐야 할 지점을 줄이는 데 초점이 있다. 중간에 정책이 바뀌면 Sync 기능으로 코드와 스펙을 맞춘다는 점도 다르다.

### 병렬 처리

Spec Kit는 git worktree 기반으로 각 실행 레인마다 독립적인 작업 디렉토리를 만든다. .worktrees/001-auth-lane-a/처럼 물리적으로 분리되어 있어 충돌을 줄이는 구조다.

모아이는 Claude Code의 멀티 에이전트 팀 기능을 활용해 최대 10개 태스크를 동시에 실행한다. Opus가 팀 리더 역할을 하고, Sonnet이 서브 에이전트로 작업하며 서로 통신할 수 있다고 했다. git worktree가 아니라 에이전트 레벨에서 병렬을 잡는 방식이다.

### 사용자

Spec Kit는 "진지한 소프트웨어 개발자"를 타겟으로 명시하고 있다. 프로젝트 오너, 테크 리드, 아키텍트 등 역할별 가치 제안이 정의되어 있고, C4 다이어그램과 ADR 추적까지 지원한다. 기업 환경이나 다수 인원이 협업하는 프로젝트에 더 적합해 보였다.

모아이는 발표자 본인이 쓰려고 만든 도구라 그런지 개인 개발자나 소규모 팀에 더 친화적인 인상을 줬다. "비개발자도 2일 만에 앱을 만든다"는 실전 사례에서 알 수 있듯, 진입 장벽을 낮추는 쪽에 더 가까웠다. 1인 개발자가 대규모 커뮤니티 사이트를 혼자 운영하는 상황에 잘 맞는다고도 했다.

### 비교

모아이 (Moai ADK) Spec Kit

핵심 철학 
 에이전트 코딩 하네스 
 스펙 기반 개발 파이프라인 
 
 
 워크플로우 
 분석 -> 스펙 -> 생성 -> 동기화 
 specify -> plan -> tasks -> implement -> review -> merge 
 
 
 병렬 처리 
 에이전트 팀 (최대 10개 동시) 
 git worktree (레인별 독립 디렉토리) 
 
 
 동기화 
 코드-스펙 자동 Sync 
 스펙 산출물 중심 
 
 
 대시보드 
 없음 (터미널 기반) 
 Kanban 대시보드 내장 
 
 
 지원 AI 
 Claude Code 전용 
 12개 AI 도구 지원 (Claude, Cursor, Gemini 등) 
 
 
 구현 언어 
 Go 
 Python 
 
 
 타겟 
 1인~소규모, 비개발자 포함 
 개발자, 팀/기업 환경

### 내가 정리한 차이

두 도구는 경쟁 제품이라기보다 쓰임새가 다르다. Spec Kit는 작업을 어떻게 관리하고 승인할지에 강점이 있고, 모아이는 에이전트를 어떻게 굴릴지에 더 많은 비중을 둔다.

발표자가 "Codex, Gemini, Claude 중 뭐가 좋냐? 다 좋은데 프롬프트가 안 좋은 거다"라고 했던 것도 이 맥락에서 이해됐다. 첫 번째 프롬프트의 품질, 특히 스펙 문서의 품질이 결과를 크게 바꾼다. 어떤 도구를 쓰든 목적어를 빼먹지 않고 구체적으로 지시해야 한다.

## 8. Q&A

스펙 문서가 오히려 LLM을 헷갈리게 하지 않느냐는 질문이 나왔다. 한번 쓰고 버리는 식으로 스펙을 관리하는 프로젝트들도 있다는 이야기였다.

발표자의 답변은 분명했다. 스펙 문서 안에 사용자의 요구, 변경 이유, 과거 기록이 연결돼 있어야 AI가 맥락을 갖고 추론할 수 있다고 했다. 맥락을 제공하지 않으면 AI가 엉뚱한 방향으로 갈 가능성이 높아진다.

토큰 비용에 대한 질문도 있었다. 발표자는 Mac 2대를 쓰고 있고, 설계는 Opus, 실행은 Sonnet으로 나눠 쓴다고 했다. Pencil MCP가 가장 토큰을 많이 잡아먹는다고 하면서, 비싼 모델을 쓰는 것보다 불필요하게 소모되는 토큰을 줄이는 게 더 중요하다고 했다.

팀 단위 협업에서 스펙 싱크를 어떻게 맞추느냐는 질문에는 모아이 자체가 팀 에이전트 구조로 설계돼 있다고 답했다. Board 플로 기반으로 작업하면 스펙 변경이 자동으로 동기화되고, 개인 모드보다 팀 모드가 더 잘 돌아간다고 했다.

## 9. 세션을 들으며 느낀 것

"코딩 1도 몰라도 코딩할 수 있다"는 말이 가장 무섭다는 발표자의 말이 계속 생각난다. MVP까지는 바이브 코딩으로 가능할 수 있다. 하지만 서비스를 운영하려면 보안을 피할 수 없다. 인증과 인가를 허술하게 만들었다가 한번 털리면 수습하기 어렵다.

시니어 개발자가 지금 가장 필요한 시기라는 말에도 공감했다. AI는 텍스트를 많이 학습했지만, 실제 환경에서 문제가 발생했을 때 처리하는 경험은 부족하다. 각자의 도메인에서 쌓은 경험과 직관은 여전히 필요하다.

발표자가 하신 말이 오래 남는다.

> 
"Codex, Gemini, Claude 중에 뭐가 좋냐고요?
다 좋습니다. 다 좋은데 여러분의 프롬프트가 안 좋은 겁니다."

스펙 문서 하나를 제대로 쓸 수 있는 환경을 갖추면, 어떤 LLM을 쓰더라도 지금보다 생산적으로 일할 수 있을 것 같다.', '최근 구름에서 열린 에이전트 코딩 세션에 다녀왔다. 발표자는 모아이(Moai) ADK라는 에이전트 개발 키트를 만든 분이었다. 세션은 본인의 실패 경험에서 시작해, 그 실패를 줄이기 위해 어떤 도구와 작업 방식을 만들었는지 설명하는 흐름이었다.2시간 정도 들었고, 끝나고 나니 몇 가지는 기록해두는 게 좋겠다고 생각했다.1', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-32/2d6cc4a907d4c9c7.png', '2026-05-22T22:01:46+09:00', '2026-05-22T22:03:00+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_32';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_31', 'tistory-31', '현업에서는 이렇게 AI를 운영한다 - 구름 커밋 후기', 'AI 서비스를 직접 만들고 운영하는 세 명의 실무자가 나눈 대화를 들었다. 이론서에 없는 현장 이야기가 많아서 메모하면서 계속 끄덕였다. 인상 깊었던 것들을 적어본다.

## 틀린 이유를 쪼개야 고칠 수 있다

AI 응답이 틀렸을 때 그냥 "틀렸다"고 넘기면 막막하다. 패널들이 오류를 네 가지로 쪼개서 분석한다는 이야기를 듣고, 이건 실무적으로 당장 써먹겠다 싶었다.

문맥 파악 실패면 프롬프트를 고치고, 데이터 검색 실패면 RAG 파이프라인을 고치고, 데이터 조합 실패면 청킹이나 검색 로직을 점검하고, 최종 생성 실패면 모델이나 파인튜닝을 의심한다. 각각 해결책이 다르니까 원인을 먼저 분리하는 게 시작이라는 생각이 들었다.

재현성 이야기도 나왔다. 100번 같은 질문했는데 99번은 같고 1번 다르게 나온다면, 이게 AI의 본질이라고 한다. 무결성이 중요한 도메인에서는 휴먼 에러 발생 가능성을 2% 이하로 잡고 거기에 맞춰간다고. LangFuse, LangSmith 같은 도구로 지속적인 평가를 자동화한다는 이야기도 들었는데 당장 찾아봐야겠다.

## 어제 된 게 오늘 안 된다

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-31/d3885b593e9ff692.png)

이 부분이 제일 와닿았다. 모델도 고정하고 시스템 프롬프트도 고정해도 DB는 항상 바뀔 수 있고, 벤더 정책 변경이 언제든 영향을 준다.

2,000명이 온라인 시험을 보고 있었는데 갑자기 특정 유저 요청에서 에러가 터진 사례가 있었다. 원인은 Azure 콘텐츠 정책. 환경 파괴 관련 수학 문제가 프롬프트에 포함되어 있었는데, 이게 Azure 금지 조항에 걸린 것. 시험 중에 이런 일이 터지면 진짜 난감하다.

> 
"벤더가 끼는 경우에는 정말 예측을 할 수가 없습니다. 가장 중요한 건 모니터링할 수 있는 수단을 만들어두는 겁니다."

이 말이 계속 머릿속에 남았다. 결국 트레이싱, 폴백 전략, 휴먼 인 더루프 설계가 다 기본기다.

개체 인식 태스크에서 LLM과 파인튜닝 모델을 비교한 경험도 나왔다. LLM은 정확도 50% 미만, 파인튜닝 모델은 80% 이상. 비용도 느리고 비싸고. "이 정도 태스크에 LLM이 필요한 건지 명확히 하는 게 중요합니다"라는 말에 고개가 끄덕여졌다.

## 토큰 비용, 보이지 않는 폭탄

한 은행에서 2만 명 임직원용 AI 어시스턴트를 만들고 싶다고 했다. Notion AI가 이미 있는데도. 계산해보니 Notion AI 2만 명 &times; 월 1만 원 = 월 2억, 연 24억. "그러니 차라리 만드는 게 낫지 않겠나?"인데, 실제로 개발하면 24억으로도 부족할 수 있다고. 인프라, 유지보수 인력, 운영 비용까지 합치면 공짜 SaaS를 쓰는 게 나을 수도 있다.

> 
"살 수 있으면 사서 쓰세요. 만들면 버그입니다."

비용 관리 팁도 몇 개 들었다. 시스템 프롬프트 3,000자가 매 요청마다 누적되면 토큰이 기하급수적으로 증가하니까 캐싱이 필수. 파인튜닝으로 시스템 프롬프트를 줄이는 것도 방법인데, 200개 데이터만으로도 파인튜닝이 가능하다고. 그리고 자율형 에이전트(Cursor, Windsurf)의 토큰 소모는 진짜 무섭다. "실험 하나 돌렸는데 몇 달러가 날아갔습니다"라는 경험담이 나왔다.

## 정확도, 속도, 비용 중 하나는 포기해야 한다

증권사 사례가 재밌었다. 정확도 KPI 다 맞춰놨는데 회장님이 "느리다"고 해서 낮은(빠른) 모델로 바꿨다. 정확도가 떨어졌지만 실제로는 큰 문제가 안 됐다고 한다. 속도가 체감 품질에 더 큰 영향을 줬던 셈.

B2C 서비스도 비슷했다. 초기에 정확도를 포기하고 속도를 선택했다고. 일반 사용자들은 AI가 틀려도 "내가 질문을 잘못했나 보다"라고 생각하는데, 속도가 느리면 바로 컴플레인이 온다. AI 역량 평가 서비스다 보니 정답을 직접 주면 안 돼서 검증 모델을 여러 단계로 꽂아놨는데, 한 번 요청에 최대 5배의 LLM 호출이 발생했다고.

같은 서비스 안에서도 영역마다 다르게 갔다. UX 어시스턴트는 속도 우선으로 빠른 모델, 채점 시스템은 정확도 우선으로 느려도 정확한 모델. "시기에 따라, 서비스 성숙도에 따라 중요도를 다르게 가져갔습니다"라는 말이 실감났다.

## 보이지 않던 페인포인트가 가장 큰 가치

시험 감독 AI 사례는 좀 충격이었다. 기존에 60~100명 감독관이 2시간 동안 모니터를 보며 스크린샷을 찍었는데, AI 도입 후 2명이 처리하게 됐다. L사 사례도 비슷. 연간 6,000~7,000명 시험에 20명당 감독관 1명이 필요했는데, AI 도입 후 감독관 인력 대폭 축소, 비용 약 50% 절감, 휴먼 에러율 감소. 최종 검증은 여전히 사람이 하지만 AI가 스냅샷을 떠서 전달하니까 고객 만족도가 높았다고.

그런데 제일 기억에 남는 건 "보이지 않던 페인포인트" 이야기. 데이터 분석 도구를 제공하면서 발견한 건데, 사람들이 차트와 숫자를 해석하는 것 자체가 큰 부담이었다. AI가 해석만 해줘도 사용자들이 크게 감동했다고.

> 
"우리는 그냥 보여주면 끝이라고 생각했는데, 사실 해석을 해야 하는 부하가 있었습니다. 그것을 줄여주는 것만으로도 정말 많이들 좋아하시더라고요."

듣고 나서, 사용자가 당연하다고 생각하는 부담이 사실 가장 큰 기회일 수 있겠다는 생각이 들었다.

## 바이브 코딩, 생산성은 올랐는데 블랙박스도 커졌다

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-31/392582caf0aa4379.png)

미국 기준 개발자의 약 60%가 바이브 코딩(에이전트 코딩)으로 코드를 생산하고 있다고 한다. Cursor, Windsurf가 보편화되면서 "코드에 손을 대는 일이 없어졌다"는 반응이 많다고.

한 4년차 개발자의 고백이 인상적이었다.

> 
"바이브 코딩으로 생산 속도가 너무 빨라지다 보니, 원래 하던 단위 테스트, 블랙박스 테스트를 훨씬 더 빡세게 해야 하는데... 코드 단위로 리뷰하면 문제가 없어 보이는데, 설계 단위로 합쳤을 때 정말 원활하게 돌아가는지 검증하기가 점점 어려워집니다."

솔직히 나도 이 고민이 있다. AI가 빠르게 코드를 써주니까 리뷰가 뒤로 밀리고, 합쳤을 때 터지는 문제는 점점 더 잡기 어려워진다.

패널들이 제안한 대응도 공감됐다. TDD가 더 중요해진 시대라는 거. 테스트 코드도 AI가 짜줄 수 있으니 테스트를 소홀히 할 이유가 없다. 수천 개 테스트 중 정말 호흡이 맞아야 하는 10~20개만 뽑아서 집중 관리하고, 코드 리뷰뿐 아니라 DB 설계, 도메인 간 관계 등 설계 단위 리뷰도 필수.

> 
"생산 속도가 빨라진 만큼, 퀄리티 컨트롤은 더 체계적으로 해야 합니다."

## 모델이 바뀌면 다시 한다

GPT 모델이 바뀔 때마다 시스템 프롬프트, 청킹 전략, 임베딩 등을 다시 설정해야 한다. 한 프리랜서 플랫폼은 매칭 자동화를 구축해놨는데 모델이 바뀔 때마다 처음부터 다시 세팅해야 했다고.

Bedrock/Azure를 쓰면 버전이 픽스되어 있어서 안정성은 확보된다. 하지만 언젠가는 업그레이드해야 하니까, 새 모델이 나올 때마다 패스/페일 기준으로 검증하고 버전별로 시스템 프롬프트를 따로 관리해야 한다.

시스템 프롬프트를 3,000자로 관리하면 매 요청마다 누적되어 토큰 폭발. 파인튜닝으로 시스템 프롬프트를 줄이면 토큰 사용량이 급감하지만 성능 저하 각오. 결국 모델 의존도가 낮을수록 유지보수 비용이 줄어든다.

OpenAI API 호출 시 같은 질문인데도 어떤 때는 빠르고 어떤 때는 느리다. 원인은 리전 선택과 트래픽 집중. 한국 리전에 트래픽이 몰리면 유럽 리전으로 우회하는 식의 대응이 필요하다고 한다.

현장에서 직접 부딪히는 분들의 이야기를 들으니, 이론으로 알던 것들이 확실히 다르게 들렸다. 특히 "어제 된 게 오늘 안 되는 게 정상"이라는 말과, 사용자가 당연하다고 생각하는 해석 부담을 줄여주는 것만으로도 큰 가치가 된다는 이야기는 앞으로 서비스 설계할 때 계속 떠오를 것 같다.', 'AI 서비스를 직접 만들고 운영하는 세 명의 실무자가 나눈 대화를 들었다. 이론서에 없는 현장 이야기가 많아서 메모하면서 계속 끄덕였다. 인상 깊었던 것들을 적어본다.틀린 이유를 쪼개야 고칠 수 있다AI 응답이 틀렸을 때 그냥 "틀렸다"고 넘기면 막막하다. 패널들이 오류를 네 가지로 쪼개서 분석한다는 이야기를 듣고, 이건', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-31/d3885b593e9ff692.png', '2026-05-17T23:45:42+09:00', '2026-05-17T23:45:42+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_31';
INSERT INTO tags (id, name, slug) VALUES ('tag_ai', 'Ai', 'ai') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_31', (SELECT id FROM tags WHERE slug = 'ai' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_f56917f5', 'Tistory Tag F56917f5', 'tistory-tag-f56917f5') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_31', (SELECT id FROM tags WHERE slug = 'tistory-tag-f56917f5' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_30', 'tistory-30', '프론트엔드 개발자의 시선으로 바라본 AWS의 전체 구조', '- 그림으로 이해하는 AWS 구조와 기술 서평

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-30/50aeace4d73a350a.jpg)

## 1. 서론

프론트엔드 개발자로 실무를 경험하면서 가장 크게 느낀 점 중 하나는,**"나는 화면을 만들고 있지만, 서비스 전체 구조는 잘 모른다"는 한계였다.

React 기반으로 UI를 구현하고 API를 호출하는 작업에는 익숙해졌지만,
그 API가 어디에서 실행되고, 정적 파일이 어떻게 사용자에게 전달되는지에 대해서는
명확하게 설명하기 어려웠다.

이러한 상황에서 AWS 전반 을 다루는 이 책은
단순한 인프라 학습을 넘어,
 프론트엔드 개발자가 서비스의 전체 흐름을 이해하기 위한 입문서**로 읽게 되었다.

## 2. 책의 구성과 특징

이 책은 AWS의 개념부터 시작해 컴퓨팅, 스토리지, 네트워크, 서버리스까지**전체 서비스를 폭넓게 설명하는 구조로 이루어져 있다.

특히 인상적이었던 점은 AWS를 단순한 기능 모음이 아니라
 "서비스들의 조합으로 시스템을 구성하는 구조"** 로 설명한다는 점이다.

책에서는 AWS에서 사용할 수 있는 자원을 ''리소스''라고 정의하며,**각 요소를 조합해 하나의 시스템을 만들어간다는 관점을 제시한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-30/65f156d5a91aa033.jpg)

이 설명은 이후 내용을 이해하는 핵심 전제가 되었고,
각 서비스를 개별적으로 외우는 것이 아니라
"어떻게 연결되는가"에 집중하게 만들어 주었다.

## 3. 프론트엔드 개발자가 주목할 내용

### 3.1 정적 파일 배포 구조 (S3 + CloudFront)

프론트엔드 개발자로서 가장 크게 와닿았던 부분은
정적 파일이 실제로 사용자에게 전달되는 과정이었다.

그동안은 React로 빌드한 결과물을 "서버에 배포한다"는 정도로만 이해하고 있었는데,
이 책을 통해 그 결과물이 S3에 저장되고, CloudFront를 거쳐 사용자에게 전달된다는 흐름을 처음으로 명확하게 그릴 수 있었다.

S3는 단순히 파일을 저장하는 공간이 아니라
버킷 설정과 접근 권한, 도메인 연결을 통해
정적 웹사이트 자체를 구성할 수 있는 기반이 된다.

여기에 CloudFront가 붙으면 상황이 완전히 달라진다.
사용자가 요청할 때마다 원본 서버에서 파일을 가져오는 것이 아니라,
가까운 에지 서버에 캐싱된 콘텐츠가 바로 응답된다.

이 부분을 읽으면서,
지금까지 내가 했던 "성능 개선"이 대부분 코드 레벨에만 머물러 있었다는 걸 느꼈다.
이미지 최적화나 lazy loading도 중요하지만,
애초에 어디에서 파일이 내려오느냐에 따라 체감 속도는 훨씬 크게 달라진다.

결국 프론트엔드 성능은 코드만의 문제가 아니라
배포 구조까지 포함해서 결정된다는 점을 이해하게 되었고,
이게 이 장에서 얻은 가장 큰 수확이었다.

### 3.2 API 호출 구조 (API Gateway + Lambda)

프론트엔드에서 API를 호출할 때, 그 요청이 실제로 어디로 가는지에 대해서는
그동안 깊게 고민해본 적이 없었다.
단순히 "백엔드 서버에 요청을 보낸다" 정도로만 이해하고 있었기 때문이다.

이 책을 통해 그 흐름이 훨씬 구체적으로 보이기 시작했다.

API Gateway와 Lambda를 조합하면,
별도의 서버를 운영하지 않고도 API를 구성할 수 있다는 점이 특히 인상적이었다.

Lambda는 요청이나 이벤트가 발생했을 때만 실행되는 구조라서
항상 켜져 있는 서버를 전제로 하지 않는다.
API Gateway는 그 앞단에서 요청을 받아 적절한 Lambda 함수로 연결해준다.

이 구조를 이해하면서,
지금까지 당연하게 생각했던 "API = 서버"라는 인식이 깨졌다.

프론트엔드 입장에서도
어떤 방식으로 백엔드를 구성하느냐에 따라
응답 속도, 비용, 확장 방식이 달라질 수 있다는 점을 알게 되었고,
단순히 API를 소비하는 역할을 넘어서
구조 자체를 이해하는 것이 필요하다는 생각이 들었다.

### 3.3 인증과 사용자 관리 (Cognito)

로그인 기능 역시 단순히 API를 호출하는 과정이라고만 생각하고 있었는데,
이 책을 통해 그 뒤에 별도의 인증 시스템이 존재한다는 점을 처음으로 제대로 인식하게 되었다.

그동안은 토큰을 받아서 저장하고, 요청에 실어 보내는 흐름에는 익숙했지만
그 토큰이 어떻게 발급되고, 어떤 기준으로 권한이 나뉘는지까지는 깊게 생각해보지 않았던 것 같다.

Cognito는 이러한 과정을 담당하는 서비스로,
사용자 풀을 통해 로그인과 사용자 관리를 처리하고,
자격 증명 풀을 통해 실제 AWS 리소스에 접근할 수 있는 권한을 제어한다.

이 부분을 읽으면서
인증(Authentication)과 인가(Authorization)가 분리되어 있다는 개념이
단순한 이론이 아니라 실제 서비스 구조에서 중요한 기준이라는 점을 이해하게 되었다.

특히 로그인 기능을 구현할 때도
단순히 "로그인 API를 붙인다"는 수준이 아니라,
사용자의 권한과 접근 범위를 어떻게 나눌 것인지까지 함께 고려해야 한다는 점이 인상 깊었다.

### 3.4 네트워크와 보안 (VPC, 보안 그룹)

그동안 네트워크와 보안 영역은 프론트엔드 개발과는 거리가 있는 영역이라고 생각해왔다.
API가 정상적으로 동작하지 않으면, 대부분은 요청 코드나 응답 데이터부터 의심하는 식이었다.

이 책을 통해 API 요청이 단순히 서버로 전달되는 것이 아니라,
VPC, 서브넷, 라우팅, 보안 그룹과 같은 여러 단계를 거쳐 전달된다는 흐름을 이해하게 되었다.

VPC는 AWS 상에서 구성되는 가상 네트워크로,
서비스를 외부와 분리된 환경에서 운영할 수 있게 해준다.
그 안에서 서브넷으로 네트워크를 나누고,
보안 그룹과 네트워크 ACL을 통해 어떤 요청을 허용하거나 차단할지 설정한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-30/e25420c25f039a10.jpg)

이 구조를 보고 나니,
예전에 겪었던 "요청은 보내지는데 응답이 오지 않던 상황"들이
단순한 코드 문제가 아니라 네트워크 설정 문제였을 가능성도 떠올랐다.

프론트엔드 입장에서는 여전히 직접 설정할 일이 많지는 않지만,
요청이 어떤 경로를 거쳐 전달되는지를 알고 있는 것만으로도
문제를 바라보는 방식이 달라진다.

이제는 오류가 발생했을 때
코드뿐만 아니라 네트워크와 인프라 설정까지 함께 의심해볼 수 있는 시야**가 생겼다는 점이
이 장에서 얻은 가장 큰 변화였다.

### 3.5 배포와 DevOps (Amplify, CI/CD)

서비스가 사용자에게 전달되는 과정 역시
그동안은 "배포 버튼을 누르면 끝난다"는 정도로만 인식하고 있었다.

이 책을 통해 배포가 단순한 마지막 단계가 아니라,
코드 변경부터 빌드, 테스트, 배포까지 이어지는 하나의 흐름이라는 점을 이해하게 되었다.

AWS Amplify는 이러한 과정을 비교적 단순하게 구성할 수 있도록 도와주는 서비스이고,
CodePipeline과 같은 도구들은 코드 변경이 발생했을 때
자동으로 빌드와 배포가 이어지도록 만든다.

이 부분을 읽으면서
지금까지는 로컬에서 개발하고 수동으로 배포하는 흐름에 익숙해져 있었지만,
실제 서비스에서는 이 과정이 자동화되어야 한다는 점이 더 크게 와닿았다.

특히 협업 환경에서는
배포 과정 자체가 하나의 시스템처럼 관리된다는 점이 중요하다는 것을 느꼈고,
프론트엔드 개발자 역시 코드 작성에만 집중하는 것이 아니라
그 코드가 어떻게 배포되고 운영되는지까지 이해할 필요가 있다고 생각하게 되었다.

## 4. 아쉬운 점

이 책은 AWS의 다양한 서비스를 폭넓게 다루는 만큼,
각 서비스에 대한 깊이는 제한적인 편이다.

개념 중심으로 설명이 이루어지기 때문에,
실제 서비스를 직접 구축해보려면 추가적인 학습이 필요하다.

또한 서비스 종류가 많다 보니
처음 접하는 입장에서는 무엇부터 적용해야 할지 판단하기 어려운 부분도 있었다.

## 5. 실무에 대한 인사이트

이 책을 통해 가장 크게 달라진 점은
내가 작성한 코드가 실제 사용자에게 전달되는 과정을
구체적인 흐름으로 그릴 수 있게 되었다는 것이다.

이전에는 프론트엔드와 백엔드를 분리된 영역으로 인식했다면,
이제는 하나의 흐름 안에서 이해하게 되었다.

- React &rarr; S3 &rarr; CloudFront &rarr; 사용자

- React &rarr; API Gateway &rarr; Lambda &rarr; Database

이 구조를 머릿속에 그릴 수 있게 되면서,
성능 문제는 어디에서 발생할 수 있는지,
요청이 왜 실패하는지,
배포 이후 어떤 과정이 이어지는지를
더 넓은 관점에서 생각하게 되었다.

특히 "프론트엔드는 API를 사용하는 역할"이라는 인식에서 벗어나,
서비스 구조 전체를 이해해야 한다는 필요성을 느끼게 된 점이 가장 큰 변화였다.

## 6. 결론

이 책은 AWS를 깊이 있게 다루기보다는
전체 구조를 이해하는 데 초점을 맞춘 입문서에 가깝다.

하지만 프론트엔드 개발자의 입장에서 보면,
이 책은 단순한 인프라 설명서가 아니라
내가 작성한 코드가 어떤 과정을 거쳐 사용자에게 전달되는지를 이해하게 해주는 출발점이었다.

실무 경험이 쌓일수록
코드 바깥의 영역을 이해하는 것이 중요해지는데,
이 책은 그 첫 단계를 만드는 데 충분한 역할을 한다고 생각한다.', '그림으로 이해하는 AWS 구조와 기술 서평1. 서론프론트엔드 개발자로 실무를 경험하면서 가장 크게 느낀 점 중 하나는,“나는 화면을 만들고 있지만, 서비스 전체 구조는 잘 모른다”는 한계였다. React 기반으로 UI를 구현하고 API를 호출하는 작업에는 익숙해졌지만,그 API가 어디에서 실행되고, 정적 파일이 어떻게 사', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-30/50aeace4d73a350a.jpg', '2026-04-30T21:14:19+09:00', '2026-04-30T21:14:19+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_30';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_29', 'tistory-29', '거부기린 - 만 명의 사용자가 내 서비스를 이용해봤다고?', '## 1. 인트로

며칠 전 aaru라는 해외 스타트업에 대한 글을 봤다.

이 회사는 가상의 페르소나 수천 명을 만들어서 실제 세계의 현상을 예측한다. 선거 결과, 제품 반응, 여론 동향까지. 실제 사람을 인터뷰하지 않고도 꽤 높은 정확도로 맞춘다는 얘기였다.

"가상의 사람한테 물어보면 진짜랑 비슷하게 나온다고?"

반신반의하면서도 흥미로웠다. 그러던 중 허깅페이스에서 엔비디아가 만든 한국인 페르소나 데이터셋을 발견했다. 이름은 Nemotron-Personas-Korea. 한국인 100만 명 분량의 가상 프로필인데, 연령, 성별, 직업, 거주지, 자기소개까지 딸려 있었다.

이걸로 내가 만드는 서비스에 대한 가상 사용자 인터뷰를 해볼 수 있지 않을까?

**그래서 해봤다. 1만 명한테 물어봤다. 내 컴퓨터 안에서.

## 2. "그래서 뭘 해봤는데?"

한 줄로 요약하면 이렇다.
엔비디아가 만든 한국인 가상 인물 1만 명한테, 내 서비스 써볼래요? 라고 물어봤다.

테스트한 서비스는 내가 개발 중인 거부기린. 웹캠으로 실시간 거북목과 자세를 분석해주는 데스크톱 앱이다. 장시간 PC를 쓰는 직장인, 개발자, 디자이너가 주 타겟이다.

방법은 단순하다. 페르소나 데이터셋에서 1만 명을 샘플링하고, 각 사람의 연령·성별·직업·거주지 정보를 LLM에게 넘긴다. 그리고 이렇게 물었다.

> 
"당신은 34세 여성, 충남 아산에 사는 구직자입니다. 이 서비스를 알게 된다면, 설치해서 계속 쓸 의향이 있으세요? 확률을 0~100%로 알려주세요."

LLM은 그 사람의 입장에서 가입 확률과 이유를 판단해 답한다. 실제 설문조사라면 수천만 원에 몇 주가 걸릴 일이다. 이건 내 방에서 몇 시간이면 됐다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/26f71a4c5bd1bce4.png)

어떻게 돌렸는지부터 얘기해보자.

## 3. 어떻게 돌렸나

### 3-1. 환경 세팅

내 맥에 Ollama를 깔고, Qwen3 32B 모델을 돌렸다. 32B면 꽤 큰 편인데, RAM이 충분해서 로컬에서 돌릴 수 있었다.
왜 로컬이냐고? 1만 건을 GPT-4 같은 API로 돌리면 몇십만 원은 쉽게 나온다. 로컬은 전기세만 나온다.

Ollama는 로컬에서 LLM을 돌릴 수 있게 해주는 도구다. 터미널에서 ollama run qwen3:32b 한 줄이면 모델이 뜬다. ollama serve를 띄워두면 [http://localhost:11434로]() HTTP 요청을 날릴 수 있다.

Qwen3를 고른 이유는 단순했다. 32B 파라미터 모델 중에서 한국어 이해도가 가장 높았다. Llama 계열도 돌려봤는데, 직업이나 거주지 같은 컨텍스트를 종합해서 판단하는 건 Qwen3가 나았다. 70B 이상 모델이 더 정교하겠지만, 내 맥북 RAM으로는 32B가 한계였다.

처리는 Python + asyncio로 비동기 병렬로 돌렸다. 동시에 4개씩 요청을 날려서 1만 건을 몇 시간 만에 끝냈다. 동시성을 4로 잡은 건 그 이상으로 올리면 응답 시간이 급격히 늘어났기 때문이다.

1만 개의 태스크를 asyncio.gather로 한 번에 돌리되, 세마포어로 동시 실행 수를 4개로 제한하는 방식이다. 각 요청이 평균 3~5초 걸리니까 전체 처리 시간은 이론상 약 2.7시간. 실제로는 3시간 조금 넘게 걸렸다.

결과는 JSON으로 저장하고 나중에 pandas로 분석했다. 타임아웃 나면 재시도, 파싱 실패하면 fallback으로 처리하는 에러 핸들링도 넣었는데, 실제로는 에러가 한 건도 안 나왔다. 1만 건 전원 유효 응답. 이건 좀 놀라웠다.

### 3-2. 데이터셋: Nemotron-Personas-Korea

엔비디아가 허깅페이스에 공개한 한국인 가상 페르소나 데이터셋이다. 총 100만 건이 넘고, 누구나 다운로드할 수 있다.
각 페르소나에는 연령·성별·직업, 거주지(시/도 + 구/군), 학력·혼인 상태·거주 형태, 그리고 한두 줄짜리 자기소개 요약이 들어있다.

예를 들면 이런 식이다:

"조향순 씨는 대구 달서구에서 평생 살림을 일궈온 정 많은 주부로, 산행과 TV 시청으로 소소한 행복을 찾으며 가족과 이웃의 조화를 소중히 여기는 분입니다."

실제 한국 인구 분포를 반영해서 만들었다고 한다. 연령대, 성비, 지역별 인구 비율을 통계청 자료 기반으로 구성했다는 얘기다.

1만 건 샘플링은 단순 랜덤 추출로 했다. 층화 추출을 써서 연령대별로 균등하게 맞출 수도 있었는데, 1만 건이면 충분히 큰 샘플이라 그냥 무작위로 뽑았다. 실제 결과를 보니 20대 1,424명, 30대 1,488명, 40대 1,770명, 50대 2,001명, 60대 1,778명, 70대+ 1,539명으로 고르게 분포했다.

직업 분포에서 눈에 띄는 게 있었다. 무직·구직이 3,871명, 38.7%였다. 통계청 기준 비경제활동인구 비율(학생·주부·은퇴자 포함)이 약 40%인 걸 감안하면 비슷한 맥락이다. 어쨌든 이 비율이 전체 평균 확률을 끌어내리는 방향으로 작용했을 건 분명하다.

### 3-3. 프롬프트는 이렇게 줬다

페르소나 정보와 서비스 설명을 하나로 합쳐서 LLM에게 던지는 구조다.

```
당신은 다음 페르소나의 관점에서 생각하는 시뮬레이터입니다.

## 페르소나 정보
- 성별: 여자
- 나이: 34세
- 직업: 전직 일반 비서, 현재 구직중
- 거주지: 충청남도 아산시
- 학력: 4년제 대학교
- 페르소나 요약: "이미란 씨는 공학적 전문성과 비서의 유연함을 겸비한 34세 구직자로..."

## 서비스 설명
「거부기린」은 웹캠으로 사용자의 실시간 거북목과 자세 변화를 분석하고...

## 질문
이 페르소나가 이 서비스를 설치 및 지속 사용할 확률을 0~100 사이의 정수로
평가하고, 그 이유를 2~3문장으로 설명하세요.

## 출력 형식 (반드시 준수)
PROBABILITY: 
REASON: 
```

설계에서 신경 쓴 부분이 몇 가지 있다.

"시뮬레이터"라는 역할 부여가 핵심이었다. 역할 없이 돌렸을 때는 LLM이 자기 관점에서 서비스를 평가하는 경향이 있었다. "이 서비스는 유용해 보입니다" 같은 일반론. 역할을 부여하니 "이 페르소나는 PC를 주업무로 안 쓰니까 필요성을 못 느낄 것 같다"는 식으로, 그 사람의 상황에서 판단하는 흔적이 보였다.

서비스 설명에는 "혁신적인", "최고의" 같은 수식어를 뺐다. 칭찬을 넣으면 확률이 올라가니까. 그래도 완전한 중립은 불가능하다. 서비스를 설명하는 것 자체가 이미 긍정적인 프레이밍이다. 이 한계는 뒤에서 다시 얘기하겠다.

출력 형식은 강제했다. PROBABILITY: 와 REASON: 형식으로만 답하게 했다. 자유 형식으로 받으면 "확률은 약 70% 정도", "열에 일곱", "쓸 것 같기도 하고 안 쓸 것 같기도 하고" 같은 걸 다 파싱해야 한다. 출력 형식 고정은 LLM 실험에서 기본 중의 기본이다.

## 4. 돌려보니 - 결과

### 4-1. 전체 요약

먼저 전체 숫자부터.

- 1만 명 전원** 유효 응답. 에러 0건, fallback 0건.

- 평균 가입 확률: **51.9%**, 중앙값: **45%**

- 표준편차: **22.2%**

- 최솟값: **10%**, 최댓값: **85%**

-

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/0046a8d8661cc478.png)

평균이 51.9%면 "절반 정도가 써보겠다"는 얘기다. 근데 중앙값이 45%라는 게 중요하다. 평균이 중앙값보다 높다는 건, 확률을 높게 준 소수의 응답이 평균을 끌어올렸다는 뜻이다. 분포가 정규분포가 아니라 살짝 오른쪽으로 치우쳐 있다.

표준편차 22.2%도 눈여겨볼 만하다. 50% &plusmn; 22%면 응답이 28%부터 72%까지 꽤 넓게 퍼져 있다. 페르소나마다 반응이 달랐다는 거다. 모두가 비슷하게 50%를 줬다면 표준편차가 5~10% 정도일 텐데, 22%면 페르소나의 특성(연령, 직업 등)이 확률에 큰 영향을 미쳤다는 뜻이다.

최솟값이 10%고 최댓값이 85%라는 것도 흥미롭다. 0%나 100%가 하나도 없었다. Qwen3가 극단적인 값을 피하는 경향이 있는 건지, 아니면 프롬프트 구조상 극단적 판단이 어려운 건지는 모르겠다. 어쨌든 10~85% 범위 안에서 페르소나별로 의미 있는 분산이 있었다.

이제 쪼개서 보자.

### 4-2. 연령대별: 확 드러나는 패턴

연령대 
 샘플 수 
 평균 가입 확률 
 중앙값 
 
 
 
 
 20대 
 1,424명 
 **72.5%** 
 75% 
 
 
 30대 
 1,488명 
 **72.2%** 
 75% 
 
 
 40대 
 1,770명 
 **63.4%** 
 65% 
 
 
 50대 
 2,001명 
 **48.2%** 
 40% 
 
 
 60대 
 1,778명 
 **34.2%** 
 30% 
 
 
 70대+ 
 1,539명 
 **25.3%** 
 20%

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/3c969e5fc69ea326.png)

연령이 낮을수록 가입 의향이 높다. 2030은 70%대, 40대까지는 60%대를 유지한다. 50대가 분기점이다. 40대 63.4%에서 50대 48.2%로 15%p가 떨어진다. 60대는 34.2%까지 내려간다.

거부기린이 PC 기반 서비스라는 점과 맞아떨어지는 패턴이다. 2030은 하루 종일 노트북 앞에 앉아있는 세대다. 코딩하고, 문서 쓰고, 유튜브 보고. 이들한테 거북목은 일상이고 자세 교정은 늘 미루는 숙제다. 60대 이상은 스마트폰은 쓰지만 데스크톱 앱은 익숙하지 않다. 거북목 문제는 있어도 PC 앱 설치 자체가 장벽이다.

마케팅 전략에 직접적인 시사점이 있다. 50대 미만을 1차 타겟으로 잡고, 50대 이상은 2차로 접근하는 게 합리적이다.

### 4-3. 직업별: 직업이 서비스 수요를 말해준다

직업 
 샘플 수 
 평균 가입 확률 
 
 
 
 
 IT/기술직 
 339명 
 **75.6%** 
 
 
 경영진/관리자 
 128명 
 **72.8%** 
 
 
 사무직 
 1,136명 
 **70.7%** 
 
 
 의료/보건 
 131명 
 **66.1%** 
 
 
 교육 
 201명 
 **64.8%** 
 
 
 영업/판매 
 510명 
 **60.9%** 
 
 
 기타 
 3,204명 
 **53.0%** 
 
 
 요식업 
 197명 
 **45.6%** 
 
 
 무직/구직 
 3,871명 
 **41.7%** 
 
 
 운송/물류 
 283명 
 **38.3%**

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/ea1970aa848bb576.png)

IT/기술직이 75.6%로 1위다. 하루 종일 모니터 앞에 있는 직업이니 당연하다. 거북목은 직업병이나 다름없고, 거부기린 같은 서비스에 즉각적으로 반응할 가능성이 높다.

경영진, 사무직도 70%대. LLM의 응답을 보니 경영진은 "건강 관리에 대한 관심"을 이유로 드는 경우가 많았다. 시니어 관리자일수록 건강을 챙기려는 의지가 강하다고 판단한 것 같다.

의료/보건이 66.1%로 꽤 높다. 병원에서 PC를 쓰는 시간이 생각보다 길다. EMR 입력, 영상 판독, 연구 논문 작업. 건강 분야에 대한 관심 자체가 높으니 자세 관리 앱에도 열린 태도를 보이는 거다.

운송/물류는 38.3%, 무직/구직은 41.7%. PC를 주업무 도구로 쓰지 않으면 확률이 낮다. 흥미로운 건 직업이 연령보다 더 강한 변수일 수 있다는 점이다. 40대 사무직은 70%대지만 40대 요식업은 40%대다. 같은 연령이라도 직업에 따라 30%p 가까이 벌어진다. "3040 직장인"보다 "데스크 워커"라는 기준이 더 정확할 수 있다.

### 4-4. 성별: 남녀 차이는 있을까?

- 남성 **54.8%** vs 여성 **49.0%**

- 차이는 약 **5.8%p**

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/d492aff74b307251.png)

차이가 있긴 한데, 연령이나 직업만큼 크지 않다. 데이터셋에서 남성의 IT/기술직 비율이 여성보다 높을 수 있고, 그게 전체 남성 평균을 끌어올렸을 가능성이 있다. 아니면 LLM의 편향일 수도 있다. 학습 데이터에 "남성이 기술 앱을 더 많이 쓴다"는 경향이 반영되어 있을 가능성이다.

5.8%p 차이로 성별 마케팅 전략을 다르게 가져갈 필요는 없다.

### 4-5. 지역별: 수도권 vs 지방

지역 
 샘플 수 
 평균 가입 확률 
 
 
 
 
 서울 
 2,578명 
 **55.9%** 
 
 
 경기 
 (위와 동일 집계) 
 **53.4%** 
 
 
 인천 
 - 
 **52.4%** 
 
 
 대구 
 - 
 **51.9%** 
 
 
 부산 
 - 
 **49.8%** 
 
 
 충남 
 - 
 **49.3%** 
 
 
 경남 
 - 
 **49.2%** 
 
 
 경북 
 - 
 **47.5%** 
 
 
 전북 
 - 
 **47.1%** 
 
 
 전남 
 - 
 **43.0%**

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/72e76a20733aa168.png)

수도권이 지방보다 6~10%p 높다. 서울 55.9%, 전남 43.0%으로 12.9%p 차이다. 수도권일수록 사무직 비율이 높고 IT 기업이 밀집해 있다. 장시간 PC를 쓰는 환경이 많으니 수요도 높다.

다만 수도권 확률이 높은 게 지역 특성 때문인지, 수도권에 젊은 사무직이 많아서인지는 교차 분석이 필요하다. 이번에는 거기까지 들어가지 않았다.

### 4-6. LLM이 쓴 가입 사유 예시

숫자만 보면 재미없다. 실제 LLM이 뭐라고 답했는지 보자.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-29/5b24bd75021a8ee2.png)

**20세 여성 / 전자제품 개발 기술자 / 울산 - 75%**

> 
오윤주 씨는 장시간 컴퓨터 앞에서 일하는 전자제품 개발 기술자로, 거북목 예방에 관심이 있을 가능성이 높습니다. 또한 데이터가 외부로 전송되지 않는 온디바이스 방식이 내향적인 성향의 페르소나에게 큰 장점으로 작용할 것입니다.

온디바이스 방식을 프라이버시 장점으로 연결 지은 게 흥미로웠다. 서비스 설명에 적어놨는데 페르소나의 성향과 연결 지어서 판단했다.

**35세 여성 / 경리 사무원 / 대전 - 75%**

> 
황누리 씨는 장시간 PC를 사용하는 경리 사무원으로, 거북목에 대한 위험을 인지하고 있을 가능성이 높다. 온디바이스 방식의 보안성과 간단한 피드백 방식은 부담 없이 지속 사용할 수 있는 요소가 될 것이다.

**40세 남성 / 전기 용접원 / 울산 - 45%**

> 
김정우 씨는 장시간 자세를 고정하는 작업을 하기 때문에 자세 관리에 관심이 있을 수 있으나, PC를 주업무 도구로 사용하지 않아 앱 사용 확률은 낮다. 다만 건강 관리에 대한 인식이 높다면 설치 후 꾸준히 사용할 가능성은 있다.

용접원도 자세 고정 문제가 있다. 하지만 PC 기반 서비스라는 점에서 매칭이 안 된다. "자세 관심은 있지만 이 서비스와는 안 맞는다"는 뉘앙스를 정확히 잡았다.

**62세 여성 / 무직 / 대구 - 30%**

> 
조향순 씨는 PC 사용에 익숙하지 않을뿐더러, 거북목이나 자세 관리에 대한 인식이 낮아 이 서비스의 필요성을 잘 느끼지 못할 가능성이 높습니다. 복잡한 설정이나 기술적인 앱 사용은 부담스러워할 수 있습니다.

나이, 직업, 거주지를 종합해서 "PC 친숙도 낮음, 기술적 장벽"을 도출했다. 30%라는 낮은 확률과 그 이유가 합리적으로 연결된다.

읽어보면 꽤 그럴듯하다. 직업과 PC 사용 시간의 관계, 프라이버시 민감도, 기술적 익숙함 같은 요소를 자연스럽게 엮어서 설명한다. 물론 이게 실제 사람의 반응과 같다고 할 수는 없다.

## 5. 이걸 믿어도 되나?

결과가 직관과 잘 맞아떨어졌다. 2030 IT 직장인이 가장 높고, 70대 무직이 가장 낮다. "당연한 거 아니야?"라고 할 수도 있다.

그게 포인트다. 당연한 결과가 나왔다는 것 자체가 이 방식의 검증이다. 엉뚱한 결과가 나왔다면 LLM이 페르소나를 제대로 이해하지 못한 거겠지만, 일관된 패턴이 나온 건 적어도 "방향은 맞다"는 걸 보여준다.

실험에서 건진 인사이트를 정리하면 이렇다.

1차 타겟은 2030 데스크 워커다. 20대 72.5%, 30대 72.2%, IT/기술직 75.6%, 사무직 70.7%. 연령과 직업을 교차하면 "2030 IT/사무직"이 가장 반응이 좋은 세그먼트라는 게 명확하다.

50대부터 반응이 급격히 떨어진다. 40대에서 50대로 갈 때 15%p가 한 번에 떨어진다. 50대 이상 사용자를 포기하라는 게 아니라, 초기 리소스는 50대 미만에 집중하는 게 효율적이라는 얘기다.

직업이 연령보다 더 강한 변수일 수 있다. 40대 사무직(70%대) vs 40대 자영업(40%대)처럼, 같은 연령이라도 직업에 따라 차이가 크다. 링크드인 광고나 직업 커뮤니티 타겟팅이 단순 연령 타겟팅보다 효과적일 수 있다.

### 한계

물론 한계도 명확하다.

LLM이 만든 예측이지 실제 사람의 반응이 아니다. 진짜 34세 구직자가 내 서비스를 본다면 75%가 아니라 0%일 수도 있다. "관심 있다"고 클릭하는 것과 "실제로 설치하고 매일 쓰는" 건 완전히 다른 차원의 행동이다. LLM은 페르소나의 텍스트 정보를 바탕으로 합리적으로 추론한 것뿐이다.

페르소나 데이터 자체가 가상이다. 엔비디아가 한국 인구 분포를 반영해서 만들었다고는 하지만, 여전히 LLM이 생성한 데이터다. 특히 무직/구직이 38.7%를 차지한 건 실제보다 높을 가능성이 크다. 이게 전체 평균(51.9%)을 낮추는 방향으로 작용했을 거다.

프롬프트에 따라 결과가 달라진다. 서비스 설명을 조금만 바꿔도 확률 분포가 움직인다. "무료"라는 단어를 넣으면 전체적으로 확률이 올라갈 게 뻔하다. 최대한 중립적으로 서비스를 설명하려고 했지만, 완전한 객관성은 불가능하다.

LLM 모델 자체의 편향. Qwen3 32B가 한국인의 행동을 얼마나 잘 시뮬레이션하는지는 검증되지 않았다. 학습 데이터에 "노년층은 기술에 익숙하지 않다"는 스테레오타입이 과반영되어 있다면, 결과도 그 편향을 반영했을 거다.

## 6. 마무리

1만 명한테 "우리 서비스 어때요?" 물어봤다. 비용은 0원, 소요 시간은 몇 시간.

결과는 직관과 합쳤다. 2030 IT 직장인이 가장 반응이 좋고, 60대 이상은 낮다. 직업이 연령만큼 중요한 변수다. 수도권이 지방보다 반응이 좋다. 서비스 런칭 전 타겟 고객 설정과 초기 마케팅 방향을 잡는 데 실질적인 참고가 된다.

물론 이게 실제 사용자 조사를 대체할 수는 없다. 진짜 사용자 인터뷰, 베타 테스트, A/B 테스트는 여전히 필수다. 하지만 그 전에 방향을 잡는 첫 번째 스텝으로는 쓸만하다. 0원에 1만 명 인터뷰를 해볼 수 있다는 건, 리소스가 부족한 개인 개발자나 소규모 스타트업에게 특히 유용하다.

이 방식의 또 다른 장점은 반복이 쉽다는 거다. 프롬프트를 수정하면 다시 돌릴 수 있고, 서비스 설명을 바꾸면 어떤 메시지가 더 효과적인지 시뮬레이션할 수 있다. 실제 설문조사에서는 설문지 하나 바꾸는 것도 일인데, 여기선 프롬프트 몇 줄 수정이면 된다.

다음엔 랜딩 페이지 두 개 버전을 페르소나 1만 명에게 보여주고 어느 쪽을 더 클릭할지 예측해보는 실험도 해보고 싶다. "무료로 시작하세요" vs "거북목, 이제 그만" - 어떤 카피가 더 반응이 좋을지.', '1. 인트로며칠 전 aaru라는 해외 스타트업에 대한 글을 봤다. 이 회사는 가상의 페르소나 수천 명을 만들어서 실제 세계의 현상을 예측한다. 선거 결과, 제품 반응, 여론 동향까지. 실제 사람을 인터뷰하지 않고도 꽤 높은 정확도로 맞춘다는 얘기였다. "가상의 사람한테 물어보면 진짜랑 비슷하게 나온다고?"반신반의하면서도 ', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-29/26f71a4c5bd1bce4.png', '2026-04-29T13:41:50+09:00', '2026-04-29T13:41:50+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_29';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_28', 'tistory-28', 'GGUF, MLX 그게 뭔데..?', '![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-28/f4597e8ee5b817e1.png)

현재 다니는 회사에서는 프론트엔드를 담당하고 있다.**회식 자리에서 AI에 관심 있다고 말했다가,
사내 AI 에이전트 개발을 맡게 됐다.

하려는 것은 다음과 같다.

- 맥을 병렬로 연결한다.(한 컴퓨터에서 도커를 여러개 띄우는 것처럼)

- 이 맥들을 LiteLLM을 통해 라우팅 하며 관리한다.

근데 사실 나는 ai 에이전트, 하네스와 같은 것에 관심이 있던거지 인프라에는 관심이 그렇게 많지 않았어서 당혹스러웠다.

맥 스튜디오 128GB 짜리를 지급 받고 개발을 시작하려던 도중에 MLX와 GGUF라는 것에 대해서 알게 되었고, 이 차이를 명확하게 이해해보기 위해 글을 써보려고 한다.

## 1. 들어가며

휴대폰에서 돌릴 수 있는 Gemma4, 양자화등 로컬 환경에서 LLM을 돌리기 위한 노력들은 국내외를 가리지 않고 점점 늘어나고 있다. 하지만 초기에는 이를 일반 사용자의 로컬에서 직접 실행하는 과정이 쉽지는 않았다. 고성능 GPU가 필요하고, 초기 세팅이 힘들었기 때문이다.

이러한 문제들을 해결하기 위해 등장한 것이 바로 GGUF와 MLX이다.

이 두 기술은 같은 문제를 해결하려 하지만, 방식이 다르다.

먼저 GGUF**는 로컬 LLM을 더 많은 사람들이 쉽게 사용할 수 있도록 하기 위해 등장했다. CPU 환경에서도 실행이 가능하도록 경량화하고, 모델을 하나의 파일로 통합해 배포함으로써 설치와 실행 과정을 단순화했다. 즉, 누구나 손쉽게 로컬에서 AI를 활용할 수 있도록 만든 ''범용 실행 방식''이라고 볼 수 있다.

반면 **MLX**는 Apple이 자사의 실리콘 칩(M1, M2, M3 등)에 최적화된 머신러닝 환경을 제공하기 위해 개발한 프레임워크다. 기존 방식으로는 Apple Silicon의 구조적 장점을 충분히 활용하기 어려웠기 때문에, CPU와 GPU, 그리고 통합 메모리를 효율적으로 사용하는 새로운 접근이 필요했다. MLX는 이러한 한계를 해결하고, Mac 환경에서 LLM 성능을 극대화하는 데 초점을 맞추고 있다.

## 2. GGUF vs MLX 한눈에 보기

GGUF와 MLX는 로컬 환경에서 AI 모델을 실행할 때 자주 등장하는 개념이다. 처음 보면 둘 다 "모델 관련 기술"처럼 보이지만, 실제로는 역할이 다르다.

핵심부터 정리하면 이렇다.

> 
GGUF는 모델을 저장하는 방식이고,**MLX는 모델을 실행하는 방식이다.

이 차이를 이해하면 이후 내용이 훨씬 쉽게 들어온다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-28/e77c2b260b009ce3.png)

### GGUF: 모델을 담는 포맷

GGUF는 AI 모델을 하나의 파일로 정리한 저장 형식**이다.**이 파일 안에는 단순히 모델 데이터만 있는 게 아니라, 실행에 필요한 정보들이 함께 들어 있다.

예를 들면:

- 모델 가중치

- 토크나이저

- 설정 정보

그래서 GGUF 파일을 다운로드하면
-> 바로 실행 가능한 상태에 가깝다.

Ollama나 LM Studio 같은 프로그램에서 불러오기만 하면 되기 때문에,
설치 과정이 단순하고 접근성이 좋다.

### MLX: 모델을 실행하는 프레임워크

MLX는 모델을 저장하는 형식이 아니라,
모델을 실제로 계산하고 실행하는 프레임워크**다.

Apple이 만든 기술로,**Mac의 M1/M2/M3 칩 구조에 맞춰 최적화되어 있다.

MLX는 단순히 모델을 돌리는 수준을 넘어서,

- CPU와 GPU를 함께 활용하고

- 메모리 이동을 줄이고

- 전체 연산을 효율적으로 처리하는 데 집중한다

즉, 같은 모델이라도
-> 더 빠르고 효율적으로 실행하는 데 목적이 있다.

### 두 방식의 구조적 차이

정리하면 이렇게 나뉜다.

- GGUF &rarr; 모델을 쉽게 배포하고 실행하기 위한 방식

- MLX &rarr; 모델을 빠르게 계산하기 위한 실행 환경

둘은 경쟁 관계라기보다는
-> 서로 다른 문제를 해결하는 방식에 가깝다.

## 3. GGUF란 무엇인가

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-28/8c488103d6d18dc5.png)

GGUF는 로컬에서 AI 모델을 실행할 때 널리 사용되는 모델 파일 형식**이다.**특히 llama.cpp 기반 생태계에서 표준처럼 자리 잡은 포맷이다.

조금 더 쉽게 말하면,

-> "AI 모델을 실행하기 좋게 정리해놓은 파일"** 이라고 보면 된다.

### GGUF의 등장 배경

초기에는 AI 모델을 로컬에서 실행하는 과정이 꽤 번거로웠다.

- 여러 개의 파일을 따로 받아야 했고

- 환경 설정도 복잡했으며

- GPU가 없으면 실행 자체가 어려운 경우도 많았다

이런 불편함을 줄이기 위해 등장한 것이 GGUF다.

GGUF는 모델을 하나의 파일로 묶고,**CPU 환경에서도 실행할 수 있도록 경량화하는 데 초점을 맞췄다.

덕분에 지금은
-> 일반 사용자도 비교적 쉽게 로컬 AI를 실행할 수 있는 환경**이 만들어졌다.

### 주요 특징

GGUF의 가장 큰 특징은 "간단함"이다.

- 모델, 토크나이저, 설정을 하나의 파일에 포함

- llama.cpp 기반으로 다양한 환경에서 실행 가능

- CPU에서도 동작하도록 최적화

- 양자화(quantization)를 통해 파일 크기와 메모리 사용량 감소

특히 양자화 덕분에
-> 고성능 GPU 없이도 모델을 실행할 수 있다는 점이 중요하다.

### 장점

GGUF는 접근성이 매우 좋다.

- Windows, Linux, Mac 모두에서 사용 가능

- 설치와 실행이 단순함

- Ollama, LM Studio 등 다양한 도구와 호환

- 커뮤니티와 모델 자료가 풍부함

그래서 로컬 LLM을 처음 접하는 경우라면
-> 대부분 GGUF부터 시작하게 된다.

### 한계

물론 단점도 있다.

- GPU 성능을 100% 활용하기는 어려움

- Apple Silicon 같은 특정 하드웨어 최적화는 제한적

- 초고성능이 필요한 작업에서는 한계가 있음

-> "쉽게 쓸 수 있는 대신, 성능은 어느 정도 타협한 방식"이다.

## 4. MLX란 무엇인가

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-28/fe0ba07abe2a58e0.png)

MLX는 Apple이 만든 머신러닝 프레임워크로,
Mac 환경에서 AI 모델을 효율적으로 실행하기 위해 개발된 기술이다.

GGUF가 모델을 담는 파일 형식이라면,
MLX는 모델을 실제로 계산하고 실행하는 엔진에 가깝다.

### MLX의 등장 배경

Apple Silicon(M1, M2, M3)이 등장하면서
Mac의 하드웨어 구조는 기존 PC와 다른 방향으로 발전했다.

- CPU와 GPU가 하나의 칩에 통합되어 있고

- 메모리를 함께 사용하는 unified memory 구조를 가지고 있다

문제는 기존 머신러닝 프레임워크들이
이 구조를 충분히 활용하지 못했다는 점이다.

그래서 Apple은 자사 하드웨어에 맞게
AI 연산을 더 효율적으로 처리할 수 있는 MLX를 만들었다.

### 주요 특징

MLX는 성능 최적화에 초점이 맞춰져 있다.

- Apple Silicon에 맞춘 연산 최적화

- CPU와 GPU를 동시에 활용

- unified memory 구조 활용 &rarr; 데이터 복사 최소화

- Python 기반 &rarr; 비교적 간단한 사용 가능

이 덕분에 같은 모델이라도
&rarr; Mac에서는 더 빠르게 실행되는 경우가 많다.

### 장점

MLX의 가장 큰 장점은 성능이다.

- Mac에서 높은 처리 속도

- 메모리 효율이 좋아 대형 모델 실행에 유리

- 하드웨어 자원을 최대한 활용 가능

특히 M1/M2/M3 환경에서는
&rarr; 체감 성능 차이가 크게 느껴질 수 있다.

### 한계

다만 사용 환경이 제한적이다.

- Mac(Apple Silicon)에서만 사용 가능

- GGUF에 비해 생태계가 작음

- 설정이나 사용 방식이 초보자에게는 다소 어렵게 느껴질 수 있음

&rarr; 특정 환경에서는 강력하지만 범용성은 낮다.

### 정리

MLX는 Apple Silicon 환경에서
AI 모델의 성능을 최대한 끌어내기 위해 만들어진 프레임워크다.

GGUF가 접근성을 높였다면
MLX는 성능을 끌어올리는 역할을 한다.

## 5. 구조 및 성능 차이

앞에서 각각의 개념을 살펴봤다면,
이제 GGUF와 MLX의 차이를 구조와 성능 관점에서 정리해볼 수 있다.

두 방식은 같은 모델을 실행한다는 점에서는 같지만,
실제 동작 방식과 성능 특성은 꽤 다르다.

### 실행 방식 차이

가장 큰 차이는 역할에서 시작된다.

- GGUF &rarr; 모델을 저장하고 불러오는 포맷

- MLX &rarr; 모델을 계산하고 실행하는 프레임워크

GGUF는 파일 하나로 모델을 쉽게 배포하고 실행할 수 있도록 설계되어 있다.
반면 MLX는 해당 모델을 어떤 방식으로 계산할지에 더 집중한다.

즉,
&rarr; GGUF는 "어떻게 쉽게 실행할 것인가"
&rarr; MLX는 "어떻게 효율적으로 계산할 것인가"

이 차이가 이후 성능 차이로 이어진다.

### 메모리 활용 방식

두 방식의 차이는 메모리 처리 방식에서도 드러난다.

GGUF는 다양한 환경에서 동작하도록 설계된 만큼
일반적인 CPU 기반 메모리 구조를 따른다.
이 과정에서 CPU와 GPU 간 데이터 이동이 발생할 수 있다.

반면 MLX는 Apple Silicon의 unified memory 구조를 적극적으로 활용한다.

- CPU와 GPU가 같은 메모리를 공유

- 데이터 복사 과정 최소화

- 메모리 사용 효율 향상

이 구조 덕분에
&rarr; 불필요한 오버헤드가 줄어들고 실행 속도가 빨라진다.

### 실제 성능 및 환경별 차이

실제 체감 성능은 사용 환경에 따라 크게 달라진다.

- Windows / Linux 환경
&rarr; GGUF가 사실상 표준
&rarr; 안정적이고 충분한 성능 제공

- Mac (Apple Silicon) 환경
&rarr; MLX가 더 높은 성능을 보이는 경우가 많음
&rarr; 특히 대형 모델에서 차이가 커짐

같은 모델이라도
&rarr; Mac에서는 MLX가 더 빠르고
&rarr; 다른 환경에서는 GGUF가 더 현실적인 선택이 된다

실제로 Mac에서 동일한 모델을 GGUF와 MLX로 각각 실행해보면,
MLX 쪽이 더 빠르게 응답하는 경우가 많았다.

## 6. 결론

GGUF와 MLX는 같은 AI 모델을 실행하기 위한 기술이지만,
출발점과 목적이 다르다.

GGUF는 로컬 환경에서 AI를 더 쉽게 사용할 수 있도록 만든 포맷이다.
설치와 실행이 간단하고 다양한 환경에서 동작하기 때문에,
입문자나 일반 사용자에게 적합하다.

반면 MLX는 Apple Silicon 환경에서 성능을 최대한 끌어내기 위한 프레임워크다.
특정 하드웨어에 맞춰 최적화되어 있기 때문에,
Mac에서는 더 빠르고 효율적인 실행이 가능하다.

결국 선택 기준은 단순하다.

- Windows / Linux &rarr; GGUF

- Mac(M1/M2/M3)에서 성능 중요 &rarr; MLX

두 기술은 경쟁 관계라기보다,
서로 다른 문제를 해결하기 위한 접근 방식에 가깝다.

하나는 접근성을, 다른 하나는 성능을 중심에 두고 있다.

자신의 환경과 목적에 맞게 선택하면 된다.', '현재 다니는 회사에서는 프론트엔드를 담당하고 있다.회식 자리에서 AI에 관심 있다고 말했다가,사내 AI 에이전트 개발을 맡게 됐다.하려는 것은 다음과 같다.맥을 병렬로 연결한다.(한 컴퓨터에서 도커를 여러개 띄우는 것처럼)이 맥들을 LiteLLM을 통해 라우팅 하며 관리한다.근데 사실 나는 ai 에이전트, 하네스와 같은 ', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-28/f4597e8ee5b817e1.png', '2026-04-23T15:21:23+09:00', '2026-04-23T15:21:23+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_28';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_27', 'tistory-27', 'Electron 웹뷰 앱을 Tauri Native UI로 마이그레이션하기 1: 왜 지금 갈아타는가', '## 들어가며

거부기린은 개인적으로 애정이 가는 프로젝트다. 그래서 더 대충 넘기고 싶지 않았다.

"지금도 돌아가니까 유지하자"는 식으로 남겨두기보다, 실제로 쓰는 사람이 덜 답답하고 앞으로 유지보수하는 사람도 덜 고생하는 구조로 바꾸고 싶었다. 소프트웨어를 오래 운영하다 보면 초기에 가볍게 선택한 구조가 나중에는 로딩 속도, 화면 전환, 오류 대응, 테스트 난이도, 배포 리스크로 이어진다. 거부기린도 그런 시점에 와 있다고 느꼈다.

특히 이 앱은 장난감 프로젝트가 아니라 실제 업무에 쓰이는 도구라는 점이 컸다. 개발자 입장에서는 "조금 느리지만 참을 수 있는 정도"라고 넘길 수 있어도, 사용자는 매일 반복되는 작은 지연과 어색한 동작을 더 예민하게 느낀다.

클릭했을 때 바로 반응하지 않거나, 화면이 잠깐 멈춘 것처럼 보이거나, 특정 흐름이 네트워크 상태에 따라 흔들리는 일은 몇 번만 겪어도 피로가 쌓인다. 거부기린을 계속 쓸 만한 도구로 남겨두려면, 이 지점을 더 이상 미뤄두기 어렵다고 봤다.

기존 `src` 폴더에는 URL 기반 웹뷰를 띄우는 Electron 앱이 있고, 새로 만드는 `migration` 폴더에는 Tauri + React로 구성한 Native UI 앱이 들어간다. 겉으로 보면 런타임 교체처럼 보이지만 실제로는 그보다 범위가 크다.

레거시 화면과 흐름을 그대로 이해해야 하고, 웹뷰에 기대고 있던 구조를 화면 단위 컴포넌트와 상태 관리 구조로 다시 세워야 한다. 인증, 저장소, 라우팅 같은 중심축도 새 런타임에 맞게 정리해야 한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-27/882a0d0cebf5df82.png)

##

## 이 프로젝트는 무엇을 옮기는 작업인가

이번 작업은 `Electron + 웹뷰` 형태의 데스크톱 앱을 `Tauri + React` 기반의 Native UI 앱으로 옮기는 일이다. 다만 "옮긴다"는 표현만으로는 부족하다.

기존 화면을 그대로 복사해서 새 런타임에 얹는 수준으로 끝나는 일이 아니기 때문이다. 웹뷰 기반 앱과 Native UI 기반 앱은 겉으로 비슷해 보여도 중심이 되는 실행 방식이 다르다.

기존 구조에서 앱은 웹뷰를 통해 외부 URL을 감싸는 성격이 강하다. 앱 자체가 모든 것을 직접 렌더링하고 통제하는 구조라기보다, 외부에 존재하는 웹 흐름을 데스크톱 컨테이너 안에 가져오는 구조에 가깝다.

이 방식은 초기 진입 속도 면에서 꽤 실용적이다. 이미 존재하는 웹 시스템이 있고, 그것을 비교적 빠르게 데스크톱처럼 제공하고 싶을 때 유리하다. 하지만 시간이 지나고 요구사항이 늘어나면, 앱 내부에서 제어해야 할 것과 웹뷰 바깥에서 처리해야 할 것의 경계가 흐려지기 시작한다.

반면 새로 만들 `migration` 앱은 Tauri와 React를 기반으로 한다. 여기서 기대하는 변화는 단지 실행 파일이 가벼워지는 것만이 아니다.

라우팅, 화면 구성, 상태 전이, 사용자 입력, 인증 흐름, 저장소 사용, 테스트 전략을 앱 내부 모델로 다시 가져오는 것이 핵심이다. 거부기린을 웹뷰를 띄워주는 껍데기에서 벗어나게 하고, 앱 자체가 자기 구조를 갖도록 바꾸려는 작업에 가깝다.

이번 작업에는 세 가지 변화가 같이 들어 있다. 런타임이 Electron에서 Tauri로 바뀌고, UI를 그리는 방식이 URL 기반 웹뷰에서 React 컴포넌트 중심으로 옮겨간다. 동시에 상태와 화면 제어의 책임도 외부 웹 흐름 쪽에서 앱 내부로 넘어온다. 그래서 이 작업은 기술 이전보다는 구조를 다시 잡는 작업에 더 가깝다.

또 하나 덧붙이면, 이 프로젝트는 "새 앱을 아무 제약 없이 새로 만드는 작업"도 아니다. 이미 사용 중인 레거시 앱이 있고, 그 앱이 제공하던 경험을 최대한 유지해야 한다.

즉, 자유롭게 새 제품을 설계하는 일이 아니라, 현재 동작을 존중하면서 그 기반을 바꾸는 일이다. 그래서 더 어렵고, 그래서 거부기린의 현재 모습을 아는 사람이 기록을 남겨야 할 가치도 크다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-27/306a9e4505328765.png)

## 왜 기존 Electron 웹뷰 구조를 계속 확장하지 않았는가

Electron 자체를 부정적으로 보려는 의도는 없다. Electron은 웹 기술로 데스크톱 앱을 빠르게 만드는 데 강한 선택지다. 다만 어떤 기술이든 현재 프로젝트의 상태와 목표에 맞아야 한다. 이번 프로젝트에서는 Electron 웹뷰 구조를 계속 확장하는 방식이 점점 더 불편해졌다.

가장 먼저 체감한 건 무게감이었다. 여기서 말하는 무게감은 실행 파일 크기만 뜻하지 않는다. 앱을 띄울 때의 인상, 화면이 바뀔 때의 템포, 버튼을 눌렀을 때 반응이 돌아오는 느낌까지 포함한다.

거부기린을 실제로 쓰는 입장에서 보면, 앱이 조금만 버벅여도 그 인상이 오래 남는다. 사용자는 내부 구조를 모르기 때문에 체감되는 결과만으로 앱 전체를 판단한다.

그 다음으로는 웹뷰 중심 구조 자체의 한계가 있었다. 웹뷰는 결국 외부의 웹 리소스를 불러오고 그 위에 흐름을 올리는 형태이기 때문에, 앱 내부에서 세밀하게 제어하고 싶은 부분이 생길수록 답답해진다.

화면 전환을 더 자연스럽게 만들고 싶거나, 특정 사용자 상태에 따라 즉시 반응하는 UI를 구성하고 싶거나, 네이티브 앱다운 상호작용을 넣고 싶을 때 웹뷰는 생각보다 큰 제약으로 돌아온다. 초기에는 "이 정도면 충분하다"고 느꼈던 설계가, 시간이 지나면서 점점 경계선이 보이기 시작한 셈이다.

네트워크 의존성 문제도 컸다. 웹뷰가 외부 웹 시스템을 불러오는 이상, 네트워크 상태에 따라 사용자 경험이 흔들리는 구간이 생길 수밖에 없다. 물론 모든 앱이 어느 정도 네트워크를 쓴다. 다만 앱의 기본 동작과 화면 전개까지 네트워크 영향이 크게 느껴지는 구조는 데스크톱 앱으로서는 아쉬움이 남는다.

유지보수 관점에서도 부담이 커졌다. 웹뷰 중심 구조는 처음에는 빠르게 진입할 수 있지만, 시간이 지날수록 앱이 직접 책임지는 코드와 외부 웹 흐름이 섞이면서 변경 영향도를 읽기 어려워진다.

어떤 수정이 어디까지 번질지 예측하기 어려워지고, 테스트도 경계면에서 복잡해진다. 거부기린을 계속 손볼 생각이라면, 이 구조를 오래 끌고 가는 게 맞는지 다시 볼 수밖에 없었다.

그래서 이번에는 현재 구조를 조금씩 연장하는 방법보다, 이 시점에서 구조를 다시 세우는 쪽이 더 현실적이라고 봤다. 당장은 일이 커 보일 수 있어도, 나중에 더 큰 비용으로 돌아오기 전에 방향을 잡는 편이 낫다고 판단했다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-27/b09ebc4c0a216cf4.png)

## 왜 Tauri + React 기반 Native UI를 선택했는가

새 구조를 고민하면서 가장 먼저 세운 기준은 단순했다. 더 가볍고, 더 빠르고, 앱 내부 제어권을 더 많이 가져올 수 있어야 한다. 이 기준에서 Tauri는 꽤 잘 맞는 선택지였다. 데스크톱 앱 형태를 유지하면서도 기존보다 더 가볍게 구성할 수 있고, 프런트엔드 레이어는 익숙한 방식으로 가져갈 수 있다는 점이 컸다.

특히 이번 전환은 UI 구현을 Native UI 방향으로 옮기려는 목적이 분명했다. 그렇다면 중간 단계에서 "웹뷰는 그대로 두고 런타임만 조정하는 방식"보다는, 아예 앱의 중심 구조를 새롭게 세우는 편이 낫다고 봤다.

어차피 화면 단위로 다시 쪼개고 상태와 흐름을 정리해야 한다면, 그 시점에 런타임 역시 앞으로 더 맞는 방향으로 가져가는 것이 자연스럽다. 거부기린을 오래 가져갈 생각이면, 이번 전환이 임시 봉합으로 끝나면 안 된다고 생각했다.

React를 고른 이유도 같은 맥락이다. 마이그레이션은 결국 큰 덩어리를 한 번에 옮기는 작업이 아니라, 화면과 흐름을 작은 단위로 다시 나누어 옮기는 작업이다.

이때 컴포넌트 기반 UI 구조는 강한 장점을 가진다. 화면을 분해하고, 공통 요소를 추출하고, 상태를 주입하고, 테스트 가능한 단위로 쪼개는 데 유리하기 때문이다. 특히 기존 웹뷰 기반 구조에서 앱 내부 구조로 전환할 때는 "지금 이 화면이 어떤 책임을 갖는가"를 분리해 보는 일이 중요한데, React는 그런 사고방식과 잘 맞는다.

현재 `migration` 앱의 뼈대도 그 방향으로 구성되어 있다. React Router 7은 앱 내부 라우팅 구조를 분명하게 세우는 데 도움이 되고, Zustand는 클라이언트 상태를 비교적 단순한 형태로 관리하는 데 적합하다.

TanStack Query는 서버 상태와 캐싱, 요청 흐름을 정리하는 데 유용하고, i18next는 다국어 처리에 대한 확장성을 준다. 여기에 Tauri 2 런타임과 플러그인을 조합하면, 데스크톱 앱으로서 필요한 진입 정보, 환경 연동, 플랫폼별 처리도 점차 앱 내부로 끌어올 수 있다.

중요한 건 이 조합이 유행하는 스택이라서 고른 게 아니라는 점이다. 이번 프로젝트에서는 이 조합으로 무엇을 더 쉽게 통제할 수 있는지가 더 중요했다. 화면 전환은 누가 책임지는지, 인증 상태는 어디서 읽고 쓰는지, 저장소는 어떻게 테스트 가능한 구조로 분리할지 같은 질문에 조금 더 명확하게 답할 수 있어야 했다.

또 하나 마음에 들었던 점은, 이 구조가 점진적 마이그레이션에도 잘 맞는다는 것이다. 기존 앱 전체를 한 번에 뒤집기보다, 도메인 단위로 차근차근 옮겨 갈 수 있어야 한다.

라우팅부터 세우고, 인증을 정리하고, 저장소를 안정화하고, 공통 UI를 다시 구성하고, 실제 화면 단위로 이식하는 흐름이 가능해야 했다. 거부기린처럼 이미 돌아가고 있는 앱은 한 번에 갈아엎는 방식보다 이런 순서가 훨씬 현실적이다.

## 이번 마이그레이션에서 절대 바꾸지 않을 것

이번 마이그레이션에서 가장 강하게 지키고 싶은 원칙은 UI 스타일을 바꾸지 않는 것이다. 이 작업은 리디자인 프로젝트가 아니다. 구조를 고치는 일과 디자인을 손보는 일은 분리해 두는 편이 낫다고 봤다.

사용자가 이미 익숙하게 사용하는 화면이라면, 그 익숙함 자체가 중요한 자산이다. 버튼의 위치, 정보가 배치되는 방식, 화면 흐름, 시선이 움직이는 순서, 테이블과 폼의 밀도감처럼 겉보기엔 사소해 보이는 요소들이 실제 작업 효율과 직결된다.

개발자나 디자이너 입장에서는 "이참에 좀 더 현대적으로 바꾸자"는 유혹이 생길 수 있다. 하지만 거부기린 같은 업무 도구는 새로운 멋보다 기존 숙련도를 유지하는 편이 더 중요할 때가 많다. 특히 마이그레이션 초기에는 그 원칙이 훨씬 중요하다.

UI 스타일을 바꾸지 않는다는 말은 색상이나 폰트만 유지한다는 뜻이 아니다. 정보의 위치 관계, 입력 순서, 화면이 열리고 닫히는 방식, 한 번에 보여주는 정보량, 익숙해진 상호작용 패턴까지 가능한 한 그대로 두겠다는 뜻에 가깝다.

이 원칙은 기술적으로도 중요하다. 마이그레이션 과정에서 UI 스타일까지 바꾸기 시작하면, 문제가 생겼을 때 원인을 분리하기가 어려워진다. 특정 동작이 이상한 것이 구조 전환 때문인지, 아니면 UI 배치가 달라졌기 때문인지 금방 판단하기 어려워진다. 테스트 범위도 넓어지고 검증 비용도 커진다. 결국 변경 원인이 섞이기 시작하면 전환 자체의 안정성이 떨어진다. 그래서 이번에는 의도적으로 "같은 화면을 다른 기반 위에 올린다"는 태도를 유지하려고 한다.

물론 구현 방식이 달라지면 아주 미세한 차이는 생길 수 있다. 픽셀 단위로 완전히 같게 만드는 것이 늘 현실적이지는 않다. 그래도 이번 단계의 목표는 사용자가 낯설어하지 않게 만드는 데 있다.

## 이번 마이그레이션에서 반드시 바꿔야 할 것

반대로 반드시 바꿔야 하는 것도 분명하다. 가장 먼저 바꿔야 하는 것은 웹뷰에 묶여 있는 구조다. 지금 필요한 건 기존 웹 화면을 새 껍데기에 보여주는 일이 아니라, 화면 하나하나를 앱 내부의 UI 단위로 다시 세우는 일이다. 앱이 어떤 화면을 언제 보여줄지, 어떤 상태에서 어떤 액션이 가능한지, 라우팅은 어떻게 이동하는지, 오류가 났을 때 어디서 복구할지를 앱 자체가 설명할 수 있어야 한다.

상태 구조도 중요하다. 웹뷰 중심 구조에서는 상태의 출처가 흐려지기 쉽다. 어떤 값은 외부 웹 페이지가 들고 있고, 어떤 값은 로컬 스토리지에 있고, 어떤 값은 앱이 임시로 알고 있고, 어떤 값은 URL이나 세션에 숨어 있을 수 있다. 당장은 돌아가더라도 시간이 지나면 디버깅 난이도가 빠르게 올라간다.

인증과 저장소는 특히 중요한 축이다. 브라우저 `localStorage` 기반 저장소, 백엔드 인증 API, Tauri 딥링크 진입 정보 같은 요소는 작은 세부 구현처럼 보이지만, 실제로는 앱의 신뢰성과 직결된다.

인증 상태를 어디에 저장하고 어떻게 복원할지, 앱 재시작 시 어떤 정보를 기준으로 세션을 판단할지, 딥링크로 진입했을 때 어떤 순서로 화면과 상태를 세팅할지 같은 문제는 마이그레이션에서 절대 뒤로 미루기 어렵다. 이 부분이 흔들리면 거부기린 전체 경험이 쉽게 불안정해진다.

테스트 가능성도 꼭 바꿔야 하는 대상이다. 레거시 구조에서는 동작이 실행 환경과 강하게 묶여 있어 확인이 어려웠다면, 새 구조에서는 적어도 핵심 도메인 로직만큼은 테스트 가능한 형태로 분리되어야 한다. 마이그레이션은 회귀 위험을 피할 수 없기 때문에, 새로 만드는 것만큼 같은 동작을 보장하는 일도 중요하다.

이번에 반드시 바꿔야 하는 것은 화려한 기능이 아니라 책임의 위치다. 화면 책임, 상태 책임, 인증 책임, 저장소 책임, 테스트 책임을 더 분명하게 나누는 쪽이 이번 마이그레이션의 핵심에 가깝다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-27/d1347355889029be.png)

## ``

## `src`와 `migration`을 어떤 기준으로 대응시킬 것인가

이 프로젝트를 진행하면서 가장 경계하는 건 레거시를 충분히 읽기 전에 새 구조를 먼저 확정해 버리는 일이다. 새 기술을 보고 있으면 사람은 쉽게 "이 구조면 더 깔끔하겠다"는 생각을 하게 된다. 그런데 마이그레이션에서는 그 생각이 오히려 위험할 수 있다. 레거시 코드는 보기엔 낡아 보여도, 실제 사용 흐름과 제약, 예외 처리, 업무 상식이 응축된 결과물일 가능성이 크기 때문이다. 겉으로는 이상해 보여도, 실제로는 어떤 이유 때문에 그렇게 굳어진 경우가 많다.

그래서 `src`와 `migration`을 대응시킬 때는 먼저 "이 코드가 어떤 역할을 하고 있는가"를 읽는 것이 우선이다. 화면 하나를 보면 UI만 보는 게 아니라, 어떤 순서로 진입하는지, 어떤 조건에서 버튼이 활성화되는지, 어떤 데이터를 기준으로 분기하는지, 실패했을 때 어디로 돌아가는지까지 함께 읽어야 한다.

마이그레이션은 코드를 복사하는 작업이 아니라 책임을 옮기는 작업이기 때문에, 역할을 잘못 해석하면 아무리 코드가 깔끔해도 결과는 달라진다. 거부기린을 잘 안다고 생각할수록, 오히려 당연하게 여긴 흐름을 더 조심해서 읽어야 한다.

이 관점에서 보면 `src`와 `migration`은 파일 대 파일로 일대일 대응되는 관계가 아닐 수 있다. 기존에는 하나의 화면이나 하나의 웹뷰 흐름 안에 여러 책임이 뭉쳐 있었을 수 있다. 반면 신규 구조에서는 그것을 라우트, 페이지, 훅, 상태 저장소, API 계층, 테스트 유틸 같은 여러 단위로 분리하게 된다. 즉, 대응 기준은 파일명이나 폴더 구조가 아니라 "같은 책임을 어디에 두는가"가 되어야 한다.

동시에 개선 포인트를 보는 눈도 필요하다. 레거시를 있는 그대로 복제하기만 하면 기술 전환의 의미가 줄어든다. 하지만 그렇다고 개선 욕심이 앞서면 사용자 경험이 흔들릴 수 있다. 그래서 기준은 명확해야 한다. 사용자에게 보이는 핵심 경험은 유지하되, 내부 구조가 더 명확해지고 테스트 가능해지는 방향의 개선은 적극적으로 가져간다. 반대로 사용자 학습 비용을 갑자기 높이거나, 검증되지 않은 인터랙션으로 바꾸는 변화는 이번 단계에서 피한다.

`src`는 참고용 과거 코드가 아니라 해석의 출발점이고, `migration`은 단순한 복사본이 아니라 책임을 재배치한 새 구조다. 둘 사이를 연결하는 기준은 겉모양보다 역할이어야 한다.

## 마무리

이 시리즈는 한 편에서 모든 걸 설명하려 하지 않을 생각이다. 마이그레이션은 다뤄야 할 주제가 많고, 하나의 글에 다 밀어 넣으면 오히려 흐려진다. 첫 편인 이번 글은 왜 갈아타는지, 어떤 원칙으로 갈 것인지, 어디까지를 이번 전환의 범위로 볼 것인지를 적는 출발점이다.

그 다음 편에서는 레거시 src 구조를 어떻게 읽고 있는지 다룰 생각이다. 마이그레이션에서 가장 중요한 첫 단계는 사실 구현이 아니라 해석이다.

어떤 화면이 어떤 역할을 하고, 어디에 의존하고, 어떤 예외 흐름을 품고 있는지 제대로 읽지 못하면 이후 설계도 쉽게 흔들린다. 그래서 2편은 구현보다 분석에 집중할 가능성이 크다.

그 이후에는 migration 앱의 기본 골격을 설명하게 될 것이다. React Router 7로 라우팅을 어떻게 세우는지, Zustand와 TanStack Query의 역할을 어떻게 나누는지, 앱 전반의 초기 구조를 어떻게 가져가고 있는지 정리하고 싶다.

그 다음 축은 인증과 저장소다. 현재 프로젝트 맥락에서는 이 영역이 단순한 부속 기능이 아니라 앱의 중심에 가깝다.

localStorage 기반 저장소, 백엔드 인증 API, Tauri 딥링크 진입 정보, 테스트용 스토리지 분리 같은 주제는 실제로도 난도가 높고, 동시에 전환의 품질을 크게 좌우한다. 이 부분은 별도의 회차로 떼어 충분히 정리할 가치가 있다.

공통 UI와 레이아웃 설정도 뒤이어 다루게 될 것이다. 이번 전환의 중요한 원칙이 "UI 스타일은 바꾸지 않는다"인 만큼, 스타일을 유지하면서도 구현을 재사용 가능한 단위로 옮기는 과정 자체가 좋은 기록 거리가 된다.

어떤 요소는 그대로 복원해야 하고, 어떤 요소는 공통 컴포넌트로 승격할 수 있는지, 레이아웃 설정은 어떤 방식으로 정리해야 하는지를 한 번 별도로 적어두면 나중에도 큰 도움이 될 것 같다.

테스트 이야기도 빠질 수 없다. 마이그레이션은 새 기능 개발과 달리, 겉으로 같은 결과를 유지해야 한다는 압박이 크다. 그래서 테스트는 부가 작업이 아니라 핵심 작업에 가깝다.

Vitest 설정, 라우터 테스트 유틸, 스토리지 목킹, 특정 도메인 흐름의 검증 방법 같은 내용은 시리즈 후반에서 중요한 비중을 차지할 것 같다. 최종적으로는 실제 화면 하나를 선택해 레거시 분석부터 이식, 상태 연결, 테스트까지 전 과정을 보여주는 글도 쓰고 싶다. 그런 글이 있어야 추상적인 원칙이 실제 코드와 연결된다.

가능하면 각 글은 비슷한 형식을 유지할 예정이다. 문제 상황, 레거시에서 확인한 사실, 신규 구조에서의 설계 결정, 구현 포인트, 테스트 및 검증, 남은 과제 순으로 맞추면 읽는 흐름을 유지하기 쉽다.

이번 1편에서는 왜 이 마이그레이션을 시작했고, 어떤 원칙으로 진행할 것인지를 정리했다. 지금 구조를 계속 덧붙이는 방식보다, 사용자 경험의 겉모습은 유지하면서 앱 내부 구조를 다시 세우는 쪽이 더 맞다고 판단했다.

다음 글에서는 레거시 `src` 구조를 어떤 관점으로 읽고 있는지, 그리고 어떤 단위로 분해해야 거부기린을 새 앱 구조로 옮기기 쉬운지 더 구체적으로 적어보려고 한다.', '들어가며거부기린은 개인적으로 애정이 가는 프로젝트다. 그래서 더 대충 넘기고 싶지 않았다."지금도 돌아가니까 유지하자"는 식으로 남겨두기보다, 실제로 쓰는 사람이 덜 답답하고 앞으로 유지보수하는 사람도 덜 고생하는 구조로 바꾸고 싶었다. 소프트웨어를 오래 운영하다 보면 초기에 가볍게 선택한 구조가 나중에는 로딩 속도, 화', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-27/882a0d0cebf5df82.png', '2026-04-14T14:31:54+09:00', '2026-04-14T14:32:59+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_27';
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_95e74138', 'Tistory Tag 95e74138', 'tistory-tag-95e74138') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_27', (SELECT id FROM tags WHERE slug = 'tistory-tag-95e74138' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_26', 'tistory-26', '서버 관리 없이 실시간 데이터 처리, 네이버클라우드 Data Stream 살펴보기', '" 본 포스팅은 네이버클라우드에서 소정의 수수료를 제공받아 작성된 글입니다. "

오늘날 데이터 중심의 비즈니스 환경에서 실시간 데이터 처리는 선택이 아닌 필수가 되고 있습니다. 고객의 행동을 분석하고, 즉각적인 피드백을 제공하며, 시스템의 상태를 실시간으로 모니터링하는 것은 기업 경쟁력의 핵심 요소로 자리잡고 있습니다. 그러나 이러한 실시간 데이터 처리의 필요성은 동시에 인프라 운영의 복잡성을 증가시키고, 운영자에게는 새로운 기술적 도전 과제를 안겨줍니다. 특히, Apache Kafka와 같은 툴을 직접 관리해야 하는 경우, 그 부담은 더욱 커집니다.

이러한 상황에서 네이버클라우드의 Data Stream 서비스는 강력한 솔루션으로 부상하고 있습니다. Data Stream은 Apache Kafka 기반의 기능을 제공하면서도 서버 관리 부담 없이 실시간 데이터 스트리밍 환경을 제공하여, 기업이 데이터 처리 로직에 집중할 수 있도록 돕습니다. 이 글에서는 Data Stream의 주요 특징과 장점, 그리고 실제 활용 사례를 중심으로 실시간 데이터 처리의 새로운 가능성을 탐색해보겠습니다.

## 서비스 정의

Data Stream은 네이버클라우드에서 제공하는 완전관리형 서버리스 데이터 스트리밍 서비스입니다. 이 서비스는 Apache Kafka의 기능을 활용하면서, 별도의 인프라 구성이나 서버 유지보수 없이 실시간 데이터 처리 애플리케이션을 구축하고 운영할 수 있도록 설계되었습니다. 이로써 기업은 데이터 스트리밍 애플리케이션을 쉽게 개발하고 확장할 수 있습니다.

Data Stream은 특히 Apache Kafka의 핵심 기능과 높은 호환성을 제공하는 점에서 두각을 나타냅니다. Kafka 클러스터를 직접 관리하지 않아도 되므로, 서버 관리의 복잡성을 제거하고 데이터 처리 로직에 집중할 수 있습니다. 서버리스 환경에서 메시지를 전송, 수신, 분배 및 처리하는 기능을 지원하며, 이는 실시간 데이터 처리의 유연성과 효율성을 크게 향상시킵니다.

## 기존 방식과의 차이

항목 
 기존 방식 
 Data Stream 
 
 
 
 
 구축 
 직접 서버 및 Kafka 클러스터 구축 
 서버리스 환경에서 자동화된 구축 
 
 
 운영 
 서버 및 클러스터 유지보수 필요 
 관리형 서비스로 유지보수 불필요 
 
 
 스케일링 
 수동 스케일링 
 자동 스케일링 지원 
 
 
 모니터링 
 별도 모니터링 도구 필요 
 통합 대시보드 제공 
 
 
 비용 
 고정비용 발생 
 사용량 기반 과금 구조 
 
 
 
기존 방식에서는 Apache Kafka 클러스터를 직접 구축하고 운영해야 했기 때문에, 서버 관리와 유지보수에 많은 시간과 비용이 소요되었습니다. 반면에 Data Stream은 서버리스 환경에서 동작하여 이러한 부담을 덜어줍니다. 사용자는 데이터 처리 로직 자체에 집중할 수 있으며, 자동화를 통해 스케일링과 모니터링도 용이하게 수행할 수 있습니다. 이러한 차이는 특히 빠른 확장성과 운영 효율성 측면에서 큰 이점을 제공합니다.

기존의 Kafka 운영 방식은 기술 전문가가 필요한 복잡한 작업을 포함하고 있으며, 특히 스케일링이나 장애 대응 시 많은 리소스가 필요합니다. 반면, Data Stream은 이러한 문제를 서버리스 아키텍처로 해결하여, 운영 부담을 크게 감소시킵니다. 이는 특히 대규모 데이터를 처리하는 환경에서 유용합니다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-26/a35cb17a179a6c97.png)

**_출처: 네이버클라우드_

## 핵심 특징

### ① 완전관리형 서버리스 제공

Data Stream은 인프라 관리, 서버 패치, 클러스터 운영 등 복잡한 유지보수 작업 없이 데이터 스트리밍 환경을 쉽게 구축할 수 있습니다. 서버리스 환경에서 운영되므로 인프라 수준의 문제를 신경 쓸 필요가 없습니다. 이는 특히 인프라 관리에 대한 경험이 부족한 팀에게 큰 장점을 제공합니다. 사용자는 데이터 처리 로직에만 집중하면 되며, 인프라의 복잡성을 걱정할 필요가 없습니다.

### ② 빠르고 편리한 토픽(Topic) 관리

콘솔을 통해 사용자는 토픽을 손쉽게 생성하고 관리할 수 있습니다. 또한, 필요에 따라 파티션 수와 메시지 보관 기간을 유연하게 설정할 수 있어, 데이터 처리의 유연성을 극대화합니다. 이는 특히 다양한 데이터를 다루는 환경에서 큰 이점을 제공합니다. 토픽 관리는 실시간 데이터 처리의 핵심이며, Data Stream은 이를 쉽게 관리할 수 있도록 지원합니다.

### ③ 시각화된 성능·운영 지표 제공

Data Stream은 전체 토픽과 컨슈머 그룹의 실시간 처리 상태를 한눈에 확인할 수 있는 대시보드를 제공합니다. 이를 통해 운영자는 시스템 상태를 빠르게 파악하고, 필요 시 즉각적인 조치를 취할 수 있습니다. 이는 운영 효율성을 크게 향상시킬 수 있는 요소입니다. 모니터링 도구는 실시간 문제 해결과 최적화에 필수적입니다.

### ④ Apache Kafka 호환성

Apache Kafka 기반으로 구축된 시스템 또는 클라이언트 도구와 높은 호환성을 갖추고 있습니다. 이는 기존 Kafka 환경을 사용하는 사용자도 편리하게 전환하거나 연동할 수 있는 장점을 제공합니다. 기존 시스템의 호환성을 유지하면서도 새로운 기능을 쉽게 도입할 수 있습니다. 이는 데이터 인프라를 유연하게 운영할 수 있게 해줍니다.

### ⑤ 외부 애플리케이션 연동 및 스토리지 커넥터

Object Storage 연동 커넥터를 지원하여, 스트리밍 데이터를 저장하거나 다른 시스템과 쉽게 연결할 수 있습니다. 이는 데이터 아키텍처를 확장하는 데 큰 도움이 됩니다. 데이터를 저장하고 분석하는 다양한 방법을 제공하여, 고객의 요구에 맞춘 유연한 데이터 운영이 가능합니다. 이러한 연동 기능은 복잡한 데이터 파이프라인을 간소화합니다.

### ⑥ 합리적인 비용 구조

사용한 만큼만 과금되는 비용 구조를 채택하고 있으며, 토픽별 설정을 통해 불필요한 저장 비용을 줄일 수 있어 비용 운영 효율성을 높일 수 있습니다. 이는 특히 예산이 제한된 팀이나 프로젝트에서 중요한 요소입니다. 비용 투명성을 제공하여 예산 관리가 용이합니다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-26/7ddd4fa1f4900af0.png)

_출처: 네이버클라우드_

## 실제 활용 사례

- 로그 수집**: 다양한 서버나 애플리케이션에서 발생하는 로그 데이터를 실시간으로 수집하여 중앙에서 분석할 수 있습니다. 이 과정에서 Data Stream을 활용하면, 로그 데이터를 빠르게 처리하고 저장소에 보관할 수 있습니다. 이는 특히 대규모 시스템에서 로그 데이터를 실시간으로 분석하고 문제를 진단하는 데 유용합니다. 이를 통해 시스템의 안정성을 높이고, 장애 발생 시 빠르게 대응할 수 있습니다.

- **이벤트 전달**: 사용자 행동 이벤트를 실시간으로 수집하여 분석 서버로 전달합니다. 이를 통해 사용자 경험을 개선하고, 실시간 피드백을 받을 수 있습니다. 예를 들어, 전자상거래 사이트에서 사용자의 클릭 스트림 데이터를 실시간으로 분석하여 개인화된 추천을 제공할 수 있습니다. 이는 고객 경험을 개인화하고, 구매 전환율을 높이는 데 기여합니다.

- **ETL 파이프라인**: 대량의 데이터를 실시간으로 추출, 변환, 로드(ETL) 과정을 수행하여 데이터 웨어하우스나 데이터 레이크로 전송할 수 있습니다. Data Stream은 이 과정을 효율적으로 관리할 수 있도록 지원합니다. 이는 특히 데이터 웨어하우스에서 실시간 분석을 수행하는 경우에 유리합니다. 실시간 ETL 파이프라인은 비즈니스 인사이트를 빠르게 얻는 데 중요한 역할을 합니다.

- **실시간 사용자 행동 분석**: 웹사이트나 앱의 사용자 행동을 실시간으로 분석하여, 개인화된 사용자 경험을 제공하거나 마케팅 캠페인을 조정할 수 있습니다. 이러한 실시간 분석은 고객 만족도를 높이고, 비즈니스 성과를 향상시킬 수 있는 중요한 도구입니다. 실시간 데이터를 통해 고객의 니즈를 즉각적으로 파악하고 대응할 수 있습니다.

## 도입 포인트

Data Stream은 실시간 데이터 처리가 필요한 다양한 애플리케이션에서 유용하게 사용될 수 있습니다. 특히, 실시간 사용자 행동 분석, 로그 스트리밍, 이벤트 처리와 같은 워크로드에서 서버 관리 부담 없이 확장 가능한 구조로 응답성과 안정성을 확보할 수 있습니다. 데이터 엔지니어링 팀이나 실시간 분석을 필요로 하는 운영팀에 적합한 솔루션입니다. 이러한 팀은 Data Stream을 통해 더 나은 데이터 기반 의사결정을 내릴 수 있습니다.

Data Stream의 도입은 특히 빠르게 변화하는 시장에서 민첩하게 대응해야 하는 기업에게 유리합니다. 실시간 데이터를 활용하여 시장 변화에 대한 빠른 피드백 루프를 구축할 수 있습니다. 또한, 기존의 Kafka 인프라를 운영 중인 기업이 관리형 서비스를 찾고 있는 경우에도 적합합니다. 기존 인프라의 복잡성을 줄이고, 운영 효율성을 높이는 데 기여할 수 있습니다.

## 도입 시 고려할 점

Data Stream을 도입할 때는 기존 시스템과의 연동이나 전환 과정에서 고려해야 할 부분이 있습니다. 특히, 기존의 Kafka 기반 시스템을 사용하는 경우에는 호환성 문제를 최소화하기 위해 사전 테스트가 필요합니다. 또한, 운영 환경에 적합한 비용 구조를 설정하여 불필요한 비용 발생을 막는 것이 중요합니다. 데이터 보안을 강화하는 것도 중요한 사항입니다. 실시간 데이터를 다루는 만큼, 데이터 유출 방지를 위한 보안 프로토콜을 충분히 검토해야 합니다.

데이터의 민감성을 고려하여, 개인정보 보호와 관련된 법적 요구사항을 준수하는 것이 중요합니다. 데이터 거버넌스 정책을 철저히 수립하고, Data Stream 사용 시 이러한 정책을 잘 준수해야 합니다. 또한, 기술적 전환을 위한 내부 교육이나 문서화 작업도 필수적입니다. 이는 새로운 시스템 도입 시 발생할 수 있는 혼선을 줄이고, 사용자들이 새로운 환경에 빠르게 적응할 수 있도록 돕습니다.

## 마지막 안내 문단

네이버클라우드 Data Stream은 실시간 데이터 스트리밍을 필요로 하는 애플리케이션을 더욱 빠르고 유연하게 구현할 수 있도록 설계된 서비스입니다. 자세한 정보나 도입 상담을 원하시면 네이버클라우드 공식 웹사이트를 방문하시거나 문의해 주세요.

[![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-26/3d0e2a8d16627c82.png)](https://www.ncloud.com/support/question/sales?inputchannel=mkt)', '“ 본 포스팅은 네이버클라우드에서 소정의 수수료를 제공받아 작성된 글입니다. “ 오늘날 데이터 중심의 비즈니스 환경에서 실시간 데이터 처리는 선택이 아닌 필수가 되고 있습니다. 고객의 행동을 분석하고, 즉각적인 피드백을 제공하며, 시스템의 상태를 실시간으로 모니터링하는 것은 기업 경쟁력의 핵심 요소로 자리잡고 있습니다. ', (SELECT id FROM categories WHERE slug = 'tistory' LIMIT 1), 'blog/tistory/tistory-26/a35cb17a179a6c97.png', '2026-04-10T23:57:03+09:00', '2026-04-13T14:42:41+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_26';
INSERT INTO tags (id, name, slug) VALUES ('tag_datastream', 'Datastream', 'datastream') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_26', (SELECT id FROM tags WHERE slug = 'datastream' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_kafka', 'Kafka', 'kafka') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_26', (SELECT id FROM tags WHERE slug = 'kafka' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_b65551c6', 'Tistory Tag B65551c6', 'tistory-tag-b65551c6') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_26', (SELECT id FROM tags WHERE slug = 'tistory-tag-b65551c6' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_25', 'tistory-25', 'TypeScript 컴파일러 성능 측정 (3.9 vs 5.8)', '## 0. Intro

인턴 시절 SaaS 어드민에 새로운 기능을 추가해야 했는데, 필요한 라이브러리를 설치하는 과정에서 문제가 생겼다. 당시 프로젝트에서 사용하던 TypeScript 버전이 오래되어, 최신 라이브러리와의 호환성이 좋지 않았기 때문이다. 결국 TypeScript를 3.x에서 5.x대로 마이그레이션하게 되었다.

마이그레이션 이후 master 브랜치에 머지하고 CodePipeline에서 빌드를 확인했을 때, 속도가 눈에 띄게 빨라진 것을 체감했다. 그런데 실제로 코드에서 크게 바꾼 부분은 많지 않았다. `any` 타입을 좀 더 구체적인 타입으로 바꾼 정도였다.

그래서 궁금해졌다. 빌드가 빨라진 이유가 `any` 타입을 줄였기 때문인지, 아니면 TypeScript 컴파일러 자체의 성능이 개선된 결과인지 확인해보고 싶었다.

이 글에서는 동일한 워크로드에서 반복 측정을 수행하고, `--extendedDiagnostics`를 통해 내부 구간별 시간을 분해해 그 차이를 확인한다.

결론부터 말하면,

- 클린 빌드 중앙값 **6.7% 단축**

- 증분 빌드 중앙값 **14.1% 단축**

이라는 결과가 나왔다.

## 1. 왜 ''성능''은 체감이 아니라 측정이 필요한가

TypeScript를 업그레이드하면 "빌드가 빨라진 것 같다"는 느낌은 쉽게 든다. 문제는 이 체감이 꽤 불안정하다는 점이다.

같은 명령을 두 번 실행해도 결과가 달라질 수 있다. `tsbuildinfo` 캐시, Node 모듈 로딩, OS 파일 시스템 캐시가 개입하면 실행 조건 자체가 달라지기 때문이다. 여기에 브라우저, IDE 인덱싱, 파일 동기화 같은 백그라운드 작업까지 더해지면 빌드 시간은 쉽게 흔들린다.

또 하나 중요한 점은, 우리가 말하는 "빌드 시간"이 단일 단계의 성능이 아니라는 것이다.

빌드 시간에는 다음 과정이 모두 포함된다.

- 파일 로딩

- 프로그램 생성

- 타입 체크(Check)

- 변환

- 출력(emit/print)

- 증분 캐시 판단

즉, 전체 시간이 줄었다고 해서 타입체커만 빨라졌다고 단정할 수 없다. 이번 글에서는 이 합성 지표를 분해해, 실제로 어떤 단계에서 시간이 줄었는지 확인한다.

## 2. 실험 환경과 워크로드

목표는 단순하다.

> 
**동일한 워크로드에서 TypeScript 버전만 바꿨을 때 어떤 차이가 발생하는지 확인한다.**

그래서 코드와 설정은 그대로 유지하고, TypeScript 버전만 교체하는 방식으로 실험을 구성했다.

### 2.1 데모 프로젝트 구조

[https://github.com/choihooo/ts-compiler](https://github.com/choihooo/ts-compiler)

데모는 모노레포 + Project References 구조로 구성했다.

- **packages/core**

공통 타입과 유틸리티

- **packages/ui**

제네릭 컴포넌트 및 복잡한 타입 정의

- **packages/app**

실제 사용처 (대량 import)

이 구조는 `core &rarr; ui &rarr; app`으로 타입이 전파되는 형태다. 실제 프로젝트에서 빌드 시간이 늘어나는 패턴을 축소해서 재현했다.

### 2.2 측정 원칙

공정한 비교를 위해 다음 원칙을 적용했다.

- 동일 코드베이스 유지

- TypeScript 버전만 변경

- 클린 / 증분 빌드 분리

- 각 케이스 5회 반복

- 중앙값(median) 기준 비교

## 3. 측정 방법

측정은 두 레이어로 나눴다.

- 외부 측정: 전체 실행 시간 (`time`)

- 내부 분석: 컴파일러 단계별 시간 (`extendedDiagnostics`)

### 3.1 외부 측정

`/usr/bin/time -p`의 `real` 값을 사용했다.

#### 클린 빌드

- 캐시 제거 후 전체 빌드

- 5회 반복

#### 증분 빌드

- 초기 빌드 후 캐시 생성

- 파일 1줄 변경

- 재빌드 (5회 반복)

### 3.2 내부 분석

`tsc -b -v --extendedDiagnostics` 사용

주요 지표:

- Parse time

- Bind time

- Check time

- Emit/print time

## 4. 결과 1: 실제 빌드 시간

TypeScript 5.8은 클린/증분 모두에서 더 빠르게 동작했다.**특히 증분 빌드에서 차이가 더 크게 나타났다.

### 4.1 클린 빌드

- TS 3.9 중앙값: 2.54s**

- TS 5.8 중앙값: **2.37s**

&rarr; **6.7% 단축**

### 4.2 증분 빌드

- TS 3.9 중앙값: **1.28s**

- TS 5.8 중앙값: **1.10s**

&rarr; **14.1% 단축**

### 4.3 요약

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-25/10b13fff8094e3c0.png)

구분 
 TS 3.9 
 TS 5.8 
 개선율 
 
 
 
 
 클린 
 2.54s 
 2.37s 
 6.7% &darr; 
 
 
 증분 
 1.28s 
 1.10s 
 14.1% &darr;

## 5. 결과 2: 어디서 빨라졌나

이번 워크로드에서 TS 5.8의 개선은 한 곳에 집중되지 않았다.

- core/ui &rarr; **Emit/print 감소**

- app &rarr; **Check 감소**

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-25/5989a1ddcf8ae9b2.png)

_이 그래프는 TS 3.9와 TS 5.8에서 Check와 Emit/print 단계의 시간 차이를 비교한 것이다._

### 5.1 TS 3.9

- core/ui &rarr; 출력 병목

- app &rarr; 타입체크 병목

### 5.2 TS 5.8 변화

- ui Emit/print: **0.36s &rarr; 0.12s**

- app Check: **0.32s &rarr; 0.21s**

### 5.3 전체 관점

- Check: 0.53s &rarr; 0.47s

- Emit: 0.83s &rarr; 0.42s

&rarr; **Emit이 절반 수준으로 감소**

## 6. 증분 빌드가 더 빨라진 이유

증분 빌드는 두 단계로 나뉜다.

- 스킵 판단 (up-to-date)

- 필요한 부분만 빌드

핵심은 `tsbuildinfo` 캐시다.

- 변경 없는 프로젝트 &rarr; 스킵

- 변경된 프로젝트만 재빌드

TS 5.8에서는

- 재빌드 비용 감소

- 스킵 경로 효율 증가

이 두 가지가 동시에 작동하면서 증분에서 더 큰 개선이 나타난다.

## 7. Outro

이번 실험의 목적은 "빨라졌다"를 체감이 아닌 수치로 확인하는 것이었다.

### 결론

- 클린 빌드: **6.7% 단축**

- 증분 빌드: **14.1% 단축**

### 핵심 변화

- ui &rarr; Emit/print 감소

- app &rarr; Check 감소

즉, 단일 개선이 아니라 **컴파일러 전체 파이프라인에서의 개선**이 합쳐진 결과다.

실무적으로 보면 더 중요한 건 증분 빌드다.**개발자는 하루에 수십 번 빌드를 반복하기 때문이다.

그래서 TypeScript 업그레이드 효과는
CI보다 개발 루프에서 더 크게 체감된다.**', '0. Intro인턴 시절 SaaS 어드민에 새로운 기능을 추가해야 했는데, 필요한 라이브러리를 설치하는 과정에서 문제가 생겼다. 당시 프로젝트에서 사용하던 TypeScript 버전이 오래되어, 최신 라이브러리와의 호환성이 좋지 않았기 때문이다. 결국 TypeScript를 3.x에서 5.x대로 마이그레이션하게 되었다.마이그', (SELECT id FROM categories WHERE slug = 'engineering-fe' LIMIT 1), 'blog/tistory/tistory-25/10b13fff8094e3c0.png', '2026-03-29T16:43:51+09:00', '2026-04-23T15:07:17+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_25';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_24', 'tistory-24', 'AI 시대의 개인 이슈 트래커 - 나만의 Linear를 만들어봤다', '![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/b99290866de6a6a0.png)

## 1. 들어가며 - AI 에이전트 코딩 시대, 병목은 도구가 아니라 내 머리였다

AI 에이전트 코딩이 본격화되면서 개발자의 일하는 방식이 빠르게 바뀌고 있다.

불과 1-2년 전만 해도 코드를 한 줄 한 줄 직접 짜는 게 당연했다. 지금은 다르다. Claude, Cursor, Windsurf 같은 도구들이 반복적인 구현을 대신 처리해주면서, 동시에 굴릴 수 있는 프로젝트 수도 자연스럽게 늘어났다.

나도 그랬다. 이전에는 한두 개 프로젝트를 순서대로 진행했다면, 요즘은 3-4개를 병렬로 돌리는 게 일상이 됐다. 생산성이 올라간 건 분명한데, 이상하게 머릿속은 점점 더 복잡해졌다.

A 프로젝트를 하다가 B로 넘어가면, A에서 어디까지 했는지, 다음에 뭘 해야 했는지, 왜 그런 결정을 내렸는지가 흐릿해졌다. 코드는 그대로인데 나만 리셋된 느낌이랄까. 다시 맥락을 되찾는 데 생각보다 시간이 많이 들었다.

AI가 코딩을 빠르게 해줄수록, 내 머릿속 컨텍스트 관리가 더 중요해졌다. 도구는 충분히 좋아졌는데, 그걸 다루는 나의 워크플로우가 따라가질 못하고 있었다.

## 2. 하이니어란? - 개인 컨텍스트 스위칭 비용을 줄이기 위한 프로젝트

하이니어는 개인용 이슈 트래커다. Linear에서 영감을 받아 만들었고, 목표는 하나다. 컨텍스트 스위칭에 드는 리소스를 줄이는 것.

Linear나 Jira를 그냥 쓰면 되지 않냐고 할 수 있다. 나도 써봤다. Linear를 개인용으로 쓰기도 했고, Notion으로 태스크를 관리해보기도 했다. 그런데 기존 툴들은 팀 협업에 최적화되어 있다 보니, 개인이 쓰기엔 기능이 너무 많거나, 내가 원하는 방식으로 AI와 연동하기가 까다로웠다.

그래서 직접 만들기로 했다. 구조는 간단하다. 나는 칸반 보드를 통해 지금 무슨 작업을 하고 있는지, 해야 하는지, 이미 했는지를 한눈에 파악한다. AI는 MCP를 통해 칸반 컬럼을 직접 옮기고, 다음에 무슨 작업을 해야 할지 파악한다.

사람과 AI가 같은 보드를 공유하며 함께 프로젝트를 관리하는 구조다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/dae43bb0e24452c6.png)

## 3. 칸반 보드 설계 - Linear를 참고한 뷰 구성 (칸반 / 드로우 / 풀페이지)

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/68afb1abace2244f.png)

### 칸반 뷰

칸반 보드는 Linear UI를 많이 참고했다. Linear가 이미 이슈 트래커 UX를 잘 다듬어 놓았기 때문에, 개인 용도에 맞게 필요한 부분만 가져오는 방식으로 설계했다.

컬럼 구조는 Backlog &rarr; In Progress &rarr; Done &rarr; Closed 흐름을 따른다. 이슈 카드에는 제목, 상태, 연결된 브랜치 정보가 표시되고, 카드를 드래그해서 컬럼 간 이동이 가능하다.

###

###

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/0ec990f269494883.png)

### 드로워 뷰

이슈 카드를 클릭하면 오른쪽에서 드로워가 슬라이드로 열린다. 페이지를 이동하지 않고도 Status, Priority, Assignee, Label 같은 정보를 바로 확인하고 수정할 수 있다. 디스크립션 편집이나 최근 활동 확인도 여기서 된다. 더 깊게 들어가야 할 때는 상단의 "Open full page"로 풀페이지 뷰를 열면 된다.

###

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/13fb6d8173c6c5ac.png)

### 풀페이지 뷰

이슈를 문서처럼 펼쳐서 보는 뷰다. 디스크립션이 길거나 세부 내용을 집중해서 확인할 때 사용한다. 에디터 형태라 바로 내용을 수정할 수도 있다.

드로우 뷰와 풀페이지 뷰로 나누어져있지 않아도 기본 기능엔 문제가 없긴하다. 그냥 만들어봤다. 이게 바이브 코딩의 묘미니까.

## 4. GitHub 연동 - 브랜치 생성과 PR까지 한 곳에서

이슈 트래커를 만들다 보니 자연스럽게 GitHub 연동이 필요해졌다.

이슈와 코드는 분리할 수 없다. 이슈가 생기면 브랜치가 생기고, 브랜치에서 작업이 끝나면 PR이 생긴다. 이 흐름이 하나의 맥락 안에 있어야 컨텍스트가 유지된다. 이슈 트래커와 GitHub를 왔다 갔다 하는 것 자체가 이미 작은 컨텍스트 스위칭이다.

GitHub App을 직접 만들어서 레포와 연결했다. 하이니어 안에서 이슈에서 바로 브랜치를 만들고, 작업이 끝나면 PR도 올릴 수 있다. 이슈를 열면 연결된 브랜치와 PR 상태가 바로 보여서, GitHub를 별도로 열지 않아도 현재 작업 상태를 파악할 수 있다.

## 5. MCP 연동 - AI가 칸반을 직접 움직인다

하이니어에서 가장 공을 들인 부분이다. 사실 이게 하이니어를 만든 핵심 이유이기도 하다.

### MCP란?

MCP(Model Context Protocol)는 AI 모델이 외부 도구와 상호작용할 수 있도록 해주는 프로토콜이다. AI가 텍스트로 답하는 데 그치지 않고, 실제로 무언가를 조작할 수 있게 해주는 인터페이스라고 보면 된다. Claude Code가 stdio로 하이니어 MCP 서버에 연결되고, 거기서 Supabase DB와 GitHub API까지 직접 건드린다.

### 실제 사용 흐름

A 프로젝트 작업을 마치고 B로 넘어갈 때, Claude에게 이렇게 말하면 된다.

> 
"A 프로젝트 로그인 기능 구현 완료했어. 다음 B 프로젝트에서 뭐 해야 해?"

그러면 Claude가 MCP를 통해 해당 이슈를 Done으로 옮기고, 연결된 GitHub 브랜치를 닫은 뒤, B 프로젝트 보드를 확인해서 다음 작업을 알려준다. 내가 보드를 직접 조작하지 않아도 된다.

컨텍스트 스위칭할 때 가장 귀찮은 순간이 "아 맞다 보드 업데이트해야지"다. 그 마찰을 없애고 싶었다.

### 구현된 툴들

MCP 서버에는 현재 이런 툴들이 구현되어 있다.

이슈 관련으로는 조회, 생성, 상태 변경, 댓글 추가, 그리고 여러 이슈를 한 번에 처리하는 배치 업데이트까지 된다. GitHub 연동으로는 브랜치 생성, 이슈 연결, PR 연결이 가능하다. 라벨이랑 멤버 관리도 MCP로 할 수 있다.

카테고리툴
 
 
 
 이슈 
 조회, 생성, 상태 변경, 댓글, 배치 업데이트 
 
 
 GitHub 
 브랜치 생성, 이슈 연결, PR 연결 
 
 
 라벨 
 조회, 생성, 수정, 삭제 
 
 
 멤버 
 조회, 초대, 권한 변경, 제거

### 인증 구조

Claude Code 설정에 HINEAR_MCP_TOKEN 환경변수만 넣으면 된다. JWT로 검증해서 Supabase 세션을 만들고, 그 세션으로 모든 DB 작업이 이루어진다. 설정이 간단한 편이라 Claude Code에서 바로 연결해서 쓸 수 있다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/0ee970dbc1454070.png)

### 앞으로 붙이고 싶은 것들

지금은 명령을 받아서 처리하는 구조인데, 앞으로는 AI가 더 능동적으로 움직였으면 한다. 오래 In Progress에 머물러 있는 이슈를 감지해서 알려준다거나, 작업하면서 생긴 결정 사항을 디스크립션에 자동으로 기록해둔다거나. 일종의 AI가 써주는 작업 일지 같은 개념이다. 이 부분은 완성되면 후속 글로 따로 정리해볼 생각이다.

## 6. Pencil.dev 후기 - Stitch 대신 써본 디자인 툴, IDE 안에서 바로

하이니어 UI 작업을 하면서 처음으로 Pencil.dev를 써봤다.

구름(goorm) 밋업 세션에 갔다가 moai-adk 얘기를 듣던 중에 알게 됐다. 마침 UI 작업이 남아있어서 바로 써봤다.

이전엔 주로 Stitch를 쓰거나 직접 컴포넌트를 잡아가는 방식으로 작업했다. Stitch는 브라우저에서 별도 탭으로 열어두는 구조라, 코드를 짜다가 결과를 확인하려면 브라우저로 넘어가야 했다. 짧은 전환이지만 반복되다 보면 흐름이 끊겼다.

Pencil은 IDE 안에서 직접 볼 수 있다. 와이드 모니터에 IDE를 펼쳐두고 한 패널은 코드 에디터, 한 패널은 Pencil, 한 패널은 터미널로 구성해서 작업했다. 화면 전환 없이 코드 수정하고 결과를 바로 확인할 수 있으니 흐름이 끊기지 않았다.

아직 깊게 쓴 건 아니라 모든 기능을 평가하긴 어렵지만, 개발 경험만큼은 Stitch보다 좋았다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-24/07fd45f70121bd32.png)

## 7. 앞으로 - 디자인 시스템 구축과 하이니어 MCP 자동화

지금은 앞으로 만들 서비스들을 위한 디자인 시스템을 구현하는 중이다.

솔직히 하이니어보다 먼저 만들었어야 했다. 디자인 시스템이 없으니 UI 작업할 때 컴포넌트를 그때그때 만들어야 했고, 일관성을 유지하기가 쉽지 않았다. 순서가 뒤바뀐 셈이다.

그래도 일부러 하이니어를 먼저 만든 이유가 있다. 디자인 시스템 작업 자체도 하이니어 MCP로 관리하면서 진행해보고 싶었기 때문이다. 도구를 만들면서 그 도구로 다음 작업을 굴리는 구조. 맞는 순서인지는 모르겠지만, 해보고 싶었다.

MCP가 완성되고 나면 더 붙여보고 싶은 기능들도 있다. 오랫동안 In Progress에 머물러 있는 이슈를 감지해서 알려준다거나, 프로젝트 진행 상황을 요약해서 브리핑해준다거나. 결국 단순한 이슈 트래커를 넘어서, AI와 함께 프로젝트를 관리하는 워크스페이스가 됐으면 한다.

## 8. 마치며

만들고 나서 예상과 달랐던 게 있다.

GitHub 연동이나 다양한 뷰보다, 칸반 보드 자체를 꾸준히 업데이트하게 된다는 점이다. 이슈를 만들고, 브랜치를 연결하고, 작업이 끝나면 Done으로 옮기는 이 단순한 흐름이 생각보다 컨텍스트 유지에 도움이 됐다. 거창한 자동화가 없어도 그냥 보드가 정리되어 있다는 것만으로 다음 프로젝트로 넘어갈 때 훨씬 수월했다.

MCP까지 완성되면 어떻게 달라질지 궁금하다. 기대가 크다.', '1. 들어가며 — AI 에이전트 코딩 시대, 병목은 도구가 아니라 내 머리였다AI 에이전트 코딩이 본격화되면서 개발자의 일하는 방식이 빠르게 바뀌고 있다.불과 1-2년 전만 해도 코드를 한 줄 한 줄 직접 짜는 게 당연했다. 지금은 다르다. Claude, Cursor, Windsurf 같은 도구들이 반복적인 구현을 대신 ', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-24/b99290866de6a6a0.png', '2026-03-27T14:27:44+09:00', '2026-03-27T16:14:59+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_24';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_23', 'tistory-23', '타입 스크립트 컴파일러 동작 방식', '## Intro

마이그레이션 작업 중 빌드 속도가 눈에 띄게 빨라진 적이 있었습니다. 어떤 변경이 원인인지 설명하려다 막혔습니다. tsconfig 옵션 몇 개를 건드렸다는 건 알았지만, 왜 그게 효과가 있는지는 몰랐습니다.

그 경험이 이 글을 쓰게 된 계기입니다. TypeScript 컴파일러가 실제로 어떤 순서로, 어떤 이유로 동작하는지 이해하면 빌드가 느릴 때 어디서부터 손봐야 할지, 팀원에게 설정 변경 이유를 어떻게 설명할지 훨씬 명확해집니다.

## TypeScript 컴파일 과정의 전체 흐름

tsc는 소스 파일을 받아 다섯 단계를 거쳐 JavaScript를 출력합니다.

```
소스 파일 &rarr; Program 생성 &rarr; 파싱(AST) &rarr; 바인딩(Symbol) &rarr; 타입 체킹 &rarr; Emit
```

각 단계는 독립적이지 않습니다. 바인딩이 끝난 심볼 테이블을 타입 체커가 참조하고, 파싱 결과인 AST를 이미터가 그대로 읽어 코드를 출력합니다.

## 1. 프로그램 생성 단계 (Program Creation)

컴파일러는 tsconfig.json을 읽는 것부터 시작합니다. 어떤 파일을 컴파일 대상으로 볼지, 어떤 옵션을 적용할지가 여기서 결정됩니다.

이후 루트 파일에서 출발해 import 구문을 따라가며 의존성 그래프를 구성합니다. 재귀적으로 파일을 탐색하기 때문에 A.ts가 B.ts를 import하고, B.ts가 C.ts를 import하면 셋 다 컴파일 대상이 됩니다.

```
function createProgram(rootFiles, options):
 host = createCompilerHost(options)
 sourceFiles = Map ()
 moduleCache = createModuleResolutionCache()

for each file in rootFiles:
 processFile(file)

return program

function processFile(fileName):
 sourceFile = host.readFile(fileName)
 sourceFiles.set(fileName, sourceFile)

for each import in sourceFile.imports:
 resolvedPath = resolveModule(import, fileName)
 if resolvedPath not in sourceFiles:
 processFile(resolvedPath)
```

**실제 TypeScript 코드:**

```
// typescript/src/compiler/program.ts (핵심만 발췌)
export function createProgram(rootNames, options, host) {
 const files = new Map ();
 const moduleResolutionCache = createModuleResolutionCache(...);

for (const fileName of rootNames) {
 processRootFile(fileName);
 }

return program;
}
```

### 의존성 그래프 예시

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-23/1b74cf82b6825986.png)

이 단계에서 TypeScript는 프로젝트의 모든 파일을 한 번에 메모리에 올립니다. 타입 체킹의 정확성을 위한 구조이지만, 프로젝트 규모가 커질수록 초기 로딩 시간과 메모리 사용량이 증가하는 이유이기도 합니다.

**tsconfig 설정으로 이 단계를 조정할 수 있습니다:**

```
{
 "compilerOptions": {
 "skipLibCheck": true, // node_modules의 .d.ts 파일 체크 생략
 "incremental": true, // 이전 빌드 정보를 캐시로 저장
 "tsBuildInfoFile": "./.tsbuildinfo"
 }
}
```

Project References는 큰 프로젝트를 독립적으로 컴파일 가능한 단위로 분리해, 변경이 없는 패키지는 캐시된 결과를 그대로 씁니다.

## 2. 파싱 단계 (Parsing)

파서는 두 단계로 동작합니다. 먼저 스캐너(Scanner)가 소스 텍스트를 토큰 스트림으로 쪼개고, 파서(Parser)가 그 토큰들을 조합해 추상 구문 트리(AST)를 만듭니다.

### 스캐너: 텍스트를 토큰으로

```
function scan(sourceText):
 position = 0

while position

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-23/824c42c77f4bcd19.png)

바인딩 단계가 끝나면 AST의 각 노드는 자신이 어떤 심볼에 속하는지, 그 심볼의 스코프가 어디인지를 알고 있습니다. 타입 체커는 이 정보를 바탕으로 변수가 어디서 선언됐고 어떤 타입을 갖는지 추적합니다.

## 4. 타입 체킹 단계 (Type Checking)

전체 빌드 시간의 60~70%를 차지하는 단계입니다. 타입 추론과 호환성 검사가 여기서 이루어집니다.

### 타입 추론 로직

타입 체커는 각 표현식을 보고 타입을 결정합니다. 이미 계산한 결과는 캐시에 저장해 같은 표현식을 반복 계산하지 않습니다.

```
function getTypeOfExpression(node):
 if node in typeCache:
 return typeCache[node]

if node is StringLiteral: type = StringType
 if node is NumberLiteral: type = NumberType
 if node is Identifier:
 symbol = lookupSymbol(node.name)
 type = getTypeOfSymbol(symbol)
 if node is CallExpression:
 functionType = getTypeOfExpression(node.function)
 type = getReturnType(functionType)
 if node is BinaryExpression:
 leftType = getTypeOfExpression(node.left)
 rightType = getTypeOfExpression(node.right)
 type = inferBinaryOperationType(leftType, rightType)

typeCache[node] = type
 return type
```

### 타입 호환성 검사

TypeScript는 구조적 타이핑(structural typing)을 씁니다. 타입 이름이 같아야 하는 게 아니라, 구조가 맞으면 호환됩니다.

```
function checkTypeCompatibility(source, target):
 if source == target:
 return true

if source is ObjectType and target is ObjectType:
 return checkStructuralCompatibility(source, target)

return false

function checkStructuralCompatibility(source, target):
 for each property in target.properties:
 sourceProperty = source.getProperty(property.name)

if sourceProperty is null:
 return false // 속성 없음

if not checkTypeCompatibility(sourceProperty.type, property.type):
 return false

return true
```

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-23/ae42eec55a38f2a1.png)

### 유니온 타입과 복잡도

유니온 타입이 복잡해질수록 비교 연산 횟수가 급격히 늘어납니다.

```
// 두 유니온 타입 간 호환성 검사
type A | B | C | D vs E | F | G | H
// 최악의 경우 4 &times; 4 = 16번 비교
// 일반적으로 O(n &times; m) 복잡도
```

타입 오류가 발생하는 위치와 방식을 이해하면 디버깅에 도움이 됩니다:

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-23/139510166711c191.png)

타입 체킹 속도를 높이려면 타입 추론에 드는 계산을 줄이는 게 핵심입니다. 타입을 명시하면 컴파일러가 추론을 건너뛰고 바로 검사로 넘어갑니다.

```
// 추론이 필요한 경우
const data = [1, "two", true, null];

// 명시적 타입: 추론 비용 없음
const data: Array = [1, "two", true, null];
```

과도하게 복잡한 유니온 타입이나 제약 없는 제네릭도 타입 체킹 시간을 늘립니다. as const로 리터럴 타입을 고정하면 유니온 멤버 수를 줄이는 데 도움이 됩니다.

## 5. 변환 및 출력 단계 (Emit)

이미터(Emitter)가 AST를 읽어 JavaScript, .d.ts, .map 파일을 씁니다.

### 코드 변환 로직

타입 주석은 이 단계에서 제거됩니다. 그 외의 로직은 그대로 출력됩니다.

```
function emitVariableStatement(node):
 output = node.keyword + " "
 output += node.name
 // 타입 주석: 출력하지 않음
 if node.initializer:
 output += " = " + emitExpression(node.initializer)
 output += ";\n"
 return output

function emitDeclarationFile(node):
 output = "declare const " + node.name
 output += ": " + emitType(node.type)
 output += ";\n"
 return output
```

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-23/b921a9a5c14ad726.png)

### 타입 체킹과 Emit은 독립적으로 동작합니다

타입 오류가 있어도 JavaScript 출력은 기본적으로 계속됩니다. noEmitOnError: true를 설정하면 오류가 있을 때 출력을 막을 수 있습니다. 개발 중에는 타입 오류가 있는 상태로 실행해보고 싶을 때가 있어서, 이 기본값이 실용적입니다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-23/e2ee9e0efb532edf.png)

Emit 단계 자체는 빠른 편이라 여기서 얻을 수 있는 최적화는 제한적입니다. .d.ts나 소스맵이 필요하지 않은 상황이라면 생성을 끄는 것만으로도 시간을 줄일 수 있습니다.

```
{
 "compilerOptions": {
 "declaration": false,
 "sourceMap": false,
 "removeComments": true
 }
}
```

## 성능 프로파일링

tsc --extendedDiagnostics로 각 단계가 실제로 얼마나 걸리는지 확인할 수 있습니다.

```
// 중규모 프로젝트 예시

Files: 450
Lines: 125000
Identifiers: 42000
Symbols: 28000
Types: 15000

I/O Read: 0.5s (5%)
Parse: 1.2s (12%)
Bind: 0.8s (8%)
Check: 6.5s (65%)
Transform: 0.5s (5%)
Emit: 0.5s (5%)
Total: 10.0s
```

타입 체킹이 65%를 차지합니다. 빌드가 느리다면 대부분 이 단계가 원인입니다. 빌드 전략을 바꾸기 전에 먼저 --extendedDiagnostics로 어디서 시간이 나가는지 확인하는 게 낫습니다.

## 실전 디버깅

**타입 체킹 시간 분석:**

```
tsc --diagnostics --extendedDiagnostics
```

**빌드 캐시 활용 (incremental 빌드):**

```
{
 "compilerOptions": {
 "incremental": true,
 "composite": true
 }
}
```

**타입 오류 원인 추적:**

두 타입이 왜 호환되지 않는지 직접 검증해볼 수 있습니다.

```
type Expected = Parameters [0];
type Actual = typeof myArgument;

// 호환성 확인: 오류가 발생하면 Actual이 Expected를 만족하지 않음
const _check: Expected = {} as Actual;
```

## 마치며

컴파일러 동작 방식을 이해하기 전에는 skipLibCheck나 incremental 같은 옵션들이 그냥 "빌드를 빠르게 해주는 것들"로만 느껴졌습니다. 각 단계가 뭘 하는지 알고 나서야 어느 옵션이 어느 병목에 대응하는지, 왜 효과가 있는지 설명할 수 있게 됐습니다.

빌드가 느려질 때, 타입 오류가 이해하기 어려울 때, 프로젝트 구조를 어떻게 나눌지 고민될 때-이 다섯 단계를 떠올리면 실마리가 보이는 경우가 많습니다.', 'Intro마이그레이션 작업 중 빌드 속도가 눈에 띄게 빨라진 적이 있었습니다. 어떤 변경이 원인인지 설명하려다 막혔습니다. tsconfig 옵션 몇 개를 건드렸다는 건 알았지만, 왜 그게 효과가 있는지는 몰랐습니다.그 경험이 이 글을 쓰게 된 계기입니다. TypeScript 컴파일러가 실제로 어떤 순서로, 어떤 이유로 동', (SELECT id FROM categories WHERE slug = 'engineering-fe' LIMIT 1), 'blog/tistory/tistory-23/1b74cf82b6825986.png', '2026-03-17T21:02:00+09:00', '2026-04-23T15:07:40+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_23';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_21', 'tistory-21', 'AI 에이전트 스킬 vs 멀티에이전트', '## 1. 멀티에이전트와 스킬, 왜 헷갈릴까?

취업에 성공하고 나서 개발보다는 AX(AI Transformation)를 어떻게 높일 수 있을지 고민하며 코딩을 하던 중, 낯선 개념 두 가지를 마주쳤다.

**스킬**과 **멀티에이전트**.

스킬은 에이전트가 특정 책을 꺼내 읽고 그걸 참고해서 일하는 것, 멀티에이전트는 여러 에이전트가 각자 잘하는 일을 나눠서 맡는 것이라고 한다. 그런데 여기서 의문이 생겼다.

> 
어차피 둘 다 뭔가를 "불러다 쓰는" 건데, 도대체 뭐가 다른 걸까?

## 2. 스킬이란 무엇인가?

스킬을 한 문장으로 정의하면 이렇다.

> 
에이전트가 일을 잘 하기 위해 참고하는 "매뉴얼"이다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-21/078c588025e52444.png)

사람으로 치면, 신입사원한테 "이 회사에서는 이렇게 일해"라고 적힌 온보딩 문서를 쥐여주는 것과 같다. 에이전트는 기본적으로 아무것도 모르는 상태로 시작한다. 어떤 형식으로 출력해야 하는지, 어떤 말투를 써야 하는지, 어떤 절차를 따라야 하는지. 스킬은 그 공백을 채워준다.

```
[하나의 에이전트]
 ├─ 스킬 A
 ├─ 스킬 B
 └─ 스킬 C
```

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-21/6ff64aeff1c9f3aa.png)

## 어떤 문제를 해결하는가

매번 프롬프트에 긴 설명을 쓰지 않아도 된다는 것이다. 예를 들어 "보고서를 작성할 때는 항상 이 형식을 따르고, 이 단어는 쓰지 마라"는 규칙을 매번 입력하는 건 비효율적이다. 스킬에 한 번 정리해두면, 에이전트는 매번 그걸 꺼내 읽고 일한다.

## 그래서 토큰이 어떻게 절약되는가

여기서 토큰 얘기를 잠깐 해야 한다. AI는 텍스트를 처리할 때 "토큰"이라는 단위로 읽고 쓴다. 대략 한글 한 글자가 1~2토큰 정도라고 보면 된다. AI는 토큰을 쓸수록 비용이 발생하고, 한 번에 처리할 수 있는 토큰 양에도 한계가 있다.

스킬이 없으면 어떻게 될까. 매번 프롬프트에 모든 규칙을 전부 집어넣어야 한다. 요청이 100번이면 그 설명도 100번 반복된다. 토큰 낭비다.

스킬은 다르게 동작한다. 규칙 전체를 매번 집어넣는 게 아니라, 일단 **인덱스(목차)만 올려둔다.** 에이전트는 그 인덱스를 보고 "지금 이 작업엔 이 규칙이 필요하겠다"고 판단한 다음, 해당 내용만 꺼내 읽는다. 도서관에서 책 전체를 외우는 게 아니라, 필요한 페이지만 펼쳐보는 것과 같다.

결과적으로 컨텍스트에 올라오는 내용이 줄어들고, 그만큼 토큰을 아낄 수 있다.

### 이런 상황에서 스킬을 쓴다

회사에서 매주 주간보고를 AI로 자동화하고 싶다고 해보자. 보고서 양식이 정해져 있고, 쓰면 안 되는 표현도 있고, 분량 기준도 있다. 이런 규칙들을 스킬로 만들어두면, 에이전트는 매번 그 기준에 맞게 보고서를 뽑아낸다. 프롬프트에 매번 설명할 필요가 없고, 토큰도 아낄 수 있다.

## 3. 멀티에이전트란 무엇인가?

멀티에이전트를 한 문장으로 정의하면 이렇다.

> 
각자 맡은 역할이 있는 AI 여러 명이 협력해서 하나의 일을 처리하는 구조다.

### 왜 AI를 여러 개 쓰는가

AI 하나가 못 푸는 문제가 있다. 정확히는 "못 푼다"기보다, 혼자 다 처리하려다 보면 한계에 부딪힌다.

앞서 토큰 얘기를 했는데, AI는 한 번에 처리할 수 있는 토큰 양이 정해져 있다. 이걸 컨텍스트 윈도우라고 한다. 작업이 단순하면 상관없다. 근데 처리해야 할 내용이 엄청 많거나, 여러 단계를 거쳐야 하는 복잡한 작업이면 얘기가 달라진다. 하나의 AI가 모든 걸 컨텍스트에 올려두고 처리하면 금방 한계에 찬다.

멀티에이전트는 이 문제를 역할 분리로 푼다. 전체 작업을 쪼개서, 각 에이전트가 자기 담당 부분만 처리한다. 각자의 컨텍스트는 가볍게 유지되고, 결과만 다음 에이전트에게 넘긴다. 공장 컨베이어 벨트처럼, 한 사람이 처음부터 끝까지 다 만드는 게 아니라 각 공정을 나눠서 처리하는 것과 같다.

```
오케스트레이터
 ├── Agent A
 │ └── 스킬들
 ├── Agent B
 │ └── 스킬들
 └── Agent C
 └── 스킬들
```

### 이런 상황에서 멀티에이전트가 필요하다

뉴스 기사 100개를 읽고, 요약하고, 트렌드를 분석해서 보고서를 만드는 작업을 자동화한다고 해보자. AI 하나한테 "이거 다 해"라고 하면 컨텍스트가 터진다. 100개 기사를 한 번에 올리는 것 자체가 무리다.

멀티에이전트로 나누면 이렇게 된다. 1번 에이전트는 기사를 읽고 요약만 한다. 2번 에이전트는 그 요약들을 받아서 트렌드를 분석한다. 3번 에이전트는 분석 결과를 받아서 보고서 형식으로 정리한다. 각자는 자기 일만 하면 되니까 컨텍스트가 가볍고, 전체 작업은 훨씬 안정적으로 돌아간다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-21/12e095dae4699abd.png)

## 4. 둘의 핵심 차이는 무엇인가?

여기까지 읽었으면 이제 처음 의문으로 돌아갈 수 있다.

> 
어차피 둘 다 뭔가를 "불러다 쓰는" 건데, 도대체 뭐가 다른 걸까?

**스킬은 AI를 더 잘하게 만드는 것이고, 멀티에이전트는 AI를 나눠서 쓰는 것이다.**

스킬은 같은 AI가 더 나은 결과를 내도록 돕는다. AI가 바뀌는 게 아니라, AI가 참고하는 정보가 달라지는 것이다. 사람으로 치면 직원은 그대로인데 매뉴얼을 쥐여줘서 일을 더 잘하게 만드는 것과 같다.

멀티에이전트는 다르다. AI 자체를 여러 개로 나눈다. 한 명이 처음부터 끝까지 다 하는 게 아니라, 각자 맡은 역할만 처리하고 결과를 넘긴다. 직원 한 명한테 다 시키는 게 아니라 팀을 꾸리는 것과 같다.

스킬 
 멀티에이전트 
 
 
 
 
 AI 개수 
 1개 
 여러 개 
 
 
 목적 
 더 잘하게 
 나눠서 처리 
 
 
 토큰 전략 
 필요한 것만 꺼내 읽기 
 컨텍스트 자체를 분리 
 
 
 적합한 상황 
 규칙·형식이 정해진 반복 작업 
 크고 복잡한 다단계 작업 
 
 
 비유 
 매뉴얼을 쥐여준 직원 
 역할이 나뉜 팀

## 5. 그래서 어떻게 써야 할까?

그러면 실제로 어떻게 판단하면 될까.

### 스킬만으로 충분한 경우

작업 자체는 단순한데, 매번 같은 규칙을 반복 적용해야 할 때다. AI한테 "이렇게 해"라고 가르쳐두면 혼자서 잘 처리할 수 있는 일들이 여기 해당한다.

예를 들어 고객 문의 메일에 답장을 자동화한다고 해보자. 답변 말투, 금지 표현, 서명 형식 같은 규칙을 스킬로 만들어두면 된다. AI는 매번 그 스킬을 꺼내 읽고 기준에 맞게 답장을 쓴다. 굳이 AI를 여러 개 쓸 이유가 없다.

### 멀티에이전트가 필요한 경우

작업이 여러 단계로 나뉘거나, 처리해야 할 양이 너무 많아서 AI 하나의 컨텍스트로는 감당이 안 될 때다.

예를 들어 경쟁사 10곳의 웹사이트를 크롤링해서 가격을 비교하고, 그걸 바탕으로 전략 보고서를 만드는 작업이라고 해보자. 크롤링, 데이터 정리, 비교 분석, 보고서 작성을 AI 하나한테 다 시키면 컨텍스트가 터진다. 이럴 때는 각 단계를 에이전트에게 나눠서 맡기는 게 맞다.

### 둘을 함께 쓰는 전략

사실 실전에서는 스킬과 멀티에이전트를 같이 쓰는 경우가 많다. 멀티에이전트로 작업을 나눠두고, 각 에이전트한테 스킬을 쥐여주는 방식이다.

아까 뉴스 보고서 예시로 돌아가보자. 1번 에이전트는 기사 요약을 담당하는데, "요약은 3줄 이내로, 수치는 반드시 포함"이라는 스킬을 갖고 있다. 2번 에이전트는 트렌드 분석을 담당하는데, "분석은 항상 긍정/부정/중립으로 분류"라는 스킬을 갖고 있다. 3번 에이전트는 보고서 작성을 담당하는데, 회사 보고서 양식 스킬을 갖고 있다.

역할은 멀티에이전트로 나누고, 각자의 퀄리티는 스킬로 잡는 것이다. 이게 둘을 가장 잘 쓰는 방법인것 같다.

참고 자료

- [https://www.youtube.com/watch?v=DOlQv8Em9gE](https://www.youtube.com/watch?v=DOlQv8Em9gE)

- [https://www.anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)', '1. 멀티에이전트와 스킬, 왜 헷갈릴까?취업에 성공하고 나서 개발보다는 AX(AI Transformation)를 어떻게 높일 수 있을지 고민하며 코딩을 하던 중, 낯선 개념 두 가지를 마주쳤다.스킬과 멀티에이전트.스킬은 에이전트가 특정 책을 꺼내 읽고 그걸 참고해서 일하는 것, 멀티에이전트는 여러 에이전트가 각자 잘하는 ', (SELECT id FROM categories WHERE slug = 'engineering-ai' LIMIT 1), 'blog/tistory/tistory-21/078c588025e52444.png', '2026-02-26T05:08:17+09:00', '2026-02-26T18:07:40+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_21';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_20', 'tistory-20', 'CS 디자인 패턴 정리 및 면접 포인트', '## 왜 먼저 디자인 패턴을 공부했는가

디자인 패턴은 자주 반복되는 설계 문제를 정리한 방법이다.

처음에는 면접 대비를 위해 패턴 이름부터 외웠다.
하지만 공부를 이어가면서 질문의 의도를 조금씩 이해하게 됐다.
면접관이 보고 싶은 건 암기량이 아니라 설계하는 방식이었다.

내가 정리한 기준은 아래 세 가지다.

- 책임을 어디에 둘지 설명할 수 있는가

- 결합도를 낮추는 선택을 했는가

- 변경이 생겼을 때 비용을 줄일 수 있는가

이 문서는 그 기준으로 다시 정리한 기록이다.

## 라이브러리와 프레임워크

패턴을 보기 전에 제어권부터 정리했다.

### 라이브러리

- 공통 기능을 모아둔 코드

- 내가 필요할 때 호출

- 제어권이 호출하는 쪽에 있음

### 프레임워크

- 구조와 실행 흐름을 제공

- 내 코드가 프레임워크 흐름 안에서 실행

- 제어권이 프레임워크에 있음 (IoC)

핵심은 누가 흐름을 잡는지다.

## 1. 싱글톤 패턴

하나의 인스턴스만 유지하는 패턴이다.

### 언제 썼는가

- WebSocket 연결

- Analytics SDK

- 앱 전역 설정

- Axios 인스턴스

### 예시 코드

```
class SocketManager {
 private static instance: SocketManager;
 private socket: WebSocket;

private constructor() {
 this.socket = new WebSocket("wss://example.com");
 }

static getInstance() {
 if (!SocketManager.instance) {
 SocketManager.instance = new SocketManager();
 }
 return SocketManager.instance;
 }

getSocket() {
 return this.socket;
 }
}
```

```
const socket1 = SocketManager.getInstance();
const socket2 = SocketManager.getInstance();

console.log(socket1 === socket2); // true
```

### 그때의 판단, 지금의 기준

채팅 기능을 만들 때 컴포넌트마다 소켓을 새로 열어서 연결 문제가 났다.
그때 싱글톤으로 바꿔 문제를 막았다.

다만 이후 테스트를 붙이면서 단점이 분명해졌다.
전역 상태가 섞이면 테스트 격리가 어렵다.

지금은 이렇게 구분한다.

- 싱글톤: 연결, 클라이언트 같은 공유 리소스

- 상태 관리: 별도 레이어(Context, Zustand, Redux 등)

### DI로 완화하기

```
function createService(logger: Logger) {
 return {
 doSomething() {
 logger.log("event");
 },
 };
}
```

React의 `props`로 의존성을 전달하는 방식도 같은 맥락으로 본다.

## 2. 팩토리 패턴

객체 생성 책임을 분리하는 패턴이다.

### 왜 필요했는가

생성 로직이 퍼지면 중복이 늘고 수정 범위가 넓어진다.
생성 규칙을 한 곳에 모아두면 관리가 쉬워진다.

### 예시 코드

```
import axios from "axios";

type ClientType = "public" | "auth";

export function createApiClient(type: ClientType) {
 const baseConfig = {
 baseURL: "/api",
 timeout: 5000,
 };

if (type === "auth") {
 return axios.create({
 ...baseConfig,
 headers: {
 Authorization: `Bearer ${localStorage.getItem("token")}`,
 },
 });
 }

return axios.create(baseConfig);
}
```

### 얻은 점과 실수

처음에는 생성이 단순한 객체까지 팩토리로 감쌌다.
코드는 일관돼 보였지만 실제로는 복잡도만 늘었다.

지금은 기준을 두고 쓴다.

- 분기나 조합이 있는 생성

- 생성 정책이 자주 바뀌는 경우

- 테스트에서 대체 구현이 필요한 경우

### 면접에서 설명할 포인트

- 생성자와 달리, 팩토리는 조건에 따라 다른 구현을 반환할 수 있음

- 클라이언트가 생성 세부사항을 몰라도 되도록 경계를 만든다는 점

## 3. 전략 패턴

동작을 캡슐화하고 런타임에 교체하는 패턴이다.

`if-else` 분기를 줄이고 확장성을 확보할 때 쓴다.

### 예시 코드

```
interface LoggerStrategy {
 log(event: string, payload?: any): void;
}

class ConsoleLogger implements LoggerStrategy {
 log(event: string, payload?: any) {
 console.log("[DEV]", event, payload);
 }
}

class GaLogger implements LoggerStrategy {
 log(event: string, payload?: any) {
 window.gtag("event", event, payload);
 }
}

class Logger {
 constructor(private strategy: LoggerStrategy) {}

log(event: string, payload?: any) {
 this.strategy.log(event, payload);
 }
}
```

```
const logger =
 process.env.NODE_ENV === "development"
 ? new Logger(new ConsoleLogger())
 : new Logger(new GaLogger());

logger.log("button_click");
```

### 팩토리와의 차이

구분 
 팩토리 
 전략 
 
 
 
 목적 
 생성 분리 
 동작 교체 
 
 
 시점 
 생성 시점 
 실행 시점

### 내 사고 변화

처음에는 전략 패턴을 "클래스 문법"으로만 이해했다.
지금은 "바뀌는 축을 분리한다"는 원리로 기억한다.
그래서 함수 전달 방식으로도 같은 문제를 풀 수 있다고 본다.

## 4. 옵저버 패턴

상태 변경을 구독자에게 알리는 패턴이다.

### 예시 코드

```
type Listener = (state: T) => void;

class Store {
 private state: T;
 private listeners: Listener [] = [];

constructor(initialState: T) {
 this.state = initialState;
 }

subscribe(listener: Listener ) {
 this.listeners.push(listener);
 return () => {
 this.listeners = this.listeners.filter((l) => l !== listener);
 };
 }

setState(newState: T) {
 this.state = newState;
 this.listeners.forEach((listener) => listener(this.state));
 }

getState() {
 return this.state;
 }
}
```

Redux, Zustand의 핵심 흐름도 이 구조와 닿아 있다.

### 놓치기 쉬운 문제

구독 해제를 빠뜨리면 메모리 누수로 이어질 수 있다.
React에서는 `useEffect` cleanup으로 정리한다.

이 부분은 실제로 한 번 놓쳤고, 그 뒤로는 구독/해제를 세트로 본다.

## 5. 프록시 패턴

실제 객체 접근을 중간에서 제어하는 패턴이다.

### 예시 코드

```
const user = { email: "" };

const userProxy = new Proxy(user, {
 set(target, prop, value) {
 if (prop === "email" && !value.includes("@")) {
 throw new Error("Invalid email format");
 }
 target[prop as keyof typeof target] = value;
 return true;
 },
});
```

### 프론트엔드에서의 연결점

- 접근 제어

- 로깅, 캐싱 같은 횡단 관심사 삽입

## 6. 이터레이터 패턴

컬렉션의 내부 구조를 감추고 순회 인터페이스를 제공하는 패턴이다.

JavaScript는 이터레이터를 언어 차원에서 제공한다.

```
const arr = [1, 2, 3];

for (const value of arr) {
 console.log(value);
}
```

내부적으로 `Symbol.iterator`가 동작한다.

### 제너레이터 예시

```
function* paginate(data: number[]) {
 let index = 0;
 while (index

## 패턴 요약

패턴 
 해결하는 문제 
 프론트 활용 
 
 
 
 싱글톤 
 인스턴스 하나 유지 
 WebSocket, Axios 인스턴스 
 
 
 팩토리 
 생성 책임 분리 
 API Client 생성 
 
 
 전략 
 동작 교체 
 Logger, 결제 수단 
 
 
 옵저버 
 상태 변화 알림 
 Redux, Zustand 
 
 
 프록시 
 접근 제어 
 Vue 3 반응성 
 
 
 이터레이터 
 순회 추상화 
 무한 스크롤/페이지네이션

## 패턴 조합 예시

### 팩토리 + 전략

```
function createLogger(env: string): Logger {
 const strategy = env === "prod" ? new GaLogger() : new ConsoleLogger();
 return new Logger(strategy);
}

const logger = createLogger(process.env.NODE_ENV || "development");
```

### 싱글톤 + 옵저버

```
class AppStore {
 private static instance: AppStore;
 private listeners: Array void> = [];
 private state: Record = {};

static getInstance() {
 if (!AppStore.instance) {
 AppStore.instance = new AppStore();
 }
 return AppStore.instance;
 }

subscribe(listener: (state: any) => void) {
 this.listeners.push(listener);
 return () => {
 this.listeners = this.listeners.filter((l) => l !== listener);
 };
 }

setState(newState: Record ) {
 this.state = newState;
 this.listeners.forEach((listener) => listener(this.state));
 }
}
```

## 흔한 안티패턴

### React 컴포넌트를 싱글톤처럼 다루기

컴포넌트는 재사용 단위다.
리소스 싱글톤과 컴포넌트 역할을 섞으면 구조가 꼬인다.

### 단순 유틸까지 모두 팩토리/클래스로 감싸기

추상화 자체가 목적이 되면 유지보수성이 떨어진다.
복잡도를 줄이기 위한 추상화인지 먼저 확인한다.

### 반환 타입으로 구체 클래스를 노출하기

```
function createUser(type: string): User {
 if (type === "admin") return new AdminUser();
 return new RegularUser();
}
```

핵심은 `User` 인터페이스로 경계를 유지하는 것이다.

## 왜 6개만 먼저 다뤘는가

GoF 23개를 한 번에 다 이해하려고 하면 흐름을 잃기 쉬웠다.
그래서 프론트엔드에서 직접 자주 만나는 패턴부터 정리했다.

- 생성 패턴: 싱글톤, 팩토리 중심

- 구조 패턴: 프록시 중심

- 행동 패턴: 전략, 옵저버, 이터레이터 중심

다른 패턴(어댑터, 데코레이터, 커맨드 등)은
필요한 문제를 만났을 때 확장해도 늦지 않다고 판단했다.

## 패러다임과 함께 보기

디자인 패턴은 OOP 시절에 체계화됐지만,
지금은 함수형 사고와 함께 섞어서 쓰는 경우가 많다.

예를 들어 전략 패턴은 클래스로 구현할 수도 있고,
함수 전달로 더 간단하게 표현할 수도 있다.

```
function log(strategy: (msg: string) => void, msg: string) {
 strategy(msg);
}
```

중요한 건 문법보다 경계다.
무엇이 바뀌고, 무엇을 고정할지를 나누는 방식이 핵심이다.

## 복습 질문

### 1) 아래 코드는 어떤 관점으로 설명할 수 있는가?

```
function render(component: Component) {
 return component.render();
}
```

`render` 동작을 인터페이스 뒤로 숨긴다는 점에서
전략 패턴 관점으로 설명할 수 있다.

### 2) 싱글톤과 static method의 차이는?

싱글톤은 인스턴스 개수를 제어하는 패턴이고,
`static`은 인스턴스 없이 호출되는 클래스 멤버다.
둘은 목적이 다르다.

### 3) if-else 분기만으로 전략을 관리하면 어떤 문제가 생기나?

- 전략 추가 시 기존 코드 수정이 반복됨

- 분기문이 길어져 읽기 어려움

- 특정 전략만 분리해 테스트하기 어려움

### 4) `setInterval`은 옵저버 패턴인가?

보통은 아니다.
상태 변화를 구독하는 구조가 아니라 시간 기반 반복 실행이기 때문이다.

## 정리

예전에는 패턴을 "정답 목록"처럼 다뤘다.
지금은 문제를 먼저 보고 패턴을 꺼내는 쪽으로 바뀌었다.

아직도 설계에서 흔들릴 때가 많다.
그래도 최소한 아래 질문을 먼저 확인하게 됐다.

- 어디가 자주 바뀌는가

- 어떤 의존성을 끊어야 하는가

- 테스트 가능한 구조인가

이 변화가 지금까지 공부하면서 얻은 가장 현실적인 차이다.', '왜 먼저 디자인 패턴을 공부했는가디자인 패턴은 자주 반복되는 설계 문제를 정리한 방법이다.처음에는 면접 대비를 위해 패턴 이름부터 외웠다.하지만 공부를 이어가면서 질문의 의도를 조금씩 이해하게 됐다.면접관이 보고 싶은 건 암기량이 아니라 설계하는 방식이었다.내가 정리한 기준은 아래 세 가지다.책임을 어디에 둘지 설명할 수', (SELECT id FROM categories WHERE slug = 'cs' LIMIT 1), NULL, '2026-02-11T19:02:50+09:00', '2026-02-11T19:03:02+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_20';
INSERT INTO tags (id, name, slug) VALUES ('tag_cs', 'Cs', 'cs') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_20', (SELECT id FROM tags WHERE slug = 'cs' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_cs', 'Cs', 'cs') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_20', (SELECT id FROM tags WHERE slug = 'cs' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_95dd261e', 'Tistory Tag 95dd261e', 'tistory-tag-95dd261e') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_20', (SELECT id FROM tags WHERE slug = 'tistory-tag-95dd261e' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_19', 'tistory-19', '우리, 프로그래머들 서평', 'Intro 
개발자로 취업을 준비하면서 요즘 부쩍 불안감이 커졌다. AI의 발전은 날이 갈수록 가속화되고 있고, 경기 침체까지 겹치면서 취업의 문이 점점 좁아지는 것을 피부로 느꼈다. 채용 공고는 줄어들고, 요구하는 역량은 높아지고, 그 사이에서 ''과연 내가 개발자로서 어떤 가치를 제공할 수 있을까?''라는 고민이 깊어졌다.

AI를 단순히 두려워하기보다는 좋은 도구로 활용하고 싶었다. 그러려면 먼저 개발자가 코드 구현 외에 무엇을 할 수 있는지, 어떤 본질적인 역할을 하는 존재인지 명확히 정의해볼 필요가 있었다. 그러던 중 『우리, 프로그래머들』이라는 책이 눈에 들어왔다. 책 표지에는 "AI 시대에 잊혀 가는 ''프로그래머 정신''을 다시 깨우다"라는 문구가 적혀 있었다. 마치 내가 지금 고민하고 있는 문제들에 대한 답을 줄 것만 같았다. 그렇게 이 책을 읽기 시작했다.

AI 시대에 다시 묻는 ''프로그래머란 무엇인가'' 
`우리, 프로그래머들`은 AI와 자동화 기술의 발전 속에서 프로그래머의 역할이 어떻게 변화해왔는지를 역사적 맥락에서 풀어내는 책이다.**이 책은 새로운 기술을 익히는 방법보다, 기술이 바뀌어도 변하지 않아야 할 프로그래머의 사고방식과 책임감을 중심으로 이야기를 전개한다.

우리가 사랑하는 것, 디테일 
책을 펼치고 몇 장을 읽다 보면 이런 문장이 등장한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-19/6e6cfbd76bf366bb.jpg)

> 
"우리(개발자)는 디테일을 사랑하는 사람입니다. 디테일을 위해 살아가고 그것을 위해 기꺼이 열정적으로 일합니다."

처음에는 다소 추상적으로 느껴졌던 이 말이, 책을 읽어나가면서 점점 선명해졌다. 특히 4부에서 AI를 다루는 장에 이르러서는 이런 문장이 다시 나온다.

> 
"우리는 여전히 프로그래머일 것입니다. 디테일을 다루어야 하는 사람이 바로 우리이기 때문입니다."

그렇다면 여기서 말하는 ''디테일''이란 정확히 무엇일까? 단순히 코드 한 줄 한 줄을 꼼꼼하게 작성하는 것만을 의미하는 걸까?

책에서 소개되는 컴퓨터의 역사를 보면, 기술의 발전은 언제나 하나의 디테일을 잡아내고 해결하는 과정이었다. 시대마다 중요하게 여겨지는 디테일은 달랐지만, 그것을 정확히 이해하고 다루는 사람이 바로 프로그래머였다.

지금도 마찬가지다. 예를 들어, AI에게 UI 작업을 맡겨보면 겉보기에는 그럴듯한 결과물을 내놓는다. 하지만 자세히 들여다보면 디자인 시안의 의도를 완전히 따라가지 못하고, 사용자 경험의 미묘한 부분들을 놓친다. 버튼의 크기와 배치, 색상의 대비, 인터랙션의 타이밍 같은 세심한 부분들 말이다.

코드 설계 측면에서도 마찬가지다. AI는 동작하는 코드를 빠르게 생성할 수 있지만, 장기적인 유지보수를 고려한 구조 설계, 확장 가능성, 팀원들이 이해하기 쉬운 코드 작성 같은 부분에서는 아직 사람의 판단을 따라오지 못한다. 왜냐하면 이런 것들은 단순한 정답이 있는 문제가 아니라, 맥락을 이해하고 트레이드오프를 판단하는 능력이 필요하기 때문이다.

결국 개발자로서 취업을 준비하고 커리어를 이어나간다는 것은, 이런 ''디테일''을 찾아내고 가꾸어 나가는 능력을 키우는 과정이 아닐까 싶다. AI가 빠르게 초안을 만들어주는 시대라면, 우리는 그 초안의 어떤 부분이 부족한지 파악하고, 어떻게 개선해야 하는지 판단하고, 실제로 더 나은 결과물로 만들어내는 사람이 되어야 한다.

이 책을 읽으면 좋을 사람들 
이 책은 특히 다음과 같은 사람들에게 도움이 될 것 같다.

AI에게 대체될까 두려운 개발자****ChatGPT나 Copilot 같은 도구들이 코드를 술술 작성해내는 모습을 보며 불안해하는 개발자라면, 이 책이 새로운 시각을 제공해줄 것이다. 역사적으로 프로그래머는 자동화의 위협 속에서도 살아남았을 뿐 아니라 더 중요한 역할을 맡아왔다는 사실을 알게 되면, 현재의 변화를 좀 더 차분하게 바라볼 수 있다.

프로그래머의 역사에 관심 있는 사람****컴퓨터 과학의 역사, 프로그래밍 언어의 발전, 소프트웨어 공학의 변천사 등에 관심이 있다면 이 책은 훌륭한 안내서가 되어줄 것이다. 단순한 연대기가 아니라, 각 시대의 프로그래머들이 어떤 문제와 씨름했고 어떤 철학을 가지고 있었는지를 생생하게 전달한다.

나만의 개발 정체성을 찾고 있는 사람**
''나는 어떤 개발자가 되고 싶은가?'', ''개발자로서 나만의 강점은 무엇일까?'' 같은 질문에 답을 찾지 못했다면, 이 책이 힌트를 줄 수 있다. 코딩 실력만이 아니라 문제를 바라보는 시각, 디테일을 다루는 태도, 책임감 같은 것들이 개발자를 정의한다는 걸 알게 되면, 자신만의 방향을 설정하는 데 도움이 될 것이다.

사실 이 세 가지 모두 지금의 나를 설명하는 키워드였다. 그래서 이 책이 더욱 와닿았던 것 같다. 취업 준비로 막막했던 마음에 작은 돌파구를 제공해준 책이었다.

마치며 
AI 시대에 개발자의 역할이 어떻게 변할지는 아무도 정확히 예측할 수 없다. 하지만 이 책을 읽고 나니 한 가지 확신이 생겼다. 기술은 계속 변하겠지만, 디테일을 사랑하고 그것을 정교하게 다루는 사람은 언제나 필요하다는 것. 그리고 그런 사람이 되기 위해 노력하는 것이 결국 가장 확실한 준비라는 것.

취업 시장이 어렵고 AI의 발전이 두렵더라도, 우리가 해야 할 일의 본질은 변하지 않았다. 오히려 지금이야말로 ''프로그래머로서 나는 어떤 가치를 만들어낼 수 있는가''를 진지하게 고민해볼 좋은 시기인 것 같다.', 'Intro개발자로 취업을 준비하면서 요즘 부쩍 불안감이 커졌다. AI의 발전은 날이 갈수록 가속화되고 있고, 경기 침체까지 겹치면서 취업의 문이 점점 좁아지는 것을 피부로 느꼈다. 채용 공고는 줄어들고, 요구하는 역량은 높아지고, 그 사이에서', (SELECT id FROM categories WHERE slug = 'book-review' LIMIT 1), 'blog/tistory/tistory-19/6e6cfbd76bf366bb.jpg', '2026-02-05T03:32:30+09:00', '2026-02-05T14:47:56+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_19';
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_8648bb14', 'Tistory Tag 8648bb14', 'tistory-tag-8648bb14') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_19', (SELECT id FROM tags WHERE slug = 'tistory-tag-8648bb14' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_46e51a03', 'Tistory Tag 46e51a03', 'tistory-tag-46e51a03') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_19', (SELECT id FROM tags WHERE slug = 'tistory-tag-46e51a03' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_85f75719', 'Tistory Tag 85f75719', 'tistory-tag-85f75719') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_19', (SELECT id FROM tags WHERE slug = 'tistory-tag-85f75719' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_18', 'tistory-18', '개발자는 글을 못쓴다고요 서평', '『개발자는 글을 못 쓴다고요?』 서평

## 기본 정보

- **제목**: 개발자는 글을 못 쓴다고요?

- **저자**: 전정은, 황수정

- **출판사**: 제이펍

- **읽은 기간**: 2025년 12월 3일 ~ 12월 17일

## 읽게 된 이유

프로젝트를 진행할 때 기능 구현은 어떻게든 해내지만, 문서화는 늘 뒤로 밀리는 편이었다. README는 비어 있거나 최소한의 실행 방법만 남아 있고, 변경사항은 머릿속에만 남아 시간이 지나면 "왜 이렇게 설계했지?"부터 다시 떠올려야 했다. 회고 글도 ''잘 써야 한다''는 부담 때문에 시작이 늦어지기 일쑤였다.

이 책은 제목 자체가 내 상황을 정확히 찌르는 느낌이었다. 개발자가 글을 "잘 쓰는 사람"이 되는 게 목표라기보다, 적어도 내가 했던 일을 나중에 다시 꺼내 쓸 수 있게 기록하고 싶었다. 그 방법을 구조적으로 배우고 싶어서 읽게 되었다.

## 💡 전반적인 느낌

### 다양한 예시가 준 안정감

이 책은 원론적인 조언보다 개발자가 실제로 마주치는 문서·공유·설명·기록 상황을 기준으로 예시를 제시한다. 그래서 읽는 내내 "이건 내 프로젝트에 바로 적용할 수 있겠다"는 감각이 들었다. 막연한 동기부여가 아니라, 바로 손이 움직이게 만드는 안내서에 가까웠다.

### 친절한 설명 덕분에 시작 장벽이 낮아졌다

글쓰기가 어려운 이유는 문장력 부족이 아니라, 어디서부터 무엇을 어떤 순서로 써야 하는지 보이지 않기 때문이다. 이 책은 그 시작점을 구조로 잡아준다. 멋진 글보다 읽는 사람이 정보를 빠르게 찾도록 만드는 구성이 먼저라는 관점이 특히 실용적이었다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-18/9b82ed4e7a4cccde.jpg)

## 🎯 내가 가져간 핵심 메시지

책을 읽고 정리한 핵심은 다음과 같다.

- **개발자 글쓰기의 목적은 감동이 아니라 전달과 재사용이다**

- **글은 센스보다 형식과 습관으로 좋아진다**

- **문서화는 "추가 업무"가 아니라, 다음 작업을 쉽게 만드는 미래 비용 절감이다**

- **잘 쓰려고 멈추는 것보다, 일단 쓰고 다듬는 방식이 현실적이다**

결국 글을 잘 쓰는 사람이 되기 전에, **기록을 끊지 않는 사람이 되는 게 먼저**라는 결론이었다.

## 적용해볼 것

읽고 끝내지 않기 위해, 당장 프로젝트에 붙일 수 있는 방식으로 적용 항목을 정리해두었다.

### 1) 체인지로그는 "공식 문서처럼" 쓴다

체인지로그에는 반드시 **버전, 날짜, 신규 기능, 변경 기능, 수정(버그), 삭제 기능, 호환성 이슈**가 들어가야 한다. 무엇보다 중요한 기준은, 최종 사용자에게 영향이 없어도 변경 사실은 기록에 포함시키는 것이다. 내부 리팩토링, 설정 변경, 의존성 업데이트 같은 작업도 나중에 회귀 이슈를 추적할 때 결정적인 단서가 되기 때문이다.

체인지로그는 감상이나 맥락 설명을 길게 붙이기보다, 공식 문서처럼 무미건조하게 변경 사실을 나열하는 방식이 더 맞다. 핵심만 간결하게 적되, 누락 없이 남기는 것이 목표다.

**내가 쓰려는 템플릿:**

```
## v1.3.0 (2025-12-17)

### Added (신규 기능)
- 관리자 검색 필터 추가

### Changed (변경 기능)
- 정렬 기준 기본값 변경

### Fixed (수정/버그)
- 특정 조건에서 목록이 비어 보이던 버그 수정

### Removed (삭제 기능)
- 사용되지 않는 레거시 옵션 제거

### Compatibility (호환성 이슈)
- 환경변수 이름 변경으로 배포 설정 수정 필요
```

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-18/35a05fd1dbae70f9.jpg)

### 2) README는 순서를 고정한다

README를 "소개 글"이 아니라, 처음 보는 사람이 빠르게 실행하고 이해하도록 돕는 사용 설명서로 정의한다. 앞으로는 README를 아래 순서로 고정해 작성하려 한다.

- **간략한 소개**: 무엇을 해결하는지 한 문장 + 핵심 기능

- **사용 준비**: 설치 방법, 요구 버전, 환경변수, 실행 전 체크사항

- **사용 방법**: 기본 사용 흐름(가장 흔한 시나리오부터)

- **예시 코드**: 복붙 가능한 최소 예제(1~2개), 입력/출력까지 포함

순서를 고정하면 "잘 쓰려다 멈추는" 일이 줄고, 프로젝트가 커져도 README가 일관된 형식으로 유지될 가능성이 높아진다.

### 3) 블로그 글에는 "읽는 시간"을 표시한다

앞으로 블로그 글 상단에 **예상 읽는 시간(Reading time)**을 넣으려 한다. 독자는 글을 클릭하기 전에 소요 시간을 알면 부담이 줄고, 소비 여부를 빠르게 판단할 수 있다. 글이 짧든 길든 "몇 분이면 읽는지"를 명확히 보여주는 것이 사용자 친화적이다.

### 4) 내용 아이디어는 마인드맵으로 먼저 그린다

글을 쓰기 어려운 가장 큰 이유는 문장력이 아니라, 구조가 머릿속에서 정리되지 않았기 때문인 경우가 많다. 그래서 글을 쓰기 전에 먼저 주제와 하위 내용을 마인드맵으로 빠르게 펼쳐 흐름을 만든 뒤, 그 구조를 목차로 변환해 작성하려 한다.

특히 **"핵심 메시지 &rarr; 근거/예시 &rarr; 적용 계획 &rarr; 마무리"** 순서로 가지를 뻗으면 글이 산으로 가지 않고, 처음부터 끝까지 논리 흐름이 유지된다.

## 마무리

### 개인 소감

이 책을 읽으면서 가장 크게 와닿았던 건, 글쓰기의 핵심은 "잘 쓰기"가 아니라 "일단 남기기"라는 점이었다. 과거 프로젝트의 의사결정 과정이나 트러블슈팅 경험을 떠올리려 하면 잘 기억나지 않는 경우가 많았다. 당시엔 분명 고민하고 해결했던 문제들인데, 기록이 없으니 머릿속에서 흐릿하게 사라져버린 것이다.

이제는 완벽한 문서를 만들려다 시작조차 못 하는 대신, 작은 메모라도 남기는 것부터 시작하려 한다. 체인지로그 한 줄, 커밋 메시지 한 문장이라도 명확하게 쓰는 습관이 쌓이면, 나중에 그것들이 나를 설명하는 든든한 기록이 될 거라 믿는다. 결국 기록은 미래의 나를 위한 가장 확실한 투자다.

### 추천 대상

✅ 사이드 프로젝트를 하면서 README/문서가 늘 빈약하게 끝나는 사람
✅ 팀 프로젝트에서 공유/정리가 부담스러운 사람
✅ 블로그를 쓰고 싶지만 첫 문장에서 멈추는 사람
✅ "기록 습관"을 시스템으로 만들고 싶은 개발자!', '『개발자는 글을 못 쓴다고요?』 서평 기본 정보제목: 개발자는 글을 못 쓴다고요?저자: 전정은, 황수정출판사: 제이펍읽은 기간: 2025년 12월 3일 ~ 12월 17일읽게 된 이유프로젝트를 진행할 때 기능 구현은 어떻게든 해내지만, 문서화는 늘 뒤로 밀리는 편이었다. README는 비어 있거나 최소한의 실행 방법만 남아', (SELECT id FROM categories WHERE slug = 'book-review' LIMIT 1), 'blog/tistory/tistory-18/9b82ed4e7a4cccde.jpg', '2026-02-04T17:21:45+09:00', '2026-02-04T17:21:45+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_18';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_16', 'tistory-16', '[Nextjs] Next.js로 구현하는 로그인', '## 1. 왜 인증이 중요한가?

웹에서 인증은 필수적인 기능이다. 사용자의 데이터를 보호하고, 로그인한 사용자만 특정 기능을 이용할 수 있도록 제한하는 것이 중요하다.

인증 방식에는 여러 가지가 있지만, 이번 강의에서는 세션 기반 인증을 배웠다. 특히 **Next.js의 서버 액션과 Lucia 인증 라이브러리**를 활용하여 **인증 시스템**을 구현하는 방법을 살펴보겠습니다.

## 2. Lucia vs NextAuth: 어떤 인증 라이브러리를 선택할까?

강의에서 Next.js에서 인증을 구현할 때 유명한 두 라이브러리로 **Lucia**와 **NextAuth.js** 얘기가 나왔다. 궁금해져서 지피티에게 물어보았다. 강의에서는 현재 **NextAuth.js**에 오류가 있어 **Lucia**를 선택하였다.

### 1️⃣ **Lucia**

✅ **세션 기반 인증** 지원 (쿠키 기반, 서버에서 인증 관리)

✅ **완전한 서버 사이드 인증** (API 없이 서버 액션으로 인증 가능)

✅ **직접적인 제어 가능** (커스텀 인증 시스템을 쉽게 구성 가능)

✅ **OAuth 지원은 제한적** (직접 구현 필요)

**💡 추천 대상**: 서버 액션 기반 인증을 원하고, **커스텀 인증 시스템을 구축하고 싶은 경우**

### 2️⃣ **NextAuth.js**

✅ **OAuth 소셜 로그인 지원** (Google, GitHub 등 다양한 제공자 지원)

✅ **JWT 기반 인증** (세션 대신 토큰을 사용)

✅ **설정이 간편** (빠른 설정 가능)

✅ **서버리스 환경에 적합**

**💡 추천 대상**: 빠른 OAuth 소셜 로그인 구현이 필요하고, **클라이언트 중심의 인증을 원할 경우**

**👉 결론**: Lucia는 **세션 기반 인증을 세밀하게 제어하고 싶은 경우** 적합하며, NextAuth.js는 **OAuth를 쉽게 적용하고 싶을 때 유용**합니다.

## 3. 프로젝트 개요

이번 인증 시스템은 다음과 같은 기능을 포함한다.

✅ **회원가입**: 사용자를 등록하고 비밀번호를 안전하게 저장한다.

✅ **로그인**: 이메일과 비밀번호를 입력해 인증한다.

✅ **로그아웃**: 세션을 삭제하여 로그아웃한다.

✅ **인증 확인**: 현재 사용자의 로그인 상태를 확인한다.

✅ **보호된 페이지**: 로그인한 사용자만 접근 가능하게 만든다.

## 4. 회원가입 기능 구현 (`signup` 분석)

회원가입은 이메일과 비밀번호를 입력받아 **비밀번호를 해싱하여 저장**하고, **로그인 세션을 생성**하는 방식으로 동작한다.

### 🔍 코드 분석

```
''use server'';
import { redirect } from ''next/navigation'';
import { hashUserPassword } from ''@/lib/hash'';
import { createUser } from ''@/lib/user'';
import { createAuthSession } from ''@/lib/auth'';

export async function signup(prevState, formData) {
 const email = formData.get(''email'');
 const password = formData.get(''password'');

if (!email.includes(''@'') || password.length

## 5. 로그인 기능 구현 (`login` 분석)

사용자가 입력한 이메일과 비밀번호를 확인하고, **세션을 생성하여 로그인 상태를 유지한다**.

### 🔍 코드 분석

```
export async function login(prevState, formData) {
 const email = formData.get(''email'');
 const password = formData.get(''password'');

const existingUser = getUserByEmail(email);

if (!existingUser) {
 return {
 errors: {
 email: ''Could not authenticate user, please check your credentials.'',
 },
 };
 }

const isValidPassword = verifyPassword(existingUser.password, password);

if (!isValidPassword) {
 return {
 errors: {
 password: ''Could not authenticate user, please check your credentials.'',
 },
 };
 }

await createAuthSession(existingUser.id);
 redirect(''/training'');
}
```

✅ 이메일과 비밀번호 검증 후 **세션 생성**

✅ 오류 발생시 **오류 메시지 출력**

✅ 로그인 성공 시 **사용자 페이지로 이동**

## 6. 로그아웃 기능 구현 (`logout` 분석)

로그아웃 시 **세션을 삭제하고 홈페이지로 이동**합니다.

### 🔍 코드 분석

```
export async function logout() {
 await destroySession();
 redirect(''/'');
}
```

✅ 세션을 삭제하여 **로그아웃 처리**

✅ 홈페이지(`/`)로 리디렉트

## 7. 인증 확인 (`verifyAuth` 분석)

쿠키를 확인하여 **현재 로그인된 사용자를 조회**한다.

### 🔍 코드 분석

```
export async function verifyAuth() {
 const sessionCookie = cookies().get(lucia.sessionCookieName);

if (!sessionCookie) {
 return {
 user: null,
 session: null,
 };
 }

const sessionId = sessionCookie.value;

if (!sessionId) {
 return {
 user: null,
 session: null,
 };
 }

const result = await lucia.validateSession(sessionId);

try {
 if (result.session && result.session.fresh) {
 const sessionCookie = lucia.createSessionCookie(result.session.id);
 cookies().set(
 sessionCookie.name,
 sessionCookie.value,
 sessionCookie.attributes
 );
 }
 if (!result.session) {
 const sessionCookie = lucia.createBlankSessionCookie();
 cookies().set(
 sessionCookie.name,
 sessionCookie.value,
 sessionCookie.attributes
 );
 }
 } catch {}

return result;
}
```

✅ **쿠키에서 세션을 가져와 유효성 검사**

✅ 로그인된 사용자 정보 반환

## 8. 보호된 페이지 (`training/page.js` 분석)

로그인한 사용자만 `training` 페이지에 접근할 수 있도록 설정한다.

### 🔍 코드 분석

```
export default async function TrainingPage() {
 const result = await verifyAuth();
 if (!result.user) return redirect(''/'');

return (
 
 Find your favorite activity 
 {/* 트레이닝 리스트 출력 */}
 
 );
}
```

✅ **로그인 확인 후 페이지 렌더링**

✅ 로그인하지 않은 사용자는 **홈으로 리디렉트**

## 9. 마무리 및 결론

이번 강의에서는 **Next.js + Lucia를 활용한 세션 기반 인증 시스템**을 구현하는 방법을 살펴보았다.

### 🔑 **정리**

- **Lucia**를 사용하여 **세션 기반 인증**을 구축

- **Next.js 서버 액션**을 활용하여 **API 없이도 인증 가능**

- **로그인한 사용자만 접근할 수 있는 보호된 페이지 구현**', '1. 왜 인증이 중요한가?웹에서 인증은 필수적인 기능이다. 사용자의 데이터를 보호하고, 로그인한 사용자만 특정 기능을 이용할 수 있도록 제한하는 것이 중요하다.인증 방식에는 여러 가지가 있지만, 이번 강의에서는 세션 기반 인증을 배웠다. 특히 Next.js의 서버 액션과 Lucia 인증 라이브러리를 활용하여 인증 시스템을', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), NULL, '2025-03-12T11:58:28+09:00', '2025-03-12T11:58:28+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_16';
INSERT INTO tags (id, name, slug) VALUES ('tag_next', 'Next', 'next') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_16', (SELECT id FROM tags WHERE slug = 'next' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_nextjs', 'Nextjs', 'nextjs') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_16', (SELECT id FROM tags WHERE slug = 'nextjs' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_e225a6fd', 'Tistory Tag E225a6fd', 'tistory-tag-e225a6fd') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_16', (SELECT id FROM tags WHERE slug = 'tistory-tag-e225a6fd' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_15', 'tistory-15', '[Next.js] 서버 컴포넌트 vs 클라이언트 컴포넌트', '강의를 듣다 저번 Nextjs 프로젝트 할때 가장 어려웠던 서버 컴포넌트와 클라이언트 컴포넌트에 대한 내용이 나왔다. 넥스트로 프로젝트를 처음해봤어서 편하다는 이유로 최상단 루트에 클라이언트 컴포넌트를 선언하고 개발을 진행했다. 그리고 개발이 다 끝나고 나서야 알았다. 이게 얼마나 멍청한 짓이였는지를..

그래서 저번과 같은 실수를 반복하지 않기 위해 서버 컴포넌트와 클라이언트 컴포넌트에 대해 정리를 해보기로 했다.

서버 컴포넌트 vs 클라이언트 컴포넌트

## 서버 컴포넌트란

서버 컴포넌트는 서버 측에서 렌더링되고 처리되는 React 컴포넌트이다. 그리고 넥스트의 모든 컴포넌트들은 기본적으로 서버 컴포넌트로 동작한다.

또한 주요 특징은 다음과 같다:

- **서버 측 렌더링**: 컴포넌트가 서버에서 직접 렌더링되어 초기 로드 속도를 개선한다.

- **정적 생성**: 빌드 시점에 HTML을 생성하여 성능을 최적화한다.

- **데이터 페칭 최적화**: 서버에서 직접 데이터를 가져와 클라이언트 번들 크기를 줄인다.

### SEO와 성능 이점

서버 컴포넌트는 SEO(검색 엔진 최적화) 측면에서 중요한 장점을 제공한다:

- 완전한 HTML 콘텐츠 생성

- 초기 페이지 로드 속도 향상

- 검색 엔진 크롤러가 쉽게 색인할 수 있는 콘텐츠

> 크롤링 동작 방법

- **URL 발견**: 크롤링 봇은 사이트맵, 외부 링크, 기존 데이터베이스를 통해 새로운 및 기존 웹페이지의 URL을 찾는다.

- **크롤링**: 수집된 URL을 방문하여 페이지의 HTML 코드를 다운로드한다.

- **콘텐츠 분석**: 페이지의 텍스트, 이미지, 링크 등을 분석하여 콘텐츠의 주제와 내용을 파악한다.

- **인덱싱**: 분석된 데이터를 검색 엔진의 인덱스에 저장한다.

- **순위 결정**: 저장된 데이터는 다양한 기준을 통해 평가되어 검색 결과에서의 순위가 결정된다.

- **갱신 및 재크롤링**: 페이지의 내용이 업데이트되면 크롤링 봇은 다시 방문하여 정보를 최신 상태로 갱신한다.

### 클라이언트 코드 감소의 이점

서버 컴포넌트를 사용하면 클라이언트로 전송되는 JavaScript 코드의 양을 크게 줄일 수 있어, 다음과 같은 이점이 있다:

- 더 빠른 애플리케이션 로딩 시간

- 대역폭 사용량 감소

## 클라이언트 컴포넌트

### 주요 기능과 사용법

클라이언트 컴포넌트는 브라우저에서 렌더링되고 상호작용하는 React 컴포넌트입니다. ''use client'' 지시어를 통해 정의된다. 브라우저에서 동작해야하는 컴포넌트들은 클라이언트 컴포넌트로 선언해야한다. 그리고 또한 클라이언트 컴포넌트는 최하위 루트에 있는것이 좋다.

```
''use client'';

import { useState } from ''react'';

export default function InteractiveComponent() {
 const [count, setCount] = useState(0);

return (
 
 Count: {count}

setCount(count + 1)}>
 Increment
 
 
 );
}
```

### 상태 관리 및 이벤트 핸들링

클라이언트 컴포넌트의 주요 강점:

- 동적 상호작용 지원

- 실시간 상태 업데이트

- 복잡한 이벤트 핸들링

- React Hooks 완전 지원

### ''use client'' 지시어의 역할

''use client'' 지시어는 특정 컴포넌트와 그 자식 컴포넌트를 클라이언트 측에서 렌더링하도록 명시적으로 지정한다.

## 컴포넌트 선택 가이드

- **서버 컴포넌트 사용**:

정적 콘텐츠 렌더링

- SEO가 중요한 페이지

- 데이터베이스 또는 서버 리소스 접근 시

- **클라이언트 컴포넌트 사용**:

사용자 상호작용이 많은 UI

- 동적 상태 관리 필요 시

- 브라우저 API 사용 시

### 연관 공부할 것들

- 하이드레이션, SSR, CSR, SEO

- SEO (Search Engine Optimization)', '강의를 듣다 저번 Nextjs 프로젝트 할때 가장 어려웠던 서버 컴포넌트와 클라이언트 컴포넌트에 대한 내용이 나왔다. 넥스트로 프로젝트를 처음해봤어서 편하다는 이유로 최상단 루트에 클라이언트 컴포넌트를 선언하고 개발을 진행했다. 그리고 개발이 다 끝나고 나서야 알았다. 이게 얼마나 멍청한 짓이였는지를.. 그래서 저번과 같', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), NULL, '2025-03-04T21:16:08+09:00', '2025-03-04T21:16:08+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_15';
INSERT INTO tags (id, name, slug) VALUES ('tag_nextjs', 'Nextjs', 'nextjs') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_15', (SELECT id FROM tags WHERE slug = 'nextjs' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_91128800', 'Tistory Tag 91128800', 'tistory-tag-91128800') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_15', (SELECT id FROM tags WHERE slug = 'tistory-tag-91128800' LIMIT 1));
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_fac711c0', 'Tistory Tag Fac711c0', 'tistory-tag-fac711c0') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_15', (SELECT id FROM tags WHERE slug = 'tistory-tag-fac711c0' LIMIT 1));
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_14', 'tistory-14', 'React-Router-Dom 로더와 액션', '1. Loader와 Action은 왜 나오게 되었나?

### 데이터 API의 변화

Loader와 Action이 나오기 전인 React Router DOM v6.4 이전에는 라우팅과 데이터 페칭이 완전히 분리되어 있었습니다. 라우터는 단순히 URL에 따라 어떤 컴포넌트를 렌더링할지만 결정했고, 데이터 로딩은 각 컴포넌트의 책임이었습니다.

```
function ProductPage() {
 const [product, setProduct] = useState(null);
 const [loading, setLoading] = useState(true);
 const { id } = useParams();

useEffect(() => {
 async function loadProduct() {
 setLoading(true);
 try {
 const response = await fetch(`/api/products/${id}`);
 const data = await response.json();
 setProduct(data);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 }

loadProduct();
 }, [id]);

if (loading) return 로딩 중...

;
 if (!product) return 상품을 찾을 수 없습니다.

;

return (
 
 {product.name} 
 {product.description}

가격: {product.price}원

);
}
```

이 방식에는 몇 가지 문제점이 있었습니다:

- 데이터 로딩 시 항상 로딩 상태를 거쳐야 함

- 컴포넌트가 마운트된 후에만 데이터 로딩 시작

- 페이지 전환 시 사용자 경험 저하

- 코드 중복 및 보일러플레이트 증가

### 선언적 라우팅에서 데이터 중심 라우팅으로의 전환

앞선 문제들을 해결하기위해 React Router v6.4에서는 라우팅 구성에 데이터 로딩 로직을 포함시킬 수 있게 되었습니다. 이를 통해 컴포넌트가 렌더링되기 전에 필요한 데이터를 미리 로드할 수 있습니다.

그리고 또한 `createBrowserRouter`는 데이터 로딩 기능을 포함한 라우터 설정을 가능하게 합니다. 기존에 주로 사용되던 ` `와 달리 객체 구성 방식을 사용하여 라우트를 정의합니다.

```
import { 
 createBrowserRouter, 
 RouterProvider, 
 Route 
} from "react-router-dom";

const router = createBrowserRouter([
 {
 path: "/products/:id",
 element: ,
 loader: async ({ params }) => {
 const response = await fetch(`/api/products/${params.id}`);
 if (!response.ok) {
 throw new Response("상품을 찾을 수 없습니다", { status: 404 });
 }
 return response.json();
 },
 errorElement: 
 }
]);

function App() {
 return ;
}
```

`createBrowserRouter`의 주요 이점:

- 데이터 로딩과 라우팅의 통합

- 에러 처리 메커니즘 개선

- 중첩 라우트에서의 데이터 로딩 간소화

- 타입스크립트 지원 강화

2. Loader란 무엇인가? 
Loader는 React Router DOM v6.4에서 도입된 핵심 개념으로, 라우트 컴포넌트가 렌더링되기 전에 필요한 데이터를 비동기적으로 로드할 수 있게 해주는 함수입니다.

### Loader의 기본 개념

Loader는 다음과 같은 특징을 가집니다:

- 라우트 정의 시 함께 선언

- 컴포넌트 렌더링 전에 실행

- 비동기 함수(async/await) 지원

- 다양한 데이터 타입 반환 가능 (객체, 배열, 문자열 등)

```
export async function loader() {
 const response = await fetch("http://localhost:8080/posts");
 if (!response.ok) {
 throw new Response("글 목록을 불러오는데 실패했습니다", { status: 500 });
 }
 const resData = await response.json();
 return resData.posts;
}

const router = createBrowserRouter([
 {
 path: "/",
 element: ,
 loader: postLoader,
 errorElement: 
 }
]);
```

### 페이지 렌더링 전 데이터 로드

Loader를 사용하면 컴포넌트가 렌더링되기 전에 데이터를 로드할 수 있습니다. 이는 사용자 경험을 크게 향상시킵니다:

- 사용자가 경로 이동을 시작하면 즉시 데이터 로딩 시작

- 데이터 로딩이 완료될 때까지 이전 페이지 유지

- 데이터 로딩이 완료되면 새 페이지로 전환

이러한 방식은 빈 로딩 상태를 보여주는 대신 데이터가 준비된 상태로 페이지를 렌더링할 수 있게 해줍니다.

### useLoaderData 훅 활용하기

`useLoaderData` 훅은 현재 라우트의 loader 함수에서 반환된 데이터에 접근할 수 있게 해줍니다:

```
import { useLoaderData, Link } from ''react-router-dom'';

import Modal from ''../components/Modal'';
import classes from ''./PostDetails.module.css'';

function PostDetails() {
 const post = useLoaderData();

if (!post) {
 return (
 
 
 Could not find post 
 Unfortunately, the requested post could not be found.

- 
 Okay

);
 }
 return (
 
 
 {post.author}

{post.body}

);
}

export default PostDetails;
```

### 로딩 상태 관리하기

React Router는 데이터 로딩 중에도 UI를 제어할 수 있는 방법을 제공합니다:

```
import { useNavigation } from "react-router-dom";

function Layout() {
 const navigation = useNavigation();

return (
 
 {navigation.state === "loading" && (
 로딩 중... 
 )}
 
 
 );
}
```

`useNavigation` 훅은 현재 네비게이션 상태를 제공합니다:

`idle`: 네비게이션이 진행 중이지 않음

- `loading`: 데이터 로딩 중

- `submitting`: 폼 제출 처리 중

3. Action의 이해 
Action은 주로 폼 제출과 같은 데이터 변경 작업을 처리하는 데 사용됩니다.

### Action의 기본 개념

Action은 다음과 같은 특징을 가집니다:

- 폼 제출 시 자동으로 호출

- POST, PUT, PATCH, DELETE 같은 데이터 변경 작업에 적합

- 비동기 함수(async/await) 지원

- 폼 데이터 접근 및 처리 가능

```
// Action 함수 정의
export async function action({ request }) {
 const formData = await request.formData();
 const postData = Object.fromEntries(formData);

await fetch("http://localhost:8080/posts", {
 method: "POST",
 body: JSON.stringify(postData),
 headers: {
 "Content-Type": "application/json",
 },
 });

return redirect("/");
}

// 라우트 설정에 Action 추가
const router = createBrowserRouter([
 {
 path: "/create-post",
 element: ,
 action: newPostAction,
 }
]);
```

### 폼 제출 처리하기

React Router는 ` ` 컴포넌트를 제공하여 폼 제출을 쉽게 처리할 수 있게 해줍니다:

```
import { Form, Link, redirect } from "react-router-dom";

function NewPost() {
 return (
 
 
 
 Text

Your name

- 
 Cancel
 
 Submit

);
}
```

` ` 컴포넌트의 이점:

자동으로 가장 가까운 라우트의 action 함수 호출

- JavaScript 없이도 작동 (점진적 향상)

- 네비게이션 상태 관리 통합

### useActionData 훅 활용하기

`useActionData` 훅을 사용하면 action 함수에서 반환된 데이터에 접근할 수 있습니다. 이는 폼 유효성 검사 오류나 서버 응답을 처리하는 데 유용합니다:

```
import { Form, useActionData } from "react-router-dom";

function NewProductPage() {
 const actionData = useActionData();

return (
 
 새 상품 등록 
 {actionData?.errors && (

{Object.values(actionData.errors).map(error => (
 
- {error}
 ))}

)}
 
 {/* 폼 필드 */}
 등록하기 
 
 
 );
}

// Action 함수
export async function action({ request }) {
 const formData = await request.formData();
 const productData = {
 name: formData.get("name"),
 price: Number(formData.get("price")),
 description: formData.get("description")
 };

const errors = validateProduct(productData);
 if (Object.keys(errors).length > 0) {
 return { errors };
 }

// 유효성 검사 통과 시 데이터 저장
 await saveProduct(productData);
 return redirect("/products");
}
```

### 데이터 변경 후 리다이렉션

Action 함수는 일반적으로 데이터 변경 후 다른 페이지로 리다이렉트합니다. React Router는 `redirect` 유틸리티 함수를 제공합니다:

```
import { redirect } from "react-router-dom";

// Action 함수 정의
export async function action({ request }) {
 const formData = await request.formData();
 const postData = Object.fromEntries(formData);

await fetch("http://localhost:8080/posts", {
 method: "POST",
 body: JSON.stringify(postData),
 headers: {
 "Content-Type": "application/json",
 },
 });

return redirect("/");
}
```

Action 함수에서 리다이렉션을 수행하면 브라우저 URL이 자동으로 변경되고, 새 경로에 대한 loader 함수가 실행됩니다. 이를 통해 데이터 변경 후 최신 데이터를 보여줄 수 있습니다.', '1. Loader와 Action은 왜 나오게 되었나?데이터 API의 변화Loader와 Action이 나오기 전인 React Router DOM v6.4 이전에는 라우팅과 데이터 페칭이 완전히 분리되어 있었습니다. 라우터는 단순히 URL에 따라 어떤 컴포넌트를 렌더링할지만 결정했고, 데이터 로딩은 각 컴포넌트의 책임이었습니', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), NULL, '2025-02-26T03:44:30+09:00', '2025-02-26T03:44:30+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_14';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_13', 'tistory-13', '2025 ICT 인턴십 합격 후기', '1. ICT 지원 동기 
ICT를 하게 된 이유는 사실 되게 간단하다.

4학년이 되고 난 후, 학교에서 듣고 싶은 과목이 없었고

인턴을 하며 실전 경험을 쌓고 싶었기 때문에 지원하게 되었다.

2. 어떤 기업에 지원했나 
ICT는 총 3개의 기업에 지원을 할 수 있었다.

그 중에서 내가 충분히 어필할 수 있는 내용의 프로젝트를 진행하는 기업에 지원했다.

## 2-1. A 기업

다른 기업들에게 솔루션을 제공하는 기업이었다.

그리고 또한 내가 지원하는 기업들중 가장 규모있는 기업이었다.

이미 진행중인 프로젝트에 내가 구현한 기능을 넣는다는 것이 매력적으로 다가왔다.

## 2-2. B 기업

지원 이유는?

내가 이전에 해본 프로젝트들과 가장 핏한 기업이 아니였나 싶다.

그 만큼 어필할 수 있는 점이 많았고, 잘 어필한다면 합격 가능성이 제일 크다고 생각해 지원했다.

## 2-3. C 기업

내가 지원한 기업들중 가장 가까운 기업이었다.

또한 원래 지원하려고 뽑아둔 리스트에 있었는데, 지인이 여기에서 인턴을 한 경험이 있어 조언을 듣고 마음을 굳혀 지원하게 되었다.

3. 준비 과정

## 3-1. 서류준비

서류는 이력서 + 자기소개서로 준비했다.

서류 준비 기간과 동아리 LT 기간이 겹처서 고생했다. 동아리 LT 기획을 맡으면서 시간 확보가 어려웠는데 서류 스터디를 통해 작성해놓은 초안이 많은 도움이 되었던거 같다.

### 이력서

점핏을 통해 작성했다. 최대한 적은 장수를 만들려고 노력했다. 기술스택과 프로젝트 3개, 학력, 교육이력, 동아리 이력을 넣었다. 총 3장의 분량이 나왔다.

프로젝트는 프로젝트 소개란에

> 프로젝트 목적

- 프로젝트에서 맡은 일 + 성과

- 프로젝트에서 맡은 일 + 성과

- 프로젝트에서 맡은 일 + 성과

처럼 작성했다.

그리고 성과는 최대한 수치화해서 작성하려고 노력했다.

### 자기소개서

워드로 작성했으며 자유 양식이였기에 자기소개 + 지원동기, 직무경험, 직무를 위한 준비 과정 3가지 분류로 작성했다. 또한 각 문항에 맞게 소제목도 작성했다.

자기소개서는 기업에 맞게 3개를 작성했다. 또한 자기소개 + 지원동기만 수정하여 복붙한것이 아니라 기업에 어필할 수 있는 경험과 강점을 찾아서 반영했다. 위에 이력서에 프로젝트 또한 이 경험과 강점에서 드러난 프로젝트만 기입했다.

자기소개 + 지원동기는

> 간단한 자기소개
프로젝트 경험을 통해 내가 어떻게 이 회사에 기여할 수 있을지
내가 이 기업에서 어떻게 성장할 수 있을지
왜 지원하게 되었는지

크게 이렇게 4가지에 맞춰서 작성했다.

그리고 직무경험과 준비과정도 인턴십인 만큼 내가 이 회사에 얼마나 많이 기여를 할 수 있을지 보다, 내가 이런 경험으로 이렇게 성장했는데 회사에서 이런 일에 기여를 하며 성장해 보탬이 되겠다 라는 늬앙스로 작성했다.

## 3-2. 면접준비

자소서를 기반으로 면접 문항을 뽑아서 답을 작성해보고 키워드를 외웠다.

하지만 1분 자기소개와 같은 경우에는 면접의 분위기를 결정한다 해서 툭 치면 나올만큼 달달 외웠다.

또한 다른 후기들을 찾아보며 많이 나왔던 기술 면접에 대비를 했다.

(다 붙진 못해서 꿀팁인지는 모르겠으나) 여기서 꿀팁은 이력서와 자소서, 기업 소개등을 클로드에 넣고 면접 시뮬레이션을 돌려봤다. 꼬리 질문을 잘만들어주어 내가 준비를 안했던 부분도 보완할 수 있게 해줬다.

그리고 또한 실습생 직무란에 나와있는 거 위주로 기술 면접을 준비했다.

4. 면접

## 4-1. A 기업

3대1로 면접이 이루어졌다. 백엔드 개발자 두 분, 프론트 리드 한 분이 들어오셨다.

마지막 면접이였는데도 덜덜 떨었다. 긴장한게 눈에 보여서 물을 주시며, “물 마시면서 편하게 하세요” 라고 해주셨다.

면접때 모르는 개념이 3~4개 있었는데 그때마다 잘 설명해주셨다. 그래서 면접볼때 마음을 굳혔다. 여기가 붙게 된다면 무조건 여기로 와야겠다고. 면접 분위기가 다른 곳들 보다 정말 좋았던 거 같다.

### 면접 질문

- 브라우저의 동적 관련해서 물어보셨다

URL 입력했을때 페이지 표시되는 과정

- HTTP와 HTTPS의 차이점

- CORS 관련

- 다른 질문들을 주로 브라우저의 보안에 대해서 물어보셨다.

- 자바스크립트 관련

싱글 스레드와 비동기 처리 방식

- 이벤트 루프 동작 방식

- 변수 선언

- 컴퓨터 기초

스레드와 프로세스 차이

- 멀티 스레드를 선호하는 이유

- 기타

프론트엔드 개발을 선택한 이유

- 최신 트렌드 파악하는 방법

이 정도의 질문을 하셨던거 같은데 가장 기억에 남는 질문을 최신 트렌드를 파악하는 방법이다. korea FE article을 구독해두고 메일로 받아보고 있는데 아침에 아티클 하나를 보고 간 것이 답변에 큰 도움이 된것 같다. 메일로 구독해서 받아보고 있다고 말씀드리고 가장 최근의 본 아티클이 아침에 본 이거였다라고 말씀드렸더니 좋아하시는 것 같았다.

## 4-2. B 기업

2대1로 면접이 이루어졌다. 백엔드 개발자 두 분이 들어오셨다.

면접 분위기가 별로였었다. 그래서 그런지 질문을 기억에서 다 지워버린거 같다.

두 분중 한 분은 마이크가 잘안들려서 계속 질문을 다시 요청드렸다.

## 4-3. C 기업

3대1로 면접이 이루어졌다. 직무를 얘기를 안해주셔서 잘 모르겠다.

여기가 첫면접이였는데, 자기소개도 안시키시고 그냥 대화형식으로 진행되었다. 내가 예상한 면접과는 달라서 깜짝 놀랐다. 그리고 면접 볼때 옆건물로 들어가서 회사를 찾느라 고생했다.

### 면접 질문

- 취미가 뭐냐

- 프로젝트 관련 질문들

옛날 프로젝트 질문들을 하셨는데 잘 정리를 안해놓아서 대답을 잘못했다.

- 코테 잘풀었던데 따로 준비하나요

유일하게 코테가 있던 기업이라, 면접때 답변하기 위해 코딩테스트 코드들을 다시 보며 왜 이렇게 구현했는지 어떻게 답할지 다 준비해갔었는데 코테 관련 질문이 저거 하나였던게 아쉬웠다.

면접 분위기가 괜찮았다.

5. 최종 결과 
A기업 합격, B기업 불합격, C기업 예비 합격을 받았다.

첫 지원이였는데 모두 서류 합격을 한 것은 생각보다 의외였던거 같다.

그리고 맨 마지막에 거의 포기 상태였던 A기업이 합격해서 기분이 좋았다.

또 편입생이라 ICT랑 학교에서 확정이라고 말하기 전까지 불안했다.

다른 학교들 찾아보니까 편입생이라서 학교에서 안된다고 한데가 있었다길래..

그리고 과사에서도 자꾸 어려울거 같다는 뉘앙스로 말했기 때문에..

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-13/ee7a9781b533b739.png)

6. 회고 
프로젝트를 진행하면서 정리를 확실히 해놔야겠다고 생각했다.

이 스택은 왜 썼는지, 중요한 기능을 구현할때 왜 이런식으로 구현했는지 등에 대해서 정리를 잘 해놓아야 나중에 면접을 준비할때 용이하다고 생각이 들었다.

또한 코테도 미리미리 준비해놔야겠다고 생각이 들었다.

내가 잘 설명하지 못할 부분들은 이력서에서 과감히 없애는게 맞다고 생각이 들었다.

이런 부분에서 질문이 들어왔을때 당황을 하니, 면접관분들이 얘가 진짜로 한게 맞나라는 생각을 하시는 것 같았다.

면접 결과 나올때 같이 있던 동아리 친구들이 케이크도 사줬는데 기분이 좋았다.

알고 지낸지는 얼마돼지 않았지만, 가족과도 같아진 친구들인것같다.

애들아 정말 고맙고, 사랑해 너네 취업할때 보자 배로 갚아줄게

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-13/cfac3eb4e12129d0.png)', '1. ICT 지원 동기ICT를 하게 된 이유는 사실 되게 간단하다.4학년이 되고 난 후, 학교에서 듣고 싶은 과목이 없었고인턴을 하며 실전 경험을 쌓고 싶었기 때문에 지원하게 되었다.2. 어떤 기업에 지원했나ICT는 총 3개의 기업에 지원을 할 수 있었다.그 중에서 내가 충분히 어필할 수 있는 내용의 프로젝트를 진행하는 ', (SELECT id FROM categories WHERE slug = 'retrospective' LIMIT 1), 'blog/tistory/tistory-13/ee7a9781b533b739.png', '2025-02-26T03:43:57+09:00', '2025-02-26T03:43:57+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_13';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_12', 'tistory-12', '깃허브 액션으로 CI해보기', '저번 테커 부트캠프때 깃허브를 이용해서 CI/CD를 해봤는데 지금 읽는 스터디 책에 깃허브로 CI하는 내용이 있어서 정리 한 번 해보고 코드에 반영을 할 수 있으면 반영까지 해보려고 한다!

## CI란?

우선 기본적인 CI의 정의는 Continuous Integration(지속적 통합)의 약자로, 소프트웨어 개발에서 자주 사용하는 개발 관행 및 프로세스이다.

코드에 CI를 적용함으로써 팀 구성원이 각자의 코드를 주기적으로 공통 레포지토리에 통합하는 작업을 자동화하여, 통합 과정에서 발생할 수 있는 문제를 조기에 발견하고 해결하도록 돕는다.

### CI의 주요 개념

- **지속적 통합(Continuous Integration)**:

개발자가 작업 중인 코드를 자주(하루에도 여러 번) 공유 리포지토리에 푸시하여 다른 개발자의 코드와 통합.

- 통합 시 자동화된 빌드와 테스트를 실행해 코드의 품질을 검증.

- **자동화된 빌드**:

코드를 푸시하면 CI 시스템이 자동으로 애플리케이션을 빌드(컴파일)합니다.

- 빌드 실패를 통해 코드 오류를 조기에 발견.

- **자동화된 테스트**:

푸시된 코드에 대해 자동화된 테스트(유닛 테스트, 통합 테스트 등)를 실행하여 코드 변경으로 인한 문제를 방지.

- **코드 품질 관리**:

CI는 린트(Lint), 코드 스타일 검사 등을 포함해 코드의 일관성과 품질을 유지.

### CI의 목표

- **코드 안정성**: 자주 통합하고 테스트하여 문제를 조기에 발견하고 수정.

- **효율성 향상**: 반복적인 수작업(빌드, 테스트)을 자동화.

- **팀 협업 개선**: 여러 개발자가 동시에 작업하는 상황에서 통합 문제를 최소화.

- **빠른 피드백**: 코드 문제를 빠르게 알림으로써 개발 속도와 품질 향상.

## 깃허브 액션 CI

### 깃허브 액션의 기본 개념

- 러너

GitHub Actions 워크플로우를 실행하는 실제 머신(컴퓨터)이다.

- 워크플로우 파일에 정의된 명령어를 실행하는 역할을 담당

- 깃허브 호스팅 러너나 셀프 호스팅 러너를 사용할 수 있다.

- 액션

워크플로우의 단위 작업으로, 특정 작업(예: 빌드, 테스트, 배포)을 수행하는 재사용 가능한 코드 블록이다.

- 액션은 주로 **JavaScript** 또는 **Docker 컨테이너**로 작성된다.

- `GitHub Marketplace`에서 다양한 액션을 다운로드하여 사용 가능 하다.

- 이벤트

워크플로우를 트리거(시작)하는 특정 활동입니다.

`push`: 특정 브랜치에 코드가 푸시될 때 트리거.

- `pull_request`: PR(풀 리퀘스트)이 생성되거나 업데이트될 때 트리거.

- `workflow_dispatch`: 수동으로 워크플로우를 실행.

- `schedule`: 크론(Cron) 표현식을 사용한 스케줄러.

- 잡

워크플로우에서 실행되는 독립적인 작업의 집합입니다.

- 각 잡은 **독립적인 러너**에서 실행됩니다.

- 잡 간의 의존성을 설정할 수 있습니다.

- 스텝

잡 안에서 실행되는 단일 작업입니다.

- 스크립트 명령어 또는 액션을 실행합니다.

💡

스텝들을 엮어서 잡을 만들고, 이러한 여러 개의 잡은 병렬로 실행되며, 이러한 잡을 하나 이상 모아둔 것을 액션이라고 한다.

### 깃허브 액션 작성하기

깃허브 액션은 저장소의 루트에 .github/workflows 폴더를 생성하고 .yml 파일로 작성하면 된다.

```
name: chapter7 build
run-name: ${{ github.actor }} has been added new commit.

on:
 push:
 branches-ignore:
 - ''main''

jobs:
 build: # 예약어가 아니라, 사용자가 지정한 잡안에 있는 스텝의 이름이다.
 runs-on: ubuntu-latest # 러너를 설정한다. 
 steps: # 순차적으로 실행할 작업을 설정한다.
 - uses: actions/checkout@v3
 - uses: actions/setup-node@v3
 with:
 node-version: 16
 - name: ''install dependencies'' # 스템의 이름
 working-directory: ./chapter7/my-app # 이 폴더에서
 run: npm ci # 이 명령어를 실행
 - name: ''build''
 working-directory: ./chapter7/my-app
 run: npm run build
```

name → 액션의 이름

run-name → 액션이 실행될 때 구별할 수 있는 이름

github.actor → 해당 액션을 트리거 한 사람

on → 필수 값으로 언제 액션이 실행될지를 정한다.

jobs → 필수 값으로, 해당 액션에서 실행할 잡을 의미함

### 브랜치 보호 규칙

무조건 성공해야하는 액션이 있다면 해당 레포에 Settings → code and automation → Branch로 들어가서

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-12/5f8d066a889543e6.png)

다음과 같이 설정하면 main 브랜치에는 액션이 성공하기 전까지 머지를 막을 수 있다!', '저번 테커 부트캠프때 깃허브를 이용해서 CI/CD를 해봤는데 지금 읽는 스터디 책에 깃허브로 CI하는 내용이 있어서 정리 한 번 해보고 코드에 반영을 할 수 있으면 반영까지 해보려고 한다!CI란?우선 기본적인 CI의 정의는 Continuous Integration(지속적 통합)의 약자로, 소프트웨어 개발에서 자주 사용하는', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-12/5f8d066a889543e6.png', '2025-02-26T03:43:21+09:00', '2025-02-26T03:43:21+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_12';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_11', 'tistory-11', '[React] 리액트 개발 도구를 활용해 좋은 웹 어플리케이션 만들기', '디버깅은 프로그래밍에서 가장 중요한 요소중 하나다. 잘못된 동작을 찾아내는 것은 때론 간단하지만, 여러 라이브러리와 작성된 코드들이 섞인다면 잘못된 동작을 찾아내기란 사막에서 바늘 찾기다. 이때 활용할 수 있는 리액트 개발 도구에 대해 소개해보겠다.

리액트 개발 도구

## 리액트 개발 도구란?

리액트 팀에서 리액트 개발을 더 편리하게 돕기위해 만든 디버깅 툴이다. 리액트 개발도구는 브라우저의 확장 프로그램으로 만들어져있다.

크롬, 파이어폭스, 엣지를 지원하는데 나는 크롬을 사용하기에 크롬에 설치해보았다.

리액트 도구를 설치하고 난 후에 회색으로 뜬다면 **리액트 개발 도구가 정상적으로 접근할 수 없는 페이지**이거나 **리액트로 개발되지 않은 페이지**라는 뜻이고 리액트 로고가 정상적으로 표시된다면, **리액트 개발 도구가 웹 어플리케이션에 정상적으로 접근** 할 수 있다는 뜻이다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/b8be229207b34211.png)

Components 탭 
components 탭에서는 현재 리액트 애플리케이션의 컴포넌트 트리를 확인할 수 있다.

단순히 구조 뿐만 아니라 props와 hooks 등 다양한 정보를 제공한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/8db8212e3dd674c6.png)

## 컴포넌트 트리

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/ec1a5b5a47eefbdc.png)

현재 어플리케이션의 컴포넌트의 트리 구조를 보여주는 부분이다.

기명 함수로 선언된 컴포넌트들은 컴포넌트명을 보여주고, 만약 익명 함수로 선언돼 있다면 Annoymous라는 이름으로 컴포넌트를 보여준다.

리액트 16.8 버전에는 다음과 같은 문제들이 있었는데 16.9로 넘어오면서 해결되었다.

- 익명 함수를 default로 export하면 AnonymousDefaultComponent의 경우 AnonymousDefaultComponent는 코드 내부에서 사용되는 이름의 범위, 실제로 default export로 내보낸 함수의 명칭은 추론할 수 없다. 따라서 _default로 표시된다.

- memo를 사용할 이유로 함수로 만든 컴포넌트를 감싼 경우, 함수형 함수를 줄이지 않고 memo 캐싱을 통해 memo로 감싼지 결과물을 측정했지만 Anonymous로 표시된다. 추가로 memo 캐싱을 통해 memo로 감싼지 결과물은 유의할 수 있다.

- 고자 컴포넌트들이 withSampleHOC로 감싼 HOCcomponent의 경우 두 가지 모두 Anonymous로 식별될 수 있다. 이 또한 고자 컴포넌트들의 명칭을 제대로 추론하지 못하기 때문이다.

그리고 또한 익명 함수를 기명 함수로 바꾸기 어려운 상황이라면 함수에 displayName 속성을 추가할 수 있다.

```
const MemoizedComponent = memo(function() {
return <>MemoizedComponent 
})

MemoizedComponent.displayName = ''메모 컴포넌트 입니다."
```

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/4bc2d3a5ab46b3f0.png)

## 컴포넌트명과 props

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/38463c66792248c6.png)

컴포넌트 트리에서 컴포넌트를 선택했을때 해당 컴포넌트에 대한 자세한 정보를 보여주는 영역이다.

### 1. 컴포넌트명과 Key

위 사진의 컴포넌트의 경우 명칭은 Annoymous 이며 key는 kidsValueProp이라고 하는 객체이다. 빨간색 경고 이모티콘은 해당 애플리케이션이 [strict mode](https://ko.legacy.reactjs.org/docs/strict-mode.html)로 렌더링되지 않았다는 것을 의미한다.

### 2. 컴포넌트 도구

3가지 아이콘이 있다.

- 첫 번째 아이콘은 해당 컴포넌트가 어디에서 렌더링 됐는지 확인할 수 있다. 버튼을 누르면 바로 요소탭으로 이동하며, 해당 컴포넌트가 렌더링한 HTML 요소가 선택된다.

- 두번째 벌레 아이콘을 누른다면, 콘솔 탭에 해당 컴포넌트의 정보가 출력되는 것을 볼 수 있다.

- 세번째 아이콘을 누른다면 해당 컴포넌트의 소스코드를 확인할 수 있다.

### 3. 컴포넌트 프롭스

해당 컴포넌트가 받은 프롭스를 확인할 수 있다. 단순히 원시값뿐 아니라 함수도 포함되어있다.

### 4. 컴포넌트 hooks

컴포넌트에서 사용 중인 훅 정보를 확인할 수 있다. use가 생략돼서 나온다.

### 5. 컴포넌트를 렌더링한 주체, rendered by

해당 컴포넌트를 렌더링한 주체가 누구인지 확인 할 수 있다.

해당 컴포넌트를 렌더링한 부모 컴포넌트까지 확인 가능하다.

## 프로파일러

컴포넌트 메뉴가 정적인 리액트 컴포넌트 트리의 내용을 디버깅위한 도구라면 프로파일러는 리액트가 렌더링하는 과정에서 발생하는 상황을 확인하기 위한 도구다.

어떤 컴포넌트가 렌더링됐는지, 또 몇 차레 렌더링 됐는지, 어디서 오래 걸렸는지 등을 알 수 있다.

렌더링 과정을 기록해야 하기 때문에 프로덕션 빌드로 실행되는 리액트 애플리케이션에서 사용할 수 없다. 그렇기 때문에 개발 모드로 실행되는 애플리케이션을 준비해야 한다.

### 설정

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/e4f5e82510f66723.png)

- Highlight updates when components render: 컴포넌트가 렌더링될 때마다 해당 컴포넌트에 하이라이트를 표시한다.

- 디버깅 탭에 Hide logs during second render in Strict Mode: 리액트 애플리케이션이 엄격 모드로 실행되는 경우, uesEffect 등이 두 번씩 작동하는 의도적인 작동이 숨겨져있다. 이름 막기 위해서는 해당 기능을 활성화하면 된다.

- 프로파일 탭에 Record why component rendered while profiling: 프로파일링 도중 무엇 때문에 컴포넌트가 렌더링됐는지 기록한다.

## 프로파일링

### 프로파일링 메뉴

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/1254b8854c943b9d.png)

- 첫 번째 버튼: 프로파일링 시작 버튼 다시 누르면 프로파일링이 중단되고 프로파일링 결과가 나타난다.

- 두 번째 버튼: 새로고침 후 프로파일링 시작 버튼

- 세 번째 버튼: 프로파일링 종료 버튼, 프로파일링된 현재 내용을 모두 지우는 버튼이다.

- 네 번째 버튼: 프로파일 불러오기

- 다섯 번째 버튼: 프로파일 저장하기 버튼으로 JSON 파일이 다운되며 이를 네번째 버튼으로 다시 불러올 수 있다.

### Flamegraph

불꽃 모양 탭에서는 렌더 커밋별로 어떤 작업이 일어났는지 나타낸다. 각 컴포넌트에 마우스 커서를 가져다 대면 렌더링과 관련된 정보를 확인할 수 있다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/4dd7ec0e23639db5.png)

마우스 커서를 가져다 대면 확인할 수 있는 렌더링 정보 이외에도 오른쪽에는 해당 커밋과 관련된 추가적인 정보를 확인할 수 있다.

어떤 컴포넌트가 렌더링이 얼마나 걸렸는지 확인할 수 있고, 렌더링되지 않은 컴포넌트에 대한 정보도 확인할 수 있다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/7087a91c1a8be4ad.png)

렌더링 되지 않은 컴포넌트는 회색으로 표시된다. 이를 활용하면 의도대로 메모이제이션이 작동하고 있는지, 혹은 특정 상태 변화에 따라 렌더링이 의도대로 되는지 대해 알 수 있다.

### Ranked

해당 커밋에서 렌더링하는 데 오랜 시간이 걸린 컴포넌트를 순서대로 나열한 그래프다.

### 타임라인

타임라인에서는 시간이 지남에 따라 컴포넌트에서 어떤 일이 일어났는지를 확인할 수 있다.

타임라인은 리액트 18 이상에서만 확인 가능하다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-11/f2fcc9d1fd26fd58.png)

타임라인은 시간의 흐름에 따라 리액트가 작동하는 내용을 추적하는 데 유용하다. 시간 단위로 프로파일링 기간 동안 무슨일이 있었는지, 무엇이 렌더링됐고, 또 어느 시점에 렌더링됐는지, 리액트의 유휴시간은 어느정도 였는지 확인할 수 있다.', '디버깅은 프로그래밍에서 가장 중요한 요소중 하나다. 잘못된 동작을 찾아내는 것은 때론 간단하지만, 여러 라이브러리와 작성된 코드들이 섞인다면 잘못된 동작을 찾아내기란 사막에서 바늘 찾기다. 이때 활용할 수 있는 리액트 개발 도구에 대해 소개해보겠다.리액트 개발 도구리액트 개발 도구란?리액트 팀에서 리액트 개발을 더 편리하', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-11/b8be229207b34211.png', '2025-02-26T03:42:53+09:00', '2025-02-26T03:43:29+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_11';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_10', 'tistory-10', '[React] SSR은 뭘까..?', '이 글을 읽는 모두 SSR에 대해 많이 들어봤을것이다.

SSR, 서버 사이드 렌더링 나도 많이 들어봤지만 그게 정확히 뭐야? 라고 한다면 잘 설명하지 못했었던거 같다. 글을 쓰며 정리하고 다시 읽어보며 SSR을 정복해보자!

우선 SSR에 대해 잘 알고 설명할 수 있으려면 SPA에 대하여 잘 알아야한다고 생각한다.

📌 SPA란? 
spa는 뭘까? 스파? 따뜻하겠다.. 가 아니라 싱글 페이지 어플리케이션이다.

싱글 페이지 애플리케이션이란 렌더링과 라우팅에 필요한 대부분의 기능을 서버가 아닌 브라우저의 자바스크립트에 의존하는 방식을 말한다.

최초에 첫 페이지에서 데이터를 모두 불러온 이후에는 페이지 전환을 위한 모든 작업이 자바스크립트로 이루어지기 때문에 페이지를 불러온 이후에는 서버에서 HTML을 받지 않고 하나의 페이지에서 모든 작업을 처리한다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-10/4bddd020c94ee711.gif)

### 🧷 SPA 이전

싱글페이지 어플리케이션 이전에는 페이지를 처음부터 다시 다운 받고 렌더링하는 작업을 거쳐야 했기 때문에, 사용자 입장에서 페이지가 처음부터 다시 만들어지는 것처럼 보였다.

### 🧷 SPA 장점

- **사용자 경험 개선**

한번 로딩이 된 후에는 서버에서 리소스를 받아올 일이 적어지기 때문에 사용자에게 훌륭한 UX를 제공한다.

- **라우팅**

또한, 전통적인 멀티 페이지 어플리케이션과 달리 SPA는 클라이언트 측 라우팅을 사용한다. 페이지 이동이 필요할 때마다 서버에 요청을 보내는 것이 아니라, 브라우저의 히스토리 API를 사용하여 URL을 변경하고, js를 통해 필요한 컨텐츠만 개선한다.

### 🧷 SPA 단점

- **SEO 최적화 어려움**

SPA는 서버에서 HTML이 렌더링되지 않기 때문에 검색 엔진이 페이지 내용을 인식하기 어렵다.

- **초기 로드 시간**

모든 자원을 한 번에 로드해야하므로 초기 로딩 속도가 느리다.

📌 웹 서비스가 진화한다.. 
앞서 설명했듯이 SPA도 충분한 장점을 지닌 기술이다. 하지만 SSR이 나오게 된 계기가 분명히 존재한다.

시간이 흐를수록 많은 양의 리소스가 자바스크립트를 통해 넘어오기 시작했다. 그에 따라서 자바스크립트의 규모도 점차 커지기 시작했다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-10/36ae6c5161c84ce1.png)

다음 사진은 화면에 웹페이지가 완전히 로딩되는 데 걸리는 시간이다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-10/6517e71747b40f8c.png)

기기의 성능은 날이 갈수록 좋아지는데 웹페이지 로딩시간은 여전히 같거나 오히려 길어진것을 확인할 수 있다. 로딩이 오래 걸린다면, 사용자들은 분명 서비스를 이탈할것이다.

📌 그래서 서버 사이드 렌더링🤗 
**싱글 페이지 애플리케이션**이 자바스크립트를 활용해 하나의 페이지에서만 렌더링을 수행한다면, **서버 사이드 렌더링**은 최초에 사용자에게 보여줄 페이지를 서버에서 렌더링해 빠르게 사용자에게 제공하는 방식이다.

“**SPA와 SSR의 큰 차이는 렌더링을 어디서하느냐**” 이다!

### 📌 서버 사이드 렌더링의 장점

- 최초 페이지 진입이 비교적 빠르다.

싱글 페이지 애플리케이션이라면 사용자가 해당 페이지에 진입하고, 자바스크립트 리소스를 다운로드하고, HTTP 요청을 수행한 후 이 결과를 가지고 화면을 렌더링 해야한다.

그러나, 서버 사이드 렌더링은 서버에서 HTTP 요청을 수행하고, HTML도 서버에서 그려서 나오기 때문에 초기 페이지 렌더링이 더 빠르다.

- 검색 엔진과 SNS 공유등 메타데이터 제공이 쉽다.

싱글 페이지 애플리케이션은 대부분의 작동이 자바스크립트에 의존하는데, 메타 정보 또한 마찬가지로 자바스크립트에 의존한다. 검색 엔진이 최초로 페이지에 진입했을때, 이러한 메타 정보를 제공할수 있도록 조치를 취하지 않는다면, 검색 엔진에 불이익이 있을 수 있다. 반면에 서버 사이드 렌더링은 최초의 렌더링 작업이 서버에서 일어나기 때문에 검색 엔진에 정보를 전달하기 더 쉽다.

- 누적 레이아웃 이동이 적다.

**누적 레이아웃 이동**이란 사용자에게 페이지를 보여준 이후에 뒤늦게 어떤 HTML 정보가 추가되거나 삭제되어 마치 화면이 덜컥 거리는 것과 같은 부정적인 사용자 경험을 말한다. 즉, 사용자가 예상치 못한 시점에서 페이지가 변경되어 불편을 초래하는 것을 말한다.

- 사용자의 디바이스 성능에 비교적 자유롭다.

자바스크립트 리소스 실행은 사용자의 디바이스에서 실행되므로 절대적으로 사용자 디바이스 성능에 의존적이다. 하지만 서버 사이드 렌더링을 수행하면, 이러한 부담을 서버에 나눌 수 있다.

📌 그럼 SSR만 사용할래. 머리 아프게 둘 다 알아야해? 
바로 말하자면 서버 사이드 렌더링은 만능이 아니다.

클라이언트에서 발생하는 모든 무거운 작업을 서버에 미루고, 작업이 모두 서버에서 이뤄진다 해도 모든 성능 문제가 해결되는 것은 아니다. 잘못된 웹페이지 설계는 오히려 성능을 해칠 뿐 아니라 눈에 띄는 성능 개선을 얻지도 못할 수 있다.

리액트 개발자라면, 웹 어플리케이션을 만들고 싶은 개발자라면 두 가지 방법을 모두 이해할 필요가 있다.', '이 글을 읽는 모두 SSR에 대해 많이 들어봤을것이다.SSR, 서버 사이드 렌더링 나도 많이 들어봤지만 그게 정확히 뭐야? 라고 한다면 잘 설명하지 못했었던거 같다. 글을 쓰며 정리하고 다시 읽어보며 SSR을 정복해보자!우선 SSR에 대해 잘 알고 설명할 수 있으려면 SPA에 대하여 잘 알아야한다고 생각한다.📌 SPA란', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-10/4bddd020c94ee711.gif', '2025-02-26T03:42:19+09:00', '2025-02-26T03:42:19+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_10';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_9', 'tistory-9', '2024 Sparcs 과학 해커톤 회고', '친구랑 해커톤에 나가려고 찾아보던중에 유일하게 모집하던 sparcs 해커톤을 보게 되었다.

**SPARCS**는 카이스트 총학생회 산하 단체로, 이전에도 여러 해커톤을 개최했지만 이번에는 **대전 사이언스 페스티벌**에서 해커톤 기간 동안 제작한 서비스로 직접 부스를 열어 일반 시민들의 반응을 볼 수 있는 좋은 기회라고 생각했다.

새로운 경험과 자극이 될 것 같아 기대를 가지고 지원하게 되었다.

### 프로젝트 미리보기

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/d7e0aeb6b24d020a.gif)

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/75baef8f32946a22.gif)

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/bb5929d8ba7bad62.gif)

팀 소개 
우리 팀은 프론트 2 + 백엔드 1 + 디자이너 1 총 4명으로 해커톤에 나가게되었다.

그 중에서 나는 프론트엔드를 맡았다.

~ 0일차

## 팀 빌딩

우선 이번 해커톤은 개인 지원과 4인 팀 지원을 받았다. 원하는 팀으로 나가고 싶었기에 4인 지원을 하기로 마음을 먹었다.

하지만 팀원을 찾는 과정에 있어서 어려움이 있었다.

아는 여러 지인분들께 여쭤봤지만, 모두 일정이 있어 불가능하다는 답변이 돌아왔고

같이 나가기로 한 친구가 교양 수업에서 한 번 프로젝트를 한 디자이너분을 영입해보겠다고 했고 연락을 보내봤다.

처음에는 접점이 많지 않으신분이라 거절 하실 줄 알았는데 같이 나가주신다고 하셨다.

## 기획 아이데이션

해커톤이 시작하기 전 발표주제를 주최측에서 미리 공지해주셨다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/05dc313ec3456dd4.png)

나는 사실 고등학교때 문과였기 때문에 과학에 대해 잘 몰랐었다.

그래서 아이디어를 낼 때 주도적으로 진행하기 보다는(내가 아이디어를 냈다가 다른 팀원들도 잘 모르는 개념이면 다같이 공부해야한다고 생각했기에..) 다른 팀원들이 낸 아이디어를 듣고 그 개념에 대해 찾아보고 이런 방식으로 풀어내면 문돌이인 나도 이해하기 쉬울 거 같다 라는식으로 의견을 덧붙였다.

처음에는 모두들 막막한 느낌이었지만, 아이디어가 점점 나오더니 금방 구체화를 시킬 수 있었다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/3026bf6dac8b87e9.png)

우리는 목소리를 MBTI처럼 특징을 분류할수 있는 서비스를 기획했다.

그리고 우리의 최종기획은 비슷한 목소리 특징을 가진 유명인을 찾아주고, 목소리의 단점을 개선할 수 있는 솔루션을 제공하는 서비스를 만드는 것으로 정해졌다.

1일차

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/df3e25c8b79c3b36.png)

우리는 아침 일찍 기차를 타고 대전에 도착했다.

대전에 도착하고 유명하다는 칼국수 집에서 칼국수를 먹고(아쉽게도 사진 찍을 정신이 없었다.. 너무 졸려서)

해커톤이 열리는 대전 컨벤션 센터에 도착했다.

해커톤은 12시에 시작이었는데, 11시쯤 도착한 우리는 와이어프레임과 기획을 최종 점검하며, 기능을 확정한 후에 본행사에 들어갔다.

본 행사에 들어가서는 디자이너는 기획과 와이어프레임을 바탕으로 UIX 디자인을 들어갔고, 개발자들은 기능 구현을 위하여 어떤 기술들을 사용해야하는지 찾아보기 시작했다.

그 과정에서 목소리 파형 만으로 목소리의 특징을 추출하는 것이 힘들다는 것을 발견해 [MFCC](https://brightwon.tistory.com/11)라는 것을 사용하기로 했고, 목소리를 AI에 학습시키기 위해 데이터셋을 4시간동안 찾는등 어려움을 겪었다.

그 후 저녁을 먹고 해커톤 측에서 숙소를 지원해주셨기 때문에 다른 팀 다같이 숙소로 이동했다. 숙소로 이동후에 개발을 이어 진행할 곳이 많지 않았기에 택시를 타고 24시 카페로 이동해 새벽에 개발을 이어 진행하기로 결정했다.

2일차 
새벽에 카페로 이동해서 개발을 이어나갔다. 우리는 해커톤에서는 기능도 중요하지만 보여주는 것도 중요하다고 생각했기에 애니메이션 요소를 많이 추가하다보니 예상보다 시간이 오래걸렸다.

그래서 프론트 개발자들이 구현을 하는 동안 백엔드 개발자는 API를 다 완성했고, 디자이너는 장표 디자인까지 마쳤다.

카페에서 새벽 7시쯤까지 개발을 진행한 이후 숙소로 돌아가기로 했다. 숙소로 돌아가서는 API 연동을 끝내지못한 프론트 개발자들만 빼고 디자이너와 백엔드 개발자는 숙소에 들어가서 자기로 했다(ㅠㅠ 여기서 문제가 생길줄은 생각도 못했다.)

나와 내 친구(프론트)는 숙소 1층에 있는 스타벅스에 가서 마저 연동을 시작했다.

그런데 API에 요청이 제대로 안가는것이였다. 우리는 계속 같이 작업할줄 알고 명세서도 제대로 만들지 않았는데, 이런 오류가 터지니까 프론트끼리 해결할수가 없었다.

여기서 둘이 멘붕이 와서 그냥 포기할까 생각도 했었다.

하지만, 포기하지 않고 씻고 내려와서 대회장에 다시 가서 개발을 이어하기로 했다. 대회장으로 갈때는 백엔드 개발자도 일어났기에 오류도 해결할 수 있었다.

### 심사

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/7a477a5882fd3f84.png)

우리는 다행히 시간내 개발을 마치고, 발표자료에 들어갈 시연 영상도 찍을수 있었다.

평가는 **대전 사이언스 페스티벌**이 열리는 대전 컨벤션센터 제2전시장에서 부스 심사로 진행되었다.

일반인들도 와서 자유롭게 우리의 서비스를 체험할 수 있고, 심사위원들은 참가자들의 부스를 돌며 심사하는 방식으로 진행되었다.

심사 중 기억 나는 에피소드가 좀 있었는데 그 중 한가지는 아이랑 같이 온 어머님이 기억난다.

아이랑 같이 우리 서비스 **보이스 팔레트**를 체험해보셨는데 디자인에 대해 칭찬을 많이 하셨고, 특히 결과화면을 띄워놓고 아이와 함께 사진을 찍고 가셨다. (우리 디자이너👍)

결과 
그렇게 부스 심사가 마무리되었다.

이제 18팀 중 4팀만 수상하며, 수상팀만이 PPT 발표를 통해 순위를 결정하는 방식이었다.

발표 심사에 진출할 4팀의 이름이 발표되었다. 하지만 우리 팀은 포함되지 않았다 ㅠㅠㅠ

근데 사실 나는 우리팀이 정말 수상할 수 있을줄만 알았다.

수상팀이 PPT발표를 진행하는데 졸아서 발표가 잘 기억이 나지 않지만, 친구가 발표를 보고 기획이 진짜 중요한 거 같다고 말을 계속해서 기획자의 중요성도 엿볼수 있었던거 같다.

평소에도 여러 분야에 관심이 많아서 기획 관련 책(서비스 기획자로 일하고 있습니다)도 읽고 있는데 이걸 다 읽으면 기획에 조금이라도 눈이 트였으면 좋겠다.

좋았던 점 
같이 나갔던 프론트 친구와 백엔드 친구는 잘하기로 소문난 친구였는데 이 두 친구를 보고 해커톤을 진행하면서 큰 자극이 되었던거 같다.

듣기로는 둘 다 개발을 시작한지 2년정도 되었다고 들은 거 같은데 나도 저 정도되면 저렇게 될 수 있을까라는 생각이 들었다. (이제 시작한지 8개월정도 됐다.)

또한 애니메이션을 구현하는데 있어서 어려움을 많이 겪었는데 프론트 친구에게 레퍼런스를 어떻게 찾고 활용하면 될지 들을 것이 좋았다.

아쉬웠던 점 
디자이너가 생각한 애니메이션을 구현하는데 있어서 어려움 또한 많이 겪었다. 물론 구현은 다 했지만 빠르게 했으면 어땠을까라는 아쉬움이 계속 남는다.

코드의 퀄리티를 좋게하는 공부도 좋지만, 기본적으로 화면 구현에 어려움을 겪는다면 좋은 개발자가 될 수 있을 거 같지 않기에 화면 구현, 애니메이션에 대한 공부도 꾸준히해야겠다는 생각이 들었다.

그리고 사람은 잠이 중요하다는 것도 느꼈다. 해커톤 나가기 이틀전에도 밤을 새고 왔고, 해커톤을 진행하며 40시간 정도를 뜬눈으로 지샜기에 앞서 말한 API 연동 문제도 해결이 오래걸린것 같다. 사실 요청 파라미터가 “남성”이냐 “남자”냐에 차이에서 발생한 문제였기에 정신만 멀쩡했어도 빨리 해결했지 않았을까 쉽다.

마무리 
팀원 모두 끝까지 열심히 한 해커톤이라 정말 뿌듯한 거 같다.

이제 해커톤에서 아쉬웠던 점을 토대로 초심을 잃지 않고 개발 공부를 이어갈 수 있었으면 좋겠다.

그리고 모든 팀원들이 나에게는 너무 과분했던것 같다. (애들아 다음에는 더 잘할게)

다음에 또 같이 나갈 기회가 있다면 수상까지 하는 세계 최강팀이 되자! 고생했어 사랑해

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-9/c7e36c081213119c.png)

### 링크

[GITHUB](https://github.com/2024-SPARCS-HACKATHON)

[발표자료](https://drive.google.com/file/d/1pn9ITE_A7Rz2SNPRGKII3jTvy9pI8nR7/view?usp=sharing)

[시연 영상](https://drive.google.com/file/d/1w4jzZiQFyrsHqkrIXZEoCWpLFCSo-gB7/view)

[SPARCS 과학 해커톤 2024 소개](https://event.sparcs.org/dsf24)', '친구랑 해커톤에 나가려고 찾아보던중에 유일하게 모집하던 sparcs 해커톤을 보게 되었다.SPARCS는 카이스트 총학생회 산하 단체로, 이전에도 여러 해커톤을 개최했지만 이번에는 대전 사이언스 페스티벌에서 해커톤 기간 동안 제작한 서비스로 직접 부스를 열어 일반 시민들의 반응을 볼 수 있는 좋은 기회라고 생각했다.새로운 ', (SELECT id FROM categories WHERE slug = 'retrospective' LIMIT 1), 'blog/tistory/tistory-9/d7e0aeb6b24d020a.gif', '2025-02-26T03:41:46+09:00', '2025-02-26T03:41:46+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_9';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_8', 'tistory-8', '[React] useThrottle과 useDebounce에 대해서 알아보자', 'React 애플리케이션에서 자주 사용하는 useThrottle와 useDebounce는 사용자 인터페이스 성능을 최적화하는 데 유용한 커스텀 훅이다.

스크롤, 키보드 입력, 리사이즈 등 이벤트가 자주 발생하는 상황에서 불필요한 호출을 줄여 부드러운 사용자 경험을 제공하는 것이 목적이다

먼저 useThrottle과 useDebounce에 대해 알기전에 커스텀 훅에 대하여 알아야한다.

커스텀 훅이란? 
**커스텀 훅(Custom Hook)** 은 React에서 상태 관리 및 로직을 재사용 가능하도록 만드는 함수다. 일반적으로 useState, useEffect 같은 내장 훅을 활용해 특정 기능을 캡슐화하고 이를 필요할 때마다 호출하여 사용할 수 있다. 예를 들어, useThrottle와 useDebounce 같은 커스텀 훅을 통해 이벤트 빈도를 제한함으로써 애플리케이션 성능 최적화를 할 수 있다.
또한 커스텀 훅은 작성 규칙을 따라야한다.

## 커스텀 훅 작성 규칙

### “use”로 시작하기

모든 커스텀 훅 이름은 use로 시작해야 한다. React는 이를 통해 훅으로 인식하여 호출 규칙을 적용한다.

### React 훅 규칙 준수

커스텀 훅도 일반 훅과 마찬가지로 조건문, 반복문 내부에서는 호출할 수 없고 최상위 레벨에서만 호출해야 한다.

### React 훅 내부 사용

커스텀 훅은 다른 리액트 훅을 내부에서 호출할 수 있다. 예를 들어 useThrottle 훅은 내부에서 useState, useEffect 등을 사용할 수 있다.

useThrottle이란? 
useThrottle는 특정 함수 호출을 제한하여 지정한 시간 간격 내에서는 최초 실행 후 추가 호출을 무시하는 커스텀 훅이다.
스크롤 이벤트와 같이 매우 빠르게 발생하는 이벤트의 빈도를 조절하고 싶을 때 사용된다.
ex) 스크롤에 따른 애니메이션 효과, 리사이즈 이벤트 등.

```
import { useState, useEffect } from ''react'';

function useThrottle(value, limit) {
 const [throttledValue, setThrottledValue] = useState(value);

useEffect(() => {
 const handler = setTimeout(() => {
 setThrottledValue(value);
 }, limit);

return () => clearTimeout(handler);
 }, [value, limit]);

return throttledValue;
}
```

useDebounce 
useDebounce는 함수 호출을 지연시키고, 지정한 시간 내에 추가 호출이 발생하지 않을 때에만 실행한다.
주로 사용자가 빠르게 입력하는 검색 필드에서 입력 완료 후에만 검색 요청을 보낼 때 유용하게 쓰인다.
ex) 검색 창, 필터와 같은 입력 필드 처리.

```
import { useState, useEffect } from ''react'';

function useDebounce(value, delay) {
 const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
 const handler = setTimeout(() => {
 setDebouncedValue(value);
 }, delay);

return () => clearTimeout(handler);
 }, [value, delay]);

return debouncedValue;
}
```

useThrottle와 useDebounce의 차이점 
두 훅은 모두 이벤트 호출 횟수를 제어한다는 공통점이 있지만, 동작 방식과 쓰이는 곳이 다르다.

### 실행 방식:

- useThrottle: 지정한 시간 동안 반복 호출을 제한하고 최초 호출 후 해당 시간 내 추가 호출을 무시한다.

- useDebounce: 지정한 시간 동안 추가 호출이 없을 때만 실행하여 사용자의 행동이 멈출 때까지 기다린다.

### 주요 용도:

- useThrottle: 스크롤, 리사이즈 이벤트와 같이 이벤트가 지속적으로 발생할 때.

- useDebounce: 검색 입력 필드와 같이 사용자가 연속해서 입력하는 이벤트에 반응할 때.

결론 
useThrottle와 useDebounce는 모두 React에서 성능을 최적화하는 커스텀 훅이다. 이 두 훅의 차이를 이해하고 상황에 맞게 적절히 사용하는 것이 중요하다. 간단히 요약하면, 빠르게 반복 발생하는 이벤트에는 useThrottle를, 사용자의 입력이 끝난 후 동작해야 하는 경우에는 useDebounce를 사용하는 것이 좋다.', 'React 애플리케이션에서 자주 사용하는 useThrottle와 useDebounce는 사용자 인터페이스 성능을 최적화하는 데 유용한 커스텀 훅이다.스크롤, 키보드 입력, 리사이즈 등 이벤트가 자주 발생하는 상황에서 불필요한 호출을 줄여 부드러운 사용자 경험을 제공하는 것이 목적이다 먼저 useThrottle과 useDe', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), NULL, '2025-02-26T03:41:08+09:00', '2025-02-26T03:41:08+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_8';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_7', 'tistory-7', '[React] 언제 메모이제이션을 해야할까?', '스터디 책을 읽다가 평소 관심이 있던 최적화와 관련된 부분이 있어서 정리해보기로 했다.

메모이제이션이란? 
계산 결과를 메모리에 저장해 두고 동일한 계산이 요청될 때 다시 계산하지 않고 저장된 값을 반환하는 최적화 기법이다.

리액트에서는 useMemo, useCallback 훅과 고차 컴포넌트인 memo를 활용해 메모이제이션을 하곤한다.

추가: React.memo, useMemo, useCallback

## React.memo

```
import React from ''react'';

const ChildComponent = React.memo((props) => {
 console.log(''ChildComponent rendered'');
 return Child Value: {props.value} ;
});

const ParentComponent = () => {
 const [count, setCount] = React.useState(0);
 const [value, setValue] = React.useState(''Hello'');

return (
 
 setCount(count + 1)}>Increment Count 
 setValue(''World'')}>Change Value 
 
 
 );
};

export default ParentComponent;
```

- 자식 컴포넌트를 React.memo로 감싸서 메모이제이션을 적용한다.

- 자식 컴포넌트의 props가 변경되지 않으면 컴포넌트를 다시 렌더링하지 않는다.

- 첫 렌더링시 ChildComponent가 렌더링된다.

- Increment Count 이 눌리면 ChildComponent는 재렌더링 되지 않는다.

- Change Value이 눌리면 ChildComponent는 재렌더링 된다.

### `React.memo`와 `areEqual` 함수

기본적으로 `React.memo` 는 prop를 얕은 비교로 비교한다고 한다. 그렇기 때문에 복잡한 객체나 배열을 props로 전달할 때는, 비교 로직을 커스텀 해야만 한다.

```
const ChildComponent = React.memo((props) => {
 console.log(''ChildComponent rendered'');
 return Child Value: {props.value} ;
}, (prevProps, nextProps) => {
 // 커스텀 비교 로직
 return prevProps.value === nextProps.value;
});
```

## useMemo

### 기본 구조

```
const memoizedValue = useMemo(() => {
 return computeExpensiveValue(a, b);
}, [a, b]);
```

- 첫번째 인자로 메모이제이션할 계산 함수를 받는다

- 두번째 인자로, 의존성 배열을 받는다, 이 배열의 값이 변경될 때만 첫 번째 인자로 전달된 함수가 다시 실행된다.

### ex

```
import React, { useState } from ''react'';

const ExpensiveCalculationComponent = () => {
 const [count, setCount] = useState(0);
 const [inputValue, setInputValue] = useState('''');

// 비싼 계산
 const computeExpensiveValue = (num) => {
 console.log(''Expensive calculation running...'');
 let total = 0;
 for (let i = 0; i 
 setInputValue(e.target.value)}
 />
 Result: {result} 
 setCount(count + 1)}>Increment Count 
 
 );
};

export default ExpensiveCalculationComponent;
```

극단적으로 비싼 계산을 포함하고 있는 함수(computeExpensiveValue)가 있다고 할때

사용자가 Input에 text를 입력할 때마다 ExpensiveCalculationComponent는 리렌더링이 된다.

이때 인풋과는 전혀 관계 없는 computeExpensiveValue도 매번 실행되기 때문에 성능 저하가 발생할 수 있다.

### UseMemo로 성능 최적화

```
import React, { useState, useMemo } from ''react'';

const ExpensiveCalculationComponent = () => {
 const [count, setCount] = useState(0);
 const [inputValue, setInputValue] = useState('''');

// 비싼 계산
 const computeExpensiveValue = (num) => {
 console.log(''Expensive calculation running...'');
 let total = 0;
 for (let i = 0; i computeExpensiveValue(count), [count]);

return (
 
 setInputValue(e.target.value)}
 />
 Result: {memoizedResult} 
 setCount(count + 1)}>Increment Count 
 
 );
};

export default ExpensiveCalculationComponent;
```

- 처음 렌더링될 때 computeExpensiveValue가 실행되고, 결과가 기록된다

- 사용자가 텍스트 입력할때는 count 값이 변하지 않기 때문에 계산이 다시 실행되지 않고 이전 결과를 반환한다.

- Increment Count을 눌러 count 값이 변할때만 계산이 다시 실행된다.

## useCallback

```
const memoizedCallback = useCallback(() => {
 // 수행할 작업
}, [의존성 배열]);
```

- 첫 번째 인자로 메모이제이션할 함수를 받는다.

- 두 번째 인자로 의존성 배열을 전달한다.

### ex

```
import React, { useState } from ''react'';

const ChildComponent = ({ onClick }) => {
 console.log(''ChildComponent rendered'');
 return Click Me ;
};

const ParentComponent = () => {
 const [count, setCount] = useState(0);

const handleClick = () => {
 console.log(''Button clicked'');
 };

return (
 
 Count: {count}

setCount(count + 1)}>Increment Count 
 
 
 );
};

export default ParentComponent;
```

- ParentComponent는 상태를 관리하고, 자식 컴포넌트에게 onClick 콜백 함수를 props로 전달한다

- 매번 부모 컴포넌트가 리렌더링될 때, handleClick 함수도 새로 생성된다.

- 자식 컴포넌트는 props로 받은 함수가 변경된 걸로 인식하고 리렌더링한다.

```
import React, { useState, useCallback } from ''react'';

const ChildComponent = ({ onClick }) => {
 console.log(''ChildComponent rendered'');
 return Click Me ;
};

const ParentComponent = () => {
 const [count, setCount] = useState(0);

// useCallback으로 함수 메모이제이션
 const handleClick = useCallback(() => {
 console.log(''Button clicked'');
 }, []);

return (
 
 Count: {count}

setCount(count + 1)}>Increment Count 
 
 
 );
};

export default ParentComponent;
```

useCallback을 사용하여 함수가 재생성 되는것을 막았다.

그럼 무조건 하면 되는 거 아니야? 뭐가 문젠데..? 
여기서 쟁점이 발생한다.

렌더링이 일어날 것 같은 모든 영역에 모조리 추가할까? 아니면 의존성 배열이 생략된 useEffect를 모든 컴포넌트에 추가해서 실제로 렌더링이 돌아가는지 확인해 보아야 할까? 무거운 연산의 기준이 무엇일까? 와 같은 쟁점이다.

이 책에서는 “메모이제이션은 꼭 필요한 곳에서만 써야한다.” 라는 주장과 “모조리 메모이제이션을 해야한다.” 라는 주장에 대해서 각자의 이유를 들며 비교해보고 있다.

섣부른 최적화는 독이다. 꼭 필요한 곳에만 메모이제이션을 추가하자!

```
function sum(a, b){
 return a + b
}
```

극단적이긴 하지만 위 같은 연산들은 너무 간단하다.

이러한 연산들은 메모이제이션해서 메모리 어딘가에서 꺼내오는 것보다 매번 이 작업을 수행해 결과를 반환하는 것이 빠를 수 있다.

다른 많은 연산들에도 비용이 들듯이, 메모이제이션 과정에도 꺼내오기, 저장하기, 값을 비교해 랜더링이 필요한지 확인하는 작업과 같은 비용이 든다.

따라서 메모이제이션은 어느 정도의 트레이드 오프가 항상 존재한다.

그리고 또한 리액트 공식문서에는

> useMemo는 성능 최적화를 위해 사용할 수 있지만 의미상으로 그것이 보장된다고 생각하지마세요

라는 내용이 나와있다고 한다.

리액트는 가능한 오랫동안 캐시 결과를 저장하려고 하겠지만, 어느 순간 캐시가 무효화되는 경우도 있을 것이다.

그러므로 메모이제이션을 활용한 최적화는 신중을 가해야한다.

요약 → 메모이제이션이 간단한 연산보다 더 많은 비용을 지불해야하는 경우도 있다!

렌더링 과정의 비용은 비싸다. 모조리 메모이제이션해 버리자! 
실무에 임하는 모든 개발자들은 최적화에 쏟을 시간이 넘쳐나지 않다는 사실이다.

전 의견은 메모이제이션 비용이 하지 않았을 때의 비용보다 비싸질 때를 고려하여 주장한 의견이다.

잘못된 메모로 지불해야 하는 비용은 바로 props에 대한 얕은 비교가 발생하면서 지불해야 하는 비용이다.

하지만 메모를 하지 않았을 때는

- 렌더링을 함으로써 발생하는 비용

- 컴포넌트 내부의 복잡한 로직의 재실행

- 그리고 위 두 가지 모두가 모든 자식 컴포넌트에서 반복해서 일어남

- 리액트가 구트리와 신규 트리를 비교

할때 비용을 지불해야한다.

또한 useMemo와 useCallback을 사용하면 값이 변경되지 않는 한 같은 결과물을 가질 수 있고, 그 덕분에 참조의 투명성을 유지할 수 있게 된다.

메모이제이션을 하지 않았을 때보다, 메모이제이션했을 때 더 많은 이점을 누릴 수 있다. 이러한 이점들이 실수로 빠뜨렸을 때 치러야 할 위험비용이 더 크기때문에 전문가가 아니라면 가능한 모든 곳에 메모이제이션을 활용하는 것이 좋다!

그래서 어떡하라고? 
이 책의 저자는 리액트를 공부하고 있거나 깊은 이해를 하고 싶다면, 어느 지점에서 성능상 이점을 누릴 수 있는지 분석하고 메모이제이션을 활용하는 것을 권장하고

현업에서 리액트를 활용하고 있거나 혹은 성능에 대해 깊게 연구해 볼 시간적 여유가 없는 상황이라면 의심스러운 곳에 먼저 다 적용해 볼 것을 권장한다.

하지만 나는 아직 리액트를 배우고 있고, 실제 현업에서 리액트를 쓰기까지 시간적 여유가 많이 남았기 때문에 전자의 의견을 따를 거 같다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-7/23f004edbe13a9d8.png)', '스터디 책을 읽다가 평소 관심이 있던 최적화와 관련된 부분이 있어서 정리해보기로 했다.메모이제이션이란?계산 결과를 메모리에 저장해 두고 동일한 계산이 요청될 때 다시 계산하지 않고 저장된 값을 반환하는 최적화 기법이다.리액트에서는 useMemo, useCallback 훅과 고차 컴포넌트인 memo를 활용해 메모이제이션을 ', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-7/23f004edbe13a9d8.png', '2025-02-26T03:40:13+09:00', '2025-02-26T03:40:13+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_7';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_6', 'tistory-6', '깃허브 페이지 커스텀 도메인 연결하기', '지금 블로그는 버셀로 배포가 되어있기 때문에 이번에 만들고 있는 개인 포트폴리오 사이트는 깃허브 페이지로 배포하기로 했다.

깃허브 페이지 배포하는것은 크게 어렵지 않았지만, 커스텀 도메인 연결이 시간이 오래걸렸어서 까먹지 않기 위해 정리 한 번 하려고 한다.

## 1. 도메인 구매

나같은 경우에는 가비아에서 이미 도메인을 산 상태여서 새로 구매는 안했다.

검색창에 원하는 도메인을 치고 아직 구매안된 도메인을 사면된다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-6/f78dca2bd4f7bcf8.webp)

## 2. DNS 설정

내 도메인을 깃허브 페이지의 IP 주소에 연결하기 위해 A레코드를 다음과 같이 추가해준다.

타입 
 호스트 
 값/위치 
 
 
 
 A 
 @ 
 185.199.108.153 
 
 
 A 
 @ 
 185.199.109.153 
 
 
 A 
 @ 
 185.199.110.153 
 
 
 A 
 @ 
 185.199.111.153 
 
 
그리고 또한 나는 서브 도메인 연결을 위해서 CNAME도 사용했다.

타입 
 호스트 
 값/위치 
 
 
 
 CNAME 
 [www.portfolio](http://www.portfolio/) 
 [choihooo.github.io](http://choihooo.github.io/). 
 
 
 CNAME 
 portfolio 
 [choihooo.github.io](http://choihooo.github.io/).

## 3. 깃허브 페이지 설정에서 커스텀 도메인 입력

그 후 다음과 같이 커스텀 도메인을 입력하고 save 하면 몇분이 지나면 DNS 연결 확인이 되고 도메인이 연결이 된다.

![](https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/tistory-6/b4793533f342240d.webp)

## 추가: vite 설정 수정

```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
plugins: [react()],
base: "/"
});
```

base가 원래 /레포 이름/ 이여야 하지만 커스텀 도메인을 이용해 배포할때는 / 로 바꾸어 주어야한다.', '지금 블로그는 버셀로 배포가 되어있기 때문에 이번에 만들고 있는 개인 포트폴리오 사이트는 깃허브 페이지로 배포하기로 했다.깃허브 페이지 배포하는것은 크게 어렵지 않았지만, 커스텀 도메인 연결이 시간이 오래걸렸어서 까먹지 않기 위해 정리 한 번 하려고 한다.1. 도메인 구매나같은 경우에는 가비아에서 이미 도메인을 산 상태여', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), 'blog/tistory/tistory-6/f78dca2bd4f7bcf8.webp', '2025-02-01T05:36:22+09:00', '2025-02-01T05:36:22+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_6';
INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count) VALUES ('post_tistory_5', 'tistory-5', '정규표현식', '정규표현식 
정규식, Regualar Expression

## **역할**

- 문자 검색 (search)

- 문자 대체 (replace)

- 문자 추출

## **테스트 사이트**

[https://regexr.com/](https://regexr.com/)

## **정규식 생성**

```
// 생성자new RegExp("표현", "옵션");
new RegExp("[a-z]", "gi");

// 리터럴/표현/옵션
/[a-z]/gi
```

## **예제 문자**

```
const str = `
010-1234-5678
hochoi8621@tukorea.ac.kr
aaaabbbbbccccc
The quick brown fox junps over the lazy dog.
 
`
```

## **메소드**

메소드 문법 설명

test 
 정규식.test(문자열) 
 일치 여부(Boolean) 반환 
 
 
 match 
 문자열.match(정규식) 
 일치하는 문자의 배열(Array) 반환 
 
 
 replace 
 문자열.replace(정규식, 대체문자) 
 일치하는 문자를 대체 , 원본 데이터 변환 x

## **플래그(옵션)**

플래그 설명

g 
 모든 문자 일치(global) 
 
 
 i 
 영어 대소문자를 구분 않고 일치(ignore case) 
 
 
 m 
 여러 줄 일치(multi line)

## **패턴(표현)**

패턴 
 설명 
 
 
 ^ab 
 줄(Line) 시작에 있는 ab와 일치 
 
 
 ab$ 
 줄(Line) 끝에 있는 ab와 일치 
 
 
 . 
 임의의 한 문자와 일치 
 
 
 a 
 b 
 
 
 ab? 
 b가 없거나 b와 일치 
 
 
 {3} 
 3개 연속 일치 
 
 
 {3,} 
 3개 이상 연속 일치 
 
 
 {3,5} 
 3개 이상 5개 이하(3~5)개 연속 일치 
 
 
 [abc] 
 a 또는 b 또는 c 
 
 
 [a-z] 
 a부터 z 사이의 문자 구간에 일치(영어 소문자) 
 
 
 [A-Z] 
 A부터 Z 사이의 문자 구간에 일치(영어 대문자) 
 
 
 [0-9] 
 0부터 9 사이의 문자 구간에 일치(숫자) 
 
 
 [가-힣] 
 가부터 힣 사이의 문자 구간에 일치 
 
 
 \w 
 63개 문자(Word, 대소영문 52개 + 숫자 10개 + _)에 일치 
 
 
 \b 
 63개 문자에 일치하지 않는 문자 경계(Boundary) 
 
 
 \d 
 숫자(Digit)에 일치 
 
 
 \s 
 공백(Space, Tab 등)에 일치 
 
 
 (?=) 
 앞쪽 일치(Lookahead) 
 
 
 (?<=) 
 뒤쪽 일치(Lookbehind)', '정규표현식 정규식, Regualar Expression 역할 문자 검색 (search) 문자 대체 (replace) 문자 추출 테스트 사이트 https://regexr.com/ 정규식 생성 // 생성자new RegExp("표현", "옵션"); new RegExp("[a-z]", "gi"); // 리터럴/표현/옵션 /[a-', (SELECT id FROM categories WHERE slug = 'engineering' LIMIT 1), NULL, '2024-03-26T14:06:38+09:00', '2024-03-26T14:06:38+09:00', 1, 0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, content=excluded.content, summary=excluded.summary, category_id=excluded.category_id, hero_image_key=excluded.hero_image_key, published_at=excluded.published_at, updated_at=excluded.updated_at, is_published=excluded.is_published, view_count=excluded.view_count;
DELETE FROM post_tags WHERE post_id = 'post_tistory_5';
INSERT INTO tags (id, name, slug) VALUES ('tag_tistory_tag_ac6828de', 'Tistory Tag Ac6828de', 'tistory-tag-ac6828de') ON CONFLICT(slug) DO UPDATE SET name=excluded.name;
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES ('post_tistory_5', (SELECT id FROM tags WHERE slug = 'tistory-tag-ac6828de' LIMIT 1));
DELETE FROM media_refs WHERE post_id = 'post_tistory_39';
DELETE FROM media_refs WHERE post_id = 'post_tistory_37';
DELETE FROM media_refs WHERE post_id = 'post_tistory_36';
DELETE FROM media_refs WHERE post_id = 'post_tistory_35';
DELETE FROM media_refs WHERE post_id = 'post_tistory_34';
DELETE FROM media_refs WHERE post_id = 'post_tistory_33';
DELETE FROM media_refs WHERE post_id = 'post_tistory_32';
DELETE FROM media_refs WHERE post_id = 'post_tistory_31';
DELETE FROM media_refs WHERE post_id = 'post_tistory_30';
DELETE FROM media_refs WHERE post_id = 'post_tistory_29';
DELETE FROM media_refs WHERE post_id = 'post_tistory_28';
DELETE FROM media_refs WHERE post_id = 'post_tistory_27';
DELETE FROM media_refs WHERE post_id = 'post_tistory_26';
DELETE FROM media_refs WHERE post_id = 'post_tistory_25';
DELETE FROM media_refs WHERE post_id = 'post_tistory_24';
DELETE FROM media_refs WHERE post_id = 'post_tistory_23';
DELETE FROM media_refs WHERE post_id = 'post_tistory_21';
DELETE FROM media_refs WHERE post_id = 'post_tistory_20';
DELETE FROM media_refs WHERE post_id = 'post_tistory_19';
DELETE FROM media_refs WHERE post_id = 'post_tistory_18';
DELETE FROM media_refs WHERE post_id = 'post_tistory_16';
DELETE FROM media_refs WHERE post_id = 'post_tistory_15';
DELETE FROM media_refs WHERE post_id = 'post_tistory_14';
DELETE FROM media_refs WHERE post_id = 'post_tistory_13';
DELETE FROM media_refs WHERE post_id = 'post_tistory_12';
DELETE FROM media_refs WHERE post_id = 'post_tistory_11';
DELETE FROM media_refs WHERE post_id = 'post_tistory_10';
DELETE FROM media_refs WHERE post_id = 'post_tistory_9';
DELETE FROM media_refs WHERE post_id = 'post_tistory_8';
DELETE FROM media_refs WHERE post_id = 'post_tistory_7';
DELETE FROM media_refs WHERE post_id = 'post_tistory_6';
DELETE FROM media_refs WHERE post_id = 'post_tistory_5';
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_0', 'post_tistory_39', 'blog/tistory/tistory-39/021e9930fcb5cad2.png', 'hero', 953, 631, '2026-07-31T08:40:49.144Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_1', 'post_tistory_39', 'blog/tistory/tistory-39/480a55192259555c.png', 'body', 953, 638, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_2', 'post_tistory_39', 'blog/tistory/tistory-39/2152d6139b137a07.png', 'body', 953, 630, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_3', 'post_tistory_39', 'blog/tistory/tistory-39/342443e94bbec134.png', 'body', 529, 804, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_4', 'post_tistory_39', 'blog/tistory/tistory-39/72cf9ba739aee18e.png', 'body', 952, 639, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_5', 'post_tistory_39', 'blog/tistory/tistory-39/39d1b67b1bbdffd4.png', 'body', 952, 629, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_39_6', 'post_tistory_39', 'blog/tistory/tistory-39/74549bbb0ad45a88.png', 'body', 955, 631, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_37_0', 'post_tistory_37', 'blog/tistory/tistory-37/681755bfee336289.png', 'hero', 981, 547, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_37_1', 'post_tistory_37', 'blog/tistory/tistory-37/4483ca8e118806e5.png', 'body', 980, 550, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_37_2', 'post_tistory_37', 'blog/tistory/tistory-37/be728a7dbcd0736d.png', 'body', 982, 546, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_37_3', 'post_tistory_37', 'blog/tistory/tistory-37/80d2e68b74643fbe.png', 'body', 981, 548, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_36_0', 'post_tistory_36', 'blog/tistory/tistory-36/3e420da7a5173b0d.png', 'hero', 745, 517, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_36_1', 'post_tistory_36', 'blog/tistory/tistory-36/ed567716d2b88304.png', 'body', 727, 377, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_36_2', 'post_tistory_36', 'blog/tistory/tistory-36/33bc912d8f18855a.png', 'body', 739, 320, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_36_3', 'post_tistory_36', 'blog/tistory/tistory-36/d8fcc3436c997b5d.png', 'body', 410, 194, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_34_0', 'post_tistory_34', 'blog/tistory/tistory-34/cfb8d5b1bcba9ca9.png', 'hero', 1104, 626, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_34_1', 'post_tistory_34', 'blog/tistory/tistory-34/7a244e6a7ba681a7.png', 'body', 1092, 622, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_33_0', 'post_tistory_33', 'blog/tistory/tistory-33/ef109698ca8c1abc.webp', 'hero', 1280, 624, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_33_1', 'post_tistory_33', 'blog/tistory/tistory-33/da291edccb22ac25.webp', 'body', 773, 254, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_33_2', 'post_tistory_33', 'blog/tistory/tistory-33/21689953b07f3ff0.webp', 'body', 773, 500, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_33_3', 'post_tistory_33', 'blog/tistory/tistory-33/91430977fbe346aa.webp', 'body', 600, 100, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_33_4', 'post_tistory_33', 'blog/tistory/tistory-33/1f5a518a27eb8acc.webp', 'body', 600, 100, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_32_0', 'post_tistory_32', 'blog/tistory/tistory-32/2d6cc4a907d4c9c7.png', 'hero', 1690, 931, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_32_1', 'post_tistory_32', 'blog/tistory/tistory-32/888ee883929ce7a4.png', 'body', 1672, 941, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_31_0', 'post_tistory_31', 'blog/tistory/tistory-31/d3885b593e9ff692.png', 'hero', 1536, 1024, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_31_1', 'post_tistory_31', 'blog/tistory/tistory-31/392582caf0aa4379.png', 'body', 1536, 1024, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_30_0', 'post_tistory_30', 'blog/tistory/tistory-30/50aeace4d73a350a.jpg', 'hero', 3024, 4032, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_30_1', 'post_tistory_30', 'blog/tistory/tistory-30/65f156d5a91aa033.jpg', 'body', 3024, 3024, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_30_2', 'post_tistory_30', 'blog/tistory/tistory-30/e25420c25f039a10.jpg', 'body', 664, 664, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_0', 'post_tistory_29', 'blog/tistory/tistory-29/26f71a4c5bd1bce4.png', 'hero', 526, 661, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_1', 'post_tistory_29', 'blog/tistory/tistory-29/0046a8d8661cc478.png', 'body', 543, 462, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_2', 'post_tistory_29', 'blog/tistory/tistory-29/3c969e5fc69ea326.png', 'body', 394, 239, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_3', 'post_tistory_29', 'blog/tistory/tistory-29/ea1970aa848bb576.png', 'body', 458, 304, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_4', 'post_tistory_29', 'blog/tistory/tistory-29/d492aff74b307251.png', 'body', 365, 281, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_5', 'post_tistory_29', 'blog/tistory/tistory-29/72e76a20733aa168.png', 'body', 555, 372, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_29_6', 'post_tistory_29', 'blog/tistory/tistory-29/5b24bd75021a8ee2.png', 'body', 446, 604, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_28_0', 'post_tistory_28', 'blog/tistory/tistory-28/f4597e8ee5b817e1.png', 'hero', 575, 383, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_28_1', 'post_tistory_28', 'blog/tistory/tistory-28/e77c2b260b009ce3.png', 'body', 687, 381, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_28_2', 'post_tistory_28', 'blog/tistory/tistory-28/8c488103d6d18dc5.png', 'body', 284, 449, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_28_3', 'post_tistory_28', 'blog/tistory/tistory-28/fe0ba07abe2a58e0.png', 'body', 515, 373, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_27_0', 'post_tistory_27', 'blog/tistory/tistory-27/882a0d0cebf5df82.png', 'hero', 1283, 193, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_27_1', 'post_tistory_27', 'blog/tistory/tistory-27/306a9e4505328765.png', 'body', 401, 406, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_27_2', 'post_tistory_27', 'blog/tistory/tistory-27/b09ebc4c0a216cf4.png', 'body', 414, 452, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_27_3', 'post_tistory_27', 'blog/tistory/tistory-27/d1347355889029be.png', 'body', 549, 240, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_26_0', 'post_tistory_26', 'blog/tistory/tistory-26/a35cb17a179a6c97.png', 'hero', NULL, NULL, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_26_1', 'post_tistory_26', 'blog/tistory/tistory-26/7ddd4fa1f4900af0.png', 'body', NULL, NULL, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_26_2', 'post_tistory_26', 'blog/tistory/tistory-26/3d0e2a8d16627c82.png', 'body', NULL, NULL, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_25_0', 'post_tistory_25', 'blog/tistory/tistory-25/10b13fff8094e3c0.png', 'hero', 1096, 666, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_25_1', 'post_tistory_25', 'blog/tistory/tistory-25/5989a1ddcf8ae9b2.png', 'body', 1098, 644, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_0', 'post_tistory_24', 'blog/tistory/tistory-24/b99290866de6a6a0.png', 'hero', 2728, 1536, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_1', 'post_tistory_24', 'blog/tistory/tistory-24/dae43bb0e24452c6.png', 'body', 487, 300, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_2', 'post_tistory_24', 'blog/tistory/tistory-24/68afb1abace2244f.png', 'body', 529, 823, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_3', 'post_tistory_24', 'blog/tistory/tistory-24/0ec990f269494883.png', 'body', 542, 356, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_4', 'post_tistory_24', 'blog/tistory/tistory-24/13fb6d8173c6c5ac.png', 'body', 499, 247, '2026-07-31T08:40:49.150Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_5', 'post_tistory_24', 'blog/tistory/tistory-24/0ee970dbc1454070.png', 'body', 406, 346, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_24_6', 'post_tistory_24', 'blog/tistory/tistory-24/07fd45f70121bd32.png', 'body', 1544, 892, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_23_0', 'post_tistory_23', 'blog/tistory/tistory-23/1b74cf82b6825986.png', 'hero', 1918, 656, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_23_1', 'post_tistory_23', 'blog/tistory/tistory-23/824c42c77f4bcd19.png', 'body', 1948, 548, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_23_2', 'post_tistory_23', 'blog/tistory/tistory-23/ae42eec55a38f2a1.png', 'body', 450, 292, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_23_3', 'post_tistory_23', 'blog/tistory/tistory-23/139510166711c191.png', 'body', 368, 441, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_23_4', 'post_tistory_23', 'blog/tistory/tistory-23/b921a9a5c14ad726.png', 'body', 512, 433, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_23_5', 'post_tistory_23', 'blog/tistory/tistory-23/e2ee9e0efb532edf.png', 'body', 616, 684, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_21_0', 'post_tistory_21', 'blog/tistory/tistory-21/078c588025e52444.png', 'hero', 1536, 1024, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_21_1', 'post_tistory_21', 'blog/tistory/tistory-21/6ff64aeff1c9f3aa.png', 'body', 1536, 1024, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_21_2', 'post_tistory_21', 'blog/tistory/tistory-21/12e095dae4699abd.png', 'body', 1536, 1024, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_19_0', 'post_tistory_19', 'blog/tistory/tistory-19/6e6cfbd76bf366bb.jpg', 'hero', 3024, 3024, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_18_0', 'post_tistory_18', 'blog/tistory/tistory-18/9b82ed4e7a4cccde.jpg', 'hero', 1280, 1706, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_18_1', 'post_tistory_18', 'blog/tistory/tistory-18/35a05fd1dbae70f9.jpg', 'body', 1280, 1706, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_13_0', 'post_tistory_13', 'blog/tistory/tistory-13/ee7a9781b533b739.png', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_13_1', 'post_tistory_13', 'blog/tistory/tistory-13/cfac3eb4e12129d0.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_12_0', 'post_tistory_12', 'blog/tistory/tistory-12/5f8d066a889543e6.png', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_0', 'post_tistory_11', 'blog/tistory/tistory-11/b8be229207b34211.png', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_1', 'post_tistory_11', 'blog/tistory/tistory-11/8db8212e3dd674c6.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_2', 'post_tistory_11', 'blog/tistory/tistory-11/ec1a5b5a47eefbdc.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_3', 'post_tistory_11', 'blog/tistory/tistory-11/4bc2d3a5ab46b3f0.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_4', 'post_tistory_11', 'blog/tistory/tistory-11/38463c66792248c6.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_5', 'post_tistory_11', 'blog/tistory/tistory-11/e4f5e82510f66723.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_6', 'post_tistory_11', 'blog/tistory/tistory-11/1254b8854c943b9d.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_7', 'post_tistory_11', 'blog/tistory/tistory-11/4dd7ec0e23639db5.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_8', 'post_tistory_11', 'blog/tistory/tistory-11/7087a91c1a8be4ad.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_11_9', 'post_tistory_11', 'blog/tistory/tistory-11/f2fcc9d1fd26fd58.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_10_0', 'post_tistory_10', 'blog/tistory/tistory-10/4bddd020c94ee711.gif', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_10_1', 'post_tistory_10', 'blog/tistory/tistory-10/36ae6c5161c84ce1.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_10_2', 'post_tistory_10', 'blog/tistory/tistory-10/6517e71747b40f8c.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_0', 'post_tistory_9', 'blog/tistory/tistory-9/d7e0aeb6b24d020a.gif', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_1', 'post_tistory_9', 'blog/tistory/tistory-9/75baef8f32946a22.gif', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_2', 'post_tistory_9', 'blog/tistory/tistory-9/bb5929d8ba7bad62.gif', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_3', 'post_tistory_9', 'blog/tistory/tistory-9/05dc313ec3456dd4.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_4', 'post_tistory_9', 'blog/tistory/tistory-9/3026bf6dac8b87e9.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_5', 'post_tistory_9', 'blog/tistory/tistory-9/df3e25c8b79c3b36.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_6', 'post_tistory_9', 'blog/tistory/tistory-9/7a477a5882fd3f84.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_9_7', 'post_tistory_9', 'blog/tistory/tistory-9/c7e36c081213119c.png', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_7_0', 'post_tistory_7', 'blog/tistory/tistory-7/23f004edbe13a9d8.png', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_6_0', 'post_tistory_6', 'blog/tistory/tistory-6/f78dca2bd4f7bcf8.webp', 'hero', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;
INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES ('media_tistory_6_1', 'post_tistory_6', 'blog/tistory/tistory-6/b4793533f342240d.webp', 'body', NULL, NULL, '2026-07-31T08:40:49.151Z') ON CONFLICT(id) DO UPDATE SET post_id=excluded.post_id, r2_key=excluded.r2_key, kind=excluded.kind, width=excluded.width, height=excluded.height, created_at=excluded.created_at;

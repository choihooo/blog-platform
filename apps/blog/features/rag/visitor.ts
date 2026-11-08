import { projects } from "@blog-platform/core/content/catalog";
import { factualAnswer } from "./factual";
import type { RagResult } from "@blog-platform/core/search";

const reply = (answer: string): RagResult => ({ answer, sources: [] });

/** Product facts are maintained separately from biographical search evidence. */
export function visitorAnswer(query: string): RagResult | null {
  const q = query.trim();
  if (/연봉|전화번호|집\s*어디|집주소|내부\s*코드|비공개|공개\s*안\s*한/.test(q))
    return reply(
      "연봉·개인 연락처·비공개 회사 자료는 안내하지 않아요. 공개 이력서와 프로젝트 범위에서 확인할 수 있어요.",
    );
  if (/이직|채용\s*가능|구직|입사\s*가능/.test(q))
    return reply(
      "현재 이직 의사와 입사 가능 시점은 공개 자료만으로 확인할 수 없어요. 이력서 페이지의 공개 연락 경로로 직접 확인해 주세요.",
    );
  if (/뽑을\s*만|실력\s*어때|잘하는\s*사람|우리\s*팀|차별점|자신\s*있는|단점/.test(q))
    return reply(
      "채용 적합성이나 성격을 단정할 수는 없어요. 지원 역할과 중요하게 보는 기술을 알려주면, 공개 프로젝트의 역할·성과를 근거로 확인할 수 있어요.",
    );
  if (/^(안녕(?:하세요)?|하이|hello|hi)[!.?\s]*$/i.test(q))
    return reply(
      "안녕하세요! 최호의 경력, 프로젝트, 블로그 글을 안내해요. ‘대표 프로젝트 보여줘’ 또는 ‘AI 글 있어?’로 시작해 보세요.",
    );
  if (
    /^(추천\s*좀|뭐\s*할\s*수\s*있어|여기서\s*뭘\s*보면\s*돼|가장\s*먼저\s*볼.*)[?.!\s]*$/.test(q)
  )
    return reply(
      "경력이 궁금하면 ‘어떤 개발자야?’, 작업 결과는 ‘대표 프로젝트’, 글을 읽으려면 ‘React 글 추천’으로 물어보세요.",
    );
  if (
    /^(누구야|누구\s*포트폴리오야|어떤\s*개발자야|간단하게\s*소개해줘|세\s*줄로\s*요약해줘|프론트엔드\s*개발자야)[?.!\s]*$/.test(
      q,
    )
  )
    return factualAnswer("최호 소개해줘");
  if (/^(주로\s*)?(쓰는\s*기술|어떤\s*기술.*써|백엔드도.*|기술\s*스택).*\??$/.test(q))
    return factualAnswer("기술 스택");
  if (/이력서.*(?:어디|볼)|연락.*(?:어떻게|하려면)/.test(q))
    return reply("[이력서](/resume)에서 경력과 공개 연락 경로를 확인할 수 있어요.");

  const product =
    /챗봇|이\s*사이트|이\s*포트폴리오|여기\s*뭐\s*하는\s*사이트|픽셀룸|캐릭터|모델|다운로드|모바일|내\s*대화|내\s*컴퓨터|인터넷\s*없|서버로\s*전송|매번\s*받|처음.*오래/.test(
      q,
    );
  if (!product || /프로젝트|관련\s*글|쓴\s*글|경험/.test(q)) return null;
  if (/저장|전송|개인정보/.test(q))
    return reply(
      "검색 질문과 후속 질문 해석에 필요한 이전 검색어·제목은 서버와 Cloudflare 검색 경로로 전달돼요. 답변 생성은 기기에서 처리해요. 현재 채팅 메시지는 화면 메모리에 유지하며 별도 대화 저장 기능은 없지만, 서버 운영 로그까지 전혀 남지 않는다고 보장하진 않아요.",
    );
  if (/취소|중지/.test(q))
    return reply(
      "모델 로딩 중에는 다운로드 취소 버튼을, 답변 생성 중에는 입력창의 중지 버튼을 누르면 돼요. 다시 시도할 수 있고 기존 모델 캐시는 임의로 삭제하지 않아요.",
    );
  if (/모바일|지원|브라우저/.test(q))
    return reply(
      "현재 챗봇은 WebGPU 사용 가능 여부를 확인한 데스크톱 Chrome·Edge 계열에만 열려 있어요. 모바일은 지원하지 않으며, 기기 메모리나 브라우저 설정에 따라 모델 실행이 실패할 수 있어요.",
    );
  if (/인터넷\s*없|오프라인/.test(q))
    return reply(
      "완전한 오프라인 챗봇은 아니에요. 모델이 캐시돼도 공개 자료 검색은 서버에 요청하므로 인터넷 연결이 필요해요.",
    );
  if (/다운로드|모델|매번|오래|내\s*컴퓨터/.test(q))
    return reply(
      "Kanana 2 1.3B Q8 모델을 브라우저에서 실행해요. 첫 방문에는 약 1.38GB를 세 조각으로 내려받고 런타임을 초기화하므로 시간이 걸려요. 모델 캐시가 남아 있으면 재사용하지만, 캐시 삭제나 모델 주소 변경 시 다시 받을 수 있어요. 분할 다운로드가 전체 용량을 줄이는 것은 아니에요.",
    );
  return reply(
    "이 포트폴리오는 Next.js·React 기반이고, 픽셀 작업실의 Work·Blog·About 오브젝트로 이동해요. 캐릭터는 분리된 이미지와 자세 상태로 표현해요. 챗봇은 Cloudflare D1·Vectorize로 공개 자료를 검색하고, 브라우저의 Kanana 모델로 설명을 생성해요. 이미지 제작의 개인 기여도는 코드만으로 단정하지 않아요.",
  );
}

/** Resolve only an exact public title/slug; client context is never itself evidence. */
export function projectDetail(query: string): RagResult | null {
  const q = query.toLowerCase();
  const found = projects.filter((p) => q.includes(p.name.toLowerCase()) || q.includes(p.slug));
  if (found.length !== 1) return null;
  const p = found[0]!;
  const source = {
    title: p.name,
    url: `/projects/${p.slug}`,
    text: p.description.slice(0, 550),
    score: 1,
  };
  if (/관련.*글|만들면서.*글/.test(q)) {
    const posts = p.relatedPosts?.slice(0, 3) ?? [];
    return {
      answer: posts.length
        ? posts.map((post, i) => `${i + 1}. [${post.title}](/blog/${post.slug})`).join("\n\n")
        : "이 프로젝트에 연결된 공개 글은 아직 등록돼 있지 않아요. 프로젝트 원문에서 상세 내용을 확인할 수 있어요.",
      sources: posts.length
        ? posts.map((post) => ({
            title: post.title,
            url: `/blog/${post.slug}`,
            text: (post.excerpt ?? post.title).slice(0, 550),
            score: 1,
          }))
        : [source],
    };
  }
  if (/글|블로그|포스트/.test(q)) return null;
  let answer: string;
  if (/링크|출처|근거\s*어디|코드|써볼|데모/.test(q)) {
    const links = (p.evidence ?? [])
      .filter((e) => !/코드/.test(q) || e.type === "repository")
      .filter((e) => /^https:\/\//.test(e.href));
    answer = `[${p.name}](/projects/${p.slug})\n\n${links.length ? links.map((e) => `- [${e.label}](${e.href})`).join("\n") : "요청한 외부 코드·데모 링크는 등록돼 있지 않아요. 프로젝트 원문을 확인해 주세요."}`;
  } else if (/스택|사용.*기술/.test(q)) answer = `${p.name}의 기술: ${p.technologies.join(", ")}`;
  else if (/본인|직접\s*한|역할|맡/.test(q))
    answer = `${p.name}\n역할: ${p.role}\n팀 구성: ${p.team ?? "미기재"}\n\n${p.description}\n\n팀 전체 성과와 개인 기여를 동일하게 단정하지 않아요. 상세 구현은 프로젝트 원문에서 확인해 주세요.`;
  else if (/성과|결과|수치/.test(q))
    answer = `${p.name}\n\n${p.metrics.map((m) => `- ${m.label}: ${m.value} — ${m.detail}`).join("\n")}`;
  else if (/자세히\s*설명|다시\s*보여|요약/.test(q))
    answer = `${p.name}\n\n${p.description}\n\n- 역할: ${p.role}\n- 기술: ${p.technologies.join(", ")}\n\n[상세 원문](/projects/${p.slug})`;
  else return null;
  return { answer, sources: [source] };
}

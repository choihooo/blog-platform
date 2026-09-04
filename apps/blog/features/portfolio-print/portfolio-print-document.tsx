"use client";

import { AspectRatio, Avatar, Badge, Chip, ChipGroup } from "@hozui/react";

import { aiWorkflowProject } from "@/features/projects/data/ai-workflow";
import type { ProjectContentBlock, ProjectSection } from "@/features/projects/project-types";

import styles from "./portfolio-print.module.css";

type TextBlock = Extract<ProjectContentBlock, { type: "text" }>;
type ResultBlock = Extract<ProjectContentBlock, { type: "result" }>;
type ImageBlock = Extract<ProjectContentBlock, { type: "image" }>;

const project = aiWorkflowProject;

function findBlock<T extends ProjectContentBlock["type"]>(
  section: ProjectSection,
  type: T,
  id?: string,
) {
  return section.blocks.find(
    (block) => block.type === type && (id === undefined || ("id" in block && block.id === id)),
  ) as Extract<ProjectContentBlock, { type: T }> | undefined;
}

function paragraphs(block?: TextBlock) {
  if (!block) return [];
  return typeof block.body === "string" ? [block.body] : [...block.body];
}

function PageFooter({ page }: { page: number }) {
  return (
    <footer className={styles.footer}>
      <span>CHOI HO / FRONTEND PORTFOLIO</span>
      <span>blog.hozorica.com</span>
      <span>{String(page).padStart(2, "0")}</span>
    </footer>
  );
}

function Metric({ detail, label, value }: { detail: string; label: string; value: string }) {
  return (
    <article className={styles.metric}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function PortfolioPrintDocument() {
  const domCase = project.sections[0]!;
  const parallelCase = project.sections[2]!;
  const domProblem = paragraphs(findBlock(domCase, "text", "problem"));
  const domAnalysis = paragraphs(findBlock(domCase, "text", "analysis"));
  const domSolution = paragraphs(findBlock(domCase, "text", "solution"));
  const domResult = findBlock(domCase, "result", "result") as ResultBlock | undefined;
  const domImage = findBlock(domCase, "image") as ImageBlock | undefined;
  const architectureImage = findBlock(parallelCase, "image") as ImageBlock | undefined;
  const parallelSolution = paragraphs(findBlock(parallelCase, "text", "solution"));
  const parallelResult = findBlock(parallelCase, "result", "result") as ResultBlock | undefined;

  return (
    <main className={styles.document}>
      <section className={`${styles.sheet} ${styles.cover}`} aria-label="포트폴리오 표지">
        <div className={styles.coverTop}>
          <Badge label="PORTFOLIO 2026" size="md" tone="brand" variant="weak" />
          <p>SELECTED FRONTEND ENGINEERING WORK</p>
        </div>

        <div className={styles.coverMain}>
          <div className={styles.identity}>
            <Avatar className={styles.avatar} label="최호 프로필 사진" size="xl">
              <img alt="" src="/resume/profile.png" />
            </Avatar>
            <div>
              <p className={styles.eyebrow}>FRONTEND ENGINEER</p>
              <h1>최호</h1>
            </div>
          </div>

          <p className={styles.coverStatement}>
            <span>문제의 원인을 사용자 흐름과 데이터로</span>
            <span>확인하고, 검증 가능한</span>
            <span>프론트엔드 구조로 개선합니다.</span>
          </p>

          <div className={styles.coverRule} />

          <div className={styles.coverGrid}>
            <div>
              <p className={styles.label}>FOCUS</p>
              <p>제품 문제 분석</p>
              <p>프론트엔드 아키텍처</p>
              <p>성능 및 품질 자동화</p>
            </div>
            <div>
              <p className={styles.label}>STACK</p>
              <p>React · Next.js · TypeScript</p>
              <p>React Native · Electron · Tauri</p>
              <p>Playwright · Vitest · CI/CD</p>
            </div>
            <div>
              <p className={styles.label}>CONTACT</p>
              <p>hochoi8621@gmail.com</p>
              <p>blog.hozorica.com</p>
              <p>github.com/choihooo</p>
            </div>
          </div>
        </div>

        <p className={styles.coverIndex}>01 / AI 수정 workflow 자동화</p>
        <PageFooter page={1} />
      </section>

      <section className={styles.sheet} aria-label="AI 수정 workflow 프로젝트 개요">
        <header className={styles.projectHeader}>
          <div>
            <div className={styles.badgeRow}>
              <Badge label="FEATURED PROJECT" size="sm" tone="brand" variant="weak" />
              <span>PROJECT {project.index}</span>
            </div>
            <h2>{project.name}</h2>
            <p className={styles.projectDescription}>{project.description}</p>
          </div>
          <dl className={styles.metadata}>
            <div>
              <dt>ROLE</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>TEAM</dt>
              <dd>{project.team}</dd>
            </div>
            <div>
              <dt>PERIOD</dt>
              <dd>{project.period}</dd>
            </div>
          </dl>
        </header>

        <ChipGroup className={styles.chips} aria-label="프로젝트 기술 스택">
          {project.technologies.map((technology) => (
            <Chip key={technology} label={technology} size="sm" tone="accent" />
          ))}
        </ChipGroup>

        <section className={styles.impact} aria-labelledby="impact-title">
          <div className={styles.sectionLead}>
            <p className={styles.eyebrow}>IMPACT</p>
            <h3 id="impact-title">화면 추측을 구조화된 실행 계약으로 바꿨습니다.</h3>
          </div>
          <div className={styles.metrics}>
            <Metric detail="입력 컨텍스트 최적화" label="INPUT TOKEN" value="-10.3%" />
            <Metric detail="AI 실행 비용" label="EXECUTION COST" value="-35.4%" />
            <Metric detail="전체 카드 처리 시간" label="PROCESSING TIME" value="-31.6%" />
          </div>
          <p className={styles.measurement}>측정 기준: post-slim dry-run 10회 중앙값</p>
        </section>

        <div className={styles.caseGrid}>
          <div className={styles.caseNarrative}>
            <p className={styles.eyebrow}>{domCase.eyebrow}</p>
            <h3>{domCase.title}</h3>
            <div className={styles.copyBlock}>
              <h4>문제</h4>
              <p>{domProblem[1] ?? domProblem[0]}</p>
            </div>
            <div className={styles.copyBlock}>
              <h4>원인</h4>
              <p>{domAnalysis[0]}</p>
            </div>
            <div className={styles.decisionPanel}>
              <span>CORE DECISION</span>
              <p>{domSolution[0]}</p>
            </div>
          </div>

          {domImage ? (
            <figure className={styles.figure}>
              <AspectRatio ratio="4:3" radius="md" size="md">
                <img alt={domImage.alt} src={domImage.src} />
              </AspectRatio>
              <figcaption>
                <Badge label="PROBLEM EVIDENCE" size="sm" tone="neutral" variant="outline" />
                <span>{domImage.caption}</span>
              </figcaption>
            </figure>
          ) : null}
        </div>

        <PageFooter page={2} />
      </section>

      <section className={styles.sheet} aria-label="AI 수정 workflow 프로젝트 해결과 결과">
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>PROJECT 01 / SYSTEM DESIGN</p>
            <h2>
              이미지 기반 추측에서
              <br />
              검증 가능한 실행 흐름으로
            </h2>
          </div>
          <p>
            DOM 컨텍스트, 에이전트 어댑터, 의존성 라우팅을 하나의 작업 카드와 Acceptance Criteria로
            연결했습니다.
          </p>
        </header>

        {architectureImage ? (
          <figure className={`${styles.figure} ${styles.architecture}`}>
            <AspectRatio ratio="16:9" radius="md" size="md">
              <img alt={architectureImage.alt} src={architectureImage.src} />
            </AspectRatio>
            <figcaption>
              <Badge label="ARCHITECTURE" size="sm" tone="brand" variant="weak" />
              <span>{architectureImage.caption}</span>
            </figcaption>
          </figure>
        ) : null}

        <section className={styles.decisionSection} aria-labelledby="decision-title">
          <div className={styles.sectionLead}>
            <p className={styles.eyebrow}>DECISION CHAIN</p>
            <h3 id="decision-title">세 가지 경계를 분리했습니다.</h3>
          </div>
          <ol className={styles.decisionChain}>
            <li>
              <span>01</span>
              <h4>Context</h4>
              <p>
                화면 전체 이미지 대신 selector, DOM 계층, 주변 요소와 소스 파일을 작업 카드에
                기록했습니다.
              </p>
            </li>
            <li>
              <span>02</span>
              <h4>Agent</h4>
              <p>
                Claude와 Codex의 인증·세션·응답 차이를 어댑터 안으로 격리하고 공통 실행 계약을
                만들었습니다.
              </p>
            </li>
            <li>
              <span>03</span>
              <h4>Routing</h4>
              <p>{parallelSolution[0]}</p>
            </li>
          </ol>
        </section>

        <section className={styles.resultPanel} aria-labelledby="result-title">
          <div>
            <p className={styles.eyebrow}>RESULT</p>
            <h3 id="result-title">속도와 안정성을 같은 검증 흐름 안에서 관리했습니다.</h3>
          </div>
          <div>
            <p>{domResult?.body}</p>
            <p>{parallelResult?.body}</p>
          </div>
        </section>

        <PageFooter page={3} />
      </section>
    </main>
  );
}

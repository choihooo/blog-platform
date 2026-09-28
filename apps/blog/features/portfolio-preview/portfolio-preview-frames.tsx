import { AspectRatio, Badge, Chip, ChipGroup } from "@hozui/react";

import { aiWorkflowProject } from "@/features/projects/data/ai-workflow";

import { AssetPlaceholder, FrameMeta, Metric } from "./portfolio-preview-primitives";
import styles from "./portfolio-preview.module.css";

const project = aiWorkflowProject;

export function CoverFrame() {
  return (
    <section className={`${styles.frame} ${styles.blueFrame} ${styles.cover}`} id="frame-01">
      <FrameMeta current="01" label="PORTFOLIO / 2026" />
      <div className={styles.coverLayout}>
        <div className={styles.coverTitle}>
          <p>FRONTEND · PRODUCT · AUTOMATION</p>
          <h1>
            문제를 구조로,
            <br />
            결과를 데이터로.
          </h1>
        </div>
        <div className={styles.coverProfile}>
          <p className={styles.kicker}>CHOI HO</p>
          <h2>최호</h2>
          <p>
            사용자 흐름에서 문제를 찾고,
            <br />
            검증 가능한 프론트엔드 시스템으로 바꿉니다.
          </p>
        </div>
        <div className={styles.keywordField} aria-label="핵심 역량">
          <span className={styles.keywordPrimary}>ENGINEERING</span>
          <span>PRODUCT SENSE</span>
          <span>ARCHITECTURE</span>
          <span>QUALITY SYSTEM</span>
          <span>CROSS PLATFORM</span>
        </div>
        <div className={styles.coverContact}>
          <div>
            <span>WEB</span>
            <strong>blog.hozorica.com</strong>
          </div>
          <div>
            <span>MAIL</span>
            <strong>hochoi8621@gmail.com</strong>
          </div>
          <div>
            <span>GITHUB</span>
            <strong>github.com/choihooo</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectFrame() {
  return (
    <section className={`${styles.frame} ${styles.blueFrame} ${styles.projectIntro}`} id="frame-02">
      <FrameMeta current="02" label="FEATURED PROJECT" />
      <div className={styles.projectIntroGrid}>
        <div className={styles.projectIntroCopy}>
          <div className={styles.projectMarker}>
            <span>{project.index}</span>
            <Badge label="INTERNAL WORKFLOW" size="sm" tone="neutral" variant="outline" />
          </div>
          <h2>
            AI 수정<span>workflow 자동화</span>
          </h2>
          <p className={styles.projectThesis}>
            화면 기반 추측을
            <br />
            검증 가능한 실행 흐름으로 전환했습니다.
          </p>
          <dl className={styles.projectFacts}>
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
        </div>
        <div className={styles.projectVisualColumn}>
          <AssetPlaceholder
            className={styles.heroPlaceholder}
            eyebrow="ASSET 01 · HERO VISUAL"
            title="AI workflow 대표 비주얼"
            specification="권장: 1920×1280 PNG · 작업 카드, DOM Tree, 실행 결과가 한 장에 보이는 합성 이미지"
          />
          <div className={styles.introMetrics}>
            <Metric caption="입력 컨텍스트" label="TOKEN" value="-10.3%" />
            <Metric caption="AI 실행 비용" label="COST" value="-35.4%" />
            <Metric caption="전체 처리 시간" label="TIME" value="-31.6%" />
          </div>
          <p className={styles.measurement}>POST-SLIM DRY-RUN 10회 · 중앙값 기준</p>
        </div>
      </div>
    </section>
  );
}

export function AnalysisFrame() {
  return (
    <section className={`${styles.frame} ${styles.dataFrame}`} id="frame-03">
      <FrameMeta current="03" label="PROBLEM / ANALYSIS" />
      <header className={styles.dataHeader}>
        <div>
          <p className={styles.kicker}>CASE 01 · TARGET MISMATCH</p>
          <h2>
            이미지는 위치를 보여줬지만,
            <br />
            수정할 코드를 알려주지 않았습니다.
          </h2>
        </div>
        <p>
          화면 캡처에는 selector, DOM 계층, 컴포넌트와 소스 파일 정보가 없습니다. 유사한 요소가
          많아질수록 AI가 수정 대상을 다시 추측해야 했습니다.
        </p>
      </header>
      <div className={styles.analysisLayout}>
        <div className={styles.analysisRail}>
          <div className={styles.analysisIndex}>01</div>
          <div>
            <span>OBSERVATION</span>
            <strong>올바른 화면 위치를 찾고도 관련 없는 코드를 변경했습니다.</strong>
          </div>
          <div>
            <span>ROOT CAUSE</span>
            <strong>이미지와 실제 DOM 사이에 연결 정보가 없었습니다.</strong>
          </div>
          <div className={styles.insightBlock}>
            <span>CORE INSIGHT</span>
            <strong>더 좋은 이미지 인식보다 구조화된 실행 컨텍스트가 필요했습니다.</strong>
          </div>
        </div>
        <div className={styles.evidenceColumn}>
          <figure className={styles.evidenceFigure}>
            <AspectRatio ratio="16:9" radius="none" size="md">
              <img
                alt="이미지의 시각적 위치와 DOM 요소가 연결되지 않는 문제"
                src="/projects/ai-workflow/dom-mismatch-thumbnail.png"
              />
            </AspectRatio>
            <figcaption>
              <span>EXISTING ASSET</span> 이미지 위치와 실제 수정 대상 DOM의 불일치
            </figcaption>
          </figure>
          <AssetPlaceholder
            className={styles.taskCardPlaceholder}
            eyebrow="ASSET 02 · TASK CARD"
            title="구조화된 작업 카드 예시"
            specification="권장: 1440×900 PNG · selector, DOM context, source file, Acceptance Criteria가 보이는 실제/재현 UI"
          />
        </div>
      </div>
    </section>
  );
}

export function SystemFrame() {
  return (
    <section className={`${styles.frame} ${styles.dataFrame} ${styles.systemFrame}`} id="frame-04">
      <FrameMeta current="04" label="SYSTEM / RESULT" />
      <header className={styles.systemHeader}>
        <div>
          <p className={styles.kicker}>DECISION CHAIN</p>
          <h2>
            세 개의 경계를 분리하고
            <br />
            하나의 검증 흐름으로 묶었습니다.
          </h2>
        </div>
        <ChipGroup className={styles.techChips} aria-label="프로젝트 기술 스택">
          {project.technologies.map((technology) => (
            <Chip key={technology} label={technology} size="sm" tone="accent" />
          ))}
        </ChipGroup>
      </header>
      <div className={styles.systemLayout}>
        <div className={styles.architecturePanel}>
          <figure>
            <img
              alt="DOM Tree 컨텍스트부터 멀티 에이전트 실행과 검증까지의 흐름"
              src="/projects/diagrams/ai-workflow-architecture.png"
            />
            <figcaption>
              <span>EXISTING ASSET</span> AI 수정 workflow 전체 구조
            </figcaption>
          </figure>
        </div>
        <ol className={styles.decisionList}>
          <li>
            <span>01 / CONTEXT</span>
            <strong>화면 캡처를 selector와 DOM Tree로 교체</strong>
          </li>
          <li>
            <span>02 / AGENT</span>
            <strong>Claude와 Codex의 차이를 어댑터로 격리</strong>
          </li>
          <li>
            <span>03 / ROUTING</span>
            <strong>의존 작업은 순차, 독립 작업은 병렬 실행</strong>
          </li>
          <li>
            <span>04 / VERIFY</span>
            <strong>Acceptance Criteria를 통과한 결과만 병합</strong>
          </li>
        </ol>
      </div>
      <div className={styles.resultStrip}>
        <div>
          <span>RESULT</span>
          <strong>속도와 안정성을 같은 실행 계약 안에서 관리했습니다.</strong>
        </div>
        <AssetPlaceholder
          className={styles.chartPlaceholder}
          eyebrow="ASSET 03 · BENCHMARK"
          title="실행 전후 비교 차트"
          specification="권장: SVG 또는 1600×700 PNG · 토큰/비용/시간 Before–After, dry-run 10회 분포와 중앙값"
        />
      </div>
    </section>
  );
}

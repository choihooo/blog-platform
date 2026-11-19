import styles from "./architecture.module.css";

function ArrowMarker({ id }: { id: string }) {
  return <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="context-stroke" /></marker></defs>;
}

function TextNode({ x, y, width = 128, title, detail }: { x: number; y: number; width?: number; title: string; detail: string }) {
  return <g className={styles.flowNode}>
    <rect x={x} y={y} width={width} height={66} />
    <text className={styles.serviceTitle} x={x + width / 2} y={y + 26} textAnchor="middle">{title}</text>
    <text className={styles.detail} x={x + width / 2} y={y + 47} textAnchor="middle">{detail}</text>
  </g>;
}

function DatabaseNode({ x, y }: { x: number; y: number }) {
  return <g className={styles.flowDatabase}>
    <path d={`M${x - 28} ${y}V${y + 40}C${x - 28} ${y + 51} ${x + 28} ${y + 51} ${x + 28} ${y + 40}V${y}`} />
    <ellipse cx={x} cy={y} rx={28} ry={8} />
    <text className={styles.serviceTitle} x={x} y={y + 30} textAnchor="middle">D1</text>
  </g>;
}

export function DeploymentComparison() {
  const rows = [
    { name: "Pages", context: "정적 화면", server: "Pages Functions", detail: "별도 저장 API", extra: false },
    { name: "Workers", context: "화면 · 서버", server: "Workers", detail: "Next.js 서버", extra: false },
    { name: "Vercel", context: "설계 예시", server: "Vercel", detail: "Next.js 서버", extra: true },
  ];
  return <figure className={`not-prose ${styles.figure}`} aria-label="플랫폼별 지출 저장 요청 비교" aria-description="D1을 유지하는 구성 예시입니다. 같은 브라우저의 지출 저장 요청이 Pages에서는 별도로 작성한 Pages Functions API를, Workers에서는 Next.js 서버 코드를 거쳐 D1에 기록됩니다. Vercel 예시는 Vercel의 Next.js 서버가 HTTP로 Worker API를 호출하고 Worker가 D1에 접근합니다. Vercel에서 D1에 접근하는 유일한 방식이나 기본 구성이라는 뜻은 아닙니다. 실제 네트워크 요청이나 성능 측정이 아닌 정적 비교입니다.">
    <figcaption className={styles.diagramTitle}>같은 지출 저장 요청의 실행 위치</figcaption>
    <div className={styles.scroller} role="region" aria-label="플랫폼별 저장 경로 비교, 좁은 화면에서는 가로 스크롤할 수 있습니다" tabIndex={0}>
      <svg className={`${styles.canvas} ${styles.comparisonCanvas}`} width={620} height={350} viewBox="0 0 620 350" role="img" aria-label="Pages·Workers·Vercel의 저장 요청 경로 비교">
        <title>플랫폼별 지출 저장 요청 비교</title>
        <ArrowMarker id="ledger-comparison-arrow" />
        {rows.map((row, index) => {
          const y = 10 + index * 112;
          return <g key={row.name}>
            <rect className={styles.laneBackground} x={4} y={y} width={612} height={100} />
            <text className={styles.serviceTitle} x={16} y={y + 44}>{row.name}</text>
            <text className={styles.small} x={16} y={y + 64}>{row.context}</text>
            <TextNode x={116} y={y + 18} width={96} title="브라우저" detail="지출 저장" />
            <TextNode x={244} y={y + 18} width={112} title={row.server} detail={row.detail} />
            {row.extra && <TextNode x={388} y={y + 18} width={96} title="Worker API" detail="D1 접근" />}
            <DatabaseNode x={564} y={y + 25} />
            <g className={styles.connections} markerEnd="url(#ledger-comparison-arrow)">
              <path d={`M212 ${y + 51}H244`} />
              {row.extra ? <>
                <path d={`M356 ${y + 51}H388`} />
                <path d={`M484 ${y + 51}H536`} />
              </> : <path d={`M356 ${y + 51}H536`} />}
            </g>
            <text className={styles.small} x={row.extra ? 372 : 446} y={y + 34} textAnchor="middle">{row.extra ? "HTTP" : "D1 바인딩"}</text>
          </g>;
        })}
      </svg>
    </div>
  </figure>;
}

export function BuildAndRequestFlow() {
  return <figure className={`not-prose ${styles.figure}`} aria-label="배포 준비와 사용자 요청 처리" aria-description="배포 준비에서는 Next.js 앱 코드에서 Next.js 빌드, OpenNext의 Workers용 변환, Workers 배포 순서로 진행합니다. 사용자가 지출을 저장할 때는 브라우저에서 Workers의 Next.js 서버 코드로 요청하고 D1에 기록합니다. OpenNext의 빌드·변환은 배포 준비에 해당하며 사용자 요청마다 앱 전체를 다시 변환하는 것이 아닙니다. 정적 설명 도표이며 실제 실행이나 시간 측정이 아닙니다.">
    <figcaption className={styles.diagramTitle}>빌드할 때와 요청을 처리할 때</figcaption>
    <div className={styles.scroller} role="region" aria-label="배포 준비와 요청 처리 흐름, 좁은 화면에서는 가로 스크롤할 수 있습니다" tabIndex={0}>
      <svg className={`${styles.canvas} ${styles.phaseCanvas}`} width={620} height={304} viewBox="0 0 620 304" role="img" aria-label="OpenNext는 배포 준비, Workers는 사용자 요청 처리를 담당하는 흐름">
        <title>배포 준비와 사용자 요청 처리</title>
        <ArrowMarker id="ledger-phase-arrow" />
        <text className={styles.serviceTitle} x={12} y={20}>배포 준비</text>
        <TextNode x={12} y={40} title="Next.js 앱 코드" detail="작성한 화면·서버" />
        <TextNode x={168} y={40} title="Next.js 빌드" detail="빌드 결과 생성" />
        <TextNode x={324} y={40} title="OpenNext" detail="Workers용 변환" />
        <TextNode x={480} y={40} title="Workers에 배포" detail="변환 결과 업로드" />
        <path className={styles.phaseDivider} d="M12 144H608" />
        <text className={styles.serviceTitle} x={12} y={180}>사용자가 저장할 때</text>
        <TextNode x={12} y={202} title="브라우저" detail="지출 저장 요청" />
        <TextNode x={246} y={202} title="Workers" detail="Next.js 서버 실행" />
        <TextNode x={480} y={202} title="D1" detail="지출 기록" />
        <g className={styles.connections} markerEnd="url(#ledger-phase-arrow)">
          <path d="M140 73H168" />
          <path d="M296 73H324" />
          <path d="M452 73H480" />
          <path d="M140 235H246" />
          <path d="M374 235H480" />
        </g>
        <g className={styles.edgeLabels}>
          <text x={193} y={223} textAnchor="middle">HTTPS</text>
          <text x={427} y={223} textAnchor="middle">D1 바인딩</text>
        </g>
      </svg>
    </div>
  </figure>;
}

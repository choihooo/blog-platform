import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HardDrive } from "lucide-react";
import styles from "./architecture.module.css";

const iconDirectory = join(process.cwd(), "app/blog/_drafts/nextjs-cloudflare-deployment/assets/icons");
type Service = "workers-color" | "d1" | "nextjs" | "nodejs-color" | "caddy" | "oracle";

function ServiceIcon({ name, x, y, width = 40, height = width }: { name: Service; x: number; y: number; width?: number; height?: number }) {
  const source = readFileSync(join(iconDirectory, `${name}.svg`), "utf8");
  const viewBox = source.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox || /<script|onload=|javascript:/i.test(source)) throw new Error(`Invalid local service icon: ${name}`);
  // Keep original gradient colors, with service-specific IDs to prevent collisions.
  const body = source.replace(/^[\s\S]*?<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "")
    .replace(/id="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${name}-$1"`);
  return <svg x={x} y={y} width={width} height={height} viewBox={name === "oracle" ? "0 50 128 28" : viewBox} fill="currentColor" data-service={name} aria-hidden="true" dangerouslySetInnerHTML={{ __html: body }} />;
}

export function ArchitectureDiagram() {
  const toss = `data:image/png;base64,${readFileSync(join(iconDirectory, "toss-primary.png")).toString("base64")}`;
  const tossWhite = `data:image/png;base64,${readFileSync(join(iconDirectory, "toss-primary-white.png")).toString("base64")}`;
  return <figure className={`not-prose ${styles.figure}`} aria-label="가계부 전체 아키텍처" aria-description="클라이언트는 친구의 Next.js PWA입니다. PWA는 IndexedDB와 읽고 쓰며 서비스 워커는 캐시한 화면 파일을 제공합니다. Cloudflare Workers의 Next.js 서버가 화면과 API를 제공하고 D1에 가계부·등록한 주식·마지막 시세를 보관합니다. Workers는 중계용 Bearer 인증을 포함한 HTTPS 요청을 Oracle의 Caddy로 보냅니다. Caddy는 Node.js 중계 서버로 전달하고, 중계 서버는 고정 출발 IP로 토스증권의 종목 검색·현재가 API를 호출하며 토큰·시세 캐시를 관리합니다. 모든 연결은 구조를 설명하며 실제 요청 실행이나 성능 측정은 아닙니다.">
    <div className={styles.scroller} role="region" aria-label="서비스별 아키텍처, 좁은 화면에서는 가로 스크롤할 수 있습니다" tabIndex={0}>
      <svg className={styles.canvas} width={620} height={444} viewBox="0 0 620 444" role="img" aria-label="클라이언트·Cloudflare·Oracle Cloud·토스증권 API의 연결 구조">
        <title>가계부 전체 아키텍처</title>
        <metadata>D1 icon: Cloudflare, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/, https://github.com/cloudflare/cloudflare-docs. Workers, Node.js and Oracle icons: Devicon, MIT. Next.js and Caddy icons: Simple Icons, CC0. Toss Securities: unmodified official full-color primary logos. Sources and license texts are retained in assets/icons and SOURCES.md.</metadata>
        <defs>
          <marker id="ledger-architecture-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="context-stroke" /></marker>
        </defs>

        <g className={styles.containers}>
          <rect x={12} y={30} width={156} height={386} />
          <path d="M12 66H168" />
          <text x={24} y={53}>친구의 휴대폰</text>
          <rect x={222} y={30} width={176} height={386} />
          <path d="M222 66H398" />
          <text x={234} y={53}>Cloudflare</text>
          <rect x={446} y={30} width={162} height={208} />
          <path d="M446 66H608" />
          <text x={458} y={53}>Oracle Cloud</text>
          <rect x={446} y={310} width={162} height={106} />
          <path d="M446 338H608" />
          <text x={458} y={330}>외부 API</text>
        </g>

        <g className={styles.connections} markerEnd="url(#ledger-architecture-arrow)">
          <path d="M136 140H266" markerStart="url(#ledger-architecture-arrow)" />
          <path d="M60 211V296" markerStart="url(#ledger-architecture-arrow)" />
          <path d="M132 302V248H112V211" />
          <path d="M310 211V296" markerStart="url(#ledger-architecture-arrow)" />
          <path d="M354 140H452" markerStart="url(#ledger-architecture-arrow)" />
          <path d="M498 140H544" markerStart="url(#ledger-architecture-arrow)" />
          <path d="M570 211V272H527V310" markerStart="url(#ledger-architecture-arrow)" />
        </g>
        <g className={styles.edgeLabels}>
          <rect x={181} y={118} width={40} height={16} />
          <text x={201} y={130} textAnchor="middle">HTTPS</text>
          <rect x={383} y={117} width={40} height={17} />
          <text x={403} y={130} textAnchor="middle">HTTPS</text>
          <text x={403} y={159} textAnchor="middle">Bearer</text>
          <text x={320} y={259}>D1 바인딩</text>
          <text x={580} y={263}>허용 IP</text>
          <text x={23} y={259}>저장</text>
          <text x={135} y={278}>캐시</text>
        </g>

        <ServiceIcon name="nextjs" x={62} y={105} width={56} />
        <text className={styles.serviceTitle} x={90} y={184} textAnchor="middle">Next.js PWA</text>
        <text className={styles.detail} x={90} y={204} textAnchor="middle">화면 · 지출 입력</text>

        <g className={styles.localDatabase}>
          <path d="M32 305V345C32 354 88 354 88 345V305" />
          <ellipse cx={60} cy={305} rx={28} ry={8} />
          <path className={styles.databaseLine} d="M32 315C32 324 88 324 88 315" />
        </g>
        <HardDrive className={styles.cacheIcon} x={112} y={309} width={36} height={36} aria-hidden="true" />
        <text className={styles.serviceTitle} x={60} y={376} textAnchor="middle">IndexedDB</text>
        <text className={styles.detail} x={60} y={397} textAnchor="middle">지출·시세·미전송</text>
        <text className={styles.serviceTitle} x={132} y={376} textAnchor="middle">서비스 워커</text>
        <text className={styles.detail} x={132} y={397} textAnchor="middle">화면 캐시</text>

        <ServiceIcon name="workers-color" x={282} y={105} width={56} />
        <text className={styles.serviceTitle} x={310} y={184} textAnchor="middle">Workers</text>
        <text className={styles.detail} x={310} y={204} textAnchor="middle">Next.js 서버 · 화면 / API</text>

        <g className={styles.serverDatabase}>
          <path d="M266 307V357C266 372 354 372 354 357V307" />
          <ellipse cx={310} cy={307} rx={44} ry={11} />
          <ServiceIcon name="d1" x={296} y={325} width={28} />
        </g>
        <text className={styles.serviceTitle} x={310} y={389} textAnchor="middle">Cloudflare D1</text>
        <text className={styles.detail} x={310} y={408} textAnchor="middle">가계부 · 주식 · 마지막 시세</text>

        <ServiceIcon name="oracle" x={488} y={78} width={82} height={18} />
        <ServiceIcon name="caddy" x={460} y={122} width={36} />
        <ServiceIcon name="nodejs-color" x={550} y={122} width={36} />
        <text className={styles.serviceTitle} x={478} y={184} textAnchor="middle">Caddy</text>
        <text className={styles.serviceTitle} x={568} y={184} textAnchor="middle">Node.js</text>
        <text className={styles.detail} x={478} y={204} textAnchor="middle">HTTPS 수신</text>
        <text className={styles.detail} x={568} y={204} textAnchor="middle">중계 · 캐시</text>
        <text className={styles.small} x={458} y={228}>고정 출발 IP · 토큰 관리</text>

        <image className={styles.lightLogo} href={toss} x={442} y={329} width={170} height={85} preserveAspectRatio="xMidYMid meet" />
        <image className={styles.darkLogo} href={tossWhite} x={442} y={329} width={170} height={85} preserveAspectRatio="xMidYMid meet" />
        <text className={styles.detail} x={527} y={407} textAnchor="middle">종목 검색 · 현재가</text>
      </svg>
    </div>
  </figure>;
}

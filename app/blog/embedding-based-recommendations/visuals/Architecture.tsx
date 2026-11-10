import { Activity, Bell, Bot, BrainCircuit, Database, Globe, LockKeyhole, MessageSquare, Rss, Server, Check, RotateCcw, Send, FileCheck2, type LucideIcon } from 'lucide-react';
import { Frame } from '../../typescript-compiler-performance/visuals/Frame';
import styles from './architecture.module.css';

type Node = { id: string; title: string; detail: string; icon: LucideIcon; x: number; y: number; added?: boolean; error?: boolean; host?: string; gateway?: string };
type Edge = { path: string; label?: string; x?: number; y?: number; added?: boolean; error?: boolean; dashed?: boolean; both?: boolean };

function Diagram({ id, title, description, height, nodes, edges, legend, supportingServices }: { id: string; title: string; description: string; height: number; nodes: Node[]; edges: Edge[]; legend?: boolean; supportingServices?: boolean }) {
  return <Frame title={title} note={description}>
    {legend && <div className={styles.legend}><span>기존 서비스</span><span><i />임베딩을 위해 추가·확장한 부분</span></div>}
    <div className={styles.scroller} role="region" tabIndex={0} aria-label={`${title}, 좁은 화면에서는 가로 스크롤 가능`}>
      <div className={styles.canvas} style={{ height }}>
        <svg className={styles.connections} viewBox={`0 0 560 ${height}`} aria-hidden="true">
          <defs><marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L7 4L0 7" fill="none" stroke="context-stroke" strokeWidth="1.3" /></marker></defs>
          {edges.map((edge, index) => <g key={index} className={edge.error ? styles.error : edge.added ? styles.added : undefined}>
            <path d={edge.path} className={styles.line} strokeDasharray={edge.dashed ? '4 4' : undefined} markerEnd={`url(#${id}-arrow)`} markerStart={edge.both ? `url(#${id}-arrow)` : undefined} />
            {edge.label && <text x={edge.x} y={edge.y} textAnchor="middle" className={styles.edgeLabel}>{edge.label}</text>}
          </g>)}
        </svg>
        {nodes.map(({ icon: Icon, ...node }) => <div key={node.id} className={`${styles.node} ${node.host ? styles.deployment : ''} ${node.added ? styles.addedNode : ''} ${node.error ? styles.errorNode : ''}`} style={{ left: `${node.x / 560 * 100}%`, top: node.y }} role={node.host ? 'group' : undefined} aria-label={node.host}>
          {node.host && <span className={styles.host}>{node.host}</span>}
          {node.gateway && <div className={styles.gateway}><LockKeyhole size={12} aria-hidden="true" />{node.gateway}</div>}
          <div className={node.host ? styles.service : styles.nodeContents}>
            <div className={styles.top}><span className={styles.icon}><Icon size={16} strokeWidth={1.7} aria-hidden="true" /></span>{node.added && <span className={styles.badge}>추가·확장</span>}</div>
            {node.gateway && <span className={styles.vmLabel}>GCE VM</span>}
            <span className={styles.title}>{node.title}</span><span className={styles.detail}>{node.detail}</span>
          </div>
        </div>)}
      </div>
    </div>
    {supportingServices && <div className={styles.support} role="group" aria-label="알림과 모니터링">
      <span className={styles.host}>알림 · 모니터링</span>
      <div className={styles.supportServices}>
        <span><Bell size={16} aria-hidden="true" /><span>Firebase FCM<small>사용자 푸시 알림</small></span></span>
        <span><MessageSquare size={16} aria-hidden="true" /><span>Discord<small>봇 연동 · 운영 알림</small></span></span>
        <span><Activity size={16} aria-hidden="true" /><span>Sentry<small>웹 · 봇 오류 수집</small></span></span>
      </div>
    </div>}
  </Frame>;
}

export function ProjectArchitecture() {
  return <Diagram id="project" title="프로젝트 전체 구조와 임베딩 추가 부분" height={524} legend supportingServices
    description="배포 환경별로 영역을 구분했습니다. 사용자는 Vercel 웹에 접속하고, 웹은 Supabase에 데이터를 저장·조회합니다. EC2 봇은 외부 콘텐츠를 수집하며, 웹의 저장 응답 이후 임베딩 갱신 요청을 받습니다. 봇의 임베딩 요청은 Cloudflare Access와 Tunnel을 거쳐 GCE VM의 Ollama에 도착합니다. 봇은 반환된 벡터를 Supabase에 저장합니다. Firebase FCM은 사용자 푸시, Discord는 봇 연동, Sentry는 웹·봇 오류 수집을 맡습니다."
    nodes={[
      { id: 'user', host: '사용자', title: '브라우저 · PWA', detail: '글 조회 · 프로필 수정', icon: Globe, x: 8, y: 8 },
      { id: 'web', host: 'Vercel · 웹', title: 'Next.js', detail: '화면 · API\n저장된 벡터로 추천 조회', icon: Server, x: 202, y: 8 },
      { id: 'db', host: 'Supabase', title: 'PostgreSQL · Auth', detail: '사용자 · 글 정보\n추가: pgvector 벡터 저장', icon: Database, x: 396, y: 8, added: true },
      { id: 'rss', host: '외부 콘텐츠', title: 'RSS · 큐레이션', detail: '스터디원 블로그\n외부 아티클 · 컨퍼런스', icon: Rss, x: 8, y: 292 },
      { id: 'bot', host: 'AWS EC2 · 봇', title: '봇 서비스', detail: '수집 · 스케줄러\n추가: 임베딩 갱신', icon: Bot, x: 202, y: 292 },
      { id: 'embedding', host: '임베딩 서비스', gateway: 'Cloudflare Access · Tunnel', title: 'Ollama', detail: 'nomic-embed-text', icon: BrainCircuit, x: 396, y: 292, added: true },
    ]}
    edges={[
      { path: 'M164 98 H202', both: true },
      { path: 'M358 98 H396', both: true },
      { path: 'M280 228 V292', label: '저장 후 갱신', x: 280, y: 260, added: true },
      { path: 'M164 382 H202', label: '수집', x: 183, y: 370 },
      { path: 'M358 382 H396', both: true, added: true },
      { path: 'M358 326 H376 V260 H444 V228', label: '벡터 저장', x: 420, y: 250, added: true },
    ]} />;
}

export function EmbeddingServerArchitecture() {
  return <Diagram id="embedding-server" title="봇에서 임베딩 서버까지의 연결" height={496}
    description="EC2 봇의 요청은 Cloudflare Access의 서비스 토큰 인증과 Tunnel을 거쳐 GCE VM 안의 Ollama에 도착합니다. nomic-embed-text가 만든 768차원 벡터는 봇으로 돌아오고, 봇이 Supabase에 저장합니다. 브라우저에서 이 서버를 직접 호출하지 않습니다."
    nodes={[
      { id: 'bot', title: 'EC2 봇', detail: '텍스트로 임베딩 요청\n응답 벡터를 DB에 저장', icon: Bot, x: 8, y: 16 },
      { id: 'access', title: 'Cloudflare Access', detail: '서비스 토큰 인증', icon: LockKeyhole, x: 396, y: 16 },
      { id: 'tunnel', title: 'Cloudflare Tunnel', detail: '인증된 요청을 VM에 전달', icon: Send, x: 396, y: 194 },
      { id: 'ollama', title: 'GCE VM · Ollama', detail: 'nomic-embed-text\nlocalhost:11434', icon: BrainCircuit, x: 396, y: 372 },
      { id: 'db', title: 'Supabase · pgvector', detail: '사용자 취향 · 글 벡터 저장', icon: Database, x: 8, y: 372 },
    ]}
    edges={[
      { path: 'M164 48 H396', label: 'HTTPS 요청', x: 280, y: 38, added: true },
      { path: 'M474 128 V194', label: '인증 통과', x: 502, y: 165, added: true },
      { path: 'M474 306 V372', label: 'VM 내부 연결', x: 509, y: 343, added: true },
      { path: 'M396 422 H280 V86 H164', label: '768차원 벡터 반환', x: 280, y: 412, added: true },
      { path: 'M86 128 V372', label: '봇이 저장', x: 118, y: 254 },
    ]} />;
}

export function RefreshFlow() {
  return <Diagram id="refresh" title="저장은 먼저 완료하고, 추천 정보는 나중에 갱신합니다" height={484}
    description="글·프로필 저장이 끝나면 사용자에게 응답합니다. after()에서 봇에 갱신을 요청하고, 봇은 임베딩을 생성해 저장합니다. 생성 실패는 이미 끝난 저장을 취소하지 않습니다. 누락된 데이터는 별도로 백필을 실행해 같은 생성 경로로 다시 처리합니다."
    nodes={[
      { id: 'save', title: '글 · 프로필 저장', detail: '기본 데이터 저장 완료', icon: FileCheck2, x: 8, y: 8 },
      { id: 'response', title: '사용자에게 응답', detail: '임베딩 완료를 기다리지 않음', icon: Check, x: 202, y: 8 },
      { id: 'bot', title: '봇에 갱신 요청', detail: '응답 이후 after()에서 호출', icon: Bot, x: 396, y: 8 },
      { id: 'embedding', title: '임베딩 생성', detail: '별도 서버에서 텍스트 변환', icon: BrainCircuit, x: 396, y: 184 },
      { id: 'stored', title: '벡터 저장', detail: '다음 추천 조회에 사용', icon: Database, x: 202, y: 184 },
      { id: 'failure', title: '갱신 실패 · 누락', detail: '글 · 프로필 저장은 유지', icon: Activity, x: 396, y: 360, error: true },
      { id: 'backfill', title: '백필을 별도로 실행', detail: '누락된 데이터를 다시 생성', icon: RotateCcw, x: 202, y: 360 },
    ]}
    edges={[
      { path: 'M164 58 H202' },
      { path: 'M358 58 H396', added: true },
      { path: 'M474 120 V184', added: true },
      { path: 'M396 234 H358', label: '성공', x: 377, y: 222 },
      { path: 'M474 296 V360', label: '실패', x: 493, y: 332, error: true, dashed: true },
      { path: 'M396 410 H358', error: true, dashed: true },
      { path: 'M280 360 V316 H377 V265 H396', label: '다시 생성', x: 325, y: 307, dashed: true },
    ]} />;
}

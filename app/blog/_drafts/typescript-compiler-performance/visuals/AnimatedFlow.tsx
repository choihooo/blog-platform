'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Check, FileCode2, ScanLine, Link2, ShieldCheck, FileOutput, X, Code2, Braces, Play, Pause, RotateCcw } from 'lucide-react';
import { makeTimeline, flowState, curvePoint, type FlowNode, type Curve } from './flow-model';
import styles from './flow.module.css';
import ui from './visuals.module.css';

const icons = { file: FileCode2, scan: ScanLine, link: Link2, check: ShieldCheck, output: FileOutput, error: X, code: Code2, scope: Braces };
const rest = 2000;
const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReduced(onChange: () => void) {
  const media = matchMedia(reducedQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

export function AnimatedFlow({ nodes, label }: { nodes: FlowNode[]; label: string }) {
  // Changing a scenario starts a fresh execution without stale state or timers.
  return <FlowRun key={JSON.stringify(nodes)} nodes={nodes} label={label} />;
}

function FlowRun({ nodes, label }: { nodes: FlowNode[]; label: string }) {
  const timeline = useMemo(() => makeTimeline(nodes), [nodes]);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const nodeElements = useRef(new Map<string, HTMLDivElement>());
  const [curves, setCurves] = useState<Record<string, Curve>>({});
  const [clock, setClock] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(true);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(reducedQuery).matches, () => false);
  const documentVisible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
  const markerId = `flow-${useId().replace(/:/g, '')}`;
  const columns = Math.max(...nodes.map(node => node.column)) + 1;
  const rows = Math.max(...nodes.map(node => node.row)) + 1;
  const time = reduced ? timeline.duration : clock;
  const done = time >= timeline.duration;
  const runningNames = timeline.steps.filter(step => flowState(step, time) === 'running').map(step => nodes.find(node => node.id === step.id)!.title);
  const hasError = timeline.steps.some(step => nodes.find(node => node.id === step.id)?.error && flowState(step, time) === 'done');
  const summary = reduced ? (hasError ? '모션 줄이기 · 오류 상태' : '모션 줄이기 · 완료 상태') : !playing ? '일시정지' : done ? (hasError ? '오류 확인 · 잠시 후 다시 재생' : '완료 · 잠시 후 다시 재생') : runningNames.length ? `${runningNames.join(' · ')} 실행 중` : '다음 단계로 전달 중';

  useLayoutEffect(() => {
    const measure = () => {
      const box = canvas.current?.getBoundingClientRect();
      if (!box) return;
      const next: Record<string, Curve> = {};
      for (const node of nodes) for (const parent of node.after ?? []) {
        const from = nodeElements.current.get(parent)?.getBoundingClientRect();
        const to = nodeElements.current.get(node.id)?.getBoundingClientRect();
        if (from && to) next[`${parent}:${node.id}`] = {
          x1: from.right - box.left + 2, y1: from.top + from.height / 2 - box.top,
          x2: to.left - box.left - 4, y2: to.top + to.height / 2 - box.top,
        };
      }
      setCurves(next);
    };
    // ResizeObserver also catches initial layout, font and responsive changes.
    const observer = new ResizeObserver(measure);
    if (canvas.current) observer.observe(canvas.current);
    nodeElements.current.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [nodes]);

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !playing || reduced || !documentVisible) return;
    let frame = 0;
    let previous = 0;
    const tick = (now: number) => {
      if (previous) {
        const delta = Math.min(now - previous, 100);
        setClock(value => (value + delta) % (timeline.duration + rest));
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, playing, reduced, documentVisible, timeline.duration]);

  return <div className={styles.root} ref={root} aria-label={`${label} 실행 흐름`}>
    <div className={styles.toolbar}>
      <span className={styles.summary}><span className={styles.liveDot} data-state={done ? (hasError ? 'error' : 'done') : playing && !reduced ? 'running' : 'idle'} />{summary}</span>
      <div className={styles.actions}>
        <button type="button" className={ui.textButton} disabled={reduced} aria-label={`${label} ${playing ? '일시정지' : '재생'}`} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? '일시정지' : '재생'}</button>
        <button type="button" className={ui.textButton} disabled={reduced} aria-label={`${label} 다시 재생`} onClick={() => { setClock(0); setPlaying(true); }}><RotateCcw size={14} />다시 재생</button>
      </div>
    </div>
    <div className={styles.scroller} tabIndex={0} role="region" aria-label={`${label} 흐름도, 가로 스크롤 가능`}>
      <div ref={canvas} className={styles.canvas} style={{ gridTemplateColumns: `repeat(${columns}, minmax(96px, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(92px, auto))`, minWidth: columns * 96 + (columns - 1) * 20 + 16 }}>
        <svg className={styles.connections} aria-hidden="true">
          <defs><marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 1L7 4L0 7" fill="none" stroke="context-stroke" strokeWidth="1.3" /></marker></defs>
          {nodes.flatMap(node => (node.after ?? []).map(parent => {
            const key = `${parent}:${node.id}`;
            const curve = curves[key];
            if (!curve) return null;
            const edge = timeline.edges.find(item => item.from === parent && item.to === node.id);
            const edgeState = edge ? flowState(edge, time) : 'idle';
            const targetStep = timeline.steps.find(step => step.id === node.id);
            const state = edgeState === 'done' && node.error && targetStep && flowState(targetStep, time) === 'done' ? 'error' : edgeState;
            const middle = (curve.x1 + curve.x2) / 2;
            const progress = edge ? Math.max(0, Math.min(1, (time - edge.start) / (edge.end - edge.start))) : 0;
            const point = curvePoint(curve, progress * progress * (3 - 2 * progress));
            return <g key={key}>
              <path d={`M${curve.x1} ${curve.y1} C${middle} ${curve.y1} ${middle} ${curve.y2} ${curve.x2} ${curve.y2}`} className={styles.connection} data-state={state} markerEnd={`url(#${markerId})`} />
              {state === 'running' && !reduced && <circle cx={point.x} cy={point.y} r="4" className={styles.particle} />}
            </g>;
          }))}
        </svg>
        {nodes.map(node => {
          const step = timeline.steps.find(item => item.id === node.id);
          const executionState = step ? flowState(step, time) : 'inactive';
          const state = executionState === 'done' && node.error ? 'error' : executionState;
          const Icon = icons[node.icon ?? 'file'];
          return <div key={node.id} ref={element => { if (element) nodeElements.current.set(node.id, element); else nodeElements.current.delete(node.id); }} className={styles.node} data-state={state} style={{ gridColumn: node.column + 1, gridRow: node.row + 1 }}>
            <div className={styles.nodeTop}><span className={styles.icon}><Icon size={16} strokeWidth={1.7} /></span><span className={styles.stateText}>{state === 'error' ? '오류' : state === 'done' ? '완료' : state === 'running' ? '진행 중' : state === 'inactive' ? '미실행' : '대기'}</span>{state === 'done' && <Check className={styles.done} size={13} />}{state === 'error' && <X className={styles.done} size={13} />}</div>
            <span className={styles.nodeTitle}>{node.title}</span>
            {node.detail && <span className={styles.detail} data-filled={state === 'done' || state === 'error'}>{state === 'done' || state === 'error' ? node.detail : node.pending ?? node.detail}</span>}
          </div>;
        })}
      </div>
    </div>
    <p className={styles.scrollHint}>옆으로 밀어 전체 흐름을 볼 수 있습니다.</p>
    <div className={styles.legend} aria-hidden="true"><span><i data-state="idle" />대기</span><span><i data-state="running" />실행·전달</span><span><i data-state="done" />완료</span><span><i data-state="error" />오류</span></div>
  </div>;
}

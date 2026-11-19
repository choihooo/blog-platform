'use client';

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, LoaderCircle, Pause, Play, RotateCcw } from 'lucide-react';
import ui from '@/app/blog/typescript-compiler-performance/visuals/visuals.module.css';
import { createPlayback, duration, playbackReducer, viewAt, type BoundaryMode, type Delays } from './model';
import styles from './streaming.module.css';

const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReduced(change: () => void) {
  const media = matchMedia(reducedQuery);
  media.addEventListener('change', change);
  return () => media.removeEventListener('change', change);
}
function subscribeVisibility(change: () => void) {
  document.addEventListener('visibilitychange', change);
  return () => document.removeEventListener('visibilitychange', change);
}

const titles: Record<BoundaryMode, string> = {
  blocking: '모두 기다리기', single: '하나의 경계', separate: '독립된 경계', nested: '중첩된 경계',
};

function Skeleton({ comments = false }: { comments?: boolean }) {
  return <div className={styles.skeleton} aria-hidden="true">
    {comments ? <><span className={styles.skeletonAvatar} /><div className={styles.skeletonLines}><i /><i /><i /></div></> : <div className={styles.skeletonLines}><i className={styles.skeletonHeading} /><i /><i /><i /></div>}
  </div>;
}

function Preview({ mode, time, delays, comparison }: { mode: BoundaryMode; time: number; delays: Delays; comparison: boolean }) {
  const view = viewAt(mode, time, delays);
  const title = comparison && mode === 'separate' ? '준비된 부분부터' : titles[mode];
  return <section className={styles.preview} aria-label={`${titles[mode]} 화면`}>
    <div className={styles.previewTitle}>{title}</div>
    <div className={styles.browser}>
      <div className={styles.chrome} aria-hidden="true"><span /><span /><span /><small>블로그</small></div>
      <div className={styles.viewport}>
        <div className={styles.wholeFallback} data-visible={view.outerFallback} aria-hidden={!view.outerFallback}>
          <LoaderCircle size={18} className={styles.spinner} />
          <span>{mode === 'blocking' ? '응답을 기다리는 중' : '글을 불러오는 중'}</span>
        </div>
        <div className={styles.paper} data-visible={!view.outerFallback} aria-hidden={view.outerFallback}>
          <div className={styles.bodySlot}>
            <div className={styles.skeletonLayer} data-visible={!view.body} aria-hidden={view.body}><Skeleton /><span className={styles.loadingText}>본문을 불러오는 중</span></div>
            <div className={styles.reveal} data-visible={view.body} aria-hidden={!view.body}>
              <div className={styles.postTitle}>준비된 화면부터</div>
              <p className={styles.postText}>댓글을 기다리는 동안에도<br />본문을 읽을 수 있습니다.</p>
              <div className={styles.readingLines} aria-hidden="true"><i /><i /></div>
            </div>
          </div>
          <div className={styles.commentsSlot}>
            <div className={styles.commentsHeading}>댓글 <span>{view.comments ? '2' : ''}</span></div>
            <div className={styles.commentLayers}>
              <div className={styles.skeletonLayer} data-visible={!view.comments} aria-hidden={view.comments}><Skeleton comments /><span className={styles.loadingText}>댓글을 불러오는 중</span></div>
              <div className={styles.reveal} data-visible={view.comments} aria-hidden={!view.comments}>
                <div className={styles.comment}><span className={styles.avatar} aria-hidden="true">1</span><p>먼저 본문을 읽고 있었습니다.</p></div>
                <div className={styles.comment}><span className={styles.avatar} aria-hidden="true">2</span><p>댓글도 도착했습니다.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

function DemoRun({ boundary, slow, onSlowChange }: { boundary: boolean; slow: 'body' | 'comments'; onSlowChange?: (value: 'body' | 'comments') => void }) {
  const title = boundary ? 'Suspense 경계 비교' : '화면이 나타나는 시점 비교';
  const delays = slow === 'comments' ? { body: 200, comments: 3000 } : { body: 3000, comments: 200 };
  const [state, dispatch] = useReducer(playbackReducer, undefined, createPlayback);
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(reducedQuery).matches, () => false);
  const documentVisible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
  const active = visible && documentVisible && !reduced;
  const time = reduced ? duration : Math.min(state.time, duration);
  const resting = !reduced && state.time >= duration;
  const progress = time / duration;
  const modes: BoundaryMode[] = boundary ? ['single', 'separate', 'nested'] : ['blocking', 'separate'];
  const summary = reduced ? '모션 줄이기 · 완료 상태' : !state.playing ? '일시정지' : resting ? '완료 · 다시 재생 대기' : '재생 중';

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .2), { threshold: .2 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || !state.playing) return;
    let frame = 0;
    let previous: number | undefined;
    const tick = (now: number) => {
      if (previous !== undefined) dispatch({ type: 'tick', delta: Math.min(100, now - previous), active: true });
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, state.playing]);

  return <figure className={`not-prose ${ui.frame} ${styles.demoFrame} ${styles.root}`} ref={root} aria-label={title} aria-description={boundary ? '빠른 영역은 0.2초, 느린 영역은 3초인 설명용 시뮬레이션입니다. 실제 React 서버 렌더러를 실행하지 않습니다. 독립된 경계는 준비된 영역을 먼저 표시하며 중첩된 경계는 본문을 기다리는 바깥 경계가 열려야 댓글을 표시합니다. 선택을 바꾸면 재생을 초기화합니다.' : '본문 0.2초, 댓글 3초의 설명용 시뮬레이션입니다. 실제 요청이나 React 서버 렌더러를 실행하지 않습니다. 모두 기다리는 화면과 준비된 부분부터 보여주는 화면을 비교합니다.'} data-demo={boundary ? 'boundaries' : 'comparison'} data-playing={state.playing && active}>
    <figcaption className={styles.demoTitle}>{title}</figcaption>
    <div className={styles.actions}>
        <button className={styles.iconButton} type="button" disabled={reduced} title={state.playing ? '일시정지' : '재생'} aria-label={`${title} ${state.playing ? '일시정지' : '재생'}`} onClick={() => dispatch({ type: 'toggle' })}>
          {state.playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button className={styles.iconButton} type="button" disabled={reduced} title="다시 재생" aria-label={`${title} 다시 재생`} onClick={() => dispatch({ type: 'restart' })}><RotateCcw size={15} /></button>
    </div>
    <div className={styles.conditions}>
      {boundary && <label className={styles.selectLabel}>느린 영역
        <span className={ui.selectWrap}><select className={ui.select} value={slow} onChange={event => { dispatch({ type: 'restart' }); onSlowChange?.(event.target.value as 'body' | 'comments'); }}><option value="comments">댓글 · 3초</option><option value="body">본문 · 3초</option></select><ChevronDown size={14} className={ui.selectChevron} /></span>
      </label>}
      <span className={styles.timings}>본문 {delays.body / 1000}초 · 댓글 {delays.comments / 1000}초</span>
    </div>
    <div className={styles.previews} data-columns={modes.length}>
      {modes.map(mode => <Preview key={mode} mode={mode} time={time} delays={delays} comparison={!boundary} />)}
    </div>
    <div className={styles.progressRow}>
      <div className={styles.progressTrack} role="progressbar" aria-label={`${title} 재생 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-valuetext={resting || reduced ? summary : `${Math.round(progress * 100)}%`}>
        <span className={styles.progressFill} style={{ transform: `scaleX(${progress})` }} />
      </div>
      <span className={styles.progressText}>{resting || reduced || !state.playing ? summary : `${(time / 1000).toFixed(1)} / 3.0초`}</span>
    </div>
  </figure>;
}

export function StreamingComparison() {
  return <DemoRun boundary={false} slow="comments" />;
}

export function SuspenseBoundaries() {
  const [slow, setSlow] = useState<'body' | 'comments'>('comments');
  return <DemoRun boundary slow={slow} onSlowChange={setSlow} />;
}

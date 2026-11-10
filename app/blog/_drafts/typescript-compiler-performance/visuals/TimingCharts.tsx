'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { Frame } from './Frame';
import { buildTimings, phaseTimings, reduction, type Timing } from './model';
import styles from './visuals.module.css';

function Bars({ rows, domain, title, note, controls }: { rows: Timing[]; domain: number; title: string; note: string; controls?: React.ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (!element.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  return <Frame title={title} note={note}>
    <div className={styles.chartToolbar}>
      {controls}
      <button type="button" className={styles.textButton} onClick={() => { setEntered(true); setReplay(value => value + 1); }} aria-label={`${title} 다시 재생`}><RotateCcw size={14} /> 다시 재생</button>
    </div>
    <div className={styles.legend}><span><i className={styles.oldSwatch} /> TS 3.9.5</span><span><i className={styles.newSwatch} /> TS 5.8.3</span><span>낮을수록 빠릅니다</span></div>
    <div ref={element}>
      <div key={`${rows[0].label}-${replay}`} className={styles.chart} data-animate={entered} role="img" aria-label={rows.map(row => `${row.label}: TS 3.9 ${row.before.toFixed(2)}초, TS 5.8 ${row.after.toFixed(2)}초, ${reduction(row.before, row.after)}% 단축`).join('. ')}>
        {rows.map(row => <div className={styles.chartGroup} key={row.label}>
          <div className={styles.chartLabel}><span>{row.label}</span><span>{reduction(row.before, row.after)}% 단축</span></div>
          {[row.before, row.after].map((value, index) => <div className={styles.chartRow} key={index}>
            <span className={styles.version}>{index === 0 ? '3.9' : '5.8'}</span>
            <div className={styles.track}><span className={`${styles.bar} ${index === 0 ? styles.oldBar : styles.newBar}`} style={{ '--ratio': value / domain } as CSSProperties} /></div>
            <span className={styles.value}>{value.toFixed(2)}s</span>
          </div>)}
        </div>)}
        <div className={styles.axis} aria-hidden="true"><span>0</span><span>{domain / 2}s</span><span>{domain}s</span></div>
      </div>
    </div>
  </Frame>;
}

export function BuildTimingChart() {
  return <Bars title="클린·증분 빌드 시간 비교" rows={buildTimings} domain={3} note="기존 실험 5회의 중앙값입니다. 원시 실행값을 재구성하지 않고, 본문에 기록된 중앙값만 표시합니다. 애니메이션은 시간의 크기를 보여주며 실제 빌드를 재생하지 않습니다." />;
}

export function PhaseTimingChart() {
  const [view, setView] = useState<'total' | 'package'>('total');
  return <Bars title="어느 단계에서 시간이 줄었을까요?" rows={phaseTimings[view]} domain={1} note="본문에 기록된 컴파일러 내부 진단 시간입니다. 전체 실행 시간(real)과 측정 범위가 다르며 각 항목을 더해 real과 비교하지 않습니다." controls={<div className={styles.controls} role="group" aria-label="진단 시간 비교 범위"><button type="button" className={styles.button} aria-pressed={view === 'total'} onClick={() => setView('total')}>전체</button><button type="button" className={styles.button} aria-pressed={view === 'package'} onClick={() => setView('package')}>패키지별</button></div>} />;
}

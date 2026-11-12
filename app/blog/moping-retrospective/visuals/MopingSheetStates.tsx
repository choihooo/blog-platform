'use client';

import { useId, useState, type CSSProperties } from 'react';
import { IPhoneMockup } from '@/components/IPhoneMockup';
import { MapBackdrop } from './MapBackdrop';
import { upperSheetTravel, type SheetSizing } from './sheet-comparison';
import styles from './moping.module.css';

export function MopingSheetStates() {
  const [height, setHeight] = useState(740);
  const id = useId();
  return <figure className={`not-prose ${styles.frame}`} aria-label="화면 높이에 따른 바텀시트 이동 거리 비교">
    <figcaption className={styles.toolbar}>화면 높이와 위쪽 정지점</figcaption>
    <label className={styles.heightLabel} htmlFor={id}>화면 높이 <output htmlFor={id}>{height}px</output></label>
    <input id={id} className={styles.heightRange} type="range" min={568} max={960} step={1} value={height} onChange={event => setHeight(Number(event.target.value))} />
    <div className={styles.heightComparison}>
      {(['fixed', 'responsive'] as const).map(sizing => <TravelPhone key={sizing} height={height} sizing={sizing} />)}
    </div>
  </figure>;
}

function TravelPhone({ height, sizing }: { height: number; sizing: SheetSizing }) {
  const travel = upperSheetTravel(height, sizing);
  const percentage = travel / height * 100;
  const name = sizing === 'fixed' ? '고정 px' : '화면 높이에 따른 계산';
  return <div className={styles.travelColumn} data-sizing={sizing}>
    <div className={styles.travelTitle}>{name}</div>
    <div className={styles.travelValue}>{Number(travel.toFixed(1))}px · {Number(percentage.toFixed(1))}%</div>
    <IPhoneMockup className={styles.travelPhone} screenClassName={styles.travelScreen} screenProps={{ role: 'img', 'aria-label': `${height}px 화면, ${name}: 기준선에서 위로 ${Number(travel.toFixed(1))}px 이동, 화면 높이의 ${Number(percentage.toFixed(1))}%`, style: { '--demo-height': height } as CSSProperties }}>
      <div className={styles.map} aria-hidden="true"><MapBackdrop /></div>
      <div className={styles.travelSheet} style={{ height: `${percentage}%` }} aria-hidden="true">
        <div className={styles.handle}><span /></div>
        <div className={styles.travelRows}><span /><span /><span /></div>
      </div>
    </IPhoneMockup>
  </div>;
}

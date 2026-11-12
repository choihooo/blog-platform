'use client';

import { useState } from 'react';
import { MopingDemo } from './MopingDemo';
import styles from './moping.module.css';

export function MopingListComparison() {
  const [legacy, setLegacy] = useState(true);
  return <section className={`not-prose ${styles.frame}`} aria-label="장소 목록 도입 전후 비교">
    <div className={styles.toolbar}>장소를 살펴보는 방법</div>
    <div className={styles.switches} role="group" aria-label="장소 목록 도입 시점">
      <button type="button" aria-pressed={legacy} onClick={() => setLegacy(true)}>목록 추가 전</button>
      <button type="button" aria-pressed={!legacy} onClick={() => setLegacy(false)}>목록 추가 후</button>
    </div>
    <MopingDemo key={String(legacy)} legacy={legacy} embedded showList={!legacy} />
  </section>;
}

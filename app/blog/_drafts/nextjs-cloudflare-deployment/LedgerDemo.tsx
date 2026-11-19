import { BatteryFull, Signal, Wifi } from 'lucide-react';
import styles from './ledger-demo.module.css';

export function LedgerDemo() {
  return (
    <figure className={`not-prose ${styles.frame}`} aria-label="가계부 체험 데모">
      <div className={styles.heading}>
        <span>가계부 체험</span>
        <a href="/demos/personal-ledger/index.html" target="_blank" rel="noopener noreferrer">크게 보기 ↗</a>
      </div>
      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.status} aria-hidden="true">
            <span>9:41</span>
            <div className={styles.island}><i /></div>
            <span className={styles.indicators}><Signal /><Wifi /><BatteryFull /></span>
          </div>
          <iframe
            className={styles.preview}
            src="/demos/personal-ledger/index.html"
            title="휴대폰 목업 안의 가계부: 예시 데이터로 거래 입력과 월별 내역 확인"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          />
          <div className={styles.home} aria-hidden="true"><span /></div>
        </div>
      </div>
    </figure>
  );
}

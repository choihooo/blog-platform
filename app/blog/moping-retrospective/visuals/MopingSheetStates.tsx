import { MopingDemo } from './MopingDemo';
import styles from './moping.module.css';

export function MopingSheetStates() {
  return <div className={`not-prose ${styles.sheetStates}`} role="group" aria-label="바텀시트 높이 비교: 가장 낮음, 가장 높음, 중간 순서">
    <MopingDemo snapshot={{ reveal: 0.28, label: '가장 낮음' }} />
    <MopingDemo snapshot={{ reveal: 0.8, label: '가장 높음' }} />
    <MopingDemo snapshot={{ reveal: 0.52, label: '중간' }} />
  </div>;
}

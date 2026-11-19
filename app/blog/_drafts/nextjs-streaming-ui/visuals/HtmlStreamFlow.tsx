import { ArrowDown, ArrowRight, FileCode2, Layers, Replace } from 'lucide-react';
import { Frame } from '@/app/blog/typescript-compiler-performance/visuals/Frame';
import styles from './streaming.module.css';

const steps = [
  { title: '초기 HTML', detail: '본문과 댓글 로딩 UI를 먼저 전송', Icon: FileCode2 },
  { title: '나중에 도착한 댓글', detail: '댓글 HTML을 template에 담고 교체 스크립트 전송', Icon: Layers },
  { title: '댓글 영역 교체', detail: '스크립트가 template의 노드를 원래 댓글 자리로 이동', Icon: Replace },
];

export function HtmlStreamFlow() {
  return <Frame title="HTML 전송과 댓글 영역 교체" note="서버가 본문과 댓글 로딩 UI를 먼저 보내고, 댓글이 준비되면 template과 스크립트를 보냅니다. 브라우저가 스크립트를 실행해 로딩 UI를 실제 댓글로 교체합니다. 네트워크의 청크 도착만으로 기존 DOM이 자동 교체되는 것은 아닙니다.">
    <ol className={`${styles.root} ${styles.flow}`}>
      {steps.map(({ title, detail, Icon }, index) => <li key={title} className={styles.flowStep}>
        <div className={styles.flowCard}><span className={styles.icon}><Icon size={16} /></span><span className={styles.requestTitle}>{index + 1}. {title}</span><span className={styles.flowDetail}>{detail}</span></div>
        {index < steps.length - 1 && <span className={styles.arrow} aria-hidden="true"><ArrowRight className={styles.rightArrow} size={16} /><ArrowDown className={styles.downArrow} size={16} /></span>}
      </li>)}
    </ol>
  </Frame>;
}

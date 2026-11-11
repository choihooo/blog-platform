import { AppWindow, ArrowDown, ArrowLeftRight, Cpu, FileCode2, Globe } from "lucide-react";
import { Frame } from "../../typescript-compiler-performance/visuals/Frame";
import styles from "./structure.module.css";

function MessageLink() {
  return (
    <div className={styles.message} aria-hidden="true">
      <span>메시지</span>
      <ArrowLeftRight size={26} strokeWidth={1.5} />
    </div>
  );
}

export function ExtensionStructure() {
  return (
    <Frame
      title="Chrome 확장 프로그램의 실행 공간"
      note="기본 구성의 메시지 통신 예시입니다. Popup은 툴바 아이콘을 누르면 열리는 화면이고, Background는 Manifest V3 서비스 워커에서 이벤트를 처리합니다. Content Script는 웹페이지의 DOM을 읽거나 수정합니다. Popup과 Background, Background와 Content Script가 메시지를 주고받을 수 있습니다. Background는 웹페이지 DOM에 직접 접근할 수 없습니다. VOIM의 페이지 위 설정 메뉴는 툴바 Popup과 다른 UI입니다."
    >
      <div className={styles.structure}>
        <div className={styles.card}>
          <span className={styles.scope}>확장 프로그램 화면</span>
          <div className={styles.title}><span className={styles.icon}><AppWindow size={16} /></span>Popup</div>
          <p>툴바 아이콘을 누르면 열리는 작은 화면</p>
        </div>
        <MessageLink />
        <div className={styles.card}>
          <span className={styles.scope}>확장 프로그램 뒤편</span>
          <div className={styles.title}><span className={styles.icon}><Cpu size={16} /></span>Background</div>
          <p>이벤트 처리<br />Manifest V3 서비스 워커</p>
          <span className={styles.detail}>페이지 DOM 직접 접근 불가</span>
        </div>
        <MessageLink />
        <div className={styles.pageSide}>
          <div className={styles.card}>
            <span className={styles.scope}>웹페이지 안</span>
            <div className={styles.title}><span className={styles.icon}><FileCode2 size={16} /></span>Content Script</div>
            <p>페이지 내용을 읽고<br />스타일 변경</p>
          </div>
          <div className={styles.domLink} aria-hidden="true"><ArrowDown size={22} strokeWidth={1.5} /><span>DOM 접근</span></div>
          <div className={styles.page}><Globe size={16} aria-hidden="true" />쇼핑 페이지 DOM</div>
        </div>
      </div>
    </Frame>
  );
}

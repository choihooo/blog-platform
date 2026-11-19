'use client';

import { useId, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, MousePointer2, RotateCcw } from 'lucide-react';
import { Frame } from '@/app/blog/typescript-compiler-performance/visuals/Frame';
import { initialStep, moveStep, steps, viewForStep } from './model';
import styles from './demo.module.css';

const rows = [
  { id: 'row-a', label: '이름', value: '김예시' },
  { id: 'row-b', label: '소개', value: '웹 인터페이스를 만드는 개발자입니다.' },
  { id: 'row-c', label: '연락처', value: 'demo@example.com' },
];
const selector = '[data-ui="row-b"] .edit-button';
const request = '소개 영역의 수정 버튼을 주황 배경과 흰 글자로 바꿔주세요. 다른 버튼은 그대로 유지해 주세요.';

export function UiEditingDemo() {
  const [step, setStep] = useState(initialStep);
  const id = useId();
  const state = viewForStep(step);
  const last = step === steps.length - 1;

  return <Frame title="화면에서 수정 요청을 등록하고 검수하기" note="다음과 이전 버튼으로 진행하며 현재 확인할 부분만 강조하는 설명용 데모입니다. 실제 AI 호출과 서버 저장은 하지 않습니다.">
    <div className={styles.toolbar}>
      <span>단계별 예시 · AI 호출 없음</span>
      <button className={styles.textButton} type="button" onClick={() => setStep(initialStep)}><RotateCcw size={13} aria-hidden="true" /> 처음으로</button>
    </div>

    <div className={styles.workspace}>
      <div className={styles.scene}>
        <div className={styles.sceneBackground} data-muted={step >= 2}>
          <div className={styles.previewHeader} data-muted={step < 2}><span>프로필 설정</span><span>가상 화면</span></div>
          {rows.map(row => <div className={styles.row} key={row.id} data-ui={row.id}>
            <div className={styles.field} data-muted={step < 2}><span>{row.label}</span><span>{row.value}</span></div>
            <span className={styles.editButton} data-focus={state.focus === 'target' && row.id === 'row-b'} data-muted={step < 2 && !(state.focus === 'target' && row.id === 'row-b')} data-painted={state.painted && row.id === 'row-b'}>수정</span>
          </div>)}
          <div className={styles.toolPanel} data-focus={state.focus === 'tool'} data-muted={step === 1}>
            <span><MousePointer2 size={13} aria-hidden="true" /> 개발 도구</span><span className={styles.toolAction}>요소 선택</span>
          </div>
        </div>

        {step >= 2 && <div className={styles.overlay}>
          <div className={styles.modal} role="group" aria-label="수정 요청과 구현 예시">
            <div className={styles.modalHeader} data-muted="true"><h4>{step === 2 ? '수정 요청 작성' : step === 3 ? '저장된 수정 요청' : '요청과 구현 이력'}</h4><span className={styles.label}>예시</span></div>
            {step === 2 && <>
              <div className={styles.context} data-muted="true"><span className={styles.label}>선택한 요소 · 소개 버튼</span><code>{selector}</code></div>
              <div className={styles.focusArea} data-focus="true"><span className={styles.label}>수정 요청</span><p className={styles.request}>{request}</p></div>
            </>}
            {step === 3 && <div className={styles.focusArea} data-focus="true"><div className={styles.cardTop}><span><FileText size={14} aria-hidden="true" /> 소개 수정 요청</span><span className={styles.label}>저장됨</span></div><p>{request}</p><code>{selector}</code><span className={styles.label}>구현 전 · 색상 변경 없음</span></div>}
            {step === 4 && <>
              <div className={styles.cardTop} data-muted="true"><span>1차 구현 · 예시</span><span className={styles.label}>검수 대기</span></div>
              <div className={styles.focusArea} data-focus="true"><div className={styles.comparison}><div><span className={styles.label}>변경 전</span><span className={styles.editButton}>수정</span></div><div><span className={styles.label}>변경 후</span><span className={styles.editButton} data-painted="true">수정</span></div></div></div>
              <p className={styles.label} data-muted="true">예시 파일 · ProfileSettings.tsx</p>
            </>}
            {step === 5 && <>
              <p className={styles.label} data-muted="true">소개 버튼 색상 변경 · 1차 구현</p>
              <div className={styles.focusArea} data-focus="true"><div className={styles.completed}><Check size={16} aria-hidden="true" /> 승인 · 요청 완료</div><p>요청과 구현 이력을 보관합니다.</p></div>
            </>}
          </div>
        </div>}
      </div>

      <section className={styles.guide} aria-labelledby={`${id}-title`} aria-live="polite" aria-atomic="true">
        <span className={styles.stepNumber}>{step + 1} / {steps.length}</span>
        <h3 id={`${id}-title`}>{steps[step].title}</h3>
        <p>{steps[step].description}</p>
        {step === 1 && <code>{selector}</code>}
        <span className={styles.focusHint}>주황 테두리 안을 확인해 주세요.</span>
      </section>
    </div>

    <div className={styles.navigation}>
      <button className={styles.button} type="button" disabled={step === initialStep} onClick={() => setStep(value => moveStep(value, 'previous'))}><ArrowLeft size={14} aria-hidden="true" /> 이전</button>
      <span className={styles.progress} aria-hidden="true">{steps.map((item, index) => <span key={item.title} data-current={index === step} data-done={index < step} />)}</span>
      <button className={styles.primaryButton} type="button" onClick={() => setStep(value => moveStep(value, last ? 'reset' : 'next'))}>{last ? '다시 보기' : '다음'}{!last && <ArrowRight size={14} aria-hidden="true" />}</button>
    </div>
  </Frame>;
}

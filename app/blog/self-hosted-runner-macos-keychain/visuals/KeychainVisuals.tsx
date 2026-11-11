'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatedFlow } from '@/app/blog/typescript-compiler-performance/visuals/AnimatedFlow';
import { Frame } from '@/app/blog/typescript-compiler-performance/visuals/Frame';
import ui from '@/app/blog/typescript-compiler-performance/visuals/visuals.module.css';
import { getSearchListScenario, getSigningNodes, getReleaseNodes, type CleanupMode, type SigningOutcome, type ReleaseTrigger } from './model';

export function SearchListComparison() {
  const [mode, setMode] = useState<CleanupMode>('owned');
  return <Frame title="A가 끝나도 B의 Keychain은 남아야 합니다" note="설명용 예시입니다. 기존 목록은 login이고, 작업 A와 B가 차례로 자기 Keychain을 추가합니다. A가 시작 전에 저장한 목록 전체를 복원하면 B가 사라집니다. 현재 목록에서 A만 제거하면 login과 B는 남습니다. 실제 장애나 실행 시간을 측정한 결과가 아닙니다.">
    <div className={ui.controls} role="group" aria-label="Keychain 정리 방식">
      <button type="button" className={ui.button} aria-pressed={mode === 'snapshot'} onClick={() => setMode('snapshot')}>이전 목록 전체 복원</button>
      <button type="button" className={ui.button} aria-pressed={mode === 'owned'} onClick={() => setMode('owned')}>이번 실행의 항목만 제거</button>
    </div>
    <AnimatedFlow nodes={getSearchListScenario(mode).nodes} label="검색 목록 비교" />
  </Frame>;
}

export function SigningLifecycle() {
  const [outcome, setOutcome] = useState<SigningOutcome>('success');
  return <Frame title="서명 결과와 관계없이 정리 절차로 이어집니다" note="설명용 예시입니다. 기존 설정을 기록하고 임시 Keychain을 만든 뒤 인증서를 가져와 서명합니다. 서명 성공과 실패 모두 정리 절차로 이어집니다. 정리 단계의 실행 완료는 실제 자원 삭제와 설정 복구의 성공 검증을 뜻하지 않습니다.">
    <div className={ui.controls} role="group" aria-label="서명 결과 선택">
      <button type="button" className={ui.button} aria-pressed={outcome === 'success'} onClick={() => setOutcome('success')}>서명 성공</button>
      <button type="button" className={ui.button} aria-pressed={outcome === 'failure'} onClick={() => setOutcome('failure')}>서명 실패</button>
    </div>
    <AnimatedFlow nodes={getSigningNodes(outcome)} label="서명 자원 생명주기" />
  </Frame>;
}

export function ReleaseRoutes() {
  const [trigger, setTrigger] = useState<ReleaseTrigger>('tag');
  const [dryRun, setDryRun] = useState(false);
  const [publishLatest, setPublishLatest] = useState(false);
  return <Frame title="태그와 실행 옵션으로 배포 경로를 구분합니다" note="현재 workflow 조건을 설명하는 예시입니다. PR과 develop·main push는 CI만 실행합니다. 태그 push는 빌드·업로드·업데이터 게시로 이어집니다. 수동 실행은 태그 조건과 dry_run 및 publish_updater_latest 선택에 따라 달라집니다. 활성화된 후속 단계는 앞선 작업이 성공한 경우를 가정합니다. 비활성 단계는 회색 점선입니다. 실제 workflow 실행이나 승인 절차를 재현하는 것은 아닙니다.">
    <div className={ui.controls}>
      <label className={ui.selectLabel}>
        실행 조건
        <span className={ui.selectWrap}>
          <select className={ui.select} value={trigger} onChange={event => { setTrigger(event.target.value as ReleaseTrigger); setDryRun(false); setPublishLatest(false); }}>
            <option value="ci">PR·브랜치 push</option>
            <option value="tag">tauri-v* 태그 push</option>
            <option value="manual-tag">수동 실행 · 태그</option>
            <option value="manual-branch">수동 실행 · 브랜치</option>
          </select>
          <ChevronDown size={14} className={ui.selectChevron} aria-hidden="true" />
        </span>
      </label>
      {trigger === 'manual-tag' && <>
        <label className={ui.checkLabel}><input type="checkbox" checked={dryRun} onChange={event => setDryRun(event.target.checked)} />dry_run</label>
        <label className={ui.checkLabel}><input type="checkbox" checked={publishLatest} onChange={event => setPublishLatest(event.target.checked)} />publish_updater_latest</label>
      </>}
    </div>
    <AnimatedFlow key={`${trigger}-${dryRun}-${publishLatest}`} nodes={getReleaseNodes(trigger, { dryRun, publishLatest })} label="검증과 배포 경로" />
  </Frame>;
}

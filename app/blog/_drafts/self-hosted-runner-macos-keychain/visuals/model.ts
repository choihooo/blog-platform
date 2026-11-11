import type { FlowNode } from '@/app/blog/typescript-compiler-performance/visuals/flow-model';

export type CleanupMode = 'snapshot' | 'owned';
export type SigningOutcome = 'success' | 'failure';
export type ReleaseTrigger = 'ci' | 'tag' | 'manual-tag' | 'manual-branch';

export function getSearchListScenario(mode: CleanupMode) {
  const original = ['login'];
  const withA = [...original, 'A'];
  const withB = [...withA, 'B'];
  const remaining = mode === 'snapshot' ? [...original] : withB.filter(keychain => keychain !== 'A');
  const lists = [original, withA, withB, remaining];
  const titles = ['기존 목록', 'A 시작', 'B 시작', 'A 정리'];
  const nodes: FlowNode[] = lists.map((list, index) => ({
    id: `list-${index}`, title: titles[index], column: index, row: 0,
    after: index > 0 ? [`list-${index - 1}`] : [],
    detail: list.join(' · ') + (index === 3 ? mode === 'snapshot' ? '\nB 항목 누락' : '\nB 항목 보존' : ''),
    pending: '목록 반영 전', icon: 'scope',
    error: index === 3 && mode === 'snapshot',
  }));
  return { lists, nodes };
}

export function getSigningNodes(outcome: SigningOutcome): FlowNode[] {
  return [
    { id: 'prepare', title: '서명 환경 준비', column: 0, row: 0, icon: 'file', detail: '기존 설정 기록\n임시 Keychain 생성', pending: '준비 전' },
    { id: 'certificate', title: '인증서 가져오기', column: 1, row: 0, after: ['prepare'], icon: 'check', detail: '이번 실행의\nKeychain 사용', pending: '가져오기 전' },
    { id: 'build', title: '서명·패키징', column: 2, row: 0, after: ['certificate'], icon: 'code', error: outcome === 'failure', detail: outcome === 'failure' ? '서명에서 중단' : '배포 파일 생성', pending: '빌드 전' },
    { id: 'cleanup', title: '정리 시도', column: 3, row: 0, after: ['build'], icon: 'output', detail: '공유 설정 복구 시도\n임시 자원 삭제 시도', pending: '종료 절차 대기' },
  ];
}

export function getReleaseNodes(trigger: ReleaseTrigger, options: { dryRun?: boolean; publishLatest?: boolean } = {}): FlowNode[] {
  const ci = trigger === 'ci';
  const manual = trigger === 'manual-tag' || trigger === 'manual-branch';
  const tag = trigger === 'tag' || trigger === 'manual-tag';
  const release = tag && !(manual && options.dryRun);
  const latest = release && (!manual || Boolean(options.publishLatest));
  const title = { ci: 'PR·브랜치 push', tag: 'tauri-v* 태그 push', 'manual-tag': '태그에서 수동 실행', 'manual-branch': '브랜치에서 수동 실행' }[trigger];
  const triggerNode: FlowNode = { id: 'trigger', title, column: 0, row: 0, icon: 'file', detail: ci ? 'develop · main' : tag ? '릴리즈 태그' : '태그 조건 불충족', pending: '실행 전' };
  if (ci) return [
    triggerNode,
    { id: 'ci', title: 'CI 검증', column: 1, row: 0, after: ['trigger'], icon: 'scan', detail: '코드 검증\n배포 없음', pending: '검증 전' },
  ];
  return [
    triggerNode,
    { id: 'prepare', title: '릴리즈 준비', column: 1, row: 0, after: ['trigger'], icon: 'scope', detail: '빌드 대상 결정', pending: '준비 전' },
    { id: 'build', title: '빌드·서명', column: 2, row: 0, after: ['prepare'], enabled: release, icon: 'code', detail: 'release 환경\n서명·패키징', pending: '실행 전' },
    { id: 'upload', title: 'R2 업로드', column: 3, row: 0, after: ['build'], enabled: release, icon: 'output', detail: '배포 파일 업로드', pending: '업로드 전' },
    { id: 'latest', title: '업데이터 게시', column: 4, row: 0, after: ['upload'], enabled: latest, icon: 'link', detail: 'latest.json 게시', pending: '게시 전' },
  ];
}

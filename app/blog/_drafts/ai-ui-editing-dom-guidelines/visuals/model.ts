export const steps = [
  { focus: 'tool', title: '요소 선택 모드 켜기', description: '개발 도구에서 요소 선택을 시작합니다. 화면을 보면서 수정할 버튼을 고를 수 있습니다.' },
  { focus: 'target', title: '소개 버튼 선택하기', description: '소개 옆의 버튼을 고릅니다. 이 요소의 DOM을 함께 확인해, 같은 모양의 다른 버튼과 구분합니다.' },
  { focus: 'request', title: '변경할 내용 적기', description: '선택한 버튼을 어떻게 바꿀지 적습니다. 여기서는 배경과 글자 색상만 바꾸고 다른 버튼은 유지합니다.' },
  { focus: 'document', title: '대상과 요청 함께 저장하기', description: '선택한 요소와 요청을 한 건으로 저장합니다. 아직 구현 전이므로 화면의 색상은 그대로입니다.' },
  { focus: 'comparison', title: '변경 전후 확인하기', description: '별도의 구현 단계가 끝나면 결과를 검수합니다. 색상뿐 아니라 다른 버튼과 상태도 그대로인지 확인해야 합니다.' },
  { focus: 'approval', title: '검수한 결과 승인하기', description: '구현을 승인하면 요청이 완료됩니다. 수정이 더 필요하면 반려 사유를 남겨 다시 구현할 수 있습니다.' },
] as const;

export const initialStep = 0;
export function moveStep(step: number, action: 'next' | 'previous' | 'reset') {
  if (action === 'reset') return initialStep;
  return Math.max(initialStep, Math.min(steps.length - 1, step + (action === 'next' ? 1 : -1)));
}

export function viewForStep(step: number) {
  return { focus: steps[step].focus, selected: step >= 1, saved: step >= 3, painted: step >= 4, approved: step >= 5 };
}

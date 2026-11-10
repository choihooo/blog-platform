'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Frame } from './Frame';
import { AnimatedFlow } from './AnimatedFlow';
import type { FlowNode } from './flow-model';
import { compareShape, shouldEmit } from './model';
import styles from './visuals.module.css';

const simulation = '개념을 설명하는 시뮬레이션입니다. 이동·실행 시간은 실제 컴파일 시간과 다릅니다.';
const pipeline: FlowNode[] = [
  { id: 'program', title: 'Program 생성', detail: '파일·의존성 구성', column: 0, row: 0, icon: 'file' },
  { id: 'parse', title: '파싱', detail: '소스 → AST', column: 1, row: 0, after: ['program'], icon: 'scan' },
  { id: 'bind', title: '바인딩', detail: '선언 → Symbol', column: 2, row: 0, after: ['parse'], icon: 'link' },
  { id: 'check', title: '타입 검사', detail: '추론·호환성 검사', column: 3, row: 0, after: ['bind'], duration: 1100, icon: 'check' },
  { id: 'emit', title: 'Emit', detail: 'JavaScript 출력', pending: '출력 대기', column: 4, row: 0, after: ['check'], icon: 'output' },
];

export function CompilerPipelineDemo() {
  return <Frame title="소스가 JavaScript가 되기까지" note={simulation}><AnimatedFlow label="컴파일 과정" nodes={pipeline} /></Frame>;
}

const dependencyNodes: FlowNode[] = [
  { id: 'entry', title: '진입 파일', detail: 'GameContainer.tsx\nGenerateGameContainer.tsx\nStartMenu.tsx', column: 0, row: 0, icon: 'file' },
  { id: 'config', title: 'ConfigMenu', detail: 'index.tsx', column: 1, row: 0, after: ['entry'], icon: 'scan' },
  { id: 'index', title: 'MenuStack', detail: 'index.ts', column: 2, row: 0, after: ['config'], icon: 'link' },
  { id: 'stack', title: 'MenuStack.tsx', detail: '하위 import 탐색', column: 3, row: 0, after: ['index'], icon: 'scan' },
  { id: 'atoms', title: 'atoms.ts', detail: '컴파일 대상 포함', pending: '탐색 대기', column: 4, row: 0, after: ['stack'], icon: 'file' },
  { id: 'button', title: 'Button.tsx', detail: '컴파일 대상 포함', pending: '탐색 대기', column: 4, row: 1, after: ['stack'], icon: 'file' },
];
export function DependencyDemo() {
  return <Frame title="import를 따라 넓어지는 컴파일 대상" note={simulation}><AnimatedFlow label="의존성 탐색" nodes={dependencyNodes} /></Frame>;
}

export function ScopeDemo() {
  const [scope, setScope] = useState<'global' | 'function'>('function');
  const inner = scope === 'function';
  const nodes: FlowNode[] = [
    { id: 'reference', title: 'value 참조', detail: inner ? 'printValue 함수 안' : '함수 밖', column: 0, row: 0, icon: 'code' },
    { id: 'local', title: '함수 스코프', detail: 'value = "inside"', pending: '지역 선언 찾기', column: 1, row: 0, after: ['reference'], enabled: inner, icon: 'scope' },
    { id: 'global', title: '전역 스코프', detail: 'value = 1', pending: '전역 선언 찾기', column: 1, row: 1, after: ['reference'], enabled: !inner, icon: 'scope' },
    { id: 'type', title: '선언과 연결', detail: inner ? 'string 타입' : 'number 타입', pending: '심볼 연결 대기', column: 2, row: 0, after: [inner ? 'local' : 'global'], icon: 'link' },
  ];
  return <Frame title="같은 이름, 서로 다른 심볼" note={simulation}>
    <div className={styles.controls} role="group" aria-label="value를 참조할 위치">
      <button type="button" className={styles.button} aria-pressed={scope === 'global'} onClick={() => setScope('global')}>전역에서 참조</button>
      <button type="button" className={styles.button} aria-pressed={scope === 'function'} onClick={() => setScope('function')}>함수 안에서 참조</button>
    </div>
    <AnimatedFlow label="심볼 연결" nodes={nodes} />
    <p className={styles.status} aria-live="polite">{inner ? '함수 안의 value → 지역 선언 → string 타입' : '함수 밖의 value → 전역 선언 → number 타입'}</p>
  </Frame>;
}

export function CompatibilityDemo() {
  const [age, setAge] = useState('number');
  const source: Record<string, string> = age === 'missing' ? { name: 'string' } : { name: 'string', age };
  const errors = compareShape(source, { name: 'string', age: 'number' });
  const valid = errors.length === 0;
  const nodes: FlowNode[] = [
    { id: 'source', title: 'User', detail: `name: string\nage: ${age === 'missing' ? '없음' : age}`, column: 0, row: 0, icon: 'code' },
    { id: 'compare', title: 'Person과 비교', detail: 'name: string\nage: number', column: 1, row: 0, after: ['source'], icon: 'check' },
    { id: 'ok', title: '대입 가능', detail: '필수 속성 일치', pending: '검사 결과 대기', column: 2, row: 0, after: ['compare'], enabled: valid, icon: 'check' },
    { id: 'error', title: '대입 불가', detail: age === 'missing' ? 'age 속성 누락' : 'age 타입 불일치', pending: '검사 결과 대기', column: 2, row: 1, after: ['compare'], enabled: !valid, icon: 'error', error: true },
  ];
  return <Frame title="구조가 맞으면 대입할 수 있습니다" note="필수 속성과 기본 타입만 비교하는 설명용 데모입니다. TypeScript의 전체 호환성 규칙을 구현한 것은 아닙니다.">
    <label className={styles.selectLabel}>User의 age 속성
      <span className={styles.selectWrap}><select className={styles.select} value={age} onChange={event => setAge(event.target.value)}>
        <option value="number">number</option><option value="string">string</option><option value="missing">속성 없음</option>
      </select><ChevronDown className={styles.selectChevron} size={14} strokeWidth={1.5} aria-hidden="true" /></span>
    </label>
    <AnimatedFlow label="타입 호환성 검사" nodes={nodes} />
    <p className={styles.status} aria-live="polite">{errors.length ? <><X size={16} /> {errors[0]}</> : <><Check size={16} /> name과 age의 타입이 모두 맞아 대입할 수 있습니다.</>}</p>
  </Frame>;
}

export function TypeCheckDemo() {
  const [inputType, setInputType] = useState('string');
  const hasError = inputType === 'string';
  const nodes: FlowNode[] = [
    { id: 'infer', title: '타입 추론', detail: hasError ? '"42" → string' : '42 → number', column: 0, row: 0, icon: 'scan' },
    { id: 'check', title: '호환성 검사', detail: `${inputType} → number`, column: 1, row: 0, after: ['infer'], icon: 'check' },
    { id: 'ok', title: '타입 일치', detail: '오류 없음', pending: '결과 대기', column: 2, row: 0, after: ['check'], enabled: !hasError, icon: 'check' },
    { id: 'error', title: '타입 오류', detail: '진단 메시지 생성', pending: '결과 대기', column: 2, row: 1, after: ['check'], enabled: hasError, icon: 'error', error: true },
  ];
  return <Frame title="타입 추론에서 진단까지" note={simulation}>
    <label className={styles.selectLabel}>number 변수에 대입할 값
      <span className={styles.selectWrap}><select className={styles.select} value={inputType} onChange={event => setInputType(event.target.value)}><option value="string">&quot;42&quot; · string</option><option value="number">42 · number</option></select><ChevronDown className={styles.selectChevron} size={14} strokeWidth={1.5} aria-hidden="true" /></span>
    </label>
    <AnimatedFlow label="타입 추론과 진단" nodes={nodes} />
    <p className={styles.status} aria-live="polite">{hasError ? 'string은 number에 대입할 수 없어 타입 오류가 발생합니다.' : 'number끼리 호환되므로 타입 오류가 없습니다.'}</p>
  </Frame>;
}

export function EmitOutputsDemo() {
  const [declaration, setDeclaration] = useState(true);
  const [sourceMap, setSourceMap] = useState(true);
  const nodes: FlowNode[] = [
    { id: 'ts', title: 'app.ts', detail: 'export const msg:\nstring = "hello";', column: 0, row: 0, icon: 'file' },
    { id: 'transform', title: '변환·출력', detail: '타입 주석 제거', column: 1, row: 0, after: ['ts'], icon: 'output' },
    { id: 'js', title: 'app.js', detail: 'export const msg\n= "hello";', pending: '출력 대기', column: 2, row: 0, after: ['transform'], icon: 'code' },
    { id: 'dts', title: 'app.d.ts', detail: 'export declare const\nmsg: string;', pending: '출력 대기', column: 2, row: 1, after: ['transform'], enabled: declaration, icon: 'file' },
    { id: 'map', title: 'app.js.map', detail: 'sources: ["app.ts"]', pending: '출력 대기', column: 2, row: 2, after: ['transform'], enabled: sourceMap, icon: 'link' },
  ];
  return <Frame title="한 소스에서 만들어지는 출력물" note="고정된 예제의 출력 형태를 보여줍니다. 선언 파일·소스맵의 내용은 설명을 위해 간략히 표시했습니다.">
    <div className={styles.controls}>
      <label className={styles.checkLabel}><input type="checkbox" checked={declaration} onChange={event => setDeclaration(event.target.checked)} /> declaration</label>
      <label className={styles.checkLabel}><input type="checkbox" checked={sourceMap} onChange={event => setSourceMap(event.target.checked)} /> sourceMap</label>
    </div>
    <AnimatedFlow label="출력물 생성" nodes={nodes} />
    <p className={styles.status} aria-live="polite">JavaScript{declaration ? ' + 선언 파일' : ''}{sourceMap ? ' + 소스맵' : ''}을 출력합니다.</p>
  </Frame>;
}

export function EmitPolicyDemo() {
  const [hasError, setHasError] = useState(true);
  const [block, setBlock] = useState(false);
  const emit = shouldEmit(hasError, block);
  const nodes: FlowNode[] = [
    { id: 'check', title: '타입 검사', detail: hasError ? '오류 발견' : '오류 없음', column: 0, row: 0, icon: 'check', error: hasError },
    { id: 'policy', title: '출력 정책', detail: `noEmitOnError:\n${block}`, column: 1, row: 0, after: ['check'], icon: 'scope' },
    { id: 'js', title: 'JavaScript 출력', detail: hasError ? '진단 보고·출력 계속' : '오류 없이 출력', pending: '정책 확인 대기', column: 2, row: 0, after: ['policy'], enabled: emit, icon: 'output' },
    { id: 'stop', title: '출력 중단', detail: '오류 + 중단 옵션', pending: '정책 확인 대기', column: 2, row: 1, after: ['policy'], enabled: !emit, icon: 'error', error: true },
  ];
  return <Frame title="타입 오류가 있으면 출력을 멈출까요?" note="일반 tsc 실행을 단순화한 데모입니다. tsc -b의 빌드 모드 동작과는 구분합니다.">
    <div className={styles.controls}>
      <label className={styles.checkLabel}><input type="checkbox" checked={hasError} onChange={event => setHasError(event.target.checked)} /> 타입 오류 있음</label>
      <label className={styles.checkLabel}><input type="checkbox" checked={block} onChange={event => setBlock(event.target.checked)} /> noEmitOnError</label>
    </div>
    <AnimatedFlow label="오류와 출력 정책" nodes={nodes} />
    <p className={styles.status} aria-live="polite">{emit ? <Check size={16} /> : <X size={16} />}{emit ? 'JavaScript 출력' : '출력 중단'}</p>
  </Frame>;
}

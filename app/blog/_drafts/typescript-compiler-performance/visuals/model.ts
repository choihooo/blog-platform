export type Timing = { label: string; before: number; after: number };

export const buildTimings: Timing[] = [
  { label: '클린 빌드', before: 2.54, after: 2.37 },
  { label: '증분 빌드', before: 1.28, after: 1.10 },
];
export const phaseTimings: Record<'total' | 'package', Timing[]> = {
  total: [
    { label: '전체 Check', before: 0.53, after: 0.47 },
    { label: '전체 Emit', before: 0.83, after: 0.42 },
  ],
  package: [
    { label: 'ui Emit/print', before: 0.36, after: 0.12 },
    { label: 'app Check', before: 0.32, after: 0.21 },
  ],
};
export function reduction(before: number, after: number) {
  return (((before - after) / before) * 100).toFixed(1);
}

// This deliberately models only required primitive properties, not the TypeScript checker.
export function compareShape(source: Record<string, string>, target: Record<string, string>) {
  return Object.entries(target).flatMap(([name, type]) => {
    if (!Object.hasOwn(source, name)) return [`${name} 속성이 없습니다.`];
    if (source[name] !== type) return [`${name}: ${source[name]} → ${type}에 대입할 수 없습니다.`];
    return [];
  });
}

// Ordinary tsc only; build mode has separate behavior.
export function shouldEmit(hasError: boolean, noEmitOnError: boolean) {
  return !(hasError && noEmitOnError);
}

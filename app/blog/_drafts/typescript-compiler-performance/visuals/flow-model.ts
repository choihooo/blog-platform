export type FlowNode = {
  id: string; title: string; column: number; row: number; duration?: number;
  after?: string[]; enabled?: boolean; error?: boolean;
  detail?: string; pending?: string;
  icon?: 'file' | 'scan' | 'link' | 'check' | 'output' | 'error' | 'code' | 'scope';
};
export type TimedStep = { id: string; start: number; end: number };
export type TimedEdge = { from: string; to: string; start: number; end: number };
export type Curve = { x1: number; y1: number; x2: number; y2: number };

export function makeTimeline(nodes: FlowNode[], travel = 440) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  if (byId.size !== nodes.length) throw new Error('duplicate flow node');
  const visiting = new Set<string>();
  const resolved = new Map<string, TimedStep>();
  const resolve = (id: string): TimedStep => {
    if (resolved.has(id)) return resolved.get(id)!;
    const node = byId.get(id);
    if (!node) throw new Error(`missing flow node: ${id}`);
    if (visiting.has(id)) throw new Error(`cycle at flow node: ${id}`);
    visiting.add(id);
    const parents = (node.after ?? []).map(parent => {
      if (byId.get(parent)?.enabled === false) throw new Error(`inactive dependency: ${parent}`);
      return resolve(parent);
    });
    const start = parents.length ? Math.max(...parents.map(parent => parent.end + travel)) : 0;
    const step = { id, start, end: start + (node.duration ?? 650) };
    visiting.delete(id);
    resolved.set(id, step);
    return step;
  };
  const steps = nodes.filter(node => node.enabled !== false).map(node => resolve(node.id));
  const edges: TimedEdge[] = nodes.filter(node => node.enabled !== false).flatMap(node => (node.after ?? []).map(from => ({
    from, to: node.id, start: resolved.get(from)!.end, end: resolved.get(from)!.end + travel,
  })));
  return { steps, edges, duration: Math.max(0, ...steps.map(step => step.end)) };
}
export function flowState(step: { start: number; end: number }, clock: number): 'idle' | 'running' | 'done' {
  return clock < step.start ? 'idle' : clock < step.end ? 'running' : 'done';
}
export function curvePoint(curve: Curve, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const u = 1 - t;
  const middle = (curve.x1 + curve.x2) / 2;
  return {
    x: u ** 3 * curve.x1 + 3 * u * u * t * middle + 3 * u * t * t * middle + t ** 3 * curve.x2,
    y: u ** 3 * curve.y1 + 3 * u * u * t * curve.y1 + 3 * u * t * t * curve.y2 + t ** 3 * curve.y2,
  };
}

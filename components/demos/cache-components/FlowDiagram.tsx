// Lucian UX/UI Prompt #201 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#201
"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// 단계가 왼쪽에서 오른쪽으로 하나씩 켜지고, 연결선을 따라 빛나는 점이 다음 단계로 흘러가는 흐름도.
// 화면에 보이면 자동으로 반복 재생한다.
// lanes로 줄(브라우저, 서버 등)을 나누고, 각 단계의 lane에 줄 번호를 넣는다.
// 줄 이름 앞에 아이콘을 붙이려면 { label: "서버", icon: "server" }로 넘긴다.
// 배열로 묶은 단계는 같은 칸에서 동시에 진행되고, 같은 lane이면 위아래로 쌓인다.
// 기본으로는 바로 앞 칸과 이어지고, id와 after로 어느 단계 다음인지 직접 정할 수도 있다.
// span으로 카드를 여러 칸에 걸치게 하고, slots로 카드 안에 나중에 채워질 자리를 둘 수 있다.
//
// <FlowDiagram
//   title="클라이언트 fetch"
//   lanes={["브라우저", "서버"]}
//   steps={[
//     { title: "HTML 요청", lane: 0, ms: 250, icon: "page" },
//     { title: "HTML 응답", lane: 1, ms: 400, icon: "server" },
//   ]}
// />

export type FlowStep = {
  title: string;
  /** 놓일 줄 (lanes의 인덱스, 기본 0) */
  lane?: number;
  /** 이 단계가 도는 시간 (완료 후 "0.5초"처럼 표시) */
  ms: number;
  icon?: FlowIconName;
  /** 아이콘 배경색 */
  color?: string;
  /** after에서 가리킬 이름 */
  id?: string;
  /** 이 단계들이 끝나야 시작 (없으면 바로 앞 칸과 이어짐) */
  after?: string[];
  /** 작은 배지 (예: "왕복 1"). 서버처럼 아래 줄 단계에 넣으면 위 줄과의 경계선 위에 붙는다 */
  tag?: string;
  /** 차지할 칸 수 (기본 1) */
  span?: number;
  /** 카드 안에 미리 잡아 둔 자리. 연결선이 이 자리로 들어와 내용을 채운다 */
  slots?: FlowSlot[];
};

export type FlowSlot = {
  /** 처음부터 들어 있는 문구 (fallback) */
  fallback: string;
  /** 채워진 뒤 문구 */
  result: string;
  ms: number;
  id?: string;
  after?: string[];
};

// slots도 단계처럼 돌리기 위해 같은 칸에 펼쳐 둔다 (slotOf = 부모 카드의 칸 안 순서)
type FlowNode = FlowStep & { slotOf?: number; fallback?: string; result?: string };

type Status = "idle" | "run" | "done";

// 연결선 하나를 지나가는 시간: 같은 줄 / 줄을 넘나드는 곡선
const FLOW_MS = { straight: 520, curved: 640 };
// 한 바퀴 끝나고 다시 시작하기 전 쉬는 시간
const REST_MS = 2200;
const COLORS = ["#F59E0B", "#8B5CF6", "#10B981", "#0EA5E9", "#F43F5E", "#6366F1", "#14B8A6"];

const ICONS = {
  page: (
    <>
      <rect x="3" y="2" width="8" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5h4M5 7.5h4M5 10h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  sparkle: (
    <>
      <path d="M7 1.5l1.3 3.2 3.2 1.3-3.2 1.3L7 10.5 5.7 7.3 2.5 6l3.2-1.3z" fill="currentColor" />
      <circle cx="11" cy="11" r="1.4" fill="currentColor" />
    </>
  ),
  bell: (
    <>
      <path d="M3.5 9.5V6.5a3.5 3.5 0 0 1 7 0v3l1 1.5h-9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.8 12.5h2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  user: (
    <>
      <circle cx="7" cy="5" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 12.5c.6-2.4 2.3-3.6 4.5-3.6s3.9 1.2 4.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  download: (
    <path d="M7 2v6.5M4.2 5.8 7 8.6l2.8-2.8M2.5 10.5v1.5h9v-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  bolt: <path d="M8 1.5 3 8h3.5L6 12.5 11 6H7.5z" fill="currentColor" />,
  swap: (
    <path d="M2.5 5h8M8.5 2.8 10.7 5 8.5 7.2M11.5 9h-8M5.5 6.8 3.3 9l2.2 2.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  monitor: (
    <>
      <rect x="1.8" y="2.5" width="10.4" height="7" rx="1.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 12h4M7 9.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  cart: (
    <>
      <path d="M1.5 2.5h1.7l1.3 6.5h6.2l1.3-4.8H4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.3" cy="11.3" r="1" fill="currentColor" />
      <circle cx="10" cy="11.3" r="1" fill="currentColor" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="2" width="10" height="4" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="8" width="10" height="4" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.6" cy="4" r=".8" fill="currentColor" />
      <circle cx="4.6" cy="10" r=".8" fill="currentColor" />
    </>
  ),
  database: (
    <>
      <ellipse cx="7" cy="3.5" rx="4.5" ry="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 3.5v7c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8v-7M2.5 7c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
};

export type FlowIconName = keyof typeof ICONS;

type FlowLane = string | { label: string; icon?: FlowIconName };

export function FlowDiagram({
  title,
  subtitle,
  lanes = [""],
  steps,
}: {
  title: string;
  subtitle?: string;
  lanes?: FlowLane[];
  steps: (FlowStep | FlowStep[])[];
}) {
  const cols = useMemo(
    () =>
      steps.map((s) => {
        const col: FlowNode[] = Array.isArray(s) ? [...s] : [s];
        col.slice().forEach((parent, i) =>
          parent.slots?.forEach((slot) =>
            col.push({ ...slot, title: slot.fallback, lane: parent.lane, slotOf: i }),
          ),
        );
        return col;
      }),
    [steps],
  );
  const numCols = Math.max(...cols.map((col, c) => Math.max(...col.map((s) => c + (s.span ?? 1)))));
  const stepOf = (key: string) => {
    const [c, i] = key.split("-").map(Number);
    return cols[c][i];
  };

  // 단계 사이 연결선. after가 있으면 그 단계들과 잇고, 없으면 바로 앞 칸과 잇는다
  // (한쪽이 한 칸이면 모두 잇고, 개수가 같으면 같은 순서끼리).
  const edges = useMemo(() => {
    const keyOf = new Map<string, string>();
    cols.forEach((col, c) => col.forEach((s, i) => s.id && keyOf.set(s.id, `${c}-${i}`)));
    const out: { from: string; to: string; curved: boolean; toSlot: boolean }[] = [];
    const link = (from: string, to: string) =>
      out.push({
        from,
        to,
        curved: (stepOf(from).lane ?? 0) !== (stepOf(to).lane ?? 0),
        toSlot: stepOf(to).slotOf !== undefined,
      });
    cols.forEach((col, c) =>
      col.forEach((z, j) => {
        const to = `${c}-${j}`;
        if (z.after) {
          z.after.forEach((id) => {
            const from = keyOf.get(id);
            if (from) link(from, to);
          });
          return;
        }
        const prev = cols[c - 1];
        prev?.forEach((_, i) => {
          if (prev.length === col.length && i !== j) return;
          link(`${c - 1}-${i}`, to);
        });
      }),
    );
    return out;
    // stepOf는 cols에서 파생되므로 cols만 의존한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols]);

  // 한 바퀴 전체 시간 (가장 늦게 끝나는 단계 기준)
  const total = useMemo(() => {
    const end = new Map<string, number>();
    cols.forEach((col, c) =>
      col.forEach((s, i) => {
        const key = `${c}-${i}`;
        const start = Math.max(
          0,
          ...edges
            .filter((e) => e.to === key)
            .map((e) => (end.get(e.from) ?? 0) + (e.curved ? FLOW_MS.curved : FLOW_MS.straight)),
        );
        end.set(key, start + s.ms);
      }),
    );
    return Math.max(...end.values());
  }, [cols, edges]);

  const [status, setStatus] = useState<Record<string, Status>>({});
  const [lit, setLit] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, HTMLElement>());
  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const dotEls = useRef<(SVGCircleElement | null)[]>([]);
  // 다시 시작하거나 화면 밖으로 나가면 gen을 올려 이전 바퀴의 타이머·애니메이션을 버린다
  const live = useRef({ gen: 0, timers: [] as number[] });

  // 카드 위치를 재서 연결선을 그린다 (본문 폭이 바뀌면 다시 그림)
  useLayoutEffect(() => {
    const measure = () => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) return;
      edges.forEach((e, i) => {
        const a = nodeEls.current.get(e.from)?.getBoundingClientRect();
        const z = nodeEls.current.get(e.to)?.getBoundingClientRect();
        const p = pathEls.current[i];
        if (!a || !z || !p) return;
        const x1 = a.right - box.left;
        const y1 = a.top + a.height / 2 - box.top;
        if (e.toSlot) {
          const up = a.top > z.top;
          const x2 = z.left + z.width / 2 - box.left;
          const y2 = (up ? z.bottom : z.top) - box.top;
          const ax = a.left + a.width / 2 - box.left;
          // 자리 바로 아래(위)에 있으면 곧게 올라가고, 아니면 옆으로 가다가 꺾어 들어간다
          if (Math.abs(ax - x2) < a.width / 2) {
            const ay = (up ? a.top : a.bottom) - box.top;
            const ym = (ay + y2) / 2;
            p.setAttribute("d", `M${ax} ${ay} C${ax} ${ym} ${x2} ${ym} ${x2} ${y2}`);
          } else {
            p.setAttribute("d", `M${x1} ${y1} C${x2} ${y1} ${x2} ${y1} ${x2} ${y2}`);
          }
          return;
        }
        const x2 = z.left - box.left;
        const y2 = z.top + z.height / 2 - box.top;
        const xm = (x1 + x2) / 2;
        p.setAttribute(
          "d",
          Math.abs(y1 - y2) < 0.5 ? `M${x1} ${y1} H${x2}` : `M${x1} ${y1} C${xm} ${y1} ${xm} ${y2} ${x2} ${y2}`,
        );
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [edges]);

  // 화면에 보이는 동안 반복 재생
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const l = live.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keys = cols.flatMap((col, c) => col.map((_, i) => `${c}-${i}`));

    const stop = () => {
      l.gen++;
      l.timers.forEach(clearTimeout);
      l.timers = [];
      dotEls.current.forEach((d) => d?.style.setProperty("opacity", "0"));
    };

    // 모션 줄이기: 움직이지 않고 끝난 상태만 보여준다
    const showFinal = () => {
      setStatus(Object.fromEntries(keys.map((k) => [k, "done"])));
      setLit(Object.fromEntries(edges.map((_, i) => [i, true])));
      setFinished(true);
    };

    const cycle = () => {
      stop();
      const g = l.gen;
      setStatus({});
      setLit({});
      setFinished(false);

      const later = (ms: number, fn: () => void) => {
        l.timers.push(window.setTimeout(() => g === l.gen && fn(), ms));
      };

      // 선을 따라 빛나는 점을 옮긴다
      const flow = (i: number, done: () => void) => {
        setLit((s) => ({ ...s, [i]: true }));
        const p = pathEls.current[i];
        const d = dotEls.current[i];
        if (!p || !d) return done();
        const L = p.getTotalLength();
        const ms = edges[i].curved ? FLOW_MS.curved : FLOW_MS.straight;
        const s = performance.now();
        d.style.opacity = "1";
        const f = (now: number) => {
          if (g !== l.gen) return;
          const q = Math.min(1, (now - s) / ms);
          const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
          const pt = p.getPointAtLength(L * e);
          d.setAttribute("cx", String(pt.x));
          d.setAttribute("cy", String(pt.y));
          if (q < 1) requestAnimationFrame(f);
          else {
            d.style.opacity = "0";
            done();
          }
        };
        requestAnimationFrame(f);
      };

      // 들어오는 선이 모두 도착해야 다음 단계가 시작된다
      const waiting = new Map<string, number>();
      edges.forEach((e) => waiting.set(e.to, (waiting.get(e.to) ?? 0) + 1));
      let left = keys.length;

      const step = (key: string) => {
        setStatus((s) => ({ ...s, [key]: "run" }));
        later(stepOf(key).ms, () => {
          setStatus((s) => ({ ...s, [key]: "done" }));
          if (--left === 0) {
            setFinished(true);
            later(REST_MS, cycle);
            return;
          }
          edges.forEach((e, i) => {
            if (e.from !== key) return;
            flow(i, () => {
              const n = (waiting.get(e.to) ?? 1) - 1;
              waiting.set(e.to, n);
              if (n === 0) step(e.to);
            });
          });
        });
      };

      keys.filter((k) => !waiting.has(k)).forEach(step);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (reduced) {
        if (entry.isIntersecting) showFinal();
        return;
      }
      if (entry.isIntersecting) cycle();
      else stop();
    });
    io.observe(card);
    return () => {
      io.disconnect();
      stop();
    };
    // stepOf는 cols에서 파생되므로 cols만 의존한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, edges]);

  const flatIndex = (c: number, i: number) => cols.slice(0, c).flat().length + i;


  return (
    <div
      ref={cardRef}
      className="not-prose my-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_30px_60px_-36px_rgba(40,30,80,.3)] [--hole:#6A57F2] dark:border-neutral-800 dark:bg-[#111111] dark:shadow-[0_30px_60px_-36px_rgba(0,0,0,.72)] dark:[--hole:#B7A4FF]"
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 sm:px-5">
        <div className="mr-auto min-w-0">
          <b className="block truncate text-sm font-black tracking-tight">{title}</b>
          {subtitle && (
            <small className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 dark:text-neutral-500">
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
              {subtitle}
            </small>
          )}
        </div>
        {/* 한 바퀴가 끝나면 걸린 시간을 보여준다 */}
        <span
          className={`shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold whitespace-nowrap text-white transition-[opacity,transform] duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] motion-reduce:transition-none ${
            finished ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          완료, {(total / 1000).toFixed(1)}초
        </span>
      </div>

      <div className="overflow-x-auto">
        <div ref={wrapRef} className="relative" style={{ minWidth: numCols * 84 + 32 }}>
          {lanes.map((l, lane) => {
            const { label, icon } = typeof l === "string" ? { label: l, icon: undefined } : l;
            return (
              <div
                key={lane}
                role="list"
                aria-label={label || undefined}
                className={`relative grid gap-x-[18px] gap-y-7 px-4 pt-12 pb-7 sm:px-5 ${
                  lane > 0
                    ? "border-t-2 border-neutral-300 bg-neutral-100/80 dark:border-neutral-700 dark:bg-white/[.045]"
                    : ""
                }`}
                style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
              >
                {label && (
                  <span className="absolute top-3 left-4 inline-flex items-center gap-1 rounded-md bg-neutral-900/[.06] px-1.5 py-0.5 text-[11px] font-bold text-neutral-700 sm:left-5 dark:bg-white/10 dark:text-neutral-200">
                    {icon && (
                      <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3">
                        {ICONS[icon]}
                      </svg>
                    )}
                    {label}
                  </span>
                )}
                {cols.map((col, c) =>
                  col.map((s, i) => {
                    const key = `${c}-${i}`;
                    if ((s.lane ?? 0) !== lane || s.slotOf !== undefined) return null;
                    const color = s.color ?? COLORS[flatIndex(c, i) % COLORS.length];
                    const st = status[key] ?? "idle";
                    return (
                      <Fragment key={key}>
                        {s.tag && lane > 0 && (
                          <span
                            style={{ gridColumn: `${c + 1} / span 1` }}
                            className="absolute top-0 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-white dark:bg-neutral-100 dark:text-neutral-900"
                          >
                            {s.tag}
                          </span>
                        )}
                        <div
                          role="listitem"
                          ref={(el) => {
                            if (el) nodeEls.current.set(key, el);
                            else nodeEls.current.delete(key);
                          }}
                          style={{
                            gridColumn: `${c + 1} / span ${s.span ?? 1}`,
                            // 같은 칸·같은 줄에 여럿이면 위아래로 쌓는다
                            gridRow:
                              col.slice(0, i).filter((o) => (o.lane ?? 0) === lane && o.slotOf === undefined).length + 1,
                          }}
                          className={`relative z-[2] mx-auto flex w-full rounded-xl bg-white transition-[box-shadow,transform] ${
                            s.slots
                              ? "items-center gap-3 px-2.5 py-2.5"
                              : "max-w-[92px] flex-col items-center gap-1.5 px-1.5 pt-2.5 pb-2 text-center"
                          } duration-300 motion-reduce:transition-none dark:bg-neutral-900 ${
                            ringClass(st)
                          }`}
                        >
                          <span
                            className={`flex shrink-0 flex-col items-center gap-1.5 text-center ${
                              s.slots ? "w-[64px]" : "contents"
                            }`}
                          >
                            <span
                              className="grid size-[26px] shrink-0 place-items-center rounded-lg text-white"
                              style={{ background: color }}
                            >
                              {/* 도는 동안에는 아이콘 자리에 스피너 */}
                              {st === "run" ? (
                                <span
                                  aria-hidden="true"
                                  className="size-3.5 animate-[spin_.7s_linear_infinite] rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
                                />
                              ) : (
                                <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5">
                                  {ICONS[s.icon ?? "page"]}
                                </svg>
                              )}
                            </span>
                            <b className="text-[11px] leading-tight font-extrabold break-keep">{s.title}</b>
                          </span>
                          {s.slots && (
                            <span className="flex min-w-0 flex-1 gap-2">
                              {col.map((o, k) =>
                                o.slotOf === i ? (
                                  <Slot
                                    key={k}
                                    status={status[`${c}-${k}`] ?? "idle"}
                                    fallback={o.fallback ?? ""}
                                    result={o.result ?? ""}
                                    elRef={(el) => {
                                      if (el) nodeEls.current.set(`${c}-${k}`, el);
                                      else nodeEls.current.delete(`${c}-${k}`);
                                    }}
                                  />
                                ) : null,
                              )}
                            </span>
                          )}
                          {s.tag && lane === 0 && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-1.5 py-px text-[9.5px] font-bold whitespace-nowrap text-white dark:bg-neutral-100 dark:text-neutral-900">
                              {s.tag}
                            </span>
                          )}
                          {st === "done" && <DoneMark />}
                          <em
                            className={`absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-emerald-600 not-italic tabular-nums transition-opacity duration-300 dark:text-emerald-400 ${
                              st === "done" ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {(s.ms / 1000).toFixed(1)}초
                          </em>
                        </div>
                      </Fragment>
                    );
                  }),
                )}
              </div>
            );
          })}

          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] size-full overflow-visible">
            {edges.map((_, i) => (
              <path
                key={i}
                ref={(el) => {
                  pathEls.current[i] = el;
                }}
                fill="none"
                strokeWidth={2}
                className={`transition-[stroke] duration-300 ${
                  lit[i]
                    ? "stroke-[#6A57F2]/60 dark:stroke-[#B7A4FF]/60"
                    : "stroke-black/10 dark:stroke-white/10"
                }`}
              />
            ))}
            {edges.map((_, i) => (
              <circle
                key={i}
                ref={(el) => {
                  dotEls.current[i] = el;
                }}
                r={4}
                className="fill-[#6A57F2] opacity-0 drop-shadow-[0_0_4px_#6A57F2] dark:fill-[#B7A4FF] dark:drop-shadow-[0_0_4px_#B7A4FF]"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

// 카드 테두리: 진행 중이면 보라색, 끝나면 초록색
function ringClass(st: Status) {
  return st === "run"
    ? "-translate-y-px shadow-[0_0_0_1.5px_#6A57F2,0_10px_24px_-10px_rgba(106,87,242,.6)] dark:shadow-[0_0_0_1.5px_#B7A4FF,0_10px_24px_-10px_rgba(183,164,255,.6)]"
    : st === "done"
      ? "shadow-[0_0_0_1px_rgba(16,185,129,.55),0_8px_18px_-12px_rgba(40,30,80,.3)] dark:shadow-[0_0_0_1px_rgba(16,185,129,.55),0_8px_18px_-12px_rgba(0,0,0,.72)]"
      : "shadow-[0_0_0_1px_rgba(22,21,27,.09),0_8px_18px_-12px_rgba(40,30,80,.3)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_8px_18px_-12px_rgba(0,0,0,.72)]";
}

const HATCH =
  "repeating-linear-gradient(135deg, color-mix(in srgb, var(--hole) 10%, transparent) 0 5px, transparent 5px 10px)";

// 카드 안에 미리 잡아 둔 자리: 비어 있을 때는 빗금 + 점선, 채워지면 실제 내용으로 바뀐다
function Slot({
  status,
  fallback,
  result,
  elRef,
}: {
  status: Status;
  fallback: string;
  result: string;
  elRef: (el: HTMLElement | null) => void;
}) {
  const done = status === "done";
  return (
    <span
      ref={elRef}
      className={`inline-grid min-w-0 flex-1 justify-items-center rounded-lg border-[1.5px] px-2 py-1.5 text-[10.5px] font-semibold transition-[border-color,background-color,box-shadow] duration-300 motion-reduce:transition-none ${
        done
          ? "border-solid border-[color-mix(in_srgb,var(--hole)_45%,transparent)] bg-[color-mix(in_srgb,var(--hole)_8%,transparent)]"
          : status === "run"
            ? "border-solid border-(--hole) shadow-[0_0_12px_-2px_var(--hole)]"
            : "border-dashed border-(--hole)"
      }`}
      style={done ? undefined : { backgroundImage: HATCH }}
    >
      <span
        className={`col-start-1 row-start-1 truncate text-neutral-600 transition-opacity duration-300 dark:text-neutral-300 ${
          done ? "opacity-0" : "opacity-100"
        }`}
      >
        {fallback}
      </span>
      <span
        className={`col-start-1 row-start-1 truncate font-extrabold transition-opacity duration-300 ${
          done ? "opacity-100" : "opacity-0"
        }`}
      >
        {result}
      </span>
    </span>
  );
}

function DoneMark() {
  return (
    <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-emerald-500">
      <svg viewBox="0 0 14 14" className="size-4">
        <path d="M4.3 7.2 6.2 9l3.5-3.8" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

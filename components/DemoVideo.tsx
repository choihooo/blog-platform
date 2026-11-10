// 영상을 본문 폭에 맞춰 보여주는 컴포넌트 (자동 재생·반복·무음)
// src에 배열을 넘기면 여러 영상을 나란히 보여준다
export function DemoVideo({ src }: { src: string | string[] }) {
  const sources = Array.isArray(src) ? src : [src];

  return (
    <div className="not-prose my-8 flex flex-wrap items-start justify-center gap-6">
      {sources.map((s) => (
        <video
          key={s}
          src={s}
          autoPlay
          muted
          loop
          playsInline
          className="w-full min-w-0 flex-1 rounded-xl"
        />
      ))}
    </div>
  );
}

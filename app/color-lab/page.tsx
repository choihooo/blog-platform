import { ProfileIntro } from "@/components/ProfileIntro";

const colors = [
  { name: "당근 주황", hex: "#FF6F0F" },
  { name: "토스 파랑", hex: "#0064FF" },
];

export const metadata = { title: "자기소개 색상 비교" };

export default function ColorLab() {
  return (
    <div className="relative left-1/2 w-[calc(100vw-48px)] max-w-[1120px] -translate-x-1/2">
      <h1 className="mb-4 text-2xl">자기소개 색상 비교</h1>
      <p className="mb-14 text-sm text-neutral-500 dark:text-neutral-400">
        이름·호감·호흡·호기심의 ‘호’ 네 글자만 다르게 적용했습니다.
      </p>
      <div className="grid gap-x-24 gap-y-8 md:grid-cols-2">
        {colors.map(({ name, hex }) => (
          <section key={hex} aria-label={`${name} ${hex}`}>
            <h2 className="mb-8 border-b border-neutral-200 pb-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              {name} <span className="ml-2">{hex}</span>
            </h2>
            <ProfileIntro accent={hex} preview />
          </section>
        ))}
      </div>
    </div>
  );
}

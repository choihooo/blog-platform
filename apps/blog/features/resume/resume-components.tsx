import { Chip, ChipGroup } from "@hozui/react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export type Achievement = {
  title: string;
  period?: string;
  context: string;
  details: readonly string[];
  technologies: readonly string[];
  result?: string;
  thumbnail?: { alt: string; src: string };
};

export function SectionHeading({ children }: { children: string }) {
  return (
    <header className="mb-7 border-b border-border pb-4 sm:mb-9">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{children}</h2>
    </header>
  );
}

export function TechChips({ items }: { items: readonly string[] }) {
  return (
    <ChipGroup className="flex flex-wrap gap-1.5" aria-label="사용 기술">
      {items.map((item) => (
        <Chip key={item} label={item} size="sm" tone="accent" />
      ))}
    </ChipGroup>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <article className="border-b border-border py-7 first:pt-0 last:border-b-0 last:pb-0 print:break-inside-avoid-page">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h4 className="text-base font-semibold leading-6">{achievement.title}</h4>
          <TechChips items={achievement.technologies} />
        </div>
        {achievement.period ? (
          <time className="shrink-0 text-xs leading-5 text-muted-foreground">
            {achievement.period}
          </time>
        ) : null}
      </div>
      <div
        className={
          achievement.thumbnail ? "mt-5 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]" : "mt-2"
        }
      >
        {achievement.thumbnail ? (
          <Image
            alt={achievement.thumbnail.alt}
            className="aspect-video w-full rounded-lg border border-border object-cover"
            height={720}
            src={achievement.thumbnail.src}
            width={1280}
          />
        ) : null}
        <div>
          <p className="text-sm leading-6 text-muted-foreground">{achievement.context}</p>
          <ul className="mt-3 space-y-1.5 pl-4 text-sm leading-6 text-muted-foreground">
            {achievement.details.map((detail) => (
              <li key={detail} className="list-disc pl-1 marker:text-primary">
                {detail}
              </li>
            ))}
          </ul>
          {achievement.result ? (
            <p className="mt-4 text-sm font-semibold leading-6 text-primary">
              <ArrowRight aria-hidden="true" className="mr-1 inline" size={14} />
              {achievement.result}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CompactList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map(([title, description]) => {
        const [metadata, ...details] = description.split("\n");

        return (
          <div key={title} className="py-6 first:pt-0 last:pb-0">
            <h4 className="text-base font-semibold leading-7 text-foreground">{title}</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{metadata}</p>
            {details.length > 0 ? (
              <ul className="mt-3 space-y-1.5 break-keep pl-4 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                {details.map((detail) => (
                  <li key={detail} className="list-disc pl-1 marker:text-primary">
                    {detail}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

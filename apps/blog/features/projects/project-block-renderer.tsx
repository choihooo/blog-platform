import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { AutoplayVideo } from "./autoplay-video";
import type { ProjectContentBlock } from "@blog-platform/core/content/catalog";

const widthClasses = {
  compact: "max-w-2xl",
  full: "max-w-none",
  portrait: "max-w-sm",
  reading: "max-w-3xl",
  wide: "max-w-4xl",
} as const;

function blockWidth(block: ProjectContentBlock) {
  if (block.type === "divider") return "max-w-4xl";
  return widthClasses[
    block.layout ?? (block.type === "image" || block.type === "video" ? "wide" : "reading")
  ];
}

function Paragraphs({ body }: { body: string | readonly string[] }) {
  const paragraphs = typeof body === "string" ? [body] : body;

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph) => (
        <p
          className="whitespace-pre-line text-base leading-7 text-muted-foreground"
          key={paragraph}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function BlockHeading({ id, title }: { id?: string; title?: string }) {
  if (!title) return null;

  return (
    <h3 className="scroll-mt-24 text-sm font-semibold text-primary" id={id}>
      {title}
    </h3>
  );
}

export function ProjectBlockRenderer({
  anchorId,
  block,
  priority = false,
}: {
  anchorId?: string;
  block: ProjectContentBlock;
  priority?: boolean;
}) {
  const widthClass = blockWidth(block);

  switch (block.type) {
    case "text":
      return (
        <div className={widthClass}>
          <BlockHeading id={anchorId} title={block.title} />
          <div className={block.title ? "mt-2" : undefined}>
            <Paragraphs body={block.body} />
          </div>
        </div>
      );

    case "image":
      return (
        <figure className={widthClass} id={anchorId}>
          <Image
            alt={block.alt}
            className="h-auto w-full rounded-lg border border-border object-cover"
            height={block.height ?? 720}
            priority={priority}
            src={block.src}
            width={block.width ?? 1280}
          />
          {block.caption ? (
            <figcaption className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "video":
      return (
        <figure className={widthClass} id={anchorId}>
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <AutoplayVideo
              ariaLabel={block.ariaLabel}
              className="h-auto w-full"
              height={block.height ?? 720}
              mp4Src={block.mp4Src}
              poster={block.poster}
              webmSrc={block.webmSrc}
              width={block.width ?? 1280}
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "video-comparison":
      return (
        <figure className={widthClass} id={anchorId}>
          <div className="project-video-comparison grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-2">
            <div className="relative overflow-hidden rounded-lg border border-border bg-black">
              <span className="absolute left-3 top-3 z-10 rounded bg-background/90 px-2 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                {block.beforeLabel}
              </span>
              <AutoplayVideo
                ariaLabel={`${block.ariaLabel} - ${block.beforeLabel}`}
                className="h-auto w-full"
                height={block.height ?? 1028}
                mp4Src={block.beforeMp4Src}
                poster={block.beforePoster}
                webmSrc={block.beforeWebmSrc}
                width={block.width ?? 430}
              />
            </div>
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center text-primary"
            >
              <ArrowRight className="size-10" strokeWidth={3.5} />
            </span>
            <div className="relative overflow-hidden rounded-lg border border-primary/40 bg-black">
              <span className="absolute left-3 top-3 z-10 rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                {block.afterLabel}
              </span>
              <AutoplayVideo
                ariaLabel={`${block.ariaLabel} - ${block.afterLabel}`}
                className="h-auto w-full"
                height={block.height ?? 1028}
                mp4Src={block.afterMp4Src}
                poster={block.afterPoster}
                webmSrc={block.afterWebmSrc}
                width={block.width ?? 430}
              />
            </div>
          </div>
          {block.caption ? (
            <figcaption className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "bullets":
      return (
        <div className={widthClass}>
          <BlockHeading id={anchorId} title={block.title} />
          <ul
            className={`${block.title ? "mt-3" : ""} space-y-2 pl-5 text-base leading-7 text-muted-foreground`}
          >
            {block.items.map((item) => (
              <li className="list-disc whitespace-pre-line pl-1 marker:text-primary" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "metrics":
      return (
        <div className={`${widthClass} border-y border-border py-8`} id={anchorId}>
          <BlockHeading title={block.title} />
          <div className={`${block.title ? "mt-6" : ""} grid gap-8 sm:grid-cols-2`}>
            {block.items.map((metric) => (
              <div key={metric.label}>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">
                  {metric.value}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm font-medium">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "result":
      return (
        <div className={widthClass}>
          <BlockHeading id={anchorId} title={block.title ?? "Result"} />
          <p className="mt-2 whitespace-pre-line text-base font-semibold leading-7">{block.body}</p>
        </div>
      );

    case "quote":
      return (
        <figure className={`${widthClass} border-y border-border py-8`} id={anchorId}>
          <BlockHeading title={block.title} />
          <blockquote
            className={`${block.title ? "mt-4" : ""} whitespace-pre-line text-xl leading-8 tracking-tight`}
          >
            {block.body}
          </blockquote>
          {block.attribution ? (
            <figcaption className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
              {block.attribution}
            </figcaption>
          ) : null}
        </figure>
      );

    case "code":
      return (
        <figure className={widthClass} id={anchorId}>
          <BlockHeading title={block.title} />
          <pre
            className={`${block.title ? "mt-3" : ""} overflow-x-auto rounded-lg border border-border bg-muted p-5 text-sm leading-6`}
          >
            <code data-language={block.language}>{block.code}</code>
          </pre>
          {block.caption ? (
            <figcaption className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "divider":
      return <hr className={`${widthClass} border-border`} />;

    case "columns":
      return (
        <div className={widthClass} id={anchorId}>
          <BlockHeading title={block.title} />
          <div className={`${block.title ? "mt-4" : ""} grid gap-8 sm:grid-cols-2`}>
            {block.items.map((item, index) => (
              <div key={item.title ?? index}>
                {item.title ? <h4 className="mb-2 text-sm font-semibold">{item.title}</h4> : null}
                <Paragraphs body={item.body} />
              </div>
            ))}
          </div>
        </div>
      );
  }
}

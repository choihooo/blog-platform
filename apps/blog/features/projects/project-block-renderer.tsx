import Image from "next/image";

import type { ProjectContentBlock } from "./project-types";

const widthClasses = {
  full: "max-w-none",
  reading: "max-w-3xl",
  wide: "max-w-4xl",
} as const;

function blockWidth(block: ProjectContentBlock) {
  if (block.type === "divider") return "max-w-4xl";
  return widthClasses[block.layout ?? (block.type === "image" ? "wide" : "reading")];
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
        <div className={`${widthClass} border-l-2 border-primary pl-4`}>
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

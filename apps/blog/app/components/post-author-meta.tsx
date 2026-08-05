"use client";

import { Avatar, AvatarFallback, AvatarImage, type AvatarSize } from "@hozui/react";

export type PostAuthorMetaValue = {
  name: string;
  avatar?: string;
};

type PostAuthorMetaProps = {
  author?: PostAuthorMetaValue;
  className?: string;
  size?: Extract<AvatarSize, "xs" | "sm" | "md">;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return [...first][0]?.toUpperCase() ?? "?";
  const last = parts.at(-1) ?? "";
  return `${[...first][0] ?? ""}${[...last][0] ?? ""}`.toUpperCase();
}

export function PostAuthorMeta({ author, className, size = "sm" }: PostAuthorMetaProps) {
  if (!author?.name) return null;

  return (
    <span className={["inline-flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <Avatar decorative size={size}>
        {author.avatar ? <AvatarImage src={author.avatar} /> : null}
        <AvatarFallback>{initialsFromName(author.name)}</AvatarFallback>
      </Avatar>
      <span>{author.name}</span>
    </span>
  );
}

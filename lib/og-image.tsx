import type { PostMeta } from "./post-metadata";
import { ogTheme } from "./og-theme.mjs";

/** Shared quarterly composition; article content comes directly from MDX metadata. */
export function PostOgImage({ post, hostname }: { post: PostMeta; hostname: string }) {
  const titleSize = post.title.length > 80 ? 50 : post.title.length > 50 ? 62 : 72;
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", overflow: "hidden", background: ogTheme.background, color: ogTheme.foreground, fontFamily: "SUIT", fontWeight: 700 }}>
      <div style={{ display: "flex", position: "absolute", left: 72, top: 64, width: 1056, height: 440, flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "block", fontSize: titleSize, lineHeight: 1.25, letterSpacing: "-0.03em", lineClamp: 3, wordBreak: "keep-all" }}>{post.title}</div>
        <div style={{ display: "block", marginTop: 32, fontSize: 28, lineHeight: 1.5, color: ogTheme.secondary, lineClamp: 2, wordBreak: "keep-all" }}>{post.description}</div>
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 52, left: 72, width: 1056, alignItems: "center", justifyContent: "space-between", fontSize: 18, color: ogTheme.secondary }}>
        <span>{hostname}</span>
        <span>{ogTheme.label}</span>
      </div>
    </div>
  );
}

from __future__ import annotations

import html
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = ROOT / "apps/blog/public"
TOKEN_DIR = ROOT / "apps/blog/node_modules/@hozui/tokens/dist"
REACT_CSS = ROOT / "apps/blog/node_modules/@hozui/react/dist/index.css"


def esc(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def file_uri(path: Path) -> str:
    return path.resolve().as_uri()


def asset_uri(src: str | None) -> str | None:
    if not src:
        return None
    path = PUBLIC_DIR / src.lstrip("/")
    if not path.exists():
        return None
    return file_uri(path)


def text_items(blocks: list[dict[str, Any]], block_id: str) -> list[str]:
    for block in blocks:
        if block.get("id") == block_id and block.get("type") == "text":
            body = block.get("body", "")
            if isinstance(body, list):
                return [str(item).strip() for item in body if str(item).strip()]
            if str(body).strip():
                return [str(body).strip()]
    return []


def result_text(blocks: list[dict[str, Any]]) -> str:
    for block in blocks:
        if block.get("type") == "result":
            return str(block.get("body", "")).strip()
    return ""


def representative_media(blocks: list[dict[str, Any]]) -> tuple[str | None, str]:
    for block in blocks:
        if block.get("type") == "image":
            return asset_uri(block.get("src")), str(block.get("caption", "")).strip()
        if block.get("type") == "video":
            return asset_uri(block.get("poster")), str(block.get("caption", "")).strip()
        if block.get("type") == "video-comparison":
            return asset_uri(block.get("afterPoster")), str(block.get("caption", "")).strip()
    return None, ""


def chips(items: list[str]) -> str:
    return '<div class="chip-group">' + "".join(f'<span class="chip">{esc(item)}</span>' for item in items) + "</div>"


def metrics(items: list[dict[str, Any]]) -> str:
    if not items:
        return ""
    cells = []
    for item in items:
        cells.append(
            "<div class=\"metric\">"
            f"<strong>{esc(item.get('value', ''))}</strong>"
            f"<span>{esc(item.get('label', ''))}</span>"
            f"<small>{esc(item.get('detail', ''))}</small>"
            "</div>"
        )
    return '<div class="metrics">' + "".join(cells) + "</div>"


def section_html(section: dict[str, Any]) -> str:
    blocks = list(section.get("blocks", []))
    problem = text_items(blocks, "problem")
    details = text_items(blocks, "solution") or text_items(blocks, "approach")
    result = result_text(blocks)
    media, caption = representative_media(blocks)

    parts = [
        '<article class="achievement">',
        '<header class="achievement-header">',
        f'<h4>{esc(section.get("title", ""))}</h4>',
        f'<time>{esc(section.get("eyebrow", ""))}</time>',
        "</header>",
    ]
    for paragraph in problem[:1]:
        parts.append(f'<p class="context">{esc(paragraph)}</p>')
    if details:
        parts.append("<ul>")
        for detail in details:
            parts.append(f"<li>{esc(detail)}</li>")
        parts.append("</ul>")
    if result:
        parts.append(f'<p class="result">-&gt; {esc(result)}</p>')
    if media:
        parts.append('<figure class="evidence">')
        parts.append(f'<img alt="{esc(caption or section.get("title", ""))}" src="{media}" />')
        if caption:
            parts.append(f"<figcaption>{esc(caption)}</figcaption>")
        parts.append("</figure>")
    parts.append("</article>")
    return "\n".join(parts)


def project_html(project: dict[str, Any]) -> str:
    sections = project.get("sections") or []
    stories = project.get("stories") or []
    achievement_html = []
    if sections:
        achievement_html = [section_html(section) for section in sections]
    else:
        for story in stories:
            achievement_html.append(
                "<article class=\"achievement\">"
                "<header class=\"achievement-header\">"
                f"<h4>{esc(story.get('title', ''))}</h4>"
                f"<time>{esc(story.get('eyebrow', ''))}</time>"
                "</header>"
                f"<p class=\"context\">{esc(story.get('problem', ''))}</p>"
                f"<ul><li>{esc(story.get('approach', ''))}</li></ul>"
                f"<p class=\"result\">-&gt; {esc(story.get('result', ''))}</p>"
                "</article>"
            )

    meta = " / ".join(
        item
        for item in [
            str(project.get("organization", "")).strip(),
            str(project.get("role", "")).strip(),
            str(project.get("team", "")).strip(),
        ]
        if item
    )
    info_sections = []
    technologies = list(project.get("technologies", []))
    if technologies:
        info_sections.append(f'<section><h4>기술 스택</h4>{chips(technologies)}</section>')
    info_class = "project-info project-info-single" if len(info_sections) == 1 else "project-info"
    return (
        '<article class="project-detail">'
        '<header class="project-header">'
        "<div>"
        f'<p class="eyebrow">PROJECT {esc(project.get("index", ""))}</p>'
        f"<h3>{esc(project.get('name', ''))}</h3>"
        f'<p class="project-meta">{esc(meta)}</p>'
        "</div>"
        f'<time>{esc(project.get("period", ""))}</time>'
        "</header>"
        f'<p class="project-description">{esc(project.get("description", ""))}</p>'
        f'<div class="{info_class}">'
        + "".join(info_sections)
        + "</div>"
        + "\n".join(achievement_html)
        + "</article>"
    )


def index_table(projects: list[dict[str, Any]]) -> str:
    rows = []
    for project in projects:
        rows.append(
            "<tr>"
            f"<td>{esc(project.get('index', ''))}. {esc(project.get('name', ''))}</td>"
            f"<td>{esc(project.get('role', ''))}<br /><span>{esc(project.get('period', ''))}</span></td>"
            f"<td>{esc(project.get('description', ''))}</td>"
            "</tr>"
        )
    return (
        '<table class="project-table">'
        "<thead><tr><th>Project</th><th>Role / Period</th><th>Summary</th></tr></thead>"
        "<tbody>"
        + "".join(rows)
        + "</tbody></table>"
    )


def build(data_path: Path, output_path: Path) -> None:
    with data_path.open("r", encoding="utf8") as file:
        projects = json.load(file)

    font_css = (TOKEN_DIR / "css/font.css").read_text("utf8")
    tokens_css = (TOKEN_DIR / "css/tokens.css").read_text("utf8")
    react_css = REACT_CSS.read_text("utf8") if REACT_CSS.exists() else ""
    font_css = font_css.replace("../fonts/SUIT-Variable.woff2", file_uri(TOKEN_DIR / "fonts/SUIT-Variable.woff2"))

    profile = asset_uri("/resume/profile.png")
    core_skills = [
        "Next.js",
        "React",
        "TypeScript",
        "TanStack Query",
        "Zustand",
        "React Native",
        "Electron",
        "Tauri",
        "Expo",
        "Jest",
        "Vitest",
        "Storybook",
        "Monorepo",
        "GitHub Actions",
        "Docker",
        "Figma",
    ]

    html_doc = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>Choi Ho Project Portfolio</title>
<style>
{font_css}
{tokens_css}
{react_css}
:root {{
  --background: var(--hods-sys-color-bg-canvas);
  --foreground: var(--hods-sys-color-fg-default);
  --primary: var(--hods-sys-color-action-primary-bg-default);
  --muted-foreground: var(--hods-sys-color-fg-muted);
  --border: var(--hods-sys-color-stroke-default);
  --accent: var(--hods-sys-color-bg-accent-muted);
  --accent-foreground: var(--hods-sys-color-fg-accent);
}}
* {{ box-sizing: border-box; }}
html {{ background: white; }}
body {{
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--hods-sys-typography-font-family-body), system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.65;
}}
@page {{ size: A4; margin: 13mm 15mm 15mm; }}
.page {{
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 0;
}}
.resume-hero {{
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
  border-bottom: 1px solid var(--border);
  padding: 20px 0 34px;
}}
.profile {{
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
}}
.profile img {{
  width: 116px;
  height: 116px;
  border-radius: 999px;
  object-fit: cover;
}}
.contact {{
  display: grid;
  gap: 3px;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.55;
}}
.contact a {{
  color: var(--muted-foreground);
  text-decoration: none;
}}
.role {{
  margin: 0;
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
}}
h1 {{
  margin: 8px 0 18px;
  font-size: 44px;
  line-height: 1.08;
  font-weight: 600;
  letter-spacing: -0.02em;
}}
.intro {{
  max-width: 760px;
  color: var(--muted-foreground);
  font-size: 16px;
  line-height: 1.75;
}}
.intro p {{ margin: 0 0 4px; }}
.section {{
  margin-top: 56px;
}}
.section > header {{
  margin-bottom: 26px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 14px;
}}
.section h2 {{
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.02em;
}}
.chip-group {{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}}
.chip {{
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border: 1px solid color-mix(in oklch, var(--primary) 22%, var(--border));
  border-radius: 999px;
  background: var(--accent);
  padding: 2px 10px;
  color: var(--accent-foreground);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}}
.project-table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  line-height: 1.55;
}}
.project-table th {{
  background: var(--hods-sys-color-bg-muted);
  color: var(--muted-foreground);
  font-weight: 600;
  text-align: left;
}}
.project-table th,
.project-table td {{
  border: 1px solid var(--border);
  padding: 8px 10px;
  vertical-align: top;
}}
.project-table span {{
  color: var(--muted-foreground);
}}
.project-detail {{
  break-before: page;
  padding-top: 4px;
}}
.project-detail + .project-detail {{
  margin-top: 0;
}}
.project-header {{
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: baseline;
  border-top: 1px solid var(--border);
  padding-top: 18px;
  margin-bottom: 8px;
}}
.eyebrow {{
  margin: 0 0 4px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
}}
.project-header h3 {{
  margin: 0;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.02em;
}}
.project-header time,
.project-meta,
.project-description {{
  color: var(--muted-foreground);
}}
.project-meta {{
  margin: 2px 0 0;
  font-size: 13px;
  white-space: nowrap;
  overflow-wrap: normal;
}}
.project-description {{
  margin: 10px 0 20px;
  max-width: 820px;
  font-size: 14px;
  line-height: 1.7;
}}
.project-info {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 0 0 18px;
}}
.project-info-single {{
  grid-template-columns: 1fr;
}}
.project-info h4 {{
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}}
.metrics {{
  display: grid;
  gap: 0;
  border-top: 1px solid var(--border);
}}
.metric {{
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 8px;
  border-bottom: 1px solid var(--border);
  padding: 6px 0;
}}
.metric strong {{
  font-size: 14px;
  font-weight: 600;
}}
.metric span,
.metric small {{
  color: var(--muted-foreground);
  font-size: 12px;
}}
.metric small {{
  grid-column: 2;
}}
.achievement {{
  break-inside: avoid;
  border-bottom: 1px solid var(--border);
  padding: 22px 0;
}}
.achievement-header {{
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: baseline;
  margin-bottom: 8px;
}}
.achievement h4 {{
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
}}
.achievement time {{
  color: var(--muted-foreground);
  font-size: 12px;
}}
.context,
.achievement li,
figcaption {{
  color: var(--muted-foreground);
}}
.context {{
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.7;
}}
.achievement ul {{
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--muted-foreground);
}}
.achievement li {{
  margin: 4px 0;
  padding-left: 3px;
}}
.achievement li::marker {{
  color: var(--primary);
}}
.result {{
  margin: 12px 0 0;
  color: var(--primary);
  font-weight: 600;
}}
.evidence {{
  margin: 16px 0 0;
}}
.evidence img {{
  display: block;
  max-width: min(100%, 620px);
  max-height: 300px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  object-fit: contain;
}}
figcaption {{
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.55;
}}
footer {{
  margin-top: 42px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  color: var(--muted-foreground);
  font-size: 12px;
}}
@media print {{
  .resume-hero {{
    grid-template-columns: 128px minmax(0, 1fr);
    gap: 24px;
    padding: 12px 0 24px;
  }}
  .profile img {{
    width: 104px;
    height: 104px;
  }}
  h1 {{
    margin: 6px 0 12px;
    font-size: 38px;
  }}
  .intro {{
    font-size: 14px;
    line-height: 1.65;
  }}
  .section {{ margin-top: 30px; }}
  .section > header {{
    margin-bottom: 14px;
    padding-bottom: 10px;
  }}
  .section h2 {{
    font-size: 24px;
  }}
  .chip {{
    min-height: 22px;
    padding: 1px 9px;
    font-size: 11px;
  }}
  .project-table {{
    font-size: 11.5px;
    line-height: 1.42;
    break-inside: avoid;
  }}
  .project-table th,
  .project-table td {{
    padding: 5px 8px;
  }}
  .project-detail {{ break-before: page; }}
  a {{ color: inherit; text-decoration: none; }}
}}
</style>
</head>
<body>
<main class="page">
  <section class="resume-hero">
    <div class="profile">
      {f'<img alt="최호 프로필 사진" src="{profile}" />' if profile else ''}
      <nav class="contact">
        <span>hochoi8621@gmail.com</span>
        <span>blog.hozorica.com</span>
        <span>github.com/choihooo</span>
        <a href="https://blog.hozorica.com/projects">웹 버전: blog.hozorica.com/projects</a>
      </nav>
    </div>
    <div>
      <p class="role">Frontend Engineer</p>
      <h1>최호</h1>
      <div class="intro">
        <p>문제의 원인을 사용자 흐름과 데이터로 확인하고, 검증 가능한 프론트엔드 구조로 개선하는 개발자 최호입니다.</p>
        <p>프로젝트 경험은 원인 분석, 구현 판단, 검증 지표와 결과를 중심으로 정리했습니다.</p>
      </div>
    </div>
  </section>
  <section class="section">
    <header><h2>Core Skills</h2></header>
    {chips(core_skills)}
  </section>
  <section class="section">
    <header><h2>Project Experience</h2></header>
    {index_table(projects)}
  </section>
  {''.join(project_html(project) for project in projects)}
  <footer>Choi Ho / Frontend Portfolio</footer>
</main>
</body>
</html>
"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html_doc, "utf8")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: generate-portfolio-html.py DATA_JSON OUTPUT_HTML")
    build(Path(sys.argv[1]), Path(sys.argv[2]))


if __name__ == "__main__":
    main()

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = ROOT / "apps/blog/public"
PROFILE_IMAGE = PUBLIC_DIR / "resume/profile.png"
HOZUI_TOKENS_DIR = (
    ROOT / "node_modules/.pnpm/@hozui+tokens@0.1.0/node_modules/@hozui/tokens/dist"
)
HOZUI_SUIT_WOFF2 = HOZUI_TOKENS_DIR / "fonts/SUIT-Variable.woff2"
HOZUI_SUIT_TTFS = {
    400: ROOT / "tmp/pdfs/SUIT-400.ttf",
    600: ROOT / "tmp/pdfs/SUIT-600.ttf",
    700: ROOT / "tmp/pdfs/SUIT-700.ttf",
}
PAGE_WIDTH, PAGE_HEIGHT = A4


def px(value: float) -> float:
    return value * 0.75


HOZUI = {
    "color": {
        "fg_default": "#1f2328",
        "fg_muted": "#59636e",
        "fg_subtle": "#818b98",
        "fg_accent": "#0969da",
        "bg_canvas": "#ffffff",
        "bg_muted": "#f6f8fa",
        "bg_accent_muted": "#ddf4ff",
        "stroke_default": "#d1d9e0",
        "stroke_muted": "#d1d9e0",
        "stroke_emphasis": "#818b98",
        "success_fg": "#1a7f37",
    },
    "space": {
        "2": px(2),
        "4": px(4),
        "6": px(6),
        "8": px(8),
        "12": px(12),
        "16": px(16),
        "20": px(20),
        "24": px(24),
        "32": px(32),
        "40": px(40),
        "48": px(48),
        "64": px(64),
    },
    "radius": {"sm": px(4), "md": px(6), "lg": px(8), "xl": px(12)},
    "type": {
        "display_xl": {"size": px(48), "line": px(60)},
        "display_lg": {"size": px(32), "line": px(40)},
        "heading_lg": {"size": px(24), "line": px(32)},
        "heading_md": {"size": px(20), "line": px(28)},
        "heading_sm": {"size": px(16), "line": px(24)},
        "body_xl": {"size": px(18), "line": px(28)},
        "body_lg": {"size": px(16), "line": px(24)},
        "body_md": {"size": px(14), "line": px(22)},
        "body_sm": {"size": px(12), "line": px(18)},
        "label_md": {"size": px(14), "line": px(18)},
        "label_sm": {"size": px(12), "line": px(16)},
        "caption": {"size": px(12), "line": px(16)},
    },
}


def register_fonts() -> dict[str, str]:
    missing_suit_static_fonts = [path for path in HOZUI_SUIT_TTFS.values() if not path.exists()]
    if missing_suit_static_fonts and HOZUI_SUIT_WOFF2.exists():
        next(iter(HOZUI_SUIT_TTFS.values())).parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [
                "python3",
                "-c",
                (
                    "from fontTools.ttLib import TTFont; "
                    "from fontTools.varLib.instancer import instantiateVariableFont; "
                    f"src={str(HOZUI_SUIT_WOFF2)!r}; "
                    f"outs={{{', '.join(f'{weight}: {str(path)!r}' for weight, path in HOZUI_SUIT_TTFS.items())}}}; "
                    "\nfor weight, out in outs.items():\n"
                    "    font=TTFont(src)\n"
                    "    static=instantiateVariableFont(font, {'wght': weight}, inplace=False)\n"
                    "    static.flavor=None\n"
                    "    static.save(out)\n"
                ),
            ],
            check=True,
        )

    if all(path.exists() for path in HOZUI_SUIT_TTFS.values()):
        names = {
            "regular": "HozuiSUITRegular",
            "semibold": "HozuiSUITSemibold",
            "bold": "HozuiSUITBold",
        }
        pdfmetrics.registerFont(TTFont(names["regular"], str(HOZUI_SUIT_TTFS[400])))
        pdfmetrics.registerFont(TTFont(names["semibold"], str(HOZUI_SUIT_TTFS[600])))
        pdfmetrics.registerFont(TTFont(names["bold"], str(HOZUI_SUIT_TTFS[700])))
        return names

    body = "AppleGothicPortfolio"
    pdfmetrics.registerFont(TTFont(body, "/System/Library/Fonts/Supplemental/AppleGothic.ttf"))
    return {"regular": body, "semibold": body, "bold": body}


FONTS = register_fonts()
BODY_FONT = FONTS["regular"]
LABEL_FONT = FONTS["semibold"]
HEADING_FONT = FONTS["bold"]


def sanitize(text: Any) -> str:
    if text is None:
        return ""
    value = str(text)
    value = value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    value = value.replace("\u2212", "-").replace("\u00d7", "x").replace("\u00b7", " / ")
    return value


def plain(text: Any) -> str:
    if text is None:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def resolve_asset(src: str | None) -> Path | None:
    if not src:
        return None
    normalized = src[1:] if src.startswith("/") else src
    path = PUBLIC_DIR / normalized
    return path if path.exists() else None


def scaled_image(path: Path, max_width: float, max_height: float) -> Image | None:
    try:
        with PILImage.open(path) as img:
            width, height = img.size
    except Exception:
        return None

    ratio = min(max_width / width, max_height / height)
    return Image(str(path), width=width * ratio, height=height * ratio)


class Rule(Flowable):
    def __init__(self, color=colors.HexColor(HOZUI["color"]["stroke_default"]), width=1):
        super().__init__()
        self.color = color
        self.width = width
        self.height = 1
        self.available_width = 0

    def wrap(self, availWidth, availHeight):
        self.available_width = availWidth
        return availWidth, self.height

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.width)
        self.canv.line(0, 0, self.available_width, 0)


class ChipsFlowable(Flowable):
    def __init__(self, items: list[str], font_name: str = LABEL_FONT):
        super().__init__()
        self.items = items
        self.font_name = font_name
        self.font_size = HOZUI["type"]["caption"]["size"]
        self.line_height = HOZUI["type"]["caption"]["line"]
        self.gap_x = HOZUI["space"]["6"]
        self.gap_y = HOZUI["space"]["6"]
        self.pad_x = HOZUI["space"]["8"]
        self.pad_y = HOZUI["space"]["2"]
        self.radius = HOZUI["radius"]["full"] if "full" in HOZUI["radius"] else 8
        self.rows: list[list[tuple[str, float]]] = []

    def wrap(self, availWidth, availHeight):
        self.rows = []
        row: list[tuple[str, float]] = []
        x = 0
        for item in self.items:
            text_width = pdfmetrics.stringWidth(item, self.font_name, self.font_size)
            chip_width = text_width + self.pad_x * 2
            if row and x + chip_width > availWidth:
                self.rows.append(row)
                row = []
                x = 0
            row.append((item, chip_width))
            x += chip_width + self.gap_x
        if row:
            self.rows.append(row)
        height = len(self.rows) * (self.line_height + self.pad_y * 2)
        if self.rows:
            height += (len(self.rows) - 1) * self.gap_y
        self.width = availWidth
        self.height = height
        return availWidth, height

    def draw(self):
        canvas = self.canv
        y = self.height - self.line_height - self.pad_y
        canvas.setFont(self.font_name, self.font_size)
        for row in self.rows:
            x = 0
            for item, chip_width in row:
                chip_height = self.line_height + self.pad_y * 2
                canvas.setFillColor(colors.HexColor(HOZUI["color"]["bg_accent_muted"]))
                canvas.setStrokeColor(colors.HexColor(HOZUI["color"]["stroke_default"]))
                canvas.roundRect(x, y - self.pad_y, chip_width, chip_height, 6, stroke=1, fill=1)
                canvas.setFillColor(colors.HexColor(HOZUI["color"]["fg_accent"]))
                canvas.drawString(x + self.pad_x, y + 1, item)
                x += chip_width + self.gap_x
            y -= self.line_height + self.pad_y * 2 + self.gap_y


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="ResumeName",
        fontName=HEADING_FONT,
        fontSize=HOZUI["type"]["display_lg"]["size"],
        leading=HOZUI["type"]["display_lg"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["2"],
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeRole",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["body_md"]["size"],
        leading=HOZUI["type"]["body_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_accent"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["8"],
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeHeading",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["label_sm"]["size"],
        leading=HOZUI["type"]["label_sm"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
        spaceBefore=HOZUI["space"]["12"],
        spaceAfter=HOZUI["space"]["4"],
    )
)
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        fontName=HEADING_FONT,
        fontSize=HOZUI["type"]["heading_lg"]["size"],
        leading=HOZUI["type"]["heading_lg"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["4"],
    )
)
styles.add(
    ParagraphStyle(
        name="MutedBody",
        fontName=BODY_FONT,
        fontSize=HOZUI["type"]["body_md"]["size"],
        leading=HOZUI["type"]["body_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["2"],
    )
)
styles.add(
    ParagraphStyle(
        name="CoverBody",
        fontName=BODY_FONT,
        fontSize=HOZUI["type"]["body_md"]["size"],
        leading=HOZUI["type"]["body_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="ProjectIndex",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["label_sm"]["size"],
        leading=HOZUI["type"]["label_sm"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="ProjectTitle",
        fontName=HEADING_FONT,
        fontSize=HOZUI["type"]["heading_md"]["size"],
        leading=HOZUI["type"]["heading_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["2"],
    )
)
styles.add(
    ParagraphStyle(
        name="ProjectMeta",
        fontName=BODY_FONT,
        fontSize=HOZUI["type"]["body_sm"]["size"],
        leading=HOZUI["type"]["body_sm"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["4"],
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        fontName=BODY_FONT,
        fontSize=HOZUI["type"]["body_md"]["size"],
        leading=HOZUI["type"]["body_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
        spaceAfter=HOZUI["space"]["2"],
    )
)
styles.add(
    ParagraphStyle(
        name="SectionTitle",
        fontName=HEADING_FONT,
        fontSize=HOZUI["type"]["label_md"]["size"],
        leading=HOZUI["type"]["label_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
        spaceBefore=HOZUI["space"]["6"] if "6" in HOZUI["space"] else HOZUI["space"]["4"],
        spaceAfter=HOZUI["space"]["4"],
    )
)
styles.add(
    ParagraphStyle(
        name="SmallLabel",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["caption"]["size"],
        leading=HOZUI["type"]["caption"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="ChipText",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["caption"]["size"],
        leading=HOZUI["type"]["caption"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_accent"]),
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="Result",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["body_md"]["size"],
        leading=HOZUI["type"]["body_md"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_accent"]),
        wordWrap="CJK",
        spaceBefore=HOZUI["space"]["6"],
    )
)
styles.add(
    ParagraphStyle(
        name="MetricValue",
        fontName=HEADING_FONT,
        fontSize=HOZUI["type"]["body_lg"]["size"],
        leading=HOZUI["type"]["body_lg"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_default"]),
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="MetricLabel",
        fontName=LABEL_FONT,
        fontSize=HOZUI["type"]["label_sm"]["size"],
        leading=HOZUI["type"]["label_sm"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="Caption",
        fontName=BODY_FONT,
        fontSize=HOZUI["type"]["caption"]["size"],
        leading=HOZUI["type"]["caption"]["line"],
        textColor=colors.HexColor(HOZUI["color"]["fg_muted"]),
        wordWrap="CJK",
        alignment=TA_LEFT,
    )
)


def p(text: Any, style: str = "Body") -> Paragraph:
    return Paragraph(sanitize(text), styles[style])


def chip_table(items: list[str], width: float, columns: int = 4) -> Table | None:
    if not items:
        return None
    return ChipsFlowable(items)


def metric_table(metrics: list[dict[str, Any]], width: float) -> Table | None:
    if not metrics:
        return None
    cols = min(2, len(metrics))
    col_width = width / cols
    rows = []
    row = []
    for metric in metrics[:6]:
        cell = [
            p(f"{metric.get('label', '')} / {metric.get('value', '')}", "MetricLabel"),
            p(metric.get("detail", ""), "SmallLabel"),
        ]
        row.append(cell)
        if len(row) == cols:
            rows.append(row)
            row = []
    if row:
        row.extend([""] * (cols - len(row)))
        rows.append(row)

    table = Table(rows, colWidths=[col_width] * cols, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(HOZUI["color"]["bg_canvas"])),
                ("LINEABOVE", (0, 0), (-1, 0), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("LINEBELOW", (0, -1), (-1, -1), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("LEFTPADDING", (0, 0), (-1, -1), HOZUI["space"]["8"]),
                ("RIGHTPADDING", (0, 0), (-1, -1), HOZUI["space"]["8"]),
                ("TOPPADDING", (0, 0), (-1, -1), HOZUI["space"]["4"]),
                ("BOTTOMPADDING", (0, 0), (-1, -1), HOZUI["space"]["4"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def tech_list(technologies: list[str], width: float) -> Table | None:
    if not technologies:
        return None
    rows = []
    current = []
    for tech in technologies:
        current.append(p(tech, "SmallLabel"))
        if len(current) == 4:
            rows.append(current)
            current = []
    if current:
        current.extend([""] * (4 - len(current)))
        rows.append(current)
    table = Table(rows, colWidths=[width / 4] * 4, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("LINEABOVE", (0, 0), (-1, 0), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("LINEBELOW", (0, -1), (-1, -1), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(HOZUI["color"]["bg_canvas"])),
                ("LEFTPADDING", (0, 0), (-1, -1), HOZUI["space"]["8"]),
                ("RIGHTPADDING", (0, 0), (-1, -1), HOZUI["space"]["8"]),
                ("TOPPADDING", (0, 0), (-1, -1), HOZUI["space"]["2"]),
                ("BOTTOMPADDING", (0, 0), (-1, -1), HOZUI["space"]["2"]),
            ]
        )
    )
    return table


def project_index_table(projects: list[dict[str, Any]], width: float) -> Table:
    rows = [[p("Project", "MetricLabel"), p("Role / Period", "MetricLabel"), p("Summary", "MetricLabel")]]
    for project in projects:
        rows.append(
            [
                p(f"{project.get('index', '')}. {project.get('name', '')}", "SmallLabel"),
                [p(project.get("role", ""), "SmallLabel"), p(project.get("period", ""), "SmallLabel")],
                p(project.get("description", ""), "SmallLabel"),
            ]
        )
    table = Table(rows, colWidths=[32 * mm, 42 * mm, width - 74 * mm], hAlign="LEFT", repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("LINEABOVE", (0, 0), (-1, 0), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("LINEBELOW", (0, -1), (-1, -1), 0.75, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor(HOZUI["color"]["stroke_default"])),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(HOZUI["color"]["bg_muted"])),
                ("LEFTPADDING", (0, 0), (-1, -1), HOZUI["space"]["6"] if "6" in HOZUI["space"] else HOZUI["space"]["4"]),
                ("RIGHTPADDING", (0, 0), (-1, -1), HOZUI["space"]["6"] if "6" in HOZUI["space"] else HOZUI["space"]["4"]),
                ("TOPPADDING", (0, 0), (-1, -1), HOZUI["space"]["4"]),
                ("BOTTOMPADDING", (0, 0), (-1, -1), HOZUI["space"]["4"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def first_text(blocks: list[dict[str, Any]], block_id: str) -> str:
    for block in blocks:
        if block.get("id") == block_id and block.get("type") == "text":
            body = block.get("body", "")
            if isinstance(body, list):
                return plain(body[0] if body else "")
            return plain(body)
    return ""


def text_items(blocks: list[dict[str, Any]], block_id: str) -> list[str]:
    for block in blocks:
        if block.get("id") == block_id and block.get("type") == "text":
            body = block.get("body", "")
            if isinstance(body, list):
                return [plain(item) for item in body if plain(item)]
            if plain(body):
                return [plain(body)]
    return []


def result_text(blocks: list[dict[str, Any]]) -> str:
    for block in blocks:
        if block.get("type") == "result":
            return plain(block.get("body", ""))
    return ""


def representative_media(blocks: list[dict[str, Any]]) -> tuple[Path | None, str]:
    for block in blocks:
        if block.get("type") == "image":
            return resolve_asset(block.get("src")), plain(block.get("caption", ""))
        if block.get("type") == "video":
            return resolve_asset(block.get("poster")), plain(block.get("caption", ""))
        if block.get("type") == "video-comparison":
            return resolve_asset(block.get("afterPoster")), plain(block.get("caption", ""))
    return None, ""


def section_summary(section: dict[str, Any], width: float) -> list[Any]:
    blocks = list(section.get("blocks", []))
    header = Table(
        [[p(section.get("title", ""), "SectionTitle"), p(section.get("eyebrow", ""), "SmallLabel")]],
        colWidths=[width * 0.78, width * 0.22],
        hAlign="LEFT",
    )
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story = [Spacer(1, HOZUI["space"]["8"]), header]

    problem = first_text(blocks, "problem")
    details = text_items(blocks, "solution") or text_items(blocks, "approach")
    result = result_text(blocks)
    if problem:
        story.append(p(problem, "MutedBody"))
    if details:
        bullets = ListFlowable(
            [ListItem(p(detail, "MutedBody"), leftIndent=0) for detail in details],
            bulletType="bullet",
            start="circle",
            leftIndent=12,
            bulletFontName=BODY_FONT,
            bulletFontSize=6,
            bulletColor=colors.HexColor(HOZUI["color"]["fg_accent"]),
        )
        story.append(bullets)
    if result:
        story.append(p(f"-> {result}", "Result"))

    media, caption = representative_media(blocks)
    if media:
        image = scaled_image(media, min(width, 128 * mm), 44 * mm)
        if image:
            story.extend([Spacer(1, HOZUI["space"]["4"]), image])
            if caption:
                story.append(p(caption, "Caption"))
    story.append(Spacer(1, HOZUI["space"]["10"] if "10" in HOZUI["space"] else HOZUI["space"]["8"]))
    return story


def stories_summary(project: dict[str, Any], width: float) -> list[Any]:
    flowables = []
    for story in project.get("stories", []):
        flowables.append(p(f"{story.get('title', '')}", "SectionTitle"))
        flowables.append(p(story.get("problem", ""), "MutedBody"))
        flowables.append(
            ListFlowable(
                [ListItem(p(story.get("approach", ""), "MutedBody"), leftIndent=0)],
                bulletType="bullet",
                leftIndent=12,
                bulletFontName=BODY_FONT,
                bulletFontSize=6,
                bulletColor=colors.HexColor(HOZUI["color"]["fg_accent"]),
            )
        )
        flowables.extend([p(f"-> {story.get('result', '')}", "Result"), Spacer(1, HOZUI["space"]["8"])])
    return flowables


def project_page(project: dict[str, Any], width: float) -> list[Any]:
    title_row = Table(
        [
            [
                p(project.get("name", ""), "ProjectTitle"),
                p(project.get("period", ""), "ProjectMeta"),
            ]
        ],
        colWidths=[width * 0.68, width * 0.32],
        hAlign="LEFT",
    )
    title_row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    flowables: list[Any] = [
        Rule(),
        Spacer(1, HOZUI["space"]["12"]),
        p(f"PROJECT {project.get('index', '')}", "ResumeRole"),
        title_row,
        p(
            " / ".join(
                item
                for item in [
                    project.get("organization", ""),
                    project.get("role", ""),
                    project.get("team", ""),
                ]
                if item
            ),
            "ProjectMeta",
        ),
        p(project.get("description", ""), "MutedBody"),
    ]
    metrics = metric_table(list(project.get("metrics", [])), width)
    if metrics:
        flowables.extend([p("성과 지표", "ResumeHeading"), metrics])
    techs = chip_table(list(project.get("technologies", [])), width)
    if techs:
        flowables.extend([p("기술 스택", "ResumeHeading"), techs])
    flowables.append(Spacer(1, HOZUI["space"]["8"]))

    if project.get("sections"):
        for section in project["sections"]:
            flowables.extend(section_summary(section, width))
    else:
        flowables.extend(stories_summary(project, width))

    return flowables


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(BODY_FONT, 7)
    canvas.setFillColor(colors.HexColor(HOZUI["color"]["fg_subtle"]))
    canvas.drawString(doc.leftMargin, 10 * mm, "Choi Ho / Frontend Portfolio")
    canvas.drawRightString(PAGE_WIDTH - doc.rightMargin, 10 * mm, str(canvas.getPageNumber()))
    canvas.restoreState()


def resume_header(width: float) -> Table:
    left: list[Any] = []
    profile = scaled_image(PROFILE_IMAGE, 30 * mm, 30 * mm) if PROFILE_IMAGE.exists() else None
    if profile:
        left.append(profile)
        left.append(Spacer(1, HOZUI["space"]["8"]))
    left.extend(
        [
            p("hochoi8621@gmail.com", "SmallLabel"),
            p("blog.hozorica.com", "SmallLabel"),
            p("github.com/choihooo", "SmallLabel"),
        ]
    )
    right = [
        p("Frontend Engineer", "ResumeRole"),
        p("최호", "ResumeName"),
        p(
            "문제의 원인을 사용자 흐름과 데이터로 확인하고, 검증 가능한 프론트엔드 구조로 개선하는 개발자 최호입니다.",
            "MutedBody",
        ),
        p(
            "프로젝트 경험은 원인 분석, 구현 판단, 검증 지표와 결과를 중심으로 정리했습니다.",
            "MutedBody",
        ),
    ]
    table = Table([[left, right]], colWidths=[38 * mm, width - 38 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), HOZUI["space"]["12"]),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), HOZUI["space"]["12"]),
            ]
        )
    )
    return table


def build(data_path: Path, output_path: Path):
    with data_path.open("r", encoding="utf8") as file:
        projects = json.load(file)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=17 * mm,
        title="Choi Ho Frontend Portfolio",
        author="Choi Ho",
    )
    usable_width = PAGE_WIDTH - doc.leftMargin - doc.rightMargin

    story: list[Any] = [
        resume_header(usable_width),
        Rule(),
        p("Core Skills", "ResumeHeading"),
        chip_table(
            [
                "React",
                "Next.js",
                "TypeScript",
                "React Native",
                "Tauri",
                "Playwright",
                "Analytics",
                "CMS",
                "Migration",
                "Automation",
                "Performance",
                "CI/CD",
            ],
            usable_width,
        ),
        p("Project Experience", "ResumeHeading"),
        project_index_table(projects, usable_width),
    ]
    story.append(PageBreak())

    for idx, project in enumerate(projects):
        story.extend(project_page(project, usable_width))
        if idx != len(projects) - 1:
            story.append(PageBreak())

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: generate-portfolio-pdf.py DATA_JSON OUTPUT_PDF")
    build(Path(sys.argv[1]), Path(sys.argv[2]))


if __name__ == "__main__":
    main()

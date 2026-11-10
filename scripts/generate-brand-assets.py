"""Regenerate static share assets from the bundled SUIT font (Pillow + fontTools)."""
from pathlib import Path
from tempfile import TemporaryDirectory
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
font = TTFont(root / "app/fonts/suit/SUIT-Variable.woff2")
instantiateVariableFont(font, {"wght": 700}, inplace=True)
font.flavor = None
image = Image.new("RGB", (1200, 630), "white")
draw = ImageDraw.Draw(image)
with TemporaryDirectory() as temporary:
    font_path = Path(temporary) / "suit-bold.ttf"
    font.save(font_path)

    def line(text, x, y, size, color, highlight=True):
        face = ImageFont.truetype(str(font_path), size)
        baseline = y + face.getmetrics()[0]
        for char in text:
            draw.text((x, baseline), char, font=face, fill="#FF6F0F" if highlight and char == "호" else color, anchor="ls")
            x += face.getlength(char)

    line("최호", 96, 116, 104, "#171717", highlight=False)
    line("프론트엔드 개발자", 96, 260, 32, "#737373")
    line("사용자에게는 호감 가는 경험을,", 96, 375, 26, "#525252")
    line("동료에게는 호흡이 잘 맞는 사람이 되고 싶습니다.", 96, 423, 26, "#525252")
    line("AI에 호기심이 많습니다.", 96, 471, 26, "#525252")

image.save(root / "app/opengraph-image.png", optimize=True)
glyphs = font.getGlyphSet()
glyph = glyphs[font.getBestCmap()[ord("호")]]
pen = SVGPathPen(glyphs)
glyph.draw(pen)
bounds = BoundsPen(glyphs)
glyph.draw(bounds)
x0, y0, x1, y1 = bounds.bounds
scale = min(40 / (x1 - x0), 40 / (y1 - y0))
tx = (64 - (x1 - x0) * scale) / 2 - x0 * scale
ty = (64 + (y1 - y0) * scale) / 2 + y0 * scale
(root / "app/icon.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="white"/><path d="{pen.getCommands()}" transform="translate({tx:.4f} {ty:.4f}) scale({scale:.6f} {-scale:.6f})" fill="#FF6F0F"/></svg>\n'
)

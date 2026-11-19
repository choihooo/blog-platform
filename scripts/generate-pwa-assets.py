"""Generate PWA icons and a self-contained offline page (Pillow + fontTools)."""
import base64
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
output = root / "public/pwa"
output.mkdir(exist_ok=True)
font = TTFont(root / "app/fonts/suit/SUIT-Variable.woff2")
instantiateVariableFont(font, {"wght": 700}, inplace=True)
font.flavor = None

with TemporaryDirectory() as directory:
    font_path = Path(directory) / "suit.ttf"
    font.save(font_path)
    for size, destination in [
        (192, output / "icon-192.png"),
        (512, output / "icon-512.png"),
        (512, output / "icon-maskable-512.png"),
        (180, root / "app/apple-icon.png"),
    ]:
        image = Image.new("RGB", (size, size), "white")
        draw = ImageDraw.Draw(image)
        face = ImageFont.truetype(str(font_path), size)
        left, top, right, bottom = draw.textbbox((0, 0), "호", font=face)
        face = ImageFont.truetype(str(font_path), round(size * (40 / 64) * size / max(right - left, bottom - top)))
        left, top, right, bottom = draw.textbbox((0, 0), "호", font=face)
        draw.text(((size - right - left) / 2, (size - bottom - top) / 2), "호", font=face, fill="#FF6F0F")
        image.save(destination, optimize=True)

title = "인터넷 연결을 확인해 주세요"
message = "연결이 복구되면 다시 시도해 주세요."
label = "다시 시도"
options = subset.Options()
options.flavor = "woff2"
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=title + message + label + "최호")
subsetter.subset(font)
font.flavor = "woff2"
buffer = BytesIO()
font.save(buffer)
encoded_font = base64.b64encode(buffer.getvalue()).decode()
(root / "public/offline.html").write_text(f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>오프라인 — 최호</title>
<style>
@font-face {{ font-family: SUIT; src: url(data:font/woff2;base64,{encoded_font}) format("woff2"); font-weight: 700; font-display: swap; }}
:root {{ color-scheme: light dark; --background: #fff; --foreground: #171717; }}
@media (prefers-color-scheme: dark) {{ :root {{ --background: #181818; --foreground: #d4d4d4; }} }}
:root[data-theme="light"] {{ --background: #fff; --foreground: #171717; }}
:root[data-theme="dark"] {{ --background: #181818; --foreground: #d4d4d4; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--background); color: var(--foreground); font: 700 15px/1.7 SUIT, sans-serif; letter-spacing: -.02em; }}
main {{ max-width: 672px; margin: 0 auto; padding: 64px 24px; }}
h1 {{ font-size: 24px; line-height: 1.4; }}
a {{ color: inherit; text-underline-offset: 4px; display: inline-block; padding: 10px 0; }}
a:hover {{ color: #FF6F0F; }}
a:focus-visible {{ outline: 2px solid currentColor; outline-offset: 4px; }}
</style>
<script>try {{ const theme = localStorage.getItem("blog_theme"); if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme; }} catch {{}}</script>
</head>
<body><main><h1>{title}</h1><p>{message}</p><a href="" onclick="location.reload(); return false;">{label}</a></main></body>
</html>
''', encoding="utf-8")

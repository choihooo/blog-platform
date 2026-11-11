"""Convert the bundled SUIT font to static Bold for Next ImageResponse.

Run with Python fontTools and brotli installed. Keeps the existing SIL OFL license.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

directory = Path(__file__).resolve().parent.parent / "app/fonts/suit"
font = TTFont(directory / "SUIT-Variable.woff2")
instantiateVariableFont(font, {"wght": 700}, inplace=True)
font.flavor = None
font.save(directory / "SUIT-Bold.otf")

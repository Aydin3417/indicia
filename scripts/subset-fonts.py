"""Subset the app's 8 typefaces to what Indicia writes: Latin, Latin-1, Latin Extended-A (Turkish), punctuation and
the symbols the UI uses (wave 7, Agent R; docs/handoff/R.md).

    python scripts/subset-fonts.py          # (npm run fonts) writes assets/fonts/*.ttf and checks coverage

Source: the full TTFs in node_modules/@expo-google-fonts (SIL OFL 1.1, which allows subsetting). Hinting and every
OpenType feature (kerning, ligatures) are kept; only glyphs outside the ranges below go. On the web first screen this
takes the fonts from 648 KB to ~326 KB gzipped. A character outside the ranges falls back to a system font; extend
UNICODES (and re-run) before shipping a new script or symbol.
"""
import subprocess
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "node_modules" / "@expo-google-fonts"
OUT = ROOT / "assets" / "fonts"

FONTS = {
    "Newsreader_400Regular_Italic": "newsreader/400Regular_Italic",
    "Newsreader_500Medium": "newsreader/500Medium",
    "Newsreader_600SemiBold": "newsreader/600SemiBold",
    "IBMPlexSans_400Regular": "ibm-plex-sans/400Regular",
    "IBMPlexSans_500Medium": "ibm-plex-sans/500Medium",
    "IBMPlexSans_600SemiBold": "ibm-plex-sans/600SemiBold",
    "IBMPlexMono_400Regular": "ibm-plex-mono/400Regular",
    "IBMPlexMono_500Medium": "ibm-plex-mono/500Medium",
}

UNICODES = ",".join([
    "U+0000-017F",  # Basic Latin, Latin-1, Latin Extended-A (ç ğ ı İ ö ş ü …)
    "U+0192", "U+02C6-02DC", "U+0307",  # ƒ, spacing modifiers, combining dot (lowercased İ in non-Turkish locales)
    "U+2000-206F",  # general punctuation (— – … “ ” ‘ ’ • ‹ ›)
    "U+20A0-20CF",  # currency (€ ₺)
    "U+2122", "U+2190-2199", "U+2212", "U+2248", "U+2260", "U+2264-2265", "U+22EE",
    "U+2300-23FF", "U+2500-25FF", "U+2600-26FF", "U+2700-27BF",  # technical, box drawing, shapes, ★ ✓ ✕ (if present)
])

# must be in every subset (the font had them before) — Turkish letters and the punctuation the copy uses
MUST = "İşğüöçÇĞŞÖÜıâîû—–…“”‘’·•€"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ok = True
    for name, rel in FONTS.items():
        src = SRC / rel / f"{name}.ttf"
        dst = OUT / f"{name}.ttf"
        subprocess.run([sys.executable, "-m", "fontTools.subset", str(src), f"--unicodes={UNICODES}",
                        "--layout-features=*", f"--output-file={dst}"], check=True, capture_output=True)
        before = set(TTFont(str(src)).getBestCmap())
        after = set(TTFont(str(dst)).getBestCmap())
        missing = [c for c in MUST if ord(c) in before and ord(c) not in after]
        lira = "₺ yes" if 0x20BA in after else ("₺ not in the source font" if 0x20BA not in before else "₺ LOST")
        print(f"{name:30s} {src.stat().st_size / 1024:6.0f} KB -> {dst.stat().st_size / 1024:5.0f} KB  "
              f"{len(before)} -> {len(after)} chars  {lira}  {'missing ' + ''.join(missing) if missing else 'ok'}")
        ok &= not missing and lira != "₺ LOST"
    if not ok:
        raise SystemExit("a subset lost characters it had")


if __name__ == "__main__":
    main()

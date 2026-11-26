"""Measure every delivered sound with the owner's `ear` tool and print one table.

    python scripts/sound/measure.py            # table
    python scripts/sound/measure.py --md       # markdown table (for docs/handoff/L.md)

Each interface sound is graded against the `ear.sfx` profile that matches its tier; room tones against `ambience`.
"Moment" sounds (day turn, night, round lost, weak verdict) sit between everyday and reward by design: they are graded
with `ui-reward` and their loudness miss (-20 LUFS vs -17..-9) is intentional.
"""
import json
import subprocess
import sys
from pathlib import Path

# the WAV masters (wave 7); the shipped .m4a files are checked against them by scripts/sound/encode.py
ROOT = Path(__file__).resolve().parents[2] / "assets" / "audio" / "master"

PROFILE = {
    # everyday / quiet everyday
    **{k: "ui-tap" for k in ["fact", "press", "resist", "patience", "wrong", "retry", "star_dim", "tool",
                             "torch_on", "torch_off", "uv_on", "page"]},
    "lab": "notification",
    **{k: "ui-reward" for k in ["day", "night", "lost", "verdict_bad", "breakthrough", "confirmed", "won", "star", "verdict"]},
}


def grade(path: Path, profile: str) -> dict:
    out = subprocess.run([sys.executable, "-m", "ear.sfx", str(path), "--profile", profile, "--json"],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)[0]


def main() -> None:
    md = "--md" in sys.argv
    rows = []
    for f in sorted((ROOT / "sfx").glob("*.wav")):
        rows.append((f.stem, PROFILE.get(f.stem, "ui-tap"), grade(f, PROFILE.get(f.stem, "ui-tap"))))
    for f in sorted((ROOT / "rooms").glob("*.wav")):
        rows.append((f.stem, "ambience", grade(f, "ambience")))
    if md:
        print("| sound | profile | score | dur s | LUFS | dBTP | attack ms | flatness | top Hz | issues |")
        print("|---|---|---|---|---|---|---|---|---|---|")
    for name, prof, r in rows:
        x = r["features"]
        issues = ", ".join(f'{i["label"]} {i["value"]}{i.get("unit", "")} (want {i["target"]})' for i in r["issues"]) or "clean"
        cells = [name, prof, str(r["score"]), f'{x["duration_s"]:.2f}', f'{x["lufs"]:.1f}', f'{x["true_peak_dbtp"]:.1f}',
                 f'{x["attack_ms"]:.0f}', f'{x["flatness"]:.3f}', f'{x["bandwidth_top_hz"]:.0f}', issues]
        print("| " + " | ".join(cells) + " |" if md else "  ".join(c.ljust(w) for c, w in zip(cells, [13, 13, 4, 6, 7, 6, 6, 7, 7, 40])))


if __name__ == "__main__":
    main()

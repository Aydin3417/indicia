"""Encode the WAV masters into the AAC (.m4a) files the app ships, and prove nothing moved.

    python scripts/sound/encode.py            # encode everything, then verify
    python scripts/sound/encode.py --verify   # verify the shipped files only
    python scripts/sound/encode.py --md       # verify and print markdown tables (docs/handoff/R.md)

Masters (rendered / built, never shipped): assets/audio/master/{sfx,rooms}/*.wav
Shipped (required by src/sound/catalog.ts):  assets/audio/{sfx,rooms}/*.m4a

Why AAC in MP4 (.m4a): it is the one compressed format every target decodes natively — iOS (AVPlayer), Android
(Media3/ExoPlayer, MediaPlayer), and every web browser including Safari. Ogg/Opus would be smaller but iOS cannot play
it outside Safari 17+, and MP3 has no standard way to tell a browser's <audio> element about the encoder delay. In
MP4 that delay (the AAC encoder's 1024 priming samples) and the tail padding are written as an edit list, which
AVFoundation, Media3, Chrome, Firefox and Safari honour, so a decoded loop is exactly the master's length and starts
on the master's first sample. `verify()` checks precisely that, on the shipped bytes.

Checks, per file (all must pass, else exit 1):
  * decoded length == master length (± 0 samples), and the decoded signal is aligned with the master (lag 0);
  * loudness and true peak with `ear`'s BS.1770 code (ear.loudness, what `ear` reports as `level`):
    |ΔLUFS| ≤ 0.3 LU; true peak stays ≤ -1.0 dBTP and rises by ≤ 2 dB (a lossy codec's overshoot on a sharp onset;
    the files keep ≥ 1 dB of headroom either way);
  * room tones only — the loop seam, on the DECODED file doubled end-to-start (what a looping player plays):
      - the sample step across the seam is below the 99th percentile of all sample-to-sample steps,
      - the 50 ms RMS straddling the seam is within 1.5 dB of the median 50 ms RMS, or within 0.5 dB of the master's
        own figure (the workshop clock's seam sits in the hush between two ticks: -1.6 dB in the master already),
      - `ear` finds no event onset and no defect within 0.25 s of the seam;
  * size: room tones ≤ 250 KB.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from ear import loudness as ear_loudness

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[2] / "assets" / "audio"
MASTER = ROOT / "master"

# AAC-LC settings (mono), tried in order per file until the decoded result passes `check()`; the first that passes
# ships. Room tones are hushes and a clock at 22.05 kHz: 40 kb/s keeps them under 250 KB for the 46.64 s workshop
# cycle. Interface sounds are bell/glass partials at 44.1 kHz, where ffmpeg's default ("twoloop") coder is uneven:
#  * its perceptual noise substitution (PNS) mistakes steady partials for noise in a few frames — `won` decoded at
#    16 dB SNR with its true peak 1.9 dB over the master (+0.4 dBTP) with PNS on;
#  * even with PNS off, a struck onset inside an AAC frame overshot by 2–2.6 dB at 96–160 kb/s (`confirmed`,
#    `verdict`: +0.5 dBTP), and the `page` air grains lost 0.7 LU to the 96k low-pass.
# The "fast" coder at 128 kb/s, PNS off, passes every sound (worst ΔLUFS 0.22, worst true-peak rise +0.02 dB) at
# 276 KB for all 22 — smaller than twoloop at 128k. The later rungs are only a safety net for future sounds.
LADDER = {
    "rooms": [["-b:a", "40k"]],
    "sfx": [["-b:a", "128k", "-aac_coder", "fast", "-aac_pns", "0"],
            ["-b:a", "160k", "-aac_coder", "fast", "-aac_pns", "0"],
            ["-b:a", "192k", "-aac_pns", "0", "-cutoff", "20000"]],
}
ROOM_MAX_BYTES = 250 * 1024


def ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def level_problems(x: np.ndarray, y: np.ndarray, sr: int) -> tuple[list[str], dict, dict]:
    """Length, alignment, loudness and true-peak checks of a decoded file against its master."""
    a, b = ear_level(x, sr), ear_level(y, sr)
    bad = []
    if len(y) != len(x):
        bad.append(f"length {len(y) - len(x):+d} samples")
    lag = lag_of(x, y, sr)
    if lag != 0:
        bad.append(f"lag {lag:+d}")
    if abs(b["integrated_lufs"] - a["integrated_lufs"]) > 0.3:
        bad.append("loudness moved")
    if b["true_peak_dbtp"] - a["true_peak_dbtp"] > 2.0 or b["true_peak_dbtp"] > -1.0:
        bad.append("true peak")
    return bad, a, b


def encode(kind: str, src: Path) -> str:
    """Encodes one master, climbing LADDER until the decoded file passes; returns the settings used."""
    out = ROOT / kind / f"{src.stem}.m4a"
    out.parent.mkdir(parents=True, exist_ok=True)
    x, sr = sf.read(str(src), dtype="float64")
    for rung in LADDER[kind]:
        ffmpeg("-i", str(src), "-map_metadata", "-1", "-c:a", "aac", *rung, "-ac", "1", "-ar", str(sr),
               "-movflags", "+faststart", str(out))
        bad, _, _ = level_problems(x, decode(out, sr), sr)
        if not bad:
            return " ".join(rung)
    raise SystemExit(f"{kind}/{src.stem}: no AAC setting passes ({', '.join(bad)})")


def decode(path: Path, sr: int) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1",
                          "-ar", str(sr), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def ear_report(path: Path) -> dict:
    """The full `ear` analysis (events, onsets, defects) — used for the doubled loops."""
    out = subprocess.run([sys.executable, "-m", "ear", str(path), "--json", "--no-bands"], capture_output=True,
                         text=True, check=True).stdout
    return json.loads(out)


def ear_level(x: np.ndarray, sr: int) -> dict:
    """Integrated loudness and true peak with `ear`'s own BS.1770 code (what `ear` reports under `level`)."""
    m = x.reshape(-1, 1)
    return {"integrated_lufs": float(ear_loudness.loudness_lufs(m, sr)["integrated_lufs"]),
            "true_peak_dbtp": float(ear_loudness.true_peak_dbtp(m, sr))}


def lag_of(a: np.ndarray, b: np.ndarray, sr: int) -> int:
    """Lag (samples) of b against a over the first second (cross-correlation peak within ±4096)."""
    n = min(len(a), len(b), sr)
    x, y = a[:n], b[:n]
    m = 1 << (2 * n).bit_length()
    c = np.fft.irfft(np.fft.rfft(y, m) * np.conj(np.fft.rfft(x, m)), m)
    c = np.concatenate([c[-4096:], c[:4097]])
    return int(np.argmax(c)) - 4096


def seam(y: np.ndarray, sr: int, tmp: Path | None) -> dict:
    """Seam numbers for a loop; `tmp` given → also run `ear` on the doubled loop for events/defects near the seam."""
    d = np.abs(np.diff(y))
    step = abs(float(y[0] - y[-1]))
    p99 = float(np.percentile(d, 99))
    w = int(0.05 * sr)
    rms = np.sqrt(np.convolve(y ** 2, np.ones(w) / w, mode="valid"))
    med = float(np.median(rms))
    dbl = np.concatenate([y, y])
    seam_rms = float(np.sqrt(np.mean(dbl[len(y) - w // 2: len(y) + w // 2] ** 2)))
    if tmp is None:
        return {"step_ratio": step / p99 if p99 else 0.0, "rms_db": 20 * np.log10(seam_rms / med) if med else 0.0}
    f = tmp / "doubled.wav"
    sf.write(str(f), dbl.astype(np.float32), sr, subtype="FLOAT")
    r = ear_report(f)
    t = len(y) / sr
    near = [o for o in r["time"]["onsets_s"] if abs(o - t) < 0.25]
    near += [e["t_start_s"] for e in r["events"] if abs(e["t_start_s"] - t) < 0.25]
    defects = [x for x in r["defects"] if abs(float(x.get("t_s", x.get("t_start_s", -9))) - t) < 0.25]
    return {"step_ratio": step / p99 if p99 else 0.0, "rms_db": 20 * np.log10(seam_rms / med) if med else 0.0,
            "near_events": len(near), "near_defects": len(defects)}


def verify(md: bool) -> bool:
    ok = True
    rows = []
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        for kind in ("rooms", "sfx"):
            for src in sorted((MASTER / kind).glob("*.wav")):
                out = ROOT / kind / f"{src.stem}.m4a"
                x, sr = sf.read(str(src), dtype="float64")
                y = decode(out, sr)
                bad, a, b = level_problems(x, y, sr)
                kbps = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
                                       "stream=bit_rate", "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout.strip()
                row = {"kind": kind, "name": src.stem, "wav": src.stat().st_size, "m4a": out.stat().st_size,
                       "kbps": round(int(kbps) / 1000) if kbps.isdigit() else "?",
                       "len": len(y) - len(x), "lag": lag_of(x, y, sr), "lufs_a": a["integrated_lufs"], "lufs_b": b["integrated_lufs"],
                       "tp_a": a["true_peak_dbtp"], "tp_b": b["true_peak_dbtp"]}
                if kind == "rooms":
                    s = seam(y, sr, tmp)
                    m = seam(x, sr, None)
                    row.update(s)
                    row["rms_db_master"] = m["rms_db"]
                    rms_ok = abs(s["rms_db"]) <= max(1.5, abs(m["rms_db"]) + 0.5)
                    if s["step_ratio"] >= 1 or not rms_ok or s["near_events"] or s["near_defects"]:
                        bad.append("seam")
                    if row["m4a"] > ROOM_MAX_BYTES:
                        bad.append("size")
                row["bad"] = ", ".join(bad) or "ok"
                ok &= not bad
                rows.append(row)
    if md:
        print("| file | WAV KB | M4A KB | kb/s | Δ samples | lag | LUFS wav → m4a | dBTP wav → m4a | seam step / p99 | seam RMS dB (master → m4a) | seam events | result |")
        print("|---|---|---|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        cells = [f"{r['kind']}/{r['name']}", f"{r['wav'] / 1024:.0f}", f"{r['m4a'] / 1024:.0f}", str(r["kbps"]), f"{r['len']:+d}", f"{r['lag']:+d}",
                 f"{r['lufs_a']:.2f} → {r['lufs_b']:.2f}", f"{r['tp_a']:.1f} → {r['tp_b']:.1f}",
                 f"{r['step_ratio']:.2f}" if "step_ratio" in r else "–", f"{r['rms_db_master']:+.2f} → {r['rms_db']:+.2f}" if "rms_db" in r else "–",
                 str(r["near_events"] + r["near_defects"]) if "near_events" in r else "–", r["bad"]]
        print("| " + " | ".join(cells) + " |" if md else "  ".join(c.ljust(14) for c in cells))
    for kind in ("rooms", "sfx"):
        w = sum(r["wav"] for r in rows if r["kind"] == kind)
        m = sum(r["m4a"] for r in rows if r["kind"] == kind)
        print(f"{'' if not md else '| '}{kind}: WAV {w / 1024:.0f} KB → M4A {m / 1024:.0f} KB ({100 * m / w:.0f} %)")
    return ok


def main() -> None:
    if "--verify" not in sys.argv and "--md" not in sys.argv:
        for kind in ("rooms", "sfx"):
            for src in sorted((MASTER / kind).glob("*.wav")):
                print(f"{kind}/{src.stem}: {encode(kind, src)}", flush=True)
    if not verify("--md" in sys.argv):
        raise SystemExit("some files failed verification")


if __name__ == "__main__":
    main()

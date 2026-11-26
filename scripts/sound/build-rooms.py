"""Build Indicia's three room-tone loops from free recordings (wave 4, Agent L).

    python scripts/sound/build-rooms.py <cache-dir>            # downloads the sources once, builds the loops
    python scripts/sound/build-rooms.py <cache-dir> --no-fetch # build from an existing cache
    python scripts/sound/build-rooms.py <cache-dir> --no-fetch --only quiet   # just one loop

Every source is a real recording from Wikimedia Commons (CC0 / CC BY; see assets/audio/CREDITS.md). Nothing here is
an oscillator: the code only cuts, filters, mixes, crossfades the loop point and sets the level.

Output: assets/audio/rooms/{workshop,interview,gallery}.wav, mono 22.05 kHz 16-bit (the sources hold almost nothing
above 9 kHz, and WAV loops are gapless on every platform, unlike MP3/AAC which pad the ends).
"""
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, resample_poly, sosfilt

OUT = Path(__file__).resolve().parents[2] / "assets" / "audio" / "rooms"
SR = 22050
UA = "IndiciaAudioBuild/1.0 (sound licensing check)"

SOURCES = {
    "pendulum": "https://upload.wikimedia.org/wikipedia/commons/2/2e/223959_klankbeeld_pendulum-slow-ten-o-clock.wav",
    "delft": "https://upload.wikimedia.org/wikipedia/commons/f/fb/20121112_TU_Delft_Library%2C_quiet_study_room_-_general_ambience_-_SoundCloud_-_el_mar.ogg",
    "ac": "https://upload.wikimedia.org/wikipedia/commons/9/99/Air_conditioner_hum_%28Gravity_Sound%29.wav",
    "road": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Two_Lane_Road_in_Kelowna_at_Midnight.flac",
}
EXT = {"pendulum": "wav", "delft": "ogg", "ac": "wav", "road": "flac"}

# integrated loudness of each finished loop in the file; the player adds its own bed gain on top (src/sound)
TARGET_LUFS = -34.0


def fetch(cache: Path) -> None:
    for name, url in SOURCES.items():
        dest = cache / name / f"{name}.{EXT[name]}"
        if dest.exists() and dest.stat().st_size > 100_000:
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        time.sleep(6)  # Commons rate-limits bursts
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        dest.write_bytes(urllib.request.urlopen(req, timeout=300).read())


def load(cache: Path, name: str, start: float, length: float) -> np.ndarray:
    path = cache / name / f"{name}.{EXT[name]}"
    info = sf.info(str(path))
    a, sr = sf.read(str(path), start=int(start * info.samplerate), frames=int(length * info.samplerate), always_2d=True)
    mono = a.mean(axis=1)
    g = np.gcd(SR, sr)
    return resample_poly(mono, SR // g, sr // g)


def hp(x: np.ndarray, hz: float, order: int = 4) -> np.ndarray:
    return sosfilt(butter(order, hz, "highpass", fs=SR, output="sos"), x)


def lp(x: np.ndarray, hz: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, hz, "lowpass", fs=SR, output="sos"), x)


def loop(x: np.ndarray, length: float, xfade: float) -> np.ndarray:
    """`x` must hold length + xfade seconds. The tail past `length` is equal-power crossfaded into the head, so the
    last sample of the loop runs straight on into the first."""
    n, f = int(length * SR), int(xfade * SR)
    assert len(x) >= n + f, "source too short for the loop"
    out = x[:n].copy()
    t = np.linspace(0, np.pi / 2, f)
    out[:f] = x[:f] * np.sin(t) + x[n:n + f] * np.cos(t)
    return out


def lufs(x: np.ndarray) -> float:
    """BS.1770-4 integrated loudness, mono."""
    # K-weighting (pyloudnorm formulation, recomputed for SR)
    G, Q, fc = 3.999843853973347, 0.7071752369554196, 1681.974450955533
    A = 10 ** (G / 40); w0 = 2 * np.pi * fc / SR; al = np.sin(w0) / (2 * Q); c = np.cos(w0)
    b = [A * ((A + 1) + (A - 1) * c + 2 * np.sqrt(A) * al), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - 2 * np.sqrt(A) * al)]
    a = [(A + 1) - (A - 1) * c + 2 * np.sqrt(A) * al, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - 2 * np.sqrt(A) * al]
    y = lfilter(b, a, x)
    y = sosfilt(butter(2, 38.135, "highpass", fs=SR, output="sos"), y)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.mean(y[s:s + blk] ** 2) for s in range(0, len(y) - blk + 1, hop)])
    L = -0.691 + 10 * np.log10(z + 1e-20)
    z = z[L > -70]
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[(-0.691 + 10 * np.log10(z + 1e-20)) > rel]
    return float(-0.691 + 10 * np.log10(z.mean()))


def level(x: np.ndarray, target: float = TARGET_LUFS) -> np.ndarray:
    x = x - x.mean()
    return x * 10 ** ((target - lufs(x)) / 20)


def period(x: np.ndarray, lo: float, hi: float) -> float:
    """Repeat period of a mechanism (seconds) from the autocorrelation of its envelope."""
    env = lp(np.abs(hp(x, 300)), 20)
    env = env - env.mean()
    # FFT autocorrelation (a direct one over 2 M samples takes hours)
    n = 1 << (2 * len(env) - 1).bit_length()
    f = np.fft.rfft(env, n)
    ac = np.fft.irfft(f * np.conj(f), n)[: len(env)]
    a, b = int(lo * SR), int(hi * SR)
    return (a + int(np.argmax(ac[a:b]))) / SR


def workshop(cache: Path) -> np.ndarray:
    """Workshop at night: a slow pendulum clock (tick, tock, and the movement's own cycle) in a still room.
    The loop is exactly one cycle of the movement, so the pattern of ticks never stumbles at the seam."""
    probe = load(cache, "pendulum", 2.0, 100.0)
    p = period(probe, 40.0, 52.0)
    x = load(cache, "pendulum", 2.0, p + 1.0)
    x = hp(x, 90)  # the room's traffic rumble below 90 Hz is inaudible on phones and only eats headroom
    return level(loop(x, p, 1.0)), p


def interview(cache: Path) -> np.ndarray:
    """Interview room: an air conditioner's steady hum (heard through its grille, the 55 Hz fundamental rolled off)
    under the hush of a large quiet room."""
    ac = hp(load(cache, "ac", 0.5, 13.0), 140)
    ac = loop(ac, 12.0, 1.0)
    ac = np.tile(ac, 3)  # 36 s
    room = hp(load(cache, "delft", 1.0, 37.0), 80)
    room = loop(room, 36.0, 1.0)
    mix = level(room, -36.0) + level(ac, -40.0)
    return level(mix), 36.0


def gallery(cache: Path) -> np.ndarray:
    """Museum gallery at night: a large, very quiet hall (ventilation, the size of the room) with the odd car passing
    far outside, muffled by walls and glass."""
    hall = hp(load(cache, "delft", 160.0, 41.0), 60)
    hall = loop(hall, 40.0, 1.0)
    road = lp(hp(load(cache, "road", ROAD_START, 41.0), 80), 1200)
    road = loop(road, 40.0, 1.0)
    mix = level(hall, -35.0) + level(road, -43.0)
    return level(mix), 40.0


# a stretch of the midnight road recording with distant passes and no near traffic (chosen from `ear` events)
ROAD_START = 15.0

# wave 6 (Agent O): the stretch of the Delft room with no `ear` events at all (155.3 s … 236.5 s holds none; the
# gallery uses 160–201 s, this takes 201.5–236.5 s so the two beds never share a second)
QUIET_START = 201.5


def quiet(cache: Path) -> np.ndarray:
    """Quiet rooms away from the workshop (the bank office, the pawnshop, the two flats): only the hush of a still room
    — no clock, no machine, no traffic — softened above 4 kHz and set 3 LU under the other beds, so a side trip
    sounds like stepping out of the workshop's ticking into a closed, carpeted room."""
    x = lp(hp(load(cache, "delft", QUIET_START, 35.0), 80), 4000)
    y = level(loop(x, 34.0, 1.0), TARGET_LUFS - 3.0)
    # start the file on a zero crossing: rotating a seamless loop keeps it seamless, and the first play out of
    # silence then has no step (ear's start/end-step check)
    s = np.abs(y[: SR // 2])
    i = int(np.argmin(s + (np.sign(y[: SR // 2]) == np.sign(np.roll(y, -1)[: SR // 2])) * 1.0))
    return np.roll(y, -i), 34.0


def main() -> None:
    cache = Path(sys.argv[1])
    if "--no-fetch" not in sys.argv:
        fetch(cache)
    OUT.mkdir(parents=True, exist_ok=True)
    only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
    for name, build in [("workshop", workshop), ("interview", interview), ("gallery", gallery), ("quiet", quiet)]:
        if only and name not in only:
            continue
        x, length = build(cache)
        peak = np.max(np.abs(x))
        if peak > 0.89:
            raise SystemExit(f"{name}: peak {20 * np.log10(peak):.1f} dBFS too hot")
        sf.write(str(OUT / f"{name}.wav"), x.astype(np.float32), SR, subtype="PCM_16")
        print(f"{name:10s} {length:6.2f} s  {lufs(x):6.1f} LUFS  peak {20 * np.log10(peak):6.1f} dBFS")


if __name__ == "__main__":
    main()

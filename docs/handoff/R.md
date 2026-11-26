# Handoff R: web weight and credits (wave 7)

PLAYTEST_V4 §7 items 3 and 7.

## What changed

**Audio**
- The app now ships AAC `.m4a` files instead of WAV.
  - Room tones: 6.6 MB → 791 KB, 170–238 KB each.
  - Interface sounds: 1.74 MB → 276 KB for all 22.
- Every file is sample-exact against its master, the loudness did not move, and the loops stay seamless (table below).
- The WAVs stay in the repo as masters in `assets/audio/master/`. They are not bundled because nothing `require`s them.

**First-screen art**
- First-screen art loads lazily on web.
- On a fresh export, the first screen fell from **2063 KB to 1779 KB**.

**Credits**
- New credits screen ("Künye" / "Credits"), reached from Settings.
- It lists the CC BY recordings with full attribution, the two typefaces with their licence, a note on the pictures, and a line on the software.

**Fonts (approved by the coordinator after the first pass)**
- The app now loads Latin + Turkish subsets of its 8 TTFs from the new `assets/fonts/`.
- They are built by `scripts/subset-fonts.py` (`npm run fonts`).
- The first screen is now **1306 KB (1.28 MB)**, under the 1.5 MB target. Details in "Font subsets" below.

No commits. 8787/8140 were never touched. Everything I started has been stopped:
- API on 8792 with `DATA_DIR=C:\temp\indicia-r`
- static servers on 8152/8153/8154
- headless Chrome on 9352/9353 with `--mute-audio` and its own profiles, since deleted

`npm run check` passes (typecheck, boundary, cases, 118/118 tests).

## First-screen bytes (production web export, gzip, 375×812 @2x, fresh profile, cache off)

First launch → briefing ("İlk Nöbet", TR), counted after 4 s of network silence. My driver reads Chrome's `encodedDataLength` (scratchpad `measure.mjs`).

| | before | lazy art | **final (+ font subsets, + map plate lazy)** |
|---|---|---|---|
| JS | 672 KB | 676 KB | 673 KB |
| Fonts (8 TTF) | 648 KB | 648 KB | **347 KB** |
| Images | 734 KB | 446 KB | **276 KB** |
| API + other | 9 KB | 9 KB | 10 KB |
| **Total** | **2063 KB (2.01 MB)** | **1779 KB (1.74 MB)** | **1306 KB (1.28 MB)** |
| Audio on first screen | 0 | 0 | 0 |

The final column was measured on a fresh export after the font switch.
- The map's `Where` plate (170 KB) also dropped off the first screen. The map owner applied request 2 (`useArtReady()` in `app/desk/[sessionId]/(tabs)/index.tsx`) in parallel.
- The one heavy image left is Saar's full portrait (162 KB) for a 64 px circle (request 3).

**What fell away from the images:**
- Ada's and Nils's full 720×960 portraits, 287 KB together.
- They were fetched for 36 px face crops on the map, which mounts under the briefing for a moment before the briefing is pushed.
- Seen in the browser:
  - 0 portraits requested while the briefing is up.
  - After "Soruşturmaya başla" (map in front), the two load as before.

**After the first gesture:**
- Web fetches the 22 interface sounds: **276 KB** (was 1.74 MB).
- Entering the gallery scene fetched `gallery.m4a`, **201 KB** (was 1.7 MB WAV).

**Remaining first-screen weight I can't move:**
- The map's scene plate `gallery.webp`, 170 KB, rendered by a plain `<Image>` in `app/desk/[sessionId]/(tabs)/index.tsx`. See request 2.
- Saar's full portrait, 162 KB, used for a 64 px circle. See request 3.

## Audio: format and why

**AAC-LC in MP4 (`.m4a`)** is the one compressed format every target decodes natively:
- iOS: AVPlayer
- Android: Media3/MediaPlayer
- all browsers, including Safari

Alternatives:
- Ogg/Opus: smaller, but not playable by iOS outside Safari 17+.
- MP3: a browser `<audio>` element can't be told about its encoder delay.

MP4 records the AAC priming (1024 samples) and the tail padding in an edit list. So a decoded file has exactly the master's length and starts on its first sample.

Checked on the shipped bytes:
- **ffmpeg decode** (`encode.py`): Δ samples 0 and lag 0 for all 26 files.
- **Chrome**:
  - `decodeAudioData` gave 882000 / 793800 / 749700 / 1028442 samples for gallery / interview / quiet / workshop, equal to the masters.
  - 0 leading priming zeros.
  - The `<audio>` element reports `duration` 40 / 36 / 34 / 46.641 s.
  - `canPlayType('audio/mp4; codecs="mp4a.40.2"') = "probably"`.

**Encoder settings** (`scripts/sound/encode.py`, ffmpeg's built-in `aac`; free, no credits). Each file climbs a ladder of settings until its decoded result passes the checks.
- Room tones: 40 kb/s mono at 22.05 kHz.
- Interface sounds: 128 kb/s, `-aac_coder fast`, PNS off. All 22 pass on the first rung. Two encoder problems led to this setting:
  - The default coder's noise substitution turned `won` into 16 dB SNR with its true peak at **+0.4 dBTP**.
  - With PNS off, the default coder still overshot struck onsets by 2–2.6 dB (`confirmed` +1.1 dBTP at 96k, `verdict` +0.6 dBTP at 160k), and took 0.7 LU off `page`'s air grains.
- With the fast coder, the worst ΔLUFS is 0.22 (`page`) and the worst true-peak rise is +0.02 dB.

## `ear` measurements (masters vs shipped, `python scripts/sound/encode.py --md`)

How the numbers were made:
- Loudness and true peak come from `ear.loudness` (the BS.1770 code `ear` reports as `level`), run on the decoded files.
- The seam is measured on the **decoded** loop doubled end-to-start: `ear` events/onsets/defects within 0.25 s of the seam, plus the sample step vs the p99 step, plus the 50 ms RMS at the seam vs the median.
- The masters are unchanged, so L's per-profile `measure.py` table still holds for them.

| file | WAV KB | M4A KB | kb/s | Δ samples | lag | LUFS wav → m4a | dBTP wav → m4a | seam step / p99 | seam RMS dB (master → m4a) | seam events | result |
|---|---|---|---|---|---|---|---|---|---|---|---|
| rooms/gallery | 1723 | 201 | 40 | +0 | +0 | -34.53 → -34.58 | -16.6 → -16.8 | 0.09 | -0.23 → -0.20 | 0 | ok |
| rooms/interview | 1550 | 180 | 40 | +0 | +0 | -34.20 → -34.20 | -16.5 → -15.8 | 0.02 | +0.05 → -0.10 | 0 | ok |
| rooms/quiet | 1464 | 170 | 40 | +0 | +0 | -37.39 → -37.44 | -20.8 → -20.9 | 0.23 | +1.15 → +1.10 | 0 | ok |
| rooms/workshop | 2009 | 238 | 41 | +0 | +0 | -32.98 → -33.03 | -11.0 → -11.1 | 0.02 | -1.57 → -1.91 | 0 | ok |
| sfx/breakthrough | 121 | 19 | 102 | +0 | +0 | -15.00 → -15.00 | -1.7 → -1.7 | – | – | – | ok |
| sfx/confirmed | 146 | 21 | 94 | +0 | +0 | -14.81 → -14.81 | -1.5 → -1.6 | – | – | – | ok |
| sfx/day | 207 | 32 | 104 | +0 | +0 | -19.78 → -19.79 | -5.0 → -5.1 | – | – | – | ok |
| sfx/fact | 33 | 5 | 84 | +0 | +0 | -23.75 → -23.77 | -9.7 → -9.8 | – | – | – | ok |
| sfx/lab | 82 | 12 | 93 | +0 | +0 | -17.73 → -17.74 | -2.1 → -2.1 | – | – | – | ok |
| sfx/lost | 86 | 13 | 97 | +0 | +0 | -19.87 → -19.87 | -4.3 → -4.3 | – | – | – | ok |
| sfx/night | 207 | 33 | 107 | +0 | +0 | -19.83 → -19.83 | -3.6 → -3.6 | – | – | – | ok |
| sfx/page | 33 | 6 | 114 | +0 | +0 | -23.93 → -24.14 | -3.7 → -4.1 | – | – | – | ok |
| sfx/patience | 34 | 5 | 87 | +0 | +0 | -23.76 → -23.76 | -9.3 → -9.3 | – | – | – | ok |
| sfx/press | 22 | 4 | 78 | +0 | +0 | -23.64 → -23.65 | -10.0 → -10.1 | – | – | – | ok |
| sfx/resist | 26 | 4 | 77 | +0 | +0 | -23.79 → -23.79 | -7.4 → -7.4 | – | – | – | ok |
| sfx/retry | 24 | 4 | 75 | +0 | +0 | -25.77 → -25.77 | -13.1 → -13.1 | – | – | – | ok |
| sfx/star | 73 | 11 | 92 | +0 | +0 | -14.64 → -14.64 | -1.5 → -1.5 | – | – | – | ok |
| sfx/star_dim | 26 | 4 | 71 | +0 | +0 | -25.80 → -25.80 | -12.3 → -12.3 | – | – | – | ok |
| sfx/tool | 14 | 3 | 79 | +0 | +0 | -25.57 → -25.57 | -13.6 → -13.6 | – | – | – | ok |
| sfx/torch_off | 17 | 3 | 92 | +0 | +0 | -25.63 → -25.63 | -12.6 → -12.6 | – | – | – | ok |
| sfx/torch_on | 17 | 3 | 95 | +0 | +0 | -23.72 → -23.73 | -9.7 → -9.7 | – | – | – | ok |
| sfx/uv_on | 78 | 10 | 78 | +0 | +0 | -23.56 → -23.56 | -13.4 → -13.4 | – | – | – | ok |
| sfx/verdict | 198 | 34 | 117 | +0 | +0 | -14.73 → -14.73 | -1.4 → -1.4 | – | – | – | ok |
| sfx/verdict_bad | 207 | 31 | 101 | +0 | +0 | -19.77 → -19.78 | -1.7 → -1.7 | – | – | – | ok |
| sfx/won | 95 | 15 | 99 | +0 | +0 | -14.69 → -14.69 | -1.6 → -1.6 | – | – | – | ok |
| sfx/wrong | 34 | 5 | 81 | +0 | +0 | -23.69 → -23.69 | -11.7 → -11.7 | – | – | – | ok |

Totals: rooms WAV 6746 KB → M4A 791 KB (12 %); sfx 1780 KB → 276 KB (15 %).

What the table shows:
- **Loudness:** every shift is ≤ 0.05 LU, except `page` at −0.21 LU (air grains above 16 kHz; within the 0.3 LU gate).
- **Seams:**
  - Every seam step is 4–50× below the p99 step.
  - `ear` finds no event or defect at any seam.
  - Workshop's seam RMS (−1.9 dB vs median) is a property of the loop: the seam falls in the hush between two ticks, and the master measures −1.6 dB.

## Credits screen

- **Route:** `app/credits.tsx`, reached from Settings → İçerik / Content → "Künye ve lisanslar" / "Credits and licences".
- **Strings:** all in `src/i18n/credits.ts`, with its own `useCreditsT()` (current language, falling back to English). The shared `en.ts`/`tr.ts`/`index.ts` were not touched.
  - Turkish is written directly, with the informal *sen* that Settings uses.
  - Titles, authors and licences are data and are not translated.
- **Sections:**
  - **Interface sounds:** original.
  - **Each recording:** in TASL form: title, author, a licence link, a source link to Commons, the room it is used in, and "Değiştirildi / Modified".
  - **Typefaces:** Newsreader (Production Type, © 2020 The Newsreader Project Authors) and IBM Plex Sans/Mono (© IBM Corp.), both under SIL OFL 1.1 with links.
  - **Pictures:** made for Indicia with Google Flow's image model from our own briefs and finished by us; no other artist's work; the people and places are invented.
  - **Software:** a one-line note.
- **Checked in the browser:** TR and EN, full page.
- **Keeping it current:** `RECORDINGS` must stay in step with `assets/audio/CREDITS.md`. The `.md` now says so.

## Files changed

| Path | Change |
|---|---|
| `assets/audio/master/{sfx,rooms}/*.wav` | moved here from `assets/audio/{sfx,rooms}/` (masters, not bundled) |
| `assets/audio/{sfx,rooms}/*.m4a` | new shipped files (26) |
| `assets/audio/CREDITS.md` | `.m4a` + masters, pointer to the credits screen |
| `scripts/sound/encode.py` | new: encode masters → m4a (per-file settings ladder) + verify (length, lag, LUFS, true peak, loop seams, size); `--md` prints the table above |
| `scripts/sound/render-sfx.ts`, `build-rooms.py`, `measure.py` | write/read the masters folder |
| `src/sound/catalog.ts` | requires `.m4a` |
| `src/sound/engine.ts` | comments only |
| `src/art/components.tsx` | `useArtReady()`: web only, an image starts loading once its screen is in front (120 ms after focus, then latched); used by `PortraitPrint`, `FaceCrop`, `ArtBox`, `CoverCard`. Native unchanged |
| `app/credits.tsx`, `src/i18n/credits.ts` | new |
| `app/settings.tsx` | credits row |
| `assets/fonts/*.ttf` | new: 8 Latin + Turkish subsets |
| `scripts/subset-fonts.py`, `package.json` (`"fonts"` script) | new: builds and checks the subsets |
| `app/_layout.tsx` | font loading only: `require`s `assets/fonts/*` instead of `@expo-google-fonts` |

The art registry is unchanged.

**Workflow for a new sound:**
1. Render or build the master.
2. Run `python scripts/sound/measure.py`.
3. Run `python scripts/sound/encode.py`. It fails with exit 1 if any file breaks a check.

## Font subsets (done, coordinator-approved)

**Files**
- `scripts/subset-fonts.py` (`npm run fonts`) writes `assets/fonts/<Family_Weight>.ttf` from the `@expo-google-fonts` TTFs (SIL OFL 1.1 allows subsetting).
- `app/_layout.tsx` `require`s them under the same family names, so `src/theme/tokens.ts` is unchanged.
- The `@expo-google-fonts` packages stay installed as the source.

**What a subset keeps**
- Character ranges:
  - Latin, Latin-1, Latin Extended-A (Turkish)
  - U+0307
  - general punctuation
  - currency (U+20A0–20CF, so ₺ and €)
  - arrows, maths, technical symbols, box drawing, shapes, dingbats, where the font has them
- Hinting and all OpenType features are kept.

**Sizes**
- Raw: 116–213 KB → 81–88 KB per file.
- Gzipped, on the first screen: 648 → 347 KB.

**Coverage checks**
- The script fails if a subset loses any of `İşğüöçÇĞŞÖÜıâîû—–…“”‘’·•€` or ₺ that the source font had. All 8 pass, and all 8 have ₺.
- In headless Chrome (muted), each of the 8 loaded families was checked for `İşğüöçÇĞŞÖÜı—…“”’₺` with canvas metrics against two different fallbacks: every glyph comes from the subset font in all 8 families.
- Screenshots of the TR briefing (İlk Nöbet, İHBAR EDEN, Şubat, ş/ğ/ı, €, ’), the TR credits screen (“…”, ’, ç/ğ/ü/ş/ı, ·) and the EN credits screen render the same as before the switch.

**Native**
- Native builds bundle the smaller TTFs too, about 1.1 MB less app size.
- A character outside the ranges (a new language, an emoji) falls back to the system font. To support one, extend `UNICODES` in the script and run `npm run fonts`.

## Requests

1. ~~**Orchestrator: allow a font folder**~~ **Done** (see above). The original request is kept for the record:
   - Subset the 8 TTFs to Latin + Latin-1 + Latin Ext-A (Turkish) + punctuation, arrows and the symbols the app uses. Keep hinting and all OpenType features. Each file drops from 118–218 KB to 78–86 KB, and the 8 drop from 648 to 326 KB gzipped.
   - Put them in a new folder, e.g. `assets/fonts/`, and in `app/_layout.tsx` (mine) replace the `@expo-google-fonts` imports with `require('../assets/fonts/<Name>.ttf')`, keeping the same family names.
   - I built and measured exactly this in a scratch copy (**1454 KB first screen**). The briefing renders identically, including the Turkish İ/ş/ğ.
   - I did not write it into the repo because `assets/fonts/` is outside my files.
   - The command per font:
     ```
     python -m fontTools.subset node_modules/@expo-google-fonts/<pkg>/<weight>/<Name>.ttf --layout-features='*' \
       --unicodes="U+0000-017F,U+0192,U+02C6-02DC,U+0307,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2248,U+2260,U+2264-2265,U+22EE,U+2300-23FF,U+2500-25FF,U+2600-26FF,U+2700-27BF" \
       --output-file=assets/fonts/<Name>.ttf
     ```
   - Characters outside the ranges, such as a new language, would fall back to a system font. Server case text today uses nothing outside them (I scanned `server/`, `shared/`, `src/`, `app/`).
2. ~~**Owner of `app/desk/[sessionId]/(tabs)/index.tsx`: the map's `Where` plate**~~ **Done by the map owner** (seen in the final measurement). The original request:
   - It uses a plain `<Image>`, so it loads under the briefing on first launch.
   - `import { useArtReady } from '../../../../src/art/components'` and render the `<Image>` only when `useArtReady()` is true. That takes the first screen to about **1.28 MB** with request 1.
3. **Art (T / `npm run art`): small face crops.**
   - `FaceCrop` (22–64 px) loads the full 720×960 portrait (140–165 KB).
   - A 192 px face thumbnail per person (about 8 KB webp) in the manifest/registry, with `FaceCrop` preferring it, would save about 150 KB on the briefing (Saar) and about 1 MB across the people list. This changes registry generation, so it is not mine.

## Not verified / open

- **Native playback of `.m4a`:** iOS/Android and the native loop seam were not run. There is no device here, and `expo-audio` loops natively by seeking to 0. AAC in MP4 with an edit list is the standard gapless case on AVFoundation and Media3, but a phone should confirm that the workshop clock's tick-tock runs straight across the wrap.
- **Web `<audio loop>`:** the browser's own loop can leave a few ms at the wrap (as with the WAVs before). The file itself is sample-exact.
- **Listening:** nobody has listened. All numbers come from `ear`. The owner should A/B one reward cue (`verdict`) and the workshop loop, WAV master vs m4a, on headphones.
- Lazy art adds up to 120 ms before a picture starts loading on web screens. Not noticeable on the briefing (seen), but it applies to every screen that uses the art components.

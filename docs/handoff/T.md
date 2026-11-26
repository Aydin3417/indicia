# Handoff — Agent T · Art for "Ash and Glaze" / "Kül ve Sır" (wave 7) + face thumbnails

Every image in S-art.md now exists, plus small face thumbnails for every portrait in all three cases (R's request 3).
All of it was made in Google Flow with Nano Banana 2.1 in image mode, **0 credits on every generation**. No video, no
upscale, nothing paid. No commits. 8787/8140 untouched; my servers (API 8795 with `DATA_DIR=C:\temp\indicia-t`, web
8155, headless Chrome with `--mute-audio` and profile `C:\temp\indicia-t-chrome`) are stopped. My only Chrome tab is closed.

```text
npm run art    → 258 images → src/art/registry.ts (was 128; +83 Ash and Glaze, +47 face thumbnails)
npm run check  → typecheck ✓ · boundary ✓ · cases VALID · 118/118 tests
```

## 1 · What exists now (all in `assets/art/manifest.json`, EN/TR alt text)

| Set | Files | Key(s) | Notes |
|---|---|---|---|
| Suspects, 4 stages, 720×960 | `portraits/{selma,bram,oskar}/{composed,uneasy,strained,breaking}.webp` | `portraits.selma` … | Composed generated, then the Flow **edit chain** composed → uneasy → strained → breaking (same face, clothes, lamp). Tells on *breaking*: Selma both hands at her mouth, at the clay under her nails; Bram spinning his wedding ring; Oskar taking off his half-moon glasses. Burgundy: Selma's hair tie, Oskar's pocket square, Bram none (navy-grey jumper). 123–159 KB, like Kessler's. |
| Witnesses, 720×960 | `portraits/p-{agnes,ruth,holm,teo,kranz,nyberg}/portrait.webp` | `witnessPortraits.*` | S-art WHO lines (Kranz bald with white tufts, Nyberg in a navy gilet). Same painted scaffold as the Kessler set — drawn, aged, asymmetrical faces, not stock faces. |
| Room plates 2000×1640 + UV | `scenes/fennick/{studio,yard,office,club,kranz,house}{,-uv}.webp` | `scenes["fennick/<room>"]` | From code-made colour-block guides (places.ts plan + scenes.ts zones, every block named as an object). Zone overlay checked: every zone rectangle sits on its drawn object. UV = the established LUT (refit from P's four pixel-aligned Kessler pairs) → pixel-aligned by construction. Glows: **studio** only the `z-fy-trail` splashes (door → racks), **yard** only the `z-fy-path` drips (shed → Unit 4); the other four rooms neutral. Studio is grey, wet and sooty, no flames. |
| Close-ups 1024² | `closeups/fennick/<zone>.webp` × 29 | `closeUps["<zone id>"]` | Every zone in S-art's list. |
| Close-up UV variants | `closeups/fennick/{z-fy-backdoor,z-fy-trail,z-fy-shed,z-fy-path,z-hh-hall}-uv.webp` | `closeUps[zone].uv` | LUT(close-up) + only the case-fact glow: inside handle/latch; broken trail; drips under the shelf gap and out across the floor to the door; line of drips on cobbles; small splashes on right cuff and hem. |
| Evidence 768² | `evidence/fennick/{ev-cap,ev-matchbook,ev-battery,ev-kilnpots,ev-heater,ev-coat,ev-ashes,ev-kranzcard}.webp` | `evidence.*` | Off-white paper, 18–49 KB. The matchbook's cover scribble and the card's pencil are illegible. |
| Cover 900×1200 | `covers/fennick.webp` | `covers["fennick-yard"]` | Top ~40 % empty charcoal; rack of ash-grey pots, one amber beam, a thread of smoke. |
| Day reports 1080×784 | `reports/fennick-day{1,2,3}.webp` | `reports["fennick/<n>"]` | Day 1: the burnt door is **boarded with planks** rather than taped — the model wrote words on every tape. |
| Nights 1080×784 | `nights/fennick/{n1-teo,n1-kranz,n1-solicitor,n-day1,n2-salvage,n2-nyberg,n-day2}.webp` | `nights["fennick/<id>"]` | One per night event id in `v2.ts`. |
| **Face thumbnails** 192² (all cases) | `faces/<id>/<stage>.webp`, witnesses `faces/<id>/portrait.webp` | `faces[id][stage \| 'portrait']` (new registry export) | 47 files, ~9 KB each (Saar: 166 KB → 10 KB). Cropped exactly like `FaceCrop` (0.46 × width square round the face centre). |

Sizes: plates 185–330 KB (q74, Kessler plates are 155 KB avg; the yard/studio are busy), close-ups 125–208 KB (q74), UV
layers 50–150 KB, reports/nights 100–153 KB. The 83 new files total 11.1 MB on disk; only what a screen shows is fetched.

## 2 · Code changes (mine)

* `scripts/gen-art.mjs`: emits `export const faces: Record<string, Record<string, ArtImage>>` from `manifest.faces`.
* `src/art/registry.ts`: regenerated.
* `src/art/components.tsx` (R handed it over for this): `FaceCrop` uses `faces[id][stage ?? 'composed']` (falls back to
  composed, then a witness's `portrait`) whenever the circle is ≤ 96 px. Same lazy `useArtReady()` gate, same
  hairline/ring, the thumbnail fills the circle 1:1 (it is pre-cropped). Bigger circles and every `PortraitPrint` keep
  the full portrait. **Effect:** the briefing's 64 px victim circle drops from 162 KB to 10 KB (R's measured first screen
  was 1306 KB, so ≈ 1.15 MB); the people list / map / notebook / deduction chips drop ~140 KB per face. I did not
  re-run a production export to re-measure; the arithmetic is from the file sizes.

## 3 · Verified (`docs/screens/wave7/fennick/`, 375×812 @2x, EN + TR)

Sessions built in-process into my `DATA_DIR` (Plus granted to the test player, same as `playthrough.ts`), replaying the
ideal path to each place, so no "not at this place" banner. Shots:

* `scene-{studio,yard,office,club,kranz,house}-{en,tr}` — each plate under the torch, right place name, spots, clock.
* `scene-studio-uv-*`, `scene-yard-uv-*` — UV lamp: the yard shows the pale drips inside the UV window; the studio
  probe found the trail and opened the **Trail on the floor (UV)** close-up with its glowing variant.
* `closeup-{studio,yard,club,kranz}-*` — Drying racks (with the "point of the V" detail), Gutter (cap + matchbook),
  Seating plan, Kranz's back table. Office/house close-ups were already used up on the replayed path, so those shots
  show the plate only.
* `people-{en,tr}` — Selma (uneasy stage) and Bram portraits on the people tab. `hq-cases-en` — the new cover in the
  case list.

## 4 · Rejected / fixed

* Readable words inpainted (dark strokes in a small box): "Cloakroom" heading in the cloakroom book, "TAXI LOGBOOK" on
  the lectern, "Seating plan" header (2nd seating-plan draft, the 1st had readable names), "Seating plan" on the club
  plate's easel, "Insurance…" on the salvage clipboard. The club plate was also desaturated a little (red/green rooms).
* Day 1 report A/B both had police tape; kept the boarded-door version (no tape, no words).
* About a quarter of prompts failed with "unusual activity" (not charged); retried with the tile's retry button.
* Downloads: Chrome saved one file and one zip, then nothing more; the rest are full-resolution captures of the `=s0`
  originals drawn 1:1 on a canvas overlay (two tiles stitched, P's method). All candidates are in Flow project
  "Kas 26 - 10:41".

## 5 · Requests (files I don't own)

* **`src/art/index.ts` `FACE` table** (circle crops of the full portraits elsewhere, e.g. deduction): add the measured
  face centres — `selma: [0.6, 0.44], bram: [0.54, 0.38], oskar: [0.52, 0.41], 'p-agnes': [0.48, 0.39],
  'p-ruth': [0.5, 0.39], 'p-holm': [0.58, 0.39], 'p-teo': [0.5, 0.44], 'p-kranz': [0.54, 0.42], 'p-nyberg': [0.58, 0.38]`.
  The thumbnails already use these.
* **`src/art/index.ts` `EVIDENCE_FALLBACK`** for Ash and Glaze documents/testimony that have no picture (S.md's client
  request), e.g. `ev-gatelog → doc:access-log`, `ev-dvr → lab:digital`, `ev-lease`/`ev-contract → doc:contract`,
  `ev-codelist → doc:folder`, `ev-cloakbook`/`ev-taxibook → doc:ledger`, `ev-notice → zone:z-fy-backdoor`,
  `ev-burnpattern`/`ev-debris → zone:z-fy-racks`, `ev-shoeprint → zone:z-fy-slip`, `ev-loan → zone:z-hh-study`,
  `ev-kranz → zone:z-kr-table`. Without them those items fall back by kind.
* `nightArt()` looks up `nights["fennick/<night.id>"]` first; `DayReportView.night.id` exists in `shared/api.ts`, so
  the Ash and Glaze night pictures show wherever the server fills that id (not checked in a screenshot).
* Details `x/y` in `scenes.ts` were authored before the art; e.g. `d-fy-socket` (0.78, 0.32) is close to the drawn
  socket, `d-fy-handle` (0.30, 0.46) is a little below the drawn latch (≈ 0.27, 0.33). Worth a pass by the case owner.

## 6 · Tools (session scratchpad, not in the repo)

`guides.py` (layout guides), `uvlut_t.py` (refit the UV LUT from the Kessler pairs), `uvapply_t.py` (UV layers + glows),
`proc_t.py` (stitch captures, trim the paper border, inpaint words, resize/encode), `manifest_t.py` (manifest entries),
`faces_t.py` + `faces_extra.json` (thumbnails), `drive_t.mts` (sessions at each place), `shots_t.mjs` (muted headless
screenshots).

# Handoff — Agent M · Sanat 2 (wave 4)

Second art pass: aligned UV layers for every room, illustrations for the day reports and night events, generic
drawings for documents and lab results, and the night-fork choice card K asked for. All images were made in Google
Flow with Nano Banana 2.1 in image mode ("0 kredi" on every generation; no video, no upscale, nothing paid). No
commits, no branch changes. I did not touch `server/`, `shared/`, `src/i18n`, `src/feel`, `src/sound` or
`app/settings.tsx`; 8787/8140 untouched.

## Results (25 Nov 2026)

```powershell
npm run art            # 109 images → src/art/registry.ts (was 76)
npx tsc --noEmit       # clean
npm run check          # typecheck · boundary · both cases VALID · 86/86 tests
```

## What exists now (34 new or replaced files, all in `assets/art/manifest.json` with EN/TR alt text)

| Set | Count | Size | Path · manifest key |
|---|---|---|---|
| Room UV layers (office, vault, back, gallery) | 4 new | 2000×1640 | `scenes/kessler/{office,vault,back}-uv.webp`, `scenes/first-watch/gallery-uv.webp` · `scenes[key].uv` |
| Workshop UV layer | 1 replaced | 2000×1640 | `scenes/kessler/workshop-uv.webp` |
| Generic document drawings | 11 | 768² | `documents/{statement,phone-records,bank-record,access-log,workbook,ledger,contract,diary,pawn-ticket,device,folder}.webp` · `documents.<type>` |
| Generic lab drawings | 8 | 768² | `labs/{autopsy,serology,digital,anpr,instrument,financial,fingerprints,document}.webp` · `labs.<key>` |
| Day-report illustrations | 4 | 1080×784 | `reports/kessler-day{1,2,3}.webp`, `reports/first-watch-day1.webp` · `reports["kessler/1"]` … |
| Night-event illustrations (one per Kessler night event) | 6 | 1080×~780 | `nights/kessler/{n1-pawn,n1-pawn-known,n1-lawyer,n-day1,n2-ruben,n-day2}.webp` · `nights["kessler/<id>"]` |

First Watch has no night events (one night, no `nightEvents`), so it gets only its day-report picture (the museum on
the quay at dawn, one window still lit).

### UV: how alignment was fixed, and how it was verified

* H's workshop UV was not "a few pixels" off: it was the whole composition zoomed out ~7 % and shifted (edge
  correlation with the plate **0.08**). I registered it to the plate (SIFT + RANSAC homography + ECC; residual
  ≤ 0.3 px in all 16 tiles), learnt a colour LUT plate→UV from the aligned pair, and now build **every** UV layer
  as LUT(plate). They overlay their plates by construction: workshop edge correlation **0.95**, phase-correlation
  offset **0.0 px** in all 16 tiles. Checked by eye with a checkerboard blend and the case's zone shapes drawn on top
  (H's overlay method) for all five rooms.
* Glows that were not case facts are gone (mallet peg, bin rim, sparkles in the shavings, cyan body outline). The
  only glow left is a case fact: the switched-on UV lamp and a faint violet pool on the **empty cradle** (`d-lamp`).
  Office, back entrance and gallery are neutral (no UV facts there). The vault stays neutral too: the
  "Guadagnini" lies in a closed case in the plate, and its varnish glow (`d-varnish`) is already on the close-up UV
  variant.
* Honest note: the new UV layers are a regrade of the painted plates with the look H's Flow edit established, not new
  Flow paintings. A Flow edit cannot keep pixels, and pixel alignment was the requirement.

## Rejected, and why

| Candidate | Why |
|---|---|
| Statement B | Printed title "Police Witness Statement" readable |
| Access log A | Red spots that read as blood |
| Workbook A, diary A | Readable words ("violin maker's", weekday headers) |
| Printed email A and B (both) | "Dear…", "Sincerely", "@" and words readable → no email drawing; `ev-email` uses the folder |
| ANPR B | Burgundy spatter on the prints (reads as blood). ANPR A kept with three small dots inpainted |
| Financial B | "Bank Statement" heading readable. A kept with two "TOTAL" words inpainted |
| Pawn printout night A | Pseudo-letters in the header |
| Ruben night A | Notice boards with readable "NOTICE", "NOTICES BOARD" |
| Fingerprints A, handwriting A, autopsy A | Weaker; autopsy A had burgundy stains on the chart |
| First-batch serology / instrument / financial / folder / receipt / day 3 / museum | Generation failed ("unusual activity", not charged); regenerated except the **receipt** (dropped; `ev-anchor` uses the statement) |
| Old workshop UV | Misaligned (see above) and glows that are not facts; kept only as the source of the UV colour look |

## Where art and case still disagree, or cannot show it

1. **`labs/instrument`**: the violin shows a two-piece flamed back *with* f-holes, which a back would not have. It reads
   as "a violin under examination", which is all a generic lab drawing has to say, but a luthier would frown.
2. **Night id**: `DayReportView.night` has no `id`, so `nightArt()` recovers it from what the night carried (granted
   `ev-pawn` → pawn ping, or "pawn ticket comes in" when *The apprentice* was confirmed by then; `ev-anchor` → Ruben;
   day 1 without grants → "Clara calls a lawyer" when the title names Clara, else the night desk; day 2 → the
   prosecutor). It uses `night.id` first as soon as the server sends one. **Request to K:** add `id` to
   `DayReportView.night`.
3. **Night forks have no art of their own.** The fork card shows the night's illustration above it (they arrive on the
   same morning); when a night has a fork but no story event, the fork card carries the picture itself.
4. **K's four new places** (`kessler/varga`, `kessler/clara-flat`, `kessler/bank`, `kessler/pawn`) and their close-ups
   have **no art**: the code-drawn plans stay the fallback. The pawnshop exterior (`nights/kessler/n1-pawn-known`) is a
   good style reference for `kessler/pawn` when someone paints it.
5. Powder-layer variants and transparent evidence cut-outs (optional) were not done.

## Wired in

* **Scene (UV lamp)** — no code change needed: `SceneScreen`'s UV window already shows `plate.uv` inside the beam and
  fetches it only when the lamp is first picked. All five rooms now have a layer, so the indigo-wash fallback no
  longer appears in the shipped cases (it stays for new rooms). `ToolRail` tabs got `testID="tool-<name>"`.
* **Day report** (`app/desk/[sessionId]/report.tsx`): the day's illustration as a print under the title
  (`reportArt(caseKey, day)`), the night's illustration above the night text (`nightArt`), evidence thumbnails fall
  back to the generic drawings, and the **night-fork card** (below).
* **Night fork card** (new `src/features/night/ForkCard.tsx`, strings in `src/features/night/strings.ts`, EN + TR):
  question, both options side by side with their cost ("Costs 1 h tomorrow morning" / "Takes a lab slot: Swabs —
  Clara's Volvo, ready 12:00"), the server's consequence text, a "Choose this" button per option →
  `POST …/v2/night-choice { optionId }`, then a toast with `event.message`. The default option is marked "If you don't
  choose, this one happens". Once settled the card shows a "Decided" stamp, "Your call" on the chosen option and fades
  the other; non-leads in co-op see "The lead investigator makes this call." The live `view.fork` is used while it
  waits, `report.fork` in history.
* **Map tab** (`app/desk/[sessionId]/(tabs)/index.tsx`): while a fork waits, an amber "A decision is waiting from last
  night — Decide" row under the banner opens the report with the card (players who skip the report still get the
  choice). Finished lab results show a 48 pt drawing of their lab type (`labArt(analysisId, discipline)`).
* **Notebook** (`src/features/notebook/Notebook.tsx`): evidence thumbnails and the index card fall back to
  `itemArt(id, kind)` — the item's own picture, else its document/lab drawing, else the close-up of the spot it was
  found at (body, ladder, bow cabinet, front door, reader, courtyard). Generic drawings sit slightly smaller on the card.
* **Lookups** (`src/art/index.ts`): `docArt`, `itemArt`, `labArt`, `reportArt`, `nightArt`, `caseArtKey`. Unknown ids
  fall back by evidence kind (document → folder, testimony → statement, digital → phone, financial → bank record,
  footage → ANPR); physical objects without art keep the code box.
* **Preloading**: the day-end ledger fetches tonight's report illustration (one image) while the player reads it; the
  report screen fetches its night picture. Nothing is decoded ahead of the screen that shows it.
* `scripts/gen-art.mjs` emits `documents`, `labs`, `reports`, `nights`.

## Screenshots (`docs/screens/wave4/`, 375×812 @2x, headless Chrome against my own 8154/8795)

* before: `before-day-report-en`, `before-night-event-en`, `before-notebook-*-tr`, `before-scene-uv-*` (agent I's shots)
* after, EN and TR each: `report-day1-*-top|night|fork|decided`, `report-day1-history-*-fork`, `report-day2-*-top|night|fork`,
  `report-fw-*-top|night`, `map-fork-waiting-*`, `map-lab-results-*`, `notebook-evidence-*`,
  `notebook-generic-statement-*`, `notebook-generic-autopsy-*`, `scene-uv-{workshop,office,vault,back,gallery}-*`
* The scene shots show "You are not at this place right now." because the screenshot sessions were elsewhere; the UV
  window still renders the room's layer.

Servers stopped (8154 web, 8795 API with `C:\temp\indicia-m`), headless Chrome profile `C:\temp\indicia-m-chrome`.

## Production notes (for whoever resumes)

* Flow project "Kas 25 - 20:38" (`flow.google.com/project/80b71407-a029-4f4c-98a8-6f3aa4c86919`) holds every candidate.
* Scratch tools (session scratchpad, not in the repo): `register.py` (align a layer to its plate), `check.py`
  (checkerboard + zones), `uvgrade.py` (LUT UV layers), `proc.py` (trim, inpaint, resize), `manifest_m.py` (manifest).
  Their method is written up in `docs/ART_BIBLE.md` §8.
* Downloads: the row's "Toplu indir" zip works; after ~10 zips Chrome stopped saving files from Flow (I did not touch
  any site setting); the rest were saved as full-resolution captures of the `=s0` originals (see ART_BIBLE §8).
* Flow tabs freeze as background tabs, not only in a minimised window: keep the working tab active.

## Requests

* **K:** `id` on `DayReportView.night` (art lookup); optionally `id` on the fork's night so a fork can have its own
  picture.
* **Next art pass:** plates and close-ups for `kessler/varga`, `kessler/clara-flat`, `kessler/bank`, `kessler/pawn`;
  a receipt drawing and a non-readable email; a back-of-violin without f-holes for `labs/instrument`.

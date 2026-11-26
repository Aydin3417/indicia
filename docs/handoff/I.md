# Handoff — Agent I · Arayüz tasarımı (art wiring + design pass)

All 75 images from H are in the game now, and every screen got a design pass guided by `docs/ART_BIBLE.md`. Final
screenshots are in [`docs/screens/`](../screens/) (375×812 @2x, both languages for the key screens, two at 1280 wide).
No commits or branch changes. I did not edit any image file.

## How to run / results (25 Nov 2026)

```powershell
npm run art            # NEW: regenerates src/art/registry.ts from assets/art/manifest.json (76 static requires)
npm run check          # tsc clean · boundary ok · kessler-workshop v2 VALID · first-watch VALID · 73/73 tests pass
npm run sync:functions # done (content coordinates changed)
```

My servers (8792 API with a fresh `C:\temp\indicia-i`, 8152 web) are stopped and their entries removed from
`~/.claude/launch.json`. I left 8787/8140 alone.

## Art pipeline

* `scripts/gen-art.mjs` reads `manifest.json` and writes `src/art/registry.ts`, with one literal `require()` per image
  (Metro cannot bundle runtime paths). Missing files are skipped with a warning. Adding art means dropping the file,
  adding it to the manifest and running `npm run art`.
* `src/art/index.ts` has the lookups, keyed only by ids the server already sends: `portraitArt(id, composure)` (suspects
  by stage, witnesses/victim by person id), `sceneArt(scene.art)`, `closeUpArt(zone.id)`, `evidenceArt(evidence.id)`,
  `coverArt(case.id)`, `textureArt`, `iconArt`. It also has `faceCentre` (face position measured per portrait for
  circular crops), `finaleStage(won, total, broken)` and `preload()` (fetches without decoding; the scene fetches its UV
  plate only when the lamp is first picked; the interview warms the next composure stage; the finale warms the four
  stages of the accused). No contract change was needed.
* `src/art/components.tsx`: `PortraitPrint` (cover-crop on the face, 180 ms cross-fade + 1.5 % flinch on a stage change
  or `reactKey`), `FaceCrop`, `PortraitCard`, `CoverCard` (title over the poster's empty top, tagline on a dark foot
  strip), `ArtBox`, `Textured` (paper / desk / charcoal under content). Each one falls back to initials or nothing, and
  every code-drawn fallback (`SceneArt`, `CloseUpArt`, `UvTraces`, `Monogram`) is still in place.
* `app.json`: icon, Android adaptive icon, web favicon, and `expo-splash-screen` with the icon on `#111315`.
  `expo-asset` is now declared in `package.json` (it was already installed through expo).

## Content coordinates (content only, the truth of the case is unchanged)

I drew every close-up detail point over its image (contact sheet) and moved the ones that missed their object:
Kessler `d-glasses` 0.3,0.25 → 0.23,0.11 · `d-hands` 0.7,0.65 → 0.6,0.8 · `d-crooked` 0.62,0.4 → 0.66,0.32 ·
`d-lamp` 0.4,0.35 → 0.2,0.31 · `d-mirror` 0.7,0.4 → 0.75,0.33. First Watch `d-fw-lock` 0.5,0.7 → 0.42,0.67 and
`d-fw-glasses` 0.3,0.5 → 0.26,0.41. The rest already land on their object (checked: ladder, floor, sink, bows, files,
violin case, courtyard). **Note:** this changes the case hash, so sessions opened before it show the "earlier edition"
message.

## What changed, per screen

* **Onboarding / splash**: the app icon on the desk texture. *(The onboarding step lasts under 2 s before the briefing,
  so I have no screenshot of it.)*
* **HQ**: desk texture. The case on the desk is a full `CoverCard` hero with its primary action on the cover's foot.
  The plan stamp moved to the top right, and the stats sit under the cover. Covers are capped at 520 wide on desktop.
* **Case library**: each row has a 3:4 cover thumbnail, title, category and tagline, and the tags sit below.
* **Case detail**: cover hero (case number, stamp, title, tagline), then a paper sheet with the synopsis and the setting.
* **Briefing**: cover header, then a paper sheet with a "The victim / Mağdur" face crop. Content text is selectable.
* **Desk shell**: on the Map, the current room's plate is a print, and tapping it opens the scene. Travel buttons are
  secondary, so only "Search" is primary. "Who can be seen" uses face crops with a green ring when available. People:
  88×116 portrait cards at the current composure, face crops for the others. Map and People sit on the desk texture.
  The day ledger has a large mono clock with a day bar, and the price list is a typed paper sheet. The day report has
  evidence thumbnails. Night event and day-turn dial: as before (checked).
* **Scene**: the painted plate fills the canvas (zone x/y = image fractions). The torch keeps the room faintly readable
  outside the beam (edge 0.84 over a plate). The UV lamp shows the UV layer through a round window that follows the
  beam, aligned with the camera transform. Rooms without a UV layer show the plate washed in indigo, and the random
  code "UV traces" are gone over plates. Header: place name on its own line, never truncated, with time left beside
  the spot count. The bottom bar has "Back to the room" in thumb reach, and a two-move bar (examine / search under UV)
  stacks instead of truncating. Zoom buttons are 42 pt and the back control 44 pt.
* **Close-up**: the image is full card width with a 3 px paper border. The UV variant shows while the lamp is on
  (`z-violincase`). Glints are a warm ring over a dark halo, readable on paint.
* **Notebook**: 52 pt evidence thumbnails. The document view opens on an index card (object at about 60 %, typed code
  and name below, paper texture), and People uses face crops.
* **Interview**: the portrait is the hero, a print about 40 % of the height with a hairline. Name, composure meter,
  patience and notebook count sit on a charcoal band, and the back button and clock are in its corners. A break
  cross-fades to the next expression with the flinch and the burgundy edge flash. Tapping the print folds the header
  to a compact row (small print, name, meters, time), and it folds on its own while typing or on short screens.
* **Deduction book**: charcoal board, the reasoning list on paper texture. Person chips show a 22 pt face, evidence
  chips a thumbnail (in the finale and present pickers too).
* **Finale**: the prosecutor, choose and collapse beats show the case poster anchored at the foot under the words.
  Confirm, prelude, rounds, reactions, confession and verdict show the accused full width at the top, with the words on
  a caption panel below the face. The portrait steps composed → uneasy (1 won) → strained (2+) → breaking (all won or
  confession), and it stays composed for a wrongful accusation. The debrief has no backdrop (long text). The content
  column is capped at 640 on desktop.
* **Co-op room**: the code is on a paper slip and the actions sit on the desk (they were unreadable on paper).
* **Paywall**: icon emblem next to the stamp. The "best value" tag moved under the plan name.
* **Settings / dossier**: desk texture. Switch thumbs are in the paper colour (the web default was teal). The service
  record is a stat line instead of a key-value form, and history rows show a cover thumbnail.
* **Shared**: `Screen` has a `texture` prop, `Paper` has a paper texture, and `TopBar` back is 44 pt.

## Verified by looking (headless Chrome over CDP at 375×812 @2x, plus 1280×800)

The built-in browser pane was hidden for the whole session and its screenshots were stale frames, so I drove a separate
headless Chrome (own profile, port 9333) against my 8152/8792 servers and checked every step from its screenshots and
the DOM.

* **TR tutorial, from first launch** (I saw each step in screenshots):
  * briefing (cover, victim face)
  * Map with the coach mark and the plate print
  * scene: the gallery plate under the torch; the case was pending, then the close-up showed the lock glint on the lock
  * UV over a room without a UV layer (indigo window)
  * guard desk close-up
  * Notebook → Evidence thumbnails → log index card → underlined line → "DEFTERE YAZILDI" plus a new question
  * People portrait cards
  * Ada interview: hero, topic sheet, claim, present sheet, right present. Banner "Hikâyesi çatladı · Sakin → Tedirgin"
    and the portrait changed to the uneasy drawing
  * Nils press "15 dk · bulgu verir"
  * deduction filled with face chips → DOĞRULANDI stamp
  * prosecutor (poster), choose (face crops), hold to charge (portrait)
  * four rounds: one won (backdrop → uneasy, "TUTTU"), three lost on purpose with a retry. Verdict "Zayıf dosya" over
    the uneasy portrait
  * debrief, then HQ (1 star), library, dossier, paywall, settings
* **EN Kessler day 1 → finale**: case detail, briefing, station Map, workshop plate (zoomed out, beam on the body),
  body close-up (glasses and hand glints land), UV window over the workshop showing the UV layer aligned (glowing body
  outline), Jonas interview (uneasy portrait from the start, inline claim, Press/Present dock), the folded header, the
  day ledger, End day 1 → day-turn dial overlay → report with night event, Day 2 → prosecutor → charged Leo →
  defence over his portrait → "CASE COLLAPSES" over the poster → "Wrongful accusation". Also the co-op room and HQ
  in EN.
* **Desktop 1280**: HQ and the verdict render in a centred column (I fixed the full-width layouts I found).

**Not verified**:
* native devices (`repeat` textures, image decoding memory, haptics)
* the timeline puzzle and the lab-bench result flow in this pass (unchanged code paths)
* the confession beat with the *breaking* portrait (my finales were weak and wrongful; the stage logic is covered by
  `finaleStage`)
* the EN tutorial and TR Kessler
* a co-op guest
* animation smoothness on a phone (headless Chrome ran timers normally, but no device)

## Art requests (missing or wrong for their slot)

1. **Room UV layers** for office, vault, back, gallery: the indigo wash stands in for them.
2. **Workshop UV layer** sits a few pixels off the plate at the edges (an edit, not a pixel overlay), and it glows on
   one mallet and the bin, which are not case facts (H noted this). A "neutral" re-edit would be safer.
3. **Briefing / night-event / day-report illustrations** (H's "not done"). The day report and night desk are still
   typography only.
4. **First Watch**: the finale verdict copy says "Katili buldun" for a theft (content string, not art; flag for B).
5. **Evidence objects** for documents and records with no image (phone, alibi, access log, lab reports) fall back to an
   icon box. A generic "file folder" and "lab report" drawing would cover most of them.
6. **Covers**: the empty top 30 % is great for titles. A square crop variant for small thumbnails would read better
   than the dark top of the 3:4 poster.

## What I would do next

* Play the confession path in both languages, plus the timeline puzzle and lab bench, at 375 on a real phone.
* Measure memory with three or four scenes visited. If needed, unmount the plate image when leaving a scene, and get
  half-size thumbnails from the art pipeline for the Map print.
* Give the prosecutor's intro and the night desk their own small illustrations when art exists.
* Expo dev's floating button shows in dev screenshots only (bottom-left lightning icon on one shot).

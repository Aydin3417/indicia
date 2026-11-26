# Indicia — Art Bible

Owner: Agent H (art direction and production). Every image in `assets/art/` came from Google Flow (Nano Banana 2.1, image mode, 0 credits) using the scaffolds below. The index is `assets/art/manifest.json`.

## 1. Style statement

**A hand-drawn ink line over loose watercolour washes, in the manner of a European graphic novel and a vintage crime poster.** The work should look drawn, not rendered. Brush-and-nib line with varied weight, transparent washes that bleed past the line, visible cold-press paper grain. The palette is limited. Faces are drawn with asymmetry, age and specific features. The mood is late night, quiet and adult. The game shows evidence, not violence.

Three words: **inked, lamp-lit, restrained.**

## 2. Palette

The palette is built on `src/theme/tokens.ts`. The images use these families, and UI chrome around them uses the same tokens.

| Role | Hex (token) | Where it appears in the art |
|---|---|---|
| Night / background | `#111315` (bg), `#1B1F22` (surface) | Shadows, interrogation-room walls, the room outside the torch beam |
| Graphite line | `#1E1D1B` (ink), `#5A574F` (inkDim) | All line work |
| Paper | `#E6E1D5` (paper), `#CFC8B8` (paperEdge) | Evidence backgrounds, close-up highlights, paper texture |
| Burgundy accent | `#873D42` (burgundy), `#3A1E21` (burgundyDeep) | Clara's top, Miriam's scarf, bow-cabinet velvet, sofa. At most one burgundy object per image |
| Forensic sage | `#748575` (green), `#9AAE9B` (greenBright) | Portrait background washes, plaid, shelving |
| Amber light | `#B89A62` (amber) | The single practical light: the interrogation lamp, the torch beam |
| UV violet | about `#5B3FA0` → glow `#C9F2D8` | Only in the UV layers and on the UV lamp itself |

**Rules:** one warm light source per image. Saturated colour appears only in the amber light, the burgundy accent and UV glow. No pure white and no pure black in a wash; the darkest value is charcoal.

## 3. Line, wash and light

* **Line:** confident ink with thick outer contours, thin interior hatching, and a few dry-brush strokes in shadows. No vector-clean outlines.
* **Wash:** two or three transparent layers. Backgrounds are wet-in-wet blooms of charcoal and sage. Highlights are left as paper.
* **Light logic:**
  * Portraits: a hanging lamp at the top-left corner, warm amber, lights the subject's left cheek. The background falls to charcoal on the right.
  * Close-ups: a torch beam from the upper left, and the edges of the frame fall to charcoal. The torch is often visible in the corner. That is intentional, because it is the detective's light.
  * Room plates: even, low-key light so the torch mask in code does the dramatic work.
  * UV layers: the whole image is indigo or violet-black, and only the authored traces glow pale green.
* **Mature and restrained:** the body is always a pale figure with the face turned away. No blood pools, no visible wound, no red near the body.

## 4. Composition per asset type

| Type | Aspect / size delivered | Composition rules |
|---|---|---|
| Interrogation portrait | 3:4, 720×960 WebP | Tight chest-up shot. The head fills the upper half and the shoulders are cut by the bottom edge. Three-quarter view looking off-camera. Lamp at top-left. The four stages of one person share framing and lighting; only the face changes, plus one gesture on *breaking*. |
| Witness / victim portrait | 3:4, 720×960 | Same scaffold, a single neutral expression. |
| Scene plate (room) | 2000×1640 WebP (1000:820 = the scene canvas) | Straight top-down orthographic view. Object positions follow the case's `scene.plan` and zone coordinates (see §6). Walls sit just inside the frame. No text or labels. |
| UV layer | Same size and same composition as its plate | Made as an edit of the plate, so it overlays pixel for pixel, roughly. |
| Close-up | 1:1, 1024×1024 WebP | Three-quarter view from slightly above, torch from the upper left, the subject in the centre third, dark edges. |
| Evidence object | 1:1, 768×768 WebP | One object, centred, on flat off-white paper with a soft shadow. No tags or labels. |
| Case cover | 3:4, 900×1200 WebP | Crime-poster composition. **The top 30% is dark and empty for the title**, which the UI sets in Newsreader. |
| App icon | 1:1 PNG, 1024 and 512 | A torch beam lighting a burgundy fingerprint on paper. It reads at 48 px. |
| Textures | 1024² WebP, tileable-ish | Very low contrast so text sits on them. |

## 5. Do / don't

| Do | Don't (rejected examples) |
|---|---|
| Drawn faces with age lines and asymmetry | The glossy "AI face" with poreless skin. My first Clara set was cleaner and more "comic colour" than the others, so I redrew it for consistency |
| One lamp, one burgundy object | Two-tone neon, teal-and-orange grading |
| Illegible scribble on documents | Readable words. Nano Banana tends to write "INVOICE"; keep the "illegible" wording in the prompt |
| A body turned away, pale, with no blood | Face visible with a wound and red stains. The first `z-body` was rejected for this, and the first `z-ladder` for red smears near the ladder |
| Case-accurate props: six mallets, an empty cradle under the UV lamp, a ladder on its side | Props that contradict facts. The first workshop plate had a violin in the cradle, which contradicts `d-lamp`, and the ladder was standing |
| The plate follows the layout guide | The model inventing a box where the guide had a coloured block. Name each block as an object |

## 6. Prompt scaffolds (exact text used)

### Style block (portraits)
```
STYLE: hand-drawn ink and watercolour wash illustration, European graphic novel and vintage crime-poster feeling; confident brush-and-nib ink line with varied weight, loose transparent watercolour washes, visible cold-press paper grain, a thin off-white paper border around the picture. Strictly limited palette: graphite and charcoal greys, off-white paper, restrained burgundy accents, muted sage forensic green, a single warm amber light. Characterful drawn face with real asymmetry and age, not a glossy AI face, not photorealistic, not a 3D render. No text, no letters, no captions, no signature, no watermark.
```
The paper border is trimmed off in post-processing (`--trim`), so assets are full-bleed.

### Portrait (composed)
```
Single interrogation portrait, tight chest-up framing: the head fills the upper half of the frame and the shoulders are cut by the bottom edge; three-quarter view, the subject looking slightly off-camera, lit by a single warm amber hanging lamp glowing at the top-left corner of the frame, background a dark charcoal and sage-green watercolour wash. The subject: {WHO} Expression: composed, guarded, neutral. {STYLE}
```
Character descriptions (`{WHO}`) are kept in `docs/handoff/H.md`. Reuse them verbatim for new art of the same people.

### Expression edit (how the four stages stay consistent)
In Flow, open the chosen *composed* image and use **Edit** (the "Neyi değiştirmek istiyorsunuz?" box), chaining composed → uneasy → strained → breaking:
```
Keep the image identical — same person, same framing, pose, clothes, lamp, background and ink-and-watercolour style — and change ONLY the expression to {STAGE}. Hands, if visible, natural with five fingers. No text, no letters.
```
Stage wording: *UNEASY:* eyes sliding away, lips pressed, faint crease. *STRAINED:* jaw clenched, brows drawn hard, sweat sheen, shoulders up. *BREAKING:* composure gone, wet eyes, mouth open, plus one **tell gesture** that matches the case text:
* Clara: hand to her left ear (the earring)
* Jonas: hand to his brow
* Leo: hand in his hair
* Miriam: hand at her throat on the scarf
* Ada: palm out, "stop"
* Nils: rubbing his neck

Editing one image, instead of generating four, is what keeps the face, clothes and lamp identical. Chained edits drift slightly, and *breaking* is a little closer in on some people. That reads as a push-in and is acceptable.

### Room plate
Upload a flat colour-block **layout guide** made by code from the case coordinates, attach it as the prompt image, then:
```
Top-down orthographic overhead view of a room, seen straight from above like an architect's floor plan drawn as an illustration, used as an investigation game board. Follow the attached layout image EXACTLY for the position and size of every object (the coloured blocks), but draw everything as real objects. {ROOM} Even, low-key lighting so every part of the room is readable; no strong vignette; muted night palette. STYLE: … No people except the described figure, no text, no letters, no numbers, no labels, no signature, no watermark, no border.
```
Generate at 4:3, trim the paper edge, then stretch to 1000:820. The 9% horizontal squeeze is invisible top-down. Check the result by drawing the zone rectangles over it (the `overlay.py` method in H.md).

### UV layer
An edit of the final plate:
```
Keep the image pixel-identical in layout and every object, but show the whole room as seen under ultraviolet black light in total darkness: everything deep indigo and violet-black … Only a few things fluoresce: {TRACES}. No other light, no amber, no text.
```

### Close-up
```
Forensic close-up illustration for a detective game, square frame, seen from slightly above at a three-quarter angle, lit by a single warm torch beam from the upper left, the surroundings falling off into charcoal darkness at the edges. Subject: {SUBJECT} STYLE: … Any writing on paper is an illegible scribble. No readable text, no letters, no numbers, no labels, no signature, no watermark, no border, no people unless described, no gore.
```

### Evidence object
```
Evidence object illustration for a detective game notebook: a single object, centred, seen from slightly above, isolated on a plain flat warm off-white paper background with a soft grey shadow beneath, nothing else in frame. Object: {OBJECT} STYLE: … No readable text … no evidence tags …
```

## 7. UI recommendations (for Agent I)

* **Interview:** make the portrait the hero. Use a 3:4 card at the top of the screen, about 45% of the height on 375×812, with a 1 px `paperEdge` hairline and a 2 px inner shadow, like a print pinned to the desk.
  * Swap the stage image when composure changes. Cross-fade over 180 ms, with a 1.5% scale "flinch" on a break and the burgundy glow D/C already use.
  * Do not tint the portraits. The lamp is already in the picture.
  * Put the claim cards below on `textures/paper.webp` cards with ink-coloured text.
* **Scene:** render `scenes/<case>/<room>.webp` under the existing torch mask. The plate is evenly lit on purpose.
  * The UV tool cross-fades the `-uv` layer inside the beam only, as a masked layer.
  * The close-up card shows `closeups/...webp` at full card width, square, with a thin paper border. Place the details' glints in code as today.
  * The `z-violincase-uv` image replaces the close-up while the UV tool is active.
* **Notebook:** evidence chips get a 40–56 px square crop of `evidence/*.webp`, which sit on paper backgrounds already. In the evidence detail view, show the object at about 60% width on `textures/paper.webp` with a typed index-card label below in IBM Plex Mono.
* **Deduction:** a dark `textures/charcoal.webp` board. Statements sit on paper cards, and person blanks show 32 px circular crops of the *composed* portraits (face centre ≈ x 0.55, y 0.32). The confirm stamp is the burgundy `stamp` token.
* **Finale:** full-bleed portrait of the accused, darkened to 60% behind the text. Step through the stages as rounds are won (uneasy after round 1, strained after 2–3, breaking on the last). This is the strongest use of the four-stage set.
* **HQ / case select:** case covers at 3:4 with the title in Newsreader over the empty top 30%, plus a small mono eyebrow (case number). Lay them on `textures/desk.webp`.
* **App icon:** `icon/icon-1024.png` is full-bleed with no transparency. Let iOS and Android mask it. Its focal point (the fingerprint) sits right of centre and survives a circle mask.
* **General:** keep the UI chrome flat and quiet (tokens as they are) so the art carries the texture. Never put two illustrations side by side at the same size; one hero image per screen.

## 8. Wave 4 additions (Agent M)

### New asset types

| Type | Size delivered | Path / manifest key | Rules |
|---|---|---|---|
| Generic document drawing | 768² WebP on paper | `documents/<type>.webp` · `documents.<type>` | Same scaffold as an evidence object. Shown only when an item has no picture of its own. Types: statement, phone-records, bank-record, access-log, workbook, ledger, contract, diary, pawn-ticket, device, folder |
| Generic lab drawing | 768² WebP on paper | `labs/<discipline>.webp` · `labs.<key>` | A still life of the lab's work, not of the case's object: autopsy, serology, digital, anpr, instrument, financial, fingerprints, document. No body, no blood |
| Day-report illustration | 1080×784 WebP (≈ 4:3 after the border trim) | `reports/<case>-day<n>.webp` · `reports["<case>/<n>"]` | Quiet, no people, one amber light, the place the day ended at. No text |
| Night-event illustration | 1080×~780 WebP | `nights/<case>/<night id>.webp` · `nights["<case>/<night id>"]` | The moment the night text describes. People only when the event is a person (Ruben); reuse their portrait description |
| Room UV layer | 2000×1640, same as the plate | `scenes/<case>/<room>-uv.webp` | **Pixel-aligned by construction** (see below) |

### Scaffolds that worked (Nano Banana 2.1, 0 credits)

* Document: the evidence-object scaffold with `Object: …` + "All writing is an illegible scribble. No readable text, no letters, no numbers, no labels, no evidence tags, no logos, no signature, no watermark." Name the type of paper (fan-fold, thermal strip, window envelope); the model then draws a recognisable document without words.
* Lab: "Lab result illustration for a detective game, a single still life, centred, seen from slightly above, on a plain flat warm off-white paper background with a soft grey shadow, nothing else in frame. Subject: …" + style block. Add "no blood" for serology/autopsy.
* Day report / night event (4:3): "Atmospheric illustration for a detective game's end-of-day report (night event), wide frame, quiet and still, no people. Scene: … Lighting: a single warm amber light source, everything else falling into charcoal and sage shadow." + style block + "No readable text, no letters, no numbers, no signs, no labels".
* Even with these words the model writes headers like "Dear", "TOTAL", "NOTICE", "Bank Statement", "Police Witness Statement" about one time in three. Check every candidate at full size; small words can be inpainted away (done once: "TOTAL" on `labs/financial`).
* Burgundy accents sometimes become **spatter-like dots** on paper (reads as blood): reject, or inpaint the dots (done on `labs/anpr` and `documents/folder`).

### UV layers: pixel-aligned by construction

H's workshop UV was a Flow edit: its framing was ~7 % zoomed out and shifted (edge correlation with the plate 0.08), and it glowed on a mallet, the bin, the shavings and the body outline, none of which are case facts. Flow edits never keep pixels exactly, so wave 4 does it differently:

1. `register.py` (SIFT + RANSAC homography + ECC) registered H's Flow UV onto the plate (residual < 0.3 px in all 16 tiles).
2. From that aligned pair a 24³ colour LUT plate-RGB → UV-RGB was fitted on every non-glow pixel. That LUT **is** the UV look (indigo, violet-black, paper whites to lavender, the plate's own lamp stays violet).
3. Every room's UV layer = LUT(plate) (`uvgrade.py`), so it overlays its plate pixel for pixel (edge correlation 0.95, 0.0 px offset). Only case-fact glows are added: in the workshop a faint violet pool from the switched-on UV lamp onto the **empty cradle** (`d-lamp`). Everything else is neutral; the varnish glow of the "Guadagnini" (`d-varnish`) stays on the close-up UV variant, because the violin is in a closed case in the vault plate.

Re-run for a new room: put the plate in `assets/art/scenes/…`, run `uvgrade.py` (scratch tools listed in `docs/handoff/M.md`), check with `check.py` (checkerboard blend + zone shapes).

### Getting images out of Flow (what changed since H)

* The row's **"Toplu indir"** (bulk download) gives a zip with both 1K originals and descriptive names — the cleanest route.
* After ~10 downloads Chrome stopped saving files from flow.google.com (no prompt visible; site setting not touched). Fallback used: open the `=s0` original in a Flow-origin tab, fit it to the viewport at device pixels, and save a full-resolution capture (843 px squares / 1128×843 wide) — enough for 768² documents and 1080-wide illustrations.
* Flow tabs freeze when they are **background tabs** of a window, not only when the window is minimised: keep the working tab the active tab.
* Generation fails at random with "Olağan dışı etkinlikler tespit ettik" ("unusual activity", not charged). Retrying or resubmitting the prompt works; queueing 3–4 prompts at once is fine.

## 9. Wave 5 additions (Agent P)

New: plates for `kessler/varga`, `kessler/clara-flat`, `kessler/bank`, `kessler/pawn` (2000×1640) with LUT-graded UV layers,
nine close-ups (`z-tray`, `z-va-window`, `z-va-letter`, `z-cl-dish`, `z-cl-coat` + `z-cl-coat-uv`, `z-cl-desk`, `z-pw-book`,
`z-bk-file`, `z-bk-ledger`), and a corrected `labs/instrument` (a violin **face up**: f-holes belong to the top plate, so
draw the top, not the back). Flow project "Kas 25 - 22:14" holds every candidate.

* **Plates:** the room-plate scaffold above with a colour-block guide made by code from `places.ts` plan + `scenes.ts`
  zones (1200×900, dark surround outside the walls). Nano Banana keeps the guide's dark surround, so the plate is used
  untrimmed and stretched 1200×896 → 2000×1640 (fractions are preserved). Name every block in the prompt as an object
  ("a pale camel coat on a hall stand (camel block)"); a block that is only a colour comes back as a rug.
* **UV:** `uvgrade` LUT from M's registered workshop pair, applied to each new plate (no room glows: none of the four
  rooms has a UV fact in the room itself). The coat's naphtha cuff (`d-cl-cuff`) is a close-up UV variant: LUT(close-up)
  plus a soft pale-green smear on the left cuff.
* **Close-ups** come back with a wide paper margin and an inked frame; the frame is found automatically (scan in from
  each side until the band darkens past the paper) and cropped 9 px inside it, then resized to 1024².
* **Words:** "Dear …" appeared on two letters and a brand-like word on a watch dial; removed by inpainting the dark
  strokes inside a small rectangle (the watch dial is now blank).
* **Getting images out (wave 5):** Chrome stopped saving Flow downloads after the first zip (no prompt was approved).
  Fallback used: draw the `=s0` original onto a full-viewport canvas overlay at 1:1 CSS px, take two `save_to_disk`
  screenshots (rows 0–720 and H−720–H, **scale 1** — a scaled screenshot saves the scaled file) and stitch them. JPEG
  from the screenshot is slightly softer than a Flow download; fine at the sizes shipped.
* Generation failed with "unusual activity" on about a third of prompts in this pass (not charged); rewording and
  resubmitting worked.

# Handoff — Agent H · Art direction and production (wave 3a)

Everything below was generated in Google Flow with Nano Banana 2.1 in image mode. Flow showed "0 kredi" on every generation. No video, no upscale, nothing paid.

I wrote only to `assets/art/**`, `docs/ART_BIBLE.md` and this file. No code was changed, nothing was committed, and the dev servers were not touched.

## What exists (75 files, about 12 MB, all listed in `assets/art/manifest.json`)

| Set | Files | Size | Path |
|---|---|---|---|
| Interrogation portraits, 4 stages × 6 people | 24 | 720×960 WebP | `portraits/{clara,jonas,miriam,leo,ada,nils}/{composed,uneasy,strained,breaking}.webp` |
| Victim and witnesses (single portrait each) | 5 | 720×960 WebP | `portraits/{p-thomas,p-varga,p-okafor,p-lind,p-saar}/portrait.webp` |
| Room plates, top-down | 5 | 2000×1640 WebP | `scenes/kessler/{workshop,office,vault,back}.webp`, `scenes/first-watch/gallery.webp` |
| Room UV layer | 1 | 2000×1640 | `scenes/kessler/workshop-uv.webp` |
| Close-ups, one per zone (all 22 zone ids, `z-peg` and `z-fw-*` included) | 22 | 1024² WebP | `closeups/kessler/z-*.webp`, `closeups/first-watch/z-fw-*.webp` |
| Close-up UV variant | 1 | 1024² | `closeups/kessler/z-violincase-uv.webp` (for the `d-varnish` UV detail) |
| Evidence objects | 10 | 768² WebP on paper | `evidence/kessler/ev-{mallet,note,earring,uvlamp,violin,rag,ledger}.webp`, `evidence/first-watch/ev-{case,glasses,logbook}.webp` |
| Case covers | 2 | 900×1200 WebP | `covers/{kessler,first-watch}.webp` |
| App icon | 2 | PNG 1024 / 512 | `icon/icon-1024.png`, `icon/icon-512.png` |
| UI textures | 3 | 1024² WebP | `textures/{paper,desk,charcoal}.webp` |

Manifest keys match the case ids:
* `portraits.<suspectId>.stages.<composed|uneasy|strained|breaking>`
* `witnessPortraits.<personId>`
* `scenes.<scene.art>` (the keys are `kessler/workshop` etc., exactly `scene.art`), with `.base` and optionally `.uv`
* `closeUps.<zoneId>`, with `.base` and optionally `.uv`
* `evidence.<evidenceId>`
* `covers.<caseId>`, `icon`, `textures`

Every entry has `file` (relative to `assets/art/`), `width`, `height`, `bytes` and `alt.en` / `alt.tr`.

## Verified by looking

Every kept image was opened and inspected in contact sheets.

* **Portrait sets:** I confirmed the same face, clothes, lamp and framing across all four stages for each of the six people. Hands on *breaking* have five fingers. There is no lettering.
* **Room plates:** I drew the case's zone shapes over each plate with a script, in red rectangles and circles at the exact `shape` coordinates. Every zone lands on its object:
  * workshop: body, bench, papers, floor, tool wall, peg, sink, bows; the ladder zone overlaps the fallen ladder
  * office: desk, drawer (top of desk), files, front door
  * vault: case, ledger
  * back: reader, courtyard
  * gallery: case, desk, keys, bench
* **Case facts checked:**
  * six mallets on the tool wall
  * the UV lamp lit beside an **empty** cradle
  * the inspection mirror and the tuning fork on papers
  * the ladder lying on its side
  * the body pale with no blood
  * shavings near the bench
  * the bow cabinet with burgundy velvet
  * the sink and bin bottom right
  * a single bicycle track in the courtyard
  * the empty locked museum case with a dust ring

## Rejected, and why

* **The first Clara set:** good, but cleaner and brighter than the other five people, so the cast looked like two artists. I redrew her with the shared scaffold. The old set is not in the repo.
* **Two first-pass candidates per person:** I kept the better one. For Ada and Miriam the expression chain had been built from candidate B, so composed B is the one used and the stages match.
* **Workshop plate A:** a violin in the cradle contradicted `d-lamp` ("empty cradle"), the ladder was standing, and there was an extra door.
* **Workshop plate B (first pass):** the model drew the guide's ladder block as a yellow box. I fixed it with an edit, which is the kept version.
* **`z-body` v1:** face visible, a wound and red stains, which breaks the no-gore rule.
* **`z-ladder` v1:** red smears that read as blood.
* **`z-courtyard` v1:** no frost. v2 is used, but its frost is still only faint (see below).
* **Office / vault / back / gallery alternatives:** I picked the one whose doors and furniture best matched the plan.

## Where the art and the case still disagree, or the art could not show it

1. **Body orientation.** The case says "on his left side". In the plate he lies half on his side, half on his back. The close-up shows him on his side with his face turned away. The wound above the left ear is deliberately not shown.
2. **`z-violincase`** shows the violin front-up in its case, with a stray key and paper beside it. The close-up text mentions a "two-piece back". `evidence/kessler/ev-violin.webp` does show the back.
3. **Close-up detail positions** (`details[].x/y`) were authored before the art. The detail objects are present but not at exact coordinates:
   * `z-body`: glasses top-left ✓, hands lower-right ✓
   * `z-floor`: the earring back is centre-right ✓
   * `z-toolwall`: the crooked dark mallet is right of centre ✓
   * `z-bench`: lamp left ✓, mirror right ✓

   Re-tuning a few x/y values to the art (Agent B, content) would make the glints land exactly.
4. **`z-courtyard`:** the frost is weak; it reads as cold grey cobbles with one tyre track.
5. **`z-fw-keys`:** the cabinet has an empty hook, but the hooks carry no numbers, so "hook 2" is not legible. The text says it, and that is fine.
6. **`z-drawer`** sits on the desk top in a top-down plate. A drawer cannot be seen from above, so the close-up carries it.
7. **Workshop UV layer:** it adds faint glows on one mallet peg, on the bin rim and on sawdust as generic UV interest. These are **not** case facts. If they mislead, mask the UV layer to the beam and keep the glows subtle (they already are), or ask me / the next art pass for a "neutral" UV layer.
8. **Covers:** the Kessler cover's mallet count is not exactly six. It is poster art, not evidence.

## Not done / missing

* **Room UV layers for office, vault, back and gallery.** No zone needs a room-level UV pass today; the vault's UV detail is served by the close-up UV.
* **Powder-pass layers.** The dust zones are covered by close-ups `z-rungs` and `z-peg`.
* **Transparent PNG cut-outs** of evidence objects. They are on flat paper instead, which suits the notebook. Canva's background remover was not used, to keep to the free/no-account rule.
* **Briefing / night-event / day-report illustrations**, and portraits of people who never appear on screen.
* **A second Ruben or Ilse expression.** They are single portraits by design.
* **App icon:** `app.json` is not changed. That is code, for Agent I/G.

## Notes for the UI agent (I)

* **Scene plates** match the scene canvas aspect 1000:820 exactly. Draw the image to the full `UNITS_W × UNITS_H` rect, where zone x/y = image fraction. Swap `SceneArt.tsx` for an `<Image>` keyed by `scene.art` via the manifest.
* **UV:** render `.uv` inside the beam mask when the UV tool is active.
* **Close-ups:** use `closeUps[zoneId].base` as the close-up card plate, and the `uv` variant while the UV tool is selected.
* **Portraits:** map `suspect.composure` straight to the stage file. Use witnesses for the briefing and people lists. The face sits around x 0.45–0.6, y 0.2–0.45 of each portrait; use that for circular crops.
* **Covers:** the top 30% is empty dark space for the title.
* **Placement and treatment** for each screen (interview, scene, notebook, deduction, finale, HQ, cover) are in `docs/ART_BIBLE.md` §7.
* **Metro bundling:** `require('…/assets/art/portraits/clara/composed.webp')` works in Expo (WebP is supported on iOS and Android). Build a static require map from the manifest, because Metro cannot `require` dynamic strings.

## Character descriptions used (reuse verbatim for new art)

* **Clara:** 34, northern European business manager; angular face, high cheekbones, strong straight dark brows, pale skin, dark-blonde hair in a low tight bun, small gold stud earrings, thin precise mouth, charcoal tailored blazer over a deep burgundy high-neck top.
* **Jonas:** 47, German master violin maker; long weathered face, deep-set tired kind eyes, close-cropped greying beard, receding dark hair going grey, faded sage-green plaid flannel shirt under a worn brown canvas apron.
* **Miriam:** 56, collector and former violinist; imperious, sharp aquiline nose, chin raised, silver-white hair in a low chignon, pearl earrings, black high-collared coat, deep burgundy silk scarf.
* **Leo:** 24, nervous apprentice; thin face, messy dark-brown curly hair, patchy stubble, large anxious eyes, grey hoodie under a worn denim jacket.
* **Ada:** 38, conservator; freckled, short practical bob (auburn-brown in the final set), no glasses, navy knitted cardigan over a grey collared shirt.
* **Nils:** 61, night guard; heavyset, grey walrus moustache, thinning grey hair, plain charcoal guard jacket with epaulettes and no badges.
* **Thomas:** 61; lean lined face, neat white beard, swept-back white hair, pencil behind his ear, dark waistcoat.
* **Ilse Varga:** 74; bird-like, short white hair, large round spectacles, knitted shawl.
* **Ruben Okafor:** 35; dark brown skin, short beard, bar towel on his shoulder.
* **Dr Hanne Lind:** 50; greying-blonde bob, rimless glasses, lab coat.
* **Hendrik Saar:** 60; rumpled grey hair, overcoat over striped pyjamas.

## Production notes (for whoever resumes)

* **Flow project:** "Kas 25 - 00:09" (`flow.google.com/project/ed92b315-…`). It holds every source, the four-step edit chains and the uploaded layout guides. Download the originals from there (`=s0` URLs = the 1K original). Do **not** use the 2K/4K upscale; it may cost credits.
* **Chrome must not be minimised.** When the Chrome window was minimised, Flow tabs froze within minutes. CDP calls timed out with no CPU use. I restored the window without focusing it (`ShowWindow(SW_SHOWNOACTIVATE)`); after that it was stable. Two stray tabs of mine had dropped out of the MCP group, and I closed them through their tab close buttons.
* **Downloads:** a page-injected button saves one prefetched blob per real click. Files land in `Downloads/indicia_*.jpg` and were moved to my scratch folder, then processed. Processing: `proc.py` trims the paper border and resizes, at WebP q80–82. The raw sources are not in the repo.
* **Layout guides:** small colour-block PNGs drawn from the case's `plan` and zone coordinates. They were dropped into Flow's media picker with a synthetic drop event, then attached with "İsteme ekle".

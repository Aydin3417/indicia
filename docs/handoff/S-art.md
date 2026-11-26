# Art request — "Ash and Glaze" / "Kül ve Sır" (`fennick-yard`) — for Agent T

Nothing below exists yet; every lookup falls back today (monogram portraits, code-drawn plans, generic document
drawings by evidence kind, typographic day reports). I did **not** touch `assets/art/manifest.json`: add the entries when
the files exist and run `npm run art` (it regenerates `src/art/registry.ts`).

Use the scaffolds in `docs/ART_BIBLE.md` §6 verbatim ({STYLE} = the style block; portraits = "Portrait (composed)"
then the expression-edit chain; plates = the room-plate scaffold with a colour-block layout guide made from
`server/cases/fennick/places.ts` (plan) + `scenes.ts` (zone shapes); UV = `uvgrade.py` LUT of the plate plus only the
glows listed). Palette rule: one amber light, at most one burgundy object per image. The case is a fire: **soot, ash and
buckled metal, never flames, never a person in the fire**. Burnt rooms are drawn the morning after, grey and wet.

## Keys and sizes

| Kind | Key (registry) | File | Size |
|---|---|---|---|
| Portrait × 4 stages | `selma`, `bram`, `oskar` | `portraits/<id>/{composed,uneasy,strained,breaking}.webp` | 720×960 |
| Witness portrait | `p-agnes`, `p-ruth`, `p-holm`, `p-teo`, `p-kranz`, `p-nyberg` | `portraits/<id>/portrait.webp` | 720×960 |
| Scene plate + UV | `fennick/studio`, `fennick/yard`, `fennick/office`, `fennick/club`, `fennick/kranz`, `fennick/house` | `scenes/fennick/<room>.webp`, `-uv.webp` | 2000×1640 |
| Close-up (by zone id) | see list | `closeups/fennick/<zone>.webp` (+ `-uv` where noted) | 1024² |
| Evidence object | see list | `evidence/fennick/<id>.webp` | 768² |
| Cover | `fennick-yard` | `covers/fennick.webp` | 900×1200 |
| Day report | `fennick/1`, `fennick/2`, `fennick/3` | `reports/fennick-day<n>.webp` | 1080×784 |
| Night event | `fennick/<night id>` | `nights/fennick/<id>.webp` | 1080×~784 |

## Portraits (WHO descriptions — reuse verbatim for all four stages)

* **selma** — "a 29-year-old Turkish woman from İzmir, dark curly hair piled up and held with a pencil through the bun,
  strong eyebrows, small gold hoop earrings, a faded sage-green work shirt under a clay-streaked canvas apron, a small
  old burn scar on the back of her left hand; tired eyes from a night without sleep". Burgundy: a hair tie.
  Tell gesture (*breaking*): **picking at the clay under her thumbnail, hands near her mouth**.
* **bram** — "a 37-year-old Dutch-looking man, tall and soft-featured, sandy hair thinning at the temples, three days of
  stubble, a good grey wool jumper worn through at the cuffs, a wedding ring". Burgundy: none (a navy jumper is fine).
  Tell gesture: **spinning his wedding ring**.
* **oskar** — "a 58-year-old Scandinavian landlord, silver hair combed straight back, a trimmed grey moustache,
  heavy-lidded pale eyes, a dark wool overcoat over a white dress shirt with the collar open, half-moon reading glasses
  in the breast pocket; genial, used to being liked". Burgundy: a folded pocket square. Tell gesture: **taking off his
  glasses**.
* Witnesses (single neutral portrait): **p-agnes** "a 66-year-old potter, tall, short white hair, a man's denim shirt,
  clay under her fingernails, fierce and exhausted" · **p-ruth** "a 52-year-old night baker, flour on her forearms, hair
  under a white cap, kind and sharp" · **p-holm** "a fire investigator in his sixties, weathered face, soot on his
  shirt cuffs, a reflective jacket folded over one shoulder" · **p-teo** "a doorman in his forties, Portuguese, peaked
  cap, dark greatcoat with brass buttons" · **p-kranz** "a 70-year-old antiques dealer, a jeweller's loupe on a cord, a
  moth-eaten cardigan, a sly smile" · **p-nyberg** "a 50-year-old property developer, rimless glasses, quilted gilet
  over a crisp shirt".

## Scene plates (top-down; object positions = the zone rectangles in `scenes.ts`)

* **fennick/studio** — "a long whitewashed pottery studio the morning after a fire: the right-hand end (drying racks)
  black with soot, three buckled steel racks with forty small grey ash shapes, a sharp V of soot on the wall behind;
  a big front-loading electric kiln top-left with blistered paint on its right side; a glaze bench along the top wall
  with a smoke alarm on the ceiling above it (cover hanging open); an old oil-filled radiator heater pushed against the
  racks; shelves of pale unglazed pots marked with chalk crosses on the left wall, one shelf with a gap; a sink corner
  bottom-right with buckets of clay; a steel back door at the bottom centre with pale dried clay slip on the floor
  inside it; wet floor, puddles from the hoses". UV glows: **only the trail** — a broken pale-green line of splashes
  from the back door (0.50, 0.82) to the foot of the racks (0.72, 0.50), following the `z-fy-trail` polygon.
* **fennick/yard** — "a cobbled courtyard ringed by small brick workshops, wet from fire hoses: an iron gate with a
  keypad on the left wall and a small camera on a bracket above it, a bakery with one lit window top-left, a two-storey
  office over the gate top-centre, a small brick shed with a padlock bottom-left, Unit 4's soot-blackened back door on
  the right, a drain gutter running along its wall". UV glows: **only the drips** from the shed door to Unit 4's back
  door (`z-fy-path` polygon).
* **fennick/office** — "a landlord's small office: a grey camera recorder box under the window top-right, a glass-fronted
  key cabinet top-left, a heavy oak desk centre with a locked drawer, a wall of box files bottom-left". UV: none.
* **fennick/club** — "a gentlemen's club at night after a dinner: a cloakroom with numbered brass hooks top-left, a long
  mahogany bar along the top, a seating plan on an easel in the middle, a narrow corridor with a bench left of centre, a
  doorman's lectern by the front door bottom-left; old ship portraits on the walls". UV: none.
* **fennick/kranz** — "a narrow antiques shop crammed with clocks, china and frames; a back room with a card table, two
  glasses, a receipt book and a small door-camera screen; a wooden crate of straw-packed pots on the floor". UV: none.
* **fennick/house** — "a tidy white villa seen from above: an entrance hall with a coat stand (one long dark overcoat)
  and a shoe rack with one gap, a study with a desk and bank letters under a brass weight, a garage with a dark saloon
  car, a garden going down to the water with a galvanised incinerator". UV: none in the plate (the coat is a close-up UV
  variant).

## Close-ups (`closeups/fennick/<zone id>.webp`, Close-up scaffold)

| Zone | Subject |
|---|---|
| `z-fy-racks` | buckled steel drying racks, forty small grey ash ghosts of pots, a sharp V of soot on the wall rising from floor level, charred straw underneath |
| `z-fy-kiln` | a front-loading electric kiln, door shut, paint blistered on one side; a small controller panel with a blank display; inside glimpse of six small celadon vessels |
| `z-fy-heater` | an old oil-filled radiator heater scorched on one side, dial turned to maximum, its plug in a wall socket whose own rocker switch is in the off position |
| `z-fy-alarm` | a ceiling smoke alarm with its cover hanging open, empty battery slot with clean bright contacts |
| `z-fy-backdoor` (+ `-uv`: the inside handle glows pale green) | a steel back door from inside, intact lock, a typed notice taped to it (illegible) |
| `z-fy-shelves` | shelves of pale pots each marked with a chalk cross; one clean rectangle in the dust where a crate stood |
| `z-fy-sink` | a pottery sink corner with buckets of reclaimed clay and a broom; four clean footprints of a heavy object in the clay dust |
| `z-fy-slip` | dried clay slip on a concrete floor dusted with grey fingerprint powder, showing smooth leather shoe prints with a ring of heel nails |
| `z-fy-trail` (+ `-uv`) | wet floor between a door and a rack; UV variant: a broken trail of pale-green splashes |
| `z-fy-gate` | an iron gate keypad with its controller box open, a curling paper printout hanging out (illegible) |
| `z-fy-camera` | a small security camera on a bracket, its cable running up to a window |
| `z-fy-gutter` | a drain grating full of black water, a half-melted red bottle cap and a soaked paper matchbook with an anchor on the cover caught in it |
| `z-fy-shed` (+ `-uv`: fresh drips glow below the gap) | inside a brick shed: salt bags, a ladder, a bench with a 9-volt battery wrapped in tape, a shelf of six red-capped one-litre bottles with one gap |
| `z-fy-path` (+ `-uv`) | wet cobbles; UV variant: a line of pale drips crossing them |
| `z-ho-recorder` | a grey security recorder box under a window, one cable |
| `z-ho-keys` | a glass-fronted key cabinet with labelled hooks, every key present |
| `z-ho-desk` | an opened desk drawer: a blue folder with a contract and a handwritten list clipped behind (illegible) |
| `z-ho-files` | a row of box files, one thick one pulled out, a pencil inside it |
| `z-hc-cloak` | numbered brass coat hooks and an open cloakroom book on a counter |
| `z-hc-bar` | a mahogany bar, a bowl of paper matchbooks with anchors, a spike of bar tabs |
| `z-hc-plan` | a dinner seating plan on an easel (names illegible) |
| `z-hc-corridor` | a quiet panelled corridor, a bench, a small router blinking on a shelf |
| `z-hc-door` | a doorman's lectern with a taxi book, a radio and an umbrella stand |
| `z-kr-table` | a card table with two glasses, a receipt book and a small door-camera monitor |
| `z-kr-crate` | a wooden crate of straw with newspaper-wrapped pots, one unwrapped showing a chalk cross |
| `z-hh-hall` (+ `-uv`: small pale-green splashes on the right cuff and the hem) | a long dark wool overcoat on a hall stand, a shoe rack below with one empty space |
| `z-hh-study` | a desk with bank letters squared under a brass weight (illegible) |
| `z-hh-garage` | a dark saloon car in a tidy garage, a film of dust on the bonnet |
| `z-hh-garden` | a galvanised garden incinerator full of ash and leaves, the charred heel of a leather shoe with a ring of nails showing |

## Evidence objects (`evidence/fennick/<id>.webp`, evidence-object scaffold)

`ev-cap` (a half-melted red screw cap) · `ev-matchbook` (a soaked paper matchbook, an anchor on the cover, three
matches torn out) · `ev-battery` (a 9-volt battery with a strip of masking tape, scribbled, illegible) · `ev-kilnpots`
(six small celadon stoneware vessels) · `ev-heater` (an old oil-filled radiator, one side scorched) · `ev-coat` (a long
dark wool overcoat on a hanger) · `ev-ashes` (an evidence tin of grey ash with a charred shoe heel) · `ev-kranzcard` (a
dealer's business card, pencil on the back, illegible). Documents and testimony can stay on the generic drawings (see
the client request in `docs/handoff/S.md`).

## Cover, reports, nights

* **Cover** `fennick-yard`: crime-poster composition, top 30 % dark and empty: "a potter's drying rack in silhouette,
  rows of small pots turned to grey ash, a single amber torch beam across them, a thin line of pale smoke".
* **Reports**: `fennick/1` "a cobbled yard at dusk, a sooty back door taped off, wet cobbles, one lit bakery window" ·
  `fennick/2` "a detective's desk at night, a gate printout and a cloakroom ticket under the lamp" · `fennick/3` "a
  salvage lorry waiting at an iron gate at first light".
* **Nights**: `n1-teo` "a doorman's packed suitcase by a small kitchen table at night, a peaked cap on top" ·
  `n1-kranz` "a carrier bag on the station front desk with a wrapped pot peeking out" · `n1-solicitor` "a desk phone
  just put down beside a solicitor's card" · `n-day1` "a note propped on an empty desk, a fire investigator's sealed
  evidence tins beside it" · `n2-salvage` "an old oil heater on a trestle in a wet yard at dawn, an insurer's clipboard beside it" · `n2-nyberg` "a
  property developer's glossy brochure of harbour flats on a night desk" · `n-day2` "the prosecutor's office at night,
  three case files and a receiver off the hook".

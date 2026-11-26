# Handoff — Agent B · İçerik (wave 2)

## Summary

* **Kessler Workshop is final and bilingual** (`meta.contentStatus: 'final'`, validator: `missingTr=0`). Every player-facing string is `{ en, tr }`; Turkish was written per voice (Clara formal/precise, Jonas slow/plain, Miriam imperious with "Komiser", Leo rambling with "yani/şey/pardon"; police/forensic register for documents). Truth (killer, timeline, evidence texts, what each suspect knows) is unchanged.
* **Time economy:** ideal path **815 / 1440 min = 57 %** (limit 65 %, target ≈60 %), exhaustive **2070 min = 144 %** (target ≈140 %). The ideal path ends in a 3-star confession on day 3 at 08:00.
* **10 deductions**, 60 claim cards, 81 facts, 18 zones (2 hidden dust zones), 5 night events, a 13-step hint ladder.
* **Tutorial "İlk Nöbet / First Watch"** (`id: 'first-watch'`): one scene, two people, one deduction, one present, four-round mini finale; ideal 170/300 min, 3 stars.
* **Scripted end-to-end playthroughs pass for both cases in both locales** over the real HTTP API, with a check that no view carries a content string of the other language.
* **`npm run check` does not pass**: 7 engine tests pinned the wave-1 *draft* fixture (exact minutes, draft status, counts). Verified fix: `server/content/engine-test-fixture-fixes.patch` (see "Engine requests"). Also `tsc` currently fails in `src/features/deduction/DeductionBook.tsx` (another agent's file, in progress).

## Files (all mine)

| File | What |
|---|---|
| `server/cases/text.ts` | `L(en, tr)` helper |
| `server/cases/kessler.ts` | assembles the case (base + `withV2`) — still exports `kessler`, version 2 |
| `server/cases/kessler/meta.ts` | meta, briefing, truth, people |
| `server/cases/kessler/{clara,jonas,miriam,leo}.ts` | suspects, topics, tier lines (bilingual), TR keywords for free questions, TR guarded terms |
| `server/cases/kessler/places.ts` | locations, plans, v1 hotspots |
| `server/cases/kessler/evidence.ts` | evidence; document bodies carry fact markup **inline in both languages** (the old `marks` overlay is gone) |
| `server/cases/kessler/records.ts` | lab analyses incl. `v2` delays/warrants, statements, contradictions, answer key, hint ladder |
| `server/cases/kessler/facts.ts`, `scenes.ts`, `claims.ts`, `deductions.ts`, `v2.ts` | v2 layer: facts, scenes, claim cards, deductions, clock/availability/finale/nights/ideal path |
| `server/cases/kessler.v2.ts` | **deleted** (replaced by the files above) |
| `server/cases/first-watch.ts` | tutorial case (inline v2) |
| `server/cases/index.ts` | registers `[kessler, firstWatch]` (Kessler first — `/cases[0]` is asserted by a test); exports `TUTORIAL_CASE_ID` |
| `server/content/playthrough.ts` | dev check: both cases × both locales through the HTTP app, in-process |
| `server/content/engine-test-fixture-fixes.patch` | proposed test updates (verified) |

## Kessler — design

### Day shape (ideal run)
* **Day 1 (475/480 min)** — scene, doors, first lies. Phone (120) → access log (180) → violin exam (360) in one lab slot; ANPR (240) → mallet (240) in the other. Jonas is only there **until 12:00**, Leo only **from 12:00**: the morning is a race to get the phone log before Jonas leaves. Autopsy (300) does not fit day 1 — a real slot decision.
* **Day 2 (340)** — Miriam **mornings only** (with her lawyer): she learns her violin is a copy. Office (diary, accounts, Miriam's notice). Back to the workshop (sink rag, bow slot). Jonas **from 12:00**: the copy, his workbook. Clara: the loan. Finance warrant (240) runs overnight.
* **Day 3** — the Halberd money, the motive, the prosecutor.

### Gates (what makes the 57 % necessary)
* `a-cctv` locked until **d-not-fall** ("murder inquiry, not a fall"); `a-violin` locked until **d-varnish**; `a-finance` until **d-copy** (unchanged); `a-ledger` until **d-timeline**; `a-earring` until **d-entry**.
* `z-papers` (the note) appears only after the bench is inspected (`requires ev-uvlamp`).
* Hidden dust zones: `z-rungs` (upper rungs — the cheap way to beat the fall theory) and `z-peg` (wiped mallet peg).
* Locked topics opened by deductions: `jonas:t-tools` (d-weapon), `miriam:t-clara` (d-motive), `leo:t-copy` (d-leo), `jonas:t-clara` (d-alibi), `miriam:t-late-call` (d-miriam).
* Wrong-but-plausible lines cost real time: Leo (bow, courtyard, pawn lab 180) and Miriam (shouting woman, Jaguar) — but each also holds one true piece (Leo saw Thomas at the UV lamp; Miriam is the owner who never agreed to a sale), so chasing them is not pure waste.
* Proof star raised to **all 10 deductions** (`finale.stars.proofDeductions: 1`) — an airtight case accounts for every other person in the building.

### Deductions (10) — each needs facts from 2–3 sources, each confirm opens something
| id | needs (sources) | opens |
|---|---|---|
| d-not-fall *(1 blank, kept for tests)* | rungs dust **or** autopsy | `analysis:a-cctv` |
| d-varnish | ledger 21:40 (vault) + Leo as witness (interview press) + UV glow (vault, tool) + note brand | `analysis:a-violin` |
| d-copy | visible with copy report + Jonas's workbook + Miriam's shock + "no exhibition" (Jonas press); fills choice/maker/client | `analysis:a-finance` |
| d-entry | access log 23:04 + ANPR car | `analysis:a-earring` |
| d-timeline (6 cards, 1 lie) | ANPR exits (Jaguar, cyclist — the Jaguar exit is a *plain* phrase to notice), text, fob, thump, last exit, Jonas's admission, Clara's 23:15 story | `analysis:a-ledger` |
| d-weapon | choice + autopsy wound + mallet serology + sink rag | `topic:jonas:t-tools` |
| d-motive | Halberd record + Clara's own loan admission + Miriam's notice (drawer or Miriam press) | `topic:miriam:t-clara` |
| d-leo | fob 21:58 + "why" choice (needs bow slot seen) + ANPR/door exit | `topic:leo:t-copy` |
| d-alibi | card 23:12 + walking distance | `topic:jonas:t-clara` |
| d-miriam | diary booking + front door 22:12 (plain phrase) + Jaguar out | `topic:miriam:t-late-call` |

Person blanks accept any of 8 people and every wrong filing costs 30 min, so guessing is expensive. Turkish prompts never attach a case suffix to a blank (vowel harmony would break with the filled value): they use "Kim: {who}; saat {time}" forms.

Finale rounds are checked against them: opportunity ← d-timeline (assist d-timeline, d-entry); lie ← the 22:55 text; motive ← d-motive; means ← d-weapon / serology; staging ← d-not-fall.

### Claims (60 cards)
Every tier is split into claim cards (the four "Thomas" relationship topics stay one card each — Miriam's is pinned by a test). Press lines on breakable claims carry a **tell** at the breaking point (Clara answers before the question ends / names "six" mallets nobody mentioned / hand goes to her left ear; Jonas turns a glass that isn't there; Leo uses far too many words; Miriam "already did the sum"). Break moments open with a stage direction in both languages. Presses that yield facts: `f-clara-six`, `f-no-exhibition`, `f-miriam-notice`, Leo's UV sighting (advance), Miriam's sighting (advance).
Tempting wrong presents exist by design: the shouting woman (f-shout-2200) against Clara's alibi, Clara's 2:40 call length against "dinner", her car *arriving* against "I left at 23:15", the clean hands (now explicitly "suggestive, not proof") against the ladder. Resists: the workbook against "ask Jonas" until the Halberd record is held (pinned text "notebook"); the time of death against "I left at 23:15" until the timeline is confirmed.

### Nights and hints
* After day 1 (first match wins): **pawn registry ping** (if the bow slot was seen — grants the pawn record and nudges you at Leo), **Clara hires a lawyer** (if her visit is admitted), fallback **night desk** (lab runs overnight; Miriam mornings only).
* After day 2: **Ruben walks in** (if Jonas named him — grants the verified alibi, freeing a lab slot) or fallback **the prosecutor calls**.
* Hint ladder (45 min each) ordered by urgency: body → phone first → dust the rungs → access log early → Jonas before noon → the note → what Thomas found → Clara + door log → the owner (mornings) → send finance now → motive → go to the prosecutor → lab-planning fallback.

## Tutorial — First Watch / İlk Nöbet
Night shift 02:00–07:00 (300 min), starts in Gallery 2. Order taught: torch the case and the guard's desk → tap the underlined log line (`f-lund-0110`) → press Nils ("bag folded flat… left heavy") → present the log line to Ada's "home all night" (break) → file `d-fw-who` (who/time/proof) → find the glasses, key register, email → 4-round confrontation (there / glasses lie / key / motive). A theft; nobody is hurt. Validator warns "doing everything fits in the budget" (82 %) — intentional for a tutorial.

## Commands and final output

`npx tsx scripts/validate-cases.ts`
```
■ kessler-workshop v2 — VALID
  ... v2.facts=81  v2.zones=18  v2.claims=60  v2.deductions=10  v2.budgetMinutes=1440  v2.idealSpent=815  v2.idealElapsed=960  v2.exhaustiveSpent=2070  v2.missingTr=0
■ first-watch v1 — VALID
  ... v2.facts=7  v2.zones=4  v2.claims=6  v2.deductions=1  v2.budgetMinutes=300  v2.idealSpent=170  v2.idealElapsed=170  v2.exhaustiveSpent=245  v2.missingTr=0
  ! doing everything takes only 245 of 300 minutes: time is not scarce
```
`npm run simulate:budget`
```
■ kessler-workshop — ideal 815 min (57%), elapsed 960, finale: confession, stars {truth,proof,clock all true}; per day 475 · 340 · 0
                     exhaustive 2070 min (144%); reached 81/81 facts, 10/10 deductions, 18 zones
■ first-watch      — ideal 170 min (57%), confession 3★; exhaustive 245 min (82%)
```
`npx tsx server/content/playthrough.ts`
```
■ kessler-workshop [en] 115 requests · confession · 3★ · breaks 9 · deductions 10/10 · nights 2 · spent 815/1440 min · left 480
■ kessler-workshop [tr] 115 requests · confession · 3★ · breaks 9 · deductions 10/10 · nights 2 · spent 815/1440 min · left 480
■ first-watch [en] 23 requests · confession · 3★ · breaks 1 · deductions 1/1 · nights 0 · spent 170/300 min · left 130
■ first-watch [tr] 23 requests · confession · 3★ · breaks 1 · deductions 1/1 · nights 0 · spent 170/300 min · left 130
```
(no cross-language leaks reported)

`node --import tsx --test server/engine/*.test.ts` → **52 pass, 7 fail** (47, 48, 49, 50, 51, 52, 54 — all fixture pins, below). With the patch applied to scratch copies of `v2.test.ts` + `v2api.test.ts`: **34/34 pass**.
`check:boundary` ok. `tsc`: no errors in `server/` or `shared/`; 2 errors in `src/features/deduction/DeductionBook.tsx` (not mine).
Manual: API on port 8801 with a scratch `DATA_DIR`; `/cases` in TR, First Watch inspect → collect → interview → press → present in TR all correct; process stopped. 8787/8140 untouched.

## Engine requests

1. **Update 7 engine tests that pin the wave-1 draft** (`server/content/engine-test-fixture-fixes.patch`, verified): `broken()` starts from a draft copy (tests add plain-string facts); the 65 % test pads only the last day and matches any number instead of exactly 1220 min; the i18n test strips Turkish itself instead of relying on a draft case; the markup test uses `tx(body[0], 'en')` (the line is bilingual now); the HTTP e2e derives break/deduction counts from the ideal path instead of 4/6.
2. **Timeline cards are sorted by id in the view** (`projection.ts`): with ids `k1…k6` (pinned by the timeline test) the displayed order *is* the solution. Please sort by a stable hash (e.g. of `caseId + cardId`) so ids can stay readable. Until then Kessler's timeline gives itself away in the UI.
3. **Contract request — tutorial flag**: add `meta.tutorial?: boolean` → `CaseSummary.tutorial`. Today the client must match the id `'first-watch'` (`TUTORIAL_CASE_ID` in `server/cases/index.ts`, which the app cannot import).
4. Nice to have: a per-night-event `requires` with negation ("has not done X") would allow better redirect events; today only the first matching event fires, so conditional ones are ordered before the fallback.

## Not done / unsure
* Ideal is 57 %, not exactly 60 %. Pushing further would need padding (e.g. requiring Clara's own sale confession on day 3); I preferred not to.
* **Fun risks**: (a) d-varnish requires Leo as the witness — a player who never interviews Leo cannot get the violin examined (hint `h-varnish` points there). (b) Miriam is only available mornings on days 2–3 and the copy deduction needs her reaction — missing day-2 morning pushes the finance warrant late. (c) Day 1 is very tight (475/480 for a perfect player); normal players will not finish all of it, which is intended but should be playtested. (d) Person blanks are brute-forceable at 30 min a try.
* 81 facts is more than the plan's ~45; many are claim/press facts. Notebook UI may need grouping (`about` is set).
* Art keys for scenes: `kessler/workshop|office|vault|back`, `first-watch/gallery` (new zones `z-peg`, `z-fw-*` need plates).

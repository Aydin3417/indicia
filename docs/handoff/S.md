# Handoff — Agent S · Third case (wave 7)

Goal: a third v2 case in Kessler's format, as good or better, with a crime other than murder or theft; full TR + EN
(Turkish written natively); valid; ideal ≈ 60 %, exhaustive ≈ 130 %; registered and playable; PLAYTEST_V4 §7 item 6
content fixes; tests. Files written: `server/**`, `shared/api.ts`, `docs/CONTRACT_V2.md` (§16), `docs/handoff/S.md`,
`docs/handoff/S-art.md`. Nothing under `app/`, `src/`, `assets/` (the manifest is untouched — art requests are in
`S-art.md`). No server started; 8787/8140 untouched. No commits.

## The case (no spoilers)

**“Ash and Glaze” / “Kül ve Sır”** (`fennick-yard`, HCID 41-1004) — an **arson**. *Kül ve Sır* is a double meaning
in Turkish: *sır* is both “glaze” and “secret”.

At 01:58 on a Saturday the night baker of Fennick Yard, Hallstedt's old harbour, calls in a fire at Unit 4: the
drying room of the potter Agnes Vos, where forty pieces for her Kunsthalle exhibition stood. Nobody is hurt. The crew
blames the kiln that was still hot when they arrived; their own investigator will not sign it. Three people had a
reason to be at the yard that night: **Selma Aydın** (29, her assistant from İzmir), **Bram Vos** (37, her son, who
raised the insurance in August) and **Oskar Dahl** (58, the landlord). Saturday, Sunday, Monday — the insurer's salvage
crew clears the room on Monday morning.

* 3 days × 7 game hours (09:00–16:00), 1260 minutes. Detective Plus (`meta.tier: 'plus'`, PLAN_V2 §4).
* 6 places: the studio (9 zones incl. a dust and a UV trace), the yard (5 incl. a UV trace and a shed that opens with a
  deduction), the yard office (4, two behind a warrant), the Harbour Club (5, travel 45), Kranz Antiques (2, opens once
  Bram names the dealer, travel 45), Dahl's house (4, warrant, travel 45). 29 zones, 28 details.
* 3 suspects, 17 topics, 36 claim cards; patience 4 / 5 / 3. Every breakable claim has a free “tell” in its press line.
* 87 facts, 32 evidence items, 8 lab jobs (two only through night forks), 12 deductions (one timeline with 7 cards, one
  set aside), 5 story nights + 2 night forks, a 5-round confrontation, a confession.
* Everything is crime-aware: the server's verdict line says “the one who set the fire”, never “killer”/“thief”.

## Spoilers (the truth)

<details><summary>Who, how, why</summary>

**Oskar Dahl** set the fire. He signed a conditional sale of the yard to Norrhavn Living (€4.2 M, only with every unit
empty by 31 December; his €1.9 M bridging loan falls due the same day). Agnes had nine years left and had laughed at his
€40 k buy-out; clause 14.2 of her lease lets the landlord end it if fire makes the studio unusable. On Friday afternoon,
in a “safety inspection”, he took the smoke-alarm battery (it ends up in his padlocked shed) and asked Selma whether
anyone works at weekends. At the Harbour Club dinner he paused the yard recorder from his phone at 01:00, took his coat
at 01:08, refused a car, walked to the yard (camera 01:31), opened the gate with the Unit 4 code he had set himself
(01:36), took lamp oil from his shed, let himself in with his master key, dragged the old heater to the racks and
plugged it in — not noticing the socket's wall switch was off — poured the oil from the door to the straw and lit it
with a club match (cap and matchbook end in the gutter). Out at 01:44. Next morning he books the salvage crew; that
night he burns his shoes.

**The two who lied for smaller reasons.** Selma came back at 21:15 to fire six pots for a prize in Agnes's kiln
(programme ends 00:55) and dried them with the banned heater — she put it back unplugged in its corner at 00:40 and
believes she may have caused the fire. Bram came at 23:18 for a crate of his mother's rejects to sell to a dealer (at
Kranz's 00:20–02:05); he and Selma saw each other and agreed to say nothing. Dahl's slip: he knows about “six little
pots for some prize” — only someone who stood at the glaze bench after 00:40 could (Selma's prize form lay there).

**Core chain:** Where it began (the V under the racks, not the kiln) → What fed it (UV trail + the lamp-oil cap → the
shed opens) → The heater that never ran (Selma's admission + the off switch) → Who had the code (the landlord resets
them all) → The night at Fennick Yard (timeline; the outlier is Dahl's taxi) → warrants (desk, files, house) → The motive.
Side and innocent questions: The kiln's secret (Selma), The son's crate (Bram), The silent alarm, The walk from the
club, The blind camera, The shoes.

**Finale rounds** (accused Dahl): opportunity (taxi → `d-timeline` / `d-walk` / `d-shoes` / his slip), lie (“not inside
for months” → the inspection notice), motive (`d-motive`, Norrhavn, clause 14.2, the loan, Nyberg's “by Monday”), means
(“the shed is open to all” → `d-oil`, `d-alarm`, the shed key), staging (“that heater was a bomb” → `d-staged`, the off
switch, the heater lab, his pre-dated warning letter). Wrong culprit: Bram (van out 23:53, Kranz's door camera) and
Selma (bicycle 00:44, kiln ended cleanly) each collapse the case with their alibi.

**Night forks.** After day 1 (once *Where it began* is confirmed): *The doorman's early flight* — knock on his door
tonight (60 min → the doorman's statement: Dahl left on foot at 01:10) or let the airport police take it (a lab line
until ~13:00). After day 2 (once the heater is shown staged): *The adjuster wants the heater* (the salvage crew clears the
room at 16:00 on Monday) — be at the yard at seven (60 min → the heater test now, plus the salvage order Dahl booked at
07:55 on Saturday) or let Holm send the heater to your lab (a line until ~11:00). Neither option's text gives its finding away (wave 6 lesson).
</details>

## Numbers (`npm run simulate:budget`, 26 Nov 2026)

| | Ash and Glaze | target |
|---|---|---|
| Ideal path | **780 / 1260 (62 %)**, 3★ confession, per day 415 · 365 · 0, finale on day 3 at 09:00 (Clock star with 33 % left) | ≈ 60 %, ≤ 65 %, ≥ 55 % |
| Exhaustive | **1635 (130 %)**, 87/87 facts, 12/12 deductions, 29 zones | ≈ 130 %, ≥ 125 % |
| Proof star | needs **10 of 12**; the ideal confirms 11 (skips *The shoes*) | the airtight case may skip two |
| Newcomer | first win **day 1 10:40 (~6 real min)**, 2 confirmed on day 1 (*Where it began* after one wrong filing, *What fed it* after another), ~18 real min for day 1 | ≤ 10 min, ≥ 2 |
| Co-op 2 / 3 split (real budgets) | confession 3★ both; busiest 225/250 · 205/250 and 165/175 · 175/175 | must finish |
| Co-op moving together | 2p confession with 4 failed steps; 3p does not finish | should do worse (as Kessler) |
| Presses | 5 pay, 20 colour (free), 11 nothing | every paid press yields |

`npm run check` → typecheck ok · boundary ok · three cases VALID · **118/118 tests**.
`npx tsx server/content/playthrough.ts` → `fennick-yard [en|tr] 91 requests · confession · 3★ · breaks 7 · deductions
11/12 · nights 2 · forks 2 · spent 780/1260`, newcomer first confirmation 10:40, 2 on day 1, no cross-language leaks
(Kessler and First Watch unchanged).

`npm run validate:cases` → `fennick-yard v1 — VALID` (one warning: the confession statement has no tier source, like a
v1 leftover). Kessler and First Watch unchanged (905/1440, 1960; 170/300).

**Why the ideal sits at 62 %:** a 3-day case whose Clock star needs a quarter of the time left must finish on day 3 by
10:45, so the perfect run uses most of days 1–2 by construction (Kessler: 63 %). The ideal chases the first fork (the
doorman, 60 min): it answers a side question and makes the opportunity round easier; without it the run is 720 (57 %).

## Engine / contract changes (additive)

1. **`offence`** — `meta.crime` may now be `'arson'`. Shared: new `OffenceKind`, `CaseSummary.offence`,
   `InvestigationView.case.offence`, `V2Result.offence`. `crime` stays the two-valued legacy wording family (`'theft'` for
   a theft, `'murder'` otherwise) because widening `CrimeKind` breaks `src/features/finale/FinaleScreen.tsx` at compile
   time. Verdict lines `verdict_detail_weak_arson` / `_wrongful_arson` (EN + TR). CONTRACT §16.
2. **“Not yet” on open deduction cards** (PLAYTEST_V4 §7.6) — `DeductionView.notYet?: string` while a fact / evidence /
   time blank has nothing in the notebook that would do; authored per question (`DeductionDef.notYet`) or the engine's
   generic line (`deduction_not_yet`). Never says which blank. Kessler's motive card has its own line; Ash and Glaze has
   three (the heater, the son's crate, the motive). The validator checks its translations.
3. **First Watch**: the brass-polish fact (`f-polish`) no longer has `about: ['ada']`, so the notebook no longer files it
   under Ada when it is found on the case (§7.6).
4. `server/content/playthrough.ts`: grants Plus to its test players for a Plus case; the “never talks about a killing”
   check now covers every non-murder case and checks `offence` and the legacy `crime`.

## Tests (new `server/engine/fennick.test.ts`, 11 tests)

Registered, valid, an arson, Plus, no art-key collisions with other cases · ideal run: confession 3★, 55–65 %,
exhaustive ≥ 125 %, Proof star needs fewer than all · result/offence/legacy crime and arson wording in both languages ·
wrong accusation of Bram or Selma collapses (also late) · guessing in the confrontation loses rounds and the Truth star ·
the duel (Selma's two breaks, Dahl's resist without the timeline at no patience cost, his slip yields a fact) · the
doorman fork (options, no spoiler in the option text, the dealer's story night, default takes a lab line) · `notYet`
appears and disappears (Ash and Glaze, Kessler's motive with its authored line, First Watch with the generic line, never
naming the item) · the polish fact · no truth in the view at the start, at the end of day 1, or in the finale (only the
current defence) · locked in the case list for a free player, refused to start, open after a Plus webhook.

## Requests to other agents

**Client (Q, or whoever owns `src/features/**`, `src/art/**`):**
1. Read `offence` (fall back to `crime`): `finale.star.truthPart` needs an arson variant — EN “Right person, but the
   motive or how the fire was set never landed.” / TR “Doğru kişi, ama saik ya da yangının nasıl çıkarıldığı
   ispatlanamadı.” The briefing's victim label can stay “THE VICTIM / MAĞDUR” for an arson.
2. Show `DeductionView.notYet` as a muted line under the prompt of an open card (filing stays allowed).
3. `src/art/index.ts`: generic drawings for the new documents — `ev-gatelog` → `doc:access-log`, `ev-ostkai` →
   `lab:anpr`, `ev-dvrlog` → `doc:device`, `ev-contract` / `ev-lease` / `ev-codelist` → `doc:contract`, `ev-cloakbook` /
   `ev-taxibook` → `doc:ledger`, `ev-loan` → `doc:bank-record`, `ev-ruth` / `ev-agnes` / `ev-teo` / `ev-kranz` /
   `ev-nyberg` → `doc:statement`, `ev-firereport` / `ev-notice` / `ev-warning` / `ev-salvage` → `doc:folder`; labs
   `a-ostkai` → `lab:anpr`, `a-dvr` → `lab:digital`, `a-debris` / `a-heater` → `lab:fingerprints` (trace), `a-kranz` /
   `a-teo` / `a-nyberg` → `doc:statement`. Until then the kind fallback applies (it works, just less specific).
4. `CloseUpArt`'s code-drawn fallback matches labels by regex (`body`, `ladder`, `mallet` …); kiln / racks / heater /
   gate / shed would benefit from a couple of shapes until T's art lands (optional).
5. HQ: this is the first Plus case — check the locked card and the paywall path with its cover missing (falls back).

**Art (T):** everything in `docs/handoff/S-art.md` (3 suspects × 4 stages, 6 witnesses, 6 plates + UV, 29 close-ups +
5 UV variants, 8 objects, cover, 3 reports, 7 nights).

**Orchestrator:** run `npm run sync:functions` (mirrors `server/` and `shared/` into `supabase/functions/_shared`,
which is not mine); README's case table could list the third case (README is not mine).

## Files

* New: `server/cases/fennick.ts`, `server/cases/fennick/{meta,places,evidence,suspects,facts,scenes,deductions,v2}.ts`,
  `server/engine/fennick.test.ts`, `docs/handoff/S.md`, `docs/handoff/S-art.md`.
* Changed: `server/cases/index.ts` (registry), `server/cases/first-watch.ts` (f-polish), `server/cases/kessler/deductions.ts`
  (motive `notYet`), `server/engine/types.ts`, `server/engine/i18n.ts`, `server/engine/v2/{actions,projection,validate}.ts`,
  `server/service.ts`, `server/content/playthrough.ts`, `shared/api.ts`, `docs/CONTRACT_V2.md` (§16).

## Open items / risks

* **No art at all yet**, and no playtest by hand: the case was played only by the validator, the simulator, the tests
  and the HTTP playthrough. Reading load per screen, the timeline's 7 cards at 375 pt and the number of time chips
  (20) want a real run (U).
* **Plus-gated**: a free player sees it locked. If the owner wants it free while art is missing, flip `meta.tier` to
  `'free'` in `server/cases/fennick/meta.ts` (one line; the test asserting `plus` must follow).
* **“Who” blanks are guessable** after the core chain (Dahl is the answer to four side questions), same as Kessler's
  Clara; each miss still costs 30 min.
* **`notYet` leaks one bit**: its disappearance tells a player that the notebook now holds an answer for every blank of
  that card (not which). Judged acceptable as a hint; switch the projection to authored-only if it feels too helpful.
* The cast list (`InvestigationView.people`) is shown from the start; Nyberg's role was kept to “property developer”
  so the company and the deal are not named before they are found.
* The exhaustive figure counts the two fork chases (120 min); without them it is ~1515 (120 %).

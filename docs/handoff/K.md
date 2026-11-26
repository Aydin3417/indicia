# Handoff — Agent K · Denge ve içerik (wave 4)

Goal: the clock forces choices again — not by padding, but with optional content that is worth having and not all
affordable — and verdict/debrief wording fits the crime. Files touched: `server/**`, `shared/api.ts`,
`docs/CONTRACT_V2.md` (§13), this file, plus `scripts/simulate-budget.ts` (the budget simulator the task asked me to
update). No commits, no branch changes, nothing under `app/`, `src/`, `assets/`. I did not start any server (the
HTTP checks run in-process through the real Hono app); 8787/8140 untouched.

## Results (25 Nov 2026)

```powershell
npm run check                          # → typecheck ok · boundary ok · kessler-workshop v2 VALID · first-watch VALID · 86 tests, 86 pass
npm run simulate:budget                # now prints the targets line and fails if a target is missed
npx tsx server/content/playthrough.ts  # ideal + newcomer, both cases × EN/TR over HTTP, no cross-language leaks
npm run sync:functions                 # done (supabase/functions/_shared mirrors server/ and shared/)
```

| | before (J) | after (K) | target |
|---|---|---|---|
| Kessler ideal path | 845 / 1440 (59 %) | **905 / 1440 (63 %)**, 3★ confession, per day 465 · 440 · 0 | ~60 %, ≤ 65 % |
| Kessler exhaustive | 1450 (101 %) | **1960 (136 %)**, 92/92 facts, 13/13 deductions, 27 zones | ~140 %, ≥ 125 % (now asserted) |
| Kessler newcomer | 1st win 09:50 (~6.6 real min), 3 on day 1 | **unchanged**: 09:50 (~6.6 min), 3 on day 1 | ≤ ~10 min, 2–3 on day 1 |
| First Watch ideal | 170 / 300 (57 %) | 170 / 300 (57 %), 3★ | may stay easy |
| First Watch exhaustive | 170 (57 %) | 185 (62 %) | tutorial: no minimum (warning only) |
| First Watch newcomer | 04:45 (~9.4 min) | unchanged | ≤ ~10 min |
| Tests | 73 | **86** (new `server/engine/balance.test.ts`, 13 tests) | |

Playthrough: `kessler-workshop [en|tr] 119 requests · confession · 3★ · breaks 9 · deductions 11/13 · nights 2 · forks 2 ·
spent 905/1440`; nights "Clara calls a lawyer + fork “Clara’s car” → fk-tonight / A bartender at the front desk + fork
“Geneva is awake” → fk-letter" (TR: "Clara’nın arabası", "Cenevre uyanık"). `first-watch [en|tr] 23 requests · confession · 3★ ·
spent 170/300`. Newcomer runs: Kessler EN/TR 09:50, 3 on day 1; First Watch EN/TR 04:45. No leaks. The playthrough now
also fails if a theft's verdict mentions a killing, and checks `result.crime`.

Where the +510 exhaustive minutes come from (every item yields something; none is required for a confession):
Varga's flat 70 · letter tray 20 · Miriam "clause nine" 20 · Clara's earring break 15 · Clara's flat 115 · Nordbank 85 ·
Kaiser Pfand 65 · two night forks chased 120. The ideal's +60 is the first fork (see "why the ideal pays the hour").

## What I added (Kessler) — cost, payoff, why it is a real choice

Truth unchanged: killer, motive, method, the night's events and times, the existing evidence and what each suspect
knows. The new documents only *record* things that already happened (see "Truth check" below).

| Item | Cost | Payoff | Why it is a choice |
|---|---|---|---|
| **Ilse Varga's flat** (`loc-varga`): kitchen window → her lamp list (`ev-lightbook`: 23:03 a woman in a pale coat in, 23:39 the same woman out); letter to the landlord (`f-light-sensor`: the lamp only lights for someone at the back door) | travel 30 + 2 close-ups 40 = **70** | side question **The courtyard lamp** (`d-courtyard`) → Proof; its chip comes forward in the **opportunity** round (accepted, assist); `f-light-2339` also breaks Clara's "I left at a quarter past eleven" *before the door log or the cameras are back* | Day 1 is already 465/480 for a perfect player. 70 minutes for a witness who answers a round you can also win with the timeline. |
| **Night fork 1 — "Clara's car"** (`n1-volvo`, after day 1 once *The late visitor* is confirmed) | **fk-tonight**: 60 min of day 2 · **fk-morning** (default): the swabs take a lab slot 08:00–12:00 (`a-volvo`, 240) | `f-volvo-naphtha` → side question **Who cleaned the mallet** (`d-clean`) → Proof, and it **answers the means round** (accepted, assist) without waiting for serology + post-mortem | Measured: with the lab option the perfect day-2 plan cannot send both the post-mortem and the alibi check at 08:00, and any reordering leaves the financial warrant without a slot until ~16:00 (a forced wait of ~1–2 h) — so the ideal pays the hour. A player behind on labs has the opposite trade. |
| **Clara's flat** (`loc-clara`, unlocked by a warrant when *The late visitor* is confirmed): jewellery dish (`f-pearl-back`), camel coat (UV: `f-coat-naphtha`), desk (Geneva hotel receipt 2–3 Sep, `f-geneva-trip`) | travel 45 + 3 close-ups 60 + UV 10 = **115** | the pearl stud without the trace lab (saves a slot); the coat is a second road to `d-clean` (no fork needed); the Geneva receipt breaks Clara's "ask Jonas" (`c-clara-nocopy`) → her sale admission early | Two of its three findings have a lab alternative: you buy time with minutes or minutes with slots. |
| **Clara's earring** (topic `t-earring` now breaks with `f-pearl-back`) | present **15** | her admission `f-clara-earring` ("it came off while we were shouting") answers the opportunity round; composure moves | Optional present on a patience-4 suspect. |
| **Second false trail — Miriam's "clause nine"**: office letter tray (`z-tray` → lawyer's letter: if the consignee dies the violin returns within 7 days; Brandl won't wait past 31 March). Miriam topic `t-clause`: she resists until you hold **both** Brandl's deadline and Thomas's "not before 3 April" (`f-notice`), then admits the arithmetic (`s-miriam-clause`) | close-up 20 + topic 5 + present 15 = **40**, Miriam's **scarce morning window** (days 2–3 until 13:00), and a **lab slot** for the Brandl request (`a-brandl`, 240) | Brandl's reply: `f-halberd-listed` (a Turin 1772 Guadagnini in Halberd's Geneva catalogue since October). It (a) breaks Miriam's "buyer in Vienna" → "Then where is my violin?" (feeds *The violin in the vault*), and (b) is the **strong present**: shown to Clara's "the Guadagnini is in the vault" it skips her "ask Jonas" tier and gets the sale admission `f-clara-sold` at once | Looks like a motive for Miriam (his death returned her violin in a week) and is not; costs her mornings, but pays in a road to Geneva that does not need the violin examiner. |
| **Motive without the warrant**: *The motive* (`d-motive`) now accepts Clara's own admission (`f-clara-sold`) for the sale and the bank file (`f-bank-papers`) for the loan; it opens with the accounts binder instead of the Geneva records | 0 | a sharp player can file the motive on day 2 | Shortcut that rewards reading, not grinding. |
| **Nordbank** (`loc-bank`, opens with the subtle diary line "11:30 Bank?? (C.)"): loan file (`f-bank-papers`), settlement records (`f-loan-repaid`) | travel 45 + 2 close-ups 40 = **85** | breaks Clara's "we were managing" without the office files; feeds **Follow the money** | |
| **Follow the money** (`d-money`, side question): Clara drew up the loan + her company paid it off + the day after Geneva (`f-geneva-trip` or `f-halberd-listed`) | 0 (needs the bank + Clara's flat or Brandl) | **unlocks the financial warrant** (`a-finance`) without *The violin in the vault* — the time shortcut for a sharp player (the warrant can run on day 2 morning) | `a-finance` lost its old `requires ev-copyreport`; it is still locked until d-copy **or** d-money. |
| **Kaiser Pfand** (`loc-pawn`, opens when the bow is missing) → the pledge book (`ev-pawn`) | travel 45 + close-up 20 = **65** | the pawn record now instead of the registry lab (180, a slot) or the night ping | Leo's false trail made costly: minutes vs. a slot vs. waiting for the night. |
| **Night fork 2 — "Geneva is awake"** (`n2-halberd`, after day 2 once *The violin in the vault* is confirmed) | **fk-call**: 60 min of day 3 · **fk-letter** (default): lab slot 08:00–11:00 (`a-halberd`, 180) | `f-halberd-bought` → the motive round / `d-motive` | Only matters for a player who sent the financial warrant late: the letter is ready at 11:00, past the Clock star's 10:00; the call keeps the star for an hour of the last morning. |
| **Proof star** 10/10 → **11 of 13** (`finale.stars.proofDeductions: 0.84`) | — | the three side questions count | The airtight case may skip two questions — side ones or an innocent's. The ideal does exactly one side question (`d-clean`). |

Lab competition: optional jobs now `a-brandl`, `a-volvo`, `a-halberd` on top of the old optional ones (rag, ladder,
note, pawn, earring, ledger) — all against two slots.

### Why the ideal pays the hour (and sits at 63 %, not 60 %)
The Proof star now needs a side question, so the perfect run must buy one. The cheapest is *Who cleaned the mallet*
via the first fork. I replayed the alternative: with the lab option the ideal's `a-anchor` (08:00) and `a-mallet`
(11:45) are refused `lab_full`; reordering by hand (my count, not replayed) leaves `a-finance` without a slot until
~16:00 — the perfect plan would need a 1–2 h wait. So the ideal
takes the night drive (+60 → 905, 63 %). Going lower would mean making a side question cheaper than an hour, which
would make it no choice at all.

## First Watch (kept short and gentle)
* `meta.crime: 'theft'`.
* Optional free detail on the case: brass polish by the keyhole (`f-polish`) — a second answer to "I can't open that
  case" (means round).
* Ada's "Only the guard has keys" is now a recorded lie (`s-ada-nokey`) that breaks with the key register (15 min):
  she admits key 2 "for cleaning"; the means round refutes it in the debrief.
* Exhaustive 185/300 (62 %): the tutorial stays easy on purpose (validator: warning only).

## Goal 2 — wording fits the crime
* `meta.crime` (`'murder' | 'theft'`, default murder). `verdictDetail()` picks `verdict_detail_<outcome>_<crime>` when
  it exists: weak theft "You named the thief, but the defence found room." / "Hırsızı doğru buldun ama savunma bir açık
  yakaladı."; wrongful theft "You accused the wrong person. The real thief walks free, and what was taken is still
  missing." / "Yanlış kişiyi suçladın. Asıl hırsız elini kolunu sallayarak dolaşıyor; çalınan da hâlâ kayıp." Also in
  the legacy `CaseResult.ratingDetail`.
* Reviewed every engine string in both languages. Rewritten where the Turkish read translated: murder weak "Katili
  doğru buldun ama savunma bir açık yakaladı.", wrongful "…Asıl katil hâlâ dışarıda.", lab full "Laboratuvarın iki
  hattı da dolu…", "Henüz değil. Bunun üstüne gitmek için önce daha fazlasını bilmelisin.", "Sözümden dönmem için bu
  yetmez." The rest (errors, nudges, ranks, activity lines) were already natural and crime-neutral. Engine strings
  outside the verdict never name a killing; the debrief's `killerName` is shown by the client as "It was {killer}." /
  "Yapan: {killer}." (neutral).
* Kessler content was checked for the crime too (it is a murder; "Cinayet aleti", "katil" are right there).

## Engine changes (server)
* **Night forks** — `NightEventDef.choice { prompt, options: NightOptionDef[] }`; forks are a second channel next to
  story events (first matching of each fires). `endDay` offers it (`report.fork`, `s.pendingFork`); `nightChoice()`
  answers it; `assertInvestigating` settles a waiting fork with the first (free) option before any other action, so
  old clients keep working. `applyForkOption` charges morning minutes, grants, unlocks, and starts the option's lab job
  (`a-volvo`, `a-halberd` are `locked` and only start this way). `POST /sessions/:id/v2/night-choice`, analytics
  `night_choice`, reason `no_fork`.
* **Proof star** — `proofNeeds(v2)` shared by `finish()`, `view.proofStar`, `result.proofNeeds`.
* **Validator** — `EXHAUSTIVE_MIN_SHARE = 1.25` asserted for non-tutorial cases; the exhaustive player chases each fork
  once (its costliest option); fork rules (≥ 2 options, each gives something, default costs no minutes, option minutes
  ≤ half a day, refs checked, fork lab analyses count as unlockable); evidence reachability for v2 cases is checked by
  the v2 exhaustive player (the v1 simulation keeps only its decisive-evidence error); path step `nightChoice`
  (`REAL_SECONDS` 30).
* **Simulator** — prints a "targets" line (ideal ≤ 65 %, exhaustive ≥ 125 % for full cases, Proof need vs. ideal, the
  forks and their options) and exits 1 if a target is missed.

## Tests (73 → 86)
`server/engine/balance.test.ts`: budget targets per case + newcomer guarantees; validator rejects a full case where
everything fits (and lets the tutorial be easy); the ideal does one side question and the Proof star needs 11/13 (view
and result); fork offered, answered (60 min, fact, TR message, `no_fork` after), default settlement (no minutes, lab slot
taken, `lab_full` for a second morning job, result after 240); fork validation; the Geneva shortcut (tier skip +
motive from her admission); follow the money unlocks the warrant without d-copy; the clause-nine false trail (resist
without the notice, break with it, Brandl request opens); side questions in the finale rounds; verdict wording per
crime in both languages; First Watch weak verdict closed view. Adjusted: `v2api.test.ts` (deductions confirmed =
the ideal's, fork chosen over HTTP, `crime`), `fun.test.ts` (runStep knows `nightChoice`), `v2.test.ts` (one test that
is about break mechanics now resets the clock), `engine.test.ts` unchanged.

## Contract additions for the client (all additive; details in CONTRACT_V2.md §13)
1. **Fork card** — `view.fork` (pending only) / `report.fork`; `POST …/v2/night-choice { optionId }`; event
   `night_choice`. Until the client shows it, every fork silently takes its default (the lab option), i.e. players
   never get the choice. **This is the most important client request of this wave.**
2. **Proof star line** — `view.proofStar` ("★ Proof: 7 of 11 deductions"), and `result.proofNeeds` for the verdict's
   `finale.star.proofWhy` ("{d} of {need} needed"). Kessler's star changed from 10/10 to 11/13.
3. **Crime-aware client copy** — `case.crime` / `CaseSummary.crime` / `result.crime`. `finale.star.truthPart`
   ("…the motive or the weapon never landed") should read e.g. "…the motive or the means never landed" (or "the key" for
   a theft) — `src/features/finale/strings.ts` is not mine.
4. **Art (agent M)** — new scene keys `kessler/varga`, `kessler/clara-flat`, `kessler/bank`, `kessler/pawn`, close-ups
   `kessler/letter-tray`, `kessler/varga-window`, `kessler/varga-letter`, `kessler/clara-dish`, `kessler/clara-coat`,
   `kessler/clara-desk`, `kessler/bank-file`, `kessler/bank-ledger`, `kessler/pawn-book`. They fall back to the plan.
5. Locked lab options `a-volvo` / `a-halberd` appear on their evidence with a reason (they only start through a fork).

## Truth check (what the new documents assert, and why it is consistent)
* Lamp list: 18:12 Jonas leaves (he says 18:10), 18:26 Leo (18:25), 21:56/22:20 the bicycle (Leo's fob 21:58, out
  22:19), 23:03/23:39 the woman (Clara's fob 23:04, exit 23:38). No new event.
* Naphtha on Clara's wheel and coat cuff: from the rag she used at 23:20. In her jewellery dish the *left* stud has the
  plastic stopper — exactly what the existing trace-lab result says.
* Geneva hotel 2–3 September: she sold the violin there on 3 September.
* Nordbank: the existing €900,000 loan and its 4 September settlement (same figures as the Geneva records).
* Lawyer's letter, Brandl's reply: about Miriam's existing buyer; Halberd listing the violin it bought in September.
  Miriam's only new knowledge is that Brandl asked her for a certificate (she thought it was haggling); she still does
  not know it is a copy until shown.
* Ada's key admission is what the key register already says.

## Not fun yet / risks
* **Forks are invisible until the client shows them** (default = lab option). Day reports carry them, so a client
  update is enough.
* **Proof star got stricter for old habits**: a player who files all ten core questions but no side question now
  misses the Proof star. Intended (side roads matter), but the UI must say "11 of 13" or it will feel like a moved goal.
* **The exhaustive counts both forks' chases** even when the second one is redundant (a player who already has the
  Geneva records gains nothing by calling); without it the figure is 1900 (132 %).
* **Person blanks are still guessable** (Clara is the obvious "who" in all three side questions; 30 min a miss).
* **The motive question now appears with the accounts binder** (earlier than before): it may sit open for a day with
  blanks the player cannot fill yet. A "not yet" hint on the card would help.
* **Four new places with no art** and no hints in the desk sergeant's ladder (deliberately: they are side roads).
* Day 1 is still 465/480 for the perfect player; Varga's 70 minutes compete directly with the core — playtest whether
  newcomers ever go there before day 2.

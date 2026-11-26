# Handoff — Agent J · Eğlence geçişi (the fun pass)

Everything in PLAYTEST_V2 §7 except #4 (real art), plus G's known small issues, plus what I hit while playing.
The fun assessment is in [docs/PLAYTEST_V3.md](../PLAYTEST_V3.md). The contract additions are in
[CONTRACT_V2.md §12](../CONTRACT_V2.md). No commits, no branch changes; `assets/art/**`, `docs/ART_BIBLE.md`,
`docs/handoff/H.md` untouched; no images wired.

## How to run / final results (25 Nov 2026)

```powershell
npm run check                          # → boundary ok · kessler-workshop v2 VALID · first-watch VALID · 73 tests, 73 pass
npm run simulate:budget                # ideal / exhaustive / presses / newcomer per case
npx tsx server/content/playthrough.ts  # ideal + newcomer paths, both cases × EN/TR, over HTTP, no cross-language leaks
npm run sync:functions                 # done
```

* `simulate:budget` → **Kessler** ideal **845/1440 (59 %)**, elapsed 960, per day 465 · 380 · 0, 3★ confession;
  exhaustive **1450 (101 %)**; presses: 6 pay (3 shown "not yet" until known) · 31 colour only (free) · 23 nothing;
  **newcomer: first confirmation day 1 09:50 (~6.6 real min), 3 confirmed on day 1** (~27 real min).
  **First Watch** ideal 170/300 (57 %), newcomer first confirmation 04:45 (~9.4 real min).
* `playthrough.ts` → all four ideal runs 3★ confession; newcomer runs: Kessler EN/TR first confirmation 09:50, 3 on
  day 1; First Watch EN/TR 04:45.
* Tests: 55 → **73** (new `server/engine/fun.test.ts`, 18 tests; two old tests rewritten for the new press rules).
* My servers (8791/8151) are stopped; my entries removed from `~/.claude/launch.json`; 8787/8140/8790/8150 untouched.

## What I changed, by playtest item

### 1. Kessler day 1: an early, guaranteed win, then a choice
* `server/cases/kessler/scenes.ts` — the ladder close-up has a visible **dust detail "Upper rungs"** (→ `f-rungs-clean`),
  and its text says the rungs would show a climb. The old hidden `z-rungs` probe zone stays as an alternative.
* `deductions.ts` — *Not a fall* confirmation now names the next two threads: the cameras **and the back door's fob log**.
* `records.ts` — access-log extraction 180 → **120 min**, ANPR 240 → **180 min** (hint text updated).
* `places.ts` — the back entrance card says the reader "logs every door".
* `v2.ts` — new night event `n1-pawn-known` (if *The apprentice's errand* is already proven the pawn ticket confirms
  it instead of asking "Leo?"); ideal path reordered (tool wall + mallet to day 2, weapon to day 3) for the topic cost.
* `newcomerPath` for both cases (a sensible first-timer with mistakes) — checked by the validator (see "Proof").
* Truth unchanged: killer, timeline, evidence, statements, what each suspect knows.

### 2. Every press pays or says it won't
* Engine (`server/engine/v2/actions.ts`): `pressState()` → `yes | free | later | none | done`. Only `yes` costs
  15 min; `free` (colour only) costs nothing and returns `outcome: 'colour'`; `later`, `none`, `done` are refused for
  free (`press_later`, `nothing_to_press`, `already`). The old 15-minute "That is all I have to say" is gone.
* View: `ClaimView.press`, `pressCost`; dock shows "15 min · yields a find" / "free · nothing new" / "not yet · know
  more" / "nothing behind it" / "already pressed" (EN/TR).
* Kessler raises a topic for **5 min** (`clock.costs.openTopic`), so doing everything still exceeds the budget.

### 3. Waiting on purpose; filing up to the prosecutor; no dead last day
* `POST /v2/wait { minutes | until: 'lab' | suspectId }`, costs exactly the minutes, lead-only in co-op;
  `clock.waits` lists options. UI: `src/features/desk/WaitCard.tsx` on the day ledger (always) and on the Map (when a
  lab result or a suspect's hours come today).
* Ending the **last** day now spends it (`remainingToday 0`, fixes G's "prosecutor shows unused minutes"), lets
  running lab jobs finish overnight, and keeps `deduce` open in `awaiting_finale` (wrong = 0 min, max 2 wrong per
  question → `triesLeft`, `late_limit`). UI: deduction book banner + per-question tries; prosecutor intro shows
  "First, file what you can" (goes to Deductions); a deep link to Deductions/Notebook in that phase is no longer
  bounced to the finale.

### 5. Tutorial coach marks
* `src/features/desk/Coach.tsx` (`CoachMark`, `coachDue`): four one-liners (scene → notebook/Evidence → present →
  deduction), tutorial only (`view.case.tutorial`), each shown while its lesson is ahead, retired for good when done or
  dismissed (✕ "Got it"); stored in `prefs.coached`. Placed under the TopStrip in the tab layout and inside the
  interview transcript. EN/TR strings `coach.*`.

### 6. Varied lines and a visible break
* Dismissals rotate in order per suspect (no repeats back to back): Clara/Jonas/Leo/Miriam 6 each, Ada 6, Nils 4 —
  written per voice in both languages. New `SuspectDef.resists` (3 per suspect) used when a break has no own resist line.
* Every break moves composure at least one stage until *breaking* (`COMPOSURE_STEPS` in `interrogation.ts`); event
  `composure {from,to}`; banner "Their story cracked · Uneasy → Strained"; `SuspectV2View.pressure` (0..100).

### 7. Nudge after two wrong filings
* `deduce` keeps `wrong`/`nudge` per question; from the second wrong filing the message adds the blank to look at
  ("the rest holds" only when exactly one blank is wrong) or, for the timeline, the set-aside card / the order.
  `DeductionView.nudge` shown on the book card and the question. Never a value (test).

### 8. Spots left; earlier glow
* Scene header line "N spots left" (visible, uninspected zones only). Idle glow after **7 s** while no zone of the case
  has been inspected yet (20 s afterwards). Wrong-tool tap on a detail now says which tool ("Pick Powder below…").

### 9. One answer, claims inside it
* Server: `server/engine/v2/anchors.ts` places each claim as a span of the spoken answer (authored `ClaimDef.anchor`,
  else sentence matching with Turkish-aware stems; stage directions excluded); `InterviewLineView.claims` +
  `looseClaims`. Anchors authored where matching was wrong (Clara ×2, Ada ×2, Nils ×1). 128/132 claim-language pairs
  are spans, 4 come as quotes.
* Client: `Transcript.tsx` renders the answer once with tappable underlined claims (struck through when broken), loose
  claims as one-line quotes; the claim card list is gone; the dock says "N open claims · tap an underlined line" with
  **Next ›**. Press/present, costs and patience work exactly as before.

### 10. The Clock star
* `clock.clockStar { minutesLeftNeeded, share, by, state }`; a line under the TopStrip: "★ Clock star: see the
  prosecutor by day 3, 10:00" / "…by 06:15 today" / "out of reach: no hurry now". The verdict says what the star
  needed. Rule unchanged (25 %, tutorial 15 %).

### G's known issues
* Earlier-edition open sessions are no longer listed in the profile history; the desk shows a localised
  "earlier edition" / "not in your files" message with one way back (no duplicate buttons, no pointless retry).
* Co-op guest acting first: the briefing now shows on first arrival in any co-op session not yet briefed on this device.
* Prosecutor "time left" after the last day: now 0 (the day is spent).
* Debrief: `FinaleRoundDef.refutes` — lies exposed in a won round are counted as uncovered (Kessler 4 rounds, tutorial 2).
* Dismissals repeating: fixed (item 6). Test-store plan titles: shown as "Yearly/Monthly" ↔ "Yıllık/Aylık".

### Also found while playing
* Tutorial Map no longer shows an empty lab bench; notebook tip points at the Evidence tab; cost ledger lists raising
  a topic, the conditional press cost and waiting.

## Proof (automated, stays true)

* Validator (`server/engine/v2/validate.ts`): rejects a case if a press that costs time yields nothing; replays
  `newcomerPath` and rejects if the first confirmation is later than `firstWinBy` game minutes / ~`firstWinRealMinutes`
  estimated real minutes (`REAL_SECONDS` per step + 90 s briefing) or fewer than `minConfirmedDay1` on day 1; checks
  `refutes` and `resists` (translation completeness).
* `fun.test.ts`: early win (both cases, game + real minutes); 2–3 on Kessler day 1 with mistakes; the ladder dust
  detail; no unpaid press (exhaustive + ideal); press states/costs in the view; wait (minutes, until lab, until Leo,
  refusals free, Miriam not today); last day ends in full / overnight lab / late filing capped at two / no wait after;
  nudge wording EN/TR and no answer in it; timeline nudges; dismissal rotation; composure moves on every break of the
  ideal path; claim spans well-formed and complete in both languages; Clock star target (Kessler day 3 10:00,
  tutorial 06:15) and `case.tutorial`; finale refutations in the debrief.
* `playthrough.ts` now also replays the newcomer path over HTTP in both languages.

## What I verified in the browser (375×812), with what I saw

TR tutorial from first launch: tip "Olay yerinden başla…", "Burada 4 yer kaldı" → glow at ~8 s (`idle-shimmer` in DOM)
→ case close-up, lock fact → tip "Bulduğun şey Defter’de: orada Deliller’i aç…" → log line noted → tip about
Deductions → Ada: claim underlined inside her answer, dock "Üstele · bedava · yeni bilgi yok", wrong present
"Bunun benimle ilgisi yok." (patience 3), right present: struck-through claim, "KIRILDI", banner "Hikâyesi çatladı ·
Sakin → Tedirgin" → Nils "15 dk · bulgu verir" → "Yeni ayrıntı" → two wrong filings: card shows "Birden fazla boşluk
yanlış. İşe "kim" ile başla." → filed by hand: DOĞRULANDI → confession 3★ (55 min left, star needed 45).
EN Kessler: "★ Clock star: see the prosecutor by day 3, 10:00"; ladder close-up dashed mark, torch → "The torch won't
show this. Pick Powder below and tap it again.", Powder → "Look with powder · 10 min" → fact at 09:20 → *Not a fall*
filed by hand → CONFIRMED with the new text and "This opened: ANPR footage request"; Jonas: topics "5 min", claim
underlined, "free · nothing new" → tell line, clock unchanged; two different dismissals; break → "Uneasy → Strained";
day 1: 3 confirmed by 14:30; ledger "Let time pass": Wait 30 min → 15:00; End day 1 → report "3 CONFIRMED", night
"A ping from the pawn registry" (that run predates `n1-pawn-known`). TR last day: prosecutor "0 dk KALAN SÜRE",
"Önce dosyalayabildiğini dosyala" → book "Günlerin bitti…", "★ Saat yıldızı kaçtı", motive "1 yanlış hakkın kaldı",
wrong filing cost 0 → confession 2★, 10/10. TR Clara: inline claims, "Sakin → Tedirgin". Stale session: localised
edition message. EN tutorial: tip dismissed with ✕ stays gone (`prefs.coached: ["scene"]`).

**Not verified**: native devices (haptics, nested-`Text` taps on iOS/Android — the claim spans use `onPress` on nested
`Text`, which RN supports, but I only saw web), animation smoothness, co-op with two real browsers after these
changes (unit tests only), the `wait` button in co-op as a guest (server refuses `not_host`; the card is hidden for
guests).

## What I could not fix, and why

* **Exhaustive ~140 %**: with honest presses the exhaustive player needs 101 %; reaching 140 % needs new optional
  content or harsher costs that also hit the ideal path (which must stay ≤ 65 %). Left as a design decision (PLAYTEST_V3 §7.2).
* **Exact underlines everywhere**: spans are matched; authoring `anchor` for all 60 claims × 2 languages is content
  work I scoped to the five that were wrong.
* **Art** (item 4) — another agent.

## For the UI design agent (I)

* **Interview**: `ClaimCard.tsx` is no longer rendered (kept for its `CardFx` type and in case you want a card for the
  *selected* claim). Claims live in `Transcript.tsx` → `Answer` (nested `Text` spans, `testID="claim-<id>"`). The
  dock has an "open claims · Next ›" row and press notes from `claim.press`. The coach mark sits in the transcript.
  `SuspectHeader` untouched (portrait slot still at `SuspectHeader.tsx:68`); `suspect.pressure` is available for a
  finer composure meter.
* **TopStrip** has a second line (`StarLine`, `testID="strip-star"`); the tab layout renders `CoachMark` under it.
* **New**: `src/features/desk/Coach.tsx`, `src/features/desk/WaitCard.tsx` (Map after the lab bench, day ledger).
* **Scene**: header has a third line (`testID="scene-spots"`); the art slot moved to `SceneScreen.tsx:618`
  (`<SceneArt …>`), close-up slot unchanged at `CloseUp.tsx:88`. Other slots unchanged: finale `Portrait`
  `FinaleScreen.tsx:167`, people `people.tsx:62`, Map "who can be seen" `(tabs)/index.tsx:158`, case covers as in G.md.
* **Deductions**: `nudge` / `triesLeft` lines (amber) on the card and the question; filing allowed after the last day.
* **Finale intro**: a secondary "First, file what you can" button in `awaiting_finale` when work remains.

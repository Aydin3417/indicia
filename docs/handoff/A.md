# Handoff — Agent A · Motor ve sözleşme (wave 1)

The contract for wave 2 is **`docs/CONTRACT_V2.md`** (endpoints, views, state machines, costs, error
reasons, event → feedback table, authoring guide). This file records what was built, what was verified,
and what is open.

## What I built

**Truth model (`server/engine/types.ts`)**
* `Text = string | { en, tr }` for every player-facing content field (v1 fields widened; plain string = English-only draft).
* `meta.contentStatus: 'draft' | 'final'`.
* `Requirement` gains `facts` and `deductions`.
* v2 layer `def.v2`: `clock` (days, minutes/day, day start, cost overrides, lab slots, start place, suspect
  availability windows), `facts`, `scenes` (zones on a 0..1 canvas: rect/circle/poly, `reveal` visible/uv/dust,
  close-up with tappable details that may need uv/dust/camera), `deductions` (typed blanks with equivalents,
  prerequisites, effects; timeline variant with an outlier), `finale` (4–5 rounds, innocents' collapse,
  confession, star thresholds), `nightEvents`, `idealPath`.
* On existing objects: `briefing.startingFacts`, `analysis.v2 {minutes, locked, facts}`, `location.v2`,
  `suspect.v2.patience`, `topic.v2 {chips, requires, locked}`, `tier.claims[]` (claim cards with `press` and `breaks`).
* `DEFAULT_COSTS` exactly as PLAN §3.1, plus `openTopic: 0`.

**Engine (`server/engine/v2/`)** — pure, deterministic
* `state.ts` — per-session `V2State` (clock, location, notebook, lab queue, interviews/patience, claims,
  deductions, unlocks, transcript log as references, day reports, finale, per-viewer "seen"), clock math
  (absolute game minutes, labs run overnight), visibility rules, shape hit-testing.
* `actions.ts` — travel, inspect, probe, detail, collect, lab submit/collect, interview start/leave, topic,
  press, present, ask, deduce, hint, end-day, finale start/answer. Checks first and charges after, so refusals
  are free. `run()`/`runAsync()` add `labReady` and `newDeductions` diffs to every event.
  Present reuses the tier machine: a break moves the topic to the target tier, applies stress/trust of every
  passed tier, records only the reached tier's statements and evidence (v1 rule kept).
* `projection.ts` — `InvestigationView` in one language; no truth (see tests).
* `validate.ts` — static checks, i18n completeness, exhaustive simulation (reachability/solvability),
  ideal-path replay under real rules, ≤ 65% rule; also exports `exhaustive()` and `runPath()` for the simulator.
* `server/engine/i18n.ts` — `tx()`, Accept-Language parsing, document markup parser, engine system strings in EN + TR.

**Service / HTTP / store**
* `GameService`: `viewV2`, `actV2` wrapper (same per-session mutex, version bump, localised co-op activity,
  analytics with no typed text), one method per action, `localeFor` (profile > Accept-Language > en), `setLocale`.
  Free questions reuse v1 quota, rate limit and the AI/keyword classifier.
* `ServiceError`/`ActionError` carry `reason`; HTTP errors return `{ error, code, reason }`.
* Routes under `/sessions/:id/v2/*`, `PUT /me/locale`, `GET /cases` localised. CORS allows `accept-language`.
* `ProfileRecord.locale`; Supabase store maps it; migration `supabase/migrations/0003_v2_locale.sql`
  (`user_profiles.locale`). All other v2 state lives in `session_state.state` jsonb — no other schema change.
* `npm run sync:functions` run; `_shared` now contains the v2 engine and cases.

**Contract (`shared/api.ts`)** — additive only: `Locale`, `ErrorReason`, `ApiError.reason`, `Profile.locale`,
`InvestigationView` and its parts, `V2Event`, `V2Response`. The existing client typechecks untouched.

**Content**
* `server/cases/overlay.ts` — `withV2(base, overlay)`: attaches a v2 layer to a v1 case; `marks` adds fact
  markup to existing document lines and refuses any change to document text (truth can't drift).
* `server/cases/kessler.v2.ts` — Kessler v2 draft in English: 59 facts, 17 zones (one hidden dust zone, one
  UV detail), 58 claims (on the key topics, the rest auto-split), 6 deductions (incl. a timeline), 5-round
  finale, 2 night events, 51-step ideal path. TR only on the engine strings and a few showcase fields
  (`d-not-fall`, finale intro) — the case is `contentStatus: 'draft'`. Killer, timeline and evidence texts unchanged.
* `scripts/simulate-budget.ts` + `npm run simulate:budget [-- --steps]`.

## Commands and final output

`npm run check` (typecheck, boundary, case validation, all tests):

```
boundary ok — app, src, shared import nothing from server/
■ kessler-workshop v1 — VALID
  suspects=4  evidence=30  decisive=7  analyses=14  statements=23  contradictions=16  topics=33  simulationRounds=3
  v2.facts=59  v2.zones=17  v2.claims=58  v2.deductions=6  v2.budgetMinutes=1440  v2.idealSpent=410
  v2.idealElapsed=960  v2.exhaustiveSpent=1830  v2.missingTr=767
  ! draft: 767 content strings lack Turkish (allowed in draft only)
# tests 59
# pass 59
# fail 0
```

`npm run simulate:budget`:

```
■ kessler-workshop — 3 days × 480 min = 1440 min
  ideal path      spent 410 min (28% of budget, limit 65%), clock elapsed 960 min, 51 steps
                  finale: confession, stars {"truth":true,"proof":true,"clock":true}
                  per day: day 1: 315 · day 2: 95 · day 3: 0
  exhaustive      spent 1830 min (127% of budget; design target ≈140%)
                  reached 59/59 facts, 6/6 deductions, 17 zones
```

Tests: 25 v1 (unchanged, still passing) + 28 in `server/engine/v2.test.ts` (costs, refusals free, day limit,
lab delay/overnight/2 slots/result announcement, availability windows, patience and next-day refill, no
refill by leaving, press nothing/held/advance, present break/resist/wrong, deduction unlock + wrong cost +
not-owned refusal, timeline outlier, ideal path → confession with 3 stars, finale retries/losses/charged +
stars, wrongful collapse, last day → awaiting finale, co-op lead-only, document collection, locale
selection, no-truth-leak at start/mid-game/finale, validator rejections: unsolvable deduction, sourceless
fact, unreachable finale round, too-short day, > 65% ideal path, missing tr in final mode, lock without
unlock, bad references, en/tr markup mismatch, lab delay out of range, missing innocent collapse, Turkish
keywords) + 6 in `server/engine/v2api.test.ts` (**full Kessler playthrough over HTTP** to a 3-star
confession incl. v1 view/profile afterwards and analytics; error reasons and zero cost; free questions and
quota; Accept-Language vs profile locale; co-op shared clock, version bumps, localised activity, concurrent
actions, lead-only end-day/finale, per-viewer new marks; v1 endpoints on the same session).

Manual: started the API on port 8799 (`PORT=8799 npx tsx server/dev.ts`, scratch data dir), created a
session, travelled (`{"kind":"travel","ok":true,"cost":30}`, clock 08:30, `locale: tr`), tried Miriam on day 1
→ `{"error":"Bu saatte görüşmeye müsait değil.","code":"conflict","reason":"unavailable"}`. Stopped that
process only; 8787 and 8140 were not touched.

## Design decisions I made (ambiguities resolved)

* **Topics cost 0 to raise** (not in PLAN's table); configurable as `costs.openTopic`. The interview start (30) and patience gate the economy.
* **Patience is per suspect per day**, not per sitting: leaving and re-entering does not refill it (prevents a 30-minute exploit).
* **Only a wrong `present` costs patience.** The right item before its requirement is a *resist*: no patience lost (lets authors chain proofs).
* **Pressing** a claim with nothing behind it spends the card; a press whose requirement is unmet stays pressable.
* **Confessions only in the finale.** Clara's v1 confession tier is never reached in interviews.
* **Wrong accused = immediate collapse** at finale start (their defence + collapse text), no rounds.
* **Outcome bands**: all rounds → confession; ≥ 60% → charged; else weak. Stars as in CONTRACT §5 (configurable per case).
* **Hidden zones** are found by probing a point with UV/dust: 10 min on a miss, 30 on a hit; the probe needs 30 available. Hidden zones are never in the view before they are found.
* **Lab slots** free up when a job is *ready*, not when collected. Labs run overnight. Results must be collected (free).
* **An action must fit in today's remaining minutes**; a wrong deduction's penalty is capped at what is left.
* **The last day's end** puts the session in `awaiting_finale`; lab collect and document collect stay allowed.
* **Co-op**: one clock for the room; only the lead ends the day and runs the finale.
* **Locale**: profile > Accept-Language > en; draft strings fall back to English; v1 endpoints stay English.
* **Free questions** keep the v1 daily allowance and AI classification but answer with authored lines.
* **Legacy result**: a v2 finale also writes a v1 `CaseResult` (score 0–100 from rounds and deductions) so profile, rank and history keep working.

## Known gaps / for the next agents

* **Balance**: Kessler's ideal path uses only 28% of the budget (target ≈60%) and the exhaustive path 127% (target ≈140%). Agent B should add necessary steps (more content gates, Leo/Miriam threads that matter, longer lab chains) — the simulator shows the effect immediately.
* **Content**: 767 strings lack Turkish; Kessler v2 claims are short paraphrases; most non-key topics use auto-split claims (one card = whole answer). Agent B writes the real bilingual case and the tutorial.
* No `wait` action; no easy-mode "missed facts" list; no idle-glow data for hidden zones (client-side only).
* README's checks table does not mention `simulate:budget` (README is outside my files).
* The Deno Edge Function bundle was synced but not run (no Supabase project here). Migration 0003 not applied to a live database.
* Old sessions of Kessler are refused (case hash changed) — by design.

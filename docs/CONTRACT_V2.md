# INDICIA v2 — client/server contract

Written by Agent A (engine and contract) for the UI agents (C interview, D scene, E deduction + finale,
F shell/clock/i18n/feel) and the content agent (B). You cannot ask me questions, so this document tries
to answer them up front. The exact TypeScript types are in `shared/api.ts` (section "v2 — investigation
desk"); this document explains what the fields mean and how the pieces move.

If you need a field that does not exist, write a **contract request** in your own `docs/handoff/<agent>.md`.
Do not edit `shared/` or `server/`.

---

## 1. Basics

| Topic | Rule |
|---|---|
| Base URL | Same API as v1 (`EXPO_PUBLIC_API_URL`, dev `http://localhost:8787`). All v2 routes are under `/sessions/:id/v2`. |
| Auth | Unchanged: `Authorization: Bearer <token>` (dev: `Bearer dev.<8–64 chars>`). |
| Starting a case | Unchanged: `POST /sessions { caseId, restart?, mode? }` → `{ sessionId, roomCode? }`. Every session of a case that has a v2 layer is a v2 session; read it with `GET /sessions/:id/v2`. |
| Language | The server sends **one** language. It uses, in order: the profile setting (`PUT /me/locale`), the `Accept-Language` header (first of `tr`/`en` by q-value), English. Send `Accept-Language` on every request (the app's UI language). |
| Every action | Returns `V2Response = { view: InvestigationView, event: V2Event }`. Replace your cached view with `view`; use `event` for feedback (animation, sound, haptics, toasts). |
| Polling (co-op) | Unchanged: `GET /sessions/:id/pulse` → `{ version }`. Refetch `GET /sessions/:id/v2` when `version` changes. |
| v1 | Removed in wave 3 (Agent G). `GET /sessions/:id`, examine, lab, interrogate, contradictions, hint, board, notes and accuse now answer `404 { code: 'not_found' }`. The room endpoints (`/rooms/join`, `/sessions/:id/room/lock|remove`, `/leave`, `/pulse`) stay; lock/remove now return `{ ok: true }`. |
| Ids | Facts `f-…`, evidence `ev-…`, zones `z-…`, claims `c-…` (or `<suspect>.<topic>.<tier>` for un-split answers — may contain dots), deductions `d-…`, rounds `r-…`. Treat them as opaque strings. |

### Errors

Errors are HTTP 4xx with `ApiError = { error, code, reason? }`. `error` is a localised sentence you can show
as-is. `reason` is for logic. **A refused action never costs time.**

**Client side (wave 3):** every feature screen receives the same `act(path, body?)` (`src/features/act.ts`): it resolves
`{ view, event }`, or the server's `ApiError` itself (`{ error, code, reason }`, flat) on a refusal, or `null`. After any
refusal the desk store refetches `GET /v2`, so a screen never stays on a stale view.

| reason | code / HTTP | Meaning → what to show |
|---|---|---|
| `no_time` | conflict 409 | Not enough minutes left today. Point at "End day". |
| `not_here` | conflict 409 | Scene action at a place you are not at. Offer travel. |
| `unavailable` | conflict 409 | Suspect not available now (see `suspect.availability`). |
| `refused` | conflict 409 | Suspect's patience ran out today. Back tomorrow. |
| `not_open` | conflict 409 | Interview action without an open interview. |
| `lab_full` | conflict 409 | Two lab jobs already running. |
| `phase` | conflict 409 | Wrong phase (finale running, prosecutor waiting, case closed). |
| `claim_closed` | conflict 409 | Claim is broken or superseded. |
| `already` | conflict 409 | Already done (travel to where you are, deduction already confirmed, lab already submitted). |
| `not_host` | locked 403 | Co-op: only the lead investigator ends the day / runs the finale. |
| `locked` | locked 403 | Not unlocked yet (zone, topic, analysis, deduction) or unknown id. |
| `not_owned` | bad_request 400 | You presented / filled something that is not in the notebook. |
| `needs_tool` | bad_request 400 | Detail needs a different tool. |
| `bad_fill` | bad_request 400 | Deduction filing incomplete or malformed. |
| `quota` | quota 402 | Daily free-question allowance used. Open the paywall (`/premium?source=quota`). |
| (none) | rate_limited 429 | Too many free questions per minute. |

Schema errors (bad body) are `400 { code: 'bad_request' }` without a reason.

---

## 2. Time

The investigation runs on **game minutes**, never real time. A case has `days × minutesPerDay`
(Kessler: 3 × 480 = 1440, a day runs 08:00–16:00).

### Cost table (defaults; a case may override, always read `view.clock.costs`)

| Action | Endpoint | Minutes |
|---|---|---|
| Travel to a place | `travel` | 30 (0 if already there → refused `already`) |
| Open a close-up (visible zone) | `inspect` | 20 (re-opening an inspected zone: 0) |
| Probe with UV / dust (hidden zone search) | `probe` | 10 on a miss, 10 + 20 on a hit; needs 30 available |
| Tap a detail inside a close-up | `detail` | 0, or 10 if the detail needs a tool (UV, dust, camera) |
| Collect a phrase from a document | `collect` | 0 |
| Send to the lab / collect results | `lab`, `lab/collect` | 0 (result arrives 120–360 game minutes later) |
| Start an interview | `interview` | 30 (0 if already open) |
| Raise a topic | `topic` | `costs.openTopic` (0 by default) |
| Press a claim | `press` | 15 |
| Present a fact / evidence against a claim | `present` | 15 |
| Free question | `ask` | 15 (also counts towards the daily question allowance) |
| File a deduction | `deduce` | 0 if right; 30 if wrong (capped at the minutes left today) |
| Hint | `hint` | 45 |
| End the day | `end-day` | 0 (the rest of the day is forfeited) |
| Finale | `finale`, `finale/answer` | 0 |

An action is only accepted if it fits in what is left of today (`clock.remainingToday`). When nothing fits
(`clock.dayOver === true`) the client should push the player to **End day**.

### Lab

* Free, but the result is ready only `minutes` after submission (`LabOptionView.minutes`, shown before submitting).
* At most `lab.slots` (2) jobs **running** at once. A job stops counting as soon as it is ready, even if not collected.
* Labs work **overnight**: absolute game time continues through the night (a 6-hour job sent at 15:00 is ready 21:00, i.e. next morning).
* A ready job must be **collected** (`POST lab/collect`, free) to get its evidence/facts. Show a counter (`lab.ready`) and a "Collect" call to action. `event.labReady` lists jobs that finished during the action just taken — that is your "result ready" toast.

### Day end and the last day

* `POST end-day` (lead only in co-op) closes all interviews, writes a **day report** (`event.report`, also kept in `view.reports`), runs the scripted **night event** if any (`report.night`), and moves to the next morning (`minute = 0`).
* Ending the **last** day sets `phase = 'awaiting_finale'`: only `finale` (and `lab/collect`, `collect`) are accepted. Show the prosecutor's meeting (`view.finaleIntro`) and the list `view.accusable`.
* The player may start the finale at any time before that.

---

## 3. Endpoints

All `POST` bodies are JSON. All responses are `V2Response` unless noted.

| Method & path | Body | Notes |
|---|---|---|
| `GET /sessions/:id/v2` | — | → `InvestigationView`. Marks everything as seen for this viewer (`isNew` flags). |
| `PUT /me/locale` | `{ locale: 'en' \| 'tr' \| null }` | → `Profile` (now with `locale`). `null` = follow the device. |
| `POST …/v2/travel` | `{ locationId }` | |
| `POST …/v2/inspect` | `{ zoneId }` | Visible zone at your current place. `event.zoneId`, `newFacts`, `newEvidence`. `outcome: 'already'` when re-opened (free). |
| `POST …/v2/probe` | `{ locationId, tool: 'uv' \| 'dust', x, y }` | `x, y` in 0..1 scene coordinates. `outcome: 'hit'` (then `zoneId` is the newly found zone, already inspected) or `'miss'` (`message` says so). |
| `POST …/v2/detail` | `{ zoneId, detailId, tool? }` | `tool` must equal the detail's `tool` when it has one (`camera` for photo details). |
| `POST …/v2/collect` | `{ evidenceId, key }` | `key` from a document `Segment`. `outcome: 'already'` if held. |
| `POST …/v2/lab` | `{ analysisId }` | Submits a job. Locked analyses fail with `locked` and their localised `lockedReason` as `error`. |
| `POST …/v2/lab/collect` | `{ analysisId? }` | Collects all ready jobs (or one). `outcome` = number collected (string). |
| `POST …/v2/interview` | `{ suspectId }` | Start / resume. `event.line` = the suspect's opening. `event.patience`. |
| `POST …/v2/interview/leave` | `{ suspectId }` | Free. Patience is **not** refilled by leaving and coming back the same day. |
| `POST …/v2/topic` | `{ suspectId, topicId }` | Raise an `available` topic. Suspect answers (`line`), `newClaims`. |
| `POST …/v2/press` | `{ suspectId, claimId }` | `outcome`: `detail` (new facts/evidence), `advance` (the suspect moves on: `newClaims`), `nothing` ("That is all I have to say"). |
| `POST …/v2/present` | `{ suspectId, claimId, itemId }` | `itemId` = fact or evidence id. `outcome`: `break`, `resist`, `wrong`, `ended`. See §5. |
| `POST …/v2/ask` | `{ suspectId, text }` | Free question (≤ 600 chars, trimmed to 400). `outcome`: `opened` (raised a topic), `repeat`, `deflect`. |
| `POST …/v2/deduce` | `{ deductionId, fills? , order?, outlier? }` | `fill`: `fills = { blankId: value }`. `timeline`: `order` (card ids) + `outlier` (the card set aside) when `hasOutlier`. `outcome`: `confirmed` (+ `unlocked`, `message` = confirm text) or `wrong` (`message` "It doesn't hold."; never says which blank). |
| `POST …/v2/hint` | — | `ok:false, cost:0` when there is nothing to say. `message` = hint. |
| `POST …/v2/end-day` | — | `event.report` = `DayReportView`; `outcome`: `next_day` or `last_day`. |
| `POST …/v2/finale` | `{ accusedId }` | Starts the confrontation. Wrong person → immediate `outcome: 'wrongful'` with `line` (their defence), `message` (the collapse) and `result`. |
| `POST …/v2/finale/answer` | `{ itemId }` | Fact, evidence or **confirmed deduction** id. `outcome`: `won`, `retry`, `lost`; on the last round also `result`. |

---

## 4. The view (`InvestigationView`)

Field meanings beyond the type comments:

* `phase` — `investigating` → (`awaiting_finale`) → `finale` → `closed`. Drive the shell from this.
* `clock` — always visible in the top bar: `day/days`, `timeLabel`, `remainingToday`, lab counter (`lab.running`, `lab.ready`). `spent` vs `elapsed`: spent = minutes of actions; elapsed = calendar time used (ended days count in full). The Clock star uses `totalBudget − elapsed`.
* `map.places` — places you can travel to (`here`, `travelCost`, `zonesLeft` = visible zones not yet inspected). `map.current` is `null` at the start ("Station", `currentName`).
* `scenes[]` — one per open place with a scene: `zones` (visible zones + hidden ones already found), `plan` (v1 sketch for a fallback drawing), `art` (key for the art plate), `probeTools`. A zone's `closeUp` exists only once inspected; its `details` always show position and required tool, but `label`, `text` and what they yielded only once found.
* `notebook.facts` — collected facts in discovery order: `text`, `time` (if any: makes it a time chip), `about` (person ids), `source` (`type` + a localised `label` such as the document or suspect name), `found` (game time), `isNew`.
* `notebook.evidence` — evidence held. `body` is the document split into `Segment`s; a segment with a `key` is tappable. `mark: 'underline'` = draw as important; `mark: 'plain'` = tappable but look like normal text (the player has to notice it). `collected`/`factId` once taken. `analyses` = lab options for that item with `status`, `minutes`, `readyAt`, and the result once `done`.
* `lab.jobs` — every job ever submitted with `status` running / ready / collected and `minutesLeft`. `lab.nextReady` = the next running job to finish (`GameTime` + `minutesLeft` + `name`), possibly after tonight — the top strip's countdown.
* `suspects[]` — profile, `composure` (4 levels: composed / uneasy / strained / breaking — it only ever slips: every break costs at least 10 stress, negative tier stress is ignored in v2), `availableNow`, `availability` (wall-clock windows per day, optional `note`), `interview` (`open`, `patience`/`maxPatience`, `refusedToday`), `topics`, `log` (the interview transcript, localised, `from` player/suspect/system; player lines carry `action`, `claimId`, `itemId`, `outcome`).
* `suspects[].topics[]` — only topics that are `available` (can be raised) or `open`. `claims` lists every claim card heard on that topic: `active` (current tier — press/present it), `broken` (you broke it), `superseded` (the suspect moved on past it). `canPress` false after a press.
* `deductions[]` — visible questions. `prompt` contains `{blankId}` tokens to replace by drop zones. Blank `type` says which chips fit (§6). `cards` (timeline) come in a stable shuffle (hash of case + card id) that the server checks is neither the solution order nor its reverse; once confirmed they come in the proven order and `setAside` names the card that did not fit. Use the order as given — no client shuffle. `filled` shows the accepted fills once confirmed. `isNew` = appeared since the start of the current day and not yet attempted. `deductionsTotal` = how many questions the case has (a number only).
* `chips` — everything droppable, grouped: `facts`, `evidence`, `people` (all suspects and people), `times` (times of held facts), `places`, `deductions` (confirmed ones; presentable only in the finale).
* `hints` — `available` and `cost`; `used` = texts already given.
* `reports[]` — every day report so far (for a "case diary").
* `finale` — once started: `intro`, `rounds` (`defence` and `prompt` only for the current and past rounds; `status`, `triesLeft`, `firstTry`, `reaction` once decided, `suggested` = chips brought forward because a linked deduction is confirmed), `collapse` for a wrong accused, `confession` text when every round was won.
* `accusable` — who can be accused; `finaleIntro` — the prosecutor's meeting text (available from the start).
* `result` — once closed: `outcome` (confession / charged / weak / wrongful), localised `title`/`detail`, `stars {truth, proof, clock}`, numbers, and the `debrief` (same shape as v1 — the truth is revealed only here).

`isNew` flags are per viewer and cleared by that viewer's next `GET /v2` or action.

---

## 5. State machines

### Interview (per suspect)

```
closed ──POST interview (30, needs availableNow)──▶ open
open ──leave / end-day / finale──▶ closed
open ──present wrong with patience 1──▶ closed + refusedToday (until next morning)
next morning: patience refills to maxPatience
```

Inside an open interview:

```
topic available ──POST topic──▶ open @ tier 0  (claims of tier 0 become active)
claim active ──press──▶ detail | advance (tier jumps, new active claims) | nothing (card spent)
claim active ──present item──▶
     item breaks it & requirement met   → BREAK: claim broken, topic jumps tier, new claims, composure ↑
     item breaks it, requirement unmet  → RESIST: suspect holds, no patience lost
     item does not break it             → WRONG: patience −1 (0 → interview ends for today)
```

A suspect only confesses in the finale. Free questions (`ask`) never break claims: they raise a topic or
repeat the current answer.

### Deduction

```
hidden ──requirements met──▶ open ──deduce right──▶ confirmed (effects: unlock analysis/topic/place/zone/deduction, grant facts)
                              open ──deduce wrong──▶ open (attempts+1, −30 min)
```

### Lab job: `available → running → ready → (collect) → done`. `locked` until its requirement/deduction.

### Day / phase

```
investigating ──end-day (not last)──▶ investigating (day+1, night event)
investigating ──end-day (last day)──▶ awaiting_finale
investigating | awaiting_finale ──finale(accused)──▶ finale ──last round──▶ closed
                                   finale(innocent) ──▶ closed (wrongful)
```

### Finale (true culprit)

4–5 rounds in order: opportunity → lie → motive → means → staging (a case may use 4). Each round: the
accused's `defence`, the `prompt`, **2 tries**. Right item → `won` (first try remembered). Two misses → `lost`
(the accused slips past) and the next round starts. After the last round:

| Rounds won | Outcome |
|---|---|
| all | `confession` (confession line, statement recorded) |
| ≥ 60% | `charged` |
| fewer | `weak` ("Right name, weak case") |

Stars: **Truth** = right culprit and the motive and means rounds won. **Proof** = rounds won at first try
≥ rounds − 1 and confirmed deductions ≥ 60%. **Clock** = time left (budget − elapsed) ≥ 25% of the budget.
Wrong culprit: 0 stars.

---

## 6. Chips — what goes where

| Where | Accepts |
|---|---|
| `present` against a claim | fact id or evidence id you hold |
| Deduction blank `fact` / `evidence` | a held fact / evidence |
| blank `person` | any id from `chips.people` |
| blank `time` | a value from `chips.times` (e.g. `"23:04"`) |
| blank `place` | an open place id |
| blank `choice` | one of the blank's `options[].id` |
| Finale answer | fact, evidence, or confirmed deduction id |

Equivalents are accepted (several facts may prove the same point).

---

## 7. What to show for each event (suggested feel, PLAN §5)

| Event | Show | Haptic |
|---|---|---|
| any `cost > 0` | clock ticks forward by `cost` | — |
| `newFacts` / `newEvidence` | chip flies into the notebook | light |
| `labReady` | "Lab result ready" toast with Collect | light |
| `press: detail/advance` | new line, new claim cards slide in | light |
| `present: break` | claim card cracks, portrait reacts (`line.emotion`), composure meter moves | medium + double |
| `present: resist` | suspect holds; card shakes | light |
| `present: wrong` | patience pip lost | warning |
| `present: ended` | interview closes, `message` | warning |
| `deduce: confirmed` | stamp lands, `message`, `unlocked` list | heavy |
| `deduce: wrong` | "It doesn't hold." | warning |
| `end_day` | day transition, report screen, night event card | — |
| `finale_answer: won/lost/retry` | round resolves, next defence | heavy / warning / light |
| `result` | verdict + three stars + debrief | heavy |

---

## 8. Co-op (wave 1 behaviour)

* One shared clock, notebook, lab, interviews and deductions for the whole room (per-player budgets are wave 4).
* Anyone can investigate; **only the lead** ends the day and runs the finale (`not_host` otherwise).
* `room.activity` entries are localised per viewer, including place/zone/detail/analysis names (stored as `@loc:id` style references) and the room events (opened, joined, left, locked, removed).
* All actions are serialised per session; simultaneous actions both apply.

## 8b. Catalogue and profile (wave 3)

* `CaseSummary.tutorial` — the teaching case (`meta.tutorial` in the case). The app opens it on first launch; do not match ids.
* `CaseSummary.session.stars` (latest session, once closed) and `CaseSummary.bestStars` (best over all closed sessions).
* `Profile.stars` (sum of best stars per case), `Profile.history[].stars`, localised `Profile.rank` / `nextRank.name`; ranks: 0 / 2 / 4 / 6 / 9 / 12 stars.
* `V2Event.claimId` on every press / present event.

## 9. Analytics (server-side, no typed text)

New events: `location_travelled`, `zone_inspected`, `scene_probed`, `detail_found`, `fact_collected`,
`lab_submitted`, `lab_collected`, `interview_started`, `topic_opened`, `claim_pressed`, `claim_presented`
(outcome, patience), `free_question` (outcome), `deduction_filed` (correct), `hint_used` (`v2: true`),
`day_ended` (ended_day, unused_minutes, last), `finale_started` (culprit_correct), `finale_round` (outcome),
`finale_finished` (outcome, stars, rounds_won, minutes_left). Every v2 event also carries `case`, `mode`,
`day`, `cost`, `plan`.

---

## 10. How to author a case (for Agent B)

A case is one `CaseDefinition` (`server/engine/types.ts`). v1 fields still hold the truth (suspects,
topics/tiers, evidence, analyses, statements, truth narrative). v2 adds:

* **`Text`** — every player-facing string is `{ en, tr }`. A plain string means "English only" and is allowed
  only while `meta.contentStatus: 'draft'`. A final case must have both languages everywhere (the validator
  lists every missing string). AI-internal fields (`background`, `personality`, `tier.facts`, …) stay English strings.
* **`def.v2`** — `clock`, `facts`, `scenes`, `deductions`, `finale`, `nightEvents`, `idealPath`.
* **On existing objects** — `briefing.startingFacts`, `analysis.v2 { minutes, locked?, facts? }`,
  `location.v2 { locked?, travel? }`, `suspect.v2 { patience }`, `topic.v2 { chips?, requires?, locked? }`,
  `tier.claims[]`.
* **Document markup** — in an evidence `body` line: `{{f-id|phrase}}` (underlined) or `{{?f-id|phrase}}`
  (plain, must be noticed). Both languages must mark the same facts in the same order per line.

You may write v2 inline, or keep the v1 file and attach v2 with `withV2(base, overlay)` from
`server/cases/overlay.ts` (Kessler does this; `marks` lets you mark phrases without retyping lines, and the
helper refuses any change to document text).

### Annotated example

```ts
// a fact: one sentence, optional time (→ time chip)
{ id: 'f-clara-2304', text: { en: 'Clara’s fob opened the back door at 23:04.', tr: 'Clara’nın kartı arka kapıyı 23.04’te açtı.' }, time: '23:04', about: ['clara'] },

// a document line that yields it when tapped
body: [{ en: '13/03 23:04  BACK  entry  {{f-clara-2304|fob #02 C. KESSLER}}', tr: '13/03 23:04  ARKA  giriş  {{f-clara-2304|kart #02 C. KESSLER}}' }],

// a tier answer split into claim cards
tiers: [
  { stance: 'lie', line: {…}, facts: [...], emotion: 'guarded', statements: ['s-clara-home'],
    claims: [{
      id: 'c-clara-home', text: { en: 'I was at home all evening.', tr: '…' },
      press: { line: { en: 'Groceries, then bed before eleven.', tr: '…' } },        // press → a detail
      breaks: [{ by: ['f-clara-2304', 'f-volvo-in', 'ev-accesslog'] }],             // present any → next tier
    }] },
  { stance: 'lie', line: {…}, …, claims: [{ id: 'c-clara-left', text: {…}, breaks: [{ by: ['f-exit-2338'] }] }] },
],

// a break that needs more first: right item, but she holds (no patience lost)
breaks: [{ by: ['ev-workbook'], requires: { evidence: ['ev-geneva'] }, resist: { en: 'Jonas can write anything.', tr: '…' } }],

// a press that moves the suspect on once something else is known
press: { line: {…}, toTier: 1, requires: { statements: ['s-miriam-visit'] } },

// a deduction with typed blanks and equivalents; confirming unlocks a lab warrant
{ id: 'd-copy', kind: 'fill', title: {…}, prompt: { en: 'The violin is {what}. {maker} made it for {client}.', tr: '… {what} … {maker} … {client} …' },
  blanks: [
    { id: 'what', type: 'choice', options: [{ id: 'o-copy', text: {…} }, { id: 'o-original', text: {…} }], accept: ['o-copy'] },
    { id: 'maker', type: 'person', accept: ['jonas'] },
    { id: 'client', type: 'person', accept: ['clara'] },
  ],
  requires: { evidence: ['ev-copyreport'] },                         // when it appears
  effects: [{ type: 'unlock', target: 'analysis:a-finance' }],       // a-finance has v2.locked: true
  confirmText: {…} },

// a timeline deduction: order the true cards, set the lie aside
{ id: 'd-timeline', kind: 'timeline', cards: [...], order: ['k1','k2','k3','k4','k5'], outlier: 'k6', … },

// a finale round
{ id: 'r-means', kind: 'means', defence: {…}, prompt: {…}, accept: ['f-mallet-blood', 'ev-serology', 'd-weapon'], assist: ['d-weapon'], win: {…}, lose: {…} },
```

Unlock targets: `analysis:<id>`, `topic:<suspectId>:<topicId>`, `location:<id>`, `zone:<id>`, `deduction:<id>`.
Requirements (`Requirement`) can use `evidence`, `statements`, `analyses`, `contradictions`, `facts`, `deductions`.

### Scenes

Each zone is a shape on a 0..1 canvas (`rect`, `circle`, `poly`). `reveal: 'visible'` zones are listed;
`'uv'`/`'dust'` zones exist for the client only after a probe hits them. `hotspotId` links a zone to a v1
hotspot (inspecting it reveals that hotspot's evidence). Details sit on the close-up card (0..1) and may need a
tool. Every fact must have at least one reachable source.

### The ideal path

`v2.idealPath` is a scripted perfect run (steps: travel, inspect (hidden zones are probed at their centre),
detail, collect, lab, labCollect, interview, leave, topic, press, present, deduce, endDay, finale). The
validator replays it under the real rules. It must end in a **confession** and spend **≤ 65%** of the budget.

### Validator (rejects the case if…)

* any reference is unknown, ids repeat, a lab delay is outside 120–360, a finale has other than 4–5 rounds,
  an innocent suspect has no collapse, or something locked has nothing that unlocks it;
* any deduction is unsolvable or any fact has no reachable source (exhaustive simulation, unlimited time);
* no accepted answer of a finale round is reachable;
* the ideal path fails a step, does not end in a confession, or uses > 65% of the budget;
* (final cases) any content string lacks `en` or `tr`; document markup differs between languages.

Warnings: draft strings without Turkish, patience outside 3–5, details that yield nothing, unreachable zones or
claims, "doing everything fits in the budget" (exhaustive < 100%).

Commands: `npm run validate:cases`, `npm run simulate:budget [-- --steps]`, `npm run check`.

---

## 11. Deliberately left out (wave 1)

* ~~No "wait" action~~ — added in v2.1 (§12).
* Per-player clocks in co-op, co-op deduction drafts, "suggest evidence" in the finale (wave 4).
* AI phrasing of v2 lines: v2 answers are always the authored lines (free questions use the AI only to classify,
  when configured). The v1 interrogation endpoint still phrases with AI.
* Easy mode ("missed facts flagged at day end"), idle glow hints (client-side; zone centres are not sent for hidden zones).
* Detail positions inside an inspected close-up are visible before they are found (only their content is hidden).
* Tappable plain segments are distinguishable to someone reading the JSON (they have a `key`).
* v1 endpoints return English only.
* The tutorial case ("İlk Nöbet") and the real bilingual Kessler content — Agent B.

---

## 12. v2.1 — the fun pass (Agent J, PLAYTEST_V2 §7). Additive; overrides the older lines above where they differ.

**Presses say beforehand whether they pay.** `ClaimView.press`: `yes` (yields a fact, evidence or a new tier —
costs `pressCost` = `costs.press`), `free` (the suspect's colour only, costs nothing, then `done`), `later` (something
is behind it but a requirement is unmet — refused for free with reason `press_later`), `none` (nothing behind it —
refused `nothing_to_press`), `done` (pressed). `canPress` = `yes | free`. `POST press` outcomes: `detail`, `advance`
(15 min), `colour` (free). The old `nothing` outcome (15 min for nothing) no longer happens.

**One answer, claims inside it.** `InterviewLineView.claims` = `{ claimId, start, end }[]` spans of `text` (the
authored `ClaimDef.anchor`, or matched sentence by sentence; stage directions in parentheses are never inside a
span); `looseClaims` = claim ids of that answer that are not a span (show them as short quotes under it).

**Composure.** Every break moves `composure` at least one stage until `breaking`; `SuspectV2View.pressure` (0..100)
moves on every break; a `present → break` event carries `composure: { from, to }`. Dismissals rotate in order per
suspect (5–6 lines each); a break without its own `resist` line uses the suspect's `resists` in turn.

**Waiting.** `POST …/v2/wait` `{ minutes }` (15–240) or `{ until: 'lab' | suspectId }`. Costs exactly the minutes
waited (counts in `spent`), lead only in co-op, refused `wait_nothing` when nothing is due before the day ends.
`clock.waits = { lab?, suspects: [{ id, minutes }], min, max }` lists what can be waited for right now.

**The last day.** Ending it spends the day in full (`remainingToday = 0`, `elapsed = totalBudget`, so the
prosecutor screen shows no unused minutes) and running lab jobs finish overnight. In `awaiting_finale`, `deduce`
is accepted as well as `collect`/`lab/collect`/`finale`: wrong filings cost no time but each question allows two
(`DeductionView.triesLeft`, then `late_limit`).

**Nudges.** From the second wrong filing of the same question, `event.message` adds one direction — the blank to
look at again (by its label; "the rest holds" only when exactly one blank is wrong), or for a timeline the set-aside
card / the order. Never a value. Kept as `DeductionView.nudge`.

**The Clock star up front.** `clock.clockStar = { minutesLeftNeeded, share, by, state }` — `by` is the latest game
time to reach the prosecutor and keep the star (Kessler: day 3, 10:00; tutorial 06:15). `state`: open / lost / won.

**Also.** `InvestigationView.case.tutorial`; `FinaleRoundDef.refutes` (lie statement ids a won round exposes — the
debrief no longer lists them as missed); new reasons `nothing_to_press`, `press_later`, `wait_nothing`, `late_limit`;
new event kind `wait`; analytics event `waited { minutes, until: lab | suspect | minutes }`.

**Authoring.** `CaseV2.newcomerPath { steps, firstWinBy, firstWinRealMinutes, minConfirmedDay1 }` — a sensible
first-timer (path steps `wrongDeduce`, `wrongPresent`, `wait` are allowed); the validator replays it and rejects the
case if the first confirmation comes later than `firstWinBy` game minutes or ~`firstWinRealMinutes` estimated real
minutes, or if fewer than `minConfirmedDay1` deductions are confirmed on day 1. The validator also rejects any press
that costs time and yields nothing.

---

## 13. Wave 4 — balance and case-aware wording (Agent K). Additive; nothing existing changed shape.

### Night forks (new endpoint)

After `end-day` a night may put a **decision** in front of the player, beside the usual story event: chase something
tonight (it costs minutes of the next morning) or leave it to the lab (it takes one of the two slots from the start of
the day). Kessler has two: *Clara’s car* after day 1 (once *The late visitor* is confirmed) and *Geneva is awake* after
day 2 (once *The violin in the vault* is confirmed).

| Where | What |
|---|---|
| `InvestigationView.fork?: NightForkView` | present **only while the fork waits for an answer** (the morning after) |
| `DayReportView.fork?: NightForkView` | the fork offered after that day, with `chosen` once settled (history / day report screen) |
| `NightForkView` | `id, title, text, prompt, options[{ id, label, text, minutes, lab?: { analysisId, name, minutes } }], defaultOption, chosen?, pending, newFacts, newEvidence` |
| `POST …/v2/night-choice { optionId }` | answers it. `V2Event.kind = 'night_choice'`, `cost` = the option's minutes (counted in `spent`), `message` = the option's text, `newFacts` / `newEvidence` / `unlocked`, `outcome` = option id. Lead only in co-op (`not_host`). |
| refusals | `no_fork` (409, nothing waiting), `locked` (unknown option) — free as always |
| **default** | any other action (travel, lab, end-day, finale …) first settles a waiting fork with `defaultOption` (always the "lab" option: no minutes). An old client therefore keeps working; it just never chases. |

Suggested UI: show the fork card on top of the morning (Map / day report) with the two options side by side — the
minutes on one, the lab slot and its ready time on the other — and the prompt as the question. After the choice, a
toast with `event.message`. Analytics: `night_choice { option, minutes }`.

### The Proof star made legible

* `InvestigationView.proofStar = { deductionsNeeded, deductionsConfirmed, deductionsTotal, firstTryNeeded, roundsTotal }`.
  Kessler now has 13 questions and the star needs **11** (it used to need all 10): three of them are optional side
  questions, so the player chooses which roads to take. Show "★ Proof: 7 of 11 deductions" like the Clock star line.
* `V2Result.proofNeeds = { firstTry, deductions }` — what the star needed (the verdict's "why" line:
  `finale.star.proofWhy` can say "{d} of {need} needed" instead of "{d} of {dt}").

### Case-aware wording

* `CaseSummary.crime`, `InvestigationView.case.crime`, `V2Result.crime`: `'murder' | 'theft'` (default murder;
  First Watch is a theft). The server's verdict line (`result.detail`) is already worded for the crime ("You named the
  thief, but the defence found room." / "Hırsızı doğru buldun ama savunma bir açık yakaladı."). Client strings that
  name a killing (e.g. `finale.star.truthPart` "…the motive or the **weapon** never landed") should pick a crime-neutral
  or theft wording when `crime === 'theft'` (request in `docs/handoff/K.md`).

### New content the client meets (Kessler)

* Places: `loc-varga` (Ilse Varga's flat), `loc-clara` (Clara's flat — locked until *The late visitor*),
  `loc-bank` (Nordbank — opens with the diary line "Bank?? (C.)"), `loc-pawn` (Kaiser Pfand — opens when the bow is
  missing). Travel 30 / 45 / 45 / 45 (`PlaceView.travelCost`). Scene art keys `kessler/varga`, `kessler/clara-flat`,
  `kessler/bank`, `kessler/pawn` and close-up keys (`kessler/varga-window`, `kessler/clara-coat`, …) have no plates
  yet: the code-drawn plan is the fallback.
* An office zone `z-tray` (letter tray), Miriam's topic `t-clause` ("Clause nine"), Clara's earring topic now breaks.
* Deductions `d-courtyard`, `d-money`, `d-clean`; optional lab jobs `a-brandl`, `a-volvo`, `a-halberd` (the last two
  only through a fork; they show as locked options on their evidence with a reason).

### Authoring and validation

* `meta.crime`; `NightEventDef.choice = { prompt, options: NightOptionDef[] }` with `NightOptionDef = { id, label,
  text, minutes?, grants?, unlock?, lab? }` (the first option is the default; give it no minutes). A fork gives through
  its options, never through `grants`/`unlock` of its own; forks and story events are separate channels (the first
  matching of each fires). Path step `{ do: 'nightChoice', option }`.
* Validator: a **full case** (not `meta.tutorial`) is rejected if the exhaustive player — every useful move once, every
  night fork chased (its costliest option) — needs less than **125 %** of the budget (`EXHAUSTIVE_MIN_SHARE`); the ideal
  path limit stays 65 %. Fork options must each give something; a fork needs two options; option minutes ≤ half a
  day. Evidence reachability of a v2 case is checked by the v2 exhaustive player (zones, presses, forks), not by the
  v1 simulation.

---

## 14. Wave 5 — deep co-op (Agent N). Additive; solo play is unchanged (same numbers, no new fields).

Everything below exists only in a shared investigation (`mode: 'coop'`). Solo views carry none of these fields.
§8's "one shared clock" no longer holds; the rest of §8 (lead-only day end and finale, serialised actions) does.

### Per-player clocks

* Every investigator has **their own clock and place**. Actions cost the acting player's minutes; travel puts only that
  player at the place (scene actions elsewhere are refused `not_here`). Lab, notebook, deductions, interview state and
  suspects' patience stay shared. Lab readiness and suspect hours are judged on the acting player's clock.
* **Budget.** Each investigator may spend `clock.budget.perPlayer` minutes a day: `minutesPerDay × share(team size)`,
  rounded to 5 (defaults 2: 0.6 → 290, 3: 0.42 → 200, 4: 0.36, 5: 0.31, 6: 0.27; `CaseV2.coop.share` overrides). A team
  has more than one investigator's day (2 → 121 %, 3 → 125 %) but less than everyone walking around together: a team
  that moves as one pays every trip once per head and runs out (see the simulator below). The size is fixed each
  morning from the members in the room; while nobody has spent anything today, joins and leaves still change it.
* `clock` is the viewer's: `minute` / `timeLabel` / `remainingToday` (= min(calendar left, budget left)) and `budget =
  { perPlayer, used, teamSize }`. `totalBudget = days × perPlayer`, `elapsed = (day − 1) × perPlayer + the busiest
  member's use today`, so the Clock star asks the same of a team as of one player (`clockStar.by` is in work time).
* **Waiting** (`POST wait`) is free of budget in co-op (only your calendar moves) and anyone may wait.
* **The day ends** when the lead ends it (`end-day`, lead only), or by itself once every *playing* member (online, or
  acted today) is done: `POST …/v2/done { done: boolean }` ("I'm done for today"), or out of time (less than the
  cheapest move left). The action that completes the set returns `event.dayEnded` (the closed day's report) and the
  view of the next morning; everyone else follows by the pulse (the desk's day-turn watcher opens the report).
* The day report's `unusedMinutes` is the sum of every member's unused budget.

### The team (`InvestigationView.team`)

`TeamView { perPlayer, teamSize, members: TeamMemberView[] }` — per member: `isLead`, `isYou`, `online`, `location` +
`locationName`, own `timeLabel`, `used`, `remaining`, `done`, `intent?`, `questioning?` (the interview they hold),
`privateNotes` (a count, never what).

### Intents

`POST …/v2/intent { kind: 'go' | 'interview' | 'lab' | null, target? }` — "I'm going to X / questioning Y / waiting for
lab Z" (null clears). Free. Shown as `TeamMemberView.intent { kind, target, label }`, on places
(`PlaceView.team: TeammateMark[]`, `status: 'here' | 'heading'`) and on people (`SuspectV2View.team`, `status:
'questioning' | 'heading'`). Cleared when done (arrived, interview started, result collected) and every morning.
Activity lines: "is heading to Bank", "will question Jonas", "is waiting for the lab: …".

### Interviews are held

The investigator who opens an interview holds it (`SuspectV2View.interview.heldBy { id, name, you }`). The others follow
the shared log, but `topic` / `press` / `present` / `ask` / `leave` from them are refused **`held`** (409, free, "Demir is
questioning them right now"). Each investigator holds one interview at a time (starting another leaves the first). A
holder who left the room no longer blocks it.

### Deduction drafts and suggestions

* `POST …/v2/draft { deductionId, fills?, order?, outlier? }` — pencil in without filing. Fills merge into the team's
  draft (an empty value clears that blank); values must be chips the team holds (`not_owned` / `private`).
* `POST …/v2/draft/suggest { deductionId, blankId, value }` — a suggestion for one blank (`blankId: 'outlier'` for a
  timeline's set-aside card); one per player per blank. A suggestion the draft adopts disappears.
* `POST …/v2/draft/clear { deductionId }`.
* `DeductionView.draft = { fills: [{ blankId, value, label }], order?, outlier?, by, suggestions: [{ by, blankId, value,
  label }] }`; gone once the question is confirmed.
* **Filing stays `POST deduce`, and anyone may file.** Why: a wrong filing costs the filer's own clock, so whoever
  decides pays for it; lead-only filing would make the lead a bottleneck whose scarce minutes the team has to queue
  for, and the shared draft already makes a filing visible to everyone before it happens.

### The finale with the team

The lead runs it as before (`finale`, `finale/answer` lead only). `POST …/v2/finale/suggest { itemId }` — any member puts
an item forward for the current round (one per player per round, replaced on resend; it must be the team's).
`FinaleView.suggestions = [{ by, itemId, label }]` for the current round, oldest first. Refused `phase` outside a
running confrontation with the culprit.

### Private notes (private sources)

* `CaseV2.coop.private = { locations?, evidence? }`. In a room of two or more, what an investigator finds at a private
  location (its zones and details), and private evidence items (with the phrases collected from them), go to **their
  own notes**, not the team's notebook. Kessler: `loc-bank` (the loan file and the settlement slip) and `loc-pawn` (the
  pledge book).
* The finder sees them in `notebook.facts` / `notebook.evidence` with `private: true` (never in `chips`); the others see
  only `TeamMemberView.privateNotes` (a count) and `PlaceView.private: true` on the place.
* Using a private item (present, file, draft, suggest, lab, finale) is refused **`private`** (409, free: "Read it out to
  the team first"). Requirements are judged on the team's notebook, so a question or place that needs it stays hidden.
* `POST …/v2/share { itemId? }` — read one item out (a document comes with the phrases you collected from it), or all
  of them: they enter the team notebook as new. Free; allowed until the case closes. If the team learns the same thing
  another way, it leaves every private note.
* A member who leaves (or is removed) leaves their notes on the desk: everything they held is read out automatically.

### Lead and members

* `POST …/v2/handover { playerId }` (lead only) — hand the lead to another member.
* `POST …/v2/claim-lead` — any member takes the lead when the lead has not pulsed for 90 s (`not_host` otherwise).
* `POST /sessions/:id/leave` by the lead now hands over to the longest-serving member (refused only when alone).
* Leaving: private notes read out, held interview closed, intent and finale suggestions dropped; minutes already spent
  stay spent. All actions stay serialised by the per-session mutex; every one bumps `version`.

### Also

* `DayReportView.night.id` — the night event's id (Agent M's request), for art lookups.
* New reasons `private`, `held`; new event kinds `intent`, `done`, `share`, `draft`, `suggest`, `finale_suggest`,
  `handover`; `V2Event.dayEnded`.
* Analytics (never typed text): `intent_marked { kind }`, `done_for_today { done }`, `notes_shared { facts, evidence }`,
  `draft_saved { deduction }`, `draft_suggested { deduction }`, `finale_suggested`, `lead_handed_over { claimed }`,
  `day_ended { auto: true }` for a day that ended by itself.
* **Validator:** `coop.private` must name existing locations (not the start) and evidence (not held from the start).
  Teams of 2 and 3 replay the ideal path split between them (unlimited time; every rotation of who takes the first
  trip, so a private source lands with each investigator in turn; notes read out when a step needs them) and must
  reach a confession with every fact the solo path reaches; an exhaustive team (each scene worked by a different
  investigator) must reach every fact, deduction and item a solo exhaustive player reaches, with no note left unread.
* **Simulator** (`npm run simulate:budget`): for 2 and 3 players, the ideal path split up vs moving together under the
  real rules — the busiest investigator's use of their own day, everyone's total, and the outcome.

## 15. Wave 6 — fixes from the full playtest (Agent O). Additive.

* **Capped misses at the end of a day.** While `phase === 'investigating'` and today has less time left than
  `costs.wrongDeduction`, a question takes at most 2 wrong filings (they charge what is left, often 0). The third is
  refused *before* it is judged with `409 no_time` (so the refusal says nothing about the answer), and resets next
  morning. `DeductionView.triesLeft` is now also set in that state (it used to be set only after the last day).
* **Co-op Clock star in work time.** `clock.clockStar.work` (co-op only): minutes of that day's work by the busiest
  investigator; `by.label` is then nominal. The client shows "day 3, within 1 h 12 min of work".
* **Late joiners.** A member who joins after the day's budget was fixed gets `budgetFor(team size now)` for the rest
  of that day (`PlayerClock.budget`, cleared every morning); `clock.budget.perPlayer` is the viewer's own.
* **Leaving / removal ends an all-done day.** If everyone left in the room is done or out of time, the day ends as if
  the last of them had pressed done (`act_day_all`, analytics `day_ended {auto: true}`).
* **Errors.** `ServiceError` sets `name = 'ServiceError'`; the HTTP layer maps any error with that name and a code
  (`isServiceError`), so a second module copy can no longer turn a 409 into a 500.

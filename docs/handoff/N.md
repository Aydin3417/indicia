# Handoff — Agent N · Deep co-op (wave 5)

Co-op used to share one clock, so a team gained nothing by splitting up. Now each investigator has their own clock,
budget and place; they mark where they are going; they pencil in deductions and suggest chips; teammates suggest
answers in the finale; and in Kessler what one investigator sees at the bank or the pawnshop stays in their own notes
until they read it out. Solo play is unchanged: same numbers, no new fields in a solo view, and the solo ideal path
still spends 905 minutes.

No commits and no branch changes. I did not touch P's files (`src/features/{finale,scene,notebook,deduction,interview,night}`,
`src/i18n`, `assets/art`, `src/art`, `scripts/gen-art.mjs`). I left 8787 and 8140 alone and stopped the servers I
started (8796 API with `DATA_DIR=C:\temp\indicia-n`, 8155 web).

```text
npm run check   → typecheck ✓ · boundary ✓ · kessler VALID · first-watch VALID · 100/100 tests (86 before; +14 in server/engine/team.test.ts)
```

## The rules as built (the full contract is in docs/CONTRACT_V2.md §14)

| Rule | What it does |
|---|---|
| **Per-player clocks** | Each member has their own `minute`, `location`, `used` and `spent`. In co-op the engine swaps the acting player's (or viewing player's) clock into the state for the length of the call (`server/engine/v2/coop.ts` `asPlayer`), so costs, `not_here`, suspect hours and lab readiness all apply to that player. Notebook, lab, deductions, interview state and patience stay shared. |
| **Budget** | Each member gets `minutesPerDay × share(n)` per day, rounded to 5. The defaults are 2: 0.6 (290 min), 3: 0.42 (200), 4: 0.36, 5: 0.31, 6: 0.27. `CaseV2.coop.share` overrides them. While nobody has spent anything today, joins and leaves still change the size; after that it stays fixed until the next morning. Waiting is free of budget in co-op, so anyone can wait for a suspect or a lab result. |
| **Day end** | The lead can end the day. Otherwise it ends by itself once every *playing* member (online, or has acted today) has pressed `done` or is out of time. Members who are away and have not acted don't hold the team up. The action that completes the set returns `event.dayEnded`. |
| **Clock star** | Counted in one investigator's budget: `days × perPlayer`, using the busiest member's use today. |
| **Intents** | `POST v2/intent {kind: go/interview/lab \| null, target}`. They show on `team.members[].intent`, `PlaceView.team` and `SuspectV2View.team`, and in the activity feed (so they arrive as toasts). They clear on arrival, on starting that interview, on collecting that result, and every morning. |
| **Held interviews** | Whoever opens an interview holds it. Others can follow it but get `held` (409, free). Each player holds one interview at a time. A holder who left the room no longer blocks it. |
| **Drafts** | `draft` / `draft/suggest` / `draft/clear`. Draft values must be the team's chips. `DeductionView.draft` shows who wrote it and each suggestion with its author. **Anyone may file** with `deduce`: a wrong filing costs the filer's own clock, and lead-only filing would make the lead a bottleneck. The shared draft already makes a filing visible before it happens. |
| **Finale suggestions** | `finale/suggest {itemId}`, one per player per round. The lead sees `finale.suggestions` with names. Only the lead answers. |
| **Private notes** | `CaseV2.coop.private = { locations, evidence }`. Kessler uses `loc-bank` and `loc-pawn`. This only applies in rooms of two or more. Private finds go to the finder's notes (`private: true` in their notebook, never in chips). Teammates see only a count. Using a private item anywhere returns `private` (free). Requirements are judged on the team notebook, so *Follow the money* stays hidden until the slip is read out. `POST v2/share {itemId?}` reads one item or all items out. A document comes with the phrases collected from it. |
| **Leaving** | A member who leaves or is removed has their notes read out automatically, their held interview closed, and their intent and suggestions dropped. A lead who leaves hands over to the longest-serving member. `v2/handover {playerId}` lets the lead hand over. `v2/claim-lead` lets a member take over if the lead hasn't pulsed for 90 s. All of this runs inside the per-session mutex, and every action bumps `version`. |
| **Night id** | `DayReportView.night.id`. This was M's request, so `nightArt()` can use it directly now. |
| **Analytics** | `intent_marked`, `done_for_today`, `notes_shared`, `draft_saved`, `draft_suggested`, `finale_suggested`, `lead_handed_over`, and `day_ended {auto: true}`. These are ids, counts and booleans only; no player-typed text. |

**Validator** (`server/engine/v2/validate.ts`, `teamsim.ts`):
- `coop.private` must name real locations (not the start location) and evidence (not held from the start).
- Teams of 2 and 3 replay the ideal path split between them with unlimited time. Every rotation of who takes the first trip is tried, so a private source lands with each investigator in turn. They must reach a confession and every fact the solo path reaches.
- An exhaustive team (each scene worked by a different investigator) must reach every fact, deduction and evidence item a solo exhaustive player reaches, with no note left unread.
- Tests cover a case with a broken `coop.private`.

## Simulator: split vs together (`npm run simulate:budget`, real rules, Kessler)

| Team | Per player / day | Team / day | Doing everything vs capacity | Split up (busiest / budget per day) | Moving together |
|---|---|---|---|---|---|
| 2 | 290 | 580 (121 % of solo) | 1960 vs 1740 → 113 % | d1 260/290 · d2 265/290 → **confession, 3★**, team spent 905 | d1 280/290 · d2 250/290 → **9 steps fail** (out of time), finale not finished, team spent 1025 |
| 3 | 200 | 600 (125 %) | 1960 vs 1800 → 109 % | d1 190/200 · d2 155/200 → **confession, 3★**, team spent 875 | d1 200/200 · d2 195/200 → **13 steps fail**, finale not finished, team spent 1100 |

The tutorial has a single room, so splitting and moving together come out the same there (both reach a confession).
The "together" model is generous: it shares out the work at each place evenly, and it still runs out of time. The
"split" model gives each trip or interview to whoever has the most time left. It does not plan ahead, so a good team
does better than it.

## What I played with two players (two browser contexts: `localhost:8155` as Aksoy and `127.0.0.1:8155` as Demir, TR)

Screenshots are in `docs/screens/wave5-coop/` (375×812).

1. Aksoy created the room (code CABVRP) and Demir joined by `/join/CABVRP`. Both desks showed **"Ekibin"**: "Her
   birinizin günde 4 sa 50 dk vakti var…", with both members at the Station, 08:00, 4 h 50 left.
2. Demir marked **"Gideceğim yer → Atölye"** in the UI. Aksoy's map showed "Demir · Atölye yolunda", and the Workshop
   card read **"Demir buraya geliyor"**.
3. Aksoy went to the Front office (UI) and read the diary line (API). Then Aksoy went to **Nordbank** and opened the
   loan file. Demir travelled to the Workshop in the UI, and Demir's own clock showed **08:30** while Aksoy's was
   **09:55**. Demir's team panel showed "Aksoy · Nordbank · 09:55 · 2 sa 55 dk kaldı · **Elinde 1 özel not var**",
   and Demir's notebook did not have the bank papers (`01-guest-map-team-tr.jpg`).
4. Demir examined the body and the rungs, then **pencilled in "Düşme değil"** from the drafts panel above the deduction
   book, with no filing (`02`). Aksoy's Map showed **"Yalnız senin notlarında"** with the loan-papers finding and an
   **"Ekibe oku"** button (`03`). Aksoy tapped it, and the card went away and a toast followed. Aksoy's deductions tab
   showed **"Taslağı yazan: Demir"** (`04`).
5. Aksoy suggested a chip (API). Within one pulse, Demir saw **"Aksoy: Kredi evrakını Clara hazırlamış…  Bunu al"**
   and the header said "1 öneri" (`05`). Demir pressed **"Dosyaya işle"** and the deduction was confirmed. The draft
   went away.
6. Demir started Jonas (API). Aksoy's topic was refused: *"Şu an Demir sorguluyor. İzleyebilir ya da başka birine
   geçebilirsin."* (`held`). On People, Jonas read **"Bu görüşme Demir adlı müfettişte — sen izleyebilirsin"** with
   "Odaya dön · bedava" (`06`).
7. Aksoy pressed **"Bugünlük bu kadar"**, and his row read "Bugünlük bitirdi" while day 1 stayed open. Then Demir
   pressed it, and **the day ended by itself**. Demir's desk opened the day-1 report: "Günün 5 sa 55 dk kadarı boşa
   gitti" (the team's unused total). The report's night had `id: "n-day1"` (`07`).
8. Aksoy started the finale with Clara (API). Demir's finale screen showed **"Baş müfettişe öner"**, and Demir picked
   "Düşme değil" ("Senin önerin: Düşme değil", `08`). Aksoy's finale showed **"Ekipten gelenler · Demir öneriyor ·
   Düşme değil · Bununla cevap ver"** (`09`). Aksoy tapped it, and the round answered with a retry ("Son hak"), as
   expected for a wrong item.
9. Aksoy **left the room** (API). Demir became the lead ("Demir: artık baş müfettiş" in the log, `room.isHost` true).

**Done through the API instead of taps:** zone inspections, collecting phrases, travelling to the bank, the
suggestion in step 5, the interview start, and starting the finale. These are the existing scene, notebook,
interview and finale screens (P's), which other agents have already clicked through. Everything new to co-op was
tapped in the UI: the team panel, intents, done, read out, the drafts panel and filing, and finale suggestions.

## Mount points (what I mounted, and where P or the next agent may move it)

| Component (`src/features/coop`) | Mounted in | Notes |
|---|---|---|
| `TeamPanel` (members, own clock, done, intent picker, claim-lead, `PrivateNotes`) | `app/desk/[sessionId]/(tabs)/index.tsx`, under `<Where/>` | co-op only |
| `TeamMarks kind="place"` | the same file, in each place card under the summary | here / heading / private place |
| `TeamMarks kind="person"` | `(tabs)/people.tsx`, under the availability line | holder / questioning / heading |
| `DraftPanel` (folded header "Ekibin taslakları · n") | `(tabs)/deductions.tsx`, above `DeductionBook` | could also live *inside* the book: show `DeductionView.draft` on each question card |
| `FinaleTeam` | `app/desk/[sessionId]/finale.tsx`, under `FinaleScreen` | lead: suggestions + "Bununla cevap ver"; others: chip picker |
| hand-over / lead leave | `app/desk/[sessionId]/room.tsx` | "Başa geçir" per member; the lead's "Ayrıl (görev devredilir)" |
| refusal hints `private`, `held` | `src/state/desk.ts` `reasonHint` → `coop.reason.*` | |

Strings are in `src/features/coop/strings.ts`, in EN and TR. The Turkish was written directly, not translated.

## Requests for P (your files)

1. **`desk.room.explain`** (src/i18n) still says *"Bütün oda için tek saat…" / "one clock for the whole room"*. It should
   now read something like: "Herkesin kendi saati var; defter ve laboratuvar ortak. Günü baş müfettiş kapatır ya da
   herkes bitirince kapanır." Also "Each of you has your own clock; the notebook and the lab are shared."
2. **FinaleScreen**: for a non-lead (`view.room && !view.room.isHost`) the "Cevap ver" button only gets `not_host`. Hide
   it, or switch it to suggesting (`POST finale/suggest`), which is what `FinaleTeam` does underneath.
3. **Notebook**: mark `FactView.private` / `EvidenceV2View.private` items (an "only in your notes" stamp) and offer
   "Ekibe oku" (`POST share {itemId}`). Today only the Map's `PrivateNotes` card offers it.
4. **InterviewScreen**: when `suspect.interview.heldBy && !heldBy.you`, show "Demir is questioning, you are following"
   and disable the action buttons. The server refuses them with `held`.
5. **DeductionBook** (optional): pre-fill the blanks from `DeductionView.draft`, and show suggestions inline.
6. **TopStrip / day-end**: in co-op a non-lead's "Day's done — end it" should point to "done for today"
   (`POST done {done:true}`) rather than the lead-only end-day.

## Gaps and honest notes

- **Day 1 budget when the lead acts before friends join**: the budget gets fixed at the first spent minute. A friend
  who joins after that gets the solo-size day 1 (480). The size is corrected the next morning.
- `clockStar.by` in co-op is in work-time units (days × perPlayer), so its clock label means "by the Nth minute of
  work on day 3". It doesn't mean a wall-clock time.
- The simulator's split is a greedy scheduler (no look-ahead), and "together" shares out work evenly. Both are
  estimates. Real teams will vary.
- The ideal path doesn't visit the bank or the pawnshop, so the validator's ideal-path team replays read out nothing
  (`coopReadOuts2p = 0`). The private sources are checked by the exhaustive team replay and by the unit tests.
- `npm run sync:functions` was not run, so `supabase/functions/_shared` still has the wave-4 engine. Run it before
  deploying the edge function.
- A member who left shows as "Eski üye / Former member" in older activity lines. This was already the behaviour.
- Typed free-question text still only lives in the shared interview log (game data). No new endpoint accepts free
  text.

## Files

- New: `server/engine/v2/coop.ts` (clock swap, budgets, privacy helpers), `server/engine/v2/team.ts` (team actions),
  `server/engine/v2/teamsim.ts` (team replays), `server/engine/team.test.ts`, `src/features/coop/*`,
  `docs/screens/wave5-coop/*`.
- Changed: `server/engine/v2/{actions,state,projection,validate}.ts`, `server/engine/{types,i18n}.ts`,
  `server/service.ts`, `server/http/app.ts`, `server/cases/kessler/v2.ts` (`coop.private`, so the case hash changes
  and open Kessler sessions are refused by design), `server/engine/{coop,v2api}.test.ts` (shared-clock assertions
  moved to per-player clocks, and the lead may now leave), `shared/api.ts`, `scripts/simulate-budget.ts`,
  `src/state/desk.ts`, `app/desk/[sessionId]/{room,finale}.tsx`, `app/desk/[sessionId]/(tabs)/{index,people,deductions}.tsx`,
  `docs/CONTRACT_V2.md` §14.

# INDICIA — Architecture (v2, investigation desk)

> Working title. *Indicia* (Latin): signs, circumstantial evidence.
> A realistic murder-investigation game for iOS / Android (Expo SDK 58, RN 0.88, Reanimated 4.7, RNGH 3.3), in English and Turkish.

Design: [PLAN_V2.md](PLAN_V2.md) (Turkish). Exact client/server contract: [CONTRACT_V2.md](CONTRACT_V2.md).
Playtest: [PLAYTEST_V2.md](PLAYTEST_V2.md). Who built what: [handoff/](handoff/).

## 1. Core principle: the truth exists before the investigation, and only the server holds it

```
            ┌──────────────────────────────── SERVER (authoritative) ────────────────────────────────┐
 client ──► │ HTTP API (Hono) ─► GameService ─► v2 engine (pure, deterministic) ─► Store (file / Supabase)│
 (Expo)     │                        │            clock · scenes · facts · lab · claims · deductions    │
            │                        │            finale · projection (one language, no truth)          │
            │                        └─► AI gateway (optional): routes a free question to topic ids only │
            └─────────────────────────────────────────────────────────────────────────────────────────┘
```

* A **CaseDefinition** (TypeScript data under `server/cases/`) holds the complete truth: killer, motive, timeline,
  evidence, lab results, every suspect's tiers and lies, plus the v2 game layer (`def.v2`: clock, facts, scenes,
  claim cards, deductions, finale rounds, night events, an ideal path). It is validated, hashed and frozen at load
  (`server/cases/index.ts`). A session is pinned to the hash it started on.
* The client only ever receives an **InvestigationView** (`server/engine/v2/projection.ts`), in one language,
  filtered by what this session has found. The truth leaves the server once: in the debrief after the verdict.
  `npm run check:boundary` proves `app/`, `src/`, `shared/` import nothing from `server/`; tests assert that no view
  (start, mid-game, finale) contains answers, break tables, hidden zones or the killer.
* The AI never decides anything. With a key it only classifies a free-text question into allowed topic ids; the
  suspect always answers with authored lines. Without a key, keywords do the routing. Play never stops for cost.

## 2. Folder structure

```
app/                          Expo Router screens
  _layout.tsx                 fonts, theme, gesture root, toasts, i18n bootstrap
  index.tsx · onboarding.tsx  first launch → the tutorial case (CaseSummary.tutorial), no text onboarding
  hq/                         Headquarters, Case files, Dossier (rank, stars, history) — server stars only
  case/[caseId].tsx           case cover: take / resume / restart / investigate with friends
  desk/[sessionId]/           the investigation desk
    _layout.tsx               loads the view, co-op pulse, follows day/phase changes, FeelOverlay
    (tabs)/                   Map (places, who can be seen, lab bench, sergeant, diary) · Notebook · Deductions · People
    scene/[locationId]        full-screen torch scene        interview/[suspectId]  full-screen interview duel
    day-end · report          the day's ledger, the day report + night event
    finale · briefing · room  confrontation + verdict + debrief, briefing, co-op room
  join/[code].tsx             invite links → /desk/:id/room
  premium.tsx · settings.tsx  Detective Plus (EN/TR), language / haptics / glow / privacy / reset
src/
  api/client.ts               typed fetch client (Accept-Language on every request), v2.* endpoints
  state/desk.ts               desk store: view, act runner, refusals → refetch, toasts, co-op sync
  state/hq.ts · prefs.ts · toasts.ts
  features/act.ts             the one feature `act` contract ({view,event} | ApiError | null)
  features/interview|scene|deduction|notebook|finale/   feature screens (+ strings.ts, EN/TR)
  features/desk/              TopStrip, lazy feature mounting (mount.tsx), props helpers
  i18n/                       shell strings en/tr (typed: a missing Turkish key fails tsc), feature strings merged
  feel/                       haptics dictionary, cues, day-turn overlay (audio cues are no-ops for now)
  components/ · theme/        design system (ui.tsx, Icon, Stars, TabBar, Toasts), tokens
shared/api.ts                 contract types (no truth)
server/
  engine/types.ts             truth + v2 layer model        engine/v2/state.ts · actions.ts · projection.ts · validate.ts
  engine/validate.ts          structural + reachability checks of the truth layer (calls validateV2)
  engine/evaluate.ts          debrief         engine/i18n.ts  locale, document markup, engine strings, ranks
  engine/matcher.ts           offline question router        engine/interrogation.ts  composure
  cases/                      kessler.ts (+ kessler/*), first-watch.ts (tutorial), overlay.ts, index.ts
  content/playthrough.ts      both cases × both languages through the HTTP app
  ai/gateway.ts · billing.ts · analytics.ts · store/ · http/app.ts · service.ts · dev.ts
supabase/                     migrations, Edge Function entry (server/ + shared/ synced to functions/_shared)
scripts/                      validate-cases, simulate-budget, check-boundary, sync-functions, usage-report
```

## 3. The game loop on the server

* **Clock** — game minutes per day (Kessler 3 × 480). Every action has a cost (`clock.costs`); an action that does not
  fit today is refused for free (`no_time`). Ending a day writes a day report and runs the first matching night event.
  Ending the last day → `awaiting_finale`.
* **Scenes** — zones on a 0..1 canvas; hidden zones (`uv` / `dust`) exist for the client only after a probe hits.
  Close-ups carry details, some needing a tool.
* **Facts** — atomic findings from scenes, documents (tap a marked phrase), claims, presses, lab results, night events.
* **Lab** — free, 2 slots, 2–6 game hours, runs overnight; results must be collected.
* **Interviews** — topics (some locked or gated by chips / requirements), claim cards per tier; press (15) or present
  (15). A matching item breaks the claim (tier jump, composure slips); the right item before its requirement *resists*
  (no patience lost); a wrong item costs patience; at 0 the suspect refuses until tomorrow.
* **Deductions** — fill-in sentences and a timeline; right costs nothing, wrong costs 30 min and never says which blank.
  Confirmations unlock analyses, topics, places, zones.
* **Finale** — 4–5 rounds against the accused, 2 tries each; wrong accused = immediate collapse. Stars: Truth, Proof, Clock.
* **Validator** — every deduction solvable, every fact reachable, the ideal path replays to a confession within 65 % of the
  budget, both languages complete, markup identical across languages. `npm run simulate:budget` shows the economy.

## 4. Shared investigations

One session, several members (max 6), one clock and notebook for the room. Only the lead ends the day and runs the
finale (`not_host`). Every change bumps `state.version`; clients pulse `GET /sessions/:id/pulse` every 2.5 s and refetch
the view when it moved. Activity lines are stored as keys + references and localised per viewer. All actions on a
session run through a per-session mutex (on several Edge instances this needs an optimistic lock — not done).

## 5. Database (Supabase) — unchanged since v1

`supabase/migrations/0001…0003`: profiles (+ `locale`), subscriptions, immutable `case_versions` (service role only),
sessions + members, `session_state.state` jsonb (all v2 state lives here), usage / cost logs, analytics opt-out.
Not yet applied to a live project.

## 6. Monetisation, analytics, AI cost

* Plus is decided by the server only (RevenueCat REST check or webhook). Free: tutorial + Kessler entirely, 80
  own-words questions a day. Plus: 400 a day, Plus cases. The clock is never sold.
* Analytics are sent by the server (Mixpanel EU), never with typed text; opt-out in Settings. v2 events: see CONTRACT §9.
* AI (optional) only classifies free questions; per-player daily AI budget; past it, keywords route.

| Variable | Where | Purpose |
|---|---|---|
| `PORT`, `DATA_DIR` | dev server | port (8787) and file-store directory (`.data`) |
| `AI_PROVIDER`, `GEMINI_API_KEY` / `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `AI_MODEL`, `AI_PRICE_IN_PER_M`, `AI_PRICE_OUT_PER_M` | server | question routing; prices for cost logs |
| `REVENUECAT_SECRET_KEY`, `REVENUECAT_WEBHOOK_AUTH`, `REVENUECAT_ENTITLEMENT` | server | purchase verification |
| `ALLOW_DEV_PURCHASES=0` | dev server | turn test purchases off |
| `MIXPANEL_TOKEN`, `MIXPANEL_API_HOST` | server | analytics |
| `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY` | app | API address, store keys |

## 7. Risks

* **Truth leakage** — boundary script, projection layer, no-leak tests, RLS. Content can still leak through *labels*
  (a topic called "The copy of the Guadagnini" on day 1): topics that name a discovery must be gated by chips
  (see the Kessler `t-copy`, `t-call`, `t-earring` gates added in wave 3).
* **Balance** — only measured by the simulator and a handful of plays; see PLAYTEST_V2.md.
* **Art** — screens still draw scenes, close-ups and portraits in code; the art pass plugs in at the slots listed in
  `docs/handoff/G.md`.
* **Not verified**: native devices (haptics, touch gestures, keyboard), live Supabase / Edge Function, real stores.

# Handoff — Agent F · Kabuk, saat, i18n, his (wave 2)

The v2 investigation desk shell, the v2 client layer, bilingual UI (EN + TR), the feel layer, and the first-launch
flow into the tutorial case. Feature screens (interview, scene, deduction, notebook, finale) are mounted, not owned.

## Route map (expo-router)

| Route | File | What |
|---|---|---|
| `/` | `app/index.tsx` | not onboarded → `/onboarding`, else `/hq` |
| `/onboarding` | `app/onboarding.tsx` | **no text onboarding**: picks the tutorial case (`first-watch`, else the first catalogue case), resumes or starts a session, marks onboarded, opens `/desk/:id` (briefing first). Retry / skip on error. |
| `/hq`, `/hq/cases`, `/hq/dossier` | `app/hq/**` | localised; sessions open on the desk; stars replace the 0–100 score where known; join → `/desk/:id/room` |
| `/case/:caseId` | `app/case/[caseId].tsx` | take / resume → `/desk/:id`; closed → `/desk/:id/finale`; co-op → `/desk/:id/room` |
| `/settings` | `app/settings.tsx` | language (English · Türkçe · Device), haptics, scene glow, privacy, reset |
| `/desk/:sessionId` | `app/desk/[sessionId]/_layout.tsx` | loads the v2 view, co-op pulse, phase/day watchers, Stack, `FeelOverlay` |
| `/desk/:id` (tabs) | `(tabs)/_layout.tsx` | `TopStrip` + bottom bar **Map · Notebook · Deductions · People** |
| ↳ Map | `(tabs)/index.tsx` | where you are, places + travel cost, who can be seen now/when, **lab bench** (2 slots, countdowns, collect, send with delay shown, locked reasons, results), sergeant hint (cost), case diary (day reports), briefing, settings, HQ, co-op room. `?focus=lab` scrolls to the bench. |
| ↳ Notebook | `(tabs)/notebook.tsx` | mounts `Notebook` |
| ↳ Deductions | `(tabs)/deductions.tsx` | mounts `DeductionBook` |
| ↳ People | `(tabs)/people.tsx` | suspects: composure, patience pips, availability now / next window / note, refused-today; **Interview · 30 min** (or Resume · free) |
| `/desk/:id/scene/:locationId` | `scene/[locationId].tsx` | full screen `SceneScreen` |
| `/desk/:id/interview/:suspectId` | `interview/[suspectId].tsx` | full screen `InterviewScreen` |
| `/desk/:id/day-end` | `day-end.tsx` | the day's ledger: time, forfeit warning, interviews that close, labs running overnight, last-day warning, lead-only in co-op, **full cost table** from `clock.costs`, budget |
| `/desk/:id/report?day=N&fresh=1` | `report.tsx` | day report: counts, facts (6 + "and N more"), evidence, deductions, labs ready/running, **night event** card. Fresh → "Day N+1 · morning" (`router.dismissTo` the tabs) or, after the last day, **"See the prosecutor"** (forced). From the diary → Back. |
| `/desk/:id/finale` | `finale.tsx` | full screen `FinaleScreen`; `onDone` → HQ when closed, else back |
| `/desk/:id/briefing` | `briefing.tsx` | case briefing + four clock rules; shown once at session start |
| `/desk/:id/room` | `room.tsx` | co-op room for v2 sessions (code, invite, lock/remove via v1 endpoints + refetch, activity) |

Automatic moves (desk `_layout`): first arrival on the tabs → briefing (elapsed 0, not yet briefed) or, if
`phase ≠ investigating`, → finale. When the day turns or the phase becomes `awaiting_finale` **without our own
end-day** (co-op lead, another device) → report. When the phase becomes `finale`/`closed` remotely → finale.

## What features receive (exact)

All mounts go through `src/features/desk/mount.tsx` → `<Feature feature exportName props onBack fallback>`.

```ts
// t — src/i18n: (key: string, vars?: Record<string, string | number>) => string
//   {name} interpolation; when vars.n === 1 a `<key>_one` variant is used if present; unknown key → the key itself
//   (features' useSay/withFallback detect that and use their own table). Identity changes when the language changes.

// act — one of two adapters over the same store runner (src/state/desk.ts → run(path, body, policy)):
makeActApiError(): (path: string, body?: unknown) => Promise<V2Response | { error: ApiError } | null>
   // interview, deduction, notebook, finale. Refusal → { error: { error, code, reason } } (not toasted by the shell)
makeActFlat():     (path: string, body?: unknown) => Promise<V2Response | { error: string; code?; reason? } | null>
   // scene (its ActFailure type). null only on a non-API failure.
// path may start with a slash ('/inspect') or not ('inspect').
// Every success replaces the store's view (screens re-render with the new `view` prop), sets `event`/`eventSeq`,
// runs the feel layer and the shell toasts. Quota (402) → /premium?source=quota.
```

| Feature | Props passed | Shell feedback for its actions |
|---|---|---|
| `InterviewScreen` | `{ view, suspectId, act(apiError), onExit, t }` | no haptics, no find toasts (the screen does its own); lab-ready + new-question toasts |
| `SceneScreen` | `{ view, locationId, act(flat), onExit, t, idleAssist, haptics }` (prefs) | same |
| `Notebook` | `{ view, act(apiError), t, mode: 'browse' }` | find toasts on |
| `DeductionBook` | `{ view, act(apiError), t }` | find toasts on |
| `FinaleScreen` | `{ view, act(apiError), onDone, t }` | none beyond lab/new-question |

`onExit` = `router.back()` (fallback: desk tabs). The People tab **opens** the interview (`POST interview`, cost on
the button) before navigating; leaving the room (`interview/leave`) is the interview screen's decision.

**Mounting is lazy**: `require.context('..', true, /^\.\/(interview|scene|deduction|notebook|finale)\/[A-Za-z0-9_-]+\.tsx?$/, 'lazy')`.
Each feature file is its own async chunk, so a feature that does not exist shows **"Being built"**, one that fails to
compile/load also shows "Being built" (with a console warning) instead of breaking the whole bundle (this happened
once during wave 2: a worklets transform error in `DeductionBook.tsx` took down the eager bundle), and one that
throws while rendering is caught by `FeatureBoundary` (retry / back). Lookup order: `index.ts(x)` → file named like
the export → other `.tsx`. `strings.ts`/`types.ts` are skipped.

## i18n (`src/i18n`)

* `en.ts` / `tr.ts` — 315 shell keys; `tr` is typed `Record<keyof en, string>` so a missing Turkish key fails tsc.
  Turkish is written natively (e.g. "Bugün kalan 7 sa yanar.", "Yarına kadar konuşmayacak").
* `features.ts` — merges every `src/features/*/strings.ts` via `require.context(…, /\/strings\.tsx?$/)`; accepts
  `{ en, tr }` as default export, any named export, or the module itself; nested tables are flattened. Shell keys win
  on collision (none today).
* `index.ts` — `useI18n` store (`locale`, `choice`, `choose(l|null)`, `adoptProfile`), `t`, `useT()`, `useLocale()`,
  `fmtMinutes`, `fmtCost`, `onLocaleChange`. Order: profile `locale` (adopted on every HQ refresh) → device choice
  saved in AsyncStorage → device language (`navigator.languages` / `Intl`) → en. `choose` applies at once, saves, sends
  `PUT /me/locale` (null = device), and fires listeners: the desk refetches `GET /v2` and HQ refetches cases + profile.
* `Accept-Language` is sent on every request (`src/api/client.ts`, `setRequestLocale`); on web `<html lang>` follows
  the language so CSS uppercase renders Turkish İ correctly.
* No hard-coded user-facing strings in my files; checked with a script that compares every `'ns.key'` literal (and the
  dynamic families `desk.feature.*`, `difficulty.*`, `composure.*`, `desk.costs.*`) against `en.ts`: all present.
  v1-only components (`Board`, `CaseHeader`, `EvidenceRow`, `ScenePlan`, `Timeline`) still hold English — they are
  used only by `app/investigation/**` and go away with it.

## Client layer

* `src/api/client.ts` — `ApiFailure` now carries `reason`; `v2.*` typed methods for every v2 endpoint plus `v2.post`;
  `api.setLocale`; v1 methods unchanged.
* `src/state/desk.ts` — `useDesk`: `view`, `event`, `eventSeq`, `lastPath`, `lastError {message, code, reason, path}`,
  `busy`, `online`, `offline`, `load`, `refresh`, `act(path, body) → V2Response | null`, `run(...)` (core), co-op
  `startSync/stopSync` (pulse every 2.5 s → refetch on version change, teammate activity toasts). Actions are
  serialised. Refusals toast the server's sentence plus a reason hint (`no_time` → "End the day from the clock", …);
  `phase`/`not_host` refusals refetch. Closed views record stars in prefs.
* `src/state/toasts.ts` — one toast queue (v1 `useSession().toast` delegates to it); toasts may carry an action
  (lab-ready → **Collect**).
* `src/state/prefs.ts` — adds `idleAssist`, `stars` (best per case), `briefed` (sessions).
* `src/state/hq.ts` — `difficultyLabel()` is now a function; `tutorialCase`, `caseHref`.

## Feel (`src/feel`)

`feelsFor(event)` maps events to moments (`tick, fact, lab, line, breakthrough, resist, patience, confirmed, wrong,
day, won, lost, retry, verdict`); `HAPTIC` is the PLAN §5 dictionary (fact light · break medium+double · stamp heavy ·
patience warning); `feelEvent(event, { haptics })` plays the strongest haptic (native only, respects the setting) and
emits cues on `useFeel`; `useFeelCue(kind, fn)` subscribes. Motion owned by the shell: the strip's clock pulses and
shows "−30 min" on every cost; the **day turn** overlay (a clock hand sweeping a full turn, "End of day 1 → Day 2 ·
morning"). Audio: `playCue(kind)` / `useAudioCue()` are explicit **no-ops** for the sound pass.

## Verified (browser tab of my own at `http://127.0.0.1:8140` — separate origin so storage is not shared with other agents' tabs — 375×812, API on 8787)

* First launch (empty storage, device language Turkish) → `/onboarding` → Kessler (no `first-watch` in the catalogue)
  started → briefing in Turkish ("Soruşturmaya başla") → desk Map: strip "GÜN 1/3 · 08:00 · 8 sa kaldı · 0/2", places
  with "Git · 30 dk", "Bakılmamış 8 yer".
* Travel → Workshop: clock 08:30, scene opened full screen (SceneScreen mounted: torch, tools, "Yakın plan · 20 dk").
* Lab: "Gönder · bedava / Sonuç 4 sa sonra" → slot 1 running, strip shows the countdown, "12:30 hazır".
* People: "Sorgula · 30 dk" → interview opened at 09:00 (InterviewScreen mounted, patience 4).
* Notebook and Deductions tabs mounted the feature components.
* Language switched to English in Settings mid-case: every shell string and the server content (map name "Station" ↔
  "Emniyet") changed at once without reload; later switched back to Turkish the same way.
* Day ledger → End day 1 → day-turn overlay → day 1 report with the **night event** card ("Night desk") and "ANPR
  footage request — ready to collect" → Day 2 morning; strip "1 ready"; Collect → toast "E-24 added to evidence",
  Notebook badge, result listed under Results (lab across time and overnight).
* Hint (45 min) → clock 08:45 and the hint text shown.
* Days 2 and 3 ended in Turkish; the last day's report showed "Soruşturma bitti" and only **"Savcının karşısına çık"**
  → FinaleScreen (forced). Accused Leo → wrongful verdict, 0/3 stars → "Dosyayı kapat" → HQ: "Son dosya", stars
  (0/3) on the card, "Kararı oku"; `prefs.stars = { 'kessler-workshop': 0 }`.
* Co-op: Case → "Arkadaşlarınla soruştur" → desk room (code, lead, log) → desk; pulse every 2.5 s; a second player
  (curl) travelled to the Vault → my desk refetched (08:30, "Vault · Buradasın"); their `end-day` was refused
  `not_host`.
* Console: no errors from the app (the only errors are the 500s of bundles requested while a feature file was broken).
* `npx tsc --noEmit` clean; `npm run check` — see the end of this file.

Not exercised in the browser: a refusal toast raised from a shell button (the shell pre-disables actions the clock or
availability forbids, so none was reachable; the path is shared with features and the server shape
`{error, code, reason}` was confirmed with curl); the toast's own Collect button (the lab bench's Collect was used);
co-op remote day turn (needs a second lead-capable device).

## Contract requests

1. `CaseSummary.session.stars?: number` (and `Profile.history[].stars`, a profile star total for rank). Today stars are
   cached on the device from closed views (`prefs.stars`), so another device shows nothing until the case is reopened.
2. `PlaceView.people?: string[]` or `suspect.location` — "who is available **where**" can only show *when* today.
3. `RoomView.activity` entries are still English for some actions (e.g. "opened the room") — localise per viewer.
4. `Profile.rank` / `nextRank.name` arrive in English — localise.
5. A cheap way to learn the next lab completion across the night (`lab.nextReadyAt`) for the strip, instead of scanning jobs.

## Known gaps / notes for the integration agent

* Metro here serves with `hot=false`: edits need a full reload (the bundle takes 2–5 minutes to rebuild).
* In a hidden browser pane timers are throttled: the day-turn overlay and toasts can stay on screen far longer than
  their 1.9 s / 3.4 s lifetimes (they are `pointerEvents="none"` except toast buttons, so they don't block play).
* The Expo dev ⚡ button on web sits over the bottom-left of the tab bar at 375 px; twice a stray coordinate click
  landed on a route I did not open (`/room`), never reproducible by tapping real controls — worth a look in wave 3.
* `app/join/[code].tsx` (not mine) still sends invited friends to the v1 room; switch it to `/desk/:id/room`.
* `app/premium.tsx` (not mine) is still English-only.
* v1 store/screens untouched and working (`useSession` keeps its API; toasts moved to `src/state/toasts.ts`).
* Every case with a v2 layer opens on the desk; if `GET /v2` fails with not_found/bad_request the desk offers
  "Open the old case file" (v1).

## Final command results (24 Nov 2026)

* `npx tsc --noEmit` — clean for all of my files. The latest `npm run check` stops at typecheck on **two errors in
  `src/features/deduction/DeductionBook.tsx` (Agent E)**: a `useRef<ScrollView>` used for `scrollToEnd` (RN 0.88 types;
  the fix is `useRef<ScrollViewInstance>` from `react-native`, the same fix I applied in the Map tab). An earlier
  full-repo tsc run with the same code of mine was clean.
* `node scripts/check-boundary.mjs` → `boundary ok — app, src, shared import nothing from server/`
* `npm run validate:cases` → `kessler-workshop v1 — VALID` (draft, 767 strings without Turkish)
* `npm test` → `# tests 59 # pass 59 # fail 0`
* Report → next morning now uses `router.dismissTo` (verified: one desk instance in the stack after a day turn).

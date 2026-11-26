# Handoff — Agent C · Sorgu düellosu (wave 2)

The interrogation duel (PLAN §3.4) as a self-contained feature in `src/features/interview/`, plus a dev
harness at `app/dev/interview.tsx`. No files outside those (and this one) were touched.

## Exported API

```ts
import { InterviewScreen } from '../src/features/interview';
import type { Act, ActionResult, ActionFailure, InterviewScreenProps } from '../src/features/interview';

<InterviewScreen view={view} suspectId="clara" act={act} onExit={() => router.back()} t={t} />
```

| Prop | Meaning |
|---|---|
| `view: InvestigationView` | the current v2 view. Re-render with the new view after every action (the screen keeps no copy). |
| `suspectId` | whose room this is. Unknown id → a single "Leave" button. |
| `act: Act` | `(path, body?) => Promise<ActionResult \| null>`, path relative to `/sessions/:id/v2`. |
| `onExit()` | called after "Leave" (the screen first calls `act('interview/leave', { suspectId })` itself when an interview is open). |
| `t(key)` | the shell's translate function. |

`types.ts`:

```ts
export type ActionFailure = { error: ApiError };          // a refused action (HTTP 4xx body)
export type ActionResult = V2Response | ActionFailure;
export type Act = (path: string, body?: unknown) => Promise<ActionResult | null>;
```

**Please resolve refused actions as `{ error: ApiError }`** (not `null`): the screen then shows the server's
localised `error` sentence plus a reason-specific hint (`no_time` → "End the day…", `refused`, `not_open`,
`claim_closed`, `not_host`, …) and shakes the card. `null` still works (generic "did not go through").
`V2Response` alone is assignable to `ActionResult`, so a plain `{ view, event } | null` client also type-checks.
**After a refused action the shell should refetch `GET /v2`** — errors carry no view, so the screen could be
stale (e.g. the interview was closed by a co-op partner). The harness does this.

Paths used: `interview` · `interview/leave` · `topic` · `press` · `present` · `ask`, always with `suspectId`.

### Strings

`src/features/interview/strings.ts` exports `interviewStrings = { en, tr }` (also the default export) with
**flat keys** `interview.*` — the shell's `src/i18n/features.ts` picks it up via `require.context` as is.
Placeholders `{n}`, `{name}`, `{time}`, `{d}`, `{from}`, `{to}`, `{h}`, `{m}`, `{max}` are filled by the screen
itself (`useStrings.ts`), so `t` only needs to return the raw string. If `t` returns the key (unknown), the
screen falls back to its own table in `view.locale`, so raw keys never show.

## What the screen does

* **Header**: back/leave, monogram portrait (shakes + burgundy glow on a break), name, last emotion + occupation,
  `Day d/n · HH:MM` and time left today (red under 60 min) with a "−15 min" tick on every charged action;
  composure as 4 bars + label (composed 4 → breaking 1, pulses on change); patience as pips (a lost pip pops);
  notebook counter (facts + evidence) that bumps when a "+n notebook" chip flies into it.
* **Transcript** (scroll-back, newest at the bottom, auto-scrolls): interview opened/closed markers with time,
  "You raise / press / present / ask" lines (present shows the item and the claim), suspect lines in serif with
  emotion, wrong → burgundy rule, resist → amber; paragraphs clamp to 3 lines with "more/less".
* **Claim cards** under the transcript, grouped by topic, most recently touched topic last (nearest the thumb);
  `superseded` claims are left to the transcript; `broken` ones stay as cracked cards with a stamp.
  New claims (`event.newClaims`) slide in with a "New" tag.
* **Dock (one-thumb zone)**:
  * interview closed: start (`Start the interview · 30 min`) or the reason it can't start — refused today,
    day over, unavailable (+ the availability windows from today on, with notes), phase over.
  * no claim selected: `Raise a topic · <n available>` (sheet of topic chips; raised ones listed as done) and
    a collapsed "Ask in your own words · 15 min" (text field + send).
  * claim selected: the claim, `Press · 15 min` (shows "Nothing left to press" when `!canPress`) and
    `Present · 15 min` → notebook picker (Facts / Evidence tabs, newest first, items already tried against
    this claim tagged "Tried", "a wrong pick costs their patience", confirm button with cost).
  * low time warning when today's minutes are under twice the move cost.
* **Events** (CONTRACT §7): break → card cracks + stamp, portrait reacts, composure meter moves, new claims, haptic
  medium×2, banner "Their story cracked"; resist → shake + light; wrong → shake + pip lost + warning;
  ended → warning + `event.message` + "Come back tomorrow", dock switches to the refused state; press
  detail/advance/nothing, ask opened/repeat/deflect → banners; `labReady` → "Lab result ready" sub-line;
  `newFacts/newEvidence` → flying chip. Haptics via expo-haptics, skipped on web and when prefs.haptics is off.

## Verified (web, 375×812, Claude Browser pane — mobile preset)

Session `6b6530bd…` (token `dev.agent-c-000001`), prepared by a scratch script (travel/inspect/lab/collect via
curl-equivalent fetches: ideal-path steps up to Clara's interview, then lab collect + document facts).

* EN, Clara: start interview (11:30 → 12:00, "Lab result ready" banner) → raise "The calls and the text from her
  father" → claim card "He rang about Saturday's family dinner." slid in with NEW → **Press** → "That is all I have
  to say about it." + banner "Nothing more to get from that.", card tagged PRESSED, press button "Nothing left to
  press", clock 12:15 → **Present wrong** (fob 23:04) → patience 4→3, "−15 min", "That proves nothing. Patience −1.",
  Clara "irritated", item tagged "Tried" in the picker → **Present f-sms (22:55 text)** → **breakthrough**: card
  cracked with BROKEN stamp, composure Composed → Uneasy, emotion "anxious", new claim "He thought something was
  wrong with an instrument. It could wait." slid in, banner "Their story cracked" → three more wrong presents on
  the new claim → patience 3→2→1→0, system line "The interview is over for today.", banner, dock "Clara will not
  talk to you again today. Come back tomorrow." + Leave.
* EN, Miriam (day 1): dock "Not available right now." + "Day 2 · 08:00–16:00 · With her lawyer", "Day 3 …".
* TR, Jonas: all chrome in Turkish (Sorgu odası, Soğukkanlılık, Sabır, Gün 1/3 · 13:30, "2 sa 30 dk kaldı",
  "Görüşmeyi başlat · 30 dk", "Üç hamle" teaching card) → start → **free question** "Where were you that evening?"
  → `ask: opened`, new topic + claim, banner "Tutanağa yeni iddialar girdi", notebook 27→28 → "devamı/kısalt" on
  a long answer works → **error path**: closed the interview behind the UI with curl, then raised a topic →
  server 409 `not_open`, banner "Önce görüşmeyi başlat." → restart → raise "The copy of the Guadagnini" →
  present "Thomas spoke to Jonas … 22:43" on "I make study copies…" → **breakthrough in TR**: stamp, "Hikâyesi
  çatladı", new claim "Clara commissioned the copy: €8,000 cash, delivered 12 July.", notebook 28→30.
* `npx tsc --noEmit` (whole repo, final run): **0 errors**. `npm run check:boundary`: `boundary ok`.
* Console: no errors from the screen. Seen: browser network lines for the deliberate 409, and a Reanimated
  "transform may be overwritten by a layout animation" warning from the claim card — fixed (layout animation
  moved to a wrapper view; see "Known gaps" for the re-check).

## Contract requests

1. **Topic chips**: `TopicV2View` has no link to people/facts (`topic.v2.chips` exists in the case but is not
   projected). PLAN wants "raise a topic from person/fact chips". Please add `chips?: string[]` (person / fact ids)
   to `TopicV2View`. Degraded: topics are shown as labelled chips.
2. **Claim ↔ line link**: `InterviewLineView` for a suspect answer does not say which claims it produced
   (only `claimId` on press/present lines). Adding `claimIds?: string[]` (or `topicId`) would let cards sit
   under the answer that produced them. Degraded: cards are grouped by topic below the transcript, ordered by
   last activity.
3. **Composure direction**: after Jonas's copy claim broke, his composure went `uneasy → composed`
   (CONTRACT §4 says breaks push it up toward `breaking`). Either the projection or the contract text needs a
   look (Agent A/B).
4. **Paywall hook**: a free question past the daily allowance returns 402 without a reason. The screen shows the
   server sentence; an `onPaywall` prop or a `reason: 'quota'` would let it open the paywall.
5. Nice to have: `event.claimId` on press/present events (the screen remembers it locally today).

## Known gaps

* Tested on web only (no device): haptics are wired but not felt; the iOS keyboard avoidance for the free
  question is untested.
* Portrait is the existing monogram; no per-emotion art, no "tells", no sound (PLAN §5 sound is wave 4).
* Bottom sheets use RN `Modal` (slide). On web they are slow to settle in a background/throttled tab and
  render at window width (in the harness's desktop-width frame they span the window, not the 375 frame).
* 3-line clamp is an estimate from width and font size (works on web and native alike, may be off by a few
  characters).
* Harness: the dev bar takes ~22 px at the top; switching language refetches the view; session
  restarts need the scratch setup (`POST /sessions` with `restart: true`).
* Final re-check after a full reload (TR, Jonas): broken card shows the "KIRILDI" stamp, transcript and
  claims restored from the view, console filter `Reanimated|rror|out of sync` empty.
* The Chrome extension tabs froze/crashed while evaluating the 8.5 MB dev bundle (~2 min per bundle build on
  this machine while other agents edit); verification was done in the Claude Browser pane instead.

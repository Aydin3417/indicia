# Handoff — Agent E · Çıkarım ve final (wave 2)

Deduction book (PLAN §3.5), notebook, and the finale (PLAN §3.6) as self-contained features with no network
code of their own. They only call the `act` they are given and read the `view` they are given.

## Exported APIs

```ts
// src/features/deduction/index.ts
export function DeductionBook(props: {
  view: InvestigationView; act: Act; t: (key: string) => string;
  initialDeductionId?: string;               // optional: open one question directly
  onEvent?: (event: V2Event) => void;        // optional: every successful event, for the shell's clock tick / toasts
}): JSX.Element
export { deductionStrings, Chip, feel, fmt, MoreText, LandingStamp, isOk }   // + types Act, ActionResult, ActionFailure, Translate

// src/features/notebook/index.ts
export function Notebook(props: {
  view: InvestigationView; act: Act; t;
  onPick?: (chip: ChipView) => void; mode?: 'browse' | 'pick';
  accept?: ChipType[];                       // pick mode: which chip types are pickable (default fact, evidence, person)
  initialTab?: 'facts' | 'evidence' | 'people';
  embedded?: boolean;                        // no own vertical ScrollView (when placed inside another scroll view)
}): JSX.Element
export { notebookStrings }

// src/features/finale/index.ts
export function FinaleScreen(props: {
  view: InvestigationView; act: Act; onDone: () => void; t;
  onEvent?: (event: V2Event) => void;
}): JSX.Element
export { finaleStrings }

// src/features/deduction/types.ts
type ActionFailure = { error: ApiError | string };
type ActionResult  = V2Response | ActionFailure;
type Act = (path: string, body?: unknown) => Promise<ActionResult | null>;
```

* **Paths** passed to `act` start with a slash and are relative to `/sessions/:id/v2`:
  `'/deduce'`, `'/collect'`, `'/finale'`, `'/finale/answer'`. Nothing else is called.
* **Results**: `{ view, event }` on success. A refusal may come back as `{ error: ApiError }` (shown inline where
  it matters: filing, charging) or `null` (the feature just stops its busy state — the shell reports it).
* **The view is the prop.** The features never keep their own copy; after `act` resolves they expect the shell
  to re-render them with the new `view` (the desk store does this). Local state is only UI state (current
  question, fills in progress, the finale's current "beat").
* **Strings**: each `strings.ts` exports `{ en, tr }` of flat keys (`deduction.*`, `notebook.*`, `finale.*`),
  default export and named `strings`. Agent F's `src/i18n/features.ts` picks them up automatically.
  **`FinaleScreen`'s `t` must also know `notebook.*`** (its answer picker embeds the notebook), and every `t`
  must return the raw key for a missing key (the features only use their own keys).
* **Haptics**: `feel()` in `deduction/kit.tsx` (light / medium / heavy / double / warning / success), no-op on
  web. It does not read the user's haptics preference — the shell's prefs store is outside my files. If F's
  `src/feel` gains a gate, swap the body of `feel()` for it.
* **Layout**: each component fills its parent (`flex: 1`), scrolls itself, and pins its main action to the
  bottom (absolute footer, ~120 px). Mount them in a `flex: 1` container below the shell's top bar; no safe-area
  handling inside (the shell owns insets).

## What each one does

**DeductionBook** — list of open questions (NEW tag for `isNew` or announced by the last event, banner for new
ones, attempts shown), a dashed "more questions open as your notebook fills" card (see contract requests), and
"The reasoning so far": every confirmed deduction re-rendered as its sentence with the accepted fills in red ink
plus its confirm text. Opening a `fill` question shows the sentence on paper with typed dashed slots; the tray
below shows only chips of the active slot's type (facts get a per-person filter). Tap a chip to place it in the
active slot (then the next empty slot activates); drag a chip onto any slot of its type (web: drag directly;
native: hold ~180 ms then drag); tap × to clear. "File deduction" shows "Right costs nothing. Wrong costs 30
min." then a confirm row with the wrong cost (capped at minutes left) and today's remaining time. Confirmed:
stamp lands (scale + rotate), heavy haptic, the event's `message`, and the `unlocked` list + new questions
(tappable). Wrong: the paper shakes, warning haptic, "It doesn't hold.", the minutes lost and the clock now —
never which blank. Timeline: paper cards with position numbers, starting in a deterministic shuffle (the server's
id order can be the answer); drag a card vertically to reorder (PanResponder; ↑ ↓ buttons too), ✕ / drag below
the list to set a card aside into the "Doesn't fit" tray, "Put back" to return it. The tray chips use
gesture-handler's `usePanGesture`; the timeline uses `PanResponder` (gesture-handler would not start inside the
rows on web).

**Notebook** — tabs Findings / Evidence / People with counts (+N new). Findings: group by person / time (clock
order, then untimed) / source; person pills filter ("searchable by tapping a person"); new ones first with a red
edge. Evidence: list (code, name, kind, "N marked"); a document opens as paper with tappable segments —
`underline` drawn underlined, `plain` drawn as ordinary text but still tappable, collected ones tinted green;
tapping calls `/collect` and shows "Noted: <fact>". People: suspects and others with fact counts; tapping
filters the findings. In `pick` mode rows call `onPick(chip)` instead.

**FinaleScreen** — one beat per screen, action at the bottom:
`intro` (prosecutor's text, confirmed/findings/time-left ledger, "not yet" only while investigating) → `choose`
(accusable people) → `confirm` (point of no return, **press-and-hold 1.2 s** to charge; accessibility action
"activate" also charges) → `/finale` → `prelude` (finale intro, rules) → `round` × N (round n/N + kind,
progress pips, the accused's defence as a quote, the prompt, tries left; "Answer" opens the picker: chips the
server `suggested` first, then confirmed deductions, then the notebook in pick mode; pick → "Put it on the
table") → `retry` shakes in place / `won`·`lost` go to a `reaction` beat (stamp IT HOLDS / SLIPPED AWAY, the
accused's `reaction`) → … → `confession` beat (if all won) → `verdict` (title, detail, outcome stamp, then
Truth / Proof / Clock stars revealed one by one 0.7 s apart with a haptic each and a one-line reason) →
`debrief` (who killed whom, narrative paragraphs clamped to 3 lines with "More", what you missed, what you
found, rounds / deductions / time left) → `onDone()`. Wrong accused: `/finale` returns `wrongful` →
`collapseDefence` (their defence) → `collapse` (CASE COLLAPSES + the collapse text) → verdict (0 stars) →
debrief. Re-entering: `phase === 'finale'` resumes at the current round; `closed` opens at the verdict.

## Dev harness

* `app/dev/deduction.tsx` — `/dev/deduction?sid=<session>&lang=en|tr&user=<dev id>`: DeductionBook / Notebook
  toggle + EN/TR switch. Without `sid` it creates a fresh Kessler session.
* `app/dev/finale.tsx` — `/dev/finale?sid=…` mounts FinaleScreen.
* `src/features/deduction/devHarness.tsx` — the harness's local `act` (fetch to `EXPO_PUBLIC_API_URL`, dev
  token `dev.<user>`, `Accept-Language`) and a `t` merging the three strings files. **Delete these three files in
  wave 3** (or keep them dev-only); nothing else imports them. Note: the shell's lazy `require.context` in
  `desk/mount.tsx` also sees `devHarness.tsx` (it only looks for the named exports, so it is harmless).
* Sessions were prepared with a scratch driver replaying the ideal path over HTTP (see "Verified").

## Verified

All in my own browser tab at a 375×812 viewport, against the running API (8787) and Metro (8140). Sessions were
prepared with a scratch script replaying Kessler's ideal path over HTTP (dev ids `agent-e-000001…7`); scenarios
"deduction" (day 1 with no deductions filed), "copy" (everything before `d-copy`) and "finale" (all six confirmed).

EN, deduction book (`/dev/deduction`):
* Book: "4 open · 0 confirmed", NEW tags, "1 blank / 3 blanks", the locked-hint card.
* "Not a fall": **dragged** the wrong finding ("A single wound…") onto the PROOF slot with the mouse → slot filled,
  chip dimmed, footer "Right costs nothing. Wrong costs 30 min." → File → "If it doesn't hold, you lose 30 min.
  2 h 45 min left today." → File it → paper shakes, "It doesn't hold. −30 min … Now 13:45 · 2 h 15 min left today"
  (server clock moved 13:15 → 13:45). Then **tapped** "There are no prints on the upper rungs…" (replaced the fill),
  filed → CONFIRMED stamp, "Not an accident. This is a murder inquiry.", back to the book; the sentence appears
  under "The reasoning so far" with the fill in red.
* Timeline "The last hour": cards start scrambled (not in id order); set the lie aside with ✕, swapped two with
  ↑ → filed → "It doesn't hold." (panel scrolled into view), fixed with ↓ → CONFIRMED "She was inside when he died…".
* Notebook: findings grouped by person, "Clara Kessler" pill filters to her four findings; evidence list shows
  "Statement · readable · 2 marked"; opened E-01, tapped the underlined "I heard a heavy thump from the workshop"
  → phrase tinted, "NOTED — A heavy thump came from the workshop just after the 23:15 news began."

TR, deduction book: whole UI in Turkish ("4 açık · 0 kesinleşti", "4 YENİ SORU AÇILDI", "Sıralanacak 6 kart").
Timeline: **dragged** "Clara drives away…" into "UYMAYAN" and **dragged** card 1 down one place (order changed),
filed wrong → server's "Tutmuyor." + "−30 dk" + "O gece böyle geçmedi…", fixed → DOĞRULANDI.
"The violin in the vault" (copy session): chose "a copy", Jonas, Clara → DOĞRULANDI + "BUNUNLA AÇILANLAR ·
LABORATUVAR · Financial investigation" (the event's `unlocked`).

EN, finale (`/dev/finale`, all six deductions confirmed): intro ledger "6 confirmed · 28 findings · 8 h" →
choose → Clara → point of no return; a short tap did **not** charge, a 1.8 s press-and-hold did → prelude
("5 defences…") → round 1 answered with "Not a fall" → "Not good enough. Try again." + "Last try" → "The last
hour" (from "Your deductions point here") → IT HOLDS + reaction; round 2 answered from the embedded notebook
(the 22:55 text finding) → "First try."; rounds 3–5 with The motive / The weapon / Not a fall → confession beat
("STATEMENT RECORDED") → verdict "Confession", stamp, ★ Truth / ★ Proof ("4 of 5 answered first time · 6 of 6
deductions confirmed") / ★ Clock ("8 h of the budget left"), "3 of 3 stars" → debrief (killer, 7 narrative
paragraphs with "More", what you missed / found, ledger) → "Close the file" → `onDone()` called, phase `closed`.

TR, finale wrong culprit: charged Jonas → "SANIK CEVAP VERİYOR" + his defence → "DAVA ÇÖKTÜ" + collapse text →
"Haksız suçlama", stamp HAKSIZ SUÇLAMA, three empty stars, "3 yıldızdan 0" → debrief "Katil: Clara Kessler."

Console: no errors from the features after the fixes below (the only errors seen were `setPointerCapture` from
my own synthetic pointer events in a probe script, and an early nested-`<button>` warning in the slot, fixed).

Checks (final run): `npx tsc --noEmit` — no output, whole repo passes; `npm run check:boundary` — "boundary ok — app, src, shared import nothing from server/".

Found and fixed while playing: the worklets Babel plugin rejects object spread in a `usePanGesture` config;
on web a fast pan can end as "cancelled" (drops now finish in `onFinalize`); the slot had a button inside a
button; the timeline reordered DOM nodes mid-drag (now rows stay put and shift visually) and its gesture never
started on web inside the paper rows, so the timeline uses the responder system (`PanResponder`) instead; English
eyebrows were upper-cased as "FİLE" on a Turkish page (features now set `lang` on their root view on web); the
server sends timeline cards in id order, which for Kessler is the solution (now shuffled deterministically).

## Contract requests

1. **Hidden deductions** — the view lists only visible questions, so "locked ones hinted" can only be a generic
   card. Request: `view.deductionsLocked: { count: number; hints?: string[] }` (or `DeductionView.status:
   'locked'` with title + a one-line hint and no prompt).
2. **Confirmed timeline order** — `DeductionView` has no accepted order for a confirmed timeline, so it can only
   be shown as title + confirm text in "the reasoning so far". Request: `cards` returned in solution order once
   `status === 'confirmed'` (plus `outlier`).
3. **Deductions total** — the book can't say "2 of 6" before the end (`deductionsTotal` exists only in
   `result`). Request: `view.deductionsTotal` (number only, no content).
4. **Finale reaction vs next defence** — `finale_answer`'s `event.line.text` concatenates the reaction and the
   next defence; I read `round.reaction` and the next round's `defence` from the view instead. Fine as is; a
   separate `event.reaction` would be cleaner.
5. **Pick a fact's time** — a `time` blank accepts values from `chips.times`, which is fine; but `ChipView` of
   a time carries no link to the fact it came from. Optional: `chips.times[].factIds`.

## Known gaps

* Drag on native is untested (web only, mouse); tap-to-place and ↑ ↓ ✕ always work and are the primary path.
* The draft Kessler content is English; under TR, English content in upper-case eyebrows (e.g. deduction titles in
  "the reasoning so far") gets Turkish casing ("VİSİTOR") — goes away with Agent B's Turkish content.
* No sound (wave 4); haptics are not gated by the user's preference (see above).
* The notebook's pick mode does not highlight the picked row; the finale shows the choice in its bottom bar.
* The finale's hold-to-charge has no visual countdown text, only the fill.
* Timeline drag computes the target slot from a fixed row height (64 + 8 px); very long card texts are clamped
  to two lines to keep that true.

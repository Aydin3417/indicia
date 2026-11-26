# Handoff — Agent D · Olay yeri (wave 2)

Crime-scene investigation (PLAN §3.3) as a self-contained feature in `src/features/scene/**`, plus a dev harness
at `app/dev/scene.tsx`. Nothing outside those paths was touched.

## Exported API (`src/features/scene/index.ts`)

```ts
export function SceneScreen(props: {
  view: InvestigationView;      // the current v2 view (shell keeps it fresh)
  locationId: string;           // the place to render (shell decides; should be view.map.current)
  act: Act;                     // runs one action
  onExit: () => void;           // "Leave" button
  t: (key: string) => string;   // i18n lookup; keys are 'scene.*'
  idleAssist?: boolean;         // default true — shimmer after 20 s without progress (wire to the settings toggle)
  haptics?: boolean;            // default true — native only (wire to prefs.haptics)
}): JSX.Element

type Act = (path: string, body?: unknown) => Promise<ActionResult | ActFailure | null>;
type ActionResult = V2Response;                                  // { view, event }
interface ActFailure { error: string; code?: ApiError['code'] | 'network'; reason?: ErrorReason }
export { sceneStrings }  // { en, tr } — flat keys incl. the 'scene.' prefix
```

* `path` is relative to `/sessions/:id/v2` **and starts with a slash**: the scene calls `'/inspect'`, `'/probe'`,
  `'/detail'` only (bodies exactly as CONTRACT §3; `tool` is always sent on `/detail`, `'torch'` included — the server schema accepts it).
* `act` resolving to `null` on failure (as specified) works. **Recommended:** resolve to `ActFailure`
  (`{ error, code, reason }` straight from the server's `ApiError`) — then the player sees the server's localised refusal
  (e.g. "You need the right tool for that.", "Nothing fluoresces here.", the `no_time` sentence). With `null` the scene
  falls back to a local generic sentence. A `Promise<V2Response | null>` function is assignable to `Act` as is.
* The shell must also replace its cached view with the returned `view`. The scene additionally keeps the newest view it
  received (by `view.version`) so the close-up can open before the parent re-renders.
* The scene renders inside the parent's `SafeAreaProvider` + `GestureHandlerRootView` (both already in `app/_layout.tsx`)
  and wants the full screen (`flex: 1`). It has its own top bar (Leave · day/time · remaining today · notebook count) and
  bottom bar (message · next action + cost · tool rail), so mount it as a full-screen mode, without the desk's tab bar.
* `sceneStrings` is a named export `{ en, tr }` of flat keys, so `src/i18n/features.ts` (`require.context` on
  `features/**/strings.ts`) picks it up automatically. A missing key falls back to the English scene string, never to the raw key.

## How it plays

* **Dark room.** The place is drawn top-down in SVG from `scene.plan` (planks, walls, doors, furniture chosen by the v1 plan
  label — bench, tool wall, shelves, cabinet, sink, ladder, desk, files, sofa, courtyard cobbles, bike rack, coats,
  reader, lectern, case — the body with a chalk line, shavings and dust). It renders once per scene (`memo`).
* **Torch.** A static SVG (radial-gradient hole in a big dark square) moved by a Reanimated transform on the UI thread —
  nothing re-renders while the light moves. Finger drag moves it (on touch the beam sits 44 pt above the fingertip);
  mouse hover moves it on web. Holding the finger/mouse near an edge pushes the camera (`useFrameCallback`); pinch zooms and
  pans around the focal point; `+`/`−` buttons zoom (all the way out = whole room width, all the way in = 2.6× "cover").
* **Zones are not marked.** Which zone the beam is on is computed in a worklet (`zoneUnderLight`) and crosses to JS only
  when it changes; that zone gets a faint dashed outline under the beam. Inspected zones get a numbered yellow evidence tent.
* **Cost before commit.** Tapping a lit zone puts it in the bottom bar: name, "Close-up · 20 min", `Examine` (or tap it again).
  Re-opening an inspected zone is free and immediate. Tapping nothing says "Nothing here worth a closer look." (free, local).
* **Tools** (rail at the bottom): torch · UV lamp · powder · camera.
  * UV: the light turns violet, generic fluorescent traces appear under it; a tap offers "Search under UV — 10 min, 30 min if
    something shows" (`/probe`), plus `Examine` when a zone is lit.
  * Powder: brushing (drag) lays powder strokes; after ≥ 70 scene units of brushing the bar offers "Check for prints" at the
    stroke's centre (`/probe` dust). A hit opens the newly found zone's close-up.
  * Camera: for details inside a close-up (`tool: 'camera'`).
* **Close-up card:** code-drawn plate for the zone (17 motifs picked by `closeUp.art` or zone id keyword, generic fallback),
  the authored text, details as glints. Free details collect on tap. Tool details look like a faint dashed ring until the
  right tool is selected (UV: violet bloom, powder: whorl, camera: viewfinder brackets); then the bar shows "Tool use · 10 min"
  and commits on the button or a second tap. Wrong tool → the action goes to the server, which refuses for free; its reason is shown.
* **Feedback:** new facts/evidence pop as paper chips at the spot and fly into the notebook counter (staggered), light haptic;
  every cost shows "−20 min" under the clock; refusals show in burgundy with a warning haptic.
* **Always visible:** remaining today, day/time, the cost of the next action (bar), `Leave`. Day over / not here / wrong phase
  show a banner; actions are pre-checked against `clock.remainingToday` (probe needs tool + close-up) and refused locally
  without a call; server refusals cost nothing and are shown as well.
* **Idle assist:** after 20 s without discovering anything, a slow shimmer appears at the visible, uninspected zone closest
  to the beam (`idleAssist={false}` disables it). Hidden zones are never hinted (their positions aren't sent).

## What I verified (375×812, Browser pane, dev harness `/dev/scene`, Kessler draft, user `dev.agent-d-000001`)

* `npx tsc --noEmit` for the whole repo → exit 0, no output. `npm run check:boundary` → `boundary ok`.
* EN: travelled to Workshop (08:30, "7 h 30 min left"); the beam lit Thomas's bench with a dashed outline; tapped the body →
  bar "The victim · Close-up · 20 min · Examine" with a reticle → Examine → "−20 min", notebook 2→3 (evidence chip flew),
  close-up plate with the body; tapped the glint → "NEW FACT — His reading glasses were folded on the bench, not on him.",
  notebook 4, "Found here: Reading glasses".
* Vault: tapped the case twice (second tap commits) → close-up; tapped the varnish detail with the **torch** → server
  `needs_tool` → "You need the right tool for that.", clock unchanged (6 h 20 min); switched to **UV** → plate turns violet,
  detail blooms, bar "Something here · Tool use · 10 min · Look under UV" → commit → "−10 min", fact
  "Under UV the varnish of the vault violin glows evenly.", notebook 5.
* TR (Accept-Language tr): Workshop zoomed fully out (whole room); **powder** brush over the ladder's upper rungs → bar
  "Tozlanan yer · 10 dk, bir şey çıkarsa 30 dk · İz var mı bak" → `/probe` hit cost 30 → "Bir şey beliriyor.", notebook 6,
  hidden zone "Upper rungs (dusted)" close-up opened. **UV** tap on an empty spot → `/probe` miss cost 10 →
  "Burada ışıyan bir şey yok." (server's sentence).
* Idle: 26 s without progress → shimmer rendered at the bow cabinet (closest uninspected zone to the beam).
* Out of time: burned the day to 20 min via the API, then from the (stale) scene tried a UV probe → server `no_time`
  → "Bugün buna yetecek vakit kalmadı. Günü kapat.", no time charged; `İncele` (20 dk) still fit → 16:00, "0 dk kaldı",
  banner "Gün bitti. Olay yerinden çıkıp günü kapat."; re-opening an inspected zone and a free detail still worked at 0 minutes.
  EN again on day 2 with 20 min left: UV probe refused locally ("Not enough time left today for that.") without a request.
* `act` returning `null` (harness "null-fail" toggle): refusal shows the local "Olmadı. Bir daha dene.", no crash.
* Edge push: holding the pointer at the right edge moved the canvas from `translateX(-362px)` to `(-852px)`.
* Camera tool on the room: "Kamera ayrıntılar için. Önce yakından bak." hint; lit zones can still be examined.
* Console: no JS errors after my last fix; the remaining red lines are the browser's network log of the intentional
  409/400 refusals, and Metro 500s from other agents' files that were mid-edit during the session.

**Test-environment caveat.** The Browser pane was hidden the whole time, so `requestAnimationFrame` and `ResizeObserver`
never fired. For the later runs I injected, *in my own tab only*, a timer-based rAF and ResizeObserver before the bundle
started; nothing in the app depends on them. Consequences: animation *timing/smoothness* (torch tracking at 60 fps, chip flight,
fades, shimmer pulse) was not observed visually; positions/state were verified through the DOM and screenshots.
Touch-only paths (pinch, two-finger pan, the 44 pt touch lift) and haptics were **not** exercised (no touch device here).

## Bug found and fixed while testing
`useFrameCallback` was given an inline worklet → Reanimated re-registered it on every render and an unregister for a
stale id threw inside its UI queue (`Cannot set properties of undefined (setting 'startTime')`), which stopped animated
styles from updating. The callback is now memoised (`useCallback([], …)`).

## Contract requests
1. **`act` failure shape** (for the shell, not the server): please resolve to the server's `ApiError` (`{ error, code, reason }`)
   instead of `null` so the scene can show the server's localised refusal.
2. **Localised plan labels or art keys per furniture item.** `scene.plan` labels are English v1 strings; I only use them as
   hints to pick a furniture drawing (never shown). A `kind` field per plan rect (`bench`, `shelf`, `sink`…) would make this robust.
3. **`closeUp.art` keys** for every zone (Kessler has none): the close-up motif is currently guessed from the zone id
   (`z-body`, `z-ladder`…). B's content will want to set e.g. `art: 'kessler/bench'`.
4. Optional: a per-zone "glint" position for the idle shimmer of *hidden* zones (contract deliberately omits it; fine as is).

## Known gaps / honest notes
* **How it looks.** The room is a decent overhead "forensic plate" in the dark: planks, wall shading, furniture silhouettes,
  chalk-outlined body, shavings; with the torch it reads as searching a room. It is still clearly a code drawing — flat
  shapes, no perspective, no texture, the body is a stylised silhouette. Close-up plates are simple vector still lifes
  (body, pegboard with the crooked mallet, violin top, ledger, sink, cobbles with tyre marks…) behind a lens vignette;
  some are generic. **Real art** needs, per place: one top-down (or ¾) painted plate at ~2200×1800 with a separate
  "UV pass" layer (what fluoresces) and an optional "powder pass", and per zone a square close-up plate (~1200²) whose
  detail positions match `details[].x/y`; ink/graphic-novel style per PLAN §8. The drawing code is isolated in
  `SceneArt.tsx` / `CloseUpArt.tsx`; swapping in images keyed by `scene.art` / `closeUp.art` is a contained change.
* No sound (PLAN §5 torch click etc.) — wave 4 / `ear`.
* Zoom buttons jump (no animation) by design so the camera clamp stays consistent; pinch is continuous.
* Brushing shows the powder strokes immediately but strokes are local (lost when the scene unmounts); found dust zones keep a mark.
* Plate text and labels are case content: Kessler is still an English draft, so in TR the zone names and close-up
  texts are English until Agent B's content lands. All UI strings are TR/EN.
* Accessibility: tool rail, buttons and details have labels, but finding zones in the dark is inherently visual;
  a "list mode" for screen readers would be a separate feature.

## Files
* `src/features/scene/index.ts` — exports.
* `src/features/scene/SceneScreen.tsx` — screen, gestures, camera, pending/cost bar, act handling, idle assist.
* `src/features/scene/Torch.tsx` — darkness/light overlay (UI-thread transform).
* `src/features/scene/SceneArt.tsx` — static room drawing. `SceneLayers.tsx` — lit-zone outline + evidence tents, UV traces, powder.
* `src/features/scene/CloseUp.tsx`, `CloseUpArt.tsx` — close-up card and plates.
* `src/features/scene/FlyChip.tsx` — fact/evidence fly-to-notebook chip. `ToolRail.tsx` — tool rail and icons.
* `src/features/scene/geometry.ts` — canvas units, zone hit-testing (worklet), clamps. `feel.ts` — haptics. `types.ts`, `strings.ts`.
* `app/dev/scene.tsx` — dev harness (session, language toggle, travel, end day, fresh session, "null-fail" toggle, last action line).

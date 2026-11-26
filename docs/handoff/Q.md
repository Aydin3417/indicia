# Handoff — Agent Q · UI frictions (wave 7)

PLAYTEST_V4 §7 items 4–5 (+ §2.9 wording), R's request 2, S's client requests 1–3. No commits. 8787/8140 untouched.
My servers: API 8791 (`DATA_DIR=C:\temp\indicia-q`), Expo web 8151 (`EXPO_PUBLIC_API_URL=http://localhost:8791`),
headless Chrome on 9345 with `--mute-audio` (profile `C:\temp\indicia-q-chrome`) — all stopped at the end.

## What changed

| # | Friction | Fix | Where |
|---|---|---|---|
| 1 | Toasts covered the coach line and the night fork card (V3 #8) | **Placement slots.** A screen wraps what toasts must not cover in `<ToastGuard edge="top"/"bottom">`; it measures itself in window coordinates while its screen is focused (expo-router `useFocusEffect`) and the host draws below it (top) or above it (bottom). Desk tabs guard the strip + coach line (toasts land under it); the day report guards its footer (toasts sit above the "next morning" button, so the fork card and the night text stay readable). **At most 2 on screen** (a toast with an action is kept over a plain one), text clamped to 2 lines, slightly tighter padding. Default (no guard) is unchanged: under the status bar. | `src/state/toasts.ts:18` (`ToastSlot`), `:25` (`MAX_VISIBLE`), `:44` (`setSlot`); `src/components/Toasts.tsx:14` (host), `:64` (`ToastGuard`); `app/desk/[sessionId]/(tabs)/_layout.tsx:25`; `app/desk/[sessionId]/report.tsx:55` |
| 2 | TR press note cut at 375 pt ("bedava · yeni bilgi y…") | The note under Üstele/Press now splits at its " · " onto two centred lines ("bedava" / "yeni bilgi yok", "15 dk" / "bulgu verir"); `numberOfLines={2}`. Both moves stay the same height. | `src/features/interview/InterviewScreen.tsx:432`, style `:512` |
| 3 | Two "Odaya dön" in the close-up | The close-up card's own button is gone; the dock's "Odaya dön" (thumb reach, always visible) is the one way back and now also clears a pending action. | `src/features/scene/CloseUp.tsx:133`, `src/features/scene/SceneScreen.tsx:738` |
| 4 | Finale intro repeated | Per-session memory `introRead` (new `src/state/session.ts`, AsyncStorage `indicia.session.v1`). The prosecutor's paragraph is marked read when the player leaves the intro beat; on any later visit it folds to 2 dimmed lines with "Devamı/More". The prelude (first confrontation card) no longer repeats it when it is the same text and has been read — it shows the portrait + rules only. | `src/features/finale/FinaleScreen.tsx:266` (intro), `:422-423` (prelude); `src/state/session.ts:39` |
| 5 | Timeline order lost on leaving / reload | Same store: `drafts["<session>/<deduction>"]` holds the unfiled order + set-aside card (and, for fill-in cards, the placed blanks). Written on every change (debounced 250 ms), restored once storage answers unless the player already touched the card; only a clean arrangement of today's cards is restored; cleared when the question is confirmed. Bounded (40 drafts, 40 sessions). | `src/features/deduction/DeductionBook.tsx:188` (restore), `:241`/`:251`/`:336` (save), `src/state/session.ts` |
| 6 | Scene min zoom | The floor is now "the whole painted room fits" = `min(w/CANVAS_W, h/CANVAS_H)` (was width-only, which on a wide window cropped the room's height and left no way to see it all); `zoomBy` ignores a press before layout. At 375 the floor is 0.341 (whole width, room centred), at 900×600 it is 0.422 (whole height; the old floor was 0.818). **Note:** the "crops on the right at 375" in PLAYTEST_V4 was most likely a harness artefact: a headless Chrome whose CDP override drops between driver commands reverts to its real window (504×716 here), the scene lays out at 504, and the floor follows that width. With a held override the floor is exact at 320/375/430. | `src/features/scene/SceneScreen.tsx:212`, `:549` |

### Small frictions fixed on the way (no redesign)

* Timeline cards at 320 pt were cut after 2 lines ("çantası …"): 3 lines fit the 64 pt row. `src/features/deduction/Timeline.tsx:186`, `:216`.
* Scene header at 320 pt cut both halves ("2 YER KALD…" / "3 sa 5 dk kal…"): the sub-row wraps instead. `SceneScreen.tsx:764`.
* Co-op ledger said waiting costs "the minutes you wait" — in co-op it moves only your own clock (server `wait()`): new keys `desk.costs.waitValueCoop` EN "moves only your clock" / TR "yalnız senin saatin ilerler". `app/desk/[sessionId]/day-end.tsx:120`, `src/i18n/en.ts:310`, `tr.ts:311`.

### Requests from other agents

* **R request 2** — the map's "where you are" plate now waits for `useArtReady()` (loads when the map is in front, web only). `app/desk/[sessionId]/(tabs)/index.tsx:111`, `:126`. (R's request 3, Saar's portrait, not touched.)
* **S request 1** — `crimeOf()` reads `offence` first (then `crime`), `OffenceKind`; Truth-star "partly" line per offence incl. arson: EN "Right person, but the motive or how the fire was set never landed." / TR "Doğru kişi, ama saik ya da yangının nasıl çıkarıldığı ispatlanamadı." `FinaleScreen.tsx:309`, `:591`; `src/features/finale/strings.ts:82`, `:179`. Briefing reporter/victim label reads `offence ?? crime` (arson keeps "MAĞDUR / THE VICTIM"). `briefing.tsx:44`.
* **S request 2** — `DeductionView.notYet` shown as a muted italic line under the prompt on the open card in the book, and under the sentence inside the question (filing stays allowed). `DeductionBook.tsx:99`, `:376`, style `:623`.
* **S request 3** — generic drawings for the fennick documents and analyses (exact list from S.md) in `src/art/index.ts:47` (evidence) and `:87` (analyses). Small additive edit in R's area at the coordinator's request.
* S request 4 (code-drawn kiln/racks shapes) and 5 (HQ plus card) not done.

## How verified

* `npm run check` → typecheck ✓ · boundary ✓ · kessler-workshop / first-watch / fennick-yard VALID · **118/118 tests**.
* Own headless Chrome over CDP (O's driver adapted, plus a small "holder" process that keeps the viewport override so the page never flips to the real window size between commands), TR, First Watch / Kessler / Fennick sessions on my API, the repetitive stretches replayed over HTTP with the player's own token. Screens in `docs/screens/wave7/`:
  * `01-toasts-below-coach-tr-375` — a real collect in the tutorial, then a 3-toast burst through the store: 2 shown, under the coach line (slot y = 161).
  * `02-interview-press-note-tr-{320,375,430}` — Ada, claim selected: "bedava / yeni bilgi yok" whole at all widths.
  * `03-fork-toasts-above-footer-tr-375` — Kessler day 1 ended by hand, fork "Bu gece sen git" chosen by hand: fact + fork toasts above the footer, the fork's title/prompt free. `-320`, `-430`: same placement with a burst.
  * `04-closeup-one-back-tr-{320,375,430}` — `closeup-back` absent, `bar-back` present.
  * `05-timeline-kept-after-reload-tr-{320,375,430}` — Kessler timeline rearranged with ↑/↓/✕, page reloaded, question reopened: same order and set-aside card; storage shows the draft.
  * `06-scene-min-zoom-tr-{320,375,430}`, `06-scene-min-zoom-wide-900` — transforms 0.2909 / 0.3409 / 0.3909 (= w/1100) and 0.4224 (= h/902).
  * `07-finale-intro-first-tr-375` (full paragraph) → "Henüz değil" → `07-finale-intro-again-tr-{320,375,430}` (folded, "DEVAMI"); `08-finale-prelude-no-repeat-tr-375` — Ada charged by hold: portrait + rules, no repeated paragraph.
  * `09-fennick-notyet-tr-{320,375,430}` — "Susan alarm" with the engine's not-yet line; `10-fennick-timeline-7-tr-{320,375,430}` — the 7-card timeline (Plus granted with the dev test purchase on my server).

## Still open

* The toast slots cover the desk tabs and the report; the interview, scene and finale use the default (top). The interview has its own bottom banner, so toasts over its portrait header are tolerable; a guard can be added the same way if the next playtest says so.
* A pending close-up detail shows × and the action in the dock instead of "Odaya dön" (cancel first, then back) — unchanged by design.
* Fennick: art falls back everywhere (T's wave); the ⚡ floating button seen in screenshots is the Expo dev tools overlay on web, not the app.
* Dev only: after an API restart the earlier sessions answered "eski bir baskı" (S changed case hashes) — expected.

# Handoff — Agent U · Comprehensive playtest V5 (wave 8)

Report: [`docs/PLAYTEST_V5.md`](../PLAYTEST_V5.md). Screens: `docs/screens/wave8/` (71 files). No commits.
8787/8140 and foreign tabs untouched. Everything I started is stopped: API 8796 (`DATA_DIR=C:\temp\indicia-u`), Expo
web 8156, static export server 8159 (`C:\temp\indicia-u-dist`), headless Chrome on CDP 9356 with `--mute-audio`
(profile `C:\temp\indicia-u-chrome`), my driver on 9456.

```text
npm run check                          → typecheck ✓ · boundary ✓ · 3 cases VALID · 121/121 tests (+3 wave8.test.ts)
npx tsx server/content/playthrough.ts  → 3 cases × EN/TR confession 3★, no cross-language leaks (fennick 780/1260)
production first screen                → 1204 KB (JS 687 · fonts 347 · images 160 · other 10), FCP 1.45–1.62 s
```

**Case hash of `fennick-yard` changed** (content fixes below): sessions opened on the earlier edition are refused, as
designed. **Orchestrator: run `npm run sync:functions`** (server files changed).

## Open requests closed

| From | Request | Done |
|---|---|---|
| T | `FACE` centres for the 9 Ash and Glaze people | `src/art/index.ts` — T's values, checked on overlays of the composed portraits (`screens/wave8/93-…`). |
| T / S | Fallback pictures for fennick documents/testimony | Q had added the generic drawings; added `ev-camreq` → folder, and close-up stand-ins for items that have a painted spot: `ev-notice` (back door), `ev-burnpattern`/`ev-debris` (racks), `ev-alarmlift` (alarm), `ev-shoeprint` (slip), `ev-dvr` (recorder). |
| T | Detail hotspots on the drawn objects | `server/cases/fennick/scenes.ts`: 23 of 28 details moved, each checked on an overlay of its close-up (+ UV variants), `screens/wave8/90–92`. |
| Q | Toasts on interview/scene/finale | Scene header wrapped in `ToastGuard` (toasts land under clock + notebook count). Interview: own banner, left. Finale: no global toasts observed. |
| S | HQ Plus card / paywall path with missing cover | Card shows a "Detective Plus" tag; locked case page gets a "See Detective Plus" button (`/premium?source=case`). Played TR + EN: locked → paywall → test Plus → take the case. |

## Bugs and frictions fixed

| # | What | Where |
|---|---|---|
| 1 | Locked Plus case page ended in a sentence, no button; no Plus tag in the library | `app/case/[caseId].tsx`, `app/hq/cases.tsx` |
| 2 | TR said "Detective Plus" (paywall stamp, active title, start button, two toasts) | `src/i18n/tr.ts` |
| 3 | **Spoiler**: gate log, melted cap and Ostkai camera listed "Kişiler: Oskar Dahl" on day 1 | `server/cases/fennick/evidence.ts` (`relatedPeople`), test |
| 4 | **TR clock errors**: Bram/Kranz "biri yirmi geçe" for 00:20; Selma's kiln "biri beş geçe" for 00:55 | `evidence.ts`, `suspects.ts`, test scans the case |
| 5 | Heater fork default text "until eleven" vs result 12:00 | `server/cases/fennick/v2.ts` |
| 6 | Lab conclusion wording EN+TR ("nothing … is made of it") | `evidence.ts` |
| 7 | Selma's greeting described day 1 on every day; her day-1 note read as "busy" | `suspects.ts`, `v2.ts` |
| 8 | Briefing/synopsis TR: "fırının gece ustası" (kiln vs bakery), "Ekibin", present tense | `server/cases/fennick/meta.ts` |
| 9 | Refiling an identical refused answer cost another 30 min | `src/features/deduction/DeductionBook.tsx`, `strings.ts` (`deduction.sameAsRefused`) |
| 10 | Time chips sorted as text across midnight (00:40 before 21:15) | `src/features/deduction/chips.ts` (`nightOrder`) |
| 11 | Deductions tab reopened on yesterday's confirmed result page | `DeductionBook.tsx` (`useFocusEffect` → back to the book on leave) |
| 12 | "Now · With his mother until noon" at 15:30 (stale note of a late-opening window) | `src/features/desk/format.ts` |
| 13 | TR "tozlayarak bak" lower case | `src/features/scene/strings.ts` |
| 14 | Debrief "Oskar Dahl: Dahl: …" | `src/features/finale/FinaleScreen.tsx` (`lieText`) |
| 15 | "1 questions can still be filed" | `src/features/finale/strings.ts` |
| 16 | Co-op TR showed unnamed members as "Investigator" (room, team, log) | `server/engine/i18n.ts` (`default_investigator`), `server/engine/v2/projection.ts`, `app/desk/[sessionId]/room.tsx`, `src/i18n/tr.ts`, test |

## Files changed

* Client: `src/art/index.ts`, `app/case/[caseId].tsx`, `app/hq/cases.tsx`, `app/desk/[sessionId]/room.tsx`,
  `src/i18n/tr.ts`, `src/features/deduction/{DeductionBook.tsx,chips.ts,strings.ts}`, `src/features/desk/format.ts`,
  `src/features/scene/{SceneScreen.tsx,strings.ts}`, `src/features/finale/{FinaleScreen.tsx,strings.ts}`.
* Server: `server/cases/fennick/{scenes,meta,evidence,suspects,v2}.ts`, `server/engine/i18n.ts`,
  `server/engine/v2/projection.ts`, new `server/engine/wave8.test.ts`.
* Docs: `docs/PLAYTEST_V5.md`, `docs/handoff/U.md`, `docs/screens/wave8/`, `README.md` (V5 link, third case row).

## Not done / for the next wave (ranked in PLAYTEST_V5 §5)

1. Device run + listening (unchanged).
2. A read-and-collect notebook sheet inside interviews (today: leave, collect, pay 30 min to re-open).
3. Finale suggestions put the right answer first every round.
4. "Ready when you are — see the prosecutor" banner from the first deduction of a 3-day case.
5. Lab list keeps the fork route you did not take ("only the night desk can reach him").
6. Cast list shows Kranz and Nyberg from the start (mild spoiler).
7. Small: "New question" lines for already-confirmed questions in the day report; lingering NEW badges; TR log
   "X şuraya gitti: Y"; a lone full stop after an underlined clause.

## Tools (session scratchpad, not in the repo)

`u/drv.mjs` (CDP holder/driver, one browser context per player, held viewport), `u/c.mjs`/`d.sh` (commands),
`u/sv.mjs` (scroll + occlusion-checked tap), `u/go.mjs` (map travel), `u/zone.sh` (room tap → close-up → details),
`u/up.mjs` (timeline arrows), `u/api.mts` (ideal-path replay over HTTP with a player's token), `u/overlay.py`
(detail marks on close-ups), `u/static.mjs` + `u/measure.mjs` (export server + first-screen bytes).

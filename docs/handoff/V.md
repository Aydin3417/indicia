# Handoff — Agent V · Gameplay fixes from PLAYTEST_V5 (wave 9)

Closed the gameplay items of PLAYTEST_V5 §5 (2–7). No commits. 8787/8140 and foreign tabs untouched. Everything I
started is stopped: API 8797 (`DATA_DIR=C:\temp\indicia-v`), Expo web 8157, headless Chrome (`--mute-audio`, profile
`C:\temp\indicia-v-chrome`, CDP 9357), my driver on 9457. Screens: `docs/screens/wave9/` (24 files, TR 01–16, EN 20–27).

```text
npm run check            → typecheck ✓ · boundary ✓ · kessler / first-watch / fennick VALID · 129/129 tests (+8 in server/engine/wave9.test.ts)
npm run simulate:budget  → kessler ideal 905/1440 (63 %) exhaustive 134 % · fennick 780/1260 (62 %) 130 % · first-watch 57 % / 62 % — unchanged
npx tsx server/content/playthrough.ts → 3 cases × EN/TR confession 3★, no leaks
npm run sync:functions   → done
```

**Case hash of `fennick-yard` changed** (`hiddenUntilMet` on two people): sessions opened on the earlier edition are
refused, as designed. API changes are in `docs/CONTRACT_V2.md` §17.

## 1 · The notebook inside the interview (§5.2)

**Design.** The interview room now has the notebook: the header's notebook counter and a notebook button in the dock
open it full screen *over* the interview, which stays open. With a claim selected, "Present" opens the same notebook
as the picker (facts, evidence rows, a document's "use this evidence") and ends in one confirm with the cost.

**Collecting mid-interview: allowed.** It always worked server-side (`collect` is free and never touched an
interview); only the UI had no way in. Reading a document the detective already holds across the table is realistic,
and noticing the line is the actual thinking — the tax was leaving + 30 min, not a puzzle. What costs time (scene
work, travel, waiting, a wrong filing) still needs the desk. Played: Dahl's "every tenant chooses their own code" →
Present → Evidence → Ruth's statement → tap the line → back to Findings → present it → break. The clock moved 15 min
(the present), not 15 + 30 (`01`–`06`).

**Free return.** For the paths that still leave the room (filing a deduction that opens a topic, the lab bench, the
People tab): `interview/leave` remembers the game minute; `interview` re-opens **free** if no game time has passed
since (same day, same investigator in co-op, patience not out), outcome `resumed`, no second greeting, patience not
refilled. `SuspectV2View.interview.resumeFree` drives "Back into the room · free" / "Odaya dön · bedava" on People.
The transcript drops the "closed · 12:00 / opened · 12:00" marker pair of such a step-out. Played EN (`21`, `22`; `22`
was shot before the pair was hidden).

## 2 · The finale's suggested shelf (§5.3)

Before: `suggested` = every accepted piece you held, the right one first — a full book made the five rounds a
formality. Now (server, `projection.ts` `shortlist`): **one** piece that answers this round (the confirmed assist
deduction when there is one) among up to **3** pieces that each answer a *different* round (never one this round
would accept), ordered by an FNV hash of session id + round id + item id. Same between requests, different between
sessions, position independent of the truth. Label: "The strongest pieces of your file — one of them answers this" /
"Dosyanın en güçlü parçaları — içlerinden biri bu savunmayı çürütür". Played TR: picked the decoy "Susan alarm" on
round 1 (one try lost, "Yetmez. Bir daha dene."), then the right card; finished: confession, Truth + Proof + Clock
(4 of 5 first tries ≥ the 4 needed) (`11`–`16`). EN shelf of another session shows a different order and decoy
(`27`).

**Proof star:** unchanged rule (first-try wins ≥ rounds − 1, deductions ≥ 60 %/case setting). It makes more sense
now: "first try" used to be free with a full book; it now measures matching the right proof to the defence.

## 3 · The prosecutor banner (§5.4)

Client only (`app/desk/[sessionId]/(tabs)/index.tsx`). The top-of-map card shows when confirmed deductions reach
`proofStar.deductionsNeeded` ("When you are ready", amber) or on the last day ("Last day", with "the Proof star wants
{need}"). Before that the option is a quiet row above the briefing link: "Go to the prosecutor — The file is still
thin: 1 of the 11 deductions the Proof star wants" (`09`, `25`); the strip's gavel is unchanged. Tutorial: needs 1 of
1, so it shows right after the one deduction, as before.

## 4 · Smaller items (§5.5–5.7)

| What | Fix |
|---|---|
| Lab list kept the fork route not taken ("…only the night desk can reach him") | `forkRoadClosed`: a locked analysis that only a fork option can start disappears once every fork offering it is settled (either way, or its night passed). Kessler's `a-volvo`/`a-halberd` the same. |
| Cast list showed Kranz and Nyberg from the start | `Person.hiddenUntilMet` (content field); listed (and offered as person chips) once a held fact names them or held evidence lists them. Set on `p-kranz`, `p-nyberg` only (`26`). |
| Day report "Yeni soru: X" for questions confirmed the same day | `deductionsOpened` excludes that day's confirmed ones (also for stored reports). |
| NEW badge lingered on documents already read | Notebook remembers documents opened on this device until the server clears the flag. |
| TR log "Lind şuraya gitti: Fennick Avlusu" | `act_travel` "{0} yolunu tuttu", `act_intent_go` "{0} yolunda" (no case suffix needed). |
| Full stop after an underlined clause wrapped alone | Root cause: RN-web renders a `Text` with role `button` as an inline-block `<button>`. Inline tappable spans (document phrases, interview claims) now use role `link` (`<span>`, inline). Before `04`, after `08`. |

## Files

* Server: `server/engine/v2/{actions,projection,state}.ts`, `server/engine/types.ts` (`Person.hiddenUntilMet`),
  `server/engine/i18n.ts`, `server/cases/fennick/meta.ts`, tests `server/engine/wave9.test.ts` (new),
  `coop.test.ts`/`team.test.ts` (TR log strings). Shared: `shared/api.ts` (`interview.resumeFree`).
* Client: `src/features/interview/{InterviewScreen,Sheets,SuspectHeader,Transcript,strings}.tsx|ts` (`PresentSheet`
  replaced by `NotebookSheet`), `src/features/notebook/Notebook.tsx`, `src/features/finale/strings.ts`,
  `app/desk/[sessionId]/(tabs)/{index,people}.tsx`, `src/i18n/{en,tr}.ts`.
* Docs: `docs/CONTRACT_V2.md` §17, `README.md` status, this file, `docs/screens/wave9/`.

## Not done / notes

* `20` shows an intermediate dock (a labelled "Notebook" button that squeezed "Raise a topic · 5" onto two lines); the
  final dock uses an icon button (as in `22`), with the header counter as the second way in.
* The bottom tab badge still counts a read-but-not-yet-refetched document as new until the next view (the notebook
  itself no longer does); harmless, cleared on the next action.
* Co-op: the free return is per investigator (`left.by`); not played with two clients this wave (covered by the
  rule, not by a test).
* Unchanged from V5: device run, listening.

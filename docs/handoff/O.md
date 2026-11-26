# Handoff — Agent O · Full playtest (wave 6)

Played both cases in both languages and co-op with two and three real clients, closed the open handoff requests,
fixed what the play turned up, and measured the web build. Report: [`docs/PLAYTEST_V4.md`](../PLAYTEST_V4.md).
No commits, no branch changes. 8787/8140 were never touched; everything I started is stopped (API 8798 with
`DATA_DIR=C:\temp\indicia-o`, Expo web 8157, a static server for the production export on 8158, headless Chrome with
profile `C:\temp\indicia-o-chrome`).

```text
npm run check            → typecheck ✓ · boundary ✓ · kessler VALID · first-watch VALID · 106/106 tests (100 before; +6 in server/engine/wave6.test.ts)
npm run simulate:budget  → ideal 905/1440 (63 %) · exhaustive 1960 (136 %) · newcomer 1st win 09:50, 3 on day 1 — unchanged
npx tsx server/content/playthrough.ts → both cases × EN/TR: confession, 3★, no cross-language leaks
npm run art              → 128 images (+1: icon-288.webp)
npm run sync:functions   → done
```

**How I played.** A headless Chrome I drove over CDP (my own small driver, scratchpad `o/b.mjs`), one isolated
browser context per player (separate storage = separate identity), viewport 375×812 @2x, one check at 1440×900. The
built-in browser pane was not used (it throttles when hidden). Mid-run the owner asked that nothing be audible on
this machine: from then on Chrome ran with `--mute-audio` and every page muted its media elements; sound triggers
were checked only through the sound log (`globalThis.__indiciaSound.log`, dev builds). **I could not listen to
anything.** Repetitive steps (walking the ideal path between the beats I wanted to see) went through the real HTTP
API with the player's own token (scratchpad `o/api.mts`); every beat listed under "seen" was on screen.

## 1 · Open requests from the handoffs

| From | Request | Done | How / what I saw |
|---|---|---|---|
| P | Bank `z-bk-ledger` tap zone misplaced | ✓ | `scenes.ts` → `{x .66, y .68, w .22, h .15}`. In the bank scene the torch's dashed outline now sits on the drawn archive table and opens "Kapatma kayıtları" (`51-k-bank-ledger-zone-tr`, `52-…closeup`). |
| P | Side-question prompts give away "who" | ✓ | `d-courtyard` ("only one person could have been at that door then"), `d-money` ("in Thomas's name … the papers and the company lead to {who}"), `d-clean` ("everyone here handles that can; the trace that left the building belongs to {who}"), EN + TR. Truth and accepted answers unchanged (test asserts `who` still accepts only Clara and no woman/her/father/kadın/babası in either language). Played: a wrong `who` (Miriam) is rejected, Clara confirms. |
| P | `travel` on a closed case → 500 | ✓ | Not reproducible over real HTTP: the closed TR Kessler session answered **409 `phase`**. P's 500 came from an in-process driver that loaded `service.ts` twice (`instanceof ServiceError` false). Hardened anyway: `ServiceError.name`, `isServiceError()` in `onError`; test. |
| P | TopStrip "I'm done for today" for co-op non-leads | ✓ | `TopStrip.tsx`: for a non-lead the day-over label is "I'm done for today"/"Bugünlük bu kadar" (or "Done for today" once done) and a tap posts `done`. The ledger (`day-end.tsx`) now gives non-leads a "I'm done for today" / "Back at it" button. Seen: `82-coop-nonlead-strip-done-tr`, `83-coop-nonlead-dayend-en`. |
| P | Duplicate suggestion UI for finale followers | ✓ | `FinaleTeam.tsx` follower half removed; a follower only sees teammates' suggestions there. Seen: Kaya has one "Cevap öner" path (`85`), the lead sees "Kaya suggests · Not a fall · Answer with this" (`87`). |
| P/L | Quieter room tone for the four new places | ✓ | New loop `assets/audio/rooms/quiet.wav` from the same CC BY 3.0 Delft recording (201.5–236.5 s, a stretch with **no ear events**), band-passed 80 Hz–4 kHz, −37 LUFS (3 LU under the other beds), file starts on a zero crossing. `ear`: ambience score 88 like the other beds (only the one-shot "noise bed below peak" note), seam step 4× below the p99 step, seam RMS within 1.1 dB, 0 events/defects at the seam. `LOCATION_ROOM` maps varga/clara/bank/pawn → `quiet`; seen `room quiet:set` in Varga's flat. CREDITS.md row added; `build-rooms.py --only quiet`. No new download (L's source cache was in the scratchpad). |
| N | Day-1 budget when friends join late | ✓ | `PlayerClock.budget`: a member who joins after the day's budget was fixed gets the share for the team as it is now (2 → 290, 3 → 200), cleared next morning. Seen: Kaya joined at 09:20 into a 2-player day and got **3 h 20** while the others kept 4 h 50 (`76-coop-third-latejoin-tr`). Test. |
| N | Clock star deadline meaning in co-op | ✓ | `clockStar.work` (co-op): the strip reads "★ Clock star: day 3, within 1 h 12 min of work" / "★ Saat yıldızı: 3. gün, ilk 1 sa 12 dk mesai içinde" instead of a wall-clock time. Test. |
| K | Forks shown, Proof "11 of 13", crime-aware copy | — | Already done by M/P; played both forks both ways. |
| K | "Not yet" hint on the motive card while it can't be filled | skipped | Content/UX nicety, not a bug; the card shows its blanks and the book says new findings open things. Listed in PLAYTEST_V4 §7. |
| M | Night id; art for new places; instrument drawing | — | Done by N/P. |
| M/P | Receipt drawing, non-readable email, powder layers, pawn props | skipped | Art generation needs the owner's Flow session and is a separate art pass; nothing in play is broken without them (fallback drawings show). |
| L | In-app credits for the CC BY room tones | skipped | Store/legal task; attribution text is in `assets/audio/CREDITS.md` (now incl. `quiet.wav`). |

## 2 · Bugs the playtest found (all fixed)

| # | Bug | Fix | Test / seen |
|---|---|---|---|
| 1 | **Free guessing at the end of a day.** With less time left than a miss costs, wrong filings cost what was left — 0 once the day was spent — so any question (the timeline included) could be brute-forced for free every evening. Played it: three wrong timeline filings at 16:00 for 0 min. | A question now takes at most 2 cheap misses while today can't pay a full miss; the third is refused *before judging* with `no_time` (no information leak); resets each morning. `triesLeft` is set in that state and the book says "Too little time left today to pay for a miss: 2 wrong tries left on this question today." | `wave6.test.ts`; `92-short-tries-en`. `v2.test.ts` timeline test now resets the clock (it reached the puzzle with 15 min left). |
| 2 | **Lead leaves a team that is all done → day never ends.** Seen: Demir done, Kaya out of time, Aksoy left — day 1 stayed open with nobody who would act. | `endDayIfAllDone()` in the service, run after every action (as before) and now after `leave` / `removePlayer`. | `wave6.test.ts` |
| 3 | **Everyone in a co-op room is "Investigator".** A friend arriving by invite link from first launch has no name; with two unnamed players the team panel and the log were unreadable (`72-coop-guest-firstlaunch-en`). | The room screen asks unnamed members for a name ("Your name on the team"); HQ and Dossier show the default name localised ("Müfettiş"). | seen `73-coop-room-named-tr` |
| 4 | **Turkish UI fell back to English singulars**: "Ekibin taslakları · 1 · **1 suggestion**". `translate()` used `en[key_one]` when Turkish had no `_one`. | Fallback to the English singular only when the language has no form of the key at all. Affects every `_one` key in TR. | seen in `81-coop-drafts-tr` (before) |
| 5 | **Night-fork options spoiled their own finding** ("…naphtha on the wheel…", "…bought on 3 September from CK Atelier…" readable before choosing). | Option texts now say what the night costs, not what it yields (EN/TR). **Case hash changes** — sessions opened on the previous edition are refused by design. | balance test adjusted |
| 6 | Tutorial briefing labelled the museum director "THE VICTIM" in a theft. | "REPORTED BY" / "İHBAR EDEN" when `case.crime === 'theft'`. | |
| 7 | "3 deduction(s) confirmed" | "Deductions confirmed: 3." | |
| 8 | Co-op: out of time showed "press done" with the done button disabled (server already counts out-of-time as done). | Hint only while not done. | `82` |
| 9 | Co-op team panel said "each of you has 4 h 50" to a late joiner with 3 h 20. | Shows the viewer's own share. | |
| 10 | 373 KB store PNG as the in-app emblem. | `icon-288.webp` (17 KB) via manifest/`npm run art`; `iconArt()` prefers it. | |
| 11 | Web: 22 interface WAVs (1.79 MB) fetched on the first case screen, before anything could play. | Web preloads on the first gesture (native unchanged; a sound asked for earlier still plays, its player is created on demand). | first screen 3.79 → 2.06 MB |

## 3 · Verified (what I saw)

* **First launch → tutorial**, TR and EN, by hand: briefing, map tip, scene sweep/close-up/detail, Notebook →
  Evidence → underlined line ("Deftere yazıldı" + "new question" toasts), Ada: claim underlined → wrong present
  (patience 4→3, "Bunun benimle ilgisi yok") → right present → "BROKEN", portrait changes; deduction filed wrong
  (confirm sheet "costs 30 min") → nudge "More than one blank is off. Start with “who”." → right → stamp; finale with
  hold-to-accuse, a lost round (EN, "Charged — the case holds", Proof star missed 2/3 first tries) and a clean
  confession (TR, 3★).
* **Kessler TR** (solo): workshop by hand with every tool (UV beam with the LUT layer, a UV miss "Burada ışıyan bir
  şey yok" −10 min, powder/camera switches); timeline puzzle by hand (wrong order rejected "Ayırdığın kart doğru;
  sıra tutmuyor", reorder with the arrows, set aside, confirmed); day-1 ledger, end day, report with art, **fork 1
  "Bu gece sen git"** chosen by hand; day 2 waiting by hand ("30 dk bekle"); **fork 2 "Yedide masanda ol"**; lab
  results collected on the map; all four new places (Varga's window close-up by hand, Clara's flat under UV, the
  pawnshop, the bank with the moved zone); side questions (courtyard wrong `who` then right, follow the money);
  13/13 confirmed; finale round 1 by hand with "Avlu lambası" (side question as assist) → **full confession**, Truth
  and Proof stars, Clock star lost on purpose (25 min left vs 6 h needed); `travel` afterwards → 409.
* **Kessler EN** (solo): Leo shut out after five wrong presents ("Leo will not talk to you again today"); both
  forks left to their defaults (the map's "A decision is waiting — Decide" row; the default settled on the next
  action, `lab_full` refusals followed as designed); the last day ended by hand → "See the prosecutor" → **forced
  finale** ("Your days are over, but the file is still open…") → **Jonas accused** → "CASE COLLAPSES" →
  `verdict_bad`.
* **Co-op, 3 clients**: lead (TR) created the room; a guest arrived **by invite link from first launch** (EN, straight
  into the room, skipped the tutorial); a third (TR) went through first launch, then HQ → room code → joined after the
  lead had spent time (late-join budget). Intents ("Ön ofis yolunda" on the lead's map), private bank papers ("ONLY
  IN YOUR NOTES" + "Read out to the team" → the lead's notebook has it, log line "ekibe okudu: …"), drafts and a
  suggestion, done from the ledger and the strip, the lead leaving ("Ayrıl (görev devredilir)") → the guest leads,
  the new lead starting the finale, the follower suggesting, the lead seeing it and answering with it (retry/lost).
* **Desktop 1440×900**: HQ and verdict centred in the 760 column, nothing stretched (`90-desktop-wide-hq-en`).
* **Sound log** (dev build): `torch_on`, `uv_on`, `tool`, `fact`, `page` (document opens, report), `patience`,
  `breakthrough`, `wrong`, `confirmed`, `day`, `lab`, `night`, `won`, `retry`, `lost`, `verdict_bad`, `star` and
  `star_dim` (logged `locked` on a reloaded verdict page, i.e. fired before a gesture), room tones `gallery`,
  `workshop`, `interview`, `quiet`. **Not observed in a played moment:** `press`, `resist`, `torch_off`, `verdict`
  (my confession rounds after round 1 went through the API). They go through the same `feelEvent → SOUND` table.
  Settings → "Sound effects" off saved `{"sfx":false}` and a later cue logged `off`; on again restored it.

## 4 · Performance (production web export, gzip, served locally, no throttling)

| | Before | After |
|---|---|---|
| JS (12 files) | 676 KB gz / 2.74 MB | same — `__common` 1.55 MB + `entry` 1.10 MB minified; route chunks 0.3–16 KB |
| Fonts | 8 TTF, 649 KB gz | same (all used weights) |
| First screen (briefing) total | **3.79 MB** (incl. 22 WAVs 1.79 MB, icon PNG 373 KB) | **2.06 MB** |
| First contentful paint | 1.56 s | 1.69 s (noise; local) |
| JS heap across briefing → map → scene → UV → people → interview | — | 18–28 MB, no growth trend |
| Decoded images in the DOM | — | 4–9 images, ≤ 12.3 MPx (scene plate + UV layer ≈ 6.6 MPx); report/fork art fetched only on its screen |
| Room tones on web | 1.55–1.72 MB each, fetched on first entry to a room | unchanged (see PLAYTEST_V4 §7) |

**Android:** no Android SDK, `adb` or emulator on this machine (only a JRE). A device test still needs: a dev build
(`npx expo run:android` with SDK 58 / RN 0.88, or EAS), a real phone for gesture-handler 3 drags (torch sweep,
timeline drag, chip drag), haptics, expo-audio on device (silent switch, AppState pause, gapless WAV loops, phone
speaker level of the beds), Reanimated performance on a mid-range phone, and memory with 2000×1640 plates.

## 5 · Files

* Server: `server/service.ts` (`isServiceError`, `endDayIfAllDone`, leave/remove), `server/http/app.ts`,
  `server/engine/v2/{actions,coop,projection,state}.ts`, `server/cases/kessler/{deductions,scenes,v2}.ts` (**case hash
  changed**), tests `server/engine/wave6.test.ts` (new), `v2.test.ts`, `balance.test.ts`.
* Shared: `shared/api.ts` (`clockStar.work`). Contract: `docs/CONTRACT_V2.md` §15.
* Client: `src/features/desk/TopStrip.tsx`, `app/desk/[sessionId]/{day-end,room,briefing}.tsx`,
  `src/features/coop/{FinaleTeam,TeamPanel}.tsx`, `src/features/deduction/{DeductionBook.tsx,strings.ts}`,
  `src/i18n/{index,en,tr}.ts`, `app/hq/{index,dossier}.tsx`, `src/sound/{catalog,engine}.ts`, `src/art/index.ts`.
* Assets: `assets/audio/rooms/quiet.wav`, `assets/audio/CREDITS.md`, `scripts/sound/build-rooms.py`,
  `assets/art/icon/icon-288.webp`, `assets/art/manifest.json`, `src/art/registry.ts` (generated).
* Screens: `docs/screens/wave6/` (80 shots, EN/TR, numbered in play order).

## 6 · Still needs a human

1. **Listen** — every sound, and especially `quiet.wav` against the others on a phone speaker and headphones.
2. **A real phone** (see §4).
3. **Dev-only quirk seen again:** after a file save Metro sometimes reloads the page onto `/room`; with `CI=1` Metro
   does not watch files at all (restart it after edits).

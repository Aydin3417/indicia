# Handoff — Agent G · Bütünleştirme ve oynanış testi (wave 3b)

One coherent v2 game: v1 is gone, the cross-agent requests that affect play are resolved, both cases were played to a
verdict in the browser in both languages, and the economy was tuned where the fix was cheap and clearly right.
The fun assessment is in [docs/PLAYTEST_V2.md](../PLAYTEST_V2.md).

## How to run

```powershell
npm install
npm run check                                   # typecheck + boundary + case validation + 55 tests
$env:PORT="8790"; $env:DATA_DIR="C:\temp\indicia-g"; npx tsx server/dev.ts
$env:EXPO_PUBLIC_API_URL="http://localhost:8790"; npx expo start --web --port 8150
npx tsx server/content/playthrough.ts           # both cases × EN/TR over HTTP, no cross-language leaks
npm run simulate:budget [-- --steps]            # time economy
npm run sync:functions                          # after server/shared edits: refresh supabase/functions/_shared
```

Open `http://localhost:8150` at 375×812 with empty storage: the app starts the tutorial in the device language.

## Final command results (25 Nov 2026)

* `npm run check` → `boundary ok`, `kessler-workshop v2 — VALID`, `first-watch v1 — VALID`, `# tests 55 # pass 55 # fail 0`, tsc clean.
* `npm run simulate:budget` → Kessler ideal 815/1440 (57 %), elapsed 960, per day 475 · 340 · 0; exhaustive 2070 (144 %). First Watch ideal 170/300, exhaustive 245.
* `npx tsx server/content/playthrough.ts` → all four runs end in a 3★ confession; no cross-language leaks.
* `npm run sync:functions` run.
* My servers on 8790/8150 are stopped; my entries in `~/.claude/launch.json` removed; 8787/8140 untouched.

## What I fixed / built

**Build green.** B's 7 fixture fixes applied (assertions kept: exact counts now derive from the ideal path, the 65 %
test matches any over-budget figure, i18n test strips Turkish itself). Patch file removed.

**Server / contract** (`shared/api.ts`, `server/**`, CONTRACT_V2.md updated)
* `meta.tutorial` → `CaseSummary.tutorial`; client uses it (`tutorialCase` in `src/state/hq.ts`).
* Stars from the server: `CaseSummary.session.stars`, `CaseSummary.bestStars`, `Profile.stars`, `Profile.history[].stars`; rank by best stars per case (0/2/4/6/9/12), **localised** rank names. Device star cache (`prefs.stars`) removed.
* Composure bug (C saw Jonas Uneasy → Composed after a break): the **engine** applied v1 "relief" stress (Jonas's tiers have negative stress). In v2 a tier's stress only counts when positive and a break costs at least 10 (`reachTier`, `server/engine/v2/actions.ts`). Test: composure never goes back over the whole ideal path.
* Timeline cards: stable hash shuffle (FNV of case + card id), checked server-side to be neither the solution order nor its reverse (the first hash gave the exact reverse in play); confirmed timelines come in the proven order with `setAside`. Client shuffle removed; the book shows the proven order.
* `reason: 'quota'` on the 402 (localised sentence); the desk opens `/premium?source=quota`; interview has a hint string for it.
* `claimId` on every press/present event; `lab.nextReady` (strip countdown uses it); `deductionsTotal` ("3 open · 5 of 10 confirmed").
* Co-op activity fully localised per viewer: place/zone/detail/analysis names stored as `@kind:id` references and resolved at projection (`refText`), room events (opened/joined/left/locked/removed) as keys. Turkish lines use suffix-safe forms ("şuraya gitti: Atölye").
* 404s are JSON (`{ error, code: 'not_found' }`).
* Close-up art keys for every zone of both cases (`kessler/body`, `first-watch/vitrine`, …).

**Client**
* One `act` failure shape for all features: `src/features/act.ts` (`{ view, event } | ApiError | null`); interview, scene, deduction, notebook, finale use it; `makeAct` in `src/state/desk.ts` replaces the two adapters. **Every refusal triggers a view refetch.**
* `app/join/[code].tsx` → `/desk/:id/room`, localised. `app/premium.tsx` fully EN/TR (copy rewritten for v2: own-words questions, "the clock is never for sale").
* Map: "When you are ready · Go to the prosecutor" card after the first confirmed deduction. First-time "The lab is idle" toast with a Lab button.
* Evidence reliability localised; Turkish composure wording unified ("Tedirgin"); singular strings (briefing "One shift of 5 h", "One more star to …").
* Finale copy case-neutral ("Who did it?", "It was {name}.", Truth star "motive and means").
* Desk load error offers "Back to headquarters" (the "open old case file" button went with v1).

**v1 removed**: `app/investigation/**`, `app/dev/**`, `src/features/deduction/devHarness.tsx`, `src/components/{Board,CaseHeader,EvidenceRow,ScenePlan,Timeline}.tsx`, `src/state/{session,boardDiff}.ts`, v1 API client methods, v1 i18n keys; server routes and service methods for view/examine/lab/interrogate/contradictions/hint/board/notes/accuse; v1 engine actions, scoring, turn planner, AI reply renderer; v1 view types in `shared/api.ts` (`PlayerView`, `Board*`, `TranscriptMessage`, …). Tests rewritten on v2: `coop.test.ts` (7), `billing.test.ts` (analytics, AI budget, new quota test), `engine.test.ts` (validator + matcher), `v2api.test.ts` (stars/rank, v1 routes 404, tutorial flag). Kept and still used: room endpoints, billing, analytics, settings, the truth-layer validator.

**Content tuning** (details and reasons in PLAYTEST_V2 §8): Jonas day 1 and Miriam days 2–3 until 13:00; spoiler topics gated (`t-call`, `t-copy` for Jonas; `t-call`, `t-earring` for Clara); Miriam resists the shouting-woman fact; shelf-dust fact points to the rungs; tutorial Clock star at 15 %, neutral intro/objective, length 8–15 min.

## What I verified, with what I saw (browser, 375×812)

* **First launch (TR, empty storage)** → `/onboarding` → tutorial briefing in Turkish → desk. Scene: torch lit the display case, tap → "Kronometre vitrini · Yakın plan · 20 dk", second tap → 02:20, close-up, detail → "YENİ BULGU — Vitrin anahtarla açılıp…". Notebook → log → tapped the underlined line → "DEFTERE YAZILDI" + "ÇIKARIMLARDA YENİ BİR SORU VAR". Ada: wrong present → patience 4→3, "−15 dk"; right present → "KIRILDI", Sakin → Tedirgin. Nils press → "Deftere +1". Deduction filed wrong → "Tutmuyor. −30 dk", fixed → "DOĞRULANDI". Finale: hold-to-charge, 4 rounds (one retry: "Yetmez. Bir daha dene."), "İFADE ALINDI", verdict İtiraf 2/3★, debrief, HQ: rank "Komiser Yardımcısı", 2 YILDIZ (server).
* **Tutorial EN** → Confession 3/3★, "2 h 10 min of the budget left".
* **Kessler EN → TR**: briefing, Map with availability ("Jonas · Now · At the workshop until noon…"), scene, lab sends from the bench (strip "2:00" countdown from `lab.nextReady`), Jonas/Clara/Leo/Miriam interviews, **Clara shut me out** ("Won’t talk again until tomorrow" on People), **day 1 ran out of time** (strip "Day’s done — end it", ledger "Nothing more fits today", report + night desk), lab results **across the night** ("ready to collect" on the day-2 report), sergeant hint, **language switched to Türkçe on day 3 morning** (Map, places, content all Turkish without reload), **timeline puzzle in the UI** (set aside with ✕, filed wrong → "Tutmuyor.", reordered with ↑ → "DOĞRULANDI"), rejected (`d-copy` with Leo) and confirmed deductions, day 3 ended → report "SORUŞTURMA BİTTİ · Savcının karşısına çık" (**forced finale**), 5 rounds with one retry → İtiraf, 2/3★, 10/10 deductions.
* **Kessler second run EN**: lab-idle toast after the first close-up; prosecutor from the strip at 08:50, accused Leo → "THE ACCUSED ANSWERS … CASE COLLAPSES", Wrongful accusation, 0/3★; HQ kept best 2★.
* **Co-op**: "Investigate with friends" → room code; second player (token `dev.second-player-0001`, TR) joined, travelled, inspected, `end-day` → 403 `not_host` "Ortak soruşturmada bunu yalnız baş müfettiş yapar."; host room page (EN) updated by the pulse: "Demir inspected The victim / Demir went to Workshop / Demir joined the investigation"; guest's view in TR: "Demir: inceledi: Maktul". `/join/CODE` → room → desk with the shared clock (08:50).
* **Premium** EN with `source=quota`: v2 copy, test-build box.
* **Dossier**: 5 stars (Kessler best 2 + tutorial best 3), "Detective", "One more star…" (string added after the run).

**Not verified**: native devices (haptics, pinch/touch, keyboard avoidance), animation smoothness (hidden pane; I used a timer-based `requestAnimationFrame` in my tab), the quota → paywall jump end-to-end in the UI (covered by the new unit test and the desk code path), the AI provider path, Supabase.

## The "/room" navigation F saw

Reproduced three times, each time **right after I saved a source file**: Metro pushes the update and the open page lands on
`/desk/:id/room` ("This is a solo investigation"). No app code navigates there for a solo session (checked every
`router.*` call and instrumented `history.pushState` during normal play: never fired). It is a dev-server artefact, not
reachable from controls. If it bothers the UI agent, reload after edits.

## Skipped requests and why

| Request | Why skipped |
|---|---|
| C1 `TopicV2View.chips` (raise topics from person/fact chips) | Topics are few and labelled; chip-driven raising is a design change, not integration. |
| C2 claim ↔ answer line link | Cards grouped by topic work; would matter only for the "claims inline in the answer" redesign (PLAYTEST #9). |
| D2 `kind` per furniture plan rect | The art pass replaces the code-drawn rooms. |
| E1 hidden-deduction hints | `deductionsTotal` added instead (count only, no content). |
| E4 separate `event.reaction` | The finale reads round reactions from the view; works. |
| E5 `chips.times[].factIds` | No play problem seen. |
| F2 where suspects are (`PlaceView.people`) | Interviews never require travel; the availability note ("At the workshop until 13:00") already says where. |
| B4 negated night-event requirements | Ordering of events covers the current content. |
| Haptics gate in `deduction/kit.tsx feel()` | Web-only verification; wire to `prefs.haptics` when testing on device. |

## Known issues left (small)

* Old *open* sessions on an earlier case edition stay in the dossier history as "open" and refuse to load ("earlier edition"); only happens when content changes.
* Co-op: if the guest acts first, the host never sees the briefing (first-arrival rule uses `elapsed === 0`).
* In `awaiting_finale` the prosecutor screen shows the unused minutes of the last day as "time left".
* The debrief can list a lie as "missed" that was refuted only in the finale round (`buildDebrief` looks at interview tiers).
* Dismissal lines repeat verbatim; test-store plan titles ("Annual", "Monthly") are English.

## Image slots for the UI design agent (do not hard-code art in features; key by these ids)

| Slot | Where | Key available |
|---|---|---|
| Scene plate (normal) | `src/features/scene/SceneScreen.tsx:607` renders `<SceneArt plan zones seedKey />` (`SceneArt.tsx`) under the torch overlay (`Torch.tsx`) | `SceneView.art` — `kessler/workshop`, `kessler/office`, `kessler/vault`, `kessler/back`, `first-watch/gallery`; zone shapes are 0..1 of the plate |
| Scene UV / powder pass | `SceneLayers.tsx` (UV traces, powder strokes) | same `scene.art` + a pass suffix |
| Close-up plate | `src/features/scene/CloseUp.tsx:88` `<CloseUpArt artKey size />` (`CloseUpArt.tsx`, `motifOf` keyword fallback) | `ZoneView.closeUp.art` — now set for every zone (e.g. `kessler/body`, `kessler/mallet-peg`, `kessler/violin-case`, `first-watch/vitrine`, `first-watch/key-cabinet`); detail glints use `details[].x/y/r` (0..1 of the plate) |
| Portrait (interview header) | `src/features/interview/SuspectHeader.tsx:68` `<Monogram initials tone size={38} />` | `suspect.id` + last line `emotion` (calm, guarded, irritated, anxious, distressed, hostile, resigned, grieving) and `composure` |
| Portrait (finale) | `src/features/finale/FinaleScreen.tsx:167` `function Portrait` (used at :111, :129 and in round/reaction beats) | `view.finale.accusedId`, round outcome |
| Portrait (people list, map "who can be seen") | `app/desk/[sessionId]/(tabs)/people.tsx:62`, `(tabs)/index.tsx` (`Monogram`) — shared `Monogram` in `src/components/ui.tsx:152` | `suspect.id`, `portraitTone` as fallback tint |
| Case cover | `app/case/[caseId].tsx:62` (`Paper` card), HQ featured card `app/hq/index.tsx`, case list `app/hq/cases.tsx` | `CaseSummary.id` (`kessler-workshop`, `first-watch`) |

`assets/art/**` belongs to agent H; I did not read or wire it.

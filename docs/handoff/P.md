# Handoff — Agent P · Polish and missing art (wave 5)

Client polish (Proof star progress, wording that fits the crime, sound hooks, fairer "who" chips), N's five co-op client
requests, and the missing art for K's four new places (plates, UV layers, nine close-ups, a coat UV variant) plus a
corrected instrument-exam drawing. No commits, no branch changes. I did not touch `server/`, `shared/`, `app/`,
`src/state/`, `src/features/{coop,desk}`, `src/sound`. 8787/8140 untouched; my servers (API 8797 with
`DATA_DIR=C:\temp\indicia-p`, web 8156, headless Chrome profile `C:\temp\indicia-p-chrome`) are stopped.

## Results (25 Nov 2026)

```powershell
npm run art           # 127 images → src/art/registry.ts (was 109)
npx tsc --noEmit      # clean
npm run check         # typecheck · boundary · both cases VALID · 100/100 tests
npm run sync:functions
```

## 1 · Client polish

| What | Where | How |
|---|---|---|
| **Proof star "11 of 13"** | `deduction/DeductionBook.tsx` (under the counts), `finale/FinaleScreen.tsx` (intro, verdict) | Book: "★ Proof star: 7 of 11 deductions (of 13 questions)" / "★ Kanıt yıldızı: 11 çıkarımdan 7 tamam (13 soru var)", amber mono line from `view.proofStar`; once enough are confirmed it says "— enough, if the confrontation holds". Finale intro: "★ Proof star: 11 of 13 questions confirmed and 4 of 5 defences answered at the first try. You have 11 confirmed." Verdict "why" uses `result.proofNeeds`: "Deductions confirmed: 11 (the star needs 11 of 13) · first-time answers: 5 (needs 4)"; old line kept as fallback when the server sends no `proofNeeds`. |
| **Crime-aware copy** | `finale/strings.ts`, `FinaleScreen.tsx` | `crimeOf(view)` = `result.crime ?? case.crime ?? 'murder'`. Truth star, right person but not proven: murder "…the motive or the weapon never landed" / "…saik ya da cinayet aleti ispatlanamadı"; theft "…the motive or how it was taken never landed" / "…saik ya da nasıl alındığı ispatlanamadı". Every other client string in my files was checked for killing words: none left outside murder-only lines ("It was {killer}." is already neutral). |
| **Sounds** (L's hooks, `playSound`) | `scene/SceneScreen.tsx`, `notebook/Notebook.tsx`, `finale/FinaleScreen.tsx` | `torch_on` when a scene opens, `torch_off` when it closes (unmount); tool switch: `uv_on` (UV lamp), `torch_on` (back to torch), `tool` (powder, camera); `page` when a document opens in the notebook (once per document); `star` / `star_dim` with each verdict star, in the same timeout as the haptic. |
| **"Not at this place" banner** | investigated | Not a client bug. The banner shows only when `view.map.current !== locationId`; the Map only routes to a scene after a successful travel or for the place you are at. M's shots opened scene URLs directly while the session stood elsewhere. Verified: every scene shot below was taken after travelling there and shows no banner. |
| **"Who" blanks** | `deduction/chips.ts` `peopleForBlank` | The tray listed people in the server's fixed order (suspects first, same place every time). Now each question gets its own stable shuffle of the living, the victim last. Ordering only; the giveaway is in the prompts (see requests). |

## 2 · N's co-op requests (solo unchanged: none of this renders without the co-op fields)

1. `desk.room.explain` (EN/TR): "Each of you has your own clock; the notebook and the lab are shared. The day closes
   when the lead ends it or when everyone is done, and only the lead faces the prosecutor." / "Herkesin kendi saati
   var; defter ve laboratuvar ortak. Günü baş müfettiş kapatır ya da herkes işini bitirince kendiliğinden kapanır.
   Savcıya yalnız baş müfettiş çıkar." `desk.dayEnd.leadOnly` now points non-leads to "I’m done for today" /
   "Bugünlük bu kadar".
2. **Finale, non-lead:** "Answer" becomes "Suggest an answer" (secondary); the same picker, its button "Suggest it to
   the lead" posts `finale/suggest`; a line "The lead investigator answers; you can put something forward · Your
   suggestion: …". When the lead closes the case, the follower is moved to the verdict.
3. **Notebook private notes:** facts and evidence with `private: true` get a dashed burgundy edge, an "Only in your
   notes" / "Yalnız senin notlarında" stamp and a "Read out to the team" / "Ekibe oku" button (`POST share {itemId}`),
   in the list and in the document reader; private items cannot be picked (the server would refuse them).
4. **Interview held by a teammate:** the dock shows "{name} is questioning them. You are following the record; the
   moves are {name}’s." and only "Leave the room"; leaving as a follower does not call `interview/leave`. New reason
   strings `held` and `private`.
5. **Done for today:** in my screens, the day-over notes for a co-op non-lead say "press ‘I’m done for today’"
   (scene banner, interview). The TopStrip "end the day" button is in `src/features/desk/TopStrip.tsx` (not mine) —
   request below.

## 3 · Art (Google Flow, Nano Banana 2.1, image mode, "0 kredi" on every generation; no video, no upscale)

| Set | Files | Notes |
|---|---|---|
| Plates 2000×1640 | `scenes/kessler/{varga,clara-flat,bank,pawn}.webp` | From code-made colour-block guides (plan + zones). Zone overlay checked: window/sill, letter table, desk, dish, coat, counter/book, loan file all inside their zones. Bank `z-bk-ledger` (y .60–.74) only overlaps the top of the drawn archive table (y ≈ .70–.83) — request below. |
| UV layers | `scenes/kessler/{…}-uv.webp` | M's LUT method (`uvgrade`, from the registered workshop pair), pixel-aligned by construction; no room glows (no UV facts in these rooms). |
| Close-ups 1024² | `closeups/kessler/{z-tray,z-va-window,z-va-letter,z-cl-dish,z-cl-coat,z-cl-desk,z-pw-book,z-bk-file,z-bk-ledger}.webp` | Every new zone. The dish shows the right stud with a gold butterfly back and the left with a clear stopper (matches `f-pearl-back`). |
| Coat UV variant | `closeups/kessler/z-cl-coat-uv.webp` | LUT(close-up) + a dull pale smear on the left cuff (`d-cl-cuff`). |
| Instrument lab | `labs/instrument.webp` (replaced) | Violin face up: f-holes on the top, bridge, four strings, calipers, loupe, inspection mirror. |
| Lookups | `src/art/index.ts` | `ev-lightbook` → the window close-up (was the generic ledger), `ev-lawyerletter` → the letter-tray close-up. |

Manifest entries with EN/TR alt text: `assets/art/manifest.json`. Method notes: `docs/ART_BIBLE.md` §9.

**Rejected / fixed:** letter draft A (black ink blots read as stains); letter tray B and the kept A both had "Dear …"
→ A kept with the word inpainted; dish: a brand-like word on the watch dial inpainted (the dial is now blank);
settlement box A (dark spatter dots); loan file A (weaker, no torch); Clara plate B, Varga plate B, bank plate A
(white paper surround), pawn plate B; coat A (fine, B shows the cuff better); desk B; pledge book B; window B. About
a third of prompts failed with "unusual activity" (not charged) and were resubmitted reworded.

**Downloads:** Chrome saved one single download and one zip, then stopped saving Flow downloads (no prompt approved,
no setting changed). The rest were captured at full resolution from the `=s0` originals (1:1 canvas overlay, two
screenshots stitched) — see ART_BIBLE §9. Flow project "Kas 25 - 22:14" holds every candidate.

## 4 · Verified (375×812 @2x, headless Chrome against my 8156 → 8797; `docs/screens/wave5/`, EN and TR each)

Sessions were built by replaying the ideal path in-process into my DATA_DIR (scratch `drive.mts`, `drive_coop.mts`),
then shot with M's CDP driver. What each shot showed:

* `scene-{varga,clara-flat,bank,pawn}-{en,tr}` — the new plate under the torch, the right place name, spots and
  clock, **no "not at this place" banner** (the sessions had travelled there). `scene-…-uv-…` — the UV tool picked,
  the indigo LUT layer inside the beam (the bank shot shows the open loan file lavender under the lamp).
* `deductions-proof-{en,tr}` — "★ Proof star: 6 of 11 deductions (of 13 questions)" under the counts (day 2, 13:05).
* `deduction-who-{en,tr}` — *Who cleaned the mallet*, "who" blank active: the tray reads Jonas, Ilse Varga, Dr Hanne
  Lind, Miriam, Ruben Okafor, Clara… (no longer Clara-first, victim last).
* `finale-intro-proof-{en,tr}` — "★ Proof star: 11 of 13 questions confirmed and 4 of 5 defences answered at the first
  try. You have 11 confirmed."
* `verdict-kessler-{en,tr}` — confession, three stars; Proof "Deductions confirmed: 11 (the star needs 11 of 13) ·
  first-time answers: 5 (needs 4)".
* `verdict-theft-weak-{en,tr}` — First Watch, right person, every round lost: "Right name, weak case", server detail
  "You named the thief…", Truth star "Right person, but the motive or how it was taken never landed." / "…nasıl
  alındığı ispatlanamadı."
* `coop-notebook-private-{en,tr}` — the finder's notebook: the loan-papers finding with a dashed burgundy edge, "ONLY IN
  YOUR NOTES" and "Read out to the team" / "Ekibe oku".
* `coop-interview-held-{en,tr}` — the member opening Clara while the lead holds her: shared log, the held note, only
  "Leave the room".
* `coop-finale-follower-{en,tr}` — the member in round 1: "Suggest an answer" / "Cevap öner" and "The lead
  investigator answers…"; N's `FinaleTeam` card sits under it (two ways to suggest — N may drop the follower half of
  `FinaleTeam` now that the round offers it).

Not exercised in the browser: the sounds (wired through `playSound`, which L verified; headless Chrome has no gesture
unlock), the read-out tap itself and the follower's move to the verdict.

## Requests

**For N / server owner**
* `scenes.ts`: move `z-bk-ledger` to `{ x: 0.66, y: 0.68, w: 0.22, h: 0.15 }` to sit on the drawn archive table.
* Content: the three side questions make "who" obvious in the prompt itself — "the **woman** going home" (d-courtyard),
  "in **her father’s** name" (d-money). Suggest "the last person out was {who}" and "in Thomas’s name" so Miriam
  and Ilse are plausible; d-clean could name a second candidate trace (Jonas cleans tools with naphtha daily).
* `travel` on a closed case answered HTTP 500 "Something went wrong" in my in-process driver (ServiceError conflict
  `phase` logged); expected a 409 `phase`.
* `TopStrip.tsx` (src/features/desk): for a co-op non-lead, the day-over clock button should say "I’m done for today"
  and post `done {done:true}` instead of opening the lead-only end-day.
* Sound (L's catalog): the four new places fall back to the `workshop` room tone (pendulum clock) — a bank or a
  pawnshop would want a quieter bed; add `LOCATION_ROOM` entries.

**Next art pass:** powder-layer variants; a receipt drawing and a non-readable email (M's list); clock / stamp
props for the pawnshop night fork.

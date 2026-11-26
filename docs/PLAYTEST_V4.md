# INDICIA — Playtest report V4 (Agent O, 26 Nov 2026)

**Setup.** My own API on :8798 (fresh `DATA_DIR=C:\temp\indicia-o`) and Expo web on :8157 pointed at it; a production
export served on :8158 for the performance numbers. A headless Chrome driven over CDP, one isolated browser context per
player (each its own identity), 375×812 @2x, one check at 1440×900. The built-in pane was not used. From the middle of
the run Chrome was muted at the owner's request; sound was checked only through the dev sound log. Where a stretch
repeated something I had already done by hand in the same run, I sent the same requests over the real HTTP API with the
player's own token and say so. Every change since V3 is in this build: K's balance, L's sound, M's and P's art, N's
co-op, P's polish, and my fixes (docs/handoff/O.md).

**Runs.**

| Run | Lang | Result | By hand | Through the API |
|---|---|---|---|---|
| First Watch, first launch | TR | Confession, 3★, 1 h 25 left | everything up to the finale: scene, close-up, notebook collect, Ada wrong + right present, deduction wrong then right, accuse, round 1 | bench/keys, Nils, rounds 2–4 |
| First Watch, first launch | EN | Charged, 2★ (Proof missed: 2/3 first tries) | briefing, map, scene, Ada transcript, book with the nudge, verdict | the rest, two wrong filings, two wrong answers |
| Kessler #1 | TR | **Confession**, 13/13 deductions, Truth+Proof, Clock lost (25 min left, needs 6 h) | every tool in the workshop, UV miss, timeline puzzle wrong → right, day-end, both forks (**the costly options**), waiting, lab results, Varga's flat, Clara's flat (UV), the bank (moved zone), finale round 1 | ideal-path stretches, Clara's flat details, pawnshop, side and core filings, rounds 2–5 |
| Kessler #2 | EN | **Wrong culprit → case collapses** | shut-out screen, decision-waiting row, last-day ledger, forced finale, accusing Jonas, collapse | day 1–2 ideal stretches with Leo shut out and **both forks left to default** |
| Co-op, 3 clients | TR/EN/TR | finale started, rounds lost on purpose | room, names, intents, private note read-out, drafts, done (strip and ledger), lead leaving, follower suggestion, lead answering with it | the second investigator's bank trip, one draft/suggestion, waiting out a day |

Automated: `npm run check` (106/106), `npm run simulate:budget`, `npx tsx server/content/playthrough.ts` — numbers unchanged
from wave 5 (ideal 905/1440, exhaustive 136 %, newcomer first win 09:50 / ~6.6 real min, 3 on day 1).

## 1. The first 15 minutes of a new player

### First Watch, first launch (TR, then EN)

| min | What they see | In their head |
|---|---|---|
| 0:00 | First launch goes straight into the briefing (no onboarding text). Cover art, the victim card, "SAAT NASIL İŞLER", three numbered tasks. **EN said "THE VICTIM" for the museum director in a theft — fixed: "REPORTED BY / İHBAR EDEN".** | Clear. |
| 0:30 | Map: one amber tip, the clock star "06:15 bugün", the gallery card with "Bakılmamış 4 yer · Ara". | One obvious thing to do. |
| 1:00 | **The scene takes 5–8 s to appear the first time in the dev build** (the feature chunk compiles); in the production build the route chunk is < 20 KB and the plate 170 KB — about 1 s here. | Dev-only wait. |
| 1:30 | The torch glow lands on the case; "Kronometre vitrini · Yakın plan 20 dk · İncele". Close-up: the lock and the glint; the glint gives "Camdaki leke". | First find within two minutes. |
| 3:00 | Back on the map the tip changes to "your find is in the Notebook"; Notebook → Deliller → the visitor log ("page" sound) → the underlined line. Two toasts ("Deftere yazıldı", "Çıkarımlarda yeni bir soru var") **cover the tip for ~2 s** (V3 #8, still open). | Works; a little crowded. |
| 5:00 | Ada: "Onun gecesi" → one answer with the claim underlined and the tip under it; tap → "Üstele · bedava · yeni bilgi y…" (**the Turkish subtitle is cut at 375 pt**) / "Kanıt göster · 15 dk". | The cost is in front of the thumb. |
| 6:00 | Wrong present (the briefing fact): "Bunun benimle ilgisi yok", patience 4→3, −15 min. Right present: portrait changes to a forced smile, "Sakin → Tedirgin", two new claims. | The best beat of the tutorial; the portrait change sells it. |
| 8:00 | Deductions: Nils + 01:10 + wrong proof → confirm sheet "Tutmazsa 30 dk kaybedersin" → "Tutmuyor. Bir yerde yanlış var." Fixed blanks → "DOĞRULANDI". | Fair. |
| 10–15 | Bench, keys; prosecutor; "Kim yaptı?"; hold to accuse; four rounds; confession with a crying portrait; three stars. | A complete case in ~15 min (simulator newcomer estimate 9.4 min to the first confirmation). |

### Kessler, day 1 (TR)

| min | What they see | In their head |
|---|---|---|
| 0:00 | Station map with 4 places, star "3. gün 10:00". | |
| 1:00 | Workshop under the torch; UV beam shows the LUT layer; a UV probe on empty floor costs 10 min ("Burada ışıyan bir şey yok"). Tool switch sounds fire (`torch_on`, `uv_on`, `tool`). | Tools read well; the 10-min miss is the honest price of curiosity. |
| ~7 | (API) the ladder close-up, powder, *Not a fall* confirmed at 09:30. | as V3 |
| ~25 | (API) doors, Jonas, Leo, vault, varnish; Clara presses. | |
| end | Deduction book: *Who was inside* opens with 6 cards; I filed the default order with the lie set aside → "Ayırdığın kart doğru; sıra tutmuyor" (a useful nudge), moved two cards with the arrows → **DOĞRULANDI**. | The timeline is the best puzzle in the game: short, physical, and the nudge says exactly which half is wrong. |
| evening | "Gün bitti, kapat" in the strip; the ledger; the report with the alley illustration, `day` → `page` → `lab` → `night` cues; the fork card "Clara'nın arabası" with both options and their costs. | The fork reads like a real decision — but its text gave away what the swabs would find (**fixed**). |

## 2. Every point where the next action was unclear (and what happened)

1. **Toasts over the coach line / over the fork card** — three toasts can stack over the top half of the report right
   after a fork choice. Not fixed (layout of the toast host; low risk, see §7).
2. **Close-up has two "Odaya dön" buttons** (one under the text, one in the dock). Harmless, noisy.
3. **Finale intro repeats itself**: the prosecutor's paragraph is shown again verbatim on the first confrontation card.
4. **Timeline order is not remembered** after leaving the puzzle; you rebuild it each time.
5. **Co-op names**: two players fresh from first launch were both "Investigator" — **fixed** (the room asks for a name).
6. **Co-op day after the lead left** — nobody could end it — **fixed** (it ends by itself when all remaining are done).
7. **Out of time in co-op**: "press done" next to a disabled button — **fixed**.
8. **Scene at minimum zoom** still crops the plate on the right at 375 pt (bank archive table at the very edge). The zone
   is reachable; a "fit room" zoom level would help.
9. **The co-op ledger** says waiting costs "the minutes you wait"; in co-op waiting moves only your calendar, not your
   budget. Wording, not rules.

## 3. Reading load on a small screen

Unchanged from V3 in structure. The new places' close-ups (window, ledger box) are one image + one sentence. The
longest screens are the fork card (≈ 1.5 screens) and the day report with art. The Turkish co-op clock-star line had
been cut ("…ilk 1 sa 12 mi…") — shortened to fit.

## 4. Does the clock create decisions or just anxiety?

* **Day 1** still creates decisions (newcomer: first win 09:50, 3 confirmations).
* **The side places are real side roads**: in my TR run, all four on day 3 cost 335 min plus the 7 am call — the
  Clock star went (25 min left against 6 h needed). A player who wants the star must skip most of them. That is the
  choice K designed, and it reads as one.
* **The forks**: choosing both costly options (night drive, 7 am call) gave me two findings early at 2 h of mornings;
  leaving both to default (EN run) took lab slots and the next morning showed `lab_full` twice (anchor alibi, mallet
  serology) — so the default is a real cost too.
* **New loophole closed**: once a day's time ran out, wrong filings cost 0 and could be repeated without limit. Now a
  question takes two cheap misses per day; the third waits for tomorrow.

## 5. Do wrong moves feel fair?

* Wrong present: 15 min and a patience dot; five in a row shut Leo out for the day with a clear line under the
  transcript and only "Leave the room" left.
* Wrong filing: price shown on a confirm sheet before filing; after two misses a direction, never a value.
* Wrong culprit: "CASE COLLAPSES" with the reason in one paragraph — immediate and unambiguous. (In my EN run the
  player had never seen the Anchor alibi; the collapse paragraph names it anyway, as the defence's evidence.)
* Side questions no longer hand you "who" in the prompt; a wrong `who` costs 30 min like any other miss.

## 6. How long each case takes

| Case | Game time | Real time | Basis |
|---|---|---|---|
| First Watch | 3 h 35 – 3 h 50 of 5 h (my two runs) | 10–15 min | simulator newcomer (first win 9.4 min) and my TR run |
| Kessler day 1 | 8 h | ~27 min (newcomer estimate) | simulator |
| Kessler whole | 3 days | 70–100 min core; **+20–30 min** with all four side places | simulator + my TR run |
| Co-op Kessler (2–3) | 3 days, 290/200 min per investigator per day | shorter per player; splitting works (simulator: confession, 3★), moving together fails | N's simulator, my 3-client run |

## 7. What still holds the game back (ranked)

1. **No device test.** Gestures (torch sweep, drags), haptics, audio on a real phone, memory with 2000×1640 plates —
   all unverified; no Android SDK on this machine. This is the gate for a store build.
2. **Nobody has listened** to the 22 cues and four beds; the owner must, on a phone speaker.
3. **Web weight**: first screen 2.06 MB after my fixes (JS 676 KB gz, fonts 649 KB, art ~700 KB); each room tone is a
   1.5–1.7 MB WAV fetched on first entry. Native bundles them locally (fine); a web release wants compressed beds or a
   smaller bed set.
4. **Toast host** overlaps the coach line and the fork card (V3 #8). Needs a top-safe offset or queueing.
5. **Small UI frictions**: the press subtitle cut in Turkish at 375 pt, two "back to room" buttons, repeated finale
   intro, timeline order not kept, the scene's minimum zoom not showing the whole room.
6. **Content**: the motive card can sit open for a day with nothing to put in it (K's note: a "not yet" hint); the
   tutorial groups the brass-polish fact under "Ada" before she is a suspect.
7. **Store/legal**: in-app credits for the CC BY room tones; RevenueCat/Supabase paths still dev-only (README).
8. **Dev-only**: Metro reloads sometimes land on `/room`; `CI=1` disables file watching.

## 8. Changes in this pass

See `docs/handoff/O.md` (requests closed, 11 bugs fixed with tests or screenshots, performance table).

## 9. Verdict: is it fun?

**Yes — the investigation loop is now genuinely fun to play, solo and with friends; it is not yet a store build.**
The tutorial teaches everything in a quarter of an hour and its break — a portrait that cracks into a forced smile
when the log contradicts her — lands. Kessler has a shape across three days: a fast first win, a timeline puzzle that
is the best five minutes in the game, two night decisions that cost something either way, side trips that are worth
having and visibly cost the Clock star, and two endings that feel earned (a confession you built, a collapse you
caused). Co-op works with three real clients: splitting up, private papers read out to the team, a lead handing over
mid-day. What stands between this and a release is no longer design — it is a phone in a hand (gestures, sound,
memory) and someone listening.

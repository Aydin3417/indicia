# INDICIA v2.1 — Playtest report (Agent J, 25 Nov 2026)

**Setup.** Web build at 375×812 in my own tab of the built-in browser, API on :8791 with a fresh data directory
(`C:\temp\indicia-j`), web on :8151 pointed at it. The pane was visible most of the time this run (`document.hidden`
false), so timers ran, but I still checked every step through the DOM as well as screenshots. I knew the engine and the
content from changing them, so "a new player" below is my best reconstruction: I followed the screen's own
signposts, made the mistakes a newcomer makes (wrong present, wrong filing, opening every spot), and where I repeated
something I had already done by hand in the same run (sweeping to a zone, collecting document lines), I drove it
through the API and say so.

**Runs.**

| Run | Language | Result | Notes |
|---|---|---|---|
| First Watch #1 (first launch, empty storage) | TR | Confession, 3★, 55 min left | all four coach marks seen and retired; a wrong present (−15) and two wrong filings (−60, the second with the nudge); scene/notebook/interview/deduction/finale by hand, bench/keys and the four answers via API |
| First Watch #2 (fresh identity) | EN | Confession, 3★, 115 min left | coach mark dismissed with ✕ (stays gone); rest via API with a wrong present and a free colour press |
| Kessler #1, day 1 | EN | 3 deductions confirmed by 14:30 | ladder close-up + powder by hand (09:20), *Not a fall* filed by hand (09:20), Jonas by hand (free press, two wrong presents via API, the break by hand: *Uneasy → Strained*), the doors and Leo via API, **Wait 30 min** and **End day 1** by hand |
| Kessler #2, last day | TR | Confession, 2★ (Clock lost on purpose), 10/10 | days 1–2 replayed over HTTP, day 3 ended early with the rag at the lab; prosecutor intro → "Önce dosyalayabildiğini dosyala" → filed *Saik* wrong (free, "1 yanlış hakkın kaldı") then right, *Cinayet aleti* right, finale |
| Kessler #3, first interview | TR | — | Clara in Turkish: claims underlined inside her answers, break → *Sakin → Tedirgin*, "Wait until the lab" before the interview |
| Stale session | TR | — | an EN session opened before a content change: "Bu soruşturma dosyanın eski bir baskısıyla açılmış…" with one way back |

Automated: `npm run simulate:budget` and `npx tsx server/content/playthrough.ts` (ideal path and newcomer path, both
cases, both languages, over HTTP, no cross-language leaks).

## 1. The first 15 minutes of a new player

### First Watch (first launch)

| min | What they see | What happens in their head |
|---|---|---|
| 0:00 | Briefing, then the Map. Above everything, one amber line: **"First case · tip — Start at the scene: tap Search, sweep the torch and tap whatever catches your eye."** Under the clock: **"★ Clock star: see the prosecutor by 06:15 today."** No empty lab bench in the tutorial any more. | Hesitation #1 of V2 (three equally loud things) is gone: there is one instruction, and the clock now has a target instead of only a countdown. |
| 1:00 | Scene: "Gallery 2 · **4 spots left**". | The room says how much there is to find. |
| 1:10 | After ~8 s of not finding anything, a soft glow sits on the display case (was 20 s). | The first find comes before the thumb gets bored. The glow is still faint on the code-drawn room. |
| 2:00 | Close-up, lock glint → "New fact: opened with a key". "3 spots left". | |
| 3:00 | Guard's desk; back on the Map the tip has changed: **"Your find is in the Notebook: open Evidence there and tap the underlined line."** | V2's hesitation #3 (the log silently in the notebook) is answered at the moment it happens. |
| 4:00 | Notebook → Evidence → the log → underlined line → "Noted" + "A new question in Deductions". The tip changes again: **"A question opened in Deductions…"** | |
| 5:00 | Ada → Interview. Her answer appears **once**, with *"Altıda çıktım, bütün gece evdeydim."* underlined inside it, and a tip under it: *tap an underlined claim, then Present the note that contradicts it.* The dock says "1 open claim · tap an underlined line" with a **Next ›** button. | The answer + repeated card wall of V2 is gone; the screen holds the whole exchange. |
| 6:00 | Tapping the claim: **Press — "free · nothing new"**, **Present — 15 min**. | The player can see that pressing her here only gives colour. No hidden 15 minutes. |
| 6:30 | Wrong present: "That has nothing to do with me." Patience 4 → 3, −15 min. | Fair; the line is different the next time (five more lines rotate). |
| 7:00 | Right present: the claim is struck through, "BROKEN", banner **"Their story cracked · Composed → Uneasy"**, two new claims underlined in her new answer. The tip retires. | The second "aha", now with the composure change named. |
| 8:00 | Nils: his answer with two underlined sentences; the visitor claim says **"15 min · yields a find"**. Press → "New detail", the bag. | The press that matters announces itself. |
| 9:00 | Deduction filed wrong (Nils as the visitor): "It doesn't hold." Filed wrong again: "It doesn't hold. **More than one blank is off. Start with "who".**" The card in the book keeps the nudge. | A direction, not the answer. |
| 9:30 | Filed right → CONFIRMED. All four tips have retired. | **First confirmation at ~9.4 real minutes** (simulator estimate for the newcomer path; my own run was about the same). |
| 10–15 | Bench, keys, email; prosecutor; four rounds; confession; 3★ with 55 min left (the star needed 45). | A complete case in ~15 minutes, with mistakes. |

### Kessler, day 1 (the playtest's main complaint)

| min | What they see | What happens in their head |
|---|---|---|
| 0:00 | Briefing; Map at the station; **"★ Clock star: see the prosecutor by day 3, 10:00."** | The Clock star is now a deadline you can plan around, not a surprise on the verdict. |
| 1:00 | Workshop (30 min). "7 spots left". | |
| 2:30 | The body (20 min): wound, glasses, hands. "A new question: **Not a fall**" — *Thomas did not fall from the ladder: ___*. The lab-idle toast offers the phone. | The question points at the ladder by itself. |
| 3:30 | The ladder close-up (20 min) now says *"If he climbed it, his hands and soles were on those upper rungs"*, and shows a dashed mark. Tapping it with the torch: **"The torch won't show this. Pick Powder below and tap it again."** | V2's hidden dust zone (found only by sweeping powder over the right patch of a dark room) is now a visible, explained step. |
| 4:30 | Powder → "Look with powder · 10 min" → **New fact: no prints on the upper rungs.** | |
| 5:30 | Deductions → *Not a fall* → the rungs fact → **CONFIRMED at 09:20**: *"…the traffic authority releases its camera data, and the back door's fob log is worth pulling. Who came in last night?"* | **First confirmation at ~6–7 real minutes and 09:20–09:50 game time** (V2: none on day 1). The confirmation offers two things to chase. |
| 6–9 | The bench, the note under the tuning fork (the violin thread), or the back door (the doors thread). | A choice, not an entry fee. |
| ~12 | Back entrance (the place card now says "a fob reader that logs every door"): reader → access log to the lab (now 2 h), courtyard tyre marks. | |
| ~15 | Jonas before 13:00 with the call log: his answer once, the missed-call claim underlined, Press "free · nothing new" (the tell: *"He turns a glass that isn't there"*), two dismissals that differ, the right present → **"Uneasy → Strained"** (in V2 Jonas stayed Uneasy through a break). | |
| later | ANPR (now 3 h) and the access log arrive early afternoon: *The late visitor* and, after Leo's alibi breaks on the tyre marks, *The apprentice's errand*. | Day 1 ends with **3 confirmed** in my run (14:30) and in the newcomer path (15:45, with two wrong filings and a wrong present). A player who follows the violin instead gets *What Thomas found* as the second. |
| evening | "Let time pass" on the ledger (30 min, 1 h, "until the next lab result", "until Leo can be seen"), end of day, report: 3 confirmed, the night's pawn ticket now *confirms* what you proved instead of asking "Leo?". | |

## 2. Every point where the next action was unclear

1. **Workshop sweep** — still the slowest thing to do with a thumb; the room count ("5 spots left") and the earlier glow help, the art will help more.
2. **Tool details** — the dashed "something here" mark on a close-up is easy to miss on the code-drawn plate. The message now names the tool.
3. **Toasts over the coach line** — on the tutorial Map the "Noted" and "New question" toasts briefly cover the tip at the top.
4. **The scene header at 375 pt** truncates the place name and spot count when the time label is long ("2 numaralı sal… / 3 YER KA…" before I shortened the label).
5. **Open claims far up the transcript** — the "Next ›" button selects them, but it does not scroll the transcript to the sentence.

## 3. Reading load on a small screen

* An interview turn is now one block of text with underlined sentences: a topic answer that used to take the answer
  plus two or three claim cards (≈ 1.5 screens) now fits with the dock on one screen (see the Ada and Jonas screens
  in my run). Claims that are not a sentence of the answer (4 of 132 across both languages) come as one short quote under it.
* The coach line is one or two lines and disappears for good.
* Everything else as V2.

## 4. Does the clock create decisions or just anxiety?

**Day 1 now creates decisions.** The first win comes before the first decision, and its confirmation text names
two threads (cameras/doors, or the violin). The lab is faster where day 1 needs it (access log 3 h → 2 h, ANPR
4 h → 3 h). The simulator's sensible first-timer — who opens every workshop spot, files the hands first, shows Jonas
the glasses, and reaches the back door only at 11:00 — ends day 1 with three confirmations at 15:45; without the
mistakes I had three by 14:30.

**Waiting is a choice with a price**, not a hunt for something cheap to burn: in my last-day run the player ends
the day with work left, files the motive and the weapon after the day (free, two tries each), then faces the
prosecutor — the "burn time until 15:00" hour of V2 is gone. Ending a day spends it in full, so the Clock star
honestly records it.

**Presses**: 6 presses pay (15 min, three of them shown "not yet" until you know more), 31 are colour only (free), 23
have nothing behind them and say so. No time-costing press returns nothing (checked by the validator on every claim).

**Budget**: ideal path 845/1440 (59 %, limit 65 %); the newcomer's day 1 uses all 480. The exhaustive player — every
*useful* move once — now needs 1450 min (101 %), not 2070 (144 %): the old figure counted 54 presses at 15 minutes
that returned nothing (810 min), which is exactly the waste the playtest asked to remove. Raising a topic now costs 5
minutes in Kessler (a question is a question), which keeps "doing everything" above the budget. The time is scarce
per day (lab delays, Jonas until 13:00, Miriam mornings only, Leo afternoons), not in total; see §7.2.

## 5. Do wrong moves feel fair?

* **Wrong present** — unchanged cost; dismissals now rotate (Clara, Jonas, Leo, Miriam 6 lines each; Ada 6, Nils 4) and
  never repeat back to back. Resists without their own line use 3 per suspect.
* **Wrong deduction** — the first miss says nothing more; from the second, one direction ("Look again at "proof"; the
  rest holds." / "More than one blank is off. Start with "who"." / "the card you set aside"), never a value. The book
  keeps the nudge on the card. Person blanks are still guessable at 30 min each, but no longer blind.
* **After the last day** — wrong filings cost nothing but each question has two; the screen says how many are left.
* **Debrief** — a lie broken only in the confrontation (e.g. "he fell from the ladder") is no longer listed as missed.

## 6. How long each case takes

| Case | Game time | Real time (estimate) | Basis |
|---|---|---|---|
| First Watch | 2 h 25 – 4 h 05 of 5 h | 10–15 min | first confirmation ~9.4 min (newcomer estimate); my TR run ≈ 15 min |
| Kessler day 1 | all 8 h | ~27 min | newcomer path estimate (REAL_SECONDS × steps + briefing) |
| Kessler whole | 3 days | 70–100 min | as V2; the day-3 dead hour is gone |

## 7. What still holds the game back (ranked)

1. **Art** (PLAYTEST_V2 #4, being produced): the torch room, the faint idle glow, the dashed tool marks and the
   monogram portraits are now the weakest part of an otherwise readable loop. The slots are unchanged (see J.md).
2. **Total scarcity is honest but low** (exhaustive 101 %). To get back to ~140 % without fake presses the case needs
   optional content that only completionists chase (side leads, a second hidden trace per room, a costlier
   courtyard/vault) — or the design accepts that scarcity is per day. A decision for the designer, not a bug.
3. **Day 1's second win depends on following a thread** (doors by early afternoon, or the violin via Leo). A player
   who spends the afternoon on interviews without the access log ends day 1 with one confirmation. The confirmation
   text and the place card point at the doors; a hint costs 45 min.
4. **Claim spans are matched, not authored**: 128 of 132 claim/answer pairs are spans, a few are wider or narrower
   than the claim (e.g. Ada's span includes "I left at six"). Authoring `anchor` for all 60 Kessler claims in both
   languages would make every underline exact.
5. **"Next ›" does not scroll to the claim** in a long transcript; the selected claim's words show in the dock instead.
6. **Notebook density** (81 Kessler facts) — grouping by person exists; a "used in a deduction" mark would help.
7. **A confirmed deduction does not count as uncovering a lie** in the debrief (Leo's charger story shows as "missed"
   after *The apprentice's errand* is proven).
8. **Toasts overlap the coach line** at the top of the tutorial Map for a couple of seconds.
9. **Some server sentences are English-only** outside the desk (room codes, "Case not found"); the desk now localises
   not-found / earlier-edition itself.
10. **Dev-only**: Metro still sometimes lands on `/room` after a file save (G's note); reload.

## 8. Changes in this pass

See `docs/handoff/J.md` (by playtest item, with what I saw).

## 9. Verdict: is it fun?

**Yes, as a whole — for a player who likes to read; not yet for a casual mobile player until the art lands.**
The tutorial now teaches the loop in ten minutes without a wall of rules, and Kessler's first day has a shape: a win
in the first seven minutes, a fork right after it, two or three "aha"s by evening, and a night that pays off what
you proved. Interviews read like a conversation instead of a form, every press tells you before you spend, waiting
is a decision, and the last day ends on the prosecutor instead of an hour of busywork. What is left between this and
"fun on a phone" is mostly visual: the searching is still done in a code-drawn dark room, and portraits will make the
breaks land. The structure no longer gets in the way.

# INDICIA v2 — Playtest report (Agent G, 24–25 Nov 2026)

**Setup.** Web build at 375×812 in my own browser tab, API on :8790 with a fresh data directory, web on :8150.
The browser pane was hidden for most of the session, so animation timing could not be judged; everything below
was checked through the DOM and screenshots. I played as a new player would, without reading the solution first
where I could: I knew the engine from the code, but not the Kessler content beyond the handoffs. Where I drove
repeat steps through the API to save time (scene zones I had already found by hand, repeat presses), I say so.

**Runs.**

| Run | Language | Result | Notes |
|---|---|---|---|
| First Watch #1 (first launch) | TR | Confession, 2★ (Clock missed: 55 min left) | 3 mistakes: re-opened an interview by accident (30), a wrong present (15), a wrong deduction (30) |
| First Watch #2 | EN | Confession, 3★, 2 h 10 min left | after the tuning below |
| Kessler #1 | EN days 1–2 → TR day 3 (switched mid-case) | Confession, 2★ (Truth, Proof; Clock missed), 10/10 deductions | ran out of time on day 1, shut out by Clara on day 1, wrong deduction ×2, wrong timeline once, wrong finale answer once |
| Kessler #2 | EN | Wrongful accusation (Leo), 0★ | went to the prosecutor on day 1 at 08:50 |
| Kessler co-op | EN host + TR guest (second token) | — | join by code and by link, shared clock, localised log, guest refused `not_host` |

## 1. The first 15 minutes of a new player (First Watch, estimated real time)

| min | What they see | What happens in their head |
|---|---|---|
| 0:00 | App opens straight into the briefing of *First Watch* (no onboarding text). Night shift, a chronometer is gone, two people in the building, "the clock works like this" rules. | Clear, short enough. The four rules are read once and half-forgotten. |
| 1:00 | Desk, Map tab: "Gallery 2 · You are here · 4 spots not examined · Search". Ada and Nils "can be seen now". Empty lab bench. | **Hesitation #1:** three equally loud things (search, people, lab). Most will tap *Search*. |
| 1:30 | Dark room, torch, one lit rectangle under the beam (the display case). "Sweep the light. Tap what catches your eye." | The torch is the best moment of the opening — it feels like searching. Tapping once shows the cost, tapping again opens. |
| 2:30 | Close-up of the case, "Tap whatever looks out of place", a faint glint; tapping it gives "The case was opened with a key and locked again — no scratch." Flying chip, notebook count +1. | First small reward. The glint is hard to see on a phone. |
| 3:30 | Sweeping for the guard's desk. Zones are unmarked; at full zoom-out the room is small. | **Hesitation #2:** finding zones by sweeping is slow with a thumb; nothing says how many are left *in this room* while inside it. |
| 4:30 | Guard's desk close-up: "nothing else catches your eye" — but the visitor log went to the notebook. | **Hesitation #3:** the scene says nothing about the log; the player has to think of opening the Notebook → Evidence → log. |
| 5:30 | The log is paper with one underlined line. Tap → "Noted: Ada Lund signed in at 01:10 and out at 01:25." + "A new question in Deductions". | **First "aha"** — reading becomes doing, and the game answers with a question. |
| 6:30 | People → Ada → "Interview · 30 min". The teaching card ("Raise a topic… tap a claim: press it or present proof") is good. Topic → claim card "I was home all night." | The duel framing lands immediately. |
| 7:30 | Present → notebook picker → the log line → **breakthrough**: card cracks, "Their story cracked", composure Composed → Uneasy, two new claims. | **Second "aha"**, the strongest of the tutorial. (A wrong pick first costs patience and 15 min — fair and readable.) |
| 9:00 | Nils: press "Only Ms Lund came, for her glasses" → "her bag was folded flat… left heavy". | Pressing feels useful here. |
| 10:30 | Deductions: "Who opened the case — ___ came between rounds at ___; leaving, her bag was heavy: ___". Tap chips into slots. File. | Satisfying, if easy (only one time chip, and the proof chip itself names Ada). |
| 12:00 | Bench, keys, e-mail (more torch work), then **where is the ending?** | **Hesitation #4:** nothing on the Map said how the case ends; the only door was the gavel icon in the strip. Fixed: a "When you are ready · Go to the prosecutor" card appears on the Map once a deduction is confirmed. |
| 13:00 | Prosecutor → choose → press-and-hold → 4 rounds with suggested chips ("your deductions point here"). | The confrontation is the best-paced part: short beats, clear prompts, the accused reacts. |
| 15:00 | Confession, verdict, stars one by one, debrief. | A real ending. The tutorial lands in ~12–18 real minutes for a careful reader (the case card said 6–8; changed to 8–15). |

## 2. Every point where the next action was unclear

1. **Map first screen** — Search / people / lab all equal. Nothing says "start at the scene".
2. **Scene → notebook** — finds go to the notebook silently; a found *document* should say "read it in the notebook" (the chip flies, but a first-timer does not follow it).
3. **The lab is invisible from where the player is.** In my first Kessler morning I sent nothing to the lab for 2.5 game hours. Fixed: the first time a found item can be analysed while a slot is free, a toast says "The lab is idle — Lab".
4. **Where the case ends** (fixed, see above).
5. **Presses that give nothing.** Kessler interviews often answer a press with flavour and no chip (my first Jonas hour: four presses, one "nothing", zero facts). The cost is real, the reward is invisible; the player cannot tell a useful flavour line from a dead end.
6. **Which item breaks which claim** is sometimes a matter of authored intent rather than logic: "the dust on the top shelves is unbroken" does not prove *Not a fall* (only the dusted rungs or the autopsy do). Fixed with copy: the fact now says "Did he climb at all? Powder on the rungs would say." Similarly the neighbour's shouting woman against Miriam's "home all evening" cost patience; it now *resists* (no patience lost) until the Jaguar is placed in the lane.
7. **Gated topics named the secret.** On day 1 Jonas offered "The copy of the Guadagnini" and "The 22:43 phone call", and Clara offered "The earring back" — the labels gave away the twist, the call and the earring's owner before the player found them. Fixed: those topics now need the copy report / call log / the confirmed *late visitor* deduction.
8. **Spoilers in tutorial copy**: the finale intro named Ada before you choose; the objective said "prove it to *her* face" with one woman among two suspects; "Who killed Hendrik Saar?" for a theft where Hendrik is the director. All fixed (neutral wording, "Who did it?").

## 3. Reading load on a small screen

* The Kessler briefing is ~350 words — acceptable once.
* Interview answers are 40–80 words, then repeated as claim cards: on a 375-pt screen a topic answer plus two claim cards fills the screen and pushes the transcript up. The 3-line clamp helps; the repetition (answer + cards) is the heavier part.
* Documents are short and the underline/plain mechanic works; the access-control log (13 lines, 6 tappable, several "plain") is the densest screen and also the most fun to read.
* The day report lists 6 facts + "and 30 more" — skimmable. The deduction prompts in Turkish avoid suffixes on blanks ("Kim: ___; saat ___") and read a little like forms, but they never break grammar.

## 4. Does the clock create decisions or just anxiety?

**Day 1 (Kessler) is anxiety for a first-timer.** B measured 475/480 minutes for a perfect player. I spent the
morning examining the workshop (6 zones, 10 details, 2 h 30 min) like any player would, talked to Jonas at 11:00
with nothing to show him (the phone result only arrives at 12:30), lost Clara's patience at 14:15 trying plausible
proofs, and ended day 1 with **zero confirmed deductions**, Jonas gone, and the sergeant's hint arriving too late to
use. Nothing was broken, but the day felt like paying an entry fee rather than playing.

**Day 2 is where the clock becomes interesting**: the lab overnight results, the ANPR/access-log reading session,
Miriam's morning window racing the camera data, the Ruben night event. Choosing *what to send to the lab tonight*
is the best recurring decision in the game.

**Day 3** is a sweep: with the core chain open, the remaining deductions fall in an hour; I had to fill time until the
finance warrant came back at 15:00 because deductions cannot be filed after the last day ends (`awaiting_finale`
allows only lab/collect and the finale). The player has no "wait" action and burns minutes on low-value presses.

On B's three flags:
* *Day 1 very tight even for a perfect player* — confirmed. Applied: Jonas stays until **13:00** on day 1 (was noon).
* *Missing Miriam's day-2 morning delays the finance warrant* — confirmed in play (I reached her with no proof at
  10:10, broke her alibi only by fetching the diary while the interview stayed open). Applied: Miriam is available
  **until 13:00** on days 2 and 3 (was noon), so the ANPR result can reach her the same day.
* *The violin examination needs Leo as witness* — confirmed; Leo's UV sighting needs his alibi broken first (access log),
  so *What Thomas found* is a two-step chain through a side character. It works, and it is the one deduction where I
  felt clever. Left as designed.

**Clock star**: 25 % of the budget left means ending a day early. In my full Kessler run (all 10 deductions) I had
50 minutes left; the ideal path has 480. The Clock star is a mastery/replay star, which is fine, but the verdict should
say so. For the tutorial a first-timer with three normal mistakes missed it (55 min of 300 left); the tutorial threshold is now **15 %**.

## 5. Do wrong moves feel fair?

* **Wrong present** (−1 patience, −15 min): fair and readable; the "Tried" tag in the picker helps. Getting shut out after four wrong presents was my own fault and felt like it. The dismissal line repeats verbatim ("And? I don't see what that has to do with me.") — needs more variants.
* **Wrong deduction** (−30 min, never which blank): fair in the tutorial; in Kessler, person blanks accept 8 people, so guessing is expensive but possible. "It doesn't hold" with no direction is right for the design, but after two misses a player wants a nudge.
* **Resist** (right item, missing prerequisite, no patience lost) is the best-feeling mechanic for fairness; it should be used more (applied once more for Miriam).
* **Wrong culprit** — immediate collapse with the accused's own defence ("I stole a bow. I didn't kill anyone.") is a strong, fair ending; it also reveals information the player never earned, which is fine at that point.
* **Wrong timeline order** — fair; the order now never arrives as the solution or its reverse (it did arrive exactly reversed before this pass).

## 6. How long each case takes

| Case | Game time | Real time (estimate for a human reading everything) | Basis |
|---|---|---|---|
| First Watch | 2 h 50 – 4 h of the 5-hour night | 12–18 min | my two runs (≈ 35 actions), reading pace ~200 wpm |
| Kessler | 3 days (all of them for a first-timer) | 75–110 min, 25–35 min per day | ≈ 150 actions in my run; each interview turn and document read is 20–40 s of reading |

The day structure works as session boundaries: each day ends on a report and a night event, which is a natural stop.

## 7. Ten changes that would most improve the fun (ranked)

1. **Rebuild day 1 of Kessler around one guaranteed small win** (e.g. *Not a fall* confirmable from the first ladder close-up + the autopsy-free dust route clearly signposted, or the phone result ready by 10:30). Today a first-timer's day 1 ends with zero confirmations. *(Partly applied: Jonas until 13:00, the shelf-dust fact points at the rungs.)*
2. **Make every press pay or say it won't.** Either give each pressable claim a chip (a small fact) or mark "dead" presses after the first read ("nothing more on this"). Hidden flavour-only presses are the biggest source of wasted minutes and confusion.
3. **A "wait / let the lab work" action** (spend 30–60 min deliberately) and allow filing deductions while waiting for the prosecutor. Day 3's "burn time until 15:00" is the least fun hour.
4. **Real art at the plug-in points** (scene plates, close-ups, portraits by emotion). The torch mechanic is good but the code-drawn rooms make zones hard to read; portraits would make breakthroughs land.
5. **Guide the first scene → notebook → deduction loop** in the tutorial with one-line coach marks (only in *First Watch*): "Your find is in the Notebook — read the log", "Present it against her claim".
6. **More dismissal and resist lines per suspect**, and a visible composure change on every break (composure now only slips; a break costs at least 10 stress — Jonas still needed two breaks to move from Uneasy).
7. **After two wrong filings of the same deduction, offer a free directional nudge** ("the time is right; look again at who") — the 30-minute penalty without any direction becomes guessing.
8. **Show "how many spots are left here" inside the scene** and give the idle glow earlier on the first scene of a case.
9. **Shorter interview answers on small screens**: show the answer once (claims as underlined spans inside it) instead of answer + repeated claim cards.
10. **Make the Clock star legible**: show the 25 % target on the strip ("Clock star: finish with 6 h left") or drop it to 15 % with a separate "speed" badge.

## 8. Tuning applied in this pass (all re-validated; simulator unchanged: ideal 815/1440 = 57 %, exhaustive 144 %)

* Jonas day 1 until 13:00; Miriam days 2–3 until 13:00 (+ the hint, the night-desk note and the people tab copy).
* Topics gated so their labels can't spoil: Jonas *The 22:43 call* (call log), Jonas *The copy* (copy report / brand / workbook), Clara *The calls and the text* (call log, not the phone itself), Clara *The earring back* (after *The late visitor*).
* Miriam resists the shouting-woman fact instead of losing patience.
* Shelf-dust fact points at the rungs.
* Tutorial: Clock star at 15 %, spoiler-free finale intro and objective, "middle of the night" opening, length 8–15 min.
* Finale copy case-neutral ("Who did it?", "It was {name}.", "motive and means").
* Timeline cards never arrive in solution or reverse order; once confirmed they show the proven order.
* Composure only slips; every break costs ≥ 10.
* First-time "lab is idle" toast; "Go to the prosecutor" card on the Map once something is confirmed.
* Close-up art keys for every zone of both cases (the tutorial's display case was drawn as a violin).

## 9. Verdict: is it fun?

**Yes, in parts — and the parts are the right ones.** The interview duel (claim → present → crack) and the
confrontation are genuinely good: they turn reading into moves, and both produced real "aha" moments in both languages.
Document reading with tappable phrases is quietly excellent, and choosing what goes to the lab overnight is a real
decision. The tutorial is a complete, satisfying 15-minute case.

**Not yet as a whole.** Kessler's first day is an entry fee, many minutes go to presses that return nothing, the clock
creates more worry than choice until day 2, and the code-drawn scenes make the one physical activity (searching) slower
than it should be. None of these are architecture problems; they are content and pacing, which the simulator and the
validator now make cheap to change.

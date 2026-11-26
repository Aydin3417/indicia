# INDICIA — Playtest report V5 (Agent U, 26 Nov 2026)

**Setup.** My own API on :8796 (`DATA_DIR=C:\temp\indicia-u`), Expo web on :8156 pointed at it, a production export
served on :8159 for the weight numbers. Headless Chrome with `--mute-audio` (profile `C:\temp\indicia-u-chrome`, CDP
9356) driven by my own holder/driver, one isolated browser context per player, viewport held at 375×812 @2x. Nothing
was audible; sound was checked through the dev sound log and the network panel. 8787/8140 and other tabs were never
touched. Everything I started is stopped. Screens: `docs/screens/wave8/` (71 files, numbered in play order).

**Runs.**

| Run | Lang | Result | By hand | Through the API |
|---|---|---|---|---|
| First Watch, first launch | TR | Confession, **3★** | briefing, map, scene, close-up + both details, Ada (wrong present → right present → break), prosecutor, hold-to-accuse, all four rounds, verdict, sound log | bench/keys/Nils/the deduction (already played by hand in V4) |
| **Ash and Glaze / Kül ve Sır** | **TR** | **Confession, 12/12 deductions, 2★ (Truth + Proof; Clock lost)** | **everything**: locked card → paywall → test Plus → briefing; all six places, 23 close-ups, torch/UV/powder (UV trail, UV handle, UV shed floor, UV coat, dust alarm clip, dust shoe prints), every document line, both lab rounds, both night forks (*knock on his door tonight* / *Holm keeps it for your lab*), Bram's two breaks, Selma's two breaks, Dahl's three breaks, all 12 questions incl. the 7-card timeline (one wrong order, then right), five-round finale, confession, debrief | — |
| Ash and Glaze | EN | **Clock ran out → forced finale → Bram charged → CASE COLLAPSES**, 0★ | locked card → paywall → briefing, studio close-ups, three days ended with work left, last-day ledger, "See the prosecutor", the accusation, collapse, verdict | — |
| Ash and Glaze, 2nd EN session | EN | (setup for a 7-card timeline shot) | the timeline at 375 | ideal path steps 0–71 |
| Kessler | TR + EN | regression | briefing, map, workshop scene, close-up + fly chip, room tone + sfx loading | — |
| Co-op on Ash and Glaze | TR lead + EN guest | room, names, both at the desk, split up | room code, invite link `/join/CODE`, naming, team panel, "Aksoy is here" on the map | — |
| Production first screen | — | **1204 KB** | fresh context, cache off | — |

`npm run check` → typecheck ✓ · boundary ✓ · three cases VALID · **121/121 tests** (118 + 3 new in `server/engine/wave8.test.ts`).
`npx tsx server/content/playthrough.ts` → all three cases × EN/TR: confession, 3★, no cross-language leaks (fennick 780/1260).

## 1. Ash and Glaze, as a player (TR, by hand)

| When | What I saw | In my head |
|---|---|---|
| HQ | The new case sat in the library with no sign it was Plus; its page ended in "Bu dosya Dedektif Plus'a dahil." and **no button** (S's request 5). **Fixed**: a "DEDEKTİF PLUS" tag on the card, a "Dedektif Plus'a bak" button to the paywall. The paywall stamp and three toasts said "Detective Plus" in Turkish — **fixed**. | Before the fix: a dead end. |
| Briefing | Strong opening. Two native-Turkish snags **fixed**: "1 numaradaki *fırının* gece ustası" (in a pottery case *fırın* reads as the kiln → "ekmek fırınının"), "Ekibin ilk notu" (which crew? → "İtfaiye ekibinin"). The synopsis was in English present tense ("yanıp kül oluyor" → "yanıp kül oldu"). | Clear stakes: Monday 16:00 the room is gone. |
| Day 1, studio | Zoom out shows the whole room; racks → *the point of the V* → "Nerede başladı" opens. I filed it wrong on purpose (−30) and got the nudge; then filed **the same wrong answer again** by mistake and paid again — **fixed**: an arrangement the server just refused can't be filed unchanged ("Tam olarak bunu az önce dosyaladın. Önce bir şeyi değiştir."). Heater: plug + **the off switch** — the best clue in the case, physical and fair. UV across the floor shows the trail inside the lamp's window; UV on the inside handle glows; powder on the alarm clip and, with a brush stroke, the shoe prints in the slip. | This room is a joy: every tool earns its keep. |
| Day 1, notebook | Gate log, Ostkai camera, notice — all collectable lines. **Spoiler fixed**: the gate log, the melted cap and the Ostkai camera listed "Kişiler: Oskar Dahl" on day 1, i.e. the unknown man in the coat was named by the UI. Now only the people the item actually shows. | — |
| Day 1 → 2 | "Yangını ne besledi" (oil, trail, cap) confirmed → the shed is cut open. Day report with the boarded-door picture, the night note with its own picture, the doorman fork (I knocked on his door: −1 h tomorrow). Toasts sit above the footer, the fork stays readable. | The fork reads as a real choice. |
| Day 2 | Shed (battery, UV drips), Bram (van → "came to check the kiln" → crate gap → he names Kranz and hands over the card), Selma (kiln pots → heater → she breaks: "Annemin üstüne yemin ederim"). Lab: Kranz card. Office recorder → digital lab. Club: cloakroom 01:08, taxi book "no car after 00:40". | Both innocent suspects lie for human reasons and both break satisfyingly. |
| Day 3 | Dahl (09:00–11:00 only): taxi lie, "not inside for months" vs his own notice, "tenants choose their codes" — to answer the last one I had to **leave the interview, collect Ruth's line, and re-open it for another 30 min** (see §5). Timeline: wrong order once ("O gece böyle geçmedi…"), then right; the warrant opens desk, files and his house. Motive (Norrhavn, clause 14.2, the €40k offer), alarm, walk, blind camera, shoes. **12/12.** | The timeline is again the best puzzle; 7 cards, no times printed, you have to know the night. |
| Finale | Five rounds, all first try; Dahl's confession quotes his own slip (the prize form on the bench). Truth ★, Proof ★, Clock ☆ (1 h 45 left of 5 h 15 needed). | Earned. |

**Clock star:** lost by ~3.5 h. Honest split: 90 min were my driver mis-tapping chips (two wrong filings and one
wrong slot); 60 min the costly fork; the rest from missing Selma on day 1 (she is only there until 14:30) and
interviewing Dahl twice. The simulator's ideal is 62 % of the budget; a careful newcomer will usually not get the
Clock star on a first run, which matches Kessler.

### Content fixes (TR native, EN where it mattered)

* **Wrong clock times in Turkish**: Bram's alibi "Biri yirmi geçeden ikiye kadar" (01:20) and Kranz's "biri yirmi geçe"
  for **00:20** → "Gece yarısını yirmi geçe(den)"; Selma's kiln "biri beş **geçe**" (01:05) for **00:55** → "biri beş
  kala". A Turkish player reading 01:20 would think Bram's alibi starts after the gate opened at 01:36 minus 16 min.
  Regression test scans the whole case.
* The heater fork's default said the lab line is busy "until eleven" while the option header said "sonuç 12:00" →
  "öğlene kadar / until about noon".
* Lab conclusion "Bir seramik atölyesinde bundan yapılmış hiçbir şey yoktur" (and EN "Nothing in a pottery is made of
  it") → "…gaz yağıyla çalışan hiçbir şey yoktur" / "…runs on it".
* Selma's greeting ("carrying out what's left since three") was played on Sunday too → "Yangından beri gözümü
  kırpmadım. Çabuk sorun." Her day-1 availability note now says where she is ("14.30'a kadar avluda; itfaiyeyle birlikte enkazı taşıyor").
* Detail hotspots (T's request): 23 of 28 moved onto their drawn objects, checked on overlays of every close-up incl.
  the UV variants (`docs/screens/wave8/90–92`). Worst before: the gutter's cap and matchbook were swapped, the shed's
  battery mark sat on the ladder, the wifi on a bare wall, the kiln controller on the door.

## 2. Every point where the next action was unclear

1. **Locked Plus case had no way forward** — fixed (tag + paywall button).
2. **A "now" suspect with a stale note**: "Şu an · Öğlene kadar annesinin yanında" (it was 15:30). Notes of windows
   that open late are dropped once the window is open — fixed (`format.ts`).
3. **Re-filing an identical refused answer** cost 30 min again — fixed.
4. **Time chips out of order**: "00:40 … 01:58, 21:15, 23:16" — the night crossing midnight was sorted as text. Now in
   night order when a set holds both evening and small hours (`chips.ts`).
5. **Coming back to the deductions tab** showed yesterday's confirmed result page, not the book — fixed (leaving the
   tab with a confirmed question open returns to the book).
6. **Mid-interview you cannot read the notebook** (only present what's already collected). Open — §5.
7. Powder is a brush stroke, not a tap; a tap with powder on an already-found zone opens that zone (the UV trail
   overlaps the slip by the door). Learnable; the hint line says "Parmağınla bir yüzeye toz sür".
8. TR action label "tozlayarak bak" (lower case next to "UV ışığında bak") — fixed ("Tozlayarak bak", "Fotoğrafla bak").

## 3. Is the new case fun, fair, findable?

* **Fun — yes.** It is a different shape from Kessler: the first day is physical (where, what, how), the second human
  (two people who lied for small, sympathetic reasons), the third institutional (codes, recorder, contract, loan).
  The off switch and the "six little pots" slip are the kind of clues players retell.
* **Fair — yes, with one sharp edge.** Every link has a findable source; nothing needs a guess. The sharp edge is
  availability: Selma until 14:30 on day 1, Dahl only 09:00–11:00 on day 3 and then "Bir daha görüşülemez". It is shown
  on the people list from the start, but a newcomer will miss it once.
* **Findable — yes, after the hotspot pass.** Before it, five details sat off their objects (a player tapping the
  red cap got the matchbook).
* **Spoilers — fixed one, one left.** "Kişiler: Oskar Dahl" on early evidence is gone. The cast list still shows Emil
  Kranz ("buys anything with a famous stamp, cash, late") and Karl Nyberg ("property developer, at the dinner") from
  the start — mild, but Kranz points at Bram's crate before you find the gap. The finale's "Çıkarımların buraya işaret
  ediyor" puts the right confirmed question first in every round, so a full book makes the confrontation a formality.

## 4. Regression: tutorial, Kessler, co-op, sound, fonts, weight

* **Tutorial TR**: everything as V4; the coach line stays above toasts; Ada's portrait change on the break lands.
* **Turkish characters**: İ, ş, ğ, ı, ç, ö, ü, €, ’ and “ ” render in all three families on every screen I shot (subset
  fonts from R).
* **Credits** (TR + EN): complete, readable.
* **Lazy images**: face thumbnails (T) everywhere ≤ 96 px (map, people, deduction chips); full plates appear on entry.
* **Sound**: dev log shows `torch_on`, `uv_on`, `tool`, `fact`, `page`, `lab`, `day`, `night`, `breakthrough`,
  `patience`, `confirmed`, `wrong`, `won`, `verdict`, `verdict_bad`, `star`, rooms `workshop`/`interview`; all 22
  `.m4a` + room tones load with 206, no console errors from the app (the only errors were Metro's dev cache `EMFILE`).
* **Co-op (2 clients, TR lead + EN guest)**: room, invite link, naming, team panel with both clocks (4 h 10 each),
  "Aksoy is here" on the guest's map, the log. **Bug fixed**: in Turkish an unnamed member showed as "Investigator"
  in the room, the team panel and the log; now the server shows the default name in the viewer's language ("Müfettiş")
  and the room's name prompt still appears.
* **Forced finale (EN)**: "1 questions can still be filed" → reworded.
* **Debrief**: "Oskar Dahl: Dahl: …" (double speaker) → fixed (first *or last* name already present).
* **Toasts on scene / interview / finale (Q's open item)**: the scene shows finds as its own fly-chip on the close-up
  (no global toast); the scene header is now a `ToastGuard`, so any other toast lands under the clock and notebook
  count instead of over them. The interview uses its own bottom banner, which briefly covers the newest answer (≈3 s,
  then it is readable); the finale raised no global toasts in either run. Left as is.

**Production web first screen** (fresh export, gzip, fresh profile, cache off, 375×812 @2x, first launch → TR briefing,
until 4 s of silence; same method as R):

| | R (wave 7) | **now** |
|---|---|---|
| JS | 673 KB | 687 KB |
| Fonts | 347 KB | 347 KB |
| Images | 276 KB | **160 KB** (Saar's 64 px circle is now a 10 KB face thumbnail) |
| API + other | 10 KB | 10 KB |
| **Total** | 1306 KB | **1204 KB** |
| First contentful paint | — | 1.45–1.62 s (local) |
| Audio on the first screen | 0 | 0 |

## 5. What still holds the game back (ranked)

1. **No device run, nobody has listened** (unchanged from V4): gestures (torch sweep, powder stroke, timeline drag),
   haptics, audio on a phone speaker, memory with 2000×1640 plates.
2. **No notebook inside an interview.** When a claim is answered by a line you have not collected yet (Dahl's codes ↔
   Ruth's statement), you must leave, collect, and pay 30 min to re-open. A read-and-collect sheet from the interview
   would remove the tax without removing the thinking.
3. **The finale's suggestions** list the right confirmed question first in every round; with a complete book there is
   no decision left. Consider shuffling suggested and other confirmed questions, or showing suggestions only after a miss.
4. **"HAZIR OLDUĞUNDA — Savcıya git"** sits at the top of the map from the first confirmed question on day 1 of a 3-day
   case; it invites a premature charge.
5. **Leftover fork routes in the lab list**: after you chose to knock on the doorman's door, "Kapı görevlisinin ifadesi
   — ona yalnızca gece masası ulaşabilir" stays under "İzin ya da bir ipucu gerekiyor" for the rest of the case.
6. **Cast list spoils a little** (Kranz, Nyberg from the start) — §3.
7. Small: the day report lists "Yeni soru: X" for questions already confirmed that day; "YENİ" badges linger on
   documents you have read; TR log line "Lind şuraya gitti: Fennick Avlusu" is mechanical; a full stop after an
   underlined clause can wrap alone onto its own line.
8. Dev only: after a file save Metro sometimes reloads onto `/room` ("Dosyaya ulaşılamıyor"); Metro's cache hit
   `EMFILE` once.

## 6. Verdict

**Ash and Glaze is the best-built case in the game, and it is fair.** It plays differently from Kessler — a room you
read with three tools on day 1, two sympathetic liars on day 2, paperwork that closes the trap on day 3 — and its key
clues (the V under the racks, the wall switch that was off, the six little pots) are the kind players will retell. It
is not yet friction-free: the Turkish clock phrases put two people at the wrong time, the UI named the arsonist on
day 1, hotspots were off their objects and a locked Plus card was a dead end; all of that is fixed in this pass. What
remains is the interview/notebook tax, a finale that is too generous once the book is full, and — as before — a phone
in a hand and someone listening.

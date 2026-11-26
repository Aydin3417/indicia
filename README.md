# Indicia

A realistic murder-investigation game for iOS and Android (Expo), in English and Turkish. Every case has one
locked truth on the server. The player works an **investigation desk** against a game clock: searches dark
scenes with a torch, UV lamp and powder, collects findings from documents, sends items to a two-slot lab,
duels suspects in interviews (press a claim or present a finding against it), files deductions in a
notebook that confirms or refuses them, and ends the case in a round-by-round confrontation with the
accused. Three stars per case: Truth, Proof, Clock.

* Design and build plan: [docs/PLAN_V2.md](docs/PLAN_V2.md) (Turkish)
* Client/server contract: [docs/CONTRACT_V2.md](docs/CONTRACT_V2.md)
* Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
* Playtest report: [docs/PLAYTEST_V5.md](docs/PLAYTEST_V5.md) (earlier: V2, V3, V4)
* Agent handoffs: [docs/handoff/](docs/handoff/)

## Cases

| Case | Length | What it is |
|---|---|---|
| *First Watch / İlk Nöbet* (`first-watch`, `meta.tutorial`) | 1 night, 5 game hours, ~8–12 real minutes | The tutorial the app opens with: one scene, two people, one deduction, one breakthrough, a four-round confrontation. |
| *The Kessler Workshop / Kessler Atölyesi* (`kessler-workshop`) | 3 days × 8 game hours, ~60–90 real minutes | The full case: 4 suspects, 4 places, 81 findings, 10 deductions incl. a timeline, 5 night events, a five-round finale. |
| *Ash and Glaze / Kül ve Sır* (`fennick-yard`, Detective Plus) | 3 days × 7 game hours, ~50–80 real minutes | An arson: 3 suspects, 6 places, 87 findings, 12 deductions incl. a 7-card timeline, 2 night forks, a five-round finale. |

## Run locally

```powershell
npm install
npx tsx server/dev.ts                 # API on http://localhost:8787 (file store in .data/)
npx expo start --web --port 8140      # web app (375×812 in a mobile viewport is the reference size)
```

Other ports / a fresh profile:

```powershell
$env:PORT = "8790"; $env:DATA_DIR = "C:\temp\indicia-data"; npx tsx server/dev.ts
$env:EXPO_PUBLIC_API_URL = "http://localhost:8790"; npx expo start --web --port 8150
```

On a phone (Expo Go / dev build) set `EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:8787` before `npx expo start`.
Metro serves without hot reload here: after an edit, reload the page (a rebuild can take minutes).

First launch opens the tutorial straight away (no text onboarding). The case library, the dossier (rank,
stars, history), settings (language English / Türkçe / device, haptics, scene glow, privacy) and co-op rooms
("Investigate with friends" → room code / invite link `/join/CODE`) are reachable from HQ.

Optional AI (server-side only): with a key, free-text questions are routed to topics by a small model;
without one, by keywords. Suspects always answer with authored lines.

```powershell
$env:AI_PROVIDER = "gemini"; $env:GEMINI_API_KEY = "..."; $env:AI_MODEL = "gemini-2.5-flash-lite"
```

## Checks

| Command | What it proves |
|---|---|
| `npm run typecheck` | client + server types |
| `npm run check:boundary` | nothing in `app/`, `src/`, `shared/` imports `server/` (truth is never bundled) |
| `npm run validate:cases` | every case is sound, bilingual and solvable; its ideal path replays to a confession within 65 % of the budget |
| `npm run simulate:budget [-- --steps]` | time economy: ideal path vs everything, per day |
| `npm test` | engine (costs, refusals free, clock, lab, patience, claims, deductions, timeline, finale, stars, no truth in any view, composure, card order), full Kessler run over HTTP, locale, co-op rooms, billing, analytics (no typed text), AI budget, quota refusal |
| `npm run check` | typecheck + boundary + validation + tests |
| `npx tsx server/content/playthrough.ts` | both cases × both languages through the HTTP app, no cross-language leaks |

## Status (26 Nov 2026)

v2 is the only game. Both cases have painted art (128 images), sound (22 interface cues, 4 room tones) and deep co-op
(per-player clocks, intents, private notes, drafts, finale suggestions, hand-over). The last full playtest
([docs/PLAYTEST_V4.md](docs/PLAYTEST_V4.md), [docs/handoff/O.md](docs/handoff/O.md)) played First Watch and Kessler
end to end in English and Turkish at 375×812 — confession, wrong-culprit collapse, forced finale, both night forks
both ways, all four side places — and co-op with three separate clients including a guest arriving by invite link from
first launch. Wave 9 ([docs/handoff/V.md](docs/handoff/V.md)) closed PLAYTEST_V5's gameplay list: the notebook opens
inside an interview, the finale's suggestions are a shuffled short list instead of the answer, the prosecutor banner
waits until the file is ready. `npm run check`: 129/129 tests, three cases valid.

Not verified / not built: a native device run (no Android SDK here; gestures, haptics, audio and memory on a phone),
listening to the sound, Supabase Auth in the app, a live Supabase deploy, the real store / RevenueCat path, in-app
credits for the CC BY room tones.

# Audio credits

Nothing in this folder was bought or paid for with credits.

## Interface sounds — `sfx/*.m4a` (masters `master/sfx/*.wav`)

All 22 files are original: rendered by `scripts/sound/render-sfx.ts` (modal synthesis, `scripts/sound/modal.ts`).
No samples, no third-party material. Owned by the project.

## Room tones — `rooms/*.m4a` (masters `master/rooms/*.wav`)

Built by `scripts/sound/build-rooms.py` from the recordings below (cut, filtered, mixed, loop-crossfaded, levelled),
then encoded to AAC by `scripts/sound/encode.py` (wave 7). The in-app credits screen (`app/credits.tsx`, Settings →
Credits) carries the attribution below; keep the two in step (`src/i18n/credits.ts`, `RECORDINGS`).
Licences were read from each file's Wikimedia Commons page metadata on 2026-11-25. No CC BY-SA, no NC material.

| Loop | Source recording | Author | Licence | Used |
|---|---|---|---|---|
| `workshop` | [223959 klankbeeld pendulum-slow-ten-o-clock.wav](https://commons.wikimedia.org/wiki/File:223959_klankbeeld_pendulum-slow-ten-o-clock.wav) | klankbeeld | CC BY 4.0 | 2.0–49.6 s (one 46.64 s cycle of the movement), high-passed 90 Hz |
| `interview` | [Air conditioner hum (Gravity Sound).wav](https://commons.wikimedia.org/wiki/File:Air_conditioner_hum_(Gravity_Sound).wav) | Gravity Sound (gravitysound.studio) | CC BY 4.0 | 0.5–13.5 s, high-passed 140 Hz, looped ×3, mixed 4 dB under the room |
| `interview` | [20121112 TU Delft Library, quiet study room - general ambience - SoundCloud - el mar.ogg](https://commons.wikimedia.org/wiki/File:20121112_TU_Delft_Library,_quiet_study_room_-_general_ambience_-_SoundCloud_-_el_mar.ogg) | el_mar | CC BY 3.0 | 1–38 s, high-passed 80 Hz |
| `gallery` | same TU Delft quiet study room recording | el_mar | CC BY 3.0 | 160–201 s, high-passed 60 Hz |
| `quiet` (wave 6) | same TU Delft quiet study room recording | el_mar | CC BY 3.0 | 201.5–236.5 s (no `ear` events in that stretch), band-passed 80 Hz–4 kHz, 3 LU under the other beds, started on a zero crossing |
| `gallery` | [Two Lane Road in Kelowna at Midnight.flac](https://commons.wikimedia.org/wiki/File:Two_Lane_Road_in_Kelowna_at_Midnight.flac) | Extemporalist | CC0 | 15–56 s (one distant car), band-limited 80–1200 Hz, 8 dB under the hall |

### Attribution text (CC BY requires it; put this in the app's credits / store listing)

> Room tones contain: "pendulum-slow-ten-o-clock" by klankbeeld (CC BY 4.0); "Air conditioner hum" by Gravity Sound
> (CC BY 4.0); "TU Delft Library, quiet study room – general ambience" by el_mar (CC BY 3.0); "Two Lane Road in
> Kelowna at Midnight" by Extemporalist (CC0). All via Wikimedia Commons; modified (cut, filtered, mixed, looped).

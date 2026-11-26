# Dalga 7 — Pürüzler, hafiflik, künye, üçüncü vaka

Kaynak: `docs/PLAYTEST_V4.md` §7 (sıralı açıklar). Dalga 6 sonu: 106 test, iki vaka geçerli, GitHub `Aydin3417/indicia` main.

## Paralel (dosya sahipliği ayrık)

| Ajan | Sahip olduğu dosyalar | Çıktı |
|---|---|---|
| **Q · Arayüz pürüzleri** | `app/desk/**`, `app/hq/**`, `app/case/**`, `app/join/**`, `src/features/**`, `src/components/**`, `src/state/{desk,hq,session,toasts}.ts`, `src/i18n/**` (yalnız yeni anahtar ekleme) | PLAYTEST_V4 §7 madde 4–5: bildirimin ipucu satırını/gece kartını örtmesi, 375pt'de Türkçe üsteleme alt yazısının kesilmesi, iki "odaya dön" düğmesi, tekrarlanan final girişi, zaman çizelgesi sırasının yeniden yüklemede kaybolması, sahnede minimum yakınlaştırma; 320/375/430pt ekran görüntüleri |
| **R · Hafiflik ve künye** | `assets/audio/**`, `src/sound/**`, `scripts/sound/**`, `app/settings.tsx`, yeni `app/credits.tsx`, `app/_layout.tsx` (yalnız önyükleme), `src/art/**` önyükleme | Oda tonlarını sıkıştır (WAV 1,5 MB → hedef ≤250 KB, `ear` ile ölçülmüş, döngü dikişsiz), ilk ekran ≤1,5 MB, tembel yükleme; ayarlarda uygulama içi künye (CC BY ses kayıtları, yazı tipleri, sanat notu); ölçüm raporu |
| **S · Üçüncü vaka** | `server/**`, `shared/**`, `scripts/validate-cases.ts`, `scripts/simulate-budget.ts`, `docs/CONTRACT_V2.md`, `assets/art/manifest.json` (yalnız yeni giriş isteği) | Kessler kalıbında yeni bir v2 vakası (TR+EN, yerli Türkçe), 3 şüpheli, 4–5 mekân, 10+ çıkarım, gece olayları, hırsızlık/cinayet dışı bir suç türü tercih; doğrulayıcı geçerli, simülatör kusursuz ~%60 / her şey ~%130; PLAYTEST_V4 §7 madde 6 içerik ipuçları; testler |

## Sonra
| **T · Sanat 3** | Üçüncü vakanın sahne/portre/yakın plan görselleri (Flow, 0 kredi), registry |
| **U · Kapsamlı test** | Üç vaka, iki dil, co-op, `PLAYTEST_V5.md`, hataların düzeltilmesi |

Kurallar: commit yok (orkestratör commit eder); ortak 8140/8787'ye dokunma; tarayıcı `--mute-audio` ile; kendi dosyaların dışına yazma, gerekirse `docs/handoff/<ajan>.md`'ye istek yaz; bitişte `npm run check` geçmeli.

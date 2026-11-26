# Dalga 4–5 — Denge, ses, ikinci sanat turu, derin co-op, kapsamlı test

Kaynak: `docs/PLAYTEST_V3.md`, `docs/handoff/I.md` (arayüz geçişinin açık listesi), `docs/handoff/J.md`.

## Neden
1. **Zaman baskısı zayıfladı.** Boşa giden üstelemeler kalkınca "her şeyi yap" bütçenin %101'ine düştü (hedef ~%140). Kusursuz yol %59.
   Saat artık nadiren gerçek bir seçim zorluyor. Çözüm dolgu değil: **isteğe bağlı ama değerli** içerik — yan ipuçları, ikinci bir
   yanlış iz, saat yıldızı için kestirmeler, gece olaylarının yönlendirdiği kararlar.
2. **Ses yok.** Kırılma, damga, gün dönümü, fener sessiz. His katmanında ses için bir no-op kanca bekliyor.
3. **Görsel boşluklar.** Gün sonu raporu ve gece olayı yalnız metin; ofis/kasa/arka giriş/galeri için UV katmanı yok; belge ve
   laboratuvar sonuçları simge kutusuna düşüyor; atölyenin UV katmanı kenarlarda kayık.
4. **Co-op sığ.** Ortak saat yüzünden iş bölümü yok; herkes aynı şeyi yapabiliyor.
5. **Yeni tasarımla oynanmamış yollar:** itiraf anı, zaman çizelgesi, laboratuvar sonuçları, İngilizce öğretici, Türkçe Kessler,
   co-op misafiri, gerçek telefon.
6. Bilinen içerik hatası: zayıf karar metni hırsızlıkta "Katili buldun" diyor (`server/engine/i18n.ts` `verdict_detail_weak`).

## Dalga 4 (paralel, dosya sahipliği ayrık)

| Ajan | Sahip olduğu dosyalar | Çıktı |
|---|---|---|
| **K · Denge ve içerik** | `server/**`, `shared/**`, `docs/CONTRACT_V2.md` | Exhaustive ~%140'a dönüş anlamlı isteğe bağlı içerikle; vaka-türüne göre karar metinleri; simülatör/denetleyici güncel; testler |
| **L · Ses** | `assets/audio/**`, `src/sound/**`, `scripts/sound/**`, `src/feel/**`, `src/i18n/**`, `app/settings.tsx` | Modal sentezle UI sesleri + oda tonları; `ear` ile ölçülmüş; ses/müzik ayarı; his katmanına bağlı |
| **M · Sanat 2** | `assets/art/**`, `docs/ART_BIBLE.md`, `scripts/gen-art.mjs`, `src/art/**`, `src/features/scene/**`, gün sonu / gece olayı / belge / laboratuvar sonucu bileşenleri | Eksik UV katmanları, gün/gece/belge/lab illüstrasyonları, atölye UV hizası; ekranlara bağlanması |

Kurallar: commit yok; ortak 8140/8787'ye dokunma, kendi portunu kullan; kendi dosyaların dışına yazma, başkasınınkine ihtiyaç
varsa handoff'a "istek" olarak yaz. Bitişte `npm run check` geçmeli, `docs/handoff/<ajan>.md` yazılmalı.

## Dalga 5 (dalga 4 bitince)

| Ajan | Çıktı |
|---|---|
| **N · Derin co-op** | Oyuncu başına saat bütçesi (iş bölümü gerçek olur), "ben şuraya bakıyorum" niyet işaretleri, ortak çıkarım taslakları, liderin finalde diğerlerinden kanıt önerisi alması; farklı oyuncuya farklı belge mekaniği (en az bir vakada) |
| **O · Kapsamlı test** | Yeni tasarımla oynanmamış tüm yollar, iki dil, iki vaka, co-op; performans (ilk yükleme, bellek, görsel önyükleme); mümkünse Android emülatör/gerçek cihaz; `PLAYTEST_V4.md` |

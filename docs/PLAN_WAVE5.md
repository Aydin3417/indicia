# Dalga 5 — Derin co-op, cila, kapsamlı test

Dalga 4 bitti (86 test): zaman baskısı geri geldi (kusursuz %63, her şey %136), ses ve oda tonları eklendi, UV katmanları,
gün/gece illüstrasyonları, belge ve laboratuvar çizimleri, gece seçimi kartı. Açık kalanlar handoff K, L, M'de.

## Paralel (dosya sahipliği ayrık)

| Ajan | Sahip olduğu dosyalar | Çıktı |
|---|---|---|
| **N · Derin co-op** | `server/**`, `shared/**`, `docs/CONTRACT_V2.md`, co-op istemci dosyaları (`app/desk/**/room*`, `src/state/desk.ts`, co-op'a özel bileşenler), `src/features/coop/**` | Oyuncu başına saat (iş bölümü), niyet işaretleri ("ben bankaya gidiyorum"), ortak çıkarım taslakları ve öneriler, finalde liderin ekibin önerdiği kanıtı görmesi, en az bir vakada oyuncuya özel belge; gün sonu görünümüne gece olayı kimliği (M'nin isteği) |
| **P · Cila ve eksik sanat** | `src/features/{finale,scene,notebook,deduction,interview,night}/**`, `src/i18n/**`, `assets/art/**`, `scripts/gen-art.mjs`, `src/art/**` | Kanıt yıldızı "13'te 11" göstergesi; suça göre final metinleri (hırsızlıkta "silah" yok); fener/alet/UV/belge/yıldız seslerinin bağlanması; K'nin dört yeni mekânı için sahne ve yakın plan görselleri; enstrüman incelemesi çizimindeki hata; yan çıkarımlarda "kim" boşluğunun bariz Clara olması için içerik isteği yerine istemci tarafında seçenek karıştırma yoksa handoff notu |

## Sonra

| Ajan | Çıktı |
|---|---|
| **O · Kapsamlı test** | Oynanmamış bütün yollar iki dilde, iki vaka, co-op (iki gerçek tarayıcı), ses tetikleri, performans (ilk yükleme, bellek), mümkünse Android emülatörü; `PLAYTEST_V4.md`; bulunan hataların düzeltilmesi |

# INDICIA v2 — Oynanış Yeniden Tasarımı ve Yapım Planı

Planı Fable yazar; geliştirmeyi Opus ajanları yapar. Bu dosya ajanların tek kaynak belgesidir.
Mevcut teknik temel (sunucuda kilitli gerçek, katmanlı sorgu motoru, çelişkiler, co-op, ödeme) **korunur**;
değişen şey oyuncunun dakika dakika ne yaptığıdır.

## 1. Teşhis: v1 neden oyun gibi hissettirmiyor

1. **Veritabanı tarayıcısı.** Sekmeler, listeler, belgeler. Her dokunuş anında metin verir; emek, risk, seçim yok.
2. **Kıtlık yok.** Her işaretçiye dokun, her laboratuvar düğmesine bas: en iyi strateji "hepsini yap". Karar yoksa oyun yoktur.
3. **Sorgu belirsiz ve ödülsüz.** Oyuncu ne sorabileceğini bilmiyor; anahtar kelime eşleşmesi tutmazsa cevap saçma.
   En güçlü hamle (kanıt göstermek) bir çanta simgesinin arkasında saklı. Yanlış hamlenin bedeli yok.
4. **Akıl yürütme oyunun dışında.** Çıkarım oyuncunun kafasında oluyor; oyun bunu yalnız en sonda 7 adımlı bir formla soruyor.
   Arada "aha" anını onaylayan hiçbir şey yok. Pano serbest bir çizim alanı, karşılığı yok.
5. **Ritim yok.** Açılış kancası, öğretici, perde yapısı, doruk noktası yok. 60–100 dakika tek parça; mobil oturuma uymuyor.
6. **His yok.** Ses, titreşim, tepki animasyonu, portre, sahne görseli yok. Küçük ekranda metin duvarı.
7. **Yalnız İngilizce.**

## 2. Tasarım sütunları

| # | Sütun | Anlamı |
|---|---|---|
| P1 | Her dokunuş bir karardır | Zaman kıt; her eylem saat harcar. "Hepsini yap" imkânsız. |
| P2 | Sorgu bir düellodur | İfade cümlelerine **üstele** ya da **kanıt göster**. Yanlış hamle sabır kaybettirir. |
| P3 | Çıkarım oynanır | Oyun açık sorular sorar; oyuncu boşlukları bulgularla doldurur; doğru çıkarım anında onaylanır ve yeni kapı açar. |
| P4 | 10 dakikalık perdeler | Vaka günlere bölünür; her gün bir mobil oturum, gün sonu raporu ve kancayla biter. |
| P5 | Doruk: yüzleşme | Final bir form değil; suçlanan kişiyle adım adım kanıt düellosu. |
| P6 | Yapay zekâ süs, iskelet değil | Oyun AI olmadan tam oynanır. AI yalnız "kendi cümlenle sor" ve cevabın üslubu. |
| P7 | Türkçe ve İngilizce, baştan | İçerik iki dilde özgün yazılır (çeviri kokmaz). |

## 3. Çekirdek döngü

```
İpucu (lead) → Eylem (saat harcar) → Bulgu (fact) → Çıkarım (oyuncu taahhüt eder, oyun onaylar) → Yeni ipucu
```

### 3.1 Soruşturma saati (P1, P4)
- Vaka **gün**lere bölünür; her günün **saat bütçesi** vardır. Kessler: 3 gün × 8 saat.
- Maliyetler (dakika): bir yere gitmek 30 · sahnede bir yakın plan 20 · alet kullanımı (UV, toz) +10 · sorgu başlatmak 30 ·
  üstele 15 · kanıt göster 15 · serbest soru 15 · yanlış çıkarım dosyalamak 30 · ipucu istemek 45.
- **Laboratuvar** bedavadır ama sonuç oyun saatiyle gecikir (2–6 saat) ve aynı anda en çok 2 iş alır. Ne göndereceğin karardır.
- Şüpheliler her zaman müsait değildir (ör. Miriam yalnız 2. günden itibaren, avukatıyla; Leo 1. gün öğleden sonra).
- **Gün sonu:** "Günlük rapor" ekranı (bulunanlar, açılan sorular, kalan süre) + senaryolu **gece olayı** (ör. rehinci kaydı geldi,
  Jonas sabah aradı). Doğal oturum sonu ve kanca.
- **Son gün bitince** savcı toplantısı gelir: elindekiyle yüzleşmeye girersin. Erken de gidebilirsin.
- Gerçek zamanlı bekleme, enerji, reklamla süre **yok**. Saat yalnız oyun içidir.
- Denge hedefi: kusursuz yol bütçenin ~%60'ı; her şeyi yapmak ~%140 (imkânsız). Simülatör testi bunu doğrular.

### 3.2 Bulgular (facts) ve aktif okuma
- **Bulgu**: tek cümlelik atomik bilgi ("Clara'nın anahtarı 23:04'te arka kapıyı açtı"). Kessler'de ~45 adet.
- Belgelerde ve ifadelerde önemli ibareler **altı çizili** gelir; dokununca bulgu deftere düşer (titreşim + ses). Okumak eyleme dönüşür.
  Hepsi otomatik toplanmaz: bazıları oyuncunun fark etmesini ister (kolay modda kaçırılanlar gün sonunda işaret edilir).
- Bulgular her yerde aynı "çip"tir: sorguda konu açar, kanıt olarak gösterilir, çıkarım boşluklarına sürüklenir.

### 3.3 Olay yeri (P1)
- İşaretçi listesi kalkar. Sahne **karanlık bir çizimdir**; oyuncu parmağıyla **el feneri** gezdirir, kaydırır, yakınlaşır.
  İlginç bölgeye dokununca **yakın plan kartı** açılır (20 dk); kartın içinde dokunulabilir ayrıntılar bulgu verir.
- **Aletler:** fener (varsayılan), UV lamba (vernik/kan izi), parmak izi tozu (kaydırarak tozla), fotoğraf (laboratuvara gönderilebilir kayıt).
  Bazı izler yalnız doğru aletle görünür.
- Yardım: 20 sn boşta kalınca en yakın incelenmemiş bölgede hafif parıltı (ayarlardan kapatılır).
- v1 görseli kodla çizilir (vektör katmanlar + ışık maskesi). Çizim/portre üretimi ayrı sanat geçişidir (bkz. §8).

### 3.4 Sorgu düellosu (P2)
- Şüphelinin cevabı **iddia kartları**na bölünür. Her iddia için iki hamle:
  - **Üstele** (15 dk): ayrıntı ister. Yeni iddia/bulgu çıkabilir ya da "söyleyeceğim bu".
  - **Kanıt göster** (15 dk): defterden bir bulgu/kanıt seçip iddiaya karşı koy. Yazılmış bir çelişkiyse **kırılma**:
    şüpheli katman atlar (mevcut tier motoru), soğukkanlılık düşer, portre ve ses tepki verir, yeni iddialar gelir.
    Değilse **sabır −1**.
- **Sabır** (oturum başına 3–5): bitince şüpheli o gün için görüşmeyi keser. Bağırmak yok; bedel yanlış hamlededir.
- **Konu aç**: bildiğin kişi/bulgu çiplerinden birini seç → şüpheli o konuda ilk tavrını söyler.
- **Kendi cümlenle sor** (isteğe bağlı, 15 dk): bugünkü serbest metin; AI ya da anahtar kelimeyle konuya yönlenir.
- **Soğukkanlılık** göstergesi 4 kademeli; kırılma anlarında "tell" (bakış kaçırma, cümle yarıda) — dikkatli oyuncuya ipucu.
- İtiraf yalnız tam zincirle ve yalnız finalde/son katmanda (mevcut kural korunur).

### 3.5 Çıkarım defteri (P3) — oyunun kalbi
- Vaka başına 8–10 **soru**. Her biri boşluklu bir cümle:
  "**[kim]**, **[saat]**'te **[kapı]**'dan girdi; bunu **[kanıt]** gösteriyor."
- Sorular ön koşul bulgular toplanınca açılır (yenisi açılınca bildirim).
- Oyuncu boşlukları bulgu/kişi/saat çipleriyle doldurup **dosyalar**. Hepsi doğruysa **onaylanır** (damga, ses, titreşim);
  onay yeni şeyler açar: yeni konu, arama izni (ör. mali inceleme), yeni yer, final zincirinin bir halkası.
  Yanlışsa "tutmuyor" — hangi boşluğun yanlış olduğu söylenmez — ve 30 dk gider.
- **Zaman çizelgesi bulmacası** bir çıkarım türüdür: olay kartlarını sıraya diz; yalan ifade kartı çizelgeye sığmaz.
- Serbest pano kalkar; yerini bu defter alır. (Co-op'ta çıkarım taslakları ortak görünür.)

### 3.6 Final: Suçlama (P5)
- Oyuncu suçlayacağı kişiyi seçer; **yüzleşme** 4–5 raunttur: fırsat → yalan → saik → araç → sahneleme.
  Her rauntta sanık bir savunma cümlesi kurar; oyuncu 2 denemede doğru bulguyu/çıkarımı göstermelidir.
- Onaylanmış çıkarımlar rauntları kolaylaştırır (doğru cevap çipleri öne gelir); eksikse elindekiyle tahmin edersin.
- Yanlış kişiye gidersen yüzleşme çöker: "haksız suçlama" sonu. Ardından gerçek, mevcut debrief ile anlatılır.
- **Puan: 3 yıldız** — Gerçek (kim/neden/nasıl), Kanıt (rauntlar ilk denemede + onaylı çıkarım sayısı), Saat (kalan süre).

## 4. Yapı ve meta
- **Öğretici vaka "İlk Nöbet" (6–8 dk):** 1 sahne, 2 kişi, 1 çıkarım, 1 kanıt gösterme, mini yüzleşme. Uygulama bununla açılır; onboarding metni kalkar.
- **Kariyer:** vaka başına yıldızlar, rütbe yıldız toplamından. Vaka tekrar oynanabilir (daha iyi saat/kanıt için).
- **Günlük soğuk dosya (sonraki faz):** 3–5 dakikalık tek çelişki bulmacası; seri ve geri dönüş sebebi.
- **Co-op (dalga 4):** her oyuncunun kendi saat bütçesi → iş bölümü gerçek olur. Bulgular ortak, çıkarım taslakları ortak, finali lider yürütür,
  diğerleri kanıt önerir. Farklı oyuncuya farklı belge mekaniği burada devreye girer.
- **Ücretlendirme:** ilk vaka + öğretici tümüyle ücretsiz. Plus: yeni vakalar, günlük soğuk dosya arşivi, serbest soru hakkı. Saat/enerji satılmaz.

## 5. His (dalga 2–3)
- Titreşim sözlüğü: bulgu (hafif), kırılma (orta+çift), onay damgası (ağır), sabır kaybı (uyarı).
- Ses: oda tonu (atölye, sorgu odası), kâğıt, damga, fener tıkı. Prosedürel ya da CC0; `ear` ile ölçülmeden teslim edilmez; UI sesi vurmalı/davul gibi olmaz.
- Hareket: iddia kartı kırılınca çatlama, damga inişi, gün geçişi (saat ilerler), fener ışığı.
- Tipografi ve palet v1'deki gibi (grafit, kırık beyaz, bordo, adli yeşil). Küçük ekranda paragraf en çok 3 satır; fazlası "devamı".

## 6. Teknik plan (mevcut kod üzerine)

**Korunan:** `server/engine` (tier motoru, projeksiyon, doğrulayıcı), co-op oturumu, faturalama, analiz, mağaza katmanı, tema.

**Motor eklemeleri (sunucu, tek doğruluk kaynağı):**
- `clock`: gün, kalan dakika, eylem maliyetleri, laboratuvar kuyruğu (teslim saati), şüpheli müsaitliği, gün sonu ve gece olayları.
- `facts`: bulgu tanımları, kaynak (belge ibaresi / yakın plan ayrıntısı / iddia / lab), keşif durumu.
- `claims`: her tier cevabı iddialara bölünür; iddia başına `press` sonucu ve `present` eşleşmeleri (bulgu→kırılma). Sabır.
- `deductions`: boşluklu sorular, ön koşullar, doğru dolgular (eşdeğer kabul edilen alternatiflerle), onay etkileri.
- `finale`: suçlanan kişiye göre raunt dizisi, kabul edilen cevaplar, yıldız hesabı.
- `scenes`: katmanlı sahne tanımı (bölgeler, alet gereksinimi, yakın plan ayrıntıları).
- `i18n`: içerik alanları `{ en, tr }`; istemci dili `Accept-Language` / profil ayarıyla seçilir; sunucu yalnız o dili yollar.
- Doğrulayıcı genişler: her çıkarım çözülebilir mi, final zinciri bütçe içinde erişilebilir mi, kusursuz yol ≤ %65 bütçe,
  her bulgunun en az bir kaynağı var mı, iki dilde eksik alan var mı.
- Sözleşme `shared/api.ts` içinde **eklemeli** büyür; v1 uçları dalga 2 bitene kadar çalışır kalır, dalga 3'te kaldırılır.

**İstemci:** tek "soruşturma masası" kabuğu. Alt çubuk: **Harita** (yerler + saat) · **Defter** (bulgular, kanıtlar) · **Çıkarımlar** · **Kişiler**.
Üstte her zaman: gün, kalan saat, laboratuvar sayacı. Sahne ve sorgu tam ekran modlardır.

## 7. Yapım dalgaları ve dosya sahipliği

Kurallar (tüm ajanlar): depo `Desktop/Proje/Indicia`. Commit **yok**, dal değiştirme yok. Yalnız kendi dosyalarına yaz.
8787 ve 8140 portlarındaki çalışan sunuculara dokunma; kendi denemen için başka port kullan. Teslimde `npm run check` geçmeli.
Bitirince `docs/handoff/<ajan>.md` yaz: ne yapıldı, ne doğrulandı (komut çıktısıyla), ne eksik.

| Dalga | Ajan | Sahip olduğu dosyalar | Çıktı |
|---|---|---|---|
| 1 | **A · Motor ve sözleşme** | `server/**`, `shared/**`, `scripts/**`, `supabase/**` | §6 motor eklemeleri, v2 uçları, `docs/CONTRACT_V2.md`, Kessler'in v2 modele asgari taşınması (EN), testler |
| 2 | **B · İçerik** | `server/cases/**`, `server/content/**` | Kessler tam v2 (TR+EN özgün), "İlk Nöbet" öğretici vakası, denge simülatörü raporu |
| 2 | **C · Sorgu düellosu** | `app/investigation/**/interrogate/**`, `src/features/interview/**` | §3.4 ekranı |
| 2 | **D · Olay yeri** | `app/investigation/**/scene*`, `src/features/scene/**` | §3.3 fener, aletler, yakın plan |
| 2 | **E · Çıkarım ve final** | `src/features/deduction/**`, `src/features/finale/**`, ilgili rotalar | §3.5, §3.6 |
| 2 | **F · Kabuk, saat, i18n, his** | `app/_layout`, `app/hq/**`, `src/components/**`, `src/i18n/**`, `src/feel/**`, masa kabuğu | Harita/saat/gün sonu, TR+EN arayüz, titreşim ve hareket, öğretici akışı |
| 3 | **G · Bütünleştirme ve oynanış testi** | hepsi | v1 ekranlarının kaldırılması, 375×812'de baştan sona iki dilde oynama, hata düzeltme, oynanış raporu |
| 4 | Co-op v2, ses, günlük soğuk dosya | — | dalga 3 raporundan sonra planlanır |

Dalga 2 ajanları yalnız `docs/CONTRACT_V2.md`'deki sözleşmeye yaslanır; ihtiyaç duydukları ama sözleşmede olmayan alanı
kendi handoff dosyalarına "sözleşme isteği" olarak yazar, `shared/`'a dokunmaz.

## 8. Açık kararlar ve riskler
- **Görsel üretim en büyük eksik.** Portre ve sahne çizimi kodla sınırlı kalır. Öneri: mürekkep/çizgi roman üslubunda portre (şüpheli başına
  4 duygu) ve sahne plakaları ayrı bir sanat geçişinde üretilsin (kullanıcının görsel üretim hesabı gerekir). Fotogerçekçi jenerik AI yüzü kullanılmaz.
- Saat ekonomisi dengesi ancak oynayarak oturur; dalga 3'te en az üç farklı oyuncu profiliyle simülasyon + elle oynama.
- Kapsam: v2 tek vaka + öğretici ile "eğlenceli mi" sorusunu cevaplar. İkinci vaka (Türkiye'de geçen) ancak bu soru "evet" olunca yazılır.
- Ad "Indicia" hâlâ çalışma adı.

## 9. Sanat ve arayüz dalgası (kullanıcı isteği, 24 Kas 2026)

Kullanıcı geri bildirimi: arayüz ve tasarım yeterince iyi değil; "tasarımsal hamleler" ve oynanabilir kalitede görseller isteniyor.
Görsel üretim için Google Flow'daki Nano Banana (Gemini görsel modeli, görselde 0 kredi) ve eldeki MCP'ler kullanılabilir. Ücretli kredi harcanmaz.

| Dalga | Ajan | Sahip olduğu dosyalar | Çıktı |
|---|---|---|---|
| 3a | **H · Sanat yönetimi ve üretim** | `assets/art/**`, `docs/ART_BIBLE.md`, `docs/handoff/H.md` | Görsel kimlik, portreler (kişi × 4 duygu), sahne plakaları (normal + UV), yakın planlar, kapak görseli, uygulama ikonu, `assets/art/manifest.json` |
| 3b | **G · Bütünleştirme** | kod | v1'in kaldırılması, test düzeltmeleri, baştan sona oynama |
| 3c | **I · Arayüz tasarımı** | `src/**`, `app/**` (G bittikten sonra) | H'nin görsellerini ekranlara yerleştirme; her ekran için tasarım geçişi (kompozisyon, tipografi, hareket, boş durumlar) |

Üslup kararı: fotogerçekçi değil. Mürekkep ve sulu boya karışımı, çizgi roman / polisiye afiş duygusu; sınırlı palet (grafit, kırık beyaz, bordo, adli yeşil);
yüzler karakterli ve çizim olduğu belli (jenerik "AI yüzü" görünümü kabul edilmez). Aynı kişinin dört duygusu tutarlı olmalı.

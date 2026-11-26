// SERVER-ONLY. Tutorial case — "First Watch" / "İlk Nöbet". 6–8 minutes, one scene, two people,
// one deduction, one presentation, a four-round confrontation. Teaches, in this order:
//   1. torch search (open close-ups)  2. tap an underlined phrase to collect a fact  3. press a claim
//   4. present a fact against a claim  5. file a deduction  6. the confrontation.
// A theft, not a death: nobody is hurt. All people and places are fictional.
import type { CaseDefinition } from '../engine/types.ts';
import { L } from './text.ts';

export const FIRST_WATCH_ID = 'first-watch';

export const firstWatch: CaseDefinition = {
  id: FIRST_WATCH_ID,
  version: 1,
  meta: {
    title: L('First Watch', 'İlk Nöbet'),
    caseNumber: 'HCID 03-0211',
    category: L('Tutorial · theft', 'Eğitim · hırsızlık'),
    difficulty: 'beginner',
    durationMinutes: [8, 15],
    tagline: L('Your first night shift. A clock that has kept time since 1851 is gone.', 'İlk gece nöbetin. 1851’den beri zamanı tutan bir saat ortadan kayboldu.'),
    synopsis: L(
      'At 01:40 the night guard of the Hallstedt Maritime Museum finds a display case empty. Two people were in the building. The day shift arrives at seven.',
      'Saat 01:40’ta Hallstedt Denizcilik Müzesi’nin gece bekçisi bir vitrini boş buluyor. Binada iki kişi vardı. Gündüz vardiyası yedide geliyor.',
    ),
    tier: 'free',
    contentStatus: 'final',
    tutorial: true,
    // verdict and debrief wording: a thief, not a killer
    crime: 'theft',
    setting: L('Hallstedt Maritime Museum, Ostkai. Gallery 2.', 'Hallstedt Denizcilik Müzesi, Ostkai. 2 numaralı salon.'),
  },

  briefing: {
    issuedBy: L('Hallstedt Station — night desk', 'Hallstedt Emniyeti — gece masası'),
    date: L('Tuesday 11 February, 02:00', '11 Şubat Salı, 02:00'),
    location: L('Hallstedt Maritime Museum, Ostkai 4', 'Hallstedt Denizcilik Müzesi, Ostkai 4'),
    victim: {
      personId: 'p-saar',
      summary: L(
        'The Hallstedt Chronometer: a brass ship’s clock from 1851, insured at €45,000. The director, Hendrik Saar, reported it missing at 01:52.',
        'Hallstedt Kronometresi: 1851 yapımı, pirinç bir gemi saati; sigorta bedeli 45.000 €. Müdür Hendrik Saar kaybolduğunu 01:52’de bildirdi.',
      ),
    },
    incidentReport: [
      L(
        'Night guard Nils Brekke found the chronometer’s case in Gallery 2 closed but empty on his 01:40 round. On his 00:30 round it had been there.',
        'Gece bekçisi Nils Brekke 01:40 turunda 2 numaralı salondaki kronometre vitrinini kapalı ama boş buldu. 00:30 turunda saat yerindeydi.',
      ),
      L(
        'No alarm sounded. The building has one public door, watched from the guard’s desk.',
        'Alarm çalmadı. Binanın tek bir giriş kapısı var; bekçi masasından görülüyor.',
      ),
    ],
    preliminaryFindings: [
      L('The day shift arrives at 07:00. By then the chronometer could be anywhere.', 'Gündüz vardiyası 07:00’de geliyor. O saate kadar kronometre her yerde olabilir.'),
    ],
    knownWitnesses: [],
    objectives: [
      L('Search Gallery 2 with your torch.', '2 numaralı salonu fenerinle ara.'),
      L('Find out who opened the case.', 'Vitrini kimin açtığını bul.'),
      L('Prove it to the thief’s face before the day shift arrives.', 'Gündüz vardiyası gelmeden bunu hırsızın yüzüne karşı kanıtla.'),
    ],
    startingEvidence: [],
    startingStatements: ['s-ada-home'],
    startingFacts: ['f-rounds'],
  },

  truth: {
    killerId: 'ada',
    motiveId: 'm-sell',
    methodId: 'x-key',
    weaponEvidenceId: 'ev-keyregister',
    timeOfDeath: { from: '00:30', to: '01:40', actual: '01:15' },
    events: [
      { time: '9 Feb', description: 'A private collector emails Ada Lund offering €40,000 for the chronometer, "no questions asked".', actors: ['ada'] },
      { time: '10 Feb', description: 'Ada signs out case key #2 "for cleaning".', actors: ['ada'] },
      { time: '00:30', description: 'Nils Brekke’s round: the chronometer is in its case.', actors: ['nils'] },
      { time: '01:10', description: 'Ada rings the bell, tells Nils she forgot her glasses, and is signed in. Her canvas bag is folded flat under her arm.', actors: ['ada', 'nils'] },
      { time: '01:15', description: 'Ada opens the case with key #2, puts the chronometer in her bag and locks the case again. Her reading glasses stay on her bench.', actors: ['ada'] },
      { time: '01:25', description: 'Ada leaves with the bag heavy on her shoulder.', actors: ['ada'] },
      { time: '01:40', description: 'Nils finds the case empty.', actors: ['nils'] },
    ],
    narrative: [
      L(
        'Ada Lund had looked after the chronometer for six years. On 9 February a collector wrote to her: forty thousand euros, no questions asked. The next day she signed out the key to its case “for cleaning”.',
        'Ada Lund altı yıldır kronometrenin bakımını yapıyordu. 9 Şubat’ta bir koleksiyoncu ona yazdı: kırk bin avro, soru sorulmadan. Ertesi gün vitrinin anahtarını “temizlik için” teslim aldı.',
      ),
      L(
        'At ten past one she rang the bell and told Nils she had forgotten her glasses. Five minutes later the chronometer was in her bag and the case was locked again. Her glasses never left her bench.',
        'Biri on geçe zili çaldı ve Nils’e gözlüğünü unuttuğunu söyledi. Beş dakika sonra kronometre çantasındaydı, vitrin yeniden kilitlenmişti. Gözlüğü tezgâhından hiç kalkmadı.',
      ),
      L(
        'Nils wrote her in and out himself. That honest line in his log is what caught her.',
        'Nils onun giriş çıkışını kendi eliyle yazdı. Onu yakalatan, defterdeki o dürüst satır oldu.',
      ),
    ],
  },

  people: [
    {
      id: 'p-saar', name: 'Hendrik Saar', role: L('Museum director (reported the theft)', 'Müze müdürü (hırsızlığı bildiren)'),
      description: L('Sixty, in a coat thrown over his pyjamas. Has already called the insurer twice.', 'Altmış yaşında, pijamasının üstüne bir palto geçirmiş. Sigortacıyı şimdiden iki kez aradı.'),
    },
  ],

  suspects: [
    {
      id: 'ada',
      name: 'Ada Lund',
      age: 38,
      occupation: L('Conservator, Hallstedt Maritime Museum', 'Restoratör, Hallstedt Denizcilik Müzesi'),
      relationship: L('Looks after the chronometer; holds key #2', 'Kronometrenin bakımını yapıyor; 2 numaralı anahtar onda'),
      initials: 'AL',
      portraitTone: '#4a3a4f',
      background: 'Six years at the museum. Careful hands, short temper with bureaucracy. Behind on the rent since the museum cut her hours.',
      personality: 'Brisk and confident until a detail she did not plan for appears; then she over-explains.',
      speakingStyle: 'Quick, practical sentences; technical words about brass and lacquer; a little condescending to police.',
      vulnerabilities: 'Being seen as a thief by colleagues she respects.',
      publicProfile: L('Museum conservator for six years. Responsible for the chronometer’s care.', 'Altı yıldır müzenin restoratörü. Kronometrenin bakımından o sorumlu.'),
      claimedAlibi: L('Left at 18:00, home all night.', '18:00’de çıkmış, bütün gece evdeymiş.'),
      actualWhereabouts: 'Home until 00:50; at the museum 01:10–01:25; took the chronometer.',
      motive: 'A collector offered €40,000, no questions asked.',
      secrets: ['Took the chronometer at 01:15 with key #2', 'Has an email offer from a private collector'],
      knows: ['Where the chronometer is (her car)'],
      doesNotKnow: ['That Nils wrote her into the log', 'That her glasses were seen on her bench'],
      baseline: { trust: 50, stress: 30 },
      shutdownStress: 85,
      opening: L('It’s the middle of the night, Detective. Let’s be quick.', 'Gecenin bu saatinde, Komiser… Çabuk olalım.'),
      deflections: [L('I don’t follow.', 'Anlayamadım.'), L('Ask me something about the museum.', 'Bana müzeyle ilgili bir şey sorun.')],
      dismissals: [
        L('That has nothing to do with me.', 'Bunun benimle ilgisi yok.'),
        L('You’re guessing.', 'Tahmin yürütüyorsunuz.'),
        L('(She folds her arms.) And what is that supposed to prove?', '(Kollarını kavuşturur.) Bu neyi kanıtlıyor şimdi?'),
        L('I restore brass for a living, Detective. I know a loose screw when I see one.', 'Ben pirinç restore ederek geçiniyorum, Komiser. Gevşek vidayı görünce tanırım.'),
        L('Is that really the best you have at three in the morning?', 'Sabahın üçünde elinizdeki en iyi şey bu mu?'),
        L('Wrong drawer. Try another.', 'Yanlış çekmece. Başkasını deneyin.'),
      ],
      resists: [
        L('(Her eyes stay on it a second too long.) That’s not enough, and you know it.', '(Gözü bir saniye fazla takılı kalır.) Bu yetmez, siz de biliyorsunuz.'),
        L('Close. Not close enough.', 'Yaklaştınız. Ama yeterince değil.'),
      ],
      pushback: [L('Don’t raise your voice at me.', 'Bana sesinizi yükseltmeyin.')],
      shutdownLines: [L('I’m done for tonight.', 'Bu gecelik bu kadar.')],
      guarded: [],
      topics: [
        {
          id: 't-night', label: L('Her night', 'Onun gecesi'),
          keywords: [['where', 'night', 'home', 'came', 'back', 'glasses', 'nerede', 'gece', 'evde', 'geldi', 'gözlük']],
          description: 'Where Ada was during the night and why she came back.',
          tiers: [
            {
              stance: 'lie', emotion: 'guarded', statements: ['s-ada-home'],
              line: L('I left at six and I was home all night. I only heard about this when Hendrik called.', 'Altıda çıktım, bütün gece evdeydim. Hendrik arayınca öğrendim.'),
              facts: ['Claims she left at 18:00 and stayed home'],
              claims: [{
                id: 'c-ada-home', text: L('I was home all night.', 'Bütün gece evdeydim.'),
                press: { line: L('Home. Tea, a report, bed. (She glances at the guard’s desk, then away.)', 'Evdeydim. Çay, bir rapor, yatak. (Gözü bekçi masasına kayar, sonra kaçar.)') },
                breaks: [{ by: ['f-lund-0110', 'ev-logbook'] }],
              }],
            },
            {
              stance: 'lie', emotion: 'anxious', requires: { presentedAny: ['ev-logbook'] }, statements: ['s-ada-glasses'], stress: 20,
              line: L(
                '(A short laugh.) Fine. I popped in for my glasses — I needed them for a report. Ten minutes. I never went near Gallery 2.',
                '(Kısa bir gülüş.) Peki. Gözlüğüm için uğradım — bir rapor için lazımdı. On dakika. 2 numaralı salonun yanına bile gitmedim.',
              ),
              facts: ['Now says she came back at about 01:10 for her glasses', 'Says she never went near Gallery 2'],
              claims: [
                { id: 'c-ada-glasses', text: L('I only came back for my glasses.', 'Sadece gözlüğüm için geri geldim.'), anchor: L('I popped in for my glasses — I needed them for a report.', 'Gözlüğüm için uğradım — bir rapor için lazımdı.'), press: { line: L('Reading glasses. Tortoiseshell. I can’t read a word without them.', 'Okuma gözlüğü. Bağa çerçeve. Onlarsız tek kelime okuyamam.') } },
                { id: 'c-ada-gallery', text: L('I never went near Gallery 2.', '2 numaralı salonun yanına gitmedim.') },
              ],
            },
          ],
        },
        {
          id: 't-key', label: L('The case key', 'Vitrin anahtarı'),
          keywords: [['key', 'case', 'lock', 'open', 'anahtar', 'vitrin', 'kilit', 'açtı']],
          description: 'Who has keys to the chronometer case.',
          tiers: [
            {
              stance: 'lie', emotion: 'guarded', statements: ['s-ada-nokey'],
              line: L('Nils has the keys. All of them. Ask him.', 'Anahtarlar Nils’te. Hepsi. Ona sorun.'),
              facts: ['Says Nils holds all the keys'],
              claims: [{
                id: 'c-ada-nokey', text: L('Only the guard has keys to the cases.', 'Vitrinlerin anahtarı sadece bekçide.'), anchor: L('Nils has the keys. All of them.', 'Anahtarlar Nils’te. Hepsi.'),
                press: { line: L('That’s his job, isn’t it? Keys and rounds. (She doesn’t look at the key cabinet.)', 'Onun işi bu, değil mi? Anahtar ve tur. (Anahtar dolabına bakmıyor.)') },
                // optional (wave 4): one more lie to catch before the confrontation
                breaks: [{ by: ['f-key-register', 'ev-keyregister'] }],
              }],
            },
            {
              stance: 'partial', emotion: 'irritated', stress: 10,
              line: L(
                '(She clicks her tongue.) Key two. Yes, I signed it out — for cleaning. I clean that case every month, Detective. That’s not a crime.',
                '(Dilini şaklatır.) İki numara. Evet, ben aldım — temizlik için. O vitrini her ay temizlerim, Komiser. Bu suç değil.',
              ),
              facts: ['Admits she signed out key 2, says it was for cleaning'],
              claims: [{
                id: 'c-ada-cleaning', text: L('I had key 2 for cleaning, that’s all.', 'İki numaralı anahtar bende temizlik için, o kadar.'),
                anchor: L('Yes, I signed it out — for cleaning.', 'Evet, ben aldım — temizlik için.'),
                press: { line: L('Brass needs looking after. Not that anyone here notices.', 'Pirincin bakıma ihtiyacı var. Burada fark eden olmasa da.') },
              }],
            },
          ],
        },
      ],
      v2: { patience: 4 },
    },
    {
      id: 'nils',
      name: 'Nils Brekke',
      age: 61,
      occupation: L('Night guard, Hallstedt Maritime Museum', 'Gece bekçisi, Hallstedt Denizcilik Müzesi'),
      relationship: L('On duty all night; found the empty case', 'Bütün gece görevdeydi; boş vitrini o buldu'),
      initials: 'NB',
      portraitTone: '#3c4652',
      background: 'Twenty years of night shifts. Writes everything down; trusts his log more than his memory.',
      personality: 'Slow, honest, embarrassed that it happened on his watch.',
      speakingStyle: 'Plain, a little formal, refers to his log.',
      vulnerabilities: 'Afraid he will be blamed for dozing.',
      publicProfile: L('Night guard for twenty years. Found the empty case at 01:40.', 'Yirmi yıldır gece bekçisi. Boş vitrini 01:40’ta buldu.'),
      claimedAlibi: L('At his desk all night except his rounds.', 'Turları dışında bütün gece masasındaymış.'),
      actualWhereabouts: 'At his desk; rounds at 00:30 and 01:40.',
      motive: 'None.',
      secrets: [],
      knows: ['Ada came in at 01:10 and left at 01:25 with a heavy bag'],
      doesNotKnow: ['What was in the bag'],
      baseline: { trust: 60, stress: 35 },
      shutdownStress: 90,
      opening: L('Twenty years and nothing ever went missing. Not on my watch. Ask me anything.', 'Yirmi yıldır hiçbir şey kaybolmadı. Benim nöbetimde değil. Ne isterseniz sorun.'),
      deflections: [L('I’m not sure, Detective.', 'Emin değilim, Komiser.'), L('It’s all in my log.', 'Hepsi defterimde yazıyor.')],
      dismissals: [
        L('I don’t know about that.', 'Onu bilmem.'),
        L('(He checks his log, then shakes his head.) Nothing here about that, Detective.', '(Defterine bakar, başını sallar.) Burada onunla ilgili bir şey yok, Komiser.'),
        L('I only know what I wrote down.', 'Ben yalnızca yazdığımı bilirim.'),
        L('Sorry. That one means nothing to me.', 'Kusura bakmayın. Bu bana bir şey ifade etmiyor.'),
      ],
      pushback: [L('I did my rounds. Both of them.', 'Turlarımı attım. İkisini de.')],
      shutdownLines: [L('I need a coffee.', 'Bir kahve lazım bana.')],
      guarded: [],
      topics: [
        {
          id: 't-night', label: L('His night', 'Onun gecesi'),
          keywords: [['night', 'round', 'visitor', 'came', 'anyone', 'who', 'gece', 'tur', 'ziyaretçi', 'geldi', 'kimse']],
          description: 'Nils’s rounds and who came in.',
          tiers: [{
            stance: 'truth', emotion: 'calm', statements: ['s-nils-visitor'],
            line: L(
              'Rounds at half past twelve and twenty to two. In between, only Ms Lund came in — she’d forgotten her glasses. I signed her in myself.',
              'Turlarım yarımda ve ikiye yirmi kala. Arada sadece Lund Hanım geldi — gözlüğünü unutmuş. Girişini kendim yazdım.',
            ),
            facts: ['Rounds at 00:30 and 01:40', 'Only Ada Lund came in between, for her glasses'],
            claims: [
              {
                id: 'c-nils-visitor', text: L('Only Ms Lund came in, for her glasses.', 'Sadece Lund Hanım geldi, gözlüğü için.'),
                press: {
                  line: L(
                    'She came in with that big canvas bag folded flat under her arm. When she left at twenty-five past, it was on her shoulder — and heavy. I remember thinking: a lot of glasses.',
                    'Geldiğinde o büyük bez çantası katlanmış, koltuğunun altındaydı. Biri yirmi beş geçe çıkarken omzundaydı — hem de ağır. “Amma çok gözlük” diye düşündüm.',
                  ),
                  facts: ['f-bag-heavy'],
                },
              },
              { id: 'c-nils-rounds', text: L('At half past twelve the chronometer was in its case.', 'Yarımdaki turda kronometre vitrinindeydi.'), anchor: L('Rounds at half past twelve and twenty to two.', 'Turlarım yarımda ve ikiye yirmi kala.') },
            ],
          }],
        },
      ],
      v2: { patience: 4 },
    },
  ],

  locations: [
    {
      id: 'loc-gallery', name: L('Gallery 2', '2 numaralı salon'),
      summary: L('A long dark gallery of ship’s instruments. The guard’s desk by the door, a key cabinet, a conservator’s bench behind a screen.', 'Gemi aletlerinin durduğu uzun, karanlık bir salon. Kapının yanında bekçi masası, bir anahtar dolabı, bir paravanın ardında restoratör tezgâhı.'),
      plan: [
        { t: 'wall', x1: 0.05, y1: 0.08, x2: 0.95, y2: 0.08 },
        { t: 'wall', x1: 0.95, y1: 0.08, x2: 0.95, y2: 0.92 },
        { t: 'wall', x1: 0.95, y1: 0.92, x2: 0.05, y2: 0.92 },
        { t: 'wall', x1: 0.05, y1: 0.92, x2: 0.05, y2: 0.08 },
        { t: 'rect', x: 0.42, y: 0.38, w: 0.16, h: 0.14, label: L('CHRONOMETER', 'KRONOMETRE') },
        { t: 'rect', x: 0.08, y: 0.70, w: 0.20, h: 0.12, label: L('GUARD’S DESK', 'BEKÇİ MASASI') },
        { t: 'rect', x: 0.08, y: 0.14, w: 0.08, h: 0.14, label: L('KEYS', 'ANAHTARLAR') },
        { t: 'rect', x: 0.72, y: 0.14, w: 0.20, h: 0.16, label: L('BENCH', 'TEZGÂH') },
        { t: 'door', x: 0.05, y: 0.60, r: 0.07, angle: 0 },
        { t: 'text', x: 0.08, y: 0.56, text: L('← ENTRANCE', '← GİRİŞ') },
      ],
      hotspots: [
        { id: 'h-case', label: L('Chronometer case', 'Kronometre vitrini'), x: 0.5, y: 0.45, reveals: ['ev-case'], description: L('Closed, locked, empty. A brass-coloured ring in the dust where the clock stood.', 'Kapalı, kilitli, boş. Saatin durduğu yerde tozda pirinç renkli bir halka.') },
        { id: 'h-desk', label: L('Guard’s desk', 'Bekçi masası'), x: 0.18, y: 0.76, reveals: ['ev-logbook'], description: L('A thermos, a radio, and a visitor log in careful capitals.', 'Bir termos, bir radyo ve özenli büyük harflerle tutulmuş bir ziyaretçi defteri.') },
        { id: 'h-keys', label: L('Key cabinet', 'Anahtar dolabı'), x: 0.12, y: 0.2, reveals: ['ev-keyregister'], description: L('Hooks numbered 1 to 12. Hook 2 is empty; a register hangs beside it.', '1’den 12’ye numaralı kancalar. 2 numaralı kanca boş; yanında bir kayıt defteri asılı.') },
        { id: 'h-bench', label: L('Conservator’s bench', 'Restoratör tezgâhı'), x: 0.82, y: 0.22, reveals: ['ev-glasses', 'ev-email'], description: L('Brass polish, cotton gloves, a spectacle case — and a printed email.', 'Pirinç cilası, pamuk eldivenler, bir gözlük kutusu — ve çıktısı alınmış bir e-posta.') },
      ],
    },
  ],

  evidence: [
    {
      id: 'ev-case', code: 'T-01', name: L('The empty case', 'Boş vitrin'), kind: 'physical', role: 'decisive', reliability: 'confirmed', locationId: 'loc-gallery',
      foundAt: L('Gallery 2', '2 numaralı salon'), relatedPeople: ['ada', 'nils'],
      description: L('Locked, unscratched, empty. Whoever opened it had a key and locked it again.', 'Kilitli, çiziksiz, boş. Kim açtıysa anahtarı vardı ve yeniden kilitledi.'),
    },
    {
      id: 'ev-logbook', code: 'T-02', name: L('Night visitor log', 'Gece ziyaretçi defteri'), kind: 'document', role: 'decisive', reliability: 'confirmed', locationId: 'loc-gallery',
      foundAt: L('Guard’s desk', 'Bekçi masası'), relatedPeople: ['ada', 'nils'],
      description: L('Nils Brekke’s log for the night, in his own hand.', 'Nils Brekke’nin o geceki defteri, kendi el yazısıyla.'),
      body: [
        L('00:30  ROUND — all cases secure. N.B.', '00:30  TUR — tüm vitrinler sağlam. N.B.'),
        L('{{f-lund-0110|01:10  IN — A. LUND (conservator), “forgot glasses”}}', '{{f-lund-0110|01:10  GİRİŞ — A. LUND (restoratör), “gözlüğünü unutmuş”}}'),
        L('01:25  OUT — A. LUND', '01:25  ÇIKIŞ — A. LUND'),
        L('01:40  ROUND — CASE 7 EMPTY. Director called 01:52.', '01:40  TUR — 7 NUMARALI VİTRİN BOŞ. Müdür 01:52’de arandı.'),
      ],
    },
    {
      id: 'ev-keyregister', code: 'T-03', name: L('Key register', 'Anahtar kayıt defteri'), kind: 'document', role: 'decisive', reliability: 'confirmed', locationId: 'loc-gallery',
      foundAt: L('Key cabinet', 'Anahtar dolabı'), relatedPeople: ['ada'],
      description: L('Who took which key, and when.', 'Hangi anahtarı kim, ne zaman aldı.'),
      body: [L('10/02  {{f-key-register|Key 2 (case 7) — out to A. Lund, “cleaning”}}. Not returned.', '10/02  {{f-key-register|2 no.lu anahtar (7 no.lu vitrin) — A. Lund aldı, “temizlik”}}. İade edilmedi.')],
    },
    {
      id: 'ev-glasses', code: 'T-04', name: L('Spectacle case', 'Gözlük kutusu'), kind: 'physical', role: 'decisive', reliability: 'confirmed', locationId: 'loc-gallery',
      foundAt: L('Conservator’s bench', 'Restoratör tezgâhı'), relatedPeople: ['ada'],
      description: L('Tortoiseshell reading glasses, folded in their case on Ada Lund’s bench.', 'Ada Lund’un tezgâhında, kutusunda katlı duran bağa çerçeveli bir okuma gözlüğü.'),
    },
    {
      id: 'ev-email', code: 'T-05', name: L('Printed email', 'E-posta çıktısı'), kind: 'document', role: 'decisive', reliability: 'confirmed', locationId: 'loc-gallery',
      foundAt: L('Conservator’s bench', 'Restoratör tezgâhı'), relatedPeople: ['ada'],
      description: L('An email to Ada Lund from a private address, dated 9 February.', 'Ada Lund’a özel bir adresten gelmiş, 9 Şubat tarihli bir e-posta.'),
      body: [
        L('“Dear Ms Lund — further to our conversation: {{f-offer|forty thousand for the Hallstedt piece, cash, no questions asked}}.”', '“Sayın Lund — konuşmamıza istinaden: {{f-offer|Hallstedt parçası için kırk bin, nakit, soru sorulmadan}}.”'),
      ],
    },
  ],

  analyses: [],

  statements: [
    { id: 's-ada-home', speakerId: 'ada', lane: 'ada', time: '18:00', truthful: false, text: L('Ada: left at 18:00 and stayed home all night.', 'Ada: 18:00’de çıktı, bütün gece evdeydi.') },
    { id: 's-ada-nokey', speakerId: 'ada', lane: 'ada', truthful: false, text: L('Ada: only the guard has keys to the cases.', 'Ada: vitrinlerin anahtarı yalnızca bekçide.') },
    { id: 's-ada-glasses', speakerId: 'ada', lane: 'ada', time: '01:10', truthful: false, text: L('Ada: came back only for her glasses; never went near Gallery 2.', 'Ada: sadece gözlüğü için döndü; 2 numaralı salona yaklaşmadı.') },
    { id: 's-nils-visitor', speakerId: 'nils', lane: 'nils', time: '01:10', truthful: true, text: L('Nils: only Ada Lund came in during the night, at 01:10.', 'Nils: gece boyunca sadece Ada Lund geldi, 01:10’da.') },
  ],

  contradictions: [
    { id: 'c-ada-home-log', statementId: 's-ada-home', evidenceId: 'ev-logbook', summary: L('Ada says she was home all night. The log signs her in at 01:10.', 'Ada bütün gece evde olduğunu söylüyor. Defter onu 01:10’da içeri yazmış.') },
    { id: 'c-ada-glasses', statementId: 's-ada-glasses', evidenceId: 'ev-glasses', summary: L('Ada says she came back for her glasses. They are still on her bench.', 'Ada gözlüğü için döndüğünü söylüyor. Gözlük hâlâ tezgâhında.') },
  ],

  accusation: {
    motives: [
      { id: 'm-sell', text: L('To sell it to a private collector', 'Özel bir koleksiyoncuya satmak') },
      { id: 'm-grudge', text: L('A grudge against the director', 'Müdüre duyulan kin') },
    ],
    methods: [
      { id: 'x-key', text: L('Opened the case with key #2 and locked it again', 'Vitrini 2 numaralı anahtarla açıp yeniden kilitledi') },
      { id: 'x-force', text: L('Forced the lock', 'Kilidi zorladı') },
    ],
    windows: [
      { id: 'w-0030', text: L('Before 00:30', '00:30’dan önce') },
      { id: 'w-0110', text: L('01:10 – 01:25', '01:10 – 01:25') },
    ],
    correctWindowId: 'w-0110',
    decisiveEvidence: ['ev-case', 'ev-logbook', 'ev-keyregister', 'ev-glasses', 'ev-email'],
    clearing: { nils: ['ev-logbook'], ada: [] },
    keyContradictions: ['c-ada-home-log', 'c-ada-glasses'],
    weights: { culprit: 30, motive: 15, method: 10, window: 10, evidence: 20, contradictions: 5, alternatives: 10 },
  },

  hints: [
    { id: 'fw-h1', until: { evidence: ['ev-logbook'] }, text: L('Shine your torch on the guard’s desk. Guards write things down.', 'Fenerini bekçi masasına tut. Bekçiler her şeyi yazar.') },
    { id: 'fw-h2', requires: { evidence: ['ev-logbook'] }, until: { facts: ['f-lund-0110'] }, text: L('Tap the underlined line in the log to put it in your notebook.', 'Defterdeki altı çizili satıra dokun; defterine geçsin.') },
    { id: 'fw-h3', requires: { facts: ['f-lund-0110'] }, until: { facts: ['f-bag-heavy'] }, text: L('Ask Nils about the visitor and press him for details.', 'Nils’e ziyaretçiyi sor ve ayrıntı için üstele.') },
    { id: 'fw-h4', requires: { facts: ['f-bag-heavy'] }, until: { statements: ['s-ada-glasses'] }, text: L('Ada says she was home. Show her the line from the log.', 'Ada evde olduğunu söylüyor. Ona defterdeki satırı göster.') },
    { id: 'fw-h5', text: L('Everything she says can be checked against something in this room.', 'Söylediği her şey bu odadaki bir şeyle sınanabilir.') },
  ],

  v2: {
    clock: {
      days: 1,
      minutesPerDay: 300,
      dayStart: '02:00',
      labSlots: 2,
      startLocationId: 'loc-gallery',
    },
    facts: [
      { id: 'f-rounds', text: L('At the 00:30 round the chronometer was in its case; at 01:40 it was gone.', '00:30 turunda kronometre vitrinindeydi; 01:40’ta yoktu.') },
      { id: 'f-case-key', text: L('The case was opened with a key and locked again — no scratches.', 'Vitrin anahtarla açılıp yeniden kilitlenmiş — çizik yok.') },
      { id: 'f-lund-0110', text: L('Ada Lund was signed in at 01:10 and out at 01:25.', 'Ada Lund 01:10’da giriş, 01:25’te çıkış yapmış.'), time: '01:10', about: ['ada'] },
      { id: 'f-bag-heavy', text: L('Ada came in with her bag folded flat and left with it heavy on her shoulder.', 'Ada çantası katlanmış geldi, omzunda ağır bir çantayla çıktı.'), about: ['ada'] },
      { id: 'f-key-register', text: L('Key 2, for the chronometer case, was signed out to Ada Lund.', 'Kronometre vitrininin 2 numaralı anahtarını Ada Lund almış.'), about: ['ada'] },
      { id: 'f-glasses-left', text: L('Ada’s reading glasses are still on her bench.', 'Ada’nın okuma gözlüğü hâlâ tezgâhında.'), about: ['ada'] },
      // wave 7 (PLAYTEST_V4 §7.6): no `about` — found on the case, it would file the polish under Ada before she is a
      // suspect; the text already points at the bench, which is enough
      { id: 'f-polish', text: L('Fresh brass polish by the keyhole of the case — the same as on the conservator’s bench.', 'Vitrinin anahtar deliğinin yanında taze pirinç cilası — restoratör tezgâhındakinin aynısı.') },
      { id: 'f-offer', text: L('A collector offered Ada €40,000 for the chronometer, no questions asked.', 'Bir koleksiyoncu Ada’ya kronometre için 40.000 € teklif etmiş, soru sorulmadan.'), about: ['ada'] },
    ],
    scenes: [
      {
        locationId: 'loc-gallery', art: 'first-watch/gallery',
        zones: [
          {
            id: 'z-fw-case', label: L('Chronometer case', 'Kronometre vitrini'), hotspotId: 'h-case', shape: { kind: 'rect', x: 0.42, y: 0.38, w: 0.16, h: 0.14 },
            closeUp: { art: 'first-watch/vitrine', text: L('Locked. Empty. A ring in the dust where the clock stood.', 'Kilitli. Boş. Saatin durduğu yerde tozda bir halka.') },
            details: [
              { id: 'd-fw-lock', label: L('The lock', 'Kilit'), text: L('Not a scratch. Opened with a key, and locked again.', 'Tek çizik yok. Anahtarla açılmış, yeniden kilitlenmiş.'), x: 0.42, y: 0.67, facts: ['f-case-key'] },
              // optional (wave 4): a second way to answer "I can't open that case"
              { id: 'd-fw-polish', label: L('Smear on the glass', 'Camdaki leke'), text: L('A thumbprint of brass polish by the keyhole, still tacky — the same tin as on the conservator’s bench.', 'Anahtar deliğinin yanında pirinç cilasından bir başparmak izi, hâlâ yapış yapış — restoratör tezgâhındaki kutunun aynısı.'), x: 0.7, y: 0.4, facts: ['f-polish'] },
            ],
          },
          {
            id: 'z-fw-desk', label: L('Guard’s desk', 'Bekçi masası'), hotspotId: 'h-desk', shape: { kind: 'rect', x: 0.08, y: 0.7, w: 0.2, h: 0.12 },
            closeUp: { art: 'first-watch/desk', text: L('A thermos, a radio, and the visitor log open at tonight.', 'Bir termos, bir radyo ve bu gecenin sayfasında açık ziyaretçi defteri.') },
            details: [],
          },
          {
            id: 'z-fw-keys', label: L('Key cabinet', 'Anahtar dolabı'), hotspotId: 'h-keys', shape: { kind: 'rect', x: 0.08, y: 0.14, w: 0.08, h: 0.14 },
            closeUp: { art: 'first-watch/key-cabinet', text: L('Hook 2 is empty. The register hangs on a string beside it.', '2 numaralı kanca boş. Kayıt defteri yanında bir ipe asılı.') },
            details: [],
          },
          {
            id: 'z-fw-bench', label: L('Conservator’s bench', 'Restoratör tezgâhı'), hotspotId: 'h-bench', shape: { kind: 'rect', x: 0.72, y: 0.14, w: 0.2, h: 0.16 },
            closeUp: { art: 'first-watch/bench', text: L('Brass polish, cotton gloves, a spectacle case, a printed email.', 'Pirinç cilası, pamuk eldivenler, bir gözlük kutusu, bir e-posta çıktısı.') },
            details: [{ id: 'd-fw-glasses', label: L('Spectacle case', 'Gözlük kutusu'), text: L('Reading glasses, folded inside. Nobody came back for these.', 'İçinde katlı bir okuma gözlüğü. Bunun için kimse geri gelmemiş.'), x: 0.26, y: 0.41, facts: ['f-glasses-left'] }],
          },
        ],
      },
    ],
    deductions: [
      {
        id: 'd-fw-who', kind: 'fill',
        title: L('Who opened the case', 'Vitrini kim açtı'),
        prompt: L(
          'Between the rounds, {who} came in at {time} and left with a heavier bag: {proof}',
          'İki tur arasında gelen: {who}; saat {time}. Çıkarken çantası ağırlaşmıştı: {proof}',
        ),
        blanks: [
          { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['ada'] },
          { id: 'time', type: 'time', label: L('when', 'saat'), accept: ['01:10'] },
          { id: 'proof', type: 'fact', label: L('proof', 'kanıt'), accept: ['f-bag-heavy'] },
        ],
        requires: { facts: ['f-lund-0110'] },
        confirmText: L('The only visitor, and the bag gave her away. Now prove it to her face.', 'Tek ziyaretçi o; çanta da onu ele verdi. Şimdi bunu yüzüne karşı kanıtla.'),
      },
    ],
    finale: {
      intro: L(
        'Before the day shift arrives, the person you name sits across the guard’s desk. Four answers, two tries each — show them the room.',
        'Gündüz vardiyası gelmeden, adını verdiğin kişi bekçi masasının karşısına oturacak. Dört cevap, her birine iki hak — ona odayı göster.',
      ),
      // a tutorial forgives a few wrong moves: the Clock star needs 15 % of the night left, not 25 %
      stars: { clockRemaining: 0.15 },
      rounds: [
        {
          id: 'r-fw-there', kind: 'opportunity',
          defence: L('I wasn’t even here tonight.', 'Bu gece burada bile değildim.'),
          prompt: L('Show that she was in the building.', 'Binada olduğunu göster.'),
          accept: ['d-fw-who', 'f-lund-0110', 'ev-logbook'], assist: ['d-fw-who'], refutes: ['s-ada-home'],
          win: L('(She looks at Nils’s handwriting.) … Fine. I was here.', '(Nils’in el yazısına bakar.) … Peki. Buradaydım.'),
          lose: L('A line in a tired old man’s notebook.', 'Yorgun bir ihtiyarın defterinde bir satır.'),
        },
        {
          id: 'r-fw-glasses', kind: 'lie',
          defence: L('I came back for my glasses. That’s all.', 'Gözlüğüm için döndüm. Hepsi bu.'),
          prompt: L('Show that she did not come for her glasses.', 'Gözlüğü için gelmediğini göster.'),
          accept: ['f-glasses-left', 'ev-glasses'], refutes: ['s-ada-glasses'],
          win: L('… They’re still there? I — must have forgotten them twice.', '… Hâlâ orada mı? Ben — demek iki kere unutmuşum.'),
          lose: L('I found them and I left. Simple.', 'Buldum ve çıktım. Bu kadar basit.'),
        },
        {
          id: 'r-fw-key', kind: 'means',
          defence: L('I can’t open that case. Nils has the keys.', 'O vitrini açamam. Anahtarlar Nils’te.'),
          prompt: L('Show that she had a key to the case.', 'Vitrinin anahtarının onda olduğunu göster.'),
          accept: ['f-key-register', 'ev-keyregister', 'f-polish'], refutes: ['s-ada-nokey'],
          win: L('“Cleaning.” Yes. I signed for it.', '“Temizlik.” Evet. İmzayı ben attım.'),
          lose: L('You can’t show me a key.', 'Bana bir anahtar gösteremezsiniz.'),
        },
        {
          id: 'r-fw-why', kind: 'motive',
          defence: L('Why would I steal from my own museum?', 'Kendi müzemden neden çalayım?'),
          prompt: L('Show why she took it.', 'Neden aldığını göster.'),
          accept: ['f-offer', 'ev-email'],
          win: L('Forty thousand. They cut my hours in October.', 'Kırk bin. Ekim’de çalışma saatlerimi kestiler.'),
          lose: L('You have no reason. Neither did I.', 'Bir sebebiniz yok. Benim de yoktu.'),
        },
      ],
      confession: {
        line: L(
          'He said nobody would ever ask. … It’s in my car, under a blanket. It’s not even scratched. I was careful. I’m always careful.',
          'Kimse sormaz dedi. … Arabamda, bir battaniyenin altında. Çizik bile yok. Dikkat ettim. Hep dikkat ederim.',
        ),
      },
      innocents: {
        nils: {
          defence: L('I wrote her in myself. Why would I write down the person who robbed me?', 'Onun girişini ben yazdım. Beni soyan kişiyi neden deftere yazayım?'),
          collapse: L(
            'The only line that names a visitor is in Nils’s own hand. The prosecutor sends you back to the gallery, and Ada Lund drives home.',
            'Bir ziyaretçinin adını veren tek satır Nils’in kendi el yazısıyla. Savcı seni salona geri gönderiyor; Ada Lund ise arabasıyla evine gidiyor.',
          ),
        },
      },
    },
    // a first-timer: looks at the key cabinet before the log, talks to Ada first and shows her the wrong thing once
    newcomerPath: {
      firstWinBy: 220,
      firstWinRealMinutes: 10,
      minConfirmedDay1: 1,
      steps: [
        { do: 'inspect', zone: 'z-fw-case' },
        { do: 'detail', zone: 'z-fw-case', detail: 'd-fw-lock' },
        { do: 'inspect', zone: 'z-fw-keys' },
        { do: 'inspect', zone: 'z-fw-desk' },
        { do: 'collect', evidence: 'ev-logbook', fact: 'f-lund-0110' },
        { do: 'interview', suspect: 'ada' },
        { do: 'topic', suspect: 'ada', topic: 't-night' },
        { do: 'wrongPresent', suspect: 'ada', claim: 'c-ada-home', item: 'f-case-key' },
        { do: 'present', suspect: 'ada', claim: 'c-ada-home', item: 'f-lund-0110' },
        { do: 'leave', suspect: 'ada' },
        { do: 'interview', suspect: 'nils' },
        { do: 'topic', suspect: 'nils', topic: 't-night' },
        { do: 'press', suspect: 'nils', claim: 'c-nils-visitor' },
        { do: 'leave', suspect: 'nils' },
        { do: 'deduce', deduction: 'd-fw-who', fills: { who: 'ada', time: '01:10', proof: 'f-bag-heavy' } },
      ],
    },
    idealPath: [
      { do: 'inspect', zone: 'z-fw-case' },
      { do: 'detail', zone: 'z-fw-case', detail: 'd-fw-lock' },
      { do: 'inspect', zone: 'z-fw-desk' },
      { do: 'collect', evidence: 'ev-logbook', fact: 'f-lund-0110' },
      { do: 'interview', suspect: 'nils' },
      { do: 'topic', suspect: 'nils', topic: 't-night' },
      { do: 'press', suspect: 'nils', claim: 'c-nils-visitor' },
      { do: 'leave', suspect: 'nils' },
      { do: 'interview', suspect: 'ada' },
      { do: 'topic', suspect: 'ada', topic: 't-night' },
      { do: 'present', suspect: 'ada', claim: 'c-ada-home', item: 'f-lund-0110' },
      { do: 'leave', suspect: 'ada' },
      { do: 'deduce', deduction: 'd-fw-who', fills: { who: 'ada', time: '01:10', proof: 'f-bag-heavy' } },
      { do: 'inspect', zone: 'z-fw-bench' },
      { do: 'detail', zone: 'z-fw-bench', detail: 'd-fw-glasses' },
      { do: 'collect', evidence: 'ev-email', fact: 'f-offer' },
      { do: 'inspect', zone: 'z-fw-keys' },
      { do: 'collect', evidence: 'ev-keyregister', fact: 'f-key-register' },
      { do: 'finale', accused: 'ada', answers: ['d-fw-who', 'f-glasses-left', 'f-key-register', 'f-offer'] },
    ],
  },
};

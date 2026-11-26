// SERVER-ONLY. Kessler Workshop — evidence. Document bodies carry v2 fact markup in both languages:
// {{f-id|phrase}} underlined, {{?f-id|phrase}} plain (the player has to notice it). Same facts, same order per line.
import type { CaseDefinition } from '../../engine/types.ts';
import { L } from '../text.ts';

export const evidence: CaseDefinition['evidence'] = [
  {
    id: 'ev-neighbour', code: 'E-01', name: L('Statement — Ilse Varga (neighbour)', 'İfade — Ilse Varga (komşu)'), kind: 'testimony', role: 'supporting', reliability: 'reliable',
    foundAt: L('Taken by PC Moen, 14 March 10:20', 'Polis memuru Moen tarafından alındı, 14 Mart 10:20'), relatedPeople: ['p-varga'],
    description: L('The neighbour across the courtyard heard two things on the night of 13 March.', 'Avlunun karşısındaki komşu 13 Mart gecesi iki şey duydu.'),
    body: [
      L(
        '"At about ten o’clock {{f-shout-2200|I heard a woman shouting in the workshop}}. Not words — just a raised voice, angry. It went on for a few minutes and then a door banged."',
        '“Saat on sularında {{f-shout-2200|atölyeden bir kadının bağırdığını duydum}}. Kelimeleri seçemedim — yükselmiş, öfkeli bir ses. Birkaç dakika sürdü, sonra bir kapı çarptı.”',
      ),
      L(
        '"Later I was watching the late news. It had just started — so a little after a quarter past eleven — and {{f-thump-2320|I heard a heavy thump from the workshop}}. Like something dropped. I thought: Thomas and his wood. I didn’t look out."',
        '“Sonra gece haberlerini izliyordum. Yeni başlamıştı — yani on biri çeyrek biraz geçiyordu — {{f-thump-2320|atölyeden ağır bir gümleme duydum}}. Bir şey düşmüş gibi. Thomas yine tahtalarıyla uğraşıyor, dedim. Dışarı bakmadım.”',
      ),
      L('"I didn’t hear anything after that. I went to bed at midnight."', '“Ondan sonra bir şey duymadım. Gece yarısı yattım.”'),
    ],
    timeline: [
      { time: '22:00', text: L('Woman’s raised voice heard in workshop (Varga)', 'Atölyede yükselen kadın sesi (Varga)'), lane: 'scene' },
      { time: '23:20', text: L('Heavy thump heard, just after 23:15 news began (Varga)', '23:15 haberleri başladıktan hemen sonra ağır gümleme (Varga)'), lane: 'scene' },
    ],
  },
  {
    id: 'ev-camera', code: 'E-02', name: L('Traffic camera — Ostwall junction', 'Trafik kamerası — Ostwall kavşağı'), kind: 'document', role: 'supporting', reliability: 'confirmed',
    foundAt: L('Municipal traffic authority', 'Belediye trafik müdürlüğü'), relatedPeople: [],
    description: L(
      'Brenner Lane is a cul-de-sac. Every vehicle entering or leaving passes the municipal ANPR camera at the Ostwall junction. Footage is held for 30 days and can be requested.',
      'Brenner Sokağı çıkmaz sokak. Giren çıkan her araç Ostwall kavşağındaki belediyenin plaka tanıma kamerasından geçiyor. Kayıtlar 30 gün saklanıyor ve talep edilebiliyor.',
    ),
  },
  {
    id: 'ev-body', code: 'E-03', name: L('The body of Thomas Kessler', 'Thomas Kessler’in cesedi'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Workshop floor, between bench and ladder', 'Atölye zemini, tezgâhla merdiven arası'), relatedPeople: ['p-thomas'],
    description: L(
      'Single wound above the left ear. Little external bleeding. No visible injuries to the hands or wrists. Rigor established. A full post-mortem can be requested.',
      'Sol kulağın üstünde tek yara. Dış kanama az. Ellerde ya da bileklerde görünür bir yaralanma yok. Ölü katılığı oluşmuş. Tam otopsi istenebilir.',
    ),
  },
  {
    id: 'ev-phone', code: 'E-04', name: L('Victim’s mobile phone', 'Maktulün cep telefonu'), kind: 'digital', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Apron pocket of the victim', 'Maktulün önlük cebi'), relatedPeople: ['p-thomas'],
    description: L(
      'A locked smartphone, 31% battery. Three missed-call notifications on the lock screen from the morning. Digital forensics can extract the call log and messages.',
      'Kilitli bir akıllı telefon, şarjı %31. Kilit ekranında sabahtan üç cevapsız arama bildirimi. Dijital inceleme birimi arama kaydını ve mesajları çıkarabilir.',
    ),
  },
  {
    id: 'ev-ladder', code: 'E-05', name: L('Overturned library ladder', 'Devrilmiş kütüphane merdiveni'), kind: 'physical', role: 'misleading', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('On its side, one metre from the body', 'Cesetten bir metre ötede, yan yatmış'), relatedPeople: ['p-thomas'],
    description: L(
      'The ladder that supports the "fall" theory. It reaches the top shelves of tonewood — where the dust is undisturbed. Nothing up there has been moved in months.',
      '“Düşme” teorisini destekleyen merdiven. Tonluk ağaçların durduğu en üst raflara uzanıyor — ki orada toz hiç bozulmamış. Yukarıdaki hiçbir şeye aylardır dokunulmamış.',
    ),
  },
  {
    id: 'ev-mallet', code: 'E-06', name: L('Lignum vitae mallet', 'Gayak ağacı tokmak'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Tool wall, hanging slightly askew', 'Alet duvarı, askısında hafif yamuk'), relatedPeople: [],
    description: L(
      'A heavy mallet of lignum vitae, about 1.1 kg, with a round striking face. Cleaner than the other five on the wall. Can be sent for fingerprints and serology.',
      'Gayak ağacından ağır bir tokmak, yaklaşık 1,1 kg, yuvarlak vuruş yüzlü. Duvardaki diğer beşinden daha temiz. Parmak izi ve seroloji için gönderilebilir.',
    ),
  },
  {
    id: 'ev-uvlamp', code: 'E-07', name: L('UV inspection lamp (switched on)', 'UV inceleme lambası (açık)'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Thomas Kessler’s bench', 'Thomas Kessler’in tezgâhı'), relatedPeople: ['p-thomas'],
    description: L(
      'A long-wave UV lamp used to read varnish: old varnish fluoresces a dull green-amber, new varnish stays dark or glows evenly. It was still on in the morning, aimed at an empty instrument cradle. Beside it, an inspection mirror on a stalk — the kind used to read labels and brands inside a body.',
      'Verniği okumak için kullanılan uzun dalga bir UV lambası: eski vernik mat, yeşilimsi kehribar bir ışıkla parlar; yeni vernik karanlık kalır ya da düz bir ışık verir. Sabah hâlâ açıktı, boş bir çalgı beşiğine çevrilmişti. Yanında saplı bir inceleme aynası — gövdenin içindeki etiketleri ve damgaları okumak için kullanılan türden.',
    ),
  },
  {
    id: 'ev-note', code: 'E-08', name: L('Pencilled note', 'Kurşun kalem not'), kind: 'document', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Under papers on Thomas Kessler’s bench', 'Thomas Kessler’in tezgâhında, kâğıtların altında'), relatedPeople: ['p-thomas', 'jonas', 'clara'],
    description: L('A sheet torn from a notepad, in Thomas Kessler’s hand, pencil, unfinished.', 'Not defterinden koparılmış bir sayfa; Thomas Kessler’in el yazısı, kurşun kalem, yarım kalmış.'),
    body: [
      L('G.B.G. 1772 —', 'G.B.G. 1772 —'),
      L('{{f-note-varnish|varnish WRONG under UV}}. Even. No crackle fluorescence.', '{{f-note-varnish|UV’de vernik YANLIŞ}}. Düz. Çatlak ışıması yok.'),
      L('{{f-note-jf|Lower block: brand. "JF"??}}', '{{f-note-jf|Alt takoz: damga. “JF”??}}'),
      L('Ask J.', 'J.’ye sor.'),
      L('{{?f-note-then-c|then C.}} —', '{{?f-note-then-c|sonra C.}} —'),
    ],
  },
  {
    id: 'ev-earring', code: 'E-09', name: L('Gold earring back', 'Altın küpe arkalığı'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Floor near the victim’s shoulder', 'Zemin, maktulün omzunun yanı'), relatedPeople: [],
    description: L(
      'A small gold butterfly clasp for a stud earring. Clean, no dust, lying on top of the shavings.',
      'Vidasız bir küpe için küçük, altın, kelebek tipi bir arkalık. Temiz, tozsuz; talaşların üstünde duruyor.',
    ),
  },
  {
    id: 'ev-rag', code: 'E-10', name: L('Damp rag (naphtha)', 'Nemli bez (neft)'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Lidded bin at the cleaning station', 'Temizlik köşesindeki kapaklı kova'), relatedPeople: [],
    description: L(
      'A cotton rag still damp with naphtha. Faint brownish streaks in one fold. Can be sent for serology.',
      'Hâlâ neftle nemli bir pamuk bez. Kıvrımlarından birinde soluk kahverengi çizgiler. Seroloji için gönderilebilir.',
    ),
  },
  {
    id: 'ev-bowcabinet', code: 'E-11', name: L('Empty slot — Sartory bow', 'Boş yuva — Sartory yay'), kind: 'physical', role: 'misleading', reliability: 'confirmed', locationId: 'loc-workshop',
    foundAt: L('Bow display cabinet', 'Yay vitrini'), relatedPeople: ['leo'],
    description: L(
      'One velvet slot is empty. The card reads "E. Sartory, Paris c.1912 — €18,500". The cabinet is unlocked during working hours. A robbery theory starts here. Pawn registries can be checked.',
      'Kadife yuvalardan biri boş. Kartında “E. Sartory, Paris y.1912 — 18.500 €” yazıyor. Vitrin mesai saatlerinde kilitsiz. Bir hırsızlık teorisi buradan başlar. Rehin kayıtlarına bakılabilir.',
    ),
  },
  {
    id: 'ev-consignment', code: 'E-12', name: L('Consignment agreement — Achterberg', 'Konsinye sözleşmesi — Achterberg'), kind: 'document', role: 'misleading', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Desk drawer, front office', 'Ön ofis, masa çekmecesi'), relatedPeople: ['miriam', 'p-thomas'],
    description: L(
      'Agreement dated 9 January last year: Miriam Achterberg consigns a violin by G.B. Guadagnini, Turin 1772, to Kessler Strings for sale. Reserve €2,400,000; commission 10%.',
      'Geçen yılın 9 Ocak tarihli sözleşmesi: Miriam Achterberg, G.B. Guadagnini imzalı bir kemanı (Torino, 1772) satılmak üzere Kessler Strings’e emanet ediyor. Taban fiyat 2.400.000 €; komisyon %10.',
    ),
    body: [
      L(
        '§7 Withdrawal: the Consignor may withdraw the instrument on thirty (30) days’ written notice.',
        '§7 Geri çekme: Emanet eden, otuz (30) gün önceden yazılı bildirimde bulunarak çalgıyı geri çekebilir.',
      ),
      L(
        'Clipped to it: a letter from Miriam Achterberg dated 4 March giving notice of withdrawal. Thomas has written across it in red: "30 days. {{f-notice|Not before 3 April.}}"',
        'Ekine iliştirilmiş: Miriam Achterberg’in 4 Mart tarihli geri çekme bildirimi. Thomas üstüne kırmızıyla yazmış: “30 gün. {{f-notice|3 Nisan’dan önce olmaz.}}”',
      ),
    ],
  },
  {
    id: 'ev-diary', code: 'E-13', name: L('Desk diary — Thursday 13 March', 'Masa ajandası — 13 Mart Perşembe'), kind: 'document', role: 'supporting', reliability: 'reliable', locationId: 'loc-office',
    foundAt: L('Thomas Kessler’s desk', 'Thomas Kessler’in masası'), relatedPeople: ['miriam', 'p-thomas'],
    description: L('Thomas’s appointments for the day.', 'Thomas’ın o günkü randevuları.'),
    body: [
      L('09:00 Bridge — Lindqvist cello', '09:00 Köprü — Lindqvist çellosu'),
      L('{{?f-diary-bank|11:30 Bank?? (C.)}}', '{{?f-diary-bank|11:30 Banka?? (C.)}}'),
      L('14:00 Leo — purfling', '14:00 Leo — fileto'),
      L('{{f-diary-miriam|21:45 M.A. here — show her the G.}}', '{{f-diary-miriam|21:45 M.A. burada — G.’yi göster.}}'),
    ],
    timeline: [{ time: '21:45', text: L('Diary: "M.A. here — show her the G."', 'Ajanda: “M.A. burada — G.’yi göster.”'), lane: 'miriam' }],
  },
  {
    id: 'ev-frontdoor', code: 'E-14', name: L('Front door — no forced entry', 'Ön kapı — zorlama yok'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Front office', 'Ön ofis'), relatedPeople: [],
    description: L(
      'No damage to frame, lock or strike plate. Whoever came in that night was let in or had a fob. The lock can be opened from inside by the thumb-turn.',
      'Kasada, kilitte ya da karşılık sacında hasar yok. O gece kim girdiyse ya içeri alındı ya da kartı vardı. Kilit içeriden mandalla açılabiliyor.',
    ),
  },
  {
    id: 'ev-violin', code: 'E-15', name: L('The Guadagnini (as found)', 'Guadagnini (bulunduğu hâliyle)'), kind: 'physical', role: 'supporting', reliability: 'unverified', locationId: 'loc-vault',
    foundAt: L('Rosewood case, vault centre shelf', 'Gül ağacı kutu, kasa odası orta raf'), relatedPeople: ['miriam'],
    description: L(
      'Amber varnish, two-piece back, label "Joannes Baptista Guadagnini fecit Taurini 1772". To an untrained eye it is a two-million-euro violin. It can be sent for specialist examination.',
      'Kehribar vernik, iki parça sırt, etiket: “Joannes Baptista Guadagnini fecit Taurini 1772”. Eğitimsiz bir göz için iki milyon avroluk bir keman. Uzman incelemesine gönderilebilir.',
    ),
  },
  {
    id: 'ev-ledger', code: 'E-16', name: L('Vault sign-out ledger', 'Kasa çıkış defteri'), kind: 'document', role: 'supporting', reliability: 'confirmed', locationId: 'loc-vault',
    foundAt: L('Vault lectern', 'Kasa odası kürsüsü'), relatedPeople: ['p-thomas'],
    description: L(
      'The last entry is in Thomas’s hand. The "in" column for it is blank — yet the violin was found back in its case in the vault.',
      'Son kayıt Thomas’ın el yazısıyla. “Giriş” sütunu boş — oysa keman kasadaki kutusunda bulundu.',
    ),
    body: [L('13/03 — G.B.G. 1772 — {{f-ledger-noin|OUT 21:40 — IN ______}} — TK', '13/03 — G.B.G. 1772 — {{f-ledger-noin|ÇIKIŞ 21:40 — GİRİŞ ______}} — TK')],
    timeline: [{ time: '21:40', text: L('Guadagnini signed out of vault by Thomas (no return entry)', 'Guadagnini Thomas tarafından kasadan çıkarıldı (dönüş kaydı yok)'), lane: 'victim' }],
  },
  {
    id: 'ev-accesspanel', code: 'E-17', name: L('Access-control system', 'Geçiş kontrol sistemi'), kind: 'digital', role: 'supporting', reliability: 'confirmed', locationId: 'loc-back',
    foundAt: L('Back entrance', 'Arka giriş'), relatedPeople: [],
    description: L(
      'HALSEC controller for both doors. Logs every fob entry and every exit-button press for 90 days. Digital forensics can extract the event log.',
      'İki kapının da HALSEC kontrol ünitesi. Her kart girişini ve her çıkış butonu basışını 90 gün kaydediyor. Dijital inceleme birimi olay kaydını çıkarabilir.',
    ),
  },
  {
    id: 'ev-tracks', code: 'E-18', name: L('Bicycle tracks in the frost', 'Kırağıda bisiklet izleri'), kind: 'physical', role: 'misleading', reliability: 'reliable', locationId: 'loc-back',
    foundAt: L('Courtyard', 'Avlu'), relatedPeople: ['leo'],
    description: L(
      'A single set of narrow tyre marks, in and out, laid down after the frost began to form. Someone came by bicycle in the evening. Only one member of staff cycles: Leo Brandt.',
      'Tek bir çift ince lastik izi, gidiş ve dönüş; kırağı oluşmaya başladıktan sonra bırakılmış. Akşam biri bisikletle gelmiş. Çalışanlardan bisiklete binen tek kişi var: Leo Brandt.',
    ),
  },
  {
    id: 'ev-accounts', code: 'E-19', name: L('Quarterly accounts binder', 'Üç aylık hesap klasörü'), kind: 'financial', role: 'supporting', reliability: 'reliable', locationId: 'loc-office',
    foundAt: L('Filing cabinet, front office', 'Ön ofis, dosya dolabı'), relatedPeople: ['clara'],
    description: L(
      'Six consecutive quarters of losses. A €900,000 loan secured on the premises appears in March last year and is marked "settled" on 4 September. There is no entry for where the settlement money came from. A financial investigation would need grounds.',
      'Üst üste altı çeyrek zarar. Geçen yılın Mart ayında işyeri teminatlı 900.000 €’luk bir kredi görünüyor; 4 Eylül’de “kapandı” diye işaretlenmiş. Kapatma parasının nereden geldiğine dair kayıt yok. Mali soruşturma için gerekçe lazım.',
    ),
  },

  // ── produced by the lab / interviews
  {
    id: 'ev-autopsy', code: 'E-20', name: L('Post-mortem report', 'Otopsi raporu'), kind: 'forensic', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Institute of Forensic Medicine — Dr H. Lind', 'Adli Tıp Enstitüsü — Dr. H. Lind'), relatedPeople: ['p-thomas', 'p-lind'],
    description: L('Death was caused by a single blow, not a fall.', 'Ölüme düşme değil, tek bir darbe yol açtı.'),
    body: [
      L(
        'Cause of death: depressed fracture of the left temporal bone with underlying haemorrhage, from {{f-single-blow|a single blow with a heavy object with a round flat face approx. 42 mm in diameter}}.',
        'Ölüm nedeni: sol temporal kemikte çökme kırığı ve altında kanama; {{f-single-blow|yaklaşık 42 mm çapında, yuvarlak ve düz yüzlü ağır bir cisimle indirilmiş tek darbe}}.',
      ),
      L(
        '{{f-no-fall|No injuries consistent with a fall from height}}: no wrist, forearm or shoulder fractures, no secondary impact sites, no grazes on the palms.',
        '{{f-no-fall|Yüksekten düşmeyle uyumlu yaralanma yok}}: bilek, önkol ya da omuz kırığı yok, ikincil çarpma bölgesi yok, avuç içlerinde sıyrık yok.',
      ),
      L(
        'The angle of the wound indicates {{?f-from-behind|a blow delivered from behind and to the left of the victim}} while he was standing.',
        'Yaranın açısı, darbenin maktul ayaktayken {{?f-from-behind|arkasından ve solundan indirildiğini}} gösteriyor.',
      ),
      L(
        'Time of death estimated {{f-tod|between 23:00 and 23:45 on 13 March}} (body temperature, rigor, gastric contents).',
        'Tahmini ölüm zamanı: {{f-tod|13 Mart, 23:00 ile 23:45 arası}} (vücut ısısı, ölü katılığı, mide içeriği).',
      ),
      L('Toxicology: blood alcohol 0.0. No drugs.', 'Toksikoloji: kanda alkol 0,0. Uyuşturucu ya da ilaç yok.'),
    ],
    timeline: [
      { time: '23:00', text: L('Estimated time of death window opens (23:00–23:45)', 'Tahmini ölüm aralığı başlıyor (23:00–23:45)'), lane: 'victim' },
      { time: '23:45', text: L('Estimated time of death window closes', 'Tahmini ölüm aralığı bitiyor'), lane: 'victim' },
    ],
  },
  {
    id: 'ev-serology', code: 'E-21', name: L('Lab report — mallet', 'Laboratuvar raporu — tokmak'), kind: 'forensic', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Forensic laboratory', 'Kriminal laboratuvar'), relatedPeople: ['p-thomas'],
    description: L('The lignum vitae mallet is the weapon.', 'Cinayet aleti gayak ağacı tokmak.'),
    body: [
      L('{{f-mallet-42|Striking face diameter: 42 mm}}. Consistent with the wound described in the post-mortem.', '{{f-mallet-42|Vuruş yüzeyi çapı: 42 mm}}. Otopside tarif edilen yarayla uyumlu.'),
      L('Luminol: positive in the seam between head and handle and in the grain of the face.', 'Luminol: baş ile sapın birleştiği yerde ve vuruş yüzeyinin damarlarında pozitif.'),
      L('DNA from the seam: {{f-mallet-blood|full profile matching Thomas Kessler}}.', 'Birleşim yerinden alınan DNA: {{f-mallet-blood|Thomas Kessler ile eşleşen tam profil}}.'),
      L('Surface residue: naphtha. {{f-mallet-wiped|The mallet was wiped with solvent after use}}.', 'Yüzey kalıntısı: neft. {{f-mallet-wiped|Tokmak kullanıldıktan sonra çözücüyle silinmiş}}.'),
      L('Fingerprints: none usable — wiped.', 'Parmak izi: kullanılabilir iz yok — silinmiş.'),
    ],
  },
  {
    id: 'ev-calllog', code: 'E-22', name: L('Phone extraction — victim', 'Telefon dökümü — maktul'), kind: 'digital', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Digital forensics unit', 'Dijital inceleme birimi'), relatedPeople: ['p-thomas', 'jonas', 'clara', 'miriam'],
    description: L('Call log and messages from Thomas Kessler’s phone, evening of 13 March.', 'Thomas Kessler’in telefonundan 13 Mart akşamına ait arama kaydı ve mesajlar.'),
    body: [
      L('19:31  OUT  → Miriam Achterberg   1 min 04 s', '19:31  GİDEN  → Miriam Achterberg   1 dk 04 sn'),
      L('22:43  OUT  → Jonas Feld          {{f-call-jonas|3 min 12 s}}', '22:43  GİDEN  → Jonas Feld          {{f-call-jonas|3 dk 12 sn}}'),
      L('22:51  OUT  → Clara Kessler       {{?f-call-clara|2 min 40 s}}', '22:51  GİDEN  → Clara Kessler       {{?f-call-clara|2 dk 40 sn}}'),
      L(
        '22:55  SMS  → Clara Kessler       "I know about the Guadagnini. Jonas told me. {{f-sms|Come now or I call the police tonight.}}"',
        '22:55  SMS  → Clara Kessler       “Guadagnini’yi biliyorum. Jonas söyledi. {{f-sms|Hemen gel, yoksa bu gece polisi ararım.}}”',
      ),
      L('23:24  IN   ← Miriam Achterberg   {{f-miriam-2324|missed}}', '23:24  GELEN  ← Miriam Achterberg   {{f-miriam-2324|cevapsız}}'),
      L('07:31, 07:40, 07:47  IN  ← Lindqvist (client)  missed', '07:31, 07:40, 07:47  GELEN  ← Lindqvist (müşteri)  cevapsız'),
    ],
    timeline: [
      { time: '19:31', text: L('Thomas → Miriam, call 1:04', 'Thomas → Miriam, arama 1:04'), lane: 'victim' },
      { time: '22:43', text: L('Thomas → Jonas, call 3:12 (answered)', 'Thomas → Jonas, arama 3:12 (cevaplandı)'), lane: 'victim' },
      { time: '22:51', text: L('Thomas → Clara, call 2:40 (answered)', 'Thomas → Clara, arama 2:40 (cevaplandı)'), lane: 'victim' },
      { time: '22:55', text: L('Thomas → Clara, SMS: "…Come now or I call the police tonight."', 'Thomas → Clara, SMS: “…Hemen gel, yoksa bu gece polisi ararım.”'), lane: 'victim' },
      { time: '23:24', text: L('Miriam → Thomas, missed call', 'Miriam → Thomas, cevapsız arama'), lane: 'miriam' },
    ],
  },
  {
    id: 'ev-accesslog', code: 'E-23', name: L('Access-control event log', 'Geçiş kontrol olay kaydı'), kind: 'digital', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Digital forensics unit — HALSEC controller', 'Dijital inceleme birimi — HALSEC ünitesi'), relatedPeople: ['clara', 'leo', 'jonas'],
    description: L(
      'Every door event at 14 Brenner Lane, 13–14 March. Exits by button are not attributed to a person.',
      'Brenner Sokağı 14’teki 13–14 Mart tarihli bütün kapı olayları. Butonla yapılan çıkışlar bir kişiye bağlanmıyor.',
    ),
    body: [
      L('13/03 07:58  FRONT  unlock   fob #01 T. KESSLER', '13/03 07:58  ÖN     açılış   kart #01 T. KESSLER'),
      L('13/03 08:41  BACK   entry    fob #04 L. BRANDT', '13/03 08:41  ARKA   giriş    kart #04 L. BRANDT'),
      L('13/03 08:55  BACK   entry    fob #03 J. FELD', '13/03 08:55  ARKA   giriş    kart #03 J. FELD'),
      L('13/03 09:30  FRONT  entry    fob #02 C. KESSLER', '13/03 09:30  ÖN     giriş    kart #02 C. KESSLER'),
      L('13/03 18:10  BACK   exit     (button)', '13/03 18:10  ARKA   çıkış    (buton)'),
      L('13/03 18:25  BACK   exit     (button)', '13/03 18:25  ARKA   çıkış    (buton)'),
      L('13/03 18:40  FRONT  exit     (button)', '13/03 18:40  ÖN     çıkış    (buton)'),
      L('13/03 21:46  FRONT  unlock   {{?f-front-2146|(interior thumb-turn)}}', '13/03 21:46  ÖN     açılış   {{?f-front-2146|(içeriden mandal)}}'),
      L('13/03 21:58  BACK   entry    {{f-leo-2158|fob #04 L. BRANDT}}', '13/03 21:58  ARKA   giriş    {{f-leo-2158|kart #04 L. BRANDT}}'),
      L('13/03 22:12  FRONT  unlock   {{?f-front-2212|(interior thumb-turn)}}', '13/03 22:12  ÖN     açılış   {{?f-front-2212|(içeriden mandal)}}'),
      L('13/03 22:19  BACK   exit     {{?f-exit-2219|(button)}}', '13/03 22:19  ARKA   çıkış    {{?f-exit-2219|(buton)}}'),
      L('13/03 23:04  BACK   entry    {{f-clara-2304|fob #02 C. KESSLER}}', '13/03 23:04  ARKA   giriş    {{f-clara-2304|kart #02 C. KESSLER}}'),
      L('13/03 23:38  BACK   exit     {{f-exit-2338|(button)}}', '13/03 23:38  ARKA   çıkış    {{f-exit-2338|(buton)}}'),
      L('14/03 07:52  BACK   entry    fob #03 J. FELD', '14/03 07:52  ARKA   giriş    kart #03 J. FELD'),
    ],
    timeline: [
      { time: '21:46', text: L('Front door opened from inside', 'Ön kapı içeriden açıldı'), lane: 'scene' },
      { time: '21:58', text: L('Back door: fob L. Brandt — entry', 'Arka kapı: L. Brandt kartı — giriş'), lane: 'leo' },
      { time: '22:12', text: L('Front door opened from inside', 'Ön kapı içeriden açıldı'), lane: 'scene' },
      { time: '22:19', text: L('Back door: exit (button)', 'Arka kapı: çıkış (buton)'), lane: 'scene' },
      { time: '23:04', text: L('Back door: fob C. Kessler — entry', 'Arka kapı: C. Kessler kartı — giriş'), lane: 'clara' },
      { time: '23:38', text: L('Back door: exit (button) — last event of the night', 'Arka kapı: çıkış (buton) — gecenin son olayı'), lane: 'scene' },
    ],
  },
  {
    id: 'ev-cctv', code: 'E-24', name: L('ANPR extract — Ostwall junction', 'Plaka tanıma dökümü — Ostwall kavşağı'), kind: 'footage', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Municipal traffic authority', 'Belediye trafik müdürlüğü'), relatedPeople: ['miriam', 'clara', 'leo'],
    description: L('All movements in and out of Brenner Lane, 21:00–00:00, 13 March.', '13 Mart, 21:00–00:00 arası Brenner Sokağı’na bütün giriş çıkışlar.'),
    body: [
      L('21:44  IN   dark green Jaguar XF   HS-MA 562  {{f-jaguar-in|(reg. M. Achterberg)}}', '21:44  GİRİŞ  koyu yeşil Jaguar XF   HS-MA 562  {{f-jaguar-in|(ruhsat: M. Achterberg)}}'),
      L('21:55  IN   {{f-cyclist-in|cyclist, dark jacket, helmet, shoulder bag}} — face not visible', '21:55  GİRİŞ  {{f-cyclist-in|bisikletli, koyu mont, kask, omuz çantası}} — yüz seçilemiyor'),
      L('22:15  OUT  dark green Jaguar XF   {{?f-jaguar-out|HS-MA 562}}', '22:15  ÇIKIŞ  koyu yeşil Jaguar XF   {{?f-jaguar-out|HS-MA 562}}'),
      L('22:22  OUT  cyclist, same clothing, {{f-cyclist-out|bag now visibly heavier}}', '22:22  ÇIKIŞ  bisikletli, aynı kıyafet, {{f-cyclist-out|çanta artık gözle görülür biçimde ağır}}'),
      L(
        '23:02  IN   grey Volvo V60         HS-CK 1190 {{f-volvo-in|(reg. Kessler Strings; driver C. Kessler per insurance)}}',
        '23:02  GİRİŞ  gri Volvo V60         HS-CK 1190 {{f-volvo-in|(ruhsat: Kessler Strings; sigortaya göre sürücü C. Kessler)}}',
      ),
      L('23:41  OUT  grey Volvo V60         {{f-volvo-out|HS-CK 1190}}', '23:41  ÇIKIŞ  gri Volvo V60         {{f-volvo-out|HS-CK 1190}}'),
      L(
        'No other vehicles. Pedestrians are captured only at the near kerb and are not reliably identifiable.',
        'Başka araç yok. Yayalar yalnızca yakın kaldırımda görüntüleniyor, güvenilir biçimde tanınamıyor.',
      ),
    ],
    timeline: [
      { time: '21:44', text: L('Miriam’s Jaguar enters the lane', 'Miriam’ın Jaguar’ı sokağa giriyor'), lane: 'miriam' },
      { time: '21:55', text: L('Cyclist enters the lane', 'Bisikletli sokağa giriyor'), lane: 'leo' },
      { time: '22:15', text: L('Miriam’s Jaguar leaves the lane', 'Miriam’ın Jaguar’ı sokaktan çıkıyor'), lane: 'miriam' },
      { time: '22:22', text: L('Cyclist leaves the lane', 'Bisikletli sokaktan çıkıyor'), lane: 'leo' },
      { time: '23:02', text: L('Clara’s Volvo enters the lane', 'Clara’nın Volvo’su sokağa giriyor'), lane: 'clara' },
      { time: '23:41', text: L('Clara’s Volvo leaves the lane', 'Clara’nın Volvo’su sokaktan çıkıyor'), lane: 'clara' },
    ],
  },
  {
    id: 'ev-copyreport', code: 'E-25', name: L('Expert report — the "Guadagnini" is a copy', 'Bilirkişi raporu — “Guadagnini” bir kopya'), kind: 'forensic', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Instrument examiner, Hallstedt Conservatory', 'Çalgı bilirkişisi, Hallstedt Konservatuvarı'), relatedPeople: ['jonas', 'miriam'],
    description: L('The violin in the vault is a skilled modern copy.', 'Kasadaki keman ustalıkla yapılmış modern bir kopya.'),
    body: [
      L(
        'UV examination: varnish fluoresces evenly; no layered historical varnish, no retouch history. Consistent with oil varnish {{f-copy-modern|applied within the last two years}} and artificially distressed.',
        'UV incelemesi: vernik düzgün ışıyor; katman katman tarihî vernik yok, rötuş geçmişi yok. Yapay olarak eskitilmiş, {{f-copy-modern|son iki yıl içinde sürülmüş}} yağlı vernikle uyumlu.',
      ),
      L('Dendrochronology of the top: youngest ring 1983.', 'Kapak tablasının dendrokronolojisi: en genç yıllık halka 1983.'),
      L('Inspection mirror, lower block: maker’s {{f-copy-jf|brand "JF" in a circle}}.', 'İnceleme aynası, alt takoz: {{f-copy-jf|daire içinde “JF” yapımcı damgası}}.'),
      L('Conclusion: not the instrument described in the consignment agreement. {{f-is-copy|A high-quality copy}}.', 'Sonuç: konsinye sözleşmesinde tarif edilen çalgı değildir. {{f-is-copy|Yüksek kaliteli bir kopyadır}}.'),
    ],
  },
  {
    id: 'ev-geneva', code: 'E-26', name: L('Financial record — Halberd sale', 'Mali kayıt — Halberd satışı'), kind: 'financial', role: 'decisive', reliability: 'confirmed',
    foundAt: L('Financial investigation unit', 'Mali suçlar birimi'), relatedPeople: ['clara'],
    description: L('Where the original went.', 'Asıl kemanın gittiği yer.'),
    body: [
      L(
        '03/09  CREDIT €1,100,000.00 to {{f-halberd-paid|CK Atelier Consulting GmbH (sole director: Clara Kessler)}}, from Halberd Fine Instruments SA, Geneva.',
        '03/09  ALACAK 1.100.000,00 € → {{f-halberd-paid|CK Atelier Consulting GmbH (tek müdür: Clara Kessler)}}; gönderen Halberd Fine Instruments SA, Cenevre.',
      ),
      L(
        'Halberd invoice ref. H-2291: "{{f-halberd-bought|Violin, G.B. Guadagnini, Turin 1772, with certificate.}}"',
        'Halberd faturası, no. H-2291: “{{f-halberd-bought|Keman, G.B. Guadagnini, Torino 1772, sertifikalı.}}”',
      ),
      L(
        '04/09  DEBIT €903,410.00 from CK Atelier Consulting GmbH to Nordbank — {{f-loan-repaid|settlement of Kessler Strings loan 77-41}}.',
        '04/09  BORÇ 903.410,00 € — CK Atelier Consulting GmbH’den Nordbank’a: {{f-loan-repaid|Kessler Strings’in 77-41 sayılı kredisinin kapatılması}}.',
      ),
      L(
        'Clara Kessler holds signing authority for Kessler Strings. Thomas Kessler is not connected to CK Atelier Consulting GmbH.',
        'Kessler Strings adına imza yetkilisi Clara Kessler. Thomas Kessler’in CK Atelier Consulting GmbH ile hiçbir bağı yok.',
      ),
    ],
  },
  {
    id: 'ev-anchor-claim', code: 'E-27', name: L('Jonas Feld’s alibi — The Anchor', 'Jonas Feld’in alibisi — The Anchor'), kind: 'testimony', role: 'supporting', reliability: 'unverified',
    foundAt: L('Interview with Jonas Feld', 'Jonas Feld ile görüşme'), relatedPeople: ['jonas', 'p-okafor'],
    description: L(
      'Jonas says he was at The Anchor on Kanalgade from about 22:30 until closing at 00:30, and that the bartender, Ruben, will confirm it. Can be verified.',
      'Jonas 22:30 sularından kapanış saati 00:30’a kadar Kanalgade’deki The Anchor’da olduğunu, barmen Ruben’in bunu doğrulayacağını söylüyor. Doğrulanabilir.',
    ),
  },
  {
    id: 'ev-anchor', code: 'E-28', name: L('Alibi verified — The Anchor', 'Alibi doğrulandı — The Anchor'), kind: 'testimony', role: 'supporting', reliability: 'confirmed',
    foundAt: L('Card records & statement of Ruben Okafor', 'Kart kayıtları ve Ruben Okafor’un ifadesi'), relatedPeople: ['jonas', 'p-okafor'],
    description: L('Jonas Feld was at The Anchor through the time of death.', 'Jonas Feld ölüm saati boyunca The Anchor’daydı.'),
    body: [
      L('Card payment, Jonas Feld: {{f-anchor-2312|The Anchor, 23:12, €14.50}}. Second payment 00:21, €9.00.', 'Kartla ödeme, Jonas Feld: {{f-anchor-2312|The Anchor, 23:12, 14,50 €}}. İkinci ödeme 00:21, 9,00 €.'),
      L(
        'Ruben Okafor: "Jonas came in about half ten, sat at the end of the bar like always. {{?f-ruben-call|Went outside to take a call, quarter to eleven maybe, came back in white as a sheet}}. Didn’t leave till I put the chairs up."',
        'Ruben Okafor: “Jonas on buçuk gibi geldi, her zamanki gibi barın ucuna oturdu. {{?f-ruben-call|On bire çeyrek vardı herhalde, telefonla konuşmaya dışarı çıktı, kireç gibi bir suratla geri geldi}}. Ben sandalyeleri masalara kaldırana kadar da kalkmadı.”',
      ),
      L('{{f-anchor-distance|The Anchor is a 25-minute walk from Brenner Lane}}.', '{{f-anchor-distance|The Anchor ile Brenner Sokağı arası yürüyerek 25 dakika}}.'),
    ],
    timeline: [
      { time: '22:30', text: L('Jonas arrives at The Anchor (Okafor)', 'Jonas The Anchor’a geliyor (Okafor)'), lane: 'jonas' },
      { time: '23:12', text: L('Jonas card payment at The Anchor', 'Jonas The Anchor’da kartla ödüyor'), lane: 'jonas' },
      { time: '00:21', text: L('Jonas card payment at The Anchor', 'Jonas The Anchor’da kartla ödüyor'), lane: 'jonas' },
    ],
  },
  {
    id: 'ev-pawn', code: 'E-29', name: L('Pawn registry — Sartory bow', 'Rehin kaydı — Sartory yay'), kind: 'document', role: 'misleading', reliability: 'confirmed',
    foundAt: L('Police pawn registry', 'Emniyet rehin kayıtları'), relatedPeople: ['leo'],
    description: L('The missing bow, found.', 'Kayıp yay bulundu.'),
    body: [
      L(
        '14/03 09:10 — Kaiser Pfand, Hafenstraße. Item: violin bow, stamped "E. SARTORY A PARIS". {{f-pawn-leo|Pledged by: Leo Brandt (ID checked)}}. Loan: €2,200.',
        '14/03 09:10 — Kaiser Pfand, Hafenstraße. Eşya: keman yayı, damgası “E. SARTORY A PARIS”. {{f-pawn-leo|Rehin bırakan: Leo Brandt (kimlik kontrol edildi)}}. Verilen tutar: 2.200 €.',
      ),
    ],
    timeline: [{ time: '09:10 (14/03)', text: L('Leo pawns the Sartory bow', 'Leo, Sartory yayı rehine bırakıyor'), lane: 'leo' }],
  },
  {
    id: 'ev-workbook', code: 'E-30', name: L('Jonas Feld’s workbook', 'Jonas Feld’in iş defteri'), kind: 'document', role: 'supporting', reliability: 'reliable',
    foundAt: L('Handed over by Jonas Feld', 'Jonas Feld teslim etti'), relatedPeople: ['jonas', 'clara'],
    description: L('Jonas’s bench diary of commissions.', 'Jonas’ın tezgâhta tuttuğu sipariş defteri.'),
    body: [
      L('14/05 — Study copy, G.B.G. 1772 pattern. {{f-workbook-ck|For C.K. (display/insurance)}}. €8,000 agreed.', '14/05 — Çalışma kopyası, G.B.G. 1772 modeli. {{f-workbook-ck|C.K. için (sergi/sigorta)}}. 8.000 € anlaşıldı.'),
      L('12/07 — Delivered to C.K. Paid in full (cash). Brand in lower block as usual.', '12/07 — C.K.’ye teslim edildi. Tamamı ödendi (nakit). Damga her zamanki gibi alt takozda.'),
    ],
  },

  // ── wave 4: side leads. Each records something that happened in the truth above; none adds an event.
  {
    id: 'ev-lightbook', code: 'E-31', name: L('Ilse Varga’s lamp list', 'Ilse Varga’nın lamba listesi'), kind: 'document', role: 'supporting', reliability: 'reliable', locationId: 'loc-varga',
    foundAt: L('Kitchen windowsill, Varga flat', 'Varga’nın dairesi, mutfak pencere pervazı'), relatedPeople: ['p-varga'],
    description: L(
      'Since January the landlord’s new courtyard lamp has kept Mrs Varga awake. She writes down every time it comes on, to send him the list.',
      'Ocak’tan beri ev sahibinin taktırdığı yeni avlu lambası Bayan Varga’yı uyutmuyor. Her yanışını not ediyor; listeyi ev sahibine gönderecek.',
    ),
    body: [
      L('13/3 — 18:12 on (Jonas, going home). 18:26 on (the boy with the bicycle).', '13/3 — 18:12 yandı (Jonas, eve gidiyor). 18:26 yandı (bisikletli oğlan).'),
      L('21:56 on — bicycle again! 22:20 on — the bicycle, going.', '21:56 yandı — yine bisiklet! 22:20 yandı — bisiklet, gidiyor.'),
      L('{{f-light-2303|23:03 on — a woman, pale coat, in a hurry}}.', '{{f-light-2303|23:03 yandı — bir kadın, açık renk palto, aceleyle}}.'),
      L('{{f-light-2339|23:39 on — same woman, coming out. Slowly. No hurry now.}}', '{{f-light-2339|23:39 yandı — aynı kadın, çıkıyor. Ağır ağır. Acelesi kalmamış.}}'),
      L('That makes six times in one evening. Six!', 'Bir akşamda altı kere. Altı!'),
    ],
    timeline: [
      { time: '23:03', text: L('Courtyard lamp: a woman in a pale coat goes in (Varga)', 'Avlu lambası: açık renk paltolu bir kadın giriyor (Varga)'), lane: 'scene' },
      { time: '23:39', text: L('Courtyard lamp: the same woman comes out (Varga)', 'Avlu lambası: aynı kadın çıkıyor (Varga)'), lane: 'scene' },
    ],
  },
  {
    id: 'ev-lawyerletter', code: 'E-32', name: L('Letter — Miriam Achterberg’s lawyer', 'Mektup — Miriam Achterberg’in avukatı'), kind: 'document', role: 'misleading', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Letter tray, front office (opened)', 'Ön ofis, mektup sepeti (açılmış)'), relatedPeople: ['miriam'],
    description: L(
      'Dated 10 March, from Achterberg’s lawyers to Thomas Kessler, about the withdrawal of the Guadagnini.',
      'Achterberg’in avukatlarından Thomas Kessler’e, 10 Mart tarihli; Guadagnini’nin geri çekilmesi hakkında.',
    ),
    body: [
      L(
        '“…we would remind you of clause 9 of the agreement: {{f-clause-death|should the consignee die or cease to trade, the instrument is to be returned to the consignor within seven days}}.”',
        '“…sözleşmenin 9. maddesini hatırlatırız: {{f-clause-death|emanet alan ölür ya da faaliyetini durdurursa çalgı yedi gün içinde emanet edene iade edilir}}.”',
      ),
      L(
        '“Our client’s purchaser, {{f-brandl|Galerie Brandl of Vienna, will not wait beyond 31 March}}. We trust you will not oblige us to go to court.”',
        '“Müvekkilimizin alıcısı {{f-brandl|Viyana’daki Galerie Brandl, 31 Mart’tan sonrasını beklemeyecektir}}. Bizi mahkemeye gitmek zorunda bırakmayacağınıza güveniyoruz.”',
      ),
    ],
  },
  {
    id: 'ev-brandl', code: 'E-33', name: L('Galerie Brandl, Vienna — reply', 'Galerie Brandl, Viyana — cevap'), kind: 'document', role: 'supporting', reliability: 'reliable',
    foundAt: L('Answered to the Hallstedt police', 'Hallstedt emniyetine verilen cevap'), relatedPeople: ['miriam'],
    description: L(
      'The Vienna dealer explains why the sale was stalling on his side too.',
      'Viyanalı satıcı, satışın kendi tarafında da neden ilerlemediğini anlatıyor.',
    ),
    body: [
      L(
        '“We asked Mme Achterberg for a fresh certificate because {{f-halberd-listed|a Turin Guadagnini of 1772 has been offered in the Geneva catalogue of Halberd Fine Instruments since October}}.”',
        '“Bayan Achterberg’den yeni bir sertifika istedik; çünkü {{f-halberd-listed|Ekim’den beri Cenevre’deki Halberd Fine Instruments’ın kataloğunda 1772 Torino yapımı bir Guadagnini satışta}}.”',
      ),
      L('“Two such instruments are not impossible. We merely wished to know which one we were buying.”', '“Böyle iki çalgının bulunması imkânsız değil. Yalnızca hangisini aldığımızı bilmek istedik.”'),
    ],
  },
  {
    id: 'ev-volvo', code: 'E-34', name: L('Clara Kessler’s Volvo — swabs', 'Clara Kessler’in Volvo’su — svaplar'), kind: 'forensic', role: 'supporting', reliability: 'confirmed',
    foundAt: L('Seized outside her flat in Vesterlund', 'Vesterlund’daki dairesinin önünde el konuldu'), relatedPeople: ['clara'],
    description: L(
      'Swabs from the steering wheel and the driver’s door of the car Clara drove to the workshop and back.',
      'Clara’nın atölyeye gidip döndüğü arabanın direksiyonundan ve sürücü kapısından alınan svaplar.',
    ),
  },
];

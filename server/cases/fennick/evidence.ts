// SERVER-ONLY. Ash and Glaze — evidence (documents carry {{fact|phrase}} marks), lab work, recorded statements,
// contradictions, the v1 answer key and the desk sergeant's hints.
import type { CaseDefinition } from '../../engine/types.ts';
import { L } from '../text.ts';

export const evidence: CaseDefinition['evidence'] = [
  // ── held from the start
  {
    id: 'ev-ruth', code: 'F-01', name: L('Statement: Ruth Ekdal, night baker', 'İfade: Ruth Ekdal, gece fırıncısı'), kind: 'testimony', role: 'supporting', reliability: 'reliable',
    foundAt: L('Taken at the bakery, 03:20', 'Fırında alındı, 03:20'), relatedPeople: ['p-ruth', 'oskar'],
    description: L('What the baker across the yard heard and saw.', 'Avlunun karşısındaki fırıncının duyduğu ve gördüğü.'),
    body: [
      L('I open the bakery at ten to one. When I came through the gate the studio was dark and the yard was empty.', 'Fırını biri on kala açarım. Kapıdan girdiğimde atölyenin ışıkları sönüktü, avlu bomboştu.'),
      L(
        '{{f-buzz-0136|At 01:36 the gate keypad beeped}} — it’s loud, I looked at the oven clock. I thought it was one of the Vos lot; they come and go at all hours.',
        '{{f-buzz-0136|01:36’da kapının tuş takımı öttü}} — sesi yüksektir, fırının saatine baktım. Vos’lardan biridir dedim; onlar her saatte gelip gider.',
      ),
      L(
        'At about a quarter to two {{f-coat-figure|a man in a long dark coat crossed the yard to the gate, not hurrying}}. Under the lamp I saw good shoes, not work boots. I didn’t see his face.',
        'İkiye çeyrek kala gibi {{f-coat-figure|uzun, koyu renk paltolu bir adam acele etmeden avluyu geçip kapıya yürüdü}}. Lambanın altında ayakkabılarını gördüm; iş botu değil, iyi ayakkabı. Yüzünü görmedim.',
      ),
      L('Five minutes later I smelled smoke. I rang 112 at two minutes to two.', 'Beş dakika sonra duman kokusu aldım. İkiye iki kala 112’yi aradım.'),
      L(
        '{{?f-codes-reset|Mr Dahl changes all our gate codes on the first of September and hands each of us a slip}} — for the insurance, he says.',
        '{{?f-codes-reset|Dahl Bey her eylülün birinde bütün kapı şifrelerimizi değiştirir, her birimize bir kâğıt verir}} — sigorta için diyor.',
      ),
      L(
        'The yard lanterns burn lamp oil; {{?f-shed-landlord|it’s kept in Mr Dahl’s shed by the gate, and only he has the key}}. We’ve asked for one for years.',
        'Avludaki fenerler gaz yağıyla yanar; {{?f-shed-landlord|yağ kapının yanındaki Dahl Bey’in kulübesinde durur, anahtarı da yalnızca ondadır}}. Yıllardır bir anahtar istiyoruz.',
      ),
    ],
  },
  {
    id: 'ev-agnes', code: 'F-02', name: L('Statement: Agnes Vos', 'İfade: Agnes Vos'), kind: 'testimony', role: 'supporting', reliability: 'reliable',
    foundAt: L('Taken at her flat in Vesterlund, 04:10', 'Vesterlund’daki evinde alındı, 04:10'), relatedPeople: ['p-agnes', 'selma', 'bram', 'oskar'],
    description: L('The owner, woken at three, on her studio and the people in it.', 'Saat üçte uyandırılan atölye sahibi; atölyesini ve oradaki insanları anlatıyor.'),
    body: [
      L(
        'I locked up with Selma at {{f-agnes-1830|half past six}}. The kiln was cold and empty; I was going to load the last glaze firing on Monday.',
        'Selma’yla birlikte {{f-agnes-1830|altı buçukta}} kapattık. Fırın soğuk ve boştu; son sır pişirimini pazartesi dolduracaktım.',
      ),
      L(
        'The old oil heater lives in the corner by the sink, unplugged. {{f-heater-banned|I banned it from the drying room two winters ago}} — straw and paper everywhere.',
        'Eski yağlı radyatör lavabonun yanındaki köşede durur, fişi çekili. {{f-heater-banned|İki kış önce kurutma odasına sokmayı yasakladım}} — her yer saman, kâğıt.',
      ),
      L(
        '{{f-tide-lines|Forty pieces for the Kunsthalle were drying on the racks, packed on straw}}. Eleven months of work.',
        '{{f-tide-lines|Kunsthalle için kırk parça rafların üstünde, saman üzerinde kuruyordu}}. On bir aylık emek.',
      ),
      L(
        'Oskar has wanted me out for a year. {{?f-oskar-offer|In April he offered me forty thousand euros to give up the lease}}. I laughed in his face.',
        'Oskar bir yıldır beni buradan çıkarmak istiyor. {{?f-oskar-offer|Nisanda kiradan çıkmam için kırk bin avro teklif etti}}. Yüzüne güldüm.',
      ),
      L(
        '{{?f-bram-cover|Bram raised the insurance in August because I told him to}} — the Kunsthalle wanted the pieces covered.',
        '{{?f-bram-cover|Bram ağustosta sigortayı benim isteğimle yükseltti}} — Kunsthalle parçaların sigortalı olmasını istiyordu.',
      ),
    ],
  },
  {
    id: 'ev-firereport', code: 'F-03', name: L('Fire service note', 'İtfaiye notu'), kind: 'document', role: 'supporting', reliability: 'confirmed',
    foundAt: L('Hallstedt Fire & Rescue, Station 2', 'Hallstedt İtfaiyesi, 2. İstasyon'), relatedPeople: ['p-holm'],
    description: L('The crew’s first note, with the investigator’s line at the bottom.', 'Ekibin ilk notu; altında uzmanın satırı.'),
    body: [
      L('Call 01:58. First appliance on scene 02:07; fire out 02:40. Seat of fire: drying room / glaze room, Unit 4.', 'İhbar 01:58. İlk araç olay yerinde 02:07; yangın 02:40’ta söndürüldü. Yangın yeri: 4 numara, kurutma odası / sır odası.'),
      L('Large electric kiln hot to the touch on arrival. {{f-kiln-theory|Working theory: kiln fault}}.', 'Büyük elektrikli fırın varışta sıcaktı. {{f-kiln-theory|Çalışma teorisi: fırın arızası}}.'),
      L('{{f-alarm-silent|The smoke alarm sent nothing to the monitoring company}}.', '{{f-alarm-silent|Duman alarmı izleme şirketine hiçbir sinyal göndermedi}}.'),
      L('Investigator’s note: I will not sign off a kiln fault until I have read the burn pattern in daylight. — I. Holm', 'Uzman notu: Yanık izlerini gün ışığında okumadan fırın arızası diye imza atmam. — I. Holm'),
    ],
  },
  {
    id: 'ev-camreq', code: 'F-04', name: L('Ostkai camera — data request', 'Ostkai kamerası — kayıt talebi'), kind: 'document', role: 'supporting', reliability: 'confirmed',
    foundAt: L('Desk sergeant’s tray', 'Nöbetçi komiserin evrak sepeti'), relatedPeople: [],
    description: L(
      'A request to the traffic authority for Friday night’s pictures from the Ostkai junction. Unsigned: they release data only for a criminal inquiry.',
      'Trafik müdürlüğüne, Ostkai kavşağının cuma gecesi görüntüleri için bir talep formu. İmzasız: kayıtları yalnızca bir suç soruşturması için veriyorlar.',
    ),
  },

  // ── the studio
  {
    id: 'ev-burnpattern', code: 'F-05', name: L('Burn pattern behind the racks', 'Rafların arkasındaki yanık izi'), kind: 'photo', role: 'supporting', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('Drying racks', 'Kurutma rafları'), relatedPeople: [],
    description: L('Soot climbing the wall in a sharp V whose point is at floor level, under the middle rack.', 'Duvarda keskin bir V çizerek yükselen is; V’nin ucu yerde, ortadaki rafın altında.'),
  },
  {
    id: 'ev-debris', code: 'F-06', name: L('Debris sample from under the racks', 'Rafların altından enkaz örneği'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('Drying racks', 'Kurutma rafları'), relatedPeople: [],
    description: L('Ash and charred straw from the point of the V, sealed in a can for the lab.', 'V’nin ucundan alınmış kül ve kömürleşmiş saman; laboratuvar için bir kutuya mühürlendi.'),
  },
  {
    id: 'ev-kilnpots', code: 'F-07', name: L('Six vessels in the kiln', 'Fırındaki altı kap'), kind: 'physical', role: 'misleading', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('The big kiln', 'Büyük fırın'), relatedPeople: ['selma'],
    description: L('Small stoneware vessels in a celadon glaze, each stamped S.A. on the foot. Not on Agnes’s exhibition list.', 'Seladon sırlı küçük taş kaplar; her birinin dibinde S.A. damgası. Agnes’in sergi listesinde yoklar.'),
  },
  {
    id: 'ev-heater', code: 'F-08', name: L('The space heater', 'Isıtıcı'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('Against the drying racks', 'Kurutma raflarının dibinde'), relatedPeople: [],
    description: L('An old oil-filled heater, scorched on the rack side, its dial at the highest setting.', 'Eski bir yağlı radyatör; raflara bakan yanı kavrulmuş, düğmesi en yüksekte.'),
  },
  {
    id: 'ev-notice', code: 'F-09', name: L('Notice to tenants', 'Kiracılara duyuru'), kind: 'document', role: 'decisive', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('Taped inside the back door', 'Arka kapının içine yapıştırılmış'), relatedPeople: ['oskar'],
    description: L('A typed notice from the landlord.', 'Ev sahibinden daktiloyla yazılmış bir duyuru.'),
    body: [
      L('FENNICK YARD — NOTICE TO TENANTS', 'FENNICK AVLUSU — KİRACILARA DUYURU'),
      L(
        '{{f-inspection|Landlord’s annual safety inspection: Friday 3 October, 15:00–16:00 — smoke alarms, extinguishers, wiring}}.',
        '{{f-inspection|Ev sahibinin yıllık güvenlik denetimi: 3 Ekim Cuma, 15:00–16:00 — duman alarmları, yangın söndürücüler, elektrik tesisatı}}.',
      ),
      L('Access by the landlord’s master key. — O. Dahl', 'Giriş, ev sahibinin ana anahtarıyla yapılacaktır. — O. Dahl'),
    ],
  },
  {
    id: 'ev-alarmlift', code: 'F-10', name: L('Print lift: smoke-alarm cover', 'İz kaldırma: duman alarmı kapağı'), kind: 'forensic', role: 'supporting', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('Smoke alarm, above the glaze bench', 'Duman alarmı, sır tezgâhının üstünde'), relatedPeople: [],
    description: L('One clear set of large prints lifted from the alarm cover’s clip.', 'Alarm kapağının mandalından kaldırılmış, tek ve net bir set iri parmak izi.'),
  },
  {
    id: 'ev-shoeprint', code: 'F-11', name: L('Print lift: shoe in the slip', 'İz kaldırma: çamurdaki ayakkabı'), kind: 'forensic', role: 'supporting', reliability: 'confirmed', locationId: 'loc-studio',
    foundAt: L('Dried slip inside the back door', 'Arka kapının içindeki kurumuş çamur'), relatedPeople: [],
    description: L('A smooth leather sole, about size 44, with a ring of nails in the heel.', 'Düz bir deri taban, aşağı yukarı 44 numara; topuğunda halka hâlinde çiviler.'),
  },

  // ── the yard
  {
    id: 'ev-gatelog', code: 'F-12', name: L('Gate controller printout', 'Kapı kumandası dökümü'), kind: 'document', role: 'decisive', reliability: 'confirmed', locationId: 'loc-yard',
    foundAt: L('Gate keypad', 'Kapı tuş takımı'), relatedPeople: ['selma', 'bram'],
    description: L('Every opening of the gate on Friday night. Codes are per unit, not per person.', 'Cuma gecesi kapının her açılışı. Şifreler kişiye değil, birime ait.'),
    body: [
      L('{{f-gate-2115|21:15  UNIT 4 — OPEN}}', '{{f-gate-2115|21:15  BİRİM 4 — AÇILDI}}'),
      L('{{f-gate-2318|23:18  UNIT 4 — OPEN (vehicle)}}', '{{f-gate-2318|23:18  BİRİM 4 — AÇILDI (araç)}}'),
      L('{{f-gate-2351|23:51  EXIT (vehicle)}}', '{{f-gate-2351|23:51  ÇIKIŞ (araç)}}'),
      L('{{f-gate-0040|00:40  EXIT (on foot)}}', '{{f-gate-0040|00:40  ÇIKIŞ (yaya)}}'),
      L('00:50  UNIT 1 — OPEN', '00:50  BİRİM 1 — AÇILDI'),
      L('{{f-gate-0136|01:36  UNIT 4 — OPEN}}', '{{f-gate-0136|01:36  BİRİM 4 — AÇILDI}}'),
      L('{{f-gate-0144|01:44  EXIT (on foot)}}', '{{f-gate-0144|01:44  ÇIKIŞ (yaya)}}'),
      L('02:09  EMERGENCY OVERRIDE', '02:09  ACİL DURUM AÇMASI'),
    ],
  },
  {
    id: 'ev-battery', code: 'F-13', name: L('A 9-volt battery', '9 voltluk bir pil'), kind: 'physical', role: 'decisive', reliability: 'confirmed', locationId: 'loc-yard',
    foundAt: L('The landlord’s shed', 'Ev sahibinin kulübesi'), relatedPeople: ['oskar', 'p-agnes'],
    description: L('A smoke-alarm battery with a strip of tape on it: “SMOKE ALARM — June”, in Agnes’s hand.', 'Üstüne bant yapıştırılmış bir duman alarmı pili: “DUMAN ALARMI — Haziran”, Agnes’in el yazısıyla.'),
  },
  {
    id: 'ev-cap', code: 'F-14', name: L('Melted bottle cap', 'Erimiş şişe kapağı'), kind: 'physical', role: 'decisive', reliability: 'confirmed', locationId: 'loc-yard',
    foundAt: L('Gutter outside Unit 4', '4 numaranın önündeki oluk'), relatedPeople: [],
    description: L('The red cap of a one-litre lamp-oil bottle, half melted.', 'Bir litrelik bir gaz yağı şişesinin yarı erimiş kırmızı kapağı.'),
  },
  {
    id: 'ev-matchbook', code: 'F-15', name: L('Soaked matchbook', 'Islanmış kibrit kutusu'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-yard',
    foundAt: L('Gutter outside Unit 4', '4 numaranın önündeki oluk'), relatedPeople: [],
    description: L('A paper matchbook with an anchor on the cover; three matches torn out.', 'Kapağında çapa olan kâğıt bir kibrit kutusu; üç çöpü koparılmış.'),
  },

  // ── the yard office
  {
    id: 'ev-dvr', code: 'F-16', name: L('Yard camera recorder', 'Avlu kamerası kayıt cihazı'), kind: 'digital', role: 'supporting', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Yard office', 'Avlu ofisi'), relatedPeople: ['oskar'],
    description: L('The only recorder for the yard camera. Dahl handed it over himself: “The disk fills up; it stops all the time.”', 'Avlu kamerasının tek kayıt cihazı. Dahl kendi eliyle teslim etti: “Disk doluyor, sürekli duruyor.”'),
  },
  {
    id: 'ev-contract', code: 'F-17', name: L('Norrhavn sale agreement', 'Norrhavn satış sözleşmesi'), kind: 'document', role: 'decisive', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Desk drawer, yard office', 'Avlu ofisi, masa çekmecesi'), relatedPeople: ['oskar', 'p-nyberg'],
    description: L('A conditional sale of the whole yard, signed on 12 September.', 'Bütün avlunun şartlı satışı; 12 Eylül’de imzalanmış.'),
    body: [
      L('Conditional sale of Fennick Yard (Units 0–5) to Norrhavn Living AB.', 'Fennick Avlusu’nun (0–5 numaralı birimler) Norrhavn Living AB’ye şartlı satışı.'),
      L(
        '{{f-norrhavn|Price €4,200,000, payable only on vacant possession of every unit by 31 December; otherwise the agreement lapses}}.',
        '{{f-norrhavn|Bedel 4.200.000 avro; yalnızca bütün birimler 31 Aralık’a kadar boş teslim edilirse ödenir, aksi hâlde sözleşme düşer}}.',
      ),
      L('Signed: O. Dahl, K. Nyberg. 12 September.', 'İmza: O. Dahl, K. Nyberg. 12 Eylül.'),
    ],
  },
  {
    id: 'ev-codelist', code: 'F-18', name: L('Gate codes (landlord’s copy)', 'Kapı şifreleri (ev sahibinin kopyası)'), kind: 'document', role: 'supporting', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Desk drawer, yard office', 'Avlu ofisi, masa çekmecesi'), relatedPeople: ['oskar'],
    description: L('A handwritten list, clipped behind the sale agreement.', 'Satış sözleşmesinin arkasına iliştirilmiş el yazısı bir liste.'),
    body: [
      L('1 September — new gate codes (copy)', '1 Eylül — yeni kapı şifreleri (kopya)'),
      L('UNIT 1 Ekdal — 2093 · UNIT 2 Brink — 6610 · UNIT 3 Moberg — 1185', 'BİRİM 1 Ekdal — 2093 · BİRİM 2 Brink — 6610 · BİRİM 3 Moberg — 1185'),
      L('{{f-codes-list|UNIT 4 Vos — 4417}}', '{{f-codes-list|BİRİM 4 Vos — 4417}}'),
      L('UNIT 5 — vacant since July', 'BİRİM 5 — temmuzdan beri boş'),
    ],
  },
  {
    id: 'ev-lease', code: 'F-19', name: L('Lease of Unit 4', '4 numaranın kira sözleşmesi'), kind: 'document', role: 'supporting', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Lease files, yard office', 'Avlu ofisi, kira dosyaları'), relatedPeople: ['oskar', 'p-agnes'],
    description: L('Agnes Vos’s lease, the landlord’s copy.', 'Agnes Vos’un kira sözleşmesi, ev sahibinin nüshası.'),
    body: [
      L('Lease of Unit 4, Fennick Yard, to Agnes Vos. Term: to 30 June 2033.', 'Fennick Avlusu 4 numaranın Agnes Vos’a kiralanması. Süre: 30 Haziran 2033’e kadar.'),
      L(
        '{{f-clause14|14.2  If the premises are destroyed or made unfit for use by fire, the Landlord may end this lease on thirty days’ notice}}.',
        '{{f-clause14|14.2  Mülk yangın sonucu yok olur ya da kullanılamaz hâle gelirse Kiraya Veren bu sözleşmeyi otuz gün önceden bildirerek feshedebilir}}.',
      ),
      L('{{?f-margin|In the margin, in pencil: “14.2”, underlined twice}}.', '{{?f-margin|Kenarda kurşun kalemle “14.2”, altı iki kez çizilmiş}}.'),
    ],
  },
  {
    id: 'ev-dvrlog', code: 'F-20', name: L('Recorder event log', 'Kayıt cihazı olay kaydı'), kind: 'digital', role: 'decisive', reliability: 'confirmed', locationId: 'loc-office',
    foundAt: L('Digital lab', 'Dijital laboratuvar'), relatedPeople: ['oskar'],
    description: L('What the yard recorder wrote about itself on Friday night.', 'Avlu kayıt cihazının cuma gecesi kendisi hakkında tuttuğu kayıt.'),
    body: [
      L('20:00:00  recording (continuous)', '20:00:00  kayıt (sürekli)'),
      L('{{f-dvr-paused|01:00:12  RECORDING PAUSED — user ‘odahl’, mobile app}}', '{{f-dvr-paused|01:00:12  KAYIT DURAKLATILDI — kullanıcı ‘odahl’, mobil uygulama}}'),
      L('02:31:40  RECORDING RESUMED — user ‘odahl’, mobile app', '02:31:40  KAYIT SÜRDÜRÜLDÜ — kullanıcı ‘odahl’, mobil uygulama'),
      L('{{?f-disk-free|Disk: 38% used}}', '{{?f-disk-free|Disk: %38 dolu}}'),
    ],
  },

  // ── the Harbour Club
  {
    id: 'ev-cloakbook', code: 'F-21', name: L('Cloakroom book', 'Vestiyer defteri'), kind: 'document', role: 'supporting', reliability: 'confirmed', locationId: 'loc-club',
    foundAt: L('Cloakroom, the Harbour Club', 'Harbour Club, vestiyer'), relatedPeople: ['oskar', 'p-nyberg'],
    description: L('Who left a coat, and when they took it back.', 'Kimin palto bıraktığı ve ne zaman geri aldığı.'),
    body: [
      L('Shipowners’ Society autumn dinner — cloakroom', 'Armatörler Derneği güz yemeği — vestiyer'),
      L('No. 17  K. Nyberg — out 00:15', '17 no.  K. Nyberg — çıkış 00:15'),
      L('{{f-coat-0108|No. 31  O. Dahl — dark overcoat — out 01:08}}', '{{f-coat-0108|31 no.  O. Dahl — koyu palto — çıkış 01:08}}'),
      L('No. 32  Mr & Mrs Lindgren — out 00:40', '32 no.  Lindgren çifti — çıkış 00:40'),
    ],
  },
  {
    id: 'ev-taxibook', code: 'F-22', name: L('Doorman’s taxi book', 'Kapı görevlisinin taksi defteri'), kind: 'document', role: 'supporting', reliability: 'confirmed', locationId: 'loc-club',
    foundAt: L('Doorman’s lectern, the Harbour Club', 'Harbour Club, kapı görevlisinin kürsüsü'), relatedPeople: ['p-teo'],
    description: L('Every car the door called last night.', 'Kapının dün gece çağırdığı bütün araçlar.'),
    body: [
      L('00:15  Nyberg — car to Strandvej', '00:15  Nyberg — Strandvej’e araç'),
      L('00:40  Lindgren ×2 — car to Vesterlund', '00:40  Lindgren ×2 — Vesterlund’a araç'),
      L('{{f-no-taxi|End of shift 01:30. Cars called after 00:40: none}}. — T.V.', '{{f-no-taxi|Vardiya sonu 01:30. 00:40’tan sonra çağrılan araç: yok}}. — T.V.'),
    ],
  },
  {
    id: 'ev-teo', code: 'F-23', name: L('Statement: Teo Varela, doorman', 'İfade: Teo Varela, kapı görevlisi'), kind: 'testimony', role: 'supporting', reliability: 'reliable',
    foundAt: L('Taken before his flight', 'Uçuşundan önce alındı'), relatedPeople: ['p-teo', 'oskar'],
    description: L('The Harbour Club’s doorman on the last guests of the night.', 'Harbour Club’ın kapı görevlisi, gecenin son misafirlerini anlatıyor.'),
    body: [
      L(
        '{{f-teo-foot|Mr Dahl came out at ten past one. I offered him a car; he said no, the air would do him good, and walked off towards the harbour}}.',
        '{{f-teo-foot|Dahl Bey biri on geçe çıktı. Araba çağırayım dedim; hayır, hava iyi gelir dedi ve limana doğru yürüyüp gitti}}.',
      ),
      L('He had been on his phone in the corridor by the cloakroom for a good while before that.', 'Ondan önce vestiyerin yanındaki koridorda epey bir süre telefonla uğraştı.'),
    ],
  },

  // ── lab and witnesses
  {
    id: 'ev-ostkai', code: 'F-24', name: L('Ostkai junction camera', 'Ostkai kavşak kamerası'), kind: 'footage', role: 'supporting', reliability: 'confirmed',
    foundAt: L('Traffic authority', 'Trafik müdürlüğü'), relatedPeople: ['bram', 'selma'],
    description: L('Everything that passed into or out of Fennick Lane between 23:00 and 02:10.', 'Fennick Sokağı’na 23:00 ile 02:10 arasında girip çıkan her şey.'),
    body: [
      L('{{f-van-in|23:16  white van, VOS CERAMICS on the side, into Fennick Lane}}', '{{f-van-in|23:16  yanında VOS SERAMİK yazan beyaz minibüs, Fennick Sokağı’na giriyor}}'),
      L('{{f-van-out|23:53  the same van, out towards the city}}', '{{f-van-out|23:53  aynı minibüs, şehre doğru çıkıyor}}'),
      L('{{f-bike-0044|00:44  a woman pushing a bicycle, out towards the city}}', '{{f-bike-0044|00:44  bisiklet iten bir kadın, şehre doğru çıkıyor}}'),
      L('{{f-walker-0131|01:31  a man on foot, long dark coat, into Fennick Lane}}', '{{f-walker-0131|01:31  yürüyen bir adam, uzun koyu palto, Fennick Sokağı’na giriyor}}'),
      L('{{f-walker-0149|01:49  the same man, walking fast, out towards Strandvej}}', '{{f-walker-0149|01:49  aynı adam, hızlı adımlarla, Strandvej’e doğru çıkıyor}}'),
      L('02:05  fire appliance, into Fennick Lane', '02:05  itfaiye aracı, Fennick Sokağı’na giriyor'),
    ],
  },
  {
    id: 'ev-kranzcard', code: 'F-25', name: L('Emil Kranz’s card', 'Emil Kranz’ın kartviziti'), kind: 'document', role: 'misleading', reliability: 'unverified',
    foundAt: L('From Bram Vos’s wallet', 'Bram Vos’un cüzdanından'), relatedPeople: ['bram', 'p-kranz'],
    description: L('Kranz Antiques, Ostkai 31. On the back, in pencil: “23 pcs”.', 'Kranz Antika, Ostkai 31. Arkasında kurşun kalemle: “23 parça”.'),
  },
  {
    id: 'ev-kranz', code: 'F-26', name: L('Statement: Emil Kranz, dealer', 'İfade: antikacı Emil Kranz'), kind: 'testimony', role: 'supporting', reliability: 'reliable',
    foundAt: L('Kranz Antiques, Ostkai 31', 'Kranz Antika, Ostkai 31'), relatedPeople: ['p-kranz', 'bram'],
    description: L('The dealer on his late visitor, with his own door camera to back it.', 'Antikacı, gece gelen misafirini anlatıyor; arkasında kendi kapı kamerası var.'),
    body: [
      L(
        '{{f-kranz|Bram Vos came to my back door at twenty past twelve with a crate of his mother’s seconds and stayed until five past two}} — we counted, we argued, we had a drink.',
        '{{f-kranz|Bram Vos gece yarısını yirmi geçe annesinin ıskarta işleriyle dolu bir kasayla arka kapıma geldi, ikiyi beş geçeye kadar kaldı}} — saydık, pazarlık ettik, bir kadeh içtik.',
      ),
      L('My door camera has him arriving and leaving. I paid him eleven hundred in cash.', 'Kapı kameram gelişini de gidişini de kaydetti. Ona bin yüz avro nakit verdim.'),
    ],
  },
  {
    id: 'ev-warning', code: 'F-32', name: L('Dahl’s letter about the heater', 'Dahl’ın ısıtıcı mektubu'), kind: 'document', role: 'supporting', reliability: 'confirmed',
    foundAt: L('From Dahl’s breast pocket', 'Dahl’ın göğüs cebinden'), relatedPeople: ['oskar', 'p-agnes'],
    description: L('A typed letter from the landlord to Agnes Vos, his copy.', 'Ev sahibinden Agnes Vos’a daktiloyla yazılmış bir mektup; onun nüshası.'),
    body: [
      L('Dear Agnes — I must warn you once more about the oil heater in your drying room. Should it cause a fire, you will understand that I cannot be responsible.', 'Sevgili Agnes — kurutma odandaki yağlı radyatör konusunda seni bir kez daha uyarmak zorundayım. Bir yangına sebep olursa, sorumluluğun bende olamayacağını anlayacaksın.'),
      L('Yours, Oskar — {{f-warning-letter|Thursday 2 October}}', 'Saygılarımla, Oskar — {{f-warning-letter|2 Ekim Perşembe}}'),
    ],
  },
  {
    id: 'ev-nyberg', code: 'F-31', name: L('Norrhavn: director’s file note', 'Norrhavn: direktörün dosya notu'), kind: 'document', role: 'supporting', reliability: 'reliable',
    foundAt: L('Norrhavn Living, through the prosecutor', 'Norrhavn Living, savcılık aracılığıyla'), relatedPeople: ['p-nyberg', 'oskar'],
    description: L('A note Karl Nyberg dictated on Saturday morning, before he heard about the fire.', 'Karl Nyberg’in cumartesi sabahı, yangını duymadan önce yazdırdığı bir not.'),
    body: [
      L('Dinner, Harbour Club, 3 Oct. Seated with O. Dahl.', 'Yemek, Harbour Club, 3 Ekim. O. Dahl’la aynı masada.'),
      L('{{f-nyberg-monday|Dahl says Unit 4 “won’t be a problem by Monday”}}. Did not ask what he meant.', '{{f-nyberg-monday|Dahl, 4 numaranın “pazartesiye sorun olmaktan çıkacağını” söylüyor}}. Ne demek istediğini sormadım.'),
    ],
  },
  {
    id: 'ev-salvage', code: 'F-27', name: L('Salvage order, Unit 4', 'Enkaz kaldırma talebi, 4 numara'), kind: 'document', role: 'supporting', reliability: 'confirmed',
    foundAt: L('The salvage crew’s foreman', 'Enkaz ekibinin ustabaşısı'), relatedPeople: ['oskar'],
    description: L('The salvage foreman’s job sheet for Unit 4.', 'Enkaz ekibi ustabaşısının 4 numara için iş emri.'),
    body: [
      L(
        '{{f-salvage-oskar|Booked by O. Dahl (landlord), Saturday 07:55: clear Unit 4 completely, all debris to landfill}}.',
        '{{f-salvage-oskar|Talep eden: O. Dahl (ev sahibi), cumartesi 07:55 — 4 numara tamamen boşaltılacak, bütün enkaz çöplüğe}}.',
      ),
      L('Start: Monday 16:00.', 'Başlangıç: pazartesi 16:00.'),
    ],
  },

  // ── Dahl’s house (warrant)
  {
    id: 'ev-coat', code: 'F-28', name: L('Dark overcoat', 'Koyu renk palto'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-house',
    foundAt: L('Hall stand, Dahl’s house', 'Dahl’ın evi, portmanto'), relatedPeople: ['oskar'],
    description: L('A long dark wool overcoat, brushed and hung up.', 'Uzun, koyu renk yün bir palto; fırçalanıp asılmış.'),
  },
  {
    id: 'ev-loan', code: 'F-29', name: L('Bridging loan reminder', 'Köprü kredisi ihtarı'), kind: 'financial', role: 'supporting', reliability: 'confirmed', locationId: 'loc-house',
    foundAt: L('Study desk, Dahl’s house', 'Dahl’ın evi, çalışma masası'), relatedPeople: ['oskar'],
    description: L('A bank’s second reminder, under a brass weight.', 'Bir bankanın ikinci ihtarı; pirinç bir ağırlığın altında.'),
    body: [
      L('Havbank — bridging loan secured on Fennick Yard', 'Havbank — Fennick Avlusu teminatlı köprü kredisi'),
      L(
        '{{f-bridging|Outstanding €1,900,000, final repayment due 31 December. In default the bank may enforce its security}}.',
        '{{f-bridging|Kalan borç 1.900.000 avro, son ödeme 31 Aralık. Ödenmezse banka teminatı paraya çevirebilir}}.',
      ),
      L('Second reminder, 26 September.', 'İkinci ihtar, 26 Eylül.'),
    ],
  },
  {
    id: 'ev-ashes', code: 'F-30', name: L('Ash from the garden incinerator', 'Bahçe yakma sobasından kül'), kind: 'physical', role: 'supporting', reliability: 'confirmed', locationId: 'loc-house',
    foundAt: L('Garden, Dahl’s house', 'Dahl’ın evi, bahçe'), relatedPeople: ['oskar'],
    description: L('Ash, leaves, and what is left of a leather heel.', 'Kül, yaprak ve deri bir topuktan geriye kalanlar.'),
  },
];

export const analyses: CaseDefinition['analyses'] = [
  {
    id: 'a-ostkai', evidenceId: 'ev-camreq', discipline: 'records', name: L('Ostkai junction camera (traffic authority)', 'Ostkai kavşak kamerası (trafik müdürlüğü)'),
    lockedReason: L(
      'The traffic authority releases camera data only for a criminal inquiry. Show that this fire was no accident.',
      'Trafik müdürlüğü kamera kayıtlarını yalnızca bir suç soruşturması için verir. Bu yangının kaza olmadığını göster.',
    ),
    result: [L('Six passages of Fennick Lane between 23:00 and 02:10.', 'Fennick Sokağı’ndan 23:00 ile 02:10 arasında altı geçiş.')],
    conclusion: L('Three people left the lane before the fire. One man walked in and out around it.', 'Üç kişi yangından önce sokaktan çıkmış. Bir adam da yangın sırasında yürüyerek girip çıkmış.'),
    reveals: ['ev-ostkai'],
    v2: { minutes: 240, locked: true },
  },
  {
    id: 'a-debris', evidenceId: 'ev-debris', discipline: 'trace', name: L('Fire debris (accelerant test)', 'Yangın enkazı (hızlandırıcı testi)'),
    result: [L('Gas chromatography of the ash under the middle rack: a medium petroleum distillate.', 'Orta raf altındaki külün gaz kromatografisi: orta ağırlıkta bir petrol damıtığı.')],
    conclusion: L('Lamp oil. Nothing in a pottery runs on it.', 'Gaz yağı. Bir seramik atölyesinde gaz yağıyla çalışan hiçbir şey yoktur.'),
    v2: { minutes: 240, facts: ['f-lampoil'] },
  },
  {
    id: 'a-dvr', evidenceId: 'ev-dvr', discipline: 'digital', name: L('Yard recorder (event log)', 'Avlu kayıt cihazı (olay kaydı)'),
    result: [L('The recorder’s own event log for Friday night.', 'Kayıt cihazının cuma gecesine ait kendi olay kaydı.')],
    conclusion: L('The recorder did not fail. Someone paused it.', 'Kayıt cihazı arızalanmamış. Biri onu durdurmuş.'),
    reveals: ['ev-dvrlog'],
    v2: { minutes: 180 },
  },
  {
    id: 'a-prints', evidenceId: 'ev-alarmlift', discipline: 'fingerprints', name: L('Smoke-alarm cover (prints)', 'Duman alarmı kapağı (izler)'),
    lockedReason: L('There is nobody to compare the prints with yet. The bureau needs a name.', 'İzleri karşılaştıracak kimse yok. Büronun bir isme ihtiyacı var.'),
    result: [L('Eleven points of agreement with the elimination prints taken on Sunday.', 'Pazar günü alınan karşılaştırma izleriyle on bir noktada uyum.')],
    conclusion: L('The prints on the alarm cover are Oskar Dahl’s.', 'Alarm kapağındaki izler Oskar Dahl’a ait.'),
    v2: { minutes: 180, locked: true, facts: ['f-prints-oskar'] },
  },
  {
    id: 'a-kranz', evidenceId: 'ev-kranzcard', discipline: 'records', name: L('Kranz Antiques (statement and door camera)', 'Kranz Antika (ifade ve kapı kamerası)'),
    result: [L('A statement from the dealer and two clips from his door camera.', 'Antikacının ifadesi ve kapı kamerasından iki görüntü.')],
    conclusion: L('Bram Vos was across town from 00:20 to 02:05.', 'Bram Vos 00:20’den 02:05’e kadar şehrin öbür ucundaydı.'),
    reveals: ['ev-kranz'],
    v2: { minutes: 180 },
  },
  {
    id: 'a-nyberg', evidenceId: 'ev-contract', discipline: 'records', name: L('Norrhavn Living (the deal file)', 'Norrhavn Living (anlaşma dosyası)'),
    lockedReason: L('Norrhavn’s lawyers will open their file only on a prosecutor’s request — and only once the motive is clear.', 'Norrhavn’un avukatları dosyalarını yalnızca savcılık talebiyle açar — o da saik netleşince.'),
    result: [L('Norrhavn’s correspondence with Dahl, and a note its director made after Friday’s dinner.', 'Norrhavn’un Dahl’la yazışmaları ve direktörünün cuma akşamki yemekten sonra aldığı bir not.')],
    conclusion: L('Dahl promised the buyer an empty Unit 4 — by Monday.', 'Dahl alıcıya boş bir 4 numara sözü vermiş — pazartesiye kadar.'),
    reveals: ['ev-nyberg'],
    v2: { minutes: 180, locked: true },
  },
  {
    // a night-fork job only (n1-teo, the written option): the airport police take the doorman's statement
    id: 'a-teo', evidenceId: 'ev-taxibook', discipline: 'records', name: L('Doorman’s statement (airport police)', 'Kapı görevlisinin ifadesi (havalimanı polisi)'),
    lockedReason: L('The doorman is on his way to the airport; only the night desk can reach him.', 'Kapı görevlisi havalimanı yolunda; ona yalnızca gece masası ulaşabilir.'),
    result: [L('A statement taken at the gate before the 06:10 flight to Lisbon.', '06:10 Lizbon uçuşundan önce kapıda alınmış bir ifade.')],
    conclusion: L('Dahl left the club on foot at ten past one.', 'Dahl kulüpten biri on geçe yürüyerek çıkmış.'),
    reveals: ['ev-teo'],
    v2: { minutes: 240, locked: true, facts: ['f-teo-foot'] },
  },
  {
    // a night-fork job only (n2-salvage, the default): the fire service keeps the heater and sends it to the lab
    id: 'a-heater', evidenceId: 'ev-heater', discipline: 'trace', name: L('Space heater (element and fuse)', 'Isıtıcı (rezistans ve sigorta)'),
    lockedReason: L('The fire service keeps the heater until the scene is released.', 'İtfaiye, olay yeri serbest bırakılana kadar ısıtıcıyı elinde tutuyor.'),
    result: [L('Element intact, no arcing, thermal fuse unblown; the oil inside never reached working temperature.', 'Rezistans sağlam, ark izi yok, termik sigorta atmamış; içindeki yağ hiç çalışma sıcaklığına çıkmamış.')],
    conclusion: L('This heater was never on.', 'Bu ısıtıcı hiç çalışmamış.'),
    v2: { minutes: 180, locked: true, facts: ['f-heater-cold'] },
  },
];

export const statements: CaseDefinition['statements'] = [
  { id: 's-ruth', speakerId: 'p-ruth', lane: 'ruth', time: '01:36', truthful: true, text: L('Ruth Ekdal: the gate keypad beeped at 01:36; a man in a long coat crossed the yard at about 01:45.', 'Ruth Ekdal: kapının tuş takımı 01:36’da öttü; uzun paltolu bir adam 01:45 sularında avluyu geçti.') },
  { id: 's-agnes', speakerId: 'p-agnes', lane: 'agnes', time: '18:30', truthful: true, text: L('Agnes Vos: locked up at 18:30; the kiln was cold and empty, the heater unplugged in its corner.', 'Agnes Vos: 18:30’da kapattı; fırın soğuk ve boştu, ısıtıcı köşesinde, fişi çekiliydi.') },

  { id: 's-selma-home', speakerId: 'selma', lane: 'selma', time: '18:30', truthful: false, text: L('Selma: left with Agnes at 18:30 and was home all night.', 'Selma: 18:30’da Agnes’le çıktı, bütün gece evdeydi.') },
  { id: 's-selma-back', speakerId: 'selma', lane: 'selma', time: '21:15', truthful: true, text: L('Selma: came back at 21:15 to fire her own pots; left at 00:40.', 'Selma: kendi kaplarını pişirmek için 21:15’te döndü; 00:40’ta çıktı.') },
  { id: 's-selma-heater', speakerId: 'selma', lane: 'selma', time: '00:40', truthful: true, text: L('Selma: used the heater by the glaze bench, then unplugged it and put it back in its corner at 00:40.', 'Selma: ısıtıcıyı sır tezgâhının yanında kullandı, 00:40’ta fişini çekip köşesine koydu.') },
  { id: 's-selma-nobram', speakerId: 'selma', lane: 'selma', truthful: false, text: L('Selma: saw nobody else that night.', 'Selma: o gece başka kimseyi görmedi.') },
  { id: 's-selma-ladder', speakerId: 'selma', lane: 'selma', time: '15:00', truthful: true, text: L('Selma: on Friday Dahl spent fifteen minutes on a ladder at the smoke alarm and asked who works at weekends.', 'Selma: cuma günü Dahl on beş dakika merdivende, duman alarmının başında kaldı ve hafta sonu kimin çalıştığını sordu.') },

  { id: 's-bram-home', speakerId: 'bram', lane: 'bram', truthful: false, text: L('Bram: at home with his wife all evening.', 'Bram: bütün akşam karısıyla evdeydi.') },
  { id: 's-bram-kiln', speakerId: 'bram', lane: 'bram', time: '23:18', truthful: false, text: L('Bram: came by at eleven only to check that the kiln was safe.', 'Bram: saat on bir gibi yalnızca fırın güvende mi diye bakmaya uğradı.') },
  { id: 's-bram-seconds', speakerId: 'bram', lane: 'bram', time: '23:18', truthful: true, text: L('Bram: took a crate of his mother’s seconds to sell to Kranz; at Kranz’s 00:20–02:05.', 'Bram: annesinin ıskarta işlerinden bir kasayı Kranz’a satmak için aldı; 00:20–02:05 arası Kranz’daydı.') },
  { id: 's-bram-noselma', speakerId: 'bram', lane: 'bram', truthful: false, text: L('Bram: the studio was empty when he looked in.', 'Bram: uğradığında atölye bomboştu.') },
  { id: 's-bram-fine', speakerId: 'bram', lane: 'bram', truthful: false, text: L('Bram: his money is fine.', 'Bram: parası yerinde.') },
  { id: 's-bram-cover', speakerId: 'bram', lane: 'bram', truthful: true, text: L('Bram: raised the insurance in August at his mother’s request.', 'Bram: sigortayı ağustosta annesinin isteğiyle yükseltti.') },
  { id: 's-bram-fee', speakerId: 'bram', lane: 'bram', truthful: true, text: L('Bram: in September Dahl offered him a finder’s fee to get his mother out of the lease.', 'Bram: eylülde Dahl, annesini kiradan çıkarırsa ona bir aracılık payı teklif etti.') },

  { id: 's-oskar-taxi', speakerId: 'oskar', lane: 'oskar', time: '01:30', truthful: false, text: L('Dahl: took a taxi home from the Harbour Club at half past one.', 'Dahl: Harbour Club’dan saat bir buçukta taksiyle eve döndü.') },
  { id: 's-oskar-walked', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: walked straight home along the harbour.', 'Dahl: liman boyunca doğruca eve yürüdü.') },
  { id: 's-oskar-notinside', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: has not set foot in Unit 4 for months.', 'Dahl: aylardır 4 numaraya adım atmadı.') },
  { id: 's-oskar-beeped', speakerId: 'oskar', lane: 'oskar', time: '15:00', truthful: false, text: L('Dahl: tested the alarm on Friday and it beeped.', 'Dahl: cuma günü alarmı denedi, öttü.') },
  { id: 's-oskar-codes', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: each tenant chooses their own gate code; he does not know them.', 'Dahl: her kiracı kendi kapı şifresini seçer; o bilmez.') },
  { id: 's-oskar-shed', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: the shed is open to every tenant.', 'Dahl: kulübe bütün kiracılara açık.') },
  { id: 's-oskar-heater', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: Agnes ran that heater in the drying room every night.', 'Dahl: Agnes o ısıtıcıyı her gece kurutma odasında çalıştırırdı.') },
  { id: 's-oskar-nodeal', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: Fennick Yard is not for sale; there is no developer.', 'Dahl: Fennick Avlusu satılık değil; ortada bir müteahhit yok.') },
  { id: 's-oskar-recorder', speakerId: 'oskar', lane: 'oskar', truthful: false, text: L('Dahl: the recorder stops by itself because its disk is full.', 'Dahl: kayıt cihazı diski dolduğu için kendiliğinden duruyor.') },
  { id: 's-oskar-confession', speakerId: 'oskar', lane: 'oskar', time: '01:40', truthful: true, text: L('Dahl: set the fire in Unit 4 to end Agnes Vos’s lease before the sale.', 'Dahl: satıştan önce Agnes Vos’un kira sözleşmesini bitirmek için 4 numarayı ateşe verdi.') },
];

export const contradictions: CaseDefinition['contradictions'] = [
  { id: 'c-oskar-taxi', statementId: 's-oskar-taxi', evidenceId: 'ev-taxibook', summary: L('Dahl says a taxi took him home at half past one. The club called no car for anyone after 00:40.', 'Dahl bir buçukta taksiyle eve döndüğünü söylüyor. Kulüp 00:40’tan sonra kimseye araç çağırmamış.') },
  { id: 'c-oskar-inside', statementId: 's-oskar-notinside', evidenceId: 'ev-notice', summary: L('Dahl says he had not been in Unit 4 for months. His own notice puts him there on Friday afternoon.', 'Dahl aylardır 4 numaraya girmediğini söylüyor. Kendi duyurusu onu cuma öğleden sonra orada gösteriyor.') },
  { id: 'c-oskar-deal', statementId: 's-oskar-nodeal', evidenceId: 'ev-contract', summary: L('Dahl says the yard is not for sale. He signed a €4.2 million sale in September.', 'Dahl avlunun satılık olmadığını söylüyor. Eylülde 4,2 milyon avroluk bir satış imzalamış.') },
  { id: 'c-oskar-disk', statementId: 's-oskar-recorder', evidenceId: 'ev-dvrlog', summary: L('Dahl says the recorder stops when the disk is full. It was 38% full and paused from his own phone.', 'Dahl kayıt cihazının disk dolunca durduğunu söylüyor. Disk %38 doluydu ve cihaz onun telefonundan durdurulmuştu.') },
  { id: 'c-bram-home', statementId: 's-bram-home', evidenceId: 'ev-ostkai', summary: L('Bram says he was home all evening. His van is on the Ostkai camera at 23:16.', 'Bram bütün akşam evde olduğunu söylüyor. Minibüsü 23:16’da Ostkai kamerasında.') },
  { id: 'c-selma-home', statementId: 's-selma-home', evidenceId: 'ev-kilnpots', summary: L('Selma says she went home at 18:30. Her stamped pots were fired in the kiln that night.', 'Selma 18:30’da eve gittiğini söylüyor. O gece fırında onun damgalı kapları pişirilmiş.') },
];

export const accusation: CaseDefinition['accusation'] = {
  motives: [
    { id: 'm-lease', text: L('To empty Unit 4 for the sale to Norrhavn', 'Norrhavn satışı için 4 numarayı boşaltmak') },
    { id: 'm-insurance', text: L('To collect the insurance on the exhibition', 'Sergi sigortasını almak') },
    { id: 'm-grudge', text: L('A grudge against Agnes Vos', 'Agnes Vos’a duyulan kin') },
  ],
  methods: [
    { id: 'x-oil', text: L('Lamp oil poured under the racks, the heater dragged there as a decoy', 'Rafların altına gaz yağı döküldü, ısıtıcı şaşırtmaca olsun diye oraya çekildi') },
    { id: 'x-kiln', text: L('Left the kiln to overheat', 'Fırının aşırı ısınmasına göz yumdu') },
    { id: 'x-heater', text: L('Left the heater running by the racks', 'Isıtıcıyı rafların yanında çalışır bıraktı') },
  ],
  windows: [
    { id: 'w-0136', text: L('01:36 – 01:44', '01:36 – 01:44') },
    { id: 'w-0040', text: L('Before 00:40', '00:40’tan önce') },
    { id: 'w-2318', text: L('23:18 – 23:51', '23:18 – 23:51') },
  ],
  correctWindowId: 'w-0136',
  decisiveEvidence: ['ev-gatelog', 'ev-notice', 'ev-battery', 'ev-cap', 'ev-contract', 'ev-dvrlog'],
  clearing: { bram: ['ev-kranz', 'ev-ostkai'], selma: ['ev-ostkai'], oskar: [] },
  keyContradictions: ['c-oskar-taxi', 'c-oskar-inside', 'c-oskar-deal'],
  weights: { culprit: 30, motive: 15, method: 10, window: 10, evidence: 20, contradictions: 5, alternatives: 10 },
};

export const hints: CaseDefinition['hints'] = [
  {
    id: 'fy-h1', until: { evidence: ['ev-burnpattern'] },
    text: L('Start where the crew stopped looking: the drying racks. Fire climbs — find the point it climbed from.', 'Ekibin bakmayı bıraktığı yerden başla: kurutma rafları. Ateş yukarı tırmanır; nereden tırmanmaya başladığını bul.'),
  },
  {
    id: 'fy-h2', requires: { deductions: ['d-origin'] }, until: { evidence: ['ev-gatelog'] },
    text: L('Somebody came in. The gate keeps a list.', 'Biri içeri girdi. Kapı bir liste tutar.'),
  },
  {
    id: 'fy-h3', requires: { evidence: ['ev-gatelog'] }, until: { deductions: ['d-oil'] },
    text: L('Switch to the UV lamp between the back door and the racks. Then look in the gutter outside.', 'Arka kapıyla raflar arasında UV lambasını yak. Sonra dışarıdaki oluğa bak.'),
  },
  {
    id: 'fy-h4', requires: { facts: ['f-sa-pots'] }, until: { deductions: ['d-selma'] },
    text: L('Agnes left the kiln cold and empty. Who loaded it — and whose stamp is S.A.?', 'Agnes fırını soğuk ve boş bırakmıştı. Onu kim doldurdu? S.A. kimin damgası?'),
  },
  {
    id: 'fy-h5', requires: { deductions: ['d-gate'] }, until: { deductions: ['d-timeline'] },
    text: L('The landlord says a taxi took him home. The Harbour Club keeps a cloakroom book and a taxi book.', 'Ev sahibi eve taksiyle döndüğünü söylüyor. Harbour Club’ın bir vestiyer defteri, bir de taksi defteri var.'),
  },
  {
    id: 'fy-h6',
    text: L('Every story about that night can be checked against the gate, the camera or the club.', 'O gece hakkında anlatılan her hikâye kapıyla, kamerayla ya da kulüple sınanabilir.'),
  },
];

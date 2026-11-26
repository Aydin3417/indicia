// SERVER-ONLY. Case 002 — "Ash and Glaze" / "Kül ve Sır": meta, briefing, truth, people.
// An arson, not a killing: nobody is hurt. All people, places and companies are fictional.
import type { CaseDefinition } from '../../engine/types.ts';
import { L } from '../text.ts';

export const FENNICK_ID = 'fennick-yard';

export const meta: CaseDefinition['meta'] = {
  title: L('Ash and Glaze', 'Kül ve Sır'),
  caseNumber: 'HCID 41-1004',
  category: L('Arson · property', 'Kundaklama · mülk'),
  difficulty: 'intermediate',
  durationMinutes: [50, 80],
  tagline: L(
    'Forty pieces were drying for the biggest show of Agnes Vos’s life. By two in the morning they were ash.',
    'Agnes Vos’un hayatının sergisi için kırk parça kuruyordu. Gece ikide hepsi küldü.',
  ),
  synopsis: L(
    'A fire guts the drying room of Agnes Vos’s pottery in Fennick Yard. The crew blames the kiln that was still hot when they arrived; ' +
      'their own investigator will not sign it. Nobody was hurt — but eleven months of work are gone, and three people had a reason to be at the yard that night.',
    'Fennick Avlusu’nda, Agnes Vos’un çömlek atölyesindeki kurutma odası yanıp kül oldu. İtfaiye ekibi, vardıklarında hâlâ sıcak olan fırını suçluyor; ' +
      'kendi yangın uzmanları ise raporu imzalamıyor. Yaralanan yok — ama on bir aylık emek gitti ve o gece avluda olmak için üç kişinin sebebi vardı.',
  ),
  // PLAN_V2 §4: the first case and the tutorial are free; new cases come with Detective Plus
  tier: 'plus',
  contentStatus: 'final',
  // verdict and debrief wording: someone set a fire; nobody was killed
  crime: 'arson',
  setting: L(
    'Hallstedt, old harbour. Fennick Yard: six workshops round a cobbled yard.',
    'Hallstedt, eski liman. Fennick Avlusu: arnavutkaldırımlı bir avlunun çevresinde altı atölye.',
  ),
};

export const briefing: CaseDefinition['briefing'] = {
  issuedBy: L('Hallstedt Criminal Investigation Department — Property Crime Desk', 'Hallstedt Emniyet Müdürlüğü — Mala Karşı Suçlar Büro Amirliği'),
  date: L('Saturday 4 October', '4 Ekim Cumartesi'),
  location: L('Vos Ceramics, Unit 4, Fennick Yard, Hallstedt (old harbour)', 'Vos Seramik, 4 numara, Fennick Avlusu, Hallstedt (eski liman)'),
  victim: {
    personId: 'p-agnes',
    summary: L(
      'Agnes Vos, 66. Potter, owner of Vos Ceramics since 1991. Her exhibition “Tide Lines” opens at the Hallstedt Kunsthalle on 18 October; forty of its pieces were on the drying racks.',
      'Agnes Vos, 66 yaşında. Seramikçi; 1991’den beri Vos Seramik’in sahibi. “Gelgit Çizgileri” sergisi 18 Ekim’de Hallstedt Kunsthalle’de açılacak; sergideki parçalardan kırkı kurutma raflarındaydı.',
    ),
  },
  incidentReport: [
    L(
      'At 01:58 on Saturday 4 October, Ruth Ekdal, the night baker at Unit 1, called the fire service: smoke and flame at the back of Unit 4. The first crew arrived at 02:07 and had the fire out by 02:40.',
      '4 Ekim Cumartesi saat 01:58’de, 1 numaradaki ekmek fırınının gece ustası Ruth Ekdal itfaiyeyi aradı: 4 numaranın arkasında duman ve alev. İlk ekip 02:07’de geldi, yangını 02:40’ta söndürdü.',
    ),
    L(
      'The drying room and the glaze room are burnt out. Nobody was inside and nobody was hurt. The studio’s smoke alarm, which reports to a monitoring company, never went off.',
      'Kurutma odasıyla sır odası tamamen yandı. İçeride kimse yoktu, yaralanan olmadı. Atölyenin bir izleme şirketine bağlı duman alarmı hiç ötmedi.',
    ),
    L('The crew’s first note reads: probable kiln fault.', 'İtfaiye ekibinin ilk notunda “muhtemelen fırın arızası” yazıyor.'),
  ],
  preliminaryFindings: [
    L(
      'Fire investigator Ingvar Holm will not confirm the kiln theory until the burn pattern has been read in daylight. He has asked for detectives.',
      'Yangın inceleme uzmanı Ingvar Holm, yanık izleri gün ışığında okunmadan fırın teorisini onaylamıyor. Dedektif istedi.',
    ),
    L(
      'Fennick Yard is a ring of six workshops round a cobbled yard. Its only gate opens with a keypad, one code per unit. The lane outside passes the municipal camera at the Ostkai junction.',
      'Fennick Avlusu, arnavutkaldırımlı bir avlunun çevresine dizilmiş altı atölye. Tek kapısı tuş takımıyla açılıyor; her birimin ayrı bir şifresi var. Dışarıdaki sokak Ostkai kavşağındaki belediye kamerasının önünden geçiyor.',
    ),
    L(
      'The insurer’s salvage crew is booked to clear Unit 4 at four on Monday afternoon. After that, what is left of the room is gone.',
      'Sigortacının enkaz ekibi pazartesi öğleden sonra saat dörtte 4 numarayı boşaltmak üzere çağrılmış. Ondan sonra odadan geriye bir şey kalmayacak.',
    ),
    L('Statements were taken overnight from the night baker and from Agnes Vos. They are attached.', 'Gece boyunca fırıncıdan ve Agnes Vos’tan ifade alındı. Ekte.'),
  ],
  knownWitnesses: ['p-ruth', 'p-holm'],
  objectives: [
    L('Find out how the fire started.', 'Yangının nasıl başladığını bul.'),
    L('If someone set it: who, how, and why.', 'Biri çıkardıysa: kim, nasıl ve neden?'),
    L('Prove it before Monday afternoon, when the room is cleared and the insurer pays.', 'Pazartesi öğleden sonra oda boşaltılıp sigorta ödenmeden önce kanıtla.'),
  ],
  startingEvidence: ['ev-ruth', 'ev-agnes', 'ev-firereport', 'ev-camreq'],
  startingStatements: ['s-ruth', 's-agnes'],
  startingFacts: ['f-call-0158'],
};

export const truth: CaseDefinition['truth'] = {
  killerId: 'oskar',
  motiveId: 'm-lease',
  methodId: 'x-oil',
  weaponEvidenceId: 'ev-cap',
  // for an arson: the window in which the fire was set
  timeOfDeath: { from: '01:36', to: '01:52', actual: '01:40' },
  events: [
    { time: 'Apr', description: 'Oskar Dahl offers Agnes Vos €40,000 to give up her lease on Unit 4 (nine years left). She laughs at him.', actors: ['oskar', 'p-agnes'] },
    { time: '01 Sep', description: 'Dahl resets every tenant’s gate code and keeps a copy of the list in his desk.', actors: ['oskar'] },
    { time: '12 Sep', description: 'Dahl signs a conditional sale of Fennick Yard to Norrhavn Living: €4.2M, only with vacant possession of every unit by 31 December. His bridging loan of €1.9M falls due the same day.', actors: ['oskar'] },
    { time: 'Sep', description: 'Dahl offers Bram Vos a €15,000 "finder’s fee" if he can get his mother to sign away the lease. Bram never asks her.', actors: ['oskar', 'bram'] },
    { time: '3 Oct 15:00', description: 'Dahl’s "annual safety inspection": he takes the battery out of Unit 4’s smoke alarm, puts it in his shed, and asks Selma whether anyone works at weekends.', actors: ['oskar', 'selma'] },
    { time: '18:30', description: 'Agnes and Selma lock up. The kiln is cold and empty; the old heater is unplugged in the sink corner.', actors: ['p-agnes', 'selma'] },
    { time: '19:30', description: 'Dahl at the Shipowners’ autumn dinner at the Harbour Club, seated beside Karl Nyberg of Norrhavn. He tells Nyberg that Unit 4 "won’t be a problem by Monday".', actors: ['oskar', 'p-nyberg'] },
    { time: '21:15', description: 'Selma lets herself in with the Unit 4 code, fires six pots for the Nordic Young Ceramics prize in Agnes’s kiln (programme ends 00:55) and dries them with the old heater by the glaze bench.', actors: ['selma'] },
    { time: '23:18', description: 'Bram drives in (van on camera 23:16) and takes a crate of his mother’s seconds to sell. He sees Selma; they agree to say nothing. He drives out at 23:51 and is at Kranz’s back table 00:20–02:05.', actors: ['bram', 'selma'] },
    { time: '00:40', description: 'Selma unplugs the heater, puts it back in its corner and leaves pushing her bicycle (camera 00:44).', actors: ['selma'] },
    { time: '00:50', description: 'Ruth Ekdal opens the bakery at Unit 1.', actors: ['p-ruth'] },
    { time: '01:00', description: 'Dahl pauses the yard recorder from his phone. 01:02 closes his tab; 01:08 takes his coat; 01:10 refuses a car and walks off towards the harbour.', actors: ['oskar'] },
    { time: '01:36', description: 'Dahl opens the gate with the Unit 4 code (camera 01:31 on foot), takes a bottle of lamp oil from his shed and opens Unit 4’s back door with his master key. The kiln is still ticking and Selma’s prize form lies on the bench: he expects the kiln to be blamed.', actors: ['oskar'] },
    { time: '01:40', description: 'He drags the heater to the racks, plugs it in and sets it to high (the wall switch is off; he does not notice), pours lamp oil from the door to the straw under the racks and lights it with a Harbour Club match. Cap and matchbook drop into the gutter as he leaves.', actors: ['oskar'] },
    { time: '01:44', description: 'Dahl leaves by the gate; Ruth sees a man in a long coat cross the yard. Camera 01:49 walking fast towards Strandvej.', actors: ['oskar', 'p-ruth'] },
    { time: '01:58', description: 'Ruth calls the fire service. 02:31 Dahl resumes the recorder from his phone.', actors: ['p-ruth', 'oskar'] },
    { time: 'Sat 07:55', description: 'Dahl books the insurer’s salvage crew to clear Unit 4 on Monday at 16:00. On Saturday night he burns his shoes in the garden incinerator.', actors: ['oskar'] },
  ],
  narrative: [
    L(
      'Oskar Dahl had owned Fennick Yard for twenty-two years and had been borrowing against it for ten. In September he signed a conditional sale to Norrhavn Living: €4.2 million, if every unit stood empty by 31 December. Five tenants would go quietly. Agnes Vos had nine years left on her lease and had laughed at his offer to buy her out.',
      'Oskar Dahl yirmi iki yıldır Fennick Avlusu’nun sahibiydi; on yıldır da onu teminat göstererek borçlanıyordu. Eylülde Norrhavn Living’le şartlı bir satış sözleşmesi imzaladı: bütün birimler 31 Aralık’a kadar boşalırsa 4,2 milyon avro. Beş kiracı sessizce giderdi. Agnes Vos’un sözleşmesinin bitmesine dokuz yıl vardı ve onu satın alma teklifine gülüp geçmişti.',
    ),
    L(
      'Her lease had one way out: clause 14.2, if the premises were made unfit for use by fire. On Friday afternoon Dahl held his “annual safety inspection”, took the battery out of her smoke alarm and asked her assistant whether anyone worked at weekends. Nobody does, Selma told him.',
      'Sözleşmenin tek bir çıkış kapısı vardı: mülk yangın yüzünden kullanılamaz hâle gelirse, 14.2. madde. Cuma öğleden sonra Dahl “yıllık güvenlik denetimi”ni yaptı, duman alarmının pilini çıkardı ve asistana hafta sonları çalışan olup olmadığını sordu. Kimse çalışmaz, dedi Selma.',
    ),
    L(
      'But that night Selma came back at 21:15 to fire six pots for a prize in Agnes’s kiln, drying them with the old heater. Bram Vos came at 23:18 for a crate of his mother’s rejects to sell for cash; he saw Selma, and they agreed to say nothing. Bram drove off at 23:51. Selma put the heater back in its corner and left at 00:40.',
      'Ama Selma o gece 21:15’te geri döndü; bir yarışma için altı parçasını Agnes’in fırınında pişirdi, onları eski ısıtıcıyla kuruttu. Bram Vos 23:18’de, annesinin ıskartaya ayırdığı işlerden bir kasayı nakde çevirmek için geldi. Selma’yı gördü; ikisi de susmaya karar verdi. Bram 23:51’de çıktı. Selma ısıtıcıyı köşesine koydu ve 00:40’ta gitti.',
    ),
    L(
      'At the Harbour Club, Dahl paused the yard’s recorder from his phone at 01:00, took his coat at 01:08 and walked out into the night, waving away a car. At 01:36 he opened the gate with the Unit 4 code he had set himself, took a bottle of lamp oil from his own shed and let himself in with his master key.',
      'Dahl, Harbour Club’dayken saat 01:00’de telefonundan avlunun kayıt cihazını durdurdu, 01:08’de paltosunu aldı ve kapıdaki arabayı geri çevirip yürüyerek çıktı. 01:36’da avlu kapısını kendi belirlediği 4 numara şifresiyle açtı, kendi kulübesinden bir şişe gaz yağı aldı ve ana anahtarıyla içeri girdi.',
    ),
    L(
      'The kiln was still ticking and Selma’s prize form lay on the bench. He thought his luck had turned: they would blame the kiln. He dragged the heater to the racks, plugged it in and turned it to high — never noticing that the switch on the wall was off — poured the oil from the door to the straw under the racks and struck one of the club’s matches. He was out of the gate at 01:44.',
      'Fırın hâlâ tıkırdıyordu, tezgâhta da Selma’nın yarışma formu duruyordu. Şansının döndüğünü düşündü: suçu fırına atacaklardı. Isıtıcıyı raflara kadar sürükledi, fişe taktı, en yükseğe getirdi — duvardaki anahtarın kapalı olduğunu hiç fark etmedi. Gaz yağını kapıdan rafların altındaki samana kadar döktü ve kulübün kibritlerinden birini çaktı. 01:44’te kapıdan çıkmıştı bile.',
    ),
    L(
      'The bottle cap and the matchbook fell into the gutter as he left. At five to eight he rang the insurer to have Unit 4 cleared by Monday; on Saturday night he burned his shoes in the garden.',
      'Çıkarken şişenin kapağıyla kibrit kutusu oluğa düştü. Sabah sekize beş kala sigortacıyı arayıp 4 numaranın pazartesi boşaltılmasını istedi; cumartesi gecesi de ayakkabılarını bahçede yaktı.',
    ),
    L(
      'Everyone else lied for smaller reasons. Selma hid a borrowed kiln and a heater she had been told never to use; Bram hid a crate of rejects. Neither lie was the fire.',
      'Ötekiler daha küçük sebeplerle yalan söyledi. Selma izinsiz kullandığı bir fırını ve kullanması yasak bir ısıtıcıyı sakladı; Bram bir kasa ıskartayı. Bu yalanların hiçbiri yangın değildi.',
    ),
  ],
};

export const people: CaseDefinition['people'] = [
  {
    id: 'p-agnes', name: 'Agnes Vos', role: L('Studio owner — her work burned', 'Atölye sahibi — işleri yandı'),
    description: L(
      '66. Tall, short white hair, clay under her nails at every hour. Famous, difficult, generous to strangers and hard on everyone close to her. She was at home in Vesterlund all night.',
      '66 yaşında. Uzun boylu, kısa beyaz saçlı; tırnaklarının altında her saat çamur. Ünlü, zor, yabancılara cömert, yakınlarına sert. Bütün gece Vesterlund’daki evindeydi.',
    ),
  },
  {
    id: 'p-ruth', name: 'Ruth Ekdal', role: L('Night baker, Unit 1', 'Gece fırıncısı, 1 numara'),
    description: L(
      '52. Has baked in Fennick Yard for eleven years and starts before one in the morning. Her back window looks across the yard at Unit 4.',
      '52 yaşında. On bir yıldır Fennick Avlusu’nda ekmek çıkarıyor; işe sabahın birinden önce başlıyor. Arka penceresi avlunun karşısındaki 4 numaraya bakıyor.',
    ),
  },
  {
    id: 'p-holm', name: 'Ingvar Holm', role: L('Fire investigator, Hallstedt Fire & Rescue', 'Yangın inceleme uzmanı, Hallstedt İtfaiyesi'),
    description: L('Thirty years of burnt rooms. Speaks slowly, and only about what he has seen.', 'Otuz yıldır yanmış odalara bakıyor. Yavaş konuşur, yalnızca gördüğünü anlatır.'),
  },
  {
    id: 'p-teo', name: 'Teo Varela', role: L('Doorman, the Harbour Club', 'Kapı görevlisi, Harbour Club'),
    description: L('Keeps the door and the taxi book at the Harbour Club on Ostkai. Flies home to Lisbon early on Sunday.', 'Ostkai’deki Harbour Club’ın kapısında durur, taksi defterini tutar. Pazar sabahı erkenden Lizbon’a, memleketine uçuyor.'),
  },
  {
    // listed once Bram names him (or his card / door camera reaches the notebook): on the list from the start he
    // pointed at Bram's crate before the player found the gap (PLAYTEST_V5 §3)
    id: 'p-kranz', name: 'Emil Kranz', role: L('Antiques dealer, Ostkai', 'Antikacı, Ostkai'), hiddenUntilMet: true,
    description: L('Buys anything with a famous name stamped on the bottom — preferably for cash, preferably late.', 'Altında ünlü bir isim damgası olan her şeyi alır — tercihen nakit, tercihen geç saatte.'),
  },
  {
    // listed once the notebook names him (the dinner seating, the cloakroom, the Norrhavn papers): a developer on the
    // cast list from day 1 hinted at a property motive before any clue did (PLAYTEST_V5 §3)
    id: 'p-nyberg', name: 'Karl Nyberg', role: L('Property developer', 'Gayrimenkul geliştiricisi'), hiddenUntilMet: true,
    description: L('Builds flats along the old harbour. Dined at the Harbour Club on Friday night.', 'Eski liman boyunca konut yapıyor. Cuma akşamı Harbour Club’daki yemekteydi.'),
  },
];

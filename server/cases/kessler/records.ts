// SERVER-ONLY. Kessler Workshop — lab analyses (with v2 delays and warrants), statements, contradictions,
// the v1 answer key and the hint ladder.
import type { CaseDefinition } from '../../engine/types.ts';
import { L } from '../text.ts';

export const analyses: CaseDefinition['analyses'] = [
  {
    id: 'a-autopsy', evidenceId: 'ev-body', discipline: 'autopsy', name: L('Full post-mortem examination', 'Tam otopsi'), reveals: ['ev-autopsy'],
    result: [L('Dr Lind’s report has been filed.', 'Dr. Lind raporunu dosyaya ekledi.')],
    conclusion: L('Single blow to the left temple from behind. Not a fall. Death 23:00–23:45.', 'Sol şakağa arkadan tek darbe. Düşme değil. Ölüm 23:00–23:45.'),
    v2: { minutes: 300 },
  },
  {
    id: 'a-mallet', evidenceId: 'ev-mallet', discipline: 'serology', name: L('Serology, DNA and prints', 'Seroloji, DNA ve parmak izi'), reveals: ['ev-serology'],
    result: [L('Laboratory report filed.', 'Laboratuvar raporu dosyada.')],
    conclusion: L('Victim’s blood in the seam. Wiped with naphtha. Face 42 mm — matches the wound.', 'Birleşim yerinde maktulün kanı. Neftle silinmiş. Vuruş yüzü 42 mm — yarayla uyumlu.'),
    v2: { minutes: 240 },
  },
  {
    id: 'a-rag', evidenceId: 'ev-rag', discipline: 'serology', name: L('Serology', 'Seroloji'),
    result: [
      L('Human blood on the folded section. DNA: Thomas Kessler.', 'Katlanmış kısımda insan kanı. DNA: Thomas Kessler.'),
      L('Solvent: naphtha, consistent with the can under the sink.', 'Çözücü: neft; lavabonun altındaki bidonla uyumlu.'),
    ],
    conclusion: L('The rag was used to wipe the victim’s blood off something.', 'Bez, maktulün kanını bir şeyin üstünden silmek için kullanılmış.'),
    v2: { minutes: 180, facts: ['f-rag-blood'] },
  },
  {
    id: 'a-ladder', evidenceId: 'ev-ladder', discipline: 'fingerprints', name: L('Fingerprints', 'Parmak izi'),
    result: [
      L('Prints of Thomas Kessler on both rails, mid-height.', 'İki kolda, orta yükseklikte Thomas Kessler’in izleri.'),
      L('Older prints of Leo Brandt on the lower rungs.', 'Alt basamaklarda Leo Brandt’a ait eski izler.'),
      L('No prints or shoe marks on the upper four rungs.', 'Üstteki dört basamakta ne parmak izi ne ayakkabı izi var.'),
    ],
    conclusion: L('Nothing shows anyone climbed high on the ladder that night.', 'O gece kimsenin merdivende yukarı çıktığını gösteren bir şey yok.'),
    v2: { minutes: 120, facts: ['f-rungs-clean'] },
  },
  {
    id: 'a-earring', evidenceId: 'ev-earring', discipline: 'trace', name: L('Trace comparison', 'İz karşılaştırması'),
    lockedReason: L(
      'A comparison needs someone to compare against. Place a person at the scene inside the time of death first.',
      'Karşılaştırma için karşılaştırılacak biri gerekir. Önce birini ölüm saatinde olay yerine yerleştir.',
    ),
    result: [
      L('9-carat gold butterfly back for a stud earring, standard size.', '9 ayar altın, standart boy, vidasız küpe için kelebek arkalık.'),
      L(
        'At her police interview on 14 March, Clara Kessler wore pearl studs; the officer’s photograph shows the left one fitted with a clear plastic back.',
        '14 Mart’taki ifadesinde Clara Kessler inci küpeler takıyordu; memurun çektiği fotoğrafta sol küpede şeffaf plastik bir arkalık var.',
      ),
    ],
    conclusion: L('Consistent with Clara Kessler’s earrings. Not conclusive: she works in this room daily.', 'Clara Kessler’in küpeleriyle uyumlu. Kesin değil: her gün bu odada çalışıyor.'),
    v2: { minutes: 180, locked: true, facts: ['f-pearl-back'] },
  },
  {
    id: 'a-phone', evidenceId: 'ev-phone', discipline: 'digital', name: L('Digital extraction', 'Dijital döküm'), reveals: ['ev-calllog'],
    result: [L('Extraction complete.', 'Döküm tamamlandı.')],
    conclusion: L('Three answered calls and a text in the hour before death.', 'Ölümden önceki bir saatte üç cevaplanmış arama ve bir mesaj.'),
    v2: { minutes: 120 },
  },
  {
    id: 'a-access', evidenceId: 'ev-accesspanel', discipline: 'digital', name: L('Event-log extraction', 'Olay kaydı dökümü'), reveals: ['ev-accesslog'],
    result: [L('Extraction complete.', 'Döküm tamamlandı.')],
    conclusion: L('Every door event of the night, with fob identities on entry.', 'Gecenin bütün kapı olayları; girişlerde kart sahipleriyle birlikte.'),
    v2: { minutes: 120 },
  },
  {
    id: 'a-cctv', evidenceId: 'ev-camera', discipline: 'records', name: L('ANPR footage request', 'Plaka tanıma kaydı talebi'), reveals: ['ev-cctv'],
    lockedReason: L(
      'The traffic authority releases camera data for a murder inquiry, not for a fall. Show that this was no accident.',
      'Trafik müdürlüğü kamera kaydını cinayet soruşturmasına verir, düşme vakasına vermez. Bunun kaza olmadığını göster.',
    ),
    result: [L('Extract received from the traffic authority.', 'Trafik müdürlüğünden döküm geldi.')],
    conclusion: L('All vehicles in and out of Brenner Lane 21:00–00:00.', '21:00–00:00 arası Brenner Sokağı’na giren çıkan bütün araçlar.'),
    v2: { minutes: 180, locked: true },
  },
  {
    id: 'a-violin', evidenceId: 'ev-violin', discipline: 'trace', name: L('Specialist instrument examination', 'Uzman çalgı incelemesi'), reveals: ['ev-copyreport'],
    lockedReason: L(
      'The Conservatory’s examiner will not open a two-million-euro case on a hunch. Establish what Thomas found that night.',
      'Konservatuvarın bilirkişisi iki milyon avroluk bir kutuyu bir önseziyle açmaz. Thomas’ın o gece ne bulduğunu ortaya koy.',
    ),
    result: [L('Examiner’s report filed.', 'Bilirkişi raporu dosyada.')],
    conclusion: L('A modern copy. Brand "JF" inside the lower block.', 'Modern bir kopya. Alt takozun içinde “JF” damgası.'),
    v2: { minutes: 360, locked: true },
  },
  {
    // opened by "The violin in the vault" (d-copy) or, for a sharp player, by "Follow the money" (d-money, wave 4)
    id: 'a-finance', evidenceId: 'ev-accounts', discipline: 'financial', name: L('Financial investigation', 'Mali soruşturma'), reveals: ['ev-geneva'],
    lockedReason: L(
      'The prosecutor will not authorise access to private company accounts on the strength of a business’s losses alone. Establish that a crime was committed against the business or a client.',
      'Savcı yalnızca bir şirketin zarar ettiğine bakarak özel şirket hesaplarına erişim izni vermez. Şirkete ya da bir müşteriye karşı suç işlendiğini ortaya koy.',
    ),
    result: [L('Production order granted. Records received.', 'İbraz kararı çıktı. Kayıtlar geldi.')],
    conclusion: L('The original was sold to Geneva via Clara Kessler’s company.', 'Asıl keman Clara Kessler’in şirketi üzerinden Cenevre’ye satılmış.'),
    v2: { minutes: 240, locked: true },
  },
  {
    id: 'a-anchor', evidenceId: 'ev-anchor-claim', discipline: 'records', name: L('Verify alibi (card records, bartender)', 'Alibiyi doğrula (kart kayıtları, barmen)'), reveals: ['ev-anchor'],
    result: [L('Records received; bartender interviewed.', 'Kayıtlar geldi; barmenin ifadesi alındı.')],
    conclusion: L('Jonas Feld was at The Anchor from 22:30 to closing.', 'Jonas Feld 22:30’dan kapanışa kadar The Anchor’daydı.'),
    v2: { minutes: 120 },
  },
  {
    id: 'a-pawn', evidenceId: 'ev-bowcabinet', discipline: 'records', name: L('Pawn registry search', 'Rehin kaydı taraması'), reveals: ['ev-pawn'],
    result: [L('Match found.', 'Eşleşme bulundu.')],
    conclusion: L('The bow was pawned by Leo Brandt the morning after.', 'Yayı ertesi sabah Leo Brandt rehine bırakmış.'),
    v2: { minutes: 180 },
  },
  {
    id: 'a-note', evidenceId: 'ev-note', discipline: 'document', name: L('Handwriting and ink', 'El yazısı ve kalem incelemesi'),
    result: [
      L('Handwriting matches Thomas Kessler’s diary and ledger entries.', 'El yazısı Thomas Kessler’in ajanda ve defter kayıtlarıyla eşleşiyor.'),
      L('Graphite from the pencil on his bench. The last line is broken off mid-stroke.', 'Grafit, tezgâhındaki kurşun kalemden. Son satır harfin ortasında kesilmiş.'),
    ],
    conclusion: L('Written by the victim, at his bench, that night.', 'Maktul tarafından, tezgâhında, o gece yazılmış.'),
    v2: { minutes: 120, facts: ['f-note-hand'] },
  },
  {
    id: 'a-ledger', evidenceId: 'ev-ledger', discipline: 'document', name: L('Handwriting and case prints', 'El yazısı ve kutu izleri'),
    lockedReason: L(
      'Dusting a client’s case needs a reason. Show who was in the building when Thomas died.',
      'Bir müşterinin kutusunu izlemek için gerekçe lazım. Thomas öldüğünde binada kimin olduğunu göster.',
    ),
    result: [
      L('The 21:40 entry is in Thomas Kessler’s hand.', '21:40 kaydı Thomas Kessler’in el yazısı.'),
      L(
        'Prints on the case latches: Thomas Kessler; and a partial print of Clara Kessler on the inside of the lid, of indeterminate age.',
        'Kutunun mandallarında: Thomas Kessler’in izleri; kapağın iç yüzünde de Clara Kessler’e ait, ne zaman bırakıldığı belirlenemeyen kısmi bir iz.',
      ),
    ],
    conclusion: L('Thomas took the violin out. Someone else put it back without signing it in.', 'Kemanı Thomas çıkardı. Başka biri deftere yazmadan geri koydu.'),
    v2: { minutes: 180, locked: true, facts: ['f-lid-print'] },
  },
  // ── wave 4: optional jobs that compete for the two slots
  {
    id: 'a-brandl', evidenceId: 'ev-lawyerletter', discipline: 'records', name: L('Request: Galerie Brandl, Vienna', 'Talep: Galerie Brandl, Viyana'), reveals: ['ev-brandl'],
    requires: { statements: ['s-miriam-clause'] },
    lockedReason: L(
      'A Vienna dealer will not answer the Hallstedt police about a client’s purchase on a hunch. Get Miriam to name him first.',
      'Viyanalı bir satıcı, müşterisinin alımı hakkında Hallstedt polisine bir önseziyle cevap vermez. Önce Miriam ona adını versin.',
    ),
    result: [L('Reply received by fax.', 'Cevap faksla geldi.')],
    conclusion: L('Brandl had doubts: another Turin Guadagnini of 1772 is for sale in Geneva.', 'Brandl’ın şüpheleri varmış: Cenevre’de 1772 Torino yapımı başka bir Guadagnini satışta.'),
    v2: { minutes: 240 },
  },
  {
    id: 'a-halberd', evidenceId: 'ev-copyreport', discipline: 'records', name: L('Request: Halberd Fine Instruments, Geneva', 'Talep: Halberd Fine Instruments, Cenevre'),
    lockedReason: L(
      'A request to a Swiss dealer goes through the prosecutor. Once the order for the accounts is signed, the night desk can send it.',
      'İsviçreli bir satıcıya talep savcılık üzerinden gider. Hesaplar için ibraz kararı imzalanınca nöbet masası gönderebilir.',
    ),
    result: [L('Halberd’s compliance office confirms the purchase: a Guadagnini, Turin 1772, bought on 3 September from CK Atelier Consulting GmbH.', 'Halberd’in uyum birimi alımı doğruluyor: 1772 Torino yapımı bir Guadagnini, 3 Eylül’de CK Atelier Consulting GmbH’den satın alınmış.')],
    conclusion: L('The real violin is in Geneva. Clara’s company sold it.', 'Asıl keman Cenevre’de. Clara’nın şirketi satmış.'),
    v2: { minutes: 180, locked: true, facts: ['f-halberd-bought'] },
  },
  {
    id: 'a-volvo', evidenceId: 'ev-volvo', discipline: 'trace', name: L('Swabs — Clara’s Volvo', 'Svaplar — Clara’nın Volvo’su'),
    lockedReason: L('The night team has already read these swabs.', 'Bu svapları gece ekibi çoktan okudu.'),
    result: [
      L('Steering wheel and driver’s door handle: naphtha (white spirit), consistent with the can at the workshop sink.', 'Direksiyon ve sürücü kapısının kolu: neft; atölyedeki lavabonun altındaki bidonla uyumlu.'),
      L('No blood.', 'Kan yok.'),
    ],
    conclusion: L('Whoever drove this car had naphtha on their hands that night.', 'O gece bu arabayı kim sürdüyse elinde neft vardı.'),
    v2: { minutes: 240, locked: true, facts: ['f-volvo-naphtha'] },
  },
];

export const statements: CaseDefinition['statements'] = [
  { id: 's-clara-home', speakerId: 'clara', lane: 'clara', time: '19:00', truthful: false, text: L('Clara: at home in Vesterlund all evening from about 19:00; in bed before 23:00.', 'Clara: 19:00 sularından itibaren bütün akşam Vesterlund’daki evindeydi; 23:00’ten önce yattı.') },
  { id: 's-clara-call', speakerId: 'clara', lane: 'clara', time: '22:51', truthful: false, text: L('Clara: her father’s 22:51 call was about a family dinner on Saturday.', 'Clara: babasının 22:51’deki araması cumartesi günkü aile yemeğiyle ilgiliydi.') },
  { id: 's-clara-visit', speakerId: 'clara', lane: 'clara', time: '23:15', truthful: false, text: L('Clara: drove to the workshop after the call, arrived just after 23:00, left at 23:15 with her father alive.', 'Clara: aramadan sonra atölyeye gitti, 23:00’ü biraz geçe vardı, 23:15’te çıktığında babası yaşıyordu.') },
  { id: 's-clara-copy', speakerId: 'clara', lane: 'clara', truthful: false, text: L('Clara: knows nothing about a copy; Jonas has had a key for nineteen years.', 'Clara: kopyadan haberi yok; Jonas’ın on dokuz yıldır anahtarı var.') },
  { id: 's-clara-sale', speakerId: 'clara', lane: 'clara', time: '03 Sep', truthful: true, text: L('Clara: sold the original Guadagnini to Halberd, Geneva, for €1.1M to cover the business’s losses.', 'Clara: şirketin zararını kapatmak için asıl Guadagnini’yi Cenevre’deki Halberd’e 1,1 milyon avroya sattı.') },
  { id: 's-clara-ladder', speakerId: 'clara', lane: 'clara', truthful: false, text: L('Clara: her father must have fallen from the ladder.', 'Clara: babası merdivenden düşmüş olmalı.') },
  { id: 's-clara-confession', speakerId: 'clara', lane: 'clara', time: '23:19', truthful: true, text: L('Clara: struck her father as he reached for the phone to call Miriam and the police.', 'Clara: babası Miriam’ı ve polisi aramak için telefona uzanırken ona vurdu.') },
  { id: 's-jonas-nocall', speakerId: 'jonas', lane: 'jonas', time: '22:43', truthful: false, text: L('Jonas: did not speak to Thomas after leaving work at 18:10; the 22:43 call was missed.', 'Jonas: 18:10’da işten çıktıktan sonra Thomas’la konuşmadı; 22:43’teki arama cevapsız kaldı.') },
  { id: 's-jonas-call', speakerId: 'jonas', lane: 'jonas', time: '22:43', truthful: true, text: L('Jonas: at 22:43 Thomas asked whether he had made a copy of the Guadagnini, and for whom. He told him: Clara.', 'Jonas: 22:43’te Thomas, Guadagnini’nin kopyasını onun yapıp yapmadığını ve kimin için yaptığını sordu. Jonas söyledi: Clara.') },
  { id: 's-jonas-copy', speakerId: 'jonas', lane: 'jonas', time: '12 Jul', truthful: true, text: L('Jonas: made the copy for Clara (“for an insurance exhibition”), €8,000 cash, delivered 12 July.', 'Jonas: kopyayı Clara için yaptı (“bir sigorta sergisi için”), 8.000 € nakit, 12 Temmuz’da teslim etti.') },
  { id: 's-jonas-anchor', speakerId: 'jonas', lane: 'jonas', time: '22:30', truthful: true, text: L('Jonas: at The Anchor on Kanalgade from about 22:30 until closing.', 'Jonas: 22:30 sularından kapanışa kadar Kanalgade’deki The Anchor’daydı.') },
  { id: 's-jonas-discovery', speakerId: 'jonas', lane: 'jonas', time: '07:52', truthful: true, text: L('Jonas: found the body just before 08:00; lights on; ladder on its side.', 'Jonas: cesedi 08:00’den hemen önce buldu; ışıklar açıktı, merdiven devrilmişti.') },
  { id: 's-miriam-absent', speakerId: 'miriam', lane: 'miriam', time: '21:00', truthful: false, text: L('Miriam: only spoke to Thomas by phone at 19:30; at home all evening.', 'Miriam: Thomas’la yalnızca 19:30’da telefonda konuştu; bütün akşam evdeydi.') },
  { id: 's-miriam-visit', speakerId: 'miriam', lane: 'miriam', time: '21:45', truthful: true, text: L('Miriam: visited 21:45–22:15, argued about the contract, left Thomas alive.', 'Miriam: 21:45–22:15 arası oradaydı, sözleşme yüzünden tartıştılar, çıktığında Thomas yaşıyordu.') },
  { id: 's-miriam-buyer', speakerId: 'miriam', lane: 'miriam', truthful: true, text: L('Miriam: had already promised the violin to a buyer in Vienna at €2.6M.', 'Miriam: kemanı Viyana’daki bir alıcıya 2,6 milyon avroya çoktan söz vermişti.') },
  { id: 's-miriam-2324', speakerId: 'miriam', lane: 'miriam', time: '23:24', truthful: true, text: L('Miriam: called Thomas about 23:24 to apologise; no answer.', 'Miriam: 23:24 sularında özür dilemek için Thomas’ı aradı; açan olmadı.') },
  { id: 's-miriam-clause', speakerId: 'miriam', lane: 'miriam', truthful: true, text: L('Miriam: knew that clause 9 would return the violin within a week of Thomas’s death; her buyer is Galerie Brandl of Vienna.', 'Miriam: 9. maddenin, Thomas ölürse kemanı bir hafta içinde ona geri vereceğini biliyordu; alıcısı Viyana’daki Galerie Brandl.') },
  { id: 's-miriam-saw-leo', speakerId: 'miriam', lane: 'miriam', time: '22:00', truthful: true, text: L('Miriam: a young man with a bicycle helmet and a bag came in the back during the argument.', 'Miriam: tartışma sırasında arkadan kasklı, çantalı genç bir adam girdi.') },
  { id: 's-leo-left', speakerId: 'leo', lane: 'leo', time: '18:25', truthful: false, text: L('Leo: left at 18:25 and went straight home for the night.', 'Leo: 18:25’te çıktı, doğruca eve gitti ve bütün gece evdeydi.') },
  { id: 's-leo-return', speakerId: 'leo', lane: 'leo', time: '22:00', truthful: false, text: L('Leo: went back about 22:00 for a phone charger; Thomas was arguing with an older woman; Thomas fine when he left.', 'Leo: 22:00 sularında şarj aleti için geri döndü; Thomas yaşlıca bir kadınla tartışıyordu; çıkarken Thomas iyiydi.') },
  { id: 's-leo-uv', speakerId: 'leo', lane: 'leo', time: '22:15', truthful: true, text: L('Leo: about 22:15 Thomas was examining the Guadagnini under the UV lamp, saying "That’s not right."', 'Leo: 22:15 sularında Thomas, Guadagnini’yi UV lambasının altında inceliyor, “Bu doğru değil” diyordu.') },
  { id: 's-leo-bow-deny', speakerId: 'leo', lane: 'leo', truthful: false, text: L('Leo: knows nothing about the missing bow.', 'Leo: kayıp yaydan haberi yok.') },
  { id: 's-leo-bow', speakerId: 'leo', lane: 'leo', truthful: true, text: L('Leo: took and pawned the Sartory bow to pay debts; that is why he went back.', 'Leo: borçlarını ödemek için Sartory yayı alıp rehine bıraktı; o gece bu yüzden geri döndü.') },
  { id: 's-leo-copy', speakerId: 'leo', lane: 'leo', truthful: true, text: L('Leo: Jonas made a study copy of the Guadagnini last summer; it went to "a client".', 'Leo: Jonas geçen yaz Guadagnini’nin bir çalışma kopyasını yaptı; kopya “bir müşteriye” gitti.') },
];

export const contradictions: CaseDefinition['contradictions'] = [
  { id: 'c-clara-home-cctv', statementId: 's-clara-home', evidenceId: 'ev-cctv', summary: L('Clara says she was home all evening. Her Volvo entered Brenner Lane at 23:02 and left at 23:41.', 'Clara bütün akşam evde olduğunu söylüyor. Volvo’su 23:02’de Brenner Sokağı’na girmiş, 23:41’de çıkmış.') },
  { id: 'c-clara-home-access', statementId: 's-clara-home', evidenceId: 'ev-accesslog', summary: L('Clara says she was home all evening. Her fob opened the back door at 23:04.', 'Clara bütün akşam evde olduğunu söylüyor. Kartı arka kapıyı 23:04’te açmış.') },
  { id: 'c-clara-visit-access', statementId: 's-clara-visit', evidenceId: 'ev-accesslog', summary: L('Clara says she left at 23:15. Nobody entered after her fob at 23:04, and the only exit is at 23:38.', 'Clara 23:15’te çıktığını söylüyor. 23:04’teki kartından sonra kimse girmemiş, tek çıkış 23:38’de.') },
  { id: 'c-clara-visit-cctv', statementId: 's-clara-visit', evidenceId: 'ev-cctv', summary: L('Clara says she left at 23:15. Her car left the lane at 23:41.', 'Clara 23:15’te çıktığını söylüyor. Arabası sokaktan 23:41’de çıkmış.') },
  { id: 'c-clara-visit-autopsy', statementId: 's-clara-visit', evidenceId: 'ev-autopsy', summary: L('Clara says her father was alive at 23:15 when she left. He died 23:00–23:45, and she was in the building until 23:38.', 'Clara 23:15’te çıktığında babasının yaşadığını söylüyor. Ölüm 23:00–23:45 arasında, Clara ise 23:38’e kadar binadaydı.') },
  { id: 'c-clara-call-log', statementId: 's-clara-call', evidenceId: 'ev-calllog', summary: L('Clara says the 22:51 call was about dinner. Four minutes later he texted: "I know about the Guadagnini… Come now or I call the police tonight."', 'Clara 22:51’deki aramanın yemekle ilgili olduğunu söylüyor. Dört dakika sonra babası şu mesajı atmış: “Guadagnini’yi biliyorum… Hemen gel, yoksa bu gece polisi ararım.”') },
  { id: 'c-clara-copy-workbook', statementId: 's-clara-copy', evidenceId: 'ev-workbook', summary: L('Clara denies knowing of a copy. Jonas’s workbook records the copy commissioned and paid for by "C.K.".', 'Clara kopyadan haberi olmadığını söylüyor. Jonas’ın iş defterinde kopyayı “C.K.”nin ısmarlayıp ödediği yazıyor.') },
  { id: 'c-clara-copy-geneva', statementId: 's-clara-copy', evidenceId: 'ev-geneva', summary: L('Clara denies knowing of a copy. Her company was paid €1.1M by Halberd for the original.', 'Clara kopyadan haberi olmadığını söylüyor. Halberd, asıl keman için onun şirketine 1,1 milyon avro ödemiş.') },
  { id: 'c-clara-ladder-autopsy', statementId: 's-clara-ladder', evidenceId: 'ev-autopsy', summary: L('Clara insists her father fell from the ladder. The post-mortem finds a single blow from behind and no fall injuries.', 'Clara babasının merdivenden düştüğünde ısrar ediyor. Otopsi arkadan tek bir darbe buluyor, düşme yaralanması yok.') },
  { id: 'c-jonas-nocall-log', statementId: 's-jonas-nocall', evidenceId: 'ev-calllog', summary: L('Jonas says the 22:43 call was missed. It lasted 3 minutes 12 seconds.', 'Jonas 22:43’teki aramanın cevapsız kaldığını söylüyor. Arama 3 dakika 12 saniye sürmüş.') },
  { id: 'c-miriam-absent-cctv', statementId: 's-miriam-absent', evidenceId: 'ev-cctv', summary: L('Miriam says she was home all evening. Her Jaguar was in Brenner Lane 21:44–22:15.', 'Miriam bütün akşam evde olduğunu söylüyor. Jaguar’ı 21:44–22:15 arası Brenner Sokağı’ndaymış.') },
  { id: 'c-miriam-absent-diary', statementId: 's-miriam-absent', evidenceId: 'ev-diary', summary: L('Miriam says she was home all evening. Thomas’s diary has her booked at the workshop at 21:45.', 'Miriam bütün akşam evde olduğunu söylüyor. Thomas’ın ajandasında 21:45’te atölyede randevusu var.') },
  { id: 'c-leo-left-access', statementId: 's-leo-left', evidenceId: 'ev-accesslog', summary: L('Leo says he went home at 18:25 for the night. His fob opened the back door at 21:58.', 'Leo 18:25’te eve gidip bir daha çıkmadığını söylüyor. Kartı arka kapıyı 21:58’de açmış.') },
  { id: 'c-leo-left-cctv', statementId: 's-leo-left', evidenceId: 'ev-cctv', summary: L('Leo says he stayed home. A cyclist matching him entered the lane at 21:55 and left at 22:22.', 'Leo evde kaldığını söylüyor. Ona uyan bir bisikletli 21:55’te sokağa girmiş, 22:22’de çıkmış.') },
  { id: 'c-leo-return-pawn', statementId: 's-leo-return', evidenceId: 'ev-pawn', summary: L('Leo says he went back for a phone charger. He pawned the Sartory bow from that cabinet at 09:10 the next morning.', 'Leo şarj aleti için döndüğünü söylüyor. Ertesi sabah 09:10’da o vitrindeki Sartory yayı rehine bırakmış.') },
  { id: 'c-leo-bow-pawn', statementId: 's-leo-bow-deny', evidenceId: 'ev-pawn', summary: L('Leo denies knowing about the bow. He pawned it at 09:10 the next morning.', 'Leo yaydan haberi olmadığını söylüyor. Ertesi sabah 09:10’da yayı rehine bırakmış.') },
];

export const accusation: CaseDefinition['accusation'] = {
  motives: [
    { id: 'm-cover-sale', text: L('To stop him exposing that the consigned Guadagnini had been secretly sold and replaced with a copy', 'Emanet Guadagnini’nin gizlice satılıp yerine kopya konduğunu ortaya çıkarmasını engellemek') },
    { id: 'm-inherit', text: L('To inherit the business and his estate', 'Şirkete ve mal varlığına mirasçı olmak') },
    { id: 'm-consignment', text: L('Rage over the stalled sale and his refusal to release the violin', 'Satışın sürüncemede kalmasına ve kemanı vermemesine duyulan öfke') },
    { id: 'm-theft', text: L('He caught the killer stealing from the workshop', 'Katili atölyeden hırsızlık yaparken yakaladı') },
    { id: 'm-credit', text: L('Years of resentment over him taking credit for the killer’s work', 'Katilin emeğini yıllarca sahiplenmesine duyulan kin') },
  ],
  methods: [
    { id: 'x-mallet', text: L('A single blow to the left temple from behind with the lignum vitae mallet; the ladder fall was staged', 'Gayak ağacı tokmakla arkadan sol şakağa tek darbe; merdivenden düşme sahnelendi') },
    { id: 'x-pushed', text: L('Pushed from the library ladder', 'Kütüphane merdiveninden itildi') },
    { id: 'x-accident', text: L('An accidental fall from the ladder', 'Merdivenden kaza sonucu düştü') },
    { id: 'x-lamp', text: L('Struck with the UV inspection lamp during a struggle', 'Boğuşma sırasında UV inceleme lambasıyla vuruldu') },
  ],
  windows: [
    { id: 'w-2145', text: L('21:45 – 22:15', '21:45 – 22:15') },
    { id: 'w-2215', text: L('22:15 – 22:45', '22:15 – 22:45') },
    { id: 'w-2305', text: L('23:04 – 23:38', '23:04 – 23:38') },
    { id: 'w-2340', text: L('After 23:40', '23:40’tan sonra') },
  ],
  correctWindowId: 'w-2305',
  decisiveEvidence: ['ev-autopsy', 'ev-serology', 'ev-calllog', 'ev-accesslog', 'ev-cctv', 'ev-copyreport', 'ev-geneva'],
  clearing: {
    jonas: ['ev-anchor'],
    miriam: ['ev-cctv', 'ev-calllog'],
    leo: ['ev-accesslog', 'ev-cctv', 'ev-calllog'],
    clara: [],
  },
  keyContradictions: ['c-clara-visit-access', 'c-clara-call-log', 'c-clara-home-access', 'c-clara-home-cctv', 'c-clara-visit-autopsy'],
  weights: { culprit: 30, motive: 15, method: 10, window: 10, evidence: 20, contradictions: 5, alternatives: 10 },
};

/**
 * The desk sergeant's hint ladder (45 minutes each). The first unused hint whose `requires` is met and whose
 * `until` is not yet reached is given, so the order is the order of urgency: long lab jobs and closing
 * interview windows come before things that can wait.
 */
export const hints: CaseDefinition['hints'] = [
  {
    id: 'h-body', until: { evidence: ['ev-body'] },
    text: L('Start with the body. Everything else in that room is arranged around it.', 'Cesetten başla. O odadaki her şey onun etrafına dizilmiş.'),
  },
  {
    id: 'h-phone', requires: { evidence: ['ev-phone'] }, until: { analyses: ['a-phone'] },
    text: L(
      'He had his phone on him. The extraction takes two hours and the lab works while you do — send it before anything else.',
      'Telefonu üstündeydi. Döküm iki saat sürer, sen çalışırken laboratuvar da çalışır — her şeyden önce onu gönder.',
    ),
  },
  {
    id: 'h-fall', requires: { evidence: ['ev-body'] }, until: { deductions: ['d-not-fall'] },
    text: L(
      'Uniform called it a fall. Whoever climbs a ladder leaves something on the rungs. A pinch of powder is quicker than a post-mortem.',
      'Devriye düşme dedi. Merdivene çıkan, basamaklarda bir iz bırakır. Bir tutam toz, otopsiden çabuktur.',
    ),
  },
  {
    id: 'h-access', until: { analyses: ['a-access'] },
    text: L(
      'Both doors log every fob. The controller is at the back entrance; the extraction takes two hours, so send it in the morning, not at three.',
      'İki kapı da her kartı kaydediyor. Kontrol ünitesi arka girişte; döküm iki saat sürer — üçte değil, sabahtan gönder.',
    ),
  },
  {
    id: 'h-jonas', requires: { facts: ['f-call-jonas'] }, until: { statements: ['s-jonas-call'] },
    text: L(
      'Jonas told the police the 22:43 call was missed. It lasted three minutes. He is at the workshop only until 13:00 on the first day.',
      'Jonas polise 22:43’teki aramanın cevapsız kaldığını söyledi. Arama üç dakika sürmüş. İlk gün yalnızca 13.00’e kadar atölyede.',
    ),
  },
  {
    id: 'h-note', requires: { evidence: ['ev-uvlamp'] }, until: { evidence: ['ev-note'] },
    text: L(
      'The lamp was still on, aimed at an empty cradle. A man who finds something at midnight writes it down. Look under what is on the bench.',
      'Lamba hâlâ açıktı, boş bir beşiğe çevrilmişti. Gece yarısı bir şey bulan adam onu not eder. Tezgâhtakilerin altına bak.',
    ),
  },
  {
    id: 'h-varnish', requires: { evidence: ['ev-note'] }, until: { deductions: ['d-varnish'] },
    text: L(
      'The note says the varnish was wrong. When did the violin leave the vault — and who saw him at the lamp before he wrote it?',
      'Not, verniğin yanlış olduğunu söylüyor. Keman kasadan ne zaman çıktı — ve bunu yazmadan önce onu lambanın başında kim gördü?',
    ),
  },
  {
    id: 'h-clara', requires: { facts: ['f-sms'] }, until: { statements: ['s-clara-visit'] },
    text: L(
      'Clara says her father rang about dinner. He wrote "come now". Ask where she went after that, and have the door log in your hand when you do.',
      'Clara babasının yemek için aradığını söylüyor. Babası “hemen gel” yazmış. Sonra nereye gittiğini sor — ama sorarken kapı kaydı elinde olsun.',
    ),
  },
  {
    id: 'h-copy', requires: { evidence: ['ev-copyreport'] }, until: { deductions: ['d-copy'] },
    text: L(
      'A copy carries its maker’s brand, and its maker knows who paid. The owner should hear it from you — she only sees the police until 13:00.',
      'Kopya, yapanın damgasını taşır; yapan da parayı kimin ödediğini bilir. Sahibi bunu senden duymalı — polisi yalnızca 13.00’e kadar kabul ediyor.',
    ),
  },
  {
    id: 'h-money', requires: { deductions: ['d-copy'] }, until: { analyses: ['a-finance'] },
    text: L(
      'The prosecutor has signed the production order. Four hours: send the financial investigation now and use the time.',
      'Savcı ibraz kararını imzaladı. Dört saat: mali soruşturmayı hemen gönder, beklerken boş durma.',
    ),
  },
  {
    id: 'h-motive', requires: { evidence: ['ev-geneva'] }, until: { deductions: ['d-motive'] },
    text: L(
      'The money explains the sale. The accounts explain the need. Miriam’s letter explains why it had to come out now.',
      'Para satışı açıklıyor. Hesaplar ihtiyacı açıklıyor. Miriam’ın mektubu ise neden şimdi patlak verdiğini.',
    ),
  },
  {
    id: 'h-finale', requires: { deductions: ['d-timeline', 'd-motive', 'd-weapon'] },
    text: L(
      'You have opportunity, motive and means. Every hour you keep digging costs you the Clock star. The prosecutor will see you now.',
      'Fırsat, saik ve araç elinde. Kazmaya devam ettiğin her saat Saat yıldızından yer. Savcı seni şimdi kabul eder.',
    ),
  },
  {
    id: 'h-labs',
    text: L(
      'Let the lab set your day: long jobs first, both slots busy before you go home. The night works for you.',
      'Gününü laboratuvar belirlesin: uzun işler önce, eve gitmeden iki hat da dolu olsun. Gece senin için çalışır.',
    ),
  },
];

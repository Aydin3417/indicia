// SERVER-ONLY. Kessler Workshop — meta, briefing, truth, people. All people and places are fictional.
import type { CaseDefinition } from '../../engine/types.ts';
import { L } from '../text.ts';

export const meta: CaseDefinition['meta'] = {
  title: L('The Kessler Workshop', 'Kessler Atölyesi'),
  caseNumber: 'HCID 13-0314',
  category: L('Family & business', 'Aile ve iş'),
  difficulty: 'intermediate',
  durationMinutes: [60, 100],
  tagline: L(
    'Thomas Kessler spent forty years listening for flaws. On his last night, he found one.',
    'Thomas Kessler kırk yıl boyunca kusur aradı. Son gecesinde bir tane buldu.',
  ),
  synopsis: L(
    'A master violin maker is found dead beside his workbench, a library ladder on its side. Uniform called it a fall. ' +
      'The pathologist refuses to sign. Four people were close to him that night — and a two-million-euro instrument sits in his vault.',
    'Usta bir keman yapımcısı tezgâhının dibinde ölü bulunuyor, yanında devrilmiş bir kütüphane merdiveni. Devriye “düşme” diye yazdı. ' +
      'Adli tıp uzmanı imzalamıyor. O gece dört kişi ona yakındı — ve kasasında iki milyon avroluk bir çalgı duruyor.',
  ),
  tier: 'free',
  contentStatus: 'final',
  setting: L(
    'Hallstedt, a northern port city. Kessler Strings, 14 Brenner Lane.',
    'Hallstedt, kuzeyde bir liman kenti. Kessler Strings, Brenner Sokağı 14.',
  ),
};

export const briefing: CaseDefinition['briefing'] = {
  issuedBy: L(
    'Hallstedt Criminal Investigation Department — Serious Crime Desk',
    'Hallstedt Emniyet Müdürlüğü — Cinayet Büro Amirliği',
  ),
  date: L('Friday 14 March', '14 Mart Cuma'),
  location: L(
    'Kessler Strings, 14 Brenner Lane, Hallstedt (old harbour quarter)',
    'Kessler Strings, Brenner Sokağı 14, Hallstedt (eski liman mahallesi)',
  ),
  victim: {
    personId: 'p-thomas',
    summary: L(
      'Thomas Kessler, 61. Master violin maker and dealer, founder and sole owner of Kessler Strings (est. 1986). Widowed. One daughter.',
      'Thomas Kessler, 61 yaşında. Usta keman yapımcısı ve satıcısı; Kessler Strings’in kurucusu ve tek sahibi (1986). Dul, bir kızı var.',
    ),
  },
  incidentReport: [
    L(
      'At 07:54 on Friday 14 March, Jonas Feld (47), senior luthier, called emergency services from Kessler Strings, reporting that his employer Thomas Kessler was unresponsive on the workshop floor. Paramedics pronounced death at 08:06.',
      '14 Mart Cuma günü saat 07:54’te kıdemli usta Jonas Feld (47), Kessler Strings’ten acil hattı aradı; işvereni Thomas Kessler’in atölyede yerde yattığını ve tepki vermediğini bildirdi. Sağlık ekibi 08:06’da ölümü tespit etti.',
    ),
    L(
      'Responding officers found the victim on his left side beside his workbench with a wound to the left side of the head. A wheeled library ladder lay on its side nearby. Workshop lights were on. No sign of forced entry at either door.',
      'Olay yerine gelen ekip maktulü tezgâhının yanında, sol yanına dönmüş hâlde, başının sol tarafında bir yarayla buldu. Yakında tekerlekli bir kütüphane merdiveni yan yatmıştı. Atölyenin ışıkları açıktı. İki kapıda da zorlama izi yok.',
    ),
    L(
      'The scene was initially recorded as a probable accidental fall from the ladder.',
      'Olay ilk tutanakta “merdivenden kaza sonucu düşme olasılığı” olarak kayda geçti.',
    ),
  ],
  preliminaryFindings: [
    L(
      'Dr Hanne Lind, forensic pathologist, has declined to sign a certificate of accidental death and has requested a full post-mortem examination.',
      'Adli tıp uzmanı Dr. Hanne Lind kaza sonucu ölüm raporunu imzalamayı reddetti ve tam otopsi istedi.',
    ),
    L(
      'Brenner Lane is a cul-de-sac. All vehicle access passes a municipal traffic camera at the Ostwall junction.',
      'Brenner Sokağı çıkmaz sokak. Giren çıkan her araç Ostwall kavşağındaki belediye trafik kamerasının önünden geçiyor.',
    ),
    L(
      'Both doors are fitted with an electronic access-control system. Staff carry personal key fobs.',
      'İki kapıda da elektronik geçiş kontrol sistemi var. Çalışanlar kişiye özel kartla giriyor.',
    ),
    L(
      'The vault holds instruments on consignment, the most valuable a violin by G.B. Guadagnini (Turin, 1772), owned by collector Miriam Achterberg and insured at €2.4 million.',
      'Kasa odasında konsinye çalgılar duruyor. En değerlisi G.B. Guadagnini imzalı bir keman (Torino, 1772): sahibi koleksiyoncu Miriam Achterberg, sigorta bedeli 2,4 milyon avro.',
    ),
    L(
      'Uniformed officers took short initial statements from the four people closest to the victim on the morning of 14 March. They are attached.',
      'Devriye ekibi 14 Mart sabahı maktule en yakın dört kişiden kısa ilk ifadeler aldı. Ekte.',
    ),
  ],
  knownWitnesses: ['p-varga'],
  objectives: [
    L('Determine whether Thomas Kessler’s death was an accident.', 'Thomas Kessler’in ölümünün kaza olup olmadığını belirle.'),
    L('If it was not: establish who killed him, how, when and why.', 'Kaza değilse: onu kimin, nasıl, ne zaman ve neden öldürdüğünü ortaya çıkar.'),
    L('Prove it. A name without evidence will not survive a prosecutor.', 'Kanıtla. Kanıtsız bir isim savcının masasından geri döner.'),
  ],
  startingEvidence: ['ev-neighbour', 'ev-camera'],
  startingStatements: ['s-clara-home', 's-jonas-nocall', 's-miriam-absent', 's-leo-left'],
};

export const truth: CaseDefinition['truth'] = {
  killerId: 'clara',
  motiveId: 'm-cover-sale',
  methodId: 'x-mallet',
  weaponEvidenceId: 'ev-mallet',
  timeOfDeath: { from: '23:00', to: '23:45', actual: '23:19' },
  events: [
    { time: '12 Jul', description: 'Jonas Feld delivers a study copy of the Guadagnini to Clara Kessler, who commissioned it for €8,000 cash ("for an insurance exhibition"). His brand "JF" is inside the lower block.', actors: ['jonas', 'clara'] },
    { time: '03 Sep', description: 'Clara secretly sells the real Guadagnini to Halberd Fine Instruments SA, Geneva, for €1.1M paid to CK Atelier Consulting GmbH, her company. The copy goes into the vault. The money repays a €900k business loan Thomas never knew about.', actors: ['clara'] },
    { time: '21:40', description: 'Thomas signs the Guadagnini (the copy) out of the vault for Miriam Achterberg’s visit.', actors: ['thomas'] },
    { time: '21:46', description: 'Thomas lets Miriam in by the front door. They argue in the office: she wants the violin back for a buyer in Vienna; he refuses until the notice period ends.', actors: ['thomas', 'miriam'] },
    { time: '21:58', description: 'Leo Brandt enters by the back door with his fob and takes a Sartory bow from the display cabinet to pawn.', actors: ['leo'] },
    { time: '22:12', description: 'Miriam leaves by the front door. Thomas carries the violin to his bench and switches on the UV lamp.', actors: ['miriam', 'thomas'] },
    { time: '22:19', description: 'Leo leaves by the back door. On his way out he sees Thomas at the lamp, muttering that something is "not right".', actors: ['leo', 'thomas'] },
    { time: '22:20', description: 'Thomas finds the varnish fluoresces wrongly and, with an inspection mirror, finds the brand "JF" inside. He writes a note.', actors: ['thomas'] },
    { time: '22:43', description: 'Thomas calls Jonas (3 min 12 s). Jonas admits making the copy for Clara.', actors: ['thomas', 'jonas'] },
    { time: '22:51', description: 'Thomas calls Clara (2 min 40 s). She denies everything.', actors: ['thomas', 'clara'] },
    { time: '22:55', description: 'Thomas texts Clara: "I know about the Guadagnini. Jonas told me. Come now or I call the police tonight."', actors: ['thomas', 'clara'] },
    { time: '23:04', description: 'Clara enters by the back door with her fob.', actors: ['clara'] },
    { time: '23:19', description: 'After a long argument Thomas turns to the desk phone, saying he will call Miriam and then the police. Clara takes the lignum vitae mallet from the tool wall and strikes him once on the left temple. He dies within minutes.', actors: ['clara', 'thomas'] },
    { time: '23:20', description: 'Clara wipes the mallet with a naphtha rag and rehangs it, tips the ladder over beside him, returns the copy to the vault without a ledger entry, and misses the note under the papers. She loses an earring back near the body.', actors: ['clara'] },
    { time: '23:24', description: 'Miriam calls Thomas from home to apologise. No answer.', actors: ['miriam'] },
    { time: '23:38', description: 'Clara leaves by the back door.', actors: ['clara'] },
    { time: '07:52', description: 'Jonas arrives and finds the body.', actors: ['jonas'] },
  ],
  narrative: [
    L(
      'Kessler Strings had been losing money for eighteen months. Clara Kessler, who ran the business side, hid the losses from her father and took a €900,000 loan against the company in his name.',
      'Kessler Strings on sekiz aydır zarar ediyordu. İşin mali tarafını yöneten Clara Kessler zararları babasından sakladı ve şirket adına, babasının imzasıyla 900.000 avroluk bir kredi çekti.',
    ),
    L(
      'Last summer she commissioned Jonas Feld to make a study copy of the Guadagnini consigned by Miriam Achterberg — "for an insurance exhibition". On 3 September she sold the real violin to Halberd Fine Instruments in Geneva for €1.1 million through her own company and put Jonas’s copy in the vault. The loan was repaid. Nobody noticed.',
      'Geçen yaz Jonas Feld’den, Miriam Achterberg’in emanet bıraktığı Guadagnini’nin bir çalışma kopyasını istedi — “bir sigorta sergisi için”. 3 Eylül’de gerçek kemanı kendi şirketi üzerinden Cenevre’deki Halberd Fine Instruments’a 1,1 milyon avroya sattı, Jonas’ın kopyasını da kasaya koydu. Kredi kapandı. Kimse fark etmedi.',
    ),
    L(
      'On 13 March Miriam forced the issue: she had a buyer in Vienna and wanted her violin back. Thomas brought it out to show her it was safe. After she left, he looked at it properly under ultraviolet light for the first time in months. The varnish glowed wrong. Inside the lower block he found Jonas’s brand.',
      '13 Mart’ta Miriam işi zora soktu: Viyana’da bir alıcısı vardı ve kemanını geri istiyordu. Thomas, güvende olduğunu göstermek için kemanı kasadan çıkardı. Miriam gidince aylardır ilk kez ona morötesi ışıkta dikkatle baktı. Vernik yanlış parlıyordu. Alt takozun içinde Jonas’ın damgasını buldu.',
    ),
    L(
      'At 22:43 he called Jonas, who told him the truth: Clara had commissioned it. At 22:51 he called Clara, who denied it. At 22:55 he texted her: come now, or I call the police tonight.',
      '22:43’te Jonas’ı aradı; Jonas gerçeği söyledi: kopyayı Clara ısmarlamıştı. 22:51’de Clara’yı aradı; Clara inkâr etti. 22:55’te ona mesaj attı: ya hemen gel ya da bu gece polisi ararım.',
    ),
    L(
      'Clara arrived at 23:04. They argued for a quarter of an hour. When Thomas turned to the phone to call Miriam and the police, she struck him once on the left temple with the heaviest mallet on the tool wall. The neighbour heard the thud just after the 23:15 news began.',
      'Clara 23:04’te geldi. Çeyrek saat tartıştılar. Thomas, Miriam’ı ve polisi aramak için telefona döndüğünde Clara alet duvarındaki en ağır tokmakla onun sol şakağına tek bir darbe indirdi. Komşu gümlemeyi 23:15 haberleri başladıktan hemen sonra duydu.',
    ),
    L(
      'She wiped the mallet with naphtha, rehung it, pushed the ladder over beside him, and put the copy back in the vault — forgetting the ledger. She did not find the note under the papers. She left at 23:38 and was on camera at 23:41.',
      'Tokmağı neftle sildi, yerine astı, merdiveni babasının yanına devirdi ve kopyayı kasaya geri koydu — deftere yazmayı unuttu. Kâğıtların altındaki notu bulamadı. 23:38’de çıktı, 23:41’de kameraya yakalandı.',
    ),
    L(
      'Everyone else lied too, for their own reasons. Jonas hid the call because he was afraid of what the copy made him. Miriam hid her visit because she was breaching her consignment contract. Leo hid his return because he had stolen a bow. None of those lies was the murder.',
      'Diğerleri de kendi sebepleriyle yalan söyledi. Jonas aramayı sakladı; çünkü o kopyanın onu ne hâle soktuğundan korkuyordu. Miriam ziyaretini sakladı; çünkü konsinye sözleşmesini çiğniyordu. Leo geri döndüğünü sakladı; çünkü bir yay çalmıştı. Bu yalanların hiçbiri cinayet değildi.',
    ),
  ],
};

export const people: CaseDefinition['people'] = [
  {
    id: 'p-thomas', name: 'Thomas Kessler', role: L('Victim', 'Maktul'),
    description: L(
      '61. Master violin maker and dealer. Founded Kessler Strings in 1986. Exacting, proud, famously honest about instruments, less so about his own health. Widowed in 2009.',
      '61 yaşında. Usta keman yapımcısı ve satıcısı. Kessler Strings’i 1986’da kurdu. Titiz, gururlu; çalgılar konusunda dürüstlüğüyle ünlü, kendi sağlığı konusunda o kadar değil. 2009’da eşini kaybetti.',
    ),
  },
  {
    id: 'p-varga', name: 'Ilse Varga', role: L('Neighbour', 'Komşu'),
    description: L(
      '74. Retired schoolteacher. Lives on the first floor across the courtyard from the workshop’s back windows.',
      '74 yaşında, emekli öğretmen. Avlunun karşısında, atölyenin arka pencerelerine bakan birinci katta oturuyor.',
    ),
  },
  {
    id: 'p-okafor', name: 'Ruben Okafor', role: L('Bartender, The Anchor', 'Barmen, The Anchor'),
    description: L(
      'Works the late shift at The Anchor, a pub on Kanalgade, across the river from Brenner Lane.',
      'Brenner Sokağı’nın nehir karşısında, Kanalgade’deki The Anchor adlı birahanede gece vardiyasında çalışıyor.',
    ),
  },
  {
    id: 'p-lind', name: 'Dr Hanne Lind', role: L('Forensic pathologist', 'Adli tıp uzmanı'),
    description: L('Hallstedt Institute of Forensic Medicine.', 'Hallstedt Adli Tıp Enstitüsü.'),
  },
];

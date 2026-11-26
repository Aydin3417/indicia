// SERVER-ONLY. Kessler Workshop — the deduction notebook (13 questions) and what each confirmation opens.
// Core chain (needed for a confession): not-fall → varnish → copy → timeline → weapon → motive.
// Side questions clear the innocents and open their remaining testimony; they count towards the Proof star.
// Wave 4 adds three optional ones (the courtyard lamp, follow the money, who cleaned the mallet): the Proof star
// needs 11 of 13, so a player chooses which side roads to take.
// Turkish prompts never attach a case suffix to a blank: the filled value would break vowel harmony.
import type { DeductionDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const deductions: DeductionDef[] = [
  {
    id: 'd-not-fall', kind: 'fill',
    title: L('Not a fall', 'Düşme değil'),
    prompt: L('Thomas did not fall from the ladder: {proof}', 'Thomas merdivenden düşmedi: {proof}'),
    blanks: [{ id: 'proof', type: 'fact', label: L('proof', 'kanıt'), accept: ['f-no-fall', 'f-rungs-clean'] }],
    requires: { evidence: ['ev-body'] },
    effects: [{ type: 'unlock', target: 'analysis:a-cctv' }],
    confirmText: L(
      'Not an accident. This is a murder inquiry now: the traffic authority releases its camera data, and the back door’s fob log is worth pulling. Who came in last night?',
      'Kaza değil. Artık bu bir cinayet soruşturması: trafik müdürlüğü kamera kayıtlarını verecek, arka kapının kart kaydını da çekmeye değer. Dün gece içeri kim girdi?',
    ),
  },
  {
    id: 'd-varnish', kind: 'fill',
    title: L('What Thomas found', 'Thomas ne buldu'),
    prompt: L(
      'Thomas signed the violin out of the vault at {out}. Later {witness} saw him study it under the lamp; under UV {glow}, and his note records {brand}.',
      'Thomas kemanı kasadan çıkardı; saat {out}. Sonra onu kemanı lambanın altında incelerken gören kişi: {witness}. UV’de görünen: {glow}. Notunda yazan: {brand}.',
    ),
    blanks: [
      { id: 'out', type: 'time', label: L('signed out', 'çıkış saati'), accept: ['21:40'] },
      { id: 'witness', type: 'person', label: L('witness', 'tanık'), accept: ['leo'] },
      { id: 'glow', type: 'fact', label: L('the varnish', 'vernik'), accept: ['f-varnish-even', 'f-copy-modern'] },
      { id: 'brand', type: 'fact', label: L('what he found', 'bulduğu şey'), accept: ['f-note-jf'] },
    ],
    requires: { evidence: ['ev-note'] },
    effects: [{ type: 'unlock', target: 'analysis:a-violin' }],
    confirmText: L(
      'He knew that night. The Conservatory’s examiner agrees to open the case.',
      'O gece biliyordu. Konservatuvarın bilirkişisi kutuyu açmayı kabul ediyor.',
    ),
  },
  {
    id: 'd-copy', kind: 'fill',
    title: L('The violin in the vault', 'Kasadaki keman'),
    prompt: L('The violin in the vault is {what}. {maker} made it for {client}.', 'Kasadaki keman: {what}. Yapan: {maker}. Kimin için: {client}.'),
    blanks: [
      { id: 'what', type: 'choice', label: L('what it is', 'ne olduğu'), options: [{ id: 'o-original', text: L('the original', 'asıl çalgı') }, { id: 'o-copy', text: L('a copy', 'bir kopya') }], accept: ['o-copy'] },
      { id: 'maker', type: 'person', label: L('who made it', 'yapan'), accept: ['jonas'] },
      { id: 'client', type: 'person', label: L('for whom', 'kimin için'), accept: ['clara'] },
    ],
    requires: { evidence: ['ev-copyreport', 'ev-workbook'], facts: ['f-miriam-shock', 'f-no-exhibition'] },
    effects: [{ type: 'unlock', target: 'analysis:a-finance' }],
    confirmText: L(
      'A copy in the vault, and the owner never agreed to a sale. That is a crime against a client: the prosecutor signs a production order for the company accounts.',
      'Kasada bir kopya var ve sahibi hiçbir satışa onay vermedi. Bu bir müşteriye karşı işlenmiş suç: savcı şirket hesapları için ibraz kararını imzalıyor.',
    ),
  },
  {
    id: 'd-entry', kind: 'fill',
    title: L('The late visitor', 'Geç gelen ziyaretçi'),
    prompt: L(
      '{who} came in by the back door at {time}, and the camera confirms the arrival: {proof}',
      'Arka kapıdan giren: {who}; saat {time}. Kamera da gelişi doğruluyor: {proof}',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['clara'] },
      { id: 'time', type: 'time', label: L('when', 'saat'), accept: ['23:04'] },
      { id: 'proof', type: 'fact', label: L('camera', 'kamera'), accept: ['f-volvo-in'] },
    ],
    requires: { evidence: ['ev-accesslog'] },
    effects: [{ type: 'unlock', target: 'analysis:a-earring' }, { type: 'unlock', target: 'location:loc-clara' }],
    confirmText: L(
      'Clara Kessler was in the building inside the time of death. The trace lab can now compare the earring back — and the duty judge signs a warrant for her flat in Vesterlund.',
      'Clara Kessler ölüm saatinde binadaydı. İz laboratuvarı artık küpe arkalığını karşılaştırabilir; nöbetçi hâkim de Vesterlund’daki dairesi için arama izni veriyor.',
    ),
  },
  {
    id: 'd-timeline', kind: 'timeline',
    title: L('Who was inside', 'İçeride kim vardı'),
    prompt: L('Put the night in order. One card is a lie: set it aside.', 'Geceyi sıraya koy. Kartlardan biri yalan: onu ayır.'),
    cards: [
      { id: 'k1', text: L('Miriam’s Jaguar leaves the lane', 'Miriam’ın Jaguar’ı sokaktan çıkıyor') },
      { id: 'k2', text: L('The cyclist leaves the lane, bag heavier', 'Bisikletli sokaktan çıkıyor, çantası ağırlaşmış') },
      { id: 'k3', text: L('Thomas texts Clara: come now', 'Thomas Clara’ya yazıyor: hemen gel') },
      { id: 'k4', text: L('Clara’s fob opens the back door', 'Clara’nın kartı arka kapıyı açıyor') },
      { id: 'k5', text: L('The neighbour hears a heavy thump', 'Komşu ağır bir gümleme duyuyor') },
      { id: 'k6', text: L('Clara drives away; her father is alive', 'Clara arabasıyla gidiyor; babası yaşıyor') },
    ],
    order: ['k1', 'k2', 'k3', 'k4', 'k5'],
    outlier: 'k6',
    requires: { facts: ['f-jaguar-out', 'f-cyclist-out', 'f-jonas-told', 'f-sms', 'f-clara-2304', 'f-thump-2320', 'f-exit-2338'], statements: ['s-clara-visit'] },
    effects: [{ type: 'unlock', target: 'analysis:a-ledger' }],
    confirmText: L(
      'Miriam and the cyclist were gone before the text. Clara came in after it, and the only way out was at 23:38 — after the thump. Her “quarter past eleven” does not fit.',
      'Miriam de bisikletli de mesajdan önce gitmişti. Clara mesajdan sonra geldi; tek çıkış 23:38’de, gümlemeden sonra. Onun “on biri çeyrek geçe”si tutmuyor.',
    ),
  },
  {
    id: 'd-weapon', kind: 'fill',
    title: L('The weapon', 'Cinayet aleti'),
    prompt: L(
      'He was struck with {weapon}. Its face matches the wound — {wound} — and the seam gives it away: {blood}. The rag that wiped it: {rag}',
      'Ona vurulan alet: {weapon}. Vuruş yüzü yarayla örtüşüyor — {wound}. Birleşim yeri de ele veriyor: {blood}. Onu silen bez: {rag}',
    ),
    blanks: [
      {
        id: 'weapon', type: 'choice', label: L('what', 'ne'),
        options: [
          { id: 'o-mallet', text: L('the lignum vitae mallet', 'gayak ağacı tokmak') },
          { id: 'o-lamp', text: L('the UV lamp', 'UV lambası') },
          { id: 'o-fork', text: L('the tuning fork', 'diyapazon') },
          { id: 'o-ladder', text: L('the ladder', 'merdiven') },
        ],
        accept: ['o-mallet'],
      },
      { id: 'wound', type: 'fact', label: L('the wound', 'yara'), accept: ['f-single-blow'] },
      { id: 'blood', type: 'fact', label: L('the seam', 'birleşim yeri'), accept: ['f-mallet-blood'] },
      { id: 'rag', type: 'fact', label: L('the rag', 'bez'), accept: ['f-rag-damp', 'f-rag-blood'] },
    ],
    requires: { evidence: ['ev-mallet'] },
    effects: [{ type: 'unlock', target: 'topic:jonas:t-tools' }],
    confirmText: L(
      'The lignum vitae mallet. Someone wiped it and hung it back on its peg. Jonas knows that wall better than anyone.',
      'Gayak ağacı tokmak. Biri onu silip askısına geri asmış. O duvarı Jonas herkesten iyi bilir.',
    ),
  },
  {
    id: 'd-motive', kind: 'fill',
    title: L('The motive', 'Saik'),
    prompt: L(
      '{who} sold the real violin — {sale} — and the money cleared a loan Thomas never knew about: {debt}. Miriam’s notice — {deadline} — meant the copy would be found within the month.',
      'Asıl kemanı satan: {who} — {sale}. Para, Thomas’ın hiç bilmediği bir krediyi kapattı: {debt}. Miriam’ın bildirimi — {deadline} — kopyanın bir ay içinde ortaya çıkacağı demekti.',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['clara'] },
      // her own admission counts as proof of the sale (wave 4: reachable without the financial warrant)
      { id: 'sale', type: 'fact', label: L('the sale', 'satış'), accept: ['f-halberd-paid', 'f-halberd-bought', 'f-clara-sold'] },
      { id: 'debt', type: 'fact', label: L('the loan he never knew about', 'haberi olmadığı kredi'), accept: ['f-clara-loan', 'f-bank-papers'] },
      { id: 'deadline', type: 'fact', label: L('the deadline', 'son tarih'), accept: ['f-notice', 'f-miriam-notice'] },
    ],
    // the question opens once the books are on the table; the sale itself can come from the Geneva records or from
    // Clara’s own admission (wave 4: the Brandl letter or her Geneva receipt get her there without the warrant)
    requires: { evidence: ['ev-accounts'] },
    effects: [{ type: 'unlock', target: 'topic:miriam:t-clara' }],
    confirmText: L(
      'Her father found the copy a month too early. Exposure meant fraud, ruin and prison.',
      'Babası kopyayı bir ay erken buldu. Ortaya çıkması dolandırıcılık, iflas ve hapis demekti.',
    ),
  },
  {
    id: 'd-leo', kind: 'fill',
    title: L('The apprentice’s errand', 'Çırağın derdi'),
    prompt: L(
      '{who} let himself in at {time} — not for a charger but {why} — and was gone long before the thump: {gone}',
      'Kartıyla içeri giren: {who}; saat {time}. Şarj aleti için değil: {why}. Gümlemeden çok önce gitmişti: {gone}',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['leo'] },
      { id: 'time', type: 'time', label: L('when', 'saat'), accept: ['21:58'] },
      {
        id: 'why', type: 'choice', label: L('why', 'neden'),
        options: [
          { id: 'o-charger', text: L('to fetch his charger', 'şarj aletini almak için') },
          { id: 'o-violin', text: L('to look at the Guadagnini', 'Guadagnini’ye bakmak için') },
          { id: 'o-bow', text: L('to take the Sartory bow', 'Sartory yayı almak için') },
          { id: 'o-thomas', text: L('to confront Thomas', 'Thomas’la yüzleşmek için') },
        ],
        accept: ['o-bow'],
      },
      { id: 'gone', type: 'fact', label: L('gone', 'gidiş'), accept: ['f-cyclist-out', 'f-exit-2219'] },
    ],
    requires: { statements: ['s-leo-return'], facts: ['f-bow-missing'] },
    effects: [{ type: 'unlock', target: 'topic:leo:t-copy' }],
    confirmText: L(
      'A thief, not a killer: he left with the bow at 22:19, an hour before Thomas died. Relieved, he has more to say.',
      'Katil değil, hırsız: yayla birlikte 22:19’da çıktı, Thomas ölmeden bir saat önce. Rahatladı; söyleyecekleri var.',
    ),
  },
  {
    id: 'd-alibi', kind: 'fill',
    title: L('Across the river', 'Nehrin karşısı'),
    prompt: L(
      'Jonas paid for a drink at The Anchor at {time} — {distance}. He could not have been in the workshop when Thomas died.',
      'Jonas, The Anchor’da hesabı ödediğinde saat {time} idi — {distance}. Thomas öldüğünde atölyede olamazdı.',
    ),
    blanks: [
      { id: 'time', type: 'time', label: L('paid at', 'ödeme saati'), accept: ['23:12'] },
      { id: 'distance', type: 'fact', label: L('how far', 'mesafe'), accept: ['f-anchor-distance'] },
    ],
    requires: { evidence: ['ev-anchor'] },
    effects: [{ type: 'unlock', target: 'topic:jonas:t-clara' }],
    confirmText: L(
      'Jonas is out of it. Now that nobody suspects him, he will talk about Clara.',
      'Jonas’ın bu işle ilgisi yok. Artık kimse ondan şüphelenmediğine göre Clara hakkında konuşur.',
    ),
  },
  {
    id: 'd-miriam', kind: 'fill',
    title: L('The woman who shouted', 'Bağıran kadın'),
    prompt: L(
      'The woman the neighbour heard shouting was {who}. She was let out of the front door at {time}, and her car left the lane soon after: {car}',
      'Komşunun duyduğu bağıran kadın: {who}. Ön kapıdan çıkışı saat {time}. Arabası da hemen ardından sokaktan çıktı: {car}',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['miriam'] },
      { id: 'time', type: 'time', label: L('let out at', 'çıkış saati'), accept: ['22:12'] },
      { id: 'car', type: 'fact', label: L('the car', 'araba'), accept: ['f-jaguar-out'] },
    ],
    requires: { facts: ['f-shout-2200', 'f-diary-miriam'], statements: ['s-miriam-visit'] },
    effects: [{ type: 'unlock', target: 'topic:miriam:t-late-call' }],
    confirmText: L(
      'Miriam left at 22:12, nearly an hour before the death window. Her lie protected a contract, not a killer.',
      'Miriam 22:12’de çıktı, ölüm aralığından neredeyse bir saat önce. Yalanı bir katili değil, bir sözleşmeyi koruyordu.',
    ),
  },

  // ── wave 4: side questions. Optional, each reached through a side lead; they count for the Proof star and
  // make a finale round easier (their chips come forward). Neither is needed for a confession.
  {
    id: 'd-courtyard', kind: 'fill',
    title: L('The courtyard lamp', 'Avlu lambası'),
    prompt: L(
      'The lamp only comes on for someone at the back door — {sensor}. The last crossing of the night was at {out}, after the thump. Of everyone in the case, only one could have been at that door then: {who}.',
      'Lamba yalnızca arka kapıya gelen biri için yanıyor — {sensor}. Gecenin son geçişi saat {out}; gümlemeden sonra. O saatte o kapıda olabilecek tek kişi: {who}.',
    ),
    blanks: [
      { id: 'sensor', type: 'fact', label: L('the lamp', 'lamba'), accept: ['f-light-sensor'] },
      { id: 'out', type: 'time', label: L('last crossing', 'son geçiş'), accept: ['23:39'] },
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['clara'] },
    ],
    requires: { facts: ['f-light-2339'] },
    confirmText: L(
      'A witness who never looked out, and a list that did. Whoever came in at 23:03 left after the thump — nearly half an hour after “a quarter past eleven”.',
      'Dışarı hiç bakmamış bir tanık ve her şeyi yazmış bir liste. 23:03’te giren, gümlemeden sonra çıktı — “on biri çeyrek geçe”den neredeyse yarım saat sonra.',
    ),
  },
  {
    // the shortcut for a sharp player: the money trail opens the accounts without waiting for the violin examiner
    id: 'd-money', kind: 'fill',
    title: L('Follow the money', 'Paranın izi'),
    prompt: L(
      'Somebody drew up a loan in Thomas’s name — {papers} — and a company paid it off — {repaid} — the day after a trip to Geneva: {geneva}. The papers and the company lead to {who}.',
      'Biri Thomas adına bir kredi hazırlamış — {papers}. Krediyi bir şirket kapatmış — {repaid}. Hem de bir Cenevre yolculuğunun ertesi günü: {geneva}. Evrak da şirket de aynı kişiye çıkıyor: {who}.',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['clara'] },
      { id: 'papers', type: 'fact', label: L('the loan', 'kredi'), accept: ['f-bank-papers', 'f-clara-loan'] },
      { id: 'repaid', type: 'fact', label: L('the repayment', 'geri ödeme'), accept: ['f-loan-repaid'] },
      { id: 'geneva', type: 'fact', label: L('Geneva', 'Cenevre'), accept: ['f-geneva-trip', 'f-halberd-listed'] },
    ],
    requires: { facts: ['f-loan-repaid'] },
    effects: [{ type: 'unlock', target: 'analysis:a-finance' }],
    confirmText: L(
      'Nine hundred thousand euros from a company with no trade, the day after Geneva. The prosecutor signs the production order for the accounts without waiting for the violin.',
      'Hiçbir ticari işi olmayan bir şirketten dokuz yüz bin avro; hem de Cenevre dönüşünün ertesi günü. Savcı, kemanı beklemeden hesaplar için ibraz kararını imzalıyor.',
    ),
  },
  {
    id: 'd-clean', kind: 'fill',
    title: L('Who cleaned the mallet', 'Tokmağı kim temizledi'),
    prompt: L(
      'Someone wiped the heaviest mallet and hung it back — {peg} — with the naphtha from the sink: {rag}. Everyone who works here handles that can; the trace that left the building that night — {trace} — belongs to {who}.',
      'Biri en ağır tokmağı silip yerine asmış — {peg} — lavabonun altındaki neftle: {rag}. O bidonu burada çalışan herkes kullanır; o gece binadan dışarı çıkan iz — {trace} — şu kişiye ait: {who}.',
    ),
    blanks: [
      { id: 'peg', type: 'fact', label: L('the mallet', 'tokmak'), accept: ['f-peg-wiped', 'f-mallet-crooked', 'f-mallet-wiped'] },
      { id: 'rag', type: 'fact', label: L('the rag', 'bez'), accept: ['f-rag-damp', 'f-rag-blood'] },
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['clara'] },
      { id: 'trace', type: 'fact', label: L('the trace', 'iz'), accept: ['f-volvo-naphtha', 'f-coat-naphtha'] },
    ],
    requires: { facts: ['f-rag-damp'], deductions: ['d-entry'] },
    confirmText: L(
      'The rag in the bin and the solvent she carried home tell one story: the hands that wiped the weapon were Clara Kessler’s.',
      'Kovadaki bez ve eve taşıdığı çözücü aynı hikâyeyi anlatıyor: cinayet aletini silen eller Clara Kessler’indi.',
    ),
  },
];

// SERVER-ONLY. Kessler Workshop — v2 game layer: clock, availability, finale, night events, ideal path.
import type { CaseV2 } from '../../engine/types.ts';
import { L } from '../text.ts';
import { facts } from './facts.ts';
import { scenes } from './scenes.ts';
import { deductions } from './deductions.ts';

export const kesslerV2Layer: CaseV2 = {
  clock: {
    days: 3,
    minutesPerDay: 480,
    dayStart: '08:00',
    labSlots: 2,
    // raising a topic is a question too: 5 minutes (PLAYTEST_V3: with colour-only presses now free, this keeps
    // "doing everything" above the budget and the ideal path near 60 %)
    costs: { openTopic: 5 },
    startLocationId: null,
    availability: {
      jonas: [
        // until 13:00 (was noon): a first-time player who sends the phone to the lab by ~10:30 can still put the 22:43 call to him
        { day: 1, to: 300, note: L('At the workshop until 13:00, then sent home', '13.00’e kadar atölyede, sonra eve gönderildi') },
        { day: 2, from: 240, note: L('Mornings at the funeral home; free from 12:00', 'Sabahları cenaze evinde; 12:00’den sonra müsait') },
        { day: 3 },
      ],
      miriam: [
        // until 13:00 (was noon): the ANPR result she breaks on arrives around midday for a player who confirms 'Not a fall' early on day 2
        { day: 2, to: 300, note: L('Only with her lawyer, until 13:00', 'Yalnızca avukatıyla, 13.00’e kadar') },
        { day: 3, to: 300, note: L('Only with her lawyer, until 13:00', 'Yalnızca avukatıyla, 13.00’e kadar') },
      ],
      leo: [
        { day: 1, from: 240, note: L('At trade school until noon', 'Öğlene kadar meslek okulunda') },
        { day: 2 },
        { day: 3 },
      ],
    },
  },

  facts,
  scenes,
  deductions,

  finale: {
    intro: L(
      'The prosecutor gives you one hour with the accused and their lawyer. Five defences, two tries each. Answer every one from your notebook — a confirmed deduction speaks louder than a single fact.',
      'Savcı sana sanık ve avukatıyla bir saat veriyor. Beş savunma, her birine iki hak. Hepsine defterinden cevap ver — doğrulanmış bir çıkarım, tek bir bulgudan daha gür konuşur.',
    ),
    rounds: [
      {
        id: 'r-opportunity', kind: 'opportunity',
        defence: L('I left at a quarter past eleven. He was alive when I walked out.', 'On biri çeyrek geçe çıktım. Kapıdan çıkarken yaşıyordu.'),
        prompt: L('Show that she was still inside after 23:15.', '23:15’ten sonra hâlâ içeride olduğunu göster.'),
        // wave 4: the neighbour’s lamp list (d-courtyard) and her own earring are other ways in
        accept: ['d-timeline', 'f-exit-2338', 'f-volvo-out', 'ev-accesslog', 'd-courtyard', 'f-light-2339', 'f-clara-earring'],
        assist: ['d-timeline', 'd-entry', 'd-courtyard'], refutes: ['s-clara-visit'],
        win: L('(She looks at the log for a long time.) … I must have sat with him longer than I thought.', '(Kayda uzun uzun bakar.) … Demek sandığımdan uzun oturmuşum yanında.'),
        lose: L('You can’t prove what time I walked out of that door.', 'O kapıdan saat kaçta çıktığımı kanıtlayamazsınız.'),
      },
      {
        id: 'r-lie', kind: 'lie',
        defence: L('He rang about Saturday’s dinner. That was all it was.', 'Cumartesi yemeği için aradı. Hepsi bu.'),
        prompt: L('Show what the call was really about.', 'Aramanın aslında ne hakkında olduğunu göster.'),
        accept: ['f-sms', 'ev-calllog', 'f-clara-threat'], refutes: ['s-clara-call'],
        win: L('“Come now or I call the police tonight.” … Yes. Those were his words.', '“Hemen gel, yoksa bu gece polisi ararım.” … Evet. Aynen böyle demişti.'),
        lose: L('A father calls his daughter. That proves nothing.', 'Bir baba kızını arar. Bu hiçbir şey kanıtlamaz.'),
      },
      {
        id: 'r-motive', kind: 'motive',
        defence: L('Why would I hurt my own father? I inherit everything anyway.', 'Kendi babama neden zarar vereyim? Zaten her şey bana kalacaktı.'),
        prompt: L('Show why she needed him silent that night.', 'O gece onun susmasına neden ihtiyaç duyduğunu göster.'),
        accept: ['d-motive', 'f-halberd-paid', 'f-halberd-bought', 'ev-geneva', 'f-clara-sold'],
        assist: ['d-motive'], refutes: ['s-clara-copy'],
        win: L('(The lawyer stops writing.) Halberd. … He would have called Miriam first. Then the police.', '(Avukat yazmayı bırakır.) Halberd. … Önce Miriam’ı arayacaktı. Sonra polisi.'),
        lose: L('Money troubles are not murder, Detective.', 'Para sıkıntısı cinayet değildir, Komiser.'),
      },
      {
        id: 'r-means', kind: 'means',
        defence: L('I don’t use the tools. I do the accounts.', 'Ben aletleri kullanmam. Hesaplara bakarım.'),
        prompt: L('Show the weapon.', 'Cinayet aletini göster.'),
        // wave 4: who cleaned the mallet (the night fork or her coat) answers it without waiting for serology
        accept: ['d-weapon', 'f-mallet-blood', 'ev-serology', 'd-clean'],
        assist: ['d-weapon', 'd-clean'],
        win: L('Somebody cleaned it. Somebody who knew where the naphtha was kept.', 'Biri onu temizlemiş. Neftin nerede durduğunu bilen biri.'),
        lose: L('There are dozens of tools in that room.', 'O odada onlarca alet var.'),
      },
      {
        id: 'r-staging', kind: 'staging',
        defence: L('He fell from that ladder. I told him a hundred times to hold the rail.', 'O merdivenden düştü. Tırabzanı tut diye yüz kere söyledim.'),
        prompt: L('Show that the fall was staged.', 'Düşmenin sahnelendiğini göster.'),
        accept: ['d-not-fall', 'f-no-fall', 'f-rungs-clean', 'ev-autopsy'],
        assist: ['d-not-fall'], refutes: ['s-clara-ladder'],
        win: L('… I pushed the ladder over. Afterwards. I don’t know why.', '… Merdiveni ben devirdim. Sonra. Neden yaptım bilmiyorum.'),
        lose: L('He was sixty-one. Old men fall.', 'Altmış bir yaşındaydı. Yaşlı adamlar düşer.'),
      },
    ],
    confession: {
      line: L(
        'He turned his back on me. He was reaching for the phone. He said he’d call Miriam first, and then the police. I don’t remember picking it up. I remember the sound. … I’d like to speak to a lawyer now.',
        'Bana sırtını döndü. Telefona uzanıyordu. Önce Miriam’ı, sonra polisi arayacağını söyledi. Onu elime aldığımı hatırlamıyorum. Sesi hatırlıyorum. … Artık bir avukatla görüşmek istiyorum.',
      ),
      statementId: 's-clara-confession',
    },
    innocents: {
      jonas: {
        defence: L('I was across the river with a glass in my hand. Ask Ruben. Check my card.', 'Nehrin karşı yakasındaydım, elimde kadehle. Ruben’e sorun. Kartıma bakın.'),
        collapse: L(
          'The Anchor’s card records put Jonas at the bar at 23:12, twenty-five minutes’ walk away. The case collapses, and the real killer walks out of the building.',
          'The Anchor’ın kart kayıtları Jonas’ı 23:12’de, yürüyerek yirmi beş dakika ötedeki barda gösteriyor. Dava çöküyor; gerçek katil binadan elini kolunu sallayarak çıkıyor.',
        ),
      },
      miriam: {
        defence: L('My car left that lane at a quarter past ten, Detective. It is on your own camera.', 'Arabam o sokaktan onu çeyrek geçe çıktı, Komiser. Kendi kameranızda var.'),
        collapse: L(
          'Miriam was home before the time of death. Her lawyer has the camera extract before you finish the sentence. The prosecutor withdraws the charge.',
          'Miriam ölüm saatinden önce evindeydi. Siz cümlenizi bitirmeden avukatı kamera dökümünü masaya koyuyor. Savcı suçlamayı geri çekiyor.',
        ),
      },
      leo: {
        defence: L('I stole a bow. I didn’t kill anyone. I was out of there by twenty past ten.', 'Bir yay çaldım. Kimseyi öldürmedim. Onu yirmi geçe oradan çıkmıştım.'),
        collapse: L(
          'Leo left at 22:19, an hour before the time of death. A thief, not a killer. The charge does not hold.',
          'Leo 22:19’da çıktı, ölüm saatinden bir saat önce. Hırsız, ama katil değil. Suçlama tutmuyor.',
        ),
      },
    },
    // wave 4: 11 of the 13 questions — the airtight case may skip two (side questions, or an innocent's)
    stars: { proofDeductions: 0.84 },
  },

  // wave 5 — shared investigations: the bank adviser opens the loan file to one investigator, and the pawnbroker turns
  // his book round for one; what they see stays in that investigator's notes until they read it out to the team.
  coop: { private: { locations: ['loc-bank', 'loc-pawn'] } },

  // Only the first night event whose requirement is met fires; the unconditional one is the fallback.
  // Forks (with `choice`) are a separate channel: the first matching fork is offered as well (wave 4).
  nightEvents: [
    {
      // wave 4 — the night fork: chase it tonight (start late) or leave it to the morning team (lose a lab slot)
      id: 'n1-volvo', afterDay: 1, requires: { deductions: ['d-entry'] },
      title: L('Clara’s car', 'Clara’nın arabası'),
      text: L(
        'At 23:50 the night desk rings: Clara Kessler’s Volvo is parked outside her building in Vesterlund, and the duty judge will sign a seizure order now. Someone has to stand in the cold while it is lifted and walk the swabs to the night bench — or the morning team can do it and the lab will read them tomorrow.',
        'Gece 23:50’de nöbet masası arıyor: Clara Kessler’in Volvo’su Vesterlund’daki apartmanının önünde duruyor; nöbetçi hâkim el koyma kararını hemen imzalayacak. Araba çekilirken birinin soğukta beklemesi, svapları da gece tezgâhına kendi eliyle götürmesi lazım — ya da sabah ekibi halleder, laboratuvar da yarın okur.',
      ),
      choice: {
        prompt: L('Who takes the car?', 'Arabayı kim alsın?'),
        options: [
          {
            id: 'fk-morning', label: L('Leave it to the morning team', 'Sabah ekibi halletsin'),
            text: L(
              'You sleep. The car is lifted at eight and the swabs go to the lab: one of your two slots is busy until noon.',
              'Uyursun. Araba sabah sekizde çekilir, svaplar laboratuvara gider: iki hattından biri öğlene kadar dolu.',
            ),
            grants: { evidence: ['ev-volvo'] },
            lab: 'a-volvo',
          },
          {
            id: 'fk-tonight', label: L('Go yourself, tonight', 'Bu gece sen git'),
            minutes: 60,
            text: L(
              // wave 6: the option is read before choosing — it says what the night costs, not what the swabs show
              'You stand in the cold while it is lifted and carry the swabs to the night bench yourself. You are home at three with the answer in your pocket, and you start the day an hour late.',
              'Araba çekilirken soğukta beklersin, svapları gece tezgâhına kendin götürürsün. Saat üçte cevap cebinde eve dönersin; güne bir saat geç başlarsın.',
            ),
            grants: { evidence: ['ev-volvo'], facts: ['f-volvo-naphtha'] },
          },
        ],
      },
    },
    {
      // wave 4 — the last-morning fork: an early call to Geneva costs an hour; the written request costs the morning
      // (ready at 11:00, past the Clock star's 10:00). Matters for whoever sent the financial warrant late.
      id: 'n2-halberd', afterDay: 2, requires: { deductions: ['d-copy'] },
      title: L('Geneva is awake', 'Cenevre uyanık'),
      text: L(
        'The prosecutor’s clerk rings at 22:40: Halberd’s compliance officer in Geneva will take one call from the Hallstedt police at seven tomorrow, before the markets open. Otherwise the night desk sends the request in writing and Geneva answers when Geneva answers.',
        'Savcılık kâtibi 22:40’ta arıyor: Halberd’in Cenevre’deki uyum sorumlusu yarın sabah yedide, piyasalar açılmadan, Hallstedt polisinden tek bir telefon kabul edecek. Yoksa nöbet masası talebi yazılı gönderir; Cenevre de ne zaman isterse o zaman cevap verir.',
      ),
      choice: {
        prompt: L('Call Geneva at seven?', 'Cenevre’yi yedide arayacak mısın?'),
        options: [
          {
            id: 'fk-letter', label: L('Send it in writing', 'Yazılı gönderilsin'),
            text: L('The request goes by fax at eight. A lab slot waits on Geneva until about eleven.', 'Talep sekizde faksla gider. Bir laboratuvar hattı on bire kadar Cenevre’yi bekler.'),
            lab: 'a-halberd',
          },
          {
            id: 'fk-call', label: L('Be at your desk at seven', 'Yedide masanda ol'), minutes: 60,
            text: L(
              // wave 6: no spoiler before the choice — the invoice itself arrives as the finding
              'A dry voice in Geneva reads you the invoice for what Halberd bought in September, line by line. You are an hour into the day before it starts.',
              'Cenevre’den kuru bir ses, Halberd’in eylülde aldığı şeyin faturasını satır satır okuyor. Gün başlamadan bir saatini harcamışsın.',
            ),
            grants: { facts: ['f-halberd-bought'] },
          },
        ],
      },
    },
    {
      // the apprentice is already explained (a first-day win): the registry confirms it instead of asking "Leo?"
      id: 'n1-pawn-known', afterDay: 1, requires: { deductions: ['d-leo'] },
      title: L('The pawn ticket comes in', 'Rehin fişi geldi'),
      text: L(
        'At 02:10 the registry confirms what the door log already told you: a Sartory bow, pledged at Kaiser Pfand at 09:10 yesterday, in Leo Brandt’s name. One thing less to wonder about — and one more reason for Leo to talk.',
        'Gece 02:10’da rehin kaydı, kapı dökümünün sana söylediğini doğruluyor: bir Sartory yay, dün sabah 09:10’da Kaiser Pfand’a Leo Brandt adına rehin bırakılmış. Merak edecek bir şey eksildi; Leo’nun konuşması için de bir sebep arttı.',
      ),
      grants: { evidence: ['ev-pawn'] },
    },
    {
      id: 'n1-pawn', afterDay: 1, requires: { evidence: ['ev-bowcabinet'] },
      title: L('A ping from the pawn registry', 'Rehin kayıtlarından bir sinyal'),
      text: L(
        'At 02:10 the registry flags a Sartory bow pledged yesterday at 09:10 at Kaiser Pfand. The name on the ticket is Leo Brandt. The night sergeant has left the printout on your desk with a single word underlined: “Leo?”',
        'Gece 02:10’da kayıt sistemi dün sabah 09:10’da Kaiser Pfand’a rehin bırakılmış bir Sartory yayı işaretliyor. Fişteki isim: Leo Brandt. Nöbetçi komiser çıktıyı masana bırakmış, tek kelimenin altını çizmiş: “Leo?”',
      ),
      grants: { evidence: ['ev-pawn'] },
    },
    {
      id: 'n1-lawyer', afterDay: 1, requires: { statements: ['s-clara-visit'] },
      title: L('Clara calls a lawyer', 'Clara avukat tutuyor'),
      text: L(
        'At 21:30 a partner from Brandauer & Holm phones the desk: from tomorrow Clara Kessler answers nothing without him in the room. He sounds bored. Lawyers who sound bored have usually read the file.',
        'Saat 21:30’da Brandauer & Holm’dan bir ortak avukat masayı arıyor: yarından itibaren Clara Kessler o odada olmadan hiçbir soruya cevap vermeyecek. Sesi sıkılmış gibi. Sıkılmış gibi konuşan avukatlar genellikle dosyayı okumuştur.',
      ),
    },
    {
      id: 'n-day1', afterDay: 1,
      title: L('Night desk', 'Gece nöbeti'),
      text: L(
        'The duty sergeant leaves a note: the lab works through the night, results will be waiting in the morning. Underneath, in another hand: “Mrs Achterberg’s lawyer called. She will see you tomorrow, until one o’clock.”',
        'Nöbetçi komiser bir not bırakmış: laboratuvar gece de çalışıyor, sonuçlar sabah hazır olacak. Altında başka bir el yazısı: “Bayan Achterberg’in avukatı aradı. Yarın görüşecekmiş, saat bire kadar.”',
      ),
    },
    {
      id: 'n2-ruben', afterDay: 2, requires: { evidence: ['ev-anchor-claim'] },
      title: L('A bartender at the front desk', 'Ön bankoda bir barmen'),
      text: L(
        'Ruben Okafor turns up at the station at midnight, still in his apron, with a printout of the bar’s card terminal. “Jonas said you’d want this. He was on that stool all night.”',
        'Ruben Okafor gece yarısı, önlüğü hâlâ üstünde, barın kart makinesinin döküm kâğıdıyla emniyete geliyor. “Jonas bunu isteyeceğinizi söyledi. Bütün gece o taburedeydi.”',
      ),
      grants: { evidence: ['ev-anchor'] },
    },
    {
      id: 'n-day2', afterDay: 2,
      title: L('The prosecutor calls', 'Savcı arıyor'),
      text: L(
        '“Tomorrow I want a name — and I want it to hold. Bring me opportunity, motive and means, and bring them before lunch.”',
        '“Yarın bir isim istiyorum — ve sağlam olsun. Fırsatı, saiki ve aracı getir; öğle yemeğinden önce getir.”',
      ),
    },
  ],

  // A sensible first-timer's day 1 (PLAYTEST_V2 §7.1): looks at every spot in the workshop first, files the
  // obvious-but-wrong proof once, shows Jonas the wrong thing once, reaches the back entrance only after lunch.
  // The validator checks the early win (Not a fall, 09:50, ~7 real minutes) and ≥ 2 confirmations by the evening
  // (here 3: the late visitor at 14:55 and the apprentice at 15:45, after two wrong filings and a wrong present).
  newcomerPath: {
    firstWinBy: 150,
    firstWinRealMinutes: 10,
    minConfirmedDay1: 2,
    steps: [
      { do: 'travel', to: 'loc-workshop' },
      { do: 'inspect', zone: 'z-body' },
      { do: 'detail', zone: 'z-body', detail: 'd-glasses' },
      { do: 'detail', zone: 'z-body', detail: 'd-hands' },
      { do: 'lab', analysis: 'a-phone' },
      { do: 'inspect', zone: 'z-ladder' },
      { do: 'detail', zone: 'z-ladder', detail: 'd-shelfdust' },
      { do: 'detail', zone: 'z-ladder', detail: 'd-rungs' },
      { do: 'wrongDeduce', deduction: 'd-not-fall', fills: { proof: 'f-hands-clean' } },
      { do: 'deduce', deduction: 'd-not-fall', fills: { proof: 'f-rungs-clean' } },
      { do: 'lab', analysis: 'a-cctv' },
      { do: 'inspect', zone: 'z-bench' },
      { do: 'detail', zone: 'z-bench', detail: 'd-lamp' },
      { do: 'detail', zone: 'z-bench', detail: 'd-mirror' },
      { do: 'inspect', zone: 'z-papers' },
      { do: 'collect', evidence: 'ev-note', fact: 'f-note-jf' },
      // the confirmation said "the back door's fob log is worth pulling": the newcomer follows it
      { do: 'travel', to: 'loc-back' },
      { do: 'inspect', zone: 'z-reader' },
      { do: 'labCollect' },
      { do: 'lab', analysis: 'a-access' },
      { do: 'collect', evidence: 'ev-calllog', fact: 'f-sms' },
      { do: 'collect', evidence: 'ev-calllog', fact: 'f-call-jonas' },
      { do: 'inspect', zone: 'z-courtyard' },
      { do: 'detail', zone: 'z-courtyard', detail: 'd-tyres' },
      { do: 'travel', to: 'loc-workshop' },
      { do: 'inspect', zone: 'z-toolwall' },
      { do: 'detail', zone: 'z-toolwall', detail: 'd-crooked' },
      { do: 'interview', suspect: 'jonas' },
      { do: 'topic', suspect: 'jonas', topic: 't-discovery' },
      { do: 'press', suspect: 'jonas', claim: 'c-jonas-found' },
      { do: 'topic', suspect: 'jonas', topic: 't-call' },
      { do: 'wrongPresent', suspect: 'jonas', claim: 'c-jonas-missed', item: 'f-glasses' },
      { do: 'present', suspect: 'jonas', claim: 'c-jonas-missed', item: 'f-call-jonas' },
      { do: 'topic', suspect: 'jonas', topic: 't-evening' },
      { do: 'leave', suspect: 'jonas' },
      { do: 'inspect', zone: 'z-floor' },
      { do: 'detail', zone: 'z-floor', detail: 'd-glint' },
      { do: 'inspect', zone: 'z-bows' },
      { do: 'detail', zone: 'z-bows', detail: 'd-slot' },
      { do: 'labCollect' },
      { do: 'collect', evidence: 'ev-cctv', fact: 'f-volvo-in' },
      { do: 'collect', evidence: 'ev-cctv', fact: 'f-cyclist-out' },
      { do: 'collect', evidence: 'ev-accesslog', fact: 'f-clara-2304' },
      { do: 'collect', evidence: 'ev-accesslog', fact: 'f-leo-2158' },
      { do: 'wrongDeduce', deduction: 'd-entry', fills: { who: 'clara', time: '23:02', proof: 'f-volvo-in' } },
      { do: 'deduce', deduction: 'd-entry', fills: { who: 'clara', time: '23:04', proof: 'f-volvo-in' } },
      { do: 'interview', suspect: 'leo' },
      { do: 'topic', suspect: 'leo', topic: 't-evening' },
      { do: 'present', suspect: 'leo', claim: 'c-leo-home', item: 'f-bike-tracks' },
      { do: 'leave', suspect: 'leo' },
      { do: 'deduce', deduction: 'd-leo', fills: { who: 'leo', time: '21:58', why: 'o-bow', gone: 'f-cyclist-out' } },
      // 15:45: the day is nearly spent; the sink and Clara wait for tomorrow
      { do: 'endDay' },
    ],
  },

  // A scripted perfect run (all three stars). The validator replays it under the real rules.
  idealPath: [
    // ── day 1: the scene, the doors, the first lies
    { do: 'travel', to: 'loc-workshop' },
    { do: 'inspect', zone: 'z-body' },
    { do: 'lab', analysis: 'a-phone' },
    { do: 'inspect', zone: 'z-ladder' },
    { do: 'detail', zone: 'z-ladder', detail: 'd-rungs' },
    { do: 'deduce', deduction: 'd-not-fall', fills: { proof: 'f-rungs-clean' } },
    { do: 'lab', analysis: 'a-cctv' },
    { do: 'inspect', zone: 'z-bench' },
    { do: 'inspect', zone: 'z-papers' },
    { do: 'collect', evidence: 'ev-note', fact: 'f-note-jf' },
    { do: 'travel', to: 'loc-back' },
    { do: 'inspect', zone: 'z-reader' },
    { do: 'labCollect' },
    { do: 'lab', analysis: 'a-access' },
    { do: 'collect', evidence: 'ev-calllog', fact: 'f-sms' },
    { do: 'collect', evidence: 'ev-calllog', fact: 'f-call-jonas' },
    { do: 'inspect', zone: 'z-courtyard' },
    { do: 'detail', zone: 'z-courtyard', detail: 'd-tyres' },
    { do: 'interview', suspect: 'jonas' },
    { do: 'topic', suspect: 'jonas', topic: 't-call' },
    { do: 'present', suspect: 'jonas', claim: 'c-jonas-missed', item: 'f-call-jonas' },
    { do: 'topic', suspect: 'jonas', topic: 't-evening' },
    { do: 'leave', suspect: 'jonas' },
    { do: 'interview', suspect: 'leo' },
    { do: 'topic', suspect: 'leo', topic: 't-evening' },
    { do: 'present', suspect: 'leo', claim: 'c-leo-home', item: 'f-bike-tracks' },
    { do: 'topic', suspect: 'leo', topic: 't-violin' },
    { do: 'press', suspect: 'leo', claim: 'c-leo-never' },
    { do: 'leave', suspect: 'leo' },
    { do: 'travel', to: 'loc-vault' },
    { do: 'inspect', zone: 'z-ledger' },
    { do: 'collect', evidence: 'ev-ledger', fact: 'f-ledger-noin' },
    { do: 'inspect', zone: 'z-violincase' },
    { do: 'detail', zone: 'z-violincase', detail: 'd-varnish' },
    { do: 'deduce', deduction: 'd-varnish', fills: { out: '21:40', witness: 'leo', glow: 'f-varnish-even', brand: 'f-note-jf' } },
    { do: 'labCollect' },
    { do: 'lab', analysis: 'a-violin' },
    { do: 'collect', evidence: 'ev-cctv', fact: 'f-jaguar-in' },
    { do: 'collect', evidence: 'ev-cctv', fact: 'f-jaguar-out' },
    { do: 'collect', evidence: 'ev-cctv', fact: 'f-cyclist-out' },
    { do: 'collect', evidence: 'ev-cctv', fact: 'f-volvo-in' },
    { do: 'collect', evidence: 'ev-neighbour', fact: 'f-thump-2320' },
    { do: 'collect', evidence: 'ev-neighbour', fact: 'f-shout-2200' },
    { do: 'interview', suspect: 'clara' },
    { do: 'topic', suspect: 'clara', topic: 't-call' },
    { do: 'present', suspect: 'clara', claim: 'c-clara-dinner', item: 'f-sms' },
    { do: 'labCollect' },
    { do: 'collect', evidence: 'ev-accesslog', fact: 'f-clara-2304' },
    { do: 'collect', evidence: 'ev-accesslog', fact: 'f-exit-2338' },
    { do: 'collect', evidence: 'ev-accesslog', fact: 'f-front-2212' },
    { do: 'collect', evidence: 'ev-accesslog', fact: 'f-leo-2158' },
    { do: 'topic', suspect: 'clara', topic: 't-evening' },
    { do: 'present', suspect: 'clara', claim: 'c-clara-home', item: 'f-clara-2304' },
    { do: 'leave', suspect: 'clara' },
    { do: 'deduce', deduction: 'd-entry', fills: { who: 'clara', time: '23:04', proof: 'f-volvo-in' } },
    { do: 'deduce', deduction: 'd-timeline', order: ['k1', 'k2', 'k3', 'k4', 'k5'], outlier: 'k6' },
    { do: 'endDay' },

    // ── day 2: the owner in the morning, the maker after noon, the books in between
    // (the night fork: the car is taken tonight. The perfect player pays the hour: the morning-team option holds a slot
    // until noon, which pushes the alibi check or the financial warrant past the end of the day — measured, see K.md)
    { do: 'nightChoice', option: 'fk-tonight' },
    { do: 'labCollect' },
    { do: 'lab', analysis: 'a-autopsy' },
    { do: 'lab', analysis: 'a-anchor' },
    { do: 'collect', evidence: 'ev-copyreport', fact: 'f-copy-jf' },
    { do: 'collect', evidence: 'ev-copyreport', fact: 'f-is-copy' },
    { do: 'interview', suspect: 'miriam' },
    { do: 'topic', suspect: 'miriam', topic: 't-evening' },
    { do: 'present', suspect: 'miriam', claim: 'c-miriam-home', item: 'f-jaguar-in' },
    { do: 'topic', suspect: 'miriam', topic: 't-violin' },
    { do: 'present', suspect: 'miriam', claim: 'c-miriam-impatient', item: 'f-jaguar-in' },
    { do: 'present', suspect: 'miriam', claim: 'c-miriam-vienna', item: 'f-is-copy' },
    { do: 'leave', suspect: 'miriam' },
    { do: 'travel', to: 'loc-office' },
    { do: 'inspect', zone: 'z-desk' },
    { do: 'collect', evidence: 'ev-diary', fact: 'f-diary-miriam' },
    { do: 'deduce', deduction: 'd-miriam', fills: { who: 'miriam', time: '22:12', car: 'f-jaguar-out' } },
    { do: 'inspect', zone: 'z-files' },
    { do: 'detail', zone: 'z-files', detail: 'd-loan' },
    { do: 'inspect', zone: 'z-drawer' },
    { do: 'collect', evidence: 'ev-consignment', fact: 'f-notice' },
    { do: 'labCollect' },
    { do: 'collect', evidence: 'ev-anchor', fact: 'f-anchor-2312' },
    { do: 'collect', evidence: 'ev-anchor', fact: 'f-anchor-distance' },
    { do: 'deduce', deduction: 'd-alibi', fills: { time: '23:12', distance: 'f-anchor-distance' } },
    { do: 'travel', to: 'loc-workshop' },
    { do: 'inspect', zone: 'z-toolwall' },
    { do: 'detail', zone: 'z-toolwall', detail: 'd-crooked' },
    { do: 'lab', analysis: 'a-mallet' },
    { do: 'inspect', zone: 'z-sink' },
    { do: 'detail', zone: 'z-sink', detail: 'd-rag' },
    { do: 'deduce', deduction: 'd-clean', fills: { peg: 'f-mallet-crooked', rag: 'f-rag-damp', who: 'clara', trace: 'f-volvo-naphtha' } },
    { do: 'inspect', zone: 'z-bows' },
    { do: 'detail', zone: 'z-bows', detail: 'd-slot' },
    { do: 'deduce', deduction: 'd-leo', fills: { who: 'leo', time: '21:58', why: 'o-bow', gone: 'f-cyclist-out' } },
    { do: 'interview', suspect: 'clara' },
    { do: 'topic', suspect: 'clara', topic: 't-business' },
    { do: 'present', suspect: 'clara', claim: 'c-clara-managing', item: 'f-loan' },
    { do: 'leave', suspect: 'clara' },
    { do: 'interview', suspect: 'jonas' },
    { do: 'topic', suspect: 'jonas', topic: 't-copy' },
    { do: 'present', suspect: 'jonas', claim: 'c-jonas-studies', item: 'f-copy-jf' },
    { do: 'press', suspect: 'jonas', claim: 'c-jonas-forclara' },
    { do: 'leave', suspect: 'jonas' },
    { do: 'collect', evidence: 'ev-workbook', fact: 'f-workbook-ck' },
    { do: 'deduce', deduction: 'd-copy', fills: { what: 'o-copy', maker: 'jonas', client: 'clara' } },
    { do: 'lab', analysis: 'a-finance' },
    { do: 'labCollect' },
    { do: 'collect', evidence: 'ev-autopsy', fact: 'f-single-blow' },
    { do: 'endDay' },

    // ── day 3: the money, then the prosecutor (the warrant ran overnight: no need to call Geneva)
    { do: 'nightChoice', option: 'fk-letter' },
    { do: 'labCollect' },
    { do: 'collect', evidence: 'ev-geneva', fact: 'f-halberd-paid' },
    { do: 'collect', evidence: 'ev-serology', fact: 'f-mallet-blood' },
    { do: 'deduce', deduction: 'd-weapon', fills: { weapon: 'o-mallet', wound: 'f-single-blow', blood: 'f-mallet-blood', rag: 'f-rag-damp' } },
    { do: 'deduce', deduction: 'd-motive', fills: { who: 'clara', sale: 'f-halberd-paid', debt: 'f-clara-loan', deadline: 'f-notice' } },
    { do: 'finale', accused: 'clara', answers: ['d-timeline', 'f-sms', 'd-motive', 'd-weapon', 'd-not-fall'] },
  ],
};

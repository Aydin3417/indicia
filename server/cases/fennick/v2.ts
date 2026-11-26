// SERVER-ONLY. Ash and Glaze — v2 game layer: clock, availability, finale, night events and forks, the newcomer's
// first day and the scripted ideal run.
import type { CaseV2 } from '../../engine/types.ts';
import { L } from '../text.ts';
import { facts } from './facts.ts';
import { scenes } from './scenes.ts';
import { deductions } from './deductions.ts';

export const fennickV2Layer: CaseV2 = {
  clock: {
    // Saturday, Sunday, Monday — the salvage crew comes on Monday morning
    days: 3,
    minutesPerDay: 420,
    dayStart: '09:00',
    labSlots: 2,
    // raising a topic is a question too (as in Kessler): keeps "doing everything" above the budget
    costs: { openTopic: 5 },
    startLocationId: null,
    availability: {
      selma: [
        { day: 1, to: 330, note: L('Helping the fire crew carry out what is left, until 14:30', '14.30’a kadar itfaiyeyle birlikte geriye kalanları taşıyor') },
        { day: 2, from: 120, note: L('Sunday morning at the prize office, begging for an extension; free from 11:00', 'Pazar sabahı ödül ofisinde süre uzatımı için yalvarıyor; 11.00’den sonra müsait') },
        { day: 3 },
      ],
      bram: [
        { day: 1, from: 180, note: L('With his mother until noon', 'Öğlene kadar annesinin yanında') },
        { day: 2 },
        { day: 3 },
      ],
      oskar: [
        { day: 1, from: 120, note: L('With the insurer’s adjuster until 11:00', '11.00’e kadar sigortacının eksperiyle') },
        { day: 2, to: 240, note: L('Until 13:00; Sunday lunch with his solicitor', '13.00’e kadar; pazar öğle yemeği avukatıyla') },
        { day: 3, to: 120, note: L('Until 11:00; then at the insurer’s', '11.00’e kadar; sonra sigorta şirketinde') },
      ],
    },
  },

  facts,
  scenes,
  deductions,

  finale: {
    intro: L(
      'The prosecutor gives you one hour with the accused and a solicitor. Five defences, two tries each. A confirmed deduction speaks louder than a single fact.',
      'Savcı sana sanık ve avukatıyla bir saat veriyor. Beş savunma, her birine iki hak. Doğrulanmış bir çıkarım tek bir bulgudan daha gür konuşur.',
    ),
    rounds: [
      {
        id: 'r-fy-opportunity', kind: 'opportunity',
        defence: L('I took a taxi from the club at half past one and was in bed by two. I was nowhere near that yard.', 'Bir buçukta kulüpten taksiye bindim, ikide yataktaydım. O avlunun yakınından bile geçmedim.'),
        prompt: L('Show that he was at Fennick Yard when the gate opened at 01:36.', 'Kapı 01:36’da açıldığında Fennick Avlusu’nda olduğunu göster.'),
        accept: ['d-timeline', 'd-walk', 'd-shoes', 'f-teo-foot', 'f-walker-0131', 'f-no-taxi', 'f-oskar-knew', 'f-oskar-passed', 'f-ash-sole'],
        assist: ['d-timeline', 'd-walk', 'd-shoes'], refutes: ['s-oskar-taxi'],
        win: L('(He reaches for a glass of water that is not there.) … I may have walked. The air was good.', '(Orada olmayan bir su bardağına uzanır.) … Yürümüş olabilirim. Hava güzeldi.'),
        lose: L('A man in a coat on a traffic camera. Hallstedt is full of men in coats.', 'Trafik kamerasında paltolu bir adam. Hallstedt paltolu adamlarla dolu.'),
      },
      {
        id: 'r-fy-lie', kind: 'lie',
        defence: L('I haven’t set foot in Agnes’s studio for months. It’s her kingdom.', 'Aylardır Agnes’in atölyesine adım atmadım. Orası onun krallığı.'),
        prompt: L('Show that he was inside Unit 4 the day before the fire.', 'Yangından bir gün önce 4 numaranın içinde olduğunu göster.'),
        accept: ['f-inspection', 'ev-notice', 'f-selma-ladder', 'f-prints-oskar', 'd-alarm'],
        assist: ['d-alarm'], refutes: ['s-oskar-notinside'],
        win: L('Friday. The inspection. Yes. I signed the notice myself, didn’t I.', 'Cuma. Denetim. Evet. Duyuruyu da kendim imzalamıştım, değil mi.'),
        lose: L('Notices. Ladders. I own the building, Detective.', 'Duyurular. Merdivenler. Bina benim, Komiser.'),
      },
      {
        id: 'r-fy-motive', kind: 'motive',
        defence: L('Why would I burn my own yard? That studio is the heart of the place.', 'Kendi avlumu neden yakayım? O atölye buranın kalbi.'),
        prompt: L('Show why he needed Unit 4 empty.', '4 numaranın boşalmasına neden ihtiyacı olduğunu göster.'),
        accept: ['d-motive', 'f-norrhavn', 'f-clause14', 'f-margin', 'f-bridging', 'f-nyberg-monday'],
        assist: ['d-motive'], refutes: ['s-oskar-nodeal'],
        win: L('(The solicitor stops writing.) Thirty-first of December. Everything was due on the thirty-first.', '(Avukat yazmayı bırakır.) Otuz bir Aralık. Her şeyin vadesi otuz bir Aralık’tı.'),
        lose: L('Landlords sell buildings every day. That is not arson.', 'Ev sahipleri her gün bina satar. Bu kundaklama değil.'),
      },
      {
        id: 'r-fy-means', kind: 'means',
        defence: L('Lamp oil? That shed is open to every tenant. Anyone could have taken a bottle.', 'Gaz yağı mı? O kulübe bütün kiracılara açık. Bir şişeyi herkes alabilirdi.'),
        prompt: L('Show where the fire came from and who could reach it.', 'Yangının neyle çıktığını ve ona kimin ulaşabildiğini göster.'),
        accept: ['d-oil', 'd-alarm', 'f-shed-landlord', 'f-oskar-shedkey', 'f-battery-found', 'f-coat-oil'],
        assist: ['d-oil', 'd-alarm'], refutes: ['s-oskar-shed'],
        win: L('My shed. My key. (He looks at his belt as if it belonged to someone else.)', 'Benim kulübem. Benim anahtarım. (Kemerine başkasınınmış gibi bakar.)'),
        lose: L('You have a bottle cap from a gutter. So does every gull in the harbour.', 'Elinizde oluktan çıkmış bir şişe kapağı var. Limandaki her martının da var.'),
      },
      {
        id: 'r-fy-staging', kind: 'staging',
        defence: L('That old heater was a fire waiting to happen. Every tenant in the yard warned her.', 'O eski ısıtıcı patlamaya hazır bir bombaydı. Avludaki her kiracı onu uyarmıştı.'),
        prompt: L('Show that the heater was a stage prop.', 'Isıtıcının bir sahne aksesuarı olduğunu göster.'),
        accept: ['d-staged', 'f-socket-off', 'f-heater-cold', 'f-heater-corner', 'f-warning-letter'],
        assist: ['d-staged'], refutes: ['s-oskar-heater'],
        win: L('… The switch was off? (For the first time he looks old.) I turned the dial all the way up.', '… Anahtar kapalı mıydı? (İlk kez yaşlı görünür.) Düğmeyi sonuna kadar çevirmiştim.'),
        lose: L('Heaters fail. Ask the fire service.', 'Isıtıcılar arızalanır. İtfaiyeye sorun.'),
      },
    ],
    confession: {
      line: L(
        'Twenty-two years I kept that yard standing. The bank wanted it by Christmas and she wanted nine more years. The kiln was still ticking when I came in; the girl’s prize form was on the bench, and I thought — good, they’ll blame the kiln. I only meant the racks. Straw and paper. … I would like my solicitor to speak now.',
        'Yirmi iki yıl o avluyu ayakta tuttum. Banka Noel’e kadar istiyordu, o ise dokuz yıl daha. İçeri girdiğimde fırın hâlâ tıkırdıyordu; kızın yarışma formu tezgâhın üstündeydi ve düşündüm ki — iyi, suçu fırına atarlar. Yalnızca rafları kastetmiştim. Saman ve kâğıt. … Bundan sonrasını avukatım konuşsun.',
      ),
      statementId: 's-oskar-confession',
    },
    innocents: {
      bram: {
        defence: L('I left at ten to midnight with a crate of Mum’s rejects. Check the camera — and ring Kranz.', 'Gece yarısına on kala annemin ıskartalarıyla dolu bir kasayla çıktım. Kameraya bakın — Kranz’ı da arayın.'),
        collapse: L(
          'The Ostkai camera has Bram’s van leaving at 23:53 and never coming back, and Kranz’s door camera has him at the back table until two. The charge falls apart; whoever walked through the gate at 01:36 is still out there.',
          'Ostkai kamerası Bram’ın minibüsünü 23:53’te çıkarken gösteriyor ve minibüs bir daha dönmüyor; Kranz’ın kapı kamerası da onu saat ikiye kadar arka masada gösteriyor. Suçlama dağılıyor; 01:36’da o kapıdan giren hâlâ dışarıda.',
        ),
      },
      selma: {
        defence: L('I fired my pots and walked home at twenty to one. The kiln did nothing wrong, and neither did I.', 'Parçalarımı pişirdim, biri yirmi kala yürüyerek eve gittim. Fırın bir yanlış yapmadı, ben de yapmadım.'),
        collapse: L(
          'Selma pushed her bicycle past the Ostkai junction at 00:44; the kiln’s programme ended cleanly at 00:55, and the fire began under the racks an hour later. The prosecutor withdraws the charge before her lawyer has finished reading it.',
          'Selma bisikletini iterek 00:44’te Ostkai kavşağından geçti; fırının programı 00:55’te sorunsuz bitti, yangın ise bir saat sonra rafların altında başladı. Savcı, avukatı okumayı bitirmeden suçlamayı geri çekiyor.',
        ),
      },
    },
    // 10 of the 12 questions: the airtight case may skip two (side questions, or an innocent's)
    stars: { proofDeductions: 0.8 },
  },

  // shared investigations: the club’s cloakroom attendant and the house search show their books to one investigator;
  // what they find stays in that investigator’s notes until read out
  coop: { private: { locations: ['loc-club', 'loc-house'] } },

  // The first story event whose requirement is met fires; forks (with `choice`) are a separate channel.
  nightEvents: [
    {
      // the fork after day 1: talk to the doorman tonight, or let the airport police take a written statement
      id: 'n1-teo', afterDay: 1, requires: { deductions: ['d-origin'] },
      title: L('The doorman’s early flight', 'Kapı görevlisinin sabah uçuşu'),
      text: L(
        'At 22:40 the Harbour Club’s manager rings back: the doorman who kept last night’s taxi book, Teo Varela, flies home to Lisbon at ten past six and will be gone a week. He lives above a shop on Kanalgade and goes to bed early.',
        'Saat 22:40’ta Harbour Club’ın müdürü geri arıyor: dün geceki taksi defterini tutan kapı görevlisi Teo Varela sabah altıyı on geçe Lizbon’a, memleketine uçuyor ve bir hafta yok. Kanalgade’de bir dükkânın üstünde oturuyor, erken yatıyor.',
      ),
      choice: {
        prompt: L('Who talks to the doorman?', 'Kapı görevlisiyle kim konuşsun?'),
        options: [
          {
            id: 'fk-teo-written', label: L('Let the airport police take it', 'Havalimanı polisi alsın'),
            text: L(
              'You sleep. The airport police take a written statement at the gate; the transcript ties up one of your lab lines until about one in the afternoon.',
              'Uyursun. Havalimanı polisi kapıda yazılı ifadesini alır; tutanak öğleden sonra bire kadar laboratuvar hatlarından birini meşgul eder.',
            ),
            lab: 'a-teo',
          },
          {
            id: 'fk-teo-tonight', label: L('Knock on his door tonight', 'Bu gece kapısını çal'), minutes: 60,
            // the option is read before choosing: it says what the night costs, not what the doorman says
            text: L(
              'You climb the stairs on Kanalgade at eleven and sit in his kitchen while he packs. You get home late and start the day an hour behind.',
              'Saat on birde Kanalgade’deki merdivenleri çıkarsın; o bavulunu toplarken mutfağında oturursun. Eve geç dönersin ve güne bir saat geriden başlarsın.',
            ),
            grants: { evidence: ['ev-teo'], facts: ['f-teo-foot'] },
          },
        ],
      },
    },
    {
      // the son already admitted the crate: the dealer comes forward on his own
      id: 'n1-kranz', afterDay: 1, requires: { statements: ['s-bram-seconds'] },
      title: L('A dealer at the front desk', 'Ön bankoda bir antikacı'),
      text: L(
        'At 20:15 Emil Kranz walks into the station with a carrier bag: a crate of Vos seconds, a receipt for eleven hundred euros and a memory stick from his door camera. “Bram says you’ll want this. I want it on record that I paid him.”',
        'Saat 20:15’te Emil Kranz elinde bir naylon torbayla emniyete giriyor: bir kasa Vos ıskartası, bin yüz avroluk bir makbuz ve kapı kamerasının kayıtlarını taşıyan bir bellek. “Bram bunu isteyeceğinizi söyledi. Ona para ödediğim tutanağa geçsin.”',
      ),
      grants: { evidence: ['ev-kranz'] },
    },
    {
      id: 'n1-solicitor', afterDay: 1, requires: { statements: ['s-oskar-taxi'] },
      title: L('A solicitor rings', 'Bir avukat arıyor'),
      text: L(
        'At 21:00 Dahl’s solicitor rings the desk, pleasant and unhurried: his client will gladly help again tomorrow, but only until one o’clock — Sunday lunch is a family matter. Pleasant solicitors on a Saturday night are a bad sign.',
        'Saat 21:00’de Dahl’ın avukatı masayı arıyor; kibar ve acelesiz: müvekkili yarın da memnuniyetle yardımcı olur, ama yalnızca saat bire kadar — pazar yemeği aile meselesiymiş. Cumartesi gecesi bu kadar kibar avukatlar iyiye işaret değildir.',
      ),
    },
    {
      id: 'n-day1', afterDay: 1,
      title: L('Night desk', 'Gece nöbeti'),
      text: L(
        'The duty sergeant leaves a note: Agnes Vos rang twice to ask whether the pieces on the seconds shelf survived. Underneath, in another hand: “Holm says the room stays sealed until Monday.”',
        'Nöbetçi komiser bir not bırakmış: Agnes Vos iki kez arayıp ıskarta rafındaki parçaların kurtulup kurtulmadığını sormuş. Altında başka bir el yazısıyla: “Holm, oda pazartesiye kadar mühürlü kalacak diyor.”',
      ),
    },
    {
      // the fork after day 2: the insurer's adjuster wants the heater for his own lab before the room is cleared
      id: 'n2-salvage', afterDay: 2, requires: { deductions: ['d-staged'] },
      title: L('The adjuster wants the heater', 'Eksper ısıtıcıyı istiyor'),
      text: L(
        'At 21:10 the insurer’s adjuster rings: before the salvage crew clears Unit 4 at four tomorrow — “as the landlord requested” — he wants the heater for the insurer’s own lab. Holm can keep it back for yours, or open it at seven at the yard with you and the adjuster watching.',
        'Saat 21:10’da sigortacının eksperi arıyor: enkaz ekibi yarın saat dörtte 4 numarayı — “ev sahibinin talebi üzerine” — boşaltmadan önce ısıtıcıyı sigortanın kendi laboratuvarına götürmek istiyor. Holm onu senin laboratuvarın için alıkoyabilir ya da sabah yedide avluda, sen ve eksper başındayken açabilir.',
      ),
      choice: {
        prompt: L('Who opens the heater?', 'Isıtıcıyı kim açsın?'),
        options: [
          {
            id: 'fk-seal', label: L('Holm keeps it for your lab', 'Holm senin laboratuvarına ayırsın'),
            text: L('You sleep. The heater goes to your lab at eight; one of your lines is busy until about eleven.', 'Uyursun. Isıtıcı sabah sekizde laboratuvarına gider; hatlarından biri on bire kadar meşgul.'),
            lab: 'a-heater',
          },
          {
            id: 'fk-salvage', label: L('Be at the yard at seven', 'Yedide avluda ol'), minutes: 60,
            text: L(
              'You stand in the cold with the adjuster and the salvage foreman, his job sheet on a clipboard, while Holm opens the heater on a trestle. You start the last day an hour late.',
              'Eksper ve enkaz ustabaşısıyla, ustabaşının elinde iş emri, soğukta beklersin; Holm da ısıtıcıyı bir sehpanın üstünde açar. Son güne bir saat geç başlarsın.',
            ),
            grants: { evidence: ['ev-salvage'], facts: ['f-heater-cold'] },
          },
        ],
      },
    },
    {
      id: 'n2-nyberg', afterDay: 2, requires: { deductions: ['d-motive'] },
      title: L('The developer rings', 'Müteahhit arıyor'),
      text: L(
        'At 22:00 Karl Nyberg of Norrhavn rings the desk to say the purchase is suspended “pending your inquiry”. He adds, unasked, that at Friday’s dinner Dahl told him Unit 4 “won’t be a problem by Monday”. He thought it was the brandy talking.',
        'Saat 22:00’de Norrhavn’dan Karl Nyberg masayı arayıp satın almanın “soruşturmanız sonuçlanana kadar” askıya alındığını söylüyor. Kimse sormadan da ekliyor: cuma akşamki yemekte Dahl ona 4 numaranın “pazartesiye sorun olmaktan çıkacağını” söylemiş. O da konyaktan konuşuyor sanmış.',
      ),
      grants: { facts: ['f-nyberg-monday'] },
    },
    {
      id: 'n-day2', afterDay: 2,
      title: L('The prosecutor calls', 'Savcı arıyor'),
      text: L(
        '“The crew clears that room at four tomorrow and the insurer pays on Tuesday. Bring me a name in the morning — with the means, the motive and the night.”',
        '“Ekip yarın saat dörtte o odayı boşaltıyor, sigorta da salı günü ödüyor. Sabah bana bir isim getir — aracıyla, saikiyle ve o geceyle birlikte.”',
      ),
    },
  ],

  // A sensible first-timer's day 1: reads the kiln before the wall, files the obvious-but-wrong place once, follows the
  // first confirmation to the gate and the gutter. Early win: "Where it began" at 10:40 (~6 real minutes).
  newcomerPath: {
    firstWinBy: 150,
    firstWinRealMinutes: 10,
    minConfirmedDay1: 2,
    steps: [
      { do: 'travel', to: 'loc-studio' },
      { do: 'inspect', zone: 'z-fy-racks' },
      { do: 'detail', zone: 'z-fy-racks', detail: 'd-fy-straw' },
      { do: 'inspect', zone: 'z-fy-kiln' },
      { do: 'detail', zone: 'z-fy-kiln', detail: 'd-fy-controller' },
      { do: 'wrongDeduce', deduction: 'd-origin', fills: { where: 'o-kiln', proof: 'f-kiln-0055' } },
      { do: 'detail', zone: 'z-fy-racks', detail: 'd-fy-vee' },
      { do: 'deduce', deduction: 'd-origin', fills: { where: 'o-racks', proof: 'f-v-pattern' } },
      { do: 'lab', analysis: 'a-ostkai' },
      { do: 'detail', zone: 'z-fy-kiln', detail: 'd-fy-load' },
      { do: 'inspect', zone: 'z-fy-heater' },
      { do: 'detail', zone: 'z-fy-heater', detail: 'd-fy-plug' },
      { do: 'inspect', zone: 'z-fy-alarm' },
      { do: 'detail', zone: 'z-fy-alarm', detail: 'd-fy-slot' },
      { do: 'inspect', zone: 'z-fy-backdoor' },
      { do: 'detail', zone: 'z-fy-backdoor', detail: 'd-fy-lock' },
      { do: 'inspect', zone: 'z-fy-trail' },
      { do: 'travel', to: 'loc-yard' },
      { do: 'inspect', zone: 'z-fy-gate' },
      { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-2115' },
      { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-0136' },
      { do: 'inspect', zone: 'z-fy-gutter' },
      { do: 'detail', zone: 'z-fy-gutter', detail: 'd-fy-cap' },
      { do: 'wrongDeduce', deduction: 'd-oil', fills: { what: 'o-petrol', trail: 'f-uv-trail', bottle: 'f-cap' } },
      { do: 'deduce', deduction: 'd-oil', fills: { what: 'o-lampoil', trail: 'f-uv-trail', bottle: 'f-cap' } },
      { do: 'inspect', zone: 'z-fy-shed' },
      { do: 'detail', zone: 'z-fy-shed', detail: 'd-fy-oilshelf' },
      { do: 'interview', suspect: 'selma' },
      { do: 'topic', suspect: 'selma', topic: 't-night' },
      { do: 'wrongPresent', suspect: 'selma', claim: 'c-selma-home', item: 'f-gate-2115' },
      { do: 'present', suspect: 'selma', claim: 'c-selma-home', item: 'f-sa-pots' },
      { do: 'leave', suspect: 'selma' },
      { do: 'endDay' },
    ],
  },

  // A scripted perfect run (all three stars). The validator replays it under the real rules.
  idealPath: [
    // ── day 1 (Saturday): the room, the gate, the two who lied for small reasons
    { do: 'travel', to: 'loc-studio' },
    { do: 'inspect', zone: 'z-fy-racks' },
    { do: 'detail', zone: 'z-fy-racks', detail: 'd-fy-vee' },
    { do: 'deduce', deduction: 'd-origin', fills: { where: 'o-racks', proof: 'f-v-pattern' } },
    { do: 'lab', analysis: 'a-ostkai' },
    { do: 'inspect', zone: 'z-fy-heater' },
    { do: 'detail', zone: 'z-fy-heater', detail: 'd-fy-plug' },
    { do: 'detail', zone: 'z-fy-heater', detail: 'd-fy-socket' },
    { do: 'inspect', zone: 'z-fy-kiln' },
    { do: 'detail', zone: 'z-fy-kiln', detail: 'd-fy-controller' },
    { do: 'detail', zone: 'z-fy-kiln', detail: 'd-fy-load' },
    { do: 'inspect', zone: 'z-fy-trail' },
    { do: 'inspect', zone: 'z-fy-backdoor' },
    { do: 'collect', evidence: 'ev-notice', fact: 'f-inspection' },
    { do: 'inspect', zone: 'z-fy-shelves' },
    { do: 'detail', zone: 'z-fy-shelves', detail: 'd-fy-gap' },
    { do: 'travel', to: 'loc-yard' },
    { do: 'inspect', zone: 'z-fy-gate' },
    { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-2115' },
    { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-2318' },
    { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-2351' },
    { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-0040' },
    { do: 'collect', evidence: 'ev-gatelog', fact: 'f-gate-0136' },
    { do: 'inspect', zone: 'z-fy-gutter' },
    { do: 'detail', zone: 'z-fy-gutter', detail: 'd-fy-cap' },
    { do: 'deduce', deduction: 'd-oil', fills: { what: 'o-lampoil', trail: 'f-uv-trail', bottle: 'f-cap' } },
    { do: 'inspect', zone: 'z-fy-shed' },
    { do: 'detail', zone: 'z-fy-shed', detail: 'd-fy-battery' },
    { do: 'interview', suspect: 'selma' },
    { do: 'topic', suspect: 'selma', topic: 't-night' },
    { do: 'present', suspect: 'selma', claim: 'c-selma-home', item: 'f-sa-pots' },
    { do: 'present', suspect: 'selma', claim: 'c-selma-touched', item: 'f-heater-plugged' },
    { do: 'leave', suspect: 'selma' },
    { do: 'deduce', deduction: 'd-staged', fills: { time: '00:40', corner: 'f-heater-corner', socket: 'f-socket-off' } },
    { do: 'labCollect' },
    { do: 'collect', evidence: 'ev-ostkai', fact: 'f-van-in' },
    { do: 'collect', evidence: 'ev-ostkai', fact: 'f-bike-0044' },
    { do: 'collect', evidence: 'ev-ostkai', fact: 'f-walker-0131' },
    { do: 'deduce', deduction: 'd-selma', fills: { who: 'selma', time: '21:15', pots: 'f-sa-pots', gone: 'f-bike-0044' } },
    { do: 'interview', suspect: 'bram' },
    { do: 'topic', suspect: 'bram', topic: 't-evening' },
    { do: 'present', suspect: 'bram', claim: 'c-bram-home', item: 'f-van-in' },
    { do: 'present', suspect: 'bram', claim: 'c-bram-kiln', item: 'f-crate-gap' },
    { do: 'leave', suspect: 'bram' },
    { do: 'interview', suspect: 'oskar' },
    { do: 'topic', suspect: 'oskar', topic: 't-night' },
    { do: 'leave', suspect: 'oskar' },
    { do: 'endDay' },

    // ── day 2 (Sunday): the doorman last night, the recorder, the club, the landlord before lunch, the warrants
    // (the fork: the perfect player knocks on the doorman's door — it answers a side question and the opportunity round)
    { do: 'nightChoice', option: 'fk-teo-tonight' },
    { do: 'collect', evidence: 'ev-kranz', fact: 'f-kranz' },
    { do: 'deduce', deduction: 'd-bram', fills: { who: 'bram', time: '23:18', crate: 'f-crate-gap', where: 'f-kranz' } },
    { do: 'travel', to: 'loc-office' },
    { do: 'inspect', zone: 'z-ho-recorder' },
    { do: 'lab', analysis: 'a-dvr' },
    { do: 'travel', to: 'loc-club' },
    { do: 'inspect', zone: 'z-hc-cloak' },
    { do: 'collect', evidence: 'ev-cloakbook', fact: 'f-coat-0108' },
    { do: 'inspect', zone: 'z-hc-door' },
    { do: 'collect', evidence: 'ev-taxibook', fact: 'f-no-taxi' },
    { do: 'interview', suspect: 'oskar' },
    { do: 'present', suspect: 'oskar', claim: 'c-oskar-taxi', item: 'f-no-taxi' },
    { do: 'topic', suspect: 'oskar', topic: 't-unit4' },
    { do: 'present', suspect: 'oskar', claim: 'c-oskar-notinside', item: 'f-inspection' },
    { do: 'topic', suspect: 'oskar', topic: 't-codes' },
    { do: 'collect', evidence: 'ev-ruth', fact: 'f-codes-reset' },
    { do: 'present', suspect: 'oskar', claim: 'c-oskar-owncodes', item: 'f-codes-reset' },
    { do: 'leave', suspect: 'oskar' },
    { do: 'deduce', deduction: 'd-gate', fills: { time: '01:36', who: 'oskar', proof: 'f-codes-reset' } },
    { do: 'deduce', deduction: 'd-walk', fills: { how: 'o-foot', time: '01:10', proof: 'f-teo-foot', seen: '01:31' } },
    // the recorder's log is due at 13:50: wait for it (in a shared investigation waiting costs nobody's budget)
    { do: 'wait', minutes: 15 },
    { do: 'labCollect' },
    { do: 'collect', evidence: 'ev-dvrlog', fact: 'f-dvr-paused' },
    { do: 'deduce', deduction: 'd-timeline', order: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'], outlier: 'k7' },
    { do: 'deduce', deduction: 'd-recorder', fills: { log: 'f-dvr-paused', who: 'oskar', club: 'f-coat-0108' } },
    { do: 'travel', to: 'loc-office' },
    { do: 'inspect', zone: 'z-ho-desk' },
    { do: 'collect', evidence: 'ev-contract', fact: 'f-norrhavn' },
    { do: 'inspect', zone: 'z-ho-files' },
    { do: 'collect', evidence: 'ev-lease', fact: 'f-clause14' },
    { do: 'collect', evidence: 'ev-agnes', fact: 'f-oskar-offer' },
    { do: 'deduce', deduction: 'd-motive', fills: { who: 'oskar', deal: 'f-norrhavn', clause: 'f-clause14', offer: 'f-oskar-offer' } },
    { do: 'collect', evidence: 'ev-firereport', fact: 'f-alarm-silent' },
    { do: 'deduce', deduction: 'd-alarm', fills: { empty: 'f-alarm-silent', battery: 'f-battery-found', who: 'oskar', when: 'f-inspection' } },
    { do: 'endDay' },

    // ── day 3 (Monday): the heater is the lab's business; straight to the prosecutor
    { do: 'nightChoice', option: 'fk-seal' },
    { do: 'finale', accused: 'oskar', answers: ['d-timeline', 'f-inspection', 'd-motive', 'd-oil', 'd-staged'] },
  ],
};

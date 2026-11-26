// SERVER-ONLY. Kessler Workshop — Miriam Achterberg. Voice: imperious, clipped, faintly theatrical, exact about money.
// TR: "Komiser" with an edge, formal and cutting, never pleading.
import type { SuspectDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const miriam: SuspectDef = {
  id: 'miriam',
  name: 'Miriam Achterberg',
  age: 56,
  occupation: L('Collector; former concert violinist', 'Koleksiyoncu; eski konser kemancısı'),
  relationship: L('Owner of the consigned Guadagnini', 'Konsinye Guadagnini’nin sahibi'),
  initials: 'MA',
  portraitTone: '#4a4033',
  background: 'Principal second violin with the Hallstedt Philharmonic until a wrist injury at 41. Inherited a shipping fortune. Collects and trades instruments. Lives in Søholm, twenty minutes away.',
  personality: 'Imperious, quick, impatient, used to deference. Contemptuous of procedure. Lies to protect her reputation, not out of guilt.',
  speakingStyle: 'Formal, clipped, faintly theatrical. Addresses the player as "Detective" with an edge. Precise about money.',
  vulnerabilities: 'Her standing among dealers. The possibility that she has been made a fool of.',
  publicProfile: L(
    'Collector and former concert violinist. Consigned her G.B. Guadagnini (1772) to Kessler Strings fourteen months ago.',
    'Koleksiyoncu, eski konser kemancısı. G.B. Guadagnini (1772) kemanını on dört ay önce satılması için Kessler Strings’e emanet etti.',
  ),
  claimedAlibi: L('Home all evening; spoke to Thomas by phone at 19:30.', 'Bütün akşam evdeymiş; Thomas’la 19:30’da telefonda konuşmuş.'),
  actualWhereabouts: 'Visited the workshop 21:46–22:12 and argued with Thomas. Home by 22:40. Called him at 23:24 to apologise; no answer.',
  motive: 'Apparent: furious about a stalled sale. Real: none — she believed her violin was safe.',
  secrets: ['Has promised the violin to a buyer in Vienna at €2.6M, in breach of her consignment terms', 'Visited the workshop that night'],
  knows: ['That she argued with Thomas 21:46–22:12', 'That someone was in the back corridor during the argument'],
  doesNotKnow: ['That the violin is a copy', 'That Clara sold it'],
  baseline: { trust: 35, stress: 25 },
  shutdownStress: 80,
  opening: L(
    'I have a lawyer, Detective. I don’t need him. Ask your questions — briefly, if you can.',
    'Avukatım var, Komiser. İhtiyacım yok. Sorularınızı sorun — becerebilirseniz kısa kesin.',
  ),
  deflections: [
    L('I have no idea what you mean.', 'Neyi kastettiğinize dair en ufak fikrim yok.'),
    L('Is that a question?', 'Bu bir soru muydu?'),
    L('Ask me something sensible.', 'Bana aklı başında bir şey sorun.'),
  ],
  dismissals: [
    L('I fail to see what that has to do with me.', 'Bunun benimle ne ilgisi olduğunu bir türlü göremiyorum.'),
    L('You’re showing me things at random, Detective.', 'Önüme gelişigüzel şeyler koyuyorsunuz, Komiser.'),
    L('(She does not look down.) My lawyer bills by the quarter hour. Spend them better.', '(Başını eğip bakmaz bile.) Avukatım on beş dakikalık dilimlerle ücret alır. Onları daha iyi harcayın.'),
    L('I have bought and sold instruments for forty years. I know a bluff when I see one.', 'Kırk yıldır çalgı alıp satarım. Blöfü görünce tanırım.'),
    L('Is that the best the Hallstedt police can do?', 'Hallstedt polisinin elinden gelen bu mu?'),
    L('Put it away, Detective. It embarrasses us both.', 'Kaldırın onu, Komiser. İkimizi de mahcup ediyor.'),
  ],
  resists: [
    L('(She already did the sum.) Interesting. Not sufficient.', '(Hesabı çoktan yapmıştır.) İlginç. Ama yeterli değil.'),
    L('You are halfway to a point, Detective. Come back when you reach it.', 'Bir sonuca yarı yoldasınız, Komiser. Vardığınızda gelin.'),
    L('My lawyer will want to see the rest of that before I say a word.', 'Ben tek kelime etmeden önce avukatım bunun devamını görmek isteyecek.'),
  ],
  pushback: [
    L('Lower your voice. I am not one of your car thieves.', 'Sesinizi alçaltın. Karşınızda araba hırsızlarınızdan biri yok.'),
    L('Accuse me of something with evidence or not at all.', 'Ya kanıtla suçlayın ya da hiç suçlamayın.'),
  ],
  shutdownLines: [
    L('We are done for now.', 'Şimdilik bu kadar.'),
    L('I’m going to call my lawyer if this continues.', 'Böyle devam ederse avukatımı arayacağım.'),
  ],
  guarded: [
    { term: 'vienna', unlockedBy: { topic: 't-violin', tier: 1 } },
    { term: 'i went', unlockedBy: { topic: 't-evening', tier: 1 } },
    { term: 'viyana', unlockedBy: { topic: 't-violin', tier: 1 } },
  ],
  topics: [
    {
      id: 't-evening', label: L('Her whereabouts that evening', 'O akşam neredeydi'),
      keywords: [
        ['where', 'whereabouts', 'alibi', 'home', 'visit', 'went', 'were you', 'there', 'drive', 'car', 'jaguar', 'workshop', 'doing', 'evening', 'night', 'thursday', 'nerede', 'evdeydi', 'ziyaret', 'gittiniz', 'araba', 'atölye', 'akşam'],
        ['evening', 'night', 'thursday', 'ten', '21:', '22:', 'yesterday', 'last night', 'perşembe', 'dün', 'gece'],
      ],
      evidence: ['ev-cctv', 'ev-diary', 'ev-frontdoor'],
      description: 'Where Miriam was on the evening of 13 March and whether she visited the workshop.',
      tiers: [
        {
          stance: 'lie', emotion: 'irritated', statements: ['s-miriam-absent'],
          line: L(
            'I spoke to Thomas by telephone at half past seven. I was at home all evening. I’ve said this.',
            'Thomas’la yedi buçukta telefonda konuştum. Bütün akşam evdeydim. Bunu söyledim.',
          ),
          facts: ['Claims she only spoke to Thomas by phone at 19:30 and was home all evening'],
        },
        {
          stance: 'truth', emotion: 'irritated', requires: { presentedAny: ['ev-cctv', 'ev-diary'] }, statements: ['s-miriam-visit'], stress: 15, trust: 5,
          line: L(
            '(A thin smile, as if conceding a point at auction.) Very well. I went to see him. A quarter to ten. He’d promised to show me my violin and then spent the visit lecturing me on contracts. I left at a quarter past ten. He was alive — loud, insufferable, and alive.',
            '(Mezatta bir puan bırakır gibi ince bir gülümseme.) Pekâlâ. Onu görmeye gittim. Ona çeyrek kala. Kemanımı göstereceğine söz vermişti, bütün ziyaret boyunca bana sözleşme dersi verdi. Onu çeyrek geçe çıktım. Yaşıyordu — gürültücü, çekilmez ve canlı.',
          ),
          facts: ['Admits visiting the workshop about 21:45', 'Says Thomas showed her the violin and lectured her on contracts', 'Left about 22:15, Thomas alive and angry'],
        },
      ],
    },
    {
      id: 't-violin', label: L('The consignment and the buyer', 'Emanet ve alıcı'),
      keywords: [['violin', 'guadagnini', 'consign', 'contract', 'sale', 'sell', 'buyer', 'vienna', 'withdraw', 'back', 'price', 'money', 'argue', 'argument', 'dispute', 'keman', 'emanet', 'konsinye', 'sözleşme', 'satış', 'alıcı', 'viyana', 'fiyat', 'tartış']],
      evidence: ['ev-consignment', 'ev-diary'],
      description: 'The consignment agreement, the stalled sale, and Miriam’s other buyer.',
      tiers: [
        {
          stance: 'evasive', emotion: 'irritated',
          line: L(
            'The instrument is mine. I consigned it to Thomas fourteen months ago and he failed to sell it. I was entitled to be impatient.',
            'O çalgı benim. On dört ay önce Thomas’a emanet ettim, satamadı. Sabırsızlanmaya hakkım vardı.',
          ),
          facts: ['Says she consigned the violin fourteen months ago and Thomas failed to sell it'],
        },
        {
          stance: 'truth', emotion: 'guarded', requires: { presentedAny: ['ev-consignment', 'ev-diary', 'ev-cctv'] }, statements: ['s-miriam-buyer'], stress: 10,
          line: L(
            'I have a buyer in Vienna at two point six. I gave Thomas notice to return it. He refused to release it until the notice period ran out — thirty days, he said, as if I were a tenant. Yes, I had already promised it. That is what we argued about.',
            'Viyana’da iki virgül altıya bir alıcım var. Thomas’a kemanı iade etmesi için ihbar verdim. Süre dolmadan vermem dedi — otuz gün, sanki kiracısıymışım gibi. Evet, söz vermiştim bile. Tartıştığımız şey buydu.',
          ),
          facts: ['Has a buyer in Vienna at 2.6 million', 'Gave notice; Thomas refused to release it during the 30-day notice period', 'Had already promised it to the buyer'],
        },
        {
          stance: 'truth', emotion: 'distressed', requires: { presentedAny: ['ev-copyreport', 'ev-geneva'] }, stress: 20,
          line: L(
            '(The glove she was holding falls; she does not pick it up.) A copy. … Then where is my violin, Detective? Where is my violin?',
            '(Elindeki eldiven düşer; almaz.) Kopya. … O hâlde kemanım nerede, Komiser? Kemanım nerede?',
          ),
          facts: ['Did not know the violin was a copy', 'Is shocked and demands to know where the original is'],
        },
      ],
    },
    {
      id: 't-late-call', label: L('Her 23:24 call', '23:24’teki araması'),
      keywords: [['23:24', '11:24', 'later', 'call', 'called', 'phone', 'rang', 'apolog', 'missed', 'answer', 'aradı', 'arama', 'telefon', 'özür', 'açmadı', 'cevapsız']],
      evidence: ['ev-calllog'],
      description: 'Miriam’s unanswered call to Thomas at 23:24.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L('I may have telephoned. I telephone a great many people.', 'Aramış olabilirim. Ben çok kişiyi ararım.'),
          facts: ['Is vague about whether she called later'],
        },
        {
          stance: 'truth', emotion: 'guarded', requires: { presented: ['ev-calllog'] }, statements: ['s-miriam-2324'],
          line: L(
            'I rang to apologise. Around twenty past eleven. He didn’t answer. I assumed he was sulking, and I went to bed.',
            'Özür dilemek için aradım. On biri yirmi geçe gibi. Açmadı. Küstü sandım, ben de yattım.',
          ),
          facts: ['Called about 23:24 to apologise; no answer', 'Assumed he was sulking'],
        },
      ],
    },
    {
      id: 't-argument', label: L('The shouting', 'Bağırış'),
      keywords: [['shout', 'shouting', 'raised', 'voice', 'loud', 'neighbour', 'heard', 'scream', 'yell', 'angry', 'bağır', 'ses', 'komşu', 'duydu', 'kavga', 'öfke']],
      evidence: ['ev-neighbour'],
      description: 'The raised woman’s voice the neighbour heard around 22:00.',
      tiers: [
        {
          stance: 'evasive', emotion: 'irritated',
          line: L('I have no idea what the neighbours heard. It is an old building.', 'Komşuların ne duyduğundan haberim yok. Eski bir bina.'),
          facts: ['Deflects'],
        },
        {
          stance: 'truth', emotion: 'irritated', requires: { known: { statements: ['s-miriam-visit'] } },
          line: L(
            'I raised my voice. He raised his. I’m not ashamed of it. Then I left, and that is the whole of it.',
            'Sesimi yükselttim. O da yükseltti. Utanmıyorum. Sonra çıktım, hepsi bu kadar.',
          ),
          facts: ['Admits raising her voice during the argument', 'Says she then left'],
        },
      ],
    },
    {
      id: 't-saw', label: L('Who else was there', 'Orada başka kim vardı'),
      keywords: [['saw', 'see', 'someone', 'anyone', 'else', 'corridor', 'back', 'apprentice', 'leo', 'boy', 'clara', 'jonas', 'who', 'gördü', 'kimse', 'başka', 'koridor', 'çırak', 'genç']],
      description: 'Whether Miriam saw anyone else at the workshop.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L('I was at home, Detective, so I saw no one.', 'Evdeydim, Komiser; dolayısıyla kimseyi görmedim.'),
          facts: ['Maintains she was not there'],
        },
        {
          stance: 'truth', emotion: 'calm', requires: { known: { statements: ['s-miriam-visit'] } }, statements: ['s-miriam-saw-leo'],
          line: L(
            'Someone came in at the back while we were arguing. The apprentice, I think — young, a bicycle helmet, a bag over his shoulder. He didn’t come into the office. Skulking.',
            'Biz tartışırken arkadan biri girdi. Çırak sanırım — genç, başında bisiklet kaskı, omzunda bir çanta. Ofise girmedi. Sinsi sinsi dolaşıyordu.',
          ),
          facts: ['Saw a young man come in the back during the argument, likely the apprentice', 'He had a bicycle helmet and a bag'],
        },
      ],
    },
    {
      id: 't-clara', label: L('Clara', 'Clara'),
      keywords: [['clara', 'daughter', 'manager', 'halberd', 'geneva', 'kızı', 'müdür', 'cenevre']],
      evidence: ['ev-geneva'],
      description: 'Miriam’s view of Clara.',
      tiers: [
        {
          stance: 'truth', emotion: 'calm',
          line: L(
            'Clara is a competent bookkeeper with her father’s temper and none of his ear.',
            'Clara becerikli bir muhasebeci. Babasının huyunu almış, kulağını almamış.',
          ),
          facts: ['Thinks Clara is competent but lacks her father’s talent'],
        },
        {
          stance: 'truth', emotion: 'hostile', requires: { presented: ['ev-geneva'] },
          line: L(
            'She sold my violin. To Halberd. In September. And looked me in the eye at Christmas. I will ruin her — I will ruin her properly, Detective, through the courts. You may write that down.',
            'Kemanımı satmış. Halberd’e. Eylül’de. Sonra Noel’de gözümün içine baka baka… Onu mahvedeceğim — usulüyle mahvedeceğim, Komiser, mahkemelerde. Bunu not edebilirsiniz.',
          ),
          facts: ['Is furious to learn Clara sold the violin to Halberd'],
        },
      ],
    },
    {
      // wave 4 — the false trail: on paper, his death helped her. It did not make her a killer.
      id: 't-clause', label: L('Clause nine', 'Dokuzuncu madde'),
      keywords: [['clause', 'nine', 'seven days', 'death', 'die', 'brandl', 'lawyer', 'letter', 'madde', 'dokuz', 'yedi gün', 'ölürse', 'avukat', 'mektup']],
      evidence: ['ev-lawyerletter'],
      description: 'The clause that returns the violin to Miriam within seven days of the consignee’s death, and her Vienna buyer.',
      tiers: [
        {
          stance: 'evasive', emotion: 'irritated',
          line: L(
            'Clause nine is in every consignment contract in Europe, Detective. My lawyers put it in. I never read the thing twice.',
            'Dokuzuncu madde Avrupa’daki bütün konsinye sözleşmelerinde var, Komiser. Onu avukatlarım koydu. Ben o metni ikinci kez okumadım bile.',
          ),
          facts: ['Says clause nine is standard and she never paid attention to it'],
        },
        {
          stance: 'truth', emotion: 'hostile', statements: ['s-miriam-clause'], stress: 10,
          line: L(
            '(She sets her gloves down, one on top of the other.) Very well. Yes. With Thomas gone I would have had my violin back in a week, and Brandl would have had his sale. That is arithmetic, Detective, not murder. Write to Brandl if you like — he has been asking awkward questions of his own.',
            '(Eldivenlerini üst üste koyarak bırakır.) Pekâlâ. Evet. Thomas olmasa kemanım bir haftada elime geçerdi, Brandl da satışını yapardı. Bu aritmetik, Komiser, cinayet değil. İsterseniz Brandl’a yazın — onun da kendine göre sinir bozucu soruları var.',
          ),
          facts: ['Admits that with Thomas dead she would have had the violin back within a week', 'Her buyer is Galerie Brandl of Vienna', 'Says Brandl has been asking awkward questions'],
        },
      ],
      v2: { chips: ['f-clause-death', 'ev-lawyerletter'] },
    },
    {
      id: 't-thomas', label: L('Thomas', 'Thomas'),
      keywords: [['thomas', 'kessler', 'relationship', 'know him', 'friend', 'years', 'ilişki', 'arkadaş', 'tanı', 'yıl']],
      description: 'Her relationship with Thomas.',
      tiers: [
        {
          stance: 'truth', emotion: 'grieving',
          line: L(
            'I bought my first good bow from him when I was nineteen. He was the only dealer in this city who ever told me an instrument was worse than I hoped. I will miss being told the truth.',
            'İlk iyi yayımı on dokuz yaşımda ondan aldım. Bu şehirde bir çalgının umduğumdan kötü olduğunu yüzüme söyleyen tek satıcıydı. Bana doğruyu söyleyen birinin yokluğunu hissedeceğim.',
          ),
          facts: ['Has known Thomas since she was nineteen', 'Respected his honesty'],
        },
      ],
    },
    {
      id: 't-confession', label: L('Did she kill him', 'Onu o mu öldürdü'),
      keywords: [['kill', 'killed', 'murder', 'did you do', 'responsible', 'confess', 'öldür', 'cinayet', 'katil', 'itiraf']],
      description: 'Direct accusation.',
      tiers: [
        {
          stance: 'truth', emotion: 'hostile',
          line: L(
            'Don’t be ridiculous. Dead, he was no use to me at all. Alive, he owed me a violin.',
            'Gülünç olmayın. Ölüsü benim hiçbir işime yaramaz. Dirisi bana bir keman borçluydu.',
          ),
          facts: ['Denies it; argues his death did not help her'],
        },
      ],
    },
  ],
};

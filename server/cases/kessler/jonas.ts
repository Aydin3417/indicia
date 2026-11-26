// SERVER-ONLY. Kessler Workshop — Jonas Feld. Voice: slow, plain, long pauses, craftsman's images.
// TR: short plain sentences, "Thomas" by name, wood/grain/glue images, ellipses for pauses.
import type { SuspectDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const jonas: SuspectDef = {
  id: 'jonas',
  name: 'Jonas Feld',
  age: 47,
  occupation: L('Senior luthier, Kessler Strings', 'Kıdemli usta, Kessler Strings'),
  relationship: L('Employee for nineteen years; found the body', 'On dokuz yıllık çalışan; cesedi o buldu'),
  initials: 'JF',
  portraitTone: '#3f4a3f',
  background: 'Trained in Mittenwald. Joined Kessler Strings at 28. Divorced, lives alone above a bakery in the old town. Makes the workshop’s new instruments; Thomas signs and sells them.',
  personality: 'Quiet, meticulous, loyal, conflict-averse. Proud of his craft and ashamed of how it was used. Honest once he sees he isn’t the target.',
  speakingStyle: 'Slow, plain sentences. Long pauses. Craftsman’s metaphors — wood, grain, glue. Says "Thomas", never "Mr Kessler".',
  vulnerabilities: 'Guilt over the copy. Fear that his brand inside it makes him look like the forger.',
  publicProfile: L(
    'Senior luthier, nineteen years at Kessler Strings. Discovered the body at 07:52 on 14 March.',
    'Kıdemli keman ustası, on dokuz yıldır Kessler Strings’te. Cesedi 14 Mart sabahı 07:52’de buldu.',
  ),
  claimedAlibi: L(
    'Left work at 18:10; home, then The Anchor on Kanalgade from about 22:30 until closing.',
    'İşten 18:10’da çıkmış; önce eve, 22:30 sularından kapanışa kadar da Kanalgade’deki The Anchor’a.',
  ),
  actualWhereabouts: 'Exactly as claimed. Took Thomas’s 22:43 call outside The Anchor. Paid by card at 23:12. Left at closing, 00:30.',
  motive: 'None real. Could be framed through the copy he made.',
  secrets: ['Made the copy of the Guadagnini for Clara for €8,000 cash', 'Spoke to Thomas at 22:43 and told him Clara commissioned the copy'],
  knows: ['The copy exists and who commissioned it', 'The lignum vitae mallet is the heaviest on the wall', 'Naphtha is kept under the sink', 'Leo has been suspected of theft'],
  doesNotKnow: ['That Clara sold the original', 'That Clara went to the workshop'],
  baseline: { trust: 45, stress: 40 },
  shutdownStress: 85,
  opening: L('I found him. I keep… Sorry. Ask what you need.', 'Onu ben buldum. Gözümün önünden… Kusura bakmayın. Ne soracaksanız sorun.'),
  deflections: [
    L('I don’t know how to answer that.', 'Buna nasıl cevap vereceğimi bilmiyorum.'),
    L('I make violins. I don’t know much else.', 'Ben keman yaparım. Başka pek bir şeyden anlamam.'),
    L('Could you ask that a different way?', 'Bunu başka türlü sorabilir misiniz?'),
  ],
  dismissals: [
    L('I don’t know what that is supposed to tell me.', 'Bunun bana ne anlatması gerektiğini bilmiyorum.'),
    L('That has nothing to do with me.', 'Bunun benimle bir ilgisi yok.'),
    L('(He looks at it a long time, then shakes his head.) No.', '(Uzun uzun bakar, sonra başını sallar.) Yok.'),
    L('I make violins. I don’t know about that.', 'Ben keman yaparım. O işlerden anlamam.'),
    L('You can show me that all day. It won’t make me remember something that didn’t happen.', 'Bunu bütün gün gösterebilirsiniz. Olmamış bir şeyi hatırlatmaz bana.'),
    L('Wrong wood, Detective.', 'Yanlış ağaç, Komiser.'),
  ],
  resists: [
    L('(He turns a glass that isn’t there.) That’s not all of it. You know that’s not all of it.', '(Orada olmayan bir bardağı çevirir.) Hepsi bu değil. Hepsinin bu olmadığını siz de biliyorsunuz.'),
    L('Maybe. Maybe not. Bring me the rest.', 'Belki. Belki de değil. Gerisini getirin.'),
    L('I’m not saying more on half a story.', 'Yarım bir hikâyeye bakıp fazlasını söylemem.'),
  ],
  pushback: [
    L('I’ve told you what I can. Shouting won’t change it.', 'Söyleyebileceğimi söyledim. Bağırmak bir şeyi değiştirmez.'),
    L('I found him. Do you understand? I found him.', 'Onu ben buldum. Anlıyor musunuz? Ben buldum.'),
  ],
  shutdownLines: [
    L('I can’t. Not right now.', 'Yapamıyorum. Şimdi olmaz.'),
    L('Give me a moment.', 'Bir dakika verin.'),
  ],
  guarded: [
    { term: 'clara commissioned', unlockedBy: { topic: 't-copy', tier: 1 } },
    { term: 'eight thousand', unlockedBy: { topic: 't-copy', tier: 1 } },
    { term: 'spoke to him', unlockedBy: { topic: 't-call', tier: 1 } },
    { term: 'sekiz bin', unlockedBy: { topic: 't-copy', tier: 1 } },
  ],
  topics: [
    {
      id: 't-discovery', label: L('Finding the body', 'Cesedin bulunması'),
      keywords: [['found', 'find', 'discover', 'morning', 'body', 'arrive', 'came in', 'scene', '07:', 'ambulance', 'first', 'buldu', 'bulduğ', 'sabah', 'ceset', 'cesed', 'ambulans']],
      evidence: ['ev-body', 'ev-ladder'],
      description: 'How and when Jonas found Thomas on the morning of 14 March.',
      tiers: [
        {
          stance: 'truth', emotion: 'distressed', statements: ['s-jonas-discovery'],
          line: L(
            'Eight o’clock, a few minutes before. I came in the back like always. The lights were on in the workshop, which was wrong — Thomas never left them on. He was on the floor by the bench, the ladder on its side next to him. I knew before I touched him. I rang for the ambulance at six minutes to eight.',
            'Sekize birkaç dakika vardı. Her zamanki gibi arkadan girdim. Atölyenin ışıkları yanıyordu, o yanlıştı — Thomas ışıkları asla açık bırakmazdı. Tezgâhın dibinde yerde yatıyordu, merdiven yanında devrilmişti. Dokunmadan anladım. Ambulansı sekize altı kala aradım.',
          ),
          facts: ['Arrived just before 08:00 by the back door', 'Workshop lights were on, which was unusual', 'Found Thomas by the bench with the ladder on its side', 'Called the ambulance at 07:54'],
        },
      ],
    },
    {
      id: 't-call', label: L('The 22:43 phone call', '22:43’teki telefon'),
      keywords: [
        ['call', 'called', 'phone', 'rang', 'spoke', 'speak', 'talk', 'missed', 'aradı', 'arama', 'telefon', 'konuştu', 'cevapsız'],
        ['22:43', '10:43', 'night', 'evening', 'thomas', 'last', 'gece', 'akşam', 'son'],
      ],
      evidence: ['ev-calllog', 'ev-phone'],
      description: 'Whether Jonas spoke to Thomas at 22:43 and what was said.',
      tiers: [
        {
          stance: 'lie', emotion: 'anxious', statements: ['s-jonas-nocall'],
          line: L(
            'I told the police. There was a missed call. I was in the pub, I didn’t hear it.',
            'Polise söyledim. Cevapsız bir arama vardı. Birahanedeydim, duymadım.',
          ),
          variants: [L('A missed call. That’s all it was.', 'Cevapsız bir arama. O kadar.')],
          facts: ['Claims the 22:43 call was missed because he was in a pub'],
        },
        {
          stance: 'truth', emotion: 'resigned', requires: { presented: ['ev-calllog'] }, statements: ['s-jonas-call'], stress: -10, trust: 15,
          line: L(
            '(He looks at his hands for a long time.) … Three minutes. Yes. I spoke to him. I went outside to hear him. He asked me if I’d made a copy of the Guadagnini. I said yes. He asked me who for. I told him — Clara. He didn’t say anything for a long time. Then he said "thank you, Jonas" and hung up. That was the last thing I ever said to him.',
            '(Uzun süre ellerine bakar.) … Üç dakika. Evet. Konuştum onunla. Duyabilmek için dışarı çıktım. Guadagnini’nin kopyasını ben mi yaptım diye sordu. Evet dedim. Kimin için diye sordu. Söyledim — Clara. Uzun süre hiçbir şey demedi. Sonra “sağ ol Jonas” dedi, kapattı. Ona söylediğim son şey buydu.',
          ),
          facts: ['Admits he spoke to Thomas for three minutes at 22:43', 'Thomas asked whether he had made a copy of the Guadagnini', 'Jonas told him Clara commissioned it', 'Thomas thanked him and hung up'],
        },
      ],
    },
    {
      id: 't-copy', label: L('The copy of the Guadagnini', 'Guadagnini’nin kopyası'),
      keywords: [['copy', 'replica', 'fake', 'forgery', 'study', 'guadagnini', 'violin', 'brand', 'jf', 'commission', 'made', 'kopya', 'sahte', 'keman', 'damga', 'ısmarla', 'yaptın', 'yaptınız']],
      evidence: ['ev-copyreport', 'ev-note', 'ev-violin', 'ev-workbook'],
      description: 'Whether Jonas made a copy of the Guadagnini, for whom and when.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L(
            'I’ve made study copies of a lot of instruments. It’s how you learn to see. A copy isn’t a crime.',
            'Bir sürü çalgının çalışma kopyasını yaptım. Görmeyi böyle öğrenirsin. Kopya yapmak suç değil.',
          ),
          facts: ['Says he has made many study copies', 'Says a copy is not a crime'],
        },
        {
          stance: 'truth', emotion: 'resigned', requires: { presentedAny: ['ev-copyreport', 'ev-note', 'ev-calllog'] }, statements: ['s-jonas-copy'], revealsEvidence: ['ev-workbook'], stress: -5, trust: 10,
          line: L(
            '(He breathes out, like a man setting down a heavy case.) Last summer Clara asked me for a copy of the Guadagnini. A display copy, she said, for an insurance exhibition — they don’t like the real thing travelling. Eight thousand, in cash. I delivered it on the twelfth of July. I put my brand inside the lower block, like I always do. I didn’t ask any more questions. I should have. It’s in my workbook — you can have it.',
            '(Ağır bir kutuyu yere bırakan biri gibi nefes verir.) Geçen yaz Clara benden Guadagnini’nin bir kopyasını istedi. Sergilik bir kopya dedi, bir sigorta sergisi için — asıl çalgının yola çıkmasını istemiyorlarmış. Sekiz bin, nakit. On iki Temmuz’da teslim ettim. Damgamı her zamanki gibi alt takozun içine vurdum. Başka soru sormadım. Sormalıydım. İş defterimde yazıyor — alın, sizde kalsın.',
          ),
          facts: ['Clara commissioned the copy last summer, saying it was for an insurance exhibition', 'Paid 8,000 euros in cash', 'Delivered 12 July', 'His JF brand is inside the lower block', 'Offers his workbook'],
        },
      ],
    },
    {
      id: 't-evening', label: L('His whereabouts that evening', 'O akşam neredeydi'),
      keywords: [['where', 'whereabouts', 'alibi', 'home', 'pub', 'anchor', 'bar', 'drink', 'doing', 'evening', 'night', 'left', 'leave', 'nerede', 'akşam', 'birahane', 'meyhane', 'içki', 'evdeydi']],
      evidence: ['ev-anchor', 'ev-accesslog'],
      description: 'Where Jonas was on the evening of 13 March.',
      tiers: [
        {
          stance: 'truth', emotion: 'calm', statements: ['s-jonas-anchor'], revealsEvidence: ['ev-anchor-claim'],
          line: L(
            'I left at ten past six. Went home, ate, sat with the radio. About half ten I walked to The Anchor on Kanalgade. I stayed until they closed — half twelve. Ruben was behind the bar; he’ll tell you.',
            'Altıyı on geçe çıktım. Eve gittim, yemek yedim, radyonun başında oturdum. On buçuk gibi yürüyerek Kanalgade’deki The Anchor’a gittim. Kapanışa kadar kaldım — yarımda kapatırlar. Barda Ruben vardı; o söyler size.',
          ),
          facts: ['Left work 18:10, went home', 'At The Anchor on Kanalgade from about 22:30 until closing at 00:30', 'The bartender Ruben can confirm'],
        },
      ],
    },
    {
      id: 't-clara', label: L('Clara', 'Clara'),
      keywords: [['clara', 'daughter', 'manager', 'kızı', 'müdür']],
      description: 'Jonas’s view of Clara.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L(
            'Clara runs the business side. She’s very capable. More capable than Thomas gave her credit for.',
            'İşin hesap kitap tarafı Clara’da. Çok becerikli. Thomas’ın ona tanıdığından daha becerikli.',
          ),
          facts: ['Calls Clara capable and underappreciated'],
        },
        {
          stance: 'truth', emotion: 'anxious', requires: { presentedAny: ['ev-geneva', 'ev-cctv', 'ev-accesslog'] },
          line: L(
            'She was under pressure. More than she let Thomas see. The bank rang her, not him. I think she was frightened of him finding out how bad it was. … I don’t want to think the rest.',
            'Baskı altındaydı. Thomas’a gösterdiğinden çok daha fazla. Banka onu arardı, Thomas’ı değil. Bence durumun ne kadar kötü olduğunu Thomas’ın öğrenmesinden korkuyordu. … Gerisini düşünmek istemiyorum.',
          ),
          facts: ['Says Clara was under heavy financial pressure she hid from Thomas', 'Says the bank called her, not Thomas'],
        },
      ],
    },
    {
      id: 't-others', label: L('Miriam and Leo', 'Miriam ve Leo'),
      keywords: [['miriam', 'achterberg', 'owner', 'collector', 'leo', 'apprentice', 'bow', 'stealing', 'missing', 'who', 'else', 'koleksiyon', 'çırak', 'yay', 'kayıp', 'hırsız', 'başka']],
      description: 'Jonas’s view of Miriam Achterberg and Leo Brandt.',
      tiers: [
        {
          stance: 'truth', emotion: 'calm',
          line: L(
            'Mrs Achterberg rang every week about the sale. Thomas said she had another buyer and wanted it back. Leo… he’s a good pair of hands, but things have gone missing. Small tools, then the Sartory bow. I told Thomas I thought it was Leo.',
            'Bayan Achterberg satış için her hafta arardı. Thomas, kadının başka bir alıcı bulduğunu, kemanı geri istediğini söylemişti. Leo… eli yatkın çocuk ama bir şeyler kayboluyordu. Önce küçük aletler, sonra Sartory yay. Thomas’a Leo olduğunu düşündüğümü söyledim.',
          ),
          facts: ['Miriam pressed weekly about the sale and had another buyer', 'Things have gone missing, including the Sartory bow', 'He told Thomas he suspected Leo'],
        },
      ],
    },
    {
      id: 't-tools', label: L('The mallet and the tool wall', 'Tokmak ve alet duvarı'),
      keywords: [['mallet', 'hammer', 'tool', 'wall', 'lignum', 'heavy', 'weapon', 'naphtha', 'clean', 'rag', 'sink', 'tokmak', 'çekiç', 'alet', 'duvar', 'ağır', 'neft', 'bez', 'lavabo']],
      evidence: ['ev-mallet', 'ev-serology', 'ev-rag'],
      description: 'The mallets on the tool wall and the cleaning station.',
      tiers: [
        {
          stance: 'truth', emotion: 'calm',
          line: L(
            'There are six mallets on that wall. The lignum vitae one is the heaviest — over a kilo, a face about four centimetres across. Thomas used it for setting pegs. Nobody else liked it.',
            'O duvarda altı tokmak var. Gayak ağacından olanı en ağırı — bir kilodan fazla, yüzü dört santim kadar. Thomas burgu takarken kullanırdı. Başka kimse sevmezdi onu.',
          ),
          facts: ['Six mallets on the wall', 'The lignum vitae mallet is the heaviest, over a kilo, face about 4 cm', 'Only Thomas used it'],
        },
        {
          stance: 'truth', emotion: 'distressed', requires: { presentedAny: ['ev-serology', 'ev-rag'] },
          line: L(
            'Somebody cleaned it with naphtha. We keep a can under the sink with the rags. Anyone who works here knows where it is. Anyone.',
            'Biri onu neftle silmiş. Lavabonun altında bir bidon dururdu, bezlerle birlikte. Burada çalışan herkes yerini bilir. Herkes.',
          ),
          facts: ['Naphtha and rags are kept under the sink', 'Anyone who works there knows'],
        },
      ],
    },
    {
      id: 't-thomas', label: L('Thomas', 'Thomas'),
      keywords: [['thomas', 'boss', 'relationship', 'know him', 'like him', 'person', 'years', 'patron', 'ilişki', 'nasıl biri', 'yıl']],
      description: 'Jonas’s relationship with Thomas.',
      tiers: [
        {
          stance: 'truth', emotion: 'grieving',
          line: L(
            'Nineteen years. He taught me most of what I know and took the credit for the rest. That’s the trade. He was hard and he was fair, and he could not lie about an instrument to save his life.',
            'On dokuz yıl. Bildiklerimin çoğunu o öğretti, gerisinin hakkını da o aldı. Zanaat böyledir. Sertti, adildi; bir çalgı hakkında canı pahasına yalan söyleyemezdi.',
          ),
          facts: ['Worked with Thomas nineteen years', 'Thomas was hard but fair and scrupulously honest about instruments'],
        },
      ],
    },
    {
      id: 't-confession', label: L('Did he kill Thomas', 'Thomas’ı o mu öldürdü'),
      keywords: [['kill', 'killed', 'murder', 'did you do', 'responsible', 'confess', 'öldür', 'cinayet', 'katil', 'itiraf']],
      description: 'Direct accusation.',
      tiers: [
        {
          stance: 'truth', emotion: 'distressed',
          line: L(
            'No. I was across the river with a glass in my hand. Ask Ruben. Check my card. I loved that man.',
            'Hayır. Nehrin karşı yakasındaydım, elimde kadehle. Ruben’e sorun. Kartıma bakın. O adamı severdim.',
          ),
          facts: ['Denies it; says he was at The Anchor and can be checked'],
        },
      ],
    },
  ],
};

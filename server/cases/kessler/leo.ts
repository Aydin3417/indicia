// SERVER-ONLY. Kessler Workshop — Leo Brandt. Voice: nervous, fast, rambling, apologetic, contradicts himself.
// TR: "yani", "şey", "pardon", half sentences, over-explains when scared.
import type { SuspectDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const leo: SuspectDef = {
  id: 'leo',
  name: 'Leo Brandt',
  age: 24,
  occupation: L('Apprentice luthier, third year', 'Çırak keman yapımcısı, üçüncü yıl'),
  relationship: L('Apprentice', 'Çırak'),
  initials: 'LB',
  portraitTone: '#33404a',
  background: 'From a small town up the coast. Third-year apprentice. Rides a bicycle everywhere. Owes about €14,000 from online poker to people who are not a bank.',
  personality: 'Nervous, eager to please, defensive, a poor liar. Talks too much when scared. Decent underneath.',
  speakingStyle: 'Fast, informal, fillers ("like", "I mean"), apologises, trails off, contradicts himself mid-sentence.',
  vulnerabilities: 'His debts. Being thought of as a thief by Jonas.',
  publicProfile: L('Third-year apprentice at Kessler Strings. Cycles to work.', 'Kessler Strings’te üçüncü yılındaki çırak. İşe bisikletle geliyor.'),
  claimedAlibi: L('Left at 18:25 and went home; gaming, then sleep.', '18:25’te çıkıp eve gitmiş; oyun oynamış, sonra uyumuş.'),
  actualWhereabouts: 'Went home, came back at 21:58 by the back door to steal the Sartory bow, left at 22:19, home by 22:40. Pawned the bow at 09:10 the next morning.',
  motive: 'Apparent: caught stealing. Real: none.',
  secrets: ['Stole the Sartory bow and pawned it', 'Returned to the workshop 21:58–22:19', 'Gambling debts'],
  knows: ['Thomas was arguing with an older woman around 22:00', 'Thomas was examining the Guadagnini under UV at about 22:15 and said "that’s not right"', 'Jonas made a copy of the Guadagnini last summer'],
  doesNotKnow: ['Anything after 22:19'],
  baseline: { trust: 50, stress: 45 },
  shutdownStress: 82,
  opening: L(
    'Hi. Sorry. I — is this going to take long? I already told the officers everything.',
    'Merhaba. Pardon. Şey — uzun sürecek mi bu? Memurlara her şeyi anlattım zaten.',
  ),
  deflections: [
    L('Sorry, I don’t — what do you mean?', 'Pardon, ben — ne demek istiyorsunuz?'),
    L('I, uh. I don’t know about that.', 'Ben, şey. Onu bilmiyorum.'),
    L('Can you ask that differently? Sorry.', 'Başka türlü sorabilir misiniz? Pardon.'),
  ],
  dismissals: [
    L('Okay? I don’t know what that is.', 'Tamam da? Ne olduğunu bilmiyorum ki.'),
    L('I mean — that’s not mine. I don’t know.', 'Yani — o benim değil. Bilmiyorum.'),
    L('Sorry, what — is that supposed to be about me? Because it’s, like, not.', 'Pardon, ne — bu benimle mi ilgili şimdi? Çünkü, şey, değil.'),
    L('I’ve literally never seen that. Okay, maybe once. But not like that.', 'Onu hayatımda görmedim. Tamam, belki bir kere. Ama öyle değil.'),
    L('(He laughs, too loud.) That’s random. That’s really random.', '(Fazla yüksek sesle güler.) Bu çok alakasız. Gerçekten alakasız.'),
    L('Can we — can we talk about something that’s actually about me?', 'Şey — gerçekten benimle ilgili bir şey konuşabilir miyiz?'),
  ],
  resists: [
    L('Okay, that — okay. That looks bad. But it’s not — you don’t have the whole thing.', 'Tamam, bu — tamam. Kötü görünüyor. Ama öyle değil — elinizde olayın tamamı yok.'),
    L('(He talks faster.) That could be anyone, right? Like, technically?', '(Hızlı hızlı konuşmaya başlar.) Bu herkes olabilir, değil mi? Yani teknik olarak?'),
    L('I’m not saying anything until you — no. No.', 'Siz şey yapmadan hiçbir şey söylemiyorum — yok. Yok.'),
  ],
  pushback: [
    L('Whoa — okay, you can’t just say that. I didn’t do anything to him.', 'Ya — dur, öyle diyemezsiniz. Ben ona hiçbir şey yapmadım.'),
    L('I’m not — can I have a lawyer or something? Is that a thing?', 'Ben şey — avukat falan isteyebilir miyim? Öyle bir hakkım var mı?'),
  ],
  shutdownLines: [
    L('I can’t — I need some water.', 'Yapamıyorum — biraz su lazım.'),
    L('I’m not saying anything else right now. Sorry.', 'Şu an başka bir şey söylemiyorum. Pardon.'),
  ],
  guarded: [
    { term: 'took the bow', unlockedBy: { topic: 't-bow', tier: 1 } },
    { term: 'pawn', unlockedBy: { topic: 't-bow', tier: 1 } },
    { term: 'went back', unlockedBy: { topic: 't-evening', tier: 1 } },
    { term: 'rehin', unlockedBy: { topic: 't-bow', tier: 1 } },
  ],
  topics: [
    {
      id: 't-evening', label: L('His whereabouts that evening', 'O akşam neredeydi'),
      keywords: [
        ['where', 'whereabouts', 'alibi', 'home', 'went', 'were you', 'back', 'return', 'bike', 'bicycle', 'cycle', 'charger', 'doing', 'left', 'leave', 'evening', 'night', 'thursday', 'nerede', 'evdeydi', 'döndü', 'bisiklet', 'şarj', 'akşam', 'gittin'],
        ['evening', 'night', 'thursday', 'ten', '21:', '22:', 'yesterday', 'last night', 'workshop', 'perşembe', 'dün', 'gece', 'atölye'],
      ],
      evidence: ['ev-accesslog', 'ev-cctv', 'ev-tracks'],
      description: 'Where Leo was on the evening of 13 March and whether he returned to the workshop.',
      tiers: [
        {
          stance: 'lie', emotion: 'anxious', statements: ['s-leo-left'],
          line: L(
            'I left at like twenty-five past six and went home. Played some games, went to sleep. That’s it. Boring.',
            'Altıyı yirmi beş geçe falan çıktım, eve gittim. Biraz oyun oynadım, yattım. Bu kadar. Sıkıcı yani.',
          ),
          facts: ['Claims he left 18:25, went home and stayed there'],
        },
        {
          stance: 'partial', emotion: 'anxious', requires: { presentedAny: ['ev-accesslog', 'ev-cctv', 'ev-tracks'] }, statements: ['s-leo-return'], stress: 15, trust: -5,
          line: L(
            '(He laughs, too loud, then stops.) Okay. Okay. I went back. Around ten. I forgot my charger. I was in and out in like fifteen, twenty minutes. Thomas was in the office arguing with some woman — not Clara, older, kind of posh voice. I didn’t go in. When I left he was out at his bench. He was fine. He was totally fine.',
            '(Fazla yüksek sesle güler, sonra susar.) Tamam. Tamam. Geri döndüm. Saat on gibi. Şarj aletimi unutmuştum. On beş, yirmi dakikada girip çıktım. Thomas ofiste bir kadınla tartışıyordu — Clara değil, daha yaşlı, böyle kibar, havalı bir sesi vardı. İçeri girmedim. Ben çıkarken tezgâhının başındaydı. İyiydi. Gayet iyiydi yani.',
          ),
          facts: ['Admits returning around 22:00, claims it was for a charger', 'Heard Thomas arguing with an older, well-spoken woman in the office', 'Says Thomas was at his bench and fine when he left'],
        },
      ],
    },
    {
      id: 't-bow', label: L('The missing Sartory bow', 'Kayıp Sartory yay'),
      keywords: [['bow', 'sartory', 'cabinet', 'missing', 'steal', 'stole', 'stolen', 'theft', 'pawn', 'took', 'money', 'debt', 'owe', 'gambl', 'poker', 'yay', 'vitrin', 'kayıp', 'çaldın', 'çalın', 'hırsız', 'rehin', 'borç', 'kumar']],
      evidence: ['ev-bowcabinet', 'ev-pawn'],
      description: 'The Sartory bow missing from the display cabinet, and Leo’s debts.',
      tiers: [
        {
          stance: 'lie', emotion: 'anxious', statements: ['s-leo-bow-deny'],
          line: L(
            'No idea. Maybe Thomas sold it? He moved stock around all the time. I don’t really touch the cabinet.',
            'Hiç bilmiyorum. Belki Thomas satmıştır? Mal yerini hep değiştirirdi. Ben o vitrine pek dokunmam yani.',
          ),
          facts: ['Denies knowing anything about the bow', 'Suggests Thomas may have sold it'],
        },
        {
          stance: 'truth', emotion: 'distressed', requires: { presented: ['ev-pawn'] }, statements: ['s-leo-bow'], stress: 10, trust: 10,
          line: L(
            '(His voice cracks halfway through the first word.) … I took it. I needed the money — I owe some people, like, actual people. I was going to get it back before anyone noticed, I swear. That’s why I went back that night. That’s the only reason. I didn’t — I would never hurt him. He was fine when I left. Please.',
            '(Daha ilk kelimede sesi çatlar.) … Ben aldım. Paraya ihtiyacım vardı — birilerine borcum var, yani gerçek insanlara. Kimse fark etmeden geri alacaktım, yemin ederim. O gece o yüzden döndüm. Tek sebebi bu. Ben — ona asla zarar vermezdim. Çıkarken iyiydi. Lütfen.',
          ),
          facts: ['Admits taking the Sartory bow and pawning it', 'Owes money to unofficial lenders', 'Says that was the only reason he went back', 'Says Thomas was fine when he left'],
        },
      ],
    },
    {
      id: 't-violin', label: L('What Thomas was doing at his bench', 'Thomas tezgâhında ne yapıyordu'),
      keywords: [['violin', 'guadagnini', 'uv', 'lamp', 'light', 'bench', 'doing', 'saw', 'see', 'look', 'examining', 'muttering', 'said', 'keman', 'lamba', 'ışık', 'tezgâh', 'gördün', 'baktı', 'söyledi']],
      evidence: ['ev-uvlamp', 'ev-note', 'ev-violin'],
      description: 'What Leo saw Thomas doing at his bench as he left around 22:15.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L(
            'I don’t really get to touch the Guadagnini. That’s a Thomas thing.',
            'Guadagnini’ye pek elimi sürdürmezler. O Thomas’ın işi.',
          ),
          facts: ['Says he never handles the Guadagnini'],
        },
        {
          stance: 'truth', emotion: 'calm', requires: { known: { statements: ['s-leo-return'] } }, statements: ['s-leo-uv'],
          line: L(
            'He had the big violin under the UV lamp. Holding the scroll up close. And he said, out loud, to nobody — "That’s not right. That’s not right at all." I thought he meant the varnish had got damaged or something. Then I left.',
            'Büyük kemanı morötesi lambanın altına koymuştu. Kafasını iyice yaklaştırmış bakıyordu. Sonra kimseye değil, sesli sesli — “Bu doğru değil. Bu hiç doğru değil” dedi. Verniğe bir şey oldu sandım. Sonra çıktım.',
          ),
          facts: ['Saw Thomas examining the Guadagnini under the UV lamp around 22:15', 'Heard him say "That’s not right"'],
        },
      ],
    },
    {
      id: 't-copy', label: L('Jonas’s copy', 'Jonas’ın kopyası'),
      keywords: [['copy', 'replica', 'study', 'jonas', 'made', 'commission', 'fake', 'kopya', 'sahte', 'yaptı', 'ısmarla']],
      description: 'Whether Leo knows of any copy of the Guadagnini.',
      tiers: [
        {
          stance: 'truth', emotion: 'calm', statements: ['s-leo-copy'],
          line: L(
            'Oh — Jonas made one last summer. A study copy of the Guadagnini. It was on his bench for weeks, it was gorgeous, honestly you couldn’t tell. Then one day it was gone. He said it went to a client.',
            'Ha — Jonas geçen yaz bir tane yapmıştı. Guadagnini’nin çalışma kopyası. Haftalarca tezgâhında durdu, harikaydı, inanın ayırt edemezdiniz. Sonra bir gün yok oldu. Bir müşteriye gitti dedi.',
          ),
          facts: ['Jonas made a study copy of the Guadagnini last summer', 'It was on his bench for weeks then went to a client'],
        },
      ],
    },
    {
      id: 't-clara', label: L('Clara', 'Clara'),
      keywords: [['clara', 'daughter', 'manager', 'boss', 'kızı', 'müdür', 'patron']],
      description: 'Leo’s view of Clara.',
      tiers: [
        {
          stance: 'truth', emotion: 'calm',
          line: L(
            'Clara’s okay. Stressed. Like, always on the phone with the bank, door closed. Thomas never noticed. He only notices wood.',
            'Clara iyidir. Gergin ama. Hep bankayla telefonda, kapı kapalı. Thomas hiç fark etmezdi. O sadece ahşabı fark eder.',
          ),
          facts: ['Clara often on the phone with the bank behind closed doors', 'Thomas did not notice'],
        },
      ],
    },
    {
      id: 't-thomas', label: L('Thomas', 'Thomas'),
      keywords: [['thomas', 'relationship', 'teacher', 'like him', 'boss', 'person', 'usta', 'hoca', 'ilişki', 'nasıl biri']],
      description: 'Leo’s relationship with Thomas.',
      tiers: [
        {
          stance: 'truth', emotion: 'grieving',
          line: L(
            'He was scary. Like, he’d make you redo a bridge five times without saying why. But he once drove me home in a storm and didn’t say a word about it after. He was… yeah.',
            'Korkutucuydu. Yani bir köprüyü nedenini söylemeden beş kere yeniden yaptırırdı. Ama bir keresinde fırtınada beni arabayla eve bıraktı, sonra bir kere bile lafını etmedi. Öyle biriydi… işte.',
          ),
          facts: ['Found Thomas strict but quietly kind'],
        },
      ],
    },
    {
      id: 't-confession', label: L('Did he kill Thomas', 'Thomas’ı o mu öldürdü'),
      keywords: [['kill', 'killed', 'murder', 'did you do', 'responsible', 'hurt', 'öldür', 'cinayet', 'katil', 'zarar']],
      description: 'Direct accusation.',
      tiers: [
        {
          stance: 'truth', emotion: 'distressed',
          line: L(
            'What? No! No. I — okay, I’ve done stupid stuff, but no. Never. He was alive. He was alive when I left.',
            'Ne? Hayır! Hayır. Ben — tamam, aptalca şeyler yaptım ama hayır. Asla. Yaşıyordu. Ben çıkarken yaşıyordu.',
          ),
          facts: ['Denies it vehemently; insists Thomas was alive when he left'],
        },
      ],
    },
  ],
};

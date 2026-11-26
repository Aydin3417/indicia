// SERVER-ONLY. Kessler Workshop — Clara Kessler (the killer). Voice: controlled, precise, business register.
// TR: formal "siz", complete short sentences, corrects details; "babam" when guarded, "baba" when it slips.
import type { SuspectDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const clara: SuspectDef = {
  id: 'clara',
  name: 'Clara Kessler',
  age: 34,
  occupation: L('Business manager, Kessler Strings', 'İşletme müdürü, Kessler Strings'),
  relationship: L('Daughter', 'Kızı'),
  initials: 'CK',
  portraitTone: '#5b3a3e',
  background: 'Studied economics in Hamburg, joined the family business nine years ago after her mother’s death. Runs finances, clients, insurance and the bank. Lives alone in Vesterlund, a seven-minute drive away.',
  personality: 'Controlled, articulate, precise. Performs composure; underneath, frightened and proud. Becomes cold and legalistic when cornered, then fractures.',
  speakingStyle: 'Short, complete sentences. Business vocabulary. Corrects small inaccuracies. Says "my father" when guarded and "Dad" when emotion slips through. Never swears.',
  vulnerabilities: 'Her father’s approval. The fear of being seen as the one who ruined the business.',
  publicProfile: L(
    'Thomas Kessler’s only child. Has managed the business side of Kessler Strings for nine years: finance, clients, insurance.',
    'Thomas Kessler’in tek çocuğu. Dokuz yıldır Kessler Strings’in mali tarafını yönetiyor: finans, müşteriler, sigorta.',
  ),
  claimedAlibi: L(
    'Home in Vesterlund all evening from about 19:00; in bed before 23:00.',
    'Saat 19:00 sularından itibaren bütün akşam Vesterlund’daki evinde; 23:00’ten önce yatmış.',
  ),
  actualWhereabouts: 'Home until 22:56. Drove to the workshop after her father’s text, entered 23:04, killed him at 23:19, left 23:38, on camera 23:41.',
  motive: 'Her father had discovered she sold the consigned Guadagnini and replaced it with a copy. He was about to call Miriam Achterberg and the police.',
  secrets: [
    'Took a €900,000 loan against the business without her father’s knowledge.',
    'Sold the Guadagnini to Halberd Fine Instruments, Geneva, for €1.1M via CK Atelier Consulting GmbH on 3 September.',
    'Commissioned the copy from Jonas for €8,000 cash.',
    'Was at the workshop 23:04–23:38 and killed her father.',
  ],
  knows: ['Everything about the sale and the copy', 'That her father texted her at 22:55', 'That Leo has been stealing', 'That Miriam wanted the violin back'],
  doesNotKnow: ['That her father left a written note', 'That the access system logs fob entries', 'That she lost an earring back'],
  baseline: { trust: 55, stress: 30 },
  shutdownStress: 88,
  opening: L(
    'I’ve already spoken to the police twice. But ask. If it helps you understand what happened to my father, ask.',
    'Polisle iki kez konuştum zaten. Ama sorun. Babama ne olduğunu anlamanıza yarayacaksa, sorun.',
  ),
  deflections: [
    L('I’m not sure what you’re asking me.', 'Ne sorduğunuzu tam anlamadım.'),
    L('You’ll have to be more specific than that.', 'Biraz daha açık sormanız gerekecek.'),
    L('I don’t see how that’s relevant. Ask me something I can answer.', 'Bunun konuyla ilgisini göremiyorum. Cevaplayabileceğim bir şey sorun.'),
  ],
  dismissals: [
    L('And? I don’t see what that has to do with me.', 'Evet? Bunun benimle ne ilgisi var, anlamıyorum.'),
    L('That’s a workshop object. I’ve seen it a thousand times. What do you want me to say about it?', 'Atölyede duran bir şey bu. Bin kere görmüşümdür. Ne dememi bekliyorsunuz?'),
    L('(She reads it, then squares it neatly on the table.) No. That isn’t relevant.', '(Okur, sonra masanın üstünde düzgünce hizalar.) Hayır. Bunun konuyla ilgisi yok.'),
    L('You’re wasting your afternoon, Detective. And mine.', 'Öğleden sonranızı boşa harcıyorsunuz, Komiser. Benimkini de.'),
    L('I manage invoices for a living. Show me one that’s wrong and we can talk.', 'Ben faturalarla uğraşırım. Yanlış olan birini gösterin, konuşalım.'),
    L('Is that what passes for evidence now?', 'Artık buna mı kanıt deniyor?'),
  ],
  resists: [
    L('(A pause. She chooses each word.) That proves less than you think it does.', '(Bir an susar. Kelimelerini tek tek seçer.) Bu, sandığınızdan daha azını kanıtlar.'),
    L('You have a piece. You don’t have the rest.', 'Elinizde bir parça var. Gerisi yok.'),
    L('(Her hand goes to her ear, then back to the table.) Bring me something complete.', '(Eli kulağına gider, sonra masaya döner.) Bana eksiksiz bir şey getirin.'),
  ],
  pushback: [
    L('I’m not going to be shouted at the day after I lost my father. Ask properly or end this.', 'Babamı kaybettiğim günün ertesi bana bağırılmasına izin vermem. Ya düzgün sorun ya da burada bitirelim.'),
    L('You don’t get to call me a liar without something to show me.', 'Gösterecek bir şeyiniz yokken bana yalancı diyemezsiniz.'),
  ],
  shutdownLines: [
    L('I need a minute. Please.', 'Bir dakika. Lütfen.'),
    L('I’m not answering anything else right now.', 'Şu an başka hiçbir soruya cevap vermiyorum.'),
  ],
  guarded: [
    { term: 'halberd', unlockedBy: { topic: 't-guadagnini', tier: 2 } },
    { term: 'geneva', unlockedBy: { topic: 't-guadagnini', tier: 2 } },
    { term: 'sold it', unlockedBy: { topic: 't-guadagnini', tier: 2 } },
    { term: 'loan', unlockedBy: { topic: 't-business', tier: 1 } },
    { term: 'jonas told', unlockedBy: { topic: 't-call', tier: 2 } },
    { term: 'i hit', unlockedBy: { topic: 't-confession', tier: 1 } },
    { term: 'struck him', unlockedBy: { topic: 't-confession', tier: 1 } },
    { term: 'cenevre', unlockedBy: { topic: 't-guadagnini', tier: 2 } },
    { term: 'kredi', unlockedBy: { topic: 't-business', tier: 1 } },
  ],
  topics: [
    {
      id: 't-evening', label: L('Her whereabouts that evening', 'O akşam neredeydi'),
      keywords: [
        ['where', 'whereabouts', 'alibi', 'home', 'doing', 'went', 'were you', 'drive', 'drove', 'car', 'volvo', 'arrive', 'left', 'leave', 'evening', 'night', 'thursday', 'nerede', 'evdeydi', 'akşam', 'araba', 'gittiniz', 'çıktınız', 'geldiniz'],
        ['evening', 'night', 'thursday', '13', 'eleven', '23:', 'yesterday', 'last night', 'workshop', 'perşembe', 'dün', 'atölye', 'gece'],
      ],
      evidence: ['ev-cctv', 'ev-accesslog', 'ev-autopsy', 'ev-neighbour'],
      description: 'Where Clara was on the evening of 13 March; whether she went to the workshop; when she arrived and left.',
      tiers: [
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-clara-home'],
          line: L(
            'I was at home. I left the workshop at twenty to seven, picked up groceries, and I was home all evening. I was in bed before eleven.',
            'Evdeydim. Atölyeden yediye yirmi kala çıktım, markete uğradım, bütün akşam evdeydim. On birden önce yatmıştım.',
          ),
          variants: [
            L('As I said. Home. All evening.', 'Söyledim ya. Evdeydim. Bütün akşam.'),
            L('I’ve told you where I was. At home, in Vesterlund.', 'Nerede olduğumu söyledim. Evdeydim, Vesterlund’da.'),
          ],
          facts: ['Claims she left work at 18:40 and was at home in Vesterlund all evening', 'Claims she was in bed before 23:00'],
        },
        {
          stance: 'lie', emotion: 'anxious', requires: { presentedAny: ['ev-cctv', 'ev-accesslog'] }, statements: ['s-clara-visit'], stress: 20, trust: -10,
          line: L(
            '(She straightens a cuff that does not need it.) Fine. I drove over. My father called me and he was upset — about the business, about money. I got there just after eleven, we talked, and I left at a quarter past. He was alive. He was angry, and he was alive. I didn’t say so because I knew exactly how it would look.',
            '(Zaten düzgün duran manşetini düzeltir.) Peki. Arabayla gittim. Babam aradı, çok sinirliydi — işler yüzünden, para yüzünden. On biri biraz geçe oradaydım, konuştuk, on biri çeyrek geçe çıktım. Yaşıyordu. Öfkeliydi ama yaşıyordu. Söylemedim, çünkü bunun nasıl görüneceğini çok iyi biliyordum.',
          ),
          variants: [L('I was there for ten, fifteen minutes. I left at a quarter past eleven. He was alive.', 'On, on beş dakika kaldım. On biri çeyrek geçe çıktım. Yaşıyordu.')],
          facts: ['Now admits she drove to the workshop after her father called', 'Claims she arrived just after 23:00 and left at 23:15', 'Claims he was alive and angry about money when she left', 'Says she hid it because of how it would look'],
        },
        {
          stance: 'evasive', emotion: 'distressed', requires: { presentedAny: ['ev-autopsy', 'ev-neighbour', 'ev-accesslog'], known: { statements: ['s-clara-visit'] } }, stress: 15, trust: -5,
          line: L(
            'Then it happened after I left. I don’t know the exact minute I walked out — we were shouting, I wasn’t looking at a clock. Maybe it was later than a quarter past. Maybe I sat in the car. I don’t remember. I don’t remember.',
            'O zaman ben çıktıktan sonra olmuş. Tam hangi dakika çıktım bilmiyorum — bağırışıyorduk, saate bakmıyordum. Belki çeyrekten sonraydı. Belki arabada oturdum. Hatırlamıyorum. Hatırlamıyorum.',
          ),
          facts: ['Can no longer hold the 23:15 departure', 'Says she does not remember when she left', 'Suggests it happened after she left'],
        },
      ],
    },
    {
      id: 't-call', label: L('The calls and the text from her father', 'Babasının aramaları ve mesajı'),
      keywords: [
        ['call', 'called', 'phone', 'rang', 'ring', 'text', 'message', 'sms', 'spoke', 'speak', 'talk', 'aradı', 'arama', 'telefon', 'mesaj', 'konuştu'],
        ['22:51', '22:55', '10:51', '10:55', 'father', 'dad', 'he', 'last', 'saturday', 'dinner', 'baba', 'yemek', 'cumartesi'],
      ],
      evidence: ['ev-calllog', 'ev-phone'],
      description: 'Thomas’s 22:51 phone call and 22:55 text message to Clara and what they were about.',
      tiers: [
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-clara-call'],
          line: L(
            'He rang about Saturday. My aunt’s birthday dinner — who was booking the table. It was a short call.',
            'Cumartesi için aradı. Halamın doğum günü yemeği — masayı kim ayırtacak diye. Kısa bir konuşmaydı.',
          ),
          facts: ['Claims her father called about a family dinner on Saturday', 'Claims it was a short, ordinary call'],
        },
        {
          stance: 'partial', emotion: 'anxious', requires: { presented: ['ev-calllog'], known: { statements: ['s-clara-call'] } }, stress: 15, trust: -5,
          line: L(
            '(A pause, a fraction too long.) All right. It wasn’t about dinner. He’d convinced himself something was wrong with one of the instruments. He was tired, he wasn’t making sense. The text — he was being dramatic. I told him it could wait until the morning.',
            '(Bir an fazla susar.) Peki. Yemekle ilgili değildi. Çalgılardan birinde bir sorun olduğuna kendini inandırmıştı. Yorgundu, söyledikleri birbirini tutmuyordu. Mesaj da — abartıyordu. Sabaha kadar bekleyebilir dedim.',
          ),
          facts: ['Admits the call was not about dinner', 'Says he believed something was wrong with an instrument', 'Calls the text dramatic and says she told him it could wait'],
        },
        {
          stance: 'partial', emotion: 'distressed', requires: { presentedAny: ['ev-copyreport', 'ev-workbook', 'ev-geneva'] }, stress: 10,
          line: L(
            'Jonas told him I’d commissioned the copy. Yes. He wanted me there that minute. He said if I didn’t come he would call the police. So I went. That’s what a daughter does.',
            'Kopyayı benim ısmarladığımı Jonas söylemiş ona. Evet. Beni hemen orada görmek istedi. Gelmezsem polisi arayacağını söyledi. Ben de gittim. Bir kız evladı ne yaparsa onu yaptım.',
          ),
          facts: ['Admits Jonas told her father she commissioned the copy', 'Admits he threatened to call the police', 'Admits that is why she went'],
        },
      ],
    },
    {
      id: 't-guadagnini', label: L('The Guadagnini', 'Guadagnini'),
      keywords: [['violin', 'guadagnini', 'instrument', 'copy', 'fake', 'forgery', 'replica', 'sold', 'sale', 'sell', 'geneva', 'halberd', 'swap', 'consign', 'vault', 'ck atelier', 'atelier', 'keman', 'kopya', 'sahte', 'sattı', 'satış', 'kasa', 'cenevre', 'emanet', 'konsinye']],
      evidence: ['ev-violin', 'ev-copyreport', 'ev-geneva', 'ev-note', 'ev-workbook', 'ev-ledger', 'ev-consignment'],
      description: 'The consigned Guadagnini violin, whether the one in the vault is a copy, and what happened to the original.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L(
            'The Guadagnini belongs to Mrs Achterberg. It’s in the vault, it’s insured, and it’s been on consignment for over a year. My father handled that sale personally.',
            'Guadagnini Bayan Achterberg’in. Kasada duruyor, sigortalı, bir yılı aşkın süredir bizde konsinye. O satışla babam bizzat ilgileniyordu.',
          ),
          facts: ['States the violin belongs to Miriam Achterberg and is on consignment', 'Says her father handled the sale personally'],
        },
        {
          stance: 'lie', emotion: 'irritated', requires: { presentedAny: ['ev-copyreport', 'ev-note', 'ev-workbook'] }, statements: ['s-clara-copy'], stress: 15, trust: -10,
          line: L(
            'A copy? Jonas makes study copies all the time — it’s how he trains his eye. If there’s a copy in that vault, the question you should be asking is who put it there, and Jonas has had a key for nineteen years.',
            'Kopya mı? Jonas sürekli çalışma kopyası yapar — gözünü öyle eğitir. O kasada bir kopya varsa asıl sormanız gereken, onu oraya kimin koyduğu. Jonas’ın on dokuz yıldır anahtarı var.',
          ),
          facts: ['Denies knowledge of the copy', 'Points suspicion at Jonas, who has had a key for nineteen years'],
        },
        {
          stance: 'truth', emotion: 'distressed', requires: { presented: ['ev-geneva'] }, statements: ['s-clara-sale'], stress: 25, trust: 5,
          line: L(
            '(For the first time she does not finish straightening anything.) The business was going to fail. Eighteen months of losses and a loan my father never knew about. Halberd paid one point one million, it cleared the bank, and nobody had to know. I was going to buy it back before Miriam ever found a buyer. That was the plan. That was the only plan I had.',
            '(İlk kez elleri bir şeyi düzeltmeye uzanmaz.) İşler batacaktı. On sekiz ay üst üste zarar, babamın hiç bilmediği bir kredi. Halberd bir virgül bir milyon ödedi, para bankadan geçti, kimsenin bilmesine gerek kalmadı. Miriam bir alıcı bulmadan geri alacaktım. Plan buydu. Elimdeki tek plan buydu.',
          ),
          facts: ['Admits she sold the real Guadagnini to Halberd in Geneva for 1.1 million', 'Says the business was failing and there was a loan her father did not know about', 'Says she meant to buy it back'],
        },
      ],
    },
    {
      id: 't-business', label: L('The business and its finances', 'Şirket ve parası'),
      keywords: [['business', 'money', 'finance', 'finances', 'debt', 'loan', 'bank', 'accounts', 'losses', 'profit', 'inherit', 'inheritance', 'will', 'estate', 'insolvent', 'broke', 'parası', 'parayı', 'kredi', 'borç', 'banka', 'zarar', 'miras', 'hesap', 'iflas', 'şirket']],
      evidence: ['ev-accounts'],
      description: 'The financial health of Kessler Strings, loans, and who inherits.',
      tiers: [
        {
          stance: 'evasive', emotion: 'guarded',
          line: L(
            'The business has had better years. Most workshops have. We were managing. And before you ask — yes, I inherit. I’m his only child. That’s not a motive, that’s a family.',
            'Şirket daha iyi yıllar gördü. Çoğu atölye öyle. İdare ediyorduk. Sormadan söyleyeyim — evet, mirasçı benim. Tek çocuğuyum. Buna saik denmez, buna aile denir.',
          ),
          facts: ['Says the business had better years but was managing', 'Acknowledges she inherits as only child'],
        },
        {
          stance: 'partial', emotion: 'anxious', requires: { presented: ['ev-accounts'] }, stress: 10,
          line: L(
            'We had a loan. Nine hundred thousand, against the premises. I arranged it, my father signed what I put in front of him. It was repaid in September. Ahead of schedule.',
            'Bir kredimiz vardı. Dokuz yüz bin, işyeri teminatlı. Ben ayarladım, babam önüne ne koyduysam imzaladı. Eylül’de kapandı. Vadesinden önce.',
          ),
          facts: ['Admits to a 900,000 loan she arranged', 'Says her father signed without reading closely', 'Says it was repaid in September'],
        },
      ],
    },
    {
      id: 't-death', label: L('How her father died', 'Babası nasıl öldü'),
      keywords: [['ladder', 'fell', 'fall', 'accident', 'mallet', 'hammer', 'weapon', 'wound', 'head', 'blow', 'injur', 'tool', 'naphtha', 'rag', 'wiped', 'staged', 'died', 'death', 'autopsy', 'merdiven', 'düştü', 'düşme', 'kaza', 'tokmak', 'çekiç', 'silah', 'yara', 'darbe', 'neft', 'ölüm', 'otopsi']],
      evidence: ['ev-ladder', 'ev-mallet', 'ev-serology', 'ev-rag', 'ev-body'],
      description: 'The ladder, the head wound, the mallet and whether the death was an accident.',
      tiers: [
        {
          stance: 'lie', emotion: 'grieving', statements: ['s-clara-ladder'],
          line: L(
            'He used that ladder ten times a day and never once held the rail. He was sixty-one. I told him a hundred times.',
            'O merdiveni günde on kez kullanırdı, bir kez olsun tırabzanı tutmadı. Altmış bir yaşındaydı. Yüz kere söyledim.',
          ),
          facts: ['Insists her father fell from the ladder', 'Says he never held the rail'],
        },
        {
          stance: 'evasive', emotion: 'anxious', requires: { presentedAny: ['ev-serology', 'ev-autopsy'] }, stress: 15,
          line: L(
            'I don’t know anything about mallets. There are dozens of tools in that room and I don’t use any of them. I do the accounts.',
            'Tokmaklardan hiç anlamam. O odada onlarca alet var, hiçbirini kullanmam. Ben hesaplara bakarım.',
          ),
          facts: ['Claims she knows nothing about the mallet', 'Says she never uses the tools'],
        },
      ],
    },
    {
      id: 't-earring', label: L('The earring back', 'Küpe arkalığı'),
      keywords: [['earring', 'clasp', 'butterfly', 'pearl', 'jewel', 'stud', 'küpe', 'arkalık', 'inci', 'mücevher']],
      evidence: ['ev-earring'],
      description: 'The gold earring back found near the body.',
      tiers: [
        {
          stance: 'evasive', emotion: 'irritated', requires: { presented: ['ev-earring'] },
          line: L(
            'I lose those constantly. I’ve worked in that room for nine years. You’ll find my hair in the varnish if you look hard enough.',
            'Onları sürekli kaybederim. Dokuz yıldır o odada çalışıyorum. İyi ararsanız verniğin içinde saçımı bile bulursunuz.',
          ),
          facts: ['Says she loses earring backs often', 'Says she has worked in the room for nine years'],
        },
        {
          // wave 4: broken by her own left stud (lab comparison or her jewellery dish)
          stance: 'partial', emotion: 'anxious', stress: 10,
          line: L(
            '(Her hand goes to her left ear and stays there.) … It’s mine. I was there — you know I was there. It must have come off while we were shouting at each other. That proves I was in the room, Detective. Nothing else.',
            '(Eli sol kulağına gider ve orada kalır.) … Benim. Oradaydım — orada olduğumu biliyorsunuz. Birbirimize bağırırken düşmüş olmalı. Bu, odada olduğumu kanıtlar, Komiser. Başka hiçbir şeyi değil.',
          ),
          facts: ['Admits the earring back is hers', 'Says it came off during the argument with her father'],
        },
      ],
    },
    {
      id: 't-others', label: L('Who else could have done it', 'Başka kim yapmış olabilir'),
      keywords: [['who', 'suspect', 'else', 'enemies', 'anyone', 'think', 'miriam', 'achterberg', 'leo', 'apprentice', 'jonas', 'bow', 'stealing', 'theft', 'kim', 'şüpheli', 'başka', 'düşman', 'çırak', 'hırsız', 'çaldı']],
      description: 'Clara’s view of the others: Miriam, Leo, Jonas.',
      tiers: [
        {
          stance: 'truth', emotion: 'guarded',
          line: L(
            'Miriam Achterberg was threatening to pull her consignment and she was not polite about it. Leo has been taking things — a bow went missing this week, tools before that; I told my father. Jonas… Jonas has been with us nineteen years. Draw your own conclusions.',
            'Miriam Achterberg emanetini geri çekmekle tehdit ediyordu, hem de hiç kibar değildi. Leo bir şeyler alıyordu — bu hafta bir yay kayboldu, ondan önce aletler; babama söyledim. Jonas… Jonas on dokuz yıldır bizimle. Sonucu siz çıkarın.',
          ),
          facts: ['Says Miriam was threatening to withdraw the consignment', 'Says Leo has been stealing, including a bow this week', 'Is ambiguous about Jonas'],
        },
      ],
    },
    {
      id: 't-thomas', label: L('Her relationship with her father', 'Babasıyla ilişkisi'),
      keywords: [['relationship', 'father', 'dad', 'close', 'get along', 'argue', 'love', 'him', 'person', 'like', 'ilişki', 'baban', 'anlaş', 'sever', 'nasıl biri']],
      description: 'What Thomas was like and how she got along with him.',
      tiers: [
        {
          stance: 'truth', emotion: 'grieving',
          line: L(
            'He built that place from a rented bench. He could hear a crack in a top through a closed case. He trusted me with the books and the clients and never once asked to see them. We argued like any family. He was my father.',
            'O yeri kiralık bir tezgâhtan büyüttü. Kapalı kutunun içinden kapaktaki çatlağı duyardı. Defterleri, müşterileri bana bıraktı, bir kez olsun görmek istemedi. Her aile gibi tartışırdık. O benim babamdı.',
          ),
          facts: ['Describes her father as a gifted, proud craftsman', 'Says he trusted her with the books and never checked them', 'Says they argued like any family'],
        },
      ],
    },
    {
      id: 't-confession', label: L('Did she kill him', 'Babasını o mu öldürdü'),
      keywords: [['kill', 'killed', 'murder', 'murdered', 'hit him', 'struck', 'did you do', 'responsible', 'confess', 'truth', 'öldür', 'cinayet', 'katil', 'itiraf', 'vurdu']],
      description: 'Direct accusation that Clara killed her father.',
      tiers: [
        {
          stance: 'lie', emotion: 'hostile',
          line: L('No. I loved my father. Whatever you think you have — no.', 'Hayır. Babamı severdim. Elinizde ne olduğunu sanıyorsanız — hayır.'),
          facts: ['Denies killing her father'],
        },
        {
          stance: 'truth', emotion: 'resigned', requires: { presented: ['ev-accesslog', 'ev-serology', 'ev-geneva'], minStress: 70 }, statements: ['s-clara-confession'], stress: -30,
          line: L(
            'He turned his back on me. He was reaching for the phone. He said he’d call Miriam first, and then the police, and that I could explain it to both of them. I don’t remember picking it up. I remember the sound. … I’d like to speak to a lawyer now.',
            'Bana sırtını döndü. Telefona uzanıyordu. Önce Miriam’ı, sonra polisi arayacağını, ikisine de benim açıklama yapacağımı söyledi. Onu elime aldığımı hatırlamıyorum. Sesi hatırlıyorum. … Artık bir avukatla görüşmek istiyorum.',
          ),
          facts: ['Admits she struck her father as he reached for the phone', 'Says he was about to call Miriam and the police', 'Asks for a lawyer'],
        },
      ],
    },
  ],
};

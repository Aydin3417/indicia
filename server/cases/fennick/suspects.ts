// SERVER-ONLY. Ash and Glaze — the three people in the interview room, written inline (v1 tiers + v2 claim cards).
//   Selma: hides a borrowed kiln and a forbidden heater; afraid she started the fire. Breaks on her own pots.
//   Bram:  hides a crate of his mother's rejects; covers for Selma, Selma for him. Breaks on the camera, then the shelf.
//   Oskar: the landlord. Charming, patient, never raises his voice; every lie is a document he wrote himself.
// Breakable claims carry a small "tell" in their (free) press line, so an attentive player knows where to push.
import type { SuspectDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const selma: SuspectDef = {
  id: 'selma',
  name: 'Selma Aydın',
  age: 29,
  occupation: L('Studio assistant, Vos Ceramics', 'Atölye asistanı, Vos Seramik'),
  relationship: L('Agnes’s assistant for four years; has her own key and the Unit 4 code', 'Dört yıldır Agnes’in asistanı; kendi anahtarı ve 4 numaranın şifresi var'),
  initials: 'SA',
  portraitTone: '#4f4237',
  background: 'From İzmir; came to Hallstedt for art school and stayed. Four years as Agnes Vos’s assistant: mixes her glazes, loads and fires her kiln, is never credited.',
  personality: 'Proud, quick, defensive; warm once she stops being afraid. Believes she may have caused the fire.',
  speakingStyle: 'Precise about clay and kilns, clipped about herself. Short sentences when scared.',
  vulnerabilities: 'Her career: being blamed for the fire, or caught using Agnes’s kiln without leave, would end it.',
  publicProfile: L('Ceramicist from İzmir, trained in Hallstedt. Mixes Agnes’s glazes and runs her kiln.', 'İzmirli seramikçi, Hallstedt’te okudu. Agnes’in sırlarını hazırlar, fırınını o yakar.'),
  claimedAlibi: L('Left with Agnes at 18:30; home all night.', '18:30’da Agnes’le çıkmış; bütün gece evdeymiş.'),
  actualWhereabouts: 'Back at the studio 21:15–00:40 firing her own pots; used the heater by the glaze bench, put it back unplugged at 00:40. Home by 01:15.',
  motive: 'None for a fire. A grudge against Agnes for refusing her a shelf in the kiln.',
  secrets: ['Fired six pots for the Nordic Young Ceramics prize in Agnes’s kiln without leave', 'Used the banned heater to dry them', 'Saw Bram take a crate of seconds; they agreed to keep quiet'],
  knows: ['The heater was unplugged in its corner at 00:40', 'Dahl spent fifteen minutes at the smoke alarm on Friday and asked about weekends'],
  doesNotKnow: ['Who came at 01:36', 'That the alarm had no battery'],
  baseline: { trust: 45, stress: 40 },
  shutdownStress: 85,
  opening: L('I haven’t slept since the fire. Ask quickly.', 'Yangından beri gözümü kırpmadım. Çabuk sorun.'),
  deflections: [L('I don’t know what you mean.', 'Ne demek istediğinizi anlamadım.'), L('Ask me about the studio. That I know.', 'Bana atölyeyi sorun. Onu bilirim.')],
  dismissals: [
    L('That has nothing to do with me.', 'Bunun benimle ilgisi yok.'),
    L('(She folds her arms.) And?', '(Kollarını kavuşturur.) Ee?'),
    L('You’re fishing.', 'Olta atıyorsunuz.'),
    L('I mix glazes, Detective. I don’t read minds.', 'Ben sır hazırlarım, Komiser. Akıl okumam.'),
    L('Is that what you got up for this morning?', 'Bu sabah bunun için mi kalktınız?'),
    L('(A short laugh.) Try again.', '(Kısa bir gülüş.) Bir daha deneyin.'),
  ],
  resists: [
    L('(Her eyes stay on it.) That doesn’t prove anything. Not yet.', '(Gözünü ondan ayırmıyor.) Bu bir şey kanıtlamaz. Henüz değil.'),
    L('Close. You’re not there.', 'Yaklaştınız. Ama daha değil.'),
  ],
  pushback: [L('Don’t shout at me. I’ve had enough shouting for one week.', 'Bana bağırmayın. Bu hafta yeterince bağırış duydum.')],
  shutdownLines: [L('I’m done. I need to sleep.', 'Bu kadar. Uyumam lazım.')],
  guarded: [],
  topics: [
    {
      id: 't-night', label: L('Her night', 'Onun gecesi'),
      keywords: [['night', 'home', 'evening', 'left', 'where', 'kiln', 'gece', 'ev', 'akşam', 'çıktı', 'nerede', 'fırın']],
      description: 'Where Selma was on Friday night and what she did at the studio.',
      tiers: [
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-selma-home'],
          line: L(
            'I locked up with Agnes at half past six and cycled home. I was asleep when Bram rang me about the fire.',
            'Altı buçukta Agnes’le birlikte kapattık, bisikletle eve gittim. Bram yangını haber vermek için aradığında uyuyordum.',
          ),
          facts: ['Claims she left with Agnes at 18:30 and slept at home'],
          claims: [{
            id: 'c-selma-home', text: L('I left with Agnes at half past six.', 'Altı buçukta Agnes’le çıktım.'),
            anchor: L('I locked up with Agnes at half past six and cycled home.', 'Altı buçukta Agnes’le birlikte kapattık, bisikletle eve gittim.'),
            press: { line: L('Pasta, a film, bed. (She answers the floor, not you.)', 'Makarna, bir film, yatak. (Size değil, yere cevap veriyor.)') },
            breaks: [{ by: ['f-sa-pots', 'ev-kilnpots', 'f-bike-0044'] }],
          }],
        },
        {
          stance: 'partial', emotion: 'anxious', statements: ['s-selma-back'], stress: 20,
          line: L(
            '(She closes her eyes.) Fine. I came back at a quarter past nine. Six pots for the Nordic Young Ceramics prize — the deadline is Monday and Agnes wouldn’t give me one shelf in her kiln. I fired them, I glazed my tiles, I left at twenty to one. The kiln was perfect. I didn’t touch anything else.',
            '(Gözlerini kapatır.) Peki. Dokuzu çeyrek geçe geri geldim. Kuzey Genç Seramik Ödülü için altı parça — son gün pazartesi, Agnes de fırınında bana tek bir raf bile vermedi. Pişirdim, deneme karolarımı sırladım, biri yirmi kala çıktım. Fırın kusursuzdu. Başka hiçbir şeye dokunmadım.',
          ),
          facts: ['Admits she came back at 21:15 to fire her own pots', 'Says she left at 00:40 and touched nothing else'],
          claims: [
            {
              id: 'c-selma-prize', text: L('I came back to fire six pots for the prize in Agnes’s kiln.', 'Ödül için altı parçamı Agnes’in fırınında pişirmeye geri geldim.'),
              anchor: L('Six pots for the Nordic Young Ceramics prize', 'Kuzey Genç Seramik Ödülü için altı parça'),
              facts: ['f-selma-kiln'],
            },
            {
              id: 'c-selma-perfect', text: L('The kiln was perfect when I left at twenty to one.', 'Biri yirmi kala çıktığımda fırın kusursuzdu.'),
              anchor: L('I left at twenty to one. The kiln was perfect.', 'biri yirmi kala çıktım. Fırın kusursuzdu.'),
              press: { line: L('Programme ending at five to one, door shut, vents closed. I know that kiln better than she does.', 'Program biri beş kala bitecekti, kapak kapalı, hava delikleri kapalı. O fırını ondan iyi bilirim.'), facts: ['f-selma-programme'] },
            },
            {
              id: 'c-selma-touched', text: L('I didn’t touch anything else in the studio.', 'Atölyede başka hiçbir şeye dokunmadım.'),
              anchor: L('I didn’t touch anything else.', 'Başka hiçbir şeye dokunmadım.'),
              press: { line: L('Why would I? (Too quick. Her eyes go to the sink corner and back.)', 'Neden dokunayım? (Fazla hızlı. Gözü lavabonun olduğu köşeye kayıp geri döner.)') },
              breaks: [{ by: ['f-heater-plugged', 'f-heater-home', 'ev-heater'] }],
            },
          ],
        },
        {
          stance: 'truth', emotion: 'distressed', statements: ['s-selma-heater'], stress: 15,
          line: L(
            '(Quietly.) The heater. I dragged it out to dry my pots faster — by the glaze bench, nowhere near the racks, I’m not stupid. At twenty to one I unplugged it and pushed it back into its corner by the sink. I swear on my mother. If it started that fire then I —',
            '(Sessizce.) Isıtıcı. Parçalarım çabuk kurusun diye çıkardım — sır tezgâhının yanına, rafların yanına bile değil, aptal değilim. Biri yirmi kala fişini çektim, lavabonun yanındaki köşesine geri ittim. Annemin üstüne yemin ederim. Eğer o yangını o çıkardıysa ben —',
          ),
          facts: ['Used the heater by the glaze bench; unplugged it and returned it to its corner at 00:40'],
          claims: [{
            id: 'c-selma-corner', text: L('At twenty to one I unplugged the heater and put it back in its corner.', 'Biri yirmi kala ısıtıcının fişini çekip köşesine koydum.'),
            anchor: L('At twenty to one I unplugged it and pushed it back into its corner by the sink.', 'Biri yirmi kala fişini çektim, lavabonun yanındaki köşesine geri ittim.'),
            facts: ['f-heater-corner'],
          }],
        },
      ],
      v2: {},
    },
    {
      id: 't-agnes', label: L('Agnes', 'Agnes'),
      keywords: [['agnes', 'boss', 'work', 'job', 'patron', 'iş', 'çalış']],
      description: 'Selma on working for Agnes Vos.',
      tiers: [{
        stance: 'truth', emotion: 'irritated',
        line: L(
          'She’s the best potter in this country and the hardest person to work for. Four years I’ve mixed her glazes. She still introduces me as “the girl”.',
          'Bu ülkenin en iyi seramikçisi, birlikte çalışılması en zor insanı. Dört yıldır sırlarını ben hazırlıyorum. Beni hâlâ “kız” diye tanıştırıyor.',
        ),
        facts: ['Resents Agnes but admires her work'],
        claims: [{
          id: 'c-selma-agnes', text: L('Agnes is the best potter in the country and the hardest to work for.', 'Agnes ülkenin en iyi seramikçisi ve birlikte çalışılması en zor insan.'),
          press: { line: L('Forty pieces on those racks. I mixed every glaze. You think I’d burn that?', 'O raflarda kırk parça vardı. Her birinin sırrını ben hazırladım. Onu yakacağımı mı sanıyorsunuz?') },
        }],
      }],
    },
    {
      id: 't-bram', label: L('Bram', 'Bram'),
      keywords: [['bram', 'son', 'van', 'oğlu', 'minibüs']],
      description: 'Whether Selma saw Bram at the studio that night.',
      tiers: [
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-selma-nobram'],
          line: L('Bram does the shop. We don’t talk much. I didn’t see anyone that night.', 'Bram dükkâna bakar. Pek konuşmayız. O gece kimseyi görmedim.'),
          facts: ['Says she saw nobody that night'],
          claims: [{
            id: 'c-selma-nobody', text: L('I didn’t see anyone that night.', 'O gece kimseyi görmedim.'),
            press: { line: L('Nobody. (She picks at the clay under a nail.)', 'Kimseyi. (Tırnağının altındaki çamuru kazır.)') },
            breaks: [{ by: ['f-van-in', 'f-bram-seconds', 'ev-ostkai'] }],
          }],
        },
        {
          stance: 'truth', emotion: 'resigned',
          line: L(
            'He came at twenty past eleven with the van and took a crate off the seconds shelf. He saw the kiln running; I saw the crate. He said if I didn’t tell Agnes, he wouldn’t either. That’s all it was.',
            'Gece on biri yirmi geçe minibüsle geldi, ıskarta rafından bir kasa aldı. O fırının yandığını gördü, ben de kasayı. Sen Agnes’e söylemezsen ben de söylemem dedi. Hepsi bu.',
          ),
          facts: ['Saw Bram take a crate of seconds at 23:20; they agreed to stay quiet'],
          claims: [{ id: 'c-selma-deal', text: L('Bram came at twenty past eleven for a crate of seconds; we agreed to keep quiet.', 'Bram on biri yirmi geçe bir kasa ıskarta için geldi; ikimiz de susmaya karar verdik.'), facts: ['f-selma-saw-bram'] }],
        },
      ],
      v2: { chips: ['f-van-in', 'f-gate-2318', 'f-crate-gap', 'ev-ostkai'] },
    },
    {
      id: 't-prize', label: L('The prize', 'Ödül'),
      keywords: [['prize', 'competition', 'nordic', 'entry', 'form', 'ödül', 'yarışma', 'başvuru', 'form']],
      description: 'Selma’s entry for the Nordic Young Ceramics prize.',
      tiers: [{
        stance: 'truth', emotion: 'grieving',
        line: L(
          'The Nordic Young Ceramics prize. Six pieces, deadline Monday noon. The entry form was on the glaze bench, filled in, waiting for the photographs. It’s ash now, like everything else on that bench.',
          'Kuzey Genç Seramik Ödülü. Altı parça, son gün pazartesi öğlen. Başvuru formu doldurulmuş hâlde sır tezgâhının üstünde, fotoğrafları bekliyordu. O tezgâhtaki her şey gibi o da artık kül.',
        ),
        facts: ['Her filled-in prize entry form lay on the glaze bench and burned'],
        claims: [{
          id: 'c-selma-form', text: L('My entry form was on the glaze bench. It burned.', 'Başvuru formum sır tezgâhının üstündeydi. Yandı.'),
          anchor: L('The entry form was on the glaze bench, filled in, waiting for the photographs.', 'Başvuru formu doldurulmuş hâlde sır tezgâhının üstünde, fotoğrafları bekliyordu.'),
          press: {
            line: L('Name, the six titles, “fired at Vos Ceramics”. Anyone who stood at that bench could read it. (She has not thought yet about who did.)', 'Adım, altı parçanın adı, “Vos Seramik’te pişirildi”. O tezgâhın başında duran herkes okuyabilirdi. (Kimin durduğunu henüz düşünmemiş.)'),
            facts: ['f-prize-form'],
          },
        }],
      }],
      v2: { chips: ['f-sa-pots', 'f-selma-kiln'] },
    },
    {
      id: 't-friday', label: L('Friday afternoon', 'Cuma öğleden sonra'),
      keywords: [['friday', 'inspection', 'ladder', 'alarm', 'dahl', 'cuma', 'denetim', 'merdiven']],
      description: 'What Selma saw of the landlord’s inspection on Friday.',
      tiers: [{
        stance: 'truth', emotion: 'anxious', statements: ['s-selma-ladder'],
        line: L(
          'Mr Dahl came for his “safety inspection” at three. Fifteen minutes up a ladder at the smoke alarm, then down again with his hands in his pockets. He asked me — very friendly — whether the big kiln runs at weekends, and whether anyone comes in on a Saturday. I said nobody does. (She hears it as she says it.)',
          'Dahl Bey saat üçte “güvenlik denetimi”ne geldi. On beş dakika merdivende, duman alarmının başında; sonra elleri ceplerinde indi. Bana — gayet tatlı dille — büyük fırının hafta sonu çalışıp çalışmadığını, cumartesi gelen olup olmadığını sordu. Kimse gelmez dedim. (Söylerken ne söylediğini duyar.)',
        ),
        facts: ['Saw Dahl spend fifteen minutes at the smoke alarm on Friday', 'Dahl asked whether anyone works at weekends'],
        claims: [
          { id: 'c-selma-ladder', text: L('Dahl spent fifteen minutes on a ladder at the smoke alarm on Friday.', 'Dahl cuma günü on beş dakika merdivende, duman alarmının başında kaldı.'), facts: ['f-selma-ladder'] },
          {
            id: 'c-selma-weekend', text: L('He asked whether anyone works there at weekends.', 'Hafta sonu orada çalışan olup olmadığını sordu.'), facts: ['f-selma-weekend'],
            press: { line: L('I thought he was being kind. He’s never asked me anything in four years.', 'Nezaketinden soruyor sandım. Dört yılda bana tek bir şey sormamıştı.') },
          },
        ],
      }],
      v2: { locked: true },
    },
  ],
  v2: { patience: 4 },
};

export const bram: SuspectDef = {
  id: 'bram',
  name: 'Bram Vos',
  age: 37,
  occupation: L('Runs the shop and the books, Vos Ceramics', 'Vos Seramik’in dükkânını ve hesaplarını yürütüyor'),
  relationship: L('Agnes’s son; raised the studio’s insurance in August', 'Agnes’in oğlu; ağustosta atölyenin sigortasını yükseltti'),
  initials: 'BV',
  portraitTone: '#3d4a44',
  background: 'Ran a café on Ostkai that closed last year owing €60,000. Has kept his mother’s accounts since; she never lets him forget the café.',
  personality: 'Charming, evasive, ashamed. Lies the way people do who are used to being forgiven.',
  speakingStyle: 'Easy, joking, too many words; calls his mother "Mum"; goes quiet when cornered.',
  vulnerabilities: 'His mother finding out he sells her rejects; being thought capable of burning her work.',
  publicProfile: L('Ran a café that closed last year; has kept his mother’s accounts ever since.', 'Geçen yıl kapanan bir kafe işletiyordu; o günden beri annesinin hesaplarına bakıyor.'),
  claimedAlibi: L('At home with his wife all evening.', 'Bütün akşam karısıyla evdeymiş.'),
  actualWhereabouts: 'At the studio 23:18–23:51 taking a crate of seconds; at Kranz Antiques 00:20–02:05.',
  motive: 'Debt; raised the insurance cover (at his mother’s request). No motive to burn her exhibition.',
  secrets: ['Sells his mother’s seconds to a dealer for cash', 'Owes €60,000', 'Dahl offered him a finder’s fee to get his mother out of the lease'],
  knows: ['Selma was firing the kiln at 23:20', 'Dahl wanted the lease ended'],
  doesNotKnow: ['Anything after 23:51'],
  baseline: { trust: 55, stress: 35 },
  shutdownStress: 90,
  opening: L('Detective. Mum’s in pieces. Whatever you need — ask.', 'Komiser. Annem perişan. Neye ihtiyacınız varsa sorun.'),
  deflections: [L('Sorry — lost me there.', 'Kusura bakmayın, sizi kaçırdım.'), L('Ask me about the shop. I know the shop.', 'Bana dükkânı sorun. Dükkânı bilirim.')],
  dismissals: [
    L('I don’t see what that’s got to do with me.', 'Bunun benimle ne ilgisi var, anlamadım.'),
    L('(He laughs.) Is that it?', '(Güler.) Bu mu yani?'),
    L('You’ll have to do better than that, Detective.', 'Bundan iyisini bulmanız lazım, Komiser.'),
    L('Mum would say you’re wasting my time. Mum’s usually right.', 'Annem olsa zamanımı boşa harcıyorsunuz derdi. Annem genelde haklı çıkar.'),
    L('(He checks his phone.) Sorry. Go on.', '(Telefonuna bakar.) Pardon. Devam edin.'),
    L('That’s nothing. Next.', 'Bu bir şey değil. Sıradaki.'),
  ],
  resists: [
    L('(He stops smiling.) That’s not enough to make me say anything else.', '(Gülümsemesi kaybolur.) Bu, başka bir şey söylemem için yetmez.'),
    L('Nice try. Not quite.', 'İyi denemeydi. Tam değil.'),
  ],
  pushback: [L('Steady on. I’m on your side here.', 'Yavaş olun. Ben sizin tarafınızdayım.')],
  shutdownLines: [L('I think I’ll call a lawyer now.', 'Sanırım artık bir avukat arayacağım.')],
  guarded: [],
  topics: [
    {
      id: 't-evening', label: L('His evening', 'Onun akşamı'),
      keywords: [['night', 'evening', 'home', 'where', 'van', 'gece', 'akşam', 'ev', 'nerede', 'minibüs']],
      description: 'Where Bram was on Friday night.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-bram-home'],
          line: L(
            'Home with Liv all evening. Thai food, a film, bed by midnight. First I heard of it was the fire service ringing Mum, and Mum ringing me at three.',
            'Bütün akşam Liv’le evdeydim. Tay yemeği, bir film, gece yarısı yatak. İlk itfaiye annemi aramış, annem de beni saat üçte aradı; öyle duydum.',
          ),
          facts: ['Claims he was at home with his wife all evening'],
          claims: [{
            id: 'c-bram-home', text: L('I was home with Liv all evening.', 'Bütün akşam Liv’le evdeydim.'),
            anchor: L('Home with Liv all evening.', 'Bütün akşam Liv’le evdeydim.'),
            press: { line: L('(He smiles a beat too early.) Ask Liv. Liv will tell you.', '(Bir an erken gülümser.) Liv’e sorun. Liv söyler.') },
            breaks: [{ by: ['f-van-in', 'f-van-out', 'f-selma-saw-bram', 'ev-ostkai'] }],
          }],
        },
        {
          stance: 'lie', emotion: 'anxious', statements: ['s-bram-kiln'], stress: 15,
          line: L(
            'All right — I drove over about eleven. Selma had told me she might be firing, and with forty pieces drying next door I went to check the kiln was safe. Ten minutes. Then home.',
            'Tamam — on bir gibi arabayla uğradım. Selma o gece pişirim yapabileceğini söylemişti; yan tarafta kırk parça kururken fırın güvende mi diye bakmaya gittim. On dakika. Sonra eve.',
          ),
          facts: ['Now says he came at about 23:00 only to check the kiln'],
          claims: [{
            id: 'c-bram-kiln', text: L('I only came by to check the kiln was safe.', 'Sadece fırın güvende mi diye bakmaya geldim.'),
            anchor: L('I went to check the kiln was safe.', 'fırın güvende mi diye bakmaya gittim.'),
            press: { line: L('It was fine. Hot, but fine. (Thirty-three minutes in the yard for a ten-minute look.)', 'İyiydi. Sıcaktı ama iyiydi. (On dakikalık bir bakış için avluda otuz üç dakika.)') },
            breaks: [{ by: ['f-crate-gap', 'f-selma-saw-bram'] }],
          }],
        },
        {
          stance: 'truth', emotion: 'resigned', statements: ['s-bram-seconds'], revealsEvidence: ['ev-kranzcard'], stress: 15,
          line: L(
            '(He rubs his face.) Mum marks the pieces she won’t sell as seconds and smashes them once a year. I took a crate. Kranz on Ostkai pays cash for anything with her stamp. I was at his back table from twenty past twelve until two, counting and haggling. Here — his card. Ring him.',
            '(Yüzünü ovuşturur.) Annem satmayacağı işleri ıskartaya ayırır, yılda bir de hepsini kırar. Bir kasa aldım. Ostkai’deki Kranz, altında annemin damgası olan her şeye nakit öder. Gece yarısını yirmi geçeden ikiye kadar onun arka masasındaydım; saydık, pazarlık ettik. Buyurun, kartviziti. Arayın.',
          ),
          facts: ['Took a crate of seconds to sell to Kranz; at Kranz’s 00:20–02:00'],
          claims: [{
            id: 'c-bram-crate', text: L('I took a crate of seconds to Kranz and stayed there until two.', 'Bir kasa ıskartayı Kranz’a götürdüm, ikiye kadar oradaydım.'),
            anchor: L('I was at his back table from twenty past twelve until two, counting and haggling.', 'Gece yarısını yirmi geçeden ikiye kadar onun arka masasındaydım; saydık, pazarlık ettik.'),
            facts: ['f-bram-seconds'],
          }],
        },
      ],
    },
    {
      id: 't-insurance', label: L('The insurance', 'Sigorta'),
      keywords: [['insurance', 'cover', 'policy', 'august', 'sigorta', 'poliçe', 'ağustos']],
      description: 'Why Bram raised the studio’s insurance cover in August.',
      tiers: [{
        stance: 'truth', emotion: 'guarded', statements: ['s-bram-cover'],
        line: L(
          'I raised the cover in August, from ninety thousand to two hundred and sixty. Mum told me to — the Kunsthalle wanted the pieces on a policy before they’d take them. I know how it looks. That’s why I’m telling you before you ask.',
          'Ağustosta teminatı doksan binden iki yüz altmış bine çıkardım. Annem istedi — Kunsthalle parçaları sigortalı olmadan almıyordu. Nasıl göründüğünü biliyorum. O yüzden siz sormadan söylüyorum.',
        ),
        facts: ['Raised the cover from €90k to €260k in August at his mother’s request'],
        claims: [{
          id: 'c-bram-cover', text: L('I raised the cover in August because Mum asked me to.', 'Teminatı ağustosta annem istediği için yükselttim.'), facts: ['f-bram-cover'],
          press: { line: L('And it pays her, not me. Read the policy. (He has clearly read it twice.)', 'Hem para ona ödenir, bana değil. Poliçeyi okuyun. (Belli ki iki kez okumuş.)'), facts: ['f-policy-agnes'] },
        }],
      }],
    },
    {
      id: 't-money', label: L('Money', 'Para'),
      keywords: [['money', 'debt', 'cafe', 'café', 'owe', 'para', 'borç', 'kafe']],
      description: 'Bram’s debts.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-bram-fine'],
          line: L('Money’s fine. The café didn’t work out, that’s all. Lots of cafés don’t.', 'Param yerinde. Kafe tutmadı, o kadar. Çoğu kafe tutmaz.'),
          facts: ['Says his money is fine'],
          claims: [{
            id: 'c-bram-fine', text: L('Money’s fine. The café just didn’t work out.', 'Param yerinde. Kafe tutmadı, o kadar.'),
            press: { line: L('(He spins his wedding ring.) Fine. Really.', '(Alyansını çevirir.) Yerinde. Gerçekten.') },
            breaks: [{ by: ['f-bram-seconds', 'f-kranz'] }],
          }],
        },
        {
          stance: 'truth', emotion: 'distressed',
          line: L(
            'I owe sixty thousand on the café. That’s what the seconds were for. Not a fire — I’d never burn her work. Those forty pieces were the only thing that’s made her happy in years.',
            'Kafeden altmış bin borcum var. Iskartalar o yüzdendi. Yangın değil — onun işlerini asla yakmam. O kırk parça, yıllardır onu mutlu eden tek şeydi.',
          ),
          facts: ['Owes €60,000 from the café'],
          claims: [{ id: 'c-bram-debt', text: L('I owe sixty thousand on the café; that’s what the seconds were for.', 'Kafeden altmış bin borcum var; ıskartalar onun içindi.'), facts: ['f-bram-debt'] }],
        },
      ],
    },
    {
      id: 't-selma', label: L('Selma', 'Selma'),
      keywords: [['selma', 'assistant', 'kiln', 'asistan', 'fırın']],
      description: 'Whether Bram saw Selma at the studio that night.',
      tiers: [
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-bram-noselma'],
          line: L('Selma? She’d gone home hours before. The studio was empty when I looked in.', 'Selma mı? Saatler önce eve gitmişti. Uğradığımda atölye bomboştu.'),
          facts: ['Says the studio was empty when he looked in'],
          claims: [{
            id: 'c-bram-empty', text: L('The studio was empty when I looked in.', 'Uğradığımda atölye bomboştu.'),
            press: { line: L('Empty. Dark. (He says “dark” about a room with a kiln running.)', 'Bomboş. Karanlık. (İçinde fırın yanan bir oda için “karanlık” diyor.)') },
            breaks: [{ by: ['f-selma-saw-bram', 'f-selma-kiln', 'f-sa-pots'] }],
          }],
        },
        {
          stance: 'truth', emotion: 'resigned',
          line: L(
            'She was there, firing her pots for that prize. She saw me with the crate, I saw her with Mum’s kiln. We shook on it. I’m not proud of that either.',
            'Oradaydı; o ödül için parçalarını pişiriyordu. O beni kasayla gördü, ben onu annemin fırınıyla. El sıkıştık. Bununla da gurur duymuyorum.',
          ),
          facts: ['Admits Selma was there; they agreed to cover for each other'],
          claims: [{ id: 'c-bram-shook', text: L('Selma was there firing her pots; we agreed to keep quiet.', 'Selma oradaydı, parçalarını pişiriyordu; ikimiz de susmaya karar verdik.'), facts: ['f-selma-saw-bram'] }],
        },
      ],
      v2: { chips: ['f-sa-pots', 'f-selma-kiln'] },
    },
    {
      id: 't-dahl', label: L('Oskar Dahl', 'Oskar Dahl'),
      keywords: [['dahl', 'oskar', 'landlord', 'lease', 'ev sahibi', 'kira']],
      description: 'What the landlord offered Bram.',
      tiers: [{
        stance: 'truth', emotion: 'resigned', statements: ['s-bram-fee'],
        line: L(
          'Dahl bought me a drink in September. Said if I could get Mum to sign away the lease, there’d be a “finder’s fee” for me — fifteen thousand. I said I’d think about it. I never asked her. (He looks at his hands.) I did think about it, though.',
          'Dahl eylülde bana bir içki ısmarladı. Annemi kiradan vazgeçirirsem bana bir “aracılık payı” olacağını söyledi — on beş bin. Düşüneceğim dedim. Anneme hiç sormadım. (Ellerine bakar.) Ama düşündüm, yalan yok.',
        ),
        facts: ['Dahl offered Bram €15,000 to get Agnes out of the lease'],
        claims: [{
          id: 'c-bram-fee', text: L('In September Dahl offered me fifteen thousand to get Mum out of the lease.', 'Eylülde Dahl, annemi kiradan çıkarırsam bana on beş bin teklif etti.'), facts: ['f-bram-fee'],
          press: { line: L('He said “a fresh start for everyone”. He says that a lot.', '“Herkes için temiz bir sayfa” dedi. Bunu çok der.') },
        }],
      }],
      v2: { locked: true },
    },
  ],
  v2: { patience: 5 },
};

export const oskar: SuspectDef = {
  id: 'oskar',
  name: 'Oskar Dahl',
  age: 58,
  occupation: L('Owner of Fennick Yard', 'Fennick Avlusu’nun sahibi'),
  relationship: L('Agnes Vos’s landlord for twenty-two years', 'Yirmi iki yıldır Agnes Vos’un ev sahibi'),
  initials: 'OD',
  portraitTone: '#463a3a',
  background: 'Former shipping agent. Bought Fennick Yard in 2002 and has borrowed against it ever since; a €1.9M bridging loan falls due on 31 December. Signed a conditional sale to Norrhavn Living in September.',
  personality: 'Genial, paternal, practised at charm. Never raises his voice. Cracks only when his own paperwork is put in front of him.',
  speakingStyle: '"Detective, please." Calls the yard "my family". Long, comfortable sentences that get shorter as he is cornered.',
  vulnerabilities: 'His standing at the Harbour Club; the bank; being seen to have failed.',
  publicProfile: L('Former shipping agent. Bought the yard in 2002 and calls its tenants “my family”.', 'Eski gemi acentesi. Avluyu 2002’de aldı; kiracılarına “ailem” der.'),
  claimedAlibi: L('At the Shipowners’ dinner at the Harbour Club; a taxi home at 01:30.', 'Harbour Club’daki Armatörler yemeğindeymiş; 01:30’da taksiyle eve dönmüş.'),
  actualWhereabouts: 'Harbour Club until 01:10; paused the yard recorder at 01:00; walked to the yard; set the fire 01:36–01:44; walked home.',
  motive: 'A €4.2M sale conditional on Unit 4 being empty by 31 December; clause 14.2 of Agnes’s lease ends it on fire.',
  secrets: ['Took the smoke-alarm battery on Friday', 'Paused the yard recorder from his phone', 'Set the fire with lamp oil from his own shed', 'Burned his shoes'],
  knows: ['Everything about the fire', 'That Selma’s pots were in the kiln (he saw her prize form on the bench)'],
  doesNotKnow: ['That the wall switch for the heater was off', 'That Ruth saw his coat'],
  baseline: { trust: 60, stress: 20 },
  shutdownStress: 80,
  opening: L(
    'Detective, please — sit. A terrible night. Twenty-two years and nothing like this in my yard. Coffee?',
    'Buyurun Komiser, oturun lütfen. Korkunç bir gece. Yirmi iki yıldır avlumda böyle bir şey olmadı. Kahve?',
  ),
  deflections: [L('I’m afraid I don’t follow, Detective.', 'Korkarım sizi izleyemedim, Komiser.'), L('Ask me about the yard. I know every brick.', 'Bana avluyu sorun. Her tuğlasını bilirim.')],
  dismissals: [
    L('(He smiles.) That’s very thorough of you. It means nothing.', '(Gülümser.) Çok titizsiniz. Ama bunun bir anlamı yok.'),
    L('I have been a member of the Harbour Club for thirty years, Detective.', 'Otuz yıldır Harbour Club’ın üyesiyim, Komiser.'),
    L('You’ll forgive me if I don’t see the connection.', 'Bağlantıyı göremiyorsam kusura bakmayın.'),
    L('My solicitor will enjoy that one.', 'Bunu avukatım çok sevecek.'),
    L('(He looks at his watch, kindly.) Is there anything else?', '(Kibarca saatine bakar.) Başka bir şey var mı?'),
    L('Detective, please. I own the place. Of course my name is everywhere.', 'Komiser, rica ederim. Burası benim. Adımın her yerde geçmesi doğal.'),
  ],
  resists: [
    L('(For a second he says nothing.) That is not enough, and you know it.', '(Bir an hiçbir şey söylemez.) Bu yetmez, siz de biliyorsunuz.'),
    L('Close, Detective. Not close enough.', 'Yaklaştınız Komiser. Ama yeterince değil.'),
  ],
  pushback: [L('There is no need to raise your voice. I am trying to help.', 'Sesinizi yükseltmenize gerek yok. Yardım etmeye çalışıyorum.')],
  shutdownLines: [L('I think my solicitor should be here for the rest of this.', 'Bundan sonrası için avukatımın burada olması gerektiğini düşünüyorum.')],
  guarded: [],
  topics: [
    {
      id: 't-night', label: L('His night', 'Onun gecesi'),
      keywords: [['night', 'club', 'dinner', 'taxi', 'home', 'gece', 'kulüp', 'yemek', 'taksi', 'ev']],
      description: 'Where Dahl was on Friday night and how he got home.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-taxi'],
          line: L(
            'The Shipowners’ autumn dinner at the Harbour Club. Too much brandy, far too many speeches. I took a taxi home at half past one and was asleep by two. The fire service woke me at three.',
            'Harbour Club’da Armatörlerin güz yemeği. Fazla konyak, çok fazla nutuk. Bir buçukta taksiyle eve döndüm, ikide uyuyordum. Üçte itfaiye uyandırdı.',
          ),
          facts: ['Claims he took a taxi home from the club at 01:30'],
          claims: [{
            id: 'c-oskar-taxi', text: L('I took a taxi home at half past one.', 'Bir buçukta taksiyle eve döndüm.'),
            anchor: L('I took a taxi home at half past one and was asleep by two.', 'Bir buçukta taksiyle eve döndüm, ikide uyuyordum.'),
            press: { line: L('Ostkai Taxi. They always send the Mercedes. (He names the firm before you ask.)', 'Ostkai Taksi. Hep Mercedes’i gönderirler. (Siz sormadan firmanın adını verir.)') },
            breaks: [{ by: ['f-no-taxi', 'f-teo-foot', 'ev-taxibook', 'ev-teo'] }],
          }],
        },
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-oskar-walked'], stress: 10,
          line: L(
            '(A small laugh.) Very well — I walked. Along the harbour to Strandvej, straight home. A man my age is allowed some air after a dinner like that.',
            '(Hafifçe güler.) Peki — yürüdüm. Liman boyunca Strandvej’e, doğruca eve. Böyle bir yemekten sonra benim yaşımdaki bir adam biraz hava alabilir.',
          ),
          facts: ['Now says he walked straight home along the harbour'],
          claims: [{
            id: 'c-oskar-walked', text: L('I walked straight home along the harbour.', 'Liman boyunca doğruca eve yürüdüm.'),
            anchor: L('Along the harbour to Strandvej, straight home.', 'Liman boyunca Strandvej’e, doğruca eve.'),
            press: { line: L('There was a moon on the water. (Nobody asked about the moon.)', 'Suyun üstünde ay vardı. (Kimse aydan söz etmedi.)') },
            breaks: [{
              by: ['f-walker-0131', 'f-walker-0149', 'ev-ostkai'], requires: { deductions: ['d-timeline'] },
              resist: L('A man in a coat on a traffic camera. Half of Hallstedt owns a dark coat, Detective.', 'Trafik kamerasında paltolu bir adam. Hallstedt’in yarısının koyu bir paltosu var, Komiser.'),
            }],
          }],
        },
        {
          stance: 'evasive', emotion: 'anxious', stress: 15,
          line: L(
            '(Silence. Then, carefully.) I may have walked past the yard. I own it. A man may look at what he owns. I did not go in.',
            '(Sessizlik. Sonra dikkatle.) Avlunun önünden geçmiş olabilirim. Benim avlum. İnsan sahip olduğu şeye bakabilir. İçeri girmedim.',
          ),
          facts: ['Admits he may have walked past the yard; denies going in'],
          claims: [{ id: 'c-oskar-passed', text: L('I may have walked past the yard. I did not go in.', 'Avlunun önünden geçmiş olabilirim. İçeri girmedim.'), facts: ['f-oskar-passed'] }],
        },
      ],
    },
    {
      id: 't-unit4', label: L('Unit 4', '4 numara'),
      keywords: [['unit', 'studio', 'inside', 'inspection', 'alarm', 'atölye', 'içeri', 'denetim']],
      description: 'When Dahl was last inside Agnes Vos’s studio.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-notinside'],
          line: L(
            'I haven’t set foot in Agnes’s studio for months. She doesn’t like me in there — it’s her kingdom, and I respect that.',
            'Aylardır Agnes’in atölyesine adım atmadım. Orada olmamdan hoşlanmaz — orası onun krallığı, ben de saygı duyarım.',
          ),
          facts: ['Claims he has not been inside Unit 4 for months'],
          claims: [{
            id: 'c-oskar-notinside', text: L('I haven’t set foot in Agnes’s studio for months.', 'Aylardır Agnes’in atölyesine adım atmadım.'),
            press: { line: L('Her kingdom. (He says “Agnes” the way one says the name of a pet.)', 'Onun krallığı. (“Agnes” derken bir ev hayvanının adını söyler gibi.)') },
            breaks: [{ by: ['f-inspection', 'ev-notice', 'f-selma-ladder', 'f-prints-oskar'] }],
          }],
        },
        {
          stance: 'lie', emotion: 'guarded', statements: ['s-oskar-beeped'], stress: 10,
          line: L(
            'Ah — Friday. The annual inspection; I do every unit, it’s in the lease. Fifteen minutes. I pressed the test button on the alarm and it beeped. Everything in order.',
            'Ha — cuma. Yıllık denetim; her birime yaparım, sözleşmede yazar. On beş dakika. Alarmın test düğmesine bastım, öttü. Her şey yolundaydı.',
          ),
          facts: ['Admits Friday’s inspection; says the alarm beeped when tested'],
          claims: [{
            id: 'c-oskar-beeped', text: L('On Friday I tested the alarm and it beeped.', 'Cuma günü alarmı denedim, öttü.'),
            anchor: L('I pressed the test button on the alarm and it beeped.', 'Alarmın test düğmesine bastım, öttü.'),
            press: { line: L('Beep. Like that. (He mimes pressing a button. Twice.)', 'Bip. İşte böyle. (Havada bir düğmeye basar. İki kez.)') },
            breaks: [{ by: ['f-battery-found', 'ev-battery', 'f-no-battery'] }],
          }],
        },
        {
          stance: 'partial', emotion: 'anxious', stress: 15,
          line: L(
            '(He takes off his glasses.) The battery was low. It chirped. I took it out to buy a fresh one and — it went in my pocket. I meant to come back on Monday. An old man’s mistake, Detective, not a crime.',
            '(Gözlüğünü çıkarır.) Pil zayıftı. Ötüp duruyordu. Yenisini almak için çıkardım ve — cebime girdi. Pazartesi gelecektim. Yaşlı bir adamın hatası, Komiser, suç değil.',
          ),
          facts: ['Admits he took the alarm battery out on Friday'],
          claims: [{ id: 'c-oskar-pocket', text: L('I took the battery out on Friday to replace it, and forgot.', 'Cuma günü pili değiştirmek için çıkardım, sonra unuttum.'), facts: ['f-oskar-battery'] }],
        },
      ],
    },
    {
      id: 't-codes', label: L('Gate codes', 'Kapı şifreleri'),
      keywords: [['code', 'gate', 'keypad', 'şifre', 'kapı', 'tuş']],
      description: 'Who knows the tenants’ gate codes.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-codes'],
          line: L('Each tenant chooses their own code. I wouldn’t know Agnes’s from my own birthday.', 'Her kiracı kendi şifresini seçer. Agnes’inkini kendi doğum günümden ayırt edemem.'),
          facts: ['Claims each tenant chooses their own gate code'],
          claims: [{
            id: 'c-oskar-owncodes', text: L('Each tenant chooses their own gate code.', 'Her kiracı kendi kapı şifresini seçer.'),
            press: { line: L('Privacy, Detective. My tenants are adults. (He glances at the window over the gate.)', 'Mahremiyet, Komiser. Kiracılarım yetişkin insanlar. (Gözü kapının üstündeki pencereye kayar.)') },
            breaks: [{ by: ['f-codes-reset', 'f-codes-list', 'ev-codelist'] }],
          }],
        },
        {
          stance: 'partial', emotion: 'guarded', stress: 10,
          line: L(
            'I reset them every September — the insurers like it. I keep a list in my desk. Every landlord in Hallstedt does.',
            'Her eylül sıfırlarım — sigortacılar öyle istiyor. Masamda bir liste tutarım. Hallstedt’teki bütün ev sahipleri tutar.',
          ),
          facts: ['Admits he sets the codes and keeps a list'],
          claims: [{ id: 'c-oskar-reset', text: L('I reset the codes every September and keep a list in my desk.', 'Şifreleri her eylül sıfırlar, masamda bir liste tutarım.'), facts: ['f-oskar-codes'] }],
        },
      ],
      v2: { chips: ['f-gate-0136', 'ev-gatelog'] },
    },
    {
      id: 't-shed', label: L('The shed', 'Kulübe'),
      keywords: [['shed', 'oil', 'lamp', 'padlock', 'kulübe', 'gaz', 'yağ', 'kilit']],
      description: 'Who can open the yard shed and its lamp oil.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-shed'],
          line: L(
            'That shed is open to every tenant. Salt, ladders, lamp oil for the lanterns — help yourselves, I always say.',
            'O kulübe bütün kiracılara açık. Tuz, merdiven, fenerler için gaz yağı — buyurun alın, hep derim.',
          ),
          facts: ['Claims the shed is open to every tenant'],
          claims: [{
            id: 'c-oskar-openshed', text: L('That shed is open to every tenant.', 'O kulübe bütün kiracılara açık.'),
            press: { line: L('Help yourselves. (The keys on his belt clink as he spreads his hands.)', 'Buyurun alın. (Ellerini açarken kemerindeki anahtarlar şıngırdar.)') },
            breaks: [{ by: ['f-shed-landlord'] }],
          }],
        },
        {
          stance: 'partial', emotion: 'guarded', stress: 10,
          line: L('There’s a padlock, yes. The key’s on my ring. Tenants ask, I open it. Usually.', 'Asma kilit var, evet. Anahtarı benim halkamda. Kiracılar ister, ben açarım. Genelde.'),
          facts: ['Admits only he has the shed key'],
          claims: [{ id: 'c-oskar-mykey', text: L('The shed key is on my ring; tenants ask me.', 'Kulübenin anahtarı benim halkamda; kiracılar benden ister.'), facts: ['f-oskar-shedkey'] }],
        },
      ],
      v2: { chips: ['f-shed-gap', 'f-battery-found', 'f-cap', 'ev-battery', 'ev-cap'] },
    },
    {
      id: 't-fire', label: L('The fire', 'Yangın'),
      keywords: [['fire', 'heater', 'kiln', 'cause', 'yangın', 'ısıtıcı', 'fırın', 'sebep']],
      description: 'What Dahl thinks caused the fire.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-heater'],
          line: L(
            'That heater of Agnes’s has been a fire waiting to happen for years. She ran it in the drying room every night. I warned her in writing, twice.',
            'Agnes’in o ısıtıcısı yıllardır patlamaya hazır bir bombaydı. Her gece kurutma odasında çalıştırırdı. Kendisini yazılı olarak iki kez uyardım.',
          ),
          facts: ['Claims Agnes ran the heater in the drying room every night'],
          claims: [{
            id: 'c-oskar-heater', text: L('Agnes ran that heater in the drying room every night.', 'Agnes o ısıtıcıyı her gece kurutma odasında çalıştırırdı.'),
            anchor: L('She ran it in the drying room every night.', 'Her gece kurutma odasında çalıştırırdı.'),
            press: {
              line: L('Every night. Everyone knew. Here — my last letter to her. (He has a copy ready in his breast pocket. Look at the date.)', 'Her gece. Herkes bilirdi. Buyurun — ona yazdığım son mektup. (Kopyası göğüs cebinde hazır duruyor. Tarihe bakın.)'),
              evidence: ['ev-warning'],
            },
            breaks: [{ by: ['f-heater-banned', 'f-heater-home', 'f-heater-corner'] }],
          }],
        },
        {
          stance: 'evasive', emotion: 'guarded', stress: 10,
          line: L(
            '(He folds his hands.) Then it was the kiln. That girl of hers was firing it all night — six little pots for some prize. Ask her. I’m a landlord, not a fire investigator.',
            '(Ellerini kavuşturur.) O zaman fırındır. Onun o kızı bütün gece fırını yaktı — bir ödül için altı ufak kap. Ona sorun. Ben ev sahibiyim, yangın uzmanı değil.',
          ),
          facts: ['Blames Selma’s kiln firing'],
          claims: [{
            id: 'c-oskar-kiln', text: L('Then it was the kiln — Selma was firing it all night.', 'O zaman fırındır — Selma bütün gece onu yaktı.'),
            anchor: L('That girl of hers was firing it all night — six little pots for some prize.', 'Onun o kızı bütün gece fırını yaktı — bir ödül için altı ufak kap.'),
            press: {
              line: L(
                'Six little pots for some prize. Everyone knows. (Nobody outside your notebook knows whose pots were in that kiln, or why.)',
                'Bir ödül için altı ufak kap. Herkes biliyor. (O fırında kimin kaplarının olduğunu ve neden orada olduklarını senin defterin dışında kimse bilmiyor.)',
              ),
              facts: ['f-oskar-knew'],
            },
          }],
        },
      ],
    },
    {
      id: 't-deal', label: L('Norrhavn', 'Norrhavn'),
      keywords: [['norrhavn', 'sale', 'sell', 'developer', 'flats', 'satış', 'müteahhit', 'daire']],
      description: 'Whether Dahl is selling Fennick Yard.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-nodeal'],
          line: L(
            'Developers write to me every month. I throw the letters away. Fennick Yard is not for sale while I live.',
            'Her ay bir müteahhit mektup yazar. Mektupları atarım. Ben yaşadıkça Fennick Avlusu satılık değil.',
          ),
          facts: ['Claims the yard is not for sale'],
          claims: [{
            id: 'c-oskar-notforsale', text: L('Fennick Yard is not for sale while I live.', 'Ben yaşadıkça Fennick Avlusu satılık değil.'),
            press: { line: L('My family, Detective. You don’t sell your family. (A pause half a second too long.)', 'Ailem, Komiser. İnsan ailesini satmaz. (Yarım saniye fazla süren bir duraklama.)') },
            breaks: [{ by: ['f-norrhavn', 'ev-contract'] }],
          }],
        },
        {
          stance: 'partial', emotion: 'anxious', stress: 15,
          line: L(
            '(A long breath.) A conditional sale. Conditional, Detective — on vacant possession. Agnes had nine years left on her lease. That deal was dead the day I signed it, and I knew it.',
            '(Uzun bir nefes.) Şartlı bir satış. Şartlı, Komiser — boş teslim şartıyla. Agnes’in sözleşmesinin bitmesine dokuz yıl vardı. O anlaşma imzaladığım gün ölüydü, ben de biliyordum.',
          ),
          facts: ['Admits the conditional sale; says it was dead because of Agnes’s lease'],
          claims: [{
            id: 'c-oskar-dead', text: L('The sale was dead from the start: Agnes had nine years left.', 'Satış en başından ölüydü: Agnes’in dokuz yılı vardı.'),
            press: { line: L('Nine years. (He does not mention clause fourteen. He does not have to look it up, either.)', 'Dokuz yıl. (On dördüncü maddeden hiç söz etmiyor. Bakmasına da gerek yok.)') },
          }],
        },
      ],
      v2: { chips: ['f-norrhavn', 'ev-contract', 'f-oskar-offer', 'f-bram-fee'] },
    },
    {
      id: 't-camera', label: L('The yard camera', 'Avlu kamerası'),
      keywords: [['camera', 'recorder', 'video', 'footage', 'kamera', 'kayıt', 'görüntü']],
      description: 'Why the yard camera recorded nothing during the fire.',
      tiers: [
        {
          stance: 'lie', emotion: 'calm', statements: ['s-oskar-recorder'],
          line: L(
            'That recorder stops whenever it likes — the disk fills up. I’ve been meaning to replace it for a year. You have it; see for yourself.',
            'O cihaz canı ne zaman isterse durur — disk doluyor. Bir yıldır değiştireyim diyorum. Sizde zaten; kendiniz bakın.',
          ),
          facts: ['Claims the recorder stops because its disk fills up'],
          claims: [{
            id: 'c-oskar-disk', text: L('The recorder stops whenever the disk fills up.', 'Kayıt cihazı disk dolunca duruyor.'),
            press: { line: L('Technology. (He says it like the name of a tenant who is behind on the rent.)', 'Teknoloji işte. (Kirası gecikmiş bir kiracının adını söyler gibi.)') },
            breaks: [{ by: ['f-dvr-paused', 'f-disk-free', 'ev-dvrlog'] }],
          }],
        },
        {
          stance: 'evasive', emotion: 'anxious', stress: 10,
          line: L('The app — it logs you in, it pauses, I don’t understand those things. My nephew set it up.', 'Uygulama — kendi kendine giriş yapıyor, duruyor, ben o işlerden anlamam. Yeğenim kurdu.'),
          facts: ['Blames the phone app'],
          claims: [{
            id: 'c-oskar-app', text: L('The app pauses itself; I don’t understand those things.', 'Uygulama kendi kendine duruyor; ben o işlerden anlamam.'),
            press: { line: L('(He has turned his phone face down on the table.)', '(Telefonunu masanın üstüne ters çevirmiş.)') },
          }],
        },
      ],
      v2: { chips: ['f-camera-cable', 'ev-dvr'] },
    },
  ],
  v2: { patience: 3 },
};

export const suspects: SuspectDef[] = [selma, bram, oskar];

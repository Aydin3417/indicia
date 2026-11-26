// SERVER-ONLY. Ash and Glaze — the deduction notebook (12 questions) and what each confirmation opens.
// Core chain: where it began → what fed it → the heater was staged → who had the code → the night in order → motive.
// The two innocents each have a question that clears them and opens what they know. Four side questions (the alarm,
// the walk, the recorder, the shoes) are optional; the Proof star needs 10 of 12.
// Turkish prompts never attach a case suffix to a blank: the filled value would break vowel harmony.
import type { DeductionDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const deductions: DeductionDef[] = [
  {
    id: 'd-origin', kind: 'fill',
    title: L('Where it began', 'Nerede başladı'),
    prompt: L('The fire did not start in the kiln. It began {where}: {proof}', 'Yangın fırında başlamadı. Başladığı yer: {where}. Kanıtı: {proof}'),
    blanks: [
      {
        id: 'where', type: 'choice', label: L('where', 'nerede'),
        options: [
          { id: 'o-racks', text: L('under the drying racks', 'kurutma raflarının altı') },
          { id: 'o-kiln', text: L('inside the kiln', 'fırının içi') },
          { id: 'o-heater', text: L('inside the heater', 'ısıtıcının içi') },
          { id: 'o-fusebox', text: L('in the fuse box', 'sigorta kutusu') },
        ],
        accept: ['o-racks'],
      },
      { id: 'proof', type: 'fact', label: L('proof', 'kanıt'), accept: ['f-v-pattern', 'f-kiln-0055'] },
    ],
    requires: { evidence: ['ev-burnpattern'] },
    effects: [{ type: 'unlock', target: 'analysis:a-ostkai' }],
    confirmText: L(
      'Not the kiln. Holm signs it as a set fire: this is an arson inquiry now, and the traffic authority will release the Ostkai camera. Who came through that gate?',
      'Fırın değil. Holm raporu “kasten çıkarılmış yangın” diye imzalıyor: artık bu bir kundaklama soruşturması ve trafik müdürlüğü Ostkai kamerasının kayıtlarını verecek. O kapıdan kim geçti?',
    ),
  },
  {
    id: 'd-oil', kind: 'fill',
    title: L('What fed it', 'Yangını ne besledi'),
    prompt: L(
      'The racks were set alight with {what}, carried in and poured on the way: {trail} The bottle it came from left its mark outside: {bottle}',
      'Rafları tutuşturan: {what}. İçeri taşınıp yol boyunca dökülmüş: {trail} Geldiği şişe dışarıda iz bırakmış: {bottle}',
    ),
    blanks: [
      {
        id: 'what', type: 'choice', label: L('what', 'ne'),
        options: [
          { id: 'o-lampoil', text: L('lamp oil', 'gaz yağı') },
          { id: 'o-thinner', text: L('paint thinner', 'tiner') },
          { id: 'o-glaze', text: L('glaze medium', 'sır çözeltisi') },
          { id: 'o-petrol', text: L('petrol', 'benzin') },
        ],
        accept: ['o-lampoil'],
      },
      { id: 'trail', type: 'fact', label: L('the trail', 'iz'), accept: ['f-uv-trail', 'f-shed-drips', 'f-handle-oil'] },
      { id: 'bottle', type: 'fact', label: L('the bottle', 'şişe'), accept: ['f-cap', 'f-lampoil'] },
    ],
    requires: { facts: ['f-uv-trail'] },
    effects: [{ type: 'unlock', target: 'zone:z-fy-shed' }],
    confirmText: L(
      'Lamp oil, poured from the door to the straw. In this yard there is one store of it — the landlord’s padlocked shed. The fire service cuts the padlock.',
      'Gaz yağı; kapıdan samana kadar dökülmüş. Bu avluda onun tek bir deposu var — ev sahibinin asma kilitli kulübesi. İtfaiye asma kilidi kesiyor.',
    ),
  },
  {
    id: 'd-staged', kind: 'fill',
    title: L('The heater that never ran', 'Hiç çalışmayan ısıtıcı'),
    prompt: L(
      'At {time} the heater was still in its corner, unplugged: {corner} Somebody dragged it to the racks afterwards and plugged it in where it could never run: {socket}',
      'Saat {time} olduğunda ısıtıcı hâlâ köşesindeydi, fişi çekiliydi: {corner} Biri onu sonradan raflara sürükleyip asla çalışamayacağı bir prize taktı: {socket}',
    ),
    blanks: [
      { id: 'time', type: 'time', label: L('when', 'saat'), accept: ['00:40'] },
      { id: 'corner', type: 'fact', label: L('in its corner', 'köşesinde'), accept: ['f-heater-corner'] },
      { id: 'socket', type: 'fact', label: L('the socket', 'priz'), accept: ['f-socket-off', 'f-heater-cold'] },
    ],
    requires: { facts: ['f-heater-plugged'] },
    notYet: L(
      'Not yet. A heater by the racks proves nothing until you know where it stood when the last person left — and who that was.',
      'Henüz değil. Rafların yanındaki bir ısıtıcı, son çıkan kişi giderken nerede durduğunu — ve o kişinin kim olduğunu — bilmeden hiçbir şey kanıtlamaz.',
    ),
    confirmText: L(
      'Staged. Whoever came after twenty to one wanted a heater fire, and never noticed the switch on the wall was off.',
      'Sahnelenmiş. Biri yirmi kaladan sonra gelen, yangın ısıtıcıdan çıkmış gibi görünsün istemiş; duvardaki anahtarın kapalı olduğunu ise hiç fark etmemiş.',
    ),
  },
  {
    id: 'd-selma', kind: 'fill',
    title: L('The kiln’s secret', 'Fırının sırrı'),
    prompt: L(
      'The kiln was fired by {who}, who let herself in at {time} to fire her own pieces: {pots} She was gone well before the fire: {gone}',
      'Fırını yakan: {who}. Kendi parçalarını pişirmek için içeri girdiği saat: {time}. Kanıtı: {pots} Yangından çok önce gitmişti: {gone}',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['selma'] },
      { id: 'time', type: 'time', label: L('let in at', 'giriş saati'), accept: ['21:15'] },
      { id: 'pots', type: 'fact', label: L('her pieces', 'parçaları'), accept: ['f-sa-pots', 'f-selma-kiln'] },
      { id: 'gone', type: 'fact', label: L('gone', 'gidiş'), accept: ['f-bike-0044', 'f-gate-0040'] },
    ],
    requires: { facts: ['f-sa-pots'] },
    effects: [{ type: 'unlock', target: 'topic:selma:t-friday' }],
    confirmText: L(
      'A borrowed kiln, not a fire. The programme ended normally at 00:55 and she was past the junction at 00:44. Relieved, Selma remembers Friday afternoon.',
      'İzinsiz kullanılmış bir fırın; yangın değil. Program 00:55’te sorunsuz bitti, Selma da 00:44’te kavşağı geçmişti. Rahatlayan Selma’nın aklına cuma öğleden sonrası geliyor.',
    ),
  },
  {
    id: 'd-bram', kind: 'fill',
    title: L('The son’s crate', 'Oğlun kasası'),
    prompt: L(
      '{who} drove in at {time} for a crate of his mother’s rejects — {crate} — and spent the hours of the fire across town: {where}',
      'Annesinin ıskartalarından bir kasa almak için arabayla giren: {who}; saat {time}. Kanıtı: {crate} Yangın saatlerinde şehrin öbür ucundaydı: {where}',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['bram'] },
      { id: 'time', type: 'time', label: L('came in at', 'giriş saati'), accept: ['23:18', '23:16'] },
      { id: 'crate', type: 'fact', label: L('the crate', 'kasa'), accept: ['f-crate-gap', 'f-bram-seconds', 'f-selma-saw-bram', 'f-crate-23'] },
      { id: 'where', type: 'fact', label: L('where he was', 'nerede olduğu'), accept: ['f-kranz'] },
    ],
    requires: { facts: ['f-crate-gap'] },
    notYet: L(
      'Not yet. A missing crate says somebody took it — not where they were when the fire started.',
      'Henüz değil. Eksik bir kasa birinin onu aldığını söyler — yangın başladığında nerede olduğunu değil.',
    ),
    effects: [{ type: 'unlock', target: 'topic:bram:t-dahl' }],
    confirmText: L(
      'Shabby, not arson: a son selling his mother’s rejects for cash, at Kranz’s table until two. Cleared, Bram has something to say about the landlord.',
      'Kundaklama değil, düpedüz ayıp: annesinin ıskartalarını nakde çeviren bir oğul, saat ikiye kadar Kranz’ın masasında. Aklanan Bram’ın ev sahibi hakkında söyleyecekleri var.',
    ),
  },
  {
    id: 'd-gate', kind: 'fill',
    title: L('Who had the code', 'Şifre kimdeydi'),
    prompt: L(
      'At {time} somebody opened the gate with the Unit 4 code. Agnes, Bram and Selma are not the only ones who know it: {who} sets every tenant’s code — {proof}',
      'Saat {time} sularında biri kapıyı 4 numaranın şifresiyle açtı. O şifreyi bilenler yalnızca Agnes, Bram ve Selma değil. Bütün kiracıların şifresini belirleyen kişi: {who}. Kanıtı: {proof}',
    ),
    blanks: [
      { id: 'time', type: 'time', label: L('when', 'saat'), accept: ['01:36'] },
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['oskar'] },
      { id: 'proof', type: 'fact', label: L('proof', 'kanıt'), accept: ['f-codes-reset', 'f-codes-list', 'f-oskar-codes'] },
    ],
    requires: { facts: ['f-gate-0136'] },
    effects: [{ type: 'unlock', target: 'analysis:a-prints' }],
    confirmText: L(
      'The code was never a Vos family secret. The landlord has every one of them — and the print bureau now has a name to compare the alarm cover with.',
      'O şifre hiçbir zaman Vos ailesinin sırrı değildi. Ev sahibinde hepsi var — parmak izi bürosunun da artık alarm kapağıyla karşılaştıracağı bir ismi.',
    ),
  },
  {
    id: 'd-timeline', kind: 'timeline',
    title: L('The night at Fennick Yard', 'Fennick Avlusu’nda o gece'),
    prompt: L('Put the night in order. One card did not happen: set it aside.', 'Geceyi sıraya koy. Kartlardan biri hiç yaşanmadı: onu ayır.'),
    cards: [
      { id: 'k1', text: L('Selma lets herself in to fire her pots', 'Selma parçalarını pişirmek için içeri giriyor') },
      { id: 'k2', text: L('A van drives out of the yard', 'Bir minibüs avludan çıkıyor') },
      { id: 'k3', text: L('Selma leaves on foot', 'Selma yürüyerek çıkıyor') },
      { id: 'k4', text: L('The yard camera stops recording', 'Avlu kamerasının kaydı duruyor') },
      { id: 'k5', text: L('Dahl takes his coat from the club cloakroom', 'Dahl kulübün vestiyerinden paltosunu alıyor') },
      { id: 'k6', text: L('The gate opens on the Unit 4 code once more', 'Kapı bir kez daha 4 numaranın şifresiyle açılıyor') },
      { id: 'k7', text: L('A taxi drops Dahl at his front door', 'Bir taksi Dahl’ı evinin kapısına bırakıyor') },
    ],
    order: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'],
    outlier: 'k7',
    requires: {
      facts: ['f-gate-2115', 'f-gate-2351', 'f-gate-0040', 'f-dvr-paused', 'f-coat-0108', 'f-gate-0136', 'f-no-taxi'],
      statements: ['s-oskar-taxi', 's-selma-back'],
    },
    effects: [
      { type: 'unlock', target: 'zone:z-ho-desk' },
      { type: 'unlock', target: 'zone:z-ho-files' },
      { type: 'unlock', target: 'location:loc-house' },
    ],
    confirmText: L(
      'Bram and Selma were gone before the camera went blind. Twenty-eight minutes after Dahl took his coat, the gate opened on the Unit 4 code — and no taxi ever came for him. The duty judge signs warrants for his desk and his house.',
      'Bram da Selma da kamera kör olmadan gitmişti. Dahl paltosunu aldıktan yirmi sekiz dakika sonra kapı 4 numaranın şifresiyle açıldı — ve onu almaya hiçbir taksi gelmedi. Nöbetçi hâkim masası ve evi için arama izni veriyor.',
    ),
  },
  {
    id: 'd-motive', kind: 'fill',
    title: L('The motive', 'Saik'),
    prompt: L(
      '{who} needed Unit 4 empty by New Year — {deal} — and Agnes’s lease had one way out: {clause} He had already tried to buy her out: {offer}',
      'Yılbaşına kadar 4 numaranın boşalmasına ihtiyacı olan: {who}. Sebebi: {deal} Agnes’in sözleşmesinin tek bir çıkış yolu vardı: {clause} Onu daha önce parayla çıkarmayı da denemişti: {offer}',
    ),
    blanks: [
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['oskar'] },
      { id: 'deal', type: 'fact', label: L('the deal', 'anlaşma'), accept: ['f-norrhavn'] },
      { id: 'clause', type: 'fact', label: L('the way out', 'çıkış yolu'), accept: ['f-clause14', 'f-margin'] },
      { id: 'offer', type: 'fact', label: L('the offer', 'teklif'), accept: ['f-oskar-offer', 'f-bram-fee'] },
    ],
    requires: { evidence: ['ev-contract'] },
    effects: [{ type: 'unlock', target: 'analysis:a-nyberg' }],
    notYet: L(
      'Not yet. A sale needs an empty building; you still need the clause that could empty it, or the money he already offered.',
      'Henüz değil. Satış boş bir bina istiyor; binayı boşaltabilecek maddeyi ya da daha önce teklif ettiği parayı hâlâ bulman lazım.',
    ),
    confirmText: L(
      'Four million on the table if Unit 4 stood empty at New Year, and a lease that only fire could end. He tried money first. Then he tried fire. The prosecutor asks Norrhavn for its file on the deal.',
      'Yılbaşında 4 numara boşsa masada dört milyon vardı; sözleşmeyi ise yalnızca bir yangın bitirebilirdi. Önce parayı denedi. Sonra ateşi. Savcı, Norrhavn’dan anlaşmayla ilgili dosyayı istiyor.',
    ),
  },

  // ── side questions: optional, each makes a confrontation round easier (its chips come forward)
  {
    id: 'd-alarm', kind: 'fill',
    title: L('The silent alarm', 'Susan alarm'),
    prompt: L(
      'The alarm could not sound — {empty} — because its battery was in a shed only one man can open: {battery} The last hands on it were {who}’s, on Friday afternoon: {when}',
      'Alarm ötemezdi — {empty} — çünkü pili yalnızca bir adamın açabildiği bir kulübedeydi: {battery} Ona son dokunan kişi cuma öğleden sonra şuydu: {who}. Kanıtı: {when}',
    ),
    blanks: [
      { id: 'empty', type: 'fact', label: L('the alarm', 'alarm'), accept: ['f-no-battery', 'f-alarm-silent'] },
      { id: 'battery', type: 'fact', label: L('the battery', 'pil'), accept: ['f-battery-found'] },
      { id: 'who', type: 'person', label: L('who', 'kim'), accept: ['oskar'] },
      { id: 'when', type: 'fact', label: L('Friday', 'cuma'), accept: ['f-inspection', 'f-selma-ladder', 'f-oskar-battery', 'f-prints-oskar'] },
    ],
    requires: { facts: ['f-battery-found'] },
    confirmText: L(
      'Silenced the afternoon before, during a “safety inspection”. The fire was planned on Friday.',
      'Bir gün önce, bir “güvenlik denetimi” sırasında susturulmuş. Yangın cuma günü planlanmış.',
    ),
  },
  {
    id: 'd-walk', kind: 'fill',
    title: L('The walk from the club', 'Kulüpten yürüyüş'),
    prompt: L(
      'Dahl left the club {how} at {time} — {proof} — and at {seen} a man in a long coat passed the Ostkai camera into Fennick Lane.',
      'Dahl kulüpten şöyle çıktı: {how}; saat {time}. Kanıtı: {proof} Saat {seen} olduğunda da uzun paltolu bir adam Ostkai kamerasının önünden Fennick Sokağı’na girdi.',
    ),
    blanks: [
      {
        id: 'how', type: 'choice', label: L('how', 'nasıl'),
        options: [
          { id: 'o-foot', text: L('on foot', 'yürüyerek') },
          { id: 'o-taxi', text: L('by taxi', 'taksiyle') },
          { id: 'o-car', text: L('in his own car', 'kendi arabasıyla') },
        ],
        accept: ['o-foot'],
      },
      { id: 'time', type: 'time', label: L('left at', 'çıkış saati'), accept: ['01:10'] },
      { id: 'proof', type: 'fact', label: L('proof', 'kanıt'), accept: ['f-teo-foot'] },
      { id: 'seen', type: 'time', label: L('on camera', 'kamerada'), accept: ['01:31'] },
    ],
    requires: { facts: ['f-teo-foot'] },
    confirmText: L(
      'He waved away the car and walked. Twenty-one minutes from the club door to the junction; five more to the gate.',
      'Arabayı geri çevirip yürüdü. Kulübün kapısından kavşağa yirmi bir dakika; kapıya beş dakika daha.',
    ),
  },
  {
    id: 'd-recorder', kind: 'fill',
    title: L('The blind camera', 'Kör kamera'),
    prompt: L(
      'The yard camera did not fail: {log} It was paused from {who}’s own phone, while he was still at the club: {club}',
      'Avlu kamerası arızalanmadı: {log} Durduran telefonun sahibi: {who}. Üstelik o sırada hâlâ kulüpteydi: {club}',
    ),
    blanks: [
      { id: 'log', type: 'fact', label: L('the log', 'kayıt'), accept: ['f-dvr-paused'] },
      { id: 'who', type: 'person', label: L('whose phone', 'kimin telefonu'), accept: ['oskar'] },
      { id: 'club', type: 'fact', label: L('still at the club', 'hâlâ kulüpte'), accept: ['f-coat-0108', 'f-tab-0102', 'f-teo-foot', 'f-club-wifi'] },
    ],
    requires: { facts: ['f-dvr-paused'] },
    confirmText: L(
      'Paused at one o’clock from the landlord’s phone — eight minutes before he took his coat. Nobody blinds a camera by accident.',
      'Saat birde ev sahibinin telefonundan durdurulmuş — paltosunu almadan sekiz dakika önce. Kimse bir kamerayı kazara kör etmez.',
    ),
  },
  {
    id: 'd-shoes', kind: 'fill',
    title: L('The shoes', 'Ayakkabılar'),
    prompt: L(
      'The prints in the slip by the back door — {print} — were left by a leather sole with a ring of heel nails. The same heel was burning in {who}’s garden: {ash}',
      'Arka kapının dibindeki çamurdaki izleri — {print} — topuğunda halka hâlinde çiviler olan deri bir taban bırakmış. Aynı topuk şu kişinin bahçesinde yanıyordu: {who}. Kanıtı: {ash}',
    ),
    blanks: [
      { id: 'print', type: 'fact', label: L('the prints', 'izler'), accept: ['f-shoeprint'] },
      { id: 'who', type: 'person', label: L('whose garden', 'kimin bahçesi'), accept: ['oskar'] },
      { id: 'ash', type: 'fact', label: L('the ash', 'kül'), accept: ['f-ash-sole', 'f-shoe-gap'] },
    ],
    requires: { facts: ['f-ash-sole'] },
    confirmText: L(
      'He burned the shoes and kept the coat. The pale clay on the heel is Unit 4’s slip.',
      'Ayakkabıları yaktı, paltoyu sakladı. Topuktaki açık renk çamur, 4 numaranın çamuru.',
    ),
  },
];

// SERVER-ONLY. Kessler Workshop — interview duel: every tier answer split into claim cards.
// press → a detail (sometimes a fact) or the suspect moves on; breaks → the authored contradictions.
// Breakable claims carry a small "tell" in their press line, so an attentive player knows where to push.
// The four "Thomas" relationship topics stay one card each (pure character, nothing to break).
import type { V2Overlay } from '../overlay.ts';
import { L } from '../text.ts';

export const suspectsV2: NonNullable<V2Overlay['suspects']> = {
  // ─────────────────────────── CLARA
  clara: {
    v2: { patience: 4 },
    topics: {
      't-evening': {
        claims: {
          0: [{
            id: 'c-clara-home', text: L('I was at home in Vesterlund all evening.', 'Bütün akşam Vesterlund’daki evimdeydim.'),
            press: { line: L('Groceries at the shop on Strandvej, then home. In bed before eleven. (She answers before you finish the question.)', 'Strandvej’deki marketten alışveriş, sonra ev. On birden önce yataktaydım. (Siz sorunuzu bitirmeden cevaplar.)') },
            breaks: [{ by: ['f-clara-2304', 'f-volvo-in', 'ev-accesslog', 'ev-cctv'] }],
          }],
          1: [
            {
              id: 'c-clara-left', text: L('I left at a quarter past eleven. He was alive.', 'On biri çeyrek geçe çıktım. Yaşıyordu.'),
              press: { line: L('He was shouting about money. I didn’t look at the clock — I looked at the door. (Her eyes go to the door now.)', 'Para yüzünden bağırıyordu. Saate bakmadım — kapıya baktım. (Gözleri şimdi de kapıya kayar.)') },
              breaks: [
                // the neighbour’s lamp list (wave 4) breaks it too, before the door log or the cameras are back
                { by: ['f-exit-2338', 'f-volvo-out', 'f-light-2339'] },
                {
                  by: ['f-tod', 'f-thump-2320'], requires: { deductions: ['d-timeline'] },
                  resist: L('Your own pathologist gives him until a quarter to twelve. I was gone by a quarter past.', 'Kendi adli tabibiniz ona on ikiye çeyrek kalaya kadar süre veriyor. Ben çeyrek geçe gitmiştim.'),
                },
              ],
            },
            { id: 'c-clara-money', text: L('He called me upset about the business and money.', 'Beni işler ve para yüzünden sinirli sinirli aradı.') },
          ],
          2: [{
            id: 'c-clara-noclock', text: L('I don’t remember when I left.', 'Ne zaman çıktığımı hatırlamıyorum.'), anchor: L('I don’t remember. I don’t remember.', 'Hatırlamıyorum. Hatırlamıyorum.'),
            press: { line: L('I sat in the car. Or I didn’t. (Her hand goes to her left ear, then away.)', 'Arabada oturdum. Ya da oturmadım. (Eli sol kulağına gider, sonra çekilir.)') },
          }],
        },
      },
      't-call': {
        // the phone itself is held from the start: only its extraction (call log, the text) opens this topic
        v2: { chips: ['ev-calllog', 'f-call-clara', 'f-sms'] },
        claims: {
          0: [{
            id: 'c-clara-dinner', text: L('He rang about Saturday’s family dinner.', 'Cumartesi günkü aile yemeği için aradı.'),
            press: { line: L('My aunt’s seventieth. He wanted the corner table at Vinkel. Two minutes, if that. (She knows the length to the second.)', 'Halamın yetmişinci yaşı. Vinkel’de köşedeki masayı istiyordu. İki dakika ya sürdü ya sürmedi. (Süreyi saniyesine kadar biliyor gibi.)') },
            breaks: [{ by: ['f-sms', 'ev-calllog'] }],
          }],
          1: [{
            id: 'c-clara-instrument', text: L('He thought something was wrong with an instrument. It could wait till morning.', 'Çalgılardan birinde sorun olduğunu düşünüyordu. Sabaha kadar bekleyebilirdi.'),
            press: { line: L('He gets — he got — obsessive about varnish. It was nothing.', 'Verniğe takar — takardı. Önemli bir şey değildi.') },
            breaks: [{ by: ['f-jonas-told', 'f-note-jf', 'f-copy-jf', 'f-workbook-ck', 'f-jonas-ck', 'ev-workbook', 'ev-copyreport'] }],
          }],
          2: [{ id: 'c-clara-went', text: L('Jonas told him I commissioned the copy. He threatened the police, so I went.', 'Kopyayı benim ısmarladığımı Jonas ona söylemiş. Polisi aramakla tehdit etti, ben de gittim.'), facts: ['f-clara-threat'] }],
        },
      },
      't-guadagnini': {
        claims: {
          0: [{
            id: 'c-clara-safe', text: L('The Guadagnini is in the vault, insured, on consignment.', 'Guadagnini kasada, sigortalı, konsinyede.'),
            press: { line: L('Fourteen months on consignment. My father handled the sale; I handled the insurance. (A correction nobody asked for.)', 'On dört aydır konsinyede. Satışla babam ilgilenirdi, sigortayla ben. (Kimsenin sormadığı bir düzeltme.)') },
            breaks: [
              { by: ['f-is-copy', 'f-copy-jf', 'f-note-jf', 'f-varnish-even', 'ev-copyreport'] },
              // wave 4 shortcut: the Geneva catalogue skips "ask Jonas" — she goes straight to the sale
              { by: ['f-halberd-listed'], toTier: 2 },
            ],
          }],
          1: [{
            id: 'c-clara-nocopy', text: L('If there is a copy, ask Jonas. He has had a key for nineteen years.', 'Kopya varsa Jonas’a sorun. On dokuz yıldır anahtarı var.'),
            press: { line: L('Jonas copies everything he admires. Ask him who he admires. (She has not asked where the original is.)', 'Jonas beğendiği her şeyin kopyasını yapar. Kimi beğendiğini ona sorun. (Asıl kemanın nerede olduğunu bir kez bile sormadı.)') },
            breaks: [
              { by: ['f-halberd-paid', 'f-halberd-bought', 'ev-geneva', 'f-halberd-listed', 'f-geneva-trip'] },
              {
                by: ['f-workbook-ck', 'f-jonas-ck', 'ev-workbook'], requires: { evidence: ['ev-geneva'] },
                resist: L('A line in Jonas’s notebook. Jonas can write whatever he likes.', 'Jonas’ın defterinde bir satır. Jonas istediğini yazar.'),
              },
            ],
          }],
          2: [{ id: 'c-clara-sold', text: L('I sold it to Halberd to save the business. I meant to buy it back.', 'Şirketi kurtarmak için Halberd’e sattım. Geri alacaktım.'), facts: ['f-clara-sold'], anchor: L('Halberd paid one point one million, it cleared the bank, and nobody had to know.', 'Halberd bir virgül bir milyon ödedi, para bankadan geçti, kimsenin bilmesine gerek kalmadı.') }],
        },
      },
      't-business': {
        v2: { chips: ['ev-accounts', 'f-loan'] },
        claims: {
          0: [{
            id: 'c-clara-managing', text: L('The business had better years, but we were managing. And yes, I inherit.', 'Şirket daha iyi yıllar gördü ama idare ediyorduk. Ve evet, mirasçı benim.'),
            press: { line: L('Every workshop in Hallstedt had two bad years. (She says “every workshop”, not “we”.)', 'Hallstedt’teki bütün atölyeler iki kötü yıl geçirdi. (“Biz” demiyor, “bütün atölyeler” diyor.)') },
            breaks: [{ by: ['f-loan', 'f-loan-repaid', 'ev-accounts', 'f-bank-papers'] }],
          }],
          1: [{
            id: 'c-clara-loan', text: L('There was a €900,000 loan. My father signed what I put in front of him.', '900.000 €’luk bir kredi vardı. Babam önüne ne koyduysam imzaladı.'), facts: ['f-clara-loan'],
            press: { line: L('Repaid in September. Ahead of schedule. You can check. (She does not say with what.)', 'Eylül’de kapandı. Vadesinden önce. Kontrol edebilirsiniz. (Neyle kapandığını söylemiyor.)') },
          }],
        },
      },
      't-death': {
        claims: {
          0: [{
            id: 'c-clara-ladder', text: L('He fell from the ladder. He never held the rail.', 'Merdivenden düştü. Tırabzanı hiç tutmazdı.'),
            press: { line: L('Ten times a day, up and down. I told him a hundred times. (She says “fell” like a word she has practised.)', 'Günde on kere inip çıkardı. Yüz kere söyledim. (“Düştü” kelimesini prova etmiş gibi söyler.)') },
            breaks: [{ by: ['f-no-fall', 'f-rungs-clean', 'ev-autopsy'] }],
          }],
          1: [{
            id: 'c-clara-tools', text: L('I know nothing about mallets. I do the accounts.', 'Tokmaklardan anlamam. Ben hesaplara bakarım.'),
            press: { line: L('There are six of them. I couldn’t tell you which is which. (Six. Nobody told her how many.)', 'Altı tane var. Hangisi hangisi bilemem. (Altı. Kaç tane olduğunu ona kimse söylemedi.)'), facts: ['f-clara-six'] },
          }],
        },
      },
      't-earring': {
        // only once she is placed at the scene: an "earring back" topic on Clara alone would name the owner
        v2: { chips: ['ev-earring'], requires: { deductions: ['d-entry'] } },
        claims: {
          0: [{
            id: 'c-clara-earrings', text: L('I lose earring backs all the time. I’ve worked in that room for nine years.', 'Küpe arkalığını sürekli kaybederim. Dokuz yıldır o odada çalışıyorum.'),
            press: { line: L('Pearls, gold backs. Half the women in Hallstedt wear them. (She keeps her hands in her lap.)', 'İnci, altın arkalık. Hallstedt’teki kadınların yarısı takar. (Ellerini kucağından kaldırmıyor.)') },
            breaks: [{ by: ['f-pearl-back'] }],
          }],
          1: [{
            id: 'c-clara-mine', text: L('It’s mine. It came off while we were shouting.', 'Benim. Bağırışırken düşmüş.'), facts: ['f-clara-earring'],
            anchor: L('It must have come off while we were shouting at each other.', 'Birbirimize bağırırken düşmüş olmalı.'),
          }],
        },
      },
      't-others': {
        claims: {
          0: [
            { id: 'c-clara-miriam', text: L('Miriam Achterberg was threatening to pull her consignment.', 'Miriam Achterberg emanetini çekmekle tehdit ediyordu.'), press: { line: L('She shouted at my father on the phone last week. I heard it through two doors.', 'Geçen hafta telefonda babama bağırdı. İki kapının ardından duydum.') } },
            { id: 'c-clara-leo', text: L('Leo has been stealing — a bow went missing this week.', 'Leo hırsızlık yapıyordu — bu hafta bir yay kayboldu.'), press: { line: L('I told my father on Monday. He said he would deal with it himself.', 'Pazartesi babama söyledim. Kendim hallederim dedi.') } },
          ],
        },
      },
      't-confession': {
        claims: {
          0: [{ id: 'c-clara-deny', text: L('No. I loved my father.', 'Hayır. Babamı severdim.') }],
          1: [{ id: 'c-clara-struck', text: L('He turned his back. He was reaching for the phone.', 'Bana sırtını döndü. Telefona uzanıyordu.') }],
        },
      },
    },
  },

  // ─────────────────────────── JONAS
  jonas: {
    v2: { patience: 4 },
    topics: {
      't-discovery': {
        claims: {
          0: [{
            id: 'c-jonas-found', text: L('I came in the back just before eight. The lights were on. He was by the bench.', 'Sekize doğru arkadan girdim. Işıklar yanıyordu. Tezgâhın yanındaydı.'),
            press: { line: L('Thomas never left the lights on. Never. That is how I knew, before I saw him.', 'Thomas ışıkları asla açık bırakmazdı. Asla. Onu görmeden anladım, o yüzden.') },
          }],
        },
      },
      't-call': {
        // the 22:43 call is unknown until the phone is read
        v2: { chips: ['ev-calllog', 'f-call-jonas'] },
        claims: {
          0: [{
            id: 'c-jonas-missed', text: L('The 22:43 call was missed. I was in the pub.', '22:43’teki arama cevapsız kaldı. Birahanedeydim.'),
            press: { line: L('It was loud. I didn’t hear it. (He turns a glass that isn’t there.)', 'Gürültülüydü. Duymadım. (Elinde olmayan bir bardağı çevirir.)') },
            breaks: [{ by: ['f-call-jonas', 'f-ruben-call', 'ev-calllog'] }],
          }],
          1: [{
            id: 'c-jonas-told', text: L('Thomas asked about the copy. I told him it was for Clara.', 'Thomas kopyayı sordu. Clara için olduğunu söyledim.'), facts: ['f-jonas-told'],
            press: { line: L('“Thank you, Jonas.” That was all. Then the line went quiet.', '“Sağ ol Jonas.” O kadar. Sonra hat sustu.') },
          }],
        },
      },
      't-copy': {
        // the label names the copy: it stays hidden until the player has found out about it
        v2: { chips: ['ev-copyreport', 'f-copy-jf', 'f-is-copy', 'ev-workbook'] },
        claims: {
          0: [{
            id: 'c-jonas-studies', text: L('I make study copies. A copy isn’t a crime.', 'Çalışma kopyaları yaparım. Kopya suç değil.'),
            press: { line: L('You learn the wood by copying it. Every maker does. (He does not say which instrument.)', 'Ahşabı kopyalayarak öğrenirsin. Her usta yapar. (Hangi çalgı olduğunu söylemiyor.)') },
            breaks: [{ by: ['f-copy-jf', 'f-note-jf', 'f-call-jonas', 'f-leo-copy', 'ev-copyreport', 'ev-calllog'] }],
          }],
          1: [{
            id: 'c-jonas-forclara', text: L('Clara commissioned the copy: €8,000 cash, delivered 12 July.', 'Kopyayı Clara ısmarladı: 8.000 € nakit, 12 Temmuz’da teslim.'), facts: ['f-jonas-ck'],
            press: { line: L('For an insurance exhibition, she said. I never heard of any exhibition afterwards. I didn’t look for one.', 'Bir sigorta sergisi için dedi. Sonradan öyle bir sergi duymadım. Aramadım da.'), facts: ['f-no-exhibition'] },
          }],
        },
      },
      't-evening': {
        claims: {
          0: [{
            id: 'c-jonas-anchor', text: L('I was at The Anchor from half ten until closing. Ask Ruben.', 'On buçuktan kapanışa kadar The Anchor’daydım. Ruben’e sorun.'),
            press: { line: L('I paid by card. Twice, I think. Ruben puts the chairs up at half twelve.', 'Kartla ödedim. İki kere galiba. Ruben yarımda sandalyeleri kaldırır.') },
          }],
        },
      },
      't-clara': {
        v2: { locked: true },
        claims: {
          0: [{
            id: 'c-jonas-capable', text: L('Clara is capable — more than Thomas gave her credit for.', 'Clara becerikli — Thomas’ın sandığından da becerikli.'),
            press: { line: L('She kept the books. She kept the bank happy. Somebody had to. (He chooses “happy” carefully.)', 'Defterleri o tutardı. Bankayı o idare ederdi. Birinin etmesi gerekiyordu. (“İdare” kelimesini özenle seçer.)') },
            breaks: [{ by: ['f-halberd-paid', 'f-volvo-in', 'f-clara-2304', 'f-diary-bank', 'ev-geneva', 'ev-cctv', 'ev-accesslog'] }],
          }],
          1: [{ id: 'c-jonas-pressure', text: L('She was under pressure she hid from Thomas. The bank rang her, not him.', 'Thomas’tan sakladığı bir baskı altındaydı. Banka Thomas’ı değil, onu arardı.'), facts: ['f-bank-calls'] }],
        },
      },
      't-others': {
        claims: {
          0: [
            { id: 'c-jonas-miriam', text: L('Mrs Achterberg wanted her violin back for another buyer.', 'Bayan Achterberg kemanını başka bir alıcı için geri istiyordu.'), press: { line: L('She rang every week. Thomas held the phone away from his ear.', 'Her hafta arardı. Thomas telefonu kulağından uzak tutardı.') } },
            { id: 'c-jonas-leo', text: L('Things went missing — the Sartory bow last. I told Thomas I thought it was Leo.', 'Bir şeyler kayboluyordu — en son Sartory yay. Thomas’a Leo olduğunu düşündüğümü söyledim.') },
          ],
        },
      },
      't-tools': {
        v2: { chips: ['ev-mallet'], locked: true },
        claims: {
          0: [{
            id: 'c-jonas-mallet', text: L('The lignum vitae mallet is the heaviest. Only Thomas used it.', 'Gayak ağacı tokmak en ağırıdır. Onu sadece Thomas kullanırdı.'),
            press: { line: L('Over a kilo. A face like a coin, four centimetres. Nobody else liked the weight.', 'Bir kilodan ağır. Yüzü madeni para gibi, dört santim. Ağırlığını kimse sevmezdi.') },
            breaks: [{ by: ['f-mallet-wiped', 'f-peg-wiped', 'f-rag-damp', 'f-rag-blood', 'ev-serology', 'ev-rag'] }],
          }],
          1: [{ id: 'c-jonas-naphtha', text: L('Anyone who works here knows where the naphtha is.', 'Burada çalışan herkes neftin yerini bilir.') }],
        },
      },
      't-confession': {
        claims: { 0: [{ id: 'c-jonas-deny', text: L('No. I was across the river. Check my card.', 'Hayır. Nehrin karşısındaydım. Kartıma bakın.') }] },
      },
    },
  },

  // ─────────────────────────── MIRIAM
  miriam: {
    v2: { patience: 3 },
    topics: {
      't-evening': {
        claims: {
          0: [{
            id: 'c-miriam-home', text: L('I was at home all evening. We spoke by phone at half past seven.', 'Bütün akşam evdeydim. Yedi buçukta telefonda konuştuk.'),
            press: { line: L('One minute, perhaps. About Thursday. (She does not say which Thursday.)', 'Bir dakika belki. Perşembe hakkında. (Hangi perşembe olduğunu söylemiyor.)') },
            breaks: [
              { by: ['f-jaguar-in', 'f-diary-miriam', 'ev-cctv', 'ev-diary'] },
              // the right idea without the proof: she holds, but it costs no patience
              { by: ['f-shout-2200'], requires: { facts: ['f-jaguar-in'] }, resist: L('A woman shouted. Hallstedt is full of women, Detective. Put me in that street first.', 'Bir kadın bağırmış. Hallstedt kadın dolu, Komiser. Önce beni o sokağa koyun.') },
            ],
          }],
          1: [{
            id: 'c-miriam-visit', text: L('I visited from a quarter to ten to a quarter past. He was alive.', 'Ona çeyrek kala geldim, onu çeyrek geçe çıktım. Yaşıyordu.'), facts: ['f-miriam-visit'],
            press: { line: L('He brought my violin out of the vault to prove it was safe, and held it like a hostage.', 'Güvende olduğunu kanıtlamak için kemanımı kasadan çıkardı; rehine gibi elinde tuttu.') },
          }],
        },
      },
      't-violin': {
        claims: {
          0: [{
            id: 'c-miriam-impatient', text: L('He failed to sell my violin in fourteen months.', 'On dört ayda kemanımı satamadı.'),
            press: { line: L('Do you know what two million euros earns in fourteen months, Detective? (She has already done the sum.)', 'İki milyon avro on dört ayda ne kazandırır, biliyor musunuz Komiser? (Hesabı çoktan yapmış.)') },
            breaks: [{ by: ['f-notice', 'f-diary-miriam', 'f-jaguar-in', 'ev-consignment', 'ev-diary', 'ev-cctv'] }],
          }],
          1: [{
            id: 'c-miriam-vienna', text: L('I have a buyer in Vienna at 2.6 million. Thomas would not release it before April.', 'Viyana’da 2,6 milyona alıcım var. Thomas Nisan’dan önce vermeyecekti.'), facts: ['f-miriam-buyer'],
            press: { line: L('I gave notice on the fourth of March. Thirty days, he said. As if I were his tenant.', 'Dört Mart’ta bildirimimi verdim. Otuz gün dedi. Sanki kiracısıymışım gibi.'), facts: ['f-miriam-notice'] },
            breaks: [{ by: ['f-is-copy', 'f-copy-jf', 'f-halberd-bought', 'ev-copyreport', 'ev-geneva', 'f-halberd-listed'] }],
          }],
          2: [{ id: 'c-miriam-where', text: L('Then where is my violin?', 'O hâlde kemanım nerede?'), facts: ['f-miriam-shock'] }],
        },
      },
      't-late-call': {
        v2: { locked: true },
        claims: {
          0: [{
            id: 'c-miriam-vague', text: L('I may have telephoned. I telephone many people.', 'Aramış olabilirim. Ben çok kişiyi ararım.'),
            press: { line: L('Late, perhaps. I do not keep a diary of my own calls, Detective.', 'Geç bir saatte, belki. Kendi aramalarımın defterini tutmam, Komiser.') },
            breaks: [{ by: ['f-miriam-2324', 'ev-calllog'] }],
          }],
          1: [{ id: 'c-miriam-apology', text: L('I rang at about twenty past eleven to apologise. No answer.', 'On biri yirmi geçe gibi özür dilemek için aradım. Açmadı.') }],
        },
      },
      't-argument': {
        claims: {
          0: [{
            id: 'c-miriam-noidea', text: L('I have no idea what the neighbours heard.', 'Komşuların ne duyduğundan haberim yok.'),
            press: { line: L('Very well. Yes. It was me.', 'Pekâlâ. Evet. Bendim.'), toTier: 1, requires: { statements: ['s-miriam-visit'] } },
          }],
          1: [{ id: 'c-miriam-raised', text: L('I raised my voice. He raised his. Then I left.', 'Sesimi yükselttim. O da yükseltti. Sonra çıktım.') }],
        },
      },
      't-saw': {
        claims: {
          0: [{
            id: 'c-miriam-nobody', text: L('I saw no one.', 'Kimseyi görmedim.'),
            press: { line: L('Now that you mention it…', 'Madem açtınız…'), toTier: 1, requires: { statements: ['s-miriam-visit'] } },
          }],
          1: [{ id: 'c-miriam-sawleo', text: L('A young man with a bicycle helmet came in the back during the argument.', 'Tartışma sırasında arkadan bisiklet kasklı genç bir adam girdi.'), facts: ['f-miriam-saw-leo'] }],
        },
      },
      't-clause': {
        // wave 4 — the second false trail: costs a precious morning with her, pays in the road to Geneva
        claims: {
          0: [{
            id: 'c-miriam-clause', text: L('Clause nine is standard. I never gave it a thought.', 'Dokuzuncu madde standarttır. Hiç aklıma gelmedi.'),
            anchor: L('My lawyers put it in. I never read the thing twice.', 'Onu avukatlarım koydu. Ben o metni ikinci kez okumadım bile.'),
            press: { line: L('Contracts are for lawyers, Detective. I read catalogues. (Her eyes go to the date on the letter.)', 'Sözleşmeler avukatlar içindir, Komiser. Ben katalog okurum. (Gözü mektubun tarihine kayar.)') },
            breaks: [{
              by: ['f-brandl'], requires: { facts: ['f-notice'] },
              resist: L('My buyer has a deadline. Every buyer has a deadline, Detective. Show me why mine should interest you.', 'Alıcımın bir son tarihi var. Her alıcının vardır, Komiser. Benimkinin sizi neden ilgilendirdiğini gösterin.'),
            }],
          }],
          1: [{
            id: 'c-miriam-arithmetic', text: L('With him gone I’d have had my violin back in a week. That is arithmetic, not murder.', 'O olmasa kemanım bir haftada elime geçerdi. Bu aritmetik, cinayet değil.'),
            anchor: L('That is arithmetic, Detective, not murder.', 'Bu aritmetik, Komiser, cinayet değil.'),
            press: { line: L('Brandl wanted a fresh certificate before he would pay. Dealers. They smell money and ask for paperwork.', 'Brandl ödemeden önce yeni bir sertifika istedi. Satıcılar işte. Paranın kokusunu alınca evrak isterler.') },
          }],
        },
      },
      't-clara': {
        v2: { locked: true },
        claims: {
          0: [{
            id: 'c-miriam-bookkeeper', text: L('Clara is a competent bookkeeper.', 'Clara becerikli bir muhasebeci.'),
            press: { line: L('Her father’s temper and none of his ear. She was charming to me at Christmas.', 'Babasının huyunu almış, kulağını almamış. Noel’de bana karşı pek nazikti.') },
            breaks: [{ by: ['f-halberd-paid', 'f-clara-sold', 'ev-geneva'] }],
          }],
          1: [{ id: 'c-miriam-ruin', text: L('She sold my violin. I will ruin her in court.', 'Kemanımı satmış. Onu mahkemede mahvedeceğim.') }],
        },
      },
      't-confession': {
        claims: { 0: [{ id: 'c-miriam-deny', text: L('Dead, he was no use to me. Alive, he owed me a violin.', 'Ölüsü işime yaramaz. Dirisi bana bir keman borçluydu.') }] },
      },
    },
  },

  // ─────────────────────────── LEO
  leo: {
    v2: { patience: 5 },
    topics: {
      't-evening': {
        claims: {
          0: [{
            id: 'c-leo-home', text: L('I went home at 18:25 and stayed there.', '18:25’te eve gittim, orada kaldım.'),
            press: { line: L('Like, home home. Gaming. My flatmate can — no, he was out. Anyway. (Far too many words.)', 'Yani ev ev. Oyun oynadım. Ev arkadaşım da — yok, o dışarıdaydı. Neyse. (Gereğinden çok kelime.)') },
            breaks: [{ by: ['f-leo-2158', 'f-cyclist-in', 'f-bike-tracks', 'f-miriam-saw-leo', 'ev-accesslog', 'ev-cctv', 'ev-tracks'] }],
          }],
          1: [
            {
              id: 'c-leo-charger', text: L('I went back around ten for my charger. Thomas was fine.', 'Saat on gibi şarj aletim için döndüm. Thomas iyiydi.'),
              press: { line: L('It was in my locker. Or the drawer. One of those. (He cannot remember where he found the thing he went back for.)', 'Dolabımdaydı. Ya da çekmecede. Biri işte. (Almaya döndüğü şeyi nerede bulduğunu hatırlamıyor.)') },
            },
            { id: 'c-leo-woman', text: L('Thomas was arguing with an older, well-spoken woman.', 'Thomas yaşlıca, kibar konuşan bir kadınla tartışıyordu.'), facts: ['f-leo-woman'] },
          ],
        },
      },
      't-bow': {
        v2: { chips: ['ev-bowcabinet', 'f-bow-missing'] },
        claims: {
          0: [{
            id: 'c-leo-nobow', text: L('No idea about the bow. Maybe Thomas sold it.', 'Yaydan haberim yok. Belki Thomas satmıştır.'),
            press: { line: L('He moved stock around, like, all the time. I don’t touch the cabinet. Much. (He looks at your notebook, not at you.)', 'Malların yerini hep değiştirirdi. Ben vitrine dokunmam. Pek. (Size değil, defterinize bakıyor.)') },
            breaks: [{ by: ['f-pawn-leo', 'ev-pawn'] }],
          }],
          1: [{ id: 'c-leo-took', text: L('I took the bow and pawned it. That is why I went back.', 'Yayı ben aldım, rehine bıraktım. O yüzden döndüm.'), facts: ['f-leo-bow'] }],
        },
      },
      't-violin': {
        claims: {
          0: [{
            id: 'c-leo-never', text: L('I never get to touch the Guadagnini.', 'Guadagnini’ye elimi sürdürmezler.'),
            press: { line: L('Well — that night, actually…', 'Yani — o gece aslında…'), toTier: 1, requires: { statements: ['s-leo-return'] } },
          }],
          1: [{ id: 'c-leo-uv', text: L('Thomas had the violin under the UV lamp, saying “That’s not right.”', 'Thomas kemanı UV lambasının altına koymuş, “Bu doğru değil” diyordu.'), facts: ['f-leo-uv'] }],
        },
      },
      't-copy': {
        v2: { locked: true },
        claims: { 0: [{ id: 'c-leo-jonascopy', text: L('Jonas made a study copy of the Guadagnini last summer.', 'Jonas geçen yaz Guadagnini’nin çalışma kopyasını yaptı.'), facts: ['f-leo-copy'], press: { line: L('Then one day it was gone. “To a client,” he said.', 'Sonra bir gün yok oldu. “Bir müşteriye gitti” dedi.') } }] },
      },
      't-clara': {
        claims: { 0: [{ id: 'c-leo-bank', text: L('Clara’s always on the phone with the bank, door closed.', 'Clara hep bankayla telefonda, kapı kapalı.'), facts: ['f-bank-calls'], press: { line: L('Thomas never noticed. He only notices wood.', 'Thomas hiç fark etmezdi. O sadece ahşabı fark eder.') } }] },
      },
      't-confession': {
        claims: { 0: [{ id: 'c-leo-deny', text: L('No! He was alive when I left.', 'Hayır! Ben çıkarken yaşıyordu.') }] },
      },
    },
  },
};

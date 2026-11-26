// SERVER-ONLY. Kessler Workshop — v2 scenes: zones on a 0..1 canvas, close-up cards, details, hidden traces.
import type { SceneDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const scenes: SceneDef[] = [
  {
    locationId: 'loc-workshop', art: 'kessler/workshop',
    zones: [
      {
        id: 'z-body', label: L('The victim', 'Maktul'), hotspotId: 'h-body', shape: { kind: 'circle', x: 0.66, y: 0.52, r: 0.06 },
        closeUp: { art: 'kessler/body', text: L('Thomas Kessler on his left side between bench and ladder. One wound above the left ear.', 'Thomas Kessler tezgâhla merdiven arasında, sol yanına dönmüş. Sol kulağın üstünde tek bir yara.') },
        facts: ['f-wound-left'],
        details: [
          { id: 'd-glasses', label: L('Reading glasses', 'Okuma gözlüğü'), text: L('Folded on the bench — not on him. He had taken them off to look at something close.', 'Tezgâhın üstünde katlı — üstünde değil. Yakından bir şeye bakmak için çıkarmış.'), x: 0.23, y: 0.11, facts: ['f-glasses'] },
          { id: 'd-hands', label: L('His hands', 'Elleri'), text: L('Clean palms, no bruised wrists. Suggestive — but a man can fall without throwing out his hands. Only the pathologist can say.', 'Avuçları temiz, bileklerinde morluk yok. Akla bir şey getiriyor — ama insan ellerini uzatmadan da düşebilir. Bunu ancak adli tabip söyler.'), x: 0.6, y: 0.8, facts: ['f-hands-clean'] },
        ],
      },
      {
        id: 'z-ladder', label: L('Library ladder', 'Kütüphane merdiveni'), hotspotId: 'h-ladder', shape: { kind: 'rect', x: 0.74, y: 0.3, w: 0.1, h: 0.12 },
        closeUp: {
          art: 'kessler/ladder',
          text: L(
            'The oak ladder on its side. Above it, the top shelves of tonewood under an even film of dust. If he climbed it, his hands and soles were on those upper rungs.',
            'Meşe merdiven yan yatmış. Üstünde, düzgün bir toz tabakasının altında tonluk ağaçların durduğu raflar. Merdivene çıktıysa, elleri de tabanları da o üst basamaklara değmiştir.',
          ),
        },
        details: [
          { id: 'd-shelfdust', label: L('Top shelves', 'En üst raflar'), text: L('The dust is unbroken. Nobody reached up there last night.', 'Toz hiç bozulmamış. Dün gece oraya kimse uzanmamış.'), x: 0.5, y: 0.15, facts: ['f-dust-unbroken'] },
          // the early, guaranteed win (PLAYTEST_V2 §7.1): one brush of powder here answers "Not a fall"
          {
            id: 'd-rungs', label: L('Upper rungs (dusted)', 'Üst basamaklar (tozlanmış)'), tool: 'dust', x: 0.66, y: 0.58, r: 0.1,
            text: L('Powder over the upper rungs: not a print, not the scuff of a sole. Nobody climbed this ladder last night.', 'Üst basamaklara toz: ne bir parmak izi var ne bir taban izi. Dün gece bu merdivene kimse çıkmamış.'),
            facts: ['f-rungs-clean'],
          },
        ],
      },
      {
        // found only by dusting the upper rungs
        id: 'z-rungs', label: L('Upper rungs (dusted)', 'Üst basamaklar (tozlanmış)'), reveal: 'dust', shape: { kind: 'rect', x: 0.85, y: 0.34, w: 0.06, h: 0.08 },
        closeUp: { art: 'kessler/rungs', text: L('Powder over the upper rungs. Not a single print, not a scuff of a sole.', 'Üst basamaklarda toz. Tek bir parmak izi yok, bir taban izi bile yok.') },
        facts: ['f-rungs-clean'], details: [],
      },
      {
        id: 'z-toolwall', label: L('Tool wall', 'Alet duvarı'), hotspotId: 'h-toolwall', shape: { kind: 'rect', x: 0.08, y: 0.07, w: 0.42, h: 0.08 },
        closeUp: { art: 'kessler/toolwall', text: L('Six mallets on pegboard, each hanging inside its painted outline.', 'Delikli panoda altı tokmak; her biri kendi boyalı silüetinin içinde asılı.') },
        details: [{ id: 'd-crooked', label: L('Lignum vitae mallet', 'Gayak ağacı tokmak'), text: L('Crooked on its peg, the head cleaner than any of the others.', 'Askısında yamuk duruyor; başı ötekilerin hepsinden temiz.'), x: 0.66, y: 0.32, facts: ['f-mallet-crooked'] }],
      },
      {
        // dusting the peg of the heaviest mallet
        id: 'z-peg', label: L('Mallet peg (dusted)', 'Tokmak askısı (tozlanmış)'), reveal: 'dust', shape: { kind: 'rect', x: 0.36, y: 0.09, w: 0.05, h: 0.05 },
        closeUp: { art: 'kessler/mallet-peg', text: L('Powder on the pegboard. Every peg holds a week of dust — except one, wiped clean in a single sweep.', 'Panoda toz. Her askıda bir haftalık toz var — biri hariç: tek hamlede silinmiş.') },
        facts: ['f-peg-wiped'], details: [],
      },
      {
        id: 'z-bench', label: L('Thomas’s bench', 'Thomas’ın tezgâhı'), hotspotId: 'h-bench', shape: { kind: 'rect', x: 0.34, y: 0.36, w: 0.2, h: 0.13 },
        closeUp: { art: 'kessler/bench', text: L('The UV lamp is still on. An inspection mirror on a stalk beside it. A tuning fork weighs down a stack of papers.', 'UV lambası hâlâ açık. Yanında saplı bir inceleme aynası. Bir diyapazon bir kâğıt destesini bastırıyor.') },
        details: [
          { id: 'd-lamp', label: L('UV lamp', 'UV lambası'), text: L('Aimed at an empty instrument cradle. Whatever lay here was taken away.', 'Boş bir çalgı beşiğine çevrili. Burada yatan şey alınıp götürülmüş.'), x: 0.2, y: 0.31, facts: ['f-lamp-on'] },
          { id: 'd-mirror', label: L('Inspection mirror', 'İnceleme aynası'), text: L('A dental-style mirror on a long stalk, for reading what is written inside a violin.', 'Uzun saplı, dişçi aynası gibi bir ayna; kemanın içinde yazanı okumak için.'), x: 0.75, y: 0.33, facts: ['f-mirror'] },
        ],
      },
      {
        // the papers are noticed once the bench has been looked at
        id: 'z-papers', label: L('Papers under the tuning fork', 'Diyapazonun altındaki kâğıtlar'), hotspotId: 'h-papers', shape: { kind: 'circle', x: 0.58, y: 0.32, r: 0.04 },
        requires: { evidence: ['ev-uvlamp'] },
        closeUp: { art: 'kessler/papers', text: L('Invoices, a varnish catalogue — and under them, a sheet torn from a notepad in pencil.', 'Faturalar, bir vernik kataloğu — ve altlarında, kurşun kalemle yazılmış, koparılmış bir sayfa.') },
        details: [],
      },
      {
        id: 'z-floor', label: L('Floor beneath the bench', 'Tezgâhın altındaki zemin'), hotspotId: 'h-floor', shape: { kind: 'circle', x: 0.52, y: 0.56, r: 0.04 },
        closeUp: { art: 'kessler/floor', text: L('Spruce shavings, a dropped peg, a glint of gold near his shoulder.', 'Ladin talaşları, düşmüş bir burgu, omzunun yanında bir altın parıltısı.') },
        details: [{ id: 'd-glint', label: L('Gold glint', 'Altın parıltı'), text: L('A butterfly earring back, lying on top of the shavings — not under them.', 'Kelebek tipi bir küpe arkalığı; talaşların altında değil, üstünde.'), x: 0.55, y: 0.6, facts: ['f-earring-fresh'] }],
      },
      {
        id: 'z-sink', label: L('Cleaning station', 'Temizlik köşesi'), hotspotId: 'h-sink', shape: { kind: 'rect', x: 0.8, y: 0.76, w: 0.14, h: 0.16 },
        closeUp: { art: 'kessler/sink', text: L('A deep sink, a can of naphtha under it, a lidded bin. The smell of solvent hangs in the corner.', 'Derin bir lavabo, altında bir bidon neft, kapaklı bir kova. Köşede çözücü kokusu asılı duruyor.') },
        details: [{ id: 'd-rag', label: L('Rag in the bin', 'Kovadaki bez'), text: L('Still damp. Brownish streaks in one fold.', 'Hâlâ nemli. Bir kıvrımında kahverengimsi çizgiler.'), x: 0.7, y: 0.7, facts: ['f-rag-damp'] }],
      },
      {
        id: 'z-bows', label: L('Bow cabinet', 'Yay vitrini'), hotspotId: 'h-bows', shape: { kind: 'rect', x: 0.06, y: 0.55, w: 0.08, h: 0.3 },
        closeUp: { art: 'kessler/bow-cabinet', text: L('A glazed cabinet of bows, unlocked. One velvet slot is empty.', 'Kilitsiz, camlı bir yay vitrini. Kadife yuvalardan biri boş.') },
        details: [{ id: 'd-slot', label: L('Empty slot', 'Boş yuva'), text: L('The card reads “E. Sartory, Paris c.1912 — €18,500”.', 'Kartında “E. Sartory, Paris y.1912 — 18.500 €” yazıyor.'), x: 0.5, y: 0.5, facts: ['f-bow-missing'] }],
      },
    ],
  },
  {
    locationId: 'loc-office', art: 'kessler/office',
    zones: [
      {
        id: 'z-desk', label: L('Desk diary', 'Masa ajandası'), hotspotId: 'h-desk', shape: { kind: 'circle', x: 0.44, y: 0.44, r: 0.05 },
        closeUp: { art: 'kessler/desk-diary', text: L('A week-to-view diary open at Thursday, in Thomas’s small upright hand.', 'Perşembe sayfasında açık bir ajanda; Thomas’ın küçük, dik el yazısı.') },
        details: [],
      },
      {
        id: 'z-drawer', label: L('Desk drawer', 'Masa çekmecesi'), hotspotId: 'h-drawer', shape: { kind: 'circle', x: 0.6, y: 0.5, r: 0.05 },
        closeUp: { art: 'kessler/drawer', text: L('A folder on top: “ACHTERBERG — G.B.G.”, a letter clipped to the contract.', 'En üstte bir dosya: “ACHTERBERG — G.B.G.”; sözleşmeye bir mektup iliştirilmiş.') },
        details: [],
      },
      {
        id: 'z-files', label: L('Filing cabinet', 'Dosya dolabı'), hotspotId: 'h-files', shape: { kind: 'rect', x: 0.72, y: 0.12, w: 0.18, h: 0.12 },
        closeUp: { art: 'kessler/files', text: L('Quarterly accounts in Clara’s hand. The current binder is thin.', 'Clara’nın tuttuğu üç aylık hesaplar. Bu yılın klasörü ince.') },
        details: [{ id: 'd-loan', label: L('Loan entry', 'Kredi kaydı'), text: L('€900,000, settled 4 September. Source of funds: none recorded.', '900.000 €, 4 Eylül’de kapanmış. Paranın kaynağı: kayıt yok.'), x: 0.5, y: 0.55, facts: ['f-loan'] }],
      },
      {
        id: 'z-frontdoor', label: L('Front door', 'Ön kapı'), hotspotId: 'h-frontdoor', shape: { kind: 'circle', x: 0.5, y: 0.86, r: 0.06 },
        closeUp: { art: 'kessler/front-door', text: L('Frame and strike plate intact. A thumb-turn on the inside: someone inside let the visitor in, and out.', 'Kasa ve karşılık sacı sağlam. İçeride bir mandal var: ziyaretçiyi içeriden biri alıp içeriden biri çıkarmış.') },
        details: [],
      },
      {
        // wave 4 — the second false trail starts here: Miriam gained from his death (on paper)
        id: 'z-tray', label: L('Letter tray', 'Mektup sepeti'), shape: { kind: 'rect', x: 0.16, y: 0.4, w: 0.12, h: 0.08 },
        closeUp: { art: 'kessler/letter-tray', text: L('This week’s post, opened and stacked. On top, a lawyer’s letterhead: Achterberg.', 'Bu haftanın postası, açılıp üst üste konmuş. En üstte bir avukatlık bürosunun antetli kâğıdı: Achterberg.') },
        evidence: ['ev-lawyerletter'],
        details: [],
      },
    ],
  },
  {
    locationId: 'loc-vault', art: 'kessler/vault',
    zones: [
      {
        id: 'z-violincase', label: L('Guadagnini case', 'Guadagnini kutusu'), hotspotId: 'h-violincase', shape: { kind: 'rect', x: 0.48, y: 0.18, w: 0.12, h: 0.08 },
        closeUp: { art: 'kessler/violin-case', text: L('Deep amber varnish, a two-piece back. It looks exactly as it should.', 'Koyu kehribar vernik, iki parça sırt. Tam olması gerektiği gibi görünüyor.') },
        details: [{ id: 'd-varnish', label: L('Varnish under UV', 'UV altında vernik'), text: L('An even, flat glow. Three-hundred-year-old varnish does not glow like this.', 'Düz, tekdüze bir ışıma. Üç yüz yıllık vernik böyle ışımaz.'), x: 0.5, y: 0.45, tool: 'uv', facts: ['f-varnish-even'] }],
      },
      {
        id: 'z-ledger', label: L('Sign-out ledger', 'Çıkış defteri'), hotspotId: 'h-ledger', shape: { kind: 'rect', x: 0.2, y: 0.62, w: 0.14, h: 0.14 },
        closeUp: { art: 'kessler/ledger', text: L('Date, instrument, out, in, initials. The last line has no return.', 'Tarih, çalgı, çıkış, giriş, paraf. Son satırın dönüşü yok.') },
        details: [],
      },
    ],
  },
  {
    locationId: 'loc-back', art: 'kessler/back',
    zones: [
      {
        id: 'z-reader', label: L('Access-control reader', 'Geçiş kontrol okuyucusu'), hotspotId: 'h-reader', shape: { kind: 'rect', x: 0.42, y: 0.4, w: 0.06, h: 0.08 },
        closeUp: { art: 'kessler/reader', text: L('A HALSEC controller: “event log retained 90 days”.', 'Bir HALSEC ünitesi: “olay kaydı 90 gün saklanır”.') },
        details: [],
      },
      {
        id: 'z-courtyard', label: L('Courtyard', 'Avlu'), hotspotId: 'h-courtyard', shape: { kind: 'rect', x: 0.58, y: 0.12, w: 0.36, h: 0.78 },
        closeUp: { art: 'kessler/courtyard', text: L('Frost on the cobbles. Thin tyre marks to the bike rack and back.', 'Arnavutkaldırımında kırağı. Bisiklet park yerine giden ve dönen ince lastik izleri.') },
        details: [{ id: 'd-tyres', label: L('Tyre marks', 'Lastik izleri'), text: L('One set, in and out, laid after the frost formed. Only one member of staff cycles.', 'Tek iz, gidiş dönüş; kırağıdan sonra bırakılmış. Çalışanlardan bisiklete binen tek kişi var.'), x: 0.6, y: 0.7, facts: ['f-bike-tracks'] }],
      },
    ],
  },

  // ── wave 4: optional places
  {
    locationId: 'loc-varga', art: 'kessler/varga',
    zones: [
      {
        id: 'z-va-window', label: L('Kitchen window', 'Mutfak penceresi'), shape: { kind: 'rect', x: 0.3, y: 0.14, w: 0.4, h: 0.12 },
        closeUp: { art: 'kessler/varga-window', text: L('The window looks straight down at the workshop’s back door. On the sill, a school exercise book and a pencil on a string.', 'Pencere doğrudan atölyenin arka kapısına bakıyor. Pervazda bir okul defteri ve ipe bağlı bir kurşun kalem.') },
        evidence: ['ev-lightbook'],
        details: [],
      },
      {
        id: 'z-va-letter', label: L('Letter to the landlord', 'Ev sahibine mektup'), shape: { kind: 'rect', x: 0.6, y: 0.55, w: 0.22, h: 0.18 },
        closeUp: { art: 'kessler/varga-letter', text: L('A draft in careful handwriting, third version, with the list to be copied in at the bottom.', 'Özenli bir el yazısıyla bir taslak, üçüncü hâli; listenin altına eklenecek.') },
        details: [{
          id: 'd-va-sensor', label: L('The complaint', 'Şikâyet'), x: 0.5, y: 0.4,
          text: L('“…the lamp you fitted in January comes on for anyone who walks to the workshop’s back door, and for nobody else. It shines straight into my kitchen.”', '“…Ocak’ta taktırdığınız lamba atölyenin arka kapısına yürüyen herkes için yanıyor, başka kimse için yanmıyor. Işığı doğrudan mutfağıma vuruyor.”'),
          facts: ['f-light-sensor'],
        }],
      },
    ],
  },
  {
    locationId: 'loc-clara', art: 'kessler/clara-flat',
    zones: [
      {
        id: 'z-cl-dish', label: L('Jewellery dish', 'Takı tabağı'), shape: { kind: 'circle', x: 0.72, y: 0.3, r: 0.05 },
        closeUp: { art: 'kessler/clara-dish', text: L('A china dish on the bedside table: a watch, a hair tie, a pair of pearl studs.', 'Komodinin üstünde porselen bir tabak: bir saat, bir toka, bir çift inci küpe.') },
        details: [{
          id: 'd-cl-studs', label: L('Pearl studs', 'İnci küpeler'), x: 0.55, y: 0.5,
          text: L('The right stud has a gold butterfly back. The left one has a clear plastic stopper, the kind sold on a card of twenty.', 'Sağ küpede altın, kelebek tipi bir arkalık var. Solundaysa yirmili kartelalarda satılan türden şeffaf plastik bir tıpa.'),
          facts: ['f-pearl-back'],
        }],
      },
      {
        id: 'z-cl-coat', label: L('Camel coat in the hall', 'Antredeki deve tüyü palto'), shape: { kind: 'rect', x: 0.12, y: 0.66, w: 0.14, h: 0.18 },
        closeUp: { art: 'kessler/clara-coat', text: L('A pale camel coat, brushed and hung straight. The hall smells faintly of something that is not perfume.', 'Açık renk, deve tüyü bir palto; fırçalanmış, düzgünce asılmış. Antrede parfüm olmayan bir şeyin hafif kokusu var.') },
        details: [{
          id: 'd-cl-cuff', label: L('Left cuff (UV)', 'Sol kol ağzı (UV)'), tool: 'uv', x: 0.3, y: 0.7,
          text: L('Under UV the left cuff shows a dull, wiped smear. It smells of naphtha.', 'UV altında sol kol ağzında mat, silinmiş bir leke görünüyor. Neft kokuyor.'),
          facts: ['f-coat-naphtha'],
        }],
      },
      {
        id: 'z-cl-desk', label: L('Desk by the window', 'Penceredeki çalışma masası'), shape: { kind: 'rect', x: 0.16, y: 0.2, w: 0.26, h: 0.12 },
        closeUp: { art: 'kessler/clara-desk', text: L('Ring binders labelled CK ATELIER, a laptop, a tray of receipts filed by month.', 'Üzerinde CK ATELIER yazan klasörler, bir dizüstü bilgisayar, aylara göre dizilmiş fişlerle dolu bir kutu.') },
        details: [{
          id: 'd-cl-receipt', label: L('September receipts', 'Eylül fişleri'), x: 0.7, y: 0.55,
          text: L('Hôtel des Bergues, Geneva, two nights, 2–3 September, paid with the CK Atelier company card.', 'Hôtel des Bergues, Cenevre, iki gece, 2–3 Eylül; CK Atelier şirket kartıyla ödenmiş.'),
          facts: ['f-geneva-trip'],
        }],
      },
    ],
  },
  {
    locationId: 'loc-pawn', art: 'kessler/pawn',
    zones: [
      {
        id: 'z-pw-book', label: L('Pledge book', 'Rehin defteri'), shape: { kind: 'rect', x: 0.3, y: 0.5, w: 0.4, h: 0.1 },
        closeUp: { art: 'kessler/pawn-book', text: L('The pawnbroker turns the book round without a word. Yesterday, nine ten, a violin bow.', 'Rehinci tek kelime etmeden defteri sana çeviriyor. Dün, dokuzu on geçe, bir keman yayı.') },
        evidence: ['ev-pawn'],
        details: [],
      },
    ],
  },
  {
    locationId: 'loc-bank', art: 'kessler/bank',
    zones: [
      {
        id: 'z-bk-file', label: L('Loan file 77-41', '77-41 sayılı kredi dosyası'), shape: { kind: 'rect', x: 0.35, y: 0.4, w: 0.3, h: 0.14 },
        closeUp: { art: 'kessler/bank-file', text: L('Kessler Strings, €900,000 against the premises, March last year. The adviser turns the pages for you without being asked.', 'Kessler Strings, işyeri teminatlı 900.000 €, geçen yılın Mart’ı. Kredi uzmanı sen istemeden sayfaları çeviriyor.') },
        details: [
          {
            id: 'd-bk-pages', label: L('Initials', 'Paraflar'), x: 0.3, y: 0.45,
            text: L('Every page initialled “C.K.”; “T. Kessler” only on the last. “Mr Kessler never came in,” says the adviser. “His daughter handled it.”', 'Her sayfada “C.K.” parafı; “T. Kessler” imzası yalnızca sonuncuda. “Bay Kessler hiç gelmedi,” diyor uzman. “Kızı halletti.”'),
            facts: ['f-bank-papers'],
          },
        ],
      },
      {
        id: 'z-bk-ledger', label: L('Settlement records', 'Kapatma kayıtları'), shape: { kind: 'rect', x: 0.66, y: 0.68, w: 0.22, h: 0.15 },
        closeUp: { art: 'kessler/bank-ledger', text: L('The adviser has to fetch these from the back office, and makes a point of saying so.', 'Kredi uzmanı bunları arka ofisten getirmek zorunda kalıyor ve bunu özellikle belirtiyor.') },
        details: [{
          id: 'd-bk-slip', label: L('Settlement slip', 'Kapatma dekontu'), x: 0.5, y: 0.5,
          text: L('4 September: €903,410 received from CK Atelier Consulting GmbH — “settlement of loan 77-41”.', '4 Eylül: CK Atelier Consulting GmbH’den 903.410 € alındı — “77-41 sayılı kredinin kapatılması”.'),
          facts: ['f-loan-repaid'],
        }],
      },
    ],
  },
];

// SERVER-ONLY. Ash and Glaze — v2 scenes: zones on the 0..1 canvas (they match the plans in places.ts), close-up
// cards, details, hidden traces (dust: the shoe prints in the slip; UV: the oil trail inside and the drips outside).
// Art keys follow the other cases: scenes "fennick/<room>", close-ups by zone id (see docs/handoff/S-art.md).
import type { SceneDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const scenes: SceneDef[] = [
  {
    locationId: 'loc-studio', art: 'fennick/studio',
    zones: [
      {
        id: 'z-fy-racks', label: L('Drying racks', 'Kurutma rafları'), hotspotId: 'h-fy-racks', shape: { kind: 'rect', x: 0.66, y: 0.14, w: 0.26, h: 0.36 },
        closeUp: {
          art: 'fennick/racks',
          text: L(
            'Three steel racks, buckled. Forty shapes of grey ash where the pieces stood. On the wall behind, the soot climbs in a sharp V.',
            'Eğrilmiş üç çelik raf. Parçaların durduğu yerde kırk tane gri kül silueti. Arkadaki duvarda is keskin bir V çizerek yükseliyor.',
          ),
        },
        details: [
          { id: 'd-fy-vee', label: L('The point of the V', 'V’nin ucu'), text: L('The V starts at floor level under the middle rack — the lowest, deepest burn in the room. The kiln is four metres away.', 'V, ortadaki rafın altında, yer hizasında başlıyor — odadaki en alçak, en derin yanık. Fırın dört metre ötede.'), x: 0.47, y: 0.66, facts: ['f-v-pattern'] },
          { id: 'd-fy-straw', label: L('Under the racks', 'Rafların altı'), text: L('Charred straw and the curled black leaves of wrapping paper. Whatever burned first, burned here.', 'Kömürleşmiş saman ve kıvrılmış, kapkara ambalaj kâğıtları. İlk ne yandıysa burada yandı.'), x: 0.2, y: 0.72, facts: ['f-straw'] },
        ],
      },
      {
        id: 'z-fy-kiln', label: L('The big kiln', 'Büyük fırın'), hotspotId: 'h-fy-kiln', shape: { kind: 'rect', x: 0.08, y: 0.1, w: 0.16, h: 0.18 },
        closeUp: {
          art: 'fennick/kiln',
          text: L('A front-loading electric kiln, its door shut. Paint blistered on one side only — the side facing the racks.', 'Önden yüklemeli elektrikli bir fırın, kapağı kapalı. Boya yalnızca tek yanda kabarmış — raflara bakan yanda.'),
        },
        details: [
          { id: 'd-fy-controller', label: L('Controller', 'Kumanda paneli'), text: L('The last programme: started 21:31, ended 00:55. “COMPLETE”. No error code, no over-temperature.', 'Son program: başlangıç 21:31, bitiş 00:55. “TAMAMLANDI”. Hata kodu yok, aşırı ısınma yok.'), x: 0.86, y: 0.47, facts: ['f-kiln-0055'] },
          { id: 'd-fy-load', label: L('Inside the kiln', 'Fırının içi'), text: L('Six small celadon vessels, perfectly fired. On each foot: S.A. Agnes’s exhibition list has no such pieces.', 'Kusursuz pişmiş altı küçük seladon kap. Her birinin dibinde: S.A. Agnes’in sergi listesinde böyle parçalar yok.'), x: 0.66, y: 0.5, facts: ['f-sa-pots'] },
        ],
      },
      {
        id: 'z-fy-heater', label: L('Space heater', 'Isıtıcı'), hotspotId: 'h-fy-heater', shape: { kind: 'rect', x: 0.56, y: 0.4, w: 0.07, h: 0.08 },
        closeUp: {
          art: 'fennick/heater',
          text: L('An old oil-filled heater pushed right up against the racks, scorched on that side. Its cord runs to a socket on the wall.', 'Eski bir yağlı radyatör, rafların tam dibine itilmiş; o yanı kavrulmuş. Kablosu duvardaki bir prize gidiyor.'),
        },
        details: [
          { id: 'd-fy-plug', label: L('Dial and plug', 'Düğme ve fiş'), text: L('Plugged in. The dial is turned to the highest setting.', 'Fişe takılı. Düğmesi en yüksek kademeye çevrilmiş.'), x: 0.55, y: 0.38, facts: ['f-heater-plugged'] },
          { id: 'd-fy-socket', label: L('Wall switch', 'Duvardaki anahtar'), text: L('The socket has its own switch. It is off — and soot lies undisturbed on the rocker. It was off all night.', 'Prizin kendi anahtarı var. Kapalı — ve düğmenin üstündeki is hiç bozulmamış. Bütün gece kapalıymış.'), x: 0.81, y: 0.58, facts: ['f-socket-off'] },
        ],
      },
      {
        id: 'z-fy-alarm', label: L('Smoke alarm', 'Duman alarmı'), shape: { kind: 'circle', x: 0.46, y: 0.27, r: 0.035 },
        closeUp: {
          art: 'fennick/alarm',
          text: L('A ceiling smoke alarm above the glaze bench, its cover hanging open on the hinge.', 'Sır tezgâhının üstünde, tavanda bir duman alarmı; kapağı menteşesinden sarkıyor.'),
        },
        details: [
          { id: 'd-fy-slot', label: L('Battery slot', 'Pil yuvası'), text: L('Empty. The contacts are clean and bright — the battery was not burned out of it; it was taken.', 'Boş. Kontaklar temiz ve parlak — pil yanıp gitmemiş; çıkarılmış.'), x: 0.6, y: 0.44, facts: ['f-no-battery'] },
          { id: 'd-fy-cover', label: L('Cover clip (dusted)', 'Kapak mandalı (tozlanmış)'), tool: 'dust', text: L('Powder brings up one clear set of large prints on the clip — recent, and nobody else’s.', 'Toz, mandalda tek ve net bir set iri parmak izi çıkarıyor — taze, ve başka kimseninki yok.'), x: 0.4, y: 0.6, r: 0.1, facts: ['f-alarm-prints'], evidence: ['ev-alarmlift'] },
        ],
      },
      {
        id: 'z-fy-backdoor', label: L('Back door', 'Arka kapı'), hotspotId: 'h-fy-backdoor', shape: { kind: 'rect', x: 0.44, y: 0.84, w: 0.14, h: 0.08 },
        closeUp: {
          art: 'fennick/backdoor',
          text: L('A steel door onto the yard. The lock is whole and the frame unmarked. A typed notice is taped to the inside.', 'Avluya açılan çelik bir kapı. Kilit sağlam, kasada tek çizik yok. İç tarafına daktiloyla yazılmış bir duyuru yapıştırılmış.'),
        },
        details: [
          { id: 'd-fy-lock', label: L('The lock', 'Kilit'), text: L('Not forced, not picked. Whoever came in had a key.', 'Ne zorlanmış ne kurcalanmış. Giren her kimse anahtarı vardı.'), x: 0.31, y: 0.19, facts: ['f-backdoor-key'] },
          { id: 'd-fy-handle', label: L('Inside handle (UV)', 'İç kol (UV)'), tool: 'uv', text: L('Under the lamp the inside handle glows: an oily hand closed this door on the way out.', 'Lambanın altında iç kol ışıyor: yağlı bir el, çıkarken bu kapıyı kapatmış.'), x: 0.26, y: 0.36, r: 0.08, facts: ['f-handle-oil'] },
        ],
      },
      {
        id: 'z-fy-shelves', label: L('Seconds shelves', 'Iskarta rafları'), shape: { kind: 'rect', x: 0.06, y: 0.4, w: 0.1, h: 0.34 },
        closeUp: {
          art: 'fennick/shelves',
          text: L('Shelves of pieces Agnes marked as seconds — a chalk cross on each — waiting for the yearly smashing. Untouched by the fire.', 'Agnes’in ıskartaya ayırdığı parçaların rafları — her birinde tebeşirle bir çarpı — yıllık kırımı bekliyor. Yangın buraya ulaşmamış.'),
        },
        details: [
          { id: 'd-fy-gap', label: L('Middle shelf', 'Orta raf'), text: L('A clean rectangle in the dust where a whole crate stood until a day or two ago.', 'Tozda temiz bir dikdörtgen: bir iki gün öncesine kadar burada koca bir kasa duruyormuş.'), x: 0.46, y: 0.6, facts: ['f-crate-gap'] },
        ],
      },
      {
        id: 'z-fy-sink', label: L('Sink corner', 'Lavabo köşesi'), shape: { kind: 'rect', x: 0.8, y: 0.7, w: 0.14, h: 0.18 },
        closeUp: {
          art: 'fennick/sink',
          text: L('The sink, buckets of reclaimed clay, a broom. The fire never reached this corner.', 'Lavabo, geri kazanılmış çamur kovaları, bir süpürge. Yangın bu köşeye hiç ulaşmamış.'),
        },
        details: [
          { id: 'd-fy-outline', label: L('Dust on the floor', 'Yerdeki toz'), text: L('Four clean marks in the clay dust: the feet of something heavy that usually stands here.', 'Çamur tozunda dört temiz iz: genelde burada duran ağır bir şeyin ayakları.'), x: 0.4, y: 0.74, facts: ['f-heater-home'] },
        ],
      },
      {
        // found only by dusting the dried slip inside the back door
        id: 'z-fy-slip', label: L('Slip by the door (dusted)', 'Kapı dibindeki çamur (tozlanmış)'), reveal: 'dust', shape: { kind: 'rect', x: 0.44, y: 0.7, w: 0.14, h: 0.1 },
        closeUp: {
          art: 'fennick/slip',
          text: L('Under the powder the dried slip holds shoe prints: a smooth leather sole, about size 44, a ring of nails in the heel. Not a potter’s shoe.', 'Tozun altında kurumuş çamurda ayakkabı izleri: düz deri taban, aşağı yukarı 44 numara, topukta halka hâlinde çiviler. Bir seramikçinin ayakkabısı değil.'),
        },
        facts: ['f-shoeprint'], evidence: ['ev-shoeprint'], details: [],
      },
      {
        // found only with the UV lamp between the back door and the racks
        id: 'z-fy-trail', label: L('Trail on the floor (UV)', 'Yerdeki iz (UV)'), reveal: 'uv',
        shape: { kind: 'poly', points: [[0.48, 0.66], [0.62, 0.52], [0.7, 0.48], [0.74, 0.52], [0.66, 0.58], [0.52, 0.7]] },
        closeUp: {
          art: 'fennick/trail',
          text: L('Under ultraviolet a broken trail glows pale from the back door to the foot of the racks — splashes, as if poured while walking.', 'Morötesi ışıkta arka kapıdan rafların dibine kadar soluk, kesik kesik bir iz ışıyor — yürürken dökülmüş gibi sıçramalar.'),
        },
        facts: ['f-uv-trail'], details: [],
      },
    ],
  },
  {
    locationId: 'loc-yard', art: 'fennick/yard',
    zones: [
      {
        id: 'z-fy-gate', label: L('Gate keypad', 'Kapı tuş takımı'), hotspotId: 'h-fy-gate', shape: { kind: 'rect', x: 0.06, y: 0.42, w: 0.08, h: 0.14 },
        closeUp: {
          art: 'fennick/gate',
          text: L('The keypad on the iron gate. The fire service’s technician has opened its controller and left the printout hanging for you.', 'Demir kapıdaki tuş takımı. İtfaiyenin teknisyeni kumanda kutusunu açmış, dökümü senin için sarkıtıp bırakmış.'),
        },
        details: [],
      },
      {
        id: 'z-fy-camera', label: L('Yard camera', 'Avlu kamerası'), shape: { kind: 'circle', x: 0.18, y: 0.36, r: 0.035 },
        closeUp: {
          art: 'fennick/camera',
          text: L('A camera on a bracket over the gate, looking down the yard. Its cable runs up into the office window above.', 'Kapının üstünde bir ayağa takılı, avluya bakan bir kamera. Kablosu yukarıdaki ofis penceresine çıkıyor.'),
        },
        details: [
          { id: 'd-fy-cable', label: L('The cable', 'Kablo'), text: L('One cable, one recorder: the box in the landlord’s office. Nothing goes to the cloud.', 'Tek kablo, tek cihaz: ev sahibinin ofisindeki kutu. Hiçbir şey internete gitmiyor.'), x: 0.69, y: 0.42, facts: ['f-camera-cable'] },
        ],
      },
      {
        id: 'z-fy-gutter', label: L('Gutter', 'Oluk'), hotspotId: 'h-fy-gutter', shape: { kind: 'rect', x: 0.66, y: 0.58, w: 0.18, h: 0.08 },
        closeUp: {
          art: 'fennick/gutter',
          text: L('The drain gutter past Unit 4’s back door, full of black water from the hoses. Two things are caught in the grating.', '4 numaranın arka kapısının önünden geçen oluk; hortumlardan gelen kara suyla dolu. Izgaraya iki şey takılmış.'),
        },
        details: [
          { id: 'd-fy-cap', label: L('Red cap', 'Kırmızı kapak'), text: L('A half-melted screw cap. The thread and the red are the lamp-oil bottles’ — the kind the yard lanterns use.', 'Yarısı erimiş bir vidalı kapak. Dişi de rengi de gaz yağı şişelerininki — avlu fenerlerinde kullanılanlardan.'), x: 0.72, y: 0.52, facts: ['f-cap'] },
          { id: 'd-fy-matchbook', label: L('Matchbook', 'Kibrit kutusu'), text: L('A soaked paper matchbook. An anchor on the cover; three matches torn out.', 'Islanmış kâğıt bir kibrit kutusu. Kapağında bir çapa; üç çöpü koparılmış.'), x: 0.37, y: 0.47, facts: ['f-matchbook'] },
        ],
      },
      {
        // the shed opens once the fuel is known (d-oil): the fire service cuts the padlock
        id: 'z-fy-shed', label: L('The landlord’s shed', 'Ev sahibinin kulübesi'), hotspotId: 'h-fy-shed', locked: true, shape: { kind: 'rect', x: 0.2, y: 0.7, w: 0.16, h: 0.18 },
        closeUp: {
          art: 'fennick/shed',
          text: L('The padlock is cut. Salt bags, a ladder, paint tins, a bench — and a shelf of lamp oil for the lanterns.', 'Asma kilit kesilmiş. Tuz çuvalları, bir merdiven, boya kutuları, bir tezgâh — ve fenerler için bir raf dolusu gaz yağı.'),
        },
        details: [
          { id: 'd-fy-oilshelf', label: L('Lamp-oil shelf', 'Gaz yağı rafı'), text: L('Six one-litre bottles in a row, red caps. One gap, dust-free.', 'Kırmızı kapaklı altı adet bir litrelik şişe yan yana. Biri eksik; yeri tozsuz.'), x: 0.68, y: 0.34, facts: ['f-shed-gap'] },
          { id: 'd-fy-shedfloor', label: L('Floor by the shelf (UV)', 'Rafın önündeki zemin (UV)'), tool: 'uv', text: L('Under the lamp, fresh drips glow on the boards below the gap — and lead out of the door.', 'Lambanın altında, boşluğun altındaki tahtalarda taze damlalar ışıyor — ve kapıya doğru gidiyor.'), x: 0.69, y: 0.56, r: 0.08, facts: ['f-shed-drips'] },
          { id: 'd-fy-battery', label: L('On the bench', 'Tezgâhın üstünde'), text: L('A 9-volt battery with tape round it: “SMOKE ALARM — June”, in Agnes’s hand.', 'Üstüne bant sarılmış 9 voltluk bir pil: “DUMAN ALARMI — Haziran”, Agnes’in el yazısıyla.'), x: 0.75, y: 0.72, facts: ['f-battery-found'] },
        ],
      },
      {
        // the UV lamp across the cobbles: drips from the shed to the back door
        id: 'z-fy-path', label: L('Cobbles (UV)', 'Arnavutkaldırımı (UV)'), reveal: 'uv',
        shape: { kind: 'poly', points: [[0.36, 0.72], [0.6, 0.6], [0.82, 0.48], [0.84, 0.52], [0.62, 0.64], [0.38, 0.76]] },
        closeUp: {
          art: 'fennick/path',
          text: L('Under ultraviolet a line of pale drips crosses the wet cobbles from the shed door to Unit 4’s back door.', 'Morötesi ışıkta ıslak arnavutkaldırımının üstünde, kulübenin kapısından 4 numaranın arka kapısına uzanan soluk damlalardan bir çizgi.'),
        },
        facts: ['f-shed-drips'], details: [],
      },
    ],
  },
  {
    locationId: 'loc-office', art: 'fennick/office',
    zones: [
      {
        id: 'z-ho-recorder', label: L('Camera recorder', 'Kamera kayıt cihazı'), hotspotId: 'h-ho-recorder', shape: { kind: 'rect', x: 0.7, y: 0.12, w: 0.2, h: 0.12 },
        closeUp: {
          art: 'fennick/recorder',
          text: L('A grey recorder under the window. Dahl unplugs it for you himself: “The disk fills up. It stops all the time.”', 'Pencerenin altında gri bir kayıt cihazı. Dahl fişini kendi eliyle çekip uzatıyor: “Disk doluyor. Sürekli duruyor.”'),
        },
        details: [],
      },
      {
        id: 'z-ho-keys', label: L('Key cabinet', 'Anahtar dolabı'), shape: { kind: 'rect', x: 0.08, y: 0.12, w: 0.1, h: 0.2 },
        closeUp: {
          art: 'fennick/keys',
          text: L('A glass-fronted cabinet: one spare per unit on labelled hooks, all present.', 'Camlı bir dolap: her birimin yedek anahtarı etiketli kancasında, hepsi yerinde.'),
        },
        details: [
          { id: 'd-ho-ring', label: L('The labels', 'Etiketler'), text: L('“SPARE” on every tag. The masters, Dahl says, never leave his belt — he shows you the ring.', 'Her etikette “YEDEK”. Ana anahtarlar, diyor Dahl, kemerinden hiç ayrılmaz — halkayı gösteriyor.'), x: 0.5, y: 0.6, facts: ['f-master-key'] },
        ],
      },
      {
        // the desk and the files open with the warrant that follows the night’s timeline (d-timeline)
        id: 'z-ho-desk', label: L('Desk', 'Masa'), hotspotId: 'h-ho-desk', locked: true, shape: { kind: 'rect', x: 0.36, y: 0.4, w: 0.3, h: 0.18 },
        closeUp: {
          art: 'fennick/desk',
          text: L('The locked drawer opens on the warrant: a sale agreement in a blue folder, a handwritten list clipped behind it.', 'Kilitli çekmece izin belgesiyle açılıyor: mavi bir dosyada bir satış sözleşmesi, arkasına iliştirilmiş el yazısı bir liste.'),
        },
        details: [],
      },
      {
        id: 'z-ho-files', label: L('Lease files', 'Kira dosyaları'), hotspotId: 'h-ho-files', locked: true, shape: { kind: 'rect', x: 0.08, y: 0.6, w: 0.16, h: 0.28 },
        closeUp: {
          art: 'fennick/files',
          text: L('One box file per unit. Unit 4’s is the thickest, and the only one with a pencil in it.', 'Her birim için bir dosya kutusu. 4 numaranınki en kalını; içinde kurşun kalem olan tek dosya da o.'),
        },
        details: [],
      },
    ],
  },
  {
    locationId: 'loc-club', art: 'fennick/club',
    zones: [
      {
        id: 'z-hc-cloak', label: L('Cloakroom', 'Vestiyer'), hotspotId: 'h-hc-cloak', shape: { kind: 'rect', x: 0.06, y: 0.1, w: 0.2, h: 0.2 },
        closeUp: { art: 'fennick/cloakroom', text: L('Numbered brass hooks and a cloakroom book, every coat in and out in a neat hand.', 'Numaralı pirinç askılar ve bir vestiyer defteri; her paltonun girişi çıkışı düzgün bir el yazısıyla.') },
        details: [],
      },
      {
        id: 'z-hc-bar', label: L('Bar', 'Bar'), shape: { kind: 'rect', x: 0.4, y: 0.08, w: 0.5, h: 0.12 },
        closeUp: { art: 'fennick/bar', text: L('The long bar. A bowl of club matchbooks; the barman’s spike of closed tabs.', 'Uzun bar. Kulübün kibrit kutularıyla dolu bir kâse; barmenin kapanmış hesapları taktığı şiş.') },
        details: [
          { id: 'd-hc-matches', label: L('Matchbooks', 'Kibrit kutuları'), text: L('Paper matchbooks, an anchor on every cover. The club hands them out at the bar.', 'Kâğıt kibrit kutuları, her birinin kapağında bir çapa. Kulüp onları barda dağıtıyor.'), x: 0.3, y: 0.48, facts: ['f-club-matches'] },
          { id: 'd-hc-tab', label: L('Tab spike', 'Hesap şişi'), text: L('Dahl’s tab: one brandy, closed at 01:02, the signature shaky.', 'Dahl’ın hesabı: bir konyak, 01:02’de kapatılmış, imza titrek.'), x: 0.58, y: 0.62, facts: ['f-tab-0102'] },
        ],
      },
      {
        id: 'z-hc-plan', label: L('Seating plan', 'Oturma planı'), shape: { kind: 'rect', x: 0.4, y: 0.4, w: 0.24, h: 0.2 },
        closeUp: { art: 'fennick/seating', text: L('The seating plan for the Shipowners’ autumn dinner, still on its easel.', 'Armatörlerin güz yemeğinin oturma planı, hâlâ şövalesinin üstünde.') },
        details: [
          { id: 'd-hc-seat', label: L('Table three', 'Üç numaralı masa'), text: L('O. Dahl, and on his right: K. Nyberg — Norrhavn Living.', 'O. Dahl ve sağında: K. Nyberg — Norrhavn Living.'), x: 0.5, y: 0.5, facts: ['f-nyberg-seat'] },
        ],
      },
      {
        id: 'z-hc-corridor', label: L('Corridor by the cloakroom', 'Vestiyerin yanındaki koridor'), shape: { kind: 'rect', x: 0.06, y: 0.36, w: 0.2, h: 0.12 },
        closeUp: { art: 'fennick/corridor', text: L('A quiet corridor between the cloakroom and the cellar stairs, a bench, the club’s router blinking on a shelf.', 'Vestiyerle mahzen merdiveni arasında sessiz bir koridor; bir bank, rafta yanıp sönen kulüp modemi.') },
        details: [
          { id: 'd-hc-wifi', label: L('Guest wifi log', 'Misafir ağı kaydı'), text: L('The manager prints the router’s log for you: Dahl’s phone, on this corridor’s router, 00:58 to 01:03.', 'Müdür modemin kaydını yazdırıp veriyor: Dahl’ın telefonu, bu koridordaki modemde, 00:58 ile 01:03 arası.'), x: 0.48, y: 0.48, facts: ['f-club-wifi'] },
        ],
      },
      {
        id: 'z-hc-door', label: L('Doorman’s lectern', 'Kapı görevlisinin kürsüsü'), hotspotId: 'h-hc-door', shape: { kind: 'rect', x: 0.08, y: 0.7, w: 0.16, h: 0.14 },
        closeUp: { art: 'fennick/lectern', text: L('An umbrella stand, a radio and the taxi book. The doorman who kept it went off shift at half past one.', 'Bir şemsiyelik, bir telsiz ve taksi defteri. Defteri tutan kapı görevlisi bir buçukta vardiyadan çıkmış.') },
        details: [],
      },
    ],
  },
  {
    locationId: 'loc-kranz', art: 'fennick/kranz',
    zones: [
      {
        id: 'z-kr-table', label: L('Back table', 'Arka masa'), hotspotId: 'h-kr-table', shape: { kind: 'rect', x: 0.5, y: 0.5, w: 0.3, h: 0.2 },
        closeUp: { art: 'fennick/kranz-table', text: L('Two glasses, a receipt book open at Saturday, and the little screen of the door camera. Kranz is happy to talk; it is his alibi too.', 'İki kadeh, cumartesi sayfasında açık bir makbuz defteri ve kapı kamerasının küçük ekranı. Kranz konuşmaktan memnun; bu onun da mazereti.') },
        details: [],
      },
      {
        id: 'z-kr-crate', label: L('The crate', 'Kasa'), shape: { kind: 'rect', x: 0.1, y: 0.56, w: 0.2, h: 0.16 },
        closeUp: { art: 'fennick/kranz-crate', text: L('A wooden crate of pots in straw, each one wrapped in newspaper.', 'Saman içinde, her biri gazeteye sarılmış çömleklerle dolu tahta bir kasa.') },
        details: [
          { id: 'd-kr-stamps', label: L('Under the newspaper', 'Gazetenin altı'), text: L('Twenty-three pieces, each with Agnes’s stamp and her chalk cross. The seconds from the studio shelf.', 'Yirmi üç parça; her birinde Agnes’in damgası ve tebeşirle çarpısı. Atölyedeki ıskarta rafından gelenler.'), x: 0.53, y: 0.57, facts: ['f-crate-23'] },
        ],
      },
    ],
  },
  {
    locationId: 'loc-house', art: 'fennick/house',
    zones: [
      {
        id: 'z-hh-hall', label: L('Hall stand', 'Portmanto'), shape: { kind: 'rect', x: 0.06, y: 0.4, w: 0.2, h: 0.3 },
        closeUp: { art: 'fennick/hall', text: L('A long dark overcoat, brushed and hung. Below it a shoe rack, everything in pairs but one.', 'Fırçalanıp asılmış uzun, koyu bir palto. Altında bir ayakkabılık; biri hariç her şey çift çift.') },
        evidence: ['ev-coat'],
        details: [
          { id: 'd-hh-coat', label: L('Cuff and hem (UV)', 'Kol ağzı ve etek (UV)'), tool: 'uv', text: L('Under the lamp the right cuff and the hem glow with small splashes.', 'Lambanın altında sağ kol ağzı ve etek küçük sıçramalarla ışıyor.'), x: 0.62, y: 0.58, facts: ['f-coat-oil'] },
          { id: 'd-hh-rack', label: L('Shoe rack', 'Ayakkabılık'), text: L('A gap on the top shelf, size 44, where a pair of black dress shoes belongs.', 'Üst rafta bir boşluk; 44 numara bir çift siyah kunduranın yeri.'), x: 0.35, y: 0.83, facts: ['f-shoe-gap'] },
        ],
      },
      {
        id: 'z-hh-study', label: L('Study desk', 'Çalışma masası'), shape: { kind: 'rect', x: 0.5, y: 0.12, w: 0.28, h: 0.18 },
        closeUp: { art: 'fennick/study', text: L('Bank letters squared under a brass weight; the top one says “second reminder”.', 'Pirinç bir ağırlığın altında düzgünce dizilmiş banka mektupları; en üsttekinde “ikinci ihtar” yazıyor.') },
        evidence: ['ev-loan'], details: [],
      },
      {
        id: 'z-hh-garage', label: L('Garage', 'Garaj'), shape: { kind: 'rect', x: 0.4, y: 0.7, w: 0.2, h: 0.18 },
        closeUp: { art: 'fennick/garage', text: L('A dark saloon car in a tidy garage.', 'Derli toplu bir garajda koyu renk bir sedan.') },
        details: [
          { id: 'd-hh-bonnet', label: L('Bonnet and tyres', 'Kaput ve lastikler'), text: L('Cold, with a film of dust on the bonnet; the tyres are dry. It did not go out on Friday night.', 'Soğuk, kaputun üstünde ince bir toz tabakası; lastikler kuru. Cuma gecesi dışarı çıkmamış.'), x: 0.38, y: 0.5, facts: ['f-car-home'] },
        ],
      },
      {
        id: 'z-hh-garden', label: L('Garden incinerator', 'Bahçedeki yakma sobası'), shape: { kind: 'rect', x: 0.7, y: 0.66, w: 0.16, h: 0.2 },
        closeUp: { art: 'fennick/incinerator', text: L('A galvanised incinerator, still faintly warm, ash to the rim. Leaves on top; something heavier underneath.', 'Galvanizli bir yakma sobası, hâlâ hafif ılık, ağzına kadar kül. Üstte yapraklar; altında daha ağır bir şey.') },
        evidence: ['ev-ashes'],
        details: [
          { id: 'd-hh-ash', label: L('Under the leaves', 'Yaprakların altı'), text: L('The heel of a leather dress shoe, its nails in a ring, crusted with pale clay.', 'Deri bir kunduranın topuğu; çivileri halka hâlinde, üstü açık renk çamurla kaplı.'), x: 0.6, y: 0.36, facts: ['f-ash-sole'] },
        ],
      },
    ],
  },
];

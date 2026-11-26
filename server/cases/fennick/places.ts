// SERVER-ONLY. Ash and Glaze — locations, plans (the code-drawn fallback until the plates exist) and v1 hotspots.
// Every hotspot here stands for a v2 zone (zone.hotspotId) and carries the evidence that zone reveals.
import type { CaseDefinition, PlanShape } from '../../engine/types.ts';
import { L } from '../text.ts';

const box = (x1: number, y1: number, x2: number, y2: number): PlanShape[] => [
  { t: 'wall', x1, y1, x2, y2: y1 },
  { t: 'wall', x1: x2, y1, x2, y2 },
  { t: 'wall', x1: x2, y1: y2, x2: x1, y2 },
  { t: 'wall', x1, y1: y2, x2: x1, y2: y1 },
];

export const locations: CaseDefinition['locations'] = [
  {
    id: 'loc-studio', name: L('The studio (Unit 4)', 'Atölye (4 numara)'),
    summary: L(
      'A long whitewashed workshop, black now from the far end inwards. The big kiln, the glaze bench, the drying racks, a back door onto the yard.',
      'Uzun, badanalı bir atölye; dip taraftan içeriye doğru kapkara. Büyük fırın, sır tezgâhı, kurutma rafları ve avluya açılan bir arka kapı.',
    ),
    plan: [
      ...box(0.04, 0.06, 0.96, 0.94),
      { t: 'rect', x: 0.08, y: 0.1, w: 0.16, h: 0.18, label: L('KILN', 'FIRIN') },
      { t: 'rect', x: 0.3, y: 0.1, w: 0.3, h: 0.1, label: L('GLAZE BENCH', 'SIR TEZGÂHI') },
      { t: 'rect', x: 0.66, y: 0.14, w: 0.26, h: 0.36, label: L('DRYING RACKS', 'KURUTMA RAFLARI') },
      { t: 'rect', x: 0.56, y: 0.4, w: 0.07, h: 0.08, label: L('HEATER', 'ISITICI') },
      { t: 'rect', x: 0.06, y: 0.4, w: 0.1, h: 0.34, label: L('SECONDS', 'ISKARTA') },
      { t: 'rect', x: 0.8, y: 0.7, w: 0.14, h: 0.18, label: L('SINK', 'LAVABO') },
      { t: 'door', x: 0.51, y: 0.94, r: 0.07, angle: 270 },
      { t: 'text', x: 0.44, y: 0.98, text: L('YARD ↓', 'AVLU ↓') },
    ],
    hotspots: [
      {
        id: 'h-fy-racks', label: L('Drying racks', 'Kurutma rafları'), x: 0.79, y: 0.32, reveals: ['ev-burnpattern', 'ev-debris'],
        description: L(
          'Three steel racks, buckled by the heat. On the wall behind them the soot climbs in a sharp V from floor level.',
          'Isıdan eğrilmiş üç çelik raf. Arkalarındaki duvarda is, yer hizasından keskin bir V çizerek yükseliyor.',
        ),
      },
      {
        id: 'h-fy-kiln', label: L('The big kiln', 'Büyük fırın'), x: 0.16, y: 0.19, reveals: ['ev-kilnpots'],
        description: L(
          'A front-loading electric kiln, its door shut. The paint is blistered on one side only — the side facing the racks.',
          'Önden yüklemeli elektrikli bir fırın, kapağı kapalı. Boyası yalnızca bir yanda kabarmış — raflara bakan yanda.',
        ),
      },
      {
        id: 'h-fy-heater', label: L('Space heater', 'Isıtıcı'), x: 0.6, y: 0.44, reveals: ['ev-heater'],
        description: L('An old oil-filled heater stands right against the racks, its cord running to the wall.', 'Eski bir yağlı radyatör rafların dibinde duruyor; kablosu duvara uzanıyor.'),
      },
      {
        id: 'h-fy-backdoor', label: L('Back door', 'Arka kapı'), x: 0.51, y: 0.87, reveals: ['ev-notice'],
        description: L(
          'A steel door onto the yard. The lock is whole. A typed notice is taped to the inside.',
          'Avluya açılan çelik bir kapı. Kilit sağlam. İç tarafına daktiloyla yazılmış bir duyuru yapıştırılmış.',
        ),
      },
    ],
  },
  {
    id: 'loc-yard', name: L('Fennick Yard', 'Fennick Avlusu'),
    summary: L(
      'Cobbles still wet from the hoses. The iron gate with its keypad, the bakery’s lit window, the landlord’s brick shed, a gutter running past Unit 4’s back door.',
      'Hortumlardan hâlâ ıslak arnavutkaldırımı. Tuş takımlı demir kapı, fırının ışıklı penceresi, ev sahibinin tuğla kulübesi ve 4 numaranın arka kapısının önünden geçen bir oluk.',
    ),
    plan: [
      ...box(0.04, 0.06, 0.96, 0.94),
      { t: 'rect', x: 0.06, y: 0.42, w: 0.08, h: 0.14, label: L('GATE', 'KAPI') },
      { t: 'rect', x: 0.2, y: 0.7, w: 0.16, h: 0.18, label: L('SHED', 'KULÜBE') },
      { t: 'rect', x: 0.08, y: 0.1, w: 0.24, h: 0.16, label: L('UNIT 1 · BAKERY', '1 · FIRIN') },
      { t: 'rect', x: 0.4, y: 0.1, w: 0.22, h: 0.16, label: L('UNIT 0 · OFFICE', '0 · OFİS') },
      { t: 'rect', x: 0.84, y: 0.3, w: 0.1, h: 0.4, label: L('UNIT 4', '4 NUMARA') },
      { t: 'rect', x: 0.66, y: 0.6, w: 0.18, h: 0.05, dashed: true, label: L('GUTTER', 'OLUK') },
      { t: 'door', x: 0.84, y: 0.5, r: 0.06, angle: 180 },
      { t: 'text', x: 0.02, y: 0.62, text: L('← LANE', '← SOKAK') },
    ],
    hotspots: [
      {
        id: 'h-fy-gate', label: L('Gate keypad', 'Kapı tuş takımı'), x: 0.1, y: 0.49, reveals: ['ev-gatelog'],
        description: L('A keypad on the iron gate. The fire service’s technician has opened its controller; a paper strip hangs out.', 'Demir kapıda bir tuş takımı. İtfaiyenin teknisyeni kumanda kutusunu açmış; dışarı bir kâğıt şerit sarkıyor.'),
      },
      {
        id: 'h-fy-shed', label: L('The landlord’s shed', 'Ev sahibinin kulübesi'), x: 0.28, y: 0.79, reveals: ['ev-battery'],
        description: L('A brick shed, padlocked. Salt, ladders, paint — and the lamp oil for the yard lanterns.', 'Asma kilitli tuğla bir kulübe. Tuz, merdivenler, boya — ve avlu fenerlerinin gaz yağı.'),
      },
      {
        id: 'h-fy-gutter', label: L('Gutter', 'Oluk'), x: 0.75, y: 0.62, reveals: ['ev-cap', 'ev-matchbook'],
        description: L('The drain gutter past Unit 4’s back door, full of black water from the hoses.', '4 numaranın arka kapısının önünden geçen oluk; hortumlardan gelen kara suyla dolu.'),
      },
    ],
  },
  {
    id: 'loc-office', name: L('The yard office (Unit 0)', 'Avlu ofisi (0 numara)'),
    summary: L(
      'Oskar Dahl’s office over the gate: a recorder for the yard camera, a key cabinet, a heavy desk, a wall of lease files.',
      'Oskar Dahl’ın kapının üstündeki ofisi: avlu kamerasının kayıt cihazı, bir anahtar dolabı, ağır bir masa, bir duvar dolusu kira dosyası.',
    ),
    plan: [
      ...box(0.04, 0.06, 0.96, 0.94),
      { t: 'rect', x: 0.7, y: 0.12, w: 0.2, h: 0.12, label: L('RECORDER', 'KAYIT CİHAZI') },
      { t: 'rect', x: 0.08, y: 0.12, w: 0.1, h: 0.2, label: L('KEYS', 'ANAHTARLAR') },
      { t: 'rect', x: 0.36, y: 0.4, w: 0.3, h: 0.18, label: L('DESK', 'MASA') },
      { t: 'rect', x: 0.08, y: 0.6, w: 0.16, h: 0.28, label: L('FILES', 'DOSYALAR') },
      { t: 'door', x: 0.96, y: 0.7, r: 0.07, angle: 180 },
    ],
    hotspots: [
      {
        id: 'h-ho-recorder', label: L('Camera recorder', 'Kamera kayıt cihazı'), x: 0.8, y: 0.18, reveals: ['ev-dvr'],
        description: L('A grey recorder box under the window, one cable running out to the yard camera.', 'Pencerenin altında gri bir kayıt cihazı; tek bir kablo avlu kamerasına gidiyor.'),
      },
      {
        id: 'h-ho-desk', label: L('Desk', 'Masa'), x: 0.51, y: 0.49, reveals: ['ev-contract', 'ev-codelist'],
        description: L('A heavy desk with a locked drawer. The warrant opens it.', 'Kilitli çekmeceli ağır bir masa. İzin belgesiyle açılıyor.'),
      },
      {
        id: 'h-ho-files', label: L('Lease files', 'Kira dosyaları'), x: 0.16, y: 0.74, reveals: ['ev-lease'],
        description: L('One box file per unit. Unit 4’s is the thickest.', 'Her birim için bir dosya kutusu. En kalını 4 numaranınki.'),
      },
    ],
  },
  {
    id: 'loc-club', name: L('The Harbour Club', 'Harbour Club'),
    summary: L(
      'Brass, leather and old ship portraits on Ostkai. Last night the Shipowners’ Society held its autumn dinner here.',
      'Ostkai’de pirinç, deri ve eski gemi portreleri. Dün gece Armatörler Derneği güz yemeğini burada verdi.',
    ),
    plan: [
      ...box(0.04, 0.06, 0.96, 0.94),
      { t: 'rect', x: 0.06, y: 0.1, w: 0.2, h: 0.2, label: L('CLOAKROOM', 'VESTİYER') },
      { t: 'rect', x: 0.4, y: 0.08, w: 0.5, h: 0.12, label: L('BAR', 'BAR') },
      { t: 'rect', x: 0.4, y: 0.4, w: 0.24, h: 0.2, label: L('SEATING PLAN', 'OTURMA PLANI') },
      { t: 'rect', x: 0.06, y: 0.36, w: 0.2, h: 0.12, dashed: true, label: L('CORRIDOR', 'KORİDOR') },
      { t: 'rect', x: 0.08, y: 0.7, w: 0.16, h: 0.14, label: L('DOOR', 'KAPI') },
      { t: 'door', x: 0.04, y: 0.77, r: 0.07, angle: 0 },
    ],
    hotspots: [
      {
        id: 'h-hc-cloak', label: L('Cloakroom', 'Vestiyer'), x: 0.16, y: 0.2, reveals: ['ev-cloakbook'],
        description: L('Numbered hooks, a cloakroom book open on the counter.', 'Numaralı askılar; tezgâhta açık bir vestiyer defteri.'),
      },
      {
        id: 'h-hc-door', label: L('Doorman’s lectern', 'Kapı görevlisinin kürsüsü'), x: 0.16, y: 0.77, reveals: ['ev-taxibook'],
        description: L('The doorman’s lectern: an umbrella stand, a radio, the taxi book.', 'Kapı görevlisinin kürsüsü: bir şemsiyelik, bir telsiz, taksi defteri.'),
      },
    ],
    v2: { travel: 45 },
  },
  {
    // a side road: opens once Bram has named the dealer (instead of waiting for the night or the lab)
    id: 'loc-kranz', name: L('Kranz Antiques, Ostkai', 'Kranz Antika, Ostkai'),
    summary: L(
      'A narrow shop crammed to the ceiling with other people’s heirlooms. A back room with a card table and a door camera.',
      'Tavana kadar başkalarının aile yadigârlarıyla dolu dar bir dükkân. Arkada iskambil masalı bir oda ve bir kapı kamerası.',
    ),
    requires: { statements: ['s-bram-seconds'] },
    plan: [
      ...box(0.04, 0.06, 0.96, 0.94),
      { t: 'rect', x: 0.5, y: 0.5, w: 0.3, h: 0.2, label: L('BACK TABLE', 'ARKA MASA') },
      { t: 'rect', x: 0.1, y: 0.56, w: 0.2, h: 0.16, label: L('CRATE', 'KASA') },
      { t: 'rect', x: 0.08, y: 0.08, w: 0.84, h: 0.12, label: L('SHELVES', 'RAFLAR') },
      { t: 'door', x: 0.96, y: 0.6, r: 0.07, angle: 180 },
    ],
    hotspots: [
      {
        id: 'h-kr-table', label: L('Back table', 'Arka masa'), x: 0.65, y: 0.6, reveals: ['ev-kranz'],
        description: L('A card table, two glasses, a receipt book and the screen of the door camera.', 'Bir iskambil masası, iki kadeh, bir makbuz defteri ve kapı kamerasının ekranı.'),
      },
    ],
    v2: { travel: 45 },
  },
  {
    id: 'loc-house', name: L('Dahl’s house, Strandvej', 'Dahl’ın evi, Strandvej'),
    summary: L(
      'A white villa on the shore road, everything in its place. A hall stand, a study, a garden going down to the water.',
      'Sahil yolunda beyaz bir villa; her şey yerli yerinde. Bir portmanto, bir çalışma odası, denize inen bir bahçe.',
    ),
    plan: [
      ...box(0.04, 0.06, 0.96, 0.94),
      { t: 'rect', x: 0.06, y: 0.4, w: 0.2, h: 0.3, label: L('HALL', 'ANTRE') },
      { t: 'rect', x: 0.5, y: 0.12, w: 0.28, h: 0.18, label: L('STUDY', 'ÇALIŞMA ODASI') },
      { t: 'rect', x: 0.7, y: 0.66, w: 0.16, h: 0.2, dashed: true, label: L('GARDEN', 'BAHÇE') },
      { t: 'rect', x: 0.4, y: 0.7, w: 0.2, h: 0.18, label: L('GARAGE', 'GARAJ') },
      { t: 'door', x: 0.04, y: 0.55, r: 0.07, angle: 0 },
    ],
    hotspots: [],
    v2: { locked: true, travel: 45 },
  },
];

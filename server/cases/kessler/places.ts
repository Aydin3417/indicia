// SERVER-ONLY. Kessler Workshop — locations, plans and v1 hotspots (the v2 scenes build on them).
import type { CaseDefinition } from '../../engine/types.ts';
import { L } from '../text.ts';

export const locations: CaseDefinition['locations'] = [
  {
    id: 'loc-workshop', name: L('Workshop', 'Atölye'),
    summary: L(
      'Long, high-ceilinged room with north light. Benches, a tool wall, a rolling library ladder to the upper shelves of tonewood, a display cabinet of bows.',
      'Kuzey ışığı alan, uzun, tavanı yüksek bir oda. Tezgâhlar, bir alet duvarı, üst raflardaki tonluk ağaçlara uzanan tekerlekli bir kütüphane merdiveni, yayların durduğu bir vitrin.',
    ),
    plan: [
      { t: 'wall', x1: 0.04, y1: 0.05, x2: 0.96, y2: 0.05 },
      { t: 'wall', x1: 0.96, y1: 0.05, x2: 0.96, y2: 0.95 },
      { t: 'wall', x1: 0.96, y1: 0.95, x2: 0.04, y2: 0.95 },
      { t: 'wall', x1: 0.04, y1: 0.95, x2: 0.04, y2: 0.05 },
      { t: 'rect', x: 0.08, y: 0.07, w: 0.42, h: 0.05, label: L('TOOL WALL', 'ALET DUVARI') },
      { t: 'rect', x: 0.62, y: 0.07, w: 0.32, h: 0.06, label: L('UPPER SHELVES', 'ÜST RAFLAR') },
      { t: 'rect', x: 0.34, y: 0.36, w: 0.30, h: 0.13, label: L('BENCH (T.K.)', 'TEZGÂH (T.K.)') },
      { t: 'rect', x: 0.34, y: 0.70, w: 0.22, h: 0.10, label: L('BENCH (J.F.)', 'TEZGÂH (J.F.)') },
      { t: 'rect', x: 0.06, y: 0.55, w: 0.08, h: 0.30, label: L('BOWS', 'YAYLAR') },
      { t: 'rect', x: 0.80, y: 0.76, w: 0.14, h: 0.16, label: L('SINK', 'LAVABO') },
      { t: 'rect', x: 0.74, y: 0.30, w: 0.14, h: 0.05, dashed: true, label: L('LADDER', 'MERDİVEN') },
      { t: 'door', x: 0.96, y: 0.55, r: 0.08, angle: 180 },
      { t: 'door', x: 0.04, y: 0.25, r: 0.07, angle: 0 },
      { t: 'body', x: 0.66, y: 0.50, angle: 20 },
      { t: 'text', x: 0.80, y: 0.62, text: L('BACK →', 'ARKA →') },
      { t: 'text', x: 0.06, y: 0.22, text: L('← OFFICE', '← OFİS') },
    ],
    hotspots: [
      {
        id: 'h-body', label: L('The victim', 'Maktul'), x: 0.66, y: 0.52, reveals: ['ev-body', 'ev-phone'],
        description: L(
          'Thomas Kessler lies on his left side between his bench and the ladder, head towards the tool wall. A single wound above the left ear; little blood. His reading glasses are folded on the bench, not on him. A phone in his apron pocket.',
          'Thomas Kessler tezgâhıyla merdiven arasında sol yanına dönmüş yatıyor, başı alet duvarına dönük. Sol kulağın üstünde tek bir yara; az kan. Okuma gözlüğü üstünde değil, tezgâhın üstünde katlanmış duruyor. Önlüğünün cebinde bir telefon.',
        ),
      },
      {
        id: 'h-ladder', label: L('Library ladder', 'Kütüphane merdiveni'), x: 0.81, y: 0.40, reveals: ['ev-ladder'],
        description: L(
          'A wheeled oak ladder on its side, a metre from the body. It runs on a rail to the upper shelves — tonewood blanks under an even film of dust. The dust on the top two shelves is unbroken.',
          'Cesetten bir metre ötede yan yatmış, tekerlekli meşe bir merdiven. Bir ray boyunca üst raflara uzanıyor — düzgün bir toz tabakası altında tonluk ağaç kütükleri. En üstteki iki rafta toz hiç bozulmamış.',
        ),
      },
      {
        id: 'h-toolwall', label: L('Tool wall', 'Alet duvarı'), x: 0.29, y: 0.18, reveals: ['ev-mallet'],
        description: L(
          'Planes, gouges and six mallets on pegboard, each with a painted outline. The heaviest mallet, lignum vitae, hangs a little crooked on its peg. Its head is noticeably cleaner than the others.',
          'Delikli panoda rendeler, oyma kalemleri ve her birinin boyalı bir silueti olan altı tokmak. En ağırı, gayak ağacından olanı, askısında hafif yamuk duruyor. Başı ötekilerden belirgin biçimde temiz.',
        ),
      },
      {
        id: 'h-bench', label: L('Thomas’s bench', 'Thomas’ın tezgâhı'), x: 0.42, y: 0.42, reveals: ['ev-uvlamp'],
        description: L(
          'An inspection UV lamp is still switched on, aimed at an empty cradle where an instrument would lie. An inspection mirror on a stalk beside it. A tuning fork weighs down a stack of papers.',
          'Bir UV inceleme lambası hâlâ açık; bir çalgının yatacağı boş bir beşiğe çevrilmiş. Yanında saplı bir inceleme aynası. Bir diyapazon bir kâğıt destesini bastırıyor.',
        ),
      },
      {
        id: 'h-papers', label: L('Papers under the tuning fork', 'Diyapazonun altındaki kâğıtlar'), x: 0.58, y: 0.32, reveals: ['ev-note'],
        description: L(
          'Invoices, a varnish supplier’s catalogue — and under them, a sheet torn from a notepad in pencil.',
          'Faturalar, bir vernik tedarikçisinin kataloğu — ve altlarında, bir not defterinden koparılmış, kurşun kalemle yazılmış bir sayfa.',
        ),
      },
      {
        id: 'h-floor', label: L('Floor beneath the bench', 'Tezgâhın altındaki zemin'), x: 0.52, y: 0.56, reveals: ['ev-earring'],
        description: L(
          'Spruce shavings, a dropped peg — and near the victim’s shoulder, a tiny glint of gold.',
          'Ladin talaşları, düşmüş bir burgu — ve maktulün omzunun yanında minicik bir altın parıltısı.',
        ),
      },
      {
        id: 'h-sink', label: L('Cleaning station', 'Temizlik köşesi'), x: 0.87, y: 0.84, reveals: ['ev-rag'],
        description: L(
          'A deep sink, a can of naphtha cleaning spirit under it, a lidded bin. The room smells faintly of solvent. One rag in the bin is damp.',
          'Derin bir lavabo, altında bir bidon temizlik nefti, kapaklı bir çöp kovası. Odada hafif bir çözücü kokusu var. Kovadaki bezlerden biri nemli.',
        ),
      },
      {
        id: 'h-bows', label: L('Bow cabinet', 'Yay vitrini'), x: 0.10, y: 0.70, reveals: ['ev-bowcabinet'],
        description: L(
          'A glazed display cabinet of bows, unlocked. One velvet slot is empty.',
          'Camlı, kilitsiz bir yay vitrini. Kadife yuvalardan biri boş.',
        ),
      },
    ],
  },
  {
    id: 'loc-office', name: L('Front office', 'Ön ofis'),
    summary: L(
      'Panelled reception and office facing Brenner Lane. Desk, filing cabinets, the front door.',
      'Brenner Sokağı’na bakan, ahşap kaplı bir karşılama alanı ve ofis. Masa, dosya dolapları, ön kapı.',
    ),
    plan: [
      { t: 'wall', x1: 0.06, y1: 0.08, x2: 0.94, y2: 0.08 },
      { t: 'wall', x1: 0.94, y1: 0.08, x2: 0.94, y2: 0.92 },
      { t: 'wall', x1: 0.94, y1: 0.92, x2: 0.06, y2: 0.92 },
      { t: 'wall', x1: 0.06, y1: 0.92, x2: 0.06, y2: 0.08 },
      { t: 'rect', x: 0.36, y: 0.38, w: 0.30, h: 0.16, label: L('DESK', 'MASA') },
      { t: 'rect', x: 0.72, y: 0.12, w: 0.18, h: 0.12, label: L('FILES', 'DOSYALAR') },
      { t: 'rect', x: 0.10, y: 0.66, w: 0.20, h: 0.18, label: L('CLIENT SOFA', 'MÜŞTERİ KANEPESİ') },
      { t: 'door', x: 0.50, y: 0.92, r: 0.08, angle: 270 },
      { t: 'door', x: 0.94, y: 0.60, r: 0.07, angle: 180 },
      { t: 'text', x: 0.42, y: 0.98, text: L('BRENNER LANE ↓', 'BRENNER SOKAĞI ↓') },
      { t: 'text', x: 0.78, y: 0.70, text: L('WORKSHOP →', 'ATÖLYE →') },
    ],
    hotspots: [
      {
        id: 'h-desk', label: L('Desk diary', 'Masa ajandası'), x: 0.44, y: 0.44, reveals: ['ev-diary'],
        description: L(
          'A leather week-to-view diary open at Thursday 13 March, in Thomas’s small upright hand.',
          'Deri kaplı, haftalık bir ajanda; 13 Mart Perşembe sayfasında açık. Thomas’ın küçük, dik el yazısı.',
        ),
      },
      {
        id: 'h-drawer', label: L('Desk drawer', 'Masa çekmecesi'), x: 0.60, y: 0.50, reveals: ['ev-consignment'],
        description: L(
          'A folder labelled "ACHTERBERG — G.B.G." on top of the drawer’s contents, recently handled.',
          'Çekmecedekilerin en üstünde, yakın zamanda elden geçmiş, üzerinde “ACHTERBERG — G.B.G.” yazan bir dosya.',
        ),
      },
      {
        id: 'h-files', label: L('Filing cabinet', 'Dosya dolabı'), x: 0.81, y: 0.18, reveals: ['ev-accounts'],
        description: L(
          'Ring binders of quarterly accounts maintained by Clara Kessler. The current year’s binder is thin.',
          'Clara Kessler’in tuttuğu üç aylık hesapların klasörleri. Bu yılın klasörü ince.',
        ),
      },
      {
        id: 'h-frontdoor', label: L('Front door', 'Ön kapı'), x: 0.50, y: 0.86, reveals: ['ev-frontdoor'],
        description: L(
          'Heavy street door with an electronic lock and an interior thumb-turn. Frame and strike plate intact.',
          'Elektronik kilitli, içeriden mandalla açılan ağır bir sokak kapısı. Kasa ve karşılık sacı sağlam.',
        ),
      },
    ],
  },
  {
    id: 'loc-vault', name: L('Vault', 'Kasa odası'),
    summary: L(
      'Climate-controlled strongroom off the workshop. Instruments on consignment in cases on shelves; a sign-out ledger on a lectern.',
      'Atölyeye açılan, iklim kontrollü bir kasa odası. Raflarda kutular içinde konsinye çalgılar; bir kürsünün üstünde çıkış defteri.',
    ),
    plan: [
      { t: 'wall', x1: 0.15, y1: 0.12, x2: 0.85, y2: 0.12 },
      { t: 'wall', x1: 0.85, y1: 0.12, x2: 0.85, y2: 0.88 },
      { t: 'wall', x1: 0.85, y1: 0.88, x2: 0.15, y2: 0.88 },
      { t: 'wall', x1: 0.15, y1: 0.88, x2: 0.15, y2: 0.12 },
      { t: 'rect', x: 0.20, y: 0.16, w: 0.60, h: 0.10, label: L('SHELVES — CONSIGNMENT', 'RAFLAR — KONSİNYE') },
      { t: 'rect', x: 0.20, y: 0.62, w: 0.14, h: 0.14, label: L('LEDGER', 'DEFTER') },
      { t: 'rect', x: 0.48, y: 0.18, w: 0.12, h: 0.06, label: L('G.B.G.', 'G.B.G.') },
      { t: 'door', x: 0.50, y: 0.88, r: 0.08, angle: 270 },
    ],
    hotspots: [
      {
        id: 'h-violincase', label: L('Guadagnini case', 'Guadagnini kutusu'), x: 0.54, y: 0.24, reveals: ['ev-violin'],
        description: L(
          'A rosewood case on the centre shelf, latched. Inside, a violin of deep amber varnish with a two-piece back. It looks exactly as it should.',
          'Orta rafta, mandalı kapalı, gül ağacından bir kutu. İçinde koyu kehribar vernikli, iki parça sırtlı bir keman. Tam olması gerektiği gibi görünüyor.',
        ),
      },
      {
        id: 'h-ledger', label: L('Sign-out ledger', 'Çıkış defteri'), x: 0.27, y: 0.68, reveals: ['ev-ledger'],
        description: L('A ruled book on a lectern: date, instrument, out, in, initials.', 'Kürsüde çizgili bir defter: tarih, çalgı, çıkış, giriş, paraf.'),
      },
    ],
  },
  {
    id: 'loc-back', name: L('Back entrance & courtyard', 'Arka giriş ve avlu'),
    summary: L(
      'Staff entrance off a cobbled courtyard shared with the flats behind. A fob reader that logs every door, coat hooks, bicycle rack.',
      'Arkadaki apartmanla paylaşılan arnavutkaldırımı avluya açılan personel girişi. Her kapıyı kaydeden bir kart okuyucu, askılık, bisiklet park yeri.',
    ),
    plan: [
      { t: 'wall', x1: 0.08, y1: 0.10, x2: 0.50, y2: 0.10 },
      { t: 'wall', x1: 0.50, y1: 0.10, x2: 0.50, y2: 0.90 },
      { t: 'wall', x1: 0.50, y1: 0.90, x2: 0.08, y2: 0.90 },
      { t: 'wall', x1: 0.08, y1: 0.90, x2: 0.08, y2: 0.10 },
      { t: 'rect', x: 0.12, y: 0.14, w: 0.10, h: 0.20, label: L('COATS', 'ASKILIK') },
      { t: 'rect', x: 0.42, y: 0.40, w: 0.06, h: 0.08, label: L('READER', 'OKUYUCU') },
      { t: 'door', x: 0.50, y: 0.50, r: 0.08, angle: 0 },
      { t: 'rect', x: 0.58, y: 0.12, w: 0.36, h: 0.78, dashed: true, label: L('COURTYARD', 'AVLU') },
      { t: 'rect', x: 0.66, y: 0.70, w: 0.20, h: 0.08, label: L('BIKE RACK', 'BİSİKLET PARKI') },
      { t: 'text', x: 0.62, y: 0.08, text: L('FLATS (VARGA, 1st FLOOR) ↑', 'DAİRELER (VARGA, 1. KAT) ↑') },
    ],
    hotspots: [
      {
        id: 'h-reader', label: L('Access-control reader', 'Geçiş kontrol okuyucusu'), x: 0.45, y: 0.44, reveals: ['ev-accesspanel'],
        description: L(
          'A fob reader by the back door and an exit button inside. The controller box on the wall carries a supplier’s sticker: "HALSEC — event log retained 90 days".',
          'Arka kapının yanında bir kart okuyucu, içeride bir çıkış butonu. Duvardaki kontrol kutusunda tedarikçinin etiketi var: “HALSEC — olay kaydı 90 gün saklanır”.',
        ),
      },
      {
        id: 'h-courtyard', label: L('Courtyard', 'Avlu'), x: 0.76, y: 0.50, reveals: ['ev-tracks'],
        description: L(
          'Overnight frost on the cobbles. Thin bicycle-tyre marks run from the lane to the bike rack and back out, crossing older footprints.',
          'Arnavutkaldırımında gece kırağısı. İnce bisiklet lastiği izleri sokaktan park yerine gidip geri dönüyor, eski ayak izlerinin üstünden geçiyor.',
        ),
      },
    ],
  },

  // ── wave 4: optional places. Each costs a trip and pays in a side deduction or a shortcut, never in the core chain.
  {
    id: 'loc-varga', name: L('Ilse Varga’s flat', 'Ilse Varga’nın dairesi'),
    summary: L(
      'First floor across the courtyard. A retired schoolteacher’s kitchen with a view of the workshop’s back door — and of the landlord’s new lamp.',
      'Avlunun karşısında, birinci kat. Emekli bir öğretmenin mutfağı; atölyenin arka kapısını görüyor — ev sahibinin yeni lambasını da.',
    ),
    plan: [
      { t: 'wall', x1: 0.1, y1: 0.12, x2: 0.9, y2: 0.12 },
      { t: 'wall', x1: 0.9, y1: 0.12, x2: 0.9, y2: 0.88 },
      { t: 'wall', x1: 0.9, y1: 0.88, x2: 0.1, y2: 0.88 },
      { t: 'wall', x1: 0.1, y1: 0.88, x2: 0.1, y2: 0.12 },
      { t: 'rect', x: 0.3, y: 0.14, w: 0.4, h: 0.08, label: L('WINDOW', 'PENCERE') },
      { t: 'rect', x: 0.6, y: 0.55, w: 0.22, h: 0.18, label: L('TABLE', 'MASA') },
      { t: 'text', x: 0.3, y: 0.08, text: L('COURTYARD ↑', 'AVLU ↑') },
    ],
    hotspots: [],
  },
  {
    id: 'loc-clara', name: L('Clara’s flat, Vesterlund', 'Clara’nın dairesi, Vesterlund'),
    summary: L(
      'A tidy two-room flat seven minutes’ drive from the workshop. The search warrant covers the flat and the car.',
      'Atölyeye arabayla yedi dakika uzaklıkta, derli toplu iki odalı bir daire. Arama izni daireyi ve arabayı kapsıyor.',
    ),
    plan: [
      { t: 'wall', x1: 0.08, y1: 0.1, x2: 0.92, y2: 0.1 },
      { t: 'wall', x1: 0.92, y1: 0.1, x2: 0.92, y2: 0.9 },
      { t: 'wall', x1: 0.92, y1: 0.9, x2: 0.08, y2: 0.9 },
      { t: 'wall', x1: 0.08, y1: 0.9, x2: 0.08, y2: 0.1 },
      { t: 'wall', x1: 0.5, y1: 0.1, x2: 0.5, y2: 0.6 },
      { t: 'rect', x: 0.12, y: 0.66, w: 0.14, h: 0.18, label: L('HALL', 'ANTRE') },
      { t: 'rect', x: 0.6, y: 0.2, w: 0.26, h: 0.18, label: L('BEDROOM', 'YATAK ODASI') },
      { t: 'rect', x: 0.16, y: 0.2, w: 0.26, h: 0.12, label: L('DESK', 'ÇALIŞMA MASASI') },
      { t: 'door', x: 0.08, y: 0.75, r: 0.07, angle: 0 },
    ],
    hotspots: [],
    // opened by a search warrant once she is placed at the scene (The late visitor)
    v2: { locked: true, travel: 45 },
  },
  {
    id: 'loc-bank', name: L('Nordbank — business desk', 'Nordbank — ticari krediler masası'),
    summary: L(
      'The bank that lent Kessler Strings €900,000. “Bank?? (C.)” in Thomas’s diary was enough for the adviser to open the file.',
      'Kessler Strings’e 900.000 € kredi veren banka. Thomas’ın ajandasındaki “Banka?? (C.)” satırı, kredi uzmanının dosyayı açması için yetti.',
    ),
    plan: [
      { t: 'wall', x1: 0.1, y1: 0.15, x2: 0.9, y2: 0.15 },
      { t: 'wall', x1: 0.9, y1: 0.15, x2: 0.9, y2: 0.85 },
      { t: 'wall', x1: 0.9, y1: 0.85, x2: 0.1, y2: 0.85 },
      { t: 'wall', x1: 0.1, y1: 0.85, x2: 0.1, y2: 0.15 },
      { t: 'rect', x: 0.35, y: 0.4, w: 0.3, h: 0.14, label: L('ADVISER', 'UZMAN') },
    ],
    hotspots: [],
    requires: { facts: ['f-diary-bank'] },
    v2: { travel: 45 },
  },
  {
    id: 'loc-pawn', name: L('Kaiser Pfand, Hafenstraße', 'Kaiser Pfand, Hafenstraße'),
    summary: L(
      'A pawnshop by the harbour that opens at nine. Every pledge goes into a book and, eventually, into the police registry.',
      'Limanın yanında, dokuzda açılan bir rehinci. Her rehin bir deftere, er geç de emniyetin kayıtlarına geçiyor.',
    ),
    plan: [
      { t: 'wall', x1: 0.12, y1: 0.15, x2: 0.88, y2: 0.15 },
      { t: 'wall', x1: 0.88, y1: 0.15, x2: 0.88, y2: 0.85 },
      { t: 'wall', x1: 0.88, y1: 0.85, x2: 0.12, y2: 0.85 },
      { t: 'wall', x1: 0.12, y1: 0.85, x2: 0.12, y2: 0.15 },
      { t: 'rect', x: 0.3, y: 0.5, w: 0.4, h: 0.1, label: L('COUNTER', 'TEZGÂH') },
    ],
    hotspots: [],
    // the bow is missing: a pawnshop is the obvious first stop (the registry search and the night ping are the others)
    requires: { evidence: ['ev-bowcabinet'] },
    v2: { travel: 45 },
  },
];

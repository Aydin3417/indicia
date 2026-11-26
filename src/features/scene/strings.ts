// Scene strings. Flat keys, each already carrying the `scene.` prefix, so the shell can spread them into its
// dictionaries: `{ ...base.en, ...sceneStrings.en }`. Placeholders look like {n} and are filled by `fmt()`.

const en = {
  'scene.exit': 'Leave the scene',
  'scene.exitShort': 'Leave',
  'scene.day': 'Day {d}/{n}',
  'scene.spotsLeft': '{n} spots left',
  'scene.spotsLeft1': '1 spot left',
  'scene.spotsDone': 'All spots examined',
  'scene.left': '{t} left today',
  'scene.leftShort': '{t} left',
  'scene.hm': '{h} h {m} min',
  'scene.h': '{h} h',
  'scene.min': '{m} min',
  'scene.spent': '−{m} min',
  'scene.free': 'free',
  'scene.notebook': 'Notebook',
  'scene.zoomIn': 'Zoom in',
  'scene.zoomOut': 'Zoom out',

  'scene.tool.torch': 'Torch',
  'scene.tool.uv': 'UV lamp',
  'scene.tool.dust': 'Powder',
  'scene.tool.camera': 'Camera',
  'scene.toolIn.uv': 'under UV',
  'scene.toolIn.dust': 'with powder',
  'scene.toolIn.camera': 'on camera',

  'scene.hint.torch': 'Sweep the light. Tap what catches your eye.',
  'scene.hint.uv': 'Tap a spot to search it under UV.',
  'scene.hint.dust': 'Brush powder over a surface with your finger.',
  'scene.hint.camera': 'The camera is for details. Open a close-up first.',
  'scene.hint.closeup': 'Tap whatever looks out of place.',

  'scene.cost.closeUp': 'Close-up',
  'scene.cost.probe': '{a}, {b} if something shows',
  'scene.cost.tool': 'Tool use',
  'scene.cost.reopen': 'Already seen — free',
  'scene.cost.look': 'Looking closer · free',

  'scene.do.examine': 'Examine',
  'scene.do.open': 'Open',
  'scene.do.uv': 'Search under UV',
  'scene.do.dust': 'Check for prints',
  'scene.do.photo': 'Take the photo',
  'scene.do.detailTool': 'Look {tool}',
  'scene.do.cancel': 'Not now',

  'scene.target.here': 'This spot',
  'scene.target.powder': 'The dusted patch',

  'scene.msg.nothing': 'Nothing here worth a closer look.',
  'scene.msg.cameraMain': 'Nothing to photograph from here. Get closer first.',
  'scene.msg.brushMore': 'Brush a little more to cover the surface.',
  'scene.msg.hit': 'Something shows up.',
  'scene.msg.noTime': 'Not enough time left today for that.',
  'scene.msg.dayOver': 'The day is over. Leave the scene and close the day.',
  'scene.msg.dayOverTeam': 'Your time is up for today. Leave the scene and press “I’m done for today”.',
  'scene.msg.newFact': 'New fact',
  'scene.msg.newEvidence': 'New evidence',
  'scene.msg.alreadyFound': 'You have this already.',

  'scene.err.generic': 'That didn’t work. Try again.',
  'scene.err.needs_tool': 'Not like this. Something else would show it.',
  'scene.err.needs_dust': 'The torch won’t show this. Pick Powder below and tap it again.',
  'scene.err.needs_uv': 'Not under this light. Pick UV lamp below and tap it again.',
  'scene.err.not_here': 'You are not at this place right now.',
  'scene.err.no_time': 'Not enough time left today for that.',
  'scene.err.phase': 'The investigation is past this point.',
  'scene.err.locked': 'You can’t get at that yet.',

  'scene.closeup.back': 'Back to the room',
  'scene.closeup.found': 'Found here',
  'scene.closeup.nothingMore': 'Nothing else catches your eye.',
  'scene.closeup.something': 'Something here',

  'scene.empty': 'There is nothing to search here.',

  'scene.dev.title': 'Scene workbench',
  'scene.dev.loading': 'Opening the case…',
  'scene.dev.failed': 'Could not reach the API at {url}.',
  'scene.dev.retry': 'Try again',
  'scene.dev.restart': 'Fresh session',
  'scene.dev.travel': 'Go there',
  'scene.dev.endDay': 'End the day',
  'scene.dev.language': 'Language',
  'scene.dev.notebook': 'Notebook',
  'scene.dev.places': 'Places',
  'scene.dev.enter': 'Search this place',
} as const;

export type SceneStringKey = keyof typeof en;

const tr: Record<SceneStringKey, string> = {
  'scene.exit': 'Olay yerinden çık',
  'scene.exitShort': 'Çık',
  'scene.day': 'Gün {d}/{n}',
  'scene.spotsLeft': '{n} yer kaldı',
  'scene.spotsLeft1': '1 yer kaldı',
  'scene.spotsDone': 'Her yere bakıldı',
  'scene.left': 'Bugün {t} kaldı',
  'scene.leftShort': '{t} kaldı',
  'scene.hm': '{h} sa {m} dk',
  'scene.h': '{h} sa',
  'scene.min': '{m} dk',
  'scene.spent': '−{m} dk',
  'scene.free': 'ücretsiz',
  'scene.notebook': 'Defter',
  'scene.zoomIn': 'Yakınlaştır',
  'scene.zoomOut': 'Uzaklaştır',

  'scene.tool.torch': 'Fener',
  'scene.tool.uv': 'UV lamba',
  'scene.tool.dust': 'Toz',
  'scene.tool.camera': 'Kamera',
  'scene.toolIn.uv': 'UV ışığında',
  'scene.toolIn.dust': 'Tozlayarak',
  'scene.toolIn.camera': 'Fotoğrafla',

  'scene.hint.torch': 'Işığı gezdir. Gözüne takılana dokun.',
  'scene.hint.uv': 'UV ile bakmak istediğin yere dokun.',
  'scene.hint.dust': 'Parmağınla bir yüzeye toz sür.',
  'scene.hint.camera': 'Kamera ayrıntılar için. Önce yakından bak.',
  'scene.hint.closeup': 'Yerine oturmayan neyse ona dokun.',

  'scene.cost.closeUp': 'Yakın plan',
  'scene.cost.probe': '{a}, bir şey çıkarsa {b}',
  'scene.cost.tool': 'Alet kullanımı',
  'scene.cost.reopen': 'Bakılmıştı, açmak ücretsiz',
  'scene.cost.look': 'Yakından bakmak · ücretsiz',

  'scene.do.examine': 'İncele',
  'scene.do.open': 'Aç',
  'scene.do.uv': 'UV ile ara',
  'scene.do.dust': 'İz var mı bak',
  'scene.do.photo': 'Fotoğrafını çek',
  'scene.do.detailTool': '{tool} bak',
  'scene.do.cancel': 'Şimdi değil',

  'scene.target.here': 'Şurası',
  'scene.target.powder': 'Tozlanan yer',

  'scene.msg.nothing': 'Burada yakından bakmaya değer bir şey yok.',
  'scene.msg.cameraMain': 'Buradan çekilecek bir şey yok. Önce yaklaş.',
  'scene.msg.brushMore': 'Yüzeyi kaplamak için biraz daha sür.',
  'scene.msg.hit': 'Bir şey beliriyor.',
  'scene.msg.noTime': 'Bugün buna yetecek vakit kalmadı.',
  'scene.msg.dayOver': 'Gün bitti. Olay yerinden çıkıp günü kapat.',
  'scene.msg.dayOverTeam': 'Bugünlük vaktin doldu. Olay yerinden çık ve “Bugünlük bu kadar” de.',
  'scene.msg.newFact': 'Yeni bulgu',
  'scene.msg.newEvidence': 'Yeni delil',
  'scene.msg.alreadyFound': 'Bu zaten sende.',

  'scene.err.generic': 'Olmadı. Bir daha dene.',
  'scene.err.needs_tool': 'Böyle değil. Bunu başka bir şey gösterir.',
  'scene.err.needs_dust': 'Fener bunu göstermez. Aşağıdan Toz’u seç, bir daha dokun.',
  'scene.err.needs_uv': 'Bu ışıkta görünmez. Aşağıdan UV lambayı seç, bir daha dokun.',
  'scene.err.not_here': 'Şu an burada değilsin.',
  'scene.err.no_time': 'Bugün buna yetecek vakit kalmadı.',
  'scene.err.phase': 'Soruşturma bu aşamayı geçti.',
  'scene.err.locked': 'Buna henüz ulaşamıyorsun.',

  'scene.closeup.back': 'Odaya dön',
  'scene.closeup.found': 'Burada bulunanlar',
  'scene.closeup.nothingMore': 'Başka bir şey gözüne çarpmıyor.',
  'scene.closeup.something': 'Burada bir şey var',

  'scene.empty': 'Burada aranacak bir şey yok.',

  'scene.dev.title': 'Olay yeri tezgâhı',
  'scene.dev.loading': 'Dosya açılıyor…',
  'scene.dev.failed': '{url} adresindeki API’ye ulaşılamadı.',
  'scene.dev.retry': 'Tekrar dene',
  'scene.dev.restart': 'Yeni oturum',
  'scene.dev.travel': 'Oraya git',
  'scene.dev.endDay': 'Günü kapat',
  'scene.dev.language': 'Dil',
  'scene.dev.notebook': 'Defter',
  'scene.dev.places': 'Yerler',
  'scene.dev.enter': 'Burayı ara',
};

export const sceneStrings: { en: Record<SceneStringKey, string>; tr: Record<SceneStringKey, string> } = { en, tr };

/** Fill `{name}` placeholders. */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Wrap the shell's `t` so a missing key falls back to the English scene string instead of showing the key. */
export function withFallback(t: (key: string) => string): (key: SceneStringKey) => string {
  return (key) => {
    const v = t(key);
    return !v || v === key ? en[key] : v;
  };
}

/** "5 h 30 min" / "5 sa 30 dk" from minutes. */
export function duration(tt: (key: SceneStringKey) => string, minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return fmt(tt('scene.min'), { m: r });
  if (r === 0) return fmt(tt('scene.h'), { h });
  return fmt(tt('scene.hm'), { h, m: r });
}

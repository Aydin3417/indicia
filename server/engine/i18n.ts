// SERVER-ONLY. Localisation: content strings are { en, tr }; the server sends one language only.
import type { Locale, Text } from './types.ts';

export const LOCALES: Locale[] = ['en', 'tr'];

/** Resolve a content string. Missing Turkish (draft content) falls back to English. */
export function tx(t: Text | undefined, locale: Locale): string {
  if (t === undefined) return '';
  if (typeof t === 'string') return t;
  return (locale === 'tr' ? t.tr || t.en : t.en) ?? '';
}

export const txs = (list: Text[] | undefined, locale: Locale): string[] => (list ?? []).map((t) => tx(t, locale));

/** All language variants of a string (for checks like guarded terms). */
export function variants(t: Text | undefined): string[] {
  if (t === undefined) return [];
  if (typeof t === 'string') return [t];
  return [t.en, t.tr].filter((x): x is string => !!x);
}

/** Accept-Language → locale. Only the first language that we support counts. */
export function localeFromHeader(header: string | undefined | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.map((p) => /^q=([\d.]+)$/.exec(p.trim())).find(Boolean);
      return { tag, q: q ? Number(q[1]) : 1, i };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const r of ranked) {
    const base = r.tag.split('-')[0];
    if (base === 'tr' || base === 'en') return base;
  }
  return undefined;
}

export const isLocale = (v: unknown): v is Locale => v === 'en' || v === 'tr';

// ───────────────────────────────────────────── document markup
// Evidence body lines may mark phrases that become facts when tapped:
//   {{f-id|phrase}}   underlined (the player sees it is important)
//   {{?f-id|phrase}}  unmarked (the player has to notice it)

export interface MarkupSegment {
  text: string;
  factId?: string;
  subtle?: boolean;
  /** n-th marked phrase in this line */
  n?: number;
}

const MARK = /\{\{(\?)?([a-zA-Z0-9_-]+)\|([^}]*)\}\}/g;

export function parseMarkup(line: string): MarkupSegment[] {
  const out: MarkupSegment[] = [];
  let last = 0;
  let n = 0;
  for (const m of line.matchAll(MARK)) {
    if (m.index! > last) out.push({ text: line.slice(last, m.index) });
    out.push({ text: m[3], factId: m[2], subtle: !!m[1], n: n++ });
    last = m.index! + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

export const stripMarkup = (line: string): string => line.replace(MARK, (_m, _q, _id, phrase: string) => phrase);

/** Fact ids marked in a line, in order. */
export const markedFacts = (line: string): string[] => [...line.matchAll(MARK)].map((m) => m[2]);

// ───────────────────────────────────────────── system strings (engine-authored, not case content)

const S = {
  // errors
  no_time: { en: 'Not enough time left today. End the day.', tr: 'Bugün buna yetecek vakit kalmadı. Günü kapat.' },
  not_here: { en: 'You are not there. Travel first.', tr: 'Orada değilsin. Önce oraya git.' },
  unavailable: { en: 'Not available at this hour.', tr: 'Bu saatte görüşmeye müsait değil.' },
  refused: { en: 'They will not talk to you again today.', tr: 'Bugün seninle bir daha konuşmayacak.' },
  not_open: { en: 'Start the interview first.', tr: 'Önce görüşmeyi başlat.' },
  lab_full: { en: 'The lab is already working on two items. Wait for a result.', tr: 'Laboratuvarın iki hattı da dolu. Bir sonucun çıkmasını bekle.' },
  phase_finale: { en: 'The confrontation has started. The investigation is closed.', tr: 'Yüzleşme başladı. Soruşturma kapandı.' },
  phase_awaiting: { en: 'Your time is up. Read what came in overnight, file what you can, then see the prosecutor.', tr: 'Süren doldu. Gece gelenleri oku, dosyalayabildiğini dosyala, sonra savcının karşısına çık.' },
  nothing_to_press: { en: 'Nothing more to draw out of that. Present proof against it, or move on.', tr: 'Bundan daha fazlası çıkmaz. Ya karşısına kanıt koy ya da geç.' },
  press_later: { en: 'Not yet. You need to know more before this goes anywhere.', tr: 'Henüz değil. Bunun üstüne gitmek için önce daha fazlasını bilmelisin.' },
  wait_nothing: { en: 'There is nothing to wait for right now.', tr: 'Şu an beklenecek bir şey yok.' },
  wait_bad: { en: 'Wait between 15 minutes and 4 hours.', tr: '15 dakika ile 4 saat arası bekleyebilirsin.' },
  late_limit: { en: 'No more guesses on this one before the prosecutor.', tr: 'Savcıya çıkmadan önce bu soruda başka tahmin hakkın yok.' },
  nudge_one: { en: 'Look again at “{0}”; the rest holds.', tr: '“{0}” boşluğuna bir daha bak; gerisi tutuyor.' },
  nudge_many: { en: 'More than one blank is off. Start with “{0}”.', tr: 'Birden fazla boşluk yanlış. İşe “{0}” ile başla.' },
  nudge_outlier: { en: 'Look again at the card you set aside.', tr: 'Ayırdığın karta bir daha bak.' },
  nudge_order: { en: 'The card you set aside is right; the order is not.', tr: 'Ayırdığın kart doğru; sıra tutmuyor.' },
  blank_generic: { en: 'this blank', tr: 'bu boşluk' },
  phase_closed: { en: 'This case is closed.', tr: 'Bu dosya kapandı.' },
  not_host: { en: 'In a shared investigation only the lead investigator does this.', tr: 'Ortak soruşturmada bunu yalnız baş müfettiş yapar.' },
  claim_closed: { en: 'That claim is no longer on the table.', tr: 'Bu iddia artık masada değil.' },
  not_owned: { en: 'That is not in your notebook.', tr: 'Bu senin defterinde yok.' },
  locked: { en: 'Not available yet.', tr: 'Henüz açık değil.' },
  unknown: { en: 'Nothing there.', tr: 'Orada bir şey yok.' },
  already: { en: 'Already done.', tr: 'Bu zaten yapıldı.' },
  needs_tool: { en: 'You need the right tool for that.', tr: 'Bunun için doğru alet gerekiyor.' },
  bad_fill: { en: 'Fill every blank.', tr: 'Tüm boşlukları doldur.' },
  // outcomes
  probe_miss_uv: { en: 'Nothing fluoresces here.', tr: 'Burada ışıyan bir şey yok.' },
  probe_miss_dust: { en: 'The powder shows nothing here.', tr: 'Toz burada hiçbir şey göstermiyor.' },
  press_nothing: { en: 'That is all I have to say about it.', tr: 'Bu konuda söyleyeceğim bu kadar.' },
  resist_2: { en: 'You’re close to something. You’re not there.', tr: 'Bir şeye yaklaşıyorsunuz. Ama henüz değil.' },
  resist_3: { en: 'That doesn’t change what I said. Not on its own.', tr: 'Bu, söylediğimi değiştirmez. Tek başına değiştirmez.' },
  wrong_present: { en: 'And? That proves nothing.', tr: 'Ee? Bu hiçbir şey kanıtlamıyor.' },
  patience_out: { en: 'The interview is over for today.', tr: 'Bugünlük görüşme bitti.' },
  resist_default: { en: 'That is not enough to make me say otherwise.', tr: 'Sözümden dönmem için bu yetmez.' },
  deduction_wrong: { en: 'It doesn\'t hold.', tr: 'Tutmuyor.' },
  hint_none: { en: 'No further guidance. Trust the evidence.', tr: 'Başka yol gösteremem. Kanıtlara güven.' },
  lab_ready: { en: 'Lab result ready', tr: 'Laboratuvar sonucu hazır' },
  // finale
  finale_wrong: { en: 'Not good enough. Try again.', tr: 'Yetmez. Bir daha dene.' },
  verdict_confession: { en: 'Confession', tr: 'İtiraf' },
  verdict_charged: { en: 'Charged — the case holds', tr: 'İddianame hazır — dava sağlam' },
  verdict_weak: { en: 'Right name, weak case', tr: 'Doğru isim, zayıf dava' },
  verdict_wrongful: { en: 'Wrongful accusation', tr: 'Haksız suçlama' },
  verdict_detail_confession: { en: 'Every defence fell. The accused confessed.', tr: 'Bütün savunmalar çöktü. Sanık itiraf etti.' },
  verdict_detail_charged: { en: 'Motive, means and opportunity, each anchored in evidence.', tr: 'Saik, araç ve fırsat; her biri kanıta bağlı.' },
  verdict_detail_weak: { en: 'You named the killer, but the defence found room.', tr: 'Katili doğru buldun ama savunma bir açık yakaladı.' },
  verdict_detail_wrongful: { en: 'You accused the wrong person. The real killer is still free.', tr: 'Yanlış kişiyi suçladın. Asıl katil hâlâ dışarıda.' },
  // case-aware wording (meta.crime): a theft has a thief, not a killer
  verdict_detail_weak_theft: { en: 'You named the thief, but the defence found room.', tr: 'Hırsızı doğru buldun ama savunma bir açık yakaladı.' },
  verdict_detail_wrongful_theft: { en: 'You accused the wrong person. The real thief walks free, and what was taken is still missing.', tr: 'Yanlış kişiyi suçladın. Asıl hırsız elini kolunu sallayarak dolaşıyor; çalınan da hâlâ kayıp.' },
  // wave 7: an arson has someone who set the fire — nobody was killed
  verdict_detail_weak_arson: { en: 'You named the one who set the fire, but the defence found room.', tr: 'Yangını çıkaranı doğru buldun ama savunma bir açık yakaladı.' },
  verdict_detail_wrongful_arson: { en: 'You accused the wrong person. Whoever set the fire walks free, and the ashes keep their secret.', tr: 'Yanlış kişiyi suçladın. Yangını çıkaran elini kolunu sallayarak dolaşıyor; kül de sırrını saklıyor.' },
  // wave 7: an open deduction card that the notebook cannot complete yet (PLAYTEST_V4 §7.6)
  deduction_not_yet: { en: 'Not yet: something this question needs is not in your notebook. Keep investigating before you file.', tr: 'Henüz değil: bu sorunun istediği bir şey defterinde yok. Dosyalamadan önce araştırmaya devam et.' },
  // co-op (wave 5)
  private_first: { en: 'That is still only in your own notes. Read it out to the team first (it is free).', tr: 'Bu hâlâ yalnızca senin notlarında. Önce ekibe oku (ücretsiz).' },
  not_private: { en: 'Nothing like that in your private notes.', tr: 'Özel notlarında böyle bir şey yok.' },
  held: { en: '{0} is questioning them right now. Follow along, or take someone else.', tr: 'Şu an {0} sorguluyor. İzleyebilir ya da başka birine geçebilirsin.' },
  no_suggest: { en: 'Suggestions are for the confrontation, while a round is open.', tr: 'Öneri yalnızca yüzleşmede, açık bir tur varken yapılır.' },
  not_member: { en: 'That investigator is not in this room.', tr: 'Bu müfettiş bu odada değil.' },
  lead_online: { en: 'The lead investigator is still here. Ask them to hand over.', tr: 'Baş müfettiş hâlâ burada. Görevi devretmesini iste.' },
  act_share: { en: 'read out to the team: {0}', tr: 'ekibe okudu: {0}' },
  act_share_left: { en: 'left their notes on the desk ({0})', tr: 'notlarını masaya bıraktı ({0})' },
  act_handover: { en: 'is now the lead investigator', tr: 'artık baş müfettiş' },
  act_done: { en: 'is done for today', tr: 'bugünlük işini bitirdi' },
  act_day_all: { en: 'everyone is done: day {0} is over', tr: 'herkes işini bitirdi: {0}. gün kapandı' },
  act_intent_go: { en: 'is heading to {0}', tr: '{0} yolunda' },
  act_intent_interview: { en: 'will question {0}', tr: 'sorgulayacak: {0}' },
  act_intent_lab: { en: 'is waiting for the lab: {0}', tr: 'laboratuvarı bekliyor: {0}' },
  act_draft: { en: 'pencilled in a deduction: {0}', tr: 'bir çıkarımı karaladı: {0}' },
  act_suggest: { en: 'suggested a chip for {0}', tr: 'şuna bir öneri bıraktı: {0}' },
  act_finale_suggest: { en: 'suggests: {0}', tr: 'öneriyor: {0}' },
  // night forks
  no_fork: { en: 'No decision is waiting from last night.', tr: 'Dün geceden bekleyen bir karar yok.' },
  // activity (shared investigations)
  act_travel: { en: 'went to {0}', tr: '{0} yolunu tuttu' },
  act_inspect: { en: 'inspected {0}', tr: 'inceledi: {0}' },
  act_detail: { en: 'found a detail: {0}', tr: 'bir ayrıntı buldu: {0}' },
  act_fact: { en: 'noted a finding', tr: 'bir bulgu not etti' },
  act_lab: { en: 'sent {0} to the lab', tr: 'laboratuvara gönderdi: {0}' },
  act_lab_collect: { en: 'collected lab results', tr: 'laboratuvar sonuçlarını aldı' },
  act_interview: { en: 'started questioning {0}', tr: 'sorguya başladı: {0}' },
  act_break: { en: 'broke a claim by {0}', tr: 'bir iddiayı çürüttü: {0}' },
  act_deduce: { en: 'confirmed a deduction', tr: 'bir çıkarımı doğruladı' },
  act_day: { en: 'ended day {0}', tr: '{0}. günü kapattı' },
  act_finale: { en: 'began the confrontation with {0}', tr: 'yüzleşmeyi başlattı: {0}' },
  act_hint: { en: 'asked the desk sergeant for a pointer', tr: 'nöbetçi komiserden ipucu istedi' },
  former_member: { en: 'Former member', tr: 'Eski üye' },
  // wave 8: the default display name every new profile gets, shown in the viewer's language (co-op rooms, team, log)
  default_investigator: { en: 'Investigator', tr: 'Müfettiş' },
  act_open: { en: 'opened the room', tr: 'odayı açtı' },
  act_join: { en: 'joined the investigation', tr: 'soruşturmaya katıldı' },
  act_left: { en: 'left the room', tr: 'odadan ayrıldı' },
  act_lock: { en: 'locked the room', tr: 'odayı kilitledi' },
  act_unlock: { en: 'reopened the room', tr: 'odayı yeniden açtı' },
  act_remove: { en: 'removed {0} from the room', tr: '{0} adlı kişiyi odadan çıkardı' },
  // ranks (grow with the best stars per case)
  rank_0: { en: 'Trainee Investigator', tr: 'Stajyer Müfettiş' },
  rank_1: { en: 'Junior Detective', tr: 'Komiser Yardımcısı' },
  rank_2: { en: 'Detective', tr: 'Komiser' },
  rank_3: { en: 'Senior Detective', tr: 'Başkomiser' },
  rank_4: { en: 'Lead Investigator', tr: 'Emniyet Amiri' },
  rank_5: { en: 'Chief Investigator', tr: 'Emniyet Müdürü' },
  // refusals outside the engine
  quota_free: { en: 'You have used today’s free questions. Detective Plus raises the limit.', tr: 'Bugünkü ücretsiz soru hakkını kullandın. Detective Plus bu sınırı yükseltir.' },
  quota_plus: { en: 'Daily question limit reached. It resets at midnight UTC.', tr: 'Günlük soru sınırına ulaştın. Gece yarısı (UTC) sıfırlanır.' },
  // reports
  station: { en: 'Station', tr: 'Emniyet' },
  day_title: { en: 'Day {0}', tr: '{0}. gün' },
} as const satisfies Record<string, { en: string; tr: string }>;

export type SysKey = keyof typeof S;
/** Every system string key (for optional, case-specific variants such as `verdict_detail_weak_theft`). */
export const SYS_KEYS: Readonly<Record<string, unknown>> = S;

export function sys(key: SysKey, locale: Locale, ...args: (string | number)[]): string {
  let s: string = S[key][locale];
  args.forEach((a, i) => (s = s.replace(`{${i}}`, String(a))));
  return s;
}

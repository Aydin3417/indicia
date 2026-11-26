// The notebook: facts (grouped by person / time / source), evidence documents with collectable phrases,
// and people. In `pick` mode every fact / evidence / person row is a choice for `onPick` (the finale,
// the interview's "present" and the deduction book use it as their picker).
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { itemArt, altOf } from '../../art';
import { FaceCrop, Textured } from '../../art/components';
import type { ChipType, ChipView, EvidenceV2View, FactView, InvestigationView, Segment } from '../../../shared/api';
import { color, font, radius, space } from '../../theme/tokens';
import { Btn, Eyebrow, LangRoot, MoreText, NewDot, Rise, feel, fmt } from '../deduction/kit';
import { isOk, type Act, type Translate } from '../deduction/types';
import { playSound } from '../../sound';

export type NotebookTab = 'facts' | 'evidence' | 'people';
type GroupBy = 'person' | 'time' | 'source';

export interface NotebookProps {
  view: InvestigationView;
  act: Act;
  t: Translate;
  onPick?: (chip: ChipView) => void;
  mode?: 'browse' | 'pick';
  /** pick mode: which chip types can be picked (default fact, evidence, person) */
  accept?: ChipType[];
  initialTab?: NotebookTab;
  /** render without its own vertical ScrollView (when placed inside another scroll view) */
  embedded?: boolean;
}

export function Notebook({ view, act, t, onPick, mode = 'browse', accept = ['fact', 'evidence', 'person'], initialTab = 'facts', embedded }: NotebookProps) {
  const picking = mode === 'pick' && !!onPick;
  const all: NotebookTab[] = ['facts', 'evidence', 'people'];
  const tabs = !picking ? all : all.filter((tb) => accept.includes(tb === 'facts' ? 'fact' : tb === 'evidence' ? 'evidence' : 'person'));
  const [tab, setTab] = useState<NotebookTab>(tabs.includes(initialTab) ? initialTab : tabs[0] ?? 'facts');
  const [person, setPerson] = useState<string | null>(null);
  const [doc, setDoc] = useState<string | null>(null);

  const evidence = doc ? view.notebook.evidence.find((e) => e.id === doc) : undefined;
  if (evidence) {
    return <LangRoot lang={view.locale}><DocumentReader view={view} ev={evidence} act={act} t={t} onBack={() => setDoc(null)} onPick={picking && accept.includes('evidence') ? onPick : undefined} /></LangRoot>;
  }

  const counts: Record<NotebookTab, number> = {
    facts: view.notebook.facts.length,
    evidence: view.notebook.evidence.length,
    people: view.chips.people.length,
  };
  const newCounts: Record<NotebookTab, number> = {
    facts: view.notebook.facts.filter((f) => f.isNew).length,
    evidence: view.notebook.evidence.filter((e) => e.isNew).length,
    people: 0,
  };

  return (
    <LangRoot lang={view.locale} style={embedded ? { flex: 0 } : null}>
      <View style={s.tabs} accessibilityRole="tablist">
        {tabs.map((tb) => (
          <Pressable
            key={tb}
            onPress={() => { feel('light'); setTab(tb); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === tb }}
            style={[s.tab, tab === tb && s.tabOn]}
          >
            <Text style={[s.tabText, tab === tb && { color: color.text }]}>{t(`notebook.tab.${tb}`)}</Text>
            <Text style={[s.tabCount, newCounts[tb] ? { color: color.burgundyBright } : null]}>{newCounts[tb] ? `+${newCounts[tb]}` : counts[tb]}</Text>
          </Pressable>
        ))}
      </View>
      {picking ? <Text style={s.pickHint}>{t('notebook.pickHint')}</Text> : null}
      <Scroller embedded={embedded}>
        {tab === 'facts' ? (
          <Facts view={view} act={act} t={t} person={person} setPerson={setPerson} onPick={picking && accept.includes('fact') ? onPick : undefined} />
        ) : tab === 'evidence' ? (
          <EvidenceList view={view} act={act} t={t} onOpen={setDoc} onPick={picking && accept.includes('evidence') ? onPick : undefined} />
        ) : (
          <People view={view} t={t} onPick={picking && accept.includes('person') ? onPick : undefined} onFilter={(id) => { setPerson(id); setTab('facts'); }} />
        )}
      </Scroller>
    </LangRoot>
  );
}

function Scroller({ embedded, children }: { embedded?: boolean; children: ReactNode }) {
  if (embedded) return <View style={s.page}>{children}</View>;
  return <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

// ─────────────────────────────────────────────────────────── facts

function Facts({ view, act, t, person, setPerson, onPick }: {
  view: InvestigationView; act: Act; t: Translate; person: string | null; setPerson: (p: string | null) => void; onPick?: (c: ChipView) => void;
}) {
  const [group, setGroup] = useState<GroupBy>('person');
  const names = useMemo(() => new Map(view.chips.people.map((p) => [p.id, p.label] as const)), [view.chips.people]);
  const facts = person ? view.notebook.facts.filter((f) => f.about.includes(person)) : view.notebook.facts;
  const withFacts = view.chips.people.filter((p) => view.notebook.facts.some((f) => f.about.includes(p.id)));

  const groups = useMemo(() => {
    const out: { key: string; title: string; facts: FactView[] }[] = [];
    const push = (key: string, title: string, f: FactView) => {
      let g = out.find((x) => x.key === key);
      if (!g) { g = { key, title, facts: [] }; out.push(g); }
      g.facts.push(f);
    };
    if (group === 'time') {
      const timed = facts.filter((f) => f.time).sort((a, b) => a.time!.localeCompare(b.time!));
      for (const f of timed) push('timed', t('notebook.group.timed'), f);
      for (const f of facts.filter((x) => !x.time)) push('untimed', t('notebook.group.untimed'), f);
    } else if (group === 'source') {
      for (const f of facts) push(`${f.source.type}:${f.source.label}`, f.source.label, f);
    } else {
      for (const f of facts) {
        const first = person ?? f.about[0];
        push(first ?? '_', first ? names.get(first) ?? first : t('notebook.group.general'), f);
      }
      out.sort((a, b) => (a.key === '_' ? 1 : b.key === '_' ? -1 : 0));
    }
    // new ones first inside each group
    for (const g of out) g.facts.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return out;
  }, [facts, group, names, person, t]);

  return (
    <View>
      <View style={s.groupRow}>
        <Eyebrow>{t('notebook.groupBy')}</Eyebrow>
        {(['person', 'time', 'source'] as GroupBy[]).map((g) => (
          <Pressable key={g} onPress={() => { feel('light'); setGroup(g); }} accessibilityRole="button" accessibilityState={{ selected: group === g }} style={[s.mini, group === g && s.miniOn]}>
            <Text style={[s.miniText, group === g && { color: color.text }]}>{t(`notebook.group.${g}`)}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pills}>
        <Pill label={t('notebook.everyone')} on={!person} onPress={() => setPerson(null)} />
        {withFacts.map((p) => <Pill key={p.id} label={p.label} on={person === p.id} onPress={() => setPerson(person === p.id ? null : p.id)} />)}
      </ScrollView>

      {facts.length === 0 ? <Text style={s.empty}>{person ? t('notebook.noFactsPerson') : t('notebook.noFacts')}</Text> : null}
      {groups.map((g) => (
        <View key={g.key} style={{ marginTop: space.lg }}>
          <Eyebrow>{g.title}</Eyebrow>
          <View style={{ marginTop: space.sm, gap: 6 }}>
            {g.facts.map((f, i) => (
              <Rise key={f.id} delay={Math.min(i, 8) * 25}>
                <FactRow f={f} t={t} act={act} onPick={onPick && !f.private ? () => onPick({ type: 'fact', id: f.id, label: f.text }) : undefined} />
              </Rise>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function FactRow({ f, t, act, onPick }: { f: FactView; t: Translate; act: Act; onPick?: () => void }) {
  const body = (
    <View style={[s.fact, f.isNew && s.factNew, f.private && s.private]}>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        {f.time ? <Text style={s.time}>{f.time}</Text> : null}
        <Text style={s.factText}>{f.text}</Text>
        {f.isNew ? <NewDot label={t('notebook.new')} /> : null}
      </View>
      <Text style={s.factMeta} numberOfLines={1}>
        {t(`notebook.source.${f.source.type}`)} · {f.source.label} · {fmt(t('notebook.foundAt'), { day: f.found.day, time: f.found.label })}
      </Text>
      {f.private ? <PrivateMark id={f.id} act={act} t={t} /> : null}
    </View>
  );
  if (!onPick) return body;
  return (
    <Pressable onPress={() => { feel('light'); onPick(); }} accessibilityRole="button" accessibilityLabel={f.text} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      {body}
    </Pressable>
  );
}

function Pill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={() => { feel('light'); onPress(); }} accessibilityRole="button" accessibilityState={{ selected: on }} style={[s.pill, on && s.pillOn]}>
      <Text style={[s.pillText, on && { color: color.text }]}>{label}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────── evidence

function EvidenceList({ view, act, t, onOpen, onPick }: { view: InvestigationView; act: Act; t: Translate; onOpen: (id: string) => void; onPick?: (c: ChipView) => void }) {
  const list = [...view.notebook.evidence].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  if (!list.length) return <Text style={s.empty}>{t('notebook.noEvidence')}</Text>;
  return (
    <View style={{ gap: 6, marginTop: space.md }}>
      {list.map((e) => {
        const open = (e.body ?? []).flat().filter((x) => x.key && !x.collected && x.mark === 'underline').length;
        return (
          <View key={e.id} style={[s.evRow, e.private && s.private]}>
            <Pressable onPress={() => { feel('light'); onOpen(e.id); }} accessibilityRole="button" accessibilityLabel={e.name} style={{ flex: 1, flexDirection: 'row', gap: space.md }}>
              {itemArt(e.id, e.kind) ? (
                <Image source={itemArt(e.id, e.kind)!.art.src} style={s.evThumb} resizeMode="cover" />
              ) : <View style={s.evThumbEmpty}><Text style={s.evCodeIn}>{e.code}</Text></View>}
              <View style={{ flex: 1 }}>
                <Text style={s.evCode}>{e.code}</Text>
                <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                  <Text style={s.evName} numberOfLines={2}>{e.name}</Text>
                  {e.isNew ? <NewDot label={t('notebook.new')} /> : null}
                </View>
                <Text style={s.factMeta}>
                  {t(`notebook.kind.${e.kind}`)}
                  {e.body?.length ? ` · ${t('notebook.document')}` : ''}
                  {open ? ` · ${fmt(t('notebook.marked'), { n: open })}` : ''}
                </Text>
              </View>
            </Pressable>
            {e.private ? <PrivateMark id={e.id} act={act} t={t} compact /> : onPick ? <Btn small kind="secondary" label={t('notebook.use')} onPress={() => onPick({ type: 'evidence', id: e.id, label: `${e.code} ${e.name}` })} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function DocumentReader({ view, ev, act, t, onBack, onPick }: {
  view: InvestigationView; ev: EvidenceV2View; act: Act; t: Translate; onBack: () => void; onPick?: (c: ChipView) => void;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [gained, setGained] = useState<string[]>([]);
  const factText = (id: string) => view.notebook.facts.find((f) => f.id === id)?.text;
  const pic = itemArt(ev.id, ev.kind);
  // a document lifted off the pile: the page sound (handoff L), once per document opened
  useEffect(() => { playSound('page'); }, [ev.id]);

  const collect = async (seg: Segment) => {
    if (!seg.key || seg.collected || busyKey) return;
    setBusyKey(seg.key);
    const r = await act('/collect', { evidenceId: ev.id, key: seg.key });
    setBusyKey(null);
    if (isOk(r) && r.event.newFacts?.length) {
      feel('light');
      setGained((g) => [...r.event.newFacts!, ...g]);
    }
  };

  return (
    <ScrollView contentContainerStyle={[s.page, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" style={s.back}>
        <Text style={s.backText}>‹ {t('notebook.back')}</Text>
      </Pressable>
      {pic ? (
        // the object on its index card (ART_BIBLE §7): the drawing at ~60 % width, a typed label under it. Items without
        // a picture of their own get their document / lab type's drawing (or the spot they were found at) instead.
        <Textured name="paper" style={s.card}>
          <Image source={pic.art.src} style={[s.cardImg, pic.generic && s.cardImgGeneric]} resizeMode="contain" accessibilityLabel={altOf(pic.art, view.locale)} />
          <View style={s.cardLabel}>
            <Text style={s.cardCode}>{ev.code}</Text>
            <Text style={s.cardName} numberOfLines={2}>{ev.name}</Text>
          </View>
        </Textured>
      ) : null}
      {pic ? <Eyebrow style={{ marginTop: space.lg }}>{ev.foundAt}</Eyebrow> : (
        <>
          <Eyebrow>{ev.code} · {ev.foundAt}</Eyebrow>
          <Text style={s.h1} selectable>{ev.name}</Text>
        </>
      )}
      <View style={{ marginTop: space.sm }}>
        <MoreText style={s.desc} moreLabel={t('notebook.more')} lessLabel={t('notebook.less')}>{ev.description}</MoreText>
      </View>

      {ev.body?.length ? (
        <View style={s.paper}>
          <Text style={s.paperHint}>{t('notebook.readHint')}</Text>
          {ev.body.map((line, i) => (
            <Text key={i} style={s.docLine}>
              {line.map((seg, j) => {
                if (!seg.key) return <Text key={j}>{seg.text}</Text>;
                const style = seg.collected ? s.segCollected : seg.mark === 'underline' ? s.segUnderline : s.segPlain;
                return (
                  <Text
                    key={j}
                    style={[style, busyKey === seg.key && { opacity: 0.5 }]}
                    onPress={seg.collected ? undefined : () => collect(seg)}
                    accessibilityRole={seg.collected ? undefined : 'button'}
                    suppressHighlighting
                  >
                    {seg.text}
                  </Text>
                );
              })}
            </Text>
          ))}
        </View>
      ) : null}

      {gained.length ? (
        <Rise key={gained[0]} style={s.gained}>
          <Eyebrow tint={color.amber}>{t('notebook.collected')}</Eyebrow>
          {gained.slice(0, 3).map((id) => <Text key={id} style={s.gainedText}>{factText(id) ?? id}</Text>)}
        </Rise>
      ) : null}

      {ev.relatedPeople.length ? (
        <Text style={[s.factMeta, { marginTop: space.lg }]}>{t('notebook.related')}: {ev.relatedPeople.map((p) => p.name).join(', ')}</Text>
      ) : null}
      <Text style={[s.factMeta, { marginTop: 4 }]}>{t('notebook.reliability')}: {relLabel(t(`notebook.rel.${ev.reliability}`), ev.reliability)}</Text>

      {ev.private ? <View style={{ marginTop: space.xl }}><PrivateMark id={ev.id} act={act} t={t} /></View> : null}
      {onPick && !ev.private ? <Btn label={t('notebook.useThis')} onPress={() => onPick({ type: 'evidence', id: ev.id, label: `${ev.code} ${ev.name}` })} style={{ marginTop: space.xl }} /> : null}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────── co-op: private notes

/**
 * Co-op only (wave 5): an item found at a private place sits in the finder's own notes. The team cannot see or use it
 * until it is read out (POST /v2/share, free). Solo views never carry `private`, so none of this shows there.
 */
function PrivateMark({ id, act, t, compact }: { id: string; act: Act; t: Translate; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const readOut = async () => {
    if (busy) return;
    setBusy(true);
    const r = await act('/share', { itemId: id });
    setBusy(false);
    if (isOk(r)) feel('light');
  };
  return (
    <View style={[s.privRow, compact && s.privCompact]} testID={`private-${id}`}>
      <Text style={s.privStamp}>{t('notebook.private')}</Text>
      <Btn small kind="secondary" label={t('notebook.readOut')} onPress={readOut} busy={busy} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────── people

function People({ view, t, onPick, onFilter }: { view: InvestigationView; t: Translate; onPick?: (c: ChipView) => void; onFilter: (id: string) => void }) {
  const suspects = new Map(view.suspects.map((x) => [x.id, x] as const));
  const people = new Map(view.people.map((x) => [x.id, x] as const));
  return (
    <View style={{ gap: 6, marginTop: space.md }}>
      {view.chips.people.map((p) => {
        const sus = suspects.get(p.id);
        const other = people.get(p.id);
        const n = view.notebook.facts.filter((f) => f.about.includes(p.id)).length;
        return (
          <Pressable
            key={p.id}
            onPress={() => { feel('light'); if (onPick) onPick(p); else onFilter(p.id); }}
            accessibilityRole="button"
            accessibilityLabel={p.label}
            style={({ pressed }) => [s.person, pressed && { opacity: 0.85 }]}
          >
            <FaceCrop id={p.id} size={42} initials={sus?.initials ?? p.label.split(' ').map((w) => w[0]).join('').slice(0, 2)} tone={sus?.portraitTone} />
            <View style={{ flex: 1 }}>
              <Text style={s.evName}>{p.label}</Text>
              <Text style={s.factMeta} numberOfLines={1}>{sus ? sus.relationship : other?.role ?? ''}</Text>
            </View>
            <Text style={s.personCount}>{onPick ? t('notebook.use') : fmt(t(n === 1 ? 'notebook.factCount1' : 'notebook.factCount'), { n })}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  private: { borderColor: color.burgundy, borderStyle: 'dashed' },
  privCompact: { marginTop: 0, flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  privRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, marginTop: space.sm },
  privStamp: { fontFamily: font.monoMedium, fontSize: 10.5, letterSpacing: 1.2, color: color.burgundyBright, textTransform: 'uppercase', flexShrink: 1 },
  page: { padding: space.lg, paddingTop: space.sm, paddingBottom: space.xxxl },
  tabs: { flexDirection: 'row', marginHorizontal: space.lg, marginTop: space.md, borderWidth: 1, borderColor: color.border, borderRadius: radius.md, padding: 3, gap: 3 },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 9, borderRadius: radius.sm },
  tabOn: { backgroundColor: color.elevated },
  tabText: { fontFamily: font.sansMedium, fontSize: 13, color: color.textFaint },
  tabCount: { fontFamily: font.mono, fontSize: 11, color: color.textFaint },
  pickHint: { fontFamily: font.sans, fontSize: 12, color: color.amber, marginHorizontal: space.lg, marginTop: space.sm },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  mini: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  miniOn: { backgroundColor: color.elevated },
  miniText: { fontFamily: font.sansMedium, fontSize: 12, color: color.textFaint },
  pills: { gap: 6, paddingVertical: space.md },
  pill: { borderWidth: 1, borderColor: color.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  pillOn: { borderColor: color.burgundyBright, backgroundColor: color.burgundyDeep },
  pillText: { fontFamily: font.sansMedium, fontSize: 12, color: color.textDim },
  empty: { fontFamily: font.sans, fontSize: 14, color: color.textFaint, marginTop: space.lg },
  fact: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, padding: space.md, gap: 6 },
  factNew: { borderLeftWidth: 2, borderLeftColor: color.burgundyBright },
  time: { fontFamily: font.monoMedium, fontSize: 12.5, lineHeight: 20, color: color.greenBright },
  factText: { flex: 1, fontFamily: font.sans, fontSize: 14.5, lineHeight: 20, color: color.text },
  factMeta: { fontFamily: font.mono, fontSize: 10.5, letterSpacing: 0.3, color: color.textFaint, marginTop: 2 },
  evRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.surface, borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, padding: space.md },
  evCode: { fontFamily: font.monoMedium, fontSize: 10.5, letterSpacing: 0.8, color: color.amber, marginBottom: 2 },
  evThumb: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: color.paper },
  evThumbEmpty: { width: 52, height: 52, borderRadius: radius.sm, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  evCodeIn: { fontFamily: font.monoMedium, fontSize: 11, color: color.amber },
  card: { borderRadius: radius.sm, borderWidth: 1, borderColor: color.paperEdge, alignItems: 'center', paddingTop: space.lg, marginTop: space.sm },
  cardImg: { width: 212, height: 212 },
  cardImgGeneric: { width: 184, height: 184, borderRadius: 2 },
  cardLabel: { alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: color.paperEdge, borderStyle: 'dashed', marginTop: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md, flexDirection: 'row', gap: space.md, alignItems: 'baseline' },
  cardCode: { fontFamily: font.monoMedium, fontSize: 12, color: color.stamp, letterSpacing: 1 },
  cardName: { flex: 1, fontFamily: font.monoMedium, fontSize: 14, lineHeight: 19, color: color.ink },
  evName: { fontFamily: font.sansMedium, fontSize: 14.5, lineHeight: 20, color: color.text, flexShrink: 1 },
  back: { paddingVertical: space.sm, marginBottom: space.sm, alignSelf: 'flex-start' },
  backText: { fontFamily: font.sansMedium, fontSize: 14, color: color.textDim },
  h1: { fontFamily: font.serif, fontSize: 24, lineHeight: 29, color: color.text, marginTop: 4 },
  desc: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim },
  paper: { marginTop: space.lg, backgroundColor: color.paper, borderRadius: radius.sm, borderWidth: 1, borderColor: color.paperEdge, padding: space.lg, gap: 4 },
  paperHint: { fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1, color: color.inkDim, textTransform: 'uppercase', marginBottom: space.sm },
  docLine: { fontFamily: font.mono, fontSize: 12.5, lineHeight: 20, color: color.ink },
  segUnderline: { textDecorationLine: 'underline', textDecorationColor: color.stamp, color: color.ink, fontFamily: font.monoMedium },
  segPlain: { color: color.ink },
  segCollected: { backgroundColor: 'rgba(116,133,117,0.28)', color: color.ink },
  gained: { marginTop: space.lg, borderLeftWidth: 2, borderLeftColor: color.amber, paddingLeft: space.md, gap: 4 },
  gainedText: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text },
  person: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.surface, borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, padding: space.md },
  initials: { width: 36, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: font.serif, fontSize: 15, color: 'rgba(232,229,222,0.86)' },
  personCount: { fontFamily: font.mono, fontSize: 11, color: color.textDim },
});

/** A reliability grade in the UI language; an unknown grade shows as sent. */
function relLabel(translated: string, raw: string): string {
  return translated.startsWith('notebook.') ? raw : translated;
}

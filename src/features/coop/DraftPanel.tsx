// Co-op deduction drafts (wave 5): pencil in an answer for the team without filing it, see who wrote it, suggest a
// chip for a teammate's draft, take a suggestion, and file it as a deliberate act (anyone may; a wrong filing costs
// whoever files it). Mounted above the deduction book on the Deductions tab; renders nothing in solo play.
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { ChipView, DeductionBlankView, DeductionView, InvestigationView } from '../../../shared/api';
import { Button, Card, Segmented, T, tap } from '../../components/ui';
import { useDesk } from '../../state/desk';
import { fmtMinutes, useT, type Translate } from '../../i18n';
import { color, radius, space } from '../../theme/tokens';

type Mode = 'pencil' | 'suggest';

export function DraftPanel({ view }: { view: InvestigationView }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  if (!view.team) return null;
  const open = view.deductions.filter((d) => d.status === 'open');
  const drafts = open.filter((d) => d.draft);
  const shown = all ? open : drafts;
  if (!open.length) return null;
  const waiting = drafts.reduce((n, d) => n + (d.draft?.suggestions.filter((x) => !x.by.you).length ?? 0), 0);
  return (
    <View style={s.panel}>
      <Pressable style={s.head} onPress={() => { tap(); setExpanded((e) => !e); }} accessibilityRole="button" testID="coop-drafts">
        <T v="heading" style={{ flex: 1 }}>{t('coop.draft.title')} · {drafts.length}{waiting ? ` · ${t('coop.draft.waiting', { n: waiting })}` : ''}</T>
        <T v="small" style={{ color: color.burgundyBright }}>{expanded ? '\u25B4' : '\u25BE'}</T>
      </Pressable>
      {expanded ? (
        <ScrollView style={{ maxHeight: 420 }} nestedScrollEnabled contentContainerStyle={{ gap: space.sm, paddingBottom: space.sm }}>
          <T v="small" style={{ color: color.textDim }}>{t('coop.draft.explain')}</T>
          <Pressable hitSlop={8} onPress={() => { tap(); setAll((a) => !a); }}>
            <T v="small" style={{ color: color.burgundyBright }}>{all ? t('coop.draft.hide') : t('coop.draft.show')}</T>
          </Pressable>
          {!shown.length ? <T v="small" style={{ color: color.textFaint }}>{t('coop.draft.nothing')}</T> : null}
          {shown.map((d) => <Draft key={d.id} d={d} view={view} t={t} />)}
        </ScrollView>
      ) : null}
    </View>
  );
}

function chipsFor(view: InvestigationView, b: DeductionBlankView): ChipView[] {
  switch (b.type) {
    case 'fact': return view.chips.facts;
    case 'evidence': return view.chips.evidence;
    case 'person': return view.chips.people;
    case 'time': return view.chips.times;
    case 'place': return view.chips.places;
    case 'choice': return (b.options ?? []).map((o) => ({ type: 'choice', id: o.id, label: o.text }));
    default: return [];
  }
}

function Draft({ d, view, t }: { d: DeductionView; view: InvestigationView; t: Translate }) {
  const act = useDesk((s) => s.act);
  const [busy, setBusy] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('pencil');
  const run = async (key: string, path: string, body: unknown) => {
    setBusy(key);
    try { return await act(path, body); } finally { setBusy(null); }
  };
  const fill = (blankId: string) => d.draft?.fills.find((f) => f.blankId === blankId);
  const blanks = d.blanks ?? [];
  const complete = d.kind === 'fill' && blanks.length > 0 && blanks.every((b) => fill(b.id));
  const prompt = useMemo(() => d.prompt.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_m, id: string) => {
    const f = d.draft?.fills.find((x) => x.blankId === id);
    const label = blanks.find((b) => b.id === id)?.label ?? t('coop.draft.blank');
    return f ? `[${f.label}]` : `[${label}]`;
  }), [d, blanks, t]);

  return (
    <Card accent={d.draft ? color.amber : undefined} style={{ gap: space.sm }}>
      <T v="heading">{d.title}</T>
      {d.kind === 'timeline' ? <T v="small" style={{ color: color.textFaint }}>{t('coop.draft.timeline')}</T> : <T v="body">{prompt}</T>}
      {d.draft ? <T v="small" style={{ color: color.textFaint }}>{d.draft.by.you ? t('coop.draft.byYou') : t('coop.draft.by', { name: d.draft.by.name })}</T> : null}
      {d.kind === 'fill' ? blanks.map((b) => {
        const f = fill(b.id);
        const sugg = (d.draft?.suggestions ?? []).filter((x) => x.blankId === b.id);
        return (
          <View key={b.id} style={s.blank}>
            <Pressable onPress={() => { tap(); setPicking((p) => (p === b.id ? null : b.id)); }} accessibilityRole="button" testID={`draft-${d.id}-${b.id}`}>
              <T v="small" style={{ color: color.textFaint }}>{b.label ?? t('coop.draft.blank')}</T>
              <T v="body" style={{ color: f ? color.text : color.textFaint }}>{f ? f.label : `— ${t('coop.draft.empty')} —`}</T>
            </Pressable>
            {sugg.map((x, i) => (
              <View key={`${x.by.id}-${i}`} style={s.row}>
                <T v="small" style={{ flex: 1, color: color.greenBright }}>{t('coop.draft.suggested', { name: x.by.name, label: x.label })}</T>
                {f?.value !== x.value ? (
                  <Pressable hitSlop={8} onPress={() => run(`use:${b.id}:${i}`, 'draft', { deductionId: d.id, fills: { [b.id]: x.value } })}>
                    <T v="small" style={{ color: color.burgundyBright }}>{t('coop.draft.use')}</T>
                  </Pressable>
                ) : null}
              </View>
            ))}
            {picking === b.id ? (
              <View style={{ gap: space.sm, marginTop: space.xs }}>
                <T v="small">{t('coop.draft.pick', { blank: b.label ?? t('coop.draft.blank') })}</T>
                <Segmented<Mode> value={mode} onChange={setMode} options={[{ value: 'pencil', label: t('coop.draft.pencil') }, { value: 'suggest', label: t('coop.draft.suggest') }]} />
                <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                  <View style={s.wrap}>
                    {chipsFor(view, b).map((c) => (
                      <Pressable key={c.id} style={[s.chip, f?.value === c.id && s.chipOn]} accessibilityRole="button"
                        onPress={async () => {
                          tap();
                          const r = mode === 'pencil'
                            ? await run(`p:${c.id}`, 'draft', { deductionId: d.id, fills: { [b.id]: c.id } })
                            : await run(`s:${c.id}`, 'draft/suggest', { deductionId: d.id, blankId: b.id, value: c.id });
                          if (r) setPicking(null);
                        }}>
                        <T v="small" style={{ color: color.text }} numberOfLines={2}>{c.label}</T>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : null}
          </View>
        );
      }) : null}
      {complete ? (
        <View style={{ gap: 4 }}>
          <Button compact label={t('coop.draft.file')} busy={busy === 'file'}
            onPress={() => run('file', 'deduce', { deductionId: d.id, fills: Object.fromEntries(d.draft!.fills.map((f) => [f.blankId, f.value])) })} />
          <T v="small" style={{ color: color.textFaint }}>{t('coop.draft.fileNote', { time: fmtMinutes(t, view.clock.costs.wrongDeduction) })}</T>
        </View>
      ) : null}
      {d.draft ? (
        <Pressable hitSlop={8} onPress={() => run('clear', 'draft/clear', { deductionId: d.id })}>
          <T v="small" style={{ color: color.textFaint }}>{t('coop.draft.clear')}</T>
        </Pressable>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  panel: { marginHorizontal: space.lg, marginTop: space.sm, marginBottom: space.xs, gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, paddingHorizontal: space.md, borderWidth: 1, borderColor: color.amber, borderRadius: radius.md, backgroundColor: color.surface },
  blank: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.borderSoft, paddingTop: space.sm, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface, maxWidth: '100%' },
  chipOn: { borderColor: color.amber },
});

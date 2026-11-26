// Co-op team panel (wave 5): every investigator's own clock and place, what they mean to do next, who is done, and
// your private notes with "Read out". Mounted on the Map tab; renders nothing in solo play.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { InvestigationView, TeamMemberView } from '../../../shared/api';
import { Button, Card, Section, Segmented, T, Tag, tap } from '../../components/ui';
import { useDesk } from '../../state/desk';
import { toast } from '../../state/toasts';
import { fmtMinutes, useT, type Translate } from '../../i18n';
import { color, radius, space } from '../../theme/tokens';

type Kind = 'go' | 'interview' | 'lab';

export function TeamPanel({ view }: { view: InvestigationView }) {
  const t = useT();
  const team = view.team;
  if (!team) return null;
  const me = team.members.find((m) => m.isYou);
  const lead = team.members.find((m) => m.isLead);
  const investigating = view.phase === 'investigating';
  return (
    <Section title={t('coop.team.title')}>
      <T v="small" style={{ color: color.textDim, marginBottom: space.sm }}>
        {/* your own day: a late joiner's share can differ from the team's until tomorrow (wave 6) */}
        {t('coop.team.budget', { time: fmtMinutes(t, view.clock.budget?.perPlayer ?? team.perPlayer) })} {t('coop.team.dayRule')}
      </T>
      <View style={{ gap: space.sm }}>
        {team.members.map((m) => <Member key={m.id} m={m} t={t} investigating={investigating} />)}
      </View>
      {investigating && me ? <MyMoves view={view} me={me} t={t} /> : null}
      {lead && !lead.online && me && !me.isLead && view.status === 'active' ? <ClaimLead t={t} /> : null}
      <PrivateNotes view={view} />
    </Section>
  );
}

function Member({ m, t, investigating }: { m: TeamMemberView; t: Translate; investigating: boolean }) {
  const intent = m.intent
    ? m.intent.kind === 'go' ? t('coop.team.heading', { name: m.intent.label })
      : m.intent.kind === 'interview' ? t('coop.team.willQuestion', { name: m.intent.label })
        : t('coop.team.waitingLab', { name: m.intent.label })
    : undefined;
  return (
    <Card accent={m.isYou ? color.burgundyBright : undefined} style={{ paddingVertical: space.sm }}>
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: m.online ? color.greenBright : color.border }]} />
        <T v="heading" style={{ flex: 1 }} numberOfLines={1}>{m.name}{m.isYou ? ` ${t('coop.team.you')}` : ''}</T>
        {m.isLead ? <Tag label={t('coop.team.lead')} tint={color.burgundyBright} /> : null}
        {!m.online && !m.isYou ? <Tag label={t('coop.team.away')} tint={color.textFaint} /> : null}
      </View>
      <T v="small" style={{ marginTop: 2 }}>
        {t('coop.team.at', { place: m.locationName, clock: m.timeLabel })}
        {investigating ? ` · ${m.done ? (m.remaining > 0 ? t('coop.team.done') : t('coop.team.out')) : t('coop.team.left', { time: fmtMinutes(t, m.remaining) })}` : ''}
      </T>
      {m.questioning ? <T v="small" style={{ color: color.amber }}>{t('coop.team.questioning', { name: m.questioning.name })}</T> : null}
      {intent ? <T v="small" style={{ color: color.greenBright }}>{intent}</T> : null}
      {m.privateNotes > 0 && !m.isYou ? <T v="small" style={{ color: color.amber }}>{t('coop.team.notes', { n: m.privateNotes })}</T> : null}
    </Card>
  );
}

/** Your own moves: done for today, and the intent marker. */
function MyMoves({ view, me, t }: { view: InvestigationView; me: TeamMemberView; t: Translate }) {
  const act = useDesk((s) => s.act);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>('go');
  const run = async (key: string, path: string, body: unknown) => {
    setBusy(key);
    try { return await act(path, body); } finally { setBusy(null); }
  };
  const doneToday = me.done && me.remaining > 0;
  const outOfTime = me.remaining <= 0 || view.clock.dayOver;
  const options: { id: string; label: string }[] = kind === 'go'
    ? view.map.places.filter((p) => !p.here).map((p) => ({ id: p.id, label: p.name }))
    : kind === 'interview'
      ? view.suspects.filter((x) => !x.interview.refusedToday).map((x) => ({ id: x.id, label: x.name }))
      : view.notebook.evidence.flatMap((e) => e.analyses.filter((a) => a.status === 'running' || a.status === 'available').map((a) => ({ id: a.id, label: a.name })));
  return (
    <View style={{ marginTop: space.md, gap: space.sm }}>
      {/* out of time already counts as done on the server (the button is disabled then): only ask while it isn't */}
      {outOfTime && !me.done ? <T v="small" style={{ color: color.amber }}>{t('coop.team.outHint')}</T> : null}
      <View style={s.row}>
        <Button compact kind={outOfTime && !me.done ? 'primary' : 'secondary'} style={{ flex: 1 }} busy={busy === 'done'}
          label={me.done && !outOfTime ? t('coop.team.resume') : t('coop.team.doneBtn')}
          disabled={me.done && outOfTime}
          onPress={() => run('done', 'done', { done: !(me.done && !outOfTime) })} />
        <Button compact kind="ghost" style={{ flex: 1 }} label={t('coop.intent.mark')} onPress={() => { tap(); setOpen((o) => !o); }} />
      </View>
      {me.intent ? (
        <View style={s.row}>
          <T v="small" style={{ flex: 1, color: color.greenBright }}>
            {t('coop.intent.mine', { text: me.intent.kind === 'go' ? t('coop.team.heading', { name: me.intent.label }) : me.intent.kind === 'interview' ? t('coop.team.willQuestion', { name: me.intent.label }) : t('coop.team.waitingLab', { name: me.intent.label }) })}
          </T>
          <Pressable hitSlop={8} onPress={() => run('clear', 'intent', { kind: null })}><T v="small" style={{ color: color.burgundyBright }}>{t('coop.intent.clear')}</T></Pressable>
        </View>
      ) : null}
      {open ? (
        <Card style={{ gap: space.sm }}>
          <T v="small">{t('coop.intent.title')}</T>
          <Segmented<Kind> value={kind} onChange={setKind}
            options={[{ value: 'go', label: t('coop.intent.go') }, { value: 'interview', label: t('coop.intent.interview') }, { value: 'lab', label: t('coop.intent.lab') }]} />
          <View style={s.wrap}>
            {options.length ? options.map((o) => (
              <Pressable key={o.id} style={s.chip} accessibilityRole="button" testID={`intent-${o.id}`}
                onPress={async () => { tap(); const r = await run(`i:${o.id}`, 'intent', { kind, target: o.id }); if (r) setOpen(false); }}>
                <T v="small" style={{ color: color.text }}>{o.label}</T>
              </Pressable>
            )) : <T v="small" style={{ color: color.textFaint }}>{t('coop.intent.none')}</T>}
          </View>
        </Card>
      ) : null}
    </View>
  );
}

function ClaimLead({ t }: { t: Translate }) {
  const act = useDesk((s) => s.act);
  const [busy, setBusy] = useState(false);
  return (
    <Button compact kind="secondary" style={{ marginTop: space.md }} busy={busy} label={t('coop.team.claimLead')}
      onPress={async () => { setBusy(true); try { await act('claim-lead', {}); } finally { setBusy(false); } }} />
  );
}

/** Your private notes (found at a private source) with "Read out" — the only way the team gets them. */
export function PrivateNotes({ view }: { view: InvestigationView }) {
  const t = useT();
  const act = useDesk((s) => s.act);
  const [busy, setBusy] = useState<string | null>(null);
  const facts = view.notebook.facts.filter((f) => f.private);
  const evidence = view.notebook.evidence.filter((e) => e.private);
  if (!facts.length && !evidence.length) return null;
  const read = async (key: string, itemId?: string) => {
    setBusy(key);
    try {
      const r = await act('share', itemId ? { itemId } : {});
      if (r) toast({ title: t('coop.notes.toast'), tone: 'team' });
    } finally { setBusy(null); }
  };
  const items = [
    ...evidence.map((e) => ({ id: e.id, kind: t('coop.notes.evidence'), text: `${e.code} ${e.name}` })),
    ...facts.map((f) => ({ id: f.id, kind: t('coop.notes.fact'), text: f.text })),
  ];
  return (
    <Card accent={color.amber} style={{ marginTop: space.md, gap: space.sm }}>
      <T v="heading">{t('coop.notes.title')}</T>
      <T v="small" style={{ color: color.textDim }}>{t('coop.notes.explain')}</T>
      {items.map((it) => (
        <View key={it.id} style={s.note}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="small" style={{ color: color.textFaint }}>{it.kind}</T>
            <T v="body">{it.text}</T>
          </View>
          <Button compact kind="secondary" label={t('coop.notes.readOut')} busy={busy === it.id} onPress={() => read(it.id, it.id)} />
        </View>
      ))}
      {items.length > 1 ? <Button compact label={t('coop.notes.readAll')} busy={busy === 'all'} onPress={() => read('all')} /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  note: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 4 },
});

import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { Composure, InvestigationView, SuspectV2View } from '../../../../shared/api';
import { Button, Card, Eyebrow, Section, T, Tag } from '../../../../src/components/ui';
import { FaceCrop, PortraitCard, Textured } from '../../../../src/art/components';
import { useDesk } from '../../../../src/state/desk';
import { fmtCost, useT, type Translate } from '../../../../src/i18n';
import { useAction } from '../../../../src/features/desk/useAction';
import { availabilityLine, fits } from '../../../../src/features/desk/format';
import { color, space } from '../../../../src/theme/tokens';
import { TeamMarks } from '../../../../src/features/coop';

const composureTint: Record<Composure, string> = {
  composed: color.textDim, uneasy: color.amber, strained: color.burgundyBright, breaking: color.burgundyBright,
};

/** People tab: suspects (when they can be seen, patience, the way into the interview room) and everyone else. */
export default function PeopleTab() {
  const t = useT();
  const view = useDesk((s) => s.view)!;
  return (
    <Textured name="desk" style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false} testID="desk-people">
      <Section title={t('desk.people.suspects')}>
        <View style={{ gap: space.md }}>
          {view.suspects.map((p) => <Suspect key={p.id} p={p} view={view} t={t} />)}
        </View>
      </Section>
      {view.people.length ? (
        <Section title={t('desk.people.others')}>
          <View style={{ gap: space.sm }}>
            {view.people.map((p) => (
              <Card key={p.id} style={{ paddingVertical: space.md }}>
                <View style={s.other}>
                  <FaceCrop id={p.id} size={48} initials={p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T v="heading">{p.name}</T>
                    <Eyebrow style={{ marginTop: 2 }}>{p.role}</Eyebrow>
                  </View>
                </View>
                <T v="small" style={{ marginTop: space.sm }} selectable>{p.description}</T>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}
    </ScrollView>
    </Textured>
  );
}

function Suspect({ p, view, t }: { p: SuspectV2View; view: InvestigationView; t: Translate }) {
  const { run, pending } = useAction();
  const a = availabilityLine(t, p, view.clock);
  // wave 9: stepped out a moment ago (no game time since) → back in for free
  const back = p.interview.open || !!p.interview.resumeFree;
  const cost = back ? 0 : view.clock.costs.startInterview;
  const affordable = fits(view.clock, cost);
  const playing = view.phase === 'investigating';
  const canStart = playing && (p.interview.open || (a.now && !p.interview.refusedToday && affordable));
  const open = async () => {
    if (p.interview.open) { router.push(`/desk/${view.sessionId}/interview/${p.id}`); return; }
    const r = await run(`interview:${p.id}`, 'interview', { suspectId: p.id });
    if (r) router.push(`/desk/${view.sessionId}/interview/${p.id}`);
  };
  const label = back && (p.interview.open || (a.now && !p.interview.refusedToday)) ? t('desk.people.resume')
    : !a.now || p.interview.refusedToday ? t('desk.people.notNow')
    : !affordable ? t('desk.noTime')
    : t('desk.people.interview', { cost: fmtCost(t, cost) });
  return (
    <Card accent={p.interview.open ? color.burgundyBright : undefined}>
      <View style={s.head}>
        <PortraitCard id={p.id} stage={p.composure} width={88} height={116} initials={p.initials} tone={p.portraitTone} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T v="title" style={{ fontSize: 21, lineHeight: 25 }}>{p.name}</T>
          <T v="small" numberOfLines={2} style={{ marginTop: 2 }}>{p.age} · {p.occupation}</T>
          <T v="small" style={{ color: color.textFaint }} numberOfLines={2}>{p.relationship}</T>
          <View style={s.meta}>
            <Tag label={t(`composure.${p.composure}`)} tint={composureTint[p.composure]} />
            <View style={s.pips} accessibilityLabel={t('desk.people.patienceA11y', { n: p.interview.patience, max: p.interview.maxPatience })}>
              {Array.from({ length: p.interview.maxPatience }, (_, i) => (
                <View key={i} style={[s.pip, i < p.interview.patience && s.pipOn]} />
              ))}
            </View>
          </View>
        </View>
      </View>
      <T v="small" style={{ marginTop: space.md, color: a.now ? color.greenBright : color.textDim }}>{a.text}</T>
      {view.team ? <TeamMarks marks={p.team} heldBy={p.interview.heldBy} kind="person" /> : null}
      {p.availability.length ? (
        <T v="small" style={{ color: color.textFaint, marginTop: 2 }}>
          {p.availability.map((w) => t('desk.people.window', { d: w.day, from: w.from, to: w.to })).join(' · ')}
        </T>
      ) : null}
      <Button
        label={label}
        kind={canStart ? 'primary' : 'secondary'}
        disabled={!canStart}
        busy={pending === `interview:${p.id}`}
        onPress={open}
        style={{ marginTop: space.md }}
      />
    </Card>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: space.lg, paddingBottom: space.xxxl, maxWidth: 760, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, gap: space.sm },
  other: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pips: { flexDirection: 'row', gap: 4 },
  pip: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: color.border },
  pipOn: { backgroundColor: color.amber, borderColor: color.amber },
});

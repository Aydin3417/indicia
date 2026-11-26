// Let time pass on purpose (PLAYTEST_V2 §7.3): until the next lab result, until a suspect's hours, or 30/60 minutes.
// Waiting costs exactly the minutes waited (POST /v2/wait); the server lists what can be waited for in clock.waits.
import { StyleSheet, View } from 'react-native';
import type { InvestigationView } from '../../../shared/api';
import { Button, Section, T } from '../../components/ui';
import { fmtMinutes, useT } from '../../i18n';
import { color, space } from '../../theme/tokens';
import { useAction } from './useAction';

export function WaitCard({ view, compact }: { view: InvestigationView; compact?: boolean }) {
  const t = useT();
  const { run, pending } = useAction();
  const w = view.clock.waits;
  const lead = view.mode !== 'coop' || !!view.room?.isHost;
  if (!w || !lead || view.phase !== 'investigating') return null;
  const options: { key: string; label: string; body: { minutes?: number; until?: string } }[] = [];
  if (w.lab !== undefined) options.push({ key: 'lab', label: `${t('desk.wait.lab')} · ${fmtMinutes(t, w.lab)}`, body: { until: 'lab' } });
  for (const s of w.suspects) {
    const name = view.suspects.find((x) => x.id === s.id)?.name.split(' ')[0] ?? s.id;
    options.push({ key: s.id, label: `${t('desk.wait.suspect', { name })} · ${fmtMinutes(t, s.minutes)}`, body: { until: s.id } });
  }
  if (compact && options.length === 0) return null;
  for (const m of [30, 60]) if (m <= w.max && m >= w.min) options.push({ key: `m${m}`, label: t('desk.wait.minutes', { time: fmtMinutes(t, m) }), body: { minutes: m } });
  if (!options.length) return null;
  return (
    <Section title={t('desk.wait.title')}>
      <View style={s.list}>
        {options.map((o, i) => (
          <Button
            key={o.key}
            label={o.label}
            kind={i === 0 && o.body.until ? 'secondary' : 'ghost'}
            compact
            icon="clock"
            busy={pending === `wait:${o.key}`}
            onPress={() => run(`wait:${o.key}`, 'wait', o.body)}
            style={{ alignSelf: 'stretch' }}
          />
        ))}
      </View>
      <T v="small" style={{ marginTop: space.sm, marginBottom: space.lg, color: color.textFaint }}>{t('desk.wait.note')}</T>
    </Section>
  );
}

const s = StyleSheet.create({
  list: { gap: space.sm },
});

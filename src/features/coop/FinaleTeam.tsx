// Co-op finale (wave 5): the lead sees what teammates put forward for the current round, with their names, and can
// answer with it in one tap. Teammates suggest through the round itself (FinaleScreen's "Suggest an answer", which
// also shows their own pick); here they only see what the rest of the team put forward (wave 6: the second picker that
// used to sit here duplicated the round's). Renders nothing in solo play or outside a running confrontation.
// Mounted under the FinaleScreen by app/desk/[sessionId]/finale.tsx.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { InvestigationView } from '../../../shared/api';
import { Button, Card, T } from '../../components/ui';
import { useDesk } from '../../state/desk';
import { useT } from '../../i18n';
import { color, space } from '../../theme/tokens';

export function FinaleTeam({ view }: { view: InvestigationView }) {
  const t = useT();
  const act = useDesk((s) => s.act);
  const [busy, setBusy] = useState<string | null>(null);
  const f = view.finale;
  if (!view.team || !f || f.status !== 'running' || !f.rounds.length) return null;
  const lead = !!view.room?.isHost;
  const sugg = f.suggestions ?? [];
  const run = async (key: string, path: string, body: unknown) => {
    setBusy(key);
    try { return await act(path, body); } finally { setBusy(null); }
  };
  if (!lead) {
    const others = sugg.filter((x) => !x.by.you);
    if (!others.length) return null;
    return (
      <Card accent={color.amber} style={s.card}>
        {others.map((x, i) => (
          <T key={i} v="small" style={{ color: color.textDim }}>{t('coop.finale.suggests', { name: x.by.name })}: {x.label}</T>
        ))}
      </Card>
    );
  }
  return (
    <Card accent={color.amber} style={s.card}>
      <T v="heading">{t('coop.finale.title')}</T>
      {sugg.length ? sugg.map((x, i) => (
        <View key={`${x.by.id}-${i}`} style={s.row}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="small" style={{ color: color.textFaint }}>{t('coop.finale.suggests', { name: x.by.name })}</T>
            <T v="body" numberOfLines={3}>{x.label}</T>
          </View>
          <Button compact label={t('coop.finale.use')} busy={busy === `use:${i}`} onPress={() => run(`use:${i}`, 'finale/answer', { itemId: x.itemId })} />
        </View>
      )) : <T v="small" style={{ color: color.textFaint }}>{t('coop.finale.none')}</T>}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: space.sm, marginHorizontal: space.lg, marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});

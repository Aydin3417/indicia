// Small co-op lines on a place card or a person card: who is here / on the way / questioning, who holds an
// interview, and whether a place is a private source. Renders nothing in solo play.
import { View } from 'react-native';
import type { TeammateMark } from '../../../shared/api';
import { T } from '../../components/ui';
import { useT } from '../../i18n';
import { color } from '../../theme/tokens';

export function TeamMarks({ marks, heldBy, privatePlace, kind }: {
  marks?: TeammateMark[];
  heldBy?: { id: string; name: string; you: boolean };
  privatePlace?: boolean;
  kind: 'place' | 'person';
}) {
  const t = useT();
  const lines: { text: string; tint: string }[] = [];
  if (heldBy) lines.push({ text: heldBy.you ? t('coop.marks.heldYou') : t('coop.marks.held', { name: heldBy.name }), tint: color.amber });
  for (const m of marks ?? []) {
    if (heldBy && m.id === heldBy.id) continue;
    const key = m.status === 'here' ? 'coop.marks.here'
      : m.status === 'questioning' ? 'coop.marks.questioning'
        : kind === 'person' ? 'coop.marks.willQuestion' : 'coop.marks.heading';
    lines.push({ text: t(key, { name: m.name }), tint: color.greenBright });
  }
  if (privatePlace) lines.push({ text: t('coop.marks.private'), tint: color.amber });
  if (!lines.length) return null;
  return (
    <View style={{ marginTop: 4 }}>
      {lines.map((l, i) => <T key={i} v="small" style={{ color: l.tint }}>{l.text}</T>)}
    </View>
  );
}

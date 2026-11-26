// Tutorial coach marks (PLAYTEST_V2 §7.5): one line each for the scene → notebook → present → deduction loop,
// only in the tutorial case, each shown once (dismissed by ✕, or retired as soon as the player has done it).
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import type { InvestigationView } from '../../../shared/api';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../i18n';
import { color, font, radius, space } from '../../theme/tokens';

export type CoachStep = 'scene' | 'notebook' | 'present' | 'deduction';
export type CoachWhere = 'tabs' | 'interview';

const ORDER: CoachStep[] = ['scene', 'notebook', 'present', 'deduction'];

/** Is this step's lesson still ahead of the player? (true = the coach line is useful now) */
export function coachDue(view: InvestigationView, step: CoachStep): boolean {
  if (!view.case.tutorial || view.phase !== 'investigating') return false;
  switch (step) {
    case 'scene':
      return !view.scenes.some((sc) => sc.zones.some((z) => z.inspected));
    case 'notebook': {
      const fromDocs = view.notebook.facts.some((f) => f.source.type === 'document');
      const unread = view.notebook.evidence.some((e) => e.body?.some((line) => line.some((seg) => seg.key && seg.mark === 'underline' && !seg.collected)));
      return !fromDocs && unread;
    }
    case 'present': {
      const broke = view.suspects.some((x) => x.log.some((l) => l.outcome === 'break'));
      const onTable = view.suspects.some((x) => x.topics.some((t) => t.claims.some((c) => c.status === 'active')));
      return !broke && onTable;
    }
    case 'deduction':
      return view.deductions.some((d) => d.status === 'open') && !view.deductions.some((d) => d.status === 'confirmed');
  }
}

const AT: Record<CoachStep, CoachWhere> = { scene: 'tabs', notebook: 'tabs', present: 'interview', deduction: 'tabs' };

export function CoachMark({ view, where, style }: { view: InvestigationView; where: CoachWhere; style?: StyleProp<ViewStyle> }) {
  const t = useT();
  const coached = usePrefs((s) => s.coached);
  const ready = usePrefs((s) => s.ready);
  const mark = usePrefs((s) => s.markCoached);
  const step = ORDER.find((x) => AT[x] === where && !coached.includes(x) && coachDue(view, x));
  // a step that was on screen and is now done retires for good ("shown once")
  const shown = useRef<Set<CoachStep>>(new Set());
  useEffect(() => {
    if (step) shown.current.add(step);
    for (const s of shown.current) if (s !== step && !coachDue(view, s)) mark(s);
  }, [step, view, mark]);
  if (!ready || !step) return null;
  return (
    <Animated.View key={step} entering={FadeInDown.duration(260)} exiting={FadeOut.duration(160)} style={[st.wrap, style]} testID={`coach-${step}`}>
      <View style={{ flex: 1 }}>
        <Text style={st.eyebrow}>{t('coach.eyebrow')}</Text>
        <Text style={st.line}>{t(`coach.${step}`)}</Text>
      </View>
      <Pressable onPress={() => mark(step)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('coach.dismiss')} testID="coach-dismiss">
        <Text style={st.x}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, backgroundColor: color.elevated, borderLeftWidth: 3,
    borderLeftColor: color.amber, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm,
  },
  eyebrow: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.3, color: color.amber, textTransform: 'uppercase' },
  line: { fontFamily: font.sans, fontSize: 14, lineHeight: 19, color: color.text, marginTop: 2 },
  x: { fontFamily: font.sans, fontSize: 15, color: color.textDim, paddingHorizontal: 2 },
});

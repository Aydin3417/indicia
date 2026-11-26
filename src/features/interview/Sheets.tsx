import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChipView, ClaimView, InvestigationView, TopicV2View } from '../../../shared/api';
import { Button, Eyebrow, tap } from '../../components/ui';
import { Notebook } from '../notebook/Notebook';
import type { Act } from '../act';
import { Icon } from '../../components/Icon';
import { color, font, radius, space } from '../../theme/tokens';
import { minutes, type Say } from './useStrings';

function Sheet({ visible, onClose, title, children, footer }: { visible: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const inset = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.sheet, { paddingBottom: Math.max(inset.bottom, space.lg) }]} onPress={() => undefined}>
          <View style={s.grip} />
          <View style={s.head}>
            <Eyebrow style={{ flex: 1 }}>{title}</Eyebrow>
            <Pressable hitSlop={12} onPress={onClose} accessibilityRole="button"><Icon name="close" size={18} tint={color.textDim} /></Pressable>
          </View>
          {children}
          {footer}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * The notebook, inside the interview room (wave 9, PLAYTEST_V5 §5.2). The interview stays open underneath: the player
 * can read every fact and document and note a marked line (free, as everywhere) without leaving the room. With a claim
 * selected it is the picker for "present": a fact, an evidence row, or a document's "use this evidence" — then one
 * confirm with the cost. Scene work, travel and the lab still need the desk; they cost time and the room is a room.
 */
export function NotebookSheet({ visible, onClose, claim, view, act, t, tried, cost, say, onPresent, suspectName }: {
  visible: boolean; onClose: () => void; claim: ClaimView | undefined; view: InvestigationView; act: Act; t: (key: string) => string;
  tried: Set<string>; cost: number; say: Say; onPresent: (itemId: string) => void; suspectName: string;
}) {
  const inset = useSafeAreaInsets();
  const [picked, setPicked] = useState<ChipView | null>(null);
  const close = () => { setPicked(null); onClose(); };
  const picking = !!claim;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={[s.full, { paddingTop: inset.top }]} testID="interview-notebook">
        <View style={s.fullHead}>
          <Pressable hitSlop={12} onPress={close} accessibilityRole="button" style={s.backRow} testID="interview-notebook-close">
            <Icon name="back" size={18} tint={color.text} />
            <Text style={s.backLabel} numberOfLines={1}>{say('interview.notebook.back', { name: suspectName })}</Text>
          </Pressable>
          {claim ? (
            <>
              <Eyebrow style={{ marginTop: space.sm }}>{say('interview.present.title')}</Eyebrow>
              <Text style={s.claim} numberOfLines={3}>“{claim.text}”</Text>
            </>
          ) : <Text style={s.fullHint}>{say('interview.notebook.hint')}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Notebook
            view={view} act={act} t={t}
            mode={picking ? 'pick' : 'browse'} accept={['fact', 'evidence']}
            onPick={picking ? (c: ChipView) => { tap(); setPicked(c); } : undefined}
          />
        </View>
        {picking ? (
          <View style={[s.fullFoot, { paddingBottom: Math.max(inset.bottom, space.md) }]}>
            {picked ? (
              <>
                <Text style={s.pickedLabel} numberOfLines={2}>{picked.label}</Text>
                {tried.has(picked.id) ? <Text style={[s.warn, { color: color.burgundyBright }]}>{say('interview.present.triedNote')}</Text> : null}
              </>
            ) : <Text style={s.warn}>{say('interview.present.warn')}</Text>}
            <Button
              label={picked ? `${say('interview.present')} · ${minutes(say, cost)}` : say('interview.present.pick')}
              disabled={!picked}
              onPress={() => { if (picked) { const id = picked.id; setPicked(null); onPresent(id); } }}
              icon="evidence"
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

/** Topics the suspect can be asked about. */
export function TopicSheet({ visible, onClose, topics, cost, say, onRaise }: {
  visible: boolean; onClose: () => void; topics: TopicV2View[]; cost: number; say: Say; onRaise: (topicId: string) => void;
}) {
  const available = topics.filter((x) => x.state === 'available');
  const raised = topics.filter((x) => x.state === 'open');
  return (
    <Sheet visible={visible} onClose={onClose} title={say('interview.raise.title')}>
      <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: space.sm }}>
        {available.length === 0 ? <Text style={s.empty}>{say('interview.raise.none')}</Text> : null}
        <View style={s.chips}>
          {available.map((x) => (
            <Pressable key={x.id} onPress={() => { tap(); onRaise(x.id); }} style={({ pressed }) => [s.chip, pressed && { opacity: 0.8 }]} accessibilityRole="button">
              <Icon name="bulb" size={15} tint={color.amber} />
              <Text style={s.chipText}>{x.label}</Text>
              {cost > 0 ? <Text style={s.chipCost}>{minutes(say, cost)}</Text> : null}
            </Pressable>
          ))}
        </View>
        {raised.length ? (
          <>
            <Eyebrow style={{ marginTop: space.md }}>{say('interview.raise.raised')}</Eyebrow>
            <View style={s.chips}>
              {raised.map((x) => (
                <View key={x.id} style={[s.chip, s.chipDone]}>
                  <Icon name="check" size={14} tint={color.textFaint} />
                  <Text style={[s.chipText, { color: color.textFaint }]}>{x.label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: color.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: color.bg, borderTopWidth: 1, borderColor: color.border, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: space.lg, paddingTop: space.sm, width: '100%', maxWidth: 760, alignSelf: 'center',
  },
  grip: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: color.border, marginBottom: space.md },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md },
  claim: { fontFamily: font.serif, fontSize: 16, lineHeight: 22, color: color.text, marginBottom: space.md },
  full: { flex: 1, backgroundColor: color.bg, width: '100%', maxWidth: 760, alignSelf: 'center' },
  fullHead: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 },
  backLabel: { fontFamily: font.sansMedium, fontSize: 14, color: color.text, flexShrink: 1 },
  fullHint: { fontFamily: font.sans, fontSize: 12.5, lineHeight: 18, color: color.textDim, marginTop: space.xs },
  fullFoot: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border, paddingHorizontal: space.lg, paddingTop: space.md, backgroundColor: color.bg, gap: space.sm },
  pickedLabel: { fontFamily: font.sansMedium, fontSize: 14, lineHeight: 20, color: color.amber },
  warn: { fontFamily: font.sans, fontSize: 12, color: color.textFaint, textAlign: 'center', marginBottom: space.sm },
  empty: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim, paddingVertical: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: color.border, backgroundColor: color.surface,
  },
  chipDone: { backgroundColor: 'transparent', borderColor: color.borderSoft },
  chipText: { fontFamily: font.sansMedium, fontSize: 14, color: color.text },
  chipCost: { fontFamily: font.mono, fontSize: 10.5, color: color.textFaint },
});

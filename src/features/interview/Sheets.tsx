import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ClaimView, InvestigationView, TopicV2View } from '../../../shared/api';
import { Button, Eyebrow, Segmented, tap } from '../../components/ui';
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

/** Notebook picker: one fact or evidence to present against the selected claim. */
export function PresentSheet({ visible, onClose, claim, view, tried, cost, say, onPresent }: {
  visible: boolean; onClose: () => void; claim: ClaimView | undefined; view: InvestigationView; tried: Set<string>;
  cost: number; say: Say; onPresent: (itemId: string) => void;
}) {
  const [tab, setTab] = useState<'facts' | 'evidence'>('facts');
  const [picked, setPicked] = useState<string | null>(null);
  const facts = useMemo(() => [...view.notebook.facts].reverse(), [view.notebook.facts]);
  const evidence = useMemo(() => [...view.notebook.evidence].reverse(), [view.notebook.evidence]);
  const close = () => { setPicked(null); onClose(); };
  const rows = tab === 'facts'
    ? facts.map((f) => ({ id: f.id, title: f.text, meta: [f.time, f.source.label].filter(Boolean).join(' · '), isNew: f.isNew }))
    : evidence.map((e) => ({ id: e.id, title: `${e.code} · ${e.name}`, meta: e.locationName ?? e.foundAt, isNew: e.isNew }));
  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={say('interview.present.title')}
      footer={(
        <View style={{ marginTop: space.md }}>
          <Text style={s.warn}>{say('interview.present.warn')}</Text>
          <Button
            label={picked ? `${say('interview.present')} · ${minutes(say, cost)}` : say('interview.present.pick')}
            disabled={!picked || !claim}
            onPress={() => { if (picked) { const id = picked; setPicked(null); onPresent(id); } }}
            icon="evidence"
          />
        </View>
      )}
    >
      {claim ? <Text style={s.claim} numberOfLines={3}>“{claim.text}”</Text> : null}
      <Segmented
        value={tab}
        onChange={(v) => { setTab(v); }}
        options={[
          { value: 'facts', label: `${say('interview.present.facts')} ${view.notebook.facts.length}` },
          { value: 'evidence', label: `${say('interview.present.evidence')} ${view.notebook.evidence.length}` },
        ]}
      />
      <ScrollView style={{ maxHeight: 380, marginTop: space.md }} contentContainerStyle={{ gap: space.sm }} keyboardShouldPersistTaps="handled">
        {rows.length === 0 ? <Text style={s.empty}>{say('interview.present.empty')}</Text> : null}
        {rows.map((r) => {
          const on = picked === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => { tap(); setPicked(on ? null : r.id); }}
              style={[s.row, on && s.rowOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <View style={[s.radio, on && s.radioOn]} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle} numberOfLines={3}>{r.title}</Text>
                <View style={{ flexDirection: 'row', gap: space.sm, marginTop: 3 }}>
                  {r.meta ? <Text style={s.rowMeta} numberOfLines={1}>{r.meta}</Text> : null}
                  {tried.has(r.id) ? <Text style={[s.rowMeta, { color: color.burgundyBright }]}>{say('interview.present.tried')}</Text> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Sheet>
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
  warn: { fontFamily: font.sans, fontSize: 12, color: color.textFaint, textAlign: 'center', marginBottom: space.sm },
  empty: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim, paddingVertical: space.md },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, padding: space.md, backgroundColor: color.surface },
  rowOn: { borderColor: color.amber, backgroundColor: color.elevated },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: color.border, marginTop: 2 },
  radioOn: { borderColor: color.amber, backgroundColor: color.amber },
  rowTitle: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text },
  rowMeta: { fontFamily: font.mono, fontSize: 10.5, color: color.textFaint, letterSpacing: 0.3, flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: color.border, backgroundColor: color.surface,
  },
  chipDone: { backgroundColor: 'transparent', borderColor: color.borderSoft },
  chipText: { fontFamily: font.sansMedium, fontSize: 14, color: color.text },
  chipCost: { fontFamily: font.mono, fontSize: 10.5, color: color.textFaint },
});

// Timeline puzzle: drag event cards into order; one card can be set aside as "doesn't fit".
// Drag anywhere on the card (vertical move). ↑ ↓ and "set aside" buttons always work too.
import { useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { color, font, radius, space } from '../../theme/tokens';
import { feel } from './kit';
import type { Translate } from './types';

const ROW = 64;
const GAP = 8;
const STRIDE = ROW + GAP;

type Card = { id: string; text: string; time?: string };

export function Timeline({ cards, order, outlier, hasOutlier, locked, t, onChange }: {
  cards: Card[]; order: string[]; outlier: string | null; hasOutlier: boolean; locked: boolean; t: Translate;
  onChange: (order: string[], outlier: string | null) => void;
}) {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const [drag, setDrag] = useState<{ id: string; from: number; to: number } | null>(null);
  // the outlier slot counts as position `order.length` while dragging
  const slots = order.length;

  const preview = (() => {
    if (!drag || drag.from < 0) return order;
    const o = order.filter((x) => x !== drag.id);
    const to = Math.min(drag.to, o.length);
    o.splice(to, 0, drag.id);
    return o;
  })();

  const commitDrop = (id: string, to: number) => {
    const fromOutlier = outlier === id;
    let o = order.filter((x) => x !== id);
    let out = outlier;
    if (hasOutlier && to >= (fromOutlier ? order.length + 1 : order.length)) {
      // set aside; a previous outlier returns to the end of the line
      if (out && out !== id) o = [...o, out];
      out = id;
    } else {
      o.splice(Math.max(0, Math.min(to, o.length)), 0, id);
      if (fromOutlier) out = null;
    }
    feel('light');
    onChange(o, out);
  };

  const move = (id: string, delta: number) => {
    const i = order.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= order.length) return;
    const o = [...order];
    [o[i], o[j]] = [o[j], o[i]];
    feel('light');
    onChange(o, outlier);
  };
  const setAside = (id: string) => commitDrop(id, Number.MAX_SAFE_INTEGER);
  const bringBack = (id: string) => commitDrop(id, order.length);

  const draggingOutlier = drag && drag.from < 0;
  const hoverOutlier = !!drag && hasOutlier && drag.to >= slots + (draggingOutlier ? 1 : 0);

  return (
    <View style={{ marginTop: space.lg }}>
      <View style={[s.rail]}>
        {order.map((id, i) => {
          const c = byId.get(id);
          if (!c) return null;
          const isDragged = drag?.id === id;
          return (
            <Row
              key={id}
              card={c}
              index={i}
              shift={isDragged ? 0 : (preview.indexOf(id) - i) * STRIDE}
              total={order.length}
              locked={locked}
              dragged={isDragged}
              t={t}
              onUp={() => move(id, -1)}
              onDown={() => move(id, 1)}
              onAside={hasOutlier ? () => setAside(id) : undefined}
              onDragStart={() => setDrag({ id, from: order.indexOf(id), to: order.indexOf(id) })}
              onDragMove={(dy) => {
                const from = order.indexOf(id);
                const to = Math.max(0, Math.round((from * STRIDE + dy) / STRIDE));
                setDrag((d) => (d && d.to === to ? d : { id, from, to }));
              }}
              onDragEnd={(dy) => {
                const from = order.indexOf(id);
                const to = Math.max(0, Math.round((from * STRIDE + dy) / STRIDE));
                setDrag(null);
                commitDrop(id, to);
              }}
            />
          );
        })}
      </View>

      {hasOutlier ? (
        <View style={[s.aside, hoverOutlier && s.asideHover]}>
          <Text style={s.asideLabel}>{t('deduction.timeline.aside')}</Text>
          {outlier && byId.get(outlier) ? (
            <OutlierCard
              card={byId.get(outlier)!}
              locked={locked}
              t={t}
              onBack={() => bringBack(outlier)}
              onDragStart={() => setDrag({ id: outlier, from: -1, to: order.length })}
              onDragMove={(dy) => {
                const to = Math.max(0, Math.round((order.length * STRIDE + 40 + dy) / STRIDE));
                setDrag((d) => (d && d.to === to ? d : { id: outlier, from: -1, to }));
              }}
              onDragEnd={(dy) => {
                const to = Math.max(0, Math.round((order.length * STRIDE + 40 + dy) / STRIDE));
                setDrag(null);
                commitDrop(outlier, to);
              }}
            />
          ) : (
            <Text style={s.asideEmpty}>{t('deduction.timeline.asideEmpty')}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Vertical drag via the responder system (PanResponder): works with mouse on web and touch on native, and
 * claims the gesture only after a clearly vertical move so taps on ↑ ↓ ✕ still work.
 */
/**
 * Vertical drag via the responder system (PanResponder): works with mouse on web and touch on native.
 * The card takes the touch on press but only starts dragging after a clearly vertical move; until then it
 * lets a scroll view take over, and taps on ↑ ↓ ✕ (deeper Pressables) keep working.
 */
function useDrag(locked: boolean, onStart: () => void, onMove: (dy: number) => void, onEnd: (dy: number) => void) {
  const ty = useSharedValue(0);
  const cb = useRef({ locked, onStart, onMove, onEnd });
  cb.current = { locked, onStart, onMove, onEnd };
  const dragging = useRef(false);
  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !cb.current.locked,
    onPanResponderGrant: () => { dragging.current = false; },
    onPanResponderMove: (_e, g) => {
      if (!dragging.current) {
        if (Math.abs(g.dy) <= 6 || Math.abs(g.dy) < Math.abs(g.dx)) return;
        dragging.current = true;
        feel('light');
        cb.current.onStart();
      }
      ty.value = g.dy;
      cb.current.onMove(g.dy);
    },
    onPanResponderRelease: (_e, g) => {
      if (dragging.current) cb.current.onEnd(g.dy);
      dragging.current = false;
      ty.value = 0;
    },
    onPanResponderTerminate: (_e, g) => {
      if (dragging.current) cb.current.onEnd(g.dy);
      dragging.current = false;
      ty.value = 0;
    },
    onPanResponderTerminationRequest: () => !dragging.current,
    onShouldBlockNativeResponder: () => true,
  })).current;
  return { ty, handlers: responder.panHandlers };
}

function Row({ card, index, shift, total, locked, dragged, t, onUp, onDown, onAside, onDragStart, onDragMove, onDragEnd }: {
  card: Card; index: number; shift: number; total: number; locked: boolean; dragged: boolean; t: Translate;
  onUp: () => void; onDown: () => void; onAside?: () => void;
  onDragStart: () => void; onDragMove: (dy: number) => void; onDragEnd: (dy: number) => void;
}) {
  const { ty, handlers } = useDrag(locked, onDragStart, onDragMove, onDragEnd);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: dragged ? ty.value : shift }] }));
  return (
    <Animated.View style={[s.row, dragged && s.rowDragged, st]} {...handlers}>
        <View style={s.handleZone} accessibilityLabel={t('deduction.timeline.drag')}>
          <Text style={s.pos}>{index + 1}</Text>
          <Text style={s.grip}>⋮⋮</Text>
          <Text style={s.cardText} numberOfLines={2}>{card.text}</Text>
        </View>
      {!locked ? (
        <View style={s.tools}>
          <Pressable onPress={onUp} disabled={index === 0} hitSlop={4} accessibilityRole="button" accessibilityLabel={t('deduction.timeline.up')} style={[s.tool, index === 0 && { opacity: 0.25 }]}>
            <Text style={s.toolText}>↑</Text>
          </Pressable>
          <Pressable onPress={onDown} disabled={index === total - 1} hitSlop={4} accessibilityRole="button" accessibilityLabel={t('deduction.timeline.down')} style={[s.tool, index === total - 1 && { opacity: 0.25 }]}>
            <Text style={s.toolText}>↓</Text>
          </Pressable>
          {onAside ? (
            <Pressable onPress={onAside} hitSlop={4} accessibilityRole="button" accessibilityLabel={t('deduction.timeline.setAside')} style={s.tool}>
              <Text style={[s.toolText, { color: color.burgundyBright }]}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

function OutlierCard({ card, locked, t, onBack, onDragStart, onDragMove, onDragEnd }: {
  card: Card; locked: boolean; t: Translate; onBack: () => void; onDragStart: () => void; onDragMove: (dy: number) => void; onDragEnd: (dy: number) => void;
}) {
  const { ty, handlers } = useDrag(locked, onDragStart, onDragMove, onDragEnd);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  return (
    <Animated.View style={[s.row, s.rowOutlier, st]} {...handlers}>
        <View style={s.handleZone}>
          <Text style={[s.pos, { color: color.burgundyBright }]}>✕</Text>
          <Text style={[s.cardText, { textDecorationLine: 'line-through', color: color.textDim }]} numberOfLines={2}>{card.text}</Text>
        </View>
      {!locked ? (
        <Pressable onPress={onBack} hitSlop={4} accessibilityRole="button" accessibilityLabel={t('deduction.timeline.bringBack')} style={[s.tool, { width: 'auto', paddingHorizontal: 8 }]}>
          <Text style={[s.toolText, { fontSize: 12 }]}>{t('deduction.timeline.bringBack')}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  rail: { gap: GAP },
  row: {
    height: ROW, flexDirection: 'row', alignItems: 'center', backgroundColor: color.paper, borderRadius: radius.md,
    borderWidth: 1, borderColor: color.paperEdge, paddingRight: 4,
    ...(Platform.OS === 'web' ? ({ userSelect: 'none' } as object) : null),
  },
  rowDragged: { zIndex: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, borderColor: color.stamp },
  rowOutlier: { backgroundColor: color.surface, borderColor: color.burgundy },
  handleZone: { flex: 1, flexDirection: 'row', alignItems: 'center', height: '100%', paddingLeft: space.md, gap: 8, ...(Platform.OS === 'web' ? { cursor: 'grab' as never } : null) },
  pos: { fontFamily: font.monoMedium, fontSize: 12, color: color.stamp, width: 14 },
  grip: { fontFamily: font.mono, fontSize: 12, color: color.inkDim, letterSpacing: -2 },
  cardText: { flex: 1, fontFamily: font.sans, fontSize: 14, lineHeight: 19, color: color.ink },
  tools: { flexDirection: 'row', gap: 2 },
  tool: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  toolText: { fontFamily: font.sansBold, fontSize: 16, color: color.inkDim },
  aside: { marginTop: space.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.md, padding: space.md, gap: space.sm },
  asideHover: { borderColor: color.burgundyBright, backgroundColor: color.burgundyDeep },
  asideLabel: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.4, color: color.textFaint, textTransform: 'uppercase' },
  asideEmpty: { fontFamily: font.sans, fontSize: 13, color: color.textFaint },
});

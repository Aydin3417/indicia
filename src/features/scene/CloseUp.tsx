import { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { altOf, closeUpArt, preload } from '../../art';
import { useLocale } from '../../i18n';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import type { DetailView, ZoneView } from '../../../shared/api';
import { color, font } from '../../theme/tokens';
import { CloseUpArt } from './CloseUpArt';
import type { SceneStringKey } from './strings';
import type { SceneTool } from './types';

const MARK: Record<'uv' | 'dust' | 'camera', string> = { uv: '#A48CFF', dust: '#E8E2D6', camera: '#9AAE9B' };

function DetailMark({ d, tool, size, selected, pending }: { d: DetailView; tool: SceneTool; size: number; selected: boolean; pending: boolean }) {
  const c = size / 2;
  if (d.found) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={c * 0.42} stroke={selected ? color.text : color.greenBright} strokeWidth={1.5} fill="rgba(17,19,21,0.45)" />
        <Path d={`M${c - 5} ${c} l3.5 3.5 l6.5 -7`} stroke={selected ? color.text : color.greenBright} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </Svg>
    );
  }
  if (d.tool && d.tool === tool) {
    const k = MARK[d.tool];
    return (
      <Svg width={size} height={size}>
        {d.tool === 'uv' ? <Circle cx={c} cy={c} r={c * 0.55} fill={k} opacity={pending ? 0.5 : 0.3} /> : null}
        {d.tool === 'dust' ? (
          <>
            <Circle cx={c} cy={c} r={c * 0.5} stroke={k} strokeWidth={1} strokeDasharray="1,3" fill="none" opacity={0.9} />
            <Circle cx={c} cy={c} r={c * 0.32} stroke={k} strokeWidth={1} strokeDasharray="1,3" fill="none" opacity={0.8} />
            <Circle cx={c} cy={c} r={c * 0.14} stroke={k} strokeWidth={1} fill="none" opacity={0.7} />
          </>
        ) : null}
        {d.tool === 'camera' ? (
          <Path d={`M${c - 14} ${c - 6} v-8 h8 M${c + 6} ${c - 14} h8 v8 M${c + 14} ${c + 6} v8 h-8 M${c - 6} ${c + 14} h-8 v-8`} stroke={k} strokeWidth={1.6} fill="none" />
        ) : null}
        <Circle cx={c} cy={c} r={2.2} fill={k} />
      </Svg>
    );
  }
  if (d.tool) {
    // something is there, but this light doesn't show what
    return (
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={c * 0.34} stroke="#8E887C" strokeWidth={1} strokeDasharray="2,3" fill="none" opacity={0.85} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size}>
      {/* a glint that reads on a painted plate: a dark halo under a warm ring, never a solid blob */}
      <Circle cx={c} cy={c} r={c * 0.34} stroke="rgba(14,15,16,0.55)" strokeWidth={4} fill="none" />
      <Circle cx={c} cy={c} r={c * 0.34} stroke="#FFE2B0" strokeWidth={1.3} fill={pending ? 'rgba(255,226,176,0.35)' : 'rgba(255,226,176,0.08)'} />
      <Circle cx={c} cy={c} r={2.4} fill="#FFE9C4" />
    </Svg>
  );
}

export function CloseUp({
  zone, tool, tt, width, selectedDetail, pendingDetail, onDetail,
}: {
  zone: ZoneView;
  tool: SceneTool;
  tt: (k: SceneStringKey) => string;
  width: number;
  selectedDetail: string | null;
  pendingDetail: string | null;
  onDetail: (d: DetailView, at: { x: number; y: number }) => void;
}) {
  // the close-up fills the card's width (a square print with a thin paper border, ART_BIBLE §7)
  const plate = Math.max(120, Math.min(width - 38, 440));
  const art = closeUpArt(zone.id);
  const locale = useLocale();
  useEffect(() => { if (tool === 'uv' && art?.uv) preload([art.uv]); }, [tool, art]);
  const pulse = useSharedValue(0.55);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const details = zone.closeUp?.details ?? [];
  const found = details.filter((d) => d.found);
  const artKey = zone.closeUp?.art ?? zone.id;

  return (
    <Animated.View entering={FadeIn.duration(180)} style={st.wrap}>
      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <View style={st.head}>
          <Text style={st.eyebrow}>{tt('scene.cost.closeUp')}</Text>
          <Text style={st.title} numberOfLines={2}>{zone.label}</Text>
        </View>
        <Animated.View entering={FadeInDown.duration(260)} style={[st.plate, { width: plate + 6, height: plate + 6 }]} testID="closeup-plate">
          {art ? (
            <Image source={(tool === 'uv' && art.uv ? art.uv : art.base).src} style={{ width: plate, height: plate }} resizeMode="cover" accessibilityLabel={altOf(tool === 'uv' && art.uv ? art.uv : art.base, locale)} />
          ) : <CloseUpArt artKey={artKey} size={plate} />}
          {tool === 'uv' && !art?.uv ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(40,20,120,0.35)' }]} /> : null}
          {details.map((d) => {
            const hit = Math.max(48, d.r * plate * 2);
            const left = d.x * plate - hit / 2;
            const top = d.y * plate - hit / 2;
            const dim = !d.found && !(d.tool && d.tool === tool);
            return (
              <Pressable
                key={d.id}
                testID={`detail-${d.id}`}
                accessibilityRole="button"
                accessibilityLabel={d.found ? d.label : tt('scene.closeup.something')}
                onPress={() => onDetail(d, { x: d.x * plate, y: d.y * plate })}
                style={[st.detail, { left, top, width: hit, height: hit }]}
              >
                <Animated.View style={dim ? glow : undefined}>
                  <DetailMark d={d} tool={tool} size={hit} selected={selectedDetail === d.id} pending={pendingDetail === d.id} />
                </Animated.View>
              </Pressable>
            );
          })}
        </Animated.View>
        {zone.closeUp?.text ? <Text style={st.text}>{zone.closeUp.text}</Text> : null}
        <Text style={st.hint}>{found.length === details.length ? tt('scene.closeup.nothingMore') : tt('scene.hint.closeup')}</Text>
        {found.length ? (
          <View style={st.found}>
            <Text style={st.eyebrow}>{tt('scene.closeup.found')}</Text>
            {found.map((d) => (
              <View key={d.id} style={[st.item, selectedDetail === d.id && st.itemOn]} testID={`found-${d.id}`}>
                <Text style={st.itemLabel}>{d.label}</Text>
                {d.text ? <Text style={st.itemText}>{d.text}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
        {/* the way back is the dock's "Back to the room", always in thumb reach: one button, not two (PLAYTEST_V4 §2.2) */}
      </ScrollView>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,9,10,0.94)' },
  content: { alignItems: 'center', paddingTop: 12, paddingBottom: 24, paddingHorizontal: 16 },
  head: { alignSelf: 'stretch', marginBottom: 10 },
  eyebrow: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.6, color: color.textFaint, textTransform: 'uppercase' },
  title: { fontFamily: font.serif, fontSize: 22, lineHeight: 27, color: color.text, marginTop: 2 },
  plate: { borderRadius: 2, overflow: 'hidden', borderWidth: 3, borderColor: color.paperEdge, backgroundColor: '#000' },
  detail: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: font.serifItalic, fontSize: 16, lineHeight: 23, color: color.text, alignSelf: 'stretch', marginTop: 12 },
  hint: { fontFamily: font.sans, fontSize: 12, lineHeight: 16, color: color.textFaint, alignSelf: 'stretch', marginTop: 6 },
  found: { alignSelf: 'stretch', marginTop: 14, gap: 6 },
  item: { borderLeftWidth: 2, borderLeftColor: color.green, paddingLeft: 10, paddingVertical: 4 },
  itemOn: { borderLeftColor: color.amber, backgroundColor: 'rgba(184,154,98,0.08)' },
  itemLabel: { fontFamily: font.sansMedium, fontSize: 14, color: color.text },
  itemText: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.textDim },
});

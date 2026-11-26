import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import type { SceneTool } from './types';
import type { SceneStringKey } from './strings';

export const TOOLS: SceneTool[] = ['torch', 'uv', 'dust', 'camera'];

const ACCENT: Record<SceneTool, string> = { torch: '#E8C77E', uv: '#A48CFF', dust: '#D8D2C4', camera: '#9AAE9B' };

export function ToolIcon({ tool, size = 22, tint }: { tool: SceneTool; size?: number; tint: string }) {
  const p = { stroke: tint, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {tool === 'torch' && (<><Rect x={3} y={9.5} width={10} height={5} rx={1} {...p} /><Path d="M13 8.5l4-2v11l-4-2z" {...p} /><Path d="M19.5 9l2-1M19.5 12h2.5M19.5 15l2 1" {...p} /></>)}
      {tool === 'uv' && (<><Path d="M8 3.5h8l-1 6H9z" {...p} /><Line x1={12} y1={9.5} x2={12} y2={13} {...p} /><Path d="M6 20l2.5-5M12 21v-5.5M18 20l-2.5-5" {...p} /></>)}
      {tool === 'dust' && (<><Path d="M14.5 3.5l3 3-6 6-3-3z" {...p} /><Path d="M8.5 9.5l-3.5 3.5c-1 1-1 4 0 5s4 1 5 0l3.5-3.5" {...p} /><Circle cx={17} cy={15} r={0.6} {...p} /><Circle cx={19.5} cy={18} r={0.6} {...p} /><Circle cx={15.5} cy={19.5} r={0.6} {...p} /></>)}
      {tool === 'camera' && (<><Rect x={3} y={7} width={18} height={12} rx={1.5} {...p} /><Path d="M8.5 7l1.5-2.5h4L15.5 7" {...p} /><Circle cx={12} cy={13} r={3.3} {...p} /></>)}
    </Svg>
  );
}

export function ToolRail({ tool, onChange, tt, disabled }: { tool: SceneTool; onChange: (t: SceneTool) => void; tt: (k: SceneStringKey) => string; disabled?: boolean }) {
  return (
    <View style={st.rail} accessibilityRole="tablist">
      {TOOLS.map((k) => {
        const on = k === tool;
        return (
          <Pressable
            key={k}
            onPress={() => onChange(k)}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={tt(`scene.tool.${k}` as SceneStringKey)}
            testID={`tool-${k}`}
            style={({ pressed }) => [st.tool, on && { borderColor: ACCENT[k], backgroundColor: 'rgba(255,255,255,0.04)' }, pressed && { opacity: 0.7 }]}
          >
            <ToolIcon tool={k} tint={on ? ACCENT[k] : color.textFaint} />
            <Text style={[st.label, { color: on ? ACCENT[k] : color.textFaint }]} numberOfLines={1}>{tt(`scene.tool.${k}` as SceneStringKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const toolAccent = (t: SceneTool) => ACCENT[t];

const st = StyleSheet.create({
  rail: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingTop: 6 },
  tool: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 7, borderWidth: 1, borderColor: 'transparent', borderRadius: 6 },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase' },
});

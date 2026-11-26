import { useState } from 'react';
import { Pressable, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { color, font } from '../../theme/tokens';

/**
 * A paragraph of at most `lines` lines with a "more" toggle (PLAN §5).
 * Overflow is estimated from the measured width and the font size, which works the same on web and native.
 */
export function Clamp({ text, style, lines = 3, fontSize = 16, more, less, tint = color.textFaint, selectable }: {
  text: string; style?: StyleProp<TextStyle>; lines?: number; fontSize?: number; more: string; less: string; tint?: string; selectable?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState(false);
  const perLine = width > 0 ? Math.floor(width / (fontSize * 0.5)) : 40;
  const overflows = text.length > perLine * lines;
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Text style={style} numberOfLines={overflows && !open ? lines : undefined} selectable={selectable}>{text}</Text>
      {overflows ? (
        <Pressable hitSlop={8} onPress={() => setOpen((o) => !o)} style={{ alignSelf: 'flex-start', marginTop: 2 }} accessibilityRole="button">
          <Text style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8, color: tint, textTransform: 'uppercase' }}>{open ? less : more}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

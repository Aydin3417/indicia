import { View } from 'react-native';
import { Icon } from './Icon';
import { color } from '../theme/tokens';
import { useT } from '../i18n';

/** Three-star rating (Truth · Proof · Clock). */
export function Stars({ count, size = 14, max = 3 }: { count: number; size?: number; max?: number }) {
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={t('common.stars', { n: count, max })}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name={i < count ? 'starFilled' : 'star'} size={size} tint={i < count ? color.amber : color.textFaint} weight={1.3} />
      ))}
    </View>
  );
}

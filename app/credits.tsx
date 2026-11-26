import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Divider, Paper, PaperText, Screen, Section, T, TopBar } from '../src/components/ui';
import { OFL_URL, RECORDINGS, TYPEFACES, useCreditsT } from '../src/i18n/credits';
import { useT } from '../src/i18n';
import { color, font, space } from '../src/theme/tokens';

/**
 * Credits (wave 7): the CC BY attribution the room tones require (title, author, source, licence, "modified"), the
 * typefaces and their licence, and where the pictures come from. Reached from Settings.
 */
export default function Credits() {
  const c = useCreditsT();
  const t = useT();
  const open = (url: string) => { Linking.openURL(url).catch(() => undefined); };

  const Link = ({ label, url }: { label: string; url: string }) => (
    <Pressable onPress={() => open(url)} accessibilityRole="link" accessibilityHint={c('credits.openLink', { name: label })} hitSlop={6}>
      <Text style={s.link}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen texture="desk">
      <TopBar title={c('credits.title')} />
      <T v="bodyDim">{c('credits.intro')}</T>

      <Section title={c('credits.sound')}>
        <T v="bodyDim">{c('credits.soundUi')}</T>
        <T v="bodyDim" style={{ marginTop: space.md }}>{c('credits.soundRooms')}</T>
        <View style={{ gap: space.md, marginTop: space.md }}>
          {RECORDINGS.map((r) => (
            <Paper key={r.source} style={s.paper}>
              <PaperText style={s.work} selectable>“{r.title}”</PaperText>
              <PaperText selectable>{r.author}</PaperText>
              <View style={s.meta}>
                <Link label={`${c('credits.licence')}: ${r.licence}`} url={r.licenceUrl} />
                <Link label={`${c('credits.source')}: Wikimedia Commons`} url={r.source} />
              </View>
              <PaperText dim mono style={{ marginTop: space.sm }}>
                {c('credits.usedIn', { rooms: r.rooms.map((k) => c(`credits.room.${k}`)).join(', ') })} · {c('credits.modified')}
              </PaperText>
            </Paper>
          ))}
        </View>
      </Section>

      <Section title={c('credits.fonts')}>
        <View style={{ gap: space.md }}>
          {TYPEFACES.map((f) => (
            <View key={f.name}>
              <T v="heading">{f.name}</T>
              <T v="small" style={{ marginTop: 2 }} selectable>{f.by} · {f.copyright}</T>
              <View style={[s.meta, { marginTop: 4 }]}><Link label="SIL OFL 1.1" url={OFL_URL} /><Link label={c('credits.source')} url={f.url} /></View>
            </View>
          ))}
        </View>
        <T v="bodyDim" style={{ marginTop: space.md }}>{c('credits.fontsText')}</T>
      </Section>

      <Section title={c('credits.art')}>
        <T v="bodyDim">{c('credits.artText')}</T>
      </Section>

      <Section title={c('credits.software')}>
        <T v="bodyDim">{c('credits.softwareText')}</T>
      </Section>

      <Divider style={{ marginTop: space.xxl }} />
      <T v="small">{t('settings.version')}</T>
    </Screen>
  );
}

const s = StyleSheet.create({
  paper: { paddingVertical: space.md },
  work: { fontFamily: font.serifBold, fontSize: 16, lineHeight: 21 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.lg, rowGap: 4, marginTop: space.sm },
  link: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.burgundyBright, textDecorationLine: 'underline' },
});

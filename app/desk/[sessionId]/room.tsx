import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Button, Card, ErrorState, Paper, PaperText, Screen, Section, T, Tag, TopBar, tap } from '../../../src/components/ui';
import { useDesk } from '../../../src/state/desk';
import { toast } from '../../../src/state/toasts';
import { api, ApiFailure } from '../../../src/api/client';
import { useT } from '../../../src/i18n';
import { color, font, radius, space } from '../../../src/theme/tokens';

/** Co-op room for a v2 session: code, invite, players, lock/remove (lead), activity. */
export default function DeskRoom() {
  const t = useT();
  const view = useDesk((s) => s.view)!;
  const online = useDesk((s) => s.online);
  const refresh = useDesk((s) => s.refresh);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState('');
  const room = view.room;
  if (!room) return <ErrorState message={t('desk.room.solo')} />;

  const guard = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try { await fn(); await refresh(); } catch (e) {
      toast({ title: e instanceof ApiFailure ? e.message : t('common.wentWrong'), tone: 'alert' });
    } finally { setBusy(null); }
  };

  const link = Linking.createURL(`/join/${room.code}`);
  const share = async () => {
    api.event('invite_shared', { players: room.players.length });
    const message = t('desk.room.inviteText', { title: view.case.title, code: room.code, link });
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(message);
        toast({ title: t('desk.room.copied'), text: room.code, tone: 'neutral' });
      } catch {
        toast({ title: t('desk.room.codeIs', { code: room.code }), tone: 'neutral' });
      }
      return;
    }
    await Share.share({ message });
  };

  const isOnline = (id: string) => id === view.you || online.includes(id);
  const active = view.status === 'active';

  return (
    <Screen texture="desk">
      <TopBar eyebrow={`${view.case.caseNumber} · ${t('desk.room.eyebrow')}`} title={t('desk.room.title')} />
      <Paper style={s.codeBox}>
        <PaperText mono dim>{t('desk.room.code')}</PaperText>
        <Text style={s.code} selectable>{room.code.split('').join(' ')}</Text>
        <PaperText dim style={{ textAlign: 'center' }}>{t('desk.room.explain', { n: room.maxPlayers })}</PaperText>
        {room.locked ? <PaperText style={{ marginTop: space.sm, color: color.stamp }}>{t('desk.room.locked')}</PaperText> : null}
      </Paper>
      {/* the actions sit on the desk, under the slip of paper with the code */}
      <View>
        {active ? (
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
            <Button label={t('desk.room.invite')} icon="link" onPress={share} style={{ flex: 1 }} disabled={room.locked} />
            {room.isHost ? (
              <Button label={room.locked ? t('desk.room.reopen') : t('desk.room.lock')} icon="lock" kind="secondary" busy={busy === 'lock'}
                onPress={() => guard('lock', () => api.lockRoom(view.sessionId, !room.locked))} style={{ flex: 1 }} />
            ) : null}
          </View>
        ) : null}
      </View>

      {/* wave 6: a friend arriving by invite link from first launch has no name yet — every unnamed member would
          read "Investigator" to the others. Ask once, here, where the names matter. */}
      {active && ['Investigator', t('desk.room.investigator')].includes(room.players.find((p) => p.id === view.you)?.name ?? '') ? (
        <Card accent={color.amber} style={{ marginTop: space.lg, gap: space.sm }}>
          <T v="heading">{t('desk.room.nameTitle')}</T>
          <T v="small">{t('desk.room.nameText')}</T>
          <View style={s.row}>
            <TextInput value={name} onChangeText={setName} maxLength={40} style={s.input} placeholder={t('desk.room.namePlaceholder')}
              placeholderTextColor={color.textFaint} accessibilityLabel={t('desk.room.nameTitle')} testID="room-name" />
            <Button label={t('common.save')} kind="secondary" compact busy={busy === 'name'} disabled={!name.trim()}
              onPress={() => guard('name', () => api.rename(name.trim()))} />
          </View>
        </Card>
      ) : null}

      <Section title={t('desk.room.players', { n: room.players.length, max: room.maxPlayers })}>
        <View style={{ gap: space.sm }}>
          {room.players.map((p) => (
            <Card key={p.id}>
              <View style={s.row}>
                <View style={[s.dot, { backgroundColor: isOnline(p.id) ? color.greenBright : color.border }]} />
                <View style={{ flex: 1 }}>
                  <T v="heading">{p.name}{p.id === view.you ? ` ${t('desk.room.you')}` : ''}</T>
                  <T v="small">{p.role === 'host' ? t('desk.room.leadRole') : t('desk.room.investigator')}</T>
                </View>
                {p.role === 'host' ? <Tag label={t('desk.room.lead')} tint={color.burgundyBright} /> : null}
                {room.isHost && p.id !== view.you && active ? (
                  <Pressable hitSlop={8} onPress={() => { tap(); guard(`lead:${p.id}`, () => useDesk.getState().act('handover', { playerId: p.id })); }}>
                    <T v="small" style={{ color: color.amber }}>{t('coop.room.handTo')}</T>
                  </Pressable>
                ) : null}
                {room.isHost && p.id !== view.you && active ? (
                  <Pressable hitSlop={8} onPress={() => { tap(); guard(`rm:${p.id}`, () => api.removePlayer(view.sessionId, p.id)); }}>
                    <T v="small" style={{ color: color.burgundyBright }}>{t('desk.room.remove')}</T>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      </Section>

      <Section title={t('desk.room.log')}>
        {room.activity.length === 0 ? <T v="bodyDim">{t('desk.room.nothing')}</T> : null}
        {room.activity.slice(0, 30).map((a, i) => (
          <View key={`${a.at}-${i}`} style={s.logRow}>
            <Text style={s.logTime}>{new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <T v="body" style={{ flex: 1 }}><Text style={{ fontFamily: font.sansBold }}>{a.actor}</Text> {a.text}</T>
          </View>
        ))}
      </Section>

      <View style={{ gap: space.sm, marginTop: space.xxl }}>
        <Button label={t('desk.room.toDesk')} onPress={() => router.replace(`/desk/${view.sessionId}`)} />
        {(!room.isHost || room.players.length > 1) && active ? (
          <Button label={room.isHost ? t('coop.room.leadLeave') : t('desk.room.leave')} kind="ghost" busy={busy === 'leave'}
            onPress={() => guard('leave', async () => { await api.leave(view.sessionId); router.replace('/hq'); })} />
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  codeBox: { alignItems: 'center', gap: space.sm },
  code: { fontFamily: font.monoMedium, fontSize: 36, letterSpacing: 4, color: color.ink, marginVertical: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  input: { flex: 1, borderBottomWidth: 1, borderColor: color.border, paddingVertical: 8, fontFamily: font.sans, fontSize: 16, color: color.text },
  logRow: { flexDirection: 'row', gap: space.md, paddingVertical: 6 },
  logTime: { fontFamily: font.mono, fontSize: 11, color: color.textFaint, width: 44, paddingTop: 3 },
});

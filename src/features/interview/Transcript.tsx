import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ClaimView, InterviewLineView } from '../../../shared/api';
import { color, font, radius, space } from '../../theme/tokens';
import { Clamp } from './Clamp';
import type { Say } from './useStrings';

export interface ClaimHooks {
  /** every claim of this suspect, by id */
  claims: Map<string, ClaimView>;
  selected: string | null;
  onSelect: (id: string) => void;
  /** claims that just arrived (highlighted once) */
  fresh: Set<string>;
}

/**
 * The scroll-back record of the session. A suspect's answer is shown once, with its claims as tappable,
 * underlined spans inside the words (PLAYTEST_V2 §7.9); claims that are not a span of the words come as short
 * quotes under the answer. Lines present on first render do not animate.
 */
export function Transcript({ log, say, itemLabel, coop, you, hooks }: {
  log: InterviewLineView[]; say: Say; itemLabel: (id: string) => string; coop: boolean; you?: string; hooks: ClaimHooks;
}) {
  const firstSeq = useRef<number | null>(null);
  if (firstSeq.current === null) firstSeq.current = log.length ? log[log.length - 1].seq : -1;
  // a step out to the desk and straight back (same minute: a free return, wave 9) is not a new interview: drop the
  // "closed · 12:00 / opened · 12:00" pair
  const shown = log.filter((m, i) => {
    const marker = (x: InterviewLineView | undefined, a: string) => x?.from === 'player' && x.action === a;
    const same = (a: InterviewLineView, b: InterviewLineView) => a.at.day === b.at.day && a.at.minute === b.at.minute;
    if (marker(m, 'leave') && marker(log[i + 1], 'start') && same(m, log[i + 1])) return false;
    if (marker(m, 'start') && marker(log[i - 1], 'leave') && same(m, log[i - 1])) return false;
    return true;
  });
  return (
    <View style={{ gap: space.lg }}>
      {shown.map((m) => <Line key={m.seq} m={m} say={say} itemLabel={itemLabel} animate={m.seq > (firstSeq.current ?? -1)} coop={coop} you={you} hooks={hooks} />)}
    </View>
  );
}

function Line({ m, say, itemLabel, animate, coop, hooks }: {
  m: InterviewLineView; say: Say; itemLabel: (id: string) => string; animate: boolean; coop: boolean; you?: string; hooks: ClaimHooks;
}) {
  const entering = animate ? FadeInDown.duration(240) : undefined;
  if (m.from === 'system') {
    return <Animated.Text entering={entering} style={s.system}>{m.text}</Animated.Text>;
  }
  if (m.from === 'player') {
    if (m.action === 'start' || m.action === 'leave') {
      return (
        <Animated.View entering={entering} style={s.marker}>
          <View style={s.rule} />
          <Text style={s.markerText}>{say(m.action === 'start' ? 'interview.log.start' : 'interview.log.leave')} · {m.at.label}</Text>
          <View style={s.rule} />
        </Animated.View>
      );
    }
    const who = coop && m.authorName ? m.authorName : null;
    const label = m.action === 'topic' ? say('interview.log.topic')
      : m.action === 'press' ? say('interview.log.press')
      : m.action === 'present' ? say('interview.log.present')
      : say('interview.log.ask');
    return (
      <Animated.View entering={entering} style={s.player}>
        <Text style={s.playerLabel}>{who ? `${who} · ` : ''}{label}</Text>
        {m.action === 'present' && m.itemId ? <Text style={s.item} numberOfLines={2}>▸ {itemLabel(m.itemId)}</Text> : null}
        {m.text ? (
          <Text style={m.action === 'ask' ? s.playerText : s.playerQuote} numberOfLines={m.action === 'ask' ? undefined : 2}>
            {m.action === 'press' || m.action === 'present' ? `“${m.text}”` : m.text}
          </Text>
        ) : null}
        {m.outcome === 'break' ? <Text style={s.broke}>{say('interview.log.broke')}</Text> : null}
      </Animated.View>
    );
  }
  const tone = m.outcome === 'wrong' ? color.burgundyBright : m.outcome === 'resist' ? color.amber : color.border;
  const hasClaims = !!(m.claims?.length || m.looseClaims?.length);
  return (
    <Animated.View entering={entering} style={[s.suspect, { borderLeftColor: tone }]}>
      {m.emotion ? <Text style={s.emotion}>{say(`interview.emotion.${m.emotion}` as never)}</Text> : null}
      {hasClaims ? <Answer m={m} hooks={hooks} say={say} /> : (
        <Clamp text={m.text} style={s.suspectText} fontSize={17} more={say('interview.more')} less={say('interview.less')} selectable />
      )}
    </Animated.View>
  );
}

/** One answer with its claims inside it. */
function Answer({ m, hooks, say }: { m: InterviewLineView; hooks: ClaimHooks; say: Say }) {
  const parts: { text: string; claim?: ClaimView }[] = [];
  let at = 0;
  for (const span of m.claims ?? []) {
    if (span.start > at) parts.push({ text: m.text.slice(at, span.start) });
    parts.push({ text: m.text.slice(span.start, span.end), claim: hooks.claims.get(span.claimId) });
    at = span.end;
  }
  if (at < m.text.length) parts.push({ text: m.text.slice(at) });
  const loose = (m.looseClaims ?? []).map((id) => hooks.claims.get(id)).filter((c): c is ClaimView => !!c);
  return (
    <View>
      <Text style={s.suspectText}>
        {parts.map((p, i) => {
          if (!p.claim) return <Text key={i}>{p.text}</Text>;
          const c = p.claim;
          const active = c.status === 'active';
          const on = hooks.selected === c.id;
          return (
            <Text
              key={i}
              onPress={active ? () => hooks.onSelect(c.id) : undefined}
              // inline claim: 'link' keeps it inline on the web ('button' is an inline-block and let the full stop
              // after it wrap alone)
              accessibilityRole={active ? 'link' : undefined}
              accessibilityState={active ? { selected: on } : undefined}
              testID={`claim-${c.id}`}
              style={[
                active ? s.claim : null,
                active && hooks.fresh.has(c.id) ? s.claimFresh : null,
                on ? s.claimOn : null,
                c.status === 'broken' ? s.claimBroken : null,
                c.status === 'superseded' ? s.claimOld : null,
              ]}
            >
              {p.text}
            </Text>
          );
        })}
      </Text>
      {loose.length ? (
        <View style={{ gap: 6, marginTop: space.sm }}>
          {loose.map((c) => {
            const active = c.status === 'active';
            const on = hooks.selected === c.id;
            return (
              <Pressable
                key={c.id}
                disabled={!active}
                onPress={() => hooks.onSelect(c.id)}
                accessibilityRole="button"
                testID={`claim-${c.id}`}
                style={[s.loose, on && s.looseOn, c.status === 'broken' && s.looseBroken]}
              >
                <Text style={[s.looseText, active && s.claim, c.status === 'broken' && s.claimBroken, c.status === 'superseded' && s.claimOld]} numberOfLines={2}>“{c.text}”</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {(m.claims ?? []).some((x) => hooks.claims.get(x.claimId)?.status === 'broken') || loose.some((c) => c.status === 'broken') ? (
        <Text style={s.brokenNote}>{say('interview.claim.broken').toUpperCase()}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  system: { fontFamily: font.mono, fontSize: 11, color: color.burgundyBright, textAlign: 'center', letterSpacing: 0.4 },
  marker: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color.border },
  markerText: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1, color: color.textFaint, textTransform: 'uppercase' },
  player: { alignSelf: 'flex-end', maxWidth: '86%', alignItems: 'flex-end', gap: 3 },
  playerLabel: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.1, color: color.textFaint, textTransform: 'uppercase' },
  playerQuote: { fontFamily: font.serifItalic, fontSize: 14, lineHeight: 20, color: color.textDim, textAlign: 'right' },
  playerText: {
    fontFamily: font.sans, fontSize: 15, lineHeight: 21, color: color.text, backgroundColor: color.elevated,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4,
  },
  item: { fontFamily: font.mono, fontSize: 12, lineHeight: 17, color: color.amber, textAlign: 'right' },
  broke: { fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 1.4, color: color.burgundyBright, textTransform: 'uppercase' },
  suspect: { alignSelf: 'flex-start', maxWidth: '94%', borderLeftWidth: 2, paddingLeft: 12 },
  emotion: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.2, color: color.textFaint, textTransform: 'uppercase', marginBottom: 3 },
  suspectText: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.text },
  // a claim on the table: underlined in amber, tappable
  claim: { textDecorationLine: 'underline', textDecorationColor: color.amber, textDecorationStyle: 'solid', color: color.text },
  claimFresh: { backgroundColor: 'rgba(184,154,98,0.12)' },
  claimOn: { backgroundColor: 'rgba(184,154,98,0.28)', color: color.text },
  claimBroken: { textDecorationLine: 'line-through', textDecorationColor: color.burgundyBright, color: color.textDim },
  claimOld: { color: color.textDim },
  loose: { borderLeftWidth: 2, borderLeftColor: color.amber, paddingLeft: space.sm, paddingVertical: 2, borderRadius: radius.sm },
  looseOn: { backgroundColor: 'rgba(184,154,98,0.2)' },
  looseBroken: { borderLeftColor: color.burgundyBright },
  looseText: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 21, color: color.textDim },
  brokenNote: { fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 1.4, color: color.burgundyBright, marginTop: 4 },
});

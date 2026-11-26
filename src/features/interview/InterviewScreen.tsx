import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ClaimView, SuspectV2View, TopicV2View, V2Event } from '../../../shared/api';
import { Button, Eyebrow } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { color, font, radius, space } from '../../theme/tokens';
import type { CardFx } from './ClaimCard';
import { CoachMark } from '../desk/Coach';
import { feel } from './feel';
import { PresentSheet, TopicSheet } from './Sheets';
import { SuspectHeader } from './SuspectHeader';
import { Transcript } from './Transcript';
import { isFailure, type InterviewScreenProps } from './types';
import { minutes, useSay, type Say } from './useStrings';
import type { InterviewStringKey } from './strings';

type Tone = 'good' | 'info' | 'warn' | 'bad';
type Banner = { tone: Tone; text: string; sub?: string; key: number };

/** The interrogation duel (PLAN §3.4). Reads everything from `view`; every action goes through `act`. */
export function InterviewScreen({ view, suspectId, act, onExit, t }: InterviewScreenProps) {
  const say = useSay(t, view.locale);
  const suspect = view.suspects.find((x) => x.id === suspectId);
  if (!suspect) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center', padding: space.xl }]}>
        <Button label={say('interview.leave')} kind="secondary" onPress={onExit} />
      </View>
    );
  }
  return <Duel view={view} suspect={suspect} act={act} onExit={onExit} say={say} />;
}

function Duel({ view, suspect, act, onExit, say }: Omit<InterviewScreenProps, 'suspectId' | 't'> & { suspect: SuspectV2View; say: Say }) {
  const inset = useSafeAreaInsets();
  const { clock } = view;
  const costs = clock.costs;
  const iv = suspect.interview;
  const investigating = view.phase === 'investigating';

  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<'present' | 'topic' | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [askText, setAskText] = useState('');
  const [fx, setFx] = useState<Record<string, CardFx>>({});
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<Banner | null>(null);
  const [reactKey, setReactKey] = useState(0);
  const [costFlash, setCostFlash] = useState<{ n: number; key: number } | null>(null);
  const [fly, setFly] = useState<{ n: number; key: number } | null>(null);
  const [frame, setFrame] = useState({ w: 375, h: 812, header: 110, dock: 140 });
  const seq = useRef(0);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  // ── claims on the table, grouped by topic, most recently touched topic last (nearest the thumb)
  const groups = useMemo(() => {
    const last = new Map<string, number>();
    const owner = new Map<string, string>();
    for (const tp of suspect.topics) for (const c of tp.claims) owner.set(c.id, tp.id);
    for (const m of suspect.log) {
      const tid = m.claimId ? owner.get(m.claimId) : m.action === 'topic' ? suspect.topics.find((x) => x.label === m.text)?.id : undefined;
      if (tid) last.set(tid, m.seq);
    }
    return suspect.topics
      .filter((tp) => tp.state === 'open')
      .map((tp) => ({ topic: tp, claims: tp.claims.filter((c) => c.status !== 'superseded'), at: last.get(tp.id) ?? 0 }))
      .filter((g) => g.claims.length > 0)
      .sort((a, b) => a.at - b.at);
  }, [suspect.topics, suspect.log]);

  const allClaims = useMemo(() => groups.flatMap((g) => g.claims), [groups]);
  const activeClaims = useMemo(() => allClaims.filter((c) => c.status === 'active'), [allClaims]);
  const claimMap = useMemo(() => new Map(suspect.topics.flatMap((tp) => tp.claims.map((c) => [c.id, c] as const))), [suspect.topics]);
  const selectedClaim: ClaimView | undefined = allClaims.find((c) => c.id === selected && c.status === 'active');
  const pick = useCallback((id: string) => { feel('light'); setSelected((cur) => (cur === id ? null : id)); }, []);
  const cycle = () => {
    if (!activeClaims.length) return;
    const i = activeClaims.findIndex((c) => c.id === selected);
    pick(activeClaims[(i + 1) % activeClaims.length].id);
  };
  useEffect(() => { if (selected && !selectedClaim) setSelected(null); }, [selected, selectedClaim]);

  const tried = useMemo(() => new Set(suspect.log.filter((m) => m.action === 'present' && m.claimId === selected && m.itemId).map((m) => m.itemId!)), [suspect.log, selected]);
  const emotion = useMemo(() => [...suspect.log].reverse().find((m) => m.from === 'suspect' && m.emotion)?.emotion, [suspect.log]);
  const notebookCount = view.notebook.facts.length + view.notebook.evidence.length;
  const itemLabel = useCallback((id: string) => {
    const c = view.chips.facts.find((x) => x.id === id) ?? view.chips.evidence.find((x) => x.id === id) ?? view.chips.deductions.find((x) => x.id === id);
    return c?.label ?? id;
  }, [view.chips]);

  // keep the newest exchange in view
  useEffect(() => {
    const h = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(h);
  }, [suspect.log.length, allClaims.length]);

  useEffect(() => {
    if (!banner) return;
    const h = setTimeout(() => setBanner((b) => (b?.key === banner.key ? null : b)), banner.tone === 'warn' || banner.tone === 'bad' ? 4200 : 2800);
    return () => clearTimeout(h);
  }, [banner]);

  const show = (tone: Tone, text: string, sub?: string) => setBanner({ tone, text, sub, key: ++seq.current });

  const react = (e: V2Event, claimId?: string) => {
    const k = ++seq.current;
    if (e.cost > 0) setCostFlash({ n: e.cost, key: k });
    const gained = (e.newFacts?.length ?? 0) + (e.newEvidence?.length ?? 0);
    if (gained) setFly({ n: gained, key: k });
    if (e.newClaims?.length) setFresh(new Set(e.newClaims));
    const lab = e.labReady?.length ? say('interview.fx.labReady') : undefined;
    const card = (kind: CardFx['kind']) => claimId && setFx((f) => ({ ...f, [claimId]: { kind, key: k } }));
    switch (e.kind) {
      case 'present':
        if (e.outcome === 'break') {
          card('crack'); setReactKey(k); feel('break');
          // every breakthrough shows on the composure meter; say how far they slipped
          const c = e.composure;
          const slip = c && c.from !== c.to
            ? say('interview.fx.composure', { from: say(`interview.composure.${c.from}` as never), to: say(`interview.composure.${c.to}` as never) })
            : say('interview.fx.slips');
          show('good', say('interview.fx.break'), lab ? `${slip} · ${lab}` : slip);
        }
        else if (e.outcome === 'resist') { card('shake'); feel('light'); show('info', say('interview.fx.resist'), lab); }
        else if (e.outcome === 'ended') { card('shake'); feel('warning'); show('bad', e.message ?? say('interview.fx.ended'), say('interview.reason.refused')); }
        else { card('shake'); feel('warning'); show('warn', say('interview.fx.wrong'), lab); }
        break;
      case 'press':
        if (e.outcome === 'nothing') { card('nudge'); feel('light'); show('info', say('interview.fx.nothing'), lab); }
        else if (e.outcome === 'colour') { feel('light'); show('info', say('interview.fx.colour'), lab); }
        else { feel('light'); show('good', say(e.outcome === 'advance' ? 'interview.fx.advance' : 'interview.fx.detail'), lab); }
        break;
      case 'ask':
        feel('light');
        show(e.outcome === 'opened' ? 'good' : 'info', say(e.outcome === 'opened' ? 'interview.fx.opened' : e.outcome === 'repeat' ? 'interview.fx.repeat' : 'interview.fx.deflect'), lab);
        break;
      default:
        feel('light');
        if (lab) show('info', lab);
    }
  };

  const run = async (path: string, body: Record<string, unknown>, claimId?: string) => {
    if (busy) return null;
    setBusy(true);
    try {
      const res = await act(path, { suspectId: suspect.id, ...body });
      if (!res) { feel('warning'); show('warn', say('interview.fx.failed')); return null; }
      if (isFailure(res)) {
        feel('warning');
        const r = res.reason;
        const hint = r ? say(`interview.reason.${r}` as InterviewStringKey) : undefined;
        show('warn', res.error, hint && hint !== res.error && !hint.startsWith('interview.') ? hint : undefined);
        if (claimId && r !== 'no_time') setFx((f) => ({ ...f, [claimId]: { kind: 'nudge', key: ++seq.current } }));
        return null;
      }
      react(res.event, claimId);
      return res;
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (busy) return;
    // a follower (a teammate holds it) just walks out; only the holder closes the interview
    const following = !!iv.heldBy && !iv.heldBy.you;
    if (iv.open && investigating && !following) await act('interview/leave', { suspectId: suspect.id }).catch(() => null);
    onExit();
  };

  const raise = (topicId: string) => { setSheet(null); run('topic', { topicId }); };
  const press = () => { if (selectedClaim) run('press', { claimId: selectedClaim.id }, selectedClaim.id); };
  const present = (itemId: string) => {
    setSheet(null);
    if (selectedClaim) run('present', { claimId: selectedClaim.id, itemId }, selectedClaim.id);
  };
  const ask = async () => {
    const text = askText.trim();
    if (!text) return;
    const res = await run('ask', { text });
    if (res) { setAskText(''); setAskOpen(false); }
  };

  // the portrait is the page's anchor: about 40 % of the height, folded to a strip on short screens, while typing,
  // or when the player taps it
  const [folded, setFolded] = useState<boolean | null>(null);
  const compact = askOpen || (folded ?? frame.h < 640);
  const heroH = compact ? 86 : Math.round(Math.min(380, Math.max(250, (frame.h - inset.top) * 0.4)));

  const openTopics = groups.length;
  // tutorial only: one line on how to break a claim, shown once
  const coach = investigating && iv.open ? <CoachMark view={view} where="interview" /> : null;
  const available: TopicV2View[] = suspect.topics.filter((x) => x.state === 'available');

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[s.column, { paddingTop: inset.top }]}
        onLayout={(e) => { const { width, height } = e.nativeEvent.layout; setFrame((f) => ({ ...f, w: width, h: height })); }}
      >
        <View onLayout={(e) => { const h = e.nativeEvent.layout.height; setFrame((f) => ({ ...f, header: h + inset.top })); }}>
          <SuspectHeader
            suspect={suspect} clock={clock} notebookCount={notebookCount} say={say} onLeave={leave}
            reactKey={reactKey} costFlash={costFlash} emotion={emotion}
            width={frame.w} height={heroH} compact={compact} onToggle={() => { feel('light'); setFolded(!compact); }}
          />
        </View>

        <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* one answer, its claims underlined inside it (PLAYTEST_V2 §7.9): no repeated claim cards */}
          <Transcript
            log={suspect.log} say={say} itemLabel={itemLabel} coop={view.mode === 'coop'} you={view.you}
            hooks={{ claims: claimMap, selected: selectedClaim?.id ?? null, onSelect: pick, fresh }}
          />

          {openTopics === 0 && investigating ? <Teach say={say} /> : null}
          {coach ? <View style={{ marginTop: space.sm }}>{coach}</View> : null}
          {busy ? <Text style={s.thinking}>{say('interview.thinking', { name: suspect.name.split(' ')[0] })}</Text> : null}
        </ScrollView>

        {banner ? (
          <Animated.View key={banner.key} entering={FadeInDown.duration(200)} exiting={FadeOut.duration(200)} style={[s.banner, { bottom: frame.dock + space.sm }, bannerTone[banner.tone]]} pointerEvents="none">
            <Text style={s.bannerText}>{banner.text}</Text>
            {banner.sub ? <Text style={s.bannerSub}>{banner.sub}</Text> : null}
          </Animated.View>
        ) : null}

        <View
          style={[s.dock, { paddingBottom: Math.max(inset.bottom, space.md) }]}
          onLayout={(e) => { const h = e.nativeEvent.layout.height; setFrame((f) => ({ ...f, dock: h })); }}
        >
          <Dock
            view={view} suspect={suspect} say={say} busy={busy} selectedClaim={selectedClaim} hasClaims={activeClaims.length > 0}
            openCount={activeClaims.length} onCycle={cycle}
            availableTopics={available.length} askOpen={askOpen} askText={askText}
            onStart={() => run('interview', {})}
            onRaise={() => setSheet('topic')}
            onPress={press}
            onPresent={() => setSheet('present')}
            onDeselect={() => setSelected(null)}
            onAskToggle={() => setAskOpen((o) => !o)}
            onAskText={setAskText}
            onAsk={ask}
            onExit={leave}
          />
        </View>

        <FlyChip fly={fly} frame={frame} say={say} />
      </View>

      <PresentSheet
        visible={sheet === 'present'} onClose={() => setSheet(null)} claim={selectedClaim} view={view} tried={tried}
        cost={costs.present} say={say} onPresent={present}
      />
      <TopicSheet visible={sheet === 'topic'} onClose={() => setSheet(null)} topics={suspect.topics} cost={costs.openTopic} say={say} onRaise={raise} />
    </KeyboardAvoidingView>
  );
}

function Teach({ say }: { say: Say }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.teach}>
      <Eyebrow>{say('interview.empty.title')}</Eyebrow>
      <Text style={s.teachLine}>{say('interview.empty.line1')}</Text>
      <Text style={s.teachLine}>{say('interview.empty.line2')}</Text>
    </Animated.View>
  );
}

/** What the press move says under its label: its cost when it pays, otherwise why it is free or closed. */
function pressNote(say: Say, c: ClaimView, cost: string): string {
  switch (c.press) {
    case 'yes': return say('interview.press.yes', { cost });
    case 'free': return say('interview.press.free');
    case 'later': return say('interview.press.later');
    case 'done': return say('interview.press.done');
    default: return say('interview.press.none');
  }
}

function Dock({
  view, suspect, say, busy, selectedClaim, hasClaims, openCount, availableTopics, askOpen, askText,
  onStart, onRaise, onPress, onPresent, onDeselect, onCycle, onAskToggle, onAskText, onAsk, onExit,
}: {
  view: InterviewScreenProps['view']; suspect: SuspectV2View; say: Say; busy: boolean; selectedClaim?: ClaimView; hasClaims: boolean;
  openCount: number; availableTopics: number; askOpen: boolean; askText: string;
  onStart: () => void; onRaise: () => void; onPress: () => void; onPresent: () => void; onDeselect: () => void; onCycle: () => void;
  onAskToggle: () => void; onAskText: (v: string) => void; onAsk: () => void; onExit: () => void;
}) {
  const { clock } = view;
  const costs = clock.costs;
  const iv = suspect.interview;
  const first = suspect.name.split(' ')[0];

  if (view.phase !== 'investigating') return <Note text={say('interview.closedPhase')} />;

  // co-op: a teammate holds this interview; you follow the log, the moves are theirs (the server says `held`)
  if (iv.heldBy && !iv.heldBy.you) {
    return (
      <View testID="interview-held">
        <Note text={say('interview.heldBy', { name: iv.heldBy.name.split(' ')[0] })} />
        <Button label={say('interview.leave')} kind="secondary" onPress={onExit} style={{ marginTop: space.sm }} />
      </View>
    );
  }

  if (!iv.open) {
    if (iv.refusedToday) return <><Note text={say('interview.refused', { name: first })} tone="bad" /><Button label={say('interview.leave')} kind="secondary" onPress={onExit} /></>;
    if (clock.dayOver) return <><Note text={say(view.mode === 'coop' && !view.room?.isHost ? 'interview.dayOverTeam' : 'interview.dayOver')} tone="warn" /><Button label={say('interview.leave')} kind="secondary" onPress={onExit} /></>;
    if (!suspect.availableNow) {
      const windows = suspect.availability.filter((w) => w.day >= clock.day);
      return (
        <>
          <Note text={say('interview.unavailable')} tone="warn" />
          {windows.map((w) => (
            <Text key={`${w.day}${w.from}`} style={s.window}>
              {say('interview.availability', { d: w.day, from: w.from, to: w.to })}{w.note ? ` · ${w.note}` : ''}
            </Text>
          ))}
          <Button label={say('interview.leave')} kind="secondary" onPress={onExit} style={{ marginTop: space.sm }} />
        </>
      );
    }
    return (
      <>
        {suspect.log.length === 0 ? <Note text={say('interview.start.lead', { name: first })} /> : null}
        <LowTime say={say} left={clock.remainingToday} need={costs.startInterview} />
        <Button label={`${say('interview.start')} · ${minutes(say, costs.startInterview)}`} onPress={onStart} busy={busy} icon="people" />
      </>
    );
  }

  if (selectedClaim) {
    return (
      <Animated.View entering={FadeIn.duration(160)} style={{ gap: space.sm }}>
        <View style={s.selRow}>
          <Text style={s.selText} numberOfLines={1}>“{selectedClaim.text}”</Text>
          <Pressable hitSlop={12} onPress={onDeselect} accessibilityRole="button" accessibilityLabel={say('interview.deselect')}>
            <Icon name="close" size={16} tint={color.textDim} />
          </Pressable>
        </View>
        <LowTime say={say} left={clock.remainingToday} need={Math.min(costs.press, costs.present)} />
        <View style={s.moves}>
          {/* the press says beforehand whether it pays (PLAYTEST_V2 §7.2) */}
          <Move
            label={say('interview.press')} cost={minutes(say, selectedClaim.pressCost || costs.press)} icon="search" onPress={onPress}
            disabled={busy || !selectedClaim.canPress}
            note={pressNote(say, selectedClaim, minutes(say, selectedClaim.pressCost || costs.press))}
          />
          <Move label={say('interview.present')} cost={minutes(say, costs.present)} icon="evidence" onPress={onPresent} disabled={busy} primary />
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={{ gap: space.sm }}>
      {hasClaims ? (
        <View style={s.openRow}>
          <Text style={[s.hint, { flex: 1, textAlign: 'left' }]} numberOfLines={2}>
            {openCount === 1 ? say('interview.claim.open1') : say('interview.claim.open', { n: openCount })} · {say('interview.claim.hint')}
          </Text>
          <Pressable onPress={onCycle} hitSlop={8} style={s.nextBtn} accessibilityRole="button" testID="claim-next">
            <Text style={s.nextText}>{say('interview.claim.next')} ›</Text>
          </Pressable>
        </View>
      ) : null}
      {askOpen ? (
        <View style={s.askRow}>
          <TextInput
            value={askText}
            onChangeText={onAskText}
            placeholder={say('interview.ask.placeholder')}
            placeholderTextColor={color.textFaint}
            style={s.input}
            maxLength={600}
            autoFocus
            returnKeyType="send"
            onSubmitEditing={onAsk}
            blurOnSubmit={false}
          />
          <Pressable onPress={onAsk} disabled={busy || !askText.trim()} style={[s.sendBtn, (busy || !askText.trim()) && { opacity: 0.4 }]} accessibilityRole="button" accessibilityLabel={say('interview.ask.send')}>
            <Icon name="send" size={18} tint={color.text} />
          </Pressable>
        </View>
      ) : null}
      <View style={s.moves}>
        <Button
          label={availableTopics ? `${say('interview.raise')} · ${availableTopics}` : say('interview.raise')}
          onPress={onRaise} icon="bulb" style={{ flex: 1 }} disabled={busy}
          kind={availableTopics ? 'primary' : 'secondary'}
        />
        <Pressable
          onPress={onAskToggle}
          style={[s.askToggle, askOpen && { borderColor: color.amber }]}
          accessibilityRole="button"
          accessibilityLabel={say('interview.ask')}
        >
          <Icon name={askOpen ? 'close' : 'note'} size={18} tint={askOpen ? color.amber : color.textDim} />
        </Pressable>
      </View>
      {!askOpen ? (
        <Pressable onPress={onAskToggle} hitSlop={6} style={{ alignSelf: 'center' }}>
          <Text style={s.askLink}>{say('interview.ask')} · {minutes(say, costs.freeQuestion)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Move({ label, cost, icon, onPress, disabled, primary, note }: {
  label: string; cost: string; icon: 'search' | 'evidence'; onPress: () => void; disabled?: boolean; primary?: boolean; note?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${cost}`}
      style={({ pressed }) => [s.move, primary && s.movePrimary, { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name={icon} size={17} tint={color.text} />
        <Text style={s.moveLabel}>{label}</Text>
      </View>
      <Text style={s.moveCost} numberOfLines={1}>{note ?? cost}</Text>
    </Pressable>
  );
}

function Note({ text, tone }: { text: string; tone?: 'warn' | 'bad' }) {
  return <Text style={[s.note, tone === 'warn' && { color: color.amber }, tone === 'bad' && { color: color.burgundyBright }]}>{text}</Text>;
}

function LowTime({ say, left, need }: { say: Say; left: number; need: number }) {
  if (left >= need * 2) return null;
  return <Text style={[s.note, { color: left < need ? color.burgundyBright : color.amber }]}>{say('interview.lowTime', { n: left })}{left < need ? ` ${say('interview.reason.no_time')}` : ''}</Text>;
}

/** A chip that flies from the dock to the notebook counter when facts or evidence are gained. */
function FlyChip({ fly, frame, say }: { fly: { n: number; key: number } | null; frame: { w: number; h: number; header: number; dock: number }; say: Say }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (!fly) return;
    p.value = 0;
    p.value = withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) });
  }, [fly?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const from = { x: frame.w / 2 - 50, y: frame.h - frame.dock - 70 };
  const to = { x: frame.w - 110, y: frame.header - 40 };
  const st = useAnimatedStyle(() => ({
    opacity: p.value === 0 || p.value === 1 ? 0 : p.value < 0.85 ? 1 : (1 - p.value) / 0.15,
    transform: [
      { translateX: from.x + (to.x - from.x) * p.value },
      { translateY: from.y + (to.y - from.y) * p.value },
      { scale: 1 - 0.35 * p.value },
    ],
  }));
  if (!fly) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.fly, st]}>
      <Icon name="note" size={14} tint={color.ink} />
      <Text style={s.flyText}>{say('interview.fx.notebook', { n: fly.n })}</Text>
    </Animated.View>
  );
}

const bannerTone: Record<Tone, object> = {
  good: { backgroundColor: color.burgundy, borderColor: color.burgundyBright },
  info: { backgroundColor: color.elevated, borderColor: color.border },
  warn: { backgroundColor: color.burgundyDeep, borderColor: color.burgundy },
  bad: { backgroundColor: color.burgundyDeep, borderColor: color.burgundyBright },
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  column: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
  scroll: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg },
  thinking: { fontFamily: font.serifItalic, fontSize: 14, color: color.textFaint },
  teach: { borderWidth: 1, borderColor: color.border, borderStyle: 'dashed', borderRadius: radius.md, padding: space.md, gap: 6 },
  teachLine: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim },
  banner: {
    position: 'absolute', left: space.lg, right: space.lg, borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: space.md, paddingVertical: 10,
  },
  bannerText: { fontFamily: font.sansBold, fontSize: 14, lineHeight: 19, color: color.text },
  bannerSub: { fontFamily: font.sans, fontSize: 12, lineHeight: 16, color: color.textDim, marginTop: 2 },
  dock: {
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border, paddingHorizontal: space.lg, paddingTop: space.md,
    backgroundColor: color.bg, gap: space.sm,
  },
  note: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.textDim, textAlign: 'center' },
  window: { fontFamily: font.mono, fontSize: 12, color: color.textDim, textAlign: 'center' },
  hint: { fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1, color: color.textFaint, textAlign: 'center', textTransform: 'uppercase' },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  nextBtn: { borderWidth: 1, borderColor: color.amber, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 },
  nextText: { fontFamily: font.monoMedium, fontSize: 12, color: color.amber },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  selText: { flex: 1, fontFamily: font.serifItalic, fontSize: 14, color: color.amber },
  moves: { flexDirection: 'row', gap: space.sm },
  move: {
    flex: 1, minHeight: 58, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface,
    alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: space.sm,
  },
  movePrimary: { backgroundColor: color.burgundy, borderColor: color.burgundy },
  moveLabel: { fontFamily: font.sansBold, fontSize: 15, color: color.text },
  moveCost: { fontFamily: font.mono, fontSize: 11, color: 'rgba(232,229,222,0.7)' },
  askToggle: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  askLink: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.6, color: color.textFaint },
  askRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  input: {
    flex: 1, minHeight: 44, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.border,
    paddingHorizontal: space.md, fontFamily: font.sans, fontSize: 15, color: color.text,
  },
  sendBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: color.burgundy, alignItems: 'center', justifyContent: 'center' },
  fly: {
    position: 'absolute', left: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: color.paper, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6,
  },
  flyText: { fontFamily: font.monoMedium, fontSize: 12, color: color.ink },
});

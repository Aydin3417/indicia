// The deduction book (PLAN §3.5): open questions with typed blanks, filled from chips; a timeline variant;
// confirmed deductions stay readable as the case's reasoning so far.
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import type { DeductionBlankView, DeductionView, InvestigationView, V2Event } from '../../../shared/api';
import { color, font, radius, space } from '../../theme/tokens';
import { Textured } from '../../art/components';
import { Btn, Chip, Eyebrow, LandingStamp, LangRoot, MoreText, NewDot, Rise, duration, feel, fmt, useShake, type AnyChip } from './kit';
import { chipIndex, chipsForBlank, labelFor, sentence, tokenize } from './chips';
import { Timeline } from './Timeline';
import { failureText, isOk, type Act, type DeductionBookProps, type Translate } from './types';

type ViewRef = ComponentRef<typeof View>;

type Outcome =
  | { kind: 'confirmed'; message?: string; unlocked: NonNullable<V2Event['unlocked']>; newDeductions: string[] }
  | { kind: 'wrong'; message?: string; cost: number; timeline?: boolean }
  | { kind: 'error'; message: string };

export function DeductionBook({ view, act, t, initialDeductionId, onEvent }: DeductionBookProps) {
  const [openId, setOpenId] = useState<string | null>(initialDeductionId ?? null);
  // questions announced by the last action (they also carry isNew in the view)
  const [announced, setAnnounced] = useState<string[]>([]);
  const open = openId ? view.deductions.find((d) => d.id === openId) : undefined;

  const run: Act = async (path, body) => {
    const r = await act(path, body);
    if (isOk(r)) {
      onEvent?.(r.event);
      if (r.event.newDeductions?.length) setAnnounced(r.event.newDeductions);
    }
    return r;
  };

  return (
    <LangRoot lang={view.locale}>
      {/* the charcoal board the reasoning is pinned to (ART_BIBLE §7, deduction) */}
      <Textured name="charcoal" style={{ flex: 1 }} opacity={0.9}>
        {open
          ? <Question key={open.id} view={view} d={open} act={run} t={t} onBack={() => setOpenId(null)} onOpen={setOpenId} />
          : <Book view={view} t={t} announced={announced} onOpen={(id) => { setAnnounced([]); setOpenId(id); }} />}
      </Textured>
    </LangRoot>
  );
}

// ─────────────────────────────────────────────────────────── the book

function Book({ view, t, announced, onOpen }: { view: InvestigationView; t: Translate; announced: string[]; onOpen: (id: string) => void }) {
  const index = useMemo(() => chipIndex(view), [view]);
  const openQs = view.deductions.filter((d) => d.status === 'open');
  const done = view.deductions.filter((d) => d.status === 'confirmed');
  const fresh = view.deductions.filter((d) => d.status === 'open' && (d.isNew || announced.includes(d.id)));
  const canFile = view.phase === 'investigating';
  const late = view.phase === 'awaiting_finale';

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <Eyebrow>{t('deduction.eyebrow')}</Eyebrow>
      <Text style={s.h1}>{t('deduction.title')}</Text>
      <Text style={s.sub}>{fmt(t('deduction.counts'), { open: openQs.length, done: done.length, total: view.deductionsTotal })}</Text>
      {view.proofStar ? (
        <Text style={s.proofLine} testID="deduction-proof-line">
          {fmt(t(view.proofStar.deductionsConfirmed >= view.proofStar.deductionsNeeded ? 'deduction.proofStarWon' : 'deduction.proofStar'), { done: view.proofStar.deductionsConfirmed, need: view.proofStar.deductionsNeeded, total: view.proofStar.deductionsTotal })}
        </Text>
      ) : null}

      {fresh.length ? (
        <Rise style={s.announce}>
          <Eyebrow tint={color.amber}>{fresh.length === 1 ? t('deduction.newOne') : fmt(t('deduction.newMany'), { n: fresh.length })}</Eyebrow>
          {fresh.length <= 2 ? fresh.map((d) => <Text key={d.id} style={s.announceItem}>{d.title}</Text>) : null}
        </Rise>
      ) : null}

      {late ? <Text style={[s.sub, { marginTop: space.md, color: color.amber }]}>{t('deduction.latePhase')}</Text> : !canFile ? <Text style={[s.sub, { marginTop: space.md }]}>{t('deduction.closedPhase')}</Text> : null}

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        <Eyebrow>{t('deduction.openHeading')}</Eyebrow>
        {openQs.length === 0 ? <Text style={s.empty}>{t('deduction.noneOpen')}</Text> : null}
        {openQs.map((d, i) => (
          <Rise key={d.id} delay={i * 40}>
            <Pressable
              onPress={() => { feel('light'); onOpen(d.id); }}
              accessibilityRole="button"
              accessibilityLabel={d.title}
              style={({ pressed }) => [s.qCard, pressed && { opacity: 0.85 }]}
            >
              <View style={s.qHead}>
                <Text style={s.qTitle}>{d.title}</Text>
                {d.isNew || announced.includes(d.id) ? <NewDot label={t('deduction.new')} /> : null}
              </View>
              <Text style={s.qPrompt} numberOfLines={3}>
                {d.kind === 'timeline' ? d.prompt : sentence(view, d, '＿＿＿', index)}
              </Text>
              <View style={s.qFoot}>
                <Text style={s.qMeta}>{d.kind === 'timeline' ? fmt(t('deduction.cards'), { n: d.cards?.length ?? 0 }) : fmt(t((d.blanks?.length ?? 0) === 1 ? 'deduction.blank1' : 'deduction.blanks'), { n: d.blanks?.length ?? 0 })}</Text>
                {d.attempts ? <Text style={[s.qMeta, { color: color.burgundyBright }]}>{fmt(t(d.attempts === 1 ? 'deduction.attempt' : 'deduction.attempts'), { n: d.attempts })}</Text> : null}
              </View>
              {d.nudge ? <Text style={s.nudge} numberOfLines={2}>{d.nudge}</Text> : null}
            </Pressable>
          </Rise>
        ))}
        <View style={s.locked}>
          <Text style={s.lockGlyph}>⌁</Text>
          <Text style={s.lockText}>{t('deduction.lockedHint')}</Text>
        </View>
      </View>

      {done.length ? (
        <View style={{ marginTop: space.xxl }}>
          <Eyebrow>{t('deduction.reasoning')}</Eyebrow>
          <Textured name="paper" opacity={0.7} style={s.reasoning}>
            {done.map((d, i) => (
              <Pressable key={d.id} onPress={() => onOpen(d.id)} accessibilityRole="button" style={[s.reasonRow, i > 0 && s.reasonRule]}>
                <Text style={s.reasonNum}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.reasonTitle}>{d.title}</Text>
                  <ConfirmedSentence view={view} d={d} index={index} />
                  {d.confirmText ? <Text style={s.reasonNote}>{d.confirmText}</Text> : null}
                </View>
              </Pressable>
            ))}
          </Textured>
        </View>
      ) : null}
    </ScrollView>
  );
}

function ConfirmedSentence({ view, d, index }: { view: InvestigationView; d: DeductionView; index: Map<string, AnyChip> }) {
  if (d.kind === 'timeline') return <ProvenTimeline d={d} />;
  return (
    <Text style={s.paperLine}>
      {tokenize(d.prompt, d.blanks).map((tk, i) => {
        if (tk.kind === 'text') return <Text key={i}>{tk.text}</Text>;
        const b = d.blanks!.find((x) => x.id === tk.id)!;
        return <Text key={i} style={s.paperFill}>{b.filled ? labelFor(view, b, b.filled, index) : '—'}</Text>;
      })}
    </Text>
  );
}

/** A confirmed timeline: the proven order (server sends it once confirmed), the card set aside struck through. */
function ProvenTimeline({ d }: { d: DeductionView }) {
  const cards = d.cards ?? [];
  return (
    <View style={{ gap: 2 }}>
      {cards.map((c, i) => {
        const aside = c.id === d.setAside;
        return (
          <Text key={c.id} style={[s.paperLine, aside && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
            {aside ? '✕ ' : `${i + 1}. `}{c.time ? `${c.time} · ` : ''}{c.text}
          </Text>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────── one question

function Question({ view, d, act, t, onBack, onOpen }: {
  view: InvestigationView; d: DeductionView; act: Act; t: Translate; onBack: () => void; onOpen: (id: string) => void;
}) {
  const index = useMemo(() => chipIndex(view), [view]);
  const blanks = d.blanks ?? [];
  const [fills, setFills] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | undefined>(blanks[0]?.id);
  // the server sends the cards in a stable shuffle (never the solution order), so they start as given
  const [order, setOrder] = useState<string[]>(() => (d.cards ?? []).map((c) => c.id));
  const [outlier, setOutlier] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const { style: shakeStyle, shake } = useShake();
  const slotRefs = useRef<Record<string, ViewRef | null>>({});
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  // the timeline's verdict sits below the cards: bring it into view
  useEffect(() => {
    if (outcome && d.kind === 'timeline') setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [outcome, d.kind]);

  const confirmed = d.status === 'confirmed';
  // filing stays open after the last day (no time left to charge; the server caps wrong tries per question)
  const late = view.phase === 'awaiting_finale';
  // wave 6: with less time left today than a miss costs, the server caps misses too (d.triesLeft while investigating)
  const short = !late && d.triesLeft !== undefined;
  const canFile = (view.phase === 'investigating' && (!short || (d.triesLeft ?? 0) > 0)) || (late && (d.triesLeft ?? 0) > 0);
  const triesLine = fmt(t(short ? 'deduction.shortTries' : 'deduction.lateTries'), { n: d.triesLeft ?? 0 });
  const wrongCost = late ? 0 : Math.min(view.clock.costs.wrongDeduction, view.clock.remainingToday);
  const complete = d.kind === 'timeline'
    ? order.length > 0 && (!d.hasOutlier || !!outlier)
    : blanks.every((b) => !!fills[b.id]);

  const place = (blankId: string, value: string) => {
    setOutcome(null);
    setConfirming(false);
    const next = { ...fills, [blankId]: value };
    setFills(next);
    feel('light');
    const nextEmpty = blanks.find((b) => !next[b.id]);
    setActive(nextEmpty?.id ?? blankId);
  };
  const clear = (blankId: string) => {
    setOutcome(null);
    setConfirming(false);
    setFills(({ [blankId]: _drop, ...rest }) => rest);
    setActive(blankId);
  };

  const file = async () => {
    setBusy(true);
    setConfirming(false);
    const body = d.kind === 'timeline'
      ? { deductionId: d.id, order, ...(d.hasOutlier ? { outlier } : {}) }
      : { deductionId: d.id, fills };
    const r = await act('/deduce', body);
    setBusy(false);
    if (!isOk(r)) {
      const msg = failureText(r);
      if (msg) setOutcome({ kind: 'error', message: msg });
      return;
    }
    const e = r.event;
    if (e.outcome === 'confirmed') {
      feel('heavy');
      setOutcome({ kind: 'confirmed', message: e.message, unlocked: e.unlocked ?? [], newDeductions: e.newDeductions ?? [] });
    } else {
      feel('warning');
      shake();
      setOutcome({ kind: 'wrong', message: e.message, cost: e.cost, timeline: d.kind === 'timeline' });
    }
  };

  // drag a chip onto a slot: measure slots in window coordinates and hit-test the drop point
  const measureSlots = () => new Promise<Record<string, { x: number; y: number; w: number; h: number }>>((resolve) => {
    const ids = Object.keys(slotRefs.current);
    const out: Record<string, { x: number; y: number; w: number; h: number }> = {};
    let left = ids.length;
    if (!left) resolve(out);
    for (const id of ids) {
      const node = slotRefs.current[id];
      if (!node) { if (--left === 0) resolve(out); continue; }
      node.measureInWindow((x: number, y: number, w: number, h: number) => { out[id] = { x, y, w, h }; if (--left === 0) resolve(out); });
    }
  });
  const rects = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const hit = (ax: number, ay: number, type: string) => {
    for (const b of blanks) {
      const r = rects.current[b.id];
      if (r && b.type === type && ax >= r.x - 12 && ax <= r.x + r.w + 12 && ay >= r.y - 12 && ay <= r.y + r.h + 12) return b.id;
    }
    return null;
  };

  const activeBlank = blanks.find((b) => b.id === active);
  const people = view.chips.people;
  const aboutOf = useMemo(() => new Map(view.notebook.facts.map((f) => [f.id, f.about] as const)), [view.notebook.facts]);
  let tray: AnyChip[] = activeBlank ? chipsForBlank(view, activeBlank, d.id) : [];
  if (activeBlank?.type === 'fact' && personFilter) tray = tray.filter((c) => aboutOf.get(c.id)?.includes(personFilter));
  const used = new Set(Object.values(fills));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} contentContainerStyle={[s.page, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" style={s.back}>
          <Text style={s.backText}>‹ {t('deduction.backToBook')}</Text>
        </Pressable>
        <Eyebrow>{d.kind === 'timeline' ? t('deduction.kindTimeline') : t('deduction.kindFill')}</Eyebrow>
        <Text style={s.h1}>{d.title}</Text>
        {d.nudge && !confirmed && !outcome ? <Text style={[s.nudge, { marginTop: space.sm }]}>{fmt(t('deduction.nudge'), { text: d.nudge })}</Text> : null}
        {late && !confirmed ? <Text style={[s.nudge, { marginTop: space.sm }]}>{fmt(t('deduction.lateTries'), { n: d.triesLeft ?? 0 })}</Text> : null}

        {d.kind === 'timeline' ? (
          <>
            <Text style={s.instruction}>{d.prompt}</Text>
            {confirmed && !outcome ? (
              <View style={[s.paper, { marginTop: space.lg }]}>
                <LandingStamp label={t('deduction.stampConfirmed')} size="md" />
                <View style={{ marginTop: space.md }}><ProvenTimeline d={d} /></View>
                {d.confirmText ? <Text style={[s.paperLine, { marginTop: space.md }]}>{d.confirmText}</Text> : null}
              </View>
            ) : (
              <Animated.View style={shakeStyle}>
                <Timeline
                  cards={d.cards ?? []}
                  order={order}
                  outlier={outlier}
                  hasOutlier={!!d.hasOutlier}
                  locked={confirmed || busy}
                  t={t}
                  onChange={(o, out) => { setOutcome(null); setConfirming(false); setOrder(o); setOutlier(out); }}
                />
              </Animated.View>
            )}
            {outcome ? <OutcomePanel view={view} outcome={outcome} t={t} onOpen={onOpen} onBack={onBack} /> : null}
          </>
        ) : (
          <>
            <Animated.View style={[s.paper, { marginTop: space.lg }, shakeStyle]}>
              <View style={s.flow}>
                {tokenize(d.prompt, blanks).flatMap((tk, i) => {
                  if (tk.kind === 'text') {
                    return tk.text.split(/(\s+)/).filter((w) => w.trim()).map((w, j) => <Text key={`${i}.${j}`} style={s.word}>{w}</Text>);
                  }
                  const b = blanks.find((x) => x.id === tk.id)!;
                  const value = confirmed ? b.filled : fills[b.id];
                  return [
                    <Slot
                      key={b.id}
                      refFn={(n) => { slotRefs.current[b.id] = n; }}
                      blank={b}
                      label={value ? labelFor(view, b, value, index) : undefined}
                      typeLabel={b.label || t(`deduction.type.${b.type}`)}
                      active={!confirmed && active === b.id}
                      hover={hoverSlot === b.id}
                      locked={confirmed}
                      onPress={() => { if (confirmed) return; setActive(b.id); feel('light'); }}
                      onClear={() => clear(b.id)}
                      clearLabel={t('deduction.clear')}
                    />,
                  ];
                })}
              </View>
              {confirmed && !outcome ? (
                <View style={{ marginTop: space.lg }}>
                  <LandingStamp label={t('deduction.stampConfirmed')} size="md" />
                  {d.confirmText ? <Text style={[s.paperLine, { marginTop: space.md }]}>{d.confirmText}</Text> : null}
                </View>
              ) : null}
            </Animated.View>
            {outcome ? <OutcomePanel view={view} outcome={outcome} t={t} onOpen={onOpen} onBack={onBack} /> : null}

            {!confirmed && activeBlank ? (
              <View style={{ marginTop: space.xl }}>
                <Eyebrow>{fmt(t('deduction.trayFor'), { what: activeBlank.label || t(`deduction.type.${activeBlank.type}`) })}</Eyebrow>
                <Text style={s.trayHint}>{Platform.OS === 'web' ? t('deduction.trayHintWeb') : t('deduction.trayHint')}</Text>
                {activeBlank.type === 'fact' ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
                    <FilterPill label={t('deduction.filterAll')} on={!personFilter} onPress={() => setPersonFilter(null)} />
                    {people.filter((p) => view.notebook.facts.some((f) => f.about.includes(p.id))).map((p) => (
                      <FilterPill key={p.id} label={p.label.split(' ')[0]} on={personFilter === p.id} onPress={() => setPersonFilter(personFilter === p.id ? null : p.id)} />
                    ))}
                  </ScrollView>
                ) : null}
                <View style={[s.tray, activeBlank.type === 'time' || activeBlank.type === 'person' || activeBlank.type === 'choice' ? s.trayWrap : null]}>
                  {tray.length === 0 ? <Text style={s.empty}>{t('deduction.trayEmpty')}</Text> : null}
                  {tray.map((c) => (
                    <DragChip
                      key={c.id}
                      chip={c}
                      used={used.has(c.id)}
                      compact={activeBlank.type === 'time' || activeBlank.type === 'person' || activeBlank.type === 'choice'}
                      onTap={() => place(activeBlank.id, c.id)}
                      onStart={async () => { rects.current = await measureSlots(); }}
                      onMove={(x, y) => setHoverSlot(hit(x, y, c.type))}
                      onDrop={async (x, y) => {
                        setHoverSlot(null);
                        rects.current = await measureSlots();
                        const target = hit(x, y, c.type);
                        if (target) place(target, c.id);
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}

      </ScrollView>

      {!confirmed && canFile ? (
        <View style={s.footer}>
          {confirming ? (
            <Rise distance={6}>
              <Text style={s.confirmText}>
                {late || short ? triesLine : fmt(t('deduction.confirmCost'), { cost: duration(t, 'deduction', wrongCost), left: duration(t, 'deduction', view.clock.remainingToday) })}
              </Text>
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
                <Btn label={t('deduction.notYet')} kind="secondary" onPress={() => setConfirming(false)} style={{ flex: 1 }} />
                <Btn label={t('deduction.fileNow')} onPress={file} busy={busy} style={{ flex: 1.4 }} />
              </View>
            </Rise>
          ) : (
            <>
              <Text style={s.costLine}>
                {complete ? (late || short ? triesLine : fmt(t('deduction.costLine'), { cost: duration(t, 'deduction', wrongCost) })) : t(d.kind === 'timeline' ? 'deduction.setAsideFirst' : 'deduction.fillAll')}
              </Text>
              <Btn label={t('deduction.file')} onPress={() => { setConfirming(true); feel('medium'); }} disabled={!complete || busy} busy={busy} />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

function FilterPill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={() => { feel('light'); onPress(); }} accessibilityRole="button" accessibilityState={{ selected: on }} style={[s.pill, on && s.pillOn]}>
      <Text style={[s.pillText, on && { color: color.text }]}>{label}</Text>
    </Pressable>
  );
}

function Slot({ refFn, blank, label, typeLabel, active, hover, locked, onPress, onClear, clearLabel }: {
  refFn: (n: ViewRef | null) => void; blank: DeductionBlankView; label?: string; typeLabel: string; active: boolean; hover: boolean; locked: boolean;
  onPress: () => void; onClear: () => void; clearLabel: string;
}) {
  return (
    <View
      ref={refFn}
      collapsable={false}
      style={[{ maxWidth: '100%' }, s.slot, label ? s.slotFilled : null, active && s.slotActive, hover && s.slotHover, locked && s.slotLocked]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label ? `${typeLabel}: ${label}` : typeLabel}
        style={{ flexShrink: 1, minHeight: 22, justifyContent: 'center' }}
      >
        {label ? <Text style={s.slotValue}>{label}</Text> : <Text style={s.slotType}>{typeLabel}</Text>}
      </Pressable>
      {label && !locked ? (
        <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button" accessibilityLabel={clearLabel} style={s.slotClear}>
          <Text style={s.slotClearText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A chip in the tray: tap to place it in the active blank, or drag it onto any blank of its type. */
function DragChip({ chip, used, compact, onTap, onStart, onMove, onDrop }: {
  chip: AnyChip; used: boolean; compact?: boolean; onTap: () => void; onStart: () => void; onMove: (x: number, y: number) => void; onDrop: (x: number, y: number) => void;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const [dragging, setDragging] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const droppedAt = useRef(0);
  const pan = usePanGesture({
    runOnJS: true,
    minDistance: 8,
    activateAfterLongPress: Platform.OS === 'web' ? 0 : 180,
    onActivate: () => { setDragging(true); feel('light'); onStart(); },
    onUpdate: (e) => { tx.value = e.translationX; ty.value = e.translationY; last.current = { x: e.absoluteX, y: e.absoluteY }; onMove(e.absoluteX, e.absoluteY); },
    onDeactivate: (e) => { last.current = { x: e.absoluteX, y: e.absoluteY }; },
    onFinalize: () => {
      // drop wherever the pointer was last seen (also when the platform cancels the gesture at pointer-up)
      if (last.current) { droppedAt.current = Date.now(); onDrop(last.current.x, last.current.y); }
      last.current = null;
      tx.value = withSpring(0, { damping: 18 });
      ty.value = withSpring(0, { damping: 18 });
      setTimeout(() => setDragging(false), 60);
    },
  });
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[st, dragging && s.dragging, compact ? null : { alignSelf: 'stretch' }]}>
        <Chip chip={chip} onPress={() => { if (Date.now() - droppedAt.current > 300) onTap(); }} dim={used} lines={compact ? 1 : 3} />
      </Animated.View>
    </GestureDetector>
  );
}

function OutcomePanel({ view, outcome, t, onOpen, onBack }: {
  view: InvestigationView; outcome: Outcome; t: Translate; onOpen: (id: string) => void; onBack: () => void;
}) {
  if (outcome.kind === 'error') {
    return <Rise style={[s.outcome, { borderColor: color.border }]}><Text style={s.outcomeBody}>{outcome.message}</Text></Rise>;
  }
  if (outcome.kind === 'wrong') {
    return (
      <Rise style={[s.outcome, { borderColor: color.burgundy }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={s.wrongTitle}>{outcome.message || t('deduction.wrong')}</Text>
          {outcome.cost ? <Text style={s.penalty}>−{duration(t, 'deduction', outcome.cost)}</Text> : null}
        </View>
        <Text style={s.outcomeBody}>{t(outcome.timeline ? 'deduction.wrongBodyTimeline' : 'deduction.wrongBody')}</Text>
        <Text style={s.clockNow}>{fmt(t('deduction.clockNow'), { time: view.clock.timeLabel, left: duration(t, 'deduction', view.clock.remainingToday) })}</Text>
      </Rise>
    );
  }
  const newQs = outcome.newDeductions.map((id) => view.deductions.find((d) => d.id === id)).filter((d): d is DeductionView => !!d);
  return (
    <View style={[s.outcome, { borderColor: color.stamp, backgroundColor: color.paper }]}>
      <LandingStamp label={t('deduction.stampConfirmed')} />
      {outcome.message ? <Rise delay={280}><Text style={s.confirmMsg}>{outcome.message}</Text></Rise> : null}
      {outcome.unlocked.length || newQs.length ? (
        <Rise delay={420} style={{ marginTop: space.lg }}>
          <Text style={s.unlockHead}>{t('deduction.unlockedHead')}</Text>
          {outcome.unlocked.map((u) => (
            <View key={`${u.kind}:${u.id}`} style={s.unlockRow}>
              <Text style={s.unlockKind}>{t(`deduction.unlock.${u.kind}`)}</Text>
              <Text style={s.unlockLabel}>{u.label}</Text>
            </View>
          ))}
          {newQs.filter((q) => !outcome.unlocked.some((u) => u.kind === 'deduction' && u.id === q.id)).map((q) => (
            <Pressable key={q.id} onPress={() => onOpen(q.id)} style={s.unlockRow} accessibilityRole="button">
              <Text style={s.unlockKind}>{t('deduction.unlock.deduction')}</Text>
              <Text style={[s.unlockLabel, { textDecorationLine: 'underline' }]}>{q.title}</Text>
            </Pressable>
          ))}
        </Rise>
      ) : null}
      <Rise delay={520} style={{ marginTop: space.lg }}>
        <Btn label={t('deduction.backToBook')} kind="paper" onPress={onBack} />
      </Rise>
    </View>
  );
}

// re-exported for the finale / interview pickers
export { MoreText };

const s = StyleSheet.create({
  page: { padding: space.lg, paddingBottom: space.xxxl },
  h1: { fontFamily: font.serif, fontSize: 26, lineHeight: 31, color: color.text, marginTop: 4 },
  sub: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim, marginTop: 4 },
  proofLine: { fontFamily: font.mono, fontSize: 11.5, letterSpacing: 0.4, lineHeight: 17, color: color.amber, marginTop: 6 },
  empty: { fontFamily: font.sans, fontSize: 14, color: color.textFaint, paddingVertical: space.sm },
  announce: { marginTop: space.lg, borderLeftWidth: 2, borderLeftColor: color.amber, paddingLeft: space.md, paddingVertical: 4, gap: 4 },
  announceItem: { fontFamily: font.serif, fontSize: 18, color: color.text },
  qCard: { backgroundColor: 'rgba(27,31,34,0.92)', borderColor: color.borderSoft, borderWidth: 1, borderRadius: radius.md, padding: space.lg, gap: 6 },
  qHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  qTitle: { fontFamily: font.serif, fontSize: 19, color: color.text, flex: 1 },
  qPrompt: { fontFamily: font.sans, fontSize: 14, lineHeight: 21, color: color.textDim },
  qFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  qMeta: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8, color: color.textFaint },
  locked: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.md, padding: space.lg },
  lockGlyph: { fontFamily: font.mono, fontSize: 18, color: color.textFaint },
  lockText: { flex: 1, fontFamily: font.sans, fontSize: 13, lineHeight: 19, color: color.textFaint },
  reasoning: { marginTop: space.md, backgroundColor: color.paper, borderRadius: radius.sm, borderWidth: 1, borderColor: color.paperEdge, paddingHorizontal: space.lg },
  reasonRow: { flexDirection: 'row', gap: space.md, paddingVertical: space.lg },
  reasonRule: { borderTopWidth: 1, borderTopColor: color.paperEdge },
  reasonNum: { fontFamily: font.monoMedium, fontSize: 12, color: color.stamp, paddingTop: 3 },
  reasonTitle: { fontFamily: font.monoMedium, fontSize: 11, letterSpacing: 1.2, color: color.inkDim, textTransform: 'uppercase', marginBottom: 4 },
  reasonNote: { fontFamily: font.serifItalic, fontSize: 14, lineHeight: 20, color: color.inkDim, marginTop: 6 },
  paper: { backgroundColor: color.paper, borderRadius: radius.sm, borderWidth: 1, borderColor: color.paperEdge, padding: space.lg },
  paperLine: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.ink },
  paperFill: { fontFamily: font.serifBold, color: color.stamp },
  flow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 5, rowGap: 8 },
  word: { fontFamily: font.serif, fontSize: 18, lineHeight: 26, color: color.ink },
  slot: {
    minWidth: 92, minHeight: 34, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.inkDim, borderRadius: radius.md,
    paddingHorizontal: 10, paddingVertical: 5, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  slotFilled: { borderStyle: 'solid', borderColor: color.ink, backgroundColor: 'rgba(30,29,27,0.06)' },
  slotActive: { borderColor: color.stamp, borderWidth: 2, backgroundColor: 'rgba(140,47,51,0.08)' },
  slotHover: { borderColor: color.stamp, borderWidth: 2, backgroundColor: 'rgba(140,47,51,0.16)' },
  slotLocked: { borderStyle: 'solid', borderColor: 'transparent', backgroundColor: 'transparent', paddingHorizontal: 0 },
  slotType: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1, color: color.inkDim, textTransform: 'uppercase' },
  slotValue: { fontFamily: font.serifBold, fontSize: 16, lineHeight: 22, color: color.stamp, flexShrink: 1 },
  slotClear: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,29,27,0.1)' },
  slotClearText: { fontFamily: font.sansBold, fontSize: 13, lineHeight: 16, color: color.inkDim },
  trayHint: { fontFamily: font.sans, fontSize: 12, color: color.textFaint, marginTop: 4 },
  filterRow: { gap: 6, paddingVertical: space.md },
  pill: { borderWidth: 1, borderColor: color.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  pillOn: { borderColor: color.burgundyBright, backgroundColor: color.burgundyDeep },
  pillText: { fontFamily: font.sansMedium, fontSize: 12, color: color.textDim },
  tray: { gap: 6, marginTop: space.sm },
  trayWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  dragging: { zIndex: 50, elevation: 8, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  back: { paddingVertical: space.sm, marginBottom: space.sm, alignSelf: 'flex-start' },
  backText: { fontFamily: font.sansMedium, fontSize: 14, color: color.textDim },
  instruction: { fontFamily: font.sans, fontSize: 15, lineHeight: 22, color: color.textDim, marginTop: space.sm },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.lg, paddingTop: space.md,
    backgroundColor: color.bg, borderTopWidth: 1, borderTopColor: color.borderSoft, gap: space.sm,
  },
  costLine: { fontFamily: font.mono, fontSize: 11.5, letterSpacing: 0.4, color: color.textDim, textAlign: 'center' },
  confirmText: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text, textAlign: 'center' },
  outcome: { marginTop: space.xl, borderWidth: 1, borderRadius: radius.md, padding: space.lg, backgroundColor: color.surface },
  nudge: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.amber, marginTop: 6 },
  wrongTitle: { fontFamily: font.serif, fontSize: 21, color: color.burgundyBright, flex: 1 },
  penalty: { fontFamily: font.monoMedium, fontSize: 14, color: color.burgundyBright },
  outcomeBody: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim, marginTop: space.sm },
  clockNow: { fontFamily: font.mono, fontSize: 11.5, color: color.textFaint, marginTop: space.sm },
  confirmMsg: { fontFamily: font.serif, fontSize: 19, lineHeight: 26, color: color.ink, marginTop: space.lg },
  unlockHead: { fontFamily: font.monoMedium, fontSize: 11, letterSpacing: 1.4, color: color.inkDim, textTransform: 'uppercase', marginBottom: space.sm },
  unlockRow: { flexDirection: 'row', gap: space.md, paddingVertical: 6, borderTopWidth: 1, borderTopColor: color.paperEdge },
  unlockKind: { fontFamily: font.mono, fontSize: 11, color: color.stamp, width: 86, paddingTop: 2, textTransform: 'uppercase' },
  unlockLabel: { flex: 1, fontFamily: font.sansMedium, fontSize: 14, lineHeight: 20, color: color.ink },
});

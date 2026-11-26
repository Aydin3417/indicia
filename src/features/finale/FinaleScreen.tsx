// The finale (PLAN §3.6): choose whom to charge (point of no return), confrontation rounds answered with
// chips (2 tries each), wrong-culprit collapse, the verdict with three stars, and the debrief.
// One beat per screen; the action sits at the bottom, in thumb reach.
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FaceCrop, PortraitPrint } from '../../art/components';
import { coverArt, finaleStage, hasStages, portraitArt, preload, STAGES } from '../../art';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { ChipView, Composure, FinaleRoundView, InvestigationView, OffenceKind, SuspectV2View, V2Event } from '../../../shared/api';
import { color, font, radius, space } from '../../theme/tokens';
import { Btn, Chip, Eyebrow, LandingStamp, LangRoot, MoreText, Rise, duration, feel, fmt, useShake, type AnyChip } from '../deduction/kit';
import { chipIndex } from '../deduction/chips';
import { failureText, isOk, type Act, type Translate } from '../deduction/types';
import { hydrateSessionMemory, useSessionMemory } from '../../state/session';
import { Notebook } from '../notebook/Notebook';
import { playSound } from '../../sound';

export interface FinaleScreenProps {
  view: InvestigationView;
  act: Act;
  onDone: () => void;
  t: Translate;
  /** optional: every server event, for the shell's own feedback */
  onEvent?: (event: V2Event) => void;
}

type Beat =
  | { k: 'intro' }
  | { k: 'choose' }
  | { k: 'confirm'; id: string }
  | { k: 'prelude' }
  | { k: 'round' }
  | { k: 'reaction'; roundId: string }
  | { k: 'collapseDefence' }
  | { k: 'collapse' }
  | { k: 'confession' }
  | { k: 'verdict' }
  | { k: 'debrief' };

function initialBeat(view: InvestigationView): Beat {
  if (view.phase === 'closed' && view.result) return { k: 'verdict' };
  if (view.phase === 'finale' && view.finale) return { k: 'round' };
  return { k: 'intro' };
}

export function FinaleScreen({ view, act, onDone, t, onEvent }: FinaleScreenProps) {
  const [beat, setBeat] = useState<Beat>(() => initialBeat(view));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run: Act = async (path, body) => {
    setBusy(true);
    setError(null);
    const r = await act(path, body);
    setBusy(false);
    if (isOk(r)) onEvent?.(r.event);
    else { const m = failureText(r); if (m) setError(m); }
    return r;
  };

  const suspect = (id?: string) => view.suspects.find((x) => x.id === id);

  const charge = async (accusedId: string) => {
    const r = await run('/finale', { accusedId });
    if (!isOk(r)) return;
    feel('heavy');
    if (r.event.outcome === 'wrongful') setBeat({ k: 'collapseDefence' });
    else setBeat({ k: 'prelude' });
  };

  // co-op, not the lead: the lead's answers move the rounds on; when the case closes, follow to the verdict
  const follower = view.mode === 'coop' && !view.room?.isHost;
  useEffect(() => {
    if (follower && view.result && beat.k === 'round') setBeat(view.result.outcome === 'confession' && view.finale?.confession ? { k: 'confession' } : { k: 'verdict' });
  }, [follower, view.result, view.finale?.confession, beat.k]);

  const afterRound = () => {
    if (view.result) setBeat(view.result.outcome === 'confession' && view.finale?.confession ? { k: 'confession' } : { k: 'verdict' });
    else setBeat({ k: 'round' });
  };

  let body: ReactNode;
  switch (beat.k) {
    case 'intro':
      body = <Intro view={view} t={t} onNext={() => setBeat({ k: 'choose' })} onLater={view.phase === 'investigating' || (view.phase === 'awaiting_finale' && lateWork(view)) ? onDone : undefined} />;
      break;
    case 'choose':
      body = <Choose view={view} t={t} onPick={(id) => setBeat({ k: 'confirm', id })} onBack={() => setBeat({ k: 'intro' })} />;
      break;
    case 'confirm':
      body = (
        <Confirm
          view={view} t={t} id={beat.id} suspect={suspect(beat.id)} busy={busy} error={error}
          onCharge={() => charge(beat.id)} onBack={() => setBeat({ k: 'choose' })}
        />
      );
      break;
    case 'prelude':
      body = <Prelude view={view} t={t} suspect={suspect(view.finale?.accusedId)} onNext={() => setBeat({ k: 'round' })} />;
      break;
    case 'round':
      body = view.finale ? (
        <Round
          key={view.finale.roundIndex}
          view={view} t={t} act={run} busy={busy} error={error} suspect={suspect(view.finale.accusedId)}
          onDecided={(roundId) => setBeat({ k: 'reaction', roundId })}
        />
      ) : null;
      break;
    case 'reaction': {
      const r = view.finale?.rounds.find((x) => x.id === beat.roundId);
      body = r ? <Reaction view={view} t={t} round={r} suspect={suspect(view.finale?.accusedId)} last={!!view.result} onNext={afterRound} /> : null;
      break;
    }
    case 'collapseDefence':
      body = (
        <Beat
          eyebrow={t('finale.collapse.eyebrow')}
          action={<Btn label={t('finale.continue')} onPress={() => setBeat({ k: 'collapse' })} />}
        >
          <Portrait s={suspect(view.finale?.accusedId)} name={view.finale?.accusedName} />
          <Quote text={view.finale?.collapse?.defence ?? ''} t={t} />
        </Beat>
      );
      break;
    case 'collapse':
      body = (
        <Beat eyebrow={t('finale.collapse.eyebrow')} action={<Btn label={t('finale.toVerdict')} onPress={() => setBeat({ k: 'verdict' })} />}>
          <View style={{ marginTop: space.xxl }}>
            <LandingStamp label={t('finale.stamp.collapse')} onLanded={() => feel('warning')} />
          </View>
          <Rise delay={400}><Text style={s.big}>{view.finale?.collapse?.text}</Text></Rise>
        </Beat>
      );
      break;
    case 'confession':
      body = (
        <Beat eyebrow={t('finale.confession.eyebrow')} action={<Btn label={t('finale.toVerdict')} onPress={() => setBeat({ k: 'verdict' })} />}>
          <Portrait s={suspect(view.finale?.accusedId)} name={view.finale?.accusedName} />
          <Quote text={view.finale?.confession ?? ''} t={t} delay={300} />
          <View style={{ marginTop: space.xl }}>
            <LandingStamp label={t('finale.stamp.statement')} tint={color.amber} delay={900} size="md" onLanded={() => feel('heavy')} />
          </View>
        </Beat>
      );
      break;
    case 'verdict':
      body = view.result ? <Verdict view={view} t={t} onNext={() => setBeat({ k: 'debrief' })} /> : null;
      break;
    case 'debrief':
      body = view.result ? <Debrief view={view} t={t} onDone={onDone} /> : null;
      break;
  }

  // the accused, full-bleed behind the confrontation, cracking as rounds are won (ART_BIBLE §7, finale)
  const accusedId = beat.k === 'confirm' ? beat.id : view.finale?.accusedId ?? view.result?.accusedId;
  const backdropBeat = ['confirm', 'prelude', 'round', 'reaction', 'confession', 'collapseDefence', 'verdict'].includes(beat.k);
  // before a name is given (and in the debrief) the case's own poster sits behind the prosecutor's words
  const coverBeat = ['intro', 'choose', 'collapse'].includes(beat.k) && !!coverArt(view.case.id);
  const won = view.finale?.rounds.filter((r) => r.status === 'won').length ?? 0;
  const wrongful = !!view.finale?.collapse || view.result?.outcome === 'wrongful';
  const stage = beat.k === 'confirm' || wrongful ? 'composed'
    : finaleStage(won, view.finale?.rounds.length ?? 0, beat.k === 'confession' || view.result?.outcome === 'confession');
  useEffect(() => {
    if (accusedId && hasStages(accusedId)) preload(STAGES.map((st) => portraitArt(accusedId, st)));
  }, [accusedId]);

  return (
    <LangRoot lang={view.locale} style={s.root}>
      {backdropBeat && accusedId && portraitArt(accusedId) ? <Backdrop id={accusedId} stage={stage} /> : null}
      {coverBeat ? <CoverBackdrop caseId={view.case.id} /> : null}
      <BackdropContext.Provider value={backdropBeat && !!accusedId && !!portraitArt(accusedId) ? 'portrait' : coverBeat ? 'cover' : null}>{body}</BackdropContext.Provider>
    </LangRoot>
  );
}

const BackdropContext = createContext<'portrait' | 'cover' | null>(null);

/** The case poster behind the prosecutor's office beats, darker than a portrait (it carries no face to read). */
function CoverBackdrop({ caseId }: { caseId: string }) {
  const { width, height } = useWindowDimensions();
  const art = coverArt(caseId)!;
  const w = Math.min(width, 520);
  const h = w * (art.h / art.w);
  // the poster sits at the foot, above the action bar; its own empty dark top runs under the words
  const top = Math.max(0, height - h - 150);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={art.src} style={{ position: 'absolute', left: (width - w) / 2, top, width: w, height: h }} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(12,13,14,0.5)' }]} />
    </View>
  );
}

/** The accused's portrait across the whole screen, darkened so text stays readable over it. */
function Backdrop({ id, stage }: { id: string; stage: Composure }) {
  const { width, height } = useWindowDimensions();
  // the whole head and the lamp, as drawn: the print at the screen's width (capped on wide screens), the words below
  const w = Math.min(width, 560);
  const h = Math.min(height, Math.round(w * 4 / 3));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" testID="finale-backdrop">
      <View style={{ position: 'absolute', top: 0, left: (width - w) / 2 }}>
        <PortraitPrint id={id} stage={stage} width={w} height={h} anchorY={0.3} />
      </View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(12,13,14,0.4)' }]} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────── layout pieces

function Beat({ eyebrow, children, action, scroll = true }: { eyebrow?: string; children: ReactNode; action?: ReactNode; scroll?: boolean }) {
  // over the accused's portrait the words start below the face, on a dark caption panel
  const over = useContext(BackdropContext);
  const { height, width } = useWindowDimensions();
  const inner = (
    <>
      {eyebrow ? <Eyebrow tint={over ? color.textDim : undefined}>{eyebrow}</Eyebrow> : null}
      {children}
    </>
  );
  const content = over === 'portrait' ? <View style={s.panel}>{inner}</View> : inner;
  return (
    <View style={{ flex: 1 }}>
      {scroll ? (
        <ScrollView contentContainerStyle={[s.page, over === 'portrait' ? { paddingTop: Math.round(Math.min(height * 0.36, Math.min(width, 560) * 0.62)) } : null, action ? { paddingBottom: 132 } : null]} showsVerticalScrollIndicator={false}>{content}</ScrollView>
      ) : <View style={[s.page, { flex: 1 }]}>{content}</View>}
      {action ? <View style={s.action}><View style={s.column}>{action}</View></View> : null}
    </View>
  );
}

function Portrait({ s: sus, name, small, sub }: { s?: SuspectV2View; name?: string; small?: boolean; sub?: boolean }) {
  const size = small ? 46 : 64;
  const over = useContext(BackdropContext);
  const initials = sus?.initials ?? (name ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <View style={[s.portraitRow, small && { marginTop: sub ? 0 : space.md }]}>
      {/* over the full portrait the face is already there; elsewhere (the list of names) a crop stands in */}
      {over === 'portrait' ? null : <FaceCrop id={sus?.id ?? ''} size={size} initials={initials} tone={sus?.portraitTone} />}
      <View style={{ flex: 1 }}>
        <Text style={small ? s.nameSmall : s.name}>{sus?.name ?? name}</Text>
        {sus && (!small || sub) ? <Text style={s.dim}>{sus.relationship}</Text> : null}
      </View>
    </View>
  );
}

function Quote({ text, t, delay = 0, tint }: { text: string; t: Translate; delay?: number; tint?: string }) {
  return (
    <Rise delay={delay} style={s.quoteBox}>
      <Text style={s.quoteMark}>“</Text>
      <MoreText style={[s.quote, tint ? { color: tint } : null]} moreLabel={t('finale.more')} lessLabel={t('finale.less')} lines={5}>{text}</MoreText>
    </Rise>
  );
}

// ─────────────────────────────────────────────────────────── before the charge

function Intro({ view, t, onNext, onLater }: { view: InvestigationView; t: Translate; onNext: () => void; onLater?: () => void }) {
  const confirmed = view.deductions.filter((d) => d.status === 'confirmed').length;
  const left = view.clock.totalBudget - view.clock.elapsed;
  // the prosecutor's paragraph is read once per case (PLAYTEST_V4 §2.3): coming back to the office later it
  // folds to two lines with "More", and it is marked read as the player leaves this beat
  const read = useSessionMemory((m) => m.introRead.includes(view.sessionId));
  useEffect(() => {
    void hydrateSessionMemory();
    return () => useSessionMemory.getState().markIntroRead(view.sessionId);
  }, [view.sessionId]);
  return (
    <Beat
      eyebrow={t('finale.intro.eyebrow')}
      action={
        <View style={{ gap: space.sm }}>
          <Btn label={t('finale.intro.choose')} onPress={onNext} />
          {onLater ? <Btn label={t(view.phase === 'awaiting_finale' ? 'finale.intro.fileFirst' : 'finale.intro.later')} kind={view.phase === 'awaiting_finale' ? 'secondary' : 'ghost'} onPress={onLater} /> : null}
        </View>
      }
    >
      <Text style={s.h1}>{t('finale.intro.title')}</Text>
      <Rise delay={120}>
        {read
          ? <MoreText style={[s.lead, s.leadRead]} lines={2} moreLabel={t('finale.more')} lessLabel={t('finale.less')} tint={color.amber}>{view.finaleIntro}</MoreText>
          : <Text style={s.lead}>{view.finaleIntro}</Text>}
      </Rise>
      <Rise delay={260} style={s.ledger}>
        <Ledger k={t('finale.intro.deductions')} v={String(confirmed)} />
        <Ledger k={t('finale.intro.facts')} v={String(view.notebook.facts.length)} />
        <Ledger k={t('finale.intro.time')} v={duration(t, 'finale', left)} />
      </Rise>
      {view.proofStar ? (
        <Rise delay={320}>
          <Text style={[s.dim, { marginTop: space.lg, color: color.amber }]} testID="finale-proof-line">
            {fmt(t('finale.intro.proof'), { need: view.proofStar.deductionsNeeded, total: view.proofStar.deductionsTotal, first: view.proofStar.firstTryNeeded, rounds: view.proofStar.roundsTotal, d: view.proofStar.deductionsConfirmed })}
          </Text>
        </Rise>
      ) : null}
      {view.phase === 'investigating' ? <Rise delay={380}><Text style={[s.dim, { marginTop: space.lg }]}>{t('finale.intro.early')}</Text></Rise> : null}
      {view.phase === 'awaiting_finale' && lateWork(view) ? <Rise delay={380}><Text style={[s.dim, { marginTop: space.lg }]}>{fmt(t('finale.intro.late'), { n: view.deductions.filter((d) => d.status === 'open' && (d.triesLeft ?? 0) > 0).length })}</Text></Rise> : null}
    </Beat>
  );
}

/**
 * The case's offence (verdict wording): the result's, else the case's. Wave 7 (CONTRACT_V2 §16): `offence` is exact
 * (murder | theft | arson); older servers send only the two-valued `crime`; murder when the server says nothing.
 */
function crimeOf(view: InvestigationView): OffenceKind {
  return view.result?.offence ?? view.case.offence ?? view.result?.crime ?? view.case.crime ?? 'murder';
}
const TRUTH_PART: Record<OffenceKind, string> = {
  murder: 'finale.star.truthPart', theft: 'finale.star.truthPart_theft', arson: 'finale.star.truthPart_arson',
};

/** After the last day: open questions with tries left, or results waiting to be collected. */
function lateWork(view: InvestigationView): boolean {
  return view.deductions.some((d) => d.status === 'open' && (d.triesLeft ?? 0) > 0) || view.lab.ready > 0;
}

function Ledger({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.ledgerV}>{v}</Text>
      <Text style={s.ledgerK}>{k}</Text>
    </View>
  );
}

function Choose({ view, t, onPick, onBack }: { view: InvestigationView; t: Translate; onPick: (id: string) => void; onBack: () => void }) {
  return (
    <Beat eyebrow={t('finale.choose.eyebrow')} action={<Btn label={t('finale.back')} kind="ghost" onPress={onBack} />}>
      <Text style={s.h1}>{fmt(t('finale.choose.title'), { victim: view.briefing.victim.name })}</Text>
      <View style={{ gap: space.sm, marginTop: space.xl }}>
        {view.accusable.map((a, i) => {
          const sus = view.suspects.find((x) => x.id === a.id);
          return (
            <Rise key={a.id} delay={i * 60}>
              <Pressable
                onPress={() => { feel('medium'); onPick(a.id); }}
                accessibilityRole="button"
                accessibilityLabel={a.name}
                style={({ pressed }) => [s.suspectCard, pressed && { borderColor: color.burgundyBright }]}
              >
                <View style={{ flex: 1 }}><Portrait s={sus} name={a.name} small sub /></View>
                <Text style={s.chev}>›</Text>
              </Pressable>
            </Rise>
          );
        })}
      </View>
    </Beat>
  );
}

function Confirm({ view, t, id, suspect, busy, error, onCharge, onBack }: {
  view: InvestigationView; t: Translate; id: string; suspect?: SuspectV2View; busy: boolean; error: string | null; onCharge: () => void; onBack: () => void;
}) {
  const name = suspect?.name ?? view.accusable.find((a) => a.id === id)?.name ?? id;
  return (
    <Beat
      eyebrow={t('finale.confirm.eyebrow')}
      action={
        <View style={{ gap: space.sm }}>
          <HoldButton label={fmt(t('finale.confirm.hold'), { name: name.split(' ')[0] })} busy={busy} onDone={onCharge} />
          <Btn label={t('finale.confirm.back')} kind="ghost" onPress={onBack} disabled={busy} />
        </View>
      }
    >
      <Portrait s={suspect} name={name} />
      <Rise delay={100}><Text style={s.h1}>{fmt(t('finale.confirm.title'), { name })}</Text></Rise>
      <Rise delay={220} style={s.warn}>
        <Text style={s.warnHead}>{t('finale.confirm.noReturn')}</Text>
        <Text style={s.warnBody}>{t('finale.confirm.body')}</Text>
      </Rise>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </Beat>
  );
}

/** Press and hold to commit: the bar fills; letting go early cancels. */
function HoldButton({ label, onDone, busy, ms = 1200 }: { label: string; onDone: () => void; busy?: boolean; ms?: number }) {
  const p = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [width, setWidth] = useState(0);
  const st = useAnimatedStyle(() => ({ width: p.value * width }));
  const start = () => {
    if (busy) return;
    feel('light');
    p.value = withTiming(1, { duration: ms, easing: Easing.linear });
    timer.current = setTimeout(() => { timer.current = null; feel('heavy'); onDone(); }, ms);
  };
  const stop = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    cancelAnimation(p);
    p.value = withTiming(0, { duration: 180 });
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <Pressable
      onPressIn={start}
      onPressOut={stop}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => onDone()}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[s.hold, busy && { opacity: 0.6 }]}
    >
      <Animated.View style={[s.holdFill, st]} />
      <Text style={s.holdText}>{busy ? '…' : label}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────── the confrontation

function Prelude({ view, t, suspect, onNext }: { view: InvestigationView; t: Translate; suspect?: SuspectV2View; onNext: () => void }) {
  const f = view.finale;
  // the confrontation's opening is the same paragraph the prosecutor just read out: say it once, not twice
  const read = useSessionMemory((m) => m.introRead.includes(view.sessionId));
  const repeat = read && (f?.intro ?? '').trim() === (view.finaleIntro ?? '').trim();
  return (
    <Beat eyebrow={t('finale.prelude.eyebrow')} action={<Btn label={t('finale.prelude.begin')} onPress={onNext} />}>
      <Portrait s={suspect} name={f?.accusedName} />
      {f?.intro && !repeat ? <Rise delay={150}><Text style={s.lead}>{f.intro}</Text></Rise> : null}
      <Rise delay={300}><Text style={s.dim}>{fmt(t('finale.prelude.rules'), { n: f?.rounds.length ?? 0 })}</Text></Rise>
    </Beat>
  );
}

function Pips({ rounds }: { rounds: FinaleRoundView[] }) {
  return (
    <View style={s.pips}>
      {rounds.map((r) => (
        <View
          key={r.id}
          style={[s.pip, r.status === 'won' && { backgroundColor: color.greenBright, borderColor: color.greenBright },
            r.status === 'lost' && { backgroundColor: color.burgundy, borderColor: color.burgundy },
            r.status === 'current' && { borderColor: color.text }]}
        />
      ))}
    </View>
  );
}

function Round({ view, t, act, busy, error, suspect, onDecided }: {
  view: InvestigationView; t: Translate; act: Act; busy: boolean; error: string | null; suspect?: SuspectV2View; onDecided: (roundId: string) => void;
}) {
  const f = view.finale!;
  const round = f.rounds[f.roundIndex] ?? f.rounds.find((r) => r.status === 'current');
  const [picking, setPicking] = useState(false);
  const [chosen, setChosen] = useState<AnyChip | null>(null);
  const [retry, setRetry] = useState<string | null>(null);
  const { style: shakeStyle, shake } = useShake();
  const index = useMemo(() => chipIndex(view), [view]);

  if (!round) return null;
  const n = f.rounds.indexOf(round) + 1;

  // co-op: only the lead answers; everyone else puts an item forward for the lead (POST finale/suggest)
  const lead = view.mode !== 'coop' || !!view.room?.isHost;
  const mine = f.suggestions?.find((x) => x.by.you);
  const present = async () => {
    if (!chosen) return;
    if (!lead) {
      const s2 = await act('/finale/suggest', { itemId: chosen.id });
      if (!isOk(s2)) return;
      feel('light');
      setPicking(false);
      setChosen(null);
      return;
    }
    const r = await act('/finale/answer', { itemId: chosen.id });
    if (!isOk(r)) return;
    const o = r.event.outcome;
    setPicking(false);
    setChosen(null);
    if (o === 'retry') {
      feel('warning');
      shake();
      setRetry(r.event.message ?? t('finale.round.retry'));
      return;
    }
    feel(o === 'won' ? 'heavy' : 'warning');
    onDecided(round.id);
  };

  if (picking) {
    const suggested = round.suggested.map((id) => index.get(id)).filter((c): c is AnyChip => !!c);
    const deductions = view.chips.deductions.filter((d) => !round.suggested.includes(d.id)).map((d) => ({ ...d, type: 'deduction' as const }));
    return (
      <View style={{ flex: 1, backgroundColor: color.bg }}>
        <View style={s.pickHead}>
          <Pressable onPress={() => { setPicking(false); setChosen(null); }} hitSlop={10} accessibilityRole="button">
            <Text style={s.backText}>‹ {t('finale.round.backToDefence')}</Text>
          </Pressable>
          <Text style={s.pickPrompt} numberOfLines={2}>{round.prompt}</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: chosen ? 150 : 40 }}>
          {suggested.length ? (
            <View style={s.pickBlock}>
              <Eyebrow tint={color.amber}>{t('finale.round.suggested')}</Eyebrow>
              <View style={{ gap: 6, marginTop: space.sm }}>
                {suggested.map((c) => <Chip key={c.id} chip={c} selected={chosen?.id === c.id} onPress={() => setChosen(c)} lines={3} />)}
              </View>
            </View>
          ) : null}
          {deductions.length ? (
            <View style={s.pickBlock}>
              <Eyebrow>{t('finale.round.deductions')}</Eyebrow>
              <View style={{ gap: 6, marginTop: space.sm }}>
                {deductions.map((c) => <Chip key={c.id} chip={c} selected={chosen?.id === c.id} onPress={() => setChosen(c)} lines={2} />)}
              </View>
            </View>
          ) : null}
          <Notebook view={view} act={act} t={t} mode="pick" embedded accept={['fact', 'evidence']} onPick={(c: ChipView) => setChosen(c)} />
        </ScrollView>
        {chosen ? (
          <Rise distance={8} style={s.action}>
            <Text style={s.chosenLabel} numberOfLines={2}>{chosen.label}</Text>
            <Btn label={t(lead ? 'finale.round.present' : 'finale.round.suggest')} onPress={present} busy={busy} />
          </Rise>
        ) : null}
      </View>
    );
  }

  return (
    <Beat
      action={
        <View style={{ gap: space.sm }}>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Btn label={t(lead ? 'finale.round.answer' : 'finale.round.suggestOpen')} onPress={() => { setRetry(null); setPicking(true); }} kind={lead ? undefined : 'secondary'} />
        </View>
      }
    >
      <View style={s.roundHead}>
        <Eyebrow>{fmt(t('finale.round.of'), { n, total: f.rounds.length })} · {t(`finale.kind.${round.kind}`)}</Eyebrow>
        <Pips rounds={f.rounds} />
      </View>
      <Portrait s={suspect} name={f.accusedName} small />
      <Animated.View style={shakeStyle}>
        <Quote key={round.id} text={round.defence} t={t} delay={150} />
      </Animated.View>
      <Rise delay={450} style={s.promptBox}>
        <Text style={s.promptText}>{round.prompt}</Text>
        <View style={s.tries}>
          {[0, 1].map((i) => <View key={i} style={[s.try, i < round.triesLeft && s.tryOn]} />)}
          <Text style={s.triesText}>{fmt(t(round.triesLeft === 1 ? 'finale.round.tryLeft' : 'finale.round.triesLeft'), { n: round.triesLeft })}</Text>
        </View>
      </Rise>
      {retry ? <Rise style={s.retry}><Text style={s.retryText}>{retry}</Text></Rise> : null}
      {!lead ? (
        <Text style={[s.dim, { marginTop: space.md }]} testID="finale-follow">
          {t('finale.round.leadAnswers')}{mine ? ` · ${t('finale.round.yourSuggestion')}: ${mine.label}` : ''}
        </Text>
      ) : null}
    </Beat>
  );
}

function Reaction({ view, t, round, suspect, last, onNext }: {
  view: InvestigationView; t: Translate; round: FinaleRoundView; suspect?: SuspectV2View; last: boolean; onNext: () => void;
}) {
  const won = round.status === 'won';
  return (
    <Beat
      eyebrow={t(`finale.kind.${round.kind}`)}
      action={<Btn label={last ? t(view.result?.outcome === 'confession' ? 'finale.continue' : 'finale.toVerdict') : t('finale.round.next')} onPress={onNext} />}
    >
      <View style={{ marginTop: space.lg }}>
        <LandingStamp label={won ? t('finale.stamp.won') : t('finale.stamp.lost')} tint={won ? color.greenBright : color.burgundyBright} size="md" />
      </View>
      {won && round.firstTry ? <Rise delay={200}><Text style={[s.dim, { marginTop: space.sm }]}>{t('finale.round.firstTry')}</Text></Rise> : null}
      <View style={{ height: space.md }} />
      <Portrait s={suspect} name={view.finale?.accusedName} small />
      {round.reaction ? <Quote text={round.reaction} t={t} delay={300} tint={won ? undefined : color.textDim} /> : null}
    </Beat>
  );
}

// ─────────────────────────────────────────────────────────── verdict and debrief

function Verdict({ view, t, onNext }: { view: InvestigationView; t: Translate; onNext: () => void }) {
  const r = view.result!;
  const stamp = t(`finale.stamp.${r.outcome}`);
  const tint = r.outcome === 'confession' ? color.greenBright : r.outcome === 'charged' ? color.amber : color.burgundyBright;
  const stars: { key: 'truth' | 'proof' | 'clock'; on: boolean; why: string }[] = [
    { key: 'truth', on: r.stars.truth, why: r.stars.truth ? t('finale.star.truthYes') : r.culpritCorrect ? t(TRUTH_PART[crimeOf(view)] ?? 'finale.star.truthPart') : t('finale.star.truthNo') },
    { key: 'proof', on: r.stars.proof, why: !r.culpritCorrect ? t('finale.star.void') : r.proofNeeds
      ? fmt(t('finale.star.proofNeed'), { first: r.firstTry, needFirst: r.proofNeeds.firstTry, d: r.deductionsConfirmed, need: r.proofNeeds.deductions, dt: r.deductionsTotal })
      : fmt(t('finale.star.proofWhy'), { first: r.firstTry, rounds: r.roundsTotal, d: r.deductionsConfirmed, dt: r.deductionsTotal }) },
    { key: 'clock', on: r.stars.clock, why: r.culpritCorrect ? fmt(t('finale.star.clockWhy'), { left: duration(t, 'finale', r.minutesLeft), need: duration(t, 'finale', view.clock.clockStar?.minutesLeftNeeded ?? 0) }) : t('finale.star.void') },
  ];
  return (
    <Beat eyebrow={t('finale.verdict.eyebrow')} action={<Btn label={t('finale.verdict.next')} onPress={onNext} />}>
      <Rise><Text style={s.verdictTitle}>{r.title}</Text></Rise>
      <Rise delay={150}><Text style={s.lead}>{r.detail}</Text></Rise>
      <View style={{ marginTop: space.lg }}>
        <LandingStamp label={stamp} tint={tint} delay={350} />
      </View>
      <View style={{ marginTop: space.xl, gap: space.md }}>
        {stars.map((st, i) => <StarRow key={st.key} label={t(`finale.star.${st.key}`)} why={st.why} on={st.on} delay={900 + i * 700} />)}
      </View>
      <Rise delay={900 + 3 * 700} style={{ marginTop: space.lg }}>
        <Text style={s.starCount}>{fmt(t('finale.verdict.count'), { n: r.starCount })}</Text>
      </Rise>
    </Beat>
  );
}

function StarRow({ label, why, on, delay }: { label: string; why: string; on: boolean; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 380, easing: Easing.out(Easing.back(2)) }));
    const id = setTimeout(() => { feel(on ? 'heavy' : 'light'); playSound(on ? 'star' : 'star_dim'); }, delay + 200);
    return () => clearTimeout(id);
  }, [delay, on, p]);
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.6 + p.value * 0.4 }] }));
  const row = useAnimatedStyle(() => ({ opacity: 0.25 + p.value * 0.75 }));
  return (
    <Animated.View style={[s.starRow, row]}>
      <Animated.Text style={[s.star, { color: on ? color.amber : color.textFaint }, st]} accessibilityLabel={on ? '★' : '☆'}>{on ? '★' : '☆'}</Animated.Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.starLabel, !on && { color: color.textDim }]}>{label}</Text>
        <Text style={s.dim}>{why}</Text>
      </View>
    </Animated.View>
  );
}

function Debrief({ view, t, onDone }: { view: InvestigationView; t: Translate; onDone: () => void }) {
  const r = view.result!;
  const d = r.debrief;
  const missed = d.decisiveMissed.length + d.liesMissed.length;
  return (
    <Beat eyebrow={t('finale.debrief.eyebrow')} action={<Btn label={t('finale.debrief.done')} onPress={onDone} />}>
      <Text style={s.h1}>{fmt(t('finale.debrief.killer'), { killer: d.killerName, victim: view.briefing.victim.name })}</Text>
      <View style={{ gap: space.md, marginTop: space.lg }}>
        {d.narrative.map((p, i) => (
          <Rise key={i} delay={Math.min(i, 4) * 80}>
            <MoreText style={s.narr} moreLabel={t('finale.more')} lessLabel={t('finale.less')}>{p}</MoreText>
          </Rise>
        ))}
      </View>

      <Text style={[s.section, { marginTop: space.xxl }]}>{missed ? t('finale.debrief.missed') : t('finale.debrief.nothingMissed')}</Text>
      {d.decisiveMissed.map((e) => <Line key={e.id} text={e.name} />)}
      {d.liesMissed.map((l, i) => <Line key={`lm${i}`} text={lieText(l)} />)}

      <Text style={[s.section, { marginTop: space.xl }]}>{t('finale.debrief.found')}</Text>
      {d.decisiveFound.map((e) => <Line key={e.id} ok text={e.name} />)}
      {d.liesUncovered.map((l, i) => <Line key={`lu${i}`} ok text={lieText(l)} />)}

      <View style={[s.ledger, { marginTop: space.xl }]}>
        <Ledger k={t('finale.debrief.rounds')} v={`${r.roundsWon}/${r.roundsTotal}`} />
        <Ledger k={t('finale.debrief.deductions')} v={`${r.deductionsConfirmed}/${r.deductionsTotal}`} />
        <Ledger k={t('finale.debrief.left')} v={duration(t, 'finale', r.minutesLeft)} />
      </View>
    </Beat>
  );
}

/** The debrief's lie lines often already start with the speaker's first or last name ("Clara: …", "Dahl: …"). */
const lieText = (l: { speaker: string; text: string }) =>
  l.speaker.split(' ').some((n) => n && l.text.startsWith(`${n}:`)) ? l.text : `${l.speaker}: ${l.text}`;

function Line({ ok, text }: { ok?: boolean; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.sm }}>
      <Text style={{ fontFamily: font.monoMedium, color: ok ? color.greenBright : color.burgundyBright, width: 14 }}>{ok ? '✓' : '—'}</Text>
      <Text style={[s.lineText, !ok && { color: color.text }]} numberOfLines={3}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  page: { padding: space.lg, paddingTop: space.xl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  column: { width: '100%', maxWidth: 608, alignSelf: 'center', gap: space.sm },
  panel: {
    backgroundColor: 'rgba(14,15,16,0.86)', borderRadius: radius.md, padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.paperEdge,
  },
  action: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.lg, paddingTop: space.md,
    backgroundColor: color.bg, borderTopWidth: 1, borderTopColor: color.borderSoft, gap: space.sm,
  },
  h1: { fontFamily: font.serif, fontSize: 26, lineHeight: 32, color: color.text, marginTop: space.md },
  lead: { fontFamily: font.serif, fontSize: 18, lineHeight: 27, color: color.text, marginTop: space.lg },
  leadRead: { color: color.textDim },
  big: { fontFamily: font.serif, fontSize: 22, lineHeight: 31, color: color.text, marginTop: space.xl },
  dim: { fontFamily: font.sans, fontSize: 13.5, lineHeight: 19, color: color.textDim, marginTop: 2 },
  ledger: { flexDirection: 'row', marginTop: space.xl, borderTopWidth: 1, borderTopColor: color.border, paddingTop: space.lg },
  ledgerV: { fontFamily: font.serif, fontSize: 22, color: color.text },
  ledgerK: { fontFamily: font.mono, fontSize: 10.5, letterSpacing: 1.1, color: color.textFaint, textTransform: 'uppercase', marginTop: 2 },
  suspectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.surface, borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, padding: space.md },
  chev: { fontFamily: font.sans, fontSize: 24, color: color.textFaint, paddingHorizontal: space.sm },
  portraitRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
  portrait: { borderRadius: radius.sm, padding: 4 },
  portraitInner: { flex: 1, borderWidth: 1, borderColor: 'rgba(232,229,222,0.16)', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: font.serif, fontSize: 22, color: color.text },
  nameSmall: { fontFamily: font.sansMedium, fontSize: 16, color: color.text },
  quoteBox: { marginTop: space.xl, paddingLeft: space.lg, borderLeftWidth: 2, borderLeftColor: color.burgundy },
  quoteMark: { position: 'absolute', left: -6, top: -22, fontFamily: font.serif, fontSize: 48, color: color.burgundy, opacity: 0.6 },
  quote: { fontFamily: font.serifItalic, fontSize: 21, lineHeight: 30, color: color.text },
  warn: { marginTop: space.xl, borderWidth: 1, borderColor: color.burgundy, backgroundColor: color.burgundyDeep, borderRadius: radius.md, padding: space.lg, gap: 6 },
  warnHead: { fontFamily: font.monoMedium, fontSize: 12, letterSpacing: 1.6, color: color.burgundyBright, textTransform: 'uppercase' },
  warnBody: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.text },
  error: { fontFamily: font.sans, fontSize: 13, color: color.burgundyBright, marginTop: space.md, textAlign: 'center' },
  hold: { minHeight: 54, borderRadius: radius.md, borderWidth: 1, borderColor: color.burgundyBright, backgroundColor: color.burgundyDeep, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  holdFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: color.burgundy },
  holdText: { fontFamily: font.sansBold, fontSize: 15, letterSpacing: 0.4, color: color.text },
  roundHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pips: { flexDirection: 'row', gap: 5 },
  pip: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: color.border },
  promptBox: { marginTop: space.xl, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.borderSoft, padding: space.lg, gap: space.md },
  promptText: { fontFamily: font.sansMedium, fontSize: 15, lineHeight: 21, color: color.text },
  tries: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  try: { width: 18, height: 4, borderRadius: 2, backgroundColor: color.border },
  tryOn: { backgroundColor: color.amber },
  triesText: { fontFamily: font.mono, fontSize: 11, color: color.textDim, marginLeft: 4 },
  retry: { marginTop: space.md, borderLeftWidth: 2, borderLeftColor: color.burgundyBright, paddingLeft: space.md },
  retryText: { fontFamily: font.sansMedium, fontSize: 14, color: color.burgundyBright },
  pickHead: { padding: space.lg, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: color.borderSoft, gap: space.sm },
  backText: { fontFamily: font.sansMedium, fontSize: 14, color: color.textDim },
  pickPrompt: { fontFamily: font.serif, fontSize: 18, lineHeight: 24, color: color.text },
  pickBlock: { paddingHorizontal: space.lg, paddingTop: space.lg },
  chosenLabel: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.textDim },
  verdictTitle: { fontFamily: font.serif, fontSize: 34, lineHeight: 40, color: color.text, marginTop: space.md },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.borderSoft, padding: space.md },
  star: { fontSize: 34, lineHeight: 40, width: 40, textAlign: 'center' },
  starLabel: { fontFamily: font.sansBold, fontSize: 15, color: color.text },
  starCount: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.2, color: color.textDim, textAlign: 'center' },
  section: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.6, color: color.textFaint, textTransform: 'uppercase' },
  narr: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.text },
  lineText: { flex: 1, fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim },
});

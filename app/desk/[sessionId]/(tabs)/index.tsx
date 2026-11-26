import { useEffect, useRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { InvestigationView, LabOptionView } from '../../../../shared/api';
import { Button, Card, Eyebrow, Section, T, Tag, tap } from '../../../../src/components/ui';
import { FaceCrop, Textured, useArtReady } from '../../../../src/art/components';
import { labArt, sceneArt } from '../../../../src/art';
import { ForkWaiting } from '../../../../src/features/night';
import { Icon } from '../../../../src/components/Icon';
import { useDesk } from '../../../../src/state/desk';
import { fmtCost, fmtMinutes, useT, type Translate } from '../../../../src/i18n';
import { useAction } from '../../../../src/features/desk/useAction';
import { availabilityLine, fits, fmtGameTime } from '../../../../src/features/desk/format';
import { WaitCard } from '../../../../src/features/desk/WaitCard';
import { color, font, radius, space } from '../../../../src/theme/tokens';
import { TeamMarks, TeamPanel } from '../../../../src/features/coop';

/** Map tab: where you are, where you can go and what it costs, who can be seen now, and the lab bench. */
export default function MapTab() {
  const t = useT();
  const view = useDesk((s) => s.view)!;
  const { focus, at } = useLocalSearchParams<{ focus?: string; at?: string }>();
  const scroll = useRef<ScrollViewInstance>(null);
  const labY = useRef(0);

  useEffect(() => {
    if (focus === 'lab') setTimeout(() => scroll.current?.scrollTo({ y: Math.max(0, labY.current - 8), animated: true }), 60);
  }, [focus, at]);

  const ended = view.phase !== 'investigating';

  return (
    <Textured name="desk" style={{ flex: 1 }}>
    <ScrollView ref={scroll} contentContainerStyle={s.page} showsVerticalScrollIndicator={false} testID="desk-map">
      {ended ? <ProsecutorBanner view={view} t={t} /> : <ReadyBanner view={view} t={t} />}
      {view.fork?.pending ? (
        <ForkWaiting
          fork={view.fork}
          onOpen={() => {
            const day = view.reports.find((r) => r.fork?.id === view.fork?.id)?.day ?? view.reports[view.reports.length - 1]?.day;
            router.push(`/desk/${view.sessionId}/report${day ? `?day=${day}` : ''}`);
          }}
        />
      ) : null}
      <Where view={view} t={t} />
      {view.team ? <TeamPanel view={view} /> : null}
      <Places view={view} t={t} />
      {ended ? null : <Around view={view} t={t} />}
      <View onLayout={(e) => { labY.current = e.nativeEvent.layout.y; }}>
        {/* a case with no lab work at all (the tutorial) does not show an empty bench */}
        {view.lab.jobs.length || view.notebook.evidence.some((e) => e.analyses.length) || !view.case.tutorial ? <LabBench view={view} t={t} /> : null}
      </View>
      <WaitCard view={view} compact />
      <Sergeant view={view} t={t} />
      <Diary view={view} t={t} />
      <Pressable onPress={() => { tap(); router.push(`/desk/${view.sessionId}/briefing`); }} style={s.linkRow} accessibilityRole="button">
        <Icon name="file" size={18} tint={color.textDim} />
        <T v="bodyDim" style={{ flex: 1 }}>{t('desk.map.briefing')}</T>
        <Icon name="chevron" size={16} tint={color.textFaint} />
      </Pressable>
      <Pressable onPress={() => { tap(); router.push('/settings'); }} style={s.linkRow} accessibilityRole="button" testID="desk-settings">
        <Icon name="globe" size={18} tint={color.textDim} />
        <T v="bodyDim" style={{ flex: 1 }}>{t('desk.map.settings')}</T>
        <Icon name="chevron" size={16} tint={color.textFaint} />
      </Pressable>
      <Pressable onPress={() => { tap(); router.replace('/hq'); }} style={s.linkRow} accessibilityRole="button">
        <Icon name="hq" size={18} tint={color.textDim} />
        <T v="bodyDim" style={{ flex: 1 }}>{t('common.backToHq')}</T>
        <Icon name="chevron" size={16} tint={color.textFaint} />
      </Pressable>
      {view.mode === 'coop' ? (
        <Pressable onPress={() => { tap(); router.push(`/desk/${view.sessionId}/room`); }} style={s.linkRow} accessibilityRole="button">
          <Icon name="people" size={18} tint={color.textDim} />
          <T v="bodyDim" style={{ flex: 1 }}>{t('desk.map.room')}</T>
          <Icon name="chevron" size={16} tint={color.textFaint} />
        </Pressable>
      ) : null}
    </ScrollView>
    </Textured>
  );
}

/** Once something is proven, say plainly where the case ends: the confrontation (the strip's gavel is easy to miss). */
function ReadyBanner({ view, t }: { view: InvestigationView; t: Translate }) {
  const confirmed = view.deductions.filter((d) => d.status === 'confirmed').length;
  if (!confirmed) return null;
  return (
    <Card accent={color.border} style={{ marginTop: space.lg }}>
      <Eyebrow>{t('desk.map.readyEyebrow')}</Eyebrow>
      <T v="small" style={{ marginTop: space.sm }}>{t('desk.map.readyText', { n: confirmed, total: view.deductions.length })}</T>
      <Button label={t('desk.map.toProsecutor')} kind="secondary" compact onPress={() => router.push(`/desk/${view.sessionId}/finale`)} style={{ marginTop: space.md, alignSelf: 'flex-start' }} />
    </Card>
  );
}

function ProsecutorBanner({ view, t }: { view: InvestigationView; t: Translate }) {
  return (
    <Card accent={color.burgundyBright} style={{ marginTop: space.lg }}>
      <Eyebrow tint={color.burgundyBright}>{t('desk.map.waitingEyebrow')}</Eyebrow>
      <T v="body" style={{ marginTop: space.sm }}>{t(view.phase === 'closed' ? 'desk.map.closedText' : 'desk.map.waitingText')}</T>
      <Button label={t(view.phase === 'closed' ? 'desk.map.toVerdict' : 'desk.map.toProsecutor')} onPress={() => router.push(`/desk/${view.sessionId}/finale`)} style={{ marginTop: space.md }} />
    </Card>
  );
}

/** Where you stand: the room's painted plate as a print when you are at a scene, else a plain heading. */
function Where({ view, t }: { view: InvestigationView; t: Translate }) {
  const plate = sceneArt(view.scenes.find((sc) => sc.locationId === view.map.current)?.art);
  const place = view.map.places.find((p) => p.id === view.map.current);
  // web: the plate (≈170 KB) loads only once the map is in front, not under the briefing (handoff R, request 2)
  const ready = useArtReady();
  const caption = (
    <>
      <Eyebrow tint={plate ? color.textDim : undefined}>{view.case.caseNumber} · {view.case.title}</Eyebrow>
      <View style={s.whereRow}>
        <Icon name="pin" size={20} tint={color.burgundyBright} />
        <T v="title" style={{ flex: 1 }} numberOfLines={1}>{view.map.currentName}</T>
      </View>
      <T v="small" style={{ marginTop: 2 }}>{view.map.current ? t('desk.map.youAreHere') : t('desk.map.atStation')}</T>
    </>
  );
  if (!plate) return <View style={{ marginTop: space.xl }}>{caption}</View>;
  const open = () => { tap(); if (place?.hasScene && view.phase === 'investigating') router.push(`/desk/${view.sessionId}/scene/${place.id}`); };
  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${view.map.currentName}. ${t('desk.map.search')}`} style={s.whereCard} testID="map-where">
      {ready ? <Image source={plate.base.src} style={s.wherePlate} resizeMode="cover" /> : null}
      <View style={s.whereShade} />
      <View style={s.whereCaption}>{caption}</View>
    </Pressable>
  );
}

function Places({ view, t }: { view: InvestigationView; t: Translate }) {
  const { run, pending } = useAction();
  const ended = view.phase !== 'investigating';
  const go = async (id: string, hasScene: boolean) => {
    const r = await run(`travel:${id}`, 'travel', { locationId: id });
    if (r && hasScene) router.push(`/desk/${view.sessionId}/scene/${id}`);
  };
  return (
    <Section title={t('desk.map.places')}>
      <View style={{ gap: space.sm }}>
        {view.map.places.map((p) => {
          const cost = p.travelCost;
          const affordable = fits(view.clock, cost);
          return (
            <Card key={p.id} accent={p.here ? color.burgundyBright : undefined} style={{ paddingVertical: space.md }}>
              <View style={s.placeHead}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={s.rowBetween}>
                    <T v="heading" style={{ flex: 1 }}>{p.name}</T>
                    {p.here ? <Tag label={t('desk.map.here')} tint={color.burgundyBright} /> : null}
                  </View>
                  <T v="small" style={{ marginTop: 4 }} numberOfLines={2}>{p.summary}</T>
                  {view.team ? <TeamMarks marks={p.team} privatePlace={p.private} kind="place" /> : null}
                </View>
              </View>
              <View style={[s.rowBetween, { marginTop: space.md }]}>
                <T v="small" style={{ color: p.zonesLeft ? color.amber : color.textFaint }}>
                  {p.hasScene ? (p.zonesLeft ? t('desk.map.zonesLeft', { n: p.zonesLeft }) : t('desk.map.zonesDone')) : t('desk.map.noScene')}
                </T>
                {p.here ? (
                  p.hasScene ? (
                    <Button label={t('desk.map.search')} compact icon="search" disabled={ended} onPress={() => router.push(`/desk/${view.sessionId}/scene/${p.id}`)} />
                  ) : null
                ) : (
                  <Button
                    compact
                    kind="secondary"
                    label={affordable ? t('desk.map.go', { cost: fmtCost(t, cost) }) : t('desk.noTime')}
                    disabled={!affordable || ended}
                    busy={pending === `travel:${p.id}`}
                    onPress={() => go(p.id, p.hasScene)}
                  />
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </Section>
  );
}

function Around({ view, t }: { view: InvestigationView; t: Translate }) {
  return (
    <Section title={t('desk.map.around')} right={<Pressable onPress={() => router.navigate(`/desk/${view.sessionId}/people`)} hitSlop={8}><T v="small" style={{ color: color.textDim }}>{t('desk.map.allPeople')}</T></Pressable>}>
      <View style={s.aroundGrid}>
        {view.suspects.map((p) => {
          const a = availabilityLine(t, p, view.clock);
          return (
            <Pressable key={p.id} style={s.aroundItem} onPress={() => { tap(); router.navigate(`/desk/${view.sessionId}/people`); }} accessibilityRole="button" accessibilityLabel={`${p.name}: ${a.text}`}>
              <FaceCrop id={p.id} size={36} stage={p.composure} initials={p.initials} tone={p.portraitTone} ring={a.now ? color.greenBright : undefined} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.aroundName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
                <Text style={[s.aroundWhen, a.now && { color: color.greenBright }]} numberOfLines={2}>{a.text}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Section>
  );
}

function LabBench({ view, t }: { view: InvestigationView; t: Translate }) {
  const { run, pending } = useAction();
  const { lab, clock } = view;
  const slots = Array.from({ length: lab.slots }, (_, i) => lab.jobs.filter((j) => j.status === 'running')[i]);
  const ready = lab.jobs.filter((j) => j.status === 'ready');
  const options: (LabOptionView & { evidence: string })[] = view.notebook.evidence.flatMap((e) =>
    e.analyses.map((a) => ({ ...a, evidence: `${e.code} ${e.name}` })));
  const available = options.filter((o) => o.status === 'available');
  const locked = options.filter((o) => o.status === 'locked');
  const done = options.filter((o) => o.status === 'done');
  const full = lab.running >= lab.slots;
  const closed = view.phase === 'closed' || view.phase === 'finale';

  return (
    <Section title={t('desk.lab.title')} right={<T v="small">{t('desk.lab.free')}</T>}>
      <View style={s.slots}>
        {slots.map((job, i) => (
          <View key={i} style={[s.slot, job && s.slotBusy]} testID={`lab-slot-${i}`}>
            <Eyebrow>{t('desk.lab.slot', { n: i + 1 })}</Eyebrow>
            {job ? (
              <>
                <T v="small" style={{ color: color.text, marginTop: 4 }} numberOfLines={2}>{job.name}</T>
                <Text style={s.countdown}>{fmtMinutes(t, job.minutesLeft)}</Text>
                <T v="small">{t('desk.lab.readyAt', { at: fmtGameTime(t, job.readyAt, clock.day) })}</T>
              </>
            ) : <T v="small" style={{ marginTop: 4, color: color.textFaint }}>{t('desk.lab.empty')}</T>}
          </View>
        ))}
      </View>

      {ready.length ? (
        <Card accent={color.amber} style={{ marginTop: space.md }}>
          <Eyebrow tint={color.amber}>{t('desk.lab.readyTitle', { n: ready.length })}</Eyebrow>
          {ready.map((j) => <T key={j.analysisId} v="body" style={{ marginTop: 4 }}>{j.name}</T>)}
          <Button label={t('desk.lab.collectAll')} icon="check" onPress={() => run('collect', 'lab/collect', {})} busy={pending === 'collect'} style={{ marginTop: space.md }} disabled={closed} />
        </Card>
      ) : null}

      <Eyebrow style={{ marginTop: space.lg, marginBottom: space.sm }}>{t('desk.lab.send')}</Eyebrow>
      {available.length === 0 ? <T v="bodyDim">{t('desk.lab.nothing')}</T> : null}
      <View style={{ gap: space.sm }}>
        {available.map((o) => (
          <View key={o.id} style={s.labRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <T v="heading" numberOfLines={2}>{o.name}</T>
              <T v="small" numberOfLines={1}>{o.evidence}</T>
              <T v="small" style={{ color: color.amber, marginTop: 2 }}>{t('desk.lab.resultIn', { time: fmtMinutes(t, o.minutes) })}</T>
            </View>
            <Button
              compact
              kind="secondary"
              label={full ? t('desk.lab.full') : t('desk.lab.submit')}
              disabled={full || view.phase !== 'investigating'}
              busy={pending === `lab:${o.id}`}
              onPress={() => run(`lab:${o.id}`, 'lab', { analysisId: o.id })}
            />
          </View>
        ))}
      </View>
      {full && available.length ? <T v="small" style={{ marginTop: space.sm, color: color.amber }}>{t('desk.lab.fullNote')}</T> : null}

      {locked.length ? (
        <View style={{ marginTop: space.lg, gap: 6 }}>
          <Eyebrow>{t('desk.lab.locked')}</Eyebrow>
          {locked.map((o) => (
            <View key={o.id} style={s.lockedRow}>
              <Icon name="lock" size={14} tint={color.textFaint} />
              <T v="small" style={{ flex: 1 }}>{o.name}{o.lockedReason ? ` — ${o.lockedReason}` : ''}</T>
            </View>
          ))}
        </View>
      ) : null}

      {done.length ? (
        <View style={{ marginTop: space.lg, gap: space.sm }}>
          <Eyebrow>{t('desk.lab.results')}</Eyebrow>
          {done.map((o) => (
            <View key={o.id} style={s.doneRow}>
              {labArt(o.id, o.discipline) ? <Image source={labArt(o.id, o.discipline)!.src} style={s.doneThumb} resizeMode="cover" /> : null}
              <View style={{ flex: 1, minWidth: 0 }}>
                <T v="heading">{o.name}</T>
                {o.conclusion ? <T v="small" style={{ marginTop: 2 }} numberOfLines={3}>{o.conclusion}</T> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Section>
  );
}

function Sergeant({ view, t }: { view: InvestigationView; t: Translate }) {
  const { run, pending } = useAction();
  const { hints, clock } = view;
  if (view.phase !== 'investigating' && hints.used.length === 0) return null;
  const affordable = fits(clock, hints.cost);
  return (
    <Section title={t('desk.hint.title')}>
      {hints.used.map((h, i) => (
        <View key={i} style={s.hint}><Icon name="bulb" size={16} tint={color.amber} /><T v="bodyDim" style={{ flex: 1 }}>{h}</T></View>
      ))}
      {view.phase === 'investigating' ? (
        hints.available ? (
          <Button
            kind="secondary"
            icon="bulb"
            label={affordable ? t('desk.hint.ask', { cost: fmtCost(t, hints.cost) }) : t('desk.noTime')}
            disabled={!affordable}
            busy={pending === 'hint'}
            onPress={() => run('hint', 'hint')}
            style={{ marginTop: hints.used.length ? space.sm : 0 }}
          />
        ) : <T v="small">{t('desk.hint.none')}</T>
      ) : null}
    </Section>
  );
}

function Diary({ view, t }: { view: InvestigationView; t: Translate }) {
  if (!view.reports.length) return null;
  return (
    <Section title={t('desk.diary.title')}>
      <View style={{ gap: space.sm }}>
        {view.reports.map((r) => (
          <Pressable key={r.day} onPress={() => { tap(); router.push(`/desk/${view.sessionId}/report?day=${r.day}`); }} style={s.linkRow} accessibilityRole="button">
            <Icon name="moon" size={18} tint={color.textDim} />
            <View style={{ flex: 1 }}>
              <T v="body">{t('desk.diary.day', { d: r.day })}</T>
              <T v="small">{t('desk.diary.summary', { facts: r.facts.length, labs: r.labsReady.length })}{r.night ? ` · ${r.night.title}` : ''}</T>
            </View>
            <Icon name="chevron" size={16} tint={color.textFaint} />
          </Pressable>
        ))}
      </View>
    </Section>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: space.lg, paddingBottom: space.xxxl, maxWidth: 760, width: '100%', alignSelf: 'center' },
  whereRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  whereCard: { marginTop: space.lg, height: 208, borderRadius: radius.sm, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: color.paperEdge, backgroundColor: color.surface },
  wherePlate: { position: 'absolute', left: 0, right: 0, top: -24, height: 300, width: '100%' },
  whereShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12,13,14,0.22)' },
  whereCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: 'rgba(14,15,16,0.86)' },
  placeHead: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  aroundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  aroundItem: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, width: '48.5%', padding: space.sm,
    borderWidth: 1, borderColor: color.borderSoft, borderRadius: radius.md, backgroundColor: color.surface,
  },
  aroundName: { fontFamily: font.sansMedium, fontSize: 13, color: color.text },
  aroundWhen: { fontFamily: font.sans, fontSize: 11, lineHeight: 14, color: color.textDim, marginTop: 1 },
  slots: { flexDirection: 'row', gap: space.sm },
  slot: { flex: 1, minHeight: 92, padding: space.md, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.md },
  slotBusy: { borderStyle: 'solid', borderColor: color.amber, backgroundColor: color.surface },
  countdown: { fontFamily: font.monoMedium, fontSize: 18, color: color.amber, marginTop: 6 },
  labRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.borderSoft },
  lockedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  doneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingLeft: space.md, borderLeftWidth: 2, borderLeftColor: color.green },
  doneThumb: { width: 48, height: 48, borderRadius: 2, backgroundColor: color.paper },
  hint: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', marginBottom: space.sm },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, marginTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.borderSoft,
  },
});

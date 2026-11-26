import { Pressable, StyleSheet, View } from 'react-native';
import type { InvestigationView, NightForkView } from '../../../shared/api';
import { Button, Eyebrow, Paper, PaperText, Stamp, tap } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { fmtMinutes, useT, type Translate } from '../../i18n';
import { toast } from '../../state/toasts';
import { color, font, radius, space } from '../../theme/tokens';
import { useAction } from '../desk/useAction';
import type { ArtImage } from '../../art';
import { NightPlate } from './NightPlate';

/** "08:00" + 240 min → "12:00" (the morning a fork's lab job starts at). */
function clockAfter(start: string | undefined, minutes: number): string | undefined {
  const m = /^(\d{1,2}):(\d{2})$/.exec(start ?? '');
  if (!m) return undefined;
  const total = Number(m[1]) * 60 + Number(m[2]) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function costLine(t: Translate, o: NightForkView['options'][number], dayStart: string | undefined): string[] {
  const out: string[] = [];
  out.push(o.minutes > 0 ? t('night.fork.minutes', { time: fmtMinutes(t, o.minutes) }) : t('night.fork.free'));
  if (o.lab) out.push(t('night.fork.lab', { name: o.lab.name, at: clockAfter(dayStart, o.lab.minutes) ?? fmtMinutes(t, o.lab.minutes) }));
  return out;
}

/**
 * The overnight decision (CONTRACT_V2 §13): the night's question, both options with what they cost (morning minutes
 * or a lab slot) and what they bring, side by side on a typed sheet. While pending it answers through
 * POST …/v2/night-choice; once settled (history) it shows which way it went. The night's illustration sits on top.
 */
export function ForkCard({ fork, view, art, altText }: { fork: NightForkView; view: InvestigationView; art?: ArtImage; altText?: string }) {
  const t = useT();
  const { run, pending } = useAction();
  const lead = view.mode !== 'coop' || !!view.room?.isHost;
  const open = fork.pending && !fork.chosen;

  const choose = async (optionId: string) => {
    tap();
    const r = await run(`fork:${optionId}`, 'night-choice', { optionId });
    if (r?.event?.message) toast({ title: t('night.fork.toastTitle'), text: r.event.message, tone: 'neutral' });
  };

  return (
    <View testID="night-fork">
      {art ? <NightPlate art={art} alt={altText} maxHeight={200} style={{ marginBottom: space.md }} /> : null}
      <Paper>
        <View style={s.head}>
          <Eyebrow tint={color.inkDim}>{t('night.fork.eyebrow')}</Eyebrow>
          {open ? <Icon name="moon" size={18} tint={color.inkDim} /> : <Stamp label={t('night.fork.decided')} rotate={-3} />}
        </View>
        <PaperText style={s.title}>{fork.title}</PaperText>
        <PaperText style={{ marginTop: space.sm }}>{fork.text}</PaperText>
        <PaperText style={s.prompt}>{fork.prompt}</PaperText>

        <View style={s.options}>
          {fork.options.map((o) => {
            const chosen = fork.chosen === o.id;
            const faded = !open && !chosen;
            const busy = pending === `fork:${o.id}`;
            return (
              <View
                key={o.id}
                accessibilityLabel={`${o.label}. ${costLine(t, o, view.clock.dayStart).join('. ')}`}
                style={[s.option, chosen && s.optionChosen, faded && s.optionFaded]}
                testID={`fork-option-${o.id}`}
              >
                <PaperText style={s.optLabel}>{o.label}</PaperText>
                {costLine(t, o, view.clock.dayStart).map((line) => (
                  <PaperText key={line} mono style={s.cost}>{line}</PaperText>
                ))}
                <PaperText dim style={{ marginTop: space.sm, fontSize: 13, lineHeight: 19 }}>{o.text}</PaperText>
                {open && o.id === fork.defaultOption ? <PaperText dim mono style={s.default}>{t('night.fork.default')}</PaperText> : null}
                {!open ? <PaperText mono style={[s.default, { color: chosen ? color.stamp : color.inkDim }]}>{t(chosen ? 'night.fork.chosen' : 'night.fork.notChosen')}</PaperText> : null}
                {open && lead ? (
                  <Button label={t('night.fork.choose')} kind="primary" compact busy={busy} disabled={!!pending && !busy} onPress={() => choose(o.id)} style={{ marginTop: space.md, alignSelf: 'flex-start' }} />
                ) : null}
              </View>
            );
          })}
        </View>
        {open && !lead ? <PaperText dim style={{ marginTop: space.md }}>{t('night.fork.leadOnly')}</PaperText> : null}
      </Paper>
    </View>
  );
}

/** A slim reminder on the desk while a fork waits (the report screen holds the full card). */
export function ForkWaiting({ fork, onOpen }: { fork: NightForkView; onOpen: () => void }) {
  const t = useT();
  return (
    <Pressable onPress={() => { tap(); onOpen(); }} accessibilityRole="button" style={s.waiting} testID="night-fork-waiting">
      <Icon name="moon" size={18} tint={color.amber} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Eyebrow tint={color.amber}>{t('night.fork.waiting')}</Eyebrow>
        <PaperText style={{ color: color.text, marginTop: 2 }}>{fork.prompt}</PaperText>
      </View>
      <Eyebrow tint={color.text}>{t('night.fork.open')}</Eyebrow>
    </Pressable>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: font.serif, fontSize: 21, lineHeight: 26, marginTop: space.md },
  prompt: { fontFamily: font.serif, fontSize: 17, lineHeight: 23, marginTop: space.md, color: color.stamp },
  options: { marginTop: space.md, gap: space.sm },
  option: { padding: space.md, borderRadius: radius.sm, borderWidth: 1, borderColor: color.paperEdge, backgroundColor: 'rgba(255,255,255,0.18)' },
  optionChosen: { borderColor: color.stamp, borderWidth: 1.5 },
  optionFaded: { opacity: 0.55 },
  optLabel: { fontFamily: font.sansMedium, fontSize: 15, lineHeight: 20 },
  cost: { marginTop: 4, color: color.stamp },
  default: { marginTop: space.sm, fontSize: 11.5 },
  waiting: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg, padding: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: color.amber, backgroundColor: color.surface,
  },
});

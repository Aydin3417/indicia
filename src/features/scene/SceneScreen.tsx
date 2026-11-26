import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { altOf, preload, sceneArt, type Layered } from '../../art';
import { GestureDetector, useHoverGesture, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing, FadeIn, FadeInDown, useAnimatedReaction, useAnimatedStyle, useFrameCallback, useSharedValue, withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import type { DetailView, InvestigationView, V2Event, ZoneView } from '../../../shared/api';
import { color, font } from '../../theme/tokens';
import { CloseUp } from './CloseUp';
import { makeFeel } from './feel';
import { FlyChip, type Flight } from './FlyChip';
import { CANVAS_H, CANVAS_W, UNITS_H, UNITS_W, clampOffset, flatten, zoneCentre, zoneUnderLight, type FlatZone } from './geometry';
import { SceneArt } from './SceneArt';
import { DustLayer, UvTraces, ZoneMarks } from './SceneLayers';
import { duration, fmt, withFallback, type SceneStringKey } from './strings';
import { Torch, BEAM } from './Torch';
import { ToolRail, toolAccent } from './ToolRail';
import { isFailure, type ActFailure, type ActionResult, type SceneScreenProps, type SceneTool } from './types';
import { playSound } from '../../sound';

const IDLE_MS = 20_000;
/** before the first close-up of a case the glow comes much earlier (PLAYTEST_V2 §7.8) */
const IDLE_FIRST_MS = 7_000;
const TOUCH_LIFT = 44; // on touch the beam sits above the fingertip so the finger doesn't cover it
const EDGE = 46;
const MAX_ZOOM = 2.6;
const MIN_STROKE = 70; // scene units of brushing before a dust probe is offered

type Pending =
  | { kind: 'inspect'; zoneId: string; label: string; cost: number; sx: number; sy: number }
  | { kind: 'probe'; tool: 'uv' | 'dust'; sx: number; sy: number; miss: number; hit: number; label: string; zone?: { id: string; label: string; cost: number } }
  | { kind: 'detail'; zoneId: string; detailId: string; tool: 'uv' | 'dust' | 'camera'; cost: number; label: string };

type Msg = { text: string; tone: 'info' | 'warn' | 'good'; key: number };

interface DustApi {
  add: (x: number, y: number) => void;
  end: () => number[];
}

/** Holds the powder strokes so brushing re-renders only this layer, not the screen. */
const DustCanvas = memo(forwardRef<DustApi, { zones: ZoneView[] }>(function DustCanvas({ zones }, ref) {
  const [strokes, setStrokes] = useState<number[][]>([]);
  const live = useRef<number[]>([]);
  const [, bump] = useState(0);
  useImperativeHandle(ref, () => ({
    add: (x, y) => { live.current.push(x, y); bump((n) => n + 1); },
    end: () => {
      const s = live.current;
      live.current = [];
      if (s.length >= 4) setStrokes((all) => [...all.slice(-24), s]);
      return s;
    },
  }), []);
  return <DustLayer strokes={live.current.length ? [...strokes, live.current] : strokes} zones={zones} />;
}));

function Shimmer({ x, y }: { x: number; y: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [p]);
  const style = useAnimatedStyle(() => ({ opacity: 0.12 + p.value * 0.4, transform: [{ scale: 0.8 + p.value * 0.35 }] }));
  const S = 90;
  return (
    <Animated.View pointerEvents="none" testID="idle-shimmer" style={[{ position: 'absolute', left: x - S / 2, top: y - S / 2, width: S, height: S }, style]}>
      <Svg width={S} height={S}>
        <Circle cx={S / 2} cy={S / 2} r={S * 0.32} stroke="#E8D9B0" strokeWidth={1.2} fill="none" strokeDasharray="2,6" />
        <Circle cx={S / 2} cy={S / 2} r={3} fill="#F4E8C8" />
      </Svg>
    </Animated.View>
  );
}

function Reticle({ x, y, tint }: { x: number; y: number; tint: string }) {
  const S = 56;
  return (
    <Animated.View entering={FadeIn.duration(140)} pointerEvents="none" testID="pending-reticle" style={{ position: 'absolute', left: x - S / 2, top: y - S / 2 }}>
      <Svg width={S} height={S}>
        <Circle cx={S / 2} cy={S / 2} r={18} stroke={tint} strokeWidth={1.2} fill="none" />
        <Line x1={S / 2} y1={2} x2={S / 2} y2={14} stroke={tint} strokeWidth={1.2} />
        <Line x1={S / 2} y1={S - 14} x2={S / 2} y2={S - 2} stroke={tint} strokeWidth={1.2} />
        <Line x1={2} y1={S / 2} x2={14} y2={S / 2} stroke={tint} strokeWidth={1.2} />
        <Line x1={S - 14} y1={S / 2} x2={S - 2} y2={S / 2} stroke={tint} strokeWidth={1.2} />
      </Svg>
    </Animated.View>
  );
}

/**
 * The UV lamp over a painted room: a round window that follows the beam and shows the ultraviolet layer through it
 * (or, for a room without one, the plate washed in indigo), aligned pixel for pixel with the canvas under it.
 */
function UvWindow({ plate, zones, tx, ty, ox, oy, sc }: {
  plate: Layered; zones: ZoneView[]; tx: SharedValue<number>; ty: SharedValue<number>; ox: SharedValue<number>; oy: SharedValue<number>; sc: SharedValue<number>;
}) {
  const R = BEAM * 0.92;
  const win = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value - R }, { translateY: ty.value - R }] }));
  const inner = useAnimatedStyle(() => {
    const s = sc.value || 1;
    return {
      transform: [
        { translateX: ox.value - (tx.value - R) - (CANVAS_W / 2) * (1 - s) },
        { translateY: oy.value - (ty.value - R) - (CANVAS_H / 2) * (1 - s) },
        { scale: s },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[st.uvWin, { width: R * 2, height: R * 2, borderRadius: R }, win]} testID="uv-window">
      <Animated.View style={[st.canvas, inner]}>
        <Image source={(plate.uv ?? plate.base).src} style={st.plate} resizeMode="stretch" />
        {plate.uv ? null : <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,14,86,0.72)' }]} />}
        {/* hidden traces the lamp has already found stay marked */}
        <View style={StyleSheet.absoluteFill}><UvTraces plan={[]} zones={zones} seedKey="none" bare /></View>
      </Animated.View>
    </Animated.View>
  );
}

function ExitIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" stroke={color.textDim} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SceneScreen(props: SceneScreenProps) {
  const { view: propView, locationId, act, onExit, t, idleAssist = true, haptics = true } = props;
  const tt = useMemo(() => withFallback(t), [t]);
  const feel = useMemo(() => makeFeel(haptics), [haptics]);
  const insets = useSafeAreaInsets();

  // The server's newest view: the parent's, unless an action here already returned a newer one.
  const [local, setLocal] = useState<InvestigationView | null>(null);
  const view = local && local.version > propView.version ? local : propView;
  const scene = view.scenes.find((s) => s.locationId === locationId);
  const plate = sceneArt(scene?.art);
  const zones = useMemo(() => scene?.zones ?? [], [scene]);
  const clock = view.clock;
  const costs = clock.costs;
  const here = view.map.current === locationId;
  /** visible spots in this room not yet examined (hidden traces are never counted) */
  const spotsLeft = zones.filter((z) => z.reveal === 'visible' && !z.inspected).length;
  const canAct = view.phase === 'investigating' && here;

  const [tool, setTool] = useState<SceneTool>('torch');
  // the torch clicks on as you step into the dark room and off as you leave it
  useEffect(() => { playSound('torch_on'); return () => playSound('torch_off'); }, [locationId]);
  // the ultraviolet layer is fetched only when the lamp is first picked (a full plate is a lot of pixels)
  useEffect(() => { if (tool === 'uv' && plate?.uv) preload([plate.uv]); }, [tool, plate]);
  const [litId, setLitId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [openZoneId, setOpenZoneId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [spent, setSpent] = useState<{ m: number; key: number } | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [idleZone, setIdleZone] = useState<string | null>(null);
  const [rootSize, setRootSize] = useState({ w: 0, h: 0 });
  const [area, setArea] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const seq = useRef(0);
  const lastProgress = useRef(Date.now());
  const dust = useRef<DustApi>(null);

  // ── camera + light, all on the UI thread
  const tx = useSharedValue(0); // beam centre, area coordinates
  const ty = useSharedValue(0);
  const fx = useSharedValue(0); // finger
  const fy = useSharedValue(0);
  const ox = useSharedValue(0); // canvas offset
  const oy = useSharedValue(0);
  const sc = useSharedValue(0); // canvas scale (0 = not laid out yet)
  const vw = useSharedValue(0);
  const vh = useSharedValue(0);
  const minSc = useSharedValue(1);
  const maxSc = useSharedValue(3);
  const down = useSharedValue(0);
  const pinching = useSharedValue(0);
  const s0 = useSharedValue(1);
  const ox0 = useSharedValue(0);
  const oy0 = useSharedValue(0);
  const f0x = useSharedValue(0);
  const f0y = useSharedValue(0);
  const brushing = useSharedValue(0);
  const lastBx = useSharedValue(0);
  const lastBy = useSharedValue(0);
  const flat = useSharedValue<FlatZone[]>([]);

  const zonesRef = useRef(zones);
  zonesRef.current = zones;
  useEffect(() => { flat.value = zones.map((z) => flatten(z.id, z.shape)); }, [zones, flat]);
  useEffect(() => { brushing.value = tool === 'dust' && !openZoneId ? 1 : 0; }, [tool, openZoneId, brushing]);
  useEffect(() => { lastProgress.current = Date.now(); setIdleZone(null); setPending(null); setOpenZoneId(null); }, [locationId]);

  const onArea = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setArea({ x, y, w: width, h: height });
    vw.value = width;
    vh.value = height;
    const cover = Math.max(width / CANVAS_W, height / CANVAS_H);
    // zoomed all the way out the whole painted room fits — both edges, never further (PLAYTEST_V4 §2.8): on a
    // phone that is the width, on a wide window the height (the old width-only floor cropped the room there)
    minSc.value = Math.min(width / CANVAS_W, height / CANVAS_H);
    maxSc.value = cover * MAX_ZOOM;
    if (sc.value === 0) {
      sc.value = cover;
      ox.value = clampOffset((width - CANVAS_W * cover) / 2, width, CANVAS_W * cover);
      oy.value = clampOffset((height - CANVAS_H * cover) / 2, height, CANVAS_H * cover);
      tx.value = width / 2;
      ty.value = height / 2;
    } else {
      sc.value = Math.min(maxSc.value, Math.max(sc.value, minSc.value));
      ox.value = clampOffset(ox.value, width, CANVAS_W * sc.value);
      oy.value = clampOffset(oy.value, height, CANVAS_H * sc.value);
    }
  };

  const canvasStyle = useAnimatedStyle(() => {
    const s = sc.value || 1;
    return {
      transform: [
        { translateX: ox.value - (CANVAS_W / 2) * (1 - s) },
        { translateY: oy.value - (CANVAS_H / 2) * (1 - s) },
        { scale: s },
      ],
    };
  });

  // Which zone the beam is on — computed on the UI thread, crosses to JS only when it changes.
  const setLitIndex = useCallback((i: number) => setLitId(i >= 0 ? zonesRef.current[i]?.id ?? null : null), []);
  useAnimatedReaction(
    () => {
      const s = sc.value;
      if (!s) return -1;
      const px = (tx.value - ox.value) / s / CANVAS_W;
      const py = (ty.value - oy.value) / s / CANVAS_H;
      return zoneUnderLight(flat.value, px, py, (BEAM * 0.45) / (s * CANVAS_W));
    },
    (i, prev) => { if (i !== prev) scheduleOnRN(setLitIndex, i); },
  );

  // Push the canvas when the finger nears an edge (works with a mouse too).
  // memoised: a new function each render would make Reanimated re-register the frame callback on every render
  const edgePush = useCallback(() => {
    'worklet';
    if (!down.value || pinching.value || !sc.value) return;
    let dx = 0;
    let dy = 0;
    if (fx.value < EDGE) dx = ((EDGE - fx.value) / EDGE) * 7;
    else if (fx.value > vw.value - EDGE) dx = -((fx.value - (vw.value - EDGE)) / EDGE) * 7;
    if (fy.value < EDGE) dy = ((EDGE - fy.value) / EDGE) * 7;
    else if (fy.value > vh.value - EDGE) dy = -((fy.value - (vh.value - EDGE)) / EDGE) * 7;
    if (dx) ox.value = clampOffset(ox.value + dx, vw.value, CANVAS_W * sc.value);
    if (dy) oy.value = clampOffset(oy.value + dy, vh.value, CANVAS_H * sc.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrameCallback(edgePush);

  // ── JS-side handlers reached from worklets through stable trampolines
  const handlers = useRef({ tap: (_x: number, _y: number) => {}, brush: (_x: number, _y: number) => {}, brushEnd: () => {} });
  const callTap = useCallback((x: number, y: number) => handlers.current.tap(x, y), []);
  const callBrush = useCallback((x: number, y: number) => handlers.current.brush(x, y), []);
  const callBrushEnd = useCallback(() => handlers.current.brushEnd(), []);

  const pan = usePanGesture({
    minDistance: 0,
    maxPointers: 1,
    onBegin: (e) => {
      'worklet';
      const lift = e.pointerType === 0 ? TOUCH_LIFT : 0;
      down.value = 1;
      fx.value = e.x;
      fy.value = e.y;
      tx.value = e.x;
      ty.value = e.y - lift;
      lastBx.value = e.x;
      lastBy.value = e.y;
    },
    onUpdate: (e) => {
      'worklet';
      if (pinching.value) return;
      const lift = e.pointerType === 0 ? TOUCH_LIFT : 0;
      fx.value = e.x;
      fy.value = e.y;
      tx.value = e.x;
      ty.value = e.y - lift;
      if (brushing.value) {
        const dx = e.x - lastBx.value;
        const dy = e.y - lastBy.value;
        if (dx * dx + dy * dy > 64) {
          lastBx.value = e.x;
          lastBy.value = e.y;
          const s = sc.value || 1;
          scheduleOnRN(callBrush, ((tx.value - ox.value) / s / CANVAS_W) * UNITS_W, ((ty.value - oy.value) / s / CANVAS_H) * UNITS_H);
        }
      }
    },
    onFinalize: () => {
      'worklet';
      down.value = 0;
      if (brushing.value) scheduleOnRN(callBrushEnd);
    },
  });

  const pinch = usePinchGesture({
    onActivate: (e) => {
      'worklet';
      pinching.value = 1;
      s0.value = sc.value;
      ox0.value = ox.value;
      oy0.value = oy.value;
      f0x.value = e.focalX;
      f0y.value = e.focalY;
    },
    onUpdate: (e) => {
      'worklet';
      const s = Math.min(maxSc.value, Math.max(minSc.value, s0.value * e.scale));
      const k = s / (s0.value || 1);
      ox.value = clampOffset(e.focalX - (f0x.value - ox0.value) * k, vw.value, CANVAS_W * s);
      oy.value = clampOffset(e.focalY - (f0y.value - oy0.value) * k, vh.value, CANVAS_H * s);
      sc.value = s;
    },
    onFinalize: () => {
      'worklet';
      pinching.value = 0;
    },
  });

  const tap = useTapGesture({
    maxDistance: 14,
    onActivate: (e) => {
      'worklet';
      const lift = e.pointerType === 0 ? TOUCH_LIFT : 0;
      tx.value = e.x;
      ty.value = e.y - lift;
      scheduleOnRN(callTap, e.x, e.y - lift);
    },
  });

  const hover = useHoverGesture({
    onUpdate: (e) => {
      'worklet';
      if (down.value) return;
      tx.value = e.x;
      ty.value = e.y;
    },
  });

  const gesture = useSimultaneousGestures(pan, pinch, tap, hover);

  // ── helpers
  const toScene = (x: number, y: number) => {
    const s = sc.value || 1;
    return { x: (x - ox.value) / s / CANVAS_W, y: (y - oy.value) / s / CANVAS_H };
  };
  const toArea = (sx: number, sy: number) => ({ x: ox.value + sx * CANVAS_W * (sc.value || 1), y: oy.value + sy * CANVAS_H * (sc.value || 1) });
  const say = (text: string, tone: Msg['tone'] = 'info') => setMsg({ text, tone, key: ++seq.current });
  const affordable = (m: number) => m <= clock.remainingToday;
  const notebookAt = { x: rootSize.w - 34, y: insets.top + 24 };

  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg((m) => (m?.key === msg.key ? null : m)), msg.tone === 'warn' ? 3600 : 2800);
    return () => clearTimeout(id);
  }, [msg]);
  useEffect(() => {
    if (!spent) return;
    const id = setTimeout(() => setSpent(null), 1600);
    return () => clearTimeout(id);
  }, [spent]);

  const errorText = (r: ActFailure | null, fallback: SceneStringKey): string => {
    if (r?.error) return r.error;
    if (r?.reason) {
      const k = `scene.err.${r.reason}` as SceneStringKey;
      const v = tt(k);
      if (v && v !== k) return v;
    }
    return tt(fallback);
  };

  const applyEvent = (res: ActionResult, from: { x: number; y: number }) => {
    const ev: V2Event = res.event;
    if (ev.cost > 0) setSpent({ m: ev.cost, key: ++seq.current });
    const nv = res.view;
    const fl: Flight[] = [];
    (ev.newFacts ?? []).forEach((id) => {
      const f = nv.notebook.facts.find((x) => x.id === id);
      fl.push({ key: ++seq.current, kind: 'fact', label: tt('scene.msg.newFact'), text: f?.text ?? id, from, to: notebookAt, delay: fl.length * 260 });
    });
    (ev.newEvidence ?? []).forEach((id) => {
      const e = nv.notebook.evidence.find((x) => x.id === id);
      fl.push({ key: ++seq.current, kind: 'evidence', label: tt('scene.msg.newEvidence'), text: e?.name ?? id, from, to: notebookAt, delay: fl.length * 260 });
    });
    if (fl.length) {
      feel.light();
      setFlights((all) => [...all, ...fl]);
      const keys = new Set(fl.map((f) => f.key));
      setTimeout(() => setFlights((all) => all.filter((f) => !keys.has(f.key))), 1800 + fl.length * 260);
    }
    const discovered = fl.length > 0 || (ev.kind === 'inspect' && ev.outcome !== 'already') || (ev.kind === 'probe' && ev.outcome === 'hit');
    if (discovered) { lastProgress.current = Date.now(); setIdleZone(null); }
    if (ev.kind === 'inspect' && ev.zoneId) { setSelectedDetail(null); setOpenZoneId(ev.zoneId); }
    if (ev.kind === 'probe') {
      if (ev.outcome === 'hit' && ev.zoneId) {
        say(tt('scene.msg.hit'), 'good');
        feel.medium();
        const z = ev.zoneId;
        setTimeout(() => { setSelectedDetail(null); setOpenZoneId(z); }, 700);
      } else {
        say(ev.message ?? tt('scene.msg.nothing'));
      }
    }
    if (ev.kind === 'detail') {
      setSelectedDetail(ev.detailId ?? null);
      if (ev.outcome === 'already') say(tt('scene.msg.alreadyFound'));
    }
  };

  const run = async (path: string, body: unknown, from: { x: number; y: number }, fallback: SceneStringKey = 'scene.err.generic') => {
    if (busy) return;
    setBusy(true);
    let res: ActionResult | ActFailure | null = null;
    try { res = await act(path, body); } catch { res = null; }
    setBusy(false);
    if (isFailure(res)) {
      feel.warning();
      say(errorText(res, fallback), 'warn');
      return;
    }
    setLocal(res.view);
    applyEvent(res, from);
  };

  const rootPoint = (p: { x: number; y: number }) => ({ x: area.x + p.x, y: area.y + p.y });

  // ── main-scene taps
  handlers.current.tap = (x, y) => {
    if (busy || openZoneId) return;
    const p = toScene(x, y);
    const i = zoneUnderLight(flat.value, p.x, p.y, (BEAM * 0.45) / ((sc.value || 1) * CANVAS_W));
    const z = i >= 0 ? zonesRef.current[i] : undefined;
    // a second tap on what is already waiting commits it
    if (pending && pending.kind === 'inspect' && z && pending.zoneId === z.id) { commit('primary'); return; }
    if (z?.inspected) { setPending(null); setSelectedDetail(null); setOpenZoneId(z.id); feel.select(); return; }
    if (!canAct) { say(errorText(null, here ? 'scene.err.phase' : 'scene.err.not_here'), 'warn'); return; }
    const zoneOffer = z ? { id: z.id, label: z.label, cost: costs.closeUp } : undefined;
    if (tool === 'uv') {
      setPending({ kind: 'probe', tool: 'uv', sx: p.x, sy: p.y, miss: costs.tool, hit: costs.tool + costs.closeUp, label: z?.label ?? tt('scene.target.here'), zone: zoneOffer });
      feel.select();
      return;
    }
    if (z) {
      setPending({ kind: 'inspect', zoneId: z.id, label: z.label, cost: costs.closeUp, sx: p.x, sy: p.y });
      feel.select();
      return;
    }
    setPending(null);
    say(tt(tool === 'camera' ? 'scene.msg.cameraMain' : tool === 'dust' ? 'scene.hint.dust' : 'scene.msg.nothing'));
  };

  handlers.current.brush = (x, y) => dust.current?.add(x, y);
  handlers.current.brushEnd = () => {
    const s = dust.current?.end() ?? [];
    if (s.length < 4 || openZoneId) return;
    let len = 0;
    let cx = 0;
    let cy = 0;
    for (let k = 0; k < s.length; k += 2) {
      cx += s[k];
      cy += s[k + 1];
      if (k >= 2) len += Math.hypot(s[k] - s[k - 2], s[k + 1] - s[k - 1]);
    }
    const n = s.length / 2;
    if (len < MIN_STROKE) { say(tt('scene.msg.brushMore')); return; }
    if (!canAct) { say(errorText(null, here ? 'scene.err.phase' : 'scene.err.not_here'), 'warn'); return; }
    setPending({ kind: 'probe', tool: 'dust', sx: cx / n / UNITS_W, sy: cy / n / UNITS_H, miss: costs.tool, hit: costs.tool + costs.closeUp, label: tt('scene.target.powder') });
    feel.select();
  };

  const commit = (which: 'primary' | 'secondary') => {
    const p = pending;
    if (!p || busy) return;
    if (p.kind === 'inspect') {
      if (!affordable(p.cost)) { feel.warning(); say(tt('scene.msg.noTime'), 'warn'); return; }
      setPending(null);
      void run('/inspect', { zoneId: p.zoneId }, rootPoint(toArea(p.sx, p.sy)));
      return;
    }
    if (p.kind === 'probe') {
      if (which === 'secondary' && p.zone) {
        if (!affordable(p.zone.cost)) { feel.warning(); say(tt('scene.msg.noTime'), 'warn'); return; }
        setPending(null);
        void run('/inspect', { zoneId: p.zone.id }, rootPoint(toArea(p.sx, p.sy)));
        return;
      }
      if (!affordable(p.hit)) { feel.warning(); say(tt('scene.msg.noTime'), 'warn'); return; }
      setPending(null);
      const x = Math.min(1, Math.max(0, p.sx));
      const y = Math.min(1, Math.max(0, p.sy));
      void run('/probe', { locationId, tool: p.tool, x, y }, rootPoint(toArea(p.sx, p.sy)));
      return;
    }
    if (!affordable(p.cost)) { feel.warning(); say(tt('scene.msg.noTime'), 'warn'); return; }
    setPending(null);
    void run('/detail', { zoneId: p.zoneId, detailId: p.detailId, tool: p.tool }, { x: rootSize.w / 2, y: area.y + area.h * 0.4 });
  };

  // ── close-up details
  const openZone = openZoneId ? zones.find((z) => z.id === openZoneId) : undefined;
  const onDetail = (d: DetailView) => {
    if (!openZone || busy) return;
    const from = { x: rootSize.w / 2, y: area.y + area.h * 0.4 };
    if (d.found) { setSelectedDetail(d.id); setPending(null); return; }
    if (!canAct) { say(errorText(null, here ? 'scene.err.phase' : 'scene.err.not_here'), 'warn'); return; }
    if (!d.tool) { setPending(null); void run('/detail', { zoneId: openZone.id, detailId: d.id, tool }, from); return; }
    if (d.tool === tool) {
      if (pending?.kind === 'detail' && pending.detailId === d.id) { commit('primary'); return; }
      setPending({ kind: 'detail', zoneId: openZone.id, detailId: d.id, tool: d.tool, cost: costs.tool, label: tt('scene.closeup.something') });
      feel.select();
      return;
    }
    // wrong tool: nothing is spent; say which tool would show it (a newcomer should not have to guess)
    setPending(null);
    say(tt(d.tool === 'dust' ? 'scene.err.needs_dust' : d.tool === 'uv' ? 'scene.err.needs_uv' : 'scene.err.needs_tool'), 'warn');
    feel.warning();
  };

  const chooseTool = (k: SceneTool) => {
    if (k === tool) return;
    feel.select();
    // the lamp warming up, the torch clicking back on, or a plain tool picked up (handoff L)
    playSound(k === 'uv' ? 'uv_on' : k === 'torch' ? 'torch_on' : 'tool');
    setTool(k);
    setPending(null);
  };

  const zoomBy = (f: number) => {
    const s = sc.value;
    if (!s) return; // not laid out yet
    const ns = Math.min(maxSc.value, Math.max(minSc.value, s * f));
    const cx = vw.value / 2;
    const cy = vh.value / 2;
    const k = ns / s;
    const nox = clampOffset(cx - (cx - ox.value) * k, vw.value, CANVAS_W * ns);
    const noy = clampOffset(cy - (cy - oy.value) * k, vh.value, CANVAS_H * ns);
    // set directly: the three values must stay in step for the clamp, and the step itself reads as a lens change
    sc.value = ns;
    ox.value = nox;
    oy.value = noy;
  };

  // ── idle assist: a faint shimmer near the closest unexamined zone — sooner in the case's very first scene
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const firstScene = !view.scenes.some((sc) => sc.zones.some((z) => z.inspected));
  const idleMs = useRef(IDLE_MS);
  idleMs.current = firstScene ? IDLE_FIRST_MS : IDLE_MS;
  useEffect(() => {
    if (!idleAssist) { setIdleZone(null); return; }
    const id = setInterval(() => {
      if (Date.now() - lastProgress.current < idleMs.current) return;
      const left = (sceneRef.current?.zones ?? []).filter((z) => z.reveal === 'visible' && !z.inspected);
      if (!left.length) { setIdleZone(null); return; }
      const p = toScene(tx.value, ty.value);
      let best = left[0];
      let bd = Infinity;
      for (const z of left) {
        const c = zoneCentre(z.shape);
        const d = Math.hypot(c.x - p.x, (c.y - p.y) * (UNITS_H / UNITS_W));
        if (d < bd) { bd = d; best = z; }
      }
      setIdleZone((cur) => cur ?? best.id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleAssist]);
  const idle = idleZone ? zones.find((z) => z.id === idleZone && !z.inspected) : undefined;

  // ── the cost line: always says what the next action costs
  const costLine = (() => {
    const tool10 = duration(tt, costs.tool);
    if (pending) {
      if (pending.kind === 'inspect') return `${tt('scene.cost.closeUp')} · ${duration(tt, pending.cost)}`;
      if (pending.kind === 'probe') return fmt(tt('scene.cost.probe'), { a: duration(tt, pending.miss), b: duration(tt, pending.hit) });
      return `${tt('scene.cost.tool')} · ${duration(tt, pending.cost)}`;
    }
    if (openZone) return tool === 'torch' ? tt('scene.cost.look') : `${tt('scene.cost.tool')} · ${tool10}`;
    if (tool === 'uv' || tool === 'dust') return fmt(tt('scene.cost.probe'), { a: tool10, b: duration(tt, costs.tool + costs.closeUp) });
    const lit = zones.find((z) => z.id === litId);
    if (lit?.inspected) return tt('scene.cost.reopen');
    return `${tt('scene.cost.closeUp')} · ${duration(tt, costs.closeUp)}`;
  })();
  // two possible moves (search under UV / just examine): words on one line, both buttons on the next
  const twoMoves = pending?.kind === 'probe' && !!pending.zone;
  const pendingCost = pending ? (pending.kind === 'probe' ? pending.hit : pending.cost) : 0;
  const short = pending ? !affordable(pendingCost) : false;
  const hint = openZone ? null : tt(`scene.hint.${tool}` as SceneStringKey);
  const accent = toolAccent(tool);
  const markId = pending?.kind === 'inspect' ? pending.zoneId : pending?.kind === 'probe' && pending.zone ? pending.zone.id : litId;
  const torchSize = 2 * Math.ceil(Math.hypot(area.w, area.h)) + 8;

  const primaryLabel = !pending ? '' : pending.kind === 'inspect' ? tt('scene.do.examine') : pending.kind === 'probe'
    ? tt(pending.tool === 'uv' ? 'scene.do.uv' : 'scene.do.dust')
    : pending.tool === 'camera' ? tt('scene.do.photo') : fmt(tt('scene.do.detailTool'), { tool: tt(`scene.toolIn.${pending.tool}` as SceneStringKey) });

  if (!scene) {
    return (
      <View style={[st.root, st.center, { paddingTop: insets.top }]}>
        <Text style={st.empty}>{tt('scene.empty')}</Text>
        <Pressable onPress={onExit} style={st.secondaryBtn}><Text style={st.secondaryText}>{tt('scene.exit')}</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={st.root} onLayout={(e) => setRootSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} testID="scene-root">
      {/* top: way out, place, clock, notebook */}
      <View style={[st.top, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={onExit} hitSlop={10} style={st.exit} accessibilityRole="button" accessibilityLabel={tt('scene.exit')} testID="scene-exit">
          <ExitIcon />
          <Text style={st.exitText}>{tt('scene.exitShort')}</Text>
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* one line for when, one for where (never truncated by the clock), one for what is left to find */}
          <Text style={st.eyebrow} numberOfLines={1}>{fmt(tt('scene.day'), { d: clock.day, n: clock.days })} · {clock.timeLabel}</Text>
          <Text style={st.place} numberOfLines={2}>{scene.name}</Text>
          <View style={st.subRow}>
            <Text style={[st.eyebrow, { color: spotsLeft ? color.amber : color.textFaint, flexShrink: 1 }]} numberOfLines={1} testID="scene-spots">
              {spotsLeft === 0 ? tt('scene.spotsDone') : spotsLeft === 1 ? tt('scene.spotsLeft1') : fmt(tt('scene.spotsLeft'), { n: spotsLeft })}
            </Text>
            <Text style={[st.clockLeft, clock.remainingToday < costs.closeUp && { color: color.burgundyBright }]} numberOfLines={1} testID="scene-clock">
              {fmt(tt('scene.leftShort'), { t: duration(tt, clock.remainingToday) })}
            </Text>
          </View>
        </View>
        {spent ? (
          <Animated.Text key={spent.key} entering={FadeInDown.duration(200)} style={st.spent} testID="scene-spent">
            {fmt(tt('scene.spent'), { m: spent.m })}
          </Animated.Text>
        ) : null}
        <View style={st.book} accessibilityLabel={tt('scene.notebook')} testID="scene-notebook">
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M5 4h14v11l-5 5H5z" stroke={color.textDim} strokeWidth={1.5} fill="none" />
            <Path d="M14 20v-5h5M8.5 9h7M8.5 12.5h4" stroke={color.textDim} strokeWidth={1.5} fill="none" />
          </Svg>
          <Text style={st.bookCount}>{view.notebook.facts.length}</Text>
        </View>
      </View>

      {/* the dark room */}
      <View style={st.area} onLayout={onArea}>
        <GestureDetector gesture={gesture}>
          <View style={StyleSheet.absoluteFill} collapsable={false} testID="scene-canvas">
            <Animated.View style={[st.canvas, canvasStyle]}>
              {plate ? (
                // the painted room (ART_BIBLE §7): drawn to the full canvas, zone x/y are fractions of the image
                <Image source={plate.base.src} style={st.plate} resizeMode="stretch" accessibilityLabel={altOf(plate.base, view.locale)} />
              ) : <SceneArt plan={scene.plan} zones={zones} seedKey={locationId} />}
              {tool === 'uv' && !plate ? <View style={StyleSheet.absoluteFill} pointerEvents="none"><UvTraces plan={scene.plan} zones={zones} seedKey={locationId} /></View> : null}
              <View style={StyleSheet.absoluteFill} pointerEvents="none"><DustCanvas ref={dust} zones={zones} /></View>
              <View style={StyleSheet.absoluteFill} pointerEvents="none"><ZoneMarks zones={zones} litId={openZone ? null : markId} tool={tool} /></View>
            </Animated.View>
            {tool === 'uv' && plate && area.w > 0 ? <UvWindow plate={plate} zones={zones} tx={tx} ty={ty} ox={ox} oy={oy} sc={sc} /> : null}
            {area.w > 0 ? <Torch x={tx} y={ty} size={torchSize} tool={tool} ambient={!!plate} /> : null}
            <Animated.View style={[st.canvas, canvasStyle]} pointerEvents="none">
              {idle && !openZone ? (() => { const c = zoneCentre(idle.shape); return <Shimmer x={c.x * CANVAS_W} y={c.y * CANVAS_H} />; })() : null}
              {pending && pending.kind !== 'detail' && !openZone ? <Reticle x={pending.sx * CANVAS_W} y={pending.sy * CANVAS_H} tint={accent} /> : null}
            </Animated.View>
            {litId && !openZone ? <View testID={`lit-${litId}`} style={st.probe} pointerEvents="none" /> : null}
          </View>
        </GestureDetector>

        {!openZone ? (
          <View style={st.zoom} pointerEvents="box-none">
            <Pressable onPress={() => zoomBy(1.35)} style={st.zoomBtn} accessibilityLabel={tt('scene.zoomIn')} testID="zoom-in"><Text style={st.zoomText}>+</Text></Pressable>
            <Pressable onPress={() => zoomBy(1 / 1.35)} style={st.zoomBtn} accessibilityLabel={tt('scene.zoomOut')} testID="zoom-out"><Text style={st.zoomText}>−</Text></Pressable>
          </View>
        ) : null}

        {clock.dayOver || !canAct ? (
          <View style={st.banner} pointerEvents="none" testID="scene-banner">
            <Text style={st.bannerText}>{view.phase !== 'investigating' ? tt('scene.err.phase') : !here ? tt('scene.err.not_here') : tt(view.mode === 'coop' && !view.room?.isHost ? 'scene.msg.dayOverTeam' : 'scene.msg.dayOver')}</Text>
          </View>
        ) : null}

        {openZone ? (
          <CloseUp
            zone={openZone}
            tool={tool}
            tt={tt}
            width={area.w}
            selectedDetail={selectedDetail}
            pendingDetail={pending?.kind === 'detail' ? pending.detailId : null}
            onDetail={onDetail}
          />
        ) : null}
      </View>

      {/* bottom: message, next action and its cost, tools */}
      <View style={[st.bottom, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={st.msgRow}>
          {msg ? (
            <Animated.Text key={msg.key} entering={FadeIn.duration(160)} style={[st.msg, msg.tone === 'warn' && { color: color.burgundyBright }, msg.tone === 'good' && { color: color.greenBright }]} testID="scene-msg">
              {msg.text}
            </Animated.Text>
          ) : hint ? <Text style={st.hint} numberOfLines={2}>{hint}</Text> : null}
        </View>
        <View style={[st.bar, twoMoves && st.barStacked]} testID="scene-bar">
          <View style={twoMoves ? undefined : { flex: 1, minWidth: 0 }}>
            {pending ? <Text style={st.barLabel} numberOfLines={1}>{pending.label}</Text> : null}
            <Text style={[st.barCost, short && { color: color.burgundyBright }]} numberOfLines={2} testID="scene-cost">{costLine}</Text>
          </View>
          {pending ? (
            <View style={[st.barActions, twoMoves && { justifyContent: 'flex-end' }]}>
              <Pressable onPress={() => setPending(null)} hitSlop={8} style={st.cancel} accessibilityLabel={tt('scene.do.cancel')} testID="pending-cancel">
                <Text style={st.cancelText}>×</Text>
              </Pressable>
              {pending.kind === 'probe' && pending.zone ? (
                <Pressable onPress={() => commit('secondary')} disabled={busy} style={[st.btn, st.btnGhost]} testID="pending-secondary">
                  <Text style={st.btnGhostText}>{tt('scene.do.examine')}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => commit('primary')} disabled={busy} style={[st.btn, { borderColor: accent, opacity: busy ? 0.5 : short ? 0.6 : 1 }]} testID="pending-primary">
                <Text style={[st.btnText, { color: accent }]}>{primaryLabel}</Text>
              </Pressable>
            </View>
          ) : openZone ? (
            // the one way back to the room, in thumb reach (the close-up card no longer repeats it)
            <Pressable onPress={() => { setOpenZoneId(null); setPending(null); setSelectedDetail(null); }} style={[st.btn, st.btnGhost]} accessibilityRole="button" testID="bar-back">
              <Text style={st.btnGhostText}>{tt('scene.closeup.back')}</Text>
            </Pressable>
          ) : null}
        </View>
        <ToolRail tool={tool} onChange={chooseTool} tt={tt} disabled={busy} />
      </View>

      {flights.map((f) => <FlyChip key={f.key} f={f} />)}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070708', overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  empty: { fontFamily: font.serifItalic, fontSize: 17, color: color.textDim },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 8, backgroundColor: '#0B0C0D', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.borderSoft, zIndex: 2 },
  exit: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, paddingRight: 4 },
  exitText: { fontFamily: font.sansMedium, fontSize: 13, color: color.textDim },
  eyebrow: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.2, color: color.textFaint, textTransform: 'uppercase' },
  place: { fontFamily: font.serif, fontSize: 17, lineHeight: 21, color: color.text },
  clock: { alignItems: 'flex-end', minWidth: 76 },
  clockLeft: { fontFamily: font.monoMedium, fontSize: 11, color: color.textDim },
  // wraps instead of cutting both halves at 320 pt ("2 YER KALD…" / "3 sa 5 dk kal…")
  subRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 8, marginTop: 1 },
  spent: { fontFamily: font.monoMedium, fontSize: 12, color: color.amber },
  book: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: color.border, borderRadius: 4, paddingHorizontal: 8, minHeight: 36 },
  bookCount: { fontFamily: font.monoMedium, fontSize: 12, color: color.text },
  area: { flex: 1, overflow: 'hidden', backgroundColor: '#050506' },
  canvas: { position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H },
  plate: { position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H },
  uvWin: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  probe: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  zoom: { position: 'absolute', right: 10, top: 10, gap: 8 },
  zoomBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(10,11,12,0.7)', alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontFamily: font.sansMedium, fontSize: 18, lineHeight: 20, color: color.textDim },
  banner: { position: 'absolute', left: 12, right: 56, top: 10, backgroundColor: 'rgba(58,30,33,0.92)', borderLeftWidth: 2, borderLeftColor: color.burgundyBright, paddingHorizontal: 10, paddingVertical: 8 },
  bannerText: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.text },
  bottom: { backgroundColor: '#0B0C0D', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.borderSoft, paddingTop: 6 },
  msgRow: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 14 },
  msg: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 19, color: color.text },
  hint: { fontFamily: font.sans, fontSize: 12, lineHeight: 16, color: color.textFaint },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, minHeight: 46, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#131517', borderWidth: 1, borderColor: color.borderSoft },
  barLabel: { fontFamily: font.sansMedium, fontSize: 13, color: color.text },
  barCost: { fontFamily: font.mono, fontSize: 11, lineHeight: 15, color: color.textDim },
  barActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barStacked: { flexDirection: 'column', alignItems: 'stretch', gap: 6 },
  cancel: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: font.sans, fontSize: 20, color: color.textFaint },
  btn: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 12, minHeight: 40, justifyContent: 'center' },
  btnText: { fontFamily: font.sansBold, fontSize: 13 },
  btnGhost: { borderColor: color.border },
  btnGhostText: { fontFamily: font.sansMedium, fontSize: 13, color: color.textDim },
  secondaryBtn: { borderWidth: 1, borderColor: color.border, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 9 },
  secondaryText: { fontFamily: font.sansMedium, fontSize: 14, color: color.text },
});

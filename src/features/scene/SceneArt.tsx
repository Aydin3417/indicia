import { memo, type ReactElement } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import type { PlanShape, ZoneView } from '../../../shared/api';
import { CANVAS_H, CANVAS_W, UNITS_H, UNITS_W, hashString, rng, zoneCentre } from './geometry';

// The room, drawn top-down as a dim overhead view: planks, walls, furniture by kind, the body, clutter.
// Everything is static; the torch is a separate overlay, so this tree renders once per scene.

const X = (x: number) => x * UNITS_W;
const Y = (y: number) => y * UNITS_H;

type Rct = Extract<PlanShape, { t: 'rect' }>;

/** Furniture kind from the (v1, English) plan label. Falls back to a generic crate. */
function kindOf(r: Rct): string {
  const l = (r.label ?? '').toUpperCase();
  const pairs: [RegExp, string][] = [
    [/TOOL/, 'toolwall'], [/SHELV|SHELF/, 'shelves'], [/BENCH|TABLE|WORKTOP/, 'bench'], [/BOW|CABINET|VITRINE/, 'cabinet'],
    [/SINK|BASIN/, 'sink'], [/LADDER/, 'ladder'], [/DESK/, 'desk'], [/FILE|ARCHIVE/, 'files'], [/SOFA|COUCH|CHAIR/, 'sofa'],
    [/COURT|YARD|GARDEN|STREET/, 'yard'], [/BIKE|RACK/, 'rack'], [/COAT|HOOK/, 'coats'], [/READER|PANEL|SWITCH/, 'reader'],
    [/LEDGER|LECTERN|BOOK/, 'lectern'], [/BED/, 'bed'],
  ];
  for (const [re, k] of pairs) if (re.test(l)) return k;
  if (r.dashed) return 'outline';
  if (r.w * r.h < 0.012) return 'case';
  return 'crate';
}

function Furniture({ r, i }: { r: Rct; i: number }): ReactElement {
  const x = X(r.x), y = Y(r.y), w = X(r.w), h = Y(r.h);
  const k = kindOf(r);
  const rand = rng(i * 7919 + 13);
  switch (k) {
    case 'bench':
    case 'desk': {
      const top = k === 'desk' ? '#4A3424' : '#5B4330';
      return (
        <G>
          <Rect x={x + 4} y={y + 6} width={w} height={h} fill="#000" opacity={0.45} rx={3} />
          <Rect x={x} y={y} width={w} height={h} fill={top} rx={3} stroke="#2A1E15" strokeWidth={2} />
          {Array.from({ length: 5 }, (_, n) => (
            <Path key={n} d={`M${x + 6} ${y + (h * (n + 1)) / 6} q${w * 0.3} ${rand() * 6 - 3} ${w - 12} ${rand() * 4 - 2}`} stroke="#3E2C1E" strokeWidth={1.2} fill="none" opacity={0.7} />
          ))}
          {k === 'bench' ? (
            <G>
              <Rect x={x + w * 0.08} y={y + h * 0.2} width={w * 0.16} height={h * 0.18} fill="#8A8F8C" opacity={0.7} rx={2} />
              <Circle cx={x + w * 0.7} cy={y + h * 0.35} r={h * 0.12} fill="#2B2F31" stroke="#9AA0A0" strokeWidth={1.5} />
              <Rect x={x + w * 0.35} y={y + h * 0.55} width={w * 0.2} height={h * 0.28} fill="#C9B994" opacity={0.6} transform={`rotate(-6 ${x + w * 0.45} ${y + h * 0.7})`} />
              <Line x1={x + w * 0.82} y1={y + h * 0.6} x2={x + w * 0.95} y2={y + h * 0.85} stroke="#B7B3A8" strokeWidth={2} strokeLinecap="round" />
            </G>
          ) : (
            <G>
              <Rect x={x + w * 0.1} y={y + h * 0.18} width={w * 0.32} height={h * 0.5} fill="#7C2E2E" opacity={0.85} rx={2} />
              <Rect x={x + w * 0.5} y={y + h * 0.25} width={w * 0.26} height={h * 0.4} fill="#D8D0BE" opacity={0.55} transform={`rotate(4 ${x + w * 0.6} ${y + h * 0.4})`} />
              <Circle cx={x + w * 0.86} cy={y + h * 0.3} r={h * 0.1} fill="#1E1F20" stroke="#6E6A62" />
            </G>
          )}
        </G>
      );
    }
    case 'toolwall':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="#3C3328" stroke="#1F1A14" strokeWidth={2} />
          {Array.from({ length: Math.floor(w / 14) }, (_, n) =>
            Array.from({ length: Math.max(2, Math.floor(h / 12)) }, (_, m) => (
              <Circle key={`${n}-${m}`} cx={x + 7 + n * 14} cy={y + 6 + m * 12} r={1.4} fill="#1B1712" />
            )))}
          {Array.from({ length: 6 }, (_, n) => {
            const cx = x + w * (0.1 + n * 0.15);
            const tilt = n === 4 ? 12 : 0;
            return (
              <G key={`m${n}`} transform={`rotate(${tilt} ${cx} ${y + h / 2})`}>
                <Rect x={cx - 3} y={y + h * 0.15} width={6} height={h * 0.7} fill="#7A6450" />
                <Rect x={cx - 10} y={y + h * 0.1} width={20} height={h * 0.28} rx={3} fill={n === 4 ? '#6B4B2E' : '#55402C'} />
              </G>
            );
          })}
        </G>
      );
    case 'shelves':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="#2E2822" stroke="#17130F" strokeWidth={2} />
          {Array.from({ length: 9 }, (_, n) => (
            <Rect key={n} x={x + 6 + n * (w - 12) / 9} y={y + 4} width={(w - 12) / 9 - 4} height={h - 8} fill={n % 2 ? '#8C6B47' : '#9B7A52'} opacity={0.75} />
          ))}
          <Rect x={x} y={y} width={w} height={h} fill="#BFB6A4" opacity={0.08} />
        </G>
      );
    case 'cabinet':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="#2C2620" stroke="#5A4B3A" strokeWidth={2} />
          <Rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="#6E8A8C" opacity={0.12} />
          {Array.from({ length: 7 }, (_, n) => (
            <Line key={n} x1={x + 8} y1={y + 12 + n * ((h - 24) / 6)} x2={x + w - 8} y2={y + 6 + n * ((h - 24) / 6)} stroke={n === 3 ? '#2C2620' : '#B08A5A'} strokeWidth={2} strokeLinecap="round" />
          ))}
          <Line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#5A4B3A" strokeWidth={1} />
        </G>
      );
    case 'sink':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="#53585A" rx={4} stroke="#2A2D2E" strokeWidth={2} />
          <Rect x={x + w * 0.12} y={y + h * 0.12} width={w * 0.76} height={h * 0.52} rx={10} fill="#2D3133" stroke="#787E80" strokeWidth={1.5} />
          <Circle cx={x + w * 0.5} cy={y + h * 0.38} r={4} fill="#141617" />
          <Circle cx={x + w * 0.25} cy={y + h * 0.82} r={h * 0.1} fill="#3A3F2E" stroke="#6F7559" />
          <Path d={`M${x + w * 0.55} ${y + h * 0.75} q10 6 22 0 q-4 10 -18 8 z`} fill="#8E8670" opacity={0.7} />
        </G>
      );
    case 'ladder': {
      const n = Math.max(4, Math.floor(w / 18));
      return (
        <G transform={`rotate(-4 ${x + w / 2} ${y + h / 2})`}>
          <Rect x={x + 3} y={y + 6} width={w} height={h} fill="#000" opacity={0.35} />
          <Rect x={x} y={y} width={w} height={5} fill="#8B6A45" />
          <Rect x={x} y={y + h - 5} width={w} height={5} fill="#8B6A45" />
          {Array.from({ length: n }, (_, m) => (
            <Rect key={m} x={x + 6 + m * ((w - 12) / (n - 1)) - 2} y={y} width={4} height={h} fill="#7A5B3A" />
          ))}
          <Circle cx={x + 4} cy={y + h + 4} r={4} fill="#3A3A3A" />
          <Circle cx={x + w - 4} cy={y + h + 4} r={4} fill="#3A3A3A" />
        </G>
      );
    }
    case 'files':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="#4B5052" stroke="#26292A" strokeWidth={2} />
          {Array.from({ length: 3 }, (_, n) => (
            <G key={n}>
              <Rect x={x + 5} y={y + 5 + n * (h - 10) / 3} width={w - 10} height={(h - 10) / 3 - 4} fill="#5C6264" />
              <Rect x={x + w / 2 - 10} y={y + 5 + n * (h - 10) / 3 + 6} width={20} height={4} fill="#2A2D2E" />
            </G>
          ))}
        </G>
      );
    case 'sofa':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} rx={12} fill="#3B2B2E" stroke="#1E1517" strokeWidth={2} />
          <Rect x={x + 8} y={y + 8} width={w / 2 - 12} height={h - 16} rx={8} fill="#4A363A" />
          <Rect x={x + w / 2 + 4} y={y + 8} width={w / 2 - 12} height={h - 16} rx={8} fill="#4A363A" />
        </G>
      );
    case 'yard':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="url(#cobbles)" />
          <Rect x={x} y={y} width={w} height={h} fill="#C9D3D8" opacity={0.05} />
        </G>
      );
    case 'rack':
      return (
        <G>
          {Array.from({ length: 5 }, (_, n) => (
            <Path key={n} d={`M${x + 8 + n * (w - 16) / 4} ${y + h} v${-h * 0.8} a6 6 0 0 1 12 0 v${h * 0.8}`} stroke="#8A9094" strokeWidth={2.5} fill="none" />
          ))}
        </G>
      );
    case 'coats':
      return (
        <G>
          <Rect x={x} y={y} width={6} height={h} fill="#5A4632" />
          {Array.from({ length: 4 }, (_, n) => (
            <Path key={n} d={`M${x + 6} ${y + 10 + n * (h - 20) / 3} q${w * 0.8} 4 ${w * 0.9} 18 q-${w * 0.6} 8 -${w * 0.9} -6 z`} fill={['#3A3F4A', '#4B3A30', '#2F3B33', '#45403A'][n]} />
          ))}
        </G>
      );
    case 'reader':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} rx={3} fill="#2A2D30" stroke="#6C7276" strokeWidth={1.5} />
          <Circle cx={x + w / 2} cy={y + h * 0.35} r={Math.min(w, h) * 0.18} fill="#9B2C2C" opacity={0.9} />
          <Rect x={x + w * 0.2} y={y + h * 0.6} width={w * 0.6} height={h * 0.2} fill="#1A1C1E" />
        </G>
      );
    case 'lectern':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} fill="#4A3526" stroke="#21170F" strokeWidth={2} />
          <Rect x={x + w * 0.1} y={y + h * 0.15} width={w * 0.8} height={h * 0.7} fill="#D6CDB8" opacity={0.7} />
          <Line x1={x + w / 2} y1={y + h * 0.15} x2={x + w / 2} y2={y + h * 0.85} stroke="#6B5A42" strokeWidth={1.5} />
          {Array.from({ length: 5 }, (_, n) => (
            <Line key={n} x1={x + w * 0.15} y1={y + h * (0.25 + n * 0.12)} x2={x + w * 0.45} y2={y + h * (0.25 + n * 0.12)} stroke="#8A8070" strokeWidth={1} />
          ))}
        </G>
      );
    case 'case':
      return (
        <G>
          <Path d={`M${x} ${y + h / 2} q${w * 0.1} -${h / 2} ${w * 0.35} -${h * 0.45} h${w * 0.3} q${w * 0.25} 0 ${w * 0.35} ${h * 0.45} q-${w * 0.1} ${h / 2} -${w * 0.35} ${h * 0.45} h-${w * 0.3} q-${w * 0.25} 0 -${w * 0.35} -${h * 0.45} z`} fill="#3E2720" stroke="#A07A4A" strokeWidth={1.5} />
        </G>
      );
    case 'bed':
      return (
        <G>
          <Rect x={x} y={y} width={w} height={h} rx={6} fill="#3C3F44" />
          <Rect x={x + 6} y={y + 6} width={w * 0.25} height={h - 12} rx={6} fill="#5A5E63" />
        </G>
      );
    case 'outline':
      return <Rect x={x} y={y} width={w} height={h} fill="none" stroke="#5E6468" strokeWidth={1} strokeDasharray="6,5" opacity={0.6} />;
    default:
      return (
        <G>
          <Rect x={x + 3} y={y + 5} width={w} height={h} fill="#000" opacity={0.4} />
          <Rect x={x} y={y} width={w} height={h} fill="#40362C" stroke="#1E1913" strokeWidth={2} />
          <Line x1={x} y1={y} x2={x + w} y2={y + h} stroke="#2C251E" strokeWidth={2} />
          <Line x1={x + w} y1={y} x2={x} y2={y + h} stroke="#2C251E" strokeWidth={2} />
        </G>
      );
  }
}

function Body({ x, y, angle }: { x: number; y: number; angle: number }) {
  const cx = X(x), cy = Y(y);
  // a figure on its side: head, shoulders, bent arm, legs — then a chalk line around it
  const figure = `M${cx - 62} ${cy - 4} q2 -16 18 -16 q14 0 16 12 l30 -6 l26 -2 l12 -14 l8 4 l-8 14 l30 4 l22 -10 l6 6 l-20 14 l-4 10 l26 10 l-3 8 l-30 -8 l-22 2 l-34 -2 q-16 6 -26 2 q-18 6 -30 -6 z`;
  return (
    <G transform={`rotate(${angle} ${cx} ${cy})`}>
      <Ellipse cx={cx - 10} cy={cy + 6} rx={78} ry={26} fill="#000" opacity={0.35} />
      <Path d={figure} fill="#3A3634" />
      <Path d={figure} fill="none" stroke="#3E4A5A" strokeWidth={10} opacity={0.35} strokeLinejoin="round" />
      <Circle cx={cx - 46} cy={cy - 12} r={7} fill="#4A1A1C" opacity={0.85} />
      <Path d={figure} fill="none" stroke="#E9E4D8" strokeWidth={2.2} strokeDasharray="7,4" strokeLinejoin="round" opacity={0.85} transform={`translate(0 0) scale(1.0)`} />
    </G>
  );
}

function Door({ x, y, r, angle }: { x: number; y: number; r: number; angle: number }) {
  const rr = X(r);
  const a = (angle * Math.PI) / 180;
  const cx = X(x), cy = Y(y);
  const ex = cx + Math.cos(a) * rr, ey = cy + Math.sin(a) * rr;
  const a2 = a + Math.PI / 2;
  const sx = cx + Math.cos(a2) * rr, sy = cy + Math.sin(a2) * rr;
  return (
    <G>
      <Line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#111214" strokeWidth={16} />
      <Path d={`M${ex} ${ey} A${rr} ${rr} 0 0 1 ${sx} ${sy}`} stroke="#5E5A52" strokeWidth={1} fill="none" strokeDasharray="3,4" />
      <Line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#6A4E34" strokeWidth={6} strokeLinecap="round" />
    </G>
  );
}

function Clutter({ seed, plan, zones }: { seed: number; plan: PlanShape[]; zones: ZoneView[] }) {
  const rand = rng(seed);
  const benches = plan.filter((p): p is Rct => p.t === 'rect' && /BENCH|DESK/i.test(p.label ?? ''));
  const items: ReactElement[] = [];
  // shavings and specks around work surfaces
  benches.forEach((b, bi) => {
    for (let n = 0; n < 26; n++) {
      const px = X(b.x) - 20 + rand() * (X(b.w) + 40);
      const py = Y(b.y + b.h) + rand() * 46 - 4;
      const s = 3 + rand() * 6;
      items.push(<Path key={`s${bi}-${n}`} d={`M${px} ${py} q${s} ${-s} ${s * 2} 0`} stroke="#B89A62" strokeWidth={1.2} fill="none" opacity={0.55} />);
    }
  });
  // a scatter of dust specks everywhere
  for (let n = 0; n < 160; n++) {
    items.push(<Circle key={`d${n}`} cx={60 + rand() * 880} cy={60 + rand() * 700} r={0.8 + rand() * 1.4} fill="#8E887C" opacity={0.25 + rand() * 0.25} />);
  }
  // small objects where a visible zone sits on open floor (papers, a glint…) so the light has something to find
  const rects = plan.filter((p): p is Rct => p.t === 'rect' && !p.dashed);
  zones.filter((z) => z.reveal === 'visible').forEach((z) => {
    const c = zoneCentre(z.shape);
    const onFurniture = rects.some((r) => c.x >= r.x && c.x <= r.x + r.w && c.y >= r.y && c.y <= r.y + r.h);
    if (onFurniture) return;
    const cx = X(c.x), cy = Y(c.y);
    const r = rng(hashString(z.id));
    if (/paper|note|letter|diary|kağıt/i.test(z.id)) {
      for (let n = 0; n < 3; n++) {
        items.push(<Rect key={`${z.id}${n}`} x={cx - 14 + n * 4} y={cy - 10 + n * 3} width={24} height={30} fill="#D9D2C2" opacity={0.55} transform={`rotate(${r() * 40 - 20} ${cx} ${cy})`} />);
      }
      items.push(<Line key={`${z.id}f`} x1={cx - 16} y1={cy + 4} x2={cx + 18} y2={cy - 2} stroke="#A9A9A9" strokeWidth={3} strokeLinecap="round" />);
    } else if (/floor|glint|ground/i.test(z.id)) {
      for (let n = 0; n < 12; n++) {
        const px = cx + (r() - 0.5) * 50, py = cy + (r() - 0.5) * 40, s = 3 + r() * 5;
        items.push(<Path key={`${z.id}${n}`} d={`M${px} ${py} q${s} ${-s} ${s * 2} 0`} stroke="#C9AE76" strokeWidth={1.4} fill="none" opacity={0.6} />);
      }
      items.push(<Circle key={`${z.id}g`} cx={cx + 6} cy={cy + 4} r={2.4} fill="#E8C66A" opacity={0.9} />);
    } else if (/door/i.test(z.id)) {
      items.push(<Rect key={z.id} x={cx - 20} y={cy - 6} width={40} height={12} fill="#2C2A28" stroke="#5C564C" />);
    } else {
      items.push(<Circle key={z.id} cx={cx} cy={cy} r={10} fill="#3A332B" stroke="#59503F" />);
    }
  });
  return <G>{items}</G>;
}

/** The static room. Re-renders only when the location or its zone list changes. */
export const SceneArt = memo(function SceneArt({ plan, zones, seedKey }: { plan: PlanShape[]; zones: ZoneView[]; seedKey: string }) {
  const seed = hashString(seedKey);
  const walls = plan.filter((p): p is Extract<PlanShape, { t: 'wall' }> => p.t === 'wall');
  const xs = walls.flatMap((w) => [w.x1, w.x2]);
  const ys = walls.flatMap((w) => [w.y1, w.y2]);
  const room = xs.length ? { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) } : { x: 0.04, y: 0.05, w: 0.92, h: 0.9 };
  return (
    <Svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${UNITS_W} ${UNITS_H}`}>
      <Defs>
        <Pattern id="planks" width={UNITS_W} height={34} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={UNITS_W} height={34} fill="#2B2219" />
          <Line x1={0} y1={33} x2={UNITS_W} y2={33} stroke="#17110C" strokeWidth={2} />
          <Line x1={140} y1={0} x2={140} y2={33} stroke="#17110C" strokeWidth={1.5} />
          <Line x1={470} y1={0} x2={470} y2={33} stroke="#17110C" strokeWidth={1.5} />
          <Line x1={810} y1={0} x2={810} y2={33} stroke="#17110C" strokeWidth={1.5} />
          <Path d="M0 12 q200 4 400 0 t400 2 t200 -2" stroke="#33281E" strokeWidth={1} fill="none" />
          <Path d="M0 24 q240 -3 480 1 t520 -1" stroke="#251C14" strokeWidth={1} fill="none" />
        </Pattern>
        <Pattern id="cobbles" width={28} height={24} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={28} height={24} fill="#1F2224" />
          <Ellipse cx={7} cy={6} rx={6} ry={5} fill="#3A3F42" />
          <Ellipse cx={21} cy={6} rx={6} ry={5} fill="#353A3D" />
          <Ellipse cx={14} cy={18} rx={6} ry={5} fill="#383D40" />
          <Ellipse cx={0} cy={18} rx={6} ry={5} fill="#33383B" />
          <Ellipse cx={28} cy={18} rx={6} ry={5} fill="#33383B" />
        </Pattern>
        <LinearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#000" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={UNITS_W} height={UNITS_H} fill="#0C0D0E" />
      <Rect x={X(room.x)} y={Y(room.y)} width={X(room.w)} height={Y(room.h)} fill="url(#planks)" />
      <Rect x={X(room.x)} y={Y(room.y)} width={X(room.w)} height={26} fill="url(#wallShade)" />
      {plan.map((p, i) => (p.t === 'rect' ? <Furniture key={`f${i}`} r={p} i={i} /> : null))}
      <Clutter seed={seed} plan={plan} zones={zones} />
      {plan.map((p, i) => {
        if (p.t === 'wall') {
          return (
            <G key={`w${i}`}>
              <Line x1={X(p.x1)} y1={Y(p.y1)} x2={X(p.x2)} y2={Y(p.y2)} stroke="#3B3833" strokeWidth={16} strokeLinecap="square" />
              <Line x1={X(p.x1)} y1={Y(p.y1)} x2={X(p.x2)} y2={Y(p.y2)} stroke="#57524A" strokeWidth={4} strokeLinecap="square" />
            </G>
          );
        }
        if (p.t === 'door') return <Door key={`d${i}`} {...p} />;
        if (p.t === 'body') return <Body key={`b${i}`} {...p} />;
        return null;
      })}
    </Svg>
  );
});

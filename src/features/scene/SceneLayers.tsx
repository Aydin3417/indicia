import { memo, type ReactElement } from 'react';
import Svg, { Circle, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { PlanShape, ZoneShapeView, ZoneView } from '../../../shared/api';
import { CANVAS_H, CANVAS_W, UNITS_H, UNITS_W, hashString, rng, zoneCentre } from './geometry';
import { font } from '../../theme/tokens';

const X = (x: number) => x * UNITS_W;
const Y = (y: number) => y * UNITS_H;

function ShapeOutline({ s, stroke, fill, width, dash, opacity }: { s: ZoneShapeView; stroke: string; fill: string; width: number; dash?: string; opacity: number }) {
  if (s.kind === 'rect') return <Rect x={X(s.x)} y={Y(s.y)} width={X(s.w)} height={Y(s.h)} rx={6} stroke={stroke} fill={fill} strokeWidth={width} strokeDasharray={dash} opacity={opacity} />;
  if (s.kind === 'circle') return <Circle cx={X(s.x)} cy={Y(s.y)} r={X(s.r)} stroke={stroke} fill={fill} strokeWidth={width} strokeDasharray={dash} opacity={opacity} />;
  return <Polygon points={s.points.map(([px, py]) => `${X(px)},${Y(py)}`).join(' ')} stroke={stroke} fill={fill} strokeWidth={width} strokeDasharray={dash} opacity={opacity} />;
}

/** Highlight of the zone under the beam + numbered evidence tents on inspected zones. Changes only when the lit zone does. */
export const ZoneMarks = memo(function ZoneMarks({ zones, litId, tool }: { zones: ZoneView[]; litId: string | null; tool: string }) {
  const lit = zones.find((z) => z.id === litId);
  const tint = tool === 'uv' ? '#B9A6FF' : '#E8C77E';
  const tents: ReactElement[] = [];
  zones.forEach((z, i) => {
    if (!z.inspected) return;
    const c = zoneCentre(z.shape);
    const cx = X(c.x) + 14, cy = Y(c.y) - 14;
    tents.push(
      <G key={z.id}>
        <Path d={`M${cx - 9} ${cy + 8} L${cx} ${cy - 8} L${cx + 9} ${cy + 8} Z`} fill="#D9B24A" stroke="#3A2E10" strokeWidth={1} />
        <SvgText x={cx} y={cy + 6} fontSize={9} fontFamily={font.monoMedium} fill="#1E1D1B" textAnchor="middle">{i + 1}</SvgText>
      </G>,
    );
  });
  return (
    <Svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${UNITS_W} ${UNITS_H}`} pointerEvents="none">
      {tents}
      {lit ? (
        <G>
          <ShapeOutline s={lit.shape} stroke={tint} fill={tint} width={10} opacity={0.08} />
          <ShapeOutline s={lit.shape} stroke={tint} fill="none" width={1.6} dash="5,6" opacity={0.75} />
        </G>
      ) : null}
    </Svg>
  );
});

/** What fluoresces under UV: generic traces near surfaces, plus zones found by UV. Only mounted with the UV lamp on. */
export const UvTraces = memo(function UvTraces({ plan, zones, seedKey, bare }: {
  plan: PlanShape[]; zones: ZoneView[]; seedKey: string;
  /** only the traces found by UV (over a painted UV layer, which carries its own glow) */
  bare?: boolean;
}) {
  const rand = rng(hashString(`${seedKey}:uv`));
  const rects = bare ? [] : plan.filter((p): p is Extract<PlanShape, { t: 'rect' }> => p.t === 'rect' && !p.dashed);
  const items: ReactElement[] = [];
  rects.forEach((r, i) => {
    const n = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const px = X(r.x) + rand() * X(r.w);
      const py = Y(r.y + r.h) + 4 + rand() * 30;
      const s = 4 + rand() * 9;
      items.push(<Path key={`${i}-${k}`} d={`M${px} ${py} q${s} ${-s * 0.6} ${s * 1.8} ${s * 0.2} q${-s * 0.4} ${s * 0.8} ${-s * 1.6} ${s * 0.3} z`} fill="#C9D8FF" opacity={0.28 + rand() * 0.2} />);
    }
  });
  if (!bare) for (let k = 0; k < 40; k++) items.push(<Circle key={`s${k}`} cx={40 + rand() * 920} cy={40 + rand() * 740} r={0.8 + rand() * 1.6} fill="#E4E9FF" opacity={0.35} />);
  zones.filter((z) => z.reveal === 'uv').forEach((z) => {
    items.push(<ShapeOutline key={z.id} s={z.shape} stroke="#9FE3FF" fill="#9FE3FF" width={2} opacity={0.35} />);
  });
  return (
    <Svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${UNITS_W} ${UNITS_H}`} pointerEvents="none">
      <G>{items}</G>
    </Svg>
  );
});

/** Fingerprint powder brushed so far (scene units). The live stroke is the last entry. */
export const DustLayer = memo(function DustLayer({ strokes, zones }: { strokes: number[][]; zones: ZoneView[] }) {
  return (
    <Svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${UNITS_W} ${UNITS_H}`} pointerEvents="none">
      {strokes.map((p, i) => {
        if (p.length < 4) return null;
        let d = `M${p[0]} ${p[1]}`;
        for (let k = 2; k < p.length; k += 2) d += ` L${p[k]} ${p[k + 1]}`;
        return (
          <G key={i}>
            <Path d={d} stroke="#9C978C" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.16} />
            <Path d={d} stroke="#C8C2B4" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.18} strokeDasharray="1,5" />
          </G>
        );
      })}
      {zones.filter((z) => z.reveal === 'dust').map((z) => {
        // lifted prints (or their absence) stay visible where the powder found something
        const c = zoneCentre(z.shape);
        return (
          <G key={z.id} opacity={0.6}>
            <ShapeOutline s={z.shape} stroke="#D8D2C4" fill="#D8D2C4" width={1} opacity={0.25} />
            <Circle cx={X(c.x)} cy={Y(c.y)} r={8} stroke="#F0EBDF" strokeWidth={1} fill="none" strokeDasharray="2,2" />
          </G>
        );
      })}
    </Svg>
  );
});

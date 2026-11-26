import { memo, type ReactElement } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { hashString, rng } from './geometry';

// Close-up plates drawn in code, 300×300. A motif is picked from the zone's art key or id by keyword; anything
// unknown gets a generic lit surface. This is a stand-in for real art (see docs/handoff/D.md).

type Motif =
  | 'body' | 'shelf' | 'rungs' | 'toolwall' | 'bench' | 'papers' | 'floor' | 'sink' | 'cabinet' | 'desk' | 'drawer'
  | 'files' | 'door' | 'violin' | 'ledger' | 'reader' | 'yard' | 'generic';

export function motifOf(key: string): Motif {
  const k = key.toLowerCase();
  const table: [RegExp, Motif][] = [
    [/body|victim|corpse/, 'body'], [/rung/, 'rungs'], [/ladder|shelf|shelv/, 'shelf'], [/tool|mallet|peg/, 'toolwall'],
    [/paper|note|letter/, 'papers'], [/bench|lamp|work/, 'bench'], [/floor|ground|glint/, 'floor'], [/sink|bin|rag|clean/, 'sink'],
    [/bow|cabinet|vitrine/, 'cabinet'], [/diary|desk/, 'desk'], [/drawer|folder/, 'drawer'], [/file|binder|account/, 'files'],
    [/door|entrance|lock/, 'door'], [/violin|case|instrument/, 'violin'], [/ledger|book|register/, 'ledger'],
    [/reader|fob|panel|controller/, 'reader'], [/court|yard|tyre|tire|track|street/, 'yard'],
  ];
  for (const [re, m] of table) if (re.test(k)) return m;
  return 'generic';
}

function Plate({ motif, seed }: { motif: Motif; seed: number }): ReactElement {
  const r = rng(seed);
  switch (motif) {
    case 'body':
      return (
        <G>
          <Rect width={300} height={300} fill="#2A2119" />
          {Array.from({ length: 9 }, (_, i) => <Line key={i} x1={0} y1={i * 34 + 10} x2={300} y2={i * 34 + 14} stroke="#1A140F" strokeWidth={2} />)}
          <Path d="M40 210 q20 -60 80 -70 l60 -6 q50 -2 90 30 l10 40 l-60 10 l-110 6 q-50 4 -70 -10z" fill="#36363C" />
          <Path d="M60 150 q10 -40 50 -40 q40 0 40 40 q-6 30 -46 32 q-36 0 -44 -32z" fill="#B59A86" />
          <Path d="M58 140 q20 -46 70 -30 q-20 -10 -50 4z" fill="#5A5048" />
          <Ellipse cx={96} cy={128} rx={10} ry={7} fill="#5E1C1E" />
          <Path d="M92 122 q8 -6 14 2" stroke="#2C0C0D" strokeWidth={2} fill="none" />
          <Path d="M150 190 q40 30 90 20" stroke="#26262A" strokeWidth={14} fill="none" strokeLinecap="round" />
          <Rect x={190} y={50} width={90} height={60} fill="#5B4330" />
          <Path d="M210 80 q10 -10 24 0 q14 -10 24 0" stroke="#C7C2B6" strokeWidth={2.5} fill="none" />
          <Circle cx={222} cy={80} r={9} stroke="#C7C2B6" strokeWidth={2} fill="none" />
          <Circle cx={246} cy={80} r={9} stroke="#C7C2B6" strokeWidth={2} fill="none" />
        </G>
      );
    case 'shelf':
      return (
        <G>
          <Rect width={300} height={300} fill="#1F1A15" />
          {[30, 120, 210].map((y, i) => (
            <G key={i}>
              <Rect x={10} y={y + 60} width={280} height={10} fill="#4A3826" />
              {Array.from({ length: 10 }, (_, k) => <Rect key={k} x={18 + k * 27} y={y + 8} width={20} height={52} fill={k % 2 ? '#9B7A52' : '#8C6B47'} />)}
              <Rect x={14} y={y + 4} width={272} height={56} fill="#CFC8B8" opacity={i === 0 ? 0.22 : 0.1} />
            </G>
          ))}
          <Path d="M40 260 l220 -40" stroke="#7A5B3A" strokeWidth={10} />
        </G>
      );
    case 'rungs':
      return (
        <G>
          <Rect width={300} height={300} fill="#18140F" />
          <Rect x={50} y={0} width={18} height={300} fill="#7A5B3A" />
          <Rect x={232} y={0} width={18} height={300} fill="#7A5B3A" />
          {[50, 130, 210].map((y) => <Rect key={y} x={60} y={y} width={180} height={22} rx={4} fill="#8B6A45" />)}
          {Array.from({ length: 220 }, (_, i) => <Circle key={i} cx={60 + r() * 180} cy={40 + r() * 200} r={0.8 + r() * 1.5} fill="#D8D2C4" opacity={0.5} />)}
        </G>
      );
    case 'toolwall':
      return (
        <G>
          <Rect width={300} height={300} fill="#3C3328" />
          {Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => <Circle key={`${i}-${j}`} cx={10 + i * 20} cy={10 + j * 20} r={2} fill="#1B1712" />))}
          {[0, 1, 2, 3, 4, 5].map((n) => {
            const cx = 30 + (n % 3) * 90, cy = n < 3 ? 70 : 200;
            const crooked = n === 4;
            return (
              <G key={n} transform={`rotate(${crooked ? 14 : 0} ${cx} ${cy})`}>
                <Path d={`M${cx - 24} ${cy - 40} h48 v28 h-48z`} fill="none" stroke="#C9B994" strokeDasharray="4,3" opacity={0.5} transform={crooked ? `rotate(-14 ${cx} ${cy})` : undefined} />
                <Rect x={cx - 5} y={cy - 14} width={10} height={70} fill="#8A6E52" />
                <Rect x={cx - 24} y={cy - 40} width={48} height={28} rx={5} fill={crooked ? '#6E4C2C' : '#55402C'} />
                {crooked ? <Rect x={cx - 24} y={cy - 40} width={48} height={28} rx={5} fill="#FFF" opacity={0.08} /> : null}
              </G>
            );
          })}
        </G>
      );
    case 'bench':
      return (
        <G>
          <Rect width={300} height={300} fill="#5B4330" />
          {Array.from({ length: 8 }, (_, i) => <Path key={i} d={`M0 ${20 + i * 38} q150 ${r() * 10 - 5} 300 0`} stroke="#3E2C1E" strokeWidth={1.4} fill="none" />)}
          <Path d="M60 180 q90 -40 180 0 v40 h-180z" fill="#2A1E15" />
          <Path d="M70 190 q80 -30 160 0" stroke="#7A5B3A" strokeWidth={6} fill="none" />
          <Rect x={40} y={40} width={70} height={30} rx={4} fill="#2B2F31" />
          <Path d="M110 55 l60 60" stroke="#2B2F31" strokeWidth={6} />
          <Path d="M150 120 l70 60 l-110 0z" fill="#8F7BFF" opacity={0.18} />
          <Line x1={230} y1={60} x2={260} y2={150} stroke="#A9A9A9" strokeWidth={3} />
          <Circle cx={230} cy={58} r={12} fill="#9EA6A8" stroke="#D3D8D9" />
        </G>
      );
    case 'papers':
      return (
        <G>
          <Rect width={300} height={300} fill="#4A3424" />
          {[0, 1, 2].map((i) => (
            <G key={i} transform={`rotate(${-8 + i * 7} 150 150)`}>
              <Rect x={60 + i * 10} y={50 + i * 12} width={170} height={210} fill={i === 2 ? '#E6E1D5' : '#CFC8B8'} />
              {Array.from({ length: 9 }, (_, k) => <Line key={k} x1={78 + i * 10} y1={82 + i * 12 + k * 18} x2={(200 - (k % 3) * 20) + i * 10} y2={82 + i * 12 + k * 18} stroke="#8A8270" strokeWidth={2} opacity={i === 2 ? 0.7 : 0.4} />)}
            </G>
          ))}
          <Path d="M30 250 l90 -60 M120 190 l10 -16 M120 190 l-4 -18" stroke="#B7B3A8" strokeWidth={5} strokeLinecap="round" />
        </G>
      );
    case 'floor':
      return (
        <G>
          <Rect width={300} height={300} fill="#2B2219" />
          {Array.from({ length: 9 }, (_, i) => <Line key={i} x1={0} y1={i * 34} x2={300} y2={i * 34} stroke="#17110C" strokeWidth={2} />)}
          {Array.from({ length: 60 }, (_, i) => {
            const x = r() * 300, y = r() * 300, s = 6 + r() * 12;
            return <Path key={i} d={`M${x} ${y} q${s} ${-s} ${s * 2} 0 q${-s * 0.4} ${s * 0.6} ${-s * 1.2} ${s * 0.3}`} stroke="#C9AE76" strokeWidth={1.6} fill="none" opacity={0.7} />;
          })}
          <Rect x={70} y={120} width={40} height={10} rx={4} fill="#1A120C" transform="rotate(30 90 125)" />
        </G>
      );
    case 'sink':
      return (
        <G>
          <Rect width={300} height={300} fill="#53585A" />
          <Rect x={30} y={30} width={240} height={140} rx={24} fill="#2D3133" stroke="#787E80" strokeWidth={3} />
          <Circle cx={150} cy={100} r={9} fill="#141617" />
          <Rect x={40} y={190} width={90} height={90} rx={6} fill="#3B4048" />
          <Rect x={150} y={190} width={110} height={100} rx={8} fill="#2A2D2E" stroke="#606668" />
          <Path d="M175 210 q30 20 60 0 q-10 40 -50 34 z" fill="#8E8670" />
          <Path d="M180 225 q20 10 40 2" stroke="#5E5846" strokeWidth={2} fill="none" />
        </G>
      );
    case 'cabinet':
      return (
        <G>
          <Rect width={300} height={300} fill="#2C2620" />
          <Rect x={20} y={20} width={260} height={260} fill="#6E8A8C" opacity={0.1} stroke="#5A4B3A" strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => (
            <G key={i}>
              <Line x1={40} y1={50 + i * 28} x2={260} y2={40 + i * 28} stroke={i === 4 ? 'transparent' : '#B08A5A'} strokeWidth={4} strokeLinecap="round" />
              <Rect x={40} y={36 + i * 28} width={10} height={14} fill="#1A1612" />
            </G>
          ))}
          <Rect x={110} y={150} width={80} height={18} fill="#E6E1D5" opacity={0.85} />
        </G>
      );
    case 'desk':
      return (
        <G>
          <Rect width={300} height={300} fill="#4A3424" />
          <Rect x={40} y={50} width={220} height={190} fill="#7C2E2E" />
          <Rect x={52} y={60} width={98} height={170} fill="#E6E1D5" />
          <Rect x={152} y={60} width={98} height={170} fill="#E0DACC" />
          {Array.from({ length: 7 }, (_, k) => <Line key={k} x1={62} y1={84 + k * 20} x2={140} y2={84 + k * 20} stroke="#8A8270" strokeWidth={1.5} />)}
          {Array.from({ length: 7 }, (_, k) => <Line key={`b${k}`} x1={162} y1={84 + k * 20} x2={240} y2={84 + k * 20} stroke="#8A8270" strokeWidth={1.5} />)}
          <Path d="M170 120 q20 -6 50 0 M170 140 q30 4 60 -2" stroke="#2E3A66" strokeWidth={1.6} fill="none" />
        </G>
      );
    case 'drawer':
      return (
        <G>
          <Rect width={300} height={300} fill="#3A2A1E" />
          <Rect x={20} y={40} width={260} height={230} fill="#2A1E15" stroke="#5A4330" strokeWidth={4} />
          <Rect x={60} y={70} width={190} height={150} fill="#C9B07A" transform="rotate(-4 150 145)" />
          <Rect x={90} y={100} width={120} height={22} fill="#E6E1D5" transform="rotate(-4 150 110)" />
        </G>
      );
    case 'files':
      return (
        <G>
          <Rect width={300} height={300} fill="#4B5052" />
          {Array.from({ length: 6 }, (_, i) => (
            <Rect key={i} x={30 + i * 42} y={40} width={34} height={220} fill={['#2E3A55', '#3A2E2E', '#2E3A55', '#3A3A2E', '#2E3A55', '#C9C2B0'][i]} />
          ))}
          <Rect x={240} y={40} width={14} height={220} fill="#C9C2B0" />
        </G>
      );
    case 'door':
      return (
        <G>
          <Rect width={300} height={300} fill="#24201C" />
          <Rect x={70} y={10} width={160} height={290} fill="#5A3E28" stroke="#2A1E15" strokeWidth={6} />
          <Rect x={190} y={140} width={26} height={60} rx={3} fill="#9EA6A8" />
          <Circle cx={203} cy={160} r={6} fill="#3A3F42" />
          <Rect x={40} y={10} width={30} height={290} fill="#3A332B" />
        </G>
      );
    case 'violin':
      return (
        <G>
          <Rect width={300} height={300} fill="#2A1A16" />
          <Path d="M150 30 q-50 0 -50 50 q0 20 14 30 q-24 14 -24 50 q0 70 60 76 q60 -6 60 -76 q0 -36 -24 -50 q14 -10 14 -30 q0 -50 -50 -50z" fill="#8A3B14" stroke="#3A1608" strokeWidth={3} />
          <Path d="M150 30 q-50 0 -50 50 q0 20 14 30 q-24 14 -24 50 q0 70 60 76 q60 -6 60 -76 q0 -36 -24 -50 q14 -10 14 -30 q0 -50 -50 -50z" fill="#E8A14A" opacity={0.15} />
          <Path d="M130 130 q-6 20 0 40 M170 130 q6 20 0 40" stroke="#1A0A05" strokeWidth={3} fill="none" />
          <Rect x={144} y={0} width={12} height={40} fill="#1A1A1A" />
          <Line x1={150} y1={40} x2={150} y2={250} stroke="#1A1A1A" strokeWidth={2} />
        </G>
      );
    case 'ledger':
      return (
        <G>
          <Rect width={300} height={300} fill="#3A2A1E" />
          <Rect x={30} y={40} width={240} height={220} fill="#E6E1D5" />
          <Line x1={150} y1={40} x2={150} y2={260} stroke="#8A8270" strokeWidth={3} />
          {Array.from({ length: 10 }, (_, k) => <Line key={k} x1={40} y1={70 + k * 18} x2={260} y2={70 + k * 18} stroke="#A9A190" strokeWidth={1} />)}
          {[90, 120, 200, 230].map((x) => <Line key={x} x1={x} y1={60} x2={x} y2={250} stroke="#B2645E" strokeWidth={1} opacity={0.6} />)}
          {Array.from({ length: 7 }, (_, k) => <Path key={`h${k}`} d={`M46 ${84 + k * 18} q14 -6 30 0 q10 4 20 -2`} stroke="#2E3A66" strokeWidth={1.4} fill="none" />)}
        </G>
      );
    case 'reader':
      return (
        <G>
          <Rect width={300} height={300} fill="#3A3833" />
          <Rect x={90} y={60} width={120} height={180} rx={10} fill="#2A2D30" stroke="#6C7276" strokeWidth={3} />
          <Circle cx={150} cy={120} r={26} fill="#1A1C1E" stroke="#4A4F53" />
          <Circle cx={150} cy={120} r={6} fill="#C33A3A" />
          <Rect x={110} y={190} width={80} height={16} fill="#E6E1D5" />
        </G>
      );
    case 'yard':
      return (
        <G>
          <Rect width={300} height={300} fill="#1F2224" />
          {Array.from({ length: 11 }, (_, i) => Array.from({ length: 13 }, (_, j) => (
            <Ellipse key={`${i}-${j}`} cx={(j % 2 ? 14 : 0) + i * 28} cy={j * 24} rx={12} ry={10} fill="#3A3F42" />
          )))}
          <Rect width={300} height={300} fill="#DDE6EC" opacity={0.12} />
          <Path d="M40 300 q60 -120 120 -180 q40 -40 100 -100" stroke="#14171A" strokeWidth={4} fill="none" />
          <Path d="M52 300 q60 -120 120 -180 q40 -40 100 -100" stroke="#14171A" strokeWidth={4} fill="none" opacity={0.6} />
        </G>
      );
    default:
      return (
        <G>
          <Rect width={300} height={300} fill="#2B2620" />
          {Array.from({ length: 40 }, (_, i) => <Circle key={i} cx={r() * 300} cy={r() * 300} r={1 + r() * 2} fill="#8E887C" opacity={0.4} />)}
        </G>
      );
  }
}

/** A lit plate: the motif under a soft lens vignette. Static. */
export const CloseUpArt = memo(function CloseUpArt({ artKey, size }: { artKey: string; size: number }) {
  const motif = motifOf(artKey);
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Defs>
        <RadialGradient id="vignette" cx="150" cy="150" r="212" gradientUnits="userSpaceOnUse">
          <Stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </RadialGradient>
        <RadialGradient id="warm" cx="130" cy="120" r="200" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE2B0" stopOpacity="0.12" />
          <Stop offset="1" stopColor="#FFE2B0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Plate motif={motif} seed={hashString(artKey)} />
      <Rect width={300} height={300} fill="url(#warm)" />
      <Rect width={300} height={300} fill="url(#vignette)" />
    </Svg>
  );
});

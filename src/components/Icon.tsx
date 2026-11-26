import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { color } from '../theme/tokens';

export type IconName =
  | 'back' | 'file' | 'scene' | 'evidence' | 'people' | 'board' | 'clock' | 'lab' | 'chevron' | 'lock'
  | 'plus' | 'link' | 'send' | 'close' | 'hq' | 'cases' | 'dossier' | 'gavel' | 'note' | 'bulb' | 'check' | 'search'
  | 'map' | 'notebook' | 'deduce' | 'star' | 'starFilled' | 'moon' | 'pin' | 'globe';

/** Thin-stroke line icons drawn in code (24×24 grid). */
export function Icon({ name, size = 20, tint = color.text, weight = 1.5 }: { name: IconName; size?: number; tint?: string; weight?: number }) {
  const p = { stroke: tint, strokeWidth: weight, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...p} />}
      {name === 'chevron' && <Path d="M9 5l7 7-7 7" {...p} />}
      {name === 'close' && (<><Line x1={6} y1={6} x2={18} y2={18} {...p} /><Line x1={18} y1={6} x2={6} y2={18} {...p} /></>)}
      {name === 'plus' && (<><Line x1={12} y1={5} x2={12} y2={19} {...p} /><Line x1={5} y1={12} x2={19} y2={12} {...p} /></>)}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {name === 'file' && (<><Path d="M6 3h8l4 4v14H6z" {...p} /><Path d="M14 3v4h4M9 12h6M9 16h6" {...p} /></>)}
      {name === 'scene' && (<><Rect x={3.5} y={4.5} width={17} height={15} {...p} /><Path d="M3.5 11h7v8.5M14 4.5v6h6.5" {...p} /><Circle cx={16.5} cy={15.5} r={1.4} {...p} /></>)}
      {name === 'evidence' && (<><Path d="M5 7h14l-1 13H6z" {...p} /><Path d="M9 7V5a3 3 0 016 0v2M9 12h6" {...p} /></>)}
      {name === 'people' && (<><Circle cx={9} cy={8.5} r={3.2} {...p} /><Path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5" {...p} /><Path d="M15.5 5.5a3 3 0 010 6M17.5 14.3c1.5.7 2.6 2.3 3 4.7" {...p} /></>)}
      {name === 'board' && (<><Rect x={3.5} y={4} width={17} height={16} {...p} /><Circle cx={8} cy={9} r={1.3} {...p} /><Circle cx={16} cy={8} r={1.3} {...p} /><Circle cx={12} cy={15.5} r={1.3} {...p} /><Path d="M9 9.7l2.3 4.8M15.2 9.1l-2.4 5.2M9.3 9l5.4-.8" {...p} /></>)}
      {name === 'clock' && (<><Circle cx={12} cy={12} r={8.5} {...p} /><Path d="M12 7v5l3.5 2" {...p} /></>)}
      {name === 'lab' && (<><Path d="M9.5 3.5h5M10.5 3.5v6L5 19a1 1 0 00.9 1.5h12.2A1 1 0 0019 19l-5.5-9.5v-6" {...p} /><Path d="M7.5 15h9" {...p} /></>)}
      {name === 'lock' && (<><Rect x={5.5} y={10.5} width={13} height={10} {...p} /><Path d="M8.5 10.5V7.5a3.5 3.5 0 017 0v3" {...p} /></>)}
      {name === 'link' && (<><Path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" {...p} /><Path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" {...p} /></>)}
      {name === 'send' && <Path d="M4 12l16-8-6 16-2.5-6.5z" {...p} />}
      {name === 'hq' && (<><Path d="M3.5 20.5h17M5.5 20.5V9l6.5-5 6.5 5v11.5" {...p} /><Path d="M10 20.5v-6h4v6" {...p} /></>)}
      {name === 'cases' && (<><Path d="M3.5 7.5h6l1.5 2h9.5v10h-17z" {...p} /><Path d="M3.5 7.5V5h6" {...p} /></>)}
      {name === 'dossier' && (<><Rect x={4.5} y={3.5} width={15} height={17} {...p} /><Circle cx={12} cy={10} r={2.8} {...p} /><Path d="M7.5 17c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" {...p} /></>)}
      {name === 'gavel' && (<><Path d="M13.5 4.5l6 6M11 7l6 6M12.2 5.8l4.9 4.9-3.2 3.2-4.9-4.9z" {...p} /><Path d="M11.5 12.5L4.5 19.5M4 21h9" {...p} /></>)}
      {name === 'note' && (<><Path d="M5 4h14v11l-5 5H5z" {...p} /><Path d="M14 20v-5h5M8.5 9h7M8.5 12.5h4" {...p} /></>)}
      {name === 'bulb' && (<><Path d="M9 17h6M10 20h4M12 3.5a5.5 5.5 0 00-3.2 10c.5.4.7.9.7 1.5h5c0-.6.2-1.1.7-1.5A5.5 5.5 0 0012 3.5z" {...p} /></>)}
      {name === 'search' && (<><Circle cx={10.5} cy={10.5} r={6} {...p} /><Line x1={15} y1={15} x2={20} y2={20} {...p} /></>)}
      {name === 'map' && (<><Path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" {...p} /><Path d="M9 4.5v13M15 6.5v13" {...p} /></>)}
      {name === 'notebook' && (<><Rect x={5.5} y={3.5} width={13} height={17} {...p} /><Path d="M5.5 7.5h-2M5.5 12h-2M5.5 16.5h-2M9 8h6.5M9 11.5h6.5M9 15h4" {...p} /></>)}
      {name === 'deduce' && (<><Circle cx={6.5} cy={7} r={2.2} {...p} /><Circle cx={17.5} cy={7} r={2.2} {...p} /><Circle cx={12} cy={17.5} r={2.4} {...p} /><Path d="M8.2 8.6l2.6 6.8M15.8 8.6l-2.6 6.8M8.8 7h6.4" {...p} /></>)}
      {name === 'star' && <Path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" {...p} />}
      {name === 'starFilled' && <Path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" {...p} fill={tint} />}
      {name === 'moon' && <Path d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z" {...p} />}
      {name === 'pin' && (<><Path d="M12 21s-6-5.6-6-10.5a6 6 0 0112 0C18 15.4 12 21 12 21z" {...p} /><Circle cx={12} cy={10.5} r={2.2} {...p} /></>)}
      {name === 'globe' && (<><Circle cx={12} cy={12} r={8.5} {...p} /><Path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5M12 3.5C9.5 6.1 8.5 8.9 8.5 12s1 5.9 3.5 8.5" {...p} /></>)}
    </Svg>
  );
}

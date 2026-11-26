// Indicia design tokens — an investigative workstation, not an "AI app".
export const color = {
  bg: '#111315',
  surface: '#1B1F22',
  elevated: '#24292D',
  border: '#34393C',
  borderSoft: '#272C2F',
  text: '#E8E5DE',
  textDim: '#A5A7A5',
  textFaint: '#6F7472',
  burgundy: '#873D42',
  burgundyBright: '#B0585E',
  burgundyDeep: '#3A1E21',
  green: '#748575',
  greenBright: '#9AAE9B',
  amber: '#B89A62',
  paper: '#E6E1D5',
  paperEdge: '#CFC8B8',
  ink: '#1E1D1B',
  inkDim: '#5A574F',
  stamp: '#8C2F33',
  overlay: 'rgba(8,9,10,0.72)',
} as const;

export const font = {
  serif: 'Newsreader_500Medium',
  serifItalic: 'Newsreader_400Regular_Italic',
  serifBold: 'Newsreader_600SemiBold',
  sans: 'IBMPlexSans_400Regular',
  sansMedium: 'IBMPlexSans_500Medium',
  sansBold: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 2, md: 4, lg: 6 } as const;

export const type = {
  eyebrow: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.6, color: color.textFaint, textTransform: 'uppercase' as const },
  display: { fontFamily: font.serif, fontSize: 34, lineHeight: 38, color: color.text, letterSpacing: -0.4 },
  title: { fontFamily: font.serif, fontSize: 24, lineHeight: 29, color: color.text },
  heading: { fontFamily: font.sansBold, fontSize: 15, lineHeight: 20, color: color.text, letterSpacing: 0.1 },
  body: { fontFamily: font.sans, fontSize: 15, lineHeight: 22, color: color.text },
  bodyDim: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textDim },
  small: { fontFamily: font.sans, fontSize: 12, lineHeight: 16, color: color.textDim },
  mono: { fontFamily: font.mono, fontSize: 13, lineHeight: 19, color: color.text },
  quote: { fontFamily: font.serifItalic, fontSize: 17, lineHeight: 25, color: color.text },
} as const;

/** Timeline lanes. Suspect lanes fall back to their portrait tone. */
export const laneColor: Record<string, string> = {
  victim: color.textDim,
  scene: color.amber,
};

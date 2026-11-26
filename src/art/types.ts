import type { ImageSourcePropType } from 'react-native';
import type { Composure } from '../../shared/api';

/** One image from assets/art (see docs/ART_BIBLE.md): bundled source, pixel size, alt text per language. */
export interface ArtImage {
  src: ImageSourcePropType;
  w: number;
  h: number;
  alt: { en: string; tr: string };
}

/** A plate with an optional ultraviolet layer drawn over the same composition. */
export interface Layered {
  base: ArtImage;
  uv?: ArtImage;
}

/** The four composure stages of one interrogated person. */
export type Staged = Partial<Record<Composure, ArtImage>>;

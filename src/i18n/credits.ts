// Strings for the credits screen (app/credits.tsx) and its entry in Settings (wave 7, Agent R).
// Kept in their own file so the shared dictionaries (en.ts / tr.ts) are not touched; `useCreditsT` reads this table
// in the current UI language and falls back to English, like the shared `t`.
// The attribution facts (titles, authors, licences, links) come from assets/audio/CREDITS.md and the fonts' own
// name tables; they are data, not translated — only the sentences around them are.
import { useCallback } from 'react';
import { useLocale, type Locale, type Vars } from './index';

type Table = Record<string, string>;

const en: Table = {
  'credits.open': 'Credits and licences',
  'credits.openNote': 'Sound recordings, typefaces and pictures',
  'credits.title': 'Credits',
  'credits.intro': 'Indicia is made with other people’s work as well as our own. This is who made what, and the licence it is used under.',
  'credits.sound': 'Sound',
  'credits.soundUi': 'Every interface sound (the chimes, glass and bell tones) was synthesised for Indicia and belongs to the game.',
  'credits.soundRooms': 'The room tones under the scenes and interviews are built from these field recordings, all found on Wikimedia Commons. We cut, filtered, mixed and looped them.',
  'credits.usedIn': 'Used in: {rooms}',
  'credits.modified': 'Modified',
  'credits.source': 'Source',
  'credits.licence': 'Licence',
  'credits.fonts': 'Typefaces',
  'credits.fontsText': 'Both typefaces are free under the SIL Open Font License 1.1, which lets them ship inside an app.',
  'credits.art': 'Pictures',
  'credits.artText': 'The portraits, rooms, close-ups, documents and case covers were made for Indicia with the image model in Google Flow, from our own written briefs, and finished by us (cropping, alignment, layers). They contain no other artist’s work. The people and places in them are invented.',
  'credits.software': 'Software',
  'credits.softwareText': 'Built with React Native, Expo and other open-source libraries, each under its own licence.',
  'credits.room.workshop': 'the workshop',
  'credits.room.interview': 'interviews',
  'credits.room.gallery': 'the gallery',
  'credits.room.quiet': 'the quiet rooms',
  'credits.openLink': 'Opens {name} in the browser',
};

const tr: Table = {
  'credits.open': 'Künye ve lisanslar',
  'credits.openNote': 'Ses kayıtları, yazı tipleri, resimler',
  'credits.title': 'Künye',
  'credits.intro': 'Indicia’da yalnızca bizim emeğimiz yok. Neyi kimin yaptığı ve hangi lisansla kullandığımız burada.',
  'credits.sound': 'Ses',
  'credits.soundUi': 'Arayüzdeki seslerin hepsi (çanlar, cam ve zil tınıları) Indicia için sentezlendi; oyuna ait.',
  'credits.soundRooms': 'Olay yerlerinde ve sorgularda arkada duyduğun ortam sesleri, Wikimedia Commons’ta bulunan aşağıdaki saha kayıtlarından yapıldı. Kayıtları kestik, süzdük, karıştırdık ve döngüye soktuk.',
  'credits.usedIn': 'Kullanıldığı yer: {rooms}',
  'credits.modified': 'Değiştirildi',
  'credits.source': 'Kaynak',
  'credits.licence': 'Lisans',
  'credits.fonts': 'Yazı tipleri',
  'credits.fontsText': 'İki yazı tipi de SIL Open Font License 1.1 ile ücretsiz; bu lisans bir uygulamanın içinde dağıtılmalarına izin veriyor.',
  'credits.art': 'Resimler',
  'credits.artText': 'Portreler, odalar, yakın planlar, belgeler ve dosya kapakları Indicia için, kendi yazdığımız tariflerle Google Flow’un görüntü modelinde üretildi; kırpma, hizalama ve katmanları biz yaptık. İçlerinde başka bir sanatçının işi yok. Gördüğün kişiler ve yerler hayal ürünü.',
  'credits.software': 'Yazılım',
  'credits.softwareText': 'React Native, Expo ve her biri kendi lisansıyla gelen başka açık kaynak kütüphanelerle yapıldı.',
  'credits.room.workshop': 'atölye',
  'credits.room.interview': 'sorgular',
  'credits.room.gallery': 'galeri',
  'credits.room.quiet': 'sessiz odalar',
  'credits.openLink': '{name} tarayıcıda açılır',
};

export const creditsStrings: Record<Locale, Table> = { en, tr };

const fill = (s: string, vars?: Vars) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

/** Translate a `credits.*` key in the current UI language (English fallback, then the key itself). */
export function useCreditsT() {
  const locale = useLocale();
  return useCallback((key: string, vars?: Vars) => fill(creditsStrings[locale][key] ?? en[key] ?? key, vars), [locale]);
}

// ── attribution data (assets/audio/CREDITS.md) ────────────────────────────────────────────────────────────────────

export type RoomKey = 'workshop' | 'interview' | 'gallery' | 'quiet';

export interface Recording {
  title: string;
  author: string;
  licence: 'CC BY 4.0' | 'CC BY 3.0' | 'CC0 1.0';
  licenceUrl: string;
  source: string;
  rooms: RoomKey[];
}

export const RECORDINGS: Recording[] = [
  {
    title: 'pendulum-slow-ten-o-clock',
    author: 'klankbeeld',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    source: 'https://commons.wikimedia.org/wiki/File:223959_klankbeeld_pendulum-slow-ten-o-clock.wav',
    rooms: ['workshop'],
  },
  {
    title: 'Air conditioner hum',
    author: 'Gravity Sound (gravitysound.studio)',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Air_conditioner_hum_(Gravity_Sound).wav',
    rooms: ['interview'],
  },
  {
    title: 'TU Delft Library, quiet study room – general ambience',
    author: 'el_mar',
    licence: 'CC BY 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/3.0/',
    source: 'https://commons.wikimedia.org/wiki/File:20121112_TU_Delft_Library,_quiet_study_room_-_general_ambience_-_SoundCloud_-_el_mar.ogg',
    rooms: ['interview', 'gallery', 'quiet'],
  },
  {
    title: 'Two Lane Road in Kelowna at Midnight',
    author: 'Extemporalist',
    licence: 'CC0 1.0',
    licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Two_Lane_Road_in_Kelowna_at_Midnight.flac',
    rooms: ['gallery'],
  },
];

export interface Typeface { name: string; by: string; copyright: string; url: string }

export const TYPEFACES: Typeface[] = [
  {
    name: 'Newsreader',
    by: 'Production Type',
    copyright: '© 2020 The Newsreader Project Authors',
    url: 'https://github.com/productiontype/Newsreader',
  },
  {
    name: 'IBM Plex Sans · IBM Plex Mono',
    by: 'Mike Abbink, Paul van der Laan, Pieter van Rosmalen',
    copyright: '© 2017–2019 IBM Corp.',
    url: 'https://github.com/IBM/plex',
  },
];

export const OFL_URL = 'https://openfontlicense.org/open-font-license-official-text/';

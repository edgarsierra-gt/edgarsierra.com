import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { PILLARS, type PillarKey } from '../../lib/pillars';

// Per-article Open Graph images, generated at build time (SSG, no runtime).
// astro-og-canvas appends the `.png` extension to each slug, so this file is
// `[...route].ts` (no `.png`) — routes resolve to /og/site.png and
// /og/blog/<id>.png. Pillar color is signage; the rest is neutral, matching
// the site palette in src/styles/tokens.css.

// Okabe-Ito pillar colors as RGB tuples (pillars.ts holds CSS var strings).
const PILLAR_RGB: Record<PillarKey, [number, number, number]> = {
  1: [213, 94, 0], // --c-vermilion #D55E00
  2: [0, 114, 178], // --accent      #0072B2
  3: [0, 158, 115], // --accent-2    #009E73
  4: [204, 121, 167], // --c-purple   #CC79A7
  5: [230, 159, 0], // --c-orange    #E69F00
};

const INK: [number, number, number] = [24, 24, 27]; // --ink       #18181B
const INK_MUTED: [number, number, number] = [82, 82, 91]; // --ink-muted #52525B
const BG: [number, number, number] = [251, 251, 249]; // --bg        #FBFBF9
const ACCENT: [number, number, number] = [0, 114, 178]; // --accent  #0072B2

const PLEX_REGULAR =
  './node_modules/@expo-google-fonts/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf';
const PLEX_BOLD =
  './node_modules/@expo-google-fonts/ibm-plex-sans/700Bold/IBMPlexSans_700Bold.ttf';

interface OGEntry {
  title: string;
  description: string;
  color: [number, number, number];
}

const posts = await getCollection('blog');

// Default site card (used by every non-article page via BaseLayout) plus one
// card per blog entry. Both share the same neutral editorial template.
const pages: Record<string, OGEntry> = {
  site: {
    title: 'Edgar Sierra',
    description: 'Head of BI & Data Science · Estadística, ingeniería GCP e IA aplicada',
    color: ACCENT,
  },
  'mundial-2026': {
    title: 'Laboratorio Mundial 2026',
    description: 'Predicciones probabilísticas por Edgar Sierra',
    color: ACCENT,
  },
};
for (const post of posts) {
  const pillar = post.data.pillar as PillarKey;
  pages[`blog/${post.id}`] = {
    title: post.data.title,
    description: `Edgar Sierra · ${PILLARS[pillar].name}`,
    color: PILLAR_RGB[pillar],
  };
}

// OGImageRoute is async in v0.11 — it returns a Promise, so it must be awaited.
export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page: OGEntry) => ({
    title: page.title,
    description: page.description,
    bgGradient: [BG],
    border: { color: page.color, width: 24, side: 'inline-start' },
    padding: 70,
    font: {
      title: {
        color: INK,
        size: 64,
        weight: 'bold',
        lineHeight: 1.2,
        families: ['IBM Plex Sans'],
      },
      description: {
        color: INK_MUTED,
        size: 30,
        families: ['IBM Plex Sans'],
      },
    },
    fonts: [PLEX_REGULAR, PLEX_BOLD],
  }),
});

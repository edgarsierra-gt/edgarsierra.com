type TeamDisplayInput = {
  id?: string | null;
  team_id?: string | null;
  name?: string | null;
};

export type TeamDisplay = {
  id: string;
  code: string;
  name: string;
  // flag-icons (https://github.com/lipis/flag-icons) filename, e.g. 'ar', 'gb-eng'.
  // Country flag emoji (e.g. the Argentina flag) don't render as flags on Windows
  // browsers — they fall back to plain two-letter text — so flags ship as
  // self-hosted SVGs instead. See getFlagUrl below.
  flagCode: string;
};

const TEAM_DISPLAY: Record<string, TeamDisplay> = {
  ARG: { id: 'ARG', code: 'ARG', name: 'Argentina', flagCode: 'ar' },
  AUS: { id: 'AUS', code: 'AUS', name: 'Australia', flagCode: 'au' },
  AUT: { id: 'AUT', code: 'AUT', name: 'Austria', flagCode: 'at' },
  BEL: { id: 'BEL', code: 'BEL', name: 'Bélgica', flagCode: 'be' },
  BIH: { id: 'BIH', code: 'BIH', name: 'Bosnia y Herzegovina', flagCode: 'ba' },
  BRA: { id: 'BRA', code: 'BRA', name: 'Brasil', flagCode: 'br' },
  CAN: { id: 'CAN', code: 'CAN', name: 'Canadá', flagCode: 'ca' },
  CIV: { id: 'CIV', code: 'CIV', name: 'Costa de Marfil', flagCode: 'ci' },
  COD: { id: 'COD', code: 'COD', name: 'RD del Congo', flagCode: 'cd' },
  COL: { id: 'COL', code: 'COL', name: 'Colombia', flagCode: 'co' },
  CPV: { id: 'CPV', code: 'CPV', name: 'Cabo Verde', flagCode: 'cv' },
  CRO: { id: 'CRO', code: 'CRO', name: 'Croacia', flagCode: 'hr' },
  CUW: { id: 'CUW', code: 'CUW', name: 'Curazao', flagCode: 'cw' },
  CZE: { id: 'CZE', code: 'CZE', name: 'Chequia', flagCode: 'cz' },
  DZA: { id: 'DZA', code: 'DZA', name: 'Argelia', flagCode: 'dz' },
  ECU: { id: 'ECU', code: 'ECU', name: 'Ecuador', flagCode: 'ec' },
  EGY: { id: 'EGY', code: 'EGY', name: 'Egipto', flagCode: 'eg' },
  ENG: { id: 'ENG', code: 'ENG', name: 'Inglaterra', flagCode: 'gb-eng' },
  ESP: { id: 'ESP', code: 'ESP', name: 'España', flagCode: 'es' },
  FRA: { id: 'FRA', code: 'FRA', name: 'Francia', flagCode: 'fr' },
  GER: { id: 'GER', code: 'GER', name: 'Alemania', flagCode: 'de' },
  GHA: { id: 'GHA', code: 'GHA', name: 'Ghana', flagCode: 'gh' },
  HTI: { id: 'HTI', code: 'HTI', name: 'Haití', flagCode: 'ht' },
  IRI: { id: 'IRI', code: 'IRI', name: 'Irán', flagCode: 'ir' },
  IRQ: { id: 'IRQ', code: 'IRQ', name: 'Irak', flagCode: 'iq' },
  JOR: { id: 'JOR', code: 'JOR', name: 'Jordania', flagCode: 'jo' },
  JPN: { id: 'JPN', code: 'JPN', name: 'Japón', flagCode: 'jp' },
  KOR: { id: 'KOR', code: 'KOR', name: 'Corea del Sur', flagCode: 'kr' },
  KSA: { id: 'KSA', code: 'KSA', name: 'Arabia Saudita', flagCode: 'sa' },
  MAR: { id: 'MAR', code: 'MAR', name: 'Marruecos', flagCode: 'ma' },
  MEX: { id: 'MEX', code: 'MEX', name: 'México', flagCode: 'mx' },
  NED: { id: 'NED', code: 'NED', name: 'Países Bajos', flagCode: 'nl' },
  NOR: { id: 'NOR', code: 'NOR', name: 'Noruega', flagCode: 'no' },
  NZL: { id: 'NZL', code: 'NZL', name: 'Nueva Zelanda', flagCode: 'nz' },
  PAN: { id: 'PAN', code: 'PAN', name: 'Panamá', flagCode: 'pa' },
  PAR: { id: 'PAR', code: 'PAR', name: 'Paraguay', flagCode: 'py' },
  POR: { id: 'POR', code: 'POR', name: 'Portugal', flagCode: 'pt' },
  QAT: { id: 'QAT', code: 'QAT', name: 'Catar', flagCode: 'qa' },
  RSA: { id: 'RSA', code: 'RSA', name: 'Sudáfrica', flagCode: 'za' },
  SCO: { id: 'SCO', code: 'SCO', name: 'Escocia', flagCode: 'gb-sct' },
  SEN: { id: 'SEN', code: 'SEN', name: 'Senegal', flagCode: 'sn' },
  SUI: { id: 'SUI', code: 'SUI', name: 'Suiza', flagCode: 'ch' },
  SWE: { id: 'SWE', code: 'SWE', name: 'Suecia', flagCode: 'se' },
  TUN: { id: 'TUN', code: 'TUN', name: 'Túnez', flagCode: 'tn' },
  TUR: { id: 'TUR', code: 'TUR', name: 'Turquía', flagCode: 'tr' },
  URU: { id: 'URU', code: 'URU', name: 'Uruguay', flagCode: 'uy' },
  USA: { id: 'USA', code: 'USA', name: 'Estados Unidos', flagCode: 'us' },
  UZB: { id: 'UZB', code: 'UZB', name: 'Uzbekistán', flagCode: 'uz' },
};

export function getTeamDisplay(team: TeamDisplayInput): TeamDisplay {
  const rawId = team.id ?? team.team_id ?? '';
  const id = rawId.toUpperCase();
  const mapped = TEAM_DISPLAY[id];
  if (mapped) return mapped;

  const name = team.name ?? (id || 'Selección');
  const code = id || name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3).toUpperCase();

  return {
    id: code,
    code,
    name,
    flagCode: '',
  };
}

// Self-hosted flag SVGs from the flag-icons package, resolved at build time so
// they ship as fingerprinted static assets (same pattern as the self-hosted
// @fontsource fonts) instead of depending on a CDN or OS emoji rendering.
const flagAssets = import.meta.glob<string>('../../../node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
});

const FLAG_URL_BY_CODE: Record<string, string> = {};
for (const [path, url] of Object.entries(flagAssets)) {
  const match = path.match(/([a-z0-9-]+)\.svg$/i);
  if (match) FLAG_URL_BY_CODE[match[1]] = url;
}

export function getFlagUrl(flagCode: string): string | null {
  return FLAG_URL_BY_CODE[flagCode] ?? null;
}

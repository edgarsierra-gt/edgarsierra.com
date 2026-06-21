type TeamDisplayInput = {
  id?: string | null;
  team_id?: string | null;
  name?: string | null;
};

export type TeamDisplay = {
  id: string;
  code: string;
  name: string;
  flag: string;
};

const TEAM_DISPLAY: Record<string, TeamDisplay> = {
  ARG: { id: 'ARG', code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  AUS: { id: 'AUS', code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  AUT: { id: 'AUT', code: 'AUT', name: 'Austria', flag: '🇦🇹' },
  BEL: { id: 'BEL', code: 'BEL', name: 'Bélgica', flag: '🇧🇪' },
  BIH: { id: 'BIH', code: 'BIH', name: 'Bosnia y Herzegovina', flag: '🇧🇦' },
  BRA: { id: 'BRA', code: 'BRA', name: 'Brasil', flag: '🇧🇷' },
  CAN: { id: 'CAN', code: 'CAN', name: 'Canadá', flag: '🇨🇦' },
  CIV: { id: 'CIV', code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮' },
  COD: { id: 'COD', code: 'COD', name: 'RD del Congo', flag: '🇨🇩' },
  COL: { id: 'COL', code: 'COL', name: 'Colombia', flag: '🇨🇴' },
  CPV: { id: 'CPV', code: 'CPV', name: 'Cabo Verde', flag: '🇨🇻' },
  CRO: { id: 'CRO', code: 'CRO', name: 'Croacia', flag: '🇭🇷' },
  CUW: { id: 'CUW', code: 'CUW', name: 'Curazao', flag: '🇨🇼' },
  CZE: { id: 'CZE', code: 'CZE', name: 'Chequia', flag: '🇨🇿' },
  DZA: { id: 'DZA', code: 'DZA', name: 'Argelia', flag: '🇩🇿' },
  ECU: { id: 'ECU', code: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  EGY: { id: 'EGY', code: 'EGY', name: 'Egipto', flag: '🇪🇬' },
  ENG: { id: 'ENG', code: 'ENG', name: 'Inglaterra', flag: '🏴' },
  ESP: { id: 'ESP', code: 'ESP', name: 'España', flag: '🇪🇸' },
  FRA: { id: 'FRA', code: 'FRA', name: 'Francia', flag: '🇫🇷' },
  GER: { id: 'GER', code: 'GER', name: 'Alemania', flag: '🇩🇪' },
  GHA: { id: 'GHA', code: 'GHA', name: 'Ghana', flag: '🇬🇭' },
  HTI: { id: 'HTI', code: 'HTI', name: 'Haití', flag: '🇭🇹' },
  IRI: { id: 'IRI', code: 'IRI', name: 'Irán', flag: '🇮🇷' },
  IRQ: { id: 'IRQ', code: 'IRQ', name: 'Irak', flag: '🇮🇶' },
  JOR: { id: 'JOR', code: 'JOR', name: 'Jordania', flag: '🇯🇴' },
  JPN: { id: 'JPN', code: 'JPN', name: 'Japón', flag: '🇯🇵' },
  KOR: { id: 'KOR', code: 'KOR', name: 'Corea del Sur', flag: '🇰🇷' },
  KSA: { id: 'KSA', code: 'KSA', name: 'Arabia Saudita', flag: '🇸🇦' },
  MAR: { id: 'MAR', code: 'MAR', name: 'Marruecos', flag: '🇲🇦' },
  MEX: { id: 'MEX', code: 'MEX', name: 'México', flag: '🇲🇽' },
  NED: { id: 'NED', code: 'NED', name: 'Países Bajos', flag: '🇳🇱' },
  NOR: { id: 'NOR', code: 'NOR', name: 'Noruega', flag: '🇳🇴' },
  NZL: { id: 'NZL', code: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿' },
  PAN: { id: 'PAN', code: 'PAN', name: 'Panamá', flag: '🇵🇦' },
  PAR: { id: 'PAR', code: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
  POR: { id: 'POR', code: 'POR', name: 'Portugal', flag: '🇵🇹' },
  QAT: { id: 'QAT', code: 'QAT', name: 'Catar', flag: '🇶🇦' },
  RSA: { id: 'RSA', code: 'RSA', name: 'Sudáfrica', flag: '🇿🇦' },
  SCO: { id: 'SCO', code: 'SCO', name: 'Escocia', flag: '🏴' },
  SEN: { id: 'SEN', code: 'SEN', name: 'Senegal', flag: '🇸🇳' },
  SUI: { id: 'SUI', code: 'SUI', name: 'Suiza', flag: '🇨🇭' },
  SWE: { id: 'SWE', code: 'SWE', name: 'Suecia', flag: '🇸🇪' },
  TUN: { id: 'TUN', code: 'TUN', name: 'Túnez', flag: '🇹🇳' },
  TUR: { id: 'TUR', code: 'TUR', name: 'Turquía', flag: '🇹🇷' },
  URU: { id: 'URU', code: 'URU', name: 'Uruguay', flag: '🇺🇾' },
  USA: { id: 'USA', code: 'USA', name: 'Estados Unidos', flag: '🇺🇸' },
  UZB: { id: 'UZB', code: 'UZB', name: 'Uzbekistán', flag: '🇺🇿' },
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
    flag: '🏳️',
  };
}

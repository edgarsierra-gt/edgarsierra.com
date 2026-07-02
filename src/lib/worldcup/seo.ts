import type { TeamMatchStatsEntry } from './types';

const TITLE_MAX = 60;
const DESC_MAX = 156;

function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}

/** "Estadísticas de {name} en el Mundial 2026" + ": goles y datos" only if total <= 60. */
export function buildTeamSeoTitle(name: string): string {
  const base = `Estadísticas de ${name} en el Mundial 2026`;
  const full = `${base}: goles y datos`;
  return full.length <= TITLE_MAX ? full : base;
}

/** Greedy candidate chain, richest first; first one <= 156 chars wins. */
export function buildTeamSeoDescription(name: string, stats: TeamMatchStatsEntry): string {
  const goals = `${stats.goals_for} ${plural(stats.goals_for, 'gol', 'goles')}`;
  const games = `${stats.played} ${plural(stats.played, 'partido', 'partidos')}`;
  const record = `(${stats.wins}G-${stats.draws}E-${stats.losses}P)`;
  const pos = Math.round(stats.possession_avg_pct);
  const core = `Estadísticas de ${name} en el Mundial 2026: ${goals} en ${games} ${record}`;
  const hook = 'Datos reales actualizados jornada a jornada.';
  const candidates = [
    `${core}, ${pos}% de posesión promedio. ${hook}`,
    `${core}, ${pos}% de posesión. ${hook}`,
    `${core}. ${hook}`,
  ];
  return candidates.find((c) => c.length <= DESC_MAX) ?? candidates[candidates.length - 1];
}

/** On-page answer to "cuántos goles lleva {name}". */
export function buildTeamSeoIntro(name: string, stats: TeamMatchStatsEntry): string {
  const goals = `${stats.goals_for} ${plural(stats.goals_for, 'gol', 'goles')}`;
  const games = `${stats.played} ${plural(stats.played, 'partido', 'partidos')}`;
  const wins = `${stats.wins} ${plural(stats.wins, 'victoria', 'victorias')}`;
  const draws = `${stats.draws} ${plural(stats.draws, 'empate', 'empates')}`;
  const losses = `${stats.losses} ${plural(stats.losses, 'derrota', 'derrotas')}`;
  return `${name} lleva ${goals} en ${games} del Mundial 2026: ${wins}, ${draws} y ${losses}.`;
}

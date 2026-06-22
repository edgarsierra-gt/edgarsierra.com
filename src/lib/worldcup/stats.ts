import type { TeamMatchStats, TeamMatchStatsEntry, TeamRecentForm, TeamRecentFormEntry } from './types';

export function findTeamStats(stats: TeamMatchStats, teamId: string): TeamMatchStatsEntry | null {
  return stats.teams.find((team) => team.team_id === teamId.toUpperCase()) ?? null;
}

export function findTeamForm(form: TeamRecentForm, teamId: string): TeamRecentFormEntry | null {
  return form.teams.find((team) => team.team_id === teamId.toUpperCase()) ?? null;
}

export type Leader<T> = {
  team: T;
  value: number;
};

export function getLeaders<T extends Record<string, unknown>>(
  teams: T[],
  metric: keyof T,
  direction: 'max' | 'min',
  limit: number,
): Leader<T>[] {
  return [...teams]
    .filter((team) => typeof team[metric] === 'number')
    .sort((a, b) => (direction === 'max' ? (b[metric] as number) - (a[metric] as number) : (a[metric] as number) - (b[metric] as number)))
    .slice(0, limit)
    .map((team) => ({ team, value: team[metric] as number }));
}

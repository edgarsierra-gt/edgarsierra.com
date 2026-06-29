import type { MatchPrediction } from './types';

export function isPlaceholderValue(value?: string | null): boolean {
  return !value || value.trim().toUpperCase() === 'TBD';
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPercentOptional(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'ND';
  return formatPercent(value, decimals);
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'ND';
  return value.toFixed(decimals);
}

export function formatDateEs(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateShort(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-GT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatGeneratedAt(value: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Guatemala',
  }).format(new Date(value));
}

export function formatBracketMode(value: string): string {
  if (value === 'approximate_stable_seed') return 'Bracket aproximado';
  if (value === 'official_fifa_2026') return 'Bracket oficial FIFA 2026';
  return value;
}

export function getPredictionLabel(result: string, teamA: string, teamB: string): string {
  if (result === 'team_a_win') return `Gana ${teamA}`;
  if (result === 'team_b_win') return `Gana ${teamB}`;
  return 'Empate';
}

export function groupMatchesByDate(matches: MatchPrediction[]): Array<{
  date: string;
  matches: MatchPrediction[];
}> {
  const grouped = new Map<string, MatchPrediction[]>();
  for (const match of matches) {
    const list = grouped.get(match.date) ?? [];
    list.push(match);
    grouped.set(match.date, list);
  }
  return Array.from(grouped, ([date, dateMatches]) => ({
    date,
    matches: dateMatches,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function getFirstDateMatches(matches: MatchPrediction[]): MatchPrediction[] {
  const first = [...matches].sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
  return first ? matches.filter((match) => match.date === first) : [];
}

const SITE_TIME_ZONE = 'America/Guatemala';

export function getTodayIso(timeZone = SITE_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

export function getUpcomingMatches(matches: MatchPrediction[], todayIso: string): MatchPrediction[] {
  return matches.filter((match) => match.date >= todayIso);
}

export function getMatchesForDate(matches: MatchPrediction[], dateIso: string): MatchPrediction[] {
  return matches.filter((match) => match.date === dateIso);
}

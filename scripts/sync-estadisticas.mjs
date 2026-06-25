import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PLANNING_DIR = join(ROOT, '_planning', 'Mundial_2026');
const DATA_DIR = join(ROOT, 'src', 'data', 'mundial-2026');

// Canonical 48-team roster, must match TEAM_DISPLAY in src/lib/worldcup/teams.ts.
const TEAM_CODES = [
  'ARG', 'AUS', 'AUT', 'BEL', 'BIH', 'BRA', 'CAN', 'CIV', 'COD', 'COL', 'CPV', 'CRO',
  'CUW', 'CZE', 'DZA', 'ECU', 'EGY', 'ENG', 'ESP', 'FRA', 'GER', 'GHA', 'HTI', 'IRI',
  'IRQ', 'JOR', 'JPN', 'KOR', 'KSA', 'MAR', 'MEX', 'NED', 'NOR', 'NZL', 'PAN', 'PAR',
  'POR', 'QAT', 'RSA', 'SCO', 'SEN', 'SUI', 'SWE', 'TUN', 'TUR', 'URU', 'USA', 'UZB',
];

// "Estadisticas_ultimos20" sheet uses English team names with no code column.
const NAME_TO_CODE = {
  Algeria: 'DZA', Argentina: 'ARG', Australia: 'AUS', Austria: 'AUT', Belgium: 'BEL',
  'Bosnia and Herzegovina': 'BIH', Brazil: 'BRA', Canada: 'CAN', 'Cape Verde': 'CPV',
  Colombia: 'COL', Croatia: 'CRO', Curacao: 'CUW', Czechia: 'CZE', 'DR Congo': 'COD',
  Ecuador: 'ECU', Egypt: 'EGY', England: 'ENG', France: 'FRA', Germany: 'GER',
  Ghana: 'GHA', Haiti: 'HTI', Iran: 'IRI', Iraq: 'IRQ', 'Ivory Coast': 'CIV',
  Japan: 'JPN', Jordan: 'JOR', Mexico: 'MEX', Morocco: 'MAR', Netherlands: 'NED',
  'New Zealand': 'NZL', Norway: 'NOR', Panama: 'PAN', Paraguay: 'PAR', Portugal: 'POR',
  Qatar: 'QAT', 'Saudi Arabia': 'KSA', Scotland: 'SCO', Senegal: 'SEN',
  'South Africa': 'RSA', 'South Korea': 'KOR', Spain: 'ESP', Sweden: 'SWE',
  Switzerland: 'SUI', Tunisia: 'TUN', Turkiye: 'TUR', USA: 'USA', Uruguay: 'URU',
  Uzbekistan: 'UZB',
};

function findLatestFile(prefix) {
  if (!existsSync(PLANNING_DIR)) {
    throw new Error(`No existe ${PLANNING_DIR}. Coloca ahí el Excel más reciente antes de correr este script.`);
  }
  const matches = readdirSync(PLANNING_DIR).filter((name) => name.startsWith(prefix) && name.endsWith('.xlsx'));
  if (matches.length === 0) {
    throw new Error(`No se encontró ningún archivo "${prefix}*.xlsx" dentro de ${PLANNING_DIR}.`);
  }
  matches.sort((a, b) => statSync(join(PLANNING_DIR, b)).mtimeMs - statSync(join(PLANNING_DIR, a)).mtimeMs);
  return join(PLANNING_DIR, matches[0]);
}

// These source files use a non-standard (but valid) prefixed XML namespace in
// xl/workbook.xml (`<x:workbook>` instead of Excel's own unprefixed form), which
// trips up stricter parsers like exceljs. SheetJS (xlsx) tolerates it.
function loadWorkbook(filePath) {
  return XLSX.readFile(filePath, { cellDates: true });
}

function loadSheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`La hoja "${sheetName}" no existe en ${workbook.fileName ?? ''}.`);
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

function findLabeledValue(workbook, sheetName, label) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return null;
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const row = grid.find((cells) => typeof cells[0] === 'string' && cells[0].includes(label));
  if (!row) return null;
  if (row[1] !== null && row[1] !== undefined) return row[1];
  // Fallback: extract value from row[0] after a colon if column B is empty
  const colonIndex = row[0].indexOf(':');
  if (colonIndex !== -1) {
    const afterColon = row[0].slice(colonIndex + 1);
    const valuePart = afterColon.split(/[—–-]/)[0];
    return valuePart.trim();
  }
  return null;
}

// Excel's 1900-date-system epoch, as days before the Unix epoch (1970-01-01).
const EXCEL_EPOCH_OFFSET_DAYS = 25569;

// Most date cells in these files parse as JS Dates via `cellDates`, but a few
// rows (the newest matches, appended without date formatting) come back as raw
// Excel serial numbers instead — handle both rather than trusting one shape.
// (A plain `new Date(serialNumber)` would misread the serial as a millisecond
// timestamp, landing in 1970, so this conversion must happen explicitly.)
function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    return new Date(Math.round((value - EXCEL_EPOCH_OFFSET_DAYS) * 86400000));
  }
  return new Date(value);
}

function toIsoDate(value) {
  return toDate(value).toISOString().slice(0, 10);
}

function sum(rows, key) {
  return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}

function avg(rows, key) {
  return sum(rows, key) / rows.length;
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function streakChar(resultado) {
  if (resultado.startsWith('Victoria')) return 'V';
  if (resultado.startsWith('Empate')) return 'E';
  if (resultado.startsWith('Derrota')) return 'D';
  return '?';
}

function buildTeamMatchStats() {
  const file = findLatestFile('mundial_fifa_2026_actualizado_');
  const workbook = loadWorkbook(file);
  const rows = loadSheetRows(workbook, 'Datos por equipo');

  const byCode = new Map();
  for (const row of rows) {
    const code = row['Código'];
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(row);
  }

  const teams = TEAM_CODES.map((code) => {
    const teamRows = byCode.get(code);
    if (!teamRows || teamRows.length === 0) {
      throw new Error(`"Datos por equipo" no tiene partidos para ${code} en ${file}.`);
    }

    const wins = teamRows.filter((row) => row['Resultado'] === 'G').length;
    const draws = teamRows.filter((row) => row['Resultado'] === 'E').length;
    const losses = teamRows.filter((row) => row['Resultado'] === 'P').length;
    const goalsFor = sum(teamRows, 'GF');
    const goalsAgainst = sum(teamRows, 'GC');
    const shots = sum(teamRows, 'Remates');
    const shotsOnTarget = sum(teamRows, 'Remates al arco');
    const xgFor = sum(teamRows, 'xG');
    const xgAgainst = sum(teamRows, 'xG rival');

    const matches = [...teamRows]
      .sort((a, b) => toDate(b['Fecha']) - toDate(a['Fecha']))
      .map((row) => ({
        fecha: toIsoDate(row['Fecha']),
        grupo: row['Grupo'] ?? null,
        rival: row['Rival'],
        rival_id: row['Código rival'],
        resultado: row['Resultado'],
        goles_for: row['GF'],
        goles_against: row['GC'],
        posesion_pct: row['Posesión %'] ?? null,
        remates: row['Remates'] ?? null,
        remates_arco: row['Remates al arco'] ?? null,
        xg_for: row['xG'] ?? null,
        xg_against: row['xG rival'] ?? null,
        corners: row['Córners'] ?? null,
        amarillas: row['Amarillas'] ?? null,
        rojas: row['Rojas'] ?? null,
        formacion: row['Formación'] ?? null,
        fuente: row['Fuente'] ?? null,
      }));

    return {
      team_id: code,
      group: teamRows[0]['Grupo'] ?? null,
      played: teamRows.length,
      wins,
      draws,
      losses,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      goal_difference: goalsFor - goalsAgainst,
      points: wins * 3 + draws,
      possession_avg_pct: round(avg(teamRows, 'Posesión %'), 1),
      shots,
      shots_on_target: shotsOnTarget,
      shots_on_target_pct: shots > 0 ? round(shotsOnTarget / shots, 4) : null,
      xg_for: round(xgFor, 2),
      xg_against: round(xgAgainst, 2),
      xg_difference: round(xgFor - xgAgainst, 2),
      corners: sum(teamRows, 'Córners'),
      yellow_cards: sum(teamRows, 'Amarillas'),
      red_cards: sum(teamRows, 'Rojas'),
      matches,
    };
  });

  teams.sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for);

  const matchesAnalyzed = findLabeledValue(workbook, 'Dashboard', 'Partidos analizados');
  const sourceCutoff = findLabeledValue(workbook, 'Dashboard', 'Corte');

  return {
    generated_at: new Date().toISOString(),
    source_cutoff: sourceCutoff ?? 'ND',
    matches_analyzed: Number(matchesAnalyzed) || rows.length / 2,
    teams,
  };
}

function buildTeamRecentForm() {
  const file = findLatestFile('Estadisticas_ultimos20_');
  const workbook = loadWorkbook(file);
  const rows = loadSheetRows(workbook, 'Partidos_ultimos20');

  const byCode = new Map();
  for (const row of rows) {
    const code = NAME_TO_CODE[row['Seleccion']];
    if (!code) {
      throw new Error(`"Seleccion" sin mapeo de código: "${row['Seleccion']}" en ${file}.`);
    }
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(row);
  }

  const teams = TEAM_CODES.map((code) => {
    const teamRows = byCode.get(code);
    if (!teamRows || teamRows.length === 0) {
      throw new Error(`"Partidos_ultimos20" no tiene partidos para ${code} en ${file}.`);
    }

    // Penalty-shootout draws ("Empate (ganó/perdió penales)") count toward played
    // games and goals but are excluded from W/D/L — this matches the source
    // file's own Dashboard tally exactly (verified against Czechia/Canada/Bosnia,
    // the three teams with shootouts in their last 20 matches).
    const wins = teamRows.filter((row) => row['Resultado'] === 'Victoria').length;
    const draws = teamRows.filter((row) => row['Resultado'] === 'Empate').length;
    const losses = teamRows.filter((row) => row['Resultado'] === 'Derrota').length;
    const penaltyRows = teamRows.filter((row) => row['Resultado'].startsWith('Empate (')).length;
    if (wins + draws + losses + penaltyRows !== teamRows.length) {
      throw new Error(`Resultado inesperado para ${code} en "Partidos_ultimos20" — revisa los valores de la columna Resultado.`);
    }

    const goalsFor = sum(teamRows, 'GF');
    const goalsAgainst = sum(teamRows, 'GC');
    const played = teamRows.length;

    const sortedByRecency = [...teamRows].sort((a, b) => a['N'] - b['N']);
    const streakLast5 = sortedByRecency.slice(0, 5).map((row) => streakChar(row['Resultado'])).join('-');

    const matches = sortedByRecency.map((row) => ({
      n: row['N'],
      fecha: toIsoDate(row['Fecha']),
      rival: row['Rival'],
      condicion: row['Condicion'],
      tipo_partido: row['Tipo_partido'],
      resultado: row['Resultado'],
      goles_for: row['GF'],
      goles_against: row['GC'],
    }));

    return {
      team_id: code,
      played,
      wins,
      draws,
      losses,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      goal_difference: goalsFor - goalsAgainst,
      goals_for_pg: round(goalsFor / played, 2),
      goals_against_pg: round(goalsAgainst / played, 2),
      streak_last5: streakLast5,
      matches,
    };
  });

  teams.sort((a, b) => a.team_id.localeCompare(b.team_id));

  const updatedAt = findLabeledValue(workbook, 'Dashboard', 'actualizaci');

  return {
    generated_at: new Date().toISOString(),
    as_of_date: updatedAt ? toIsoDate(updatedAt) : 'ND',
    matches_per_team: 20,
    teams,
  };
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

// tournament_snapshot.json feeds the real "Tabla actual de cada grupo" on
// /mundial-2026/grupos. Its standings_current rows are observed results, not a
// model output, so they can (and should) be recomputed from the same box-score
// data as team_match_stats.json — independent of when the predictor last ran.
// The file's other fields (model_version, n_simulations, bracket_mode, notes)
// describe the predictor's own simulation pass and are left untouched here.
function buildGroupStandings(matchStats) {
  const updatedAt = new Date().toISOString();
  const byGroup = new Map();
  for (const team of matchStats.teams) {
    if (!team.group) continue;
    const list = byGroup.get(team.group) ?? [];
    list.push(team);
    byGroup.set(team.group, list);
  }

  const rows = [];
  for (const [group, teams] of byGroup) {
    const ranked = [...teams].sort(
      (a, b) => b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for,
    );
    ranked.forEach((team, index) => {
      rows.push({
        group,
        team_id: team.team_id,
        played: team.played,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goals_for: team.goals_for,
        goals_against: team.goals_against,
        goal_difference: team.goal_difference,
        points: team.points,
        rank_current: index + 1,
        status: 'active',
        updated_at: updatedAt,
      });
    });
  }

  rows.sort((a, b) => a.group.localeCompare(b.group) || a.rank_current - b.rank_current);
  return rows;
}

function updateTournamentSnapshot(matchStats) {
  const path = join(DATA_DIR, 'tournament_snapshot.json');
  const snapshot = JSON.parse(readFileSync(path, 'utf8'));
  snapshot.standings_current = buildGroupStandings(matchStats);
  snapshot.generated_at = new Date().toISOString();
  writeJson(path, snapshot);
  return snapshot;
}

function main() {
  const matchStats = buildTeamMatchStats();
  const recentForm = buildTeamRecentForm();
  const snapshot = updateTournamentSnapshot(matchStats);

  writeJson(join(DATA_DIR, 'team_match_stats.json'), matchStats);
  writeJson(join(DATA_DIR, 'team_recent_form.json'), recentForm);

  console.log(
    `team_match_stats.json: ${matchStats.teams.length}/48 selecciones, ` +
      `${matchStats.matches_analyzed} partidos analizados, corte ${matchStats.source_cutoff}`,
  );
  console.log(
    `team_recent_form.json: ${recentForm.teams.length}/48 selecciones, ` +
      `${recentForm.matches_per_team} partidos c/u, corte ${recentForm.as_of_date}`,
  );
  console.log(
    `tournament_snapshot.json: ${snapshot.standings_current.length} filas de tabla real actualizadas ` +
      `(modelo/simulación del predictor sin tocar).`,
  );
}

try {
  main();
} catch (error) {
  console.error(`Error sincronizando estadísticas: ${error.message}`);
  process.exitCode = 1;
}

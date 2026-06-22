export type TeamRef = {
  id: string;
  name: string;
  slug: string;
};

export type ScoreProbability = {
  score: string;
  probability: number;
};

export type MatchPrediction = {
  match_id: string;
  date: string;
  time_local?: string | null;
  group?: string | null;
  venue?: string | null;
  team_a: TeamRef;
  team_b: TeamRef;
  expected_goals: {
    team_a: number;
    team_b: number;
  };
  probabilities: {
    team_a_win: number;
    draw: number;
    team_b_win: number;
  };
  predicted_result: 'team_a_win' | 'draw' | 'team_b_win';
  most_likely_score?: ScoreProbability | null;
  top_scores: ScoreProbability[];
  confidence_label: string;
  notes?: string | null;
};

export type PredictionsToday = {
  generated_at: string;
  model_version: string;
  model_mode: string;
  matches: MatchPrediction[];
};

export type TeamPower = {
  team_id: string;
  name: string;
  group?: string | null;
  attack_index: number;
  defense_index: number;
  weighted_goals_for_pg: number;
  weighted_goals_against_pg: number;
  current_tournament_xg_diff_pg?: number | null;
  data_quality_score?: number | null;
};

export type TeamPowerRanking = {
  generated_at: string;
  model_version: string;
  ranking_type?: string;
  not_a_champion_probability?: boolean;
  teams: TeamPower[];
};

export type ModelMetadata = {
  model_version: string;
  generated_at: string;
  model_mode: string;
  parameters: Record<string, number | string>;
  data_sources?: Record<string, string>;
  handoff_to_astro?: Record<string, string>;
  limitations: string[];
};

export type GroupProbabilityTeam = {
  team_id: string;
  name: string;
  group: string;
  played: number;
  points: number;
  prob_group_winner: number;
  prob_group_runner_up: number;
  prob_qualified_as_third: number;
  prob_eliminated_group: number;
  prob_advance: number;
};

export type GroupProbability = {
  group: string;
  teams: GroupProbabilityTeam[];
};

export type GroupProbabilities = {
  generated_at: string;
  model_version: string;
  n_simulations: number;
  groups: GroupProbability[];
};

export type RoundProbabilityTeam = {
  team_id: string;
  name: string;
  group: string;
  prob_round_of_32: number;
  prob_round_of_16: number;
  prob_quarterfinal: number;
  prob_semifinal: number;
  prob_final: number;
  prob_champion: number;
};

export type RoundProbabilities = {
  generated_at: string;
  model_version: string;
  n_simulations: number;
  bracket_mode: string;
  teams: RoundProbabilityTeam[];
};

export type ChampionOddsTeam = {
  rank: number;
  team_id: string;
  name: string;
  group: string;
  prob_champion: number;
  prob_final: number;
  prob_semifinal: number;
  movement_since_previous?: number | null;
};

export type ChampionOdds = {
  generated_at: string;
  model_version: string;
  n_simulations: number;
  bracket_mode: string;
  interpretation_note: string;
  teams: ChampionOddsTeam[];
};

export type AuditMetrics = {
  accuracy_1x2: number | null;
  brier_score: number | null;
  log_loss: number | null;
  exact_score_hit_rate: number | null;
  goals_bias: number | null;
  goals_mae: number | null;
};

export type ModelAudit = {
  generated_at: string;
  model_version: string;
  matches_audited: number;
  metrics: AuditMetrics;
  by_confidence_bin: Array<{
    bin: string;
    n: number;
    avg_confidence: number;
    actual_hit_rate: number;
  }>;
  notes: string[];
};

export type ModelCalibration = {
  generated_at: string;
  model_version: string;
  bins: Array<{
    lower: number;
    upper: number;
    n: number;
    avg_predicted_probability: number;
    empirical_frequency: number;
  }>;
  goals: {
    mean_predicted_total: number | null;
    mean_actual_total: number | null;
    bias: number | null;
    mae: number | null;
  };
};

export type GroupStandingRow = {
  group: string;
  team_id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  rank_current: number;
  status: string;
  updated_at: string;
};

export type TournamentSnapshot = {
  generated_at: string;
  model_version: string;
  n_simulations: number;
  scope: string;
  bracket_mode: string;
  standings_current: GroupStandingRow[];
  notes: string[];
};

export type TeamMatchStatsMatch = {
  fecha: string;
  grupo: string | null;
  rival: string;
  rival_id: string;
  resultado: string;
  goles_for: number;
  goles_against: number;
  posesion_pct: number | null;
  remates: number | null;
  remates_arco: number | null;
  xg_for: number | null;
  xg_against: number | null;
  corners: number | null;
  amarillas: number | null;
  rojas: number | null;
  formacion: string | null;
  fuente: string | null;
};

export type TeamMatchStatsEntry = {
  team_id: string;
  group: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  // 0-100, not 0-1 — matches the source "Posesión %" scale, unlike shots_on_target_pct below.
  possession_avg_pct: number;
  shots: number;
  shots_on_target: number;
  shots_on_target_pct: number | null;
  xg_for: number;
  xg_against: number;
  xg_difference: number;
  corners: number;
  yellow_cards: number;
  red_cards: number;
  matches: TeamMatchStatsMatch[];
};

export type TeamMatchStats = {
  generated_at: string;
  source_cutoff: string;
  matches_analyzed: number;
  teams: TeamMatchStatsEntry[];
};

export type TeamRecentFormMatch = {
  n: number;
  fecha: string;
  rival: string;
  condicion: 'Local' | 'Visitante';
  tipo_partido: string;
  resultado: string;
  goles_for: number;
  goles_against: number;
};

export type TeamRecentFormEntry = {
  team_id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  goals_for_pg: number;
  goals_against_pg: number;
  streak_last5: string;
  matches: TeamRecentFormMatch[];
};

export type TeamRecentForm = {
  generated_at: string;
  as_of_date: string;
  matches_per_team: number;
  teams: TeamRecentFormEntry[];
};

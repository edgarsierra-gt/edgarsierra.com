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

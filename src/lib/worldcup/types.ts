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


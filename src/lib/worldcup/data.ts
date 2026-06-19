import predictionsToday from '../../data/mundial-2026/predictions_today.json';
import teamPowerRanking from '../../data/mundial-2026/team_power_ranking.json';
import modelMetadata from '../../data/mundial-2026/model_metadata.json';

import type { ModelMetadata, PredictionsToday, TeamPowerRanking } from './types';

export function getPredictionsToday(): PredictionsToday {
  return predictionsToday as PredictionsToday;
}

export function getTeamPowerRanking(): TeamPowerRanking {
  return teamPowerRanking as TeamPowerRanking;
}

export function getModelMetadata(): ModelMetadata {
  return modelMetadata as ModelMetadata;
}


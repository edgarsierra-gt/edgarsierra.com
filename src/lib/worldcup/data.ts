import predictionsToday from '../../data/mundial-2026/predictions_today.json';
import teamPowerRanking from '../../data/mundial-2026/team_power_ranking.json';
import modelMetadata from '../../data/mundial-2026/model_metadata.json';
import groupProbabilities from '../../data/mundial-2026/group_probabilities.json';
import roundProbabilities from '../../data/mundial-2026/round_probabilities.json';
import championOdds from '../../data/mundial-2026/champion_odds.json';
import modelAudit from '../../data/mundial-2026/model_audit.json';
import modelCalibration from '../../data/mundial-2026/model_calibration.json';
import tournamentSnapshot from '../../data/mundial-2026/tournament_snapshot.json';

import type {
  ChampionOdds,
  GroupProbabilities,
  ModelAudit,
  ModelCalibration,
  ModelMetadata,
  PredictionsToday,
  RoundProbabilities,
  TeamPowerRanking,
  TournamentSnapshot,
} from './types';

export function getPredictionsToday(): PredictionsToday {
  return predictionsToday as PredictionsToday;
}

export function getTeamPowerRanking(): TeamPowerRanking {
  return teamPowerRanking as TeamPowerRanking;
}

export function getModelMetadata(): ModelMetadata {
  return modelMetadata as ModelMetadata;
}

export function getGroupProbabilities(): GroupProbabilities {
  return groupProbabilities as GroupProbabilities;
}

export function getRoundProbabilities(): RoundProbabilities {
  return roundProbabilities as RoundProbabilities;
}

export function getChampionOdds(): ChampionOdds {
  return championOdds as ChampionOdds;
}

export function getModelAudit(): ModelAudit {
  return modelAudit as ModelAudit;
}

export function getModelCalibration(): ModelCalibration {
  return modelCalibration as ModelCalibration;
}

export function getTournamentSnapshot(): TournamentSnapshot {
  return tournamentSnapshot as TournamentSnapshot;
}

import { Result } from '@carbonsense/core';
import { UserProfile, CarbonEntry, OptimizationPlan } from '@carbonsense/shared-types';

export interface OptimizationEngine {
  /**
   * Generates actionable reduction plans targeting the user's highest emissions areas.
   */
  generateRecommendations(profile: UserProfile, history: CarbonEntry[]): Result<OptimizationPlan[]>;

  /**
   * Prioritizes and ranks interventions based on difficulty, carbon savings, and cost.
   */
  rankInterventions(plans: OptimizationPlan[]): Result<OptimizationPlan[]>;
}

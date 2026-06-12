import { Result, ok, fail } from '@carbonsense/core';
import { BehaviorProfile, ForecastProfile, OptimizationPlan } from '@carbonsense/shared-types';
import OptimizationPlanner from './OptimizationPlanner.js';
import OptimizationAggregator from './OptimizationAggregator.js';

export interface IOptimizationEngine {
  /**
   * Generates a ranked, prioritized optimization plan with tradeoffs based on user behavior and forecast patterns.
   */
  generateOptimizationPlan(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile
  ): Result<OptimizationPlan>;
}

export class OptimizationEngine implements IOptimizationEngine {
  private planner: OptimizationPlanner;
  private aggregator: OptimizationAggregator;

  constructor() {
    this.planner = new OptimizationPlanner();
    this.aggregator = new OptimizationAggregator();
  }

  public generateOptimizationPlan(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile
  ): Result<OptimizationPlan> {
    if (!behaviorProfile) {
      return fail(new Error('BehaviorProfile is required'));
    }
    if (!forecastProfile) {
      return fail(new Error('ForecastProfile is required'));
    }
    if (behaviorProfile.userId !== forecastProfile.userId) {
      return fail(new Error('User IDs in behaviorProfile and forecastProfile must match'));
    }

    try {
      const candidates = this.planner.plan(behaviorProfile, forecastProfile);
      const tradeoffs = this.aggregator.aggregate(candidates);

      const plan: OptimizationPlan = {
        id: `plan-${behaviorProfile.userId}-${Date.now()}`,
        userId: behaviorProfile.userId,
        candidates,
        tradeoffs,
        generatedAt: new Date(),
      };

      return ok(plan);
    } catch (error: any) {
      return fail(error);
    }
  }
}

export { ReductionEstimator } from './ReductionEstimator.js';
export { DifficultyEstimator } from './DifficultyEstimator.js';
export { BehaviorResistanceModel } from './BehaviorResistanceModel.js';
export { ActionRanker } from './ActionRanker.js';
export { OptimizationPlanner } from './OptimizationPlanner.js';
export { OptimizationAggregator } from './OptimizationAggregator.js';
export default OptimizationEngine;

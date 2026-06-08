import { Result, ok, fail, ValidationError } from '@carbonsense/core';
import { CarbonEntry, BehaviorProfile } from '@carbonsense/shared-types';
import BehaviorAggregator from './BehaviorAggregator';

export interface IBehaviorIntelligenceEngine {
  /**
   * Generates a comprehensive user BehaviorProfile summarizing consumption patterns, trends, classification and risk score.
   */
  generateProfile(userId: string, entries: CarbonEntry[]): Result<BehaviorProfile>;
}

export class BehaviorIntelligenceEngine implements IBehaviorIntelligenceEngine {
  private aggregator: BehaviorAggregator;

  constructor() {
    this.aggregator = new BehaviorAggregator();
  }

  public generateProfile(userId: string, entries: CarbonEntry[]): Result<BehaviorProfile> {
    if (!userId) {
      return fail(new ValidationError('UserId cannot be empty'));
    }

    try {
      const profile = this.aggregator.aggregate(userId, entries);
      return ok(profile);
    } catch (error: any) {
      return fail(error);
    }
  }
}

export { PatternDetector } from './PatternDetector';
export { TrendAnalyzer } from './TrendAnalyzer';
export { RiskScorer } from './RiskScorer';
export { BehaviorClassifier } from './BehaviorClassifier';
export { BehaviorAggregator } from './BehaviorAggregator';
export default BehaviorIntelligenceEngine;

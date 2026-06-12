import { Result, fail } from '@carbonsense/core';
import { ForecastInput, ForecastProfile } from '@carbonsense/shared-types';
import ForecastAggregator from './ForecastAggregator.js';

export interface IForecastEngine {
  /**
   * Generates a comprehensive ForecastProfile compiling baseline, trend-adjusted, momentum and counterfactual projections.
   */
  generateForecastProfile(input: ForecastInput): Result<ForecastProfile>;
}

export class ForecastEngine implements IForecastEngine {
  private aggregator: ForecastAggregator;

  constructor() {
    this.aggregator = new ForecastAggregator();
  }

  public generateForecastProfile(input: ForecastInput): Result<ForecastProfile> {
    try {
      return this.aggregator.aggregate(input);
    } catch (error: any) {
      return fail(error);
    }
  }
}

export { BaselineForecaster } from './BaselineForecaster.js';
export { TrendForecaster } from './TrendForecaster.js';
export { MomentumForecaster } from './MomentumForecaster.js';
export { ScenarioForecaster } from './ScenarioForecaster.js';
export { RiskDriverAnalyzer } from './RiskDriverAnalyzer.js';
export { CounterfactualForecaster } from './CounterfactualForecaster.js';
export { ForecastAggregator } from './ForecastAggregator.js';
export default ForecastEngine;

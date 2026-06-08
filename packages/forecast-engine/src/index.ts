import { Result, fail } from '@carbonsense/core';
import { ForecastInput, ForecastProfile } from '@carbonsense/shared-types';
import ForecastAggregator from './ForecastAggregator';

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

export { BaselineForecaster } from './BaselineForecaster';
export { TrendForecaster } from './TrendForecaster';
export { MomentumForecaster } from './MomentumForecaster';
export { ScenarioForecaster } from './ScenarioForecaster';
export { RiskDriverAnalyzer } from './RiskDriverAnalyzer';
export { CounterfactualForecaster } from './CounterfactualForecaster';
export { ForecastAggregator } from './ForecastAggregator';
export default ForecastEngine;

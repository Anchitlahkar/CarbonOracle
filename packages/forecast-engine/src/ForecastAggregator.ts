import { 
  ForecastInput, 
  ForecastProfile, 
  ForecastProjection, 
  ForecastScenarioResult, 
  ForecastIntegrity, 
  CounterfactualResult,
  RiskDriver
} from '@carbonsense/shared-types';
import { Result, ok, fail, ValidationError } from '@carbonsense/core';
import BaselineForecaster from './BaselineForecaster.js';
import TrendForecaster from './TrendForecaster.js';
import MomentumForecaster from './MomentumForecaster.js';
import ScenarioForecaster from './ScenarioForecaster.js';
import RiskDriverAnalyzer from './RiskDriverAnalyzer.js';
import CounterfactualForecaster from './CounterfactualForecaster.js';

export class ForecastAggregator {
  private baselineForecaster: BaselineForecaster;
  private trendForecaster: TrendForecaster;
  private momentumForecaster: MomentumForecaster;
  private scenarioForecaster: ScenarioForecaster;
  private riskDriverAnalyzer: RiskDriverAnalyzer;
  private counterfactualForecaster: CounterfactualForecaster;

  constructor() {
    this.baselineForecaster = new BaselineForecaster();
    this.trendForecaster = new TrendForecaster();
    this.momentumForecaster = new MomentumForecaster();
    this.scenarioForecaster = new ScenarioForecaster();
    this.riskDriverAnalyzer = new RiskDriverAnalyzer();
    this.counterfactualForecaster = new CounterfactualForecaster();
  }

  /**
   * Orchestrates baseline, trend, momentum, and scenario forecasters to construct a complete ForecastProfile.
   */
  public aggregate(input: ForecastInput): Result<ForecastProfile> {
    const { userId, behaviorProfile, historyDaysCount } = input;

    // 1. Data Sufficiency Validation
    if (historyDaysCount < 7) {
      return fail(
        new ValidationError(`Insufficient historical data. Forecasts require a minimum of 7 days of history (only ${historyDaysCount} days available).`)
      );
    }

    const vector = behaviorProfile.featureVector;
    const signals = behaviorProfile.signals;
    const trends = behaviorProfile.trends;
    const riskScore = behaviorProfile.riskScore;

    // Define base confidence horizons (decaying)
    let conf30d = 0.91;
    let conf90d = 0.83;
    let conf365d = 0.67;

    // Degrade confidence if history is low (< 30 days)
    if (historyDaysCount < 30) {
      conf30d *= 0.80;
      conf90d *= 0.80;
      conf365d *= 0.80;
    }

    // 2. Forecast Integrity Score
    const integrity = this.calculateIntegrity(historyDaysCount, vector, riskScore);

    // 3. Projections
    // Baseline
    const baseline = {
      '30d': this.baselineForecaster.project(vector, 30, conf30d),
      '90d': this.baselineForecaster.project(vector, 90, conf90d),
      '365d': this.baselineForecaster.project(vector, 365, conf365d),
    };

    // Trend-Adjusted
    const trendAdjusted = {
      '30d': this.trendForecaster.project(vector, trends, 30, conf30d),
      '90d': this.trendForecaster.project(vector, trends, 90, conf90d),
      '365d': this.trendForecaster.project(vector, trends, 365, conf365d),
    };

    // Momentum
    const momentum = {
      '30d': this.momentumForecaster.project(vector, trends, riskScore, 30, conf30d),
      '90d': this.momentumForecaster.project(vector, trends, riskScore, 90, conf90d),
      '365d': this.momentumForecaster.project(vector, trends, riskScore, 365, conf365d),
    };

    // 4. Scenario Projections (over 365-day horizon for long-term reduction visual checks)
    const scenarios = this.scenarioForecaster.projectScenarios(vector, 365, conf365d);

    // 5. Risk Driver Analyzer
    const riskDrivers = this.riskDriverAnalyzer.analyze(vector, signals);

    // 6. Counterfactual Forecaster
    const counterfactuals = this.counterfactualForecaster.analyze(vector, signals, riskDrivers);

    return ok({
      userId,
      baseline,
      trendAdjusted,
      momentum,
      scenarios,
      riskDrivers,
      counterfactuals,
      integrity,
      generatedAt: new Date(),
    });
  }

  private calculateIntegrity(historyDaysCount: number, vector: import("@carbonsense/shared-types").BehaviorFeatureVector, riskScore: number): ForecastIntegrity {
    let score = 100;
    const reasons: string[] = [];

    // Check data sufficiency
    if (historyDaysCount >= 30) {
      reasons.push('Sufficient historical data density (30+ days).');
    } else {
      score -= 15;
      reasons.push(`Limited historical data profile density (only ${historyDaysCount} days available).`);
    }

    // Check behavioral stability (normalized stdDev)
    const mean = vector.dailyEmissionsMean;
    const stdDev = vector.dailyEmissionsStdDev;
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

    if (coefficientOfVariation < 0.5) {
      reasons.push('Stable behavioral footprint logs (low volatility).');
    } else {
      const penalty = Math.min(20, Math.round(coefficientOfVariation * 10));
      score -= penalty;
      reasons.push(`Elevated standard deviation volatility in daily footprint logs (Penalty: -${penalty}).`);
    }

    // Check risk score
    if (riskScore < 40) {
      reasons.push('Low behavioral risk profile.');
    } else {
      const riskPenalty = Math.round(riskScore * 0.15);
      score -= riskPenalty;
      reasons.push(`High behavioral risk profile detected (Score: ${riskScore}, Penalty: -${riskPenalty}).`);
    }

    return {
      score: Math.max(10, Math.min(100, score)),
      reasons,
    };
  }
}
export default ForecastAggregator;

import { BehaviorFeatureVector, BehaviorSignal, BehaviorTrend } from '@carbonsense/shared-types';

export interface RiskScoreResult {
  score: number;
  metadata: {
    baseEmissionsRisk: number;
    trendEscalation: number;
    signalPenalty: number;
    explanation: string;
  };
}

export class RiskScorer {
  /**
   * Calculates a 0-100 risk score based on daily average emissions, trends, and detected signals.
   */
  public score(
    vector: BehaviorFeatureVector,
    signals: BehaviorSignal[],
    trends: BehaviorTrend[]
  ): RiskScoreResult {
    // 1. Base score from average daily emissions (target: 3kg/day, critical: 15kg/day)
    // Map daily mean to base risk: 3kg -> 10 risk, 15kg -> 55 risk
    const dailyMean = vector.dailyEmissionsMean;
    let baseEmissionsRisk = 10;
    if (dailyMean > 3) {
      baseEmissionsRisk = 10 + Math.min(45, ((dailyMean - 3) / 12) * 45);
    }
    baseEmissionsRisk = Math.round(baseEmissionsRisk);

    // 2. Trend escalation (Increasing trend adds 15 points)
    let trendEscalation = 0;
    const totalTrend30d = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
    if (totalTrend30d && totalTrend30d.direction === 'Increasing') {
      trendEscalation = 15;
    }

    // 3. Signal penalties
    let signalPenalty = 0;
    signals.forEach((sig) => {
      if (sig.type === 'HighCarDependency') {
        signalPenalty += sig.strength * 15;
      } else if (sig.type === 'HighFlightFrequency') {
        signalPenalty += sig.strength * 15;
      } else if (sig.type === 'FrequentBeefConsumption') {
        signalPenalty += sig.strength * 10;
      } else if (sig.type === 'ShoppingHeavyBehavior') {
        signalPenalty += sig.strength * 5;
      }
    });
    signalPenalty = Math.round(signalPenalty);

    // Aggregate score
    let finalScore = baseEmissionsRisk + trendEscalation + signalPenalty;
    finalScore = Math.max(0, Math.min(100, finalScore));

    // Formulate descriptive text
    let explanation = `Risk score derived from base average emissions of ${dailyMean.toFixed(1)} kg CO2e/day (Risk: ${baseEmissionsRisk}/55)`;
    if (trendEscalation > 0) {
      explanation += ` with a +${trendEscalation} penalty due to an increasing total emission trend.`;
    }
    if (signalPenalty > 0) {
      explanation += ` Signal violations contributed a +${signalPenalty} penalty.`;
    }

    return {
      score: finalScore,
      metadata: {
        baseEmissionsRisk,
        trendEscalation,
        signalPenalty,
        explanation,
      },
    };
  }
}
export default RiskScorer;

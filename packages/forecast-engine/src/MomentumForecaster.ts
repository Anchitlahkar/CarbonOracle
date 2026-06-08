import { ForecastProjection, BehaviorFeatureVector, BehaviorTrend, ForecastSnapshot } from '@carbonsense/shared-types';

export class MomentumForecaster {
  /**
   * Projects daily emissions and models expanding uncertainty bounds based on behavioral momentum/volatility.
   */
  public project(
    vector: BehaviorFeatureVector,
    trends: BehaviorTrend[],
    riskScore: number,
    horizonDays: number,
    baseConfidence: number
  ): ForecastProjection {
    const mean = vector.dailyEmissionsMean;
    const stdDev = vector.dailyEmissionsStdDev;
    const snapshots: ForecastSnapshot[] = [];

    // Evaluate volatility factor: sum of normalized standard deviation and normalized risk score
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    const normalizedRisk = riskScore / 100;
    const volatilityFactor = coefficientOfVariation + normalizedRisk; // Higher means more volatile/chaotic behavior

    // Resolve trend parameters
    const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
    const changePercent = totalTrend ? totalTrend.changePercent : 0.0;

    for (let day = 1; day <= horizonDays; day++) {
      // Projected emissions is trend-adjusted but weighted by momentum
      const trendMultiplier = 1 + (changePercent / 100) * (day / 30);
      const projectedEmission = Math.max(0, mean * trendMultiplier);

      // Bounds expand dynamically based on volatility factor: chaotic profiles widen much faster
      const boundsMultiplier = 1 + volatilityFactor * 0.05 * Math.sqrt(day);
      const delta = stdDev * Math.sqrt(day) * boundsMultiplier;

      const lowerBound = Math.max(0, projectedEmission - delta);
      const upperBound = projectedEmission + delta;

      snapshots.push({
        day,
        projectedEmission: parseFloat(projectedEmission.toFixed(4)),
        lowerBound: parseFloat(lowerBound.toFixed(4)),
        upperBound: parseFloat(upperBound.toFixed(4)),
      });
    }

    // Confidence decays faster for highly volatile/chaotic users
    const decayMultiplier = 1 / (1 + volatilityFactor * 0.01 * horizonDays);
    const finalConfidence = Math.max(0.1, baseConfidence * decayMultiplier);

    return {
      horizonDays,
      snapshots,
      confidence: parseFloat(finalConfidence.toFixed(3)),
      reasoning: {
        factors: [
          `Behavioral volatility index of ${volatilityFactor.toFixed(2)}`,
          `User risk score of ${riskScore}`
        ],
        assumptions: [
          'Volatility speeds up uncertainty expansion bounds.',
          'Chaotic profiles degrade long-range forecast reliability.'
        ],
        confidenceDrivers: ['Volatile standard deviation', 'Behavioral risk grade score']
      }
    };
  }
}
export default MomentumForecaster;

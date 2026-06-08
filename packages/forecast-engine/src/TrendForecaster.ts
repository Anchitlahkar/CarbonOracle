import { ForecastProjection, BehaviorFeatureVector, BehaviorTrend, ForecastSnapshot } from '@carbonsense/shared-types';

export class TrendForecaster {
  /**
   * Projects daily emissions applying the historical 30-day trend change percentage.
   */
  public project(
    vector: BehaviorFeatureVector,
    trends: BehaviorTrend[],
    horizonDays: number,
    baseConfidence: number
  ): ForecastProjection {
    const mean = vector.dailyEmissionsMean;
    const stdDev = vector.dailyEmissionsStdDev;
    const snapshots: ForecastSnapshot[] = [];

    // Resolve trend parameters
    const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
    const changePercent = totalTrend ? totalTrend.changePercent : 0.0;
    const direction = totalTrend ? totalTrend.direction : 'Stable';

    for (let day = 1; day <= horizonDays; day++) {
      // Calculate daily emission adjusting for trend velocity
      // changePercent represents change over a 30-day window, so we scale by day/30
      const trendMultiplier = 1 + (changePercent / 100) * (day / 30);
      const projectedEmission = Math.max(0, mean * trendMultiplier);

      // Bounds grow with standard deviation
      const delta = stdDev * Math.sqrt(day);
      const lowerBound = Math.max(0, projectedEmission - delta);
      const upperBound = projectedEmission + delta;

      snapshots.push({
        day,
        projectedEmission: parseFloat(projectedEmission.toFixed(4)),
        lowerBound: parseFloat(lowerBound.toFixed(4)),
        upperBound: parseFloat(upperBound.toFixed(4)),
      });
    }

    return {
      horizonDays,
      snapshots,
      confidence: parseFloat(baseConfidence.toFixed(3)),
      reasoning: {
        factors: [`30-day historical trend change percentage of ${changePercent}%`],
        assumptions: [
          `Emissions rate shifts continuously in direction '${direction}' at historical velocity.`,
          'Underlying lifestyle variables maintain current acceleration.'
        ],
        confidenceDrivers: ['Trend stability index', 'Volatility mapping']
      }
    };
  }
}
export default TrendForecaster;

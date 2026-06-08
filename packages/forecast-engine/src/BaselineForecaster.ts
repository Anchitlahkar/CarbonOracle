import { ForecastProjection, BehaviorFeatureVector, ForecastSnapshot } from '@carbonsense/shared-types';

export class BaselineForecaster {
  /**
   * Projects daily mean emissions forward. Uncertainty expands with time.
   */
  public project(vector: BehaviorFeatureVector, horizonDays: number, baseConfidence: number): ForecastProjection {
    const mean = vector.dailyEmissionsMean;
    const stdDev = vector.dailyEmissionsStdDev;
    const snapshots: ForecastSnapshot[] = [];

    for (let day = 1; day <= horizonDays; day++) {
      // Baseline daily emission is flat mean
      const projectedEmission = mean;

      // Bounds scale by standard deviation and square-root of time
      const delta = stdDev * Math.sqrt(day);
      const lowerBound = Math.max(0, mean - delta);
      const upperBound = mean + delta;

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
        factors: ['Historical baseline mean daily emissions'],
        assumptions: [
          'Behavioral consumption volumes remain completely stable.',
          'No external efficiency upgrades implemented.'
        ],
        confidenceDrivers: ['Historical data density', 'Time horizon decay']
      }
    };
  }
}
export default BaselineForecaster;

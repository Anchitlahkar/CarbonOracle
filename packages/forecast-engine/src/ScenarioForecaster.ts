import { 
  ForecastProjection, 
  BehaviorFeatureVector, 
  ForecastScenarioResult, 
  ForecastSnapshot 
} from '@carbonsense/shared-types';
import { getScenarioLibrary } from '@carbonsense/knowledge-base';

export class ScenarioForecaster {
  private library: Record<string, import("@carbonsense/shared-types").ScenarioDefinition>;

  constructor() {
    this.library = getScenarioLibrary() as Record<string, import("@carbonsense/shared-types").ScenarioDefinition>;
  }

  /**
   * Generates alternative future projections matching scenario database definitions.
   */
  public projectScenarios(
    vector: BehaviorFeatureVector,
    horizonDays: number,
    baseConfidence: number
  ): ForecastScenarioResult[] {
    const scenarios = Object.keys(this.library);
    const results: ForecastScenarioResult[] = [];

    scenarios.forEach((key) => {
      const def = this.library[key];
      const result = this.projectSingleScenario(vector, key, def as import("@carbonsense/shared-types").ScenarioDefinition, horizonDays, baseConfidence);
      results.push(result);
    });

    return results;
  }

  private projectSingleScenario(
    vector: BehaviorFeatureVector,
    name: string,
    definition: import("@carbonsense/shared-types").ScenarioDefinition,
    horizonDays: number,
    baseConfidence: number
  ): ForecastScenarioResult {
    const mean = vector.dailyEmissionsMean;
    const stdDev = vector.dailyEmissionsStdDev;
    const reduction = definition.reduction; // e.g. 0.50 for 50%
    const snapshots: ForecastSnapshot[] = [];

    // Calculate daily reduction amount in kg based on scenario rules
    let dailyReductionKg = 0;

    if (name === 'reduceBeef50') {
      // Estimate beef emissions: 250g serving * 27.0 factor = 6.75 kg CO2e per serving
      const weeklyBeefEmissions = vector.weeklyBeefCount * 6.75;
      const dailyBeefEmissions = weeklyBeefEmissions / 7;
      dailyReductionKg = dailyBeefEmissions * (reduction as number);
    } else if (name === 'greenTransit') {
      // Deduct personal transport emissions
      const dailyTransportEmissions = mean * vector.transportRatio;
      dailyReductionKg = dailyTransportEmissions * (reduction as number);
    } else if (name === 'clampShopping') {
      // Deduct shopping emissions
      const dailyShoppingEmissions = mean * vector.shoppingRatio;
      dailyReductionKg = dailyShoppingEmissions * (reduction as number);
    } else if (name === 'energyEfficiency') {
      // Deduct home utility energy emissions
      const dailyEnergyEmissions = mean * vector.energyRatio;
      dailyReductionKg = dailyEnergyEmissions * (reduction as number);
    }

    // Clamp daily reduction to not exceed total daily emissions
    dailyReductionKg = Math.min(mean, dailyReductionKg);

    const projectedDailyMean = Math.max(0, mean - dailyReductionKg);
    const totalReductionOverHorizon = dailyReductionKg * horizonDays;
    const totalEmissionsOverHorizon = projectedDailyMean * horizonDays;

    for (let day = 1; day <= horizonDays; day++) {
      // Bounds scale similarly but we apply the reduction
      const delta = stdDev * Math.sqrt(day);
      const lowerBound = Math.max(0, projectedDailyMean - delta);
      const upperBound = projectedDailyMean + delta;

      snapshots.push({
        day,
        projectedEmission: parseFloat(projectedDailyMean.toFixed(4)),
        lowerBound: parseFloat(lowerBound.toFixed(4)),
        upperBound: parseFloat(upperBound.toFixed(4)),
      });
    }

    const reductionPercent = mean > 0 ? (dailyReductionKg / mean) * 100 : 0;

    const projection: ForecastProjection = {
      horizonDays,
      snapshots,
      confidence: parseFloat((baseConfidence * definition.confidence).toFixed(3)),
      reasoning: {
        factors: [
          `Scenario target reduction percentage: ${reduction * 100}%`,
          `Daily footprint deduction of ${dailyReductionKg.toFixed(2)} kg CO2e`
        ],
        assumptions: [
          definition.reasoning,
          `User maintains a strict adherence to the specified behavior change.`
        ],
        confidenceDrivers: [`Implementation difficulty: ${definition.difficulty}`, 'Adherence model decay']
      }
    };

    return {
      scenarioName: name,
      projectedEmissions: projection,
      reductionAmountKg: parseFloat(totalReductionOverHorizon.toFixed(4)),
      reductionPercent: parseFloat(reductionPercent.toFixed(1)),
      confidenceScore: parseFloat(definition.implementationConfidence.toFixed(3)),
      reasoning: `${definition.reasoning} Total savings of ${totalReductionOverHorizon.toFixed(1)} kg CO2e over ${horizonDays} days.`
    };
  }
}
export default ScenarioForecaster;

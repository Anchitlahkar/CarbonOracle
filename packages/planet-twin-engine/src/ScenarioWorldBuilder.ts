import {
  BehaviorProfile,
  ForecastProfile,
  OptimizationPlan,
  CarbonDNAProfile,
  TwinTrajectory,
  ImpactProjection,
  EarthEquivalent,
  FutureDNAProjection,
  CarbonArchetype,
  TwinWorld,
  PlanetHealthIndex
} from '@carbonsense/shared-types';
import { getPlanetTwinConfig } from '@carbonsense/knowledge-base';
import ImpactAccumulator from './ImpactAccumulator.js';
import EarthEquivalentCalculator from './EarthEquivalentCalculator.js';
import NarrativeGenerator from './NarrativeGenerator.js';

export class ScenarioWorldBuilder {
  private impactAccumulator: ImpactAccumulator;
  private earthCalculator: EarthEquivalentCalculator;
  private narrativeGenerator: NarrativeGenerator;

  constructor() {
    this.impactAccumulator = new ImpactAccumulator();
    this.earthCalculator = new EarthEquivalentCalculator();
    this.narrativeGenerator = new NarrativeGenerator();
  }

  /**
   * Builds a complete TwinWorld object, including impact projections, biocapacity equivalents,
   * narrative logs, and Planet Health Index.
   */
  public buildWorld(
    worldType: 'current' | 'optimized' | 'aggressive',
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile,
    optimizationPlan: OptimizationPlan,
    carbonDNAProfile: CarbonDNAProfile,
    trajectory: TwinTrajectory,
    currentAnnualEmissionsKg: number
  ): TwinWorld {
    const config = getPlanetTwinConfig();
    const weights = config.healthWeights || { emissions: 0.5, sustainability: 0.3, optimization: 0.2 };

    // 1. Calculate impact and earth equivalent
    const impact = this.impactAccumulator.accumulate(trajectory.annualEmissionsKg);
    const earthEquivalent = this.earthCalculator.calculate(trajectory.annualEmissionsKg);

    // 2. Resolve DNA Projection per world
    let dnaProjection: FutureDNAProjection = carbonDNAProfile.evolution.futureProjection;
    if (worldType === 'optimized') {
      dnaProjection = {
        currentArchetype: carbonDNAProfile.archetype,
        projectedArchetype: CarbonArchetype.BalancedOptimizer,
        probability: 0.85,
        reasoning: ['Implementing top mitigations balances the dominant carbon drivers towards optimization.'],
      };
    } else if (worldType === 'aggressive') {
      dnaProjection = {
        currentArchetype: carbonDNAProfile.archetype,
        projectedArchetype: CarbonArchetype.StableLowEmitter,
        probability: 0.90,
        reasoning: ['Full system mitigations drive emissions down to sustainable planetary target levels.'],
      };
    }

    // 3. Resolve Planet Health Index
    const getHealthIndex = (annualEmissions: number): PlanetHealthIndex => {
      // Emissions Component (0-100): 100 for sustainable limit, 0 for extreme values
      const minLimit = 1095.0; // 3kg/day target
      const maxLimit = 15000.0;
      let emissionsComponent = 100;
      if (annualEmissions > minLimit) {
        const factor = (annualEmissions - minLimit) / (maxLimit - minLimit);
        emissionsComponent = Math.max(0, Math.min(100, Math.round((1 - factor) * 100)));
      }

      // Sustainability Component matches global percentile rank
      const ratios = annualEmissions / 4500.0; // compared to global average
      const sustainabilityComponent = Math.max(1, Math.min(99, Math.round(100 - ratios * 50)));

      // Optimization Component (0-100) based on world state and readiness
      let optimizationComponent = 0;
      if (worldType === 'optimized') {
        optimizationComponent = Math.round((carbonDNAProfile.dimensions?.optimizationReadiness ?? 50) * 0.8);
      } else if (worldType === 'aggressive') {
        optimizationComponent = Math.round((carbonDNAProfile.dimensions?.optimizationReadiness ?? 50) * 1.2);
      }
      optimizationComponent = Math.max(0, Math.min(100, optimizationComponent));

      // Weighted score
      const rawScore =
        (emissionsComponent * ((weights as Record<string, number>).emissions)) +
        (sustainabilityComponent * ((weights as Record<string, number>).sustainability)) +
        (optimizationComponent * ((weights as Record<string, number>).optimization));
      const score = Math.max(0, Math.min(100, Math.round(rawScore)));

      return {
        score,
        emissionsComponent,
        sustainabilityComponent,
        optimizationComponent,
        reasoning: [
          `Emissions Component: ${emissionsComponent}/100 based on annual projected emissions of ${annualEmissions.toFixed(0)} kg.`,
          `Sustainability Component: ${sustainabilityComponent}/100 based on comparison to global biocapacity.`,
          `Optimization Component: ${optimizationComponent}/100 based on mitigation status.`,
        ],
      };
    };

    const healthIndex = getHealthIndex(trajectory.annualEmissionsKg);

    // 4. Update trajectory snapshots with temporal health indices
    const updatedSnapshots = trajectory.snapshots.map(snap => {
      // Extrapolate day's cumulative emissions to annual equivalent to evaluate temporal health index
      const dayFactor = snap.day / 365;
      const annualEquiv = snap.cumulativeEmissionsKg / (dayFactor || 1);
      const tempHealth = getHealthIndex(annualEquiv);

      return {
        ...snap,
        healthIndex: tempHealth.score,
      };
    });

    const updatedTrajectory: TwinTrajectory = {
      ...trajectory,
      snapshots: updatedSnapshots,
    };

    // 5. Generate Narrative
    const narrative = this.narrativeGenerator.generate(
      worldType,
      behaviorProfile,
      updatedTrajectory,
      earthEquivalent,
      carbonDNAProfile.archetype,
      currentAnnualEmissionsKg
    );

    return {
      id: `world-${worldType}-${behaviorProfile.userId}-${Date.now()}`,
      name: worldType === 'current' ? 'Current World' : worldType === 'optimized' ? 'Optimized World' : 'Aggressive World',
      trajectory: updatedTrajectory,
      impact,
      earthEquivalent,
      dnaProjection,
      narrative,
      healthIndex,
    };
  }
}
export default ScenarioWorldBuilder;

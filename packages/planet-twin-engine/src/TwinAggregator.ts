import {
  BehaviorProfile,
  ForecastProfile,
  OptimizationPlan,
  CarbonDNAProfile,
  PlanetTwinProfile,
  ComparativeAnalysis
} from '@carbonsense/shared-types';
import TrajectorySimulator from './TrajectorySimulator.js';
import ScenarioWorldBuilder from './ScenarioWorldBuilder.js';
import WorldDivergenceAnalyzer from './WorldDivergenceAnalyzer.js';

export class TwinAggregator {
  private trajectorySimulator: TrajectorySimulator;
  private worldBuilder: ScenarioWorldBuilder;
  private divergenceAnalyzer: WorldDivergenceAnalyzer;

  constructor() {
    this.trajectorySimulator = new TrajectorySimulator();
    this.worldBuilder = new ScenarioWorldBuilder();
    this.divergenceAnalyzer = new WorldDivergenceAnalyzer();
  }

  /**
   * Orchestrates the simulations and divergence analyzers to construct the PlanetTwinProfile.
   */
  public aggregate(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile,
    optimizationPlan: OptimizationPlan,
    carbonDNAProfile: CarbonDNAProfile
  ): PlanetTwinProfile {
    // 1. Run trajectories simulation
    const trajectories = this.trajectorySimulator.simulate(behaviorProfile, forecastProfile, optimizationPlan);

    // 2. Build individual worlds
    const currentWorld = this.worldBuilder.buildWorld(
      'current',
      behaviorProfile,
      forecastProfile,
      optimizationPlan,
      carbonDNAProfile,
      trajectories.current,
      trajectories.current.annualEmissionsKg
    );

    const optimizedWorld = this.worldBuilder.buildWorld(
      'optimized',
      behaviorProfile,
      forecastProfile,
      optimizationPlan,
      carbonDNAProfile,
      trajectories.optimized,
      trajectories.current.annualEmissionsKg
    );

    const aggressiveWorld = this.worldBuilder.buildWorld(
      'aggressive',
      behaviorProfile,
      forecastProfile,
      optimizationPlan,
      carbonDNAProfile,
      trajectories.aggressive,
      trajectories.current.annualEmissionsKg
    );

    // 3. Compute comparative analysis
    const reductionVsCurrentKg = parseFloat(
      Math.max(0, currentWorld.trajectory.annualEmissionsKg - optimizedWorld.trajectory.annualEmissionsKg).toFixed(2)
    );
    const pctReduction =
      currentWorld.trajectory.annualEmissionsKg > 0
        ? (reductionVsCurrentKg / currentWorld.trajectory.annualEmissionsKg) * 100
        : 0;
    const reductionVsCurrentPercent = parseFloat(pctReduction.toFixed(2));

    // Resolve highest impact action from optimization candidates
    const sortedCandidates = [...(optimizationPlan.candidates || [])].sort((a, b) => a.rank - b.rank);
    const highestImpactAction = sortedCandidates.length > 0 ? sortedCandidates[0].title : 'None';

    // Resolve highest risk driver
    let highestRiskDriver = 'General Baseline consumption';
    if (forecastProfile.riskDrivers && forecastProfile.riskDrivers.length > 0) {
      const sortedDrivers = [...forecastProfile.riskDrivers].sort((a, b) => b.contribution - a.contribution);
      highestRiskDriver = sortedDrivers[0].driver;
    } else {
      // Fallback behavior profile classification
      highestRiskDriver = `${behaviorProfile.classification} lifestyle patterns`;
    }

    const comparativeAnalysis: ComparativeAnalysis = {
      reductionVsCurrentKg,
      reductionVsCurrentPercent,
      highestImpactAction,
      highestRiskDriver,
    };

    // 4. Compute World Divergence
    const worldDivergence = this.divergenceAnalyzer.analyze(currentWorld, optimizedWorld, optimizationPlan);

    return {
      userId: behaviorProfile.userId,
      currentWorld,
      optimizedWorld,
      aggressiveWorld,
      comparativeAnalysis,
      worldDivergence,
      generatedAt: new Date().toISOString(),
    };
  }
}
export default TwinAggregator;

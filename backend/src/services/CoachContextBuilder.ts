import { 
  BehaviorProfile, 
  ForecastProfile, 
  OptimizationPlan, 
  CarbonDNAProfile, 
  PlanetTwinProfile,
  CoachEvidenceBlock 
} from '@carbonsense/shared-types';

/**
 * Translates all core intelligence engine profiles into a list of CoachEvidenceBlocks.
 * Validated to run offline without any dependencies on external API providers.
 */
export class CoachContextBuilder {
  /**
   * Translates all core intelligence engine profiles into a list of CoachEvidenceBlocks.
   */
  public static buildEvidence(
    behavior: BehaviorProfile,
    forecast: ForecastProfile,
    optimization: OptimizationPlan,
    dna: CarbonDNAProfile,
    twin: PlanetTwinProfile
  ): CoachEvidenceBlock[] {
    const evidence: CoachEvidenceBlock[] = [];

    // DNA Archetype
    if (dna && dna.archetype) {
      evidence.push({
        source: 'CarbonDNAProfile',
        metric: 'Dominant Carbon Archetype',
        value: dna.archetype,
        confidence: (dna.archetypeConfidence || 100) / 100
      });
    }

    // Top Optimization Savings candidate
    if (optimization && optimization.candidates && optimization.candidates.length > 0) {
      const sortedCandidates = [...optimization.candidates].sort((a, b) => (a.rank || 99) - (b.rank || 99));
      const topOpportunity = sortedCandidates[0];
      evidence.push({
        source: 'OptimizationPlan',
        metric: 'Top Carbon Reduction Opportunity',
        value: `${topOpportunity.title} (Est. Savings: ${topOpportunity.estimatedSavingsKg} kg CO2e)`,
        confidence: (topOpportunity.score || 100) / 100
      });
    }

    // Planet Health Index (PHI) and Divergence
    if (twin && twin.currentWorld && twin.currentWorld.healthIndex && twin.optimizedWorld && twin.optimizedWorld.healthIndex) {
      evidence.push({
        source: 'PlanetTwinProfile',
        metric: 'Current World Health Index',
        value: `Score: ${twin.currentWorld.healthIndex.score}/100`,
        confidence: 1.0
      });
      evidence.push({
        source: 'PlanetTwinProfile',
        metric: 'Optimized World Health Index',
        value: `Score: ${twin.optimizedWorld.healthIndex.score}/100`,
        confidence: 1.0
      });
      if (twin.worldDivergence) {
        evidence.push({
          source: 'PlanetTwinProfile',
          metric: 'Future World Divergence',
          value: `Score: ${twin.worldDivergence.divergenceScore}/100, Gap: ${twin.worldDivergence.emissionsGapKg} kg`,
          confidence: 1.0
        });
      }
    }

    // Top Risk Signal
    if (behavior && behavior.signals && behavior.signals.length > 0) {
      const topSignal = [...behavior.signals].sort((a, b) => b.strength - a.strength)[0];
      evidence.push({
        source: 'BehaviorProfile',
        metric: 'Primary Behavioral Risk Factor',
        value: `${topSignal.description} (Strength: ${(topSignal.strength * 100).toFixed(0)}%)`,
        confidence: topSignal.confidence
      });
    }

    // Forecast projection
    if (forecast && forecast.baseline && forecast.baseline['30d']) {
      const snapshots = forecast.baseline['30d'].snapshots || [];
      const finalEmission = snapshots.length > 0 ? snapshots[snapshots.length - 1].projectedEmission : 0;
      evidence.push({
        source: 'ForecastProfile',
        metric: 'Projected 30-Day Cumulative Emissions (Baseline)',
        value: `${finalEmission.toFixed(1)} kg CO2e`,
        confidence: forecast.baseline['30d'].confidence
      });
    }

    return evidence;
  }
}
export default CoachContextBuilder;

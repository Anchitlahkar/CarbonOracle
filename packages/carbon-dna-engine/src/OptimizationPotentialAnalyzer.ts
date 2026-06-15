import { BehaviorProfile, ForecastProfile, OptimizationPlan } from '@carbonsense/shared-types';

export class OptimizationPotentialAnalyzer {
  /**
   * Evaluates absolute potential carbon savings and maps it to a normalized 0-100 score.
   */
  public analyze(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile,
    optimizationPlan: OptimizationPlan
  ): { potentialScore: number; absoluteSavingsKg: number } {
    const candidates = optimizationPlan.candidates || [];
    const absoluteSavingsKg = candidates.reduce((sum, c) => sum + c.estimatedSavingsKg, 0);

    // Get 30-day baseline emissions
    const baseline30d = forecastProfile?.baseline?.['30d'];
    const totalBaseline30d = (baseline30d && baseline30d.snapshots && baseline30d.snapshots.length > 0)
      ? baseline30d.snapshots.reduce((sum: number, s: { projectedEmission: number }) => sum + s.projectedEmission, 0)
      : (behaviorProfile.featureVector.dailyEmissionsMean * 30);

    // Calculate score (percentage of baseline emissions that can be reduced, capped at 100)
    const ratio = totalBaseline30d > 0 ? absoluteSavingsKg / totalBaseline30d : 0;
    const potentialScore = Math.max(0, Math.min(100, Math.round(ratio * 100)));

    return {
      potentialScore,
      absoluteSavingsKg: parseFloat(absoluteSavingsKg.toFixed(2)),
    };
  }
}
export default OptimizationPotentialAnalyzer;

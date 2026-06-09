import { BehaviorProfile, ForecastProfile } from '@carbonsense/shared-types';

export class ReductionEstimator {
  /**
   * Estimates the carbon reduction potential (in kg CO2e) for a given intervention
   * over a 30-day window.
   */
  public estimate(
    intervention: any,
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile
  ): number {
    // 1. Calculate 30-day baseline emissions
    const baseline30d = forecastProfile?.baseline?.['30d'];
    const totalBaseline30d = (baseline30d && baseline30d.snapshots && baseline30d.snapshots.length > 0)
      ? baseline30d.snapshots.reduce((sum: number, s: any) => sum + s.projectedEmission, 0)
      : (behaviorProfile.featureVector.dailyEmissionsMean * 30);

    // 2. Resolve ratio for the target category
    const category = intervention.category;
    let ratio = 0;
    if (category === 'transport') ratio = behaviorProfile.featureVector.transportRatio;
    else if (category === 'food') ratio = behaviorProfile.featureVector.foodRatio;
    else if (category === 'energy') ratio = behaviorProfile.featureVector.energyRatio;
    else if (category === 'shopping') ratio = behaviorProfile.featureVector.shoppingRatio;

    const categoryBaseline30d = totalBaseline30d * ratio;

    let estimatedSavingsKg = 0;

    // 3. Calculate based on applicable signal presence
    if (intervention.applicableSignal) {
      const signal = behaviorProfile.signals.find(s => s.type === intervention.applicableSignal);
      if (signal) {
        // High impact savings when user exhibits the specific negative behavioral signal
        estimatedSavingsKg = categoryBaseline30d * intervention.savingsMultiplier * (0.5 + signal.strength * 0.5);
      } else {
        // Low impact savings if user doesn't exhibit the behavior (already optimized)
        estimatedSavingsKg = intervention.baseSavingsKg * 0.1;
      }
    } else {
      // General intervention that applies directly to the category baseline
      estimatedSavingsKg = categoryBaseline30d * intervention.savingsMultiplier;
    }

    // 4. Boundary checks: savings cannot exceed total category baseline
    estimatedSavingsKg = Math.max(0, Math.min(estimatedSavingsKg, categoryBaseline30d));

    return parseFloat(estimatedSavingsKg.toFixed(2));
  }
}
export default ReductionEstimator;

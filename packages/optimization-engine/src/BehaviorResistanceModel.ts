import { BehaviorProfile, ForecastProfile, BehaviorResistanceScore } from '@carbonsense/shared-types';

export class BehaviorResistanceModel {
  /**
   * Computes the behavior resistance score including risk factor and habit strength analysis.
   */
  public estimate(
    intervention: any,
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile
  ): BehaviorResistanceScore {
    const baseResistance = intervention.baseResistance; // 0 to 100
    const riskFactor = behaviorProfile.riskScore / 100; // 0.0 to 1.0

    let habitStrength = 0;
    const signal = intervention.applicableSignal
      ? behaviorProfile.signals.find(s => s.type === intervention.applicableSignal)
      : null;

    if (signal) {
      habitStrength = signal.strength; // 0.0 to 1.0
    }

    // Compute resistance score
    const rawScore = baseResistance + (riskFactor * 15) + (habitStrength * 25);
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Generate reasoning
    let reasoning = '';
    if (signal) {
      reasoning = `High resistance (score: ${score}) to '${intervention.title}' due to an active habit of type '${intervention.applicableSignal}' (strength: ${habitStrength.toFixed(2)}) and general profile risk factor of ${(riskFactor * 100).toFixed(0)}%.`;
    } else if (intervention.applicableSignal) {
      reasoning = `Low resistance (score: ${score}) to '${intervention.title}' since the user doesn't exhibit the '${intervention.applicableSignal}' pattern, though a profile risk factor of ${(riskFactor * 100).toFixed(0)}% applies.`;
    } else {
      reasoning = `Moderate resistance (score: ${score}) to '${intervention.title}' as a general lifestyle improvement, with a profile risk factor of ${(riskFactor * 100).toFixed(0)}%.`;
    }

    return {
      score,
      riskFactor: parseFloat(riskFactor.toFixed(3)),
      habitStrength: parseFloat(habitStrength.toFixed(3)),
      reasoning,
    };
  }
}
export default BehaviorResistanceModel;

import { BehaviorProfile, ForecastProfile } from '@carbonsense/shared-types';

export class DifficultyEstimator {
  /**
   * Estimates implementation difficulty score (0 to 100) and difficulty level ('easy' | 'medium' | 'hard').
   */
  public estimate(
    intervention: any,
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile
  ): { score: number; level: 'easy' | 'medium' | 'hard' } {
    const baseDifficulty = intervention.baseDifficulty; // 0 to 100

    // 1. Calculate risk score adjustment (up to +15 difficulty points for high-risk profiles)
    const riskAdjustment = (behaviorProfile.riskScore / 100) * 15;

    // 2. Calculate habit strength adjustment if the specific bad habit signal exists (up to +10 points)
    let habitAdjustment = 0;
    if (intervention.applicableSignal) {
      const signal = behaviorProfile.signals.find(s => s.type === intervention.applicableSignal);
      if (signal) {
        habitAdjustment = signal.strength * 10;
      }
    }

    // 3. Category dependency adjustment (up to +5 difficulty points if category represents > 40% of emissions)
    let ratio = 0;
    const category = intervention.category;
    if (category === 'transport') ratio = behaviorProfile.featureVector.transportRatio;
    else if (category === 'food') ratio = behaviorProfile.featureVector.foodRatio;
    else if (category === 'energy') ratio = behaviorProfile.featureVector.energyRatio;
    else if (category === 'shopping') ratio = behaviorProfile.featureVector.shoppingRatio;

    const ratioAdjustment = ratio > 0.4 ? 5 : 0;

    // Combine and cap at 100
    const rawScore = baseDifficulty + riskAdjustment + habitAdjustment + ratioAdjustment;
    const difficultyScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Map to levels
    let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
    if (difficultyScore < 40) {
      difficultyLevel = 'easy';
    } else if (difficultyScore >= 70) {
      difficultyLevel = 'hard';
    }

    return {
      score: difficultyScore,
      level: difficultyLevel,
    };
  }
}
export default DifficultyEstimator;

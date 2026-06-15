import { BehaviorProfile, ForecastProfile, OptimizationPlan, TwinTrajectory, WorldSnapshot } from '@carbonsense/shared-types';
import { getPlanetTwinConfig } from '@carbonsense/knowledge-base';

export class TrajectorySimulator {
  /**
   * Projects cumulative emissions trajectories and returns TwinTrajectory objects for all three simulation worlds.
   */
  public simulate(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile,
    optimizationPlan: OptimizationPlan
  ): { current: TwinTrajectory; optimized: TwinTrajectory; aggressive: TwinTrajectory } {
    const config = getPlanetTwinConfig();
    const intervals: number[] = (config.snapshotIntervals as number[]) || [30, 90, 180, 365];

    const mean = behaviorProfile.featureVector.dailyEmissionsMean;

    // Helper to get projected emissions for a single day
    const getDailyEmission = (d: number): number => {
      if (d <= 30) {
        const snap = forecastProfile?.baseline?.['30d']?.snapshots?.find(s => s.day === d);
        if (snap) return snap.projectedEmission;
      } else if (d <= 90) {
        const snap = forecastProfile?.baseline?.['90d']?.snapshots?.find(s => s.day === d);
        if (snap) return snap.projectedEmission;
      } else {
        const snap = forecastProfile?.baseline?.['365d']?.snapshots?.find(s => s.day === d);
        if (snap) return snap.projectedEmission;
      }
      return mean;
    };

    // Helper to get cumulative baseline emissions for day D
    const getCumulativeBaseline = (D: number): number => {
      let sum = 0;
      for (let d = 1; d <= D; d++) {
        sum += getDailyEmission(d);
      }
      return sum;
    };

    // 1. Current World trajectory
    const current30 = getCumulativeBaseline(30);
    const current90 = getCumulativeBaseline(90);
    const current365 = getCumulativeBaseline(365);
    const currentConfidence = forecastProfile?.baseline?.['30d']?.confidence ?? 0.9;

    const currentSnapshots: WorldSnapshot[] = intervals.map(day => ({
      day,
      cumulativeEmissionsKg: parseFloat(getCumulativeBaseline(day).toFixed(2)),
      healthIndex: 0, // Assigned later by Builder
    }));

    const current: TwinTrajectory = {
      annualEmissionsKg: parseFloat(current365.toFixed(2)),
      cumulative30DayKg: parseFloat(current30.toFixed(2)),
      cumulative90DayKg: parseFloat(current90.toFixed(2)),
      cumulative365DayKg: parseFloat(current365.toFixed(2)),
      confidence: currentConfidence,
      snapshots: currentSnapshots,
    };

    // 2. Optimized World trajectory (deducts top 3 recommendations)
    const sortedCandidates = [...(optimizationPlan.candidates || [])].sort((a, b) => a.rank - b.rank);
    const top3Candidates = sortedCandidates.slice(0, 3);
    const savings30d = top3Candidates.reduce((sum, c) => sum + c.estimatedSavingsKg, 0);
    const dailySavingsOpt = savings30d / 30;

    const getCumulativeOptimized = (D: number): number => {
      const base = getCumulativeBaseline(D);
      const savings = dailySavingsOpt * D;
      return Math.max(0, base - savings);
    };

    const optimizedSnapshots: WorldSnapshot[] = intervals.map(day => ({
      day,
      cumulativeEmissionsKg: parseFloat(getCumulativeOptimized(day).toFixed(2)),
      healthIndex: 0,
    }));

    const optimized365 = getCumulativeOptimized(365);
    const optimized: TwinTrajectory = {
      annualEmissionsKg: parseFloat(optimized365.toFixed(2)),
      cumulative30DayKg: parseFloat(getCumulativeOptimized(30).toFixed(2)),
      cumulative90DayKg: parseFloat(getCumulativeOptimized(90).toFixed(2)),
      cumulative365DayKg: parseFloat(getCumulativeOptimized(365).toFixed(2)),
      confidence: parseFloat((currentConfidence * 0.95).toFixed(3)),
      snapshots: optimizedSnapshots,
    };

    // 3. Aggressive World trajectory (deducts all recommendations)
    const allSavings30d = (optimizationPlan.candidates || []).reduce((sum, c) => sum + c.estimatedSavingsKg, 0);
    const dailySavingsAgg = allSavings30d / 30;

    const getCumulativeAggressive = (D: number): number => {
      const base = getCumulativeBaseline(D);
      const savings = dailySavingsAgg * D;
      return Math.max(0, base - savings);
    };

    const aggressiveSnapshots: WorldSnapshot[] = intervals.map(day => ({
      day,
      cumulativeEmissionsKg: parseFloat(getCumulativeAggressive(day).toFixed(2)),
      healthIndex: 0,
    }));

    const aggressive365 = getCumulativeAggressive(365);
    const aggressive: TwinTrajectory = {
      annualEmissionsKg: parseFloat(aggressive365.toFixed(2)),
      cumulative30DayKg: parseFloat(getCumulativeAggressive(30).toFixed(2)),
      cumulative90DayKg: parseFloat(getCumulativeAggressive(90).toFixed(2)),
      cumulative365DayKg: parseFloat(getCumulativeAggressive(365).toFixed(2)),
      confidence: parseFloat((currentConfidence * 0.85).toFixed(3)),
      snapshots: aggressiveSnapshots,
    };

    return {
      current,
      optimized,
      aggressive,
    };
  }
}
export default TrajectorySimulator;

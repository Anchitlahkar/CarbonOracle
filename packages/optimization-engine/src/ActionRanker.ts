import { OptimizationCandidate } from '@carbonsense/shared-types';

export class ActionRanker {
  /**
   * Calculates priority scores and sorts candidates in descending order.
   * Modifies and assigns ranks (1-indexed).
   */
  public rank(candidates: Omit<OptimizationCandidate, 'rank' | 'score'>[]): OptimizationCandidate[] {
    const scored = candidates.map(c => {
      // MCDA Formula: Savings / (Weighted Difficulty and Resistance + constant offset)
      const difficultyWeight = 0.4;
      const resistanceWeight = 0.6;
      const denominator = (c.difficultyScore * difficultyWeight) + (c.resistanceScore.score * resistanceWeight) + 10;
      const rawScore = (c.estimatedSavingsKg * 100) / denominator;
      const score = parseFloat(rawScore.toFixed(3));

      return {
        ...c,
        score,
      };
    });

    // Sort descending by score, tie-break by savings (descending), then by title alphabetically (ascending)
    const sorted = scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.estimatedSavingsKg !== a.estimatedSavingsKg) {
        return b.estimatedSavingsKg - a.estimatedSavingsKg;
      }
      return a.title.localeCompare(b.title);
    });

    // Map ranks
    return sorted.map((candidate, idx) => ({
      ...candidate,
      rank: idx + 1,
    }));
  }
}
export default ActionRanker;

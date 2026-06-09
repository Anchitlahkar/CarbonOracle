import { CarbonCategory, OptimizationCandidate, OptimizationTradeoff } from '@carbonsense/shared-types';

export class OptimizationAggregator {
  /**
   * Groups candidates by carbon category and compiles the tradeoff analysis.
   */
  public aggregate(candidates: OptimizationCandidate[]): OptimizationTradeoff[] {
    const categories: CarbonCategory[] = ['transport', 'food', 'energy', 'shopping'];
    const tradeoffs: OptimizationTradeoff[] = [];

    for (const category of categories) {
      const catCandidates = candidates.filter(c => c.category === category);

      if (catCandidates.length === 0) {
        tradeoffs.push({
          category,
          potentialSavingsKg: 0,
          averageDifficulty: 0,
          averageResistance: 0,
          candidateCount: 0,
          description: `No active carbon reduction candidates were identified in the '${category}' category.`,
        });
        continue;
      }

      const potentialSavingsKg = catCandidates.reduce((sum, c) => sum + c.estimatedSavingsKg, 0);
      const sumDifficulty = catCandidates.reduce((sum, c) => sum + c.difficultyScore, 0);
      const sumResistance = catCandidates.reduce((sum, c) => sum + c.resistanceScore.score, 0);

      const averageDifficulty = parseFloat((sumDifficulty / catCandidates.length).toFixed(1));
      const averageResistance = parseFloat((sumResistance / catCandidates.length).toFixed(1));
      const candidateCount = catCandidates.length;

      // Classify the tradeoff profile for reasoning
      let description = '';
      if (averageDifficulty >= 60 && averageResistance >= 60) {
        description = `Category '${category}' offers substantial savings potential of ${potentialSavingsKg.toFixed(1)} kg but is characterized by high implementation difficulty (${averageDifficulty}) and strong behavioral resistance (${averageResistance}).`;
      } else if (averageDifficulty < 40 && averageResistance < 40) {
        description = `Category '${category}' represents quick wins with highly accessible saving opportunities (${potentialSavingsKg.toFixed(1)} kg) that have low friction and minimal resistance.`;
      } else {
        description = `Category '${category}' provides moderate carbon reduction opportunities (${potentialSavingsKg.toFixed(1)} kg) with a balanced profile of ease and moderate user resistance.`;
      }

      tradeoffs.push({
        category,
        potentialSavingsKg: parseFloat(potentialSavingsKg.toFixed(2)),
        averageDifficulty,
        averageResistance,
        candidateCount,
        description,
      });
    }

    return tradeoffs;
  }
}
export default OptimizationAggregator;

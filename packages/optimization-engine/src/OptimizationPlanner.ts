import { BehaviorProfile, ForecastProfile, OptimizationCandidate } from '@carbonsense/shared-types';
import { getInterventions } from '@carbonsense/knowledge-base';
import ReductionEstimator from './ReductionEstimator.js';
import DifficultyEstimator from './DifficultyEstimator.js';
import BehaviorResistanceModel from './BehaviorResistanceModel.js';
import ActionRanker from './ActionRanker.js';

export class OptimizationPlanner {
  private reductionEstimator: ReductionEstimator;
  private difficultyEstimator: DifficultyEstimator;
  private resistanceModel: BehaviorResistanceModel;
  private ranker: ActionRanker;

  constructor() {
    this.reductionEstimator = new ReductionEstimator();
    this.difficultyEstimator = new DifficultyEstimator();
    this.resistanceModel = new BehaviorResistanceModel();
    this.ranker = new ActionRanker();
  }

  /**
   * Plans, scores, and ranks candidate interventions for a user.
   */
  public plan(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile
  ): OptimizationCandidate[] {
    const interventions = getInterventions();

    const candidates: Omit<OptimizationCandidate, 'rank' | 'score'>[] = (interventions as unknown as import("./ReductionEstimator.js").RawIntervention[]).map((inter) => {
      const estimatedSavingsKg = this.reductionEstimator.estimate(inter, behaviorProfile, forecastProfile);
      const difficulty = this.difficultyEstimator.estimate(inter, behaviorProfile, forecastProfile);
      const resistanceScore = this.resistanceModel.estimate(inter, behaviorProfile, forecastProfile);

      // Generate localized, detailed reasoning explaining the recommendation context
      const reasoning = `This action offers ${estimatedSavingsKg.toFixed(1)} kg of CO2e savings. It is rated as ${difficulty.level} difficulty (${difficulty.score}/100) with a behavioral resistance score of ${resistanceScore.score}/100. ${resistanceScore.reasoning}`;

      return {
        id: `candidate-${inter.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        interventionId: inter.id,
        title: inter.title,
        description: inter.description,
        category: inter.category,
        estimatedSavingsKg,
        difficultyScore: difficulty.score,
        difficultyLevel: difficulty.level,
        resistanceScore,
        reasoning,
      };
    });

    // Rank candidates using MCDA
    return this.ranker.rank(candidates);
  }
}
export default OptimizationPlanner;

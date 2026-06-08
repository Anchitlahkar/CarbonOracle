import { BehaviorClassification, BehaviorFeatureVector } from '@carbonsense/shared-types';

export interface ClassificationResult {
  classification: BehaviorClassification;
  confidence: number;
  reasoning: string;
}

export class BehaviorClassifier {
  /**
   * Classifies user profiles based on category emission ratios.
   */
  public classify(vector: BehaviorFeatureVector): ClassificationResult {
    const { transportRatio, foodRatio, energyRatio, shoppingRatio } = vector;

    if (transportRatio >= 0.50) {
      return {
        classification: 'TransportHeavy',
        confidence: 0.90,
        reasoning: `Transport emissions dominate the profile at ${(transportRatio * 100).toFixed(0)}% of total carbon footprint.`,
      };
    }

    if (foodRatio >= 0.50) {
      return {
        classification: 'FoodHeavy',
        confidence: 0.90,
        reasoning: `Food and dietary emissions dominate the profile at ${(foodRatio * 100).toFixed(0)}% of total carbon footprint.`,
      };
    }

    if (energyRatio >= 0.50) {
      return {
        classification: 'EnergyHeavy',
        confidence: 0.90,
        reasoning: `Home and utility energy emissions dominate the profile at ${(energyRatio * 100).toFixed(0)}% of total carbon footprint.`,
      };
    }

    if (shoppingRatio >= 0.50) {
      return {
        classification: 'ShoppingHeavy',
        confidence: 0.90,
        reasoning: `Shopping acquisitions and product lifecycle emissions dominate at ${(shoppingRatio * 100).toFixed(0)}% of total carbon footprint.`,
      };
    }

    // Check if balanced (all categories < 35%)
    const maxRatio = Math.max(transportRatio, foodRatio, energyRatio, shoppingRatio);
    if (maxRatio < 0.35) {
      return {
        classification: 'Balanced',
        confidence: 0.85,
        reasoning: `Emissions are distributed relatively evenly, with no single category exceeding 35% of total carbon footprint.`,
      };
    }

    return {
      classification: 'Mixed',
      confidence: 0.80,
      reasoning: `Multiple high emissions categories detected without a single dominant category (>50%).`,
    };
  }
}
export default BehaviorClassifier;

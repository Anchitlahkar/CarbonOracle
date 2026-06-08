import { BehaviorFeatureVector, BehaviorSignal, CounterfactualResult, RiskDriver } from '@carbonsense/shared-types';

export class CounterfactualForecaster {
  /**
   * Projects alternative historical outcomes based on behaviors.
   */
  public analyze(
    vector: BehaviorFeatureVector,
    signals: BehaviorSignal[],
    drivers: RiskDriver[]
  ): CounterfactualResult[] {
    const results: CounterfactualResult[] = [];
    const mean = vector.dailyEmissionsMean;

    const hasSignal = (type: string) => signals.some((s) => s.type === type);

    // 1. Personal Vehicle transit counterfactual
    if (hasSignal('HighCarDependency') && vector.transportRatio > 0) {
      const annualCarEmissions = mean * vector.transportRatio * 365;
      const alternativeOutcomeKg = annualCarEmissions * 0.40; // 60% savings by switching to bus/train/EV
      const savings = annualCarEmissions - alternativeOutcomeKg;

      results.push({
        action: 'Personal Vehicle Usage',
        historicalImpactKg: parseFloat(annualCarEmissions.toFixed(2)),
        alternativeOutcomeKg: parseFloat(alternativeOutcomeKg.toFixed(2)),
        confidence: 0.90,
        reasoning: `If public transit or electric vehicle commutes had been used instead of personal vehicle transit over the last year, annual emissions would be ${savings.toFixed(1)} kg CO2e lower.`,
      });
    }

    // 2. Beef consumption counterfactual
    if (hasSignal('FrequentBeefConsumption') && vector.weeklyBeefCount > 0) {
      const annualBeefEmissions = (vector.weeklyBeefCount / 7) * 6.75 * 365;
      // Replaced with vegetarian meal serving (0.5 kg factor)
      const alternativeOutcomeKg = (vector.weeklyBeefCount / 7) * 0.5 * 365;
      const savings = annualBeefEmissions - alternativeOutcomeKg;

      results.push({
        action: 'Beef Diet Choices',
        historicalImpactKg: parseFloat(annualBeefEmissions.toFixed(2)),
        alternativeOutcomeKg: parseFloat(alternativeOutcomeKg.toFixed(2)),
        confidence: 0.92,
        reasoning: `If vegetarian meal servings had replaced beef consumption over the last year, annual emissions would be ${savings.toFixed(1)} kg CO2e lower.`,
      });
    }

    // 3. Grid energy counterfactual
    if (vector.energyRatio >= 0.30) {
      const annualEnergyEmissions = mean * vector.energyRatio * 365;
      const alternativeOutcomeKg = annualEnergyEmissions * 0.20; // 80% savings via solar/green energy source
      const savings = annualEnergyEmissions - alternativeOutcomeKg;

      results.push({
        action: 'Residential Grid Utility Electricity',
        historicalImpactKg: parseFloat(annualEnergyEmissions.toFixed(2)),
        alternativeOutcomeKg: parseFloat(alternativeOutcomeKg.toFixed(2)),
        confidence: 0.88,
        reasoning: `If green electricity sources (like clean solar offsets) were utilized instead of standard grid utility power over the last year, annual emissions would be ${savings.toFixed(1)} kg CO2e lower.`,
      });
    }

    // 4. Shopping counterfactual
    if (hasSignal('ShoppingHeavyBehavior') && vector.shoppingRatio > 0) {
      const annualShoppingEmissions = mean * vector.shoppingRatio * 365;
      const alternativeOutcomeKg = annualShoppingEmissions * 0.50; // 50% savings by clamping purchases
      const savings = annualShoppingEmissions - alternativeOutcomeKg;

      results.push({
        action: 'Discretionary Shopping Purchases',
        historicalImpactKg: parseFloat(annualShoppingEmissions.toFixed(2)),
        alternativeOutcomeKg: parseFloat(alternativeOutcomeKg.toFixed(2)),
        confidence: 0.82,
        reasoning: `If consumer discretionary shopping purchases had been capped or reduced by 50% over the last year, annual emissions would be ${savings.toFixed(1)} kg CO2e lower.`,
      });
    }

    return results;
  }
}
export default CounterfactualForecaster;

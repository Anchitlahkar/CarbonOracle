import { BehaviorFeatureVector, BehaviorSignal, RiskDriver } from '@carbonsense/shared-types';

export class RiskDriverAnalyzer {
  /**
   * Identifies and ranks the top emission drivers based on behavior ratios and signals.
   */
  public analyze(vector: BehaviorFeatureVector, signals: BehaviorSignal[]): RiskDriver[] {
    const drivers: RiskDriver[] = [];

    // Helper checking signal existence
    const hasSignal = (type: string) => signals.some((s) => s.type === type);

    // 1. Transport driver
    const transportName = hasSignal('HighCarDependency') || hasSignal('HighFlightFrequency')
      ? 'Personal Vehicle & Air Travel'
      : 'Transport & Commutes';
    drivers.push({
      driver: transportName,
      contribution: Math.round(vector.transportRatio * 100),
    });

    // 2. Food driver
    const foodName = hasSignal('FrequentBeefConsumption')
      ? 'High-Impact Beef/Meat Diet'
      : 'Diet & Agriculture';
    drivers.push({
      driver: foodName,
      contribution: Math.round(vector.foodRatio * 100),
    });

    // 3. Energy driver
    drivers.push({
      driver: 'Residential Grid Utility Electricity',
      contribution: Math.round(vector.energyRatio * 100),
    });

    // 4. Shopping driver
    const shoppingName = hasSignal('ShoppingHeavyBehavior')
      ? 'Discretionary Consumer Purchases'
      : 'Shopping & Apparel';
    drivers.push({
      driver: shoppingName,
      contribution: Math.round(vector.shoppingRatio * 100),
    });

    // Sort by contribution descending, filter out 0 contributions
    return drivers
      .filter((d) => d.contribution > 0)
      .sort((a, b) => b.contribution - a.contribution);
  }
}
export default RiskDriverAnalyzer;

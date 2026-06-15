import { EarthEquivalent } from '@carbonsense/shared-types';
import { getEarthEquivalents } from '@carbonsense/knowledge-base';

export class EarthEquivalentCalculator {
  /**
   * Translates annual footprint into global biocapacity and sustainability metrics.
   */
  public calculate(annualEmissionsKg: number): EarthEquivalent {
    const assumptions = getEarthEquivalents();
    const sustainable = assumptions.sustainableAnnualKg ?? 1800.0;
    const globalAverage = assumptions.globalAverageAnnualKg ?? 4500.0;
    const popFactor = assumptions.populationEquivalentFactor ?? 1.5;

    // Earths required is footprint divided by sustainable baseline capacity (capped below)
    const earths = annualEmissionsKg / (sustainable as number);
    const earthsRequired = parseFloat(Math.max(0.1, earths).toFixed(2));

    // Global percentile ranking (higher percentile means a cleaner/better footprint)
    const ratio = annualEmissionsKg / (globalAverage as number);
    const globalPercentile = Math.max(1, Math.min(99, Math.round(100 - ratio * 50)));

    // Population equivalent (how many sustainable citizens equal this user's output)
    const popEquivalent = (annualEmissionsKg / (sustainable as number)) * (popFactor as number);
    const populationEquivalent = parseFloat(Math.max(0.1, popEquivalent).toFixed(2));

    return {
      earthsRequired,
      globalPercentile,
      populationEquivalent,
    };
  }
}
export default EarthEquivalentCalculator;

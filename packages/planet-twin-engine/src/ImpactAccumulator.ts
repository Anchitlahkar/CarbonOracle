import { ImpactProjection } from '@carbonsense/shared-types';
import { getImpactFactors } from '@carbonsense/knowledge-base';

export class ImpactAccumulator {
  /**
   * Translates absolute emissions into understandable impact equivalents.
   */
  public accumulate(cumulativeEmissionsKg: number): ImpactProjection {
    const factors = getImpactFactors();

    const trees = cumulativeEmissionsKg * ((factors.treesOffsetPerKg as number) ?? 0.04545);
    const vehicleKm = cumulativeEmissionsKg * ((factors.vehicleKmPerKg as number) ?? 5.0);
    const householdDays = cumulativeEmissionsKg * ((factors.householdEnergyDaysPerKg as number) ?? 0.1);

    return {
      cumulativeEmissionsKg: parseFloat(cumulativeEmissionsKg.toFixed(2)),
      treesRequiredForOffset: parseFloat(trees.toFixed(2)),
      vehicleEquivalentKm: parseFloat(vehicleKm.toFixed(2)),
      householdEnergyEquivalentDays: parseFloat(householdDays.toFixed(2)),
    };
  }
}
export default ImpactAccumulator;

import { Result, ok, fail, ValidationError, NotFoundError } from '@carbonsense/core';
import { 
  CarbonEntry, 
  CarbonCategory, 
  CarbonCalculationResult, 
  EmissionFactor, 
  CalculationAudit, 
  FactorSelectionReason 
} from '@carbonsense/shared-types';
import { getAllFactors, getMethodologyMetadata } from '@carbonsense/knowledge-base';
import { z } from 'zod';

// Zod validation schema for calculation input parameters
const calculateSchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'shopping'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  subCategory: z.string().min(1, { message: 'subCategory cannot be empty' }),
  amount: z.number().gt(0, { message: 'amount must be greater than zero' }),
  unit: z.string().min(1, { message: 'unit cannot be empty' }),
  country: z.string().optional(),
});

export interface ICarbonScienceEngine {
  calculate(params: {
    category: CarbonCategory;
    subCategory: string;
    amount: number;
    unit: string;
    country?: string;
  }): Result<CarbonCalculationResult>;

  getWeeklyAverage(entries: CarbonEntry[]): Result<number>;
  getDailyTotal(entries: CarbonEntry[], date: Date): Result<number>;
  getCategoryBreakdown(entries: CarbonEntry[]): Result<Record<CarbonCategory, number>>;
  getFootprintScore(dailyKg: number): Result<{
    score: number;
    rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  }>;
}

export class CarbonScienceEngine implements ICarbonScienceEngine {
  private factors: EmissionFactor[];

  constructor() {
    this.factors = getAllFactors();
  }

  /**
   * Helper class to convert units to base units.
   * Returns conversion ratio and path.
   */
  private convertUnit(value: number, fromUnit: string, toUnit: string): Result<{ convertedValue: number; conversionPath: string[] }> {
    const from = fromUnit.toLowerCase().trim();
    const to = toUnit.toLowerCase().trim();

    if (from === to) {
      return ok({ convertedValue: value, conversionPath: [] });
    }

    // Distance: base is km
    if (to === 'km') {
      if (from === 'miles' || from === 'mile') {
        return ok({ convertedValue: value * 1.609344, conversionPath: ['miles -> km'] });
      }
    }

    // Mass: base is kg
    if (to === 'kg') {
      if (from === 'lbs' || from === 'lb' || from === 'pound' || from === 'pounds') {
        return ok({ convertedValue: value * 0.45359237, conversionPath: ['lbs -> kg'] });
      }
      if (from === 'oz' || from === 'ounce' || from === 'ounces') {
        return ok({ convertedValue: value * 0.02834952, conversionPath: ['oz -> kg'] });
      }
    }

    // Volume: base is liter
    if (to === 'liter' || to === 'liters' || to === 'l') {
      if (from === 'gallons' || from === 'gallon' || from === 'gal') {
        return ok({ convertedValue: value * 3.78541, conversionPath: ['gallons -> liters'] });
      }
    }

    // Energy: base is kwh
    if (to === 'kwh') {
      if (from === 'therms' || from === 'therm') {
        return ok({ convertedValue: value * 29.3001, conversionPath: ['therms -> kwh'] });
      }
    }

    return fail(new ValidationError(`Unsupported unit conversion from '${fromUnit}' to '${toUnit}'`));
  }

  /**
   * Performs carbon calculation using database factors, localized fallbacks, and uncertainty interval boundaries.
   */
  public calculate(params: {
    category: CarbonCategory;
    subCategory: string;
    amount: number;
    unit: string;
    country?: string;
  }): Result<CarbonCalculationResult> {
    // 1. Zod input validation
    const validationResult = calculateSchema.safeParse(params);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map(e => e.message).join(', ');
      return fail(new ValidationError(errorMsg));
    }

    const { category, subCategory, amount, unit, country } = validationResult.data;

    // 2. Query factors matching category and subCategory
    const matchingFactors = this.factors.filter(
      (f) => f.category === category && f.subCategory.toLowerCase() === subCategory.toLowerCase()
    );

    if (matchingFactors.length === 0) {
      return fail(new NotFoundError(`No emission factor registered for category: '${category}', subCategory: '${subCategory}'`));
    }

    // 3. Selection reasoning matching country codes
    let selectedFactor: EmissionFactor | undefined;
    let fallbackUsed = false;
    let countryOverrideApplied = false;
    let selectionReasonText = '';

    if (country) {
      const normCountry = country.toUpperCase().trim();
      selectedFactor = matchingFactors.find((f) => f.country?.toUpperCase() === normCountry);

      if (selectedFactor) {
        countryOverrideApplied = true;
        selectionReasonText = `Country-specific electricity factor available for ${normCountry}`;
      } else {
        // Look for default fallback
        selectedFactor = matchingFactors.find((f) => f.country === 'default' || !f.country);
        if (selectedFactor) {
          fallbackUsed = true;
          selectionReasonText = `Country-specific override not found for ${normCountry}. Default fallback used.`;
        }
      }
    } else {
      // Find standard global factor
      selectedFactor = matchingFactors.find((f) => f.country === 'default' || !f.country);
      if (selectedFactor) {
        selectionReasonText = 'Standard global factor used.';
      }
    }

    // If still no factor selected, grab the first available matching factor as ultimate fallback
    if (!selectedFactor) {
      selectedFactor = matchingFactors[0];
      fallbackUsed = true;
      selectionReasonText = `Generic fallback factor selected: '${selectedFactor.id}'`;
    }

    // Check expiration validation (validFrom / validTo)
    const now = new Date();
    const validFrom = new Date(selectedFactor.validFrom);
    if (now < validFrom) {
      return fail(new ValidationError(`Emission factor '${selectedFactor.id}' is not yet valid.`));
    }
    if (selectedFactor.validTo) {
      const validTo = new Date(selectedFactor.validTo);
      if (now > validTo) {
        return fail(new ValidationError(`Emission factor '${selectedFactor.id}' has expired.`));
      }
    }

    // 4. Unit conversion
    const conversionResult = this.convertUnit(amount, unit, selectedFactor.unit);
    if (!conversionResult.success) {
      return fail(conversionResult.error);
    }

    const { convertedValue, conversionPath } = conversionResult.value;
    const unitConversionApplied = conversionPath.length > 0;

    // 5. Calculate carbon emissions (kg CO2e)
    const calculatedValue = convertedValue * selectedFactor.value;

    // 6. Uncertainty range bounding
    const uncertaintyFraction = selectedFactor.uncertaintyPercent / 100;
    const lowerBound = calculatedValue * (1 - uncertaintyFraction);
    const upperBound = calculatedValue * (1 + uncertaintyFraction);

    const methodology = getMethodologyMetadata();

    const selectionReason: FactorSelectionReason = {
      factorId: selectedFactor.id,
      reason: selectionReasonText,
      fallbackUsed,
      countryOverrideApplied,
    };

    const audit: CalculationAudit = {
      emissionFactorId: selectedFactor.id,
      sourceIdentifier: selectedFactor.source,
      methodologyVersion: methodology.id,
      unitConversionApplied,
      conversionPath,
      selectionReason,
      timestamp: now.toISOString(),
    };

    return ok({
      value: parseFloat(calculatedValue.toFixed(4)),
      confidenceScore: selectedFactor.confidence,
      lowerBound: parseFloat(lowerBound.toFixed(4)),
      upperBound: parseFloat(upperBound.toFixed(4)),
      methodologyVersion: methodology.id,
      sourceIdentifier: selectedFactor.source,
      audit,
    });
  }

  /**
   * Computes average daily emissions over the last 7 days of entries.
   */
  public getWeeklyAverage(entries: CarbonEntry[]): Result<number> {
    if (entries.length === 0) {
      return ok(0);
    }
    const total = entries.reduce((sum, e) => sum + e.amountKg, 0);
    return ok(parseFloat((total / 7).toFixed(4)));
  }

  /**
   * Computes the daily total emissions in kg CO2e for a specific date.
   */
  public getDailyTotal(entries: CarbonEntry[], date: Date): Result<number> {
    const targetDateStr = date.toISOString().split('T')[0];
    const total = entries
      .filter((e) => {
        const d = new Date(e.loggedAt);
        return d.toISOString().split('T')[0] === targetDateStr;
      })
      .reduce((sum, e) => sum + e.amountKg, 0);
    return ok(parseFloat(total.toFixed(4)));
  }

  /**
   * Summarizes carbon totals broken down by primary categories.
   */
  public getCategoryBreakdown(entries: CarbonEntry[]): Result<Record<CarbonCategory, number>> {
    const breakdown: Record<CarbonCategory, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    };

    for (const e of entries) {
      if (breakdown[e.category] !== undefined) {
        breakdown[e.category] += e.amountKg;
      }
    }

    // Round values
    for (const cat of Object.keys(breakdown) as CarbonCategory[]) {
      breakdown[cat] = parseFloat(breakdown[cat].toFixed(4));
    }

    return ok(breakdown);
  }

  /**
   * Scores the user's daily impact from 0-100 compared to global thresholds.
   * Target: 3kg/day, Global avg: 12kg/day.
   */
  public getFootprintScore(dailyKg: number): Result<{
    score: number;
    rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  }> {
    if (dailyKg < 0) {
      return fail(new ValidationError('Daily kg cannot be negative'));
    }

    // Score computation: 100 if dailyKg <= 3 (Target). 0 if dailyKg >= 15.
    // Linear interpolation in between: score = 100 - ((dailyKg - 3) / 12) * 100
    let score = 100;
    if (dailyKg > 3) {
      score = 100 - ((dailyKg - 3) / 12) * 100;
    }
    score = Math.max(0, Math.min(100, score));
    score = Math.round(score);

    let rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
    if (dailyKg <= 3) {
      rating = 'excellent'; // Paris Agreement targets
    } else if (dailyKg <= 6) {
      rating = 'good';
    } else if (dailyKg <= 9) {
      rating = 'average';
    } else if (dailyKg <= 12) {
      rating = 'poor';
    } else {
      rating = 'critical'; // Exceeds global average
    }

    return ok({ score, rating });
  }
}
export default CarbonScienceEngine;

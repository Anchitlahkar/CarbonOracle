import { describe, test, expect } from 'vitest';
import { CarbonScienceEngine } from '../src/index';
import { CarbonEntry } from '@carbonsense/shared-types';

describe('CarbonScienceEngine Calculations', () => {
  const engine = new CarbonScienceEngine();

  // Test 1: Valid Factor (Standard global factor / base)
  test('calculates correct value for a valid transport petrol factor', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'car_petrol',
      amount: 100,
      unit: 'km',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe(21.0);
      expect(result.value.confidenceScore).toBe(0.93);
      expect(result.value.sourceIdentifier).toBe('DEFRA_2023');
      expect(result.value.lowerBound).toBeCloseTo(19.32);
      expect(result.value.upperBound).toBeCloseTo(22.68);
      expect(result.value.audit.emissionFactorId).toBe('transport.car_petrol.km');
      expect(result.value.audit.selectionReason.fallbackUsed).toBe(false);
      expect(result.value.audit.selectionReason.countryOverrideApplied).toBe(false);
    }
  });

  // Test 2: Missing Factor
  test('fails gracefully when category/subCategory is missing', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'hovercraft_future',
      amount: 100,
      unit: 'km',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('No emission factor registered');
    }
  });

  // Test 3: Validation Limits (Zero amount)
  test('fails validation when amount is zero', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'car_petrol',
      amount: 0,
      unit: 'km',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('amount must be greater than zero');
    }
  });

  // Test 4: Validation Limits (Negative amount)
  test('fails validation when amount is negative', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'car_petrol',
      amount: -10,
      unit: 'km',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('amount must be greater than zero');
    }
  });

  // Test 5: Validation Limits (Invalid category)
  test('fails validation when category is invalid', () => {
    const result = engine.calculate({
      category: 'invalid_category' as any,
      subCategory: 'car_petrol',
      amount: 100,
      unit: 'km',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Invalid category');
    }
  });

  // Test 6: Country Overrides (India)
  test('applies country specific factor for India (IN)', () => {
    const result = engine.calculate({
      category: 'energy',
      subCategory: 'electricity',
      amount: 100,
      unit: 'kwh',
      country: 'IN',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe(82.0); // 100 * 0.82
      expect(result.value.audit.selectionReason.countryOverrideApplied).toBe(true);
      expect(result.value.audit.selectionReason.fallbackUsed).toBe(false);
      expect(result.value.audit.selectionReason.factorId).toBe('energy.electricity_in.kwh');
    }
  });

  // Test 7: Country Overrides (USA)
  test('applies country specific factor for USA (US)', () => {
    const result = engine.calculate({
      category: 'energy',
      subCategory: 'electricity',
      amount: 100,
      unit: 'kwh',
      country: 'US',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe(38.0); // 100 * 0.38
      expect(result.value.audit.selectionReason.countryOverrideApplied).toBe(true);
      expect(result.value.audit.selectionReason.fallbackUsed).toBe(false);
      expect(result.value.audit.selectionReason.factorId).toBe('energy.electricity_us.kwh');
    }
  });

  // Test 8: Country Overrides (France)
  test('applies country specific factor for France (FR)', () => {
    const result = engine.calculate({
      category: 'energy',
      subCategory: 'electricity',
      amount: 100,
      unit: 'kwh',
      country: 'FR',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe(5.0); // 100 * 0.05
      expect(result.value.audit.selectionReason.countryOverrideApplied).toBe(true);
      expect(result.value.audit.selectionReason.factorId).toBe('energy.electricity_fr.kwh');
    }
  });

  // Test 9: Country Override Fallback (Default fallback country used when specific country missing)
  test('falls back to default electricity coefficient when custom country has no override', () => {
    const result = engine.calculate({
      category: 'energy',
      subCategory: 'electricity',
      amount: 100,
      unit: 'kwh',
      country: 'JP', // Japan has no custom override
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe(47.0); // 100 * 0.47 (electricity_default)
      expect(result.value.audit.selectionReason.countryOverrideApplied).toBe(false);
      expect(result.value.audit.selectionReason.fallbackUsed).toBe(true);
      expect(result.value.audit.selectionReason.factorId).toBe('energy.electricity_default.kwh');
    }
  });

  // Test 10: Unit Conversion (Distance miles -> km)
  test('converts distance unit miles to base km correctly', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'car_petrol',
      amount: 100,
      unit: 'miles',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // 100 miles = 160.9344 km. 160.9344 km * 0.21 = 33.7962
      expect(result.value.value).toBeCloseTo(33.7962);
      expect(result.value.audit.unitConversionApplied).toBe(true);
      expect(result.value.audit.conversionPath).toContain('miles -> km');
    }
  });

  // Test 11: Unit Conversion (Mass lbs -> kg)
  test('converts mass unit lbs to base kg correctly', () => {
    const result = engine.calculate({
      category: 'food',
      subCategory: 'beef',
      amount: 10,
      unit: 'lbs',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // 10 lbs = 4.5359237 kg. 4.5359237 * 27.0 = 122.4699
      expect(result.value.value).toBeCloseTo(122.4699);
      expect(result.value.audit.unitConversionApplied).toBe(true);
      expect(result.value.audit.conversionPath).toContain('lbs -> kg');
    }
  });

  // Test 12: Unit Conversion (Mass oz -> kg)
  test('converts mass unit oz to base kg correctly', () => {
    const result = engine.calculate({
      category: 'food',
      subCategory: 'beef',
      amount: 100,
      unit: 'oz',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // 100 oz = 2.834952 kg. 2.834952 * 27.0 = 76.5437
      expect(result.value.value).toBeCloseTo(76.5437);
      expect(result.value.audit.unitConversionApplied).toBe(true);
      expect(result.value.audit.conversionPath).toContain('oz -> kg');
    }
  });

  // Test 13: Unit Conversion (Volume gallons -> liters)
  test('converts volume unit gallons to base liters correctly', () => {
    const result = engine.calculate({
      category: 'food',
      subCategory: 'dairy',
      amount: 5,
      unit: 'gallons',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // 5 gallons = 18.92705 liters. 18.92705 * 3.2 = 60.5666
      expect(result.value.value).toBeCloseTo(60.5666);
      expect(result.value.audit.unitConversionApplied).toBe(true);
      expect(result.value.audit.conversionPath).toContain('gallons -> liters');
    }
  });

  // Test 14: Unit Conversion (Energy therms -> kwh)
  test('converts energy unit therms to base kwh correctly', () => {
    const result = engine.calculate({
      category: 'energy',
      subCategory: 'electricity',
      amount: 2,
      unit: 'therms',
      country: 'US',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // 2 therms = 58.6002 kwh. 58.6002 * 0.38 (US electricity) = 22.2681
      expect(result.value.value).toBeCloseTo(22.2681);
      expect(result.value.audit.unitConversionApplied).toBe(true);
      expect(result.value.audit.conversionPath).toContain('therms -> kwh');
    }
  });

  // Test 15: Unit Conversion Failure
  test('fails calculation when converting incompatible units', () => {
    const result = engine.calculate({
      category: 'food',
      subCategory: 'beef',
      amount: 10,
      unit: 'miles', // beef in miles makes no sense
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Unsupported unit conversion');
    }
  });

  // Test 16: Calculation Audit checks
  test('audit parameters contain correct scientific details', () => {
    const result = engine.calculate({
      category: 'shopping',
      subCategory: 'electronics_laptop',
      amount: 1,
      unit: 'item',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.value;
      expect(data.methodologyVersion).toBe('CS-METHODOLOGY-V1.0.0');
      expect(data.sourceIdentifier).toBe('DEFRA_2023');
      expect(data.audit.emissionFactorId).toBe('shopping.electronics_laptop.item');
      expect(data.audit.timestamp).toBeDefined();
    }
  });

  // Test 17: Footprint score rating metrics (Excellent)
  test('calculates correct rating for excellent footprint', () => {
    const result = engine.getFootprintScore(2.5);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.rating).toBe('excellent');
      expect(result.value.score).toBe(100);
    }
  });

  // Test 18: Footprint score rating metrics (Critical)
  test('calculates correct rating for critical footprint', () => {
    const result = engine.getFootprintScore(20.0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.rating).toBe('critical');
      expect(result.value.score).toBe(0);
    }
  });

  // Test 19: Footprint score rating negative input validation
  test('fails score calculation for negative input values', () => {
    const result = engine.getFootprintScore(-5.0);
    expect(result.success).toBe(false);
  });

  // Test 20: Aggregated breakdown calculation
  test('calculates category breakdown totals correctly', () => {
    const mockEntries: CarbonEntry[] = [
      {
        id: '1',
        userId: 'u1',
        category: 'transport',
        subCategory: 'car',
        amountKg: 15.5,
        source: 'manual',
        metadata: null,
        loggedAt: new Date(),
      },
      {
        id: '2',
        userId: 'u1',
        category: 'food',
        subCategory: 'beef',
        amountKg: 27.0,
        source: 'manual',
        metadata: null,
        loggedAt: new Date(),
      },
      {
        id: '3',
        userId: 'u1',
        category: 'transport',
        subCategory: 'bus',
        amountKg: 4.5,
        source: 'manual',
        metadata: null,
        loggedAt: new Date(),
      },
    ];

    const result = engine.getCategoryBreakdown(mockEntries);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.transport).toBe(20.0); // 15.5 + 4.5
      expect(result.value.food).toBe(27.0);
      expect(result.value.energy).toBe(0);
      expect(result.value.shopping).toBe(0);
    }
  });

  // Test 21: Daily total calculations
  test('calculates daily totals correctly filtered by target date', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mockEntries: CarbonEntry[] = [
      {
        id: '1',
        userId: 'u1',
        category: 'transport',
        subCategory: 'car',
        amountKg: 10.0,
        source: 'manual',
        metadata: null,
        loggedAt: today,
      },
      {
        id: '2',
        userId: 'u1',
        category: 'food',
        subCategory: 'beef',
        amountKg: 20.0,
        source: 'manual',
        metadata: null,
        loggedAt: yesterday,
      },
    ];

    const resultToday = engine.getDailyTotal(mockEntries, today);
    expect(resultToday.success).toBe(true);
    if (resultToday.success) {
      expect(resultToday.value).toBe(10.0);
    }

    const resultYesterday = engine.getDailyTotal(mockEntries, yesterday);
    expect(resultYesterday.success).toBe(true);
    if (resultYesterday.success) {
      expect(resultYesterday.value).toBe(20.0);
    }
  });

  // Test 22: Weekly average calculation
  test('calculates 7-day average correctly', () => {
    const mockEntries: CarbonEntry[] = [
      {
        id: '1',
        userId: 'u1',
        category: 'transport',
        subCategory: 'car',
        amountKg: 70.0,
        source: 'manual',
        metadata: null,
        loggedAt: new Date(),
      },
    ];

    const result = engine.getWeeklyAverage(mockEntries);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(10.0); // 70 / 7
    }
  });

  // Test 23: Expired Factor Validation
  test('rejects expired emission factors', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'car_expired',
      amount: 10,
      unit: 'km',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('has expired');
    }
  });

  // Test 24: Future Factor Validation
  test('rejects future emission factors not yet valid', () => {
    const result = engine.calculate({
      category: 'transport',
      subCategory: 'car_future',
      amount: 10,
      unit: 'km',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('is not yet valid');
    }
  });

  // Test 25: Weekly average for empty entries
  test('returns 0 average for empty entries list', () => {
    const result = engine.getWeeklyAverage([]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(0);
    }
  });

  // Test 26: Rating ranges check (good, average, poor)
  test('assigns correct rating labels to intermediate daily footprint amounts', () => {
    const goodScore = engine.getFootprintScore(5.0);
    expect(goodScore.success).toBe(true);
    if (goodScore.success) {
      expect(goodScore.value.rating).toBe('good');
    }

    const avgScore = engine.getFootprintScore(8.0);
    expect(avgScore.success).toBe(true);
    if (avgScore.success) {
      expect(avgScore.value.rating).toBe('average');
    }

    const poorScore = engine.getFootprintScore(11.0);
    expect(poorScore.success).toBe(true);
    if (poorScore.success) {
      expect(poorScore.value.rating).toBe('poor');
    }
  });

  // Test 27: Scientific reference database getters
  test('resolves details for registered scientific references and factors list', () => {
    const { getReferenceById, getAllFactors } = require('@carbonsense/knowledge-base');
    const ref = getReferenceById('DEFRA_2023');
    expect(ref).toBeDefined();
    expect(ref.organization).toContain('DEFRA');

    const all = getAllFactors();
    expect(all.length).toBeGreaterThan(0);
  });

  // Test 28: Methodology metadata schema check
  test('loads current versioned methodology definitions correctly', () => {
    const { getMethodologyMetadata } = require('@carbonsense/knowledge-base');
    const method = getMethodologyMetadata();
    expect(method.id).toBe('CS-METHODOLOGY-V1.0.0');
    expect(method.assumptions.length).toBeGreaterThan(0);
  });
});

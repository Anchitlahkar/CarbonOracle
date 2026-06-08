import { describe, test, expect } from 'vitest';
import { 
  ForecastEngine,
  BaselineForecaster,
  TrendForecaster,
  MomentumForecaster,
  ScenarioForecaster,
  RiskDriverAnalyzer,
  CounterfactualForecaster,
  ForecastAggregator 
} from '../src/index';
import { 
  BehaviorProfile, 
  BehaviorFeatureVector, 
  BehaviorSignal, 
  BehaviorTrend 
} from '@carbonsense/shared-types';

describe('Forecast Engine Suite', () => {
  const engine = new ForecastEngine();
  const userId = 'user-researcher-2';

  // HELPER to create mock BehaviorFeatureVector
  const makeMockVector = (mean: number, stdDev: number, trans = 0.25, food = 0.25, energy = 0.25, shop = 0.25): BehaviorFeatureVector => ({
    userId,
    dailyEmissionsMean: mean,
    dailyEmissionsStdDev: stdDev,
    transportRatio: trans,
    foodRatio: food,
    energyRatio: energy,
    shoppingRatio: shop,
    weeklyBeefCount: 0,
    monthlyFlightCount: 0,
    weekendMultiplier: 1.0,
  });

  // HELPER to create mock BehaviorProfile
  const makeMockProfile = (vector: BehaviorFeatureVector, riskScore = 40, signals: BehaviorSignal[] = [], trends: BehaviorTrend[] = []): BehaviorProfile => ({
    userId,
    signals,
    trends,
    classification: 'Balanced',
    riskScore,
    featureVector: vector,
    generatedAt: new Date(),
  });

  // ==========================================
  // BaselineForecaster Tests (Tests 1-6)
  // ==========================================
  describe('BaselineForecaster', () => {
    const forecaster = new BaselineForecaster();

    test('1. Projects flat baseline mean', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, 30, 0.91);
      expect(proj.horizonDays).toBe(30);
      expect(proj.snapshots.length).toBe(30);
      expect(proj.snapshots[0].projectedEmission).toBe(10.0);
      expect(proj.snapshots[29].projectedEmission).toBe(10.0);
    });

    test('2. Expands uncertainty bounds over time', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, 30, 0.91);
      const day1Delta = proj.snapshots[0].upperBound - proj.snapshots[0].lowerBound;
      const day30Delta = proj.snapshots[29].upperBound - proj.snapshots[29].lowerBound;
      expect(day30Delta).toBeGreaterThan(day1Delta);
    });

    test('3. Floors lowerBound at 0.0', () => {
      const vec = makeMockVector(2.0, 5.0); // high standard deviation
      const proj = forecaster.project(vec, 30, 0.91);
      expect(proj.snapshots[29].lowerBound).toBe(0.0);
    });

    test('4. Correctly assigns confidence parameters', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, 30, 0.91);
      expect(proj.confidence).toBe(0.91);
    });

    test('5. Outputs baseline reasoning factors', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, 30, 0.91);
      expect(proj.reasoning.factors.length).toBeGreaterThan(0);
    });

    test('6. Outputs baseline assumptions list', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, 30, 0.91);
      expect(proj.reasoning.assumptions.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // TrendForecaster Tests (Tests 7-12)
  // ==========================================
  describe('TrendForecaster', () => {
    const forecaster = new TrendForecaster();

    test('7. Projects increasing trend multipliers', () => {
      const vec = makeMockVector(10.0, 2.0);
      const mockIncreasingTrend = [
        { id: 't1', trendType: 'total_emissions', direction: 'Increasing' as const, changePercent: 30, confidence: 0.9, timeWindow: '30d' as const, generatedAt: new Date() }
      ];
      const proj = forecaster.project(vec, mockIncreasingTrend, 30, 0.91);
      expect(proj.snapshots[0].projectedEmission).toBeGreaterThan(10.0);
      expect(proj.snapshots[29].projectedEmission).toBeCloseTo(13.0); // 10 * (1 + 0.3 * 1)
    });

    test('8. Projects decreasing trend multipliers', () => {
      const vec = makeMockVector(10.0, 2.0);
      const mockDecreasingTrend = [
        { id: 't1', trendType: 'total_emissions', direction: 'Decreasing' as const, changePercent: -50, confidence: 0.9, timeWindow: '30d' as const, generatedAt: new Date() }
      ];
      const proj = forecaster.project(vec, mockDecreasingTrend, 30, 0.91);
      expect(proj.snapshots[29].projectedEmission).toBeCloseTo(5.0); // 10 * (1 - 0.5 * 1)
    });

    test('9. Handles stable/missing trends correctly as baseline', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, [], 30, 0.91);
      expect(proj.snapshots[29].projectedEmission).toBe(10.0);
    });

    test('10. Expands bounds in trend forecasts', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, [], 30, 0.91);
      expect(proj.snapshots[29].upperBound).toBeGreaterThan(proj.snapshots[29].projectedEmission);
    });

    test('11. Outputs trend assumptions list', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, [], 30, 0.91);
      expect(proj.reasoning.assumptions.length).toBeGreaterThan(0);
    });

    test('12. Floors lowerBound at 0.0 under decreasing trends', () => {
      const vec = makeMockVector(1.0, 0.1);
      const mockDecreasingTrend = [
        { id: 't1', trendType: 'total_emissions', direction: 'Decreasing' as const, changePercent: -150, confidence: 0.9, timeWindow: '30d' as const, generatedAt: new Date() }
      ];
      const proj = forecaster.project(vec, mockDecreasingTrend, 30, 0.91);
      expect(proj.snapshots[29].projectedEmission).toBe(0.0);
      expect(proj.snapshots[29].lowerBound).toBe(0.0);
    });
  });

  // ==========================================
  // MomentumForecaster Tests (Tests 13-18)
  // ==========================================
  describe('MomentumForecaster', () => {
    const forecaster = new MomentumForecaster();

    test('13. Computes wider bounds for volatile/chaotic users', () => {
      const vecStable = makeMockVector(10.0, 1.0); // stdDev = 1.0
      const vecVolatile = makeMockVector(10.0, 5.0); // stdDev = 5.0

      const projStable = forecaster.project(vecStable, [], 10, 30, 0.91);
      const projVolatile = forecaster.project(vecVolatile, [], 90, 30, 0.91); // high risk = 90

      const rangeStable = projStable.snapshots[29].upperBound - projStable.snapshots[29].lowerBound;
      const rangeVolatile = projVolatile.snapshots[29].upperBound - projVolatile.snapshots[29].lowerBound;
      // High standard deviation and risk penalty expands bounds much faster
      expect(rangeVolatile).toBeGreaterThan(rangeStable);
    });

    test('14. Speeds up confidence decay for volatile/chaotic users', () => {
      const vecStable = makeMockVector(10.0, 1.0);
      const vecVolatile = makeMockVector(10.0, 5.0);

      const projStable = forecaster.project(vecStable, [], 10, 30, 0.91);
      const projVolatile = forecaster.project(vecVolatile, [], 90, 30, 0.91);

      expect(projStable.confidence).toBeGreaterThan(projVolatile.confidence);
    });

    test('15. Integrates change percent trends under momentum', () => {
      const vec = makeMockVector(10.0, 2.0);
      const mockIncreasingTrend = [
        { id: 't1', trendType: 'total_emissions', direction: 'Increasing' as const, changePercent: 30, confidence: 0.9, timeWindow: '30d' as const, generatedAt: new Date() }
      ];
      const proj = forecaster.project(vec, mockIncreasingTrend, 20, 30, 0.91);
      expect(proj.snapshots[29].projectedEmission).toBeCloseTo(13.0);
    });

    test('16. Floors lowerBound at 0.0 under high momentum volatility', () => {
      const vec = makeMockVector(2.0, 5.0);
      const proj = forecaster.project(vec, [], 80, 30, 0.91);
      expect(proj.snapshots[29].lowerBound).toBe(0.0);
    });

    test('17. Outputs momentum reasoning factors', () => {
      const vec = makeMockVector(10.0, 2.0);
      const proj = forecaster.project(vec, [], 40, 30, 0.91);
      expect(proj.reasoning.factors.length).toBeGreaterThan(0);
    });

    test('18. Floors final confidence decay limit', () => {
      const vec = makeMockVector(10.0, 10.0);
      const proj = forecaster.project(vec, [], 100, 365, 0.10);
      expect(proj.confidence).toBeGreaterThanOrEqual(0.05); // Floors above 0
    });
  });

  // ==========================================
  // ScenarioForecaster Tests (Tests 19-24)
  // ==========================================
  describe('ScenarioForecaster', () => {
    const forecaster = new ScenarioForecaster();

    test('19. Loads definitions and models alternative futures', () => {
      const vec = makeMockVector(10.0, 2.0, 0.40, 0.20, 0.20, 0.20);
      const results = forecaster.projectScenarios(vec, 30, 0.91);
      expect(results.length).toBe(4);
    });

    test('20. Calculates reduceBeef50 scenario savings correctly', () => {
      const vec = makeMockVector(10.0, 2.0);
      vec.weeklyBeefCount = 7; // 7 servings = 47.25 kg CO2e / week = 6.75 kg CO2e / day
      const results = forecaster.projectScenarios(vec, 30, 0.91);
      const beefScenario = results.find((r) => r.scenarioName === 'reduceBeef50');
      expect(beefScenario).toBeDefined();
      expect(beefScenario?.reductionPercent).toBeCloseTo(33.8); // (6.75 * 0.5) / 10.0 * 100
    });

    test('21. Calculates greenTransit scenario savings correctly', () => {
      const vec = makeMockVector(10.0, 2.0, 0.50, 0.20, 0.10, 0.20); // 50% transport
      const results = forecaster.projectScenarios(vec, 30, 0.91);
      const transitScenario = results.find((r) => r.scenarioName === 'greenTransit');
      expect(transitScenario).toBeDefined();
      expect(transitScenario?.reductionPercent).toBeCloseTo(30.0); // 50% transport * 60% reduction = 30% total
    });

    test('22. Calculates clampShopping scenario savings correctly', () => {
      const vec = makeMockVector(10.0, 2.0, 0.20, 0.20, 0.20, 0.40); // 40% shopping
      const results = forecaster.projectScenarios(vec, 30, 0.91);
      const shopScenario = results.find((r) => r.scenarioName === 'clampShopping');
      expect(shopScenario).toBeDefined();
      expect(shopScenario?.reductionPercent).toBeCloseTo(16.0); // 40% shopping * 40% reduction = 16% total
    });

    test('23. Calculates energyEfficiency scenario savings correctly', () => {
      const vec = makeMockVector(10.0, 2.0, 0.20, 0.20, 0.50, 0.10); // 50% energy
      const results = forecaster.projectScenarios(vec, 30, 0.91);
      const energyScenario = results.find((r) => r.scenarioName === 'energyEfficiency');
      expect(energyScenario).toBeDefined();
      expect(energyScenario?.reductionPercent).toBeCloseTo(10.0); // 50% energy * 20% reduction = 10% total
    });

    test('24. Clamps daily reduction amount to not exceed daily mean', () => {
      const vec = makeMockVector(2.0, 0.5, 0.90, 0.05, 0.05, 0.0); // 90% transport, dailyMean = 2.0
      // greenTransit: 90% * 60% = 54% reduction.
      const results = forecaster.projectScenarios(vec, 30, 0.91);
      const transitScenario = results.find((r) => r.scenarioName === 'greenTransit');
      expect(transitScenario?.projectedEmissions.snapshots[0].projectedEmission).toBeCloseTo(2.0 * 0.46);
    });
  });

  // ==========================================
  // RiskDriverAnalyzer Tests (Tests 25-28)
  // ==========================================
  describe('RiskDriverAnalyzer', () => {
    const analyzer = new RiskDriverAnalyzer();

    test('25. Identifies dominant risk drivers and contribution sorting', () => {
      const vec = makeMockVector(10.0, 2.0, 0.60, 0.20, 0.10, 0.10); // 60% transport
      const drivers = analyzer.analyze(vec, []);
      expect(drivers.length).toBe(4);
      expect(drivers[0].driver).toBe('Transport & Commutes');
      expect(drivers[0].contribution).toBe(60);
    });

    test('26. Labels transport driver as Personal Vehicle Commutes when car dependency signal active', () => {
      const vec = makeMockVector(10.0, 2.0, 0.60, 0.20, 0.10, 0.10);
      const mockCarSignal = [
        { id: 's1', type: 'HighCarDependency', description: '', strength: 0.8, confidence: 0.9, reasoning: '', evidence: null as any, detectedAt: new Date() }
      ];
      const drivers = analyzer.analyze(vec, mockCarSignal);
      expect(drivers[0].driver).toBe('Personal Vehicle & Air Travel');
    });

    test('27. Labels food driver as High-Impact Beef Diet when beef signal active', () => {
      const vec = makeMockVector(10.0, 2.0, 0.20, 0.60, 0.10, 0.10);
      const mockBeefSignal = [
        { id: 's1', type: 'FrequentBeefConsumption', description: '', strength: 0.8, confidence: 0.9, reasoning: '', evidence: null as any, detectedAt: new Date() }
      ];
      const drivers = analyzer.analyze(vec, mockBeefSignal);
      const foodDriver = drivers.find((d) => d.driver === 'High-Impact Beef/Meat Diet');
      expect(foodDriver).toBeDefined();
    });

    test('28. Excludes 0 contribution drivers from list', () => {
      const vec = makeMockVector(10.0, 2.0, 1.0, 0.0, 0.0, 0.0);
      const drivers = analyzer.analyze(vec, []);
      expect(drivers.length).toBe(1);
    });
  });

  // ==========================================
  // CounterfactualForecaster Tests (Tests 29-32)
  // ==========================================
  describe('CounterfactualForecaster', () => {
    const forecaster = new CounterfactualForecaster();

    test('29. Calculates personal transport counterfactual savings', () => {
      const vec = makeMockVector(10.0, 2.0, 0.60, 0.20, 0.10, 0.10); // transport = 60%
      const mockCarSignal = [
        { id: 's1', type: 'HighCarDependency', description: '', strength: 0.8, confidence: 0.9, reasoning: '', evidence: null as any, detectedAt: new Date() }
      ];
      const results = forecaster.analyze(vec, mockCarSignal, []);
      const carCounterfactual = results.find((r) => r.action === 'Personal Vehicle Usage');
      expect(carCounterfactual).toBeDefined();
      expect(carCounterfactual?.alternativeOutcomeKg).toBeCloseTo(10.0 * 0.60 * 365 * 0.40);
    });

    test('30. Calculates beef consumption counterfactual savings', () => {
      const vec = makeMockVector(10.0, 2.0);
      vec.weeklyBeefCount = 7; // 1 serving beef per day = 6.75 kg
      const mockBeefSignal = [
        { id: 's1', type: 'FrequentBeefConsumption', description: '', strength: 1.0, confidence: 0.9, reasoning: '', evidence: null as any, detectedAt: new Date() }
      ];
      const results = forecaster.analyze(vec, mockBeefSignal, []);
      const beefCounterfactual = results.find((r) => r.action === 'Beef Diet Choices');
      expect(beefCounterfactual).toBeDefined();
      expect(beefCounterfactual?.historicalImpactKg).toBeCloseTo(1 * 6.75 * 365);
    });

    test('31. Calculates energy grid counterfactual savings', () => {
      const vec = makeMockVector(10.0, 2.0, 0.20, 0.20, 0.40, 0.20); // 40% energy
      const results = forecaster.analyze(vec, [], []);
      const energyCounterfactual = results.find((r) => r.action === 'Residential Grid Utility Electricity');
      expect(energyCounterfactual).toBeDefined();
      expect(energyCounterfactual?.alternativeOutcomeKg).toBeCloseTo(10.0 * 0.40 * 365 * 0.20);
    });

    test('32. Calculates shopping counterfactual savings', () => {
      const vec = makeMockVector(10.0, 2.0, 0.20, 0.20, 0.20, 0.40); // 40% shopping
      const mockShopSignal = [
        { id: 's1', type: 'ShoppingHeavyBehavior', description: '', strength: 1.0, confidence: 0.9, reasoning: '', evidence: null as any, detectedAt: new Date() }
      ];
      const results = forecaster.analyze(vec, mockShopSignal, []);
      const shopCounterfactual = results.find((r) => r.action === 'Discretionary Shopping Purchases');
      expect(shopCounterfactual).toBeDefined();
      expect(shopCounterfactual?.alternativeOutcomeKg).toBeCloseTo(10.0 * 0.40 * 365 * 0.50);
    });
  });

  // ==========================================
  // ForecastAggregator & Sufficiency Tests (Tests 33-36)
  // ==========================================
  describe('ForecastAggregator & Engine validation', () => {
    test('33. Rejects forecasts with insufficient data (< 7 days)', () => {
      const vec = makeMockVector(10.0, 2.0);
      const profile = makeMockProfile(vec);
      const res = engine.generateForecastProfile({
        userId,
        behaviorProfile: profile,
        historyDaysCount: 5, // Under 7 days
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('Insufficient historical data');
      }
    });

    test('34. Degrades confidence and integrity score for intermediate sufficiency (< 30 days)', () => {
      const vec = makeMockVector(10.0, 2.0);
      const profile = makeMockProfile(vec);
      const res = engine.generateForecastProfile({
        userId,
        behaviorProfile: profile,
        historyDaysCount: 15, // Between 7 and 30 days
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.integrity.score).toBeLessThan(100);
        expect(res.value.baseline['30d'].confidence).toBeLessThan(0.91);
      }
    });

    test('35. Computes high integrity score for sufficient, stable profiles', () => {
      const vec = makeMockVector(10.0, 0.1); // low stdDev
      const profile = makeMockProfile(vec, 10); // low risk
      const res = engine.generateForecastProfile({
        userId,
        behaviorProfile: profile,
        historyDaysCount: 40,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.integrity.score).toBe(100); // stable + low risk + high density
      }
    });

    test('36. Compiles a complete ForecastProfile containing baseline, trend, momentum, scenarios, and counterfactuals', () => {
      const vec = makeMockVector(10.0, 2.0);
      const profile = makeMockProfile(vec);
      const res = engine.generateForecastProfile({
        userId,
        behaviorProfile: profile,
        historyDaysCount: 35,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        const data = res.value;
        expect(data.baseline).toBeDefined();
        expect(data.trendAdjusted).toBeDefined();
        expect(data.momentum).toBeDefined();
        expect(data.scenarios.length).toBeGreaterThan(0);
        expect(data.counterfactuals).toBeDefined();
      }
    });
  });
});

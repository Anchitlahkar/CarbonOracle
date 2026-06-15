import { describe, test, expect } from 'vitest';
import { 
  BehaviorIntelligenceEngine,
  PatternDetector,
  TrendAnalyzer,
  RiskScorer,
  BehaviorClassifier,
  BehaviorAggregator 
} from '../src/index';
import { CarbonEntry, BehaviorFeatureVector } from '@carbonsense/shared-types';

describe('Behavior Intelligence Engine Suite', () => {
  const engine = new BehaviorIntelligenceEngine();
  const userId = 'user-researcher-1';

  // HELPER to create entries
  const makeEntry = (category: string, subCategory: string, amountKg: number, daysAgo: number): CarbonEntry => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
      id: `entry-${Math.random()}`,
      userId,
      category,
      subCategory,
      amountKg,
      source: 'manual',
      metadata: null,
      loggedAt: date,
    };
  };

  // ==========================================
  // PatternDetector Tests (Tests 1-8)
  // ==========================================
  describe('PatternDetector', () => {
    const detector = new PatternDetector();

    test('1. Detects beef signals when threshold exceeded', () => {
      const entries = [
        makeEntry('food', 'beef', 5.0, 1),
        makeEntry('food', 'beef', 5.0, 2),
        makeEntry('food', 'beef', 5.0, 3),
        makeEntry('food', 'beef', 5.0, 4),
        makeEntry('food', 'beef', 5.0, 5),
      ];
      const signals = detector.detect(entries);
      const beefSig = signals.find((s) => s.type === 'FrequentBeefConsumption');
      expect(beefSig).toBeDefined();
      expect(beefSig?.evidence.count).toBe(5);
      expect(beefSig?.evidence.ratio).toBe(1.0); // Only food log was beef
    });

    test('2. Does not detect beef signal when count is below threshold', () => {
      const entries = [
        makeEntry('food', 'beef', 5.0, 1),
        makeEntry('food', 'chicken', 3.0, 2),
      ];
      const signals = detector.detect(entries);
      const beefSig = signals.find((s) => s.type === 'FrequentBeefConsumption');
      expect(beefSig).toBeUndefined();
    });

    test('3. Detects high car dependency when transport ratio exceeds threshold', () => {
      const entries = [
        makeEntry('transport', 'car_petrol', 80.0, 2),
        makeEntry('transport', 'bus', 20.0, 3),
      ];
      const signals = detector.detect(entries);
      const carSig = signals.find((s) => s.type === 'HighCarDependency');
      expect(carSig).toBeDefined();
      expect(carSig?.evidence.ratio).toBe(0.80); // 80 / 100
      expect(carSig?.strength).toBe(0.80);
    });

    test('4. Does not detect car dependency when transport ratio is below threshold', () => {
      const entries = [
        makeEntry('transport', 'car_petrol', 20.0, 2),
        makeEntry('transport', 'train', 80.0, 3),
      ];
      const signals = detector.detect(entries);
      const carSig = signals.find((s) => s.type === 'HighCarDependency');
      expect(carSig).toBeUndefined();
    });

    test('5. Detects weekend emission spikes', () => {
      const today = new Date();
      // Generate entries on weekend vs weekday
      // Sun (0) or Sat (6)
      const entries: CarbonEntry[] = [];
      // Let's force weekend logs
      const sat = new Date();
      while (sat.getDay() !== 6) sat.setDate(sat.getDate() - 1);
      entries.push({
        id: '1', userId, category: 'energy', subCategory: 'electricity', amountKg: 60, source: 'manual', metadata: null, loggedAt: new Date(sat)
      });
      // Force weekday logs
      const mon = new Date(sat.getTime() - 5 * 24 * 60 * 60 * 1000); // Monday
      entries.push({
        id: '2', userId, category: 'energy', subCategory: 'electricity', amountKg: 10, source: 'manual', metadata: null, loggedAt: mon
      });

      const signals = detector.detect(entries);
      const weekendSig = signals.find((s) => s.type === 'WeekendEmissionSpike');
      expect(weekendSig).toBeDefined();
      expect(weekendSig?.evidence.ratio).toBe(6.0); // 60 / 10
    });

    test('6. Detects shopping heavy behavior by emissions ratio', () => {
      const entries = [
        makeEntry('shopping', 'electronics_laptop', 100, 2),
        makeEntry('food', 'vegetarian_meal', 10, 3),
      ];
      const signals = detector.detect(entries);
      const shopSig = signals.find((s) => s.type === 'ShoppingHeavyBehavior');
      expect(shopSig).toBeDefined();
      expect(shopSig?.evidence.ratio).toBeCloseTo(0.909);
    });

    test('7. Detects shopping heavy behavior by frequency', () => {
      const entries = [
        makeEntry('shopping', 'clothing_item', 5.0, 1),
        makeEntry('shopping', 'clothing_item', 5.0, 2),
        makeEntry('shopping', 'clothing_item', 5.0, 3),
      ];
      const signals = detector.detect(entries);
      const shopSig = signals.find((s) => s.type === 'ShoppingHeavyBehavior');
      expect(shopSig).toBeDefined();
      expect(shopSig?.evidence.count).toBe(3);
    });

    test('8. Detects high flight frequency', () => {
      const entries = [
        makeEntry('transport', 'flight_intl', 200, 5),
      ];
      const signals = detector.detect(entries);
      const flightSig = signals.find((s) => s.type === 'HighFlightFrequency');
      expect(flightSig).toBeDefined();
      expect(flightSig?.evidence.count).toBe(1);
    });
  });

  // ==========================================
  // TrendAnalyzer Tests (Tests 9-16)
  // ==========================================
  describe('TrendAnalyzer', () => {
    const analyzer = new TrendAnalyzer();

    test('9. Detects increasing total emissions trend', () => {
      // 30 day window: second half has more emissions than first half
      const entries = [
        makeEntry('energy', 'electricity', 100, 2), // Second half (last 15d)
        makeEntry('energy', 'electricity', 50, 20), // First half (15-30d)
      ];
      const trends = analyzer.analyze(entries);
      const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
      expect(totalTrend).toBeDefined();
      expect(totalTrend?.direction).toBe('Increasing');
      expect(totalTrend?.changePercent).toBe(100.0);
    });

    test('10. Detects decreasing total emissions trend', () => {
      const entries = [
        makeEntry('energy', 'electricity', 20, 2), // Second half
        makeEntry('energy', 'electricity', 80, 20), // First half
      ];
      const trends = analyzer.analyze(entries);
      const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
      expect(totalTrend).toBeDefined();
      expect(totalTrend?.direction).toBe('Decreasing');
      expect(totalTrend?.changePercent).toBe(-75.0);
    });

    test('11. Detects stable total emissions trend', () => {
      const entries = [
        makeEntry('energy', 'electricity', 100, 2), // Second half
        makeEntry('energy', 'electricity', 102, 20), // First half
      ];
      const trends = analyzer.analyze(entries);
      const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
      expect(totalTrend).toBeDefined();
      expect(totalTrend?.direction).toBe('Stable');
      expect(Math.abs(totalTrend!.changePercent)).toBeLessThan(5);
    });

    test('12. Detects category specific trend', () => {
      const entries = [
        makeEntry('food', 'beef', 50, 2),
        makeEntry('food', 'beef', 20, 20),
      ];
      const trends = analyzer.analyze(entries);
      const foodTrend = trends.find((t) => t.trendType === 'category_food' && t.timeWindow === '30d');
      expect(foodTrend).toBeDefined();
      expect(foodTrend?.direction).toBe('Increasing');
    });

    test('13. Computes 7d window trend segment correctly', () => {
      const entries = [
        makeEntry('energy', 'electricity', 50, 1), // Second half (last 3.5d)
        makeEntry('energy', 'electricity', 25, 5), // First half (3.5-7d)
      ];
      const trends = analyzer.analyze(entries);
      const total7d = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '7d');
      expect(total7d).toBeDefined();
      expect(total7d?.direction).toBe('Increasing');
      expect(total7d?.changePercent).toBe(100.0);
    });

    test('14. Computes 90d window trend segment correctly', () => {
      const entries = [
        makeEntry('energy', 'electricity', 10, 10), // Second half (last 45d)
        makeEntry('energy', 'electricity', 100, 60), // First half (45-90d)
      ];
      const trends = analyzer.analyze(entries);
      const total90d = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '90d');
      expect(total90d).toBeDefined();
      expect(total90d?.direction).toBe('Decreasing');
      expect(total90d?.changePercent).toBe(-90.0);
    });

    test('15. Handles first half equal to 0 correctly (100% change)', () => {
      const entries = [
        makeEntry('energy', 'electricity', 50, 2), // Second half
      ];
      const trends = analyzer.analyze(entries);
      const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
      expect(totalTrend?.changePercent).toBe(100.0);
      expect(totalTrend?.direction).toBe('Increasing');
    });

    test('16. Handles empty entries list for trends without crashes', () => {
      const trends = analyzer.analyze([]);
      const totalTrend = trends.find((t) => t.trendType === 'total_emissions' && t.timeWindow === '30d');
      expect(totalTrend?.changePercent).toBe(0);
      expect(totalTrend?.direction).toBe('Stable');
    });
  });

  // ==========================================
  // RiskScorer Tests (Tests 17-21)
  // ==========================================
  describe('RiskScorer', () => {
    const scorer = new RiskScorer();
    const mockVector = (dailyMean: number): BehaviorFeatureVector => ({
      userId,
      dailyEmissionsMean: dailyMean,
      dailyEmissionsStdDev: 2.0,
      transportRatio: 0.25,
      foodRatio: 0.25,
      energyRatio: 0.25,
      shoppingRatio: 0.25,
      weeklyBeefCount: 0,
      monthlyFlightCount: 0,
      weekendMultiplier: 1.0,
    });

    test('17. Scores base risk correctly matching emissions target', () => {
      const vec = mockVector(2.0); // under target 3.0 -> minimum 10 risk
      const res = scorer.score(vec, [], []);
      expect(res.score).toBe(10);
      expect(res.metadata.baseEmissionsRisk).toBe(10);
    });

    test('18. Integrates trend escalation penalty (+15)', () => {
      const vec = mockVector(2.0);
      const mockIncreasingTrend = [
        { id: 't1', trendType: 'total_emissions', direction: 'Increasing' as const, changePercent: 50, confidence: 0.9, timeWindow: '30d' as const, generatedAt: new Date() }
      ];
      const res = scorer.score(vec, [], mockIncreasingTrend);
      expect(res.score).toBe(25); // 10 base + 15 trend penalty
    });

    test('19. Adds signal violation penalties', () => {
      const vec = mockVector(3.0); // 10 base
      const mockSignals = [
        { id: 's1', type: 'HighCarDependency', description: '', strength: 0.8, confidence: 0.9, reasoning: '', evidence: null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence, detectedAt: new Date() }, // 0.8 * 15 = 12
        { id: 's2', type: 'FrequentBeefConsumption', description: '', strength: 1.0, confidence: 0.9, reasoning: '', evidence: null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence, detectedAt: new Date() }, // 1.0 * 10 = 10
      ];
      const res = scorer.score(vec, mockSignals, []);
      expect(res.score).toBe(32); // 10 base + 12 + 10 = 32
    });

    test('20. Caps maximum risk score at 100', () => {
      const vec = mockVector(100.0); // Maximum base risk ~55
      const mockSignals = [
        { id: 's1', type: 'HighCarDependency', description: '', strength: 1.0, confidence: 0.9, reasoning: '', evidence: null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence, detectedAt: new Date() }, // 15
        { id: 's2', type: 'HighFlightFrequency', description: '', strength: 1.0, confidence: 0.9, reasoning: '', evidence: null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence, detectedAt: new Date() }, // 15
        { id: 's3', type: 'FrequentBeefConsumption', description: '', strength: 1.0, confidence: 0.9, reasoning: '', evidence: null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence, detectedAt: new Date() }, // 10
      ];
      const mockIncreasingTrend = [
        { id: 't1', trendType: 'total_emissions', direction: 'Increasing' as const, changePercent: 50, confidence: 0.9, timeWindow: '30d' as const, generatedAt: new Date() }
      ];
      const res = scorer.score(vec, mockSignals, mockIncreasingTrend);
      expect(res.score).toBe(100); // 55 + 15 + 15 + 10 + 15 = 110 capped to 100
    });

    test('21. Provides explicit explanation details', () => {
      const vec = mockVector(6.0); // dailyMean 6.0
      const res = scorer.score(vec, [], []);
      expect(res.metadata.explanation).toContain('Risk score derived from base average emissions');
    });
  });

  // ==========================================
  // BehaviorClassifier Tests (Tests 22-26)
  // ==========================================
  describe('BehaviorClassifier', () => {
    const classifier = new BehaviorClassifier();
    const mockVector = (trans: number, food: number, energy: number, shop: number): BehaviorFeatureVector => ({
      userId,
      dailyEmissionsMean: 5.0,
      dailyEmissionsStdDev: 1.0,
      transportRatio: trans,
      foodRatio: food,
      energyRatio: energy,
      shoppingRatio: shop,
      weeklyBeefCount: 0,
      monthlyFlightCount: 0,
      weekendMultiplier: 1.0,
    });

    test('22. Classifies TransportHeavy correctly', () => {
      const res = classifier.classify(mockVector(0.55, 0.15, 0.15, 0.15));
      expect(res.classification).toBe('TransportHeavy');
      expect(res.reasoning).toContain('Transport emissions dominate');
    });

    test('23. Classifies FoodHeavy correctly', () => {
      const res = classifier.classify(mockVector(0.15, 0.60, 0.15, 0.10));
      expect(res.classification).toBe('FoodHeavy');
    });

    test('24. Classifies EnergyHeavy correctly', () => {
      const res = classifier.classify(mockVector(0.10, 0.10, 0.70, 0.10));
      expect(res.classification).toBe('EnergyHeavy');
    });

    test('25. Classifies ShoppingHeavy correctly', () => {
      const res = classifier.classify(mockVector(0.10, 0.15, 0.15, 0.60));
      expect(res.classification).toBe('ShoppingHeavy');
    });

    test('26. Classifies Balanced correctly', () => {
      const res = classifier.classify(mockVector(0.25, 0.25, 0.25, 0.25));
      expect(res.classification).toBe('Balanced');
      expect(res.reasoning).toContain('Emissions are distributed relatively evenly');
    });

    test('27. Classifies Mixed correctly', () => {
      const res = classifier.classify(mockVector(0.40, 0.40, 0.10, 0.10));
      expect(res.classification).toBe('Mixed');
    });
  });

  // ==========================================
  // BehaviorAggregator & Engine Tests (Tests 28-32)
  // ==========================================
  describe('BehaviorAggregator & Engine Wrapper', () => {
    test('28. Aggregates a complete user BehaviorProfile', () => {
      const entries = [
        makeEntry('transport', 'car_petrol', 100.0, 5),
        makeEntry('food', 'beef', 5.0, 1),
        makeEntry('food', 'beef', 5.0, 2),
        makeEntry('food', 'beef', 5.0, 3),
        makeEntry('food', 'beef', 5.0, 4),
        makeEntry('food', 'beef', 5.0, 5),
      ];

      const res = engine.generateProfile(userId, entries);
      expect(res.success).toBe(true);
      if (res.success) {
        const profile = res.value;
        expect(profile.userId).toBe(userId);
        expect(profile.signals.length).toBeGreaterThan(0);
        expect(profile.trends.length).toBeGreaterThan(0);
        expect(profile.classification).toBeDefined();
        expect(profile.riskScore).toBeGreaterThanOrEqual(10);
        expect(profile.featureVector).toBeDefined();
        expect(profile.featureVector.dailyEmissionsMean).toBeGreaterThan(0);
      }
    });

    test('29. Fails when userId parameter is missing', () => {
      const res = engine.generateProfile('', []);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('UserId cannot be empty');
      }
    });

    test('30. Handles empty entries list cleanly', () => {
      const res = engine.generateProfile(userId, []);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.signals.length).toBe(0);
        expect(res.value.riskScore).toBe(10); // Minimum score
        expect(res.value.featureVector.dailyEmissionsMean).toBe(0);
      }
    });

    test('31. Handles single entry list cleanly', () => {
      const res = engine.generateProfile(userId, [makeEntry('transport', 'car_petrol', 2.0, 0)]);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.featureVector.dailyEmissionsMean).toBeCloseTo(2.0 / 30);
      }
    });

    test('32. Runs on large datasets cleanly', () => {
      const entries: CarbonEntry[] = [];
      for (let i = 0; i < 150; i++) {
        entries.push(makeEntry('food', 'beef', 5.0, i % 30));
        entries.push(makeEntry('transport', 'car_petrol', 15.0, i % 30));
      }

      const res = engine.generateProfile(userId, entries);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.featureVector.weeklyBeefCount).toBeDefined();
      }
    });
  });
});

import { describe, test, expect } from 'vitest';
import {
  OptimizationEngine,
  ReductionEstimator,
  DifficultyEstimator,
  BehaviorResistanceModel,
  ActionRanker,
  OptimizationAggregator,
  OptimizationPlanner
} from '../src/index';
import {
  BehaviorProfile,
  BehaviorFeatureVector,
  BehaviorSignal,
  ForecastProfile,
  ForecastProjection,
  ForecastSnapshot
} from '@carbonsense/shared-types';

describe('Optimization Engine Suite', () => {
  const userId = 'user-opt-99';

  // HELPER to create mock BehaviorFeatureVector
  const makeMockVector = (
    mean: number,
    trans = 0.25,
    food = 0.25,
    energy = 0.25,
    shop = 0.25
  ): BehaviorFeatureVector => ({
    userId,
    dailyEmissionsMean: mean,
    dailyEmissionsStdDev: mean * 0.1,
    transportRatio: trans,
    foodRatio: food,
    energyRatio: energy,
    shoppingRatio: shop,
    weeklyBeefCount: 2,
    monthlyFlightCount: 0,
    weekendMultiplier: 1.0,
  });

  // HELPER to create mock BehaviorProfile
  const makeMockProfile = (
    vector: BehaviorFeatureVector,
    riskScore = 50,
    signals: BehaviorSignal[] = []
  ): BehaviorProfile => ({
    userId,
    signals,
    trends: [],
    classification: 'Balanced',
    riskScore,
    featureVector: vector,
    generatedAt: new Date(),
  });

  // HELPER to create mock ForecastProfile
  const makeMockForecast = (
    mean: number,
    uId = userId
  ): ForecastProfile => {
    const snapshots: ForecastSnapshot[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      projectedEmission: mean,
      lowerBound: mean * 0.8,
      upperBound: mean * 1.2,
    }));

    const projection: ForecastProjection = {
      horizonDays: 30,
      snapshots,
      confidence: 0.9,
      reasoning: { factors: [], assumptions: [], confidenceDrivers: [] },
    };

    return {
      userId: uId,
      baseline: { '30d': projection, '90d': projection, '365d': projection },
      trendAdjusted: { '30d': projection, '90d': projection, '365d': projection },
      momentum: { '30d': projection, '90d': projection, '365d': projection },
      scenarios: [],
      riskDrivers: [],
      counterfactuals: [],
      integrity: { score: 100, reasons: [] },
      generatedAt: new Date(),
    };
  };

  // Mock interventions definitions
  const mockInterventionWithSignal = {
    id: "reduce_beef",
    title: "Reduce Beef Consumption",
    description: "Replace beef meals with plant-based alternatives.",
    category: "food",
    baseSavingsKg: 15.0,
    savingsMultiplier: 0.5,
    applicableSignal: "FrequentBeefConsumption",
    baseDifficulty: 45,
    baseResistance: 50,
    costEstimates: "Free"
  };

  const mockInterventionNoSignal = {
    id: "smart_thermostat",
    title: "Install Smart Thermostat",
    description: "Install a smart thermostat.",
    category: "energy",
    baseSavingsKg: 12.0,
    savingsMultiplier: 0.15,
    applicableSignal: null,
    baseDifficulty: 25,
    baseResistance: 20,
    costEstimates: "$150"
  };

  // ==========================================
  // 1. ReductionEstimator Tests (Tests 1-8)
  // ==========================================
  describe('ReductionEstimator', () => {
    const estimator = new ReductionEstimator();

    test('1. Estimates basic category-based savings correctly when no signal required', () => {
      const vec = makeMockVector(10.0, 0.2, 0.2, 0.4, 0.2); // energy = 40%
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0); // total 30d baseline = 300kg. energy = 120kg.
      // Savings = 120 * 0.15 = 18.0
      const savings = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(savings).toBe(18.0);
    });

    test('2. Scales savings with active signal strength', () => {
      const vec = makeMockVector(10.0, 0.2, 0.4, 0.2, 0.2); // food = 40%
      const signal: BehaviorSignal = {
        id: 'sig-beef',
        type: 'FrequentBeefConsumption',
        description: '',
        strength: 0.8,
        confidence: 0.9,
        reasoning: '',
        evidence: { quantity: 10, count: 5, ratio: 0.5, timeframeDays: 7 },
        detectedAt: new Date(),
      };
      const bp = makeMockProfile(vec, 50, [signal]);
      const fp = makeMockForecast(10.0); // total 300kg, food = 120kg.
      // Savings = 120 * 0.5 * (0.5 + 0.8 * 0.5) = 120 * 0.5 * 0.9 = 54.0
      const savings = estimator.estimate(mockInterventionWithSignal, bp, fp);
      expect(savings).toBe(54.0);
    });

    test('3. Applies minimal savings when required signal is missing', () => {
      const vec = makeMockVector(10.0, 0.2, 0.4, 0.2, 0.2);
      const bp = makeMockProfile(vec, 50, []);
      const fp = makeMockForecast(10.0);
      // Savings fallback: baseSavingsKg * 0.1 = 15.0 * 0.1 = 1.5
      const savings = estimator.estimate(mockInterventionWithSignal, bp, fp);
      expect(savings).toBe(1.5);
    });

    test('4. Limits estimated savings to the category baseline', () => {
      const vec = makeMockVector(1.0, 0.1, 0.1, 0.1, 0.7); // food ratio 10%
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(1.0); // total 30d baseline = 30kg, food = 3kg
      // Fallback is 1.5kg, but let's make a high baseSavings fallback that exceeds 3kg
      const giantIntervention = { ...mockInterventionWithSignal, baseSavingsKg: 50.0 };
      const savings = estimator.estimate(giantIntervention, bp, fp);
      expect(savings).toBeLessThanOrEqual(3.0); // capped
    });

    test('5. Handles zero emissions gracefully', () => {
      const vec = makeMockVector(0.0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(0.0);
      const savings = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(savings).toBe(0);
    });

    test('6. Falls back to behavior profile daily mean if forecast snapshots empty', () => {
      const vec = makeMockVector(10.0, 0.2, 0.2, 0.4, 0.2);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0);
      fp.baseline['30d'].snapshots = []; // empty
      // Savings = (10 * 30) * 0.4 * 0.15 = 300 * 0.4 * 0.15 = 18.0
      const savings = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(savings).toBe(18.0);
    });

    test('7. Handles missing baseline mapping gracefully', () => {
      const vec = makeMockVector(10.0, 0.2, 0.2, 0.4, 0.2);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0);
      delete (fp as any).baseline;
      const savings = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(savings).toBe(18.0);
    });

    test('8. Estimates shopping interventions correctly', () => {
      const shoppingIntervention = {
        id: "reduce_shopping",
        category: "shopping",
        baseSavingsKg: 10,
        savingsMultiplier: 0.3,
        applicableSignal: null
      };
      const vec = makeMockVector(10.0, 0.2, 0.2, 0.2, 0.4); // shopping = 40%
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0);
      const savings = estimator.estimate(shoppingIntervention, bp, fp);
      expect(savings).toBe(36.0); // 300 * 0.4 * 0.3
    });
  });

  // ==========================================
  // 2. DifficultyEstimator Tests (Tests 9-16)
  // ==========================================
  describe('DifficultyEstimator', () => {
    const estimator = new DifficultyEstimator();

    test('9. Returns base difficulty for standard profile', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 0); // 0 risk
      const fp = makeMockForecast(10.0);
      // base = 25, risk = 0, habit = 0, ratio = 25% (<= 40%), so diff = 25
      const diff = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(diff.score).toBe(25);
      expect(diff.level).toBe('easy');
    });

    test('10. Adjusts difficulty score based on profile risk score', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 100); // 100 risk
      const fp = makeMockForecast(10.0);
      // base = 25, riskAdjustment = 15, total = 40
      const diff = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(diff.score).toBe(40);
      expect(diff.level).toBe('medium');
    });

    test('11. Adds difficulty points if matching negative signal exists', () => {
      const vec = makeMockVector(10.0);
      const signal: BehaviorSignal = {
        id: 'sig-beef',
        type: 'FrequentBeefConsumption',
        strength: 0.8,
        confidence: 0.9,
        description: '', reasoning: '', evidence: null as any, detectedAt: new Date(),
      };
      const bp = makeMockProfile(vec, 0, [signal]);
      const fp = makeMockForecast(10.0);
      // base = 45, risk = 0, habit = 0.8 * 10 = 8, ratio = 25%, total = 53
      const diff = estimator.estimate(mockInterventionWithSignal, bp, fp);
      expect(diff.score).toBe(53);
      expect(diff.level).toBe('medium');
    });

    test('12. Adds difficulty points for dominant category consumption (>40%)', () => {
      const vec = makeMockVector(10.0, 0.1, 0.1, 0.7, 0.1); // energy = 70%
      const bp = makeMockProfile(vec, 0);
      const fp = makeMockForecast(10.0);
      // base = 25, risk = 0, habit = 0, ratioAdjustment = 5 (since 70% > 40%), total = 30
      const diff = estimator.estimate(mockInterventionNoSignal, bp, fp);
      expect(diff.score).toBe(30);
    });

    test('13. Caps difficulty score at 100', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 100);
      const fp = makeMockForecast(10.0);
      const hardIntervention = { ...mockInterventionNoSignal, baseDifficulty: 95 };
      const diff = estimator.estimate(hardIntervention, bp, fp);
      expect(diff.score).toBe(100);
      expect(diff.level).toBe('hard');
    });

    test('14. Floors difficulty score at 0', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 0);
      const fp = makeMockForecast(10.0);
      const freeIntervention = { ...mockInterventionNoSignal, baseDifficulty: -20 };
      const diff = estimator.estimate(freeIntervention, bp, fp);
      expect(diff.score).toBe(0);
      expect(diff.level).toBe('easy');
    });

    test('15. Classifies difficulty level >= 70 as hard', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 0);
      const fp = makeMockForecast(10.0);
      const hardIntervention = { ...mockInterventionNoSignal, baseDifficulty: 70 };
      const diff = estimator.estimate(hardIntervention, bp, fp);
      expect(diff.level).toBe('hard');
    });

    test('16. Classifies difficulty level < 40 as easy', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 0);
      const fp = makeMockForecast(10.0);
      const easyIntervention = { ...mockInterventionNoSignal, baseDifficulty: 39 };
      const diff = estimator.estimate(easyIntervention, bp, fp);
      expect(diff.level).toBe('easy');
    });
  });

  // ==========================================
  // 3. BehaviorResistanceModel Tests (Tests 17-24)
  // ==========================================
  describe('BehaviorResistanceModel', () => {
    const model = new BehaviorResistanceModel();

    test('17. Computes basic resistance for profile with no signals', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 40); // riskFactor = 0.4
      const fp = makeMockForecast(10.0);
      // base = 20, riskAdjustment = 0.4 * 15 = 6, habit = 0, total = 26
      const res = model.estimate(mockInterventionNoSignal, bp, fp);
      expect(res.score).toBe(26);
      expect(res.riskFactor).toBe(0.4);
      expect(res.habitStrength).toBe(0);
    });

    test('18. Factors habit strength when matching signal is present', () => {
      const vec = makeMockVector(10.0);
      const signal: BehaviorSignal = {
        id: 'sig-beef',
        type: 'FrequentBeefConsumption',
        strength: 0.6,
        confidence: 0.9,
        description: '', reasoning: '', evidence: null as any, detectedAt: new Date(),
      };
      const bp = makeMockProfile(vec, 40, [signal]); // riskFactor = 0.4
      const fp = makeMockForecast(10.0);
      // base = 50, risk = 6, habit = 0.6 * 25 = 15, total = 71
      const res = model.estimate(mockInterventionWithSignal, bp, fp);
      expect(res.score).toBe(71);
      expect(res.habitStrength).toBe(0.6);
    });

    test('19. Sets habit strength to 0 if signal is missing but required', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 40);
      const fp = makeMockForecast(10.0);
      // base = 50, risk = 6, habit = 0, total = 56
      const res = model.estimate(mockInterventionWithSignal, bp, fp);
      expect(res.score).toBe(56);
      expect(res.habitStrength).toBe(0);
    });

    test('20. Caps resistance score at 100', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 100);
      const fp = makeMockForecast(10.0);
      const extremeIntervention = { ...mockInterventionNoSignal, baseResistance: 95 };
      const res = model.estimate(extremeIntervention, bp, fp);
      expect(res.score).toBe(100);
    });

    test('21. Floors resistance score at 0', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 0);
      const fp = makeMockForecast(10.0);
      const freeIntervention = { ...mockInterventionNoSignal, baseResistance: -30 };
      const res = model.estimate(freeIntervention, bp, fp);
      expect(res.score).toBe(0);
    });

    test('22. Generates reasoning with signal details when active', () => {
      const vec = makeMockVector(10.0);
      const signal: BehaviorSignal = {
        id: 'sig-beef',
        type: 'FrequentBeefConsumption',
        strength: 0.8,
        confidence: 0.9,
        description: '', reasoning: '', evidence: null as any, detectedAt: new Date(),
      };
      const bp = makeMockProfile(vec, 50, [signal]);
      const fp = makeMockForecast(10.0);
      const res = model.estimate(mockInterventionWithSignal, bp, fp);
      expect(res.reasoning).toContain("High resistance");
      expect(res.reasoning).toContain("FrequentBeefConsumption");
      expect(res.reasoning).toContain("0.80");
    });

    test('23. Generates reasoning detailing missing signal behavior', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 50);
      const fp = makeMockForecast(10.0);
      const res = model.estimate(mockInterventionWithSignal, bp, fp);
      expect(res.reasoning).toContain("Low resistance");
      expect(res.reasoning).toContain("FrequentBeefConsumption");
    });

    test('24. Generates general change reasoning when no signal is applicable', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec, 50);
      const fp = makeMockForecast(10.0);
      const res = model.estimate(mockInterventionNoSignal, bp, fp);
      expect(res.reasoning).toContain("Moderate resistance");
      expect(res.reasoning).toContain("general lifestyle improvement");
    });
  });

  // ==========================================
  // 4. ActionRanker Tests (Tests 25-32)
  // ==========================================
  describe('ActionRanker', () => {
    const ranker = new ActionRanker();

    test('25. Ranks multiple candidates by MCDA score descending', () => {
      const candA = {
        id: 'a',
        interventionId: 'i1',
        title: 'A',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 50.0,
        difficultyScore: 50,
        difficultyLevel: 'medium' as const,
        resistanceScore: { score: 50, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };
      const candB = {
        id: 'b',
        interventionId: 'i2',
        title: 'B',
        description: '',
        category: 'transport' as const,
        estimatedSavingsKg: 100.0, // higher savings, should get higher score
        difficultyScore: 20,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 20, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };

      const ranked = ranker.rank([candA, candB]);
      expect(ranked[0].id).toBe('b');
      expect(ranked[1].id).toBe('a');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
    });

    test('26. Employs tie-breaker 1 (higher savings potential)', () => {
      // Create candidates with different savings but identical scores due to different denominators:
      // Candidate A: savings = 10, denominator = 10 => score = 100
      // Candidate B: savings = 20, denominator = 20 => score = 100
      const candA = {
        id: 'a',
        interventionId: 'i1',
        title: 'A',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 10.0,
        difficultyScore: 0,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 0, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };
      const candB = {
        id: 'b',
        interventionId: 'i2',
        title: 'B',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 20.0, // higher savings
        difficultyScore: 25,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 0, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };

      const ranked = ranker.rank([candA, candB]);
      // Both have score = 100, but B has higher savings (20 vs 10), so B ranks first.
      expect(ranked[0].id).toBe('b');
    });

    test('27. Employs tie-breaker 2 (alphabetical sort by title)', () => {
      // Identical savings, difficulty, resistance, but different title
      const candA = {
        id: 'a',
        interventionId: 'i1',
        title: 'Zebra Protection',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 10.0,
        difficultyScore: 10,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 10, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };
      const candB = {
        id: 'b',
        interventionId: 'i2',
        title: 'Apple Orchard',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 10.0,
        difficultyScore: 10,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 10, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };

      const ranked = ranker.rank([candA, candB]);
      expect(ranked[0].title).toBe('Apple Orchard');
      expect(ranked[1].title).toBe('Zebra Protection');
    });

    test('28. Assigns consecutive rank indexes starting at 1', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: `id-${i}`,
        interventionId: `inter-${i}`,
        title: `Title ${i}`,
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 10.0 + i,
        difficultyScore: 20,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 20, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      }));
      const ranked = ranker.rank(items);
      expect(ranked.map(r => r.rank)).toEqual([1, 2, 3, 4, 5]);
    });

    test('29. Handles single candidate ranking correctly', () => {
      const cand = {
        id: 'only',
        interventionId: 'i',
        title: 'Only One',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 10.0,
        difficultyScore: 10,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 10, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };
      const ranked = ranker.rank([cand]);
      expect(ranked.length).toBe(1);
      expect(ranked[0].rank).toBe(1);
    });

    test('30. Handles empty candidates array', () => {
      const ranked = ranker.rank([]);
      expect(ranked.length).toBe(0);
    });

    test('31. Calculates scores matching MCDA specification', () => {
      const cand = {
        id: 'test-mcda',
        interventionId: 'i',
        title: 'Test MCDA',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 50.0,
        difficultyScore: 50,
        difficultyLevel: 'medium' as const,
        resistanceScore: { score: 50, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };
      const ranked = ranker.rank([cand]);
      // denominator = 50 * 0.4 + 50 * 0.6 + 10 = 20 + 30 + 10 = 60
      // score = (50 * 100) / 60 = 5000 / 60 = 83.333
      expect(ranked[0].score).toBe(83.333);
    });

    test('32. Correctly ranks when difficulty and resistance scores are zero', () => {
      const cand = {
        id: 'test-zero',
        interventionId: 'i',
        title: 'Test Zero',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: 10.0,
        difficultyScore: 0,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 0, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
        reasoning: '',
      };
      const ranked = ranker.rank([cand]);
      // denominator = 0 + 0 + 10 = 10
      // score = (10 * 100) / 10 = 100
      expect(ranked[0].score).toBe(100);
    });
  });

  // ==========================================
  // 5. OptimizationAggregator Tests (Tests 33-37)
  // ==========================================
  describe('OptimizationAggregator', () => {
    const aggregator = new OptimizationAggregator();

    test('33. Groups candidates into correct carbon categories', () => {
      const mockCandidate = (cat: 'transport' | 'food' | 'energy' | 'shopping') => ({
        id: `c-${cat}`,
        interventionId: 'i',
        title: '',
        description: '',
        category: cat,
        estimatedSavingsKg: 10.0,
        difficultyScore: 20,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 20, riskFactor: 0.2, habitStrength: 0, reasoning: '' },
        score: 10,
        reasoning: '',
        rank: 1,
      });

      const list = [
        mockCandidate('transport'),
        mockCandidate('food'),
        mockCandidate('energy'),
        mockCandidate('shopping'),
      ];

      const tradeoffs = aggregator.aggregate(list);
      expect(tradeoffs.length).toBe(4);
      expect(tradeoffs.map(t => t.category)).toContain('transport');
      expect(tradeoffs.map(t => t.category)).toContain('food');
    });

    test('34. Calculates accurate average metric aggregates', () => {
      const mockCandidate = (diff: number, resist: number, savings: number) => ({
        id: `c-${diff}`,
        interventionId: 'i',
        title: '',
        description: '',
        category: 'food' as const,
        estimatedSavingsKg: savings,
        difficultyScore: diff,
        difficultyLevel: 'medium' as const,
        resistanceScore: { score: resist, riskFactor: 0.2, habitStrength: 0, reasoning: '' },
        score: 10,
        reasoning: '',
        rank: 1,
      });

      const list = [
        mockCandidate(30, 40, 10),
        mockCandidate(50, 60, 20),
      ];

      const tradeoffs = aggregator.aggregate(list);
      const foodTrade = tradeoffs.find(t => t.category === 'food')!;
      expect(foodTrade.potentialSavingsKg).toBe(30);
      expect(foodTrade.averageDifficulty).toBe(40.0); // (30+50)/2
      expect(foodTrade.averageResistance).toBe(50.0); // (40+60)/2
      expect(foodTrade.candidateCount).toBe(2);
    });

    test('35. Builds synthesized high barriers descriptions correctly', () => {
      const cand = {
        id: 'high-bar',
        interventionId: 'i',
        title: '',
        description: '',
        category: 'transport' as const,
        estimatedSavingsKg: 80.0,
        difficultyScore: 80,
        difficultyLevel: 'hard' as const,
        resistanceScore: { score: 80, riskFactor: 0.8, habitStrength: 0.5, reasoning: '' },
        score: 10,
        reasoning: '',
        rank: 1,
      };

      const tradeoffs = aggregator.aggregate([cand]);
      const transTrade = tradeoffs.find(t => t.category === 'transport')!;
      expect(transTrade.description).toContain("high implementation difficulty");
      expect(transTrade.description).toContain("strong behavioral resistance");
    });

    test('36. Builds synthesized quick wins descriptions correctly', () => {
      const cand = {
        id: 'low-bar',
        interventionId: 'i',
        title: '',
        description: '',
        category: 'energy' as const,
        estimatedSavingsKg: 10.0,
        difficultyScore: 20,
        difficultyLevel: 'easy' as const,
        resistanceScore: { score: 20, riskFactor: 0.2, habitStrength: 0, reasoning: '' },
        score: 10,
        reasoning: '',
        rank: 1,
      };

      const tradeoffs = aggregator.aggregate([cand]);
      const energyTrade = tradeoffs.find(t => t.category === 'energy')!;
      expect(energyTrade.description).toContain("quick wins");
      expect(energyTrade.description).toContain("low friction");
    });

    test('37. Handles categories with zero candidates gracefully', () => {
      const tradeoffs = aggregator.aggregate([]);
      const emptyTrade = tradeoffs.find(t => t.category === 'transport')!;
      expect(emptyTrade.potentialSavingsKg).toBe(0);
      expect(emptyTrade.candidateCount).toBe(0);
      expect(emptyTrade.description).toContain("No active carbon reduction candidates");
    });
  });

  // ==========================================
  // 6. OptimizationPlanner Tests (Tests 38-41)
  // ==========================================
  describe('OptimizationPlanner', () => {
    const planner = new OptimizationPlanner();

    test('38. Loads default interventions definitions and builds list', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const candidates = planner.plan(bp, fp);
      expect(candidates.length).toBeGreaterThan(0);
      // Standard list contains reduce_beef, green_commuting etc.
      expect(candidates.map(c => c.interventionId)).toContain('reduce_beef');
    });

    test('39. Orders planned candidates descending by rank index', () => {
      const bp = makeMockProfile(makeMockVector(15.0));
      const fp = makeMockForecast(15.0);
      const candidates = planner.plan(bp, fp);
      expect(candidates[0].rank).toBe(1);
      expect(candidates[candidates.length - 1].rank).toBe(candidates.length);
    });

    test('40. Populates candidate reasoning fields with estimator parameters', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const candidates = planner.plan(bp, fp);
      expect(candidates[0].reasoning).toContain("savings");
      expect(candidates[0].reasoning).toContain("difficulty");
    });

    test('41. Coordinates and assigns fields to target interface standard', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const candidates = planner.plan(bp, fp);
      const cand = candidates[0];
      expect(cand.id).toBeDefined();
      expect(cand.title).toBeDefined();
      expect(cand.category).toBeDefined();
      expect(cand.difficultyLevel).toBeDefined();
      expect(cand.resistanceScore.score).toBeDefined();
    });
  });

  // ==========================================
  // 7. OptimizationEngine Tests (Tests 42-47)
  // ==========================================
  describe('OptimizationEngine API Integration', () => {
    const engine = new OptimizationEngine();

    test('42. Generates an OptimizationPlan for matching profiles successfully', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const res = engine.generateOptimizationPlan(bp, fp);
      expect(res.success).toBe(true);
      if (res.success) {
        const plan = res.value;
        expect(plan.userId).toBe(bp.userId);
        expect(plan.candidates.length).toBeGreaterThan(0);
        expect(plan.tradeoffs.length).toBe(4);
        expect(plan.generatedAt).toBeInstanceOf(Date);
      }
    });

    test('43. Fails when behaviorProfile is missing', () => {
      const fp = makeMockForecast(12.0);
      const res = engine.generateOptimizationPlan(null as any, fp);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('BehaviorProfile is required');
      }
    });

    test('44. Fails when forecastProfile is missing', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const res = engine.generateOptimizationPlan(bp, null as any);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('ForecastProfile is required');
      }
    });

    test('45. Fails when user IDs do not match', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0, 'user-different-id');
      const res = engine.generateOptimizationPlan(bp, fp);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('User IDs in behaviorProfile and forecastProfile must match');
      }
    });

    test('46. Catches planning errors and returns a failure result', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      // Force an error inside planning by corrupting behaviorProfile signals array
      bp.signals = null as any;
      const res = engine.generateOptimizationPlan(bp, fp);
      expect(res.success).toBe(false);
    });

    test('47. Generated candidates are ordered by score descending', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const res = engine.generateOptimizationPlan(bp, fp);
      expect(res.success).toBe(true);
      if (res.success) {
        const plan = res.value;
        for (let i = 0; i < plan.candidates.length - 1; i++) {
          expect(plan.candidates[i].score).toBeGreaterThanOrEqual(plan.candidates[i + 1].score);
        }
      }
    });
  });
});

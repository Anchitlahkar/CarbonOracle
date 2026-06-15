import { describe, test, expect } from 'vitest';
import {
  CarbonDNAEngine,
  ConsistencyAnalyzer,
  ResponsivenessAnalyzer,
  OptimizationPotentialAnalyzer,
  ForecastReliabilityAnalyzer,
  ArchetypeClassifier,
  DNAAggregator
} from '../src/index';
import {
  BehaviorProfile,
  BehaviorFeatureVector,
  BehaviorSignal,
  ForecastProfile,
  ForecastProjection,
  ForecastSnapshot,
  OptimizationPlan,
  OptimizationCandidate,
  CarbonArchetype,
  DNAEvolutionDirection
} from '@carbonsense/shared-types';

describe('Carbon DNA Engine Suite', () => {
  const userId = 'user-dna-44';

  // HELPER to create mock BehaviorFeatureVector
  const makeMockVector = (
    mean: number,
    trans = 0.25,
    food = 0.25,
    energy = 0.25,
    shop = 0.25,
    stdDev = mean * 0.1,
    weekendMult = 1.0
  ): BehaviorFeatureVector => ({
    userId,
    dailyEmissionsMean: mean,
    dailyEmissionsStdDev: stdDev,
    transportRatio: trans,
    foodRatio: food,
    energyRatio: energy,
    shoppingRatio: shop,
    weeklyBeefCount: 0,
    monthlyFlightCount: 0,
    weekendMultiplier: weekendMult,
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
    integrityScore = 100,
    confidence = 0.9,
    uId = userId,
    pctDelta = 0 // diff between baseline and trend-adjusted
  ): ForecastProfile => {
    const snapshotsBase: ForecastSnapshot[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      projectedEmission: mean,
      lowerBound: mean * 0.8,
      upperBound: mean * 1.2,
    }));

    const snapshotsTrend: ForecastSnapshot[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      projectedEmission: mean * (1 + pctDelta / 100),
      lowerBound: mean * 0.8,
      upperBound: mean * 1.2,
    }));

    const projectionBase: ForecastProjection = {
      horizonDays: 30,
      snapshots: snapshotsBase,
      confidence,
      reasoning: { factors: [], assumptions: [], confidenceDrivers: [] },
    };

    const projectionTrend: ForecastProjection = {
      horizonDays: 30,
      snapshots: snapshotsTrend,
      confidence,
      reasoning: { factors: [], assumptions: [], confidenceDrivers: [] },
    };

    return {
      userId: uId,
      baseline: { '30d': projectionBase, '90d': projectionBase, '365d': projectionBase },
      trendAdjusted: { '30d': projectionTrend, '90d': projectionTrend, '365d': projectionTrend },
      momentum: { '30d': projectionBase, '90d': projectionBase, '365d': projectionBase },
      scenarios: [],
      riskDrivers: [],
      counterfactuals: [],
      integrity: { score: integrityScore, reasons: [] },
      generatedAt: new Date(),
    };
  };

  // HELPER to create mock OptimizationPlan
  const makeMockPlan = (
    candidates: OptimizationCandidate[] = [],
    uId = userId
  ): OptimizationPlan => ({
    id: `plan-${uId}`,
    userId: uId,
    candidates,
    tradeoffs: [],
    generatedAt: new Date(),
  });

  const makeMockCandidate = (
    id: string,
    cat: 'transport' | 'food' | 'energy' | 'shopping',
    savings: number,
    difficulty: number,
    resistance: number
  ): OptimizationCandidate => ({
    id,
    interventionId: `inter-${id}`,
    title: `Candidate ${id}`,
    description: '',
    category: cat,
    estimatedSavingsKg: savings,
    difficultyScore: difficulty,
    difficultyLevel: 'medium',
    resistanceScore: { score: resistance, riskFactor: 0.5, habitStrength: 0, reasoning: '' },
    score: 10,
    reasoning: '',
    rank: 1,
  });

  // ==========================================
  // 1. ConsistencyAnalyzer Tests (Tests 1-6)
  // ==========================================
  describe('ConsistencyAnalyzer', () => {
    const analyzer = new ConsistencyAnalyzer();

    test('1. Calculates high consistency under stable behavior patterns', () => {
      const vec = makeMockVector(10.0, 0.25, 0.25, 0.25, 0.25, 1.0, 1.0); // CV = 0.1, weekend = 1.0
      const bp = makeMockProfile(vec);
      const res = analyzer.analyze(bp);
      // rawVolatility = 0.1 * 50 + 0 = 5
      expect(res.volatility).toBe(5);
      expect(res.consistencyScore).toBe(95);
    });

    test('2. Volatility increases with daily standard deviation volatility', () => {
      const vec = makeMockVector(10.0, 0.25, 0.25, 0.25, 0.25, 6.0, 1.0); // CV = 0.6
      const bp = makeMockProfile(vec);
      const res = analyzer.analyze(bp);
      // rawVolatility = 0.6 * 50 = 30
      expect(res.volatility).toBe(30);
      expect(res.consistencyScore).toBe(70);
    });

    test('3. Volatility increases with weekend emission multiplier spikes', () => {
      const vec = makeMockVector(10.0, 0.25, 0.25, 0.25, 0.25, 0, 2.0); // CV = 0, weekend = 2.0
      const bp = makeMockProfile(vec);
      const res = analyzer.analyze(bp);
      // rawVolatility = 0 + (2.0 - 1.0) * 30 = 30
      expect(res.volatility).toBe(30);
    });

    test('4. Capping volatility score range to 100', () => {
      const vec = makeMockVector(1.0, 0.25, 0.25, 0.25, 0.25, 5.0, 5.0); // high CV & weekend
      const bp = makeMockProfile(vec);
      const res = analyzer.analyze(bp);
      expect(res.volatility).toBe(100);
      expect(res.consistencyScore).toBe(0);
    });

    test('5. Floors volatility score range at 0', () => {
      const vec = makeMockVector(10.0, 0.25, 0.25, 0.25, 0.25, -2.0, 1.0); // negative stdDev
      const bp = makeMockProfile(vec);
      const res = analyzer.analyze(bp);
      expect(res.volatility).toBe(0);
      expect(res.consistencyScore).toBe(100);
    });

    test('6. Prevents division by zero with flat zero daily mean', () => {
      const vec = makeMockVector(0.0);
      const bp = makeMockProfile(vec);
      const res = analyzer.analyze(bp);
      expect(res.volatility).toBe(0);
      expect(res.consistencyScore).toBe(100);
    });
  });

  // ==========================================
  // 2. ResponsivenessAnalyzer Tests (Tests 7-12)
  // ==========================================
  describe('ResponsivenessAnalyzer', () => {
    const analyzer = new ResponsivenessAnalyzer();

    test('7. Provides neutral high defaults for empty candidates lists', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 40); // risk = 40
      const plan = makeMockPlan([]);
      const res = analyzer.analyze(bp, plan);
      // fallbackResistance = 40 * 0.5 = 20
      expect(res.resistance).toBe(20);
      expect(res.readiness).toBe(80);
    });

    test('8. Calculates resistance matching the candidate average', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 0);
      const list = [
        makeMockCandidate('1', 'food', 10, 50, 40),
        makeMockCandidate('2', 'food', 20, 50, 60),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, plan);
      expect(res.resistance).toBe(50); // average of 40 and 60
    });

    test('9. Decreases optimization readiness as resistance and difficulty rise', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 50); // risk = 50
      const list = [
        makeMockCandidate('1', 'food', 10, 80, 80), // hard & highly resistant
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, plan);
      // readiness = 100 - (80 * 0.5 + 80 * 0.3 + 50 * 0.2) = 100 - (40 + 24 + 10) = 26
      expect(res.readiness).toBe(26);
    });

    test('10. Increases readiness under low difficulty low resistance conditions', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 10);
      const list = [
        makeMockCandidate('1', 'food', 10, 20, 10),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, plan);
      // readiness = 100 - (10 * 0.5 + 20 * 0.3 + 10 * 0.2) = 100 - (5 + 6 + 2) = 87
      expect(res.readiness).toBe(87);
    });

    test('11. Caps readiness score range to 100', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 0);
      const list = [
        makeMockCandidate('1', 'food', 10, -50, -50),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, plan);
      expect(res.readiness).toBe(100);
    });

    test('12. Floors readiness score range at 0', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 100);
      const list = [
        makeMockCandidate('1', 'food', 10, 100, 100),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, plan);
      expect(res.readiness).toBe(0);
    });
  });

  // ==========================================
  // 3. OptimizationPotentialAnalyzer Tests (Tests 13-18)
  // ==========================================
  describe('OptimizationPotentialAnalyzer', () => {
    const analyzer = new OptimizationPotentialAnalyzer();

    test('13. Calculates basic relative savings ratio correctly', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0); // 30d baseline = 300kg
      const list = [
        makeMockCandidate('1', 'food', 30.0, 50, 50),
        makeMockCandidate('2', 'energy', 15.0, 50, 50),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, fp, plan);
      expect(res.absoluteSavingsKg).toBe(45);
      expect(res.potentialScore).toBe(15); // 45 / 300 = 15%
    });

    test('14. Caps potential score at 100 if savings exceed baseline', () => {
      const vec = makeMockVector(1.0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(1.0); // 30d baseline = 30kg
      const list = [
        makeMockCandidate('1', 'food', 50.0, 50, 50), // savings exceed baseline
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, fp, plan);
      expect(res.potentialScore).toBe(100);
    });

    test('15. Handles flat zero emissions cases gracefully without division errors', () => {
      const vec = makeMockVector(0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(0);
      const plan = makeMockPlan([]);
      const res = analyzer.analyze(bp, fp, plan);
      expect(res.potentialScore).toBe(0);
      expect(res.absoluteSavingsKg).toBe(0);
    });

    test('16. Falls back to behavior profile daily mean if forecast snapshots missing', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0);
      fp.baseline['30d'].snapshots = []; // empty snapshots
      const list = [
        makeMockCandidate('1', 'food', 30.0, 50, 50),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, fp, plan);
      expect(res.potentialScore).toBe(10); // 30 / 300 = 10%
    });

    test('17. Handles completely missing baseline fields gracefully', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0);
      delete (fp as Record<string, unknown>).baseline;
      const list = [
        makeMockCandidate('1', 'food', 30.0, 50, 50),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, fp, plan);
      expect(res.potentialScore).toBe(10);
    });

    test('18. Rounds absolute savings to 2 decimal places', () => {
      const vec = makeMockVector(10.0);
      const bp = makeMockProfile(vec);
      const fp = makeMockForecast(10.0);
      const list = [
        makeMockCandidate('1', 'food', 12.3456, 50, 50),
      ];
      const plan = makeMockPlan(list);
      const res = analyzer.analyze(bp, fp, plan);
      expect(res.absoluteSavingsKg).toBe(12.35);
    });
  });

  // ==========================================
  // 4. ForecastReliabilityAnalyzer Tests (Tests 19-24)
  // ==========================================
  describe('ForecastReliabilityAnalyzer', () => {
    const analyzer = new ForecastReliabilityAnalyzer();

    test('19. Blends integrity, prediction confidence, and stability', () => {
      const fp = makeMockForecast(10.0, 100, 0.9); // integrity = 100, conf = 0.9
      const reliability = analyzer.analyze(fp, 10); // volatility = 10 (inverse stability = 90)
      // avgConf = 0.9 => confidenceScore = 90
      // reliability = (100 * 0.4) + (90 * 0.4) + ((100 - 10) * 0.2) = 40 + 36 + 18 = 94
      expect(reliability).toBe(94);
    });

    test('20. High stability profiles yield high forecast reliability', () => {
      const fp = makeMockForecast(10.0, 100, 1.0);
      const reliability = analyzer.analyze(fp, 0); // volatility = 0
      // reliability = 40 + 40 + 20 = 100
      expect(reliability).toBe(100);
    });

    test('21. Low stability and low integrity degrade reliability significantly', () => {
      const fp = makeMockForecast(10.0, 30, 0.4); // integrity = 30, conf = 0.4
      const reliability = analyzer.analyze(fp, 80); // volatility = 80
      // confidenceScore = 40
      // reliability = 30 * 0.4 + 40 * 0.4 + 20 * 0.2 = 12 + 16 + 4 = 32
      expect(reliability).toBe(32);
    });

    test('22. Handles missing forecast baseline profile safely', () => {
      const fp = makeMockForecast(10.0, 80, 0.8);
      delete (fp as Record<string, unknown>).baseline;
      const reliability = analyzer.analyze(fp, 20);
      // avgConfidence default = 0.5 => score = 50
      // reliability = 80 * 0.4 + 50 * 0.4 + 80 * 0.2 = 32 + 20 + 16 = 68
      expect(reliability).toBe(68);
    });

    test('23. Caps reliability score range to 100', () => {
      const fp = makeMockForecast(10.0, 100, 1.5); // extra confidence
      const reliability = analyzer.analyze(fp, -10); // negative volatility
      expect(reliability).toBe(100);
    });

    test('24. Floors reliability score range at 0', () => {
      const fp = makeMockForecast(10.0, -50, -0.5);
      const reliability = analyzer.analyze(fp, 150);
      expect(reliability).toBe(0);
    });
  });

  // ==========================================
  // 5. ArchetypeClassifier Tests (Tests 25-36)
  // ==========================================
  describe('ArchetypeClassifier', () => {
    const classifier = new ArchetypeClassifier();

    test('25. Classifies StableLowEmitter for daily means below Paris threshold (<3kg)', () => {
      const bp = makeMockProfile(makeMockVector(2.5)); // dailyMean = 2.5
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.archetype).toBe(CarbonArchetype.StableLowEmitter);
      expect(res.confidence).toBeGreaterThanOrEqual(90);
      expect(res.evidence.map(e => e.factor)).toContain('Low Daily Emissions Mean');
    });

    test('26. Classifies VolatileEmitter when behavioral volatility exceeds 60', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const res = classifier.classify(bp, 65, 20, 10); // volatility = 65
      expect(res.archetype).toBe(CarbonArchetype.VolatileEmitter);
    });

    test('27. Classifies ResistantEmitter when friction metrics are high (>70 resistance + >60 risk)', () => {
      const bp = makeMockProfile(makeMockVector(10.0), 65); // risk = 65
      const res = classifier.classify(bp, 10, 75, 10); // resistance = 75
      expect(res.archetype).toBe(CarbonArchetype.ResistantEmitter);
    });

    test('28. Classifies TransportDominant when ratio exceeds 40%', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.45, 0.15, 0.20, 0.20)); // trans = 45%
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.archetype).toBe(CarbonArchetype.TransportDominant);
    });

    test('29. Classifies FoodDominant when ratio exceeds 40%', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.15, 0.45, 0.20, 0.20)); // food = 45%
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.archetype).toBe(CarbonArchetype.FoodDominant);
    });

    test('30. Classifies EnergyDominant when ratio exceeds 40%', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.15, 0.20, 0.45, 0.20)); // energy = 45%
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.archetype).toBe(CarbonArchetype.EnergyDominant);
    });

    test('31. Classifies ShoppingDominant when ratio exceeds 35%', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.15, 0.20, 0.20, 0.45)); // shop = 45%
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.archetype).toBe(CarbonArchetype.ShoppingDominant);
    });

    test('32. Classifies HighImpactReducer if potential savings > 30% without category dominance', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.25, 0.25, 0.25, 0.25)); // balanced ratios
      const res = classifier.classify(bp, 10, 20, 35); // potential = 35
      expect(res.archetype).toBe(CarbonArchetype.HighImpactReducer);
    });

    test('33. Falls back to BalancedOptimizer for balanced moderate profiles', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.25, 0.25, 0.25, 0.25));
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.archetype).toBe(CarbonArchetype.BalancedOptimizer);
      expect(res.confidence).toBe(80);
    });

    test('34. Compiles exactly 4 basic category ratio evidence items plus custom classifications', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const res = classifier.classify(bp, 10, 20, 10);
      expect(res.evidence.length).toBe(5); // 4 standard categories + 1 balanced optimizer factor
    });

    test('35. Reflects exact user category ratio percentages in evidence contributions', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.60, 0.10, 0.10, 0.20));
      const res = classifier.classify(bp, 10, 20, 10);
      const transportEvidence = res.evidence.find(e => e.factor === 'Transport Footprint Ratio')!;
      expect(transportEvidence.contribution).toBe(60);
    });

    test('36. Validates confidence calculations do not exceed bounds', () => {
      const bp = makeMockProfile(makeMockVector(1.0)); // StableLowEmitter rule
      const res = classifier.classify(bp, -200, 20, 10); // extreme negative volatility
      expect(res.confidence).toBe(100);
    });
  });

  // ==========================================
  // 6. DNAEvolution & Trajectory Projections (Tests 37-42)
  // ==========================================
  describe('DNAEvolution trajectory mapping', () => {
    const classifier = new ArchetypeClassifier();
    const aggregator = new DNAAggregator();

    test('37. Maps RapidImprovement trajectory for reduction forecasts < -15%', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, -20); // trendSum is 20% lower than baseline
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 80, interventionResistance: 20, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.TransportDominant, 80, [], dimensions);

      expect(profile.evolution.direction).toBe(DNAEvolutionDirection.RapidImprovement);
      expect(profile.evolution.projected30dChangePercent).toBe(-20);
    });

    test('38. Forecasts transition to BalancedOptimizer for improving category dominant archetypes', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, -10); // Improving (-10%)
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 80, interventionResistance: 20, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.TransportDominant, 80, [], dimensions);

      expect(profile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.BalancedOptimizer);
      expect(profile.evolution.futureProjection.probability).toBe(0.85); // readiness = 80 > 60
    });

    test('39. Forecasts transition to StableLowEmitter for improving BalancedOptimizers', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, -5); // Improving (-5%)
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.BalancedOptimizer, 80, [], dimensions);

      expect(profile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.StableLowEmitter);
      expect(profile.evolution.futureProjection.probability).toBe(0.55); // readiness = 50 <= 70
    });

    test('40. Maps stable directions with 90% probability staying in same archetype', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, 0); // stable delta
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.EnergyDominant, 80, [], dimensions);

      expect(profile.evolution.direction).toBe(DNAEvolutionDirection.Stable);
      expect(profile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.EnergyDominant);
      expect(profile.evolution.futureProjection.probability).toBe(0.90);
    });

    test('41. Forecasts transition to VolatileEmitter under degrading stable/balanced profiles', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, 8); // Degrading (8%)
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.BalancedOptimizer, 80, [], dimensions);

      expect(profile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.VolatileEmitter);
      expect(profile.evolution.futureProjection.probability).toBe(0.70);
    });

    test('42. Projects state transition to ResistantEmitter for degrading dominant profiles', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, 12); // Degrading (12%)
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 75, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.FoodDominant, 80, [], dimensions);

      expect(profile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.ResistantEmitter);
      expect(profile.evolution.futureProjection.probability).toBe(0.80); // resistance = 75 > 60
    });
  });

  // ==========================================
  // 7. CarbonDNAEngine Integration Tests (Tests 43-48)
  // ==========================================
  describe('CarbonDNAEngine API Integration', () => {
    const engine = new CarbonDNAEngine();

    test('43. Generates complete CarbonDNAProfile with new research fields successfully', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan();

      const res = engine.generateDNAProfile(bp, fp, plan);
      expect(res.success).toBe(true);
      if (res.success) {
        const dna = res.value;
        expect(dna.userId).toBe(userId);
        expect(dna.archetype).toBe(CarbonArchetype.BalancedOptimizer);
        expect(dna.archetypeConfidence).toBe(80);
        expect(dna.dimensions.emissionIntensity).toBe(60); // 12 * 5
        expect(dna.dimensions.forecastReliability).toBeDefined();
        expect(dna.evolution.direction).toBe(DNAEvolutionDirection.Stable);
        expect(dna.evolution.futureProjection.currentArchetype).toBe(CarbonArchetype.BalancedOptimizer);
      }
    });

    test('44. Fails when behaviorProfile is missing', () => {
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan();
      const res = engine.generateDNAProfile(null as never, fp, plan);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('BehaviorProfile is required');
      }
    });

    test('45. Fails when forecastProfile is missing', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const plan = makeMockPlan();
      const res = engine.generateDNAProfile(bp, null as never, plan);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('ForecastProfile is required');
      }
    });

    test('46. Fails when optimizationPlan is missing', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const res = engine.generateDNAProfile(bp, fp, null as never);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('OptimizationPlan is required');
      }
    });

    test('47. Fails when user IDs do not match between profiles', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0, 100, 0.9, 'user-mismatch');
      const plan = makeMockPlan();

      const res = engine.generateDNAProfile(bp, fp, plan);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('User IDs in all profiles must match');
      }
    });

    test('48. Catches exceptions and maps to failure result', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan();
      // Corrupt behaviorProfile to force an exception
      bp.featureVector = null as never;

      const res = engine.generateDNAProfile(bp, fp, plan);
      expect(res.success).toBe(false);
    });

    test('49. Handles missing integrity and confidence fallbacks in ForecastReliabilityAnalyzer', () => {
      const reliabilityAnalyzer = new ForecastReliabilityAnalyzer();
      const fp = makeMockForecast(12.0);
      delete (fp as Record<string, unknown>).integrity;
      delete (fp.baseline['30d'] as Record<string, unknown>).confidence;
      delete (fp.baseline['90d'] as Record<string, unknown>).confidence;
      delete (fp.baseline['365d'] as Record<string, unknown>).confidence;

      const reliability = reliabilityAnalyzer.analyze(fp, 20);
      // integrityScore fallback = 50 => 50 * 0.4 = 20
      // confidence score fallback = 50 => 50 * 0.4 = 20
      // inverse volatility = (100 - 20) * 0.2 = 16
      // total = 56
      expect(reliability).toBe(56);
    });

    test('50. Handles missing candidates fallback in OptimizationPotentialAnalyzer', () => {
      const potentialAnalyzer = new OptimizationPotentialAnalyzer();
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan();
      delete (plan as Record<string, unknown>).candidates;

      const res = potentialAnalyzer.analyze(bp, fp, plan);
      expect(res.potentialScore).toBe(0);
      expect(res.absoluteSavingsKg).toBe(0);
    });

    test('51. Maps RapidDegradation trajectory for large positive changes', () => {
      const aggregator = new DNAAggregator();
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, 25); // trend is +25%
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.BalancedOptimizer, 80, [], dimensions);

      expect(profile.evolution.direction).toBe(DNAEvolutionDirection.RapidDegradation);
    });

    test('52. Forecasts transition to BalancedOptimizer for improving Volatile/Resistant emitters', () => {
      const aggregator = new DNAAggregator();
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, -5); // Improving (-5%)
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      
      const profileVolatile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.VolatileEmitter, 80, [], dimensions);
      expect(profileVolatile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.BalancedOptimizer);

      const profileResistant = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.ResistantEmitter, 80, [], dimensions);
      expect(profileResistant.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.BalancedOptimizer);
    });

    test('53. Forecasts transition to StableLowEmitter for improving StableLowEmitters', () => {
      const aggregator = new DNAAggregator();
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0, 100, 0.9, userId, -5); // Improving
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      
      const profile = aggregator.aggregate(bp, fp, makeMockPlan(), CarbonArchetype.StableLowEmitter, 80, [], dimensions);
      expect(profile.evolution.futureProjection.projectedArchetype).toBe(CarbonArchetype.StableLowEmitter);
      expect(profile.evolution.futureProjection.probability).toBe(0.95);
    });

    test('54. Legacy primaryCategory maps correctly to energy and shopping', () => {
      const aggregator = new DNAAggregator();
      const fp = makeMockForecast(10.0);
      const dimensions = { emissionIntensity: 50, behaviorVolatility: 10, optimizationReadiness: 50, interventionResistance: 20, forecastReliability: 90 };
      
      // Energy Dominant
      const bpEnergy = makeMockProfile(makeMockVector(10.0, 0.1, 0.1, 0.7, 0.1));
      const profileEnergy = aggregator.aggregate(bpEnergy, fp, makeMockPlan(), CarbonArchetype.EnergyDominant, 80, [], dimensions);
      expect(profileEnergy.primaryCategory).toBe('energy');

      // Shopping Dominant
      const bpShop = makeMockProfile(makeMockVector(10.0, 0.1, 0.1, 0.1, 0.7));
      const profileShop = aggregator.aggregate(bpShop, fp, makeMockPlan(), CarbonArchetype.ShoppingDominant, 80, [], dimensions);
      expect(profileShop.primaryCategory).toBe('shopping');
    });
  });
});

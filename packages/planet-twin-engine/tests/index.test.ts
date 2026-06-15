import { describe, test, expect } from 'vitest';
import {
  PlanetTwinEngine,
  TrajectorySimulator,
  ImpactAccumulator,
  EarthEquivalentCalculator,
  WorldDivergenceAnalyzer,
  NarrativeGenerator,
  ScenarioWorldBuilder,
  TwinAggregator
} from '../src/index';
import {
  BehaviorProfile,
  BehaviorFeatureVector,
  ForecastProfile,
  ForecastProjection,
  ForecastSnapshot,
  OptimizationPlan,
  OptimizationCandidate,
  CarbonDNAProfile,
  CarbonArchetype,
  DNAEvolutionDirection,
  TwinWorld
} from '@carbonsense/shared-types';

describe('Planet Twin Engine Suite', () => {
  const userId = 'user-twin-77';

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
    weeklyBeefCount: 0,
    monthlyFlightCount: 0,
    weekendMultiplier: 1.0,
  });

  // HELPER to create mock BehaviorProfile
  const makeMockProfile = (
    vector: BehaviorFeatureVector,
    riskScore = 50
  ): BehaviorProfile => ({
    userId,
    signals: [],
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
      riskDrivers: [
        { driver: 'Transport & Commutes', contribution: 60 }
      ],
      counterfactuals: [],
      integrity: { score: 100, reasons: [] },
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
    difficulty = 40,
    resistance = 30,
    rank = 1
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
    rank,
  });

  // HELPER to create mock CarbonDNAProfile
  const makeMockDNA = (
    uId = userId
  ): CarbonDNAProfile => ({
    id: `dna-${uId}`,
    userId: uId,
    carbonPersonaType: 'BalancedOptimizer',
    primaryCategory: 'transport',
    primaryEmissionsRatio: 0.25,
    behavioralScore: 80,
    archetype: CarbonArchetype.BalancedOptimizer,
    archetypeConfidence: 80,
    dimensions: {
      emissionIntensity: 50,
      behaviorVolatility: 20,
      optimizationReadiness: 70,
      interventionResistance: 30,
      forecastReliability: 90,
    },
    archetypeEvidence: [],
    evolution: {
      direction: DNAEvolutionDirection.Stable,
      projected30dChangePercent: 0,
      projected90dChangePercent: 0,
      confidenceScore: 90,
      reasoning: '',
      futureProjection: {
        currentArchetype: CarbonArchetype.BalancedOptimizer,
        projectedArchetype: CarbonArchetype.BalancedOptimizer,
        probability: 0.90,
        reasoning: [],
      },
    },
    lastUpdated: new Date(),
  });

  // ==========================================
  // 1. TrajectorySimulator Tests (Tests 1-10)
  // ==========================================
  describe('TrajectorySimulator', () => {
    const simulator = new TrajectorySimulator();

    test('1. Projects flat baseline values for Current World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const res = simulator.simulate(bp, fp, plan);

      expect(res.current.annualEmissionsKg).toBe(3650); // 10 * 365
      expect(res.current.cumulative30DayKg).toBe(300);
      expect(res.current.confidence).toBe(0.9);
    });

    test('2. Populates 4 temporal checkpoints for Current World snapshots', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const res = simulator.simulate(bp, fp, plan);

      expect(res.current.snapshots.length).toBe(4);
      expect(res.current.snapshots.map(s => s.day)).toEqual([30, 90, 180, 365]);
      expect(res.current.snapshots[0].cumulativeEmissionsKg).toBe(300);
      expect(res.current.snapshots[3].cumulativeEmissionsKg).toBe(3650);
    });

    test('3. Deducts top 3 optimizations in Optimized World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0); // 300kg in 30d
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 10, 40, 30, 1),
        makeMockCandidate('2', 'food', 20, 40, 30, 2),
        makeMockCandidate('3', 'energy', 30, 40, 30, 3),
      ]); // savings30d = 60kg => dailySavings = 2kg/day

      const res = simulator.simulate(bp, fp, plan);
      expect(res.optimized.cumulative30DayKg).toBe(240); // 300 - 60
      expect(res.optimized.annualEmissionsKg).toBe(3650 - 2 * 365); // 3650 - 730 = 2920
    });

    test('4. Excludes lower ranked optimization candidates in Optimized World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 10, 40, 30, 1),
        makeMockCandidate('2', 'food', 10, 40, 30, 2),
        makeMockCandidate('3', 'energy', 10, 40, 30, 3),
        makeMockCandidate('4', 'shopping', 10, 40, 30, 4), // ranked 4th, should be ignored
      ]);

      const res = simulator.simulate(bp, fp, plan);
      expect(res.optimized.cumulative30DayKg).toBe(270); // 300 - 30 (not 40)
    });

    test('5. Deducts all recommendations in Aggressive World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 10, 40, 30, 1),
        makeMockCandidate('2', 'food', 10, 40, 30, 2),
        makeMockCandidate('3', 'energy', 10, 40, 30, 3),
        makeMockCandidate('4', 'shopping', 10, 40, 30, 4),
      ]); // total savings = 40kg

      const res = simulator.simulate(bp, fp, plan);
      expect(res.aggressive.cumulative30DayKg).toBe(260); // 300 - 40
    });

    test('6. Caps cumulative emissions in Optimized and Aggressive worlds at 0', () => {
      const bp = makeMockProfile(makeMockVector(1.0));
      const fp = makeMockForecast(1.0); // 30kg in 30d
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 100.0, 40, 30, 1), // huge savings
      ]);

      const res = simulator.simulate(bp, fp, plan);
      expect(res.optimized.cumulative30DayKg).toBe(0);
      expect(res.aggressive.cumulative30DayKg).toBe(0);
    });

    test('7. Reduces trajectory confidences correctly per world', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const res = simulator.simulate(bp, fp, plan);

      expect(res.optimized.confidence).toBeLessThan(res.current.confidence);
      expect(res.aggressive.confidence).toBeLessThan(res.optimized.confidence);
    });

    test('8. Handles empty candidates arrays without errors', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan();
      const res = simulator.simulate(bp, fp, plan);

      expect(res.optimized.cumulative30DayKg).toBe(300);
      expect(res.aggressive.cumulative30DayKg).toBe(300);
    });

    test('9. Handles missing baseline projections snapshots via mean extrapolator fallback', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      fp.baseline['30d'].snapshots = []; // empty snapshots
      fp.baseline['90d'].snapshots = [];
      fp.baseline['365d'].snapshots = [];
      const plan = makeMockPlan([]);

      const res = simulator.simulate(bp, fp, plan);
      expect(res.current.annualEmissionsKg).toBe(3650);
    });

    test('10. Projects correctly under partially defined forecasts', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      delete (fp as Record<string, unknown>).baseline; // delete baseline field
      const plan = makeMockPlan([]);

      const res = simulator.simulate(bp, fp, plan);
      expect(res.current.annualEmissionsKg).toBe(3650);
    });
  });

  // ==========================================
  // 2. ImpactAccumulator Tests (Tests 11-18)
  // ==========================================
  describe('ImpactAccumulator', () => {
    const accumulator = new ImpactAccumulator();

    test('11. Translates emissions using exact offset factor', () => {
      const res = accumulator.accumulate(100.0);
      // trees = 100 * 0.04545 = 4.545 => rounds to 4.54 in JS toFixed
      expect(res.treesRequiredForOffset).toBe(4.54);
    });

    test('12. Translates emissions using exact vehicle km factor', () => {
      const res = accumulator.accumulate(100.0);
      // vehicle km = 100 * 5.0 = 500
      expect(res.vehicleEquivalentKm).toBe(500);
    });

    test('13. Translates emissions using exact household energy day factor', () => {
      const res = accumulator.accumulate(100.0);
      // energy days = 100 * 0.1 = 10
      expect(res.householdEnergyEquivalentDays).toBe(10);
    });

    test('14. Rounds translated impact parameters to 2 decimal places', () => {
      const res = accumulator.accumulate(123.4567);
      expect(res.treesRequiredForOffset.toString()).toMatch(/\.\d{2}$/);
    });

    test('15. Handles zero cumulative emissions correctly', () => {
      const res = accumulator.accumulate(0);
      expect(res.treesRequiredForOffset).toBe(0);
      expect(res.vehicleEquivalentKm).toBe(0);
      expect(res.householdEnergyEquivalentDays).toBe(0);
    });

    test('16. Processes extreme high emissions limits without errors', () => {
      const res = accumulator.accumulate(100000000.0);
      expect(res.vehicleEquivalentKm).toBe(500000000);
    });

    test('17. Handles boundary negative inputs gracefully', () => {
      const res = accumulator.accumulate(-100);
      expect(res.vehicleEquivalentKm).toBe(-500);
    });

    test('18. Extrapolates decimals correctly', () => {
      const res = accumulator.accumulate(0.1);
      // trees = 0.1 * 0.04545 = 0.004545 => 0.00
      expect(res.treesRequiredForOffset).toBe(0);
    });
  });

  // ==========================================
  // 3. EarthEquivalentCalculator Tests (Tests 19-26)
  // ==========================================
  describe('EarthEquivalentCalculator', () => {
    const calculator = new EarthEquivalentCalculator();

    test('19. Computes earths required based on sustainable limit', () => {
      const res = calculator.calculate(3600); // sustainable limit = 1800 => 2 earths
      expect(res.earthsRequired).toBe(2);
    });

    test('20. Evaluates global percentile to average citizen outputs (50th percentile)', () => {
      const res = calculator.calculate(4500); // global average = 4500 => 50th percentile
      expect(res.globalPercentile).toBe(50);
    });

    test('21. Places low emitters in high global percentiles', () => {
      const res = calculator.calculate(900); // 900 / 4500 = 0.2 => 100 - 10 = 90th percentile
      expect(res.globalPercentile).toBe(90);
    });

    test('22. Places high emitters in low global percentiles', () => {
      const res = calculator.calculate(9000); // 9000 / 4500 = 2 => 100 - 100 = 0 => capped at 1
      expect(res.globalPercentile).toBe(1);
    });

    test('23. Computes population equivalent factoring citizen scaling', () => {
      const res = calculator.calculate(3600); // (3600 / 1800) * 1.5 = 3
      expect(res.populationEquivalent).toBe(3);
    });

    test('24. Caps global percentile at 99', () => {
      const res = calculator.calculate(10.0); // extremely low
      expect(res.globalPercentile).toBe(99);
    });

    test('25. Floors earths required and population equivalent values at 0.1', () => {
      const res = calculator.calculate(0.0);
      expect(res.earthsRequired).toBe(0.1);
      expect(res.populationEquivalent).toBe(0.1);
    });

    test('26. Rounds calculations to 2 decimal places', () => {
      const res = calculator.calculate(2500);
      // earths = 2500 / 1800 = 1.3888 => 1.39
      expect(res.earthsRequired).toBe(1.39);
    });
  });

  // ==========================================
  // 4. WorldDivergenceAnalyzer Tests (Tests 27-34)
  // ==========================================
  describe('WorldDivergenceAnalyzer', () => {
    const analyzer = new WorldDivergenceAnalyzer();

    const makeFakeWorld = (annual: number, earths: number): Omit<TwinWorld, 'healthIndex'> => ({
      id: 'fake',
      name: 'Fake',
      trajectory: {
        annualEmissionsKg: annual,
        cumulative30DayKg: annual / 12,
        cumulative90DayKg: annual / 4,
        cumulative365DayKg: annual,
        confidence: 0.9,
        snapshots: [],
      },
      impact: { cumulativeEmissionsKg: annual, treesRequiredForOffset: 0, vehicleEquivalentKm: 0, householdEnergyEquivalentDays: 0 },
      earthEquivalent: { earthsRequired: earths, globalPercentile: 50, populationEquivalent: 1 },
      dnaProjection: { currentArchetype: CarbonArchetype.BalancedOptimizer, projectedArchetype: CarbonArchetype.BalancedOptimizer, probability: 0.9, reasoning: [] },
      narrative: { title: '', summary: '', keyChanges: [], evidence: [] },
    });

    test('27. Evaluates divergenceScore based on percentage emissions gap', () => {
      const current = makeFakeWorld(1000, 2);
      const optimized = makeFakeWorld(600, 1.2); // 400 gap = 40% gap. 40 * 2.5 = 100 divergence
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.divergenceScore).toBe(100);
    });

    test('28. Computes accurate emissions gap difference', () => {
      const current = makeFakeWorld(1000, 2);
      const optimized = makeFakeWorld(850, 1.7);
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.emissionsGapKg).toBe(150);
    });

    test('29. Calculates correct sustainability gap percent reduction in earths', () => {
      const current = makeFakeWorld(1000, 2.0);
      const optimized = makeFakeWorld(800, 1.6); // gap = 0.4 earths = 20%
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.sustainabilityGapPercent).toBe(20.0);
    });

    test('30. Extracts key drivers matching top optimization candidates list', () => {
      const current = makeFakeWorld(1000, 2.0);
      const optimized = makeFakeWorld(800, 1.6);
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 10, 40, 30, 1),
      ]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.keyDrivers).toContain('Candidate 1');
    });

    test('31. Handles empty optimization candidates gracefully with default fallback driver', () => {
      const current = makeFakeWorld(1000, 2);
      const optimized = makeFakeWorld(1000, 2);
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.keyDrivers[0]).toBe('No optimization modifications applied');
    });

    test('32. Caps divergence score at 100', () => {
      const current = makeFakeWorld(1000, 2);
      const optimized = makeFakeWorld(100, 0.2); // 90% gap => score = 225 => capped at 100
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.divergenceScore).toBe(100);
    });

    test('33. Floors divergence score and gap percent at 0', () => {
      const current = makeFakeWorld(1000, 2);
      const optimized = makeFakeWorld(1100, 2.2); // optimized is worse
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.divergenceScore).toBe(0);
      expect(div.sustainabilityGapPercent).toBe(0);
    });

    test('34. Prevents division by zero with zero baseline emissions', () => {
      const current = makeFakeWorld(0, 0);
      const optimized = makeFakeWorld(0, 0);
      const plan = makeMockPlan([]);

      const div = analyzer.analyze(current, optimized, plan);
      expect(div.divergenceScore).toBe(0);
    });
  });

  // ==========================================
  // 5. NarrativeGenerator Tests (Tests 35-44)
  // ==========================================
  describe('NarrativeGenerator', () => {
    const generator = new NarrativeGenerator();

    const makeFakeTrajectory = (annual: number): TwinTrajectory => ({
      annualEmissionsKg: annual,
      cumulative30DayKg: annual / 12,
      cumulative90DayKg: annual / 4,
      cumulative365DayKg: annual,
      confidence: 0.9,
      snapshots: [],
    });

    test('35. Builds Current World narrative summary', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(3650);
      const earth = { earthsRequired: 2, globalPercentile: 50, populationEquivalent: 1.5 };
      const res = generator.generate('current', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.title).toBe('Current Trajectory Simulation');
      expect(res.summary).toContain('emissions represent the primary driver');
    });

    test('36. Compiles auditable NarrativeEvidence lists in Current World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(3650);
      const earth = { earthsRequired: 2, globalPercentile: 50, populationEquivalent: 1.5 };
      const res = generator.generate('current', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.evidence.length).toBe(2);
      expect(res.evidence[0].metric).toBe('Baseline Annual Emissions');
      expect(res.evidence[0].value).toBe(3650);
    });

    test('37. Builds Optimized World narrative title and summary', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(2920);
      const earth = { earthsRequired: 1.6, globalPercentile: 60, populationEquivalent: 1.2 };
      const res = generator.generate('optimized', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.title).toBe('Mitigated Target Profile');
      expect(res.summary).toContain('applying the top 3 recommended');
    });

    test('38. Compiles auditable NarrativeEvidence lists in Optimized World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(2920);
      const earth = { earthsRequired: 1.6, globalPercentile: 60, populationEquivalent: 1.2 };
      const res = generator.generate('optimized', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.evidence.length).toBe(2);
      expect(res.evidence[0].metric).toBe('Annual Mitigation Savings');
      expect(res.evidence[0].value).toBe(730.0);
    });

    test('39. Builds Aggressive World narrative summary', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(1825);
      const earth = { earthsRequired: 1.0, globalPercentile: 75, populationEquivalent: 0.8 };
      const res = generator.generate('aggressive', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.title).toBe('Full Sustainability Simulation');
      expect(res.summary).toContain('All identified lifestyle improvements');
    });

    test('40. Compiles auditable NarrativeEvidence lists in Aggressive World', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(1825);
      const earth = { earthsRequired: 1.0, globalPercentile: 75, populationEquivalent: 0.8 };
      const res = generator.generate('aggressive', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.evidence.length).toBe(2);
      expect(res.evidence[0].metric).toBe('Max Reduction Savings');
      expect(res.evidence[0].value).toBe(1825.0);
    });

    test('41. Resolves dominant categories in current summary (food)', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.1, 0.7, 0.1, 0.1)); // food primary
      const traj = makeFakeTrajectory(3650);
      const earth = { earthsRequired: 2, globalPercentile: 50, populationEquivalent: 1.5 };
      const res = generator.generate('current', bp, traj, earth, CarbonArchetype.FoodDominant, 3650);

      expect(res.summary).toContain('Food');
    });

    test('42. Resolves dominant categories in current summary (energy)', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.1, 0.1, 0.7, 0.1)); // energy primary
      const traj = makeFakeTrajectory(3650);
      const earth = { earthsRequired: 2, globalPercentile: 50, populationEquivalent: 1.5 };
      const res = generator.generate('current', bp, traj, earth, CarbonArchetype.EnergyDominant, 3650);

      expect(res.summary).toContain('Energy');
    });

    test('43. Resolves dominant categories in current summary (shopping)', () => {
      const bp = makeMockProfile(makeMockVector(10.0, 0.1, 0.1, 0.1, 0.7)); // shopping primary
      const traj = makeFakeTrajectory(3650);
      const earth = { earthsRequired: 2, globalPercentile: 50, populationEquivalent: 1.5 };
      const res = generator.generate('current', bp, traj, earth, CarbonArchetype.ShoppingDominant, 3650);

      expect(res.summary).toContain('Shopping');
    });

    test('44. Returns exact detailed keyChanges strings for each world', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const traj = makeFakeTrajectory(3650);
      const earth = { earthsRequired: 2, globalPercentile: 50, populationEquivalent: 1.5 };
      const res = generator.generate('current', bp, traj, earth, CarbonArchetype.BalancedOptimizer, 3650);

      expect(res.keyChanges[0]).toBe('Baseline lifestyle behaviors continue unchanged.');
    });
  });

  // ==========================================
  // 6. ScenarioWorldBuilder Tests (Tests 45-50)
  // ==========================================
  describe('ScenarioWorldBuilder', () => {
    const builder = new ScenarioWorldBuilder();

    const makeFakeTrajectory = (annual: number): TwinTrajectory => {
      const snapshots: ForecastSnapshot[] = [
        { day: 30, projectedEmission: annual / 365, lowerBound: 0, upperBound: 0 },
        { day: 90, projectedEmission: annual / 365, lowerBound: 0, upperBound: 0 },
        { day: 180, projectedEmission: annual / 365, lowerBound: 0, upperBound: 0 },
        { day: 365, projectedEmission: annual / 365, lowerBound: 0, upperBound: 0 },
      ];

      return {
        annualEmissionsKg: annual,
        cumulative30DayKg: annual * (30 / 365),
        cumulative90DayKg: annual * (90 / 365),
        cumulative365DayKg: annual,
        confidence: 0.9,
        snapshots: snapshots.map(s => ({
          day: s.day,
          cumulativeEmissionsKg: s.projectedEmission * s.day,
          healthIndex: 0,
        })),
      };
    };

    test('45. Formulates complete TwinWorld structures with correct identifiers', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const dna = makeMockDNA();
      const traj = makeFakeTrajectory(3650);

      const world = builder.buildWorld('current', bp, fp, plan, dna, traj, 3650);
      expect(world.id).toContain('world-current');
      expect(world.name).toBe('Current World');
    });

    test('46. Computes dynamic Planet Health Index (PHI) scores', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const dna = makeMockDNA();
      const traj = makeFakeTrajectory(3650);

      const world = builder.buildWorld('current', bp, fp, plan, dna, traj, 3650);
      expect(world.healthIndex.score).toBeGreaterThan(0);
      expect(world.healthIndex.score).toBeLessThanOrEqual(100);
      expect(world.healthIndex.reasoning.length).toBe(3);
    });

    test('47. Maps custom future DNA projections per world state (optimized)', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const dna = makeMockDNA();
      const traj = makeFakeTrajectory(2920);

      const world = builder.buildWorld('optimized', bp, fp, plan, dna, traj, 3650);
      expect(world.dnaProjection.projectedArchetype).toBe(CarbonArchetype.BalancedOptimizer);
      expect(world.dnaProjection.probability).toBe(0.85);
    });

    test('48. Maps custom future DNA projections per world state (aggressive)', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const dna = makeMockDNA();
      const traj = makeFakeTrajectory(1825);

      const world = builder.buildWorld('aggressive', bp, fp, plan, dna, traj, 3650);
      expect(world.dnaProjection.projectedArchetype).toBe(CarbonArchetype.StableLowEmitter);
      expect(world.dnaProjection.probability).toBe(0.90);
    });

    test('49. Updates snapshots timeline with temporal health index scores', () => {
      const bp = makeMockProfile(makeMockVector(10.0));
      const fp = makeMockForecast(10.0);
      const plan = makeMockPlan([]);
      const dna = makeMockDNA();
      const traj = makeFakeTrajectory(3650);

      const world = builder.buildWorld('current', bp, fp, plan, dna, traj, 3650);
      expect(world.trajectory.snapshots[0].healthIndex).toBeGreaterThan(0);
    });

    test('50. Correctly bounds PHI component ranges (min emissions limit)', () => {
      const bp = makeMockProfile(makeMockVector(1.0)); // low emissions average
      const fp = makeMockForecast(1.0);
      const plan = makeMockPlan([]);
      const dna = makeMockDNA();
      const traj = makeFakeTrajectory(365); // 365 kg annual emissions, below minLimit (1095)

      const world = builder.buildWorld('current', bp, fp, plan, dna, traj, 365);
      expect(world.healthIndex.emissionsComponent).toBe(100);
    });
  });

  // ==========================================
  // 7. TwinAggregator & Engine API Integration Tests (Tests 51-58)
  // ==========================================
  describe('PlanetTwinEngine API Integration', () => {
    const engine = new PlanetTwinEngine();

    test('51. Simulates complete PlanetTwinProfile with all upgrades successfully', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 10, 40, 30, 1),
        makeMockCandidate('2', 'food', 20, 40, 30, 2),
      ]);
      const dna = makeMockDNA();

      const res = engine.simulatePlanetTwin(bp, fp, plan, dna);
      expect(res.success).toBe(true);
      if (res.success) {
        const profile = res.value;
        expect(profile.userId).toBe(userId);
        expect(profile.currentWorld).toBeDefined();
        expect(profile.optimizedWorld).toBeDefined();
        expect(profile.aggressiveWorld).toBeDefined();
        expect(profile.comparativeAnalysis.reductionVsCurrentKg).toBeGreaterThan(0);
        expect(profile.worldDivergence.divergenceScore).toBeGreaterThanOrEqual(0);
        expect(profile.generatedAt).toBeDefined();
      }
    });

    test('52. Resolves highest impact action from comparative aggregator correctly', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan([
        makeMockCandidate('1', 'transport', 10, 40, 30, 1),
      ]);
      const dna = makeMockDNA();

      const res = engine.simulatePlanetTwin(bp, fp, plan, dna);
      if (res.success) {
        expect(res.value.comparativeAnalysis.highestImpactAction).toBe('Candidate 1');
      }
    });

    test('53. Fails when behaviorProfile is missing', () => {
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan();
      const dna = makeMockDNA();
      const res = engine.simulatePlanetTwin(null as never, fp, plan, dna);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('BehaviorProfile is required');
      }
    });

    test('54. Fails when forecastProfile is missing', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const plan = makeMockPlan();
      const dna = makeMockDNA();
      const res = engine.simulatePlanetTwin(bp, null as never, plan, dna);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('ForecastProfile is required');
      }
    });

    test('55. Fails when optimizationPlan is missing', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const dna = makeMockDNA();
      const res = engine.simulatePlanetTwin(bp, fp, null as never, dna);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('OptimizationPlan is required');
      }
    });

    test('56. Fails when carbonDNAProfile is missing', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan();
      const res = engine.simulatePlanetTwin(bp, fp, plan, null as never);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('CarbonDNAProfile is required');
      }
    });

    test('57. Fails when user IDs do not match across profiles', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0, 'user-mismatch');
      const plan = makeMockPlan();
      const dna = makeMockDNA();

      const res = engine.simulatePlanetTwin(bp, fp, plan, dna);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('User IDs in all profiles must match');
      }
    });

    test('58. Catches exceptions and returns failure result gracefully', () => {
      const bp = makeMockProfile(makeMockVector(12.0));
      const fp = makeMockForecast(12.0);
      const plan = makeMockPlan();
      const dna = makeMockDNA();
      // Corrupt profile to force exception
      bp.featureVector = null as never;

      const res = engine.simulatePlanetTwin(bp, fp, plan, dna);
      expect(res.success).toBe(false);
    });
  });
});

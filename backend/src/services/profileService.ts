import { 
  BehaviorProfile, 
  ForecastProfile, 
  OptimizationPlan, 
  CarbonDNAProfile, 
  PlanetTwinProfile,
  UserProfile,
  CarbonArchetype,
  DNAEvolutionDirection
} from '@carbonsense/shared-types';

/**
 * Retrieval service for user carbon footprint profiles.
 * Hardened to support local execution of all CarbonSense engines 
 * when operating in deterministic Offline Intelligence Mode.
 */
export function getUserProfile(userId: string): UserProfile {
  return {
    id: userId,
    username: 'EcoWarrior',
    avatarUrl: null,
    country: 'default',
    isOnboarded: true,
    targetReductionGoal: 25,
    createdAt: new Date()
  };
}

export function getUserContextProfiles(userId: string): {
  behaviorProfile: BehaviorProfile;
  forecastProfile: ForecastProfile;
  optimizationPlan: OptimizationPlan;
  carbonDNAProfile: CarbonDNAProfile;
  planetTwinProfile: PlanetTwinProfile;
} {
  const behaviorProfile: BehaviorProfile = {
    userId,
    signals: [
      {
        id: 'sig-1',
        type: 'HighCarDependency',
        description: 'Frequent short car trips detected',
        strength: 0.85,
        confidence: 0.9,
        reasoning: '85% of transport emissions are from petrol vehicle trips',
        evidence: { quantity: 150, count: 12, ratio: 0.85, timeframeDays: 30 },
        detectedAt: new Date()
      }
    ],
    trends: [
      {
        id: 'tr-1',
        trendType: 'total_emissions',
        direction: 'Stable',
        changePercent: 1.2,
        confidence: 0.88,
        timeWindow: '30d',
        generatedAt: new Date()
      }
    ],
    classification: 'Mixed',
    riskScore: 45,
    featureVector: {
      userId,
      dailyEmissionsMean: 8.5,
      dailyEmissionsStdDev: 2.1,
      transportRatio: 0.5,
      foodRatio: 0.3,
      energyRatio: 0.15,
      shoppingRatio: 0.05,
      weeklyBeefCount: 1,
      monthlyFlightCount: 0,
      weekendMultiplier: 1.1
    },
    generatedAt: new Date()
  };

  const forecastProfile: ForecastProfile = {
    userId,
    baseline: {
      '30d': { horizonDays: 30, snapshots: [{ day: 30, projectedEmission: 255.0, lowerBound: 230, upperBound: 280 }], confidence: 0.85, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } },
      '90d': { horizonDays: 90, snapshots: [], confidence: 0.8, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } },
      '365d': { horizonDays: 365, snapshots: [], confidence: 0.7, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } }
    },
    trendAdjusted: {
      '30d': { horizonDays: 30, snapshots: [{ day: 30, projectedEmission: 204.0, lowerBound: 180, upperBound: 230 }], confidence: 0.82, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } },
      '90d': { horizonDays: 90, snapshots: [], confidence: 0.78, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } },
      '365d': { horizonDays: 365, snapshots: [], confidence: 0.65, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } }
    },
    momentum: {
      '30d': { horizonDays: 30, snapshots: [], confidence: 0.8, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } },
      '90d': { horizonDays: 90, snapshots: [], confidence: 0.75, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } },
      '365d': { horizonDays: 365, snapshots: [], confidence: 0.6, reasoning: { factors: [], assumptions: [], confidenceDrivers: [] } }
    },
    scenarios: [],
    riskDrivers: [{ driver: 'Commuting in petrol car', contribution: 55 }],
    counterfactuals: [],
    integrity: { score: 92, reasons: ['Sufficiency criteria met'] },
    generatedAt: new Date()
  };

  const optimizationPlan: OptimizationPlan = {
    id: 'plan-1',
    userId,
    candidates: [
      {
        id: 'cand-1',
        interventionId: 'int-1',
        title: 'Switch to Public Transit',
        description: 'Take the train or bus instead of driving your petrol car',
        category: 'transport',
        estimatedSavingsKg: 51.0,
        difficultyScore: 30,
        difficultyLevel: 'easy',
        resistanceScore: { score: 20, riskFactor: 0.1, habitStrength: 0.3, reasoning: 'Low resistance indicated' },
        score: 85,
        reasoning: 'High savings and low implementation difficulty.',
        rank: 1
      }
    ],
    tradeoffs: [],
    generatedAt: new Date()
  };

  const carbonDNAProfile: CarbonDNAProfile = {
    id: 'dna-1',
    userId,
    carbonPersonaType: 'Transport Heavy',
    primaryCategory: 'transport',
    primaryEmissionsRatio: 0.5,
    behavioralScore: 45,
    archetype: CarbonArchetype.TransportDominant,
    archetypeConfidence: 85,
    dimensions: {
      emissionIntensity: 55,
      behaviorVolatility: 30,
      optimizationReadiness: 75,
      interventionResistance: 20,
      forecastReliability: 88
    },
    archetypeEvidence: [],
    evolution: {
      direction: DNAEvolutionDirection.Improving,
      projected30dChangePercent: -5.0,
      projected90dChangePercent: -12.0,
      confidenceScore: 80,
      reasoning: 'Active optimization steps logged',
      futureProjection: {
        currentArchetype: CarbonArchetype.TransportDominant,
        projectedArchetype: CarbonArchetype.BalancedOptimizer,
        probability: 0.75,
        reasoning: []
      }
    },
    lastUpdated: new Date()
  };

  const planetTwinProfile: PlanetTwinProfile = {
    userId,
    currentWorld: {
      id: 'w-curr',
      name: 'Current Future',
      trajectory: { annualEmissionsKg: 3102, cumulative30DayKg: 255, cumulative90DayKg: 765, cumulative365DayKg: 3102, confidence: 0.85, snapshots: [] },
      impact: { cumulativeEmissionsKg: 255, treesRequiredForOffset: 12, vehicleEquivalentKm: 1214, householdEnergyEquivalentDays: 310 },
      earthEquivalent: { earthsRequired: 2.1, globalPercentile: 65, populationEquivalent: 2.1 },
      dnaProjection: { currentArchetype: CarbonArchetype.TransportDominant, projectedArchetype: CarbonArchetype.TransportDominant, probability: 0.85, reasoning: [] },
      narrative: { title: 'Current Future Projection', summary: 'Steady state emissions continue.', keyChanges: [], evidence: [] },
      healthIndex: { score: 45, emissionsComponent: 40, sustainabilityComponent: 45, optimizationComponent: 50, reasoning: [] }
    },
    optimizedWorld: {
      id: 'w-opt',
      name: 'Optimized Future',
      trajectory: { annualEmissionsKg: 2482, cumulative30DayKg: 204, cumulative90DayKg: 612, cumulative365DayKg: 2482, confidence: 0.82, snapshots: [] },
      impact: { cumulativeEmissionsKg: 204, treesRequiredForOffset: 9, vehicleEquivalentKm: 971, householdEnergyEquivalentDays: 248 },
      earthEquivalent: { earthsRequired: 1.7, globalPercentile: 50, populationEquivalent: 1.7 },
      dnaProjection: { currentArchetype: CarbonArchetype.TransportDominant, projectedArchetype: CarbonArchetype.BalancedOptimizer, probability: 0.75, reasoning: [] },
      narrative: { title: 'Optimized Future Projection', summary: 'Carbon output drops as transit optimization is adopted.', keyChanges: [], evidence: [] },
      healthIndex: { score: 65, emissionsComponent: 60, sustainabilityComponent: 65, optimizationComponent: 70, reasoning: [] }
    },
    aggressiveWorld: {
      id: 'w-agg',
      name: 'Aggressive Future',
      trajectory: { annualEmissionsKg: 1980, cumulative30DayKg: 162, cumulative90DayKg: 486, cumulative365DayKg: 1980, confidence: 0.78, snapshots: [] },
      impact: { cumulativeEmissionsKg: 162, treesRequiredForOffset: 7, vehicleEquivalentKm: 771, householdEnergyEquivalentDays: 198 },
      earthEquivalent: { earthsRequired: 1.3, globalPercentile: 35, populationEquivalent: 1.3 },
      dnaProjection: { currentArchetype: CarbonArchetype.TransportDominant, projectedArchetype: CarbonArchetype.StableLowEmitter, probability: 0.65, reasoning: [] },
      narrative: { title: 'Aggressive Future Projection', summary: 'Significant emissions cuts on diet and transport.', keyChanges: [], evidence: [] },
      healthIndex: { score: 78, emissionsComponent: 75, sustainabilityComponent: 78, optimizationComponent: 80, reasoning: [] }
    },
    comparativeAnalysis: {
      reductionVsCurrentKg: 620,
      reductionVsCurrentPercent: 20,
      highestImpactAction: 'Switch to transit',
      highestRiskDriver: 'Car commuting'
    },
    worldDivergence: {
      divergenceScore: 20,
      emissionsGapKg: 51,
      sustainabilityGapPercent: 15,
      keyDrivers: ['Transport modal split']
    },
    generatedAt: new Date().toISOString()
  };

  return {
    behaviorProfile,
    forecastProfile,
    optimizationPlan,
    carbonDNAProfile,
    planetTwinProfile
  };
}

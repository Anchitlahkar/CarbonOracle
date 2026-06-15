import { 
  UserProfile, 
  CarbonEntry, 
  BehaviorProfile, 
  ForecastProfile, 
  OptimizationPlan, 
  CarbonDNAProfile, 
  PlanetTwinProfile,
  CarbonArchetype,
  DNAEvolutionDirection,
  ForecastProjection,
  ForecastSnapshot
} from '@carbonsense/shared-types';

export const demoUser: UserProfile = {
  id: 'demo-user-id',
  username: 'Demo Judge',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoJudge',
  country: 'IN',
  isOnboarded: true,
  targetReductionGoal: 30,
  createdAt: new Date('2026-05-15T00:00:00Z'),
};

const now = new Date('2026-06-15T00:00:00Z');

// Generates an offset date
const daysAgo = (d: number) => {
  const date = new Date(now.getTime());
  date.setDate(date.getDate() - d);
  return date;
};

// 1. Carbon Entries (Past 30 Days)
export const demoCarbonEntries: CarbonEntry[] = [
  {
    id: 'entry-1',
    userId: demoUser.id,
    category: 'transport',
    subCategory: 'Petrol Sedan Commute',
    amountKg: 24.5,
    source: 'manual',
    metadata: { distanceKm: 80 },
    loggedAt: daysAgo(1)
  },
  {
    id: 'entry-2',
    userId: demoUser.id,
    category: 'food',
    subCategory: 'Grocery Scanner Check',
    amountKg: 12.8,
    source: 'scanner',
    metadata: { scannedItems: 5, confidence: 0.95 },
    loggedAt: daysAgo(2)
  },
  {
    id: 'entry-3',
    userId: demoUser.id,
    category: 'energy',
    subCategory: 'AC electricity bill',
    amountKg: 42.0,
    source: 'manual',
    metadata: { kwh: 120 },
    loggedAt: daysAgo(4)
  },
  {
    id: 'entry-4',
    userId: demoUser.id,
    category: 'shopping',
    subCategory: 'Electronics & Apparel',
    amountKg: 18.6,
    source: 'manual',
    metadata: { itemsCount: 3 },
    loggedAt: daysAgo(6)
  },
  {
    id: 'entry-5',
    userId: demoUser.id,
    category: 'transport',
    subCategory: 'Short flight Mumbai-Goa',
    amountKg: 145.0,
    source: 'manual',
    metadata: { flightHours: 1.5 },
    loggedAt: daysAgo(10)
  },
  {
    id: 'entry-6',
    userId: demoUser.id,
    category: 'food',
    subCategory: 'Red Meat Premium Meal',
    amountKg: 14.5,
    source: 'manual',
    metadata: { beefWeightGrams: 400 },
    loggedAt: daysAgo(12)
  },
  {
    id: 'entry-7',
    userId: demoUser.id,
    category: 'energy',
    subCategory: 'Home heating',
    amountKg: 38.0,
    source: 'manual',
    metadata: { therms: 8 },
    loggedAt: daysAgo(15)
  },
  {
    id: 'entry-8',
    userId: demoUser.id,
    category: 'transport',
    subCategory: 'Metro Train Commute',
    amountKg: 2.1,
    source: 'manual',
    metadata: { distanceKm: 25 },
    loggedAt: daysAgo(18)
  },
  {
    id: 'entry-9',
    userId: demoUser.id,
    category: 'food',
    subCategory: 'Local Organic Meal',
    amountKg: 1.2,
    source: 'manual',
    metadata: { plantBased: true },
    loggedAt: daysAgo(20)
  },
  {
    id: 'entry-10',
    userId: demoUser.id,
    category: 'shopping',
    subCategory: 'LED Light Bulbs (saving)',
    amountKg: -8.0,
    source: 'manual',
    metadata: { energyEfficiencyAction: true },
    loggedAt: daysAgo(25)
  }
];

// 2. Behavior Profile
export const demoBehaviorProfile: BehaviorProfile = {
  userId: demoUser.id,
  signals: [
    {
      id: 'sig-1',
      type: 'HighCarDependency',
      description: 'Frequent private petrol sedan use detects high transport reliance.',
      strength: 0.85,
      confidence: 0.90,
      reasoning: 'Logged commutes average 80km in private vehicle multiple times a week.',
      evidence: { quantity: 180, count: 5, ratio: 0.58, timeframeDays: 30 },
      detectedAt: daysAgo(2)
    },
    {
      id: 'sig-2',
      type: 'OccasionalRedMeatExcess',
      description: 'Occasional high-footprint red meat logging observed.',
      strength: 0.70,
      confidence: 0.85,
      reasoning: 'Logged red meat entries exceed average regional recommended benchmarks.',
      evidence: { quantity: 14.5, count: 1, ratio: 0.15, timeframeDays: 30 },
      detectedAt: daysAgo(5)
    },
    {
      id: 'sig-3',
      type: 'ProactiveEnergySaving',
      description: 'Smart energy efficiency habits detected through positive offsets.',
      strength: 0.65,
      confidence: 0.80,
      reasoning: 'Manual log of negative LED bulb installation indicates active optimization interest.',
      evidence: { quantity: -8.0, count: 1, ratio: -0.05, timeframeDays: 30 },
      detectedAt: daysAgo(25)
    }
  ],
  trends: [
    {
      id: 'tr-1',
      trendType: 'total_emissions',
      direction: 'Decreasing',
      changePercent: -6.2,
      confidence: 0.88,
      timeWindow: '30d',
      generatedAt: daysAgo(1)
    },
    {
      id: 'tr-2',
      trendType: 'category_transport',
      direction: 'Stable',
      changePercent: 0.4,
      confidence: 0.92,
      timeWindow: '30d',
      generatedAt: daysAgo(1)
    }
  ],
  classification: 'TransportHeavy',
  riskScore: 68,
  featureVector: {
    userId: demoUser.id,
    dailyEmissionsMean: 18.2,
    dailyEmissionsStdDev: 4.8,
    transportRatio: 0.58,
    foodRatio: 0.16,
    energyRatio: 0.20,
    shoppingRatio: 0.06,
    weeklyBeefCount: 1,
    monthlyFlightCount: 1,
    weekendMultiplier: 1.2
  },
  generatedAt: daysAgo(1)
};

// Helper to generate snapshots for forecasts
const generateForecastSnapshots = (days: number, startKg: number, rate: number): ForecastSnapshot[] => {
  const snapshots: ForecastSnapshot[] = [];
  for (let i = 1; i <= days; i++) {
    const value = startKg + rate * i + Math.sin(i / 2) * 1.5;
    snapshots.push({
      day: i,
      projectedEmission: Math.max(0.5, value),
      lowerBound: Math.max(0.1, value - 2 - i * 0.05),
      upperBound: value + 2 + i * 0.05
    });
  }
  return snapshots;
};

const createProjection = (days: number, startKg: number, rate: number): ForecastProjection => ({
  horizonDays: days,
  snapshots: generateForecastSnapshots(days, startKg, rate),
  confidence: 0.85 - (days > 90 ? 0.15 : 0.05),
  reasoning: {
    factors: ['Daily commute volume', 'Electricity consumption index', 'Dietary pattern trends'],
    assumptions: ['Stable fuel pricing', 'Moderate seasonal temperature variance'],
    confidenceDrivers: ['Historical consistency', 'High data sufficiency score']
  }
});

// 3. Forecast Profile
export const demoForecastProfile: ForecastProfile = {
  userId: demoUser.id,
  baseline: {
    '30d': createProjection(30, 18.2, 0.05),
    '90d': createProjection(90, 18.2, 0.03),
    '365d': createProjection(365, 18.2, 0.01)
  },
  trendAdjusted: {
    '30d': createProjection(30, 18.2, -0.02),
    '90d': createProjection(90, 18.2, -0.03),
    '365d': createProjection(365, 18.2, -0.05)
  },
  momentum: {
    '30d': createProjection(30, 18.2, 0.08),
    '90d': createProjection(90, 18.2, 0.07),
    '365d': createProjection(365, 18.2, 0.05)
  },
  scenarios: [
    {
      scenarioName: 'Public Transit Adoption',
      projectedEmissions: createProjection(90, 18.2, -0.15),
      reductionAmountKg: 450,
      reductionPercent: 28,
      confidenceScore: 85,
      reasoning: 'Replacing daily private car commute with electric metro train systems drops transport emissions by over 70%.'
    },
    {
      scenarioName: 'Plant-Based Transition',
      projectedEmissions: createProjection(90, 18.2, -0.06),
      reductionAmountKg: 130,
      reductionPercent: 12,
      confidenceScore: 78,
      reasoning: 'Adopting vegetarian alternatives for weekdays eliminates beef-related agricultural footprints.'
    }
  ],
  riskDrivers: [
    { driver: 'Private Petrol Transportation', contribution: 58 },
    { driver: 'Seasonal Air Conditioning Usage', contribution: 20 },
    { driver: 'Meat-Based Diet Habits', contribution: 16 },
    { driver: 'Apparel and Consumer Shopping', contribution: 6 }
  ],
  counterfactuals: [
    {
      action: 'Swapping car for metro line commute',
      historicalImpactKg: -22.4,
      alternativeOutcomeKg: 2.1,
      confidence: 0.92,
      reasoning: 'Calculated using standardized local diesel vs electric grid railway coefficients.'
    },
    {
      action: 'Preparing home-cooked vegetarian lunch',
      historicalImpactKg: -6.5,
      alternativeOutcomeKg: 0.8,
      confidence: 0.85,
      reasoning: 'Based on global farmgate-to-retail lifecycle database comparisons.'
    }
  ],
  integrity: {
    score: 94,
    reasons: ['No missing data points in active log days', 'Verified localized grid values applied']
  },
  generatedAt: daysAgo(1)
};

// 4. Optimization Plan
export const demoOptimizationPlan: OptimizationPlan = {
  id: 'plan-demo',
  userId: demoUser.id,
  candidates: [
    {
      id: 'cand-1',
      interventionId: 'int-transit',
      title: 'Adopt Public Metro Transit',
      description: 'Switch your 80km daily petrol car commute to local express metro trains.',
      category: 'transport',
      estimatedSavingsKg: 51.2,
      difficultyScore: 35,
      difficultyLevel: 'easy',
      resistanceScore: {
        score: 25,
        riskFactor: 0.15,
        habitStrength: 0.35,
        reasoning: 'Metro is cheaper and faster, lower resistance detected.'
      },
      score: 88,
      reasoning: 'Very high savings yield with low capital requirements and moderate transit availability.',
      rank: 1
    },
    {
      id: 'cand-2',
      interventionId: 'int-thermostat',
      title: 'Smart Thermostat & Offsets',
      description: 'Optimize AC temperatures by 2°C and schedule operations for non-peak grid hours.',
      category: 'energy',
      estimatedSavingsKg: 15.6,
      difficultyScore: 20,
      difficultyLevel: 'easy',
      resistanceScore: {
        score: 10,
        riskFactor: 0.05,
        habitStrength: 0.15,
        reasoning: 'Fully automated adjustment minimizes friction.'
      },
      score: 82,
      reasoning: 'Instant savings yield with near-zero friction; highly recommended behavioral nudge.',
      rank: 2
    },
    {
      id: 'cand-3',
      interventionId: 'int-beef',
      title: 'Vegetarian Dinner Switch',
      description: 'Replace red meat meals with locally-sourced plant alternatives during weekdays.',
      category: 'food',
      estimatedSavingsKg: 24.8,
      difficultyScore: 55,
      difficultyLevel: 'medium',
      resistanceScore: {
        score: 45,
        riskFactor: 0.30,
        habitStrength: 0.60,
        reasoning: 'Dietary habits present moderate inertia and cultural preference.'
      },
      score: 71,
      reasoning: 'Significant potential footprint savings, balanced by medium habit transition friction.',
      rank: 3
    },
    {
      id: 'cand-4',
      interventionId: 'int-apparel',
      title: 'Circular Shopping Purchase',
      description: 'Source next apparel upgrade from thrift shops or circular marketplaces.',
      category: 'shopping',
      estimatedSavingsKg: 10.4,
      difficultyScore: 40,
      difficultyLevel: 'easy',
      resistanceScore: {
        score: 30,
        riskFactor: 0.20,
        habitStrength: 0.40,
        reasoning: 'Thrifting availability requires minor logistical research.'
      },
      score: 65,
      reasoning: 'Moderate impact savings; helps build zero-waste behavioral pattern.',
      rank: 4
    }
  ],
  tradeoffs: [
    {
      category: 'transport',
      potentialSavingsKg: 196.2,
      averageDifficulty: 35,
      averageResistance: 25,
      candidateCount: 1,
      description: 'Highest footprint lever. Changing modal splits delivers rapid reductions.'
    },
    {
      category: 'energy',
      potentialSavingsKg: 42.0,
      averageDifficulty: 20,
      averageResistance: 10,
      candidateCount: 1,
      description: 'Low hanging fruit. Easy configuration yields reliable home efficiency gains.'
    },
    {
      category: 'food',
      potentialSavingsKg: 28.5,
      averageDifficulty: 55,
      averageResistance: 45,
      candidateCount: 1,
      description: 'High frequency optimization opportunity. Focus on local seasonal products.'
    }
  ],
  generatedAt: daysAgo(1)
};

// 5. Carbon DNA Profile
export const demoCarbonDNAProfile: CarbonDNAProfile = {
  id: 'dna-demo',
  userId: demoUser.id,
  carbonPersonaType: 'Transport Heavy',
  primaryCategory: 'transport',
  primaryEmissionsRatio: 0.58,
  behavioralScore: 45,
  archetype: CarbonArchetype.TransportDominant,
  archetypeConfidence: 91,
  dimensions: {
    emissionIntensity: 68,
    behaviorVolatility: 45,
    optimizationReadiness: 80,
    interventionResistance: 25,
    forecastReliability: 94
  },
  archetypeEvidence: [
    {
      factor: 'Transportation Commutes',
      contribution: 58,
      reasoning: 'Sedan travel constitutes major chunk of monthly emissions profile.'
    },
    {
      factor: 'Grocery Log Audits',
      contribution: 16,
      reasoning: 'Red meat entries represent secondary behavioral footprint source.'
    }
  ],
  evolution: {
    direction: DNAEvolutionDirection.Improving,
    projected30dChangePercent: -7.5,
    projected90dChangePercent: -15.2,
    confidenceScore: 85,
    reasoning: 'Strong alignment with smart energy suggestions and transit swaps indicated.',
    futureProjection: {
      currentArchetype: CarbonArchetype.TransportDominant,
      projectedArchetype: CarbonArchetype.BalancedOptimizer,
      probability: 0.76,
      reasoning: ['Metro adoption interest', 'Positive HVAC offset values logged']
    }
  },
  lastUpdated: daysAgo(1)
};

// Helper for Planet Twin World details
const createDemoWorld = (
  id: string,
  name: string,
  annualKg: number,
  earths: number,
  healthScore: number,
  summary: string,
  keyChanges: string[]
): import("@carbonsense/shared-types").TwinWorld => ({
  id,
  name,
  trajectory: {
    annualEmissionsKg: annualKg,
    cumulative30DayKg: Math.round(annualKg / 12),
    cumulative90DayKg: Math.round(annualKg / 4),
    cumulative365DayKg: annualKg,
    confidence: 0.88,
    snapshots: [
      { day: 1, cumulativeEmissionsKg: 10, healthIndex: healthScore },
      { day: 10, cumulativeEmissionsKg: 120, healthIndex: healthScore },
      { day: 30, cumulativeEmissionsKg: Math.round(annualKg / 12), healthIndex: healthScore }
    ]
  },
  impact: {
    cumulativeEmissionsKg: Math.round(annualKg / 12),
    treesRequiredForOffset: Math.ceil(annualKg / 200),
    vehicleEquivalentKm: Math.round(annualKg * 4),
    householdEnergyEquivalentDays: Math.round(annualKg * 0.1)
  },
  earthEquivalent: {
    earthsRequired: earths,
    globalPercentile: earths > 2.0 ? 75 : (earths > 1.5 ? 45 : 15),
    populationEquivalent: earths
  },
  dnaProjection: {
    currentArchetype: CarbonArchetype.TransportDominant,
    projectedArchetype: earths > 2.0 ? CarbonArchetype.TransportDominant : (earths > 1.5 ? CarbonArchetype.BalancedOptimizer : CarbonArchetype.StableLowEmitter),
    probability: 0.80,
    reasoning: ['Behavior tracking projections']
  },
  narrative: {
    title: name + ' Simulation',
    summary,
    keyChanges,
    evidence: [
      { metric: 'Annual CO2 Intensity', value: annualKg, reason: 'Total projected lifecycle output' },
      { metric: 'Bio-capacity Strain', value: earths, reason: 'Number of Planet Earths needed' }
    ]
  },
  healthIndex: {
    score: healthScore,
    emissionsComponent: Math.round(healthScore * 0.9),
    sustainabilityComponent: Math.round(healthScore * 1.0),
    optimizationComponent: Math.round(healthScore * 1.1),
    reasoning: ['Atmospheric simulation analytics']
  }
});

// 6. Planet Twin Profile
export const demoPlanetTwinProfile: PlanetTwinProfile = {
  userId: demoUser.id,
  currentWorld: createDemoWorld(
    'world-current',
    'Current Trajectory Future',
    6540,
    2.3,
    42,
    'Continuation of private transportation dependency and baseline grid usage. Atmospheric CO2 levels rise steadily, causing significant forest offset depletion.',
    ['Private vehicle commute remains default', 'Red meat consumption stable at historical frequency', 'No energy scheduling applied']
  ),
  optimizedWorld: createDemoWorld(
    'world-optimized',
    'Optimized Future Scenario',
    4680,
    1.6,
    67,
    'Commute shifted to Metro transit. Air conditioning scheduled. Meat-free weekdays implemented. Atmospheric concentration curves flatten.',
    ['Metro usage reaches 75% of travel journeys', 'HVAC system running on scheduled eco-timers', '50% reduction in red meat footprint']
  ),
  aggressiveWorld: createDemoWorld(
    'world-aggressive',
    'Net Zero Aggressive Shift',
    3120,
    1.1,
    88,
    'All travel shifted to trains and bicycles. 100% plant-based local organic diet. Strict zero-waste packaging grocery policy and local offsets.',
    ['Zero fuel-based transit logs', 'Full adoption of plant-based local diets', 'Zero-waste circular apparel shopping only']
  ),
  comparativeAnalysis: {
    reductionVsCurrentKg: 1860,
    reductionVsCurrentPercent: 28,
    highestImpactAction: 'Transitioning to Metro Transit',
    highestRiskDriver: 'Private Petrol Sedan Combustion'
  },
  worldDivergence: {
    divergenceScore: 35,
    emissionsGapKg: 155,
    sustainabilityGapPercent: 30,
    keyDrivers: ['Transport modal choices', 'Dietary proteins selection', 'Home energy efficiency policies']
  },
  generatedAt: daysAgo(1).toISOString()
};

// 7. AI Coach History (Pre-loaded Conversations)
export const demoChatHistory = [
  {
    id: 'welcome',
    role: 'model',
    content: 'Hello. I am TERRA, your carbon intelligence assistant. I have synthesized your behavior logs, forecasts, and Carbon DNA to help you build an action roadmap. How can I guide you today?'
  },
  {
    id: 'msg-1',
    role: 'user',
    content: 'What is my highest impact carbon driver and how can I optimize it?'
  },
  {
    id: 'msg-2',
    role: 'model',
    content: 'Based on your behavior profile, **Transportation** is your primary driver, accounting for **58%** of your total emissions (averaging 18.2 kg daily). The single most effective action you can take is switching your daily 80km commute from your petrol sedan to the local Metro transit. This single change saves **51.2 kg CO2e** per week, moving your Planet Twin simulation footprint from **2.3 earths** down to **1.6 earths**.'
  }
];

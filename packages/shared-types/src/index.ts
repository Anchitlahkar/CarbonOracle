import { DomainEvent } from '@carbonsense/core';

// 1. User Profile
export interface UserProfile {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  country: string | null;
  isOnboarded: boolean;
  targetReductionGoal: number | null; // e.g. 25 for 25% reduction
  createdAt: Date;
}

// 2. Carbon Category
export type CarbonCategory = 'transport' | 'food' | 'energy' | 'shopping';

// 3. Carbon Entry
export interface CarbonEntry {
  id: string;
  userId: string;
  category: CarbonCategory;
  subCategory: string;
  amountKg: number;
  source: 'manual' | 'scanner' | 'ai_coach';
  metadata: Record<string, any> | null;
  loggedAt: Date;
}

// 4. Carbon Prediction
export interface CarbonPrediction {
  id: string;
  userId: string;
  date: Date;
  predictedAmountKg: number;
  confidence: number; // 0 to 1
  factors: string[];
}

// 5. Behavior Metrics & Profiles
export interface BehaviorEvidence {
  quantity: number;
  count: number;
  ratio: number;
  timeframeDays: number;
}

export interface BehaviorSignal {
  id: string;
  type: string; // e.g. "HighCarDependency", "FrequentBeefConsumption", etc.
  description: string;
  strength: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  evidence: BehaviorEvidence;
  detectedAt: Date;
}

export interface BehaviorTrend {
  id: string;
  trendType: string; // e.g. "total_emissions", "category_transport"
  direction: 'Increasing' | 'Decreasing' | 'Stable';
  changePercent: number;
  confidence: number;
  timeWindow: '7d' | '30d' | '90d';
  generatedAt: Date;
}

export interface BehaviorFeatureVector {
  userId: string;
  dailyEmissionsMean: number;
  dailyEmissionsStdDev: number;
  transportRatio: number; // 0 to 1
  foodRatio: number;
  energyRatio: number;
  shoppingRatio: number;
  weeklyBeefCount: number;
  monthlyFlightCount: number;
  weekendMultiplier: number; // weekend emissions / weekday average
}

export interface BehaviorSnapshot {
  userId: string;
  featureVector: BehaviorFeatureVector;
  generatedAt: Date;
}

export type BehaviorClassification =
  | 'TransportHeavy'
  | 'FoodHeavy'
  | 'EnergyHeavy'
  | 'ShoppingHeavy'
  | 'Balanced'
  | 'Mixed';

export interface BehaviorProfile {
  userId: string;
  signals: BehaviorSignal[];
  trends: BehaviorTrend[];
  classification: BehaviorClassification;
  riskScore: number; // 0 to 100
  featureVector: BehaviorFeatureVector;
  generatedAt: Date;
}

// 6. Optimization Plan
export interface BehaviorResistanceScore {
  score: number; // 0 to 100
  riskFactor: number; // 0 to 1
  habitStrength: number; // 0 to 1
  reasoning: string;
}

export interface OptimizationCandidate {
  id: string;
  interventionId: string;
  title: string;
  description: string;
  category: CarbonCategory;
  estimatedSavingsKg: number;
  difficultyScore: number; // 0 to 100
  difficultyLevel: 'easy' | 'medium' | 'hard';
  resistanceScore: BehaviorResistanceScore;
  score: number; // MCDA score
  reasoning: string;
}

export interface OptimizationTradeoff {
  category: CarbonCategory;
  potentialSavingsKg: number;
  averageDifficulty: number; // 0 to 100
  averageResistance: number; // 0 to 100
  candidateCount: number;
  description: string;
}

export interface OptimizationPlan {
  id: string;
  userId: string;
  candidates: OptimizationCandidate[];
  tradeoffs: OptimizationTradeoff[];
  generatedAt: Date;
}


// 7. Carbon DNA Profile
export interface CarbonDNAProfile {
  id: string;
  userId: string;
  carbonPersonaType: string; // e.g., 'High Flyer', 'Eco Enthusiast', 'Urban Commuter'
  primaryCategory: CarbonCategory;
  primaryEmissionsRatio: number; // e.g., 0.65 for 65% of emissions
  behavioralScore: number; // 0-100 score
  lastUpdated: Date;
}

// 8. Simulation State (Planet Twin)
export interface SimulationState {
  id: string;
  userId: string;
  temperatureDeltaCelsius: number;
  carbonPartsPerMillion: number;
  forestCoverHectares: number;
  glacierMeltdownPercentage: number;
  computedAt: Date;
}

// 9. Scientific Reference
export interface ScientificReference {
  id: string;
  title: string;
  organization: string;
  publicationYear: number;
  url?: string;
  doi?: string;
  citation: string;
}

// 10. Emission Factor (Versioned & Localized)
export interface EmissionFactor {
  id: string;
  category: CarbonCategory;
  subCategory: string;
  value: number; // base emission factor
  unit: string; // base unit (e.g. "km", "kg", "kwh")
  source: string;
  sourceYear: number;
  version: string;
  confidence: number; // 0 to 1
  uncertaintyPercent: number; // uncertainty range as percentage
  validFrom: string;
  validTo?: string | null;
  country?: string; // Optional localized country filter
  referenceIds: string[];
}

// 11. Methodology Metadata
export interface MethodologyMetadata {
  id: string;
  version: string;
  description: string;
  assumptions: string[];
  references: string[];
}

// 12. Factor Selection Reason
export interface FactorSelectionReason {
  factorId: string;
  reason: string;
  fallbackUsed: boolean;
  countryOverrideApplied: boolean;
}

// 13. Calculation Audit
export interface CalculationAudit {
  emissionFactorId: string;
  sourceIdentifier: string;
  methodologyVersion: string;
  unitConversionApplied: boolean;
  conversionPath: string[];
  selectionReason: FactorSelectionReason;
  timestamp: string;
}

// 14. Carbon Calculation Result
export interface CarbonCalculationResult {
  value: number; // final calculated carbon in kg CO2e
  confidenceScore: number;
  lowerBound: number;
  upperBound: number;
  methodologyVersion: string;
  sourceIdentifier: string;
  audit: CalculationAudit;
}

// 15. Forecast Structures
export interface ForecastConfidence {
  thirtyDay: number;
  ninetyDay: number;
  yearly: number;
}

export interface ForecastSnapshot {
  day: number;
  projectedEmission: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastReasoning {
  factors: string[];
  assumptions: string[];
  confidenceDrivers: string[];
}

export interface RiskDriver {
  driver: string;
  contribution: number; // contribution percent (0-100)
}

export interface ScenarioDefinition {
  reduction: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  difficulty: 'Easy' | 'Medium' | 'Hard';
  implementationConfidence: number; // 0.0 to 1.0
  reasoning: string;
}

export interface ForecastInput {
  userId: string;
  behaviorProfile: BehaviorProfile;
  historyDaysCount: number; // for data sufficiency checks
}

export interface ForecastProjection {
  horizonDays: number;
  snapshots: ForecastSnapshot[];
  confidence: number;
  reasoning: ForecastReasoning;
}

export interface ForecastScenarioResult {
  scenarioName: string;
  projectedEmissions: ForecastProjection;
  reductionAmountKg: number;
  reductionPercent: number;
  confidenceScore: number;
  reasoning: string;
}

export interface ForecastIntegrity {
  score: number;
  reasons: string[];
}

export interface CounterfactualResult {
  action: string;
  historicalImpactKg: number;
  alternativeOutcomeKg: number;
  confidence: number;
  reasoning: string;
}

export interface ForecastProfile {
  userId: string;
  baseline: Record<'30d' | '90d' | '365d', ForecastProjection>;
  trendAdjusted: Record<'30d' | '90d' | '365d', ForecastProjection>;
  momentum: Record<'30d' | '90d' | '365d', ForecastProjection>;
  scenarios: ForecastScenarioResult[];
  riskDrivers: RiskDriver[];
  counterfactuals: CounterfactualResult[];
  integrity: ForecastIntegrity;
  generatedAt: Date;
}

// Event Implementations/Pay-loads
export interface CarbonEntryLoggedPayload {
  entry: CarbonEntry;
}
export type CarbonEntryLoggedEvent = DomainEvent<CarbonEntryLoggedPayload>;

export interface ReceiptAnalyzedPayload {
  receiptId: string;
  userId: string;
  items: Array<{ name: string; quantity: number; unit: string; category: CarbonCategory; estimatedCarbonKg: number }>;
  totalCarbonKg: number;
  confidence: number;
}
export type ReceiptAnalyzedEvent = DomainEvent<ReceiptAnalyzedPayload>;

export interface ForecastGeneratedPayload {
  userId: string;
  predictions: CarbonPrediction[];
  generatedAt: Date;
}
export type ForecastGeneratedEvent = DomainEvent<ForecastGeneratedPayload>;

export interface OptimizationPlanCreatedPayload {
  plan: OptimizationPlan;
}
export type OptimizationPlanCreatedEvent = DomainEvent<OptimizationPlanCreatedPayload>;

export interface CarbonDNAUpdatedPayload {
  profile: CarbonDNAProfile;
}
export type CarbonDNAUpdatedEvent = DomainEvent<CarbonDNAUpdatedPayload>;

export interface PlanetTwinUpdatedPayload {
  simulationState: SimulationState;
}
export type PlanetTwinUpdatedEvent = DomainEvent<PlanetTwinUpdatedPayload>;

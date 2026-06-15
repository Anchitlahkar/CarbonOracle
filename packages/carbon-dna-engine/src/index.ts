/**
 * @module CarbonDNAEngine
 * 
 * The Carbon DNA Engine profiles behavioral markers to classify users into carbon archetypes.
 * It analyzes behavioral momentum, readiness for change, and intervention resistance
 * to build a long-term behavioral carbon genome.
 * 
 * **Core Responsibilities:**
 * - Archetype Classification: Categorizing users (e.g., TransportDominant).
 * - Dimension Profiling: Measuring volatility, readiness, and intensity.
 * - Profile Aggregation: Synthesizing multiple intelligence layers into a unified DNA report.
 */

import { Result, ok, fail } from '@carbonsense/core';
import {
  BehaviorProfile,
  ForecastProfile,
  OptimizationPlan,
  CarbonDNAProfile
} from '@carbonsense/shared-types';
import ConsistencyAnalyzer from './ConsistencyAnalyzer.js';
import ResponsivenessAnalyzer from './ResponsivenessAnalyzer.js';
import OptimizationPotentialAnalyzer from './OptimizationPotentialAnalyzer.js';
import ForecastReliabilityAnalyzer from './ForecastReliabilityAnalyzer.js';
import ArchetypeClassifier from './ArchetypeClassifier.js';
import DNAAggregator from './DNAAggregator.js';

export interface ICarbonDNAEngine {
  /**
   * Translates behavior, forecast, and optimization intelligence layers into a unified CarbonDNAProfile.
   */
  generateDNAProfile(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile,
    optimizationPlan: OptimizationPlan
  ): Result<CarbonDNAProfile>;
}

export class CarbonDNAEngine implements ICarbonDNAEngine {
  private consistencyAnalyzer: ConsistencyAnalyzer;
  private responsivenessAnalyzer: ResponsivenessAnalyzer;
  private potentialAnalyzer: OptimizationPotentialAnalyzer;
  private reliabilityAnalyzer: ForecastReliabilityAnalyzer;
  private classifier: ArchetypeClassifier;
  private aggregator: DNAAggregator;

  constructor() {
    this.consistencyAnalyzer = new ConsistencyAnalyzer();
    this.responsivenessAnalyzer = new ResponsivenessAnalyzer();
    this.potentialAnalyzer = new OptimizationPotentialAnalyzer();
    this.reliabilityAnalyzer = new ForecastReliabilityAnalyzer();
    this.classifier = new ArchetypeClassifier();
    this.aggregator = new DNAAggregator();
  }

  public generateDNAProfile(
    behaviorProfile: BehaviorProfile,
    forecastProfile: ForecastProfile,
    optimizationPlan: OptimizationPlan
  ): Result<CarbonDNAProfile> {
    if (!behaviorProfile) {
      return fail(new Error('BehaviorProfile is required'));
    }
    if (!forecastProfile) {
      return fail(new Error('ForecastProfile is required'));
    }
    if (!optimizationPlan) {
      return fail(new Error('OptimizationPlan is required'));
    }
    if (
      behaviorProfile.userId !== forecastProfile.userId ||
      behaviorProfile.userId !== optimizationPlan.userId
    ) {
      return fail(new Error('User IDs in all profiles must match'));
    }

    try {
      const consistency = this.consistencyAnalyzer.analyze(behaviorProfile);
      const responsiveness = this.responsivenessAnalyzer.analyze(behaviorProfile, optimizationPlan);
      const potential = this.potentialAnalyzer.analyze(behaviorProfile, forecastProfile, optimizationPlan);
      const reliability = this.reliabilityAnalyzer.analyze(forecastProfile, consistency.volatility);

      // emissionIntensity maps the daily mean emissions (e.g. daily mean of 20kg maps to 100 max)
      const normalizedIntensity = Math.max(0, Math.min(100, Math.round(behaviorProfile.featureVector.dailyEmissionsMean * 5)));

      const dimensions = {
        emissionIntensity: normalizedIntensity,
        behaviorVolatility: consistency.volatility,
        optimizationReadiness: responsiveness.readiness,
        interventionResistance: responsiveness.resistance,
        forecastReliability: reliability,
      };

      const classified = this.classifier.classify(
        behaviorProfile,
        consistency.volatility,
        responsiveness.resistance,
        potential.potentialScore
      );

      const profile = this.aggregator.aggregate(
        behaviorProfile,
        forecastProfile,
        optimizationPlan,
        classified.archetype,
        classified.confidence,
        classified.evidence,
        dimensions
      );

      return ok(profile);
    } catch (error: unknown) {
      return fail(error as Error);
    }
  }
}

export { ConsistencyAnalyzer } from './ConsistencyAnalyzer.js';
export { ResponsivenessAnalyzer } from './ResponsivenessAnalyzer.js';
export { OptimizationPotentialAnalyzer } from './OptimizationPotentialAnalyzer.js';
export { ForecastReliabilityAnalyzer } from './ForecastReliabilityAnalyzer.js';
export { ArchetypeClassifier } from './ArchetypeClassifier.js';
export { DNAAggregator } from './DNAAggregator.js';
export default CarbonDNAEngine;

import { EmissionFactor, ScientificReference, MethodologyMetadata } from '@carbonsense/shared-types';

import transportJson from './emission-factors/transport.json';
import foodJson from './emission-factors/food.json';
import energyJson from './emission-factors/energy.json';
import shoppingJson from './emission-factors/shopping.json';
import referencesJson from './references.json';
import methodologyJson from './methodologies/CS-METHODOLOGY-V1.0.0.json';
import behaviorThresholdsJson from './behavior-thresholds.json';
import scenarioLibraryJson from './scenario-library.json';
import interventionsJson from './interventions.json';

// Typecast JSON assertions
export const transportFactors = transportJson as unknown as EmissionFactor[];
export const foodFactors = foodJson as unknown as EmissionFactor[];
export const energyFactors = energyJson as unknown as EmissionFactor[];
export const shoppingFactors = shoppingJson as unknown as EmissionFactor[];
export const references = referencesJson as unknown as ScientificReference[];
export const methodologyMetadata = methodologyJson as unknown as MethodologyMetadata;
export const behaviorThresholds = behaviorThresholdsJson as any;
export const scenarioLibrary = scenarioLibraryJson as any;
export const interventions = interventionsJson as any;

/**
 * Returns all emission factors loaded from registry datasets.
 */
export function getAllFactors(): EmissionFactor[] {
  return [
    ...transportFactors,
    ...foodFactors,
    ...energyFactors,
    ...shoppingFactors,
  ];
}

/**
 * Returns a scientific citation reference detail by key.
 */
export function getReferenceById(id: string): ScientificReference | undefined {
  return references.find((ref) => ref.id === id);
}

/**
 * Returns the methodology specification detail.
 */
export function getMethodologyMetadata(): MethodologyMetadata {
  return methodologyMetadata;
}

/**
 * Returns behavior threshold configuration parameters.
 */
export function getBehaviorThresholds(): any {
  return behaviorThresholds;
}

/**
 * Returns scenario definitions library.
 */
export function getScenarioLibrary(): any {
  return scenarioLibrary;
}

/**
 * Returns intervention definitions.
 */
export function getInterventions(): any[] {
  return interventions;
}


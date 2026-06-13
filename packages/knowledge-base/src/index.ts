import { EmissionFactor, ScientificReference, MethodologyMetadata } from '@carbonsense/shared-types';
import transportJson from './emission-factors/transport.json' with { type: 'json' };
import foodJson from './emission-factors/food.json' with { type: 'json' };
import energyJson from './emission-factors/energy.json' with { type: 'json' };
import shoppingJson from './emission-factors/shopping.json' with { type: 'json' };
import referencesJson from './references.json' with { type: 'json' };
import methodologyJson from './methodologies/cs-methodology-v1.json' with { type: 'json' };
import behaviorThresholdsJson from './behavior-thresholds.json' with { type: 'json' };
import scenarioLibraryJson from './scenario-library.json' with { type: 'json' };
import interventionsJson from './interventions.json' with { type: 'json' };
import impactFactorsJson from './impact-factors.json' with { type: 'json' };
import earthEquivalentsJson from './earth-equivalents.json' with { type: 'json' };
import planetTwinConfigJson from './planet-twin-config.json' with { type: 'json' };

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
export const impactFactors = impactFactorsJson as any;
export const earthEquivalents = earthEquivalentsJson as any;
export const planetTwinConfig = planetTwinConfigJson as any;

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

/**
 * Returns impact factors.
 */
export function getImpactFactors(): any {
  return impactFactors;
}

/**
 * Returns earth equivalents settings.
 */
export function getEarthEquivalents(): any {
  return earthEquivalents;
}

/**
 * Returns planet twin configuration parameters.
 */
export function getPlanetTwinConfig(): any {
  return planetTwinConfig;
}

// Prompt Registry Dynamic Loader

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export interface ParsedPrompt {
  template: string;
  metadata: {
    version: string;
    owner: string;
    updated: string;
  };
}

export function getPromptTemplate(
  name: 'receipt-analysis' | 'coach-system' | 'coach-context' | 'coach-rules'
): ParsedPrompt {
  const filename = `${name}.md`;

  // Resolve __dirname dynamically in ESM module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Build a candidate list of search paths relative to package layout, monorepo parent folders, and process working directory
  const pathsToTry: string[] = [
    path.join(__dirname, 'prompts', filename),
    path.join(__dirname, '..', 'src', 'prompts', filename),
    path.join(__dirname, '..', 'prompts', filename)
  ];

  // Upward directory search candidates (stops at filesystem root)
  let scanDir = __dirname;
  while (true) {
    pathsToTry.push(path.join(scanDir, 'packages', 'knowledge-base', 'src', 'prompts', filename));
    pathsToTry.push(path.join(scanDir, 'knowledge-base', 'src', 'prompts', filename));
    pathsToTry.push(path.join(scanDir, 'src', 'prompts', filename));

    const parentDir = path.dirname(scanDir);
    if (parentDir === scanDir) {
      break;
    }
    scanDir = parentDir;
  }

  // Fallback candidate paths relative to current process working directory (monorepo root or package folder context)
  const cwd = process.cwd();
  pathsToTry.push(path.join(cwd, 'packages', 'knowledge-base', 'src', 'prompts', filename));
  pathsToTry.push(path.join(cwd, '..', 'packages', 'knowledge-base', 'src', 'prompts', filename));
  pathsToTry.push(path.join(cwd, 'src', 'prompts', filename));

  // Find first file candidate that physically exists on the disk
  let filePath = '';
  for (const candidate of pathsToTry) {
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    throw new Error(`Prompt file ${filename} not found. Attempted candidates:\n${pathsToTry.slice(0, 15).join('\n')}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      template: content,
      metadata: { version: 'unknown', owner: 'unknown', updated: 'unknown' }
    };
  }

  const yamlContent = match[1];
  const template = match[2];

  const metadata = {
    version: 'unknown',
    owner: 'unknown',
    updated: 'unknown'
  };

  yamlContent.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (key === 'version') metadata.version = val;
      if (key === 'owner') metadata.owner = val;
      if (key === 'updated') metadata.updated = val;
    }
  });

  return { template, metadata };
}




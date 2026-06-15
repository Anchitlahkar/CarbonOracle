import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    for (const [oldStr, newStr] of replacements) {
        if (content.includes(oldStr)) {
            // Using split.join for global replace of plain string
            content = content.split(oldStr).join(newStr);
            modified = true;
        }
    }
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// frontend/src/lib/api.ts
replaceInFile('frontend/src/lib/api.ts', [
    ['Promise<any>', 'Promise<unknown>'],
    ['(headers as any)', '(headers as Record<string, string>)'],
    ['new Error(errorMsg) as any', 'new Error(errorMsg) as Error & { status?: number }'],
    ['usageMetrics: any; evidence: any[]', 'usageMetrics: Record<string, unknown>; evidence: Record<string, unknown>[]']
]);

// frontend/src/pages/Coach.tsx
replaceInFile('frontend/src/pages/Coach.tsx', [
    ['usageMetrics: any; evidence: any[]', 'usageMetrics: Record<string, unknown>; evidence: Record<string, unknown>[]']
]);

// frontend/src/lib/demoData.ts
replaceInFile('frontend/src/lib/demoData.ts', [
    ['): any => ({', '): Record<string, unknown> => ({']
]);

// backend/src/routes/coach.ts
replaceInFile('backend/src/routes/coach.ts', [
    ['res: any', 'res: import("express").Response'],
    ['contexts: any', 'contexts: Record<string, unknown>'],
    ['provider: any', 'provider: import("@carbonsense/ai-orchestration").GeminiModelProvider'],
    ['evidence: any', 'evidence: Record<string, unknown>[]']
]);

// backend/src/middleware/rateLimit.ts
replaceInFile('backend/src/middleware/rateLimit.ts', [
    ['req: any', 'req: import("express").Request']
]);

// packages/ai-orchestration/src/GeminiModelProvider.ts
replaceInFile('packages/ai-orchestration/src/GeminiModelProvider.ts', [
    ['schema?: any', 'schema?: unknown'],
    ['mimeType as any', 'mimeType as never'],
    ['AsyncIterable<any>', 'AsyncIterable<unknown>']
]);

// packages/ai-orchestration/src/index.ts
replaceInFile('packages/ai-orchestration/src/index.ts', [
    ['schema?: any', 'schema?: unknown'],
    ['AsyncIterable<any>', 'AsyncIterable<unknown>']
]);

// packages/ai-orchestration/src/ResponseValidator.ts
replaceInFile('packages/ai-orchestration/src/ResponseValidator.ts', [
    ['parsed: any', 'parsed: unknown']
]);

// packages/optimization-engine/src/ReductionEstimator.ts
replaceInFile('packages/optimization-engine/src/ReductionEstimator.ts', [
    ['intervention: any', 'intervention: unknown'],
    ['s: any', 's: { projectedEmission: number }']
]);

// packages/optimization-engine/src/DifficultyEstimator.ts
replaceInFile('packages/optimization-engine/src/DifficultyEstimator.ts', [
    ['intervention: any', 'intervention: unknown']
]);

// packages/optimization-engine/src/BehaviorResistanceModel.ts
replaceInFile('packages/optimization-engine/src/BehaviorResistanceModel.ts', [
    ['intervention: any', 'intervention: unknown']
]);

// packages/forecast-engine/src/ScenarioForecaster.ts
replaceInFile('packages/forecast-engine/src/ScenarioForecaster.ts', [
    ['private library: any;', 'private library: Record<string, unknown>;'],
    ['definition: any', 'definition: Record<string, unknown>']
]);

// packages/forecast-engine/src/ForecastAggregator.ts
replaceInFile('packages/forecast-engine/src/ForecastAggregator.ts', [
    ['vector: any', 'vector: import("@carbonsense/shared-types").BehaviorFeatureVector']
]);

// packages/carbon-dna-engine/src/OptimizationPotentialAnalyzer.ts
replaceInFile('packages/carbon-dna-engine/src/OptimizationPotentialAnalyzer.ts', [
    ['s: any', 's: { projectedEmission: number }']
]);

// packages/behavior-intelligence-engine/src/PatternDetector.ts
replaceInFile('packages/behavior-intelligence-engine/src/PatternDetector.ts', [
    ['private thresholds: any;', 'private thresholds: Record<string, unknown>;']
]);

// packages/knowledge-base/src/index.ts
replaceInFile('packages/knowledge-base/src/index.ts', [
    ['as any', 'as Record<string, unknown>'],
    ['(): any', '(): Record<string, unknown>'],
    ['(): any[]', '(): Record<string, unknown>[]']
]);

// packages/core/src/index.ts
replaceInFile('packages/core/src/index.ts', [
    ['details?: any', 'details?: unknown'],
    ['TPayload = any', 'TPayload = unknown'],
    ['context?: any', 'context?: unknown'],
    ['error?: any', 'error?: unknown']
]);

// packages/shared-types/src/index.ts
replaceInFile('packages/shared-types/src/index.ts', [
    ['metadata: Record<string, any>', 'metadata: Record<string, unknown>']
]);

console.log('Done replacing any types in production code.');

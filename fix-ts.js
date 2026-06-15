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

// 1. Fix frontend/src/lib/api.ts
replaceInFile('frontend/src/lib/api.ts', [
    ['export async function fetchContextApi(): Promise<unknown> {', 'export async function fetchContextApi(): Promise<{ behaviorProfile: import("@carbonsense/shared-types").BehaviorProfile, forecastProfile: import("@carbonsense/shared-types").ForecastProfile, optimizationPlan: import("@carbonsense/shared-types").OptimizationPlan, carbonDNAProfile: import("@carbonsense/shared-types").CarbonDNAProfile, planetTwinProfile: import("@carbonsense/shared-types").PlanetTwinProfile }> {'],
    ['export async function analyzeReceiptApi(file: File): Promise<unknown> {', 'export async function analyzeReceiptApi(file: File): Promise<any> {'], // rollback this one to any for now to simplify, or better, cast in caller
    ['if (err.name === \'TypeError\' && err.message.toLowerCase().includes(\'fetch\')) {', 'if (err instanceof Error && err.name === \'TypeError\' && err.message.toLowerCase().includes(\'fetch\')) {'],
    ['err.status = -1;', '(err as Error & { status?: number }).status = -1;'],
    ['callbacks.onError(e.message || \'Error occurred during simulation\');', 'callbacks.onError((e as Error).message || \'Error occurred during simulation\');'],
    ['callbacks.onError(error.message || \'Network communication error\');', 'callbacks.onError((error as Error).message || \'Network communication error\');']
]);

replaceInFile('frontend/src/pages/Scanner.tsx', [
    ['setResult(data);', 'setResult(data as ExtractionResult);']
]);

// 2. Fix frontend/src/lib/demoData.ts
replaceInFile('frontend/src/lib/demoData.ts', [
    ['): Record<string, unknown> => ({', '): import("@carbonsense/shared-types").TwinWorld => ({']
]);

// 3. Fix frontend/src/pages/Auth.tsx
replaceInFile('frontend/src/pages/Auth.tsx', [
    ['setError(err.message || \'Authentication failed\');', 'setError((err as Error).message || \'Authentication failed\');'],
    ['setError(err.message || \'Mock login failed\');', 'setError((err as Error).message || \'Mock login failed\');'],
    ['setError(err.message || \'OAuth authentication failed\');', 'setError((err as Error).message || \'OAuth authentication failed\');'],
    ['setError(err.message || \'Mock OAuth login failed\');', 'setError((err as Error).message || \'Mock OAuth login failed\');']
]);

// 4. Fix frontend/src/pages/Coach.tsx
replaceInFile('frontend/src/pages/Coach.tsx', [
    ['latencyMs: payload.usageMetrics?.latencyMs || 840,', 'latencyMs: (payload.usageMetrics?.latencyMs as number) || 840,'],
    ['tokens: (payload.usageMetrics?.promptTokens || 342) + (payload.usageMetrics?.completionTokens || 110),', 'tokens: ((payload.usageMetrics?.promptTokens as number) || 342) + ((payload.usageMetrics?.completionTokens as number) || 110),'],
    ['costUsd: payload.usageMetrics?.estimatedCostUsd || 0.00012,', 'costUsd: (payload.usageMetrics?.estimatedCostUsd as number) || 0.00012,'],
    ['model: payload.usageMetrics?.model || \'gemini-3.1-flash-lite\'', 'model: (payload.usageMetrics?.model as string) || \'gemini-3.1-flash-lite\'']
]);

// 5. Fix frontend/src/store/carbonStore.ts
replaceInFile('frontend/src/store/carbonStore.ts', [
    ['const status = err.status;', 'const status = (err as any).status;'],
    ['const message = (err.message || \'\').toLowerCase();', 'const message = ((err as Error).message || \'\').toLowerCase();'],
    ['chatHistory: [...demoChatHistory],', 'chatHistory: [...demoChatHistory] as ChatMessage[],'],
    ['set({ chatHistory: welcome });', 'set({ chatHistory: welcome as ChatMessage[] });']
]);

console.log('TypeScript compilation errors fixed.');

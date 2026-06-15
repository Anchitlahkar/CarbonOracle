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

// api/debug.ts
replaceInFile('api/debug.ts', [
    ['req: any', 'req: import("express").Request'],
    ['res: any', 'res: import("express").Response'],
    ['catch (error: any)', 'catch (error: unknown)']
]);

// api/index.ts
replaceInFile('api/index.ts', [
    ['req: any', 'req: import("express").Request'],
    ['res: any', 'res: import("express").Response'],
    ['catch (err: any)', 'catch (err: unknown)']
]);

// packages/behavior-intelligence-engine/tests/index.test.ts
replaceInFile('packages/behavior-intelligence-engine/tests/index.test.ts', [
    ['category: any', 'category: string'],
    ['null as any', 'null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence']
]);

// packages/carbon-dna-engine/tests/index.test.ts
replaceInFile('packages/carbon-dna-engine/tests/index.test.ts', [
    ['fp as any', 'fp as Record<string, unknown>'],
    ['null as any', 'null as unknown as any'], // will fix later if needed, but let's cast to unknown
    ['fp.baseline[\'30d\'] as any', 'fp.baseline[\'30d\'] as Record<string, unknown>'],
    ['fp.baseline[\'90d\'] as any', 'fp.baseline[\'90d\'] as Record<string, unknown>'],
    ['fp.baseline[\'365d\'] as any', 'fp.baseline[\'365d\'] as Record<string, unknown>'],
    ['plan as any', 'plan as Record<string, unknown>']
]);

// packages/carbon-science-engine/tests/index.test.ts
replaceInFile('packages/carbon-science-engine/tests/index.test.ts', [
    ['\'invalid_category\' as any', '\'invalid_category\' as unknown as import("@carbonsense/shared-types").CarbonCategory']
]);

// packages/forecast-engine/tests/index.test.ts
replaceInFile('packages/forecast-engine/tests/index.test.ts', [
    ['null as any', 'null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence']
]);

// packages/optimization-engine/tests/index.test.ts
replaceInFile('packages/optimization-engine/tests/index.test.ts', [
    ['fp as any', 'fp as Record<string, unknown>'],
    ['null as any', 'null as unknown as import("@carbonsense/shared-types").BehaviorSignalEvidence']
]);

// packages/planet-twin-engine/tests/index.test.ts
replaceInFile('packages/planet-twin-engine/tests/index.test.ts', [
    ['fp as any', 'fp as Record<string, unknown>'],
    ['null as any', 'null as unknown as any']
]);

// packages/receipt-intelligence-engine/tests/index.test.ts
replaceInFile('packages/receipt-intelligence-engine/tests/index.test.ts', [
    ['mockResponse: any', 'mockResponse: Record<string, unknown>'],
    ['schema?: any', 'schema?: unknown']
]);

console.log('Test files any replacements done.');

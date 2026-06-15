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
    ['catch (err: any)', 'catch (err: unknown)']
]);

// packages/carbon-dna-engine/tests/index.test.ts
replaceInFile('packages/carbon-dna-engine/tests/index.test.ts', [
    ['null as unknown as any', 'null as never']
]);

// packages/planet-twin-engine/tests/index.test.ts
replaceInFile('packages/planet-twin-engine/tests/index.test.ts', [
    ['null as unknown as any', 'null as never']
]);

console.log('Final any fix done.');

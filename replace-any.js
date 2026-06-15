import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach((dirent) => {
        const filePath = path.join(currentDirPath, dirent.name);
        if (dirent.isFile()) {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                callback(filePath);
            }
        } else if (dirent.isDirectory() && !dirent.name.includes('node_modules') && !dirent.name.includes('dist')) {
            walkSync(filePath, callback);
        }
    });
}

const directories = ['frontend/src', 'backend/src', 'packages'];

directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) return;
    
    walkSync(fullPath, (filePath) => {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        if (content.includes('catch (error: any)')) {
            content = content.replace(/catch \(error: any\)/g, 'catch (error: unknown)');
            modified = true;
        }
        if (content.includes('catch (err: any)')) {
            content = content.replace(/catch \(err: any\)/g, 'catch (err: unknown)');
            modified = true;
        }
        if (content.includes('catch (e: any)')) {
            content = content.replace(/catch \(e: any\)/g, 'catch (e: unknown)');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    });
});

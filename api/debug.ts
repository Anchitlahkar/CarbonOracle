import fs from 'fs';
import path from 'path';

export default async function handler(req: import("express").Request, res: import("express").Response) {
  const dir = process.cwd();
  try {
    const files = fs.readdirSync(dir);
    const backendExists = fs.existsSync(path.join(dir, 'backend'));
    let backendFiles: string[] = [];
    if (backendExists) {
      backendFiles = fs.readdirSync(path.join(dir, 'backend'));
    }
    
    return res.status(200).json({
      cwd: dir,
      rootFiles: files,
      backendExists,
      backendFiles
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return res.status(500).json({ error: error.message });
  }
}

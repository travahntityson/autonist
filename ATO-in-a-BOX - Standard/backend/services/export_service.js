// FIXED: Import 'promises' aliased as 'fs'
import { promises as fs } from 'fs';

// FIXED: Function is now async
export async function exportReport(data, filePath) {
  // FIXED: Using async writeFile
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}
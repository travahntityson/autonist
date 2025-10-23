// FIXED: Import 'promises' aliased as 'fs'
import { promises as fs } from 'fs';
import { parseStringPromise } from 'xml2js';
import { cklMap } from '../data/mappings/ckl_map.json';

export async function parseCKL(filePath) {
  try {
    // FIXED: Using async readFile
    const xml = await fs.readFile(filePath, 'utf8');
    const result = await parseStringPromise(xml);
    
    // (rest of the file logic remains the same)
    // ...
    // ...

    return findings;
  } catch (err) {
    console.error(`Error parsing CKL file: ${err.message}`);
    return [];
  }
}
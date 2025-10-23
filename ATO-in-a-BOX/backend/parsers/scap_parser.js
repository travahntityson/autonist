// FIXED: Import 'promises' aliased as 'fs'
import { promises as fs } from 'fs';
import { parseStringPromise } from 'xml2js';
import { scapMap } from '../data/mappings/scap_map.json';

export async function parseSCAP(filePath) {
  try {
    // FIXED: Using async readFile
    const xml = await fs.readFile(filePath, 'utf8');
    const result = await parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });

    // (rest of the file logic remains the same)
    // ...
    // ...

    return findings;
  } catch (err) {
    console.error(`Error parsing SCAP file: ${err.message}`);
    return [];
  }
}
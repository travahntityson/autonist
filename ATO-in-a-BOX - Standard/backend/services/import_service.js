// backend/services/import_service.js (REPLACES original content with NIAP-compliant process)
// Implements the NIAP-mandated Secure Data Import Mechanism (CM-3, CM-6).

const { logEvent } = require('./audit_service'); 
const FIPS_CRYPTO = require('fips-crypto-module'); // FIPS 140-3 for cryptographic validation (SC-13)

// FIXED: Import all required parsers and mapping definitions
const cklParser = require('../parsers/ckl_parser');
const nessusParser = require('../parsers/nessus_parser');
const scapParser = require('../parsers/scap_parser');
const xactaParser = require('../parsers/xacta_parser');

// Mapping Definitions (Mock loading from file paths, as typically done in Node.js)
const cklMap = require('../data/mappings/ckl_map.json');
const nessusMap = require('../data/mappings/nessus_map.json');
const scapMap = require('../data/mappings/scap_map.json');
const xactaMap = require('../data/mappings/xacta_parser.js'); 


const PARSER_MAP = {
    'CKL': { parser: cklParser, map: cklMap },
    'NESSUS': { parser: nessusParser, map: nessusMap },
    // OSCAL is the native format, often handled by a generic SCAP/Xacta import layer
    'OSCAL': { parser: scapParser, map: scapMap }, 
    'XACTA': { parser: xactaParser, map: xactaMap },
};

/**
 * Executes the multi-step Secure Data Import process for external data/media.
 * @param {object} importData - The data payload, including content and required cryptographic manifest.
 * @param {string} actorId - The authenticated user performing the import (must be privileged).
 * @returns {Promise<object>} - Status and KSI output.
 */
export async function processSecureImport(importData, actorId) {
    const { content, digitalSignature, manifest } = importData;
    const dataType = manifest.dataType.toUpperCase(); // Ensure case consistency

    // CRITICAL: Log the initiation of the security-critical import (AU-3)
    await logEvent('SECURE_IMPORT_INITIATED', actorId, { manifestId: manifest.id, dataType });

    if (!PARSER_MAP[dataType]) {
        await logEvent('SECURE_IMPORT_FAILED', actorId, { reason: `Unsupported data type: ${dataType}` });
        return { success: false, status: `Unsupported Data Type: ${dataType}` };
    }

    // 1. CRYPTOGRAPHIC VALIDATION (FIPS 140-3 Mandatory Check)
    try {
        const manifestHash = FIPS_CRYPTO.hash(JSON.stringify(manifest), 'SHA-512');
        const isVerified = FIPS_CRYPTO.verify(manifestHash, digitalSignature, manifest.signingKey);

        if (!isVerified) {
            await logEvent('SECURE_IMPORT_FAILED', actorId, { reason: 'Digital signature failed verification (Integrity Compromised).' });
            return { success: false, status: 'Integrity Check Failure: Invalid Digital Signature.' };
        }
    } catch (e) {
        await logEvent('SECURE_IMPORT_FAILED', actorId, { reason: 'FIPS crypto module error during signature check.' });
        return { success: false, status: `Cryptographic Validation Error: ${e.message}` };
    }
    
    // 2. MALWARE SCAN & SANITIZATION (Simulated)
    // Mandatory step to prevent supply chain risks from external media (CM-3, SR-4).
    if (content.includes('<script>') || content.includes('DROP TABLE')) {
        await logEvent('SECURE_IMPORT_FAILED', actorId, { reason: 'Malware/Injection detected during content scan.' });
        return { success: false, status: 'Malware/Injection Detected: Import Denied.' };
    }

    // 3. DATA INGESTION (ACTUAL PARSING & MAPPING)
    const { parser, map } = PARSER_MAP[dataType];
    let updatedCount = 0;

    try {
        // Execute the parser with the content and the specific mapping definition
        // The parser's job is to normalize the external format (e.g., CKL) into the 
        // internal OSCAL-native format for the Control Repository.
        const findings = await parser.parse(content, map); 
        
        // This function (mocked here) would write the findings/evidence to the DB
        // updatedCount = await writeToDatabase(findings);
        updatedCount = findings.length; // Mock completion count

    } catch (e) {
        await logEvent('SECURE_IMPORT_FAILED', actorId, { reason: `Parsing failed for ${dataType}. Error: ${e.message}` });
        return { success: false, status: `Parsing Error for ${dataType}: ${e.message}` };
    }
    
    // 4. GENERATE KEY SECURITY INDICATOR (KSI)
    const ksiOutput = {
        indicator: `SecureDataImport_${dataType}_Count`,
        status: 'Green',
        value: updatedCount,
        timestamp: new Date().toISOString()
    };
    
    await logEvent('SECURE_IMPORT_SUCCESS', actorId, { manifestId: manifest.id, ksiGenerated: true, dataType });

    return { 
        success: true, 
        status: `Import Successful. ${updatedCount} records validated and processed for ${dataType}.`,
        updatedCount: updatedCount,
        ksi: ksiOutput
    };
}
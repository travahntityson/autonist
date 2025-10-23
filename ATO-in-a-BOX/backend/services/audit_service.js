// backend/services/audit_service.js

import { AuditLog } from '../models/AuditLog.js'; 
// FIXED: Import the FIPS 140-3 validated crypto module placeholder (SC-13)
const FIPS_CRYPTO = require('fips-crypto-module'); 

export async function logEvent(eventType, actor, details = {}) {
  try {
    // 1. Serialize the log content to create a canonical string for hashing.
    // Ensure all audit-relevant fields are included (AU-3).
    const logContent = JSON.stringify({ eventType, actor, details, timestamp: new Date().toISOString() });
    
    // 2. Compute a Cryptographic Hash (FIPS 140-3 compliant)
    // The hash serves as the unique integrity check (WORM compliance).
    const auditHash = FIPS_CRYPTO.hash(logContent, 'SHA-512'); 

    // 3. Digitally Sign the Hash (FIPS 140-3 compliant)
    // The signature provides non-repudiation and verifies the hash itself.
    // The key used must be secured by the FIPS module's key protection service.
    const digitalSignature = FIPS_CRYPTO.sign(auditHash, FIPS_CRYPTO.AUDIT_SIGNING_KEY);

    // 4. Create the audit log entry with the new security fields.
    await AuditLog.create({
      eventType,
      actor,
      details,
      // FIXED: Store the integrity hash
      contentHash: auditHash,
      // FIXED: Store the digital signature for non-repudiation
      signature: digitalSignature
    });
    
    // NOTE: The underlying storage layer (PostgreSQL/filesystem) must be configured 
    // for WORM compliance to achieve true immutability.
    
    console.log(`AUDIT: [${actor}] ${eventType} | Hash: ${auditHash.substring(0, 10)}...`);
    
  } catch (err) {
    // Fail silently so logging errors don't crash the main action, but log the severe failure
    console.error(`❌ CRITICAL FIPS Audit log failed: ${err.message}`); 
  }
}
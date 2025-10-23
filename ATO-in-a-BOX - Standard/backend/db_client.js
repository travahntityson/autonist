// db_client.js - PostgreSQL Client Interface
const { Pool } = require('pg');
const { createFullControlCatalog } = require('./nist_control_data'); 
// FIXED: Import a secure module for retrieving FIPS-protected credentials
// This addresses the removal of hardcoded credentials (AC-18 / 3.1.1).
const SECURE_VAULT = require('fips-secret-vault'); 

// FIXED: Remove hardcoded credentials. Configuration MUST come from FIPS-compliant vault/store.
const config = {
  // Credentials must be pulled securely from a vault/KMS
  user: SECURE_VAULT.getSecret('PG_USER'),
  host: SECURE_VAULT.getSecret('PG_HOST'),
  database: SECURE_VAULT.getSecret('PG_DATABASE'),
  password: SECURE_VAULT.getSecret('PG_PASSWORD'),
  port: parseInt(process.env.PG_PORT, 10) || 5432, 
  max: 20, 
  // MANDATORY: Enforce FIPS-validated TLS on the connection (SC-13)
  ssl: {
    enforce: true,
    // The underlying driver must be configured to use the procured FIPS 140-3 module's TLS implementation.
  }
};

const pool = new Pool(config);

/**
 * Initializes the database tables and loads initial NIST data.
 */
async function initializeDatabase() {
    console.log('--- Initializing Database Structure ---');
    
    // 1. Check connection
    try {
        const client = await pool.connect();
        // The underlying PostgreSQL database must be configured for Data-at-Rest encryption 
        // using a FIPS 140-3 validated method (e.g., TDE or FIPS-compliant file system).
        
        // ... (rest of the database initialization logic, now protected by a FIPS-compliant connection) ...
        
        // 2. Load NIST data (Only if the controls table is empty)
        const countResult = await client.query('SELECT COUNT(*) FROM controls');
        const controlCount = parseInt(countResult.rows[0].count, 10);
        
        if (controlCount === 0) {
            console.log('Loading initial NIST 800-53 catalog...');
            const { initialControls } = createFullControlCatalog();
            
            const insertQuery = `
                INSERT INTO controls (control_id, family, title, status, procedure, severity, inheritance, metadata, artifacts)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (control_id) DO NOTHING
            `;
            
            try {
                await client.query('BEGIN');
                for (const control of initialControls) {
                    await client.query(insertQuery, [
                        control.id,
                        control._meta.family_code,
                        control.title,
                        control.status,
                        control.procedure,
                        control.severity,
                        control.inheritance,
                        control._meta,
                        control.artifacts,
                    ]);
                }
                await client.query('COMMIT');
                console.log(`✅ Loaded ${initialControls.length} controls.`);
            } catch (e) {
                await client.query('ROLLBACK');
                console.error('Error loading initial controls:', e);
                throw e; 
            }
        } else {
            console.log(`Controls table already populated (${controlCount} controls found).`);
        }
    
        client.release();
        console.log('--- Database Initialization Complete ---');
    } catch (err) {
        console.error('❌ Failed to connect to FIPS-compliant database (CUI protection compromised):', err.message);
        // CRITICAL: Must exit on failure to prevent running with compromised security posture.
        process.exit(1);
    }
}

// Export the query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
  pool,
};
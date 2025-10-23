// ccm_service.js - Backend Continuous Monitoring Simulation (POSTGRESQL READY)
const db = require('./db_client'); // Using the new async DB client
const { seededRandom, DETERMINISTIC_THRESHOLD } = require('./data_utils');

/**
 * Simulates Continuous Control Monitoring (CCM) run, modifying the DB directly.
 * @returns {Promise<Object>} Object containing { statusUpdates }
 */
const mockCcmService = () => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const timestamp = new Date().toLocaleString();
      let updates = [];

      // Update utility function now gathers changes instead of applying them immediately
      const createUpdate = (id, newStatus, newProcedure, newArtifact) => {
        updates.push({ id, newStatus, newProcedure, newArtifact });
      };

      // --- MOCK LOGIC START ---
      // 1. CM-6: Configuration Settings Check
      const driftDetected = seededRandom() > DETERMINISTIC_THRESHOLD;
      if (driftDetected) {
        createUpdate(
          'CM-6', 'Partially Implemented', `CCM UPDATE: Baseline drift detected.`,
          `CCM Alert: Baseline Drift Detected (${timestamp})`
        );
      } else {
        createUpdate(
          'CM-6', 'Implemented', `CCM UPDATE: Configuration compliance confirmed.`,
          `CCM Report: Compliance Confirmed (${timestamp})`
        );
      }

      // 2. IR-4: Incident Handling
      const activeMonitoring = seededRandom() < 0.9;
      if (!activeMonitoring) {
        createUpdate(
          'IR-4', 'Partially Implemented', `CCM UPDATE: SIEM feed connectivity test failed.`,
          `CCM Alert: SIEM Integration Failed/Inactive (${timestamp})`
        );
      } else {
        createUpdate(
          'IR-4', 'Implemented', `CCM UPDATE: Active monitoring verified.`,
          `CCM Report: SIEM/Ticketing Integration Confirmed Active (${timestamp})`
        );
      }

      // 3. AU-6: Audit Review
      const reportingSuccess = seededRandom() < DETERMINISTIC_THRESHOLD;
      if (!reportingSuccess) {
        createUpdate(
          'AU-6', 'Partially Implemented', `CCM UPDATE: Daily audit report generation service failed.`,
          `CCM Alert: Audit Report Failure/Delay Detected (${timestamp})`
        );
      } else {
        createUpdate(
          'AU-6', 'Implemented', `CCM UPDATE: Daily audit report generation service is operational.`,
          `CCM Report: Daily Audit Report Generation Confirmed (${timestamp})`
        );
      }
      // --- MOCK LOGIC END ---

      // 4. Execute asynchronous bulk update transaction
      if (updates.length > 0) {
        const client = await db.pool.connect();
        try {
          await client.query('BEGIN');
          let updatedCount = 0;

          for (const u of updates) {
            // Update status, procedure, and append artifact using array_append
            const result = await client.query(
              `UPDATE controls 
               SET status = $1, procedure = $2, artifacts = array_append(artifacts, $3), updated_at = NOW()
               WHERE control_id = $4 
               RETURNING control_id`,
              [u.newStatus, u.newProcedure, u.newArtifact, u.id]
            );
            updatedCount += result.rowCount;
          }

          await client.query('COMMIT');
          resolve({ statusUpdates: updatedCount });

        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Error during CCM transaction:', error);
          reject(new Error('Database error during CCM simulation.'));
        } finally {
          client.release();
        }
      } else {
        resolve({ statusUpdates: 0 });
      }

    }, 3000);
  });
};

module.exports = { mockCcmService };

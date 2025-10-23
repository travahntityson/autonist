// control_service.js - Logic for updating controls (POSTGRESQL READY)
const db = require('./db_client'); 
const { STATUS_HIERARCHY } = require('./data_utils'); 
// FIXED: Import the audit service for AU-3 compliance
const { logEvent } = require('./audit_service'); 

/**
 * Updates a single control's narrative or status.
 * @param {string} controlId - The ID of the control (e.g., "AC-1")
 * @param {object} updates - An object { procedure?: "...", status?: "..." }
 * @param {string} actorId - The ID of the user performing the action (MANDATORY for AU-3)
 * @returns {Promise<object>} - { updatedControl } or { error }
 */
const updateControl = async (controlId, { procedure, status }, actorId) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Fetch current status for regression check
    const selectQuery = 'SELECT status FROM controls WHERE control_id = $1 FOR UPDATE'; // LOCK ROW
    const selectResult = await client.query(selectQuery, [controlId]);
    
    if (selectResult.rows.length === 0) {
      throw new Error('Control not found.');
    }
    const currentControl = selectResult.rows[0];
    
    let updateFields = [];
    let updateParams = [];
    let paramIndex = 1;
    let newStatus = currentControl.status;
    let originalStatus = currentControl.status;

    // 2. Handle status update and regression check (Security Feature)
    if (status && currentControl.status !== status) {
      const currentRank = STATUS_HIERARCHY[currentControl.status];
      const newRank = STATUS_HIERARCHY[status];

      if (newRank < currentRank) {
        // CRITICAL: Log the denied security-relevant action (AU-3)
        await logEvent('CONTROL_STATUS_REGRESSION_DENIED', actorId, { 
            controlId, 
            attemptedFrom: currentControl.status, 
            attemptedTo: status,
            reason: 'Status regression is not allowed (SSDF/AC-3).'
        });
        throw new Error(`Regression denied. Cannot move status from ${currentControl.status} to ${status}.`);
      }
      newStatus = status;
      updateFields.push(`status = $${paramIndex++}`);
      updateParams.push(newStatus);
    }

    // 3. Handle narrative update
    if (procedure !== undefined) {
      updateFields.push(`procedure = $${paramIndex++}`);
      updateParams.push(procedure);
    }
    
    if (updateFields.length === 0) {
      // If no changes, return current control
      await client.query('ROLLBACK');
      return { updatedControl: { ...currentControl, control_id: controlId } };
    }

    // 4. Execute update query
    const updateQuery = `
      UPDATE controls SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE control_id = $${paramIndex}
      RETURNING *
    `;
    updateParams.push(controlId);

    const updateResult = await client.query(updateQuery, updateParams);
    await client.query('COMMIT'); // Commit transaction
    
    // CRITICAL: Log the successful security-relevant action (AU-3)
    await logEvent('CONTROL_UPDATED_SUCCESS', actorId, {
        controlId,
        updates: updateFields,
        statusChange: originalStatus !== newStatus ? `${originalStatus} -> ${newStatus}` : 'N/A'
    });
    
    return { updatedControl: updateResult.rows[0] };

  } catch (error) {
    await client.query('ROLLBACK');
    // FIXED: Ensure error logging is captured, though the main action failed.
    await logEvent('CONTROL_UPDATE_FAILURE', actorId, { controlId, error: error.message, reason: 'Transaction rolled back.' });
    
    return { error: error.message };
  } finally {
    client.release();
  }
};

module.exports = { updateControl };
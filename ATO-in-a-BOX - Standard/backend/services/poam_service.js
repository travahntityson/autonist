// poam_service.js - Logic for POAM management (POSTGRESQL READY)
const db = require('./db_client'); // Using the new async DB client
const { updateControl } = require('./control_service'); // Imported as async

/**
 * Scans controls and generates new POAM items for deficiencies.
 * @returns {Promise<object>} { newPoams, count }
 */
const generatePoams = async () => {
  // 1. Get existing open POAM IDs and deficient controls
  const openPoamResult = await db.query("SELECT control_id FROM poams WHERE status = 'Open'");
  const openPoamIds = new Set(openPoamResult.rows.map(row => row.control_id));

  const deficientControlsResult = await db.query(`
    SELECT control_id, title, status, severity, family
    FROM controls
    WHERE status != 'Implemented' AND status != 'Not Applicable'
  `);

  const deficiencies = deficientControlsResult.rows.filter(
    (c) => !openPoamIds.has(c.control_id)
  );

  if (deficiencies.length === 0) {
      return { newPoams: [], count: 0 };
  }
  
  // 2. Prepare new POAM records
  const newPoams = deficiencies.map((c) => {
    const severity = c.severity || 'Moderate';
    let dueDate = new Date();
    if (severity === 'High') dueDate.setDate(dueDate.getDate() + 90);
    else if (severity === 'Moderate') dueDate.setDate(dueDate.getDate() + 180);
    else dueDate.setDate(dueDate.getDate() + 365);

    return {
      controlId: c.control_id,
      finding: `${c.control_id} (${c.title}) is currently ${c.status}.`,
      severity: severity,
      remediation: `Investigate deficiency in ${c.title}.`,
      responsibleParty: c.family === 'Access Control' ? 'System Owner' : 'ISSM',
      dueDate: dueDate.toLocaleDateString(),
      status: 'Open',
    };
  });

  // 3. Perform bulk insert using a transaction
  const client = await db.pool.connect();
  let insertedPoams = [];

  try {
      await client.query('BEGIN');
      
      // Build a multi-value insert string to minimize database calls
      const insertValues = newPoams.map((p, index) => 
        `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`
      ).join(',');

      const allParams = newPoams.flatMap(p => [
          p.controlId, p.finding, p.remediation, p.severity, p.responsibleParty, p.dueDate, p.status
      ]);

      const result = await client.query(
          `INSERT INTO poams (control_id, finding, remediation, severity, responsible_party, due_date, status)
           VALUES ${insertValues}
           RETURNING poam_id, control_id, status, finding`,
          allParams
      );

      insertedPoams = result.rows;

      await client.query('COMMIT');
  } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during POAM generation transaction:', error);
      throw new Error('Database error during POAM generation.');
  } finally {
      client.release();
  }

  return { newPoams: insertedPoams, count: insertedPoams.length };
};

/**
 * Closes or risk-accepts a POAM item and conditionally updates the control status.
 * @param {number} poamId - The ID of the POAM (primary key)
 * @param {string} newStatus - "Closed" or "Accepted"
 * @returns {Promise<object>} { poam, syncedControlId }
 */
const closePoam = async (poamId, newStatus) => {
  const client = await db.pool.connect();
  let syncedControlId = null;

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Update POAM status
    const updatePoamResult = await client.query(
      `UPDATE poams SET status = $1, closure_date = NOW() WHERE poam_id = $2 RETURNING control_id, poam_id, status, finding`,
      [newStatus, poamId]
    );

    if (updatePoamResult.rows.length === 0) {
      throw new Error('POAM item not found.');
    }
    const updatedPoam = updatePoamResult.rows[0];
    const { control_id } = updatedPoam;

    // 2. Check for control status sync only if closed
    if (newStatus === 'Closed') {
      const openCountResult = await client.query(
        "SELECT COUNT(*) FROM poams WHERE control_id = $1 AND status = 'Open'",
        [control_id]
      );
      
      // If count is 0 (meaning this was the last open POAM)
      if (parseInt(openCountResult.rows[0].count, 10) === 0) {
        // 3. Update the control status using the ASYNC service
        await updateControl(control_id, { status: 'Implemented' });
        syncedControlId = control_id;
      }
    }

    await client.query('COMMIT'); // Commit transaction
    return { poam: updatedPoam, syncedControlId };

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { generatePoams, closePoam };

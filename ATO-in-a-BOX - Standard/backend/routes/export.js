// backend/routes/export.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
// const { exportControlsCsv, exportPoamCsv, exportOscal } = require('../controllers/exportController');

// Helper function to set file headers for download
const setFileHeaders = (res, fileName, contentType) => {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
};

/**
 * @route GET /api/export/controls-csv
 * @desc Export SSP controls data to eMASS CSV format
 * @access Private (Requires edit_controls)
 */
router.get('/controls-csv', protect, authorize('edit_controls'), (req, res) => {
    setFileHeaders(res, 'SSP_Controls_eMASS.csv', 'text/csv');
    // exportControlsCsv(req, res);
    res.status(200).send("Control ID,Status,Narrative\nAC-2,Implemented,\"Narrative Text...\"");
});

/**
 * @route GET /api/export/poam-csv
 * @desc Export POA&M data to eMASS CSV format
 * @access Private (Requires edit_controls)
 */
router.get('/poam-csv', protect, authorize('edit_controls'), (req, res) => {
    setFileHeaders(res, 'POA_M_eMASS.csv', 'text/csv');
    // exportPoamCsv(req, res);
    res.status(200).send("Finding ID,Severity,Status,Remediation Date\nPOAM-1,High,Open,2025-12-31");
});

/**
 * @route GET /api/export/oscal
 * @desc Export full SSP data in OSCAL JSON format
 * @access Private (Requires edit_controls)
 */
router.get('/oscal', protect, authorize('edit_controls'), (req, res) => {
    setFileHeaders(res, 'SSP_OSCAL_Package.json', 'application/json');
    // exportOscal(req, res);
    res.status(200).json({ metadata: { version: 'OSCAL 1.0.0' }, system_security_plan: {} });
});

module.exports = router;
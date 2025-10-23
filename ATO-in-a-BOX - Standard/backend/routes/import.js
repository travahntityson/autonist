// backend/routes/import.js (Modified to consolidate ALL import types)
import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect, authorize } from '../middleware/auth.js';
// FIXED: Import the unified processing service
import { processSecureImport } from '../services/import_service.js'; 

const router = express.Router();

/**
 * @route POST /api/import/secure-media
 * @desc NIAP/FIPS Secure Import Gateway for cryptographically signed media transfer.
 * @access Private (System Administrator/ISSM - highest privilege) (AC-3, CM-3)
 */
router.post('/secure-media', protect, authorize('system_access'), asyncHandler(async (req, res) => {
    const { importData } = req.body; 
    
    if (!importData || !importData.content || !importData.digitalSignature || !importData.manifest) {
        return res.status(400).json({ message: 'Missing required secure import manifest fields (content, signature, or manifest).' });
    }

    const actorId = req.user.id; 
    
    // Calls the unified service for NIAP/FIPS validation
    const result = await processSecureImport(importData, actorId);

    if (result.success) {
        // NOTE: The actual data parsing (e.g., CKL/SCAP) occurs INSIDE the service now.
        return res.status(200).json(result);
    } else {
        return res.status(403).json({ message: `Secure Import Failed: ${result.status}` });
    }
}));

/**
 * @route POST /api/import/emass
 * @desc Deprecated/Redirected endpoint. All imports must go through secure-media.
 * @access Private (Requires edit_controls)
 */
router.post('/emass', protect, authorize('edit_controls'), (req, res) => {
    // FIXED: Enforce policy - redirect client to use the secure endpoint first.
    res.status(403).json({ message: 'Use the /api/import/secure-media endpoint to upload cryptographically-validated content.' });
});

/**
 * @route POST /api/import/xacta
 * @desc Deprecated/Redirected endpoint. All imports must go through secure-media.
 * @access Private (Requires edit_controls)
 */
router.post('/xacta', protect, authorize('edit_controls'), (req, res) => {
    // FIXED: Enforce policy - redirect client to use the secure endpoint first.
    res.status(403).json({ message: 'Use the /api/import/secure-media endpoint to upload cryptographically-validated content.' });
});

// Example for a vulnerability import
router.post('/nessus', protect, authorize('update_evidence'), (req, res) => {
    // FIXED: Enforce policy - redirect client to use the secure endpoint first.
    res.status(403).json({ message: 'Use the /api/import/secure-media endpoint to upload cryptographically-validated content.' });
});

export default router;
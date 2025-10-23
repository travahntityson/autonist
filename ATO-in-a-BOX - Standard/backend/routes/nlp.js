// backend/routes/nlp.js
import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
// FIXED: Import security middleware for AC-3 compliance
import { protect, authorize } from '../middleware/auth.js'; 
import { generateControlNarrative, summarizeContext } from '../services/nlp_service.js';
// FIXED: Import the retrieval service for the RAG step
import { retrieveRelevantContext } from '../services/retrieval_service.js';

const router = express.Router();

// Route 1: POST /api/nlp/narrative
// Purpose: Generate a long control narrative (AI-driven SSP generation).
// Access: Requires specialized role (e.g., ISSM) to initiate CUI processing (AC-3).
router.post('/narrative', protect, authorize('generate_narrative'), asyncHandler(async (req, res) => {
    // req.user is attached by the 'protect' middleware (FIPS-compliant session)
    const { controlId, policyText } = req.body;
    
    if (!controlId || !policyText) {
        return res.status(400).json({ message: 'Missing controlId or policyText in request body.' });
    }

    // Call the FIPS-protected service layer
    const actorId = req.user.id; // Use the authenticated user ID for auditing (AU-3)
    const result = await generateControlNarrative(policyText, controlId, actorId);

    if (result.error) {
        return res.status(500).json({ message: 'NLP service failed to generate narrative.' });
    }

    return res.status(200).json(result);
}));

// Route 2: POST /api/nlp/summary
// Purpose: Implement RAG-to-Summary pipeline for quick policy lookup.
// Access: Requires general viewing access (AC-3)
router.post('/summary', protect, authorize('view_controls'), asyncHandler(async (req, res) => {
    const { query } = req.body; // The search query
    
    if (!query) {
        return res.status(400).json({ message: 'Missing query for document summarization.' });
    }
    
    const actorId = req.user.id;

    // 1. RETRIEVAL STEP (FIPS-protected search of CUI)
    const context = await retrieveRelevantContext(query, actorId);
    
    if (!context) {
        // Log not found event (AU-3)
        await logEvent('RAG_CONTEXT_NOT_FOUND', actorId, { query });
        return res.status(404).json({ message: 'No relevant context found for the query.' });
    }

    // 2. SUMMARIZATION STEP (FIPS-protected small model)
    const summary = await summarizeContext(context, actorId);

    return res.status(200).json({ summary });
}));

export default router;
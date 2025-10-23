import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { PoamSchema } from '../schemas/schemas.js';
import { Poams } from '../models/Poams.js';
import { logEvent } from '../services/audit_service.js';
// FIXED: Import auth middleware
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/poams
 * @desc    Get all POA&M items
 * @access  Private (Requires 'view_controls' permission)
 */
router.get('/', protect, authorize('view_controls'), asyncHandler(async (req, res) => {
  const poams = await Poams.findAll({ order: [['id', 'DESC']] });
  res.json(poams);
}));

/**
 * @route   POST /api/poams
 * @desc    Create a new POA&M item
 * @access  Private (Requires 'edit_controls' permission)
 */
router.post('/', protect, authorize('edit_controls'), validate(PoamSchema), asyncHandler(async (req, res) => {
  const poam = await Poams.create(req.body);
  
  logEvent('POA&M_CREATED', req.user.email, { 
    poamId: poam.id, 
    control: poam.control_id 
  });
  
  res.status(201).json(poam);
}));

export default router;
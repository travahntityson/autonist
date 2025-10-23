import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ControlSchema } from '../schemas/schemas.js';
import { Controls } from '../models/Controls.js'; // Using Sequelize Model
import ApiError from '../utils/ApiError.js';
import { logEvent } from '../services/audit_service.js';
// FIXED: Import auth middleware
import { protect, authorize } from '../middleware/auth.js'; 

const router = express.Router();

/**
 * @route   GET /api/controls
 * @desc    Get all controls
 * @access  Private (Requires 'view_controls' permission)
 */
// FIXED: Added protect and authorize
router.get('/', protect, authorize('view_controls'), asyncHandler(async (req, res) => {
  const controls = await Controls.findAll({ order: [['control_id', 'ASC']] });
  res.json(controls);
}));

/**
 * @route   PUT /api/controls/:control_id
 * @desc    Update a control's status and/or narrative
 * @access  Private (Requires 'edit_controls' permission)
 */
// FIXED: This single endpoint now securely handles all updates for a control.
router.put(
  '/:control_id', 
  protect, 
  authorize('edit_controls'), 
  validate(ControlSchema.pick({ status: true, procedure: true }).partial()), // Validate status or procedure
  asyncHandler(async (req, res) => {
    
    const { control_id } = req.params;
    // We can accept updates for status, procedure, or both
    const { status, procedure } = req.body;

    const control = await Controls.findOne({ where: { control_id } });
    if (!control) {
      throw ApiError.notFound('Control not found');
    }

    const oldStatus = control.status;
    let updated = false;
    let logDetails = { controlId: control.control_id, user: req.user.email };

    // Handle status update
    if (status && control.status !== status) {
      // You can re-add your STATUS_HIERARCHY check here if needed
      // const currentRank = STATUS_HIERARCHY[control.status];
      // const newRank = STATUS_HIERARCHY[status];
      // if (newRank < currentRank) {
      //   throw ApiError.badRequest(`Regression denied. Cannot move status from ${control.status} to ${status}.`);
      // }
      
      control.status = status;
      logDetails.oldStatus = oldStatus;
      logDetails.newStatus = status;
      updated = true;
    }

    // Handle narrative (procedure) update
    if (procedure !== undefined && control.procedure !== procedure) {
      control.procedure = procedure;
      logDetails.narrativeUpdated = true;
      updated = true;
    }

    // Only save and log if an actual change was made
    if (updated) {
      // This is the secure, ORM-based update.
      await control.save();
      
      logEvent('CONTROL_UPDATED', req.user.email, logDetails);
    }

    res.json(control);
  })
);

export default router;
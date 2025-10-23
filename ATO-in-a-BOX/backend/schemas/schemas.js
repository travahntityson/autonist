// schemas/schemas.js
const { z } = require('zod');
const { STATUS_HIERARCHY } = require('../data_utils');

// ... (keep nlpSchema, controlUpdateSchema, poamCloseSchema) ...
const nlpSchema = z.object({
  fileName: z.string().min(1, 'fileName is required.'),
});
const controlUpdateSchema = z.object({
  procedure: z.string().optional(),
  status: z.enum(Object.keys(STATUS_HIERARCHY)).optional(),
}).refine(data => data.procedure !== undefined || data.status !== undefined, {
  message: 'At least one field (procedure or status) must be provided for update.',
});
const poamCloseSchema = z.object({
  newStatus: z.enum(['Closed', 'Accepted']),
});


// --- NEW SCHEMA for Audit Log ---
const auditLogSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format.'),
  origin: z.string().min(1, 'Origin is required.'),
  username: z.string().min(1, 'Username is required.'),
  role: z.string().min(1, 'Role is required.'),
  action: z.string().min(1, 'Action is required.'),
  details: z.string().optional(),
});
// ------------------------------

module.exports = {
  nlpSchema,
  controlUpdateSchema,
  poamCloseSchema,
  auditLogSchema, // <-- Export the new schema
};
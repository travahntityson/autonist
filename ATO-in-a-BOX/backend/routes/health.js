import express from 'express';
import { sequelize } from '../database/sequelize.js'; // Adjust path as needed
import crypto from 'crypto'; // Import the crypto module

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Check FIPS status
    const fipsEnabled = crypto.getFips();

    // 2. Check DB connection
    await sequelize.authenticate();

    // 3. Report status
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      // 4. Add FIPS status to the health check
      fips_mode: fipsEnabled ? 'enabled' : 'disabled' 
    });
    
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      fips_mode: 'unknown',
      details: error.message
    });
  }
});

export default router;
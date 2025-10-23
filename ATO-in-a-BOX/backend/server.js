import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './database/sequelize.js'; // Ensure correct import path
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import controlsRouter from './routes/controls.js';
import poamsRouter from './routes/poams.js';
import importRouter from './routes/import.js';
import exportRouter from './routes/export.js';
import healthRouter from './routes/health.js';
// FIXED: Import the new auth router
import authRouter from './routes/auth.js'; 

// Load .env.local *before* anything else
dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/api/health', healthRouter);
// FIXED: Add the auth routes (must be before protected routes)
app.use('/api/auth', authRouter); 

// These routes will now be protected internally
app.use('/api/controls', controlsRouter);
app.use('/api/poams', poamsRouter);
app.use('/api/import', importRouter);
app.use('/api/export', exportRouter);


// Global Error Handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // connectDB() already logs its own success/failure
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Using { alter: true } is okay for dev, but for prod, use migrations.
    // It will update tables but NOT delete data.
    await sequelize.sync({ alter: true }); 
    console.log('✅ Database synchronized.');
    
    app.listen(port, () => console.log(`✅ Server running on port ${port}`));
  } catch (err) {
    console.error('❌ Unable to start server:', err);
    process.exit(1);
  }
};

startServer();
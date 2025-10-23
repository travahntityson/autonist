// backend/db/sequelize.js
const { Sequelize } = require('sequelize');
// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Destructure and validate required environment variables
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASS || !DB_HOST) {
  console.error('FATAL ERROR: Missing required database environment variables.');
  console.error('Ensure DB_NAME, DB_USER, DB_PASS, and DB_HOST are set in .env.local');
  process.exit(1); // Exit the application if secrets are missing
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    // Add SSL options if connecting to a remote production DB
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false 
    // }
  }
});

// Test the connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
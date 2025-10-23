// backend/scripts/seed_database.js
const { sequelize, connectDB } = require('../db/sequelize'); // Import Sequelize setup
const Control = require('../models/Control');
const Poam = require('../models/Poam');
const User = require('../models/User');

const nistControlData = require('../data/nist_controls.json');
// const defaultUserData = require('../data/default_user.json'); // Assume this file now exists

const seedDatabase = async () => {
    await connectDB(); // Connect and authenticate with PostgreSQL

    try {
        // 1. Synchronize Models (Creates tables if they don't exist)
        // Use { force: true } to drop and recreate tables (CAUTION in production)
        await sequelize.sync({ force: true }); 
        console.log('PostgreSQL tables synchronized (recreated).');

        // 2. Insert NIST Controls
        console.log(`Inserting ${nistControlData.length} NIST controls...`);
        await Control.bulkCreate(nistControlData);
        console.log('NIST Controls inserted successfully.');

        // 3. Insert Default Admin User
        console.log('Inserting default admin user...');
        // Assume defaultUserData is structured like: { username: 'admin', password: 'password', role: 'ISSM' }
        // The User model hook handles password hashing before creation
        // await User.create(defaultUserData); 
        console.log('Default admin user created.');

        // 4. Insert Initial Audit Log Entry (If you have an AuditLog model)
        // Assuming a simpler approach without a dedicated AuditLog model for now.

        console.log('Database seeding complete! 🌱');
    } catch (error) {
        console.error('DATABASE SEEDING FAILED:', error.message);
        process.exit(1);
    } finally {
        // Close Connection
        await sequelize.close();
        console.log('PostgreSQL connection closed.');
    }
};

seedDatabase();
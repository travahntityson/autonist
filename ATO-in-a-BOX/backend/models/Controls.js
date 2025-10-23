// backend/models/Control.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');

const Control = sequelize.define('Control', {
    control_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    family: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Implemented', 'Partially Implemented', 'Not Implemented', 'Not Applicable'), defaultValue: 'Not Implemented' },
    
    // The core SSP narrative documentation
    procedure: { type: DataTypes.TEXT, defaultValue: '' }, 
    
    // Metadata updated by CCM tools
    latest_scan_date: { type: DataTypes.DATE },
    associated_ccis: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    // Ensure table name is singular
    tableName: 'controls'
});

module.exports = Control;
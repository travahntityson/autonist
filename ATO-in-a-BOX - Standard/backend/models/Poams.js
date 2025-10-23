// backend/models/Poam.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');

const Poam = sequelize.define('Poam', {
    poam_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    control_id: { type: DataTypes.STRING, allowNull: false, references: { model: 'controls', key: 'control_id' } },
    finding_title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    severity: { type: DataTypes.ENUM('High', 'Moderate', 'Low'), allowNull: false },
    status: { type: DataTypes.ENUM('Open', 'Closed', 'Risk Accepted'), defaultValue: 'Open' },
    // Remediation Milestones would typically be in a separate joined table, 
    // but for simplicity, we'll serialize/de-serialize as JSONB in PostgreSQL:
    remediation_milestones: { type: DataTypes.JSONB, defaultValue: [] },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    tableName: 'poams'
});

module.exports = Poam;
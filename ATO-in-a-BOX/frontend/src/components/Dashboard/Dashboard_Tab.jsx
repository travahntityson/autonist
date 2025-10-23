// src/components/Dashboard/Dashboard_Tab.jsx
import React from 'react';

const DashboardTab = (props) => {
    // Implement your dashboard view here
    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl text-white">Dashboard View Placeholder</h3>
            {/* You can use the props to display compliance scores here */}
            <p className="text-gray-400">Compliance Score: {props.complianceScore}%</p>
        </div>
    );
};

export default DashboardTab;
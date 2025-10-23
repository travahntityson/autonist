import React from 'react';

const StatusPill = React.memo(({ status, severity, size = 'xs', isInherited = false }) => {
    let colorClass = 'bg-gray-600';
    let textColor = 'text-white';
    
    if (isInherited) { 
        colorClass = 'bg-indigo-600/70'; 
        textColor = 'text-white'; 
    } else if (status === 'Implemented') { 
        colorClass = 'bg-green-600/70'; 
        textColor = 'text-white'; 
    } else if (status === 'Partially Implemented') { 
        colorClass = 'bg-yellow-500/70'; 
        textColor = 'text-black'; 
    } else if (status === 'Not Implemented') { 
        colorClass = 'bg-red-600/70'; 
        textColor = 'text-white'; 
    } else if (status === 'Not Applicable') { 
        colorClass = 'bg-gray-800/70'; 
        textColor = 'text-gray-400'; 
    }
    
    let severityClass = 'text-gray-400'; 
    if (severity === 'High') severityClass = 'text-red-400'; 
    else if (severity === 'Moderate') severityClass = 'text-yellow-400'; 
    else if (severity === 'Low') severityClass = 'text-green-400';
    
    return (
        <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 text-${size} font-semibold rounded-full ${colorClass} ${textColor}`}>
                {isInherited ? 'INHERITED' : status}
            </span>
            {severity && <span className={`text-${size} font-medium ${severityClass}`}>{severity}</span>}
        </div>
    );
});

export default StatusPill;
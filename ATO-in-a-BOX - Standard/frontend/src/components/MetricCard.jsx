import React from 'react';

export const MetricCard = React.memo(({ title, value, unit = '', className = '' }) => (
    <div className={`p-6 rounded-xl shadow-xl backdrop-blur-sm bg-white/10 border border-gray-700/50 ${className}`}>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="mt-1 text-5xl font-extrabold text-white">
            {value}
            <span className="text-2xl font-semibold ml-1 text-gray-300">{unit}</span>
        </p>
    </div>
));
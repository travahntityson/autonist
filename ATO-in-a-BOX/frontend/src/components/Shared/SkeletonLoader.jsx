import React from 'react';

const SkeletonLoader = ({ className = '' }) => (
    <div className={`bg-gray-700 rounded-md animate-pulse ${className}`} />
);

export default SkeletonLoader;

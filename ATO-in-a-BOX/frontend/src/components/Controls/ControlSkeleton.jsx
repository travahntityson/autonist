import React from 'react';
// Fix: Changed the import path to be an absolute path from the 'src' directory.
// This can resolve pathing issues in some bundler configurations.
import SkeletonLoader from '/src/components/Shared/SkeletonLoader.jsx';

const ControlSkeleton = () => (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-4 space-y-3">
        <div className="flex justify-between items-center">
            <SkeletonLoader className="h-6 w-1/3" />
            <SkeletonLoader className="h-5 w-24" />
        </div>
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-3/4" />
    </div>
);

export default ControlSkeleton;


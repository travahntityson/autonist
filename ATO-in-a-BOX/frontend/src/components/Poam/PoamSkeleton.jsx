import React from 'react';
// Fix: Corrected the relative path for this component as well.
import SkeletonLoader from '../Shared/SkeletonLoader.jsx';

const PoamSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-20" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-48" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-16" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-40" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-6 w-16" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-6 w-24" /></td>
    </tr>
);

export default PoamSkeleton;


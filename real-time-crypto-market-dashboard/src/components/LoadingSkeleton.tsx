/**
 * LoadingSkeleton Component
 * Displays animated placeholder while data is loading
 */
import React from 'react';
import { useCryptoStore } from '../store/useCryptoStore';

export const LoadingSkeleton: React.FC = () => {
  const { darkMode } = useCryptoStore();

  const bg = darkMode ? 'bg-gray-800' : 'bg-gray-200';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border animate-pulse ${
              darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
            }`}
          >
            <div className={`h-3 w-20 rounded ${bg} mb-2`} />
            <div className={`h-5 w-28 rounded ${bg}`} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className={`rounded-2xl border overflow-hidden ${
        darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-6 py-4 border-b animate-pulse ${
              darkMode ? 'border-gray-800' : 'border-gray-100'
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`w-4 h-4 rounded ${bg}`} />
            <div className={`w-6 h-4 rounded ${bg}`} />
            <div className={`w-8 h-8 rounded-full ${bg}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-24 rounded ${bg}`} />
              <div className={`h-3 w-12 rounded ${bg}`} />
            </div>
            <div className={`h-4 w-20 rounded ${bg}`} />
            <div className={`h-6 w-16 rounded-lg ${bg}`} />
            <div className={`h-4 w-24 rounded ${bg} hidden md:block`} />
            <div className={`h-4 w-20 rounded ${bg} hidden lg:block`} />
          </div>
        ))}
      </div>
    </div>
  );
};

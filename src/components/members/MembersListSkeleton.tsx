import React from 'react';

export function MembersListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 animate-pulse">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="flex gap-2 mt-2">
              <div className="h-4 bg-gray-200 rounded-full w-16" />
            </div>
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

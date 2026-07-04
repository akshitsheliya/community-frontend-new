import React from 'react';
import { Users } from 'lucide-react';

interface EmptyMembersStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function EmptyMembersState({ searchQuery, onClearSearch }: EmptyMembersStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No members found</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        {searchQuery 
          ? `We couldn't find any members matching "${searchQuery}".` 
          : "There are no members to display for the selected filter."}
      </p>
      
      {searchQuery && onClearSearch && (
        <button 
          onClick={onClearSearch}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

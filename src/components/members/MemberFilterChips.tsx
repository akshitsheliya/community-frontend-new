import React from 'react';
import { cn } from '@/lib/utils';

export type FilterType = 'All' | 'Family Heads' | 'Committee' | 'My Family';

interface MemberFilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: FilterType[] = ['All', 'Family Heads', 'Committee', 'My Family'];

export function MemberFilterChips({ activeFilter, onFilterChange }: MemberFilterChipsProps) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0",
              isActive
                ? "bg-[#A32328] text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}

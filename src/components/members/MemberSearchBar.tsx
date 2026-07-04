import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface MemberSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MemberSearchBar({ value, onChange, placeholder = "Search by name or phone..." }: MemberSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync external value changes (e.g. if cleared from outside)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-[#A32328] focus:border-[#A32328] outline-none transition-shadow text-gray-900 placeholder:text-gray-400"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          onClick={() => setLocalValue('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  label: string;
  maxVisibleItems?: number;
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  label,
  maxVisibleItems = 5 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const itemHeight = 36; // уменьшенная высота для мобильных
  const maxHeight = itemHeight * maxVisibleItems;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 sm:px-3 py-2.5 sm:py-3 md:py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm md:text-base text-left flex items-center justify-between"
      >
        <span className={!selectedOption ? 'text-gray-400 truncate' : 'truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-emerald-500 dark:border-emerald-400 rounded-xl shadow-lg overflow-hidden"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm md:text-base transition-colors ${
                  option.value === value
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                style={{ minHeight: `${itemHeight}px` }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

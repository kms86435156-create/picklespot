"use client";

import { useState } from "react";

interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

interface FilterBarProps {
  filters: FilterOption[];
  onFilterChange?: (key: string, value: string) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const handleSelect = (key: string, value: string) => {
    const newValue = selected[key] === value ? "" : value;
    setSelected((prev) => ({ ...prev, [key]: newValue }));
    onFilterChange?.(key, newValue);
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono text-text-muted shrink-0 min-w-[48px]">{filter.label}</span>
          <div className="flex gap-1.5">
            {filter.options.map((opt) => {
              const isActive = selected[filter.key] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(filter.key, opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-all whitespace-nowrap min-h-[36px] ${
                    isActive
                      ? "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/40"
                      : "bg-ui-bg text-text-muted border-ui-border hover:border-white/20 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

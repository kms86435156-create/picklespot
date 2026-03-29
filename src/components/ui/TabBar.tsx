"use client";

interface TabBarProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-ui-border mb-6 overflow-x-auto">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onTabChange(i)}
          className={`px-5 py-3 text-sm font-bold whitespace-nowrap transition-all relative min-h-[44px] ${
            activeTab === i
              ? "text-brand-cyan"
              : "text-text-muted hover:text-white"
          }`}
        >
          {tab}
          {activeTab === i && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-cyan" />
          )}
        </button>
      ))}
    </div>
  );
}

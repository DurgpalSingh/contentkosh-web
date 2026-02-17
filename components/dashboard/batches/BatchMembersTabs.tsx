'use client';

import { LucideIcon } from 'lucide-react';

type BatchMembersTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

interface BatchMembersTabsProps {
  tabs: BatchMembersTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function BatchMembersTabs({ tabs, activeTab, onChange }: BatchMembersTabsProps) {
  return (
    <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6 w-full sm:w-auto overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all min-w-[120px] ${
            activeTab === tab.id
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <tab.icon
            className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400'}`}
          />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

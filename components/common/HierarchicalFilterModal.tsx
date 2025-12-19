'use client';

import { X, Filter } from 'lucide-react';

export interface FilterItem {
    id: number;
    label: string;
    subLabel?: string;
}

export interface FilterSection {
    id: string;
    title: string;
    items: FilterItem[]; // These should be already filtered by the parent if dependent on other sections
    selectedIds: number[];
    onToggle: (id: number) => void;
    emptyMessage: string;
    theme?: 'blue' | 'purple' | 'green' | 'slate';
}

interface HierarchicalFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    sections: FilterSection[];
    onClearAll: () => void;
    onApply: () => void;
}

export function HierarchicalFilterModal({
    isOpen,
    onClose,
    title = 'Filter',
    sections,
    onClearAll,
    onApply,
}: HierarchicalFilterModalProps) {
    if (!isOpen) return null;

    const totalSelected = sections.reduce((acc, section) => acc + section.selectedIds.length, 0);

    // Helper to get theme classes
    const getThemeClasses = (theme: string = 'slate', isSelected: boolean) => {
        if (!isSelected) return 'bg-white border-transparent hover:border-slate-200 mb-1';

        switch (theme) {
            case 'blue':
                return 'bg-blue-50 border-blue-200 shadow-sm';
            case 'purple':
                return 'bg-purple-50 border-purple-200 shadow-sm';
            case 'green':
                return 'bg-green-50 border-green-200 shadow-sm';
            default:
                return 'bg-slate-50 border-slate-200 shadow-sm';
        }
    };

    const getTextClasses = (theme: string = 'slate', isSelected: boolean) => {
        if (!isSelected) return 'text-slate-700';

        switch (theme) {
            case 'blue': return 'text-blue-700';
            case 'purple': return 'text-purple-700';
            case 'green': return 'text-green-700';
            default: return 'text-slate-900';
        }
    };

    const getCheckboxClasses = (theme: string = 'slate') => {
        const base = "h-4 w-4 border-slate-300 rounded focus:ring-offset-0";
        switch (theme) {
            case 'blue': return `${base} text-blue-600 focus:ring-blue-500`;
            case 'purple': return `${base} text-purple-600 focus:ring-purple-500`;
            case 'green': return `${base} text-green-600 focus:ring-green-500`;
            default: return `${base} text-slate-600 focus:ring-slate-500`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative bg-white rounded-xl shadow-2xl w-full flex flex-col overflow-hidden max-h-[90vh] ${sections.length === 1 ? 'max-w-md' :
                    sections.length === 2 ? 'max-w-4xl' : 'max-w-5xl'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className={`grid gap-6 ${sections.length === 1 ? 'grid-cols-1' :
                            sections.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                                'grid-cols-1 md:grid-cols-3'
                        }`}>
                        {sections.map((section, index) => (
                            <div key={section.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                        {sections.length > 1 ? `${index + 1}. ` : ''}{section.title}
                                    </h3>
                                    <span className="text-xs text-slate-500">{section.selectedIds.length} selected</span>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 max-h-[60vh] overflow-y-auto space-y-1">
                                    {section.items.map(item => {
                                        const isSelected = section.selectedIds.includes(item.id);
                                        return (
                                            <label
                                                key={item.id}
                                                className={`flex items-start p-2 rounded-md border cursor-pointer transition-all ${getThemeClasses(section.theme, isSelected)}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className={`mt-0.5 ${getCheckboxClasses(section.theme)}`}
                                                    checked={isSelected}
                                                    onChange={() => section.onToggle(item.id)}
                                                />
                                                <div className="ml-2 overflow-hidden">
                                                    <span className={`block text-sm font-medium truncate ${getTextClasses(section.theme, isSelected)}`}>
                                                        {item.label}
                                                    </span>
                                                    {item.subLabel && (
                                                        <span className="block text-[10px] text-slate-400 font-mono truncate">
                                                            {item.subLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                    {section.items.length === 0 && (
                                        <p className="text-xs text-slate-400 italic p-2">{section.emptyMessage}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                    <button
                        onClick={onClearAll}
                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                        disabled={totalSelected === 0}
                    >
                        Clear All Filters
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors bg-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onApply}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

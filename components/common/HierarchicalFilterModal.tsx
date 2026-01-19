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
    items: FilterItem[];
    selectionType: 'single' | 'multiple';
    selectedIds: number[];
    selectedId: number | null;
    onToggle: (id: number) => void;
    onSelect?: (id: number) => void;

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

    const totalSelected = sections.reduce((acc, section) => {
        if (section.selectionType === 'multiple') {
            return acc + (section.selectedIds?.length ?? 0);
        }
        return acc + (section.selectedId != null ? 1 : 0);
    }, 0);

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
        const base = 'h-4 w-4 border-slate-300 rounded';
        switch (theme) {
            case 'blue': return `${base} text-blue-600`;
            case 'purple': return `${base} text-purple-600`;
            case 'green': return `${base} text-green-600`;
            default: return `${base} text-slate-600`;
        }
    };

    const getRadioClasses = (theme: string = 'slate') => {
        const base = 'h-4 w-4 border-slate-300';
        switch (theme) {
            case 'blue': return `${base} text-blue-600`;
            case 'purple': return `${base} text-purple-600`;
            case 'green': return `${base} text-green-600`;
            default: return `${base} text-slate-600`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-bold text-lg">{title}</h2>
                    </div>
                    <button onClick={onClose}>
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    {sections.map(section => (
                        <div key={section.id}>
                            <h3 className="text-xs font-semibold uppercase mb-2">
                                {section.title}
                            </h3>

                            <div className="bg-slate-50 border rounded-lg p-2 space-y-1 max-h-[50vh] overflow-y-auto">
                                {section.items.map(item => {
                                    const isSelected =
                                        section.selectionType === 'multiple'
                                            ? section.selectedIds?.includes(item.id)
                                            : section.selectedId === item.id;

                                    return (
                                        <label
                                            key={item.id}
                                            className={`flex items-start p-2 rounded-md border cursor-pointer transition-all ${getThemeClasses(
                                                section.theme,
                                                !!isSelected
                                            )}`}
                                        >
                                            <input
                                                type={section.selectionType === 'multiple' ? 'checkbox' : 'radio'}
                                                name={section.selectionType === 'single' ? section.id : undefined}
                                                checked={!!isSelected}
                                                className={`mt-0.5 ${section.selectionType === 'multiple'
                                                        ? getCheckboxClasses(section.theme)
                                                        : getRadioClasses(section.theme)
                                                    }`}
                                                onChange={() => {
                                                    if (section.selectionType === 'multiple') {
                                                        section.onToggle?.(item.id);
                                                    } else {
                                                        section.onSelect?.(item.id);
                                                    }
                                                }}
                                            />
                                            <div className="ml-2">
                                                <div className={getTextClasses(section.theme, !!isSelected)}>
                                                    {item.label}
                                                </div>
                                                {item.subLabel && (
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        {item.subLabel}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}

                                {section.items.length === 0 && (
                                    <p className="text-xs italic text-slate-400 p-2">
                                        {section.emptyMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 flex justify-between">
                    <button
                        onClick={onClearAll}
                        disabled={totalSelected === 0}
                        className="text-sm text-red-600 disabled:opacity-40"
                    >
                        Clear All Filters
                    </button>
                    <button
                        onClick={onApply}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}

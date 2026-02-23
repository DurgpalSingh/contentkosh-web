'use client';

import { ReactNode, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface OverviewCardMenuItem {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface OverviewCardProps {
    icon?: ReactNode;
    title: string;
    subtitle?: ReactNode;
    badges?: ReactNode[];
    menuItems?: OverviewCardMenuItem[];
    children: ReactNode;
    footer?: ReactNode;
    onClick?: () => void;
}

export function OverviewCard({
    icon,
    title,
    subtitle,
    badges,
    menuItems,
    children,
    footer,
    onClick,
}: OverviewCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div
            className={`bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full ${onClick ? 'cursor-pointer' : ''
                }`}
            onClick={onClick}
        >
            <div className="p-5 flex-1">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Icon Slot */}
                        {icon && <div className="flex-shrink-0">{icon}</div>}

                        {/* Title/Subtitle Slot */}
                        <div className="flex-1 min-w-0">
                            {/* Badges Row */}
                            {badges && badges.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {badges.map((badge, idx) => (
                                        <div key={idx}>{badge}</div>
                                    ))}
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-slate-900 truncate" title={title}>
                                {title}
                            </h3>

                            {subtitle && (
                                <div className="mt-1 text-sm text-slate-500 line-clamp-2 truncate">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Slot */}
                    {menuItems && menuItems.length > 0 && (
                        <div className="relative ml-2 flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors outline-none focus:ring-2 focus:ring-slate-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(false);
                                        }}
                                    />
                                    <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                                        {menuItems.map((item, idx) => (
                                            <Button
                                                key={idx}
                                                variant="ghost"
                                                className={`w-full justify-start px-4 py-2 text-sm transition-colors ${item.variant === 'danger'
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMenuOpen(false);
                                                    item.onClick();
                                                }}
                                            >
                                                <item.icon className="h-4 w-4 mr-2" />
                                                {item.label}
                                            </Button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Slot */}
                <div className="border-t border-slate-100 pt-4 mt-2">{children}</div>
            </div>

            {/* Footer Slot */}
            {footer && (
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 mt-auto">
                    {footer}
                </div>
            )}
        </div>
    );
}
'use client';

import { Calendar, Users, Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewCard, OverviewCardMenuItem } from '@/components/common/OverviewCard';
import { Batch } from '@/lib/api';

interface BatchGridCardProps {
    batch: Batch;
    courseName?: string;
    memberCount?: number;
    onViewDetails: (batch: Batch) => void;
    onEdit?: (batch: Batch) => void;
    onDelete?: (batch: Batch) => void;
}

export function BatchGridCard({
    batch,
    courseName,
    memberCount = 0,
    onViewDetails,
    onEdit,
    onDelete,
}: BatchGridCardProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const getDateStatusColor = () => {
        if (!batch.startDate || !batch.endDate) return 'text-slate-500';

        const now = new Date();
        const start = new Date(batch.startDate);
        const end = new Date(batch.endDate);

        if (now < start) return 'text-blue-600'; // Not started
        if (now > end) return 'text-red-600'; // Ended
        return 'text-green-600'; // Active
    };

    const menuItems: OverviewCardMenuItem[] = [];
    if (onEdit) {
        menuItems.push({
            label: 'Edit',
            icon: Edit,
            onClick: () => onEdit(batch),
        });
    }
    if (onDelete) {
        menuItems.push({
            label: 'Delete',
            icon: Trash2,
            onClick: () => onDelete(batch),
            variant: 'danger',
        });
    }

    const badges = [];
    if (courseName) {
        badges.push(
            <span
                key="course"
                className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
            >
                {courseName}
            </span>
        );
    }
    badges.push(
        <span
            key="status"
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${batch.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`}
        >
            {batch.isActive ? 'Active' : 'Inactive'}
        </span>
    );

    return (
        <OverviewCard
            title={batch.displayName || 'Unnamed Batch'}
            subtitle={batch.codeName}
            badges={badges}
            menuItems={menuItems}
            footer={
                <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => onViewDetails(batch)}
                >
                    <Users className="h-4 w-4 mr-2" />
                    View Details
                </Button>
            }
        >
            <div className="space-y-3">
                {/* Dates */}
                <div className="flex items-center text-sm text-slate-600">
                    <Clock className={`h-4 w-4 mr-2 ${getDateStatusColor()}`} />
                    <span className={getDateStatusColor()}>
                        {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                    </span>
                </div>

                {/* Members */}
                <div className="flex items-center text-sm text-slate-500">
                    <Users className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{memberCount} Members</span>
                </div>
            </div>
        </OverviewCard>
    );
}
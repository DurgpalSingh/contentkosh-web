import { User, Mail, Calendar, Layers } from 'lucide-react';
import { Batch } from '@/lib/api';
import { OverviewCard } from '@/components/common/OverviewCard';

interface StudentGridCardProps {
    student: {
        id: number;
        name: string;
        email: string;
        createdAt?: string;
        enrolledBatches: Batch[];
    };
}

export function StudentGridCard({ student }: StudentGridCardProps) {
    return (
        <OverviewCard
            icon={
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <User className="h-6 w-6 text-slate-400" />
                </div>
            }
            title={student.name || 'Unknown Student'}
            subtitle={
                <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate" title={student.email}>{student.email || 'No email'}</span>
                </div>
            }
            footer={
                <div className="flex justify-between items-center text-xs text-slate-400">
                    <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        <span>Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            }
        >
            <div className="mt-2">
                <div className="flex items-center text-sm text-slate-600 mb-2">
                    <Layers className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium">{student.enrolledBatches.length} Active Enrollments</span>
                </div>

                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                    {student.enrolledBatches.map(batch => (
                        <div key={batch.id} className="flex items-center justify-between text-xs bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                            <span className="font-medium text-slate-700 truncate mr-2" title={batch.displayName}>
                                {batch.displayName}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                                {batch.codeName}
                            </span>
                        </div>
                    ))}
                    {student.enrolledBatches.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No Batches</span>
                    )}
                </div>
            </div>
        </OverviewCard>
    );
}

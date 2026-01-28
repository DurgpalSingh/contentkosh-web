'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { BatchesService, BatchUsersService, Batch, BatchUser } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserCog, Calendar, GraduationCap, Plus } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

// Simple Tab Component
function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string; icon?: any }[]; activeTab: string; onChange: (id: string) => void }) {
    return (
        <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all
                        ${activeTab === tab.id
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }
                    `}
                >
                    {tab.icon && <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400'}`} />}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// User Card (Reused for Students and Teachers) - Simple Tile
function UserTile({ user, role }: { user: BatchUser; role: string }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${role === 'TEACHER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {role === 'TEACHER' ? <UserCog className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1" title={user.user?.name}>{user.user?.name || 'Unknown'}</h3>
                            <p className="text-xs text-slate-500">{role}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs text-slate-500 flex items-center">
                            <span className="truncate max-w-full" title={user.user?.email}>{user.user?.email}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BatchDetailsPage() {
    const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const batchId = params?.batchId ? parseInt(params.batchId as string) : null;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [students, setStudents] = useState<BatchUser[]>([]);
    const [teachers, setTeachers] = useState<BatchUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('students');

    const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

    useEffect(() => {
        if (!isAuthenticated) return;
        if (!batchId || isNaN(batchId)) {
            setError('Invalid batch ID');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Batch Details
                const batchRes = await BatchesService.getApiBatches(batchId);
                setBatch(batchRes.data || batchRes);

                // 2. Fetch Students
                const studentsRes = await BatchUsersService.getApiBatchesUsers(batchId, 'STUDENT');
                setStudents(Array.isArray(studentsRes) ? studentsRes : (studentsRes as any).data || []);

                // 3. Fetch Teachers
                if (currentUser?.role !== USER_ROLES.TEACHER) {
                    try {
                        const teachersRes = await BatchUsersService.getApiBatchesUsers(batchId, 'TEACHER');
                        setTeachers(Array.isArray(teachersRes) ? teachersRes : (teachersRes as any).data || []);
                    } catch (e) {
                        console.warn("Could not fetch teachers", e);
                    }
                }

            } catch (err: any) {
                console.error('Failed to load batch data:', err);
                setError('Failed to load batch details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, isAuthenticated, currentUser?.role]);

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (error || !batch) {
        return (
            <div className="p-8 text-center text-red-600 mb-4 bg-red-50 rounded-lg">
                <p>{error || 'Batch not found'}</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const isTeacher = currentUser?.role === USER_ROLES.TEACHER;

    const tabs = [
        { id: 'students', label: 'Students', icon: Users },
        ...(!isTeacher ? [{ id: 'teachers', label: 'Teachers', icon: UserCog }] : []),
    ];

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center space-x-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{batch.displayName}</h1>
                    <div className="flex items-center text-sm text-slate-500 space-x-4 mt-1">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{batch.codeName}</span>
                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'} - {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* Content */}
            <div className="bg-slate-50/50 rounded-xl min-h-[400px]">
                {activeTab === 'students' && (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Enrolled Students ({students.length})</h2>
                            {isAdmin && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" /> Add Student
                                </Button>
                            )}
                        </div>
                        {students.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                                No students enrolled in this batch yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {students.map((bs) => (
                                    <UserTile key={bs.id} user={bs} role="STUDENT" />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Assigned Teachers ({teachers.length})</h2>
                            {isAdmin && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" /> Add Teacher
                                </Button>
                            )}
                        </div>
                        {teachers.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                                No teachers assigned to this batch yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {teachers.map((bs) => (
                                    <UserTile key={bs.id} user={bs} role="TEACHER" />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

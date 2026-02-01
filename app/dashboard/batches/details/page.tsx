'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { BatchesService, BatchUsersService, ExamsService, CoursesService, Batch, BatchUser, Exam, Course } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Users, UserCog, Calendar, GraduationCap,
    Plus, Mail, Clock, Info, ExternalLink, ChevronDown, Filter
} from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

// --- Components ---

// Simple Tab Component
function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string; icon?: any }[]; activeTab: string; onChange: (id: string) => void }) {
    return (
        <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6 w-full sm:w-auto overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg transition-all min-w-[120px]
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

// Redesigned User Tile - Wider, more details
function UserTile({ user, role, onViewInfo }: { user: BatchUser; role: string; onViewInfo: (user: BatchUser) => void }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Main Info */}
            <div className="flex items-start md:items-center gap-4 flex-1">
                <div className={`h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center border-2 ${role === 'TEACHER' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {role === 'TEACHER' ? <UserCog className="h-7 w-7" /> : <Users className="h-7 w-7" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 w-full">
                    {/* Name & Role */}
                    <div className="min-w-[150px]">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1" title={user.user?.name}>{user.user?.name || 'Unknown'}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide mt-1 ${role === 'TEACHER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {role}
                        </span>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col justify-center min-w-[200px]">
                        <div className="flex items-center text-sm text-slate-600" title={user.user?.email}>
                            <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            <span className="truncate">{user.user?.email || 'No email'}</span>
                        </div>
                    </div>

                    {/* Date Joined */}
                    <div className="flex flex-col justify-center min-w-[150px]">
                        <div className="flex items-center text-sm text-slate-600">
                            <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Action */}
            <div className="flex-shrink-0 self-end md:self-center">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600 border-slate-300 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => onViewInfo(user)}
                >
                    <Info className="h-4 w-4 mr-2" />
                    View Detailed Info
                </Button>
            </div>
        </div>
    );
}

// User Details Modal (Simple Overlay for now)
function UserDetailsModal({ user, role, onClose }: { user: BatchUser; role: string; onClose: () => void }) {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${role === 'TEACHER' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                    <h3 className="text-lg font-bold text-slate-800">Detailed Info</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 ${role === 'TEACHER' ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                            {role === 'TEACHER' ? <UserCog className="h-8 w-8" /> : <Users className="h-8 w-8" />}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">{user.user?.name || 'Unknown'}</h4>
                            <p className="text-slate-500 text-sm">{user.user?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-400 uppercase font-semibold">Joined Batch</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-400 uppercase font-semibold">Status</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{user.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-400 uppercase font-semibold">Role</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{role}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-400 uppercase font-semibold">User ID</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">{user.userId}</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function BatchDetailsPage() {
    const { user: currentUser, business, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const batchIdParam = searchParams.get('id');
    const batchId = batchIdParam ? parseInt(batchIdParam as string) : null;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [allBatches, setAllBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<BatchUser[]>([]);
    const [teachers, setTeachers] = useState<BatchUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('students');

    // UI State for Modal
    const [selectedUser, setSelectedUser] = useState<BatchUser | null>(null);
    const [selectedUserRole, setSelectedUserRole] = useState<string>('');

    const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

    // Fetch All Batches for the Selector
    useEffect(() => {
        if (!isAuthenticated || !business?.id) return;

        const fetchAllBatches = async () => {
            try {
                // 1. Fetch Exams
                const examsRes = await ExamsService.getApiBusinessExams(business.id!);
                const exams = examsRes.data || [];

                if (!exams.length) {
                    setAllBatches([]);
                    return;
                }

                // 2. Fetch Courses for all Exams (Parallel)
                // We use allSettled to ensure one failure doesn't break the entire flow
                const coursesResults = await Promise.allSettled(
                    exams.map(exam =>
                        exam.id ? CoursesService.getApiExamsCourses(exam.id) : Promise.reject('No ID')
                    )
                );

                const courses = coursesResults
                    .flatMap(result =>
                        result.status === 'fulfilled' && result.value.data
                            ? result.value.data
                            : []
                    ) as Course[];

                if (!courses.length) {
                    setAllBatches([]);
                    return;
                }

                // 3. Fetch Batches for all Courses (Parallel)
                const batchesResults = await Promise.allSettled(
                    courses.map(course =>
                        course.id ? BatchesService.getApiBatchesCourse(course.id) : Promise.reject('No ID')
                    )
                );

                const batches = batchesResults
                    .flatMap(result =>
                        result.status === 'fulfilled' && result.value.data
                            ? result.value.data
                            : []
                    ) as Batch[];

                // Sort by name
                batches.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));

                setAllBatches(batches);
            } catch (error) {
                console.error("Failed to fetch batches list", error);
            }
        };

        fetchAllBatches();
    }, [isAuthenticated, business?.id]);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (!batchId || isNaN(batchId)) {
            // No batch selected. This is fine, we just show a "Select Batch" empty state.
            setBatch(null);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

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
                setError('Failed to load batch details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, isAuthenticated, currentUser?.role]);

    // Handle Batch Switch
    const handleBatchSwitch = (newBatchId: string) => {
        if (!newBatchId) return;
        router.push(`/dashboard/batches/details?id=${newBatchId}`);
    };

    // Handle View Detailed Info
    const handleViewInfo = (user: BatchUser, role: string) => {
        setSelectedUser(user);
        setSelectedUserRole(role);
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (!batchId || !batch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-slate-100 p-6 rounded-full">
                    <Calendar className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">No Batch Selected</h2>
                <p className="text-slate-500 max-w-md"> Please go to the <b>Batches</b> tab and click "View Details" on a batch to see its students and teachers.</p>
                <Button onClick={() => router.push('/dashboard/batches')} className="mt-4">
                    Go to Batches
                </Button>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 mb-4 bg-red-50 rounded-lg">
                <p>{error}</p>
                <Button variant="outline" onClick={() => router.push('/dashboard/batches')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Batches
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
        <div className="space-y-8 pb-12">
            {/* Header / Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Batch Selector */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <select
                                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer min-w-[200px] hover:bg-slate-100 transition-colors"
                                    value={batch?.id || ''}
                                    onChange={(e) => handleBatchSwitch(e.target.value)}
                                >
                                    <option value="" disabled>Select a Batch</option>
                                    {allBatches.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.displayName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>

                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${batch?.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {batch?.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                                {batch?.codeName}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                {batch?.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'} - {batch?.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/batches')} className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                <div className="min-h-[400px]">
                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Enrolled Students <span className="text-slate-400 font-normal ml-2">({students.length})</span></h2>
                                {isAdmin && (
                                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                        <Plus className="h-4 w-4 mr-2" /> Add Student
                                    </Button>
                                )}
                            </div>

                            {students.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No students enrolled in this batch yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {students.map((bs) => (
                                        <UserTile
                                            key={bs.id}
                                            user={bs}
                                            role="STUDENT"
                                            onViewInfo={(u) => handleViewInfo(u, 'STUDENT')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Assigned Teachers <span className="text-slate-400 font-normal ml-2">({teachers.length})</span></h2>
                                {isAdmin && (
                                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                        <Plus className="h-4 w-4 mr-2" /> Add Teacher
                                    </Button>
                                )}
                            </div>

                            {teachers.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <UserCog className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No teachers assigned to this batch yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {teachers.map((bs) => (
                                        <UserTile
                                            key={bs.id}
                                            user={bs}
                                            role="TEACHER"
                                            onViewInfo={(u) => handleViewInfo(u, 'TEACHER')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    role={selectedUserRole}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
}

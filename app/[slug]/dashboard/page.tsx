'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES, USER_ROLES } from '@/lib/constants';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { hasRole } from '@/lib/rbac';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/auth';

export default function DashboardPage() {
    const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const [isSlugValid, setIsSlugValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            // middleware should handle this, but double check
            router.push(ROUTES.LOGIN);
        }
    }, [isInitialized, isAuthenticated, router]);

    useEffect(() => {
        // Validate slug matches user's business
        if (isInitialized && business && slug) {
            // Only redirect if business.slug is defined and mismatch
            if (business.slug && business.slug !== slug) {
                console.warn(`Slug mismatch: URL has ${slug} but user belongs to ${business.slug}`);
                router.replace(`/${business.slug}/dashboard`);
            } else if (!business.slug) {
                // Handle case where business exists but has no slug (legacy data or error)
                // Maybe allow access if slug matches user id or something? Or just stay on current URL?
                // Preventing infinite loop: if we are at /[slug]/dashboard and business.slug is missing, 
                // we can't redirect to /undefined/dashboard. 
                // Just let them view it or show warning.
                setIsSlugValid(true);
            } else {
                setIsSlugValid(true);
            }
        } else if (isInitialized && !business && user) {
            setIsSlugValid(false);
        }
    }, [isInitialized, business, slug, user, router]);


    if (!isInitialized || isLoading || isSlugValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    // If slug is valid (matches business), render dashboard content

    // Render dashboard based on role
    if (hasRole(user, USER_ROLES.ADMIN)) {
        return <AdminDashboard />;
    }

    if (hasRole(user, USER_ROLES.TEACHER)) {
        return <TeacherDashboard />;
    }

    if (hasRole(user, USER_ROLES.STUDENT)) {
        return <StudentDashboard />;
    }

    return <DefaultDashboard />;
}

// ... Copy DefaultDashboard and other components from original dashboard/page.tsx or import them if I extract them to components 
// For now I will copy them inline to avoid breaking things, or better yet, I should extract them.
// But wait, the user wants me to fix the URL structure.

function DefaultDashboard() {
    const { business } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Welcome to {business?.instituteName || 'Contentkosh'}
                </div>
            </div>

            {/* Removed slug display here since it is now in URL */}

            {business?.logo && (
                <div className="mb-6 px-1">
                    <img src={business.logo} alt="Institute Logo" className="h-16 w-auto object-contain" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Users"
                    value="0"
                    description="Registered users"
                    icon="👥"
                />
                {/* ... other cards */}
                <DashboardCard
                    title="Active Batches"
                    value="0"
                    description="Currently running"
                    icon="📚"
                />
                <DashboardCard
                    title="Courses"
                    value="0"
                    description="Available courses"
                    icon="🎓"
                />
                <DashboardCard
                    title="Announcements"
                    value="0"
                    description="Recent updates"
                    icon="📢"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity />
                <QuickActions />
            </div>
        </div >
    );
}

// ... Shared components
function DashboardCard({ title, value, description, icon }: {
    title: string;
    value: string;
    description: string;
    icon: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className="text-2xl mr-3">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
        </div>
    );
}

function RecentActivity() {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            {/* ... content */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>System initialized</span>
                    <span className="ml-auto text-gray-400">Just now</span>
                </div>
                <div className="text-sm text-gray-500 text-center py-4">
                    No recent activity to display
                </div>
            </div>
        </div>
    );
}

function QuickActions() {
    // We need to update router.push links to include slug?
    // /dashboard/batches -> /[slug]/dashboard/batches
    // This implies a larger refactor of routes? 
    // The user strictly asked for /dashboard URL change.

    const router = useRouter();
    const { business } = useAuthStore();
    const baseUrl = business?.slug ? `/${business.slug}` : '';

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full text-left p-3 h-auto justify-start border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`${baseUrl}/dashboard/batches`)} // Important: future proofing
                >
                    <div>
                        <div className="font-medium text-gray-900">Create New Batch</div>
                        <div className="text-sm text-gray-500">Set up a new student batch</div>
                    </div>
                </Button>
                {/* ... other buttons */}
                <Button
                    variant="outline"
                    className="w-full text-left p-3 h-auto justify-start border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`${baseUrl}/dashboard/courses`)}
                >
                    <div>
                        <div className="font-medium text-gray-900">Add Course</div>
                        <div className="text-sm text-gray-500">Create a new course</div>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="w-full text-left p-3 h-auto justify-start border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`${baseUrl}/dashboard/admin/announcements`)} // Check ROUTES constant
                >
                    <div>
                        <div className="font-medium text-gray-900">Send Announcement</div>
                        <div className="text-sm text-gray-500">Notify users about updates</div>
                    </div>
                </Button>
            </div>
        </div>
    );
}

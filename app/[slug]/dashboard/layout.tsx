'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Props {
    children: React.ReactNode;
}

export default function SlugDashboardLayout({ children }: Props) {
    const router = useRouter();
    const { user, business, isAuthenticated, isInitialized, isLoading, initializeAuth } = useAuthStore();
    const params = useParams();
    const slug = params?.slug as string;

    // ensure auth is initialized once when the layout mounts
    useEffect(() => {
        if (!isInitialized) {
            initializeAuth();
        }
    }, [initializeAuth, isInitialized]);

    // redirect to login when initialization is done and user is not authenticated
    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (business?.slug && slug && business.slug !== slug) {
                // Redirect to correct slug if mismatch
                router.replace(`/${business.slug}/dashboard`);
            }
        }
    }, [isInitialized, isAuthenticated, router, business, slug]);

    // show a centered loading state while auth is in progress
    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // do not render children when not authenticated (redirect will happen above)
    if (!isAuthenticated) return null;

    return <DashboardLayout>{children}</DashboardLayout>;
}

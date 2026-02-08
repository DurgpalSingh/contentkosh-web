'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/lib/constants';

export default function DashboardCatchAll() {
    const { user, business, isAuthenticated, isInitialized } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push(ROUTES.LOGIN);
            } else if (business?.slug) {
                // redirect /dashboard/* to /[slug]/dashboard/*
                let newPath = pathname?.replace('/dashboard', `/${business.slug}/dashboard`);
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.toString()) {
                    newPath += `?${searchParams.toString()}`;
                }

                if (newPath && newPath !== pathname) {
                    router.replace(newPath);
                }
            } else {
                // Fallback: redirects to main dashboard if for some reason we end up here without slug
                router.replace(ROUTES.DASHBOARD);
            }
        }
    }, [isInitialized, isAuthenticated, user, business, router, pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Props {
  children: React.ReactNode;
}

export default function DashboardProtectedLayout({ children }: Props) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading, initializeAuth } = useAuthStore();

  // ensure auth is initialized once when the layout mounts
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // redirect to login when initialization is done and user is not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

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

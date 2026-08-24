'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES, USER_ROLES } from '@/lib/constants';

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminProtectedLayout({ children }: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    } else if (user?.role !== USER_ROLES.SUPERADMIN) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== USER_ROLES.SUPERADMIN) return null;

  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}

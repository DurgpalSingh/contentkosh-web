'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function SuperAdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.SUPERADMIN.BUSINESSES);
  }, [router]);

  return null;
}

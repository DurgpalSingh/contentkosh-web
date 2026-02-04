'use client';

import { useEffect, useRef } from 'react';
import { setupAxiosInterceptors } from '@/lib/axios-setup';

export default function AxiosRegistry() {
    const initialized = useRef(false);

    if (!initialized.current) {
        setupAxiosInterceptors();
        initialized.current = true;
    }

    return null;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResendVerificationButton } from '@/components/auth/ResendVerificationButton';
import { EMAIL_VERIFICATION, RESEND_REASONS, ROUTES } from '@/lib/constants';
import { EMAIL_VERIFICATION_MESSAGES } from '@/lib/messages';

const REASON_MESSAGES: Record<string, string> = {
  [RESEND_REASONS.EXPIRED]: EMAIL_VERIFICATION_MESSAGES.RESEND_EXPIRED,
  [RESEND_REASONS.INVALID]: EMAIL_VERIFICATION_MESSAGES.RESEND_INVALID,
};

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [reasonMessage, setReasonMessage] = useState<string | undefined>();

  // useSearchParams can cause prerender/suspense issues during SSR; read the query client-side instead
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setEmail(searchParams.get(EMAIL_VERIFICATION.EMAIL_QUERY_PARAM) ?? '');
    setReasonMessage(REASON_MESSAGES[searchParams.get(EMAIL_VERIFICATION.REASON_QUERY_PARAM) ?? '']);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 flex items-center">
      <div className="mx-auto w-full max-w-md">
        <Image src="/logo.png" alt="Logo" width={180} height={100} className="mb-6 h-16 w-auto" priority />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{EMAIL_VERIFICATION_MESSAGES.RESEND_PAGE_TITLE}</h1>
            <p className="mt-1 text-sm text-slate-600">{EMAIL_VERIFICATION_MESSAGES.RESEND_PAGE_BODY}</p>
          </div>

          {reasonMessage && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {reasonMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              {EMAIL_VERIFICATION_MESSAGES.EMAIL_LABEL}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder={EMAIL_VERIFICATION_MESSAGES.EMAIL_PLACEHOLDER}
            />
          </div>

          <ResendVerificationButton email={email} />

          <p className="text-center text-sm">
            <Link href={ROUTES.LOGIN} className="font-semibold text-cyan-700 hover:text-cyan-800">
              {EMAIL_VERIFICATION_MESSAGES.BACK_TO_LOGIN}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

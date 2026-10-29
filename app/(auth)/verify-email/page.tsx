'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthApiError, authApi } from '@/lib/auth';
import { API_CODES, EMAIL_VERIFICATION, RESEND_REASONS, ROUTES, type ResendReason } from '@/lib/constants';
import { EMAIL_VERIFICATION_MESSAGES } from '@/lib/messages';

type VerifyState =
  | { status: 'verifying' }
  | { status: 'setting-up' }
  | { status: 'verified' }
  | { status: 'already-verified' }
  | { status: 'failed'; message: string };

const buildResendUrl = (reason: ResendReason, email?: string): string => {
  const params = new URLSearchParams({ [EMAIL_VERIFICATION.REASON_QUERY_PARAM]: reason });
  if (email) params.set(EMAIL_VERIFICATION.EMAIL_QUERY_PARAM, email);
  return `${ROUTES.RESEND_VERIFICATION}?${params.toString()}`;
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const { login, setProfile } = useAuthStore();
  const [state, setState] = useState<VerifyState>({ status: 'verifying' });
  // The link can only be used once; guard against React strict mode running the effect twice.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get(EMAIL_VERIFICATION.TOKEN_QUERY_PARAM);
      if (!token) {
        router.replace(buildResendUrl(RESEND_REASONS.INVALID));
        return;
      }

      try {
        const result = await authApi.verifyEmail(token);

        if (result.alreadyVerified) {
          setState({ status: 'already-verified' });
          return;
        }
        if (!result.autoLogin) {
          setState({ status: 'verified' });
          return;
        }

        // The backend created the institute and logged us in: hydrate the session like a normal login.
        setState({ status: 'setting-up' });
        const profile = await authApi.getProfile();
        if (profile) {
          login(profile, null);
          setProfile(profile);
        }
        const slug = profile?.business?.slug ?? result.slug;
        router.replace(slug ? `/${slug}/dashboard` : ROUTES.DASHBOARD);
      } catch (err) {
        if (err instanceof AuthApiError && err.apiCode === API_CODES.VERIFICATION_LINK_EXPIRED) {
          router.replace(buildResendUrl(RESEND_REASONS.EXPIRED, err.email));
          return;
        }
        if (err instanceof AuthApiError && err.apiCode === API_CODES.VERIFICATION_LINK_INVALID) {
          router.replace(buildResendUrl(RESEND_REASONS.INVALID));
          return;
        }
        setState({
          status: 'failed',
          message: err instanceof Error ? err.message : EMAIL_VERIFICATION_MESSAGES.VERIFY_FAILED_FALLBACK,
        });
      }
    };

    void verify();
  }, [router, login, setProfile]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 flex items-center">
      <div className="mx-auto w-full max-w-md">
        <Image src="/logo.png" alt="Logo" width={180} height={100} className="mb-6 h-16 w-auto" priority />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 text-center space-y-4">
          {(state.status === 'verifying' || state.status === 'setting-up') && (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-slate-700">
                {state.status === 'verifying'
                  ? EMAIL_VERIFICATION_MESSAGES.VERIFYING
                  : EMAIL_VERIFICATION_MESSAGES.SETTING_UP}
              </p>
            </>
          )}

          {(state.status === 'verified' || state.status === 'already-verified') && (
            <>
              <h1 className="text-2xl font-semibold text-slate-900">
                {state.status === 'verified'
                  ? EMAIL_VERIFICATION_MESSAGES.VERIFIED_TITLE
                  : EMAIL_VERIFICATION_MESSAGES.ALREADY_VERIFIED_TITLE}
              </h1>
              <p className="text-sm text-slate-600">
                {state.status === 'verified'
                  ? EMAIL_VERIFICATION_MESSAGES.VERIFIED_BODY
                  : EMAIL_VERIFICATION_MESSAGES.ALREADY_VERIFIED_BODY}
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="inline-block w-full rounded-xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-800"
              >
                {EMAIL_VERIFICATION_MESSAGES.GO_TO_LOGIN}
              </Link>
            </>
          )}

          {state.status === 'failed' && (
            <>
              <h1 className="text-2xl font-semibold text-slate-900">{EMAIL_VERIFICATION_MESSAGES.VERIFY_FAILED_TITLE}</h1>
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>
              <Link
                href={ROUTES.REGISTER}
                className="inline-block w-full rounded-xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-800"
              >
                {EMAIL_VERIFICATION_MESSAGES.GO_TO_REGISTER}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

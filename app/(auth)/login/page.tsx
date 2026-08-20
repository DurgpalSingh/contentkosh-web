'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/auth';
import { ROUTES, USER_ROLES } from '@/lib/constants';
import { LoginRequest } from '@/lib/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  // useSearchParams can cause prerender/suspense issues during SSR; use a client-only fallback
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
  const { login, setProfile } = useAuthStore();

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason) setError(reason);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  // ttrack from where the user is coming from to redirect them back after login
  const getSafeNextPath = (): string | null => {
    const nextPath = searchParams.get('next');
    if (!nextPath) return null;
    if (!nextPath.startsWith('/')) return null;
    if (nextPath.startsWith('//')) return null;
    return nextPath;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: LoginRequest = {
        ...data,
        email: data.email.trim(),
      };

      const response = await authApi.login(payload);
      console.log('Login response:', response);
      if (response.user) {
        login(response.user, null);

        const profile = await authApi.getProfile();
        if (profile) {
          setProfile(profile);
        }

        const safeNextPath = getSafeNextPath();
        if (profile?.role === USER_ROLES.SUPERADMIN) {
          router.push(safeNextPath || ROUTES.SUPERADMIN.BUSINESSES);
        } else if (profile?.business?.slug) {
          router.push(safeNextPath || `/${profile.business.slug}/dashboard`);
        } else {
          router.push(safeNextPath || ROUTES.DASHBOARD);
        }
        toast.success('Login successful');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 flex items-center">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <section className="mb-8 lg:mb-0">
          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={100}
            className="h-16 w-auto"
            priority
          />
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">
            Login and Continue Manage Your Pathway of Growth.
          </h1>
        </section>

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-600">
              New here?{' '}
              <Link href={ROUTES.REGISTER} className="font-semibold text-cyan-700 hover:text-cyan-800">
                Register Your Coaching Institute
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  {...register('email', {
                    setValueAs: (value) => (typeof value === 'string' ? value.trim() : value),
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-12 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.08-6.32" />
                        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.1 4.26" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

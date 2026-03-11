'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { RegisterRequest, BusinessService, CreateBusinessRequest } from '@/lib/api';

const signupSchema = z.object({
  instituteName: z
    .string()
    .trim()
    .min(3, 'Institute Name must be at least 3 characters')
    .max(100, 'Institute Name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      'Institute Name can only contain letters, numbers, spaces, hyphens (-), and underscores (_)'
    )
    .refine((value) => /[a-zA-Z]/.test(value), 'Institute Name must include at least one letter'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      instituteName: '',
      slug: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const instituteName = useWatch({
    control,
    name: 'instituteName',
  });

  // Auto-generate slug from institute name
  useEffect(() => {
    if (instituteName) {
      const generatedSlug = instituteName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [instituteName, setValue]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Register User
      const registerData: RegisterRequest = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      const response = await authApi.register(registerData);

      if (response.user) {
        // 2. Create Business
        try {
          const businessData: CreateBusinessRequest = {
            instituteName: data.instituteName,
            slug: data.slug,
            // Add other fields if necessary
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any; // Cast to any because generated type might be missing slug

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const businessParams: any = { ...businessData };

          await BusinessService.postApiBusiness(businessParams);

          // 3. Update local state
          const loginResponse = await authApi.login({
            email: data.email,
            password: data.password
          });

          if (loginResponse.user) {
            const businessResponse = await authApi.getBusiness();
            login(loginResponse.user, businessResponse);

            // 5. Redirect
            // User requested "recieve their slugs in url". 
            // We redirect to /[slug]/dashboard
            if (data.slug) {
              router.push(`/${data.slug}/dashboard`);
            } else {
              router.push(ROUTES.DASHBOARD);
            }
          } else {
            // Fallback if login fails strictly speaking shouldn't happen
            const businessResponse = await authApi.getBusiness();
            login(response.user, businessResponse);
            router.push(ROUTES.DASHBOARD);
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (bizError: any) {
          console.error('Business creation failed', bizError);
          // If business creation fails, user is still registered.
          // Maybe we should redirect to a "Finish Setup" page?
          // For now, logging it and showing error.
          setError(bizError.body?.message || 'Business creation failed. Please contact support.');
          // Keep user logged in but warn?
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 flex items-center">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <section className="hidden lg:block">
          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={100}
            className="h-16 w-auto"
            priority
          />
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">
            Create your institute and start organizing everything in one place.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            We will set up your institute space and the admin account in one step.
          </p>
        </section>

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Create your institute</h2>
            <p className="mt-1 text-sm text-slate-600">
              Already have an account?{' '}
              <Link href={ROUTES.LOGIN} className="font-semibold text-cyan-700 hover:text-cyan-800">
                Sign in here
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
              {/* Institute Name */}
              <div>
                <label htmlFor="instituteName" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Institute Name
                </label>
                <input
                  {...register('instituteName')}
                  type="text"
                  id="instituteName"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="e.g. Acme Academy"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {(instituteName || '').length}/100 characters
                </p>
                {errors.instituteName && (
                  <p className="mt-1 text-sm text-red-600">{errors.instituteName.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Institute URL Slug
                </label>
                <div className="mt-1 flex rounded-xl shadow-sm">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                    app.contentkosh.com/
                  </span>
                  <input
                    {...register('slug')}
                    type="text"
                    id="slug"
                    className="block w-full rounded-none rounded-r-xl border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="acme-academy"
                  />
                </div>
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="mx-4 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Admin Details
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create Account & Institute'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

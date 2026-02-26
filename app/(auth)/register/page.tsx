'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { RegisterRequest, BusinessService, CreateBusinessRequest } from '@/lib/api';

const signupSchema = z.object({
  instituteName: z.string().min(2, 'Institute Name must be at least 2 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your institute
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your journey with ContentKosh
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">

            {/* Institute Name */}
            <div>
              <label htmlFor="instituteName" className="block text-sm font-medium text-gray-700">
                Institute Name
              </label>
              <input
                {...register('instituteName')}
                type="text"
                id="instituteName"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="e.g. Acme Academy"
              />
              {errors.instituteName && (
                <p className="mt-1 text-sm text-red-600">{errors.instituteName.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Institute URL Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  app.contentkosh.com/
                </span>
                <input
                  {...register('slug')}
                  type="text"
                  id="slug"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="acme-academy"
                />
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Admin Details</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account & Institute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
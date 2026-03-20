'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { RegisterRequest, BusinessService, CreateBusinessRequest } from '@/lib/api';
import { toast } from 'sonner';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(20, 'Password cannot exceed 20 characters')
  .superRefine((value, ctx) => {
    if (!/[A-Z]/.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include an uppercase letter' });
    }
    if (!/[a-z]/.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include a lowercase letter' });
    }
    if (!/[0-9]/.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include a number' });
    }
    if (!/[!@#$%^&*]/.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include a special character' });
    }
  });

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
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Name can only contain letters and single space (in between words)'),
  email: z
    .string()
    .trim()
    .email('Please enter valid email address')
    .refine((value) => !/\+{2,}/.test(value), 'Email cannot contain multiple consecutive "+" characters'),
  password: passwordSchema,
  confirmPassword: z.string(),
  termsAccepted: z
    .boolean()
    .refine((value) => value === true, { message: 'Please accept term & condition' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const slugify = (value: string, trimEnd = false) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '');

  return trimEnd ? normalized.replace(/-+$/, '') : normalized;
};

const capitalizeNameInput = (value: string) => {
  if (!value) return value;
  const hasTrailingSpace = /\s$/.test(value);
  const normalized = value.replace(/\s+/g, ' ').trim();
  const capitalized = normalized
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return hasTrailingSpace ? `${capitalized} ` : capitalized;
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      termsAccepted: false,
    }
  });

  const instituteName = useWatch({
    control,
    name: 'instituteName',
  });

  const slug = useWatch({
    control,
    name: 'slug',
  });

  const name = useWatch({
    control,
    name: 'name',
  });
  const password = useWatch({
    control,
    name: 'password',
  });

  const passwordChecks = useMemo(() => {
    const value = password || '';
    return {
      minLength: value.length >= 8,
      maxLength: value.length > 0 && value.length <= 20,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*]/.test(value),
    };
  }, [password]);
  
  useEffect(() => {
    const currentSlug = (slug || '').trim();

    if (!currentSlug || currentSlug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setSlugStatus('checking');
        const slugRequest = BusinessService.getApiBusinessSlugExists(currentSlug);
        const onAbort = () => slugRequest.cancel();
        controller.signal.addEventListener('abort', onAbort, { once: true });
        const response = await slugRequest;
        controller.signal.removeEventListener('abort', onAbort);
        if (controller.signal.aborted) return;
        const exists = Boolean(response.data?.exists);
        setSlugStatus(exists ? 'taken' : 'available');
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Slug check failed:', err);
        setSlugStatus('error');
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [slug]);

  // Auto-generate slug from institute name
  useEffect(() => {
    if (instituteName) {
      const generatedSlug = slugify(instituteName, true);
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [instituteName, setValue]);

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSlug = slugify(event.target.value);
    setValue('slug', nextSlug, { shouldValidate: true });
  };

  const handleSlugBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const nextSlug = slugify(event.target.value, true);
    setValue('slug', nextSlug, { shouldValidate: true });
  };

  const onSubmit = async (data: SignupFormData) => {
    if (isLoading) return;
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
            toast.success('Account created successfully');

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
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 flex items-center lg:h-screen lg:overflow-hidden">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:h-full lg:grid-cols-2 lg:items-center">
        <section className="mb-4 lg:mb-0">
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

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col lg:max-h-[calc(100vh-8rem)]">
          <div className="mb-6 shrink-0">
            <h2 className="text-2xl font-semibold text-slate-900">Create your institute</h2>
            <p className="mt-1 text-sm text-slate-600">
              Already have an account?{' '}
              <Link href={ROUTES.LOGIN} className="font-semibold text-cyan-700 hover:text-cyan-800">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="flex-1 lg:overflow-y-auto lg:pr-1">
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
                  maxLength={100}
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
                    onChange={handleSlugChange}
                    onBlur={handleSlugBlur}
                    className="block w-full rounded-none rounded-r-xl border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="acme-academy"
                    maxLength={100}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {(slug || '').length}/100 characters
                </p>
                {slugStatus === 'checking' && (
                  <p className="mt-1 text-xs text-slate-500">Checking availability...</p>
                )}
                {slugStatus === 'available' && (
                  <p className="mt-1 text-sm text-emerald-600">Slug is available.</p>
                )}
                {slugStatus === 'taken' && (
                  <p className="mt-1 text-sm text-red-600">Slug is already taken.</p>
                )}
                {slugStatus === 'error' && (
                  <p className="mt-1 text-sm text-amber-600">
                    Could not check slug availability. Try again.
                  </p>
                )}
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
                  {...register('name', {
                    onChange: (event) => {
                      const nextValue = capitalizeNameInput(event.target.value);
                      setValue('name', nextValue, { shouldValidate: true });
                    },
                  })}
                  type="text"
                  autoComplete="name"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter your full name"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {(name || '').length}/100 characters
                </p>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  {...register('email', {
                    onChange: (event) => {
                      const nextValue = event.target.value.replace(/\+{2,}/g, '+');
                      setValue('email', nextValue, { shouldValidate: true });
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <PasswordField
                label="Password"
                id="password"
                placeholder="Create a password"
                inputProps={register('password')}
                error={errors.password?.message}
                show={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                maxLength={20}
                autoComplete="new-password"
                strengthChecks={passwordChecks}
              />

              {/* Confirm Password */}
              <PasswordField
                label="Confirm Password"
                id="confirmPassword"
                placeholder="Confirm your password"
                inputProps={register('confirmPassword')}
                error={errors.confirmPassword?.message}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                maxLength={20}
                autoComplete="new-password"
              />

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    {...register('termsAccepted')}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-200"
                  />
                  <span>
                    I agree to the Terms and Conditions
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || slugStatus === 'taken' || slugStatus === 'checking'}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create Account & Institute'}
            </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


type PasswordChecks = {
  minLength: boolean;
  maxLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

type PasswordFieldProps = {
  label: string;
  id: string;
  placeholder: string;
  inputProps: UseFormRegisterReturn;
  error?: string;
  show: boolean;
  onToggle: () => void;
  maxLength?: number;
  autoComplete?: string;
  strengthChecks?: PasswordChecks;
};

const PasswordField = ({
  label,
  id,
  placeholder,
  inputProps,
  error,
  show,
  onToggle,
  maxLength,
  autoComplete,
  strengthChecks,
}: PasswordFieldProps) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="relative">
      <input
        {...inputProps}
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-11 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18" />
            <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
            <path d="M9.88 5.09A9.77 9.77 0 0 1 12 5c5 0 9.27 3.11 11 7-0.53 1.18-1.33 2.31-2.35 3.28" />
            <path d="M6.61 6.61C4.6 7.69 2.95 9.36 2 12c1.73 3.89 6 7 10 7 1.04 0 2.05-0.19 3-.54" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {strengthChecks && (
      <div className="mt-2 grid gap-1 text-xs text-slate-500">
        <p className={strengthChecks.uppercase ? 'text-emerald-600' : undefined}>
          At least one uppercase letter (A–Z)
        </p>
        <p className={strengthChecks.lowercase ? 'text-emerald-600' : undefined}>
          At least one lowercase letter (a–z)
        </p>
        <p className={strengthChecks.special ? 'text-emerald-600' : undefined}>
          At least one special character (e.g., !@#$%^&*)
        </p>
        <p className={strengthChecks.number ? 'text-emerald-600' : undefined}>
          At least one number (0–9)
        </p>
        <p className={strengthChecks.minLength ? 'text-emerald-600' : undefined}>
          Minimum length: 8 characters
        </p>
        <p className={strengthChecks.maxLength ? 'text-emerald-600' : undefined}>
          Maximum length: 20 characters
        </p>
      </div>
    )}
  </div>
);

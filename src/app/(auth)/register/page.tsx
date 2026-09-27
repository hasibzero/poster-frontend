'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(100),
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'পাসওয়ার্ড মিলছে না',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      await registerUser(data.name, data.email, data.password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bangla-red to-red-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <svg className="w-12 h-12 text-white" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 16L14 22L24 10" stroke="#C8102E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-3xl font-bold font-bangla text-white tracking-tight">পোস্টার জেনারেটর</span>
          </Link>
          
          <h1 className="text-5xl font-bold font-bangla text-white leading-tight mb-6">
            আপনার রাজনৈতিক <br /> যাত্রা শুরু করুন
          </h1>
          <p className="text-red-100 text-lg max-w-md font-bangla">
            আজই যুক্ত হোন এবং প্রফেশনাল ডিজাইনের পোস্টার তৈরি করা শুরু করুন।
          </p>
        </div>
        
        <div className="relative z-10 text-red-200/80 text-sm">
          © {new Date().getFullYear()} পোস্টার জেনারেটর. সর্বস্বত্ব সংরক্ষিত.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <svg className="w-10 h-10 text-bangla-red" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="currentColor"/>
                  <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-2xl font-bold font-bangla text-gray-900">পোস্টার জেনারেটর</span>
              </Link>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 font-bangla tracking-tight">নতুন অ্যাকাউন্ট খুলুন</h2>
            <p className="mt-2 text-gray-500 text-sm">
              আপনার তথ্য দিয়ে একটি নতুন অ্যাকাউন্ট তৈরি করুন
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50/50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="label">পুরো নাম</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className={cn('input', errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
                  placeholder="আপনার নাম"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="label">ইমেইল</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={cn('input', errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">পাসওয়ার্ড</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    className={cn('input pr-10', errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={cn('input', errors.confirmPassword && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
                  placeholder="আবার পাসওয়ার্ড লিখুন"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-bangla-red focus:ring-bangla-red/20 transition-colors cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 text-sm text-gray-600 cursor-pointer">
                আমি <Link href="/terms" className="font-medium text-gray-900 hover:text-bangla-red underline underline-offset-2 transition-colors">শর্তাবলী</Link> এবং
                <Link href="/privacy" className="font-medium text-gray-900 hover:text-bangla-red underline underline-offset-2 transition-colors ml-1">গোপনীয়তা নীতি</Link> গ্রহণ করি
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  অ্যাকাউন্ট তৈরি হচ্ছে...
                </span>
              ) : (
                'অ্যাকাউন্ট খুলুন'
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link href="/login" className="font-semibold text-gray-900 hover:text-bangla-red transition-colors">
                লগইন করুন
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
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

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে');
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
            রাজনৈতিক প্রচারণার <br /> নতুন মাত্রা
          </h1>
          <p className="text-red-100 text-lg max-w-md font-bangla">
            আধুনিক, দৃষ্টিনন্দন এবং প্রফেশনাল রাজনৈতিক পোস্টার তৈরি করুন কয়েক ক্লিকেই।
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
            
            <h2 className="text-3xl font-bold text-gray-900 font-bangla tracking-tight">স্বাগতম ফিরে এসেছেন</h2>
            <p className="mt-2 text-gray-500 text-sm">
              আপনার অ্যাকাউন্টে লগইন করতে নিচের তথ্যগুলো দিন
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4">
                <p className="text-xs text-blue-900 font-semibold font-bangla mb-2">ডেমো ইউজার (User):</p>
                <div className="text-xs text-blue-800 font-mono space-y-1">
                  <p>demo@example.com</p>
                  <p>password123</p>
                </div>
              </div>
              <div className="bg-purple-50/50 border border-purple-200/50 rounded-xl p-4">
                <p className="text-xs text-purple-900 font-semibold font-bangla mb-2">ডেমো অ্যাডমিন (Admin):</p>
                <div className="text-xs text-purple-800 font-mono space-y-1">
                  <p>admin@example.com</p>
                  <p>admin123</p>
                </div>
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50/50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                    autoComplete="current-password"
                    {...register('password')}
                    className={cn('input pr-10', errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}
                    placeholder="••••••••"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-bangla-red focus:ring-bangla-red/20 w-4 h-4 transition-colors" />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">মনে রাখুন</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-bangla-red hover:text-[#a50d26] transition-colors">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  লগইন হচ্ছে...
                </span>
              ) : (
                'লগইন করুন'
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              অ্যাকাউন্ট নেই?{' '}
              <Link href="/register" className="font-semibold text-gray-900 hover:text-bangla-red transition-colors">
                রেজিস্টার করুন
              </Link>
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="card p-4 bg-gray-50/50 border-none">
              <p className="text-xs text-center text-gray-500 font-medium">
                ডেমোর জন্য: demo@example.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
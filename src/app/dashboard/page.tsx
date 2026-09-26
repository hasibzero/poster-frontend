'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Layout, Image, Sparkles, Users, Shield, Star, LogOut, Plus, History, Download, Settings } from 'lucide-react';
import { OCCASION_LABELS, OCCASION_COLORS } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';

const occasions = [
  { key: 'victory', icon: Star, desc: 'বিজয় দিবস পোস্টার' },
  { key: 'condolence', icon: Shield, desc: 'শোক ও স্মরণ পোস্টার' },
  { key: 'campaign', icon: Users, desc: 'নির্বাচনী প্রচার পোস্টার' },
  { key: 'greeting', icon: Sparkles, desc: 'শুভেচ্ছা ও উপহার পোস্টার' },
  { key: 'eid', icon: Image, desc: 'ঈদ ও উৎসব পোস্টার' },
] as const;

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-bangla-red" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="currentColor"/>
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold font-bangla text-gray-900">পোস্টার জেনারেটর</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/create" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                নতুন পোস্টার
              </Link>
              <Link href="/history" className="btn-ghost">
                <History className="w-4 h-4 mr-2" />
                ইতিহাস
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700 font-bangla">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 font-bangla">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="btn-ghost p-2"
                  title="লগআউট"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 font-bangla">
            স্বাগতম, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            আপনার পোস্টার তৈরির ড্যাশবোর্ডে আপনাকে স্বাগতম। নিচে থেকে একটি ক্যাটাগরি বেছে নিন।
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Link href="/create" className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">নতুন পোস্টার</p>
                <p className="text-2xl font-bold text-gray-900 font-bangla">শুরু করুন</p>
              </div>
            </div>
          </Link>
          <Link href="/history" className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">পোস্টার ইতিহাস</p>
                <p className="text-2xl font-bold text-gray-900 font-bangla">দেখুন</p>
              </div>
            </div>
          </Link>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ডাউনলোড</p>
                <p className="text-2xl font-bold text-gray-900 font-bangla">PNG / PDF</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">সেটিংস</p>
                <p className="text-2xl font-bold text-gray-900 font-bangla">প্রোফাইল</p>
              </div>
            </div>
          </div>
        </div>

        {/* Template Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-bangla">টেমপ্লেট ক্যাটাগরি</h2>
            <Link href="/create" className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center gap-1">
              সব দেখুন <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {occasions.map(({ key, icon: Icon, desc }) => {
              const colors = OCCASION_COLORS[key as keyof typeof OCCASION_COLORS];
              return (
                <Link 
                  key={key} 
                  href={`/create?occasion=${key}`}
                  className="card group p-6 text-center h-full transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div 
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-1">
                    {OCCASION_LABELS[key as keyof typeof OCCASION_LABELS]}
                  </h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Posters */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-bangla">সাম্প্রতিক পোস্টার</h2>
            <Link href="/history" className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center gap-1">
              সব দেখুন <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="card">
            <div className="p-8 text-center">
              <Layout className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-bangla mb-1">এখনো কোনো পোস্টার নেই</h3>
              <p className="text-gray-500 mb-6">আপনার প্রথম পোস্টার তৈরি করুন</p>
              <Link href="/create" className="btn-primary inline-flex">
                <Plus className="w-4 h-4 mr-2" />
                পোস্টার তৈরি করুন
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
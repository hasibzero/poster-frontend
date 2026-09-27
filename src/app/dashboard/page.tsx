'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout, Image, Sparkles, Users, Shield, Star, LogOut, Plus, History, Download, Settings, Loader2, ArrowRight, Eye } from 'lucide-react';
import { api, Poster, getStatusLabel, getStatusColor, OCCASION_LABELS, OCCASION_COLORS } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const occasions = [
  { key: 'victory', icon: Star, desc: 'বিজয় দিবস পোস্টার' },
  { key: 'condolence', icon: Shield, desc: 'শোক ও স্মরণ পোস্টার' },
  { key: 'campaign', icon: Users, desc: 'নির্বাচনী প্রচার পোস্টার' },
  { key: 'greeting', icon: Sparkles, desc: 'শুভেচ্ছা ও উপহার পোস্টার' },
  { key: 'eid', icon: Image, desc: 'ঈদ ও উৎসব পোস্টার' },
] as const;

export default function DashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [recentPosters, setRecentPosters] = useState<Poster[]>([]);
  const [loadingPosters, setLoadingPosters] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && token) {
      api.posters.list(1, 4).then(res => {
        if (res.data) {
          setRecentPosters(res.data.items);
        }
        setLoadingPosters(false);
      }).catch(err => {
        toast.error('Failed to load recent posters');
        setLoadingPosters(false);
      });
    }
  }, [user, token]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="w-8 h-8 text-bangla-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-bangla-red flex items-center justify-center shadow-sm">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-bangla text-gray-900 tracking-tight">পোস্টার জেনারেটর</span>
            </Link>

            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <Link href="/admin/dashboard" className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors font-bangla">
                  অ্যাডমিন প্যানেল
                </Link>
              )}
              <Link href="/create" className="bg-bangla-red text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-bangla-red/90 transition-all shadow-sm flex items-center gap-1.5 font-bangla">
                <Plus className="w-4 h-4" />
                নতুন পোস্টার
              </Link>
              
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-700">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{user.name}</p>
                    <p className="text-xs text-gray-500 leading-none">{user.email}</p>
                  </div>
                </div>
                <button onClick={logout} className="p-1.5 rounded-lg text-gray-400 hover:text-bangla-red hover:bg-red-50 transition-colors" title="লগআউট">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Section */}
        <div className="bg-white border border-gray-200/60 rounded-2xl p-8 mb-10 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-bangla mb-2">
              স্বাগতম, {user.name}
            </h1>
            <p className="text-sm text-gray-500">আজকে কি ডিজাইন তৈরি করতে চান?</p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-[#FAFAF8] border border-gray-200/60 rounded-xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">{user.generationCount || 0}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">তৈরি পোস্টার</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-bangla">টেম্পলেট ক্যাটাগরি</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {occasions.map(({ key, icon: Icon, desc }) => {
              return (
                <Link 
                  key={key} 
                  href={`/create?occasion=${key}`}
                  className="bg-white border border-gray-200/60 rounded-xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 text-gray-600 group-hover:text-bangla-red transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 font-bangla mb-1">
                    {OCCASION_LABELS[key as keyof typeof OCCASION_LABELS]}
                  </h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Posters */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-bangla">সাম্প্রতিক কাজ</h2>
            <Link href="/history" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
              সব দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loadingPosters ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : recentPosters.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-bangla mb-1">এখনো কোনো পোস্টার নেই</h3>
              <p className="text-sm text-gray-500 mb-6">প্রথমবারের মতো একটি দারুণ পোস্টার তৈরি করুন</p>
              <Link href="/create" className="inline-flex items-center justify-center bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                নতুন পোস্টার তৈরি করুন
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentPosters.map(poster => (
                <div key={poster._id} className="bg-white border border-gray-200/60 rounded-xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300">
                  <Link href={`/preview/${poster._id}`} className="block relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {poster.generatedImageUrl && poster.status === 'completed' ? (
                      <>
                        <img src={poster.generatedImageUrl} alt="Poster" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <Eye className="w-4 h-4" /> ভিউ করুন
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        {poster.status === 'generating' ? (
                          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
                        ) : (
                          <Layout className="w-6 h-6 text-gray-300 mb-2" />
                        )}
                        <span className="text-xs font-medium font-bangla text-gray-500">
                          {poster.status === 'generating' ? 'তৈরি হচ্ছে...' : poster.status === 'failed' ? 'ব্যর্থ' : 'সম্পন্ন'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        poster.status === 'completed' ? 'bg-green-100 text-green-700' :
                        poster.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {getStatusLabel(poster.status)}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 font-bangla truncate text-sm mb-1">{poster.formData.headlineText || 'শিরোনামহীন'}</h4>
                    <p className="text-xs text-gray-500 font-bangla truncate">{OCCASION_LABELS[poster.formData.occasionType as keyof typeof OCCASION_LABELS] || poster.formData.occasionType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
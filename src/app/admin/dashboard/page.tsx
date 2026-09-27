'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, FileImage, LayoutTemplate, Activity, Zap, Clock } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalPosters: number;
  totalTemplates: number;
  successfulGenerations: number;
  totalTokens: number;
  avgLatencyMs: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.admin.analytics.get();
        if (res.data) setData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'অ্যানালিটিক্স লোড ব্যর্থ হয়েছে');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    </div>;
  }

  if (error || !data) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bangla">{error}</div>;
  }

  const statCards = [
    { label: 'মোট ইউজার', value: data.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'জেনারেটেড পোস্টার', value: data.totalPosters, icon: FileImage, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'মোট টেমপ্লেট', value: data.totalTemplates, icon: LayoutTemplate, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { label: 'সফল জেনারেশন', value: data.successfulGenerations, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'গড় ল্যাটেন্সি', value: `${(data.avgLatencyMs / 1000).toFixed(1)}s`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'AI টোকেন খরচ', value: data.totalTokens.toLocaleString(), icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-bangla">ওভারভিউ</h1>
        <p className="text-sm text-gray-500 mt-1">প্লাটফর্মের বর্তমান স্ট্যাটাস</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 font-bangla">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

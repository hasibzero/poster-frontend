'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    if (user.isPremium) {
      toast.success('আপনি ইতিমধ্যেই প্রিমিয়াম ইউজার!');
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/backend/payments/init', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Redirect to mock payment gateway
      window.location.href = data.data.paymentUrl;
    } catch (err) {
      toast.error('পেমেন্ট শুরু করতে সমস্যা হয়েছে');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 font-bangla mb-4">
          আপনার পলিটিক্যাল ক্যাম্পেইনকে এক ধাপ এগিয়ে নিন
        </h1>
        <p className="text-xl text-gray-500 font-bangla mb-12 max-w-2xl mx-auto">
          ওয়াটারমার্ক-মুক্ত প্রফেশনাল পোস্টার তৈরি করতে আজই প্রো-তে আপগ্রেড করুন
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200/60 shadow-sm opacity-80 flex flex-col">
            <h3 className="text-2xl font-bold font-bangla text-gray-900 mb-2">ফ্রি</h3>
            <div className="text-4xl font-bold text-gray-900 mb-6">৳০<span className="text-lg text-gray-500 font-normal">/মাস</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              {['বেসিক টেমপ্লেট অ্যাক্সেস', 'ওয়াটারমার্ক যুক্ত পোস্টার', 'সাধারণ সাপোর্ট'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-gray-400" />
                  <span className="font-bangla text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold font-bangla hover:bg-gray-50 transition-colors" disabled>
              বর্তমান প্ল্যান
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-bangla-red shadow-xl relative flex flex-col scale-105">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-bangla-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                জনপ্রিয়
              </span>
            </div>
            <h3 className="text-2xl font-bold font-bangla text-gray-900 mb-2">প্রো</h3>
            <div className="text-4xl font-bold text-gray-900 mb-6">৳৪৯৯<span className="text-lg text-gray-500 font-normal">/মাস</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              {['সকল প্রিমিয়াম টেমপ্লেট', 'ওয়াটারমার্ক-মুক্ত হাই-রেজুলেশন পোস্টার (PDF/PNG)', 'প্রাইওরিটি কাস্টমার সাপোর্ট', 'বাল্ক জেনারেশন (খুব শীঘ্রই)'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="font-bangla text-gray-800 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-bangla-red text-white font-bold font-bangla hover:bg-bangla-red/90 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'আপগ্রেড করুন (bKash/Nagad)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

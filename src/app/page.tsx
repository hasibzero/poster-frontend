import Link from 'next/link';
import { 
  Layout, 
  Image, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Shield, 
  Download,
  Star 
} from 'lucide-react';
import { OCCASION_LABELS, OCCASION_COLORS } from '@/lib/api';

const occasions = [
  { key: 'victory', icon: Star, desc: 'বিজয় দিবস পোস্টার' },
  { key: 'condolence', icon: Shield, desc: 'শোক ও স্মরণ পোস্টার' },
  { key: 'campaign', icon: Users, desc: 'নির্বাচনী প্রচার পোস্টার' },
  { key: 'greeting', icon: Sparkles, desc: 'শুভেচ্ছা ও উপহার পোস্টার' },
  { key: 'eid', icon: Image, desc: 'ঈদ ও উৎসব পোস্টার' },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-bangla-red via-bangla-red/90 to-bangla-green/90 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">AI-powered Political Poster Generator</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-bangla leading-tight mb-6">
              বাংলাদেশীয় রাজনৈতিক পোস্টার তৈরি করুন
              <br />
              <span className="text-yellow-300">মিনিটের মধ্যে প্রিন্ট-রেডি</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              বিজয় দিবস, শোক স্মরণ, নির্বাচনী প্রচার, ঈদ-উৎসব — সকল সillirের জন্য প্রফেশনাল গুণমানের পোস্টার। 
              AI লেআউট সাজেশন এবং প্রিসাইজ বাংলা টেক্সট রেন্ডারিংসহ।
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create" className="btn-primary text-lg px-8 py-3 group">
                এখনই পোস্টার তৈরি করুন
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="btn bg-white/10 text-white border-white/30 hover:bg-white/20 text-lg px-8 py-3">
                লগইন করুন
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bangla mb-4">
              কেন এই প্ল্যাটফর্মটি বেছে নেবেন?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              বাংলাদেশের রাজনৈতিক কর্মীদের জন্য ডিজাইন করা, প্রিন্ট-রেডি পোস্টার জেনারেশন
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'AI লেআউট ডিজাইন', desc: 'Gemini AI অকেজশনের প্রಕಾರ রঙ, সাজসজ্জা ও ফটো প্লেসমেন্ট সাজেস্ট করে' },
              { icon: Layout, title: 'প্রিসাইজ বাংলা টেক্সট', desc: 'HTML/Canvas রেন্ডারিং দিয়ে স্পষ্ট, বানান-শুদ্ধ বাংলা হেডলাইন' },
              { icon: Download, title: 'প্রিন্ট-রেডি আউটপুট', desc: '১২০০×১৬০০ পিক্সেল PNG এবং PDF — সরাসরি প্রিন্টে যেতে পারে' },
            ].map((feature, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bangla mb-4">
              সিলেক্ট করুন আপনার উপযুক্ত টেমপ্লেট
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ৫টি ক্যাটাগরিতে কারিগরি ডিজাইন করা টেমপ্লেট লাইব্রেরি
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {occasions.map(({ key, icon: Icon, desc }) => {
              const colors = OCCASION_COLORS[key as keyof typeof OCCASION_COLORS];
              return (
                <Link 
                  key={key} 
                  href="/create"
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

          <div className="text-center mt-12">
            <Link href="/create" className="btn-primary text-lg px-8 py-3">
              সব টেমপ্লেট দেখুন
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bangla mb-4">
              কিভাবে কাজ করে?
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '১', title: 'টেমপ্লেট বেছে নিন', desc: 'উপযোগী সিলেকশন থেকে পছন্দের ডিজাইন পাওয়া' },
              { step: '২', title: 'তথ্য ও ছবি দিন', desc: 'নাম, পদবি, দল, এলাকা ও ১-৩টি ছবি আপলোড করুন' },
              { step: '৩', title: 'AI জেনারেশন', desc: 'জেমিনাই লেআউট সাজেশন দিয়ে পোস্টার তৈরি করবে' },
              { step: '৪', title: 'ডাউনলোড ও প্রিন্ট', desc: 'উচ্চ-রেজোলিউশন PNG/PDF ডাউনলোড করে প্রিন্ট দিন' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600 font-bangla">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {i < 3 && (
                  <div className="absolute top-8 right-0 hidden md:block w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-bangla-red to-bangla-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-bangla mb-4">
            আজই শুরু করুন — কোনো খরচ নেই
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            ফ্রি অ্যাকাউন্ট খুলুন এবং অসীমিত পোস্টার তৈরি করুন। প্রিমিয়াম ফিচার্স আসছে শীঘ্রেই।
          </p>
          <Link href="/register" className="btn bg-white text-bangla-red hover:bg-gray-100 text-lg px-8 py-3">
            ফ্রি রেজিস্ট্রেশন
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold font-bangla mb-4">রাজনৈতিক পোস্টার জেনারেটর</h3>
              <p className="text-gray-400 text-sm">
                বাংলাদেশের স্থানীয় রাজনৈতিক কর্মীদের জন্য AI-চালিত পোস্টার তৈরির প্ল্যাটফর্ম।
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">টেমপ্লেট ক্যাটাগরি</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {occasions.map(({ key }) => (
                  <li key={key}>{OCCASION_LABELS[key as keyof typeof OCCASION_LABELS]}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">সহায়তা</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>ডকুমেন্টেশন</li>
                <li>FAQ</li>
                <li>যোগাযোগ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">কানूনী</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>গোপনীয়তা নীতি</li>
                <li>সেবার শর্তাবলী</li>
                <li>কুকি নীতি</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 রাজনৈতিক পোস্টার জেনারেটর। সকল অধিকার সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
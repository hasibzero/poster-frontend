import Link from 'next/link';
import { Layout, Image, Sparkles, ArrowRight, Users, Shield, Download, Star } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900 font-sans selection:bg-gray-200 selection:text-black">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-gray-900" />
              <span className="font-semibold text-lg font-bangla text-gray-900 tracking-tight">পোস্টার জেনারেটর</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                লগইন
              </Link>
              <Link href="/register" className="text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                রেজিস্টার
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold font-bangla text-gray-900 leading-[1.15] tracking-tight mb-6">
            রাজনৈতিক পোস্টার তৈরি করুন, <br className="hidden sm:block" />
            <span className="text-gray-500">মিনিটের মধ্যে।</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            বিজয় দিবস, শোক স্মরণ, এবং নির্বাচনী প্রচারের জন্য প্রিন্ট-রেডি পোস্টার। আধুনিক লেআউট এবং নিখুঁত বাংলা টাইপোগ্রাফি।
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/create" className="bg-[#C8102E] text-white text-base font-medium px-8 py-3.5 rounded-xl hover:bg-[#a50d26] transition-colors w-full sm:w-auto">
              নতুন পোস্টার তৈরি করুন
            </Link>
            <Link href="/login" className="bg-white text-gray-700 border border-gray-200 text-base font-medium px-8 py-3.5 rounded-xl hover:border-gray-300 transition-colors w-full sm:w-auto shadow-sm">
              কিভাবে কাজ করে?
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-bangla">স্বয়ংক্রিয় লেআউট</h3>
              <p className="text-gray-600 leading-relaxed text-sm">আপনার দেওয়া তথ্যের উপর ভিত্তি করে এআই উপযুক্ত ডিজাইন এবং ফন্ট সাইজ নির্ধারণ করে।</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-5">
                <Layout className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-bangla">নিখুঁত বাংলা টেক্সট</h3>
              <p className="text-gray-600 leading-relaxed text-sm">যেকোনো জটিল যুক্তবর্ণ এবং বাংলা ফন্ট কোনো ত্রুটি ছাড়াই সুন্দরভাবে রেন্ডার হয়।</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-5">
                <Download className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-bangla">প্রিন্ট-রেডি এক্সপোর্ট</h3>
              <p className="text-gray-600 leading-relaxed text-sm">পোস্টারগুলো সরাসরি প্রেসে পাঠানোর জন্য হাই-রেজোলিউশন PNG এবং PDF ফরম্যাটে ডাউনলোড করা যায়।</p>
            </div>
          </div>
        </section>

        {/* Template List */}
        <section className="py-20 px-6 max-w-6xl mx-auto border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 font-bangla mb-2">
                যেকোনো অনুষ্ঠানের জন্য টেমপ্লেট
              </h2>
              <p className="text-gray-500">আপনার প্রয়োজনীয় ক্যাটাগরি বেছে নিন</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {occasions.map(({ key, icon: Icon, desc }) => {
              return (
                <Link 
                  key={key} 
                  href={`/create?occasion=${key}`}
                  className="bg-white border border-gray-200 p-6 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-center flex flex-col items-center"
                >
                  <Icon className="w-6 h-6 text-gray-700 mb-4" />
                  <h3 className="text-sm font-semibold text-gray-900 font-bangla mb-1">
                    {OCCASION_LABELS[key as keyof typeof OCCASION_LABELS]}
                  </h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-bangla text-gray-900 mb-6">
            অ্যাকাউন্ট খুলুন এবং পোস্টার তৈরি শুরু করুন
          </h2>
          <Link href="/register" className="inline-flex items-center justify-center bg-gray-900 text-white rounded-xl text-sm font-medium px-8 py-3.5 hover:bg-gray-800 transition-colors">
            ফ্রি রেজিস্ট্রেশন
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} পোস্টার জেনারেটর।</p>
      </footer>
    </div>
  );
}
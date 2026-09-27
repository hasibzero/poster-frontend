'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Image as ImageIcon, ShieldAlert, LogOut, Loader2, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, token, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const navItems = [
    { name: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'টেমপ্লেট ম্যানেজমেন্ট', href: '/admin/templates', icon: ImageIcon },
    { name: 'পোস্টার মডারেশন', href: '/admin/posters', icon: ShieldAlert },
    { name: 'ইউজার', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white h-16 px-4 border-b border-gray-200/60 sticky top-0 z-40">
        <Link href="/admin/dashboard" className="font-bangla font-bold text-lg tracking-tight text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#C8102E]" />
          অ্যাডমিন প্যানেল
        </Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:text-gray-900">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200/60 flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200/60 hidden md:flex">
          <Link href="/admin/dashboard" className="font-bangla font-bold text-lg tracking-tight text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C8102E]" />
            অ্যাডমিন প্যানেল
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-bangla text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-500" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200/60">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E] font-bold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium font-bangla text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden md:overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

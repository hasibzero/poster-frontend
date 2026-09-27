'use client';

import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { Loader2, ShieldAlert, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.users.list();
      setUsers(res.data);
    } catch (err) {
      toast.error('ইউজার লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-bangla">ইউজার ম্যানেজমেন্ট</h1>
          <p className="text-gray-500 text-sm mt-1">সিস্টেমের সকল ইউজার এবং তাদের ভূমিকা</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200/60 font-bangla text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">নাম</th>
                <th className="px-6 py-4 font-semibold">ইমেইল</th>
                <th className="px-6 py-4 font-semibold">ভূমিকা</th>
                <th className="px-6 py-4 font-semibold">প্রিমিয়াম</th>
                <th className="px-6 py-4 font-semibold">তৈরির তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{u.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ShieldAlert className="w-3 h-3" /> অ্যাডমিন
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ইউজার
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.isPremium ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <BadgeCheck className="w-3.5 h-3.5" /> প্রো
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bangla">
                    কোনো ইউজার পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

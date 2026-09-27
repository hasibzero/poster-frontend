'use client';

import { useState, useEffect } from 'react';
import { api, getStatusLabel, getStatusColor } from '@/lib/api';
import { Poster } from 'shared/types';
import { Trash2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminModerationPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosters = async () => {
    try {
      const res = await api.admin.posters.list(1, 50);
      if (res.data) setPosters(res.data.items);
    } catch (err) {
      toast.error('Failed to load posters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই পোস্টারটি ডিলিট করতে চান?')) return;
    
    setDeletingId(id);
    try {
      await api.admin.posters.delete(id);
      toast.success('পোস্টার ডিলিট হয়েছে');
      setPosters(posters.filter(p => p._id !== id));
    } catch (err) {
      toast.error('পোস্টার ডিলিট ব্যর্থ হয়েছে');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-bangla">পোস্টার মডারেশন</h1>
        <p className="text-sm text-gray-500 mt-1">সব ইউজারদের তৈরি করা পোস্টারগুলো মনিটর করুন</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium font-bangla">
              <tr>
                <th className="px-6 py-4">পোস্টার</th>
                <th className="px-6 py-4">ইউজার/রিকোয়েস্টার</th>
                <th className="px-6 py-4">হেডলাইন</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posters.map((poster) => (
                <tr key={poster._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {poster.generatedImageUrl ? (
                      <div className="w-16 h-20 rounded bg-gray-100 overflow-hidden relative group">
                        <img src={poster.generatedImageUrl} alt="poster" className="w-full h-full object-cover" />
                        <Link href={`/preview/${poster._id}`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </Link>
                      </div>
                    ) : (
                      <div className="w-16 h-20 rounded bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bangla">
                    <p className="font-medium text-gray-900">{poster.formData.name}</p>
                    <p className="text-xs text-gray-500">{poster.formData.designation}</p>
                    {/* Note: In a real app we'd populate userId and show their email here */}
                  </td>
                  <td className="px-6 py-4 font-bangla max-w-[200px] truncate">
                    {poster.formData.headlineText}
                  </td>
                  <td className="px-6 py-4 font-bangla">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                      {getStatusLabel(poster.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(poster._id)}
                      disabled={deletingId === poster._id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingId === poster._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {posters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bangla">
                    কোনো পোস্টার পাওয়া যায়নি
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

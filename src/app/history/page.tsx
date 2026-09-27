'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Download, 
  RotateCcw, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  X,
  Layout
} from 'lucide-react';
import { api, Poster, PaginatedResponse, getStatusLabel, getStatusColor } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime, cn } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<{ id: string; format: 'png' | 'pdf' } | null>(null);

  const fetchPosters = async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.posters.list(page, pagination.limit);
      const data = res.data;
      if (!data) throw new Error('No data returned');
      setPosters(data.items);
      setPagination(prev => ({
        ...prev,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্টার লোড ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
      return;
    }
    if (token) {
      fetchPosters();
    }
  }, [token, authLoading]);

  const handleDownload = async (posterId: string, format: 'png' | 'pdf') => {
    setDownloading({ id: posterId, format });
    try {
      const blob = await api.posters.download(posterId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poster_${posterId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ডাউনলোড ব্যর্থ হয়েছে');
    } finally {
      setDownloading(null);
    }
  };

  const handleRegenerate = async (posterId: string) => {
    setError('');
    try {
      await api.posters.regenerate(posterId);
      fetchPosters(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রিজেনারেট ব্যর্থ হয়েছে');
    }
  };

  const handleDelete = async (posterId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই পোস্টারটি মুছে দিতে চান?')) return;
    
    setDeletingId(posterId);
    try {
      await api.posters.delete(posterId);
      setPosters(prev => prev.filter(p => p._id !== posterId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'মুছে ফেলা ব্যর্থ হয়েছে');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (posterId: string) => {
    router.push(`/preview/${posterId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center bg-white p-8 rounded-2xl border border-gray-200/60 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 font-bangla mb-4">লগইন আবশ্যক</h1>
          <Link href="/login" className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            লগইন করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <Layout className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 font-bangla leading-none">পোস্টার ইতিহাস</h1>
                </div>
              </div>
            </div>
            
            <Link href="/create" className="bg-bangla-red text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-bangla-red/90 transition-all shadow-sm flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              নতুন পোস্টার
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200/60 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {posters.length === 0 && !isLoading ? (
          <div className="bg-white border border-gray-200/60 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 font-bangla mb-2">এখনো কোনো পোস্টার নেই</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              আপনি এখনো কোনো পোস্টার তৈরি করেননি। আপনার প্রথম পোস্টার তৈরি করে শুরু করুন।
            </p>
            <Link href="/create" className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-sm">
              <ImageIcon className="w-4 h-4" />
              প্রথম পোস্টার তৈরি করুন
            </Link>
          </div>
        ) : (
          <>
            {/* Posters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {posters.map(poster => (
                <div key={poster._id} className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden shrink-0">
                    {poster.generatedImageUrl && poster.status === 'completed' ? (
                      <img
                        src={poster.generatedImageUrl}
                        alt={poster.formData.headlineText}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        {poster.status === 'generating' ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-2" />
                        ) : (
                          <Layout className="w-6 h-6 text-gray-300 mb-2" />
                        )}
                        <span className="text-xs font-medium font-bangla">
                          {poster.status === 'generating' ? 'তৈরি হচ্ছে...' : poster.status === 'failed' ? 'ব্যর্থ' : 'সম্পন্ন'}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        poster.status === 'completed' ? 'bg-green-100 text-green-700' :
                        poster.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {getStatusLabel(poster.status)}
                      </span>
                      {poster.retryCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                          রিট্রাই: {poster.retryCount}/3
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info and Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm font-bangla line-clamp-1 mb-1">
                        {poster.formData.headlineText || 'শিরোনামহীন'}
                      </h3>
                      <p className="text-xs text-gray-500 font-bangla mb-3 truncate">
                        {poster.formData.name} {poster.formData.designation ? `• ${poster.formData.designation}` : ''}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mb-4">
                        <span>{formatDateTime(poster.createdAt)}</span>
                        <span>{poster.uploadedPhotoUrls?.length || 0} ছবি</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      {poster.status === 'completed' && poster.generatedImageUrl ? (
                        <>
                          <button
                            onClick={() => handlePreview(poster._id)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200/60 hover:bg-gray-100 hover:text-gray-900 transition-colors col-span-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> ভিউ করুন
                          </button>
                          <button
                            onClick={() => handleDownload(poster._id, 'png')}
                            disabled={downloading?.id === poster._id || deletingId === poster._id}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {downloading?.id === poster._id && downloading.format === 'png' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            PNG
                          </button>
                          <button
                            onClick={() => handleDownload(poster._id, 'pdf')}
                            disabled={downloading?.id === poster._id || deletingId === poster._id}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200/60 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
                          >
                            {downloading?.id === poster._id && downloading.format === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            PDF
                          </button>
                        </>
                      ) : poster.status === 'failed' && poster.retryCount < 3 ? (
                        <button
                          onClick={() => handleRegenerate(poster._id)}
                          disabled={deletingId === poster._id}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200/60 hover:bg-orange-100 transition-colors col-span-2 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> রিজেনারেট
                        </button>
                      ) : poster.status === 'failed' && poster.retryCount >= 3 ? (
                        <div className="col-span-2 text-center py-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg">
                          রিট্রাই শেষ
                        </div>
                      ) : (
                        <div className="col-span-2 text-center py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg">
                          প্রক্রিয়া চলছে...
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleDelete(poster._id)}
                        disabled={deletingId === poster._id}
                        className="col-span-2 mt-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        {deletingId === poster._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchPosters(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                  className="p-2 rounded-full border border-gray-200/60 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchPosters(pageNum)}
                        className={cn(
                          'w-8 h-8 rounded-full text-sm font-medium transition-colors',
                          pagination.page === pageNum
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200/60'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => fetchPosters(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || isLoading}
                  className="p-2 rounded-full border border-gray-200/60 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="mt-6 text-center text-xs font-medium text-gray-400">
              মোট {pagination.total} টি পোস্টার
            </div>
          </>
        )}
      </main>
    </div>
  );
}
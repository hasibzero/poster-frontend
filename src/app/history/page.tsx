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
    limit: 10,
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
      setPosters(res.data.items);
      setPagination(prev => ({
        ...prev,
        page: res.data.page,
        total: res.data.total,
        totalPages: res.data.totalPages,
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
      router.refresh();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-bangla mb-4">লগইন আবশ্যক</h1>
          <Link href="/login" className="btn-primary">লগইন করুন</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn-ghost p-2">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-bangla">পোস্টার ইতিহাস</h1>
                <p className="text-sm text-gray-500">আপনার তৈরি করা সব পোস্টার</p>
              </div>
            </div>
            
            <Link href="/create" className="btn-primary">
              <ImageIcon className="w-4 h-4 mr-2" />
              নতুন পোস্টার
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between" role="alert">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {posters.length === 0 ? (
          {/* Empty State */}
          <div className="card p-16 text-center">
            <ImageIcon className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 font-bangla mb-2">এখনো কোনো পোস্টার নেই</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              আপনি এখনো কোনো পোস্টার তৈরি করেননি। আপনার প্রথম পোস্টার তৈরি করে শুরু করুন।
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              প্রথম পোস্টার তৈরি করুন
            </Link>
          </div>
        ) : (
          <>
            {/* Posters Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {posters.map(poster => (
                <div key={poster._id} className="card overflow-hidden group">
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {poster.generatedImageUrl && poster.status === 'completed' ? (
                      <img
                        src={poster.generatedImageUrl}
                        alt={poster.formData.headlineText}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
                        <span className="text-sm font-bangla">
                          {poster.status === 'generating' ? 'তैयার হচ্ছে...' : poster.status === 'failed' ? 'ব্যর্থ' : 'প্রস্তাব'}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={cn('badge font-bangla', getStatusColor(poster.status))}>
                        {getStatusLabel(poster.status)}
                      </span>
                    </div>

                    {/* Retry Badge */}
                    {poster.retryCount > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-warning font-bangla">
                          রিট্রাই: {poster.retryCount}/3
                        </span>
                      </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                      {poster.status === 'completed' && poster.generatedImageUrl && (
                        <>
                          <button
                            onClick={() => handleDownload(poster._id, 'png')}
                            disabled={downloading?.id === poster._id}
                            className="btn-primary p-2 rounded-full"
                            title="PNG ডাউনলোড"
                          >
                            {downloading?.id === poster._id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownload(poster._id, 'pdf')}
                            disabled={downloading?.id === poster._id}
                            className="btn-secondary p-2 rounded-full"
                            title="PDF ডাউনলোড"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePreview(poster._id)}
                        className="btn-white p-2 rounded-full"
                        title="প্রিভিউ দেখুন"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 font-bangla line-clamp-1 mb-1">
                      {poster.formData.headlineText}
                    </h3>
                    <p className="text-sm text-gray-500 font-bangla mb-2">
                      {poster.formData.name} • {poster.formData.designation}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-bangla">{formatDateTime(poster.createdAt)}</span>
                      <span>{poster.uploadedPhotoUrls.length} ছবি</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center gap-2">
                      {poster.status === 'completed' && poster.generatedImageUrl && (
                        <>
                          <button
                            onClick={() => handleDownload(poster._id, 'png')}
                            disabled={downloading?.id === poster._id || deletingId === poster._id}
                            className="btn-outline text-xs flex-1"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PNG
                          </button>
                          <button
                            onClick={() => handleDownload(poster._id, 'pdf')}
                            disabled={downloading?.id === poster._id || deletingId === poster._id}
                            className="btn-outline text-xs flex-1"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            PDF
                          </button>
                        </>
                      )}
                      {poster.status === 'generating' || (poster.status === 'failed' && poster.retryCount < 3) ? (
                        <button
                          onClick={() => handleRegenerate(poster._id)}
                          disabled={deletingId === poster._id}
                          className="btn-secondary text-xs flex-1"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          রিজেনারেট
                        </button>
                      ) : poster.status === 'failed' && poster.retryCount >= 3 ? (
                        <span className="badge badge-danger text-xs flex-1 text-center">রিট্রাই শেষ</span>
                      ) : (
                        <span className="badge badge-gray text-xs flex-1 text-center">প্রক্রিয়া চলছে</span>
                      )}
                      <button
                        onClick={() => handleDelete(poster._id)}
                        disabled={deletingId === poster._id}
                        className="btn-danger text-xs p-2 rounded-lg"
                        title="মুছে ফেলুন"
                      >
                        {deletingId === poster._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
                  className="btn-outline p-2 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
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
                          'w-10 h-10 rounded-lg font-medium font-bangla transition-colors',
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
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
                  className="btn-outline p-2 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              মোট {pagination.total} টি পোস্টার
            </div>
          </>
        )}
      </main>
    </div>
  );
}
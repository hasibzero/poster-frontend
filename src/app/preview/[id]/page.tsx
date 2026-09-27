'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  RefreshCw, 
  Download, 
  X, 
  CheckCircle, 
  AlertCircle,
  Edit,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { api, Poster, getStatusLabel, getStatusColor } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime, cn } from '@/lib/utils';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [poster, setPoster] = useState<Poster | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<'png' | 'pdf' | null>(null);

  const posterId = params.id as string;

  const fetchPoster = async () => {
    try {
      const res = await api.posters.get(posterId);
      if (!res.data) throw new Error('Poster not found');
      setPoster(res.data);
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্টার লোড ব্যর্থ হয়েছে');
      return null;
    }
  };

  const pollPoster = async () => {
    setIsPolling(true);
    try {
      const res = await api.posters.get(posterId);
      if (!res.data) throw new Error('Poster not found');
      const updatedPoster = res.data;
      setPoster(updatedPoster);
      
      if (updatedPoster.status === 'generating') {
        setTimeout(pollPoster, 3000);
      } else {
        setIsPolling(false);
      }
    } catch (err) {
      setIsPolling(false);
      setError(err instanceof Error ? err.message : 'পোলিং ব্যর্থ হয়েছে');
    }
  };

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
      return;
    }
    
    if (token) {
      fetchPoster().then(data => {
        if (data && data.status === 'generating') {
          pollPoster();
        }
      });
    }
  }, [posterId, token, authLoading]);

  const handleRegenerate = async () => {
    if (!poster || poster.retryCount >= 3) return;
    setError('');
    try {
      const res = await api.posters.regenerate(posterId);
      if (!res.data) throw new Error('Failed to regenerate');
      setPoster({ ...poster, status: 'generating', retryCount: res.data.retryCount });
      pollPoster();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রিজেনারেট ব্যর্থ হয়েছে');
    }
  };

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!poster) return;
    setDownloading(format);
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

  const handleEdit = () => {
    if (!poster) return;
    router.push(`/create?edit=${posterId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4">
        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-12 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 font-bangla mb-6">লগইন আবশ্যক</h1>
          <Link href="/login" className="block w-full py-4 text-lg bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-xl transition-colors font-medium font-bangla">লগইন করুন</Link>
        </div>
      </div>
    );
  }

  if (!poster) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans pb-16">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 font-bangla">পোস্টার প্রিভিউ</h1>
                <p className="text-sm text-gray-500 font-bangla">
                  {poster.templateId && typeof poster.templateId === 'object' 
                    ? (poster.templateId as any).title 
                    : 'পোস্টার'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md border shadow-sm font-bangla',
                poster.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                poster.status === 'generating' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-red-50 text-red-700 border-red-200'
              )}>
                {getStatusLabel(poster.status)}
              </span>
              {poster.retryCount > 0 && (
                <span className="px-3 py-1 text-xs font-semibold rounded-md border shadow-sm font-bangla bg-yellow-50 text-yellow-700 border-yellow-200">
                  রিট্রাই: {poster.retryCount}/3
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm flex items-center justify-between font-bangla shadow-sm">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Poster Preview */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden w-full max-w-[600px] p-2">
            {poster.generatedImageUrl && poster.status === 'completed' ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-50">
                <img
                  src={poster.generatedImageUrl}
                  alt="Generated Poster"
                  className="w-full h-auto max-h-[800px] object-contain mx-auto"
                />
                {poster.status === 'generating' && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200/60 max-w-sm w-full mx-4">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C8102E] mx-auto mb-4" />
                      <p className="text-base font-semibold text-gray-900 font-bangla">পোস্টার তৈরি হচ্ছে...</p>
                      <p className="text-sm text-gray-500 mt-2 font-bangla">এই প্রক্রিয়া ১৫-৩০ সেকেন্ড নিতে পারে</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[3/4] bg-[#FAFAF8] rounded-xl flex flex-col items-center justify-center p-8 border border-gray-100">
                {poster.status === 'generating' ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8102E] mb-4" />
                    <p className="text-base font-semibold text-gray-900 font-bangla">পোস্টার তৈরি হচ্ছে...</p>
                    <p className="text-sm text-gray-500 mt-2 font-bangla">এই প্রক্রিয়া ১৫-৩০ সেকেন্ড নিতে পারে</p>
                  </>
                ) : poster.status === 'failed' ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 font-bangla mb-4">পোস্টার তৈরিতে সমস্যা হয়েছে</p>
                    <button
                      onClick={handleRegenerate}
                      disabled={poster.retryCount >= 3}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-xl text-sm font-medium transition-colors font-bangla disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      আবার চেষ্টা করুন ({poster.retryCount}/3)
                    </button>
                  </div>
                ) : (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
                    <p className="text-base font-semibold text-gray-900 font-bangla">অপেক্ষা করুন...</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => handleDownload('png')}
            disabled={poster.status !== 'completed' || downloading === 'png'}
            className="flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-5 py-3.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:hover:bg-[#C8102E] shadow-sm font-bangla"
          >
            {downloading === 'png' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PNG ডাউনলোড
          </button>
          
          <button
            onClick={() => handleDownload('pdf')}
            disabled={poster.status !== 'completed' || downloading === 'pdf'}
            className="flex items-center justify-center gap-2 bg-[#006A4E] hover:bg-[#00543e] text-white px-5 py-3.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:hover:bg-[#006A4E] shadow-sm font-bangla"
          >
            {downloading === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            PDF ডাউনলোড
          </button>
          
          <button
            onClick={handleRegenerate}
            disabled={poster.status === 'generating' || poster.retryCount >= 3}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-sm font-bangla"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            রিজেনারেট
          </button>
          
          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3.5 rounded-xl text-sm font-medium transition-colors shadow-sm font-bangla"
          >
            <Edit className="w-4 h-4 text-gray-500" />
            এডিট করুন
          </button>
        </div>

        {/* Poster Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Data */}
          <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 lg:p-8">
            <h3 className="text-base font-semibold text-gray-900 font-bangla mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              পোস্টার তথ্য
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">নাম</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla">{poster.formData.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">পদবি</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla">{poster.formData.designation}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">দল/সংগঠন</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla">{poster.formData.party}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">উপলক্ষ</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla">
                  {poster.formData.occasionType}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">হেডলাইন</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla leading-relaxed">{poster.formData.headlineText}</dd>
              </div>
              {poster.formData.subHeadline && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">উপ-হেডলাইন</dt>
                  <dd className="text-sm font-medium text-gray-900 font-bangla">{poster.formData.subHeadline}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-bangla">অবস্থান</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla">
                  {poster.formData.union}, {poster.formData.upazila}, {poster.formData.district}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata */}
          <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 lg:p-8">
            <h3 className="text-base font-semibold text-gray-900 font-bangla mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Eye className="w-5 h-5 text-gray-500" />
              মেটাডেটা
            </h3>
            <dl className="grid grid-cols-1 gap-y-5">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-sm font-medium text-gray-500 font-bangla">স্ট্যাটাস</dt>
                <dd>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm font-bangla',
                    poster.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    poster.status === 'generating' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  )}>
                    {getStatusLabel(poster.status)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-sm font-medium text-gray-500 font-bangla">তৈরি হয়েছে</dt>
                <dd className="text-sm font-medium text-gray-900 font-sans">{formatDateTime(poster.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-sm font-medium text-gray-500 font-bangla">সর্বশেষ আপডেট</dt>
                <dd className="text-sm font-medium text-gray-900 font-sans">{formatDateTime(poster.updatedAt)}</dd>
              </div>
              {poster.errorMessage && (
                <div className="flex flex-col gap-1 py-1 border-b border-gray-50">
                  <dt className="text-sm font-medium text-gray-500 font-bangla">ত্রুটি</dt>
                  <dd className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg mt-1 font-sans">{poster.errorMessage}</dd>
                </div>
              )}
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-sm font-medium text-gray-500 font-bangla">আপলোড করা ছবি</dt>
                <dd className="text-sm font-medium text-gray-900 font-bangla bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{poster.uploadedPhotoUrls.length} টি</dd>
              </div>
              {poster.generatedImageUrl && (
                <div className="flex items-center justify-between py-1">
                  <dt className="text-sm font-medium text-gray-500 font-bangla">জেনারেটেড ছবি</dt>
                  <dd className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 font-bangla">
                    <CheckCircle className="w-4 h-4" />
                    প্রস্তুত
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
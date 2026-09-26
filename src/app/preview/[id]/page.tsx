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

  if (!poster) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-bangla">পোস্টার প্রিভিউ</h1>
                <p className="text-sm text-gray-500">
                  {poster.templateId && typeof poster.templateId === 'object' 
                    ? (poster.templateId as any).title 
                    : 'পোস্টার'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={cn(
                'badge font-bangla',
                getStatusColor(poster.status)
              )}>
                {getStatusLabel(poster.status)}
              </span>
              {poster.retryCount > 0 && (
                <span className="badge badge-warning font-bangla">
                  রিট্রাই: {poster.retryCount}/3
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between" role="alert">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Poster Preview */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {poster.generatedImageUrl && poster.status === 'completed' ? (
              <div className="relative">
                <img
                  src={poster.generatedImageUrl}
                  alt="Generated Poster"
                  className="w-full max-h-[700px] object-contain bg-gray-100"
                />
                {poster.status === 'generating' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-8 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 font-bangla">পোস্টার তৈরি হচ্ছে...</p>
                      <p className="text-sm text-gray-500 mt-2">এই প্রক্রিয়া ১৫-৩০ সেকেন্ড নিতে পারে</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-100 flex flex-col items-center justify-center p-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
                <p className="text-lg font-medium text-gray-900 font-bangla">
                  {poster.status === 'generating' ? 'পোস্টার তৈরি হচ্ছে...' : 'পোস্টার তৈরি হচ্ছে...'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {poster.status === 'generating' 
                    ? 'এই প্রক্রিয়া ১৫-৩০ সেকেন্ড নিতে পারে' 
                    : 'অনুগ্রহ করে অপেক্ষা করুন'
                  }
                </p>
                {poster.status === 'failed' && (
                  <div className="mt-4 text-center">
                    <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-bangla">পোস্টার তৈরিতে সমস্যা হয়েছে</p>
                    <button
                      onClick={handleRegenerate}
                      disabled={poster.retryCount >= 3}
                      className="mt-2 btn-primary"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      আবার চেষ্টা করুন ({poster.retryCount}/3)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={poster.status !== 'completed' || downloading === 'png'}
            className="btn-primary flex items-center justify-center gap-2"
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
            className="btn-secondary flex items-center justify-center gap-2"
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
            className="btn-outline flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            রিজেনারেট
          </button>
          
          <button
            onClick={handleEdit}
            className="btn-ghost flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            এডিট করুন
          </button>
        </div>

        {/* Poster Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Data */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              পোস্টার তথ্য
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">নাম</dt>
                <dd className="font-medium text-gray-900 font-bangla">{poster.formData.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">পদবি</dt>
                <dd className="font-medium text-gray-900 font-bangla">{poster.formData.designation}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">দল/সংগঠন</dt>
                <dd className="font-medium text-gray-900 font-bangla">{poster.formData.party}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">অবসর</dt>
                <dd className="font-medium text-gray-900 font-bangla">
                  {poster.formData.occasionType}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">হেডলাইন</dt>
                <dd className="font-medium text-gray-900 font-bangla">{poster.formData.headlineText}</dd>
              </div>
              {poster.formData.subHeadline && (
                <div>
                  <dt className="text-sm text-gray-500">উপ-হেডলাইন</dt>
                  <dd className="font-medium text-gray-900 font-bangla">{poster.formData.subHeadline}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">অবস্থান</dt>
                <dd className="font-medium text-gray-900 font-bangla">
                  {poster.formData.union}, {poster.formData.upazila}, {poster.formData.district}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-secondary-600" />
              মেটাডেটা
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">স্ট্যাটাস</dt>
                <dd className="flex items-center gap-2">
                  <span className={cn('badge font-bangla', getStatusColor(poster.status))}>
                    {getStatusLabel(poster.status)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">তৈরি হয়েছে</dt>
                <dd className="font-medium text-gray-900">{formatDateTime(poster.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">সর্বশেষ আপডেট</dt>
                <dd className="font-medium text-gray-900">{formatDateTime(poster.updatedAt)}</dd>
              </div>
              {poster.errorMessage && (
                <div>
                  <dt className="text-sm text-gray-500">ত্রুটি</dt>
                  <dd className="font-medium text-red-600">{poster.errorMessage}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">আপলোড করা ছবি</dt>
                <dd className="font-medium text-gray-900">{poster.uploadedPhotoUrls.length} টি</dd>
              </div>
              {poster.generatedImageUrl && (
                <div>
                  <dt className="text-sm text-gray-500">জেনারেটেড ছবি</dt>
                  <dd className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">প্রস্তুত</span>
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
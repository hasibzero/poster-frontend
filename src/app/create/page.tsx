'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Image, 
  X, 
  Loader2, 
  Eye,
  Check,
  Upload,
  Star,
  Shield,
  Users,
  Sparkles,
} from 'lucide-react';
import { api, OCCASION_LABELS, OCCASION_COLORS, OccasionType, Template } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  templateId: z.string().min(1, 'টেমপ্লেট বেছে নিন'),
  formData: z.object({
    name: z.string().min(1, 'নাম দিন'),
    designation: z.string().min(1, 'পদবি দিন'),
    party: z.string().min(1, 'দল/সংগঠন দিন'),
    district: z.string().min(1, 'জেলা দিন'),
    upazila: z.string().min(1, 'উপজেলা দিন'),
    union: z.string().min(1, 'ইউনিয়ন/থানা দিন'),
    occasionType: z.string().min(1),
    headlineText: z.string().min(1, 'হেডলাইন দিন').max(200),
    subHeadline: z.string().max(300).optional(),
  }),
  uploadedPhotoUrls: z.array(z.string().url()).max(3),
});

type FormData = z.infer<typeof formSchema>;

const occasions: { key: OccasionType; icon: any; desc: string }[] = [
  { key: 'victory', icon: Star, desc: 'বিজয় দিবস' },
  { key: 'condolence', icon: Shield, desc: 'শোক ও স্মরণ' },
  { key: 'campaign', icon: Users, desc: 'নির্বাচনী প্রচার' },
  { key: 'greeting', icon: Sparkles, desc: 'শুভেচ্ছা' },
  { key: 'eid', icon: Image, desc: 'ঈদ/উৎসব' },
];

export default function CreatePosterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('victory');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'template' | 'form'>('template');

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: '',
      formData: {
        name: '',
        designation: '',
        party: '',
        district: '',
        upazila: '',
        union: '',
        occasionType: '',
        headlineText: '',
        subHeadline: '',
      },
      uploadedPhotoUrls: [],
    },
  });

  const { fields: photoFields, append: addPhoto, remove: removePhoto } = useFieldArray({
    control,
    name: 'uploadedPhotoUrls',
  });

  useEffect(() => {
    const occasion = searchParams.get('occasion') as OccasionType;
    if (occasion && occasions.find(o => o.key === occasion)) {
      setSelectedOccasion(occasion);
    }
    fetchTemplates(occasion || undefined);
  }, [searchParams]);

  const fetchTemplates = async (occasionType?: OccasionType) => {
    try {
      const res = await api.templates.list(occasionType);
      setTemplates(res.data || []);
    } catch (err) {
      setError('টেমপ্লেট লোড ব্যর্থ হয়েছে');
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setValue('templateId', template._id);
    setValue('formData.occasionType', template.occasionType);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoUpload = async (files: FileList) => {
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('photos', f));
      
      const res = await fetch('/api/backend/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      if (data.success && data.data.urls) {
        data.data.urls.forEach((url: string) => {
          if (photoFields.length < 3) {
            addPhoto(url);
          }
        });
      }
    } catch (err) {
      setError('ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await api.posters.create({
        templateId: data.templateId,
        formData: data.formData,
        uploadedPhotoUrls: data.uploadedPhotoUrls,
      });
      router.push(`/preview/${res.data.posterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্টার তৈরি ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.occasionType === selectedOccasion);

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
          <p className="text-gray-600 mb-6">পোস্টার তৈরি করতে লগইন করুন</p>
          <Link href="/login" className="btn-primary">লগইন করুন</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 font-bangla">পোস্টার তৈরি করুন</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-2', step === 'template' ? 'text-primary-600' : 'text-gray-400')}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">১</div>
            <span className="ml-2 text-sm font-medium hidden sm:block">টেমপ্লেট বেছে নিন</span>
          </div>
          <div className="hidden md:block w-24 h-0.5 bg-gray-200" />
          <div className={cn('flex items-center gap-2', step === 'form' ? 'text-primary-600' : 'text-gray-400')}>
            <span className="text-sm font-medium hidden sm:block">তথ্য ও ছবি দিন</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">২</div>
          </div>
          <div className="hidden md:block w-24 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm font-medium hidden sm:block">জেনারেট করুন</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold">৩</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Step 1: Template Selection */}
        {step === 'template' && (
          <div className="space-y-6">
            {/* Occasion Tabs */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-4">অবসর বেছে নিন</h3>
              <div className="flex flex-wrap gap-2">
                {occasions.map(({ key, icon: Icon, desc }) => {
                  const colors = OCCASION_COLORS[key];
                  const isActive = selectedOccasion === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedOccasion(key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? `text-white shadow-md`
                          : 'text-gray-600 hover:text-gray-900 bg-gray-50',
                        `border-2`,
                        isActive ? `border-transparent` : 'border-gray-200'
                      )}
                      style={isActive ? { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-bangla">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Templates Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-bangla">
                  {OCCASION_LABELS[selectedOccasion]} টেমপ্লেটস
                </h3>
                <span className="text-sm text-gray-500">{filteredTemplates.length} টি টেমপ্লেট</span>
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="card p-12 text-center">
                  <Image className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 font-bangla mb-1">এই ক্যাটাগরিতে টেমপ্লেট নেই</h4>
                  <p className="text-gray-500">অন্য একটি ক্যাটাগরি বেছে নিন</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredTemplates.map(template => (
                    <button
                      key={template._id}
                      onClick={() => handleTemplateSelect(template)}
                      className="card relative overflow-hidden p-0 h-full group"
                    >
                      <div className="relative aspect-[3/4] bg-gray-100">
                        <img
                          src={template.thumbnailUrl}
                          alt={template.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 font-bangla">{template.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {template.layoutConfig.photoSlots.length} ফটো স্লট • {template.layoutConfig.dimensions.width}×{template.layoutConfig.dimensions.height}
                        </p>
                      </div>
                      <ArrowRight className="absolute bottom-4 right-4 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Template Info */}
            <div className="card p-4 bg-primary-50 border-primary-200">
              const selectedTemplate = templates.find(t => t._id === watch('templateId'));
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 font-bangla">{selectedTemplate?.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedTemplate?.layoutConfig.photoSlots.length} ফটো স্লট • {selectedTemplate?.layoutConfig.dimensions.width}×{selectedTemplate?.layoutConfig.dimensions.height}px
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('template')}
                  className="ml-auto btn-ghost p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">১</span>
                ব্যক্তিগত তথ্য
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="label">নাম *</label>
                  <input
                    id="name"
                    {...register('formData.name')}
                    className={cn('input mt-1', errors.formData?.name && 'border-red-500')}
                    placeholder="আপনার নাম"
                  />
                  {errors.formData?.name && <p className="mt-1 text-sm text-red-600">{errors.formData.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="designation" className="label">পদবি *</label>
                  <input
                    id="designation"
                    {...register('formData.designation')}
                    className={cn('input mt-1', errors.formData?.designation && 'border-red-500')}
                    placeholder="যেমন: সভাপতি, সাধারণ সম্পাদক"
                  />
                  {errors.formData?.designation && <p className="mt-1 text-sm text-red-600">{errors.formData.designation.message}</p>}
                </div>
                <div>
                  <label htmlFor="party" className="label">দল/সংগঠন *</label>
                  <input
                    id="party"
                    {...register('formData.party')}
                    className={cn('input mt-1', errors.formData?.party && 'border-red-500')}
                    placeholder="দলের নাম"
                  />
                  {errors.formData?.party && <p className="mt-1 text-sm text-red-600">{errors.formData.party.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="headlineText" className="label">হেডলাইন (বাংলা) *</label>
                  <textarea
                    id="headlineText"
                    {...register('formData.headlineText')}
                    rows={2}
                    className={cn('input mt-1 font-bangla', errors.formData?.headlineText && 'border-red-500')}
                    placeholder="যেমন: মহান বিজয় দিবস, টেক ব্যাক বাংলাদেশ"
                  />
                  {errors.formData?.headlineText && <p className="mt-1 text-sm text-red-600">{errors.formData.headlineText.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="subHeadline" className="label">উপ-হেডলাইন (ঐচ্ছিক)</label>
                  <input
                    id="subHeadline"
                    {...register('formData.subHeadline')}
                    className="input mt-1 font-bangla"
                    placeholder="যেমন: বাংলাদেশ জিন্দাবাদ"
                  />
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center text-xs font-bold">২</span>
                অবস্থান
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="district" className="label">জেলা *</label>
                  <input
                    id="district"
                    {...register('formData.district')}
                    className={cn('input mt-1', errors.formData?.district && 'border-red-500')}
                    placeholder="ঢাকা"
                  />
                  {errors.formData?.district && <p className="mt-1 text-sm text-red-600">{errors.formData.district.message}</p>}
                </div>
                <div>
                  <label htmlFor="upazila" className="label">উপজেলা *</label>
                  <input
                    id="upazila"
                    {...register('formData.upazila')}
                    className={cn('input mt-1', errors.formData?.upazila && 'border-red-500')}
                    placeholder="ধানমণ্ডি"
                  />
                  {errors.formData?.upazila && <p className="mt-1 text-sm text-red-600">{errors.formData.upazila.message}</p>}
                </div>
                <div>
                  <label htmlFor="union" className="label">ইউনিয়ন/থানা *</label>
                  <input
                    id="union"
                    {...register('formData.union')}
                    className={cn('input mt-1', errors.formData?.union && 'border-red-500')}
                    placeholder="নিউ মার্কেট"
                  />
                  {errors.formData?.union && <p className="mt-1 text-sm text-red-600">{errors.formData.union.message}</p>}
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">৩</span>
                ছবি আপলোড করুন (অধিকতম ৩টি)
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                {photoFields.map((field, index) => (
                  <div key={field.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                    {field.value ? (
                      <>
                        <img src={field.value} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          স্লট {index + 1}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm">ছবি {index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
                {photoFields.length < 3 && (
                  <label className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={e => e.target.files && handlePhotoUpload(e.target.files)}
                      disabled={uploading}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">ছবি যোগ করুন</span>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">JPG, PNG, WebP ফরম্যাট সমর্থিত। প্রতি ছবি সর্বোচ্চ ১০MB।</p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('template')}
                className="btn-outline flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ফিরে যান
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 py-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    পোস্টার তৈরি হচ্ছে...
                  </span>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    পোস্টার জেনারেট করুন
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Image as ImageIcon, 
  X, 
  Loader2, 
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
import toast from 'react-hot-toast';

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
  { key: 'eid', icon: ImageIcon, desc: 'ঈদ/উৎসব' },
];

export default function CreatePosterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('victory');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'template' | 'form'>('template');

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors },
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

  const uploadedPhotoUrls = watch('uploadedPhotoUrls') || [];
  const watchTemplateId = watch('templateId');
  const selectedTemplate = templates.find(t => t._id === watchTemplateId);
  
  const removePhoto = (index: number) => {
    setValue('uploadedPhotoUrls', uploadedPhotoUrls.filter((_, i) => i !== index));
  };

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
      toast.error('টেমপ্লেট লোড ব্যর্থ হয়েছে');
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setValue('templateId', template._id);
    setValue('formData.occasionType', template.occasionType);
    setStep('form');
  };

  const handlePhotoUpload = async (files: FileList) => {
    if (!token) return;
    setUploading(true);
    const loadingToast = toast.loading('ছবি আপলোড হচ্ছে...');
    try {
      const filesArray = Array.from(files);
      const data = await api.upload.photos(filesArray);
      
      if (data.success && data.data.urls) {
        let currentUrls = [...uploadedPhotoUrls];
        data.data.urls.forEach((url: string) => {
          if (currentUrls.length < 3) {
            currentUrls.push(url);
          }
        });
        setValue('uploadedPhotoUrls', currentUrls);
        toast.success('ছবি আপলোড সফল হয়েছে', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('ছবি আপলোড ব্যর্থ হয়েছে', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setIsLoading(true);
    const loadingToast = toast.loading('অপেক্ষা করুন, পোস্টার জেনারেট হচ্ছে...');
    try {
      const res = await api.posters.create({
        templateId: data.templateId,
        formData: data.formData,
        uploadedPhotoUrls: data.uploadedPhotoUrls,
      });
      toast.success('সফলভাবে পোস্টার তৈরি হয়েছে!', { id: loadingToast });
      router.push(`/preview/${res.data.posterId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'পোস্টার তৈরি ব্যর্থ হয়েছে', { id: loadingToast });
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.occasionType === selectedOccasion);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="w-12 h-12 text-[#C8102E] animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4">
        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-bangla mb-3">লগইন আবশ্যক</h1>
          <p className="text-gray-500 mb-8 font-medium">পোস্টার তৈরি করতে আপনাকে অবশ্যই সিস্টেমে লগইন করতে হবে।</p>
          <Link href="/login" className="block w-full py-4 text-lg bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-xl transition-colors font-medium font-bangla">লগইন করুন</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 font-bangla">নতুন পোস্টার তৈরি</h1>
            </div>
            
            {/* Steps indicator */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setStep('template')}
                className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all', step === 'template' ? 'bg-[#C8102E] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100')}
              >
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold', step === 'template' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600')}>১</span>
                <span className="font-bangla">টেমপ্লেট নির্বাচন</span>
              </button>
              <ArrowRight className="w-4 h-4 text-gray-300 mx-1" />
              <button 
                className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all', step === 'form' ? 'bg-[#C8102E] text-white shadow-sm' : 'text-gray-400')}
                disabled={step === 'template'}
              >
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold', step === 'form' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400')}>২</span>
                <span className="font-bangla">তথ্য ও ছবি</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-screen-2xl mx-auto w-full p-4 lg:p-8 gap-8">
        
        {/* Left Column: Form or Template Selector */}
        <div className="flex-1 max-w-4xl">
          {step === 'template' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-8">
                <h3 className="text-lg font-semibold text-gray-900 font-bangla mb-6">আপনার ইভেন্টের ধরন নির্বাচন করুন</h3>
                <div className="flex flex-wrap gap-4">
                  {occasions.map(({ key, icon: Icon, desc }) => {
                    const isActive = selectedOccasion === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedOccasion(key)}
                        className={cn(
                          'flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 border',
                          isActive
                            ? 'bg-[#FAFAF8] border-[#C8102E] text-[#C8102E] shadow-sm'
                            : 'bg-white border-gray-200/60 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-bangla">{desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6 px-1">
                  <h3 className="text-xl font-semibold text-gray-900 font-bangla">
                    {OCCASION_LABELS[selectedOccasion]} টেমপ্লেটস
                  </h3>
                  <span className="text-sm font-medium text-gray-500 font-bangla bg-white px-3 py-1 rounded-full border border-gray-200/60 shadow-sm">{filteredTemplates.length} টি টেমপ্লেট</span>
                </div>

                {filteredTemplates.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200/80 rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 font-bangla mb-2">কোনো টেমপ্লেট পাওয়া যায়নি</h4>
                    <p className="text-gray-500 font-bangla">অনুগ্রহ করে অন্য একটি ক্যাটাগরি বেছে নিন।</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                      <button
                        key={template._id}
                        onClick={() => handleTemplateSelect(template)}
                        className="bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group text-left flex flex-col p-2"
                      >
                        <div className="relative aspect-[3/4] bg-gray-100/50 w-full rounded-xl overflow-hidden">
                          <img
                            src={template.thumbnailUrl}
                            alt={template.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                            <span className="bg-white text-gray-900 font-medium py-2.5 px-5 rounded-full shadow-lg flex items-center gap-2 font-bangla text-sm">
                              নির্বাচন করুন
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-base font-semibold text-gray-900 font-bangla line-clamp-1">{template.title}</h4>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-500 font-bangla">
                            <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5"/> {template.layoutConfig.photoSlots.length} ছবি</span>
                            <span>•</span>
                            <span>{template.layoutConfig.dimensions.width}×{template.layoutConfig.dimensions.height} px</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
              
              {/* Section 1: Personal Info */}
              <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-8 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] border border-gray-200 text-gray-900 flex items-center justify-center font-semibold text-sm">১</div>
                  <h3 className="text-lg font-semibold text-gray-900 font-bangla">ব্যক্তিগত তথ্য</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 font-bangla">নাম *</label>
                    <input id="name" {...register('formData.name')} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400', errors.formData?.name && 'border-red-500 focus:ring-red-500/20')} placeholder="আপনার নাম" />
                    {errors.formData?.name && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.name.message}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="designation" className="text-sm font-medium text-gray-700 font-bangla">পদবি *</label>
                    <input id="designation" {...register('formData.designation')} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400', errors.formData?.designation && 'border-red-500 focus:ring-red-500/20')} placeholder="যেমন: সভাপতি, সাধারণ সম্পাদক" />
                    {errors.formData?.designation && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.designation.message}</p>}
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label htmlFor="party" className="text-sm font-medium text-gray-700 font-bangla">দল/সংগঠন *</label>
                    <input id="party" {...register('formData.party')} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400', errors.formData?.party && 'border-red-500 focus:ring-red-500/20')} placeholder="দলের নাম" />
                    {errors.formData?.party && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.party.message}</p>}
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label htmlFor="headlineText" className="text-sm font-medium text-gray-700 font-bangla">হেডলাইন (বাংলা) *</label>
                    <textarea id="headlineText" {...register('formData.headlineText')} rows={3} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400 resize-none', errors.formData?.headlineText && 'border-red-500 focus:ring-red-500/20')} placeholder="যেমন: মহান বিজয় দিবস উপলক্ষে দেশবাসীকে শুভেচ্ছা..." />
                    {errors.formData?.headlineText && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.headlineText.message}</p>}
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <label htmlFor="subHeadline" className="text-sm font-medium text-gray-700 font-bangla">উপ-হেডলাইন (ঐচ্ছিক)</label>
                    <input id="subHeadline" {...register('formData.subHeadline')} className="w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400" placeholder="যেমন: বাংলাদেশ জিন্দাবাদ" />
                  </div>
                </div>
              </div>

              {/* Section 2: Location */}
              <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-8 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] border border-gray-200 text-gray-900 flex items-center justify-center font-semibold text-sm">২</div>
                  <h3 className="text-lg font-semibold text-gray-900 font-bangla">অবস্থান</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="district" className="text-sm font-medium text-gray-700 font-bangla">জেলা *</label>
                    <input id="district" {...register('formData.district')} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400', errors.formData?.district && 'border-red-500 focus:ring-red-500/20')} placeholder="ঢাকা" />
                    {errors.formData?.district && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.district.message}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="upazila" className="text-sm font-medium text-gray-700 font-bangla">উপজেলা *</label>
                    <input id="upazila" {...register('formData.upazila')} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400', errors.formData?.upazila && 'border-red-500 focus:ring-red-500/20')} placeholder="ধানমণ্ডি" />
                    {errors.formData?.upazila && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.upazila.message}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="union" className="text-sm font-medium text-gray-700 font-bangla">ইউনিয়ন/থানা *</label>
                    <input id="union" {...register('formData.union')} className={cn('w-full border border-gray-200/60 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all font-bangla text-gray-900 placeholder:text-gray-400', errors.formData?.union && 'border-red-500 focus:ring-red-500/20')} placeholder="নিউ মার্কেট" />
                    {errors.formData?.union && <p className="text-xs font-medium text-red-500 font-bangla mt-1">{errors.formData.union.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3: Photos */}
              <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-8 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] border border-gray-200 text-gray-900 flex items-center justify-center font-semibold text-sm">৩</div>
                  <h3 className="text-lg font-semibold text-gray-900 font-bangla">ছবি আপলোড (সর্বোচ্চ ৩টি)</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadedPhotoUrls.map((url, index) => (
                    <div key={index} className="relative aspect-[3/4] bg-gray-50 rounded-xl border border-gray-200/60 overflow-hidden group">
                      <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removePhoto(index)} className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm font-bangla">
                        ছবি {index + 1}
                      </div>
                    </div>
                  ))}
                  {uploadedPhotoUrls.length < (selectedTemplate?.layoutConfig.photoSlots.length || 1) && (
                    <label className="relative aspect-[3/4] bg-[#FAFAF8] rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#C8102E]/50 hover:bg-white transition-all group">
                      <input
                        type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => e.target.files && handlePhotoUpload(e.target.files)} disabled={uploading}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-[#C8102E] p-6 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 group-hover:border-[#C8102E]/20 transition-colors">
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-[#C8102E]" /> : <Upload className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-medium font-bangla text-gray-700">ছবি নির্বাচন করুন</span>
                        <span className="text-xs mt-2 text-gray-400 font-sans">JPG, PNG (max 10MB)</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Sticky Submit Bar */}
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200/60 p-4 lg:p-6 lg:left-auto lg:right-auto lg:w-full lg:max-w-4xl lg:relative lg:bg-transparent lg:border-none lg:p-0 lg:backdrop-blur-none">
                <div className="flex gap-4 max-w-screen-2xl mx-auto">
                  <button type="button" onClick={() => setStep('template')} className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white shadow-sm font-bangla">
                    <ArrowLeft className="w-4 h-4" />
                    ফিরে যান
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-xl px-6 py-3.5 font-medium transition-colors shadow-sm flex items-center justify-center gap-2 text-base font-bangla disabled:opacity-70">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        পোস্টার জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        চূড়ান্ত পোস্টার তৈরি করুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Template Preview Pane (Sticky) */}
        {step === 'form' && selectedTemplate && (
          <div className="hidden lg:block w-[380px] xl:w-[420px] flex-shrink-0 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="sticky top-28 bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900 font-bangla text-base">নির্বাচিত টেমপ্লেট</h3>
                <span className="text-xs font-medium bg-[#FAFAF8] text-[#C8102E] border border-[#C8102E]/20 px-2.5 py-1 rounded-md font-bangla">সক্রিয়</span>
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200/60 bg-gray-50 aspect-[3/4] relative p-1.5">
                <img src={selectedTemplate.thumbnailUrl} className="w-full h-full object-cover rounded-lg" alt="Selected Template" />
              </div>
              <div className="mt-5 text-center">
                <h4 className="font-semibold text-gray-900 font-bangla text-lg">{selectedTemplate.title}</h4>
                <p className="text-sm text-gray-500 mt-2 font-bangla leading-relaxed">
                  এই টেমপ্লেটের লেআউট এবং কালার প্যালেট অনুযায়ী আপনার তথ্যগুলো সুন্দরভাবে সাজানো হবে।
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
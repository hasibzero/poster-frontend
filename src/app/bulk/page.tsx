'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api, OCCASION_LABELS, OccasionType } from '@/lib/api';
import { Template } from 'shared/types';
import { Upload, FileSpreadsheet, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BulkUploadPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState<OccasionType>('campaign');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [csvContent, setCsvContent] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      api.templates.list(occasion).then(res => {
        if (res.data) setTemplates(res.data);
      });
    }
  }, [occasion, token]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        toast.error('CSV ফাইলে ডেটা নেই');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i];
        });
        return row;
      });
      
      setCsvContent(data);
      toast.success(`${data.length} জনের ডেটা লোড হয়েছে!`);
    };
    reader.readAsText(file);
  };

  const handleBulkGenerate = async () => {
    if (!selectedTemplate || csvContent.length === 0) return;
    
    // In a real app, Pro users only
    if (!user?.isPremium && csvContent.length > 5) {
      toast.error('ফ্রি অ্যাকাউন্টে একসাথে সর্বোচ্চ ৫টি পোস্টার তৈরি করা যায়। প্রো-তে আপগ্রেড করুন।');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.posters.bulkCreate({
        templateId: selectedTemplate._id,
        occasionType: occasion,
        csvData: csvContent,
      });
      toast.success(res.data?.message || 'সফলভাবে তৈরি হয়েছে');
      setTimeout(() => router.push('/history'), 2000);
    } catch (err) {
      toast.error('বাল্ক জেনারেশন ব্যর্থ হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading || !user) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-bangla-red"/></div>;

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-bangla tracking-tight">বাল্ক জেনারেশন (CSV)</h1>
          <Link href="/create" className="text-sm font-medium text-bangla-red hover:underline font-bangla">সিঙ্গেল পোস্টার তৈরি করুন &rarr;</Link>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8">
            <h2 className="text-xl font-bold text-gray-900 font-bangla mb-6">টেমপ্লেট নির্বাচন করুন</h2>
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {Object.entries(OCCASION_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setOccasion(key as OccasionType)}
                  className={`px-4 py-2 rounded-full font-bangla text-sm font-medium whitespace-nowrap transition-colors ${
                    occasion === key ? 'bg-bangla-red text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {templates.map(template => (
                <button
                  key={template._id}
                  onClick={() => { setSelectedTemplate(template); setStep(2); }}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200/60 hover:border-bangla-red hover:shadow-md transition-all text-left"
                >
                  <img src={template.thumbnailUrl} alt={template.title} className="w-full aspect-[3/4] object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 font-bangla truncate">{template.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedTemplate && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8">
            <h2 className="text-xl font-bold text-gray-900 font-bangla mb-6">CSV ফাইল আপলোড করুন</h2>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800 font-bangla">
                <p className="font-semibold mb-1">CSV ফরম্যাট নির্দেশিকা:</p>
                <p>আপনার ফাইলে এই কলামগুলো থাকতে হবে: <code className="font-mono bg-blue-100 px-1 rounded">name, designation, party, district, upazila, union, headlineText, photoUrl</code></p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-bangla-red transition-colors relative bg-gray-50/50">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-medium font-bangla mb-1">আপনার CSV ফাইল এখানে ড্রপ করুন অথবা ক্লিক করুন</p>
              <p className="text-sm text-gray-500 font-bangla">সর্বোচ্চ ৫০টি রো (row) একসাথে প্রসেস করা যায়</p>
            </div>

            {csvContent.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 font-bangla mb-4 flex justify-between items-center">
                  <span>প্রিভিউ ({csvContent.length} টি পোস্টার)</span>
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Pro ফিচার</span>
                </h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 font-bangla text-gray-500 sticky top-0">
                      <tr>
                        <th className="px-4 py-3">নাম</th>
                        <th className="px-4 py-3">পদবি</th>
                        <th className="px-4 py-3">দল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {csvContent.slice(0, 5).map((row, i) => (
                        <tr key={i} className="font-bangla">
                          <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                          <td className="px-4 py-3 text-gray-600">{row.designation}</td>
                          <td className="px-4 py-3 text-gray-600">{row.party}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button onClick={() => setStep(1)} className="px-6 py-3 font-semibold font-bangla text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    টেমপ্লেট পরিবর্তন
                  </button>
                  <button onClick={handleBulkGenerate} disabled={generating} className="px-8 py-3 bg-bangla-red text-white font-bold font-bangla rounded-xl hover:bg-bangla-red/90 transition-all flex items-center gap-2 shadow-sm">
                    {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'জেনারেট শুরু করুন'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

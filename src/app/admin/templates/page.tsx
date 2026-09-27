'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Template } from 'shared/types';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await api.templates.list();
      if (res.data) setTemplates(res.data);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই টেমপ্লেটটি ডিলিট করতে চান?')) return;
    
    setDeletingId(id);
    try {
      // NOTE: Template delete isn't in api.ts client yet, we'd need to add it or fetch directly
      const token = document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1];
      const res = await fetch(`/api/backend/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      
      toast.success('টেমপ্লেট ডিলিট হয়েছে');
      setTemplates(templates.filter(t => t._id !== id));
    } catch (err) {
      toast.error('টেমপ্লেট ডিলিট ব্যর্থ হয়েছে');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-bangla">টেমপ্লেট ম্যানেজমেন্ট</h1>
          <p className="text-sm text-gray-500 mt-1">সিস্টেমের সকল পোস্টার টেমপ্লেট</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#C8102E] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#a00d24] transition-colors font-bangla opacity-50 cursor-not-allowed" title="Future Feature: Visual Template Editor">
          <Plus className="w-4 h-4" />
          নতুন টেমপ্লেট
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map(template => (
          <div key={template._id} className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm flex flex-col group">
            <div className="aspect-[3/4] relative bg-gray-50 border-b border-gray-100">
              <img src={template.thumbnailUrl} alt={template.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(template._id)}
                  disabled={deletingId === template._id}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                >
                  {deletingId === template._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 font-bangla leading-tight mb-1">{template.title}</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{template.occasionType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

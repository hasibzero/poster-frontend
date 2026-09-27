import { User, Template, Poster, PosterFormData, ApiResponse, PaginatedResponse, OCCASION_LABELS, OCCASION_COLORS, OccasionType } from 'shared/types';

const API_BASE = '/api/backend';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    me: () => request<User>('/auth/me'),
  },

  // Templates
  templates: {
    list: (occasionType?: OccasionType) => 
      request<Template[]>(`/templates${occasionType ? `?occasionType=${occasionType}` : ''}`),
    get: (id: string) => request<Template>(`/templates/${id}`),
  },

  // Posters
  posters: {
    create: (data: { templateId: string; formData: PosterFormData; uploadedPhotoUrls: string[] }) =>
      request<{ posterId: string; status: string }>('/posters', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => request<Poster>(`/posters/${id}`),
    list: (page = 1, limit = 10) =>
      request<PaginatedResponse<Poster>>(`/posters/user?page=${page}&limit=${limit}`),
    regenerate: (id: string) =>
      request<{ posterId: string; status: string; retryCount: number }>(`/posters/${id}/regenerate`, {
        method: 'POST',
      }),
    delete: (id: string) =>
      request<void>(`/posters/${id}`, { method: 'DELETE' }),
    download: (id: string, format: 'png' | 'pdf' = 'png') =>
      fetch(`${API_BASE}/posters/${id}/download?format=${format}`, {
        headers: { Authorization: `Bearer ${document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1]}` },
      }).then(res => res.blob()),
  },

  // Upload
  upload: {
    photos: (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      return fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(res => res.json());
    },
  },

  // Admin
  admin: {
    analytics: {
      get: () => request<{
        totalUsers: number;
        totalPosters: number;
        totalTemplates: number;
        successfulGenerations: number;
        totalTokens: number;
        avgLatencyMs: number;
      }>('/admin/analytics'),
    },
    posters: {
      list: (page = 1, limit = 20) => request<PaginatedResponse<Poster>>(`/admin/posters?page=${page}&limit=${limit}`),
      delete: (id: string) => request<void>(`/admin/posters/${id}`, { method: 'DELETE' }),
    }
  },
};

export { OCCASION_LABELS, OCCASION_COLORS };
export type { OccasionType, User, Template, Poster, PosterFormData, PaginatedResponse };

export function getStatusLabel(status: Poster['status']): string {
  const labels: Record<Poster['status'], string> = {
    draft: 'খসড়া',
    generating: 'তৈরি হচ্ছে',
    completed: 'সম্পন্ন',
    failed: 'ব্যর্থ',
  };
  return labels[status] || status;
}

export function getStatusColor(status: Poster['status']): string {
  const colors: Record<Poster['status'], string> = {
    draft: 'badge-gray',
    generating: 'badge-warning',
    completed: 'badge-success',
    failed: 'badge-danger',
  };
  return colors[status] || 'badge-gray';
}
import { api } from './api';

export type NoticeType = 'news' | 'maran_nondh' | 'event' | 'meeting';

export interface Notice {
  feed_id: number;
  feed_uuid: string;
  feed_title: string;
  feed_description: string;
  feed_type: NoticeType;
  feed_photo_video: string | null;
  event_date_time: string | null;
  event_address: string | null;
  event_latitude: number | null;
  event_longitude: number | null;
  added_by: number;
  community_id: number;
  added_on: string;
  updated_on: string;
  // Joined fields
  author_first_name?: string;
  author_surname?: string;
  author_photo?: string;
}

export const noticeBoardApi = {
  // Get all notices
  getAll: async (): Promise<Notice[]> => {
    const { data } = await api.get('/api/news');
    return data.data || [];
  },
  
  // Get by UUID
  getById: async (uuid: string): Promise<Notice> => {
    const { data } = await api.get(`/api/news/${uuid}`);
    return data.data;
  },
  
  // Create (admin only)
  create: async (formData: FormData) => {
    const { data } = await api.post('/api/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  // Update
  update: async (uuid: string, formData: FormData) => {
    const { data } = await api.put(`/api/news/${uuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  // Delete
  delete: async (uuid: string) => {
    const { data } = await api.delete(`/api/news/${uuid}`);
    return data;
  }
};

// Helper to get type styling
export function getNoticeTypeConfig(type: NoticeType) {
  const configs = {
    news: {
      label: 'News',
      color: 'blue',
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: '📰'
    },
    event: {
      label: 'Event',
      color: 'green',
      bgClass: 'bg-green-50 text-green-700 border-green-200',
      icon: '🎉'
    },
    meeting: {
      label: 'Meeting',
      color: 'purple',
      bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: '👥'
    },
    maran_nondh: {
      label: 'Death Notice',
      color: 'gray',
      bgClass: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '🙏'
    }
  };
  return configs[type] || configs.news;
}

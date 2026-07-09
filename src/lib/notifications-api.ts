import { api } from './api';

export type NotificationType = 
  | 'join_request'
  | 'ai_suggestion'
  | 'relationship_approved'
  | 'relationship_rejected'
  | 'new_notice'
  | 'committee_change'
  | 'family_merge'
  | 'other';

export interface Notification {
  notification_id: number;
  notification_uuid: string;
  member_id: number;
  community_id: number;
  notification_type: NotificationType;
  notification_message: string;
  notification_is_read: number;
  created_at: string;
}

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get('/api/notification');
    return data.data || [];
  },
  
  markAsRead: async (uuid: string) => {
    const { data } = await api.put('/api/notification', {
      notification_uuid: uuid,
      is_read: 1
    });
    return data;
  },
  
  markAllAsRead: async () => {
    const { data } = await api.put('/api/notification', {
      mark_all_read: true
    });
    return data;
  }
};

export function getNotificationConfig(type: NotificationType) {
  const configs: Record<string, { icon: string; color: string; bgClass: string; route: string }> = {
    join_request: {
      icon: '👨👩👧',
      color: 'blue',
      bgClass: 'bg-blue-100 text-blue-600',
      route: '/family-requests'
    },
    ai_suggestion: {
      icon: '✨',
      color: 'purple',
      bgClass: 'bg-purple-100 text-purple-600',
      route: '/admin/suggestions'
    },
    relationship_approved: {
      icon: '✅',
      color: 'green',
      bgClass: 'bg-green-100 text-green-600',
      route: '/family-tree'
    },
    relationship_rejected: {
      icon: '❌',
      color: 'red',
      bgClass: 'bg-red-100 text-red-600',
      route: '/family-tree'
    },
    new_notice: {
      icon: '📰',
      color: 'orange',
      bgClass: 'bg-orange-100 text-orange-600',
      route: '/notice-board'
    },
    committee_change: {
      icon: '👔',
      color: 'purple',
      bgClass: 'bg-purple-100 text-purple-600',
      route: '/committee'
    },
    family_merge: {
      icon: '🔗',
      color: 'blue',
      bgClass: 'bg-blue-100 text-blue-600',
      route: '/family-tree'
    },
    other: {
      icon: '🔔',
      color: 'gray',
      bgClass: 'bg-gray-100 text-gray-600',
      route: '/dashboard'
    }
  };
  return configs[type] || configs.other;
}

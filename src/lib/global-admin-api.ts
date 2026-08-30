import { api } from './api';

export interface GlobalCommunityOverview {
  community_id: number;
  community_uuid: string;
  community_name: string;
  community_number: number;
  total_members: number;
}

export interface PendingUserRequest {
  community_member_relation_id: string;
  community_id: number;
  member_id: number;
  is_approved: number;
  added_on: string;
  community_name: string;
  community_number: number;
  community_uuid: string;
  first_name: string;
  surname: string;
  father_name: string;
  phone_number: string;
  village: string;
}

export interface GlobalMember {
  member_id: number;
  first_name: string;
  surname: string;
  father_name: string;
  phone_number: string;
  village: string;
  is_community_admin: number;
  community_id: number;
  is_approved: number;
  is_login_active: number;
  reject_reason: string | null;
  community_name: string;
  community_number: number;
  community_uuid: string;
}

export const globalAdminApi = {
  login: async (data: { phone_number: string; otp?: string }) => {
    const res = await api.post('/api/global-admin/login', data);
    return res.data;
  },

  getOverview: async () => {
    const res = await api.get('/api/global-admin/overview');
    return res.data;
  },

  approveUser: async (data: {
    member_id: number;
    community_id: number;
    action: 'approve' | 'reject';
    reason?: string;
  }) => {
    const res = await api.post('/api/global-admin/approve-user', data);
    return res.data;
  },

  copyUser: async (data: { member_id: number; target_community_id: number }) => {
    const res = await api.post('/api/global-admin/copy-user', data);
    return res.data;
  },

  moveUser: async (data: {
    member_id: number;
    source_community_id: number;
    target_community_id: number;
  }) => {
    const res = await api.post('/api/global-admin/move-user', data);
    return res.data;
  },

  removeUser: async (data: {
    member_id: number;
    community_id: number;
    reason: string;
  }) => {
    const res = await api.post('/api/global-admin/remove-user', data);
    return res.data;
  },

  getSessionStatus: async () => {
    const res = await api.get('/api/global-admin/session-status');
    return res.data;
  },

  acknowledgeSwitch: async (data: { event_id?: string; target_community_uuid: string }) => {
    const res = await api.post('/api/global-admin/acknowledge-switch', data);
    return res.data;
  },
};

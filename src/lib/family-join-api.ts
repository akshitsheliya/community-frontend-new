import { api } from './api';

export interface FamilyMatch {
  family_sr_id: number;
  family_uuid: string;
  number_of_family_members: number;
  head_member_id: number;
  head_member_uuid: string;
  head_first_name: string;
  head_father_name: string;
  head_surname: string;
  head_gender: string;
  head_phone: string;
  head_photo: string | null;
  match_score: number;
  match_reason: string;
}

export interface JoinRequest {
  request_id: number;
  request_uuid: string;
  requester_member_id: number;
  target_family_sr_id: number;
  target_member_id: number | null;
  claimed_relationship: string;
  status: 'pending' | 'approved_by_family' | 'rejected_by_family' | 'cancelled';
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  
  // Requester details
  requester_first_name?: string;
  requester_father_name?: string;
  requester_surname?: string;
  requester_gender?: string;
  requester_phone?: string;
  requester_photo?: string;
  requester_uuid?: string;
  requester_location?: string;
  
  // Target details
  target_first_name?: string;
  target_surname?: string;
  
  // Family head details (for my-requests)
  family_head_first_name?: string;
  family_head_surname?: string;
  family_head_uuid?: string;
  family_uuid?: string;
}

export const joinRequestApi = {
  searchFamilies: async (): Promise<FamilyMatch[]> => {
    const { data } = await api.get('/api/family-join/search');
    return data.data || [];
  },
  
  createRequest: async (params: {
    target_family_uuid: string;
    target_member_uuid?: string;
    claimed_relationship: string;
  }) => {
    const { data } = await api.post('/api/family-join/request', params);
    return data;
  },
  
  getIncoming: async (): Promise<JoinRequest[]> => {
    const { data } = await api.get('/api/family-join/incoming');
    return data.data || [];
  },
  
  getMyRequests: async (): Promise<JoinRequest[]> => {
    const { data } = await api.get('/api/family-join/my-requests');
    return data.data || [];
  },
  
  getCommunityRequests: async (status?: string): Promise<JoinRequest[]> => {
    const query = status ? `?status=${status}` : '';
    const { data } = await api.get(`/api/family-join/community${query}`);
    return data.data || [];
  },
  
  getStats: async () => {
    const { data } = await api.get('/api/family-join/stats');
    return data.data;
  },
  
  approve: async (uuid: string) => {
    const { data } = await api.put(`/api/family-join/request/${uuid}/approve`);
    return data;
  },
  
  reject: async (uuid: string, reviewNote?: string) => {
    const { data } = await api.put(
      `/api/family-join/request/${uuid}/reject`,
      { review_note: reviewNote }
    );
    return data;
  },
  
  cancel: async (uuid: string) => {
    const { data } = await api.put(`/api/family-join/request/${uuid}/cancel`);
    return data;
  }
};

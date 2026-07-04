import { api } from './api';

export interface MatchSuggestion {
  suggestion_id: number;
  suggestion_uuid: string;
  member_id_a: number;
  member_id_b: number;
  suggestion_type: string;
  suggested_label: string;
  match_score: number;
  match_reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'ignored';
  created_at: string;
  
  // Member A details
  member_a_first_name: string;
  member_a_surname: string;
  member_a_father_name: string;
  member_a_gender: string;
  member_a_photo: string | null;
  member_a_uuid: string;
  
  // Member B details
  member_b_first_name: string;
  member_b_surname: string;
  member_b_father_name: string;
  member_b_gender: string;
  member_b_photo: string | null;
  member_b_uuid: string;
}

export interface MatcherStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  high_confidence: number;
}

export const matcherApi = {
  // Get suggestions
  getSuggestions: async (params?: {
    status?: string;
    confidence?: 'high' | 'medium';
  }): Promise<MatchSuggestion[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.confidence) query.append('confidence', params.confidence);
    
    const { data } = await api.get(`/api/family-matcher/suggestions?${query}`);
    return data.data || [];
  },
  
  // Get stats
  getStats: async (): Promise<MatcherStats> => {
    const { data } = await api.get('/api/family-matcher/stats');
    return data.data;
  },
  
  // Trigger scan
  triggerScan: async () => {
    const { data } = await api.post('/api/family-matcher/scan');
    return data;
  },
  
  // Approve suggestion
  approveSuggestion: async (uuid: string) => {
    const { data } = await api.put(`/api/family-matcher/suggestion/${uuid}/approve`);
    return data;
  },
  
  // Reject suggestion
  rejectSuggestion: async (uuid: string) => {
    const { data } = await api.put(`/api/family-matcher/suggestion/${uuid}/reject`);
    return data;
  }
};

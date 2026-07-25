import { api } from './api';

export interface Marksheet {
  id: number;
  marksheet_uuid: string;
  user_id: number;
  student_name: string;
  standard: string;
  medium: string;
  stream: string | null;
  percentage: string;
  marksheet_year: string;
  father_full_name: string;
  father_phone_number: string;
  marksheet_photo: string | null;
  community_id: number;
  is_approved: number;
  rejection_reason: string | null;
  student_rank: number;
  added_on: string;
}

export const marksheetsApi = {
  getMine: async (): Promise<Marksheet[]> => {
    const { data } = await api.get('/api/marksheets');
    return data.data || [];
  },
  
  getAllAdmin: async (): Promise<Marksheet[]> => {
    const { data } = await api.get('/api/all-marksheets');
    return data.data || [];
  },
  
  upload: async (formData: FormData) => {
    const { data } = await api.post('/api/marksheets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  approve: async (id: number) => {
    const { data } = await api.put(`/api/marksheets/approve/${id}`);
    return data;
  },
  
  reject: async (uuid: string, reason: string) => {
    const { data } = await api.put(`/api/marksheets/reject/${uuid}`, { 
      rejection_reason: reason 
    });
    return data;
  },
  
  delete: async (id: number) => {
    const { data } = await api.delete(`/api/marksheets/${id}`);
    return data;
  },
  
  getAwardEligible: async () => {
    const { data } = await api.get('/api/award-eligible');
    return data.data || [];
  }
};

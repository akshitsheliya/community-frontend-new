import { api } from './api';

export interface AbroadMember {
  id: number;
  abroad_uuid: string;
  member_id: number | null;
  full_name: string;
  passport_photo: string | null;
  govt_private: string | null;
  designation: string | null;
  career: string | null;
  experience_year: number | null;
  success_mantra: string | null;
  contact_number: string | null;
  country: string | null;
  city: string | null;
  thoughts_on_committee: string | null;
  added_by: number;
  community_id: number;
  created_at: string;
}

export const abroadApi = {
  getAll: async (): Promise<AbroadMember[]> => {
    const { data } = await api.get('/api/abroad');
    return data.data || [];
  },
  
  create: async (formData: FormData) => {
    const { data } = await api.post('/api/abroad', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  update: async (uuid: string, formData: FormData) => {
    const { data } = await api.put(`/api/abroad/${uuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  delete: async (uuid: string) => {
    const { data } = await api.delete(`/api/abroad/${uuid}`);
    return data;
  }
};

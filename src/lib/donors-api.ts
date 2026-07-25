import { api } from './api';

export interface Donor {
  donor_id: string;
  member_id: number | null;
  donor_name: string;
  donor_mobile_no: string | null;
  is_lifetime_donor: number;
  donation_category: string | null;
  donation_year: string | null;
  donor_photo: string | null;
  donor_type: string | null;
  added_by: number;
  community_id: number;
  added_on: string;
}

export const donorsApi = {
  getAll: async (): Promise<Donor[]> => {
    const { data } = await api.get('/api/donors');
    return data.data || [];
  },
  
  create: async (formData: FormData) => {
    const { data } = await api.post('/api/donors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  createFromMember: async (memberUuid: string, formData: FormData) => {
    const { data } = await api.post(`/api/donors/${memberUuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  update: async (donorId: string, formData: FormData) => {
    const { data } = await api.put(`/api/donors/${donorId}`, formData);
    return data;
  },
  
  delete: async (donorId: string) => {
    const { data } = await api.delete(`/api/donors/${donorId}`);
    return data;
  }
};

export const DONATION_CATEGORIES = [
  'Community Development',
  'Education Fund',
  'Temple Renovation',
  'Health & Medical',
  'Disaster Relief',
  'Cultural Events',
  'Youth Development',
  'Elderly Care',
  'Other'
];

import { api } from './api';

export interface UnverifiedUser {
  member_id: number;
  member_uuid: string;
  first_name: string;
  father_name: string | null;
  surname: string;
  phone_number: string;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  current_resident: string | null;
  education: string | null;
  business_or_job_or_any: string | null;
  profile_photo: string | null;
  added_on: string;
  family_number?: number;
}

export const userVerificationApi = {
  getUnverified: async (): Promise<UnverifiedUser[]> => {
    const { data } = await api.get('/api/unverified');
    return data.data || [];
  },

  approve: async (memberUuid: string) => {
    const { data } = await api.put(`/api/approve/${memberUuid}`);
    return data;
  },

  reject: async (memberUuid: string, rejectReason: string) => {
    const { data } = await api.put(`/api/reject/${memberUuid}`, {
      reject_reason: rejectReason
    });
    return data;
  }
};

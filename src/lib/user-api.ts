import { api } from './api';

export interface UserProfile {
  member_id: number;
  member_uuid: string;
  first_name: string;
  father_name: string | null;
  surname: string;
  gender: string | null;
  date_of_birth: string | null;
  phone_number: string;
  email_id: string | null;
  blood_group: string | null;
  marital_status: string | null;
  address: string | null;
  current_resident: string | null;
  business_or_job_or_any: string | null;
  business_details: string | null;
  business_category_id: number | null;
  profession_sector: string | null;
  education: string | null;
  profile_photo: string | null;
  id_proof: string | null;
  is_committee_member: number;
  is_community_admin: number;
  is_family_representative: number;
  designation: string | null;
  family_sr_id: number | null;
  added_on: string;
}

export const userApi = {
  // Get logged in user
  getMe: async (): Promise<UserProfile> => {
    const { data } = await api.get('/api/user');
    return data.data;
  },
  
  // Update profile
  updateProfile: async (memberUuid: string, formData: FormData) => {
    const { data } = await api.put(`/api/user/${memberUuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  // Request account deletion
  requestDeleteAccount: async (reason: string) => {
    const { data } = await api.post('/api/delete-account', {
      reason_for_delete_account: reason
    });
    return data;
  }
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed'];
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
export const OCCUPATION_TYPES = ['Business', 'Job', 'Student', 'Retired', 'Homemaker', 'Other'];

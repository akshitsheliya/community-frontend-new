import { api } from './api';
import type { Member, Family, ApiResponse } from '@/types/api';

export const membersApi = {
  // Get all families with members
  getAllFamilies: async () => {
    const { data } = await api.get<ApiResponse<Family[]>>('/api/families');
    return data.data;
  },
  
  // Get family representatives (heads)
  getRepresentatives: async () => {
    const { data } = await api.get<ApiResponse<Member[]>>('/api/representatives');
    return data.data;
  },
  
  // Get members of specific family
  getFamilyMembers: async (familyUuid: string) => {
    const { data } = await api.get<ApiResponse<Member[]>>(`/api/members-list/${familyUuid}`);
    return data.data;
  },
  
  // Get flat list of all members
  getAllMembers: async () => {
    const { data } = await api.get<ApiResponse<Member[]>>('/api/members');
    return data.data;
  },
  
  // Delete member (admin only)
  deleteMember: async (memberUuid: string) => {
    const { data } = await api.delete<ApiResponse<any>>(`/api/member/${memberUuid}`);
    return data;
  }
};

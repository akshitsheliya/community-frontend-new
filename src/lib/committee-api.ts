import { api } from './api';

export interface CommitteeMember {
  member_id: number;
  member_uuid: string;
  first_name: string;
  father_name?: string;
  surname: string;
  phone_number: string;
  email_id?: string;
  gender?: string;
  profile_photo: string | null;
  designation: string;
  is_committee_member: number;
  added_on?: string;
}

export const COMMITTEE_ROLES = [
  { value: 'President', label: 'President', icon: '👑', priority: 1 },
  { value: 'Vice President', label: 'Vice President', icon: '⭐', priority: 2 },
  { value: 'Secretary', label: 'Secretary', icon: '📋', priority: 3 },
  { value: 'Joint Secretary', label: 'Joint Secretary', icon: '📝', priority: 4 },
  { value: 'Treasurer', label: 'Treasurer', icon: '💰', priority: 5 },
  { value: 'Joint Treasurer', label: 'Joint Treasurer', icon: '💵', priority: 6 },
  { value: 'Member', label: 'Committee Member', icon: '👤', priority: 7 },
  { value: 'Advisor', label: 'Advisor', icon: '🎓', priority: 8 },
  { value: 'Trustee', label: 'Trustee', icon: '🏛️', priority: 9 },
];

export const committeeApi = {
  getAll: async (): Promise<CommitteeMember[]> => {
    const { data } = await api.get('/api/committee');
    return data.data || [];
  },
  addToCommittee: async (memberUuid: string, designation: string) => {
    const { data } = await api.put(`/api/committee/${memberUuid}`, { designation });
    return data;
  },
  updateRole: async (memberUuid: string, designation: string) => {
    const { data } = await api.put(`/api/edit-committee/${memberUuid}`, { designation });
    return data;
  },
  remove: async (memberUuid: string) => {
    const { data } = await api.delete(`/api/committee/${memberUuid}`);
    return data;
  }
};

export function getRolePriority(designation: string): number {
  const role = COMMITTEE_ROLES.find(
    r => r.value.toLowerCase() === designation?.toLowerCase()
  );
  return role?.priority || 99;
}

export function getRoleIcon(designation: string): string {
  const role = COMMITTEE_ROLES.find(
    r => r.value.toLowerCase() === designation?.toLowerCase()
  );
  return role?.icon || '👤';
}
